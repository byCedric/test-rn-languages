import { spawnSync } from 'node:child_process';

export function getGitCommit(cwd: string) {
  const { stdout } = spawnSync('git', ['rev-parse', 'HEAD'], { cwd });
  return stdout.toString().trim();
}
