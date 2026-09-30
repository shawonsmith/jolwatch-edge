# Prototype Test Evidence

These are deterministic simulated validation cases, not field-test results.

| Scenario | Main inlet | Recorded zones | Estimated loss | Loss rate | Expected system response |
|---|---:|---:|---:|---:|---|
| Normal usage | 31.2 L/min | 30.0 L/min | 1.2 L/min | 3.8% | Normal; continue monitoring |
| Hidden leak | 43.8 L/min | 31.2 L/min | 12.6 L/min | 28.8% | Critical; inspect washroom fixtures and supply line |
| Tank overflow | 51.6 L/min | 20.5 L/min | 31.1 L/min | 60.3% | Critical; inspect tank level control and float valve |

## Acceptance checks

- Zone flows always sum to the displayed recorded-zone total.
- Estimated loss always equals inlet flow minus recorded-zone flow.
- Loss percentage is derived from the same displayed readings.
- Normal readings change gradually within a narrow tolerance.
- Critical scenarios show a specific probable cause and recommended action.
- The interface remains usable without a network connection after it has loaded.

## Next validation stage

Connect calibrated flow sensors and a tank-level sensor to an ESP32, record baseline data at a controlled test rig, tune thresholds, and compare detected events against known introduced leaks and overflow conditions.
