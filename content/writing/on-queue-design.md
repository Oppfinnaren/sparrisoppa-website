---
title: "Field notes on queue design"
date: 2024-09-12
description: "What a year of running small job queues taught me."
featured: true
home_title: "Field notes on queue design"
---

Most queues I have built were too clever. This is a short list of what I would keep, and what I would leave out next time.

## Keep the payload small

Store a reference to the work, not the work itself. It keeps the queue fast and makes retries cheap.

## Make retries boring

A retry should be the same as a first attempt. If a job cannot run twice safely, that is a bug in the job, not in the queue.
