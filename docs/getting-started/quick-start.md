---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
sidebar_position: 2
description: Set up GemStone/S 64 Bit for the first time — from installation through your first committed transaction.
---

# Quick Start

This guide walks you through a first GemStone/S 64 Bit installation on Linux: starting the core server processes, logging in, and committing a transaction. The steps assume a clean host with GemStone already extracted from the distribution archive.

**Prerequisites:**
- GemStone/S 64 Bit 3.2 or later, extracted to `/opt/gemstone`
- A Linux host with sufficient RAM for the Shared Page Cache (minimum 256 MB for evaluation; production sizing varies)
- The `$GEMSTONE` environment variable set to your installation root

:::note
This guide covers a single-machine, single-extent configuration suitable for evaluation and development. For production deployments, refer to the *GemStone/S 64 Bit Installation Guide* from GemTalk Systems.
:::

---

## Step 1: Set your environment

Before running any GemStone commands, set the required environment variables. Add these to your shell profile or set them in each session:

```bash
export GEMSTONE=/opt/gemstone
export PATH=$GEMSTONE/bin:$PATH
```

Verify the installation directory is accessible:

```bash
ls $GEMSTONE/bin/startstone
```

---

## Step 2: Create a configuration file

GemStone reads startup parameters from a configuration file called a *stone configuration file*. Copy the provided example and give your stone a name:

```bash
cp $GEMSTONE/data/system.conf /opt/gemstone/data/mystone.conf
```

Open `mystone.conf` and verify or adjust these key parameters:

```
STN_TRAN_LOG_DIRECTORIES = /opt/gemstone/tranlogs/;
STN_TRAN_LOG_SIZES = 100;
DBF_EXTENT_NAMES = /opt/gemstone/data/mystone.dbf;
```

| Parameter | Purpose |
|---|---|
| `STN_TRAN_LOG_DIRECTORIES` | Where transaction logs are written |
| `STN_TRAN_LOG_SIZES` | Maximum log file size in MB |
| `DBF_EXTENT_NAMES` | Path to the primary data extent file |

Create the transaction log directory if it does not already exist:

```bash
mkdir -p /opt/gemstone/tranlogs
```

---

## Step 3: Initialize the repository extent

The extent file is the on-disk storage for your repository. Initialize it from the GemStone-provided seed file:

```bash
cp $GEMSTONE/bin/extent0.dbf /opt/gemstone/data/mystone.dbf
chmod 644 /opt/gemstone/data/mystone.dbf
```

:::caution
The seed extent file contains the GemStone kernel classes and the initial `SystemUser` and `DataCurator` accounts. Do not modify it before copying.
:::

---

## Step 4: Start the NetLDI

The NetLDI (Network Long Distance Information) process starts and coordinates GemStone processes, including Gem sessions. Start it before the Stone:

```bash
startnetldi -g
```

The `-g` flag starts NetLDI in the background. Verify it is running:

```bash
netldilist
```

---

## Step 5: Start the Stone

Start the Stone process, referencing the configuration file you created in Step 2:

```bash
startstone mystone -C /opt/gemstone/data/mystone.conf
```

Verify the Stone started cleanly:

```bash
stonelist
```

You should see `mystone` listed with a status of `running`. If the Stone fails to start, check the log file at `$GEMSTONE/log/mystone.log` for error details.

---

## Step 6: Log in with Topaz

Topaz is GemStone's command-line interface for interacting with the object server directly. Open a session:

```bash
topaz -l
```

At the Topaz prompt, connect to your Stone:

```
topaz> set gemstone mystone
topaz> set user DataCurator pass swordfish
topaz> login
```

A successful login returns output similar to:

```
GemStone version 3.2.x ...
DataCurator logged in.
```

---

## Step 7: Run your first transaction

With a session open, create a persistent object and commit it. This confirms that the full write path — Gem to Stone to extent to transaction log — is working correctly.

At the Topaz prompt:

```smalltalk
" Create a dictionary in the UserGlobals namespace "
UserGlobals at: #MyFirstObject put: Dictionary new.

" Add a key-value pair "
MyFirstObject at: 'hello' put: 'GemStone'.

" Commit the transaction "
System commitTransaction.
```

Topaz returns `true` on a successful commit. Verify the object persisted by reading it back:

```smalltalk
MyFirstObject at: 'hello'
```

Expected output: `'GemStone'`

---

## Step 8: Log out and shut down

Log out of the Topaz session:

```
topaz> logout
topaz> exit
```

To stop the Stone cleanly when you're done:

```bash
stopstone mystone
stopnetldi
```

---

## What to read next

- To understand what just happened with `commitTransaction`, read [Transactions and Concurrency](../core-concepts/transactions).
- To set up additional user accounts beyond `DataCurator`, see [Object Security](../reference/object-security).
- For production configuration — Shared Page Cache sizing, multiple extents, log archiving — refer to the *GemStone/S 64 Bit System Administration Guide* from GemTalk Systems.
