---
layout: page
title: Robustness to unpredicted maneuvers
description: Stress-testing a PPO sensor-tasking policy against maneuvers it never saw in training
importance: 2
category: research
---

**Context:** course project, CSCE 723 (AFIT), and a pilot study for the thesis.

This project asks what happens to a pretrained PPO sensor-tasking policy when objects maneuver without warning. A maneuver-injection module perturbs the true trajectories while the estimator stays unaware, and the policy is evaluated zero-shot against a greedy heuristic (3 sensors, about 100 objects) across several maneuver rates.

Averages hide the failure mode of interest, so the evaluation looks at the tail:

- 90th-percentile covariance across the catalog
- Fraction of maneuvering objects left unobserved after the maneuver
- Time to reacquire a maneuvering object

Stack: Python, Ray RLlib, TensorFlow, NumPy, pandas.
