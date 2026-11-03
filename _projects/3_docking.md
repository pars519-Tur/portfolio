---
layout: page
title: Docking with tumbling targets
description: PPO agents for offset-port docking under coupled 6-DOF dynamics
importance: 3
category: research
related_publications: true
---

**Published:** 77th International Astronautical Congress (IAC 2026), oral presentation.

Offset-port docking is formulated as a Markov decision process with fully coupled 6-DOF rotational–translational relative dynamics under J2 perturbations. Decoupled Clohessy–Wiltshire formulations ignore the coupling between attitude and position, which matters when the docking port is off the target's center of mass and the target is tumbling.

- Custom Gymnasium environment with docking-corridor constraints, thruster actuation limits, and structured reward shaping
- Systematic hyperparameter sweeps tracked in Weights & Biases
- PPO agents (PyTorch) dock with targets tumbling at up to 2.5 deg/s; a classical PD guidance baseline fails beyond about 1 deg/s
- Fuel trade quantified: roughly 3–3.6 m/s Δv for PPO against 1–2 m/s for the baseline

{% bibliography --cited_in_order --query @*[key=aytekin2026docking] %}
