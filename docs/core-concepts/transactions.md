---
id: transactions
title: Transactions and Concurrency
sidebar_label: Transactions and Concurrency
sidebar_position: 1
description: How GemStone/S manages multi-user data integrity through transactions, conflict detection, locks, and reduced-conflict classes.
---

# Transactions and Concurrency

Understanding GemStone's transaction model is the most important concept for both administrators and application developers. Nearly every support issue — repository growth, commit failures, session conflicts — traces back to transaction behavior.

---

## How views and sessions work

Every session gets its own consistent *view* of the repository at login. That view is a snapshot: objects that existed when the session started remain visible to that session, even if other users have since modified or deleted them. This is by design — it gives each session a stable working environment.

The operational implication: the storage occupied by those objects cannot be reclaimed by garbage collection until the session commits or aborts its transaction. A long-running session with a stale view holds the repository's history open and can cause repository growth. Keep sessions committing or aborting regularly.

When a session commits, two things happen simultaneously:
1. The session's changes become visible to all other users as permanent repository state.
2. The session receives a fresh view that includes all changes committed by other users since the session's last commit.

---

## Transaction modes

GemStone sessions operate in one of three modes. The mode determines whether the session is automatically placed in a transaction after login and after each commit or abort.

### Automatic (default)

The session is always in a transaction. A new transaction starts automatically after each commit or abort. This is the simplest mode for applications that always need to write.

```smalltalk
System transactionMode: #autoBegin
```

:::caution
In busy production systems, sessions in automatic mode do not receive `TransactionBacklog` notifications that signal resource strain. Use manual mode for long-running or read-heavy sessions.
:::

### Manual

The session can exist outside a transaction. You explicitly start and end transactions. This is the right choice for sessions that spend most of their time reading, or for administrative sessions that need fine-grained control.

```smalltalk
System transactionMode: #manualBegin   "Switch to manual mode; aborts current transaction"
System beginTransaction                "Start a new transaction"
System commitTransaction               "Commit and return to outside-transaction state"
System abortTransaction                "Discard changes and return to outside-transaction state"
```

### Transactionless

The session stays outside a transaction indefinitely. Intended for idle or read-only sessions. The view may be updated automatically at any time, so reads are not guaranteed to be consistent. Not appropriate for any session that writes.

```smalltalk
System transactionMode: #transactionless
```

### Checking current state

```smalltalk
System transactionMode     "Returns #autoBegin, #manualBegin, or #transactionless"
System inTransaction       "Returns true or false"
System transactionLevel    "0 = outside transaction, 1+ = in transaction, -1 = transactionless"
```

---

## How commit works

When a session calls `commitTransaction`, GemStone checks four conditions before accepting the transaction:

1. **Write-write conflict:** Did another session write an object that this session also wrote?
2. **Read-write conflict:** Did another session write an object this session read, while this session wrote an object the other session read?
3. **Write-dependency conflict:** Did another session add, remove, or change indexes on an object this session modified?
4. **Lock conflict:** Are there explicit locks held by other sessions that block this commit?

If any condition is true, the commit fails and the session's view remains unchanged. To diagnose the failure:

```smalltalk
System transactionConflicts
```

This returns a `SymbolDictionary` with a `#commitResult` key and entries for each conflict type found:

| Key | Meaning |
|---|---|
| `#'Write-Write'` | Two sessions wrote the same object |
| `#'Write-Dependency'` | Your write conflicted with another session's index operation |
| `#'Read-Write'` | Conflict detected by GemStone's indexing mechanism |
| `#'Write-WriteLock'` | Your write set conflicted with another session's write lock |
| `#'Rc-Write-Write'` | Logical write-write conflict on a reduced-conflict class instance |

The dictionary value for each conflict key is an array of OOPs (object-oriented pointers) identifying the conflicting objects.

After diagnosing, the session must abort to clear its read and write sets before it can retry:

```smalltalk
System abortTransaction
```

A simple commit retry loop:

```smalltalk
| committed |
committed := false.
[committed] whileFalse: [
    " ... do work ... "
    committed := System commitTransaction.
    committed ifFalse: [System abortTransaction]].
```

---

## Concurrency strategies

You have three tools for managing contention in a multi-user environment.

### Optimistic concurrency

Sessions read and write freely, and GemStone detects conflicts only at commit time. This is the simplest approach and works well when contention is low. The risk is that a session can do significant work and then fail to commit if another session modified the same objects first.

Most GemStone applications start with optimistic concurrency and add locks only where contention becomes a problem.

