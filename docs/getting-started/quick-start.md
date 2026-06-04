---
title: "Quick Start"
description: "Step-by-step installation instructions for GemStone/S 64 Bit on Linux (zip), Linux (APT), and macOS. Covers download, environment setup, repository creation, and first login."
product: "GemStone/S 64 Bit"
version: "3.7.x"
doc_type: "task"
content_category: "installation"
audience: ["developer", "administrator"]
platform: ["linux", "macos"]
keywords: ["GemStone install", "GemStone setup", "createNewGemStoneRepository", "configuregs", "Linux install", "macOS install", "APT install", "deb install", "GemStone Quick Start", "startstone", "startnetldi", "topaz login"]
source_docs:
  - title: "GemStone/S 64 Bit Installation Guide — Linux 3.7.5"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-InstallGuide-Linux-3.7.5/MAIN.htm"
  - title: "GemStone/S 64 Bit Installation Guide — Linux APT 3.7.5"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-InstallGuide-LinuxAPT-3.7.5/MAIN.htm"
  - title: "GemStone/S 64 Bit Installation Guide — Mac/Darwin 3.7.5"
    url: "https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-InstallGuide-Mac-3.7.5/MAIN.htm"
last_verified: "2026-06-04"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quick Start

> Install GemStone/S 64 Bit 3.7.5, create a repository, and log in for the first time. Select your platform below.

:::note macOS is for development only
GemStone/S 64 Bit on macOS is supported for development use only, not production deployments.
:::

---

## Before you begin

All three tracks share the same prerequisites. Verify these before starting.

**Hardware and OS**

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

- Intel x86_64 (Sandy Bridge or newer, no Atom) or AMD x86_64 (Bulldozer v1 or newer), or 64-bit Raspberry Pi 5 (arm64)
- Red Hat-compatible Linux ES 7.9/8.10/9.6, Ubuntu 22.04/24.04 LTS, or Debian 12/13

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

- Intel x86_64 (Sandy Bridge or newer, no Atom) or AMD x86_64 (Bulldozer v1 or newer)
- Ubuntu 22.04/24.04 LTS, or Debian 12/13

:::note
The APT track supports Ubuntu and Debian only. For Red Hat-compatible distributions, use the Linux (zip) or Linux (RPM) track.
:::

</TabItem>
<TabItem value="macos" label="macOS">

- Intel x86_64 or Apple silicon (ARM)
- macOS 13.7.6 (Ventura) or macOS 15.5 (Sequoia)

</TabItem>
</Tabs>

**Disk and memory**

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

- ~1.3 GB disk space for the distribution, plus space for your repository
- Swap space at least 20–25% of physical RAM
- ext4, XFS, or ZFS filesystem; XFS recommended for large systems
- Do not install on NFS-mounted partitions or CIFS volumes

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

- ~1.3 GB disk space for the distribution, plus space for your repository
- Swap space at least 20–25% of physical RAM
- ext4, XFS, or ZFS filesystem; XFS recommended for large systems
- Do not install on NFS-mounted partitions or CIFS volumes

</TabItem>
<TabItem value="macos" label="macOS">

- ~800 MB disk space for the distribution, plus space for your repository
- Adequate free space on the boot partition beyond other system needs

</TabItem>
</Tabs>

---

## Step 1: Download the distribution

