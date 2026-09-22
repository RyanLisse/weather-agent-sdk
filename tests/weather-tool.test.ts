import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { clothingAdvice, decideWeather } from '../src/decide.ts';
import { fetchWeatherDecision, loadInstructions } from '../src/agent.ts';
import { FIXTURE_WEATHER, fetchWeather } from '../src/tools/get_weather.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('fixture weather tool works without API key or network', async () => {
  const weather = await fetchWeather({ city: 'Amsterdam', date: '2026-09-21', useFixture: true });
  assert.equal(weather.precipitationProbability, FIXTURE_WEATHER.precipitationProbability);
  assert.equal(decideWeather(weather), 'bring umbrella');
});

test('fetchWeatherDecision shares day-02 scaffold contract', async () => {
  const result = await fetchWeatherDecision({ city: 'Amsterdam', date: '2026-09-21', useFixture: true });
  assert.equal(result.decision, 'bring umbrella');
  assert.match(result.clothing, /paraplu/i);
});

test('instructions.md is the editable quest hook (clothing)', () => {
  const text = loadInstructions();
  assert.match(text, /kledingadvies|clothing advice|jas|paraplu/i);
  const onDisk = readFileSync(join(root, 'instructions.md'), 'utf8');
  assert.equal(text, onDisk);
});

test('clothingAdvice is instruction-parity helper (no new tool)', () => {
  const coldWet = clothingAdvice({
    city: 'Amsterdam',
    date: '2026-09-21',
    temperatureC: 8,
    precipitationProbability: 80,
  });
  assert.match(coldWet, /jas/i);
  assert.match(coldWet, /paraplu/i);
});
