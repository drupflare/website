---
title: Why
headline: Why Drupflare
description: Up to 1,500x cheaper to run, 6.35x faster on the same continent, and up to 99.95% less energy than conventional Drupal hosting.
intro: >-
  A Drupal site is usually a server that runs all day for visitors who come a few times an hour.
  Drupflare runs the same site only while someone is asking for a page, from the Cloudflare location
  nearest to them. Almost everything below follows from that.
---

::claim{emoji="💸" figure="1,500x" title="Cheaper to Run"}
Across a fleet, a Drupflare site costs about 2.8 cents a month in infrastructure. Pantheon lists its
Basic plan at $500 a year per site, about $41.67 a month. That is roughly a **1,500x difference** before anyone has written
a line of code.

On your own Cloudflare account there is no per-site fee at all. The free plan covers 3.04 million
views a month, shared across every site you run. Past that, the $5 Workers Paid plan carries a
thousand sites of 10,000 views each for $5.80 a month. The same thousand sites on Pantheon Basic would be
$41,667.

| 1,000 Sites, 10,000 Views Each | Per Month |
| ------------------------------ | --------- |
| Drupflare, your own account    | $5.80     |
| One small VPS per site         | $5,000    |
| Pantheon Basic                 | $41,667   |

::

::claim{emoji="🌍" figure="6.35x" title="Faster on the Same Continent"}
A VPS answers from one region. Drupflare answers from the Cloudflare location nearest each visitor.
Anyone on the same continent as your server gets their page **6.35x faster**, and the gap keeps
growing with distance, up to 23.09x on the far side of the world.

| The Visitor is               | Faster by |
| ---------------------------- | --------- |
| in the VPS's own datacenter  | 1.50x     |
| on the same continent        | 6.35x     |
| one ocean away               | 11.32x    |
| on the far side of the world | 23.09x    |

::

::claim{emoji="📈" figure="12.25x" title="Steadier Under Load"}
On the same machine, serving the same Drupal site, a cached page's slowest 5% came back
**12.25x faster** on Drupflare than on nginx with PHP-FPM, 4 ms against 49, and with 32 visitors at
once Drupflare answered 3.59x as many requests a second, 438 against 122.

The interpreter starts in a few milliseconds, and a logged-in editor is served from a compiled plan
that skips the render entirely once their session settles.
::

::claim{emoji="🌱" figure="99.95%" title="Less Energy"}
A conventional host draws power all day whether anyone visits or not, and most small sites are idle
almost all the time. A Drupflare site uses a processor only while it answers a request. When nobody
is visiting, it holds no compute at all.

For a thousand sites of 10,000 views each, that is **99.95% less energy** than consolidated shared
hosting behind a CDN: 703 kg of CO2 avoided a year on the average US grid, and 9,010 litres of water.
::

::claim{emoji="🧩" figure="65+" title="Contrib Modules Verified"}
This is Drupal 11 on PHP 8.5, with every extension Drupal needs. Webform, Paragraphs, Search API,
Metatag, Pathauto, OpenID Connect, Redis and dozens more are verified by enabling them on a live site
and checking what they do, and the list grows every release. The [fixtures page](/fixtures) lists
every one, with how it was checked.

Existing sites can move over with drangler, which surveys the site first and tells you what will
break before you start. Leaving is just as easy: every site exports its own database.
::

::claim{emoji="🛠️" figure="0" title="Servers to Patch"}
There is no operating system, web server or PHP-FPM pool to keep up to date. Cloudflare runs the
platform, and a site you are not using costs nothing to keep. When logged-in traffic grows, read
replicas spread it across more objects without anyone reconfiguring anything.
::

## 🧭 And It Does Not Stop at Drupal

The runtime underneath is not specific to Drupal. WordPress and Joomla are next, followed by other
Workers apps such as [nuxtpress](https://github.com/gmitch215/nuxtpress),
[MyLoRA](https://github.com/gmitch215/MyLoRA) and [smoke](https://github.com/earth-app/smoke), and
your own Worker templates deployed beside your CMS sites. Further out,
[gmux](https://github.com/gmitch215/gmux) puts a real Linux machine behind a site.

## 🔎 Where the Numbers Come From

Speed figures are measured on deployed Cloudflare Workers and against nginx with PHP-FPM 8.5 serving
the same Drupal tree and database. Cost, energy, carbon and water are derived from those measurements
and from published prices and grid factors. The best case is the headline; the method, the ranges and
the cases where a VPS wins are in the
[impact report](https://github.com/drupflare/worker/blob/master/docs/impact.md), the
[technical report](https://github.com/drupflare/worker/blob/master/TECHNICAL_REPORT.md) and the
[README](https://github.com/drupflare/worker#readme).

:deploy-button
