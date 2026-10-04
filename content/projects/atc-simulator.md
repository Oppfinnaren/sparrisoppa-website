---
title: "ATC Simulator"
date: 2026-01-01
weight: 3
description: "A Claude skill that runs a realistic, text-based air traffic control game."
stack: "Claude skill"
featured: true
home_title: "ATC Simulator, a text-based ATC game"
links:
  - name: "Download atc.zip"
    url: "https://github.com/sparrisoppa/atc-skill/releases/latest/download/atc.zip"
  - name: "Source on GitHub"
    url: "https://github.com/sparrisoppa/atc-skill"
---

ATC Simulator is a Claude skill that creates a realistic, text-based air traffic control game. It throws different situations at you, and you decide what to do.

## Try it

**In Claude** (web, desktop or mobile): download [atc.zip](https://github.com/sparrisoppa/atc-skill/releases/latest/download/atc.zip), then open Settings → Capabilities → Skills, choose Upload skill and pick the file. Start a new chat and type `/atc`.

**In Claude Code:**

```
/plugin marketplace add sparrisoppa/atc-skill
/plugin install atc@atc-skill
```

Then type `/atc:atc` to start.

In both, you can add a position and a scenario after the command, for example `ESSA_TWR winter evening, snow showers`.
