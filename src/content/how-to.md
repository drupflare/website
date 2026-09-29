---
title: How-To
description: A step-by-step guide to deploying, claiming, configuring and running a self-managed Drupflare site.
headline: The Setup, Step by Step
intro: >-
  Everything from an empty Cloudflare account to a Drupal site on your own domain, with modules,
  mail and updates. Each step names what it creates and what to save.
---

## 🧾 Before You Start

You need a Cloudflare account and a GitHub account. The free Cloudflare plan runs a site, and moving
to the $5 Workers Paid plan later is one variable and a redeploy.

A deploy creates these on your account:

| Binding        | Type           | What it holds                                           |
| -------------- | -------------- | ------------------------------------------------------- |
| `SITE`         | Durable Object | the site itself: PHP, Drupal and the SQLite database    |
| `RENDER_LANES` | Durable Object | image style rendering, done at upload time              |
| `ASSETS`       | Workers Assets | Drupal's core files, the packed database and themes     |
| `CONFIG_KV`    | KV             | the runtime settings you change without a redeploy      |
| `PAGE_KV`      | KV             | stored pages shared across Cloudflare locations         |
| `FLEET_DB`     | D1             | an inventory of your sites, useful once you run several |

R2 file storage is optional and left out of the default deploy, because an account has to enable R2
in the dashboard before a bucket can exist.

## 🚀 1. Deploy

Press the button and follow Cloudflare's prompts: name the repository and the worker, and let it
connect to GitHub. The build step downloads the generated Drupal tree and the PHP interpreter, then
uploads them as the worker's assets.

:deploy-button

Prefer a terminal? `drangler deploy`, or clone the repository and run `bun install`,
`bun run hydrate` and `bun run deploy`. The [self-managed page](/self-managed) has all three routes.

## ⏳ 2. Wait for the First Boot

A new site is an empty Durable Object until someone asks it for a page. The first visit starts
unpacking the database and shows a page that refreshes itself; a real Drupal page answers within
seconds of the deploy. A `503` with the body `migrating` in that window means the site is
starting, not that the deploy failed. The `x-cfw-migrate` response header shows progress as
`<chunk>/<chunks>`.

## 🔑 3. Claim the Site

The packed database is already installed, so Drupal's installer never runs. Claiming the site is
what sets the administrator account. Open the site in a browser and the claim page asks for a site
name, an administrator email and, optionally, a password.

From a terminal instead:

```sh
curl -X POST "https://my-site.example/firstrun" \
  -H 'content-type: application/json' \
  -d '{"siteName":"My Site","adminMail":"you@example.com"}'
```

The response carries `adminPass` and `ownerToken`. **Each is shown once and stored nowhere you can
read it back.** Save both before closing the tab. Pass `"adminPass"` in the body to choose your own
password. The body also accepts `siteMail`, `adminName` and `timezone`.

::tip
Claim from the domain you intend to keep. Claiming pins the address Drupal builds every absolute URL
against: canonical tags, redirects and password-reset links.
::

## 👤 4. Log In

Log in at `/user/login` as `admin` with the password from the claim. That account is the only one
that reaches Drupal's administration pages.

The owner token is a different credential. It signs you in to the Drupflare pages at `/_cfw/login`,
and it authorises these routes when sent as `Authorization: Bearer <ownerToken>`:

| Route         | What it does                                         |
| ------------- | ---------------------------------------------------- |
| `/export`     | downloads the whole site database                    |
| `/health`     | the health ledger, repair state and budget forecasts |
| `/settings`   | reads and changes the runtime levers                 |
| `/setup/mail` | sets up a sending domain for outgoing mail           |
| `/setup/oidc` | sets the OpenID Connect issuer and client id         |

## 🌐 5. Use Your Own Domain

In the Cloudflare dashboard, open your worker, go to **Settings**, then **Domains & Routes**, and add
a custom domain. Cloudflare issues the certificate.

If you claimed the site on the `workers.dev` address first, set the `SITE_ORIGIN` variable to your
domain, for example `https://www.example.org`, and redeploy. `SITE_ORIGIN` always wins over the
pinned address.

## 💳 6. Choose Free or Paid

On the free plan, one Cloudflare account serves 3.04 million views a month across all its
sites, with a daily budget for re-rendering pages after content changes that comfortably covers
small and medium sites. Quotas are shared across the account and reset at midnight UTC.

The $5 Workers Paid plan raises those limits and keeps sites warm, so visitors rarely wait for a
cold start. After upgrading, set `PLAN` to `paid` in `wrangler.jsonc` and redeploy. `PLAN` is not
changeable at runtime on purpose, because it selects the whole limits profile.

Warming is a runtime setting you can change without a redeploy:

```sh
curl -X PUT "https://my-site.example/settings" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H 'content-type: application/json' \
  -d '{"SITE_WARM":"1","WARM_INTERVAL_MS":"30000"}'
```

A `GET` on `/settings` lists every lever with the value in force and where it came from.

## ✉️ 7. Mail, Sign-On and Redis

