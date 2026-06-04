---
title: "Object Security"
description: "Access control model for GemStone/S 64 Bit, covering authorization levels, user accounts, groups, object-level permissions, and production deployment guidance."
product: "GemStone/S 64 Bit"
version: "3.7.x"
doc_type: "reference"
content_category: "security"
audience: ["developer", "administrator"]
platform: ["all"]
keywords: ["GemStone security", "object authorization", "user accounts", "groups", "access control", "GemStone permissions", "GsObjectSecurityPolicy", "object filtering"]
source_docs:
  - title: "GemStone/S 64 Bit Programmer's Guide 3.7, Chapter 10: Object Security and Authorization"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-ProgGuide-3.7/10-ObjSecurityPolicy.htm"
  - title: "GemStone/S 64 Bit X509-Secured GemStone System Administration Guide 3.5"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.5.x/GS64-X509GemStone-3.5/GS64-X509GemStone-3.5.htm"
last_verified: "2026-06-04"
---

# Object Security and Authorization

GemStone/S enforces security at four levels: login authentication, system privileges, object-level authorization, and (with X.509 logins) object filtering. This article covers the first three in depth and introduces object filtering. The focus is object-level security, the mechanism that controls which users can read or write specific objects in the repository.

---

## Security levels overview

| Level | What it controls |
|---|---|
| Login authentication | Whether a user can connect to the repository at all |
| System privileges | Whether a user can execute operations that affect the whole system (storage reclamation, account management, code modification) |
| Object-level security | Whether a user can read or write specific objects in the repository |
| Object filtering | Whether GemStone transmits specific objects to a remote cache (X.509 logins only) |

Authorization checking happens at the moment of object access and cannot be bypassed.

---

## Login authentication and UserProfiles

Every GemStone user account maps to a `UserProfile` object stored in the `AllUsers` collection. The system administrator creates `UserProfile` instances using the DataCurator account or an account with equivalent privileges.

A `UserProfile` contains:

- **UserID and password** — credentials for login authentication
- **SymbolList** — the symbol dictionaries available to this user's sessions for name resolution (`UserGlobals`, `Globals`, `Published`)
- **Groups** — the named groups this user belongs to
- **System privileges** — special permissions beyond normal user operations
- **Default GsObjectSecurityPolicy** — the security policy GemStone assigns to this user's session at login, or nil

To check who owns a session's default security policy:

```smalltalk
| myDefaultPolicy |
myDefaultPolicy := System myUserProfile defaultObjectSecurityPolicy.
myDefaultPolicy ifNotNil: [myDefaultPolicy owner userId]
```

The system administrator can also configure GemStone to log repeated failed login attempts and to disable a user account after a specified number of failed attempts. See the *System Administration Guide* for details.

---

## Object-level security: GsObjectSecurityPolicy

Every persistent object in GemStone carries a 16-bit security policy ID in its object header. That ID references a `GsObjectSecurityPolicy` instance, which stores the authorization rules for all objects assigned to it.

**Key characteristics:**

