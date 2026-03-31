#!/usr/bin/env node --experimental-strip-types --no-warnings
import { run } from '../src/cli.ts';

const output = run(process.argv.slice(2));
for (const line of output) {
  console.log(line);
}
