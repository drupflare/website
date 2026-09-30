---
title: Migrate
description: Move an existing Drupal site onto Drupflare without rebuilding it, check it before anything changes, and move it back whenever you like.
headline: Bring the Site You Already Have
intro: >-
  Most organisations do not need a new website. They need the one they have to stop costing a
  server, a patch window and a support contract. Drupflare takes an existing Drupal site as it is,
  checks it before anything moves, and leaves the door open in both directions.
---

## 🧰 Before You Start

**Everything runs on your own computer.** drangler is installed on your laptop or workstation, not on
the server. It connects to the server over SSH, runs a short list of read-only commands there, and
copies the results back.

You need three things:

1. **drangler**, with Node 24 or newer: `npm i -g @drupflare/drangler`. It uses `ssh` and
   `wrangler`, which `npm i -g wrangler` installs.
2. **SSH access to the server** as a user who can run `drush` in the Drupal root. This is the test:

   ```sh
   ssh deploy@old.example 'cd /var/www/html && drush status'
   ```

   If it prints the Drupal version, drangler can read the site.

3. **A Cloudflare account**, signed in through wrangler. `wrangler login` opens a browser to approve
   access, and `drangler cf whoami` confirms which account drangler will use. On a machine with no
   browser, such as CI, set `CLOUDFLARE_API_TOKEN` instead.

Then check everything at once. This checks your machine, then runs the read-only survey against the
server and names anything missing:

```sh
drangler doctor --source deploy@old.example --root /var/www/html
```

**Finding the Drupal root.** `--root` is the directory on the server that holds Drupal's `index.php`
and `sites/` folder. It is usually `/var/www/html`, or `/var/www/<site>/web` for a Composer project.
`drush status` prints it as `Drupal root`.

**If your code is in git.** A preview copies the code on the server's disk, including edits nobody
committed. To see whether the server matches your repository first:

```sh
ssh deploy@old.example 'cd /var/www/html && git status --short && git log -1 --oneline'
```

An empty `git status` means the server holds exactly the commit printed below it.

## ⚡ One Command: `drangler preview`

`drangler preview` does the whole move for you. It surveys the current server, explains what will
change, converts the database, copies the files, and brings up a working duplicate of the site,
either on your own machine or on your Cloudflare account, so you can click through it before
deciding anything.

```sh
drangler preview --host deploy@old.example --root /var/www/html
```

:pitch[A preview is a duplicate, never a replacement.] Every command it runs on the old server is
read-only, the database and files are streamed back, and the live site keeps serving the whole time.
It asks before each step. `--full` runs every step after a single confirmation, and `--dry-run` shows
every step and command without running any of them.

What the duplicate carries:

- **The database**, from MySQL, MariaDB or PostgreSQL, with the administrator accounts and passwords
  it already had.
- **Uploaded files**, public and private. Image styles and aggregated CSS and JS are rebuilt instead
  of copied.
- **Custom and contrib code** in `modules/`, `themes/`, `profiles/` and `libraries/`. Composer
  libraries the duplicate lacks are listed as ready commands.
- **Settings**: literal `$config` overrides, and a Redis connection as a Redis URL.
- **Server rules**: unconditional redirects and response headers from `.htaccess`. Anything more
  involved is listed for you to review.
- **Docroot files** a browser fetches by name, such as search-engine verification pages, `ads.txt`
  and `.well-known/`.

It ends by checking the duplicate against the source: content and file counts, then the front page,
the login page, a node and a public file. Given the live site's address with `--source-url`, each
page must answer with the same status there.
`drangler preview` ships in drangler 0.3 with Drupflare 1.0.3.

### Reading a Dry Run

Add `--dry-run` to see the whole plan before anything happens. Nothing is executed and nothing is
copied:

```console
$ drangler preview --host deploy@old.example --root /var/www/html --dry-run
dry run against deploy@old.example; nothing was executed

1. Survey the Source
2. Score the Move
...
10. Check the Duplicate

read-only commands on the host
  $ php -v
  $ cd /var/www/html && drush status --format=json
  $ tar -cf - -C /var/www/html/sites/default files
  ...

local commands
  $ drangler migrate install --db .drangler/preview/old.example/site.sqlite --repack ...
  $ bunx wrangler dev --port 8787
```

