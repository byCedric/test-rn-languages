import { spawn } from 'node:child_process';
import { env } from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';

import { HERMES_DIR, RESULTS_DIR, ROOT_DIR, TEST262_DIR, THREADS } from './utils/constants';
import { getGitCommit } from './utils/git';

runTest262()
  .then(() => console.log('Done!'))
  .catch((error) => {
    console.error('Error running test262:', error);
    process.exit(1);
  });

async function runTest262() {
  // Ensure the results directory exists
  fs.mkdirSync(path.dirname(RESULTS_DIR), { recursive: true });
  // Run the tests on Hermes
  await streamTestToOutput();
}

async function streamTestToOutput() {
  const hermesCommit = getGitCommit(HERMES_DIR);
  const test262Commit = getGitCommit(TEST262_DIR);

  const tests = new Map<string, any>();
  const child = spawn(
    'bun', [
      'test262-harness', 
      'test262/test/language/**/*.js',
      `--threads=${THREADS}`,
      '--reporter=json',
      '--host-type=hermes',
      '--host-path=./hermes/build/bin/hermes',
      '--host-args="-Xmicrotask-queue"', // New Arch feature'
    ], 
    { cwd: ROOT_DIR }
  );

  child.stderr.setEncoding('utf8');
  child.stdout.setEncoding('utf8');

  await new Promise<void>((resolve, reject) => {
    // Read the data, line by line
    const childLines = readline.createInterface({ input: child.stdout });

    // Handle the process exiting
    child.once('close', (code) => {
      childLines.close();
      if (code === 0) { resolve(); } else { reject(); }
    });

    // Handle test result received
    childLines.on('line', (data) => {
      let line = data.toString().trim();
      try {
        // Check if data is delimiter JSON token
        if (!line || line === '[' || line === ']') return;
        // Filter out starting comma separators
        line = line.replace(/^,/, '');

        // Parse the JSON entry, representing test result for a single test
        const test = JSON.parse(line);
        // Add the test to the test results
        tests.set(test.file, test);

        // Log the test result
        console.log(test.result.pass ? '✅' : '❌', test.file);
      } catch (error) {
        console.log({ line });
        console.error(error);
        process.exit(1)
      }
    });
  });

  const outputData = {
    hermes: hermesCommit,
    test262: test262Commit,
    reactNative: env.REACT_NATIVE_VERSION || null,
    summary: {
      total: tests.size,
      passing: [...tests.values()].filter((test) => test.result.pass).length,
      failing: [...tests.values()].filter((test) => !test.result.pass).length,
    },
    tests: Object.fromEntries(tests.entries()),
  };

  fs.promises.writeFile(
    path.join(RESULTS_DIR, `hermes-${hermesCommit}-test262-${test262Commit}.json`), 
    JSON.stringify(outputData, null, 2)
  );
}
