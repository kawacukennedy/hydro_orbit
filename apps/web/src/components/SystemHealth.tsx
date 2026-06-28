import { Battery, Wifi, Zap, Cpu, Activity } from 'lucide-react';

export default function SystemHealth({
  batteryLevel,
  solarPower,
  isCharging,
  totalSensors,
  onlineSensors,
  activeIrrigations,
}: {
  batteryLevel: number;
  solarPower: number;
  isCharging: boolean;
  totalSensors: number;
  onlineSensors: number;
  activeIrrigations: number;
}) {
  const batteryStatus = batteryLevel < 15 ? 'critical' : batteryLevel < 30 ? 'low' : 'normal';
  const connectivity = onlineSensors === totalSensors ? 'normal' : onlineSensors > 0 ? 'low' : 'critical';

  const items = [
    {
      icon: isCharging ? Zap : Battery,
      label: 'Power',
      value: isCharging ? `${solarPower}W · Charging` : `${batteryLevel}% Battery`,
      color: batteryStatus === 'critical' ? 'text-red-500' : batteryStatus === 'low' ? 'text-amber-500' : 'text-emerald-500',
      bg: batteryStatus === 'critical' ? 'bg-red-50' : batteryStatus === 'low' ? 'bg-amber-50' : 'bg-emerald-50',
      pulse: isCharging,
    },
    {
      icon: Activity,
      label: 'Irrigation',
      value: `${activeIrrigations} active zone${activeIrrigations !== 1 ? 's' : ''}`,
      color: activeIrrigations > 0 ? 'text-blue-500' : 'text-gray-400',
      bg: activeIrrigations > 0 ? 'bg-blue-50' : 'bg-gray-50',
      pulse: activeIrrigations > 0,
    },
    {
      icon: Wifi,
      label: 'Connectivity',
      value: `${onlineSensors}/${totalSensors} sensors online`,
      color: connectivity === 'normal' ? 'text-emerald-500' : connectivity === 'low' ? 'text-amber-500' : 'text-red-500',
      bg: connectivity === 'normal' ? 'bg-emerald-50' : connectivity === 'low' ? 'bg-amber-50' : 'bg-red-50',
      pulse: false,
    },
    {
      icon: Cpu,
      label: 'System',
      value: 'All systems operational',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      pulse: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div key={i} className={`${item.bg} rounded-xl p-4 flex flex-col items-center text-center gap-2`}>
          <div className="relative">
            <item.icon className={`w-6 h-6 ${item.color}`} />
            {item.pulse && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
