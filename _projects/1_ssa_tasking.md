---
layout: page
title: RL for SSA sensor tasking
description: M.S. thesis on deciding which space object each ground sensor observes next
importance: 1
category: research
---

**Status:** M.S. thesis, ongoing. Advisor: Maj. Kullen Waggoner, Ph.D. (AFIT)

A network of ground-based sensors can only watch a few objects at a time, while the catalog it must keep track of is large and the uncertainty of every unobserved object keeps growing. My thesis treats this sensor-to-target assignment as a sequential decision problem and trains deep reinforcement learning policies to solve it.

The focus is catalogs where objects maneuver. A policy trained only on coasting objects can look strong on average while quietly losing the few objects that change orbit, so maneuvering spacecraft are built into both the training data and the policy design.

- Sensor-to-target assignment formulated as a sequential decision problem
- Maneuvering spacecraft incorporated into training data and policy design
- Simulation and training infrastructure in Python and MATLAB
