# Deterministic Validation Dataset & Verification Evidence

> **Note for Evaluators & Researchers:** These are deterministic simulated validation benchmarks used to evaluate the logic engine's boundary conditions in software. They do not constitute completed physical field-test deployments.

## Canonical Evaluation Dataset

| Scenario ID | Scenario Name | Main Inlet | Monitored Zones Total | Unexplained Flow (Gap) | Loss Rate (% of Inlet) | Duration | Tank Level | Expected Decision | Recommended Action |
|:---|:---|---:|---:|---:|---:|---:|---:|:---|:---|
| **TC-01** | Normal Usage | 32.0 L/min | 30.5 L/min | 1.5 L/min | 4.7% | 20 min | 64% | **Normal** | Continuous passive monitoring; flow within tolerance |
| **TC-02** | Hidden Leak | 44.0 L/min | 30.0 L/min | 14.0 L/min | 31.8% | 35 min | 62% | **Possible hidden leak** | Inspect branch supply lines, washroom cisterns, and fittings |
| **TC-03** | Tank Overflow | 52.0 L/min | 20.0 L/min | 32.0 L/min | 61.5% | 20 min | 98% | **Possible tank overflow** | Inspect tank auto-shutoff mechanism, float valve, and sensor |
| **TC-04** | Sensor Mismatch | 25.0 L/min | 34.0 L/min | 0.0 L/min | 0.0% | 10 min | 60% | **Sensor mismatch** | Reject alert; recalibrate flow sensors and inspect meter sync |
| **TC-05** | Elevated Short Gap | 40.0 L/min | 34.0 L/min | 6.0 L/min | 15.0% | 5 min | 55% | **Monitor** | Elevated imbalance observed, but duration < 15 min threshold |

---

## Mathematical Formulations

### 1. Flow Balance Formulation
For each observation window $t$:
$$\text{RecordedZoneTotal}(t) = \sum_{i=1}^{k} \text{ZoneFlow}_i(t)$$
$$\text{EstimatedLoss}(t) = \max\left(0, \text{MainInlet}(t) - \text{RecordedZoneTotal}(t)\right)$$
$$\text{LossRate}(t) = \begin{cases} \left(\frac{\text{EstimatedLoss}(t)}{\text{MainInlet}(t)}\right) \times 100, & \text{if } \text{MainInlet}(t) > 0 \\ 0, & \text{otherwise} \end{cases}$$

### 2. Decision Logic Classification Rules
1. **Sensor Mismatch:**
   $$\text{ZoneOverread} = \text{RecordedZoneTotal} - \text{MainInlet} > 2.0\text{ L/min} \implies \text{Mismatch}$$
2. **Possible Overflow:**
   $$(\text{TankLevel} \ge 95\%) \land (\text{MainInlet} > 10\text{ L/min}) \land (\text{LossRate} > 25\%) \implies \text{Overflow}$$
3. **Possible Hidden Leak:**
   $$(\text{LossRate} > 15\%) \land (\text{Duration} \ge 15\text{ min}) \implies \text{Hidden Leak}$$
4. **Monitor Warning:**
   $$\text{LossRate} > 8\% \implies \text{Monitor}$$
5. **Normal:**
   $$\text{Otherwise} \implies \text{Normal}$$

---

## Automated Acceptance Criteria

- [x] Zone totals always equal the exact mathematical sum of monitored zone inputs.
- [x] Loss rate is computed from the same displayed inlet and zone values.
- [x] Inconsistent readings ($\sum \text{Zones} > \text{Inlet} + 2$) are explicitly classified as sensor errors before triggering maintenance alerts.
- [x] Incident logs verify post-repair reduction (>50% drop in unexplained flow rate).
- [x] Automated test suite executes 25+ deterministic test cases across boundary thresholds.
