import { argv } from 'node:process';
import fs from 'node:fs';
import assert from 'node:assert';
import path from 'node:path';
import semver from 'semver';

import { RESULTS_DIR } from './utils/constants';

// Load the results
const resultFiles = [
  // react-native@0.75-rc.6
  path.join(RESULTS_DIR, 'hermes-1edbe36ce92fef2c4d427f5c4e104f2758f4b692-test262-feb400c68598138b4e5a056c69b94bc1108d8a51.json'),
  // react-native@0.74.4
  path.join(RESULTS_DIR, 'hermes-7bda0c267e76d11b68a585f84cfdd65000babf85-test262-feb400c68598138b4e5a056c69b94bc1108d8a51.json'),
  // react-native@0.73.9
  path.join(RESULTS_DIR, 'hermes-644c8be78af1eae7c138fa4093fb87f0f4f8db85-test262-feb400c68598138b4e5a056c69b94bc1108d8a51.json'),
  // react-native@0.72.15
  path.join(RESULTS_DIR, 'hermes-3815fec63d1a6667ca3195160d6e12fee6a0d8d5-test262-feb400c68598138b4e5a056c69b94bc1108d8a51.json'),
];
const results = resultFiles.map((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
const versionsOldToNew = results.map((result) => result.reactNative).sort((a, b) => semver.compare(a, b));

console.log(versionsOldToNew);

const diffsPassing = getTestDifferences(getRelevantTests(test => test.result.pass));

console.log('--- Passing:');
for (let i = 0; i < versionsOldToNew.length; i++) {
  if (i === 0) continue;
  
  const versionPrev = versionsOldToNew[i - 1];
  const versionNext = versionsOldToNew[i];

  console.log(`  ${versionPrev} -> ${versionNext}`);
  for (const test of diffsPassing[`${versionPrev} -> ${versionNext}`]) {
    console.log(`    ${test}`);
  }
}

console.log();

const diffsFailing = getTestDifferences(getRelevantTests(test => !test.result.pass));

console.log('--- Failing:');
for (let i = 0; i < versionsOldToNew.length; i++) {
  if (i === 0) continue;
  
  const versionPrev = versionsOldToNew[i - 1];
  const versionNext = versionsOldToNew[i];

  console.log(`  ${versionPrev} -> ${versionNext}`);
  for (const test of diffsFailing[`${versionPrev} -> ${versionNext}`]) {
    console.log(`    ${test}`);
  }
}

function getRelevantTests(filterTest: (test: any) => boolean) {
  const testsByVersion = new Map<string, any>();

  for (const resultForVersion of results) {
    const testsForVersion = new Set<string>();

    testsByVersion.set(resultForVersion.reactNative, testsForVersion);

    for (const test of Object.values(resultForVersion.tests) as any) {
      if (filterTest(test)) {
        testsForVersion.add(convertTestFileToUrl(test.file));
      }
    }
  }

  return testsByVersion;
}

function getTestDifferences(tests: Map<string, any>) {
  const diffs: Record<string, any> = {};

  for (let i = 0; i < versionsOldToNew.length; i++) {
    // Can't compare starting versions
    if (i === 0) continue;

    const versionPrev = versionsOldToNew[i - 1];
    const versionNext = versionsOldToNew[i];

    const testsPrev = tests.get(versionPrev)!;
    const testsNext = tests.get(versionNext)!;

    diffs[`${versionPrev} -> ${versionNext}`] = testsPrev.difference(testsNext) || new Set();
  }

  return diffs;
}

function convertTestFileToUrl(testFile: string) {
  const testPath = testFile.replace('test262/', '');
  return `https://github.com/tc39/test262/tree/main/${testPath}`;
}
