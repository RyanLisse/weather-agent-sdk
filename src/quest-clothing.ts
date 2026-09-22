import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchWeatherDecision } from './agent.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const instructions = readFileSync(join(root, 'instructions.md'), 'utf8');

if (!/kleding|clothing|jas|paraplu/i.test(instructions)) {
  console.error('Mini-quest incomplete: add clothing advice to instructions.md');
  process.exit(1);
}

const result = await fetchWeatherDecision({
  city: 'Amsterdam',
  date: '2026-09-21',
  useFixture: true,
});

console.log('instructions hook: clothing advice present');
console.log(result);
console.log('quest clothing line:', result.clothing);
