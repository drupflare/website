---
title: drangler
description: A quick dictionary of drangler, the command-line tool that deploys, operates and migrates Drupflare sites.
headline: drangler, in One Page
intro: >-
  drangler is the command-line tool for a Drupflare site's whole life: stand one up, keep it healthy,
  develop a module against it, and move sites on or off. Every command takes --json and prints the
  same object its text is built from.
---

## 📦 Install

```sh
bun add -g @drupflare/drangler
# or
npm i -g @drupflare/drangler
```

Every release also ships :pitch[a single-file binary for Linux, macOS and Windows] on x64 and arm64, with a
`SHA256SUMS` file beside it. drangler needs `ssh` and `wrangler`; `drangler doctor` checks both.

## 🚀 First Time

drangler runs on your own computer. Before the first deploy, install it with wrangler, sign in to
Cloudflare, and let `doctor` check the setup:

```sh
npm i -g @drupflare/drangler wrangler
wrangler login     # opens a browser to approve access to your Cloudflare account
drangler doctor    # checks ssh, wrangler and the sign-in, and says how to fix what is missing
```

Commands that read an existing server (`migrate`, `preview`, `doctor --source`) connect over SSH
with your usual keys. Commands that act on a deployed site take its address, and the owner token
that `site claim --save` stored.

Every command accepts these flags:

| Flag              | What it does                                                             |
| ----------------- | ------------------------------------------------------------------------ |
| `--dry-run`       | print what the command would do, and do none of it                       |
| `--json`          | print the report as one JSON object, for scripts                         |
| `--yes`, `-y`     | consent for anything that changes a live site; without it those refuse   |
| `--site <origin>` | the site to act on, such as `https://my-site.example`                    |
| `--token <token>` | the owner token when it is not saved; `DRUPFLARE_OWNER_TOKEN` also works |
| `--verbose`, `-v` | print every command and request drangler makes                           |
| `--quiet`, `-q`   | hide progress; the report still prints                                   |

## 🎬 Common Jobs

**Try Drupal on your laptop.** One command clones the worker, downloads Drupal and the PHP
interpreter, checks the result and serves it at `http://localhost:8787`. Run it again and it reuses
the workspace.

```sh
drangler dev
```

**Put it on Cloudflare.** Deploy the same workspace, then claim the site to get the administrator
password and the owner token. `--save` keeps the token in your user config so later commands find it.

```sh
drangler deploy
drangler site claim my-site.example --title "My Site" --save
```

**Copy an existing site to see it running.** `preview` reads your current server with read-only
commands and brings up a working duplicate. :pitch[The live site is not touched.] Available from drangler
0.3.

```sh
drangler preview --host deploy@old.example --root /var/www/html
```

**Keep an eye on it.** `status` says what is deployed, `health` says whether it is serving. Both
exit non-zero on a problem, so either can go in a monitor or a CI job.

```sh
drangler status my-site.example
drangler health my-site.example
```

**Upgrade.** Move the checkout to the latest release, deploy it, wait for the site to pick it up
and run Drupal's database updates, in one step.

```sh
drangler site upgrade my-site.example
```

**Get your data out.** The whole database, as a file you own.

```sh
drangler migrate export --url my-site.example --out site.sql
```

## 🧰 Set Up and Run Locally

| Command    | What it does                                                   |
| ---------- | -------------------------------------------------------------- |
| `doctor`   | Checks the toolchain, the Cloudflare credential and the config |
| `init`     | Connects this machine to a site and records where it went      |
| `build`    | Clones the worker and builds it into a deployable tree         |
| `validate` | Everything that has to hold before `dev` or `deploy` works     |
| `dev`      | Builds if needed, checks, then runs Drupal on your machine     |

## 🚀 Deploy and Update

| Command                 | What it does                                             |
| ----------------------- | -------------------------------------------------------- |
| `deploy`                | Builds if needed, checks, then deploys to your account   |
| `site claim <target>`   | Mints the administrator password and the owner token     |
| `update [worker]`       | Moves a checkout to another version, and its worker      |
| `site upgrade <target>` | Deploys, waits for the database replay, runs the updates |
| `site updb <target>`    | Reads Drupal's update chain and drives one step of it    |

## 🩺 Operate a Site

| Command              | What it does                                                   |
| -------------------- | -------------------------------------------------------------- |
| `status <target>`    | What is deployed: plan, version, claim state                   |
| `health <target>`    | Probes a site and reports which cache tier answered            |
| `heal <target>`      | Reports the repair ladder and performs the repairs it can      |
| `reconcile <target>` | What a site still owes the shipped release, and drives it      |
| `sweep <target>`     | How much of the site is cached, and what the scheduler decided |
| `site invalidate`    | Purges cached pages by tag, or retires them all at once        |

## 🚚 Migrate

| Command               | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `preview`             | Surveys, converts and brings up a working duplicate of a site |
| `migrate survey`      | Reads a server-hosted Drupal over SSH, read-only              |
| `migrate eligibility` | Can this site move today, and what would have to change       |
| `migrate plan`        | Scores a survey and orders the work, in either direction      |
| `migrate convert`     | Converts a SQL dump between MySQL and SQLite                  |
| `migrate install`     | Lands a converted database in a workspace, with a backup      |
| `migrate restore`     | Puts a backup set back where it came from                     |
| `migrate export`      | Pulls a deployed site's database out                          |
| `migrate delta`       | The second pass of content that changed during a move         |
| `migrate cutover`     | The checklist a person confirms while traffic switches        |
| `migrate files`       | Writes the managed files in a dump back onto a filesystem     |

