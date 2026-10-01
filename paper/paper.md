---
title: 'JolWatch Edge: Offline-First Water Intelligence and Deterministic Leak Detection for Low-Connectivity Facilities'
tags:
  - water conservation
  - leak detection
  - edge computing
  - offline-first
  - smart facilities
  - IoT prototype
authors:
  - name: Shawon Khan
    orcid: 0009-0006-5669-3792
    affiliation: 1
affiliations:
  - name: Independent Developer & Researcher, Dhaka, Bangladesh
    index: 1
date: 1 October 2026
doi: 10.5281/zenodo.23071819
bibliography: paper.bib
---

# Summary

Water scarcity and unmonitored plumbing losses create persistent operational challenges for community infrastructure across developing nations. Rural primary schools, community health posts, and multi-tenant residential facilities frequently face severe water, sanitation, and hygiene (WASH) infrastructure constraints (World Health Organization, 2019) [@who2019wash]. In these facilities, underground pipe fractures, leaking cisterns, and overflowing rooftop tanks often continue for days or weeks before someone notices. Most commercial IoT solutions depend on steady internet connectivity, proprietary hardware, and centralized cloud servers. These requirements often fail in resource-constrained environments where power outages and network dropouts are common.

**JolWatch Edge** is an open-source, offline-first water intelligence prototype designed to operate reliably without an active internet connection. The system tracks volumetric flow at a facility's main inlet and compares it with monitored branch zones. Using straightforward flow-balance equations, it classifies facility status into *Normal*, *Possible Hidden Leak*, *Possible Tank Overflow*, *Sensor Mismatch*, or *Monitor*. The system also includes an *Essential Reserve Clock* to help managers plan water use during supply cuts and a *Maintenance Attention Indicator* to guide storage tank cleaning schedules.

# Statement of Need

In many parts of the Global South, including Bangladesh, institutions rely on intermittent municipal supply or local groundwater pumped into overhead storage tanks. Water utility billing measures only monthly total volume rather than real-time flow patterns. Meeting universal water access targets under Sustainable Development Goal 6 requires substantial capital investment alongside aggressive loss reduction (Hutton and Varughese, 2016) [@hutton2016costs]. Studies on plumbing end-use confirm that fixture leakage and distribution defects account for a large portion of avoidable municipal draw (Mayer et al., 2016) [@mayer2016residential]. In practice, facilities face two frequent failure modes:

1. **Undetected Distribution Leaks:** Underground pipe cracks or leaking toilet valves create a continuous flow imbalance. This wastes municipal water, increases bills, and depletes local groundwater tables.
2. **Overhead Reservoir Overflows:** Mechanical float valves jam or wear out, allowing pumps to keep filling tanks past their capacity. This damages roofs and structures while wasting clean water.

When cloud-based monitoring tools lose their internet connection, their alert pipelines break or stall. JolWatch Edge closes this reliability gap by running all balance calculations and decision rules directly on edge hardware or in local browser memory, requiring zero remote server calls.

# Mathematical Formulation & Methodology

## 1. Mass Conservation and Flow-Balance Formulation

Let $Q_{in}(t) \in \mathbb{R}_{\ge 0}$ represent the instantaneous volumetric flow rate measured at the facility's main inlet at discrete time window $t$. Let $\{Q_{z,1}(t), Q_{z,2}(t), \dots, Q_{z,k}(t)\}$ denote the set of monitored downstream zone flow rates (e.g., washrooms, kitchens, outdoor grounds, drinking stations).

The aggregate monitored zone flow $Q_{zones}(t)$ is given by:

$$Q_{zones}(t) = \sum_{i=1}^{k} Q_{z,i}(t)$$

Under ideal conservation in an unbranched, non-leaking network without storage transients, $Q_{in}(t) = Q_{zones}(t)$. In real-world physical networks, unmonitored loss $\Delta Q(t)$ is expressed as:

$$\Delta Q(t) = \max\left(0, Q_{in}(t) - Q_{zones}(t)\right)$$

The relative unexplained loss rate $L(t)$ as a percentage of total inflow is defined as:

$$L(t) = \begin{cases} \left(\frac{\Delta Q(t)}{Q_{in}(t)}\right) \times 100, & \text{if } Q_{in}(t) > 0 \\ 0, & \text{if } Q_{in}(t) = 0 \end{cases}$$

## 2. Deterministic Anomaly Classification Heuristics

To ensure complete interpretability, JolWatch Edge avoids opaque machine learning models in favor of five deterministic classification rules:

