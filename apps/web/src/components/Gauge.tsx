export default function Gauge({
  value,
  max = 100,
  label,
  unit = '%',
  size = 120,
  strokeWidth = 8,
  color,
  status,
}: {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  status?: 'critical' | 'low' | 'normal' | 'high';
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const statusColor = status
    ? status === 'critical' ? '#ef4444'
      : status === 'low' ? '#f59e0b'
      : status === 'high' ? '#3b82f6'
      : '#10b981'
    : color || '#10b981';

  const statusBg = status
    ? status === 'critical' ? '#fef2f2'
      : status === 'low' ? '#fffbeb'
      : status === 'high' ? '#eff6ff'
      : '#ecfdf5'
    : '#ecfdf5';

  const statusText = status
    ? status === 'critical' ? 'text-red-600'
      : status === 'low' ? 'text-amber-600'
      : status === 'high' ? 'text-blue-600'
      : 'text-emerald-600'
    : 'text-emerald-600';

  const iconColor = status
    ? status === 'critical' ? '#ef4444'
      : status === 'low' ? '#d97706'
      : status === 'high' ? '#2563eb'
      : '#059669'
    : '#059669';

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <svg width={size} height={size} className="drop-shadow-sm">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={statusBg}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={statusColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="gauge-circle"
        />
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="central"
          className={`text-lg font-bold ${statusText}`}
          fill="currentColor"
        >
          {Math.round(value)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 14}
          textAnchor="middle"
          dominantBaseline="central"
          fill={iconColor}
          fontSize="11"
        >
          {unit}
        </text>
      </svg>
      <span className={`text-xs font-medium ${statusText}`}>{label}</span>
    </div>
  );
}
