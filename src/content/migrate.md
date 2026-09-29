---
title: Migrate
description: Move an existing Drupal site onto Drupflare without rebuilding it, check it before anything changes, and move it back whenever you like.
headline: Bring the Site You Already Have
intro: >-
  Most organisations do not need a new website. They need the one they have to stop costing a
  server, a patch window and a support contract. Drupflare takes an existing Drupal site as it is,
  checks it before anything moves, and leaves the door open in both directions.
---

## ⚡ One Command: `drangler preview`

`drangler preview` does the whole move for you. It surveys the current server, explains what will
change, converts the database, copies the files, and brings up a working duplicate of the site,
either on your own machine or on your Cloudflare account, so you can click through it before
deciding anything.

```sh
drangler preview --host deploy@old.example --root /var/www/html
```

**A preview is a duplicate, never a replacement.** Every command it runs on the old server is
read-only, the database and files are streamed back, and the live site keeps serving the whole time. It asks before each step. `--full` runs every step after a single
confirmation, and `--dry-run` shows every step and command without running any of them.

The steps below are what it runs, and each is also a command of its own.

## 🔎 1. Survey, Without Touching Anything

`drangler migrate survey` connects to the current server over SSH and runs a short list of read-only
commands: PHP and Drupal versions, the database, enabled modules, files, and content counts. Nothing
is written. Add `--dry-run` to see every command before you hand over a key.

```sh
drangler migrate survey --host deploy@old.example --root /var/www/html --out survey.json
```

## 🚦 2. Get a Verdict Before You Commit

`drangler migrate eligibility` turns the survey into one of three answers: **GO**, **GO WITH
CHANGES**, or **NO**, and it names the reason behind every finding. Anything it could not measure is
reported as unmeasured, never quietly passed.

```sh
drangler migrate eligibility --survey survey.json
drangler migrate plan --survey survey.json --to workers
```

`migrate plan` orders the work: which modules move as they are, which need a service provisioned,
which cannot run on Workers and what replaces them.

## 🔁 3. Convert the Database

A MySQL or MariaDB dump converts to the SQLite a Drupflare site runs on. The converter refuses what
it cannot translate exactly and names the statement, instead of producing a dump that looks complete
and fails later.

```sh
drangler migrate convert --from mysql --to sqlite --in site.sql --out site.sqlite.sql
sqlite3 site.sqlite < site.sqlite.sql
drangler migrate install --db site.sqlite --repack
```

Every file it replaces is backed up and verified first, and `drangler migrate restore` puts a backup
set back with one command.

## 🚀 4. Deploy and Cut Over

Deploy to your Cloudflare account, then switch traffic with a short read-only window.
`drangler migrate cutover` prints the checklist a person confirms, and `drangler migrate delta`
carries the content that changed during the move, and prints the statement that re-seeds the id
counters so the first new node on the new site does not collide with an old one.

## 🚪 Leaving Is Part of the Plan

A site can move back to an ordinary server at any time. `drangler migrate export` pulls the database
out, `migrate convert` turns it back into MySQL, and `migrate eligibility --to vps` lists the few
settings a conventional host needs instead. Uploaded files are copied separately. No lock-in is a promise you can test on day one.

```sh
drangler migrate export --url my-site.example --out worker.sql
drangler migrate convert --from sqlite --to mysql --in worker.sql --out vps.sql
```

## 🧭 Arriving in v1.0.3

- **Drupal 10 to 11.** drangler reads a Drupal 10 site and plans its upgrade to Drupal 11, so a site
  on the older release moves and upgrades in one pass. Drupal 10 reaches end of life on December 9, 2026.
- **`drangler preview`**, the one-command duplicate described above.
- **PostgreSQL sources**, alongside MySQL and MariaDB.
- **Whole Composer projects**, including patched contrib and private packages, built on your machine
  and uploaded as one revision.
- **Patched Drupal core**, delivered per site on top of the shared core.

## 🏛️ Built for Organisations That Cannot Rebuild

Universities, councils and non-profits often run dozens of small Drupal sites that were built years
ago and still matter. Rewriting them is not on anyone's roadmap. Drupflare keeps them as they are,
removes the servers underneath, and makes every step reversible.

:deploy-button
