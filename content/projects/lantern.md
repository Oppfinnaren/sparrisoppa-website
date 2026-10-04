---
title: "Lantern"
date: 2026-03-01
description: "A local-first notes app that syncs when it can."
status: "in progress"
role: "Design, code"
stack: ["Rust", "SQLite"]
featured: true
home_title: "Lantern, a local-first notes app"
# Links shown under the text. Any number, any names.
links:
  - name: "Source on GitHub"
    url: "https://github.com/yourname/lantern"
  - name: "Write-up"
    url: "/writing/small-tools-long-lives/"
---

Lantern started as a way to keep notes on a train with no signal. Every note lives in a local database first, and changes merge in the background once a connection returns.

{{< figure placeholder="screenshot or diagram" caption="Fig. 1, the sync model" >}}

## Approach

Conflicts are resolved per paragraph rather than per document. This keeps edits from two devices readable and makes the history easy to inspect.
