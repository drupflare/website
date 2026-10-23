---
title: Why
headline: Why Drupflare
description: Up to 10,037x cheaper to run, 6.35x faster on the same continent, and up to 99.99% less energy than a production Drupal deployment.
intro: >-
  A Drupal site is usually a server that runs all day for visitors who come a few times an hour.
  Drupflare runs the same site only while someone is asking for a page, from the Cloudflare location
  nearest to them. Almost everything below follows from that.
---

::claim{emoji="💸" figure="10,037x" title="Cheaper to Run"}
Across a fleet, a Drupflare site costs about **0.6 cents a month** in infrastructure. A VPS that answers visitors from nearby needs a server in each of three regions behind a load balancer, which is **$58.20 a month** per site. For 1,000 sites with 10,000 views each, that is **$58,200 a month** against **$5.80** for Drupflare, a **10,037x difference** before anyone has written a line of code. Against Pantheon Basic, the same thousand sites would be $41,667 a month, a :pitch[7,186x difference].

On your own Cloudflare account there is no per-site fee at all. The free plan covers **3.04 million
views a month**, shared across every site you run. Past that, the $5 Workers Paid plan carries a
thousand sites of 10,000 views each for :pitch[$5.80 a month].

| 1,000 Sites, 10,000 Views Each | Per Month |
| ------------------------------ | --------- |
| Drupflare, your own account    | $5.80     |
| One small VPS per site         | $10,500   |
| Three-region VPS per site      | $58,200   |
| Pantheon Basic                 | $41,667   |

::

::claim{emoji="🌍" figure="6.35x" title="Faster on the Same Continent"}
A VPS answers from one region. Drupflare answers from the Cloudflare location nearest each visitor.
Anyone on the same continent as your server gets their page **6.35x faster**, and the gap keeps
growing with distance, up to :pitch[23.09x] on the far side of the world.

| The Visitor is               | Faster by |
| ---------------------------- | --------- |
| in the VPS's own datacenter  | 1.50x     |
| on the same continent        | 6.35x     |
| one ocean away               | 11.32x    |
| on the far side of the world | 23.09x    |

::

::claim{emoji="📈" figure="12.25x" title="Steadier Under Load"}
On the same machine, serving the same Drupal site, a cached page's slowest 5% came back
:pitch[12.25x faster] on Drupflare than on nginx with PHP-FPM, 4 ms against 49, and with 32 visitors at
once Drupflare answered :pitch[3.59x as many requests a second], 438 against 122.

The interpreter starts in a few milliseconds, and a logged-in editor is served from a compiled plan
that skips the render entirely once their session settles.
::

## ⚡ Why It Is Faster

Most Drupal hosting puts every visitor on a long trip to one server, which then asks a separate
database for the page. Drupflare removes both trips.

- **It answers next door.** The site runs in the Cloudflare location nearest each visitor instead of
  one datacenter, so the network round trip that dominates a normal page load mostly disappears.
- **The database lives inside the site.** Each site's SQLite sits in the same Durable Object as PHP.
  A query is a function call, not a connection to another machine.
- **PHP never cold-starts per request.** The interpreter loads once and serves request after
  request. A fresh isolate starts it in **5 ms**.
- **Most visitors never reach PHP.** Published pages are stored and served straight from cache, and
  re-rendered in the background when content changes.
- **It scales out on its own.** When logged-in traffic starts to queue, the site adds read
  replicas: full copies of itself that answer in parallel from their own database. Sixteen replicas
  serve :pitch[4.74x the traffic] of a single copy, and the median wait falls 24.8x at 64 concurrent
  visitors. Nobody resizes a server.
- **Editors get the fast path too.** A logged-in session is answered from a plan compiled after its
  first few requests: `/admin/content` in **5 ms**, where nginx with PHP-FPM took 71 ms on the same
  machine.

The result is a Drupal site that :pitch[behaves like a static one for visitors] and stays fully dynamic
for the people editing it.

::claim{emoji="🌱" figure="99.99%" title="Less Energy"}
A conventional host draws power all day whether anyone visits or not, and production Drupal is
usually sized for its busiest hour. A Drupflare site uses a processor only while it answers a
request. When nobody is visiting, it holds no compute at all.

