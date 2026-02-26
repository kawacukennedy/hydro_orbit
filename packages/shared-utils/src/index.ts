export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${formatTime(d)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(d);
}

export function formatVolume(liters: number): string {
  if (liters >= 1000) {
    return `${(liters / 1000).toFixed(1)} kL`;
  }
  return `${liters} L`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export enum SensorType {
  MOISTURE = 'MOISTURE',
  PH = 'PH',
  WATER_LEVEL = 'WATER_LEVEL',
}

export function getSensorUnit(type: SensorType | string): string {
  switch (type) {
    case SensorType.MOISTURE:
      return '%';
    case SensorType.PH:
      return 'pH';
    case SensorType.WATER_LEVEL:
      return 'L';
    default:
      return '';
  }
}

export function getSensorLabel(type: SensorType | string): string {
  switch (type) {
    case SensorType.MOISTURE:
      return 'Soil Moisture';
    case SensorType.PH:
      return 'pH Level';
    case SensorType.WATER_LEVEL:
      return 'Water Level';
    default:
      return 'Unknown';
  }
}

export function isValidSensorValue(type: SensorType | string, value: number): boolean {
  switch (type) {
    case SensorType.MOISTURE:
      return value >= 0 && value <= 100;
    case SensorType.PH:
      return value >= 0 && value <= 14;
    case SensorType.WATER_LEVEL:
      return value >= 0;
    default:
      return false;
  }
}

export function getSensorStatus(battery: number, lastReadingAge: number): 'ONLINE' | 'OFFLINE' | 'LOW_BATTERY' {
  if (battery < 20) return 'LOW_BATTERY';
  if (lastReadingAge > 3600000) return 'OFFLINE';
  return 'ONLINE';
}

export function calculateAverageReading(readings: number[]): number {
  if (readings.length === 0) return 0;
  return readings.reduce((a, b) => a + b, 0) / readings.length;
}

export function calculateTrend(readings: number[]): 'up' | 'down' | 'stable' {
  if (readings.length < 2) return 'stable';
  const recent = readings.slice(-5);
  const avg = calculateAverageReading(recent);
  const last = recent[recent.length - 1];
  const diff = last - avg;
  if (Math.abs(diff) < 2) return 'stable';
  return diff > 0 ? 'up' : 'down';
}
