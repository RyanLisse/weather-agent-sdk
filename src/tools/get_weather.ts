import { tool } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { type WeatherObservation, weatherUrl } from '../decide.ts';

/** Deterministic Amsterdam fixture — unit tests pass without network or API key. */
export const FIXTURE_WEATHER: WeatherObservation = {
  city: 'Amsterdam',
  date: '2026-09-21',
  temperatureC: 14,
  precipitationProbability: 72,
};

export async function fetchWeather(input: {
  city: string;
  date: string;
  baseUrl?: string;
  useFixture?: boolean;
}): Promise<WeatherObservation> {
  if (input.useFixture !== false && (!input.baseUrl || process.env.WEATHER_USE_FIXTURE === '1')) {
    return {
      ...FIXTURE_WEATHER,
      city: input.city || FIXTURE_WEATHER.city,
      date: input.date || FIXTURE_WEATHER.date,
    };
  }
  if (!input.baseUrl) {
    return {
      ...FIXTURE_WEATHER,
      city: input.city,
      date: input.date,
    };
  }
  const response = await fetch(weatherUrl(input.baseUrl, input));
  if (!response.ok) throw new Error(`Weather request failed with ${response.status}`);
  return (await response.json()) as WeatherObservation;
}

export const getWeatherTool = tool(
  'get_weather',
  'Fetch weather for a city and date (fixture by default for labs).',
  {
    city: z.string().describe('City name'),
    date: z.string().describe('ISO date YYYY-MM-DD'),
  },
  async (args) => {
    const weather = await fetchWeather({
      city: args.city,
      date: args.date,
      baseUrl: process.env.WEATHER_BASE_URL,
      useFixture: process.env.WEATHER_USE_FIXTURE !== '0',
    });
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(weather) }],
    };
  },
);
