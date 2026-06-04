---
title: "Platform Overview"
description: "Architecture, core concepts, and use cases for GemStone/S 64 Bit, an object-oriented database server with persistent Smalltalk object storage."
product: "GemStone/S 64 Bit"
version: "3.7.x"
doc_type: "conceptual"
content_category: "getting-started"
audience: ["evaluator", "developer", "administrator"]
platform: ["all"]
keywords: ["GemStone", "object database", "Smalltalk", "persistent objects", "GemStone architecture", "object-oriented database"]
source_docs:
  - title: "GemStone/S 64 Bit Programming Guide 3.7"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-ProgGuide-3.7.pdf"
  - title: "GemStone/S 64 Bit System Administration Guide 3.7"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-SysAdminGuide-3.7.pdf"
last_verified: "2026-06-04"
---

# Platform Overview

> GemStone/S 64 Bit is a distributed, multi-user, transactional object database. This article explains what it is, how its processes fit together, and where it fits compared to a relational database.

---

## What is GemStone/S?

GemStone/S 64 Bit is a server-based object database that runs GemStone Smalltalk as its query and application language. It stores objects directly to disk without translation, so you don't manage tables an ORM layer or use SQL. The platform supports thousands of concurrent users, repositories with billions of objects, and sustained transaction rates of hundreds of transactions per second.

GemStone has powered mission-critical deployments in financial services, government, healthcare, utilities, and telecommunications since 1982. GemTalk Systems has maintained it continuously since that time.

**When GemStone fits:** GemStone works well for applications with deeply nested or highly interconnected data structures, where the cost of translating objects to and from relational tables creates performance or complexity problems. It is also well suited for workloads where business logic must execute close to the data, inside the server or in GemStone Smalltalk, not in a separate application tier.

---

## How GemStone differs from a relational database

| | GemStone/S | Relational (SQL) |
|---|---|---|
| Storage unit | Objects with class hierarchy | Tables and rows |
| Query language | GemStone Smalltalk predicates | SQL |
| Schema changes | Class versioning + instance migration | `ALTER TABLE` |
| Relationships | Direct object references (OOPs) | Foreign keys and JOINs |
| Concurrency | Optimistic and pessimistic; per-object locks; reduced-conflict collection classes | Row/table locks, MVCC |
| Scale | Billions of objects, bounded by disk | Bounded by table and index size |
| Application logic | Runs as Smalltalk methods inside the server | Runs in a separate application tier |

The most significant architectural difference is that GemStone eliminates the object-relational impedance mismatch entirely. Data is modeled in whatever structure the application requires, including hierarchies, networks, queues, and nested collections. There are no data objects that must be assembled at query time.

---

## Process architecture

A running GemStone system is made up of several cooperating processes. Understanding them helps with installation, configuration, and troubleshooting.

### Stone

The Stone is the central resource coordinator. One Stone process manages one repository. It synchronizes commit activity, resolves transaction conflicts, and is the single communication point for all Gem sessions. The Stone also coordinates with the Shared Cache Monitor to manage memory allocation across active sessions.

### Gem

Every user session runs inside a Gem process. The Gem executes GemStone Smalltalk, maintains the session's private snapshot view of the repository, and pages objects in and out of the Shared Page Cache as needed. A running system has both user Gems, one per active login, and one for system maintenance Gems. Maintenance Gems include GcGems, which handle garbage collection of unreferenced objects, and the SymbolGem, which manages the creation of unique canonical symbols. User Gems can be distributed across multiple servers; they do not need to run on the same host as the Stone.

### NetLDI

The NetLDI (Network Long Distance Information) process is the network broker that starts Gem processes on demand and coordinates startup when GemStone processes are needed on a different host than the one the Stone is running on. Most multi-host configurations require at least one NetLDI per server node.

### Shared Page Cache

The Shared Page Cache (SPC) is a large area of shared memory used by the Stone and all Gem processes on the same host. It is the primary performance lever in GemStone: frequently accessed objects stay in cache rather than re-reading from disk, and the Shared Cache Monitor prevents large queries from flushing working data out of memory. Cache size is configurable and has a direct impact on throughput for read-heavy workloads.

### Extents and the repository

The repository is the logical storage unit, the GemStone equivalent of a database. Physically, a repository is stored as an ordered collection of one or more extents, which are standard disk files or raw disk partitions. Repository size is bounded by disk capacity, not available RAM. A repository can contain billions of objects, each identified by a unique object-oriented pointer (OOP).

### Transaction log

The transaction log provides point-in-time roll-forward recovery. At commit time, only log records are written. Object pages remain in the cache for reuse, which keeps commit I/O low. Transaction logs can be written to file systems or raw devices.

---

## How object persistence works

GemStone uses the Smalltalk object model. Like a single-user Smalltalk image, it consists of classes, methods, instances, and meta-objects. All persistent objects in the repository descend from a named root called `AllUsers`.

Persistence is established by attaching a new object to an already-persistent object and committing the transaction. Until that commit, the object exists only in the session's private memory and is invisible to other users. After the commit, the object becomes part of the shared repository and is visible to all authorized sessions.

This is different from a relational database, where an `INSERT` immediately targets shared, durable storage. In GemStone, you work with objects freely in session memory, attach them to the persistent graph when they are ready, and commit when the transaction is complete. Objects that are never attached to the persistent graph are temporary and are discarded when the session ends.

A single user may have multiple simultaneous sessions open, and each session maintains its own consistent snapshot view of the repository. Changes made by other sessions become visible after the next transaction boundary.

---

## Client interfaces

GemStone applications can access objects and execute methods from several languages. The primary interfaces are:

- **GemStone Smalltalk / Topaz** — the native command-line interface for repository operations, scripting, and development. Topaz is included with the server distribution.
- **GemBuilder for C** — a library of C functions that provides a bridge between C application code and the GemStone repository. Included with the server distribution.
- **GemBuilder for Smalltalk** — connects a client Smalltalk image (VisualWorks or VA Smalltalk) to a GemStone server. Distributed as a separate product.
- **GemBuilder for Java** — a Java runtime package providing a message-forwarding interface between a Java client and a GemStone server. Distributed as a separate product.
- **GsDevKit** — an open-source development kit providing a Pharo-compatible GemStone Smalltalk environment, available via GitHub.

---

## What to read next

- To install GemStone on Linux or macOS, go to [Quick Start](./quick-start).
- To configure user accounts and access control, see [Object Security](../reference/object-security).
