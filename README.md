# JolWatch Edge

JolWatch Edge is an offline-first water intelligence proof of concept for buildings and community facilities. It turns inlet and zone flow readings into actionable leak, overflow, budget and demand insights without depending on continuous internet access.

## Functional prototype

- Accepts raw inlet, four zone-flow, tank-level, capacity and duration readings
- Uses explainable rules to identify normal flow, possible hidden leak, possible overflow and sensor mismatch
- Estimates an Essential Reserve Clock for school and clinic profiles
- Verifies improvement using before/after repair readings
- Stores incidents locally in the browser and maintains an offline sync queue
- Provides an English/Bangla interface
- Includes a Tank Health & Cleaning Advisor with explicit safety limitations

## Detection logic

For each observation window:

`estimated_loss = max(0, main_inlet_flow - sum(zone_flows))`

`loss_rate = estimated_loss / main_inlet_flow × 100`

The demo raises a possible hidden-leak alert when loss exceeds 15% for at least 15 minutes. Possible overflow additionally requires a tank level of at least 95%. These are prototype thresholds that require site-specific calibration.

## Proposed physical architecture

- Low-cost flow sensors at the main inlet and selected zones
- ESP32-class edge device for local collection and analysis
- Local queue/cache for operation during internet outages
- Browser dashboard for facility staff
- Local audible/visual alert plus optional SMS/cloud notification
- Synchronisation when connectivity returns

See `docs/architecture.svg` and `docs/TESTING.md`.

## Run locally

Open `dist/index.html` in a modern browser. No server, account or internet connection is required for the prototype.

## Important limitation

No physical sensor or field deployment has been completed yet. All evaluation cases are simulated. The tank module cannot detect bacteria, viruses, arsenic or every chemical and does not certify drinking-water safety.

## Creator

Shawon Khan — student and IT project developer, Bangladesh.