The numbered list is the ten steps it will ask about. **Read-only commands on the host** run on the
server over SSH, and every one passes an allow-list first, so a command that could write is refused
before it leaves your computer. **Local commands** run on your computer.

| Flag           | What it does                                                                    |
| -------------- | ------------------------------------------------------------------------------- |
| `--host`       | the server, typed the way you would for `ssh`: `user@host`, or `user@host:port` |
| `--root`       | the Drupal root on that server                                                  |
| `--identity`   | an SSH key file, when it is not your default key                                |
| `--dry-run`    | list every step and command, and run none of them                               |
| `--full`       | run every step after one confirmation, instead of asking before each            |
| `--deploy`     | put the duplicate on your Cloudflare account instead of your computer           |
| `--url`        | with `--deploy`, the address to check once it is up                             |
| `--source-url` | the live site's address, so each checked page must match its status there       |
| `--out`        | where the copy is kept; `.drangler/preview/<host>` by default                   |
| `--port`       | the local port for the duplicate; 8787 by default                               |

The steps below are what it runs, and each is also a command of its own.

## 🔎 1. Survey, Without Touching Anything

`drangler migrate survey` connects to the current server over SSH and runs a short list of read-only
commands: PHP and Drupal versions, the database, enabled modules, files, and content counts. :pitch[Nothing is written.] Add `--dry-run` to see every command before you hand over a key.

```sh
drangler migrate survey --host deploy@old.example --root /var/www/html --out survey.json
```

`--out` saves the result as a file the next steps read. If the connection drops part-way,
`--resume` re-runs only the steps that did not finish. In a dry run, a step marked `(optional)` is
one whose failure does not stop the survey: a missing `file_managed` count, for example, is recorded
and the survey carries on.

## 🚦 2. Get a Verdict Before You Commit

`drangler migrate eligibility` turns the survey into one of three answers: **GO**, **GO WITH
CHANGES**, or **NO**, and it names the reason behind every finding. Anything it could not measure is
reported as unmeasured, :pitch[never quietly passed].

```sh
drangler migrate eligibility --survey survey.json
drangler migrate plan --survey survey.json --to workers
```

`migrate plan` orders the work: which modules move as they are, which need a service provisioned,
which cannot run on Workers and what replaces them.

A Drupal 10 site is planned as a major upgrade on the way in. The plan names every enabled contrib
module that has no Drupal 11 release, and the database updates run after the move with
`drangler site updb`. :pitch[Drupal 10 reaches end of life on December 9, 2026.]

## 🔁 3. Convert the Database

A MySQL, MariaDB or PostgreSQL dump converts to the SQLite a Drupflare site runs on (`--from pgsql`
reads a `pg_dump`). The dump comes from the
server and the rest runs on your computer, which needs `sqlite3` installed:

```sh
ssh deploy@old.example 'cd /var/www/html && drush sql:dump --extra-dump=--hex-blob' > site.sql
```

The converter :pitch[refuses what it cannot translate exactly] and names the statement, instead of producing a dump that looks complete
and fails later.

```sh
drangler migrate convert --from mysql --to sqlite --in site.sql --out site.sqlite.sql
sqlite3 site.sqlite < site.sqlite.sql
drangler migrate install --db site.sqlite --repack
```

Every file it replaces is backed up and verified first, and `drangler migrate restore` puts a backup
set back with one command.

## 📦 4. Bring the Code

The database names the modules a site runs, and the code arrives separately, in two parts. The
contrib packages in the project's `composer.lock` go up with `drangler build --project`, which runs
composer on your machine, applies the project's patches, including patched Drupal core, reaches its
private repositories, and uploads only what the shipped pack does not already carry. The install
profile, custom modules and themes go up with `drangler modify upload`, which boots Drupal on the
site before a revision goes live and rolls back one that would fatal.

