# JolWatch Edge

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23071385.svg)](https://doi.org/10.5281/zenodo.23071385)
[![CI Tests](https://github.com/shawonsmith/jolwatch-edge/actions/workflows/test.yml/badge.svg)](https://github.com/shawonsmith/jolwatch-edge/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-28%20Passing-brightgreen.svg)](tests/detection-engine.test.js)
[![Maturity: Prototype](https://img.shields.io/badge/Maturity-Software%20Prototype-orange.svg)](#honest-prototype-disclosure)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE-teal.svg)](index.html)

**An offline-first tool for detecting pipe leaks, preventing tank overflows, and tracking reserve water in low-connectivity schools, clinics, and community facilities.**

---

![JolWatch Edge Banner](assets/jolwatch-banner-1920x600.png)

## 🌐 Live Interactive Demo & Technical Paper

🚀 **Interactive Web Dashboard:** [https://shawonsmith.github.io/jolwatch-edge/](https://shawonsmith.github.io/jolwatch-edge/)  
📄 **Technical Paper / Software Manuscript (Printable / HTML):** [https://shawonsmith.github.io/jolwatch-edge/paper/](https://shawonsmith.github.io/jolwatch-edge/paper/)  
📜 **Technical Manuscript Source (Markdown):** [https://github.com/shawonsmith/jolwatch-edge/blob/main/paper/paper.md](https://github.com/shawonsmith/jolwatch-edge/blob/main/paper/paper.md)  
*(Runs completely client-side in your web browser. No server, database, or continuous internet connection required.)*

---

## 📌 Why I Built This

In rural primary schools, community clinics, and public facilities across Bangladesh and similar regions, clean water is scarce and municipal supply is intermittent. Most facilities pump water into overhead rooftop tanks to keep taps running throughout the day. When plumbing issues occur, they often stay hidden until a major disruption happens:
- Underground pipe cracks and leaky toilet cisterns run constantly, quietly wasting clean water and driving up utility bills.
- Mechanical float valves get stuck, causing rooftop storage tanks to overflow onto roofs and exterior walls for hours unnoticed.
- When municipal supply cuts out, facility staff have no simple way to know how many hours of usable water remain before the building runs completely dry.

Most commercial smart-water systems rely on continuous high-speed internet, proprietary hardware, and ongoing cloud subscriptions. When local power cuts or network dropouts hit, cloud-dependent dashboards stop working. I built JolWatch Edge to provide an open, lightweight alternative that runs locally on low-cost hardware or directly in a web browser without needing any remote server.

---

## 💡 How It Works

JolWatch Edge uses simple flow-balance accounting. It compares the water entering a facility through a main inlet meter against the total water recorded across monitored branch lines (such as washrooms, kitchens, outdoor taps, and drinking points).

Instead of relying on black-box predictions, the system uses clear, explainable rules that can run on an inexpensive microcontroller or an offline tablet:

### Core Capabilities
1. **Deterministic State Classification:** Categorizes current flow into *Normal*, *Possible Hidden Leak*, *Possible Tank Overflow*, *Sensor Mismatch*, or *Monitor* using explicit flow-balance math.
2. **Essential Reserve Clock:** Estimates remaining usable hours of water during supply cuts, protecting a dedicated emergency buffer (20% for schools, 30% for clinics).
3. **Before & After Repair Verification:** Records flow imbalance before maintenance and verifies whether the repair reduced the leak by at least 50%.
4. **Tank Maintenance Advisor:** Looks at turbidity, TDS change, water temperature, and inspection intervals to prompt regular cleanings before water quality drops.
5. **Zero-Cloud Local Storage:** Keeps incident records in local device storage, with a simple one-click JSON export for offline reporting.
6. **Bilingual User Interface:** Fully functional in both English and Bengali (বাংলা).

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
  *(A calibration tolerance that prevents false alarms when branch meters momentarily read slightly higher than the main meter.)*
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

The physical deployment is designed for low-cost ESP32 microcontrollers paired with standard pulse flow meters (such as the YF-S201) and waterproof ultrasonic level sensors (JSN-SR04T):

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

The core software engine is validated against a deterministic evaluation dataset:

| Case ID | Scenario | Inlet | Zones Total | Gap | Loss Rate | Duration | Level | Decision |
|:---:|:---|---:|---:|---:|---:|---:|---:|:---|
| **TC-01** | Normal Flow | 32.0 L/min | 30.5 L/min | 1.5 L/min | 4.7% | 20 min | 64% | **Normal** |
| **TC-02** | Hidden Leak | 44.0 L/min | 30.0 L/min | 14.0 L/min | 31.8% | 35 min | 62% | **Possible hidden leak** |
| **TC-03** | Tank Overflow | 52.0 L/min | 20.0 L/min | 32.0 L/min | 61.5% | 20 min | 98% | **Possible tank overflow** |
| **TC-04** | Sensor Mismatch | 25.0 L/min | 34.0 L/min | 0.0 L/min | 0.0% | 10 min | 60% | **Sensor mismatch** |
| **TC-05** | Elevated Short Gap | 40.0 L/min | 34.0 L/min | 6.0 L/min | 15.0% | 5 min | 55% | **Monitor** |

Full automated test suite with 28 unit tests is available in [`tests/detection-engine.test.js`](tests/detection-engine.test.js).

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

I want to be transparent about what is finished and what remains future work:
1. **Software Prototype:** All test scenarios in this repository use simulated, deterministic sensor readings to evaluate the edge logic. Deploying physical flow meters and pressure sensors in an active facility is the next phase.
2. **Threshold Calibration:** The default threshold values (8% monitor threshold, 15% leak threshold, 15-minute persistence duration, 120 L/h school demand, 180 L/h clinic demand) are baseline engineering estimates. Real deployments will need site-specific calibration.
3. **Maintenance Advisor vs. Drinking Water Safety:** The tank maintenance module tracks physical indicators (turbidity, TDS change, temperature, days since cleaning) to help schedule tank washouts. **It does not test for bacteria, viruses, arsenic, or heavy metals, and it cannot certify water as safe to drink.** Drinking water safety must be verified by accredited laboratory assays.
4. **Local Prototype Sync:** The "Simulate Sync" button is an offline UI demonstration showing how outgoing sync queues behave. It does not transmit packets to an external cloud database.

---

## 🗺️ Research & Development Roadmap

- [x] Separation of core calculation engine (`js/engine.js`) from UI layer.
- [x] Automated boundary testing suite (28 tests across edge conditions).
- [x] Continuous Integration via GitHub Actions.
- [x] Local JSON export for recorded incident logs.
- [ ] **Phase 2 (Hardware Prototyping):** Build an ESP32 bench rig with calibrated YF-S201 flow meters and JSN-SR04T waterproof ultrasonic level sensors.
- [ ] **Phase 3 (Empirical Calibration):** Introduce controlled physical leaks (1 L/min to 10 L/min) to measure response times, detection limits, and false-alarm rates under variable pipe pressures.
- [ ] **Phase 4 (Academic Publication):** Prepare formal research manuscript with physical sensor test data for open-access peer review (arXiv / Zenodo / JOSS).

---

## 📄 License & Citation

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete terms.

If you reference or build upon this work in your research or project, please cite:
```bibtex
@software{khan2026jolwatch,
  author = {Khan, Shawon},
  title = {JolWatch Edge: Offline-First Water Intelligence and Deterministic Leak Detection Prototype},
  year = {2026},
  doi = {10.5281/zenodo.23071819},
  url = {https://doi.org/10.5281/zenodo.23071819},
  version = {1.0.1}
}
```
*(Also available in machine-readable CFF format: [`CITATION.cff`](CITATION.cff).)*

---

**Author:** **Shawon Khan**  
*Student & IT Developer, Bangladesh*  
[![ORCID](https://img.shields.io/badge/ORCID-0009--0006--5669--3792-green.svg)](https://orcid.org/0009-0006-5669-3792)  
*GitHub:* [@shawonsmith](https://github.com/shawonsmith) · *Email:* [smithitcompany@gmail.com](mailto:smithitcompany@gmail.com)
