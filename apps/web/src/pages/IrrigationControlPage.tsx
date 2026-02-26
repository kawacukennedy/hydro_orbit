import { useState } from 'react';
import { Sprout, Bot, User, Calendar, Droplet } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@hydro-orbit/ui';

const mockModes = [
  { label: 'Auto (AI)', value: 'auto', icon: Bot, description: 'System decides based on soil and weather' },
  { label: 'Manual', value: 'manual', icon: User, description: 'You control when to water' },
  { label: 'Schedule', value: 'schedule', icon: Calendar, description: 'Set specific times' }
];

const mockZones = [
  { name: 'Zone A', moisture: '32%' },
  { name: 'Zone B', moisture: '20%' }
];

const mockSchedules = [
  { zone: 'Zone A', days: ['Mon', 'Wed', 'Fri'], time: '06:00', duration: 15, enabled: true },
  { zone: 'Zone B', days: ['Tue', 'Thu', 'Sat'], time: '18:00', duration: 20, enabled: true }
];

export default function IrrigationControlPage() {
  const [mode, setMode] = useState('auto');
  const [manualDuration, setManualDuration] = useState<Record<string, number>>({});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <Sprout className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Irrigation Control</h1>
      </div>

      <Card>
        <CardHeader title="Mode" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockModes.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  mode === m.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <m.icon className={`w-5 h-5 ${mode === m.value ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{m.label}</span>
                </div>
                <p className="text-sm text-gray-500">{m.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {mode === 'manual' && (
        <Card>
          <CardHeader title="Manual Control" />
          <CardContent className="space-y-4">
            {mockZones.map((zone) => (
              <div key={zone.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-sm text-gray-500">Moisture: {zone.moisture}</p>
                  </div>
                  <Button size="sm">
                    <Droplet className="w-4 h-4 mr-1" />
                    Water
                  </Button>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={manualDuration[zone.name] || 0}
                  onChange={(e) => setManualDuration({ ...manualDuration, [zone.name]: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Water for: {manualDuration[zone.name] || 0} min
                </p>
              </div>
            ))}
            <Button className="w-full">Water All Zones</Button>
          </CardContent>
        </Card>
      )}

      {mode === 'schedule' && (
        <Card>
          <CardHeader title="Schedules" />
          <CardContent className="space-y-4">
            {mockSchedules.map((schedule, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{schedule.zone}</p>
                  <p className="text-sm text-gray-500">
                    {schedule.days.join(', ')} at {schedule.time} • {schedule.duration} min
                  </p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule.enabled}
                    onChange={() => {}}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              </div>
            ))}
            <Button variant="outline" className="w-full">+ Add Schedule</Button>
          </CardContent>
        </Card>
      )}

      {mode === 'auto' && (
        <Card>
          <CardHeader title="AI Settings" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Dry Threshold</p>
                <p className="font-medium">30%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Wet Threshold</p>
                <p className="font-medium">70%</p>
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              <span>Use weather forecast</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              <span>Learn from history</span>
            </label>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="text-center py-4">
          <p className="text-gray-500">Current Status</p>
          <p className="text-xl font-semibold text-gray-900">Idle</p>
        </CardContent>
      </Card>
    </div>
  );
}