```sh
drangler site claim https://my-site.example --title "My Site"
drangler build --project ~/work/my-site --site https://my-site.example --yes
drangler modify upload --dir ~/work/my-site/web/profiles/custom/my_profile --site https://my-site.example --yes
drangler site updb https://my-site.example --steps 200 --no-snapshot --yes
```

## 🚀 5. Deploy and Cut Over

Deploy to your Cloudflare account, then switch traffic with :pitch[a short read-only window].
`drangler migrate cutover` prints the checklist a person confirms, and `drangler migrate delta`
carries the content that changed during the move, and prints the statement that re-seeds the id
counters so the first new node on the new site does not collide with an old one.

## 🧪 Reproduce It with Thunder

[Thunder](https://github.com/thunder/thunder-distribution) is one of the Verified codebases on the
[fixtures page](/fixtures). These steps rebuild that result on your own machine. You need git, bun,
Docker, and PHP 8.3 or later with composer.

Install drangler, and get the worker hydrated so it can run:

```sh
bun add -g @drupflare/drangler
mkdir ~/drupflare && cd ~/drupflare
git clone https://github.com/drupflare/worker
cd worker && bun install && bun run hydrate
```

Install Thunder the way a server already runs it. The database is a SQLite file inside the project:

```sh
composer create-project thunder/thunder-project ~/thunder --stability dev --no-interaction
cd ~/thunder
vendor/bin/drush site:install thunder --db-url=sqlite://sites/default/files/.ht.sqlite \
  --account-name=admin --account-pass=change-me -y
```

The fixture pins the profile at commit `50686db`. To match it exactly, check that commit out of
`thunder-distribution` and copy it over `~/thunder/docroot/profiles/contrib/thunder` before the
install.

Land the database in the worker and start it:

```sh
cd ~/drupflare/worker
drangler migrate install --db ~/thunder/docroot/sites/default/files/.ht.sqlite --repack
drangler dev --port 8787
```

In a second terminal, claim the site, then send the packages and the profile:

```sh
cd ~/drupflare/worker
drangler site claim http://localhost:8787 --title Thunder
export DRUPFLARE_OWNER_TOKEN=<the owner token the claim printed>
drangler build --project ~/thunder --site http://localhost:8787 --yes
drangler modify upload --dir ~/thunder/docroot/profiles/contrib/thunder --site http://localhost:8787 --yes
drangler site updb http://localhost:8787 --steps 200 --no-snapshot --yes
```

Then open `http://localhost:8787/`. Thunder sets its front page to the login form, so you land on
`/user/login`; sign in as `admin` with the password the claim printed. `/admin/modules` lists
Thunder's modules as enabled, `/node/add/article` creates content, and `/admin/reports/status` shows
the site's requirements. `drangler status http://localhost:8787` reports the same site from the
command line.

The fixture run does all of this with one command, and scores the 13 capabilities afterwards:

```sh
cd ~/drupflare/worker
CORPUS_PLAN=paid bun scripts/e2e/corpus-lane.ts --repo=thunder --keep
```

It needs Docker running and the drangler repository cloned beside the worker
(`git clone https://github.com/drupflare/drangler ~/drupflare/drangler`). The dev server it starts is at
`http://localhost:8840`. Thunder's native build lands in `native/thunder`, the scored row is written to
`docs/compatibility.md` and `docs/compatibility.json`, and `--keep` leaves the site's state under
`/tmp/cfw-corpus-thunder-*` so you can start it again and look around.

## 🚪 Leaving Is Part of the Plan

A site can move back to an ordinary server at any time. `drangler migrate export` pulls the database
out, `migrate convert` turns it back into MySQL, and `migrate eligibility --to vps` lists the few
settings a conventional host needs instead. Uploaded files are copied separately. :pitch[No lock-in is a promise you can test on day one.]

```sh
drangler migrate export --url my-site.example --out worker.sql
drangler migrate convert --from sqlite --to mysql --in worker.sql --out vps.sql
```

## 🏛️ Built for Organisations That Cannot Rebuild

Universities, councils and non-profits often run dozens of small Drupal sites that were built years
ago and still matter. Rewriting them is not on anyone's roadmap. Drupflare keeps them as they are,
removes the servers underneath, and :pitch[makes every step reversible].

:deploy-button
