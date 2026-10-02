import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSdkMcpServer, query } from '@anthropic-ai/claude-agent-sdk';
import { clothingAdvice, decideWeather, type WeatherObservation } from './decide.ts';
import { isMainModule } from './is-main.ts';
import { fetchWeather, getWeatherTool } from './tools/get_weather.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const loadInstructions = (path = join(root, 'instructions.md')) =>
  readFileSync(path, 'utf8');

/** Pure lab path — no model spend. Mirrors day-02 scaffold `fetchWeatherDecision`. */
export async function fetchWeatherDecision(input: {
  city: string;
  date: string;
  baseUrl?: string;
  useFixture?: boolean;
}): Promise<{ weather: WeatherObservation; decision: string; clothing: string }> {
  const weather = await fetchWeather(input);
  return {
    weather,
    decision: decideWeather(weather),
    clothing: clothingAdvice(weather),
  };
}

export function weatherMcpServer() {
  return createSdkMcpServer({
    name: 'weather-agent-sdk',
    version: '0.1.0',
    tools: [getWeatherTool],
  });
}

/** Live SDK path — requires ANTHROPIC_API_KEY (env only). */
export async function runWeatherAgent(prompt: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Set ANTHROPIC_API_KEY in the environment. No secrets in git.');
  }
  const server = weatherMcpServer();
  const instructions = loadInstructions();
  const messages: unknown[] = [];
  for await (const message of query({
    prompt,
    options: {
      systemPrompt: instructions,
      mcpServers: { weather: server },
      allowedTools: ['mcp__weather__get_weather'],
      permissionMode: 'bypassPermissions',
    },
  })) {
    messages.push(message);
  }
  return messages;
}

if (isMainModule(import.meta.url, process.argv[1])) {
  const city = process.argv[2] || 'Amsterdam';
  const date = process.argv[3] || '2026-09-21';
  const result = await fetchWeatherDecision({ city, date, useFixture: true });
  console.log(JSON.stringify(result, null, 2));
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('\n— live SDK run —');
    const live = await runWeatherAgent(`Wat is het weer in ${city} op ${date}? Geef kledingadvies.`);
    console.log(JSON.stringify(live.slice(-3), null, 2));
  } else {
    console.log('\n(Tip) Set ANTHROPIC_API_KEY to exercise the Claude Agent SDK query path.');
  }
}
