---
title: 'JolWatch Edge: An Explainable Offline-First Water Intelligence and Deterministic Leak Detection System for Low-Connectivity Facilities'
tags:
  - water conservation
  - leak detection
  - edge computing
  - offline-first
  - smart facilities
  - IoT prototype
authors:
  - name: Shawon Khan
    orcid: 0009-0000-0000-0000
    affiliation: 1
affiliations:
  - name: Independent Developer & Researcher, Dhaka, Bangladesh
    index: 1
date: 1 October 2026
doi: 10.5281/zenodo.23071386
bibliography: paper.bib
---

# Summary

Water scarcity and unmonitored distribution losses present severe operational challenges to community infrastructure across developing nations. In facilities such as rural primary schools, health clinics, and multi-tenant residential complexes, undetected pipe bursts, faulty cisterns, and storage tank overflows often persist for days before detection. While commercial Internet of Things (IoT) solutions exist, they predominantly rely on continuous cloud connectivity, proprietary hardware, and centralized telemetry—prerequisites that are frequently absent in resource-constrained environments.

**JolWatch Edge** is an open-source, offline-first water intelligence prototype designed to operate reliably without continuous internet access. The system ingests flow rates from a facility's main inlet and monitored branch zones, applying deterministic flow-balance equations to classify usage states into *Normal*, *Possible Hidden Leak*, *Possible Tank Overflow*, *Sensor Mismatch*, or *Monitor*. Additionally, it provides an *Essential Reserve Clock* for capacity planning during supply outages and an observational *Maintenance Attention Indicator* to guide water tank cleaning.

# Statement of Need

In many parts of the Global South, including Bangladesh, institutions depend on intermittent municipal supply or decentralized groundwater extraction pumped into overhead reservoirs. Water utility billing reflects aggregate volumetric consumption rather than temporal or spatial flow dynamics. Consequently, facilities encounter two distinct failure modes:

1. **Undetected Distribution Leaks:** Subsurface line fractures or defective washroom fixtures generate persistent low-to-medium flow imbalances that escalate municipal bills and deplete local aquifers.
2. **Overhead Reservoir Overflows:** Mechanical float-valve failures allow inlet pumping to continue past storage capacity, leading to structural water damage and acute resource wastage.

When cloud-dependent monitoring architectures face internet disruptions, alert generation ceases or buffers indefinitely. JolWatch Edge addresses this critical resilience gap by executing all balance heuristics and decision rules directly on the client edge runtime, requiring zero remote server dependencies.

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

The project is structured with strict separation of concerns:
- **`js/engine.js`:** Pure, dependency-free calculation engine supporting Universal Module Definition (UMD) for deployment in headless Node.js edge environments or client-side web browsers.
- **`js/app.js`:** Interactive state controller managing localStorage persistence, safe DOM manipulation to prevent cross-site scripting (XSS), bilingual (English/Bengali) dictionary translation, and local JSON export.
- **Automated Test Suite (`tests/`):** 28 deterministic unit tests executing under Node.js test runners and validated through continuous integration on GitHub Actions across Node.js 18.x, 20.x, and 22.x.

# Limitations & Future Empirical Validation

1. **Software Simulation Benchmark:** Current validation relies on synthetic, deterministic datasets. Empirical deployment on a controlled physical test rig using ESP32 microcontrollers, YF-S201 hall-effect pulse meters, and JSN-SR04T waterproof ultrasonic transducers represents the immediate research phase.
2. **Threshold Calibration:** Current threshold coefficients ($\theta_{leak} = 15\%$, $\tau_{min} = 15\text{ min}$) represent evaluation assumptions and require empirical Bayesian calibration against real-world facility consumption patterns.
3. **Biological & Chemical Non-Potability:** The maintenance attention index analyzes observational physical surrogates (turbidity, TDS drift, stagnation time) for servicing schedules and explicitly does not certify drinking water safety against microbial or arsenic contamination.

# Availability

- **Repository:** [https://github.com/shawonsmith/jolwatch-edge](https://github.com/shawonsmith/jolwatch-edge)
- **Live Prototype:** [https://shawonsmith.github.io/jolwatch-edge/](https://shawonsmith.github.io/jolwatch-edge/)
- **License:** MIT License
