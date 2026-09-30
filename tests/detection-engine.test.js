const assert = require('node:assert/strict');
const { classifyDetection } = require('../js/engine');

const testCases = [
  {
    name: 'Normal flow',
    input: { inlet: 32, level: 64, zones: [10.5, 7, 8, 5], duration: 20 },
    expected: 'Normal'
  },
  {
    name: 'Hidden leak',
    input: { inlet: 44, level: 62, zones: [11, 6, 7, 5], duration: 35 },
    expected: 'Possible hidden leak'
  },
  {
    name: 'Tank overflow',
    input: { inlet: 52, level: 98, zones: [8, 5, 4, 3], duration: 20 },
    expected: 'Possible tank overflow'
  },
  {
    name: 'Sensor mismatch',
    input: { inlet: 25, level: 60, zones: [12, 9, 8, 5], duration: 10 },
    expected: 'Sensor mismatch'
  },
  {
    name: 'Elevated short gap',
    input: { inlet: 40, level: 55, zones: [10, 9, 8, 7], duration: 5 },
    expected: 'Monitor'
  }
];

console.log('Running JolWatch Edge detection engine tests...\n');

for (const test of testCases) {
  const result = classifyDetection(test.input);
  assert.equal(result.type, test.expected, test.name);
  console.log(`PASS: ${test.name.padEnd(20)} → ${result.type}`);
}

console.log('\nAll 5/5 detection engine validation tests passed successfully.');
