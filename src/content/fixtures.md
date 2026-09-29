---
title: Fixtures
description: Every Drupal module and production codebase Drupflare is tested against, and exactly how each one is verified.
headline: Tested Against Real Drupal
intro: >-
  A claim of compatibility is only as good as the test behind it. Every module and codebase on this
  page is checked by enabling or converting it on a real Drupflare site and asserting what it does,
  never by reading its source and guessing.
---

## 🔬 How a Module Is Verified

A contrib module is **verified** only when a test has enabled it on a real Drupflare site and checked
something the module itself owns: its field types are registered, its routes answer, its services
resolve, its forms submit. The note under each module below says exactly what was checked.

A module that has not had that test is **untested**, even when there is every reason to expect it
works. Nothing is marked verified from reading code or from a similar module passing.

## 🏗️ How a Production Codebase Is Verified

The codebases below are real Drupal sites, distributions and module suites from government, higher
education, non-profits and product teams, each pinned to an exact commit. Two test lanes run them on
every release:

- **The fixture lane** clones each codebase at its pinned commit, loads it into a Drupflare site, and
  checks thirteen capabilities: install, container build, anonymous and logged-in pages, content
  create and edit, form submission, files, queues and cron, outbound HTTP, updates, cache rebuilds,
  config import, and the codebase's own workflow.
- **The conversion lane** starts the codebase on a conventional PHP server in Docker, moves it onto
  Drupflare with `drangler preview`, and checks the copy against the original.

Each capability is recorded as it happened: running normally, running through a Drupflare adapter,
running in a reduced form with the reason written down, or not supported. A codebase is marked
**verified** only when every capability passed on its pinned commit. Until a lane has run, it is
listed as **pending**, not assumed.
