import { Waves, TestTube, Thermometer, Droplets, Battery, Wifi, Activity } from 'lucide-react';
import { Card, CardContent, Badge } from '@hydro-orbit/ui';
import { useSensorReadings, useSolarStatus, useSensorHistory } from '../hooks/useApi';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const zoneIcons: Record<string, any> = { 'zone-a': Waves, 'zone-b': TestTube, 'zone-c': Thermometer };

export default function SensorsPage() {
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
        <div className="p-3 bg-emerald-100 rounded-lg">
          <Activity className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sensor Network</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {readings.map((r: any) => {
          const Icon = zoneIcons[r.zoneId] || Waves;
          const statusColor = r.status === 'critical' ? 'bg-red-100 text-red-600' : r.status === 'low' ? 'bg-yellow-100 text-yellow-600' : 'bg-emerald-100 text-emerald-600';
          return (
            <Card key={r.zoneId}>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${statusColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant={r.status === 'critical' ? 'danger' : r.status === 'low' ? 'warning' : 'success'}>
                    {r.status}
                  </Badge>
                </div>
                <p className="font-medium text-lg mb-3">{r.zoneName}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Moisture</span>
                      <span className={`font-semibold ${r.moisture < 25 ? 'text-red-600' : r.moisture < 40 ? 'text-yellow-600' : 'text-emerald-600'}`}>{r.moisture}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className={`h-1.5 rounded-full transition-all ${r.moisture < 25 ? 'bg-red-500' : r.moisture < 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, r.moisture)}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">pH Level</span>
                    <span className="font-semibold">{r.pH.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Temperature</span>
                    <span className="font-semibold">{r.temperature}°C</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Humidity</span>
                    <span className="font-semibold">{r.humidity}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                  <Wifi className="w-4 h-4 text-green-500" />
                  Connected
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent>
          <p className="font-medium mb-4">Moisture & pH Trend (24h)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[4, 8]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#059669" strokeWidth={2} dot={false} name="Moisture %" />
                <Line yAxisId="right" type="monotone" dataKey="pH" stroke="#8b5cf6" strokeWidth={2} dot={false} name="pH" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <Droplets className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{readings.length}</p>
            <p className="text-sm text-gray-500">Active Sensors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <Battery className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{solar?.batteryLevel || 0}%</p>
            <p className="text-sm text-gray-500">System Battery</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <Wifi className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">100%</p>
            <p className="text-sm text-gray-500">Uptime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
