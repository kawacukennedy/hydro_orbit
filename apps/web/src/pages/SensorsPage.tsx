import { useState } from 'react';
import { Waves, TestTube, Thermometer, Droplets, Battery, Activity } from 'lucide-react';
import { Card, CardContent, Badge } from '@hydro-orbit/ui';
import { useSensorReadings, useSolarStatus, useSensorHistory } from '../hooks/useApi';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Gauge from '../components/Gauge';

const zoneIcons: Record<string, any> = { 'zone-a': Waves, 'zone-b': TestTube, 'zone-c': Thermometer };

export default function SensorsPage() {
  const [selectedParam, setSelectedParam] = useState<'moisture' | 'pH'>('moisture');
  const { data: sensorData } = useSensorReadings();
  const { data: solar } = useSolarStatus();
  const { data: history } = useSensorHistory(24);

  const readings = sensorData?.readings || [];

  const chartData = (history || []).filter((_: any, i: number) => i % 6 === 0).slice(-48).map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    moisture: h.moisture,
    pH: h.pH,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sensor Network</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {readings.map((r: any) => {
          const Icon = zoneIcons[r.zoneId] || Waves;
          return (
            <Card key={r.zoneId} className="card-hover overflow-hidden">
              <div className={`h-1.5 w-full ${
                r.status === 'critical' ? 'bg-red-500' : r.status === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    r.status === 'critical' ? 'bg-red-50 text-red-600' : r.status === 'low' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant={r.status === 'critical' ? 'danger' : r.status === 'low' ? 'warning' : 'success'}>
                    {r.status}
                  </Badge>
                </div>
                <p className="font-medium text-lg mb-4">{r.zoneName}</p>
                <div className="flex justify-center mb-4">
                  <Gauge
                    value={r.moisture}
                    label="Moisture"
                    size={90}
                    status={r.moisture < 25 ? 'critical' : r.moisture < 40 ? 'low' : 'normal'}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">pH</p>
                    <p className="text-sm font-semibold">{r.pH.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Temp</p>
                    <p className="text-sm font-semibold">{r.temperature}°C</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Humidity</p>
                    <p className="text-sm font-semibold">{r.humidity}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="card-hover">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">Moisture & pH Trend (24h)</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedParam('moisture')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedParam === 'moisture' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Moisture
              </button>
              <button
                onClick={() => setSelectedParam('pH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedParam === 'pH' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                pH
              </button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[4, 8]} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                {selectedParam === 'moisture' && (
                  <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#059669" strokeWidth={2} dot={false} name="Moisture %" />
                )}
                <Line yAxisId="right" type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2} dot={false} name="pH" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-hover">
          <CardContent className="flex flex-col items-center py-6">
            <div className="p-3 rounded-full bg-emerald-100 mb-3">
              <Droplets className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{readings.length}</p>
            <p className="text-sm text-gray-500">Active Sensors</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex flex-col items-center py-6">
            <div className="p-3 rounded-full bg-amber-100 mb-3">
              <Battery className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{solar?.batteryLevel || 0}%</p>
            <p className="text-sm text-gray-500">System Battery</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="flex flex-col items-center py-6">
            <div className="p-3 rounded-full bg-emerald-100 mb-3">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">100%</p>
            <p className="text-sm text-gray-500">Uptime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
