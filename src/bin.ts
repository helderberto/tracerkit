import { run } from './cli.ts';

const output = run(process.argv.slice(2));
for (const line of output) {
  console.log(line);
}