- All objects assigned to the same security policy have exactly the same access rules. If you can read one, you can read them all.
- Each policy is owned by a single user. By default, this is the user who created it.
- An object with no security policy (ID zero) has unrestricted world read and write access. Any logged-in user can read and write it.
- Security policies do not contain objects; instead they are associated with them. The policy stores no list of which objects reference it. To find objects by policy, see [Finding objects protected by a policy](#finding-objects-protected-by-a-policy).

### Authorization levels

Three authorization levels apply to each audience type:

| Level | Meaning |
|---|---|
| `#write` | User can read and modify objects, and create new objects associated with the policy |
| `#read` | User can read objects but cannot modify them |
| `#none` | User has no access to objects assigned to the policy |

### Audience types: owner, group, world

Each security policy stores authorization separately for three audiences:

**Owner** — The user who created the policy. Typically has write access, but this is not required. Users can own more than one security policy.

**Groups** — Named collections of users sharing common access requirements. Each user's group memberships live in their `UserProfile`. All groups are defined in the `AllGroups` collection as instances of `UserProfileGroup`.

**World** — All authenticated GemStone users.

When a user's membership spans multiple audiences (they are the owner, a group member, and part of the world), GemStone applies the **most permissive** authorization. If world authorization is `#read` but the user belongs to a group with `#write`, the user gets write access.

### Authorization messages

```smalltalk
"Read authorization for a policy"
aPolicy ownerAuthorization.                         "returns #read, #write, or #none"
aPolicy worldAuthorization.
aPolicy authorizationForGroup: 'Payroll'.

"Find all groups with a specific authorization level"
aPolicy groupsWithAuthorization: #write.            "returns a collection of group name strings"

"Set authorization"
aPolicy ownerAuthorization: #write.
aPolicy worldAuthorization: #none.
aPolicy group: 'Payroll' authorization: #write.
aPolicy group: 'Personnel' authorization: #read.
```

---

## Unauthorized access behavior

GemStone immediately detects an unauthorized read or write attempt, stops the current method, and returns an error.

At commit time, GemStone also verifies that you still have write authorization in your current security policy. If another user revoked that authorization since you last committed:

- GemStone issues an error and resets your current security policy to your `UserProfile` default.
- If you have also lost write authorization to your default security policy, GemStone terminates your session.
- A terminated session cannot log back in. Contact your system administrator or the DataCurator to recover.

:::caution
Do not remove your own write authorization for your default security policy or your current security policy. Losing write access to your default policy prevents you from logging in again.
:::

---

## Predefined security policies

The initial GemStone 3.7 repository includes eleven built-in `GsObjectSecurityPolicy` instances:

**SystemObjectSecurityPolicy** — Owned by `SystemUser`. World has read access; the `#System` group has write access. Contains GemStone kernel objects, including special objects (SmallInteger, SmallDouble, Character, Boolean, and nil). GemStone permanently assigns special objects to this policy. You cannot reassign them.

:::danger
Never attempt to change the authorization of `SystemObjectSecurityPolicy`. Doing so can make the repository unusable.
:::

**DataCuratorObjectSecurityPolicy** — Owned by `DataCurator`. World has read access; the `DataCuratorGroup` has write access. Contains the `Globals` dictionary, `SystemRepository`, all `GsObjectSecurityPolicy` objects, `AllUsers`, `AllGroups`, and all `UserProfile` objects. Only the DataCurator should write to this policy.

**GsTimeZoneObjectSecurityPolicy** — Not used in new repositories. Used in repositories converted from earlier GemStone/S products.

**GsIndexingObjectSecurityPolicy** — Used by the indexing subsystem.

**SecurityDataObjectSecurityPolicy** — Used for `UserProfile` passwords and other highly protected information.

**PublishedObjectSecurityPolicy** — Used for objects in the `Published` symbol dictionary.

**GcUserObjectSecurityPolicy** — The policy for the `GcUser` user.

**NamelessObjectSecurityPolicy** — The policy for the Nameless user.

**CodeLibrarianUserObjectSecurityPolicy** — The policy for the CodeLibrarianUser.

**HostAgentUserObjectSecurityPolicy** — The policy for the HostAgentUser.

**ObjectFiltersObjectSecurityPolicy** — Contains `ObjectFilter` instances used for additional object protection with X.509 logins.

---

## Assigning objects to security policies

### Default policy and current policy

At login, GemStone sets your current security policy from your `UserProfile` default. Any object you create is automatically assigned to your current policy. A user with no current security policy creates objects with policy ID zero (world read and write access).

```smalltalk
"Check the current security policy for this session"
System currentObjectSecurityPolicy.

"Change the current security policy"
System currentObjectSecurityPolicy: aPolicy.

"Compare default and current"
System myUserProfile defaultObjectSecurityPolicy = System currentObjectSecurityPolicy.
```

:::note
Only committed instances of `GsObjectSecurityPolicy` can be used as a current security policy. Create the policy, commit, then assign it.
:::

If you abort after changing your current security policy, the current policy resets to your `UserProfile` default. Named policies are typically stored in symbol dictionaries. Private policies live in UserGlobals; shared policies go in a shared dictionary.

### Inspecting and reassigning individual objects

```smalltalk
"Check which policy an object is assigned to (returns nil if none)"
anObject objectSecurityPolicy.

"Reassign an object to a different policy"
anObject objectSecurityPolicy: aNewPolicy.
```

You must have write authorization for both the object's current policy and the new policy to reassign it. You can also reassign an object to nil, which removes its security policy and restores world read and write access.

### Compound objects

Security policy assignment is per-object, not per-graph. An `Employee` instance and its instance variables (`name`, `salary`, `department`) are each separate objects that can be independently assigned to different policies.

This enables fine-grained access control. In a typical HR application, `name` and `department` might be in a policy with world-read access, while `salary` is in a policy readable only by the Payroll group.

To reassign a compound object and all its components, implement `objectSecurityPolicy:` for your class and call `assignToObjectSecurityPolicy:` on each component:

```smalltalk
method: Employee
objectSecurityPolicy: aPolicy
    "Assign this employee and all component objects to aPolicy."
    self assignToObjectSecurityPolicy: aPolicy.
    self name assignToObjectSecurityPolicy: aPolicy.
    self salary assignToObjectSecurityPolicy: aPolicy.
    self department assignToObjectSecurityPolicy: aPolicy.
```

For application-level automation, use `GsObjectSecurityPolicy>>setCurrentWhile:` to ensure that objects created by end users land in the correct policy without requiring users to manage policies manually:

```smalltalk
aPolicy setCurrentWhile: [
    "Objects created inside this block are assigned to aPolicy"
    Employee new
        name: 'Rivera, Maria';
        salary: 85000;
        yourself
].
```

### Collections

Security policy assignment applies to the collection object and each element separately. Assigning a collection to a policy does not automatically reassign its elements. Distinguish the container from its contents and assign each explicitly.

---

## Policy ownership

Each `GsObjectSecurityPolicy` has an owner. To find the owner:

```smalltalk
aPolicy owner.           "returns the owner's UserProfile"
aPolicy owner userId.    "returns the owner's UserID string"
```

To transfer ownership, send `owner:` with a `UserProfile` argument. Ownership transfer requires write authorization to `DataCuratorObjectSecurityPolicy`:

```smalltalk
System myUserProfile defaultObjectSecurityPolicy owner: aUserProfile.
```

---

## Finding objects protected by a policy

To find all objects assigned to one or more security policies, use:

```smalltalk
SystemRepository listObjectsInObjectSecurityPolicies: anArray.
```

This takes an array of security policy IDs and returns an array of arrays. Each inner array contains the objects whose policy ID matches the corresponding element in the argument. GemStone omits objects you lack read authorization for, without notification. This method aborts the current transaction and scans every object header in the repository.

For large result sets, use the bitmap file approach to avoid memory pressure:

```smalltalk
SystemRepository
    listObjectsInObjectSecurityPolicies: anArray
    toDirectory: '/path/to/output/'.
```

This writes binary bitmap files (`.bm` extension) to the specified directory, one per policy ID. Results can be loaded into hidden sets for enumeration without holding the full set in memory.

---

## Planning security policies for an application

### Start with an access matrix

Your application's unique combinations of owner, group, and world authorizations determine how many security policies you need. Start with an access matrix: list all sensitive object types across the top and all user roles down the side, then mark each cell W (write), R (read), or N (none).

**Example: HR application access matrix**

| Object | Sys Admin | HR | Emp Records | Payroll | Mktg | Sales | Cust Support |
|---|---|---|---|---|---|---|---|
| anEmployee, name | W | W | W | R | R | R | R |
| position, dept, manager | W | W | W | R | | R | |
| dateHired | W | W | W | R | N | R | N |
| salary | W | R | R | W | N | N | N |
| salesQuarter / salesYear | W | R | R | R | N | W | N |
| vacationDays / sickDays | W | W | W | N | N | N | N |

Reading this matrix:

- Objects with no `N` in any cell can have world read authorization; therefore, you do not need a group policy for reading.
- Objects with `N` in any cell require world `#none`. Access for those roles must come through group membership.
- Roles with identical access patterns across all rows can share a single group.

In this example, HR and Employee Records have identical requirements across every row, so they share one group (Personnel). Payroll and Sales have unique requirements, so each gets its own group. Seven departments, three groups.

### Groups reflect access patterns, not org charts

A common mistake is creating a group per department. Groups should reflect unique combinations of access requirements. If Marketing and Customer Support have identical access to every object in the application, they share one group. Creating two groups provides no security benefit and doubles administrative overhead.

### Determine the number of security policies needed

Count the unique combinations of owner, group, and world authorizations. In the example above, the matrix produces six security policies because six distinct authorization combinations appear across the object rows.

---

## System privileges

Privileges control access to operations that affect the whole system, independent of security policy authorization. The DataCurator can grant privileges to other `UserProfile` accounts.

Key privileges for application developers and administrators:

| Privilege string | Grants access to |
|---|---|
| `'ObjectSecurityPolicyCreation'` | `GsObjectSecurityPolicy new` — creating new policies |
| `'ObjectSecurityPolicyProtection'` | Changing authorization on policies you do not own |
| `'DefaultObjectSecurityPolicy'` | Setting default security policies on `UserProfile` objects |
| `'CodeModification'` | Compiling methods and classes; required for all developers |

```smalltalk
"Grant a privilege"
System myUserProfile addPrivilege: 'ObjectSecurityPolicyCreation'.

"Revoke a privilege"
System myUserProfile deletePrivilege: 'ObjectSecurityPolicyCreation'.

"Grant multiple privileges at once"
System myUserProfile privileges: #('ObjectSecurityPolicyCreation' 'UserPassword').
```

:::caution
Privileges are more powerful than security policy authorization. A user with `ObjectSecurityPolicyProtection` privilege can change authorization on any policy, overriding its owner. The DataCurator can override any security policy authorization using privileged messages. Grant privileges conservatively.
:::

Because `DataCuratorObjectSecurityPolicy` protects `UserProfile` privilege information, you must have write authorization to that policy (or be a member of `DataCuratorGroup`) to modify privileges.

---

## Deploying security policies in production

Apply security changes in this order to avoid locking yourself out of objects you still need to configure:

1. Create the required `GsObjectSecurityPolicy` instances and commit.
2. Create the necessary user groups in `AllGroups` if they do not exist.
3. Set owner, world, and group authorizations on each policy.
4. Assign any end users that need group authorization to the appropriate groups via their `UserProfile` objects.
5. Assign the application's objects to the security policies you created.
6. Add references to the application's symbol dictionary to the appropriate users' symbol lists.

:::note
The recommended approach for user-created objects is to use `GsObjectSecurityPolicy>>setCurrentWhile:` in your application code so that objects land in the correct policy automatically, without relying on users to manage security policy assignments themselves.
:::

---

## Object filtering (X.509 logins)

GemStone supports a fourth level of security available with X.509-authenticated logins: object filtering. Object filters control whether GemStone transmits individual objects to a remote client cache, providing additional protection for Gems running on insecure remote nodes.

Object filters are stored in `ObjectFiltersObjectSecurityPolicy`. The *GemStone/S 64 Bit X509-Secured GemStone System Administration Guide* covers object filtering configuration and administration.

---

## What to read next

- For full `UserProfile` creation and privilege management procedures, refer to the *GemStone/S 64 Bit System Administration Guide* from GemTalk Systems.
- For X.509 login configuration and object filtering, refer to the *GemStone/S 64 Bit X509-Secured GemStone System Administration Guide*.
