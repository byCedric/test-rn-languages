import { argv } from 'node:process';
import fs from 'node:fs';
import assert from 'node:assert';

// Load the test results
const testResultFile = argv[2];
assert(!!testResultFile, 'Expected the JSON test results as first argument');
const testResults = loadTestResults(testResultFile);

// Log a summary at the start
logSummary(testResults);

// Log the failed tests
console.log(Array.from(testResults.failed).join('\n'));

// Log the passed tests
console.log('\n--- Passed tests');
console.log(Array.from(testResults.passed).join('\n'));

// Log a summary at the end
logSummary(testResults);

function logSummary(testResults) {
  console.log('\n--- Summary');
  console.log('Total tests:', testResults.tests.size);
  console.log('Passed tests:', testResults.passed.size);
  console.log('Failed tests:', testResults.failed.size);
}

function loadTestResults(resultFile: string) {
  const tests = JSON.parse(fs.readFileSync(resultFile, 'utf8')).map((test) => {
    delete test.contents;
    delete test.compiled;
    return test;
  });

  const testMap = new Map<string, any>();
  const passSet = new Set<string>();
  const failSet = new Set<string>();

  for (const test of tests) {
    testMap.set(test.file, test);

    if (test.result.pass) {
      passSet.add(test.file);
    } else {
      failSet.add(test.file);
    }
  }

  return { tests: testMap, passed: passSet, failed: failSet };
}
