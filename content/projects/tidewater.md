---
title: "Tidewater"
date: 2025-09-01
description: "A distributed build cache for monorepos."
status: "maintained"
role: "Code"
stack: ["Go", "S3"]
featured: true
home_title: "Tidewater, a build cache"
links:
  - name: "Source on GitHub"
    url: "https://github.com/yourname/tidewater"
---

Tidewater keeps build outputs in shared storage so that a change on one machine never has to be built twice.

## Approach

Cache keys are derived from the inputs of each step, not from timestamps, which makes hits predictable and misses easy to explain.