## 🧩 Develop a Module

`drangler modify` puts a custom module or theme on a live site one revision at a time. Each
revision is stored on the site itself, so sending a one-file change sends one file and a rollback
sends nothing.

**1. Link the project to a site.** Run it inside the module's directory. It detects the project
shape from the file it names, and writes `drangler.json` for the project and the owner token to your
user config.

```console
$ cd ~/work/events
$ drangler modify init --site https://my-site.example
detected      module-project (/work/events/events.info.yml)
package       events
mounts to     modules/custom/events
files         24
site          https://my-site.example (claimed)
owner token   set
```

**2. Check it before anything leaves your machine.** Every PHP file is linted with the PHP you
name, and paths that would collide on the site are caught here.

```console
$ drangler modify check --php php
package     events
mounts to   modules/custom/events
files       24 kept, 3 skipped
lint        24 of 24 ok (php 8.4.12)
paths       no collision inside this project
```

**3. Upload.** Only the files the site does not already hold are sent. The site then boots Drupal
with the new code before making it live.

```console
$ drangler modify upload --message "add the event listing"
package     events
plan        24 files, 2 not on the site, 22 already there
uploading   2 blob(s), 6.1 kB, 1 batch(es)
commit      rev 9f2c1ab4
verify      kernel booted
```

`verify kernel booted` is the line that matters. If the new code would stop Drupal from booting,
:pitch[the site restores the previous revision on its own] and the command exits `1` naming the error.

**4. Turn it on**, the first time only:

```sh
drangler modify enable events
```

**5. Undo if you need to.** The last five revisions stay on the site.

```sh
drangler modify revisions        # newest first
drangler modify rollback --yes   # back to the one before
drangler modify activate 3d81ee07 --yes
```

| Command                 | Use it to                                                    |
| ----------------------- | ------------------------------------------------------------ |
| `modify status`         | compare what is live on the site with what is on disk        |
| `modify diff`           | list the files an upload would send; exits `3` if any        |
| `modify release --tag`  | upload from a tagged commit, refusing uncommitted edits      |
| `modify require <name>` | install contrib from drupal.org or Packagist                 |
| `modify drop <rev>`     | delete an old revision and the files only it used            |
| `modify dev`            | run `drangler dev` with this project mounted, live-reloading |

Contrib modules come from the registry rather than an upload:
`drangler modify require drupal/pathauto drupal/metatag --enable`.

## ☁️ Cloudflare Helpers

| Command                    | What it does                                        |
| -------------------------- | --------------------------------------------------- |
| `cf whoami`                | Which Cloudflare credential drangler would use      |
| `cf workers`               | Lists the account's workers against a saved list    |
| `cf versions <worker>`     | The versions the platform still holds               |
| `cf rollback <worker> <v>` | Points a worker back at a version it already holds  |
| `cf secret <worker> …`     | Lists, sets or removes a secret without printing it |
| `secrets scan <paths…>`    | Finds credentials in a dump or a tree, masked       |

## ⚙️ Configuration

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `config where`         | Which file supplied each setting                        |
| `config check <file>`  | Scores a wrangler config against known-bad setups       |
| `config levers <file>` | The optional features a config declares, and each state |

Settings resolve from a flag, then an environment variable, then a `drangler.json` in the nearest
parent directory, then your user config. The owner token never goes in `drangler.json`: it is stored
in your user config with :pitch[owner-only permissions].

## 🚦 Reading the Output

Every command prints a short two-column report on stdout. `--json` prints :pitch[the same fields as one JSON object], and progress goes to stderr, so piping a command never mixes the two.

| Exit Code | Meaning                                                       |
| --------- | ------------------------------------------------------------- |
| `0`       | done                                                          |
| `1`       | the check could not run, such as a network failure            |
| `2`       | the input was wrong, such as a missing flag                   |
| `3`       | it ran and found something: a blocker, a secret, a difference |

`health` gives one verdict:

| Verdict         | What it means                                                                  |
| --------------- | ------------------------------------------------------------------------------ |
| `ok`            | the site answered normally                                                     |
| `warming`       | a new site unpacking its database, or a page queued to render; wait            |
| `degraded`      | an error status, or the site is shedding load on purpose to stay in its limits |
| `unreachable`   | nothing answered                                                               |
| `not-drupflare` | something answered, and it is not a Drupflare site                             |

Its `tier` line says what answered: `EDGE` is Cloudflare's cache in front of the site, `HIT` is the
site's own stored copy, `KV` is a copy shared across locations, and `RENDER` means Drupal built the
page for this request.

## ✍️ What Writes

`build`, `migrate install`, `update` and `preview` write to a local workspace; `preview --deploy`
also deploys the duplicate as a new worker. `site`, `heal`, `modify`,
`reconcile --run` and `sweep --run` change a live site, so each needs the owner token, and anything
that changes what visitors see also needs `--yes`. :pitch[Nothing in drangler deletes a file or a directory.] The full reference is in the
[drangler README](https://github.com/drupflare/drangler#readme).
