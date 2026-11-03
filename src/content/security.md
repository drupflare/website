---
title: Security
description: What running Drupal in WebAssembly on Cloudflare Workers removes from the attack surface, and the evidence for each claim.
headline: What Changes When Drupal Has No Server
intro: >-
  A bug in Drupal still compromises a Drupal site. What changes is what the attacker gets next.
  On a conventional host that is a shell on an operating system. Here it is a PHP interpreter inside
  three sandboxes, with no operating system to explore.
---

::claim{emoji="🧱" figure="3" title="Sandboxes Around PHP"}
PHP runs as WebAssembly, so it can reach the outside only through the functions the host hands it.
The WebAssembly runs inside a V8 isolate. The isolate runs inside Cloudflare's process sandbox,
which :pitch[uses Linux namespaces and seccomp to prohibit all access to the filesystem and network],
in Cloudflare's own words. There is no web server, PHP-FPM pool, SSH daemon or inbound socket in the
site's trust boundary, and the interpreter's `posix_spawnp` aborts, so PHP has no process to start.

Cloudflare's security model page describes the outer layers. The Drupflare side is read from the
shipping interpreter's glue and its list of imports.
::

::claim{emoji="🗺️" figure="12" title="Attack Classes Removed"}
We mapped 24 published vulnerabilities and incident classes, from Drupalgeddon to PHP-FPM, Shellshock,
container escapes and PHP2Shell. :pitch[Twelve need a component a Drupflare site does not have], four
more are contained by the sandbox, and eight work as they do on any host. The verdicts are inferred
from the architecture, and the map, with advisories and sources, is in the docs.
::

::claim{emoji="⏱️" figure="<24h" title="Cloudflare's Stated V8 Patch Gap"}
Cloudflare states that :pitch[the Workers patch gap is under 24 hours]: the time from a published V8
fix to its deployment across Workers. That covers the platform runtime. Drupal core and the PHP
interpreter are patched through Drupflare releases, which is a separate and slower path.
::

::claim{emoji="⏪" figure="30" title="Days of Point-in-Time Recovery"}
A deployed site is a SQLite-backed Durable Object, and :pitch[it can be restored to any point in the
past 30 days], with an undo bookmark for the restore. An export dump leaves the platform for the
case where the object itself is gone. [Recovery](https://docs.drupflare.com/operating/recovery.html) says
which of the four primitives answers which failure.
::

## 🧭 What It Removes

Each row is an attack that needs something a Drupflare site does not contain. The full map has all
24 rows, with advisories, dates and sources, on the
[security page of the docs](https://docs.drupflare.com/security/index.html).

| Attack                                         | Needs                                                                           | On Drupflare                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| PHP-FPM behind nginx, CVE-2019-11043           | A FastCGI process manager and a web server                                      | Neither exists                                                               |
| PHP-CGI on Windows, CVE-2024-4577              | The CGI interface on Windows with Apache                                        | Neither exists                                                               |
| Shellshock, CVE-2014-6271                      | Bash reached through CGI                                                        | No shell and no CGI                                                          |
| Apache path traversal, CVE-2021-41773          | Apache 2.4.49 and a filesystem to traverse                                      | Neither exists                                                               |
| ImageMagick delegates, CVE-2016-3714           | A shell for the delegate to call                                                | No shell, and image work runs in JS                                          |
| Container and kernel escapes                   | A process on a shared Linux kernel                                              | That kernel belongs to the platform                                          |
| PHP SoapServer use-after-free, CVE-2026-7261   | The `soap` extension                                                            | Not compiled into the interpreter                                            |
| PHP2Shell, CVE-2026-109618 and CVE-2026-109619 | A request startup and shutdown on every request, and an enforced `memory_limit` | Neither exists: PHP runs inside one retained request on the system allocator |

The interpreter has a short extension list: `soap`, `phar`, `intl`, `gd`, `openssl`, `exif` and
`sqlite` are not in it. An extension that is not compiled in has no bug for anyone to reach.

## 🔎 Where the Evidence Comes From

Every claim on the [security page of the docs](https://docs.drupflare.com/security/index.html) says how
we know it: read from a source, measured by a named test, or inferred from the architecture. Every
row ends as removed, contained or open, and a claim we could not establish counts as open. The sources
are Cloudflare's security documentation, the PHP and Drupal advisories and NVD records. The docs also
cover what the architecture leaves in place, such as application bugs and shared platform risk, so a
reviewer can weigh both sides.

## 🔐 Hardened Past the Sandbox

The sandbox stops most attacks before they start. The rest of the hardening assumes an attacker
already has a foothold in PHP and closes the ways to dig in or reach further. We rate 19 attack
classes before and after: 4 move from open to removed, 13 to contained, and 2 stay open.

- **Your owner token can't be read from the database.** Only its SHA-256 is kept, in storage SQL
  can't reach, and recovery rotates the token.
- **Planted code gets caught.** Each module file and the interpreter's saved memory image are checked
  against sealed SHA-256 records before they run. A mismatch boots the site from the pack instead.
- **Owner actions leave a trail.** Every call is written to a hash-chained log that
  `drangler audit --verify` recomputes.
- **Pages don't leak between visitors.** A page whose response varies by `Accept`, `Origin` or
  `User-Agent` is never stored, and the security headers a module sets are replayed on every cache tier.
- **PHP stays inside the box.** It can't open a raw socket or call a JavaScript global, and the
  outbound guard refuses private addresses in every spelling. A tenant can't switch it off.
- **Installs are checked.** drupal.org archives are verified against their published digests before
  they install, and a Content-Security-Policy baseline guards against framing (report-only by default
  on paid sites).
- **PHP2Shell is patched.** The interpreter runs PHP 8.5.12, which carries the fix.

Three things aren't covered yet, and the docs list them: a Drupal admin can remove the
Content-Security-Policy baseline through the `RESPONSE_HEADERS` setting, a planted row on a read
replica lane isn't checked, and Packagist installs aren't digest-verified.

To report a vulnerability, use the private reporting link in the
[security policy](https://github.com/drupflare/worker/security/policy) and not a public issue.

:deploy-button
