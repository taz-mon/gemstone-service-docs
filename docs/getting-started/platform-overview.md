---
id: platform-overview
title: Platform Overview
sidebar_label: Platform Overview
sidebar_position: 1
description: Review GemStone/S basics, how its architecture works, and orient yourself to its basic mechanisms and transaction processes.
---

# Platform Overview

> Review GemStone/S basics, how its architecture works, and orient yourself to its basic mechanisms and transaction processes.

---

## What is GemStone/S?

GemStone/S 64 Bit is a high-performance, object-oriented transactional database built for mission-criticl, enterprise-scale workloads in financial services, government, healthcare, utilities, and telecommunications. GemStone/S stores Smalltalk objects in your application directly to disk without translation. Unlike a relational database, there are no tables, no rows, no ORM layer, and no SQL.

The platform has powered mission-critical operations since 1982. GemTalk Systems has continuously maintained this platform from the beginning.

**GemStone/S differs from a relational database:**

As an object-oriented, transactional database, it's important to understand how it differs from transactional, relational databases common to many Software-as-a-Service (SaaS) applications.

| | GemStone/S | Relational (SQL) |
|---|---|---|
| Storage unit | Objects with class hierarchy | Tables and rows |
| Query language | GemStone Smalltalk predicates | SQL |
| Schema changes | Class versioning + instance migration | `ALTER TABLE` |
| Relationships | Direct object references | Foreign keys and JOINs |
| Concurrency | Optimistic + pessimistic, per-object locks | Row/table locks, MVCC |
| Scale | Billions of objects, disk-backed cache | Row-count dependent |

---

## Core concepts

The five components that make up a running GemStone system include:

### The Stone

The Stone is the central resource coordinator. One Stone process manages one repository. It synchronizes all commit activity, handles transaction conflicts, and is the single point that all Gem sessions communicate with. Think of it as the equivalent of the database engine process in a relational system.

### Gems

Every user session runs inside a Gem process. The Gem executes GemStone Smalltalk, manages the session's private view of the repository, and pages objects in and out of the Shared Page Cache as needed. A running system has both user Gems (one per active session) and system maintenance Gems — including garbage collection Gems (GcGems) and a SymbolGem that manages the creation of unique symbols.

### The Shared Page Cache

The Shared Page Cache (SPC) is a large area of shared memory used by the Stone and all Gem processes running on the same host. It is the primary performance lever in GemStone: frequently accessed objects stay in cache and don't hit disk, and large queries are prevented from flushing working data out of memory. The SPC is managed by a Shared Cache Monitor process that dynamically allocates memory to sessions based on workload.

### Extents and the Repository

The repository is the logical storage unit — the GemStone equivalent of a database. Physically, a repository is stored as an ordered collection of one or more extents, which are disk files or raw partitions. A repository can hold billions of objects, each identified by a unique object-oriented pointer (OOP). Repository size is bounded by disk, not by available RAM.

### The Transaction Log

The transaction log provides point-in-time roll-forward recovery. Only log records are written at commit time — not full object pages. Object pages stay in cache for reuse. Transaction logs can be written to file systems or raw devices.

---

## How object persistence works

GemStone uses the Smalltalk object model. Like a single-user Smalltalk image, it consists of classes, methods, instances, and meta objects. Persistence is established by attaching new objects to other persistent objects. All objects in the repository are derived from a named root called `AllUsers`.

Once you attach an object to the persistent object graph and commit the transaction, that object becomes visible to all other authorized users. Objects that have never been attached to the persistent graph are temporary — they exist only in the session's memory and are discarded when the session ends.

This is different from a relational database, where every `INSERT` statement immediately targets persistent storage. In GemStone, you can work with objects freely in memory and choose when to make them part of the shared repository.

---

## What to read next

- If you're setting up GemStone for the first time, go to [Quick Start](./quick-start).
- To understand how multi-user data integrity works, read [Transactions and Concurrency](../core-concepts/transactions).
- To configure user accounts and access control, see [Object Security](../reference/object-security).
