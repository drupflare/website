---
title: ''
description: Drupal on Cloudflare Workers. No servers, no containers, no origin.
headline: Drupal,
accent: Minus the Server
intro: >-
  Drupflare runs an unmodified Drupal 11 site on Cloudflare Workers. PHP 8.5 runs as WebAssembly
  inside a Durable Object, and the site's database lives in that object's own SQLite. There is no
  machine to patch, nothing sits idle waiting for visitors, and it starts on Cloudflare's free plan.
stats:
  - emoji: 💸
    value: 1,500x
    label: cheaper to run than managed Drupal hosting
  - emoji: 🌍
    value: 6.35x
    label: faster than a VPS on the same continent, up to 23.09x worldwide
  - emoji: 🆓
    value: 3.04M
    label: views a month on Cloudflare's free plan
  - emoji: 🌱
    value: 99.99%
    label: less energy than a multi-region production deployment, modelled
repos:
  - emoji: ⛱️
    name: worker
    blurb: The deployable site. One click, your Cloudflare account.
  - emoji: ⚙️
    name: drangler
    blurb: 'The CLI: deploy, migrate an existing site on or off, develop a module.'
  - emoji: 🗜️
    name: drupflare
    blurb: The Drupal module that bridges Drupal to the Workers runtime.
  - emoji: ☁️
    name: rom
    blurb: The database driver, Durable Object SQLite behind Drupal.
  - emoji: 🧰
    name: phasm
    blurb: PHP 8.5 compiled to WebAssembly for workerd.
  - emoji: 🏰
    name: bastion
    blurb: The same sites on your own Linux servers.
coming:
  - emoji: 📝
    name: WordPress
    blurb: Unmodified WordPress, with its database running on the site's own SQLite.
    when: Next
  - emoji: 🧱
    name: Joomla
    blurb: Joomla's front end, administrator and API, served the same way.
    when: Next
  - emoji: 🧩
    name: Custom Workers
    blurb: Your own Worker templates, deployed beside your CMS sites from one dashboard.
    when: Next
  - emoji: 📰
    name: nuxtpress
    blurb: Blogging on Workers, with posts stored in KV and D1 instead of git commits.
    url: https://github.com/gmitch215/nuxtpress
    when: Next
  - emoji: 🧠
    name: MyLoRA
    blurb: A control plane for fine-tuning LoRA adapters, driven from a Workers UI.
    url: https://github.com/gmitch215/MyLoRA
    when: Next
  - emoji: 💬
    name: smoke
    blurb: A self-hostable support desk whose tickets only the operator can read.
    url: https://github.com/earth-app/smoke
    when: Next
  - emoji: 🐧
    name: gmux
    blurb: A real Linux machine per site, running inside a Worker deployment.
    url: https://github.com/gmitch215/gmux
    when: Later
---

We will run your sites for you: upgrades, backups, a dashboard, and a person to call when something
breaks. :pitch[Your site stays ordinary Drupal the whole time], so you can take it with you whenever you
like.

Until then, every piece is open source and deploys to your own Cloudflare account today.
