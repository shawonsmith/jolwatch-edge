# Three-Minute Presentation and Demo Script

Target length: approximately 2 minutes 50 seconds to 3 minutes.

## 0:00–0:25 — The problem

Hello, I am Shawon Khan from Bangladesh, and this is JolWatch Edge. Many schools, clinics, apartments and community facilities can see their total water bill, but they cannot identify when, where or why water is being lost. A hidden leak or overflowing tank may continue for hours or days, especially where smart monitoring is expensive or internet connectivity is unreliable.

## 0:25–0:52 — The solution

JolWatch Edge is an affordable, offline-first water intelligence concept. It compares flow at the main inlet with consumption across monitored zones. Local edge processing estimates unexplained loss, identifies abnormal patterns and gives a specific recommended action. Data can remain available locally and synchronise when connectivity returns.

## 0:52–2:05 — Live demonstration

This software proof of concept currently uses simulated sensor data. First, I select Normal Usage. The inlet and zone totals remain close, so the system reports no anomaly.

Next, I select Hidden Leak. Washroom flow remains unusually high, the calculated balance gap increases, and JolWatch Edge issues a critical alert recommending inspection of taps, the cistern and the local supply line.

Finally, I select Tank Overflow. Inlet flow becomes much higher than recorded demand. The system identifies the large unexplained difference and recommends checking the tank-level control and float valve.

The dashboard also shows a daily water budget and a seven-day demand forecast, helping facility managers move from delayed reaction to earlier, data-supported decisions.

## 2:05–2:35 — Feasibility and innovation

The proposed physical system uses low-cost flow sensors and an ESP32-class controller. Its key difference is offline-first operation: detection and local alerts do not depend on continuous cloud access. The design is modular, so a facility can start with the main inlet and expand to priority zones.

## 2:35–2:55 — Validation and impact

The current results are simulated, not field-test claims. The next stage is a controlled sensor test rig to calibrate thresholds and measure detection time, false alerts and verified litres of loss. JolWatch Edge aims to make practical water intelligence accessible to facilities that need it most.

## 2:55–3:00 — Closing

Thank you. JolWatch Edge: smarter water decisions, even offline.

## Recording shot list

1. Face or title card while delivering the first sentence.
2. Architecture diagram during the solution explanation.
3. Dashboard: Normal Usage scenario.
4. Dashboard: Hidden Leak scenario and alert.
5. Dashboard: Tank Overflow scenario and alert.
6. Daily budget and forecast cards.
7. Architecture diagram and closing project name.
