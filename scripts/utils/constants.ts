import path from 'node:path';
import { cpus } from 'node:os';
import { env } from 'node:process';

export const ROOT_DIR = path.resolve(__dirname, '../../');
export const HERMES_DIR = path.resolve(ROOT_DIR, './hermes');
export const TEST262_DIR = path.resolve(ROOT_DIR, './test262');
export const RESULTS_DIR = path.resolve(ROOT_DIR, './_results');

export const THREADS = env.CI === 'true' ? cpus().length - 1 : 4;
