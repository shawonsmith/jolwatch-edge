# JolWatch Edge — Test Evidence

Test date: 1 October 2026  
Prototype type: Browser-based software proof of concept  
Data type: Controlled simulated readings

## Detection results

| Test | Input summary | Expected | Result |
|---|---|---|---|
| Normal flow | 32 L/min inlet, 30.5 L/min zones, 64% tank, 20 min | Normal | PASS |
| Hidden leak | 44 L/min inlet, 29 L/min zones, 62% tank, 35 min | Possible hidden leak | PASS |
| Tank overflow | 52 L/min inlet, 20 L/min zones, 98% tank, 20 min | Possible tank overflow | PASS |
| Sensor mismatch | 25 L/min inlet, 34 L/min zones | Sensor mismatch | PASS |
| Elevated short gap | 40 L/min inlet, 34 L/min zones, 5 min | Monitor | PASS |

## Repeatable test command

`node tests/detection-engine.test.js`

## Evidence interpretation

These tests confirm that the prototype's deterministic rule logic produces the intended classification for controlled inputs. They do not prove sensor accuracy, drinking-water safety or field performance.

## Next physical-validation protocol

1. Install calibrated inlet and zone flow sensors on a closed-loop test rig.
2. Record a normal-flow baseline at several flow rates.
3. Introduce known leak rates and measure detection time.
4. Simulate tank overflow and float-valve failure.
5. Compare estimated and measured loss volume.
6. Report precision, recall, false-alert rate and mean detection time.
7. Compare tank-condition guidance with inspection and accredited laboratory results.

## Screenshot evidence checklist

- Operations page showing Normal result
- Hidden Leak alert with the percentage and duration rules visible
- Tank Overflow alert with tank level visible
- Sensor Mismatch warning
- Essential Reserve Clock
- Before/after repair verification
- Tank Health disclaimer
- Device-local incident log