Against three regions with a high-availability pair in each, sized for peak, that is **99.99% less
energy** (modelled): 390 kWh a year for the servers against :pitch[under 0.1 kWh] for Drupflare at a million
views a month, logged-in visitors included. In total, that is 21,355x less energy at a million views
a month and :pitch[up to 742,503x less energy] at 10,000, where the same servers spread their idle draw over
far fewer visitors. Each site avoids about **150 kg of CO2e** and **1.9 kL of water** a year (derived). A
logged-in editor's admin page takes :pitch[a third less energy] per view (measured).

Those figures stop at the data centre. On the visitor's side, a repeat view answered by spool uses
0.53 J on a desktop processor against 1.29 J without it (measured), and the two are kept apart
because one is a measured package reading and the other a model of server CPU time.

The fleet comparison is smaller and still large: for a thousand sites of 10,000 views each, **99.97%
less energy** than consolidated shared hosting behind a CDN, with :pitch[701 kg of CO2] avoided a
year on the average US grid and :pitch[8,989 litres of water] (derived).
::

::claim{emoji="📱" figure="0" title="Requests on a Repeat View"}
Drupflare ships a small service worker, spool, that keeps a copy of the pages a visitor has seen and
answers their repeat views on the device. On two deployed sites that differed only in spool, :pitch[48 of 48
repeat views made no network request], against one to six without it (measured). A repeat view used
**0.53 J** on a desktop processor against 1.29 J (measured), and a first view of a page with an image,
a video and an embedded player used 12.9 J against 32.8 J, almost all of it saved by swapping the
embed for a click-to-load facade (measured, one synthetic page, a desktop and not a phone).

It costs the server about 5 ms of CPU to decorate a page, and each new visitor adds about two requests
(measured, derived). Whether that lowers a site's request count depends on how many pages a visitor
reads: at half their views answered locally, spool breaks even at four views per visitor
(derived, modelled), and a short visit costs the Worker more requests, not fewer. Spool is on for
paid sites and off for free ones, and the [impact report](https://docs.drupflare.com/impact.html)
shows the rows behind each figure and where they do not move.
::

::claim{emoji="🧩" figure="65+" title="Contrib Modules Verified"}
This is Drupal 11 on PHP 8.5, with every extension Drupal needs. Webform, Paragraphs, Search API,
Metatag, Pathauto, OpenID Connect, Redis and dozens more are :pitch[verified by enabling them on a live site]
and checking what they do, and the list grows every release. The [fixtures page](/fixtures) lists
every one, with how it was checked.

Existing sites can move over with drangler, which surveys the site first and tells you what will
break before you start. Leaving is just as easy: every site exports its own database.
::

::claim{emoji="🛠️" figure="0" title="Servers to Patch"}
There is no operating system, web server or PHP-FPM pool to keep up to date. Cloudflare runs the
platform, and :pitch[a site you are not using costs nothing to keep]. When logged-in traffic grows, read
replicas spread it across more objects without anyone reconfiguring anything.
::

## 🏰 Your Own Servers, Too

Some sites cannot live on a public cloud: data-residency rules, a campus network, a contract that
names the hardware. [bastion](https://github.com/drupflare/bastion) runs :pitch[the same Drupflare release on your own Linux servers] as one binary, with the TLS, per-tenant limits up to a microVM each,
storage, tested backups and metrics that Cloudflare would otherwise provide. Its test suite serves
the released site unmodified. The [how-to guide](/how-to#on-your-own-servers) has the setup.

## 🧭 And It Does Not Stop at Drupal

The runtime underneath is not specific to Drupal. :pitch[WordPress and Joomla are next], followed by other
Workers apps such as [nuxtpress](https://github.com/gmitch215/nuxtpress),
[MyLoRA](https://github.com/gmitch215/MyLoRA) and [smoke](https://github.com/earth-app/smoke), and
your own Worker templates deployed beside your CMS sites. Further out,
[gmux](https://github.com/gmitch215/gmux) puts a real Linux machine behind a site.

## 🔎 Where the Numbers Come From

Speed figures are :pitch[measured on deployed Cloudflare Workers] and against nginx with PHP-FPM 8.5 serving
the same Drupal tree and database. Cost, energy, carbon and water are derived from those measurements
and from published prices and grid factors. The best case is the headline; the method, the ranges and
the cases where a VPS wins are in the
[impact report](https://docs.drupflare.com/impact.html), the
[technical report](https://docs.drupflare.com/technical-report.html) and the
[README](https://github.com/drupflare/worker#readme).

:deploy-button
