/**
 * JolWatch Edge - Automated Deterministic Test Suite
 * Validates classification rules, boundary thresholds, reserve projections,
 * and maintenance indicators.
 */

const assert = require('node:assert/strict');
const {
  classifyDetection,
  calculateReserve,
  assessTankHealth
} = require('../js/engine');

let passCount = 0;
let totalCount = 0;

function runTest(suite, name, fn) {
  totalCount++;
  try {
    fn();
    passCount++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

console.log('====================================================');
console.log('JolWatch Edge - Comprehensive Test Suite');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: Canonical Presets & Core Decision Logic
// -----------------------------------------------------------------------------
console.log('Suite 1: Canonical Benchmark Scenarios');

runTest('Core', 'TC-01: Canonical Normal Flow (<8% gap)', () => {
  const result = classifyDetection({
    inlet: 32.0,
    level: 64,
    zones: [10.5, 7.0, 8.0, 5.0],
    duration: 20
  });
  assert.equal(result.type, 'Normal');
  assert.equal(result.severity, 'normal');
});

runTest('Core', 'TC-02: Canonical Hidden Leak (>15% gap, >=15 min)', () => {
  const result = classifyDetection({
    inlet: 44.0,
    level: 62,
    zones: [11.0, 6.0, 7.0, 5.0],
    duration: 35
  });
  assert.equal(result.type, 'Possible hidden leak');
  assert.equal(result.severity, 'danger');
});

runTest('Core', 'TC-03: Canonical Tank Overflow (Level >=95%, inlet >10, gap >25%)', () => {
  const result = classifyDetection({
    inlet: 52.0,
    level: 98,
    zones: [8.0, 5.0, 4.0, 3.0],
    duration: 20
  });
  assert.equal(result.type, 'Possible tank overflow');
  assert.equal(result.severity, 'danger');
});

runTest('Core', 'TC-04: Canonical Sensor Mismatch (Zones > Inlet + 2)', () => {
  const result = classifyDetection({
    inlet: 25.0,
    level: 60,
    zones: [12.0, 9.0, 8.0, 5.0],
    duration: 10
  });
  assert.equal(result.type, 'Sensor mismatch');
  assert.equal(result.severity, 'warn');
});

runTest('Core', 'TC-05: Canonical Elevated Short Gap (>8%, but duration <15 min)', () => {
  const result = classifyDetection({
    inlet: 40.0,
    level: 55,
    zones: [10.0, 9.0, 8.0, 7.0],
    duration: 5
  });
  assert.equal(result.type, 'Monitor');
  assert.equal(result.severity, 'warn');
});

// -----------------------------------------------------------------------------
// Suite 2: Mathematical Boundary Conditions
// -----------------------------------------------------------------------------
console.log('\nSuite 2: Boundary Condition Verification');

runTest('Boundary', 'Exact 8.0% loss rate boundary -> Normal (rule is >8%)', () => {
  const result = classifyDetection({ inlet: 100, level: 50, zones: [92], duration: 20 });
  assert.equal(result.type, 'Normal');
});

runTest('Boundary', '8.1% loss rate boundary -> Monitor', () => {
  const result = classifyDetection({ inlet: 100, level: 50, zones: [91.9], duration: 10 });
  assert.equal(result.type, 'Monitor');
});

runTest('Boundary', 'Exact 15.0% loss rate with duration 20 min -> Monitor (rule is >15%)', () => {
  const result = classifyDetection({ inlet: 100, level: 50, zones: [85], duration: 20 });
  assert.equal(result.type, 'Monitor');
});

runTest('Boundary', '15.1% loss rate with duration 15 min -> Possible hidden leak', () => {
  const result = classifyDetection({ inlet: 100, level: 50, zones: [84.9], duration: 15 });
  assert.equal(result.type, 'Possible hidden leak');
});

runTest('Boundary', '20.0% loss rate with duration 14 min -> Monitor (persistence < 15 min)', () => {
  const result = classifyDetection({ inlet: 100, level: 50, zones: [80], duration: 14 });
  assert.equal(result.type, 'Monitor');
});

runTest('Boundary', 'Overflow level exactly 94% -> Does not trigger overflow alert', () => {
  const result = classifyDetection({ inlet: 30, level: 94, zones: [10], duration: 20 });
  assert.notEqual(result.type, 'Possible tank overflow');
  assert.equal(result.type, 'Possible hidden leak');
});

runTest('Boundary', 'Overflow level exactly 95% with inlet <= 10 -> Does not trigger overflow alert', () => {
  const result = classifyDetection({ inlet: 10, level: 95, zones: [2], duration: 20 });
  assert.notEqual(result.type, 'Possible tank overflow');
});

runTest('Boundary', 'Overflow level 95% with inlet 11 (>10) and loss > 25% -> Possible tank overflow', () => {
  const result = classifyDetection({ inlet: 11, level: 95, zones: [5], duration: 20 });
  assert.equal(result.type, 'Possible tank overflow');
});

// -----------------------------------------------------------------------------
// Suite 3: Robustness & Sensor Discrepancy Tolerances
// -----------------------------------------------------------------------------
console.log('\nSuite 3: Robustness & Discrepancy Tolerances');

runTest('Robustness', 'Zone overread exactly 2.0 L/min -> Tolerated within calibration window', () => {
  const result = classifyDetection({ inlet: 20, level: 50, zones: [22], duration: 10 });
  assert.notEqual(result.type, 'Sensor mismatch');
});

runTest('Robustness', 'Zone overread 2.1 L/min -> Triggers Sensor mismatch', () => {
  const result = classifyDetection({ inlet: 20, level: 50, zones: [22.1], duration: 10 });
  assert.equal(result.type, 'Sensor mismatch');
});

runTest('Robustness', 'Zero main inlet flow -> Normal, 0% loss', () => {
  const result = classifyDetection({ inlet: 0, level: 50, zones: [], duration: 0 });
  assert.equal(result.type, 'Normal');
  assert.equal(result.gapPercent, 0);
});

runTest('Robustness', 'Empty zones array with positive inlet -> Loss equals full inlet', () => {
  const result = classifyDetection({ inlet: 20, level: 50, zones: [], duration: 20 });
  assert.equal(result.gap, 20);
  assert.equal(result.gapPercent, 100);
  assert.equal(result.type, 'Possible hidden leak');
});

runTest('Robustness', 'Negative values sanitized gracefully to zero', () => {
  const result = classifyDetection({ inlet: -30, level: -10, zones: [-5, 10], duration: -2 });
  assert.equal(result.inlet, 0);
  assert.equal(result.level, 0);
  assert.equal(result.duration, 0);
});

// -----------------------------------------------------------------------------
// Suite 4: Essential Reserve Clock Projections
// -----------------------------------------------------------------------------
console.log('\nSuite 4: Essential Reserve Clock Projections');

runTest('Reserve', 'School profile baseline demand = 120 L/h, 20% protected reserve', () => {
  const res = calculateReserve({ capacity: 5000, level: 64, gap: 0, profile: 'school' });
  assert.equal(res.demandPerHour, 120);
  assert.equal(res.usableLitres, 2200); // 3200L - 1000L protected = 2200L
  assert.equal(res.hoursRemaining, 18.3);
});

runTest('Reserve', 'Clinic profile baseline demand = 180 L/h, 30% protected reserve', () => {
  const res = calculateReserve({ capacity: 5000, level: 64, gap: 0, profile: 'clinic' });
  assert.equal(res.demandPerHour, 180);
  assert.equal(res.usableLitres, 1700); // 3200L - 1500L protected = 1700L
  assert.equal(res.hoursRemaining, 9.4);
});

runTest('Reserve', 'Tank at protected reserve level (20%) -> 0 usable hours remaining', () => {
  const res = calculateReserve({ capacity: 5000, level: 20, gap: 0, profile: 'school' });
  assert.equal(res.usableLitres, 0);
  assert.equal(res.hoursRemaining, 0);
});

runTest('Reserve', 'Empty tank (0% level) -> 0 hours remaining', () => {
  const res = calculateReserve({ capacity: 5000, level: 0, gap: 0, profile: 'school' });
  assert.equal(res.hoursRemaining, 0);
});

runTest('Reserve', 'Unexplained loss rate adds directly to hourly burn rate', () => {
  const resNoGap = calculateReserve({ capacity: 5000, level: 80, gap: 0, profile: 'school' });
  const resWithGap = calculateReserve({ capacity: 5000, level: 80, gap: 5.0, profile: 'school' });
  // Gap of 5.0 L/min = 300 L/h loss burden
  assert.equal(resWithGap.lossBurdenPerHour, 300);
  assert(resWithGap.hoursRemaining < resNoGap.hoursRemaining);
});

// -----------------------------------------------------------------------------
// Suite 5: Maintenance Attention Indicator Scoring
// -----------------------------------------------------------------------------
console.log('\nSuite 5: Maintenance Attention Indicator');

runTest('Maintenance', 'Optimal tank water conditions -> Score 100, Routine monitoring', () => {
  const res = assessTankHealth({
    turbidity: 1.0,
    tds: 200,
    tdsBase: 200,
    temp: 24,
    days: 20,
    turnover: 4
  });
  assert.equal(res.score, 100);
  assert.equal(res.title, 'Routine monitoring');
  assert.equal(res.reasons.length, 0);
});

runTest('Maintenance', 'Elevated turbidity (>5 NTU) triggers 30 point penalty', () => {
  const res = assessTankHealth({ turbidity: 6.0, tds: 200, tdsBase: 200, days: 15 });
  assert.equal(res.score, 70);
  assert(res.reasons.some(r => r.includes('Turbidity elevated')));
});

runTest('Maintenance', 'TDS shift > 25% triggers 20 point penalty', () => {
  const res = assessTankHealth({ turbidity: 1.0, tds: 300, tdsBase: 200, days: 15 });
  assert.equal(res.score, 80);
  assert(res.reasons.some(r => r.includes('TDS deviation')));
});

runTest('Maintenance', 'Overdue inspection (>90 days) triggers 25 point penalty', () => {
  const res = assessTankHealth({ turbidity: 1.0, tds: 200, tdsBase: 200, days: 100 });
  assert.equal(res.score, 75);
  assert(res.reasons.some(r => r.includes('inspection overdue')));
});

runTest('Maintenance', 'Cumulative degradation penalties clamp at minimum 0', () => {
  const res = assessTankHealth({
    turbidity: 10.0, // -30
    tds: 600,        // -20
    tdsBase: 200,
    temp: 35,        // -10
    days: 120,       // -25
    turnover: 0.2    // -15 -> Total penalty = 100
  });
  assert.equal(res.score, 0);
  assert.equal(res.title, 'Inspect and plan maintenance soon');
});

console.log('\n====================================================');
console.log(`Execution Complete: ${passCount}/${totalCount} tests passed successfully.`);
console.log('====================================================\n');