$$\text{Decision}(t) = \begin{cases}
\textbf{Sensor Mismatch}, & \text{if } \left(Q_{zones}(t) - Q_{in}(t)\right) > \delta_{mismatch} \\
\textbf{Tank Overflow}, & \text{if } (H_{tank}(t) \ge \theta_{tank}) \land (Q_{in}(t) > Q_{min}) \land (L(t) > \theta_{overflow}) \\
\textbf{Hidden Leak}, & \text{if } (L(t) > \theta_{leak}) \land (\Delta \tau(t) \ge \tau_{min}) \\
\textbf{Monitor}, & \text{if } L(t) > \theta_{monitor} \\
\textbf{Normal}, & \text{otherwise}
\end{cases}$$

Where the illustrative prototype parameter baselines are configured as:
- $\delta_{mismatch} = 2.0\text{ L/min}$ (sensor tolerance window preventing false alarms when downstream meters momentarily exceed inlet)
- $\theta_{tank} = 95\%$ (critical tank fill fraction)
- $Q_{min} = 10.0\text{ L/min}$ (minimum pumping flow)
- $\theta_{overflow} = 25\%$ (inlet-to-demand divergence)
- $\theta_{leak} = 15\%$ (loss threshold indicative of structural pipe failure)
- $\tau_{min} = 15\text{ minutes}$ (persistence duration threshold filter to reject transient demand surges)
- $\theta_{monitor} = 8\%$ (early-warning observation threshold)

## 3. Essential Reserve Clock Projection

During municipal supply cuts, facility managers must allocate remaining reservoir storage $V_{usable}$ to essential services. Given total storage capacity $C$ and current liquid level $H_{tank}(t) \in [0, 100]$, the total volume is $V_{total} = C \times (H_{tank}/100)$.

To safeguard against catastrophic dry-run conditions, the system enforces a protected emergency reserve fraction $\beta_{profile}$ ($\beta_{school} = 0.20$, $\beta_{clinic} = 0.30$):

$$V_{usable}(t) = \max\left(0, V_{total}(t) - C \cdot \beta_{profile}\right)$$

Accounting for baseline hourly demand $D_{profile}$ and the active loss burden $60 \cdot \Delta Q(t)$, the estimated remaining endurance hours $T_{reserve}$ is derived as:

$$T_{reserve}(t) = \frac{V_{usable}(t)}{\max\left(1, D_{profile} + 60 \cdot \Delta Q(t)\right)}$$

# Software Architecture & Verification

The JolWatch Edge reference software implementation (Khan, 2026) [@khan2026jolwatch] is structured with strict separation of concerns:
- **`js/engine.js`:** Pure, dependency-free calculation engine supporting Universal Module Definition (UMD) for deployment in headless Node.js edge environments or client-side web browsers.
- **`js/app.js`:** Interactive state controller managing localStorage persistence, safe DOM manipulation to prevent cross-site scripting (XSS), bilingual (English/Bengali) dictionary translation, and local JSON export.
- **Automated Test Suite (`tests/`):** 28 deterministic unit tests executing under Node.js test runners and validated through continuous integration on GitHub Actions across Node.js 18.x, 20.x, and 22.x.

# Limitations & Future Empirical Validation

1. **Software Simulation Benchmark:** Current validation relies on synthetic, deterministic datasets. Deploying this logic on a physical test rig with ESP32 microcontrollers, YF-S201 flow sensors, and JSN-SR04T waterproof ultrasonic level sensors is the next experimental step.
2. **Threshold Calibration:** The default threshold values ($\theta_{leak} = 15\%$, $\tau_{min} = 15\text{ min}$) serve as baseline demonstration parameters. Real facilities will need empirical calibration to account for specific plumbing layouts and daily consumption rhythms.
3. **Water Safety Notice:** The maintenance attention index monitors physical indicators (turbidity, TDS change, temperature, inspection interval) to plan routine cleaning. It does not measure bacteria, viruses, or dissolved arsenic, and it cannot certify drinking water potability.

# Availability

- **Repository:** [https://github.com/shawonsmith/jolwatch-edge](https://github.com/shawonsmith/jolwatch-edge)
- **Live Prototype:** [https://shawonsmith.github.io/jolwatch-edge/](https://shawonsmith.github.io/jolwatch-edge/)
- **License:** MIT License

# References

- Hutton, G., & Varughese, M. (2016). *The Costs of Meeting the 2030 Sustainable Development Goal Targets on Drinking Water, Sanitation, and Hygiene*. World Bank, Washington, DC. https://doi.org/10.1596/K8543
- Khan, S. (2026). *JolWatch Edge: Offline-First Water Intelligence and Deterministic Leak Detection Prototype* (v1.0.1). Zenodo. https://doi.org/10.5281/zenodo.23071819
- Mayer, P. W., DeOreo, W. B., Chesnutt, T. W., & Pekelney, D. M. (2016). *Residential End Uses of Water, Version 2*. Water Research Foundation, Denver, CO.
- World Health Organization. (2019). *Water, Sanitation, and Hygiene in Health Care Facilities: Practical Steps to Achieve Universal Access*. World Health Organization, Geneva, Switzerland. https://www.who.int/publications/i/item/9789241515511
