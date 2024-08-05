import { spawnSync } from 'node:child_process';
import { argv } from 'node:process';
import assert from 'node:assert';

import { HERMES_DIR } from './utils/constants';

const hermesCommit = argv[2];
assert(!!hermesCommit, 'Expected a Hermes commit hash as first argument');

checkoutHermes(hermesCommit);
buildHermes();

function checkoutHermes(commit: string) {
  // Fetch commits from the Hermes repository
  spawnSync('git', ['fetch'], { stdio: 'inherit', cwd: HERMES_DIR });
  // Checkout the Hermes commit
  spawnSync('git', ['checkout', commit], { stdio: 'inherit', cwd: HERMES_DIR });
}

function buildHermes() {
  // Prepare the build directory and cmake tooling
  spawnSync('cmake', ['-S', '.', '-B', 'build'], { stdio: 'inherit', cwd: HERMES_DIR });
  // Build Hermes from source
  spawnSync('cmake', ['--build', './build', '--target', 'hermes'], { stdio: 'inherit', cwd: HERMES_DIR });
}
 