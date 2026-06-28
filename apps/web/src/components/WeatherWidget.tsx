import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';

export default function WeatherWidget({
  temperature,
  humidity,
  isRaining,
}: {
  temperature: number;
  humidity: number;
  isRaining: boolean;
}) {
  const WeatherIcon = isRaining ? CloudRain : temperature > 30 ? Sun : Cloud;
  const iconColor = isRaining ? 'text-blue-500' : temperature > 30 ? 'text-amber-500' : 'text-gray-500';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <WeatherIcon className={`w-12 h-12 ${iconColor}`} />
        {isRaining && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>
        )}
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{temperature}°C</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{humidity}%</span>
          <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{Math.round(humidity * 0.4 + 3)}km/h</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600">{isRaining ? 'Light Rain' : 'Clear Sky'}</span>
    </div>
  );
}
