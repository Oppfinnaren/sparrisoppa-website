---
title: "ATC Simulator"
date: 2026-01-01
weight: 3
description: "A Claude skill that runs a realistic, text-based air traffic control game."
stack: "Claude skill"
featured: true
home_title: "ATC Simulator, a text-based air traffic control game"
links:
  - name: "Download atc.zip"
    url: "https://github.com/sparrisoppa/atc-skill/releases/latest/download/atc.zip"
  - name: "Source on GitHub"
    url: "https://github.com/sparrisoppa/atc-skill"
---

ATC Simulator is a Claude skill that creates a realistic, text-based air traffic control game. It throws different situations at you, and you decide what to do.

## What it looks like

An excerpt from a game at Stockholm Arlanda, playing the tower:

> **SK1417:** "Cleared for take-off 19R, traffic Cessna in the circuit, Scandinavian 1417."
>
> **+0:50**
>
> *SK1417 starts its roll. The Cessna is turning base.*
>
> **SE-MKL:** "SE-MKL, base 19R."
>
> **+1:25**
>
> *Airborne. Then you see a smoke trail from the right engine. The aircraft yaws and climbs slowly.*
>
> **SK1417:** "Mayday, mayday, mayday, Arlanda Tower, Scandinavian 1417, engine failure, right engine, passing 600 feet, continuing straight ahead. Request return and landing 19R. We need a few minutes. Stand by."
>
> *FIN7XA is on 5 NM final and SE-MKL is on base, about 1 minute from final.*
>
> ```
> 1010Z | Wind 190/09 | QNH 1013 | RWY 19R ARR/DEP (19L closed)
> SK1417  A320 IFR  MAYDAY, R engine failure, 600 ft, straight ahead  wants to return to 19R
> FIN7XA  A320 IFR  5 NM final 19R                                    not yet cleared to land
> SE-MKL  C172 VFR  base 19R, touch-and-go                            not yet cleared
> NAX4HC  B738 IFR  ~13 NM final 19R                                  with Approach
> ```
>
> **SK1417 has called Mayday. What is your first transmission?**

You then pick one of four transmissions, or write your own, and the game tells you whether it was right and why.

## Try it

**In Claude** (web, desktop or mobile): download [atc.zip](https://github.com/sparrisoppa/atc-skill/releases/latest/download/atc.zip), then open Settings → Capabilities → Skills, choose Upload skill and pick the file. Start a new chat and type `/atc`.

**In Claude Code:**

```
/plugin marketplace add sparrisoppa/atc-skill
/plugin install atc@atc-skill
```

Then type `/atc:atc` to start.

In both, you can add a position and a scenario after the command, for example `ESSA_TWR winter evening, snow showers`.