Go to [gemtalksystems.com/products/gs64/versions37x](https://gemtalksystems.com/products/gs64/versions37x/) and download the 3.7.5 package for your platform.

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

Download the zip file matching your architecture:
- `GemStone64Bit3.7.5-x86_64.Linux.zip` (x86_64)
- `GemStone64Bit3.7.5-arm64.Linux.zip` (arm64 / Raspberry Pi 5)

You must agree to the [Community Edition License Terms](https://downloads.gemtalksystems.com/pub/GemStone_License_Agreement.pdf) before downloading, unless you have a GemTalk contract license.

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

Two APT installation methods are available. Choose one:

**Option A — `.deb` file:** Download `GemStone64-3.7.5-1.x86_64.deb` or `GemStone64-3.7.5-1.arm64.deb`.

**Option B — PPA:** No file to download. The PPA is configured in Step 2.

</TabItem>
<TabItem value="macos" label="macOS">

Download the `.dmg` file matching your hardware:
- `GemStone64Bit3.7.5-arm64.Darwin.dmg` (Apple silicon)
- `GemStone64Bit3.7.5-i386.Darwin.dmg` (Intel/AMD)

Download the architecture-native package. Intel binaries run on Apple silicon via Rosetta emulation, but performance is slower.

</TabItem>
</Tabs>

---

## Step 2: Install

Install as a regular user (`gsAdminUser`), not as root. Some configuration steps later require `sudo`.

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

1. Choose an installation directory (`InstallDir`). Avoid NFS-mounted partitions and volumes that contain OS swap space.

2. Move the zip file to `InstallDir` and unzip it:

```bash
cd InstallDir
unzip GemStone64Bit3.7.5-x86_64.Linux.zip
```

The distribution unpacks into a directory named `GemStone64Bit3.7.5-x86_64.Linux` (or `arm64` for arm64).

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

The APT installation writes to `/usr/lib/` and root owns it. Do not place your keyfile or repository files inside the GemStone distribution directory.

**Option A — `.deb` file:**

```bash
sudo apt install /path/to/GemStone64-3.7.5-1.x86_64.deb
```

You can also use `dpkg -i` instead of `apt install`.

**Option B — PPA:**

Follow the setup instructions at [ppa.gemtalksystems.com](https://ppa.gemtalksystems.com/), then install:

```bash
sudo apt install gemstone-server-3.7.5
```

After either method, GemStone is installed at:
- `/usr/lib/x86_64-linux-gnu/gemstone/3.7.5/` (x86_64)
- `/usr/lib/aarch64-linux-gnu/gemstone/3.7.5/` (arm64)

</TabItem>
<TabItem value="macos" label="macOS">

1. Choose an installation directory (`InstallDir`). Avoid NFS-mounted partitions and volumes containing OS swap space.

2. Double-click the `.dmg` file to open it.

3. Drag the GemStone installation tree to `InstallDir`.

The distribution unpacks into a directory named `GemStone64Bit3.7.5-platform.Darwin`.

</TabItem>
</Tabs>

---

## Step 3: Set environment variables

Set `GEMSTONE` and update your `PATH` before running any GemStone commands. Add these to your shell profile (`.bashrc`, `.zshrc`, or equivalent) to persist across sessions.

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

```bash
export GEMSTONE=InstallDir/GemStone64Bit3.7.5-x86_64.Linux
export PATH=$GEMSTONE/bin:$PATH
```

Replace `x86_64` with `arm64` if you installed the arm64 distribution.

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

```bash
export GEMSTONE=/usr/lib/x86_64-linux-gnu/gemstone/3.7.5
export PATH=$GEMSTONE/bin:$PATH
```

Replace `x86_64-linux-gnu` with `aarch64-linux-gnu` for arm64.

</TabItem>
<TabItem value="macos" label="macOS">

```bash
export GEMSTONE=InstallDir/GemStone64Bit3.7.5-arm64.Darwin
export PATH=$GEMSTONE/bin:$PATH
```

Replace `arm64` with `i386` if you installed the Intel distribution.

</TabItem>
</Tabs>

If you have previously installed GemStone on this machine, check for stale environment variables and clear any that do not apply to 3.7.5:

```bash
env | grep GEM
```

---

## Step 4: Run configuregs

`configuregs` creates the `/opt/gemstone/locks` and `/opt/gemstone/log` directories that GemStone requires to run. On a machine with no prior GemStone installation, you must run this step.

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

Run as `sudo` with the `GEMSTONE` variable passed through:

```bash
sudo -E $GEMSTONE/install/configuregs
```

The script prompts for:

| Prompt | What to enter |
|---|---|
| User to own GEMSTONE | Your `gsAdminUser` account name (not root) |
| Group to own GEMSTONE | A group that includes all GemStone users |
| Key file path | Path to your keyfile, or press Enter to use the bundled community key |
| Add Netldi to `/etc/services`? | `n` (default) unless you know you need named Netldi |
| Protect processes from OOM killer? | `y` (default) — recommended |
| Update `logind.conf` to prevent session kill? | `y` (default) — recommended on systemd systems |

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

:::note
The APT track does not use `configuregs`. The package installation handles `/opt/gemstone` directory creation automatically. For keyfile setup, place your customer keyfile in `/etc/gemstone/3.7.5/` and specify its path using the `KEYFILE` parameter in your Stone configuration file.
:::

Skip to Step 5.

</TabItem>
<TabItem value="macos" label="macOS">

Run as `sudo` with the `GEMSTONE` variable passed through:

```bash
sudo -E $GEMSTONE/install/configuregs
```

The script prompts for:

| Prompt | What to enter |
|---|---|
| User to own GEMSTONE | Your `gsAdminUser` account name (not root) |
| Group to own GEMSTONE | A group that includes all GemStone users |
| Key file path | Path to your keyfile, or press Enter to use the bundled community key |
| Add Netldi to `/etc/services`? | `n` (default) |

</TabItem>
</Tabs>

---

## Step 5: Configure shared memory (macOS only)

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

No action needed. Modern Linux kernels have sufficient default shared memory limits for GemStone.

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

No action needed. Modern Linux kernels have sufficient default shared memory limits for GemStone.

</TabItem>
<TabItem value="macos" label="macOS">

macOS requires explicit shared memory configuration. Create a plist file to set `kern.sysv.shmmax` and `kern.sysv.shmall` based on your available RAM.

1. Calculate the maximum shared memory segment: multiply your physical RAM in MB by 0.75, then convert to bytes.

   For a machine with 8 GB (8192 MB) of RAM:
   ```
   8192 MB × 0.75 = 6144 MB
   6144 MB × 1,048,576 = 6,442,450,944 bytes
   ```

2. Create `/Library/LaunchDaemons/com.gemtalksystems.shared-memory.plist`. A template lives at [docs.gemtalksystems.com](https://docs.gemtalksystems.com/current/com.gemtalksystems.shared-memory.plist). Edit the `shmmax` and `shmall` values to match your system.

   Here, `shmmax` is in bytes; `shmall` is in 4096-byte pages (`shmmax / 4096`).

3. Apply the settings (or reboot):
   ```bash
   sudo launchctl load /Library/LaunchDaemons/com.gemtalksystems.shared-memory.plist
   ```

</TabItem>
</Tabs>

---

## Step 6: Create a repository

The recommended approach for new installs is `createNewGemStoneRepository`, which sets up all repository files in a single directory outside the distribution tree.

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

```bash
$GEMSTONE/install/createNewGemStoneRepository /path/to/your/repo
```

Replace `/path/to/your/repo` with a path that does not yet exist or is empty, and is writable by `gsAdminUser`. The script prints the exact `startstone` and `startnetldi` commands to run next.

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

Because the APT installation is read-only, your repository directory must be outside `$GEMSTONE`:

```bash
$GEMSTONE/install/createNewGemStoneRepository /path/to/your/repo
```

The directory must not exist or must be empty, and your `gsAdminUser` account must have write access to it. Do not use any path inside `/usr/lib/`.

</TabItem>
<TabItem value="macos" label="macOS">

```bash
$GEMSTONE/install/createNewGemStoneRepository /path/to/your/repo
```

Replace `/path/to/your/repo` with a path that does not yet exist or is empty, and is writable.

</TabItem>
</Tabs>

---

## Step 7: Start the Stone and Netldi

<Tabs>
<TabItem value="linux-zip" label="Linux (zip)" default>

```bash
# Start the Stone, pointing to the configuration file created in Step 6
startstone -E /path/to/your/repo/gemstone_data.conf

# Start the Netldi in guest mode with captive account
startnetldi -g -a gsAdminUser
```

</TabItem>
<TabItem value="linux-apt" label="Linux (APT)">

```bash
# Start the Stone, pointing to the configuration file created in Step 6
startstone -E /path/to/your/repo/gemstone_data.conf

# Start the Netldi in guest mode with captive account
startnetldi -g -a gsAdminUser
```

</TabItem>
<TabItem value="macos" label="macOS">

```bash
# Start the Stone, pointing to the configuration file created in Step 6
startstone -E /path/to/your/repo/gemstone_data.conf

# Start the Netldi in guest mode with captive account
startnetldi -g -a gsAdminUser
```

</TabItem>
</Tabs>

Both commands use the default names `gs64stone` (Stone) and `gs64ldi` (Netldi). If you need to use a port number instead of a named Netldi, pass the port as an argument:

```bash
startnetldi -g -a gsAdminUser 54321
```

---

## Step 8: Verify the installation

Log in using Topaz, the GemStone command-line interface. Run this on the same host as the Stone with your environment set up.

```bash
topaz
```

At the Topaz prompt, set your login parameters and connect:

```
topaz> set stone gs64stone user DataCurator password swordfish
topaz> login
```

A successful login confirms the Stone, Netldi, and repository are all working.

:::caution Change the default passwords
The built-in administrative accounts (`DataCurator`, `SystemUser`, `GcUser`) all use the default password `swordfish`. Change these passwords before any multi-user or networked use. See the [System Administration Guide](https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-SysAdminGuide-3.7/MAIN.htm) for instructions.
:::

---

## What to read next

- To understand user accounts and access control, see [Object Security](../reference/object-security).
- For production configuration (multi-user, separate extents and transaction logs, large page memory), consult the [System Administration Guide](https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-SysAdminGuide-3.7/MAIN.htm).
- For Topaz scripting and repository operations, see the [Topaz User's Guide](https://downloads.gemtalksystems.com/docs/GemStone64/3.7.x/GS64-Topaz-3.7/MAIN.htm).
