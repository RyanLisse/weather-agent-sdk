/** Shared decision contract — promoted from Academy training-lab/day-01 + day-02/claude-agent-sdk scaffold. */
export type WeatherObservation = {
  city: string;
  date: string;
  temperatureC: number;
  precipitationProbability: number;
};

export const decideWeather = (weather: WeatherObservation): 'bring umbrella' | 'leave umbrella' =>
  weather.precipitationProbability >= 60 ? 'bring umbrella' : 'leave umbrella';

/** Clothing hint derived from the same observation (mini-quest parity with Arcade L1). */
export const clothingAdvice = (weather: WeatherObservation): string => {
  const parts: string[] = [];
  if (weather.temperatureC < 12) parts.push('jas aan');
  else if (weather.temperatureC < 18) parts.push('lichte jas of trui');
  else parts.push('geen jas nodig');
  parts.push(decideWeather(weather) === 'bring umbrella' ? 'paraplu mee' : 'geen paraplu');
  return parts.join('; ');
};

export const weatherUrl = (baseUrl: string, { city, date }: { city: string; date: string }) =>
  `${baseUrl.replace(/\/$/, '')}/weather?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}`;