### Pessimistic concurrency (explicit locks)

Sessions acquire read or write locks before touching objects they care about. Locking is a signal to other sessions about your intentions.

**Read lock:** Guarantees that no other session can write the object or acquire a write lock on it while you hold the lock. Multiple sessions can hold read locks on the same object simultaneously.

**Write lock:** Guarantees that you can write the object and commit. No other session can hold any lock on the object while you hold a write lock.

```smalltalk
System readLock: anObject.
System writeLock: anObject.
System removeLock: anObject.
System commitAndReleaseLocks.    "Commit and release all locks if successful"
System removeLocksForSession.    "Release all locks held by this session"
```

**Important behaviors to know:**

- Locks persist through aborts by default. If you abort a transaction, you still hold any locks acquired before the abort. Release them explicitly when you're done.
- GemStone does not wait for denied locks or detect deadlocks automatically. Your application code must handle retry logic and timeouts.
- Locking an object that participates in an indexed collection does not guarantee a successful commit — index structures can still conflict. See [Indexes and locking](#indexes-and-locking) below.

Use locks sparingly. Write locks held by one session block all other sessions from locking or writing the same object. Overuse of locks reduces overall system throughput.

#### Checking lock state

```smalltalk
System sessionLocks.            "Returns [readLockedObjects, writeLockedObjects] for this session"
System systemLocks.             "All locks held by all active sessions"
System lockOwners: anObject.    "Returns session IDs holding locks on anObject"
```

### Reduced-conflict classes

For high-throughput scenarios where the same shared objects are modified by many concurrent sessions, GemStone provides four classes that handle common structural patterns without producing spurious write-write conflicts.

| Class | Use when |
|---|---|
| `RcCounter` | Multiple sessions increment or decrement a shared numeric counter |
| `RcIdentityBag` | Multiple sessions add to or remove from a shared bag |
| `RcQueue` | Multiple producers enqueue items; typically one consumer dequeues |
| `RcKeyValueDictionary` | Multiple sessions add unique keys to a shared dictionary |

These classes use more storage than their standard counterparts and may commit slightly slower. They are not a replacement for the normal conflict detection system — unusual operations can still conflict. They significantly reduce write-write conflicts for the specific patterns they're designed for.

```smalltalk
" Example: shared counter that multiple sessions can increment without conflict "
UserGlobals at: #WidgetCount put: RcCounter new.
System commitTransaction.

" In any concurrent session: "
WidgetCount increment.
System commitTransaction.
```

---

## Indexes and locking

A commit conflict can appear on GemStone's internal indexing structures even when two sessions wrote different objects. If two sessions both modify objects that participate in the same indexed collection, they can conflict on the internal index B-tree — even if neither session touched an object the other explicitly wrote.

To diagnose: look for `#'Write-Dependency'` entries in `System transactionConflicts`.

To reduce index-related conflicts, create *reduced-conflict indexes* on collections that experience heavy concurrent modification. Reduced-conflict equality indexes use a different internal structure that serializes updates more granularly, reducing the window for conflict.

---

## Nested transactions

Within a transaction, GemStone supports up to 16 levels of nested in-memory transactions. Nested transactions let you group units of work that can be independently committed or rolled back within the session without touching the shared repository.

```smalltalk
System beginNestedTransaction.
" ... do work ... "
System commitTransaction.    "Commits the nested transaction; does NOT write to the repository"
```

Key distinction: committing a nested transaction does not detect conflicts with other sessions and does not make changes persistent. Only committing the outermost transaction writes to the shared repository.

To commit or abort all nested levels at once:

```smalltalk
System commitAll.
System abortAll.
```

---

## Repository health: sessions and backlog

When a session holds an old view of the repository, garbage collection cannot reclaim objects from that era. GemStone tracks the oldest active view in the system and cannot advance its garbage collection horizon past it.

GemStone can notify sessions when their view age is causing strain:

```smalltalk
System enableSignaledAbortError.               "Notify when outside a transaction and backlogged"
System enableSignaledFinishTransactionError.   "Notify when inside a transaction and backlogged"
```

Sessions outside a transaction that do not respond to the `TransactionBacklog` notification within the `STN_GEM_ABORT_TIMEOUT` interval may be force-aborted or terminated by the Stone, depending on the `STN_GEM_LOSTOT_TIMEOUT` configuration.

---

## What to read next

- For information on user-level access control, see [Object Security](../reference/object-security).
- For production configuration of transaction log sizing and archiving, refer to the *GemStone/S 64 Bit System Administration Guide* from GemTalk Systems.
