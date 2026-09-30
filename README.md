# JolWatch Edge

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23071386.svg)](https://doi.org/10.5281/zenodo.23071386)
[![CI Tests](https://github.com/shawonsmith/jolwatch-edge/actions/workflows/test.yml/badge.svg)](https://github.com/shawonsmith/jolwatch-edge/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-28%20Passing-brightgreen.svg)](tests/detection-engine.test.js)
[![Maturity: Prototype](https://img.shields.io/badge/Maturity-Software%20Prototype-orange.svg)](#honest-prototype-disclosure)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE-teal.svg)](index.html)

**Offline-first facility water intelligence and deterministic leak detection prototype for low-connectivity environments.**

---

![JolWatch Edge Banner](assets/jolwatch-banner-1920x600.png)

## 🌐 Live Interactive Demo

🚀 **Experience the Live Application:** [https://shawonsmith.github.io/jolwatch-edge/](https://shawonsmith.github.io/jolwatch-edge/)  
*(Runs 100% client-side in your browser. No server, database, or continuous internet connection required.)*

---

## 📌 Problem Overview

Small community facilities across developing and low-connectivity regions—such as rural primary schools, community health posts, vocational training centers, and public housing blocks—often receive high monthly water bills or run out of water unexpectedly. 

However, facility managers typically cannot identify:
- **When** water is escaping (gradual leaks vs. sudden overflows),
- **Where** the loss is occurring (in unmonitored branch pipes, cisterns, or rooftop tanks),
- **How long** essential water reserves will last during an outage.

Commercial IoT water management systems often demand costly proprietary hardware, complex cloud backends, and reliable high-speed broadband—rendering them impractical in off-grid or rural settings.

---

## 💡 Proposed Solution

**JolWatch Edge** is an explainable, offline-first water intelligence prototype. It computes flow balance by comparing water entering a facility through a main inlet meter against aggregated water consumption across monitored branch zones (e.g., washrooms, kitchens, outdoor points, drinking taps).

### Key Functional Capabilities
1. **Deterministic Flow Classification:** Uses explicit mathematical rules to classify current use into *Normal*, *Possible Hidden Leak*, *Possible Tank Overflow*, *Sensor Mismatch*, or *Monitor*.
2. **Essential Reserve Clock:** Estimates remaining usable hours of water for schools and health clinics while reserving a protected emergency buffer.
3. **Alert → Repair → Verify:** Captures pre-repair anomaly baselines and validates whether maintenance reduced the loss rate by at least 50%.
4. **Maintenance Attention Indicator:** Analyzes observational water quality indicators (Turbidity, TDS shift, temperature, inspection interval) to guide tank cleaning schedules.
5. **Zero-Cloud Local Storage:** Records all incidents directly to the browser or local edge runtime, providing offline JSON export.
6. **Bilingual User Interface:** Complete parity across English and Bengali interfaces.

---

## 📐 Mathematical Formulation

### 1. Flow Balance Equation
For any discrete observation window $t$:

$$\text{RecordedZoneTotal}(t) = \sum_{i=1}^{k} \text{ZoneFlow}_i(t)$$

$$\text{EstimatedLoss}(t) = \max\left(0, \text{MainInlet}(t) - \text{RecordedZoneTotal}(t)\right)$$

$$\text{LossRate}(t) = \begin{cases} \left(\frac{\text{EstimatedLoss}(t)}{\text{MainInlet}(t)}\right) \times 100, & \text{if } \text{MainInlet}(t) > 0 \\ 0, & \text{otherwise} \end{cases}$$

### 2. Decision Logic Classification Rules
- **Rule 1 (Sensor Mismatch):**  
  $\text{ZoneOverread} = \text{RecordedZoneTotal} - \text{MainInlet} > 2.0\text{ L/min} \implies \textbf{Sensor Mismatch}$  
  *(Prevents false alarms by identifying sensor calibration drift or timing offsets before alerting operators.)*
- **Rule 2 (Tank Overflow):**  
  $(\text{TankLevel} \ge 95\%) \land (\text{MainInlet} > 10\text{ L/min}) \land (\text{LossRate} > 25\%) \implies \textbf{Possible Tank Overflow}$
- **Rule 3 (Persistent Hidden Leak):**  
  $(\text{LossRate} > 15\%) \land (\text{Duration} \ge 15\text{ min}) \implies \textbf{Possible Hidden Leak}$
- **Rule 4 (Elevated Imbalance):**  
  $\text{LossRate} > 8\% \implies \textbf{Monitor}$
- **Rule 5 (Normal Use):**  
  $\text{Otherwise} \implies \textbf{Normal}$

---

## 🏗️ System Architecture

The conceptual physical deployment targets low-cost microcontrollers (ESP32) and hall-effect pulse flow sensors:

```
[Main Water Inlet] ----> [Flow Sensor 1] -----\
                                               \
[Zone 1: Washrooms] ---> [Flow Sensor 2] ------\
[Zone 2: Kitchen] -----> [Flow Sensor 3] ------> [ESP32 Edge Unit] ----> [Local Web Dashboard / OLED]
[Zone 3: Cleaning] ----> [Flow Sensor 4] ------/   (Runs JolWatch Engine)   (Works 100% Offline)
[Zone 4: Drinking] ----> [Flow Sensor 5] -----/                                   |
                                                                           (Optional Sync when online)
[Overhead Tank] -------> [Water Level Sensor] -/                                   v
                                                                          [Central Facility Log]
```
*(See [docs/architecture.svg](docs/architecture.svg) for detailed schematic.)*

---

## 🧪 Canonical Evaluation Benchmarks

The software engine is validated against a deterministic canonical benchmark dataset:

| Case ID | Scenario | Inlet | Zones Total | Gap | Loss Rate | Duration | Level | Decision |
|:---:|:---|---:|---:|---:|---:|---:|---:|:---|
| **TC-01** | Normal Flow | 32.0 L/min | 30.5 L/min | 1.5 L/min | 4.7% | 20 min | 64% | **Normal** |
| **TC-02** | Hidden Leak | 44.0 L/min | 30.0 L/min | 14.0 L/min | 31.8% | 35 min | 62% | **Possible hidden leak** |
| **TC-03** | Tank Overflow | 52.0 L/min | 20.0 L/min | 32.0 L/min | 61.5% | 20 min | 98% | **Possible tank overflow** |
| **TC-04** | Sensor Mismatch | 25.0 L/min | 34.0 L/min | 0.0 L/min | 0.0% | 10 min | 60% | **Sensor mismatch** |
| **TC-05** | Elevated Short Gap | 40.0 L/min | 34.0 L/min | 6.0 L/min | 15.0% | 5 min | 55% | **Monitor** |

Full automated test suite with 28 tests is available in [`tests/detection-engine.test.js`](tests/detection-engine.test.js).

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Node.js 18.x or later (optional, for running automated tests)
- Any modern web browser

### Run the Web Dashboard
Simply open `index.html` in your browser:
```bash
# Double-click index.html or open via terminal
start index.html   # On Windows
open index.html    # On macOS
xdg-open index.html # On Linux
```

### Run Automated Test Suite
```bash
npm test
```
```text
====================================================
JolWatch Edge - Comprehensive Test Suite
====================================================

Suite 1: Canonical Benchmark Scenarios (5/5 PASS)
Suite 2: Boundary Condition Verification (8/8 PASS)
Suite 3: Robustness & Discrepancy Tolerances (5/5 PASS)
Suite 4: Essential Reserve Clock Projections (5/5 PASS)
Suite 5: Maintenance Attention Indicator (5/5 PASS)

Execution Complete: 28/28 tests passed successfully.
```

---

## ⚠️ Honest Prototype Disclosures & Current Limitations

1. **Software Simulation Status:** This repository represents a functional software prototype evaluated with simulated data. Field deployment with physical flow sensors and empirical water savings measurements remain future validation milestones.
2. **Prototype Parameter Calibration:** The current threshold values (8% monitor threshold, 15% leak threshold, 15-minute persistence duration, 120 L/h school demand, 180 L/h clinic demand) are illustrative engineering assumptions. Real deployments require site-specific baseline calibration.
3. **Maintenance Indicator vs. Potability:** The tank maintenance module assists with inspection scheduling based on physical signals (Turbidity, TDS variance, temperature, days elapsed). **It does not detect microbiological pathogens, viruses, arsenic, or dissolved heavy metals and cannot certify water as safe for human consumption.** Drinking water safety must be verified by accredited laboratory assays.
4. **Local Prototype Sync:** The "Simulate Sync" button demonstrates offline queue behavior locally; it does not currently transmit packets to an external cloud database.

---

## 🗺️ Research & Development Roadmap

- [x] Separation of core calculation engine (`js/engine.js`) from UI layer.
- [x] Automated boundary testing suite (28 tests across edge conditions).
- [x] Continuous Integration via GitHub Actions.
- [x] Local JSON export for recorded incident logs.
- [ ] **Phase 2 (Hardware Prototyping):** Fabricate ESP32 test rig with calibrated YF-S201 flow meters and JSN-SR04T waterproof ultrasonic level sensors.
- [ ] **Phase 3 (Empirical Calibration):** Introduce controlled physical leaks (1 L/min to 10 L/min) to determine receiver operating characteristic (ROC) curves, false positive rates, and time-to-detect metrics.
- [ ] **Phase 4 (Academic Publication):** Prepare formal research manuscript with empirical sensor data for open-access peer review (arXiv / Zenodo / JOSS).

---

## 📄 License & Citation

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete terms.

If you reference or build upon this work in your research or project, please cite:
```bibtex
@software{khan2026jolwatch,
  author = {Khan, Shawon},
  title = {JolWatch Edge: Offline-First Water Intelligence and Deterministic Leak Detection Prototype},
  year = {2026},
  doi = {10.5281/zenodo.23071386},
  url = {https://doi.org/10.5281/zenodo.23071386},
  version = {1.0.0}
}
```
*(Also available in machine-readable CFF format: [`CITATION.cff`](CITATION.cff).)*

---

**Author:** **Shawon Khan**  
*Student & IT Developer, Bangladesh*  
[![ORCID](https://img.shields.io/badge/ORCID-0009--0006--5669--3792-green.svg)](https://orcid.org/0009-0006-5669-3792)  
*GitHub:* [@shawonsmith](https://github.com/shawonsmith) · *Email:* [smithitcompany@gmail.com](mailto:smithitcompany@gmail.com)
