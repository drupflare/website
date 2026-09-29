---
title: Self-Managed
description: Deploy Drupflare to your own Cloudflare account in one click, with the CLI, or by hand.
headline: Run It on Your Own Account
intro: >-
  Self-managed Drupflare deploys to your Cloudflare account, so the site, its database and the bill
  are all yours. The free plan is enough to start. Pick whichever of the three routes suits you;
  they end in the same place.
---

## 🖱️ One Click

The button creates a copy of the worker in your GitHub account, creates the Durable Object and the
other bindings on your Cloudflare account, and deploys it. You need a Cloudflare account and a GitHub
account, and nothing installed locally.

:deploy-button

## ⚙️ The drangler CLI

drangler clones the worker, downloads the Drupal tree and the PHP interpreter, and deploys it. It
needs `wrangler` and `ssh` on your machine; `drangler doctor` tells you what is missing.

```sh
bun add -g @drupflare/drangler
# or
npm i -g @drupflare/drangler
```

Try it locally first if you like. `drangler dev` runs a real Drupal site on your machine. When you
are happy with it:

```sh
drangler deploy
drangler site claim my-site.example
```

## 🧑‍💻 By Hand

Full control, and the route to take if you want to change the worker itself. You need
[Bun](https://bun.sh), Node 24 or newer, and a Cloudflare account signed in with
`bunx wrangler login`.

```sh
git clone https://github.com/drupflare/worker.git
cd worker
bun install
bun run hydrate
bun run deploy
```

`bun run hydrate` downloads the generated Drupal tree and the interpreter, which a clean clone does
not carry. `bun run dev` serves it on localhost first if you want to look before deploying.

## ✅ After the Deploy

1. Open the site. The first visit unpacks the database, shows a short starting page, and lands on
   Drupal a few seconds later.
2. Claim it. The site asks for a name and an administrator email, then shows the admin password and
   an owner token once. Save both; neither is stored anywhere you can recover it from.
3. Log in at `/user/login` as `admin`. From here it is ordinary Drupal.

## 🚚 Moving a Site You Already Have

drangler reads an existing Drupal install over SSH and plans the move before anything changes.

```sh
drangler migrate survey --host deploy@old.example --root /var/www/html --out survey.json
drangler migrate plan --survey survey.json --to workers
```

## 💳 Free or Paid?

Both work. The $5 Workers Paid plan raises the daily limits and keeps sites warm by default, so
visitors rarely wait on a cold start. The [how-to guide](/how-to) covers each step in detail, and
the [worker README](https://github.com/drupflare/worker#readme) documents every setting.
