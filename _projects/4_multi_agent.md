---
layout: page
title: Cooperative multi-spacecraft planning
description: MAPPO for multi-spacecraft proximity operations
importance: 4
category: research
related_publications: true
---

**Published:** IEEE National Aerospace & Electronics Conference (NAECON 2026).

A multi-agent PPO (MAPPO) framework with centralized training and decentralized execution plans cooperative maneuvers for several spacecraft operating in proximity, under Hill–Clohessy–Wiltshire relative dynamics. It is benchmarked against a classical LQR plus artificial-potential-field controller.

- Behavior-cloning warm start to accelerate policy convergence
- Diagnosed and resolved a mid-training policy collapse, reaching 100% task success at the final checkpoint
- Results validated with Wilson score intervals, McNemar tests, and bootstrap confidence intervals

{% bibliography --cited_in_order --query @*[key=aytekin2026maneuver] %}
