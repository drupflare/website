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

Every release also ships a single-file binary for Linux, macOS and Windows on x64 and arm64, with a
`SHA256SUMS` file beside it. drangler needs `ssh` and `wrangler`; `drangler doctor` checks both.

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

| Command    | What it does                                                         |
| ---------- | -------------------------------------------------------------------- |
| `modify …` | Uploads a module to a live site one revision at a time, with history |

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
in your user config with owner-only permissions.

## ✍️ What Writes

`build`, `migrate install` and `update` write to a local workspace. `site`, `heal`, `modify`,
`reconcile --run` and `sweep --run` change a live site, so each needs the owner token, and anything
that changes what visitors see also needs `--yes`. Nothing in drangler deletes a file or a
directory. The full reference is in the
[drangler README](https://github.com/drupflare/drangler#readme).
