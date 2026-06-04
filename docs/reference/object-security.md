---
title: "Object Security"
description: "Access control model for GemStone/S 64 Bit, covering authorization levels, user accounts, groups, and object-level permissions."
product: "GemStone/S 64 Bit"
version: "3.7.x"
doc_type: "reference"
content_category: "security"
audience: ["developer", "administrator"]
platform: ["all"]
keywords: ["GemStone security", "object authorization", "user accounts", "groups", "access control", "GemStone permissions", "RBAC"]
source_docs:
  - title: "GemStone/S 64 Bit System Administration Guide 3.7"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-SysAdminGuide-3.7.pdf"
  - title: "GemStone/S 64 Bit Programming Guide 3.7"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-ProgGuide-3.7.pdf"
last_verified: "2026-06-04"
---

# Object Security and Authorization

GemStone/S enforces security at three distinct levels: login authentication, system privileges, and object-level authorization. This article covers all three, with a focus on object-level security — the mechanism that controls which users can read or write specific objects in the repository.

---

## Security levels overview

| Level | What it controls |
|---|---|
| Login authentication | Whether a user can connect to the repository at all |
| System privileges | Whether a user can execute administrative operations (storage reclamation, account management, code modification) |
| Object-level security | Whether a user can read or write specific objects in the repository |

Authorization checking happens at the lowest level of object access and cannot be bypassed — not even by traversing object references in code.

---

## Login authentication and UserProfiles

Every GemStone user account is represented by a `UserProfile` object stored in the `AllUsers` collection. The system administrator creates `UserProfile` instances using the DataCurator account or an account with equivalent privileges.

A `UserProfile` contains:

- **UserID and password** — credentials for login authentication
- **SymbolList** — the symbol dictionaries available to this user's sessions for name resolution (`UserGlobals`, `Globals`, `Published`)
- **Groups** — the named groups this user belongs to
- **System privileges** — special permissions beyond normal user operations
- **Default GsObjectSecurityPolicy** — the security policy automatically applied to objects this user creates

To check who owns a session's default security policy:

```smalltalk
| myDefaultPolicy |
myDefaultPolicy := System myUserProfile defaultObjectSecurityPolicy.
myDefaultPolicy notNil ifTrue: [myDefaultPolicy owner userId]
```

---

## Object-level security: GsObjectSecurityPolicy

Every persistent object in GemStone carries a 16-bit security policy ID in its header. That ID references a `GsObjectSecurityPolicy` instance, which stores the authorization rules for all objects assigned to it.

**Key characteristics:**

- All objects assigned to the same security policy have exactly the same access rules. If you can read one, you can read them all.
- Each policy is owned by a single user.
- An object with no security policy (ID zero) has unrestricted world read and write access.
- Security policies do not "contain" objects — they are associated with them. The policy stores no list of which objects reference it.

### Authorization levels

Three authorization levels apply to each of three audience types:

| Level | Meaning |
|---|---|
| `#write` | User can read and modify objects, and create new objects in the policy |
| `#read` | User can read objects but cannot modify them |
| `#none` | User has no access to objects in the policy |

### Audience types: owner, group, world

Each security policy stores authorization separately for three audiences:

**Owner** — The user who created the policy. Typically has write access, but this is not required.

**Groups** — Named collections of users sharing the same access requirements. A user's group memberships are stored in their `UserProfile`. Groups are defined in the `AllGroups` collection.

**World** — All authenticated GemStone users.

When a user's membership spans multiple audiences (they are the owner, a group member, *and* part of the world), GemStone applies the **most permissive** authorization. If world authorization is `#read` but the user belongs to a group with `#write`, the user gets write access.

### Authorization messages

```smalltalk
" Read authorization for a policy "
aPolicy ownerAuthorization.                         " returns #read, #write, or #none "
aPolicy worldAuthorization.
aPolicy authorizationForGroup: 'Payroll'.

" Set authorization "
aPolicy ownerAuthorization: #write.
aPolicy worldAuthorization: #none.
aPolicy group: 'Payroll' authorization: #write.
aPolicy group: 'Personnel' authorization: #read.
```

---

## Predefined security policies

The initial GemStone repository includes eight built-in `GsObjectSecurityPolicy` instances. The two most important for administrators are:

**SystemObjectSecurityPolicy** — Owned by `SystemUser`. World has read access; the `#System` group has write access. Contains GemStone kernel objects.

:::danger
Never attempt to change the authorization of `SystemObjectSecurityPolicy`. Doing so can make the repository unusable.
:::

**DataCuratorObjectSecurityPolicy** — Owned by `DataCurator`. World has read access; the `DataCuratorGroup` has write access. Contains the `Globals` dictionary, `SystemRepository`, all `GsObjectSecurityPolicy` objects, `AllUsers`, `AllGroups`, and all `UserProfile` objects.

Only the DataCurator should write to this policy. Granting other users write access to `DataCuratorObjectSecurityPolicy` is a significant security risk.

---

## Assigning objects to security policies

### Default policy assignment

