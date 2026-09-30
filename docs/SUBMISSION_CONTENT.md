# Submission Content

## Freestyle section title

### Prototype, Innovation and Future Validation

## Freestyle section text

JolWatch Edge is a functional software proof of concept showing how low-cost readings can become practical water-management decisions. Users enter raw inlet flow, four zone flows, tank level, pattern duration and capacity. Explainable rules classify normal use, possible hidden leaks, possible overflow and inconsistent sensor readings.

The innovation is not only leak detection. JolWatch Edge combines an Essential Reserve Clock, alert-to-repair verification, a device-local incident queue and a Tank Health & Cleaning Advisor. A future physical version would use low-cost flow sensors, a tank-level sensor and an ESP32-class controller.

The current prototype uses simulated sensor data and has not yet completed physical or field testing. The next development stage is to build a controlled sensor test rig, collect baseline readings, calibrate thresholds, introduce known leaks and overflow conditions, and compare system alerts with the recorded ground truth.

## Innovation highlights

- Offline-first monitoring for low-connectivity settings
- Main-inlet and zone-flow balance analysis
- Cause-specific alerts instead of raw sensor numbers
- Essential-water reserve estimation and repair verification
- Tank inspection and cleaning guidance with safe limitations
- Modular design for schools, clinics, apartments and community facilities

## Expected impact statement

JolWatch Edge aims to help small facilities identify avoidable water loss earlier, protect essential reserve, prioritise maintenance and verify whether repair reduced loss. Future field tests will measure verified litres saved, detection time, false-alert rate, repair response time, reserve-estimate error and cleaning-advisor agreement with inspection and accredited laboratory results.

## Honest prototype disclosure

This submission demonstrates a functional software prototype using simulated IoT readings. Physical sensors, field deployment and real-world water savings remain future validation stages. The tank module is an inspection-planning aid; it cannot detect pathogens, arsenic or all chemicals and does not certify water as safe to drink.