- **Mail:** `/setup/mail` onboards a sending domain. The `smtp` module is verified if you already
  have a mail provider.
- **Single sign-on:** `/setup/oidc` sets the OpenID Connect issuer and client id. The
  `openid_connect` module completes logins through its own client.
- **Redis:** store the connection string as a secret with `bunx wrangler secret put REDIS_URL`, as
  `redis://user:pass@host:6379/0` or `rediss://` for TLS. The site's own SQLite is still the faster
  cache; Redis is there for setups that already depend on it.

## 🧩 8. Install Modules

There are three ways in, depending on where the module comes from.

**From drupal.org or Packagist**, with drangler. It checks the package against the shipped Drupal
versions, installs it and its dependencies, and turns it on:

```sh
drangler modify require drupal/pathauto drupal/metatag --enable
```

The same steps are plain HTTP routes if you would rather script them with the owner token:
`/installable?module=pathauto` checks, `/install?module=pathauto` installs, and
`/enable?module=pathauto` turns it on through Drupal's own installer. Installing and enabling are
separate on purpose, because a package whose files have landed is not yet a module Drupal knows.

**A module you wrote** arrives through `drangler modify` (next section) or a git remote.

**Before you pick a module**, the [fixtures page](/fixtures) lists every module that has been
verified on a real Drupflare site and says exactly how each one was checked.

## 🧑‍💻 9. Contribute Code

drangler develops a custom module or theme against a real site, locally or deployed, one revision at
a time. Every upload is checked by booting Drupal before it goes live, so a module that would fatal
is rolled back automatically.

```sh
cd ~/work/my_module
drangler modify init --site https://my-site.example
drangler modify check --php php
drangler modify upload --message "add the event listing"
```

The common cases:

- **Iterate locally:** `drangler dev --modify .` runs a local Drupal site with your module mounted
  and re-uploads on every change.
- **Ship a release:** `drangler modify release --tag v1.2.0` uploads from a tagged commit and refuses
  a dirty working tree.
- **Undo a bad change:** `drangler modify rollback --yes` puts the previous revision back instantly.
  The last five revisions are kept, and `drangler modify revisions` lists them.
- **Review before sending:** `drangler modify diff` shows which files would change, and
  `drangler modify status` compares the site with your disk.
- **Deploy from git:** a site can pull a module straight from a git remote, at a branch or a commit,
  with the same boot check and rollback.

To contribute to Drupflare itself, every piece is on [GitHub](https://github.com/drupflare), with
its own tests. The worker, the Drupal module, the database driver and drangler each take pull
requests.

## 🛠️ 10. Maintain the Site

Most upkeep happens on its own. What is left for you is short.

**What runs by itself:** Drupal's cron runs on a schedule inside the site. Pages that change are
re-rendered in the background, so visitors keep getting a stored copy. When a new release fixes
something inside the packed Drupal, existing sites apply it through reconciliation, one step at a
time, checking each step before and after.

**Updating Drupflare.** The deploy button created a copy of the worker, so add the original as a
remote once and merge releases from it:

```sh
git remote add template https://github.com/drupflare/worker
git fetch --all
git merge template --allow-unrelated-histories -m "chore: merge upstream"
```

Pushing the merge deploys it when the repository is connected to Cloudflare. `drangler update
my-site` updates the checkout and deploys in one step, and `drangler site upgrade my-site` deploys,
waits for the site to pick up the new release, and then runs Drupal's database updates.

**Database updates on their own:** `drangler site updb my-site` shows Drupal's update chain and runs
it one step at a time. Running several steps at once asks you to name a snapshot directory first,
and a run that halts waits for you to roll it back or accept it rather than retrying on its own.

**Checking on it:**

```sh
drangler status my-site.example     # what is deployed, and whether it is claimed
drangler health my-site.example     # is it serving, and from which cache tier
drangler reconcile my-site.example  # what the site still owes the current release
drangler heal my-site.example       # any repairs the site is holding, and why
```

**Clearing caches:** `drangler site invalidate` purges stored pages by cache tag, or retires them all
at once, when you need a change to show everywhere immediately.

**Backups, and leaving whenever you like:**

```sh
curl -H "Authorization: Bearer $OWNER_TOKEN" "https://my-site.example/export" -o site.sqlite
```

The dump is the whole site database. It withholds the owner token and the hash salt unless you add
`?secrets=1`, which a full restore needs. `drangler migrate export` does the same from the command line,
and `drangler migrate convert` turns the dump into MySQL for a conventional host.

## 🩺 When Something Looks Wrong

- **`503 migrating`** right after a deploy is the first boot. Wait a few seconds.
- **The site went read-only** on the free plan: the account spent its daily write budget. It resets
  at midnight UTC; the paid plan raises it.
- **Lost the admin password:** use Drupal's password reset, which needs mail set up.
- **Lost the owner token:** set `PW_DIAGNOSTICS=1`, then `POST /firstrun?force=1` returns the stored
  token and resets the admin password.
- **Not sure what is running:** `drangler status my-site.example` reads the deployed version and
  claim state from one public request, and `drangler health` says which cache tier answered.