When a user creates a new object, it is automatically assigned to that session's *current security policy*. At login, the current security policy is set from the user's `UserProfile` default. A user with no default security policy creates objects with world read and write access (policy ID zero).

```smalltalk
" Check the current security policy for this session "
System currentObjectSecurityPolicy.

" Change the current security policy "
System currentObjectSecurityPolicy: aPolicy.

" Check which policy an object is assigned to "
anObject objectSecurityPolicy.

" Reassign an object to a different policy "
anObject objectSecurityPolicy: aNewPolicy.
```

:::note
Only committed instances of `GsObjectSecurityPolicy` can be used as a current security policy. Create the policy, commit, then assign it.
:::

### Compound objects

Security policy assignment is per-object, not per-graph. For a compound object like an `Employee` instance with instance variables for `name`, `salary`, and `department`, each component is a separate object that can be independently assigned to different policies.

This allows fine-grained access control. In a typical HR application, `name` and `department` might be in a policy with world-read access, while `salary` is in a policy readable only by the Payroll group.

To reassign a compound object and all its components at once, implement `objectSecurityPolicy:` for your class to call `assignToObjectSecurityPolicy:` on each component:

```smalltalk
method: Employee
objectSecurityPolicy: aPolicy
    "Assign this employee and all component objects to aPolicy."
    self assignToObjectSecurityPolicy: aPolicy.
    self name assignToObjectSecurityPolicy: aPolicy.
    self salary assignToObjectSecurityPolicy: aPolicy.
    self department assignToObjectSecurityPolicy: aPolicy.
```

### Collections

When assigning collections to security policies, distinguish between the container and its contents. The collection object and each element are separate objects with separate policy assignments. Assigning the collection to a policy does not automatically reassign its elements.

---

## Planning security policies for an application

The right number of security policies is determined by the unique combinations of owner, group, and world authorizations your application requires. Start with an access matrix: list all sensitive object types across the top and all user roles down the side, then mark each cell W (write), R (read), or N (none).

**Example: HR application access matrix**

| Object | Sys Admin | HR | Payroll | Sales | All others |
|---|---|---|---|---|---|
| Employee (name, dept) | W | W | R | R | R |
| dateHired | W | W | R | R | N |
| salary | W | R | W | N | N |
| salesQuota | W | R | R | W | N |
| vacationDays | W | W | N | N | N |

Reading this matrix:
- Objects with no `N` in any cell can have world read authorization — no group policy needed for reading.
- Objects with `N` in any cell require world `#none`. Access for those users must come through group membership.
- Roles that share identical access patterns across all rows can share a single group.

In this example, HR and Payroll have different access requirements and each needs its own group. The matrix produces three security policies — not seven, despite having seven user roles — because many roles share identical authorization combinations.

### Groups reflect access patterns, not org charts

A common mistake is creating a group per department. Groups should reflect unique combinations of access requirements. If Marketing and Customer Support have identical access to every object in the application, they share one group. Creating two groups provides no security benefit and doubles the administrative overhead.

---

## System privileges

Privileges control access to operations that affect the whole system, independent of security policy authorization. The DataCurator can grant privileges to other `UserProfile` accounts.

Key privileges for application administrators:

| Privilege string | Grants access to |
|---|---|
| `'ObjectSecurityPolicyCreation'` | `GsObjectSecurityPolicy new` — creating new policies |
| `'ObjectSecurityPolicyProtection'` | Changing authorization on policies you don't own |
| `'DefaultObjectSecurityPolicy'` | Setting default security policies on `UserProfile` objects |
| `'CodeModification'` | Compiling methods and classes, required for all developers |

```smalltalk
" Grant a privilege "
System myUserProfile addPrivilege: 'ObjectSecurityPolicyCreation'.

" Revoke a privilege "
System myUserProfile deletePrivilege: 'ObjectSecurityPolicyCreation'.

" Grant multiple privileges at once "
System myUserProfile privileges: #('ObjectSecurityPolicyCreation' 'UserPassword').
```

:::caution
Privileges are more powerful than security policy authorization. A user with `ObjectSecurityPolicyProtection` privilege can change authorization on any policy, overriding its owner. Grant privileges conservatively.
:::

:::caution
Do not remove your own write authorization for your default security policy or current security policy. Losing write authorization to your default policy prevents you from logging in again. Contact the DataCurator or system administrator to recover.
:::

---

## Deploying security policies in production

When moving an application from development to production, apply security changes in this order to avoid locking yourself out of objects you still need to configure:

1. Create the required `GsObjectSecurityPolicy` instances and commit.
2. Create the necessary user groups in `AllGroups` if they don't exist.
3. Set owner, world, and group authorizations on each policy.
4. Assign user accounts to the appropriate groups via their `UserProfile` objects.
5. Assign application objects to the correct security policies.
6. Add references to the application's symbol dictionary to the appropriate users' symbol lists.

---

## What to read next

- For multi-user data integrity, see [Transactions and Concurrency](../core-concepts/transactions).
- For full UserProfile and privilege management procedures, refer to the *GemStone/S 64 Bit System Administration Guide* from GemTalk Systems.
