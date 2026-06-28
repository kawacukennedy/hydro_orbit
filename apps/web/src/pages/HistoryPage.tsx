import { useState } from 'react';
import { CalendarClock, Sprout, Droplet, Gauge, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@hydro-orbit/ui';
import { useIrrigationHistory, useSensorReadings, useTankStatus } from '../hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatDate = (date: Date | string | number) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (date: Date | string | number) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
  const [period, setPeriod] = useState('24h');
  const { data: historyEvents } = useIrrigationHistory();
  const { data: sensorData } = useSensorReadings();
  const { data: tank } = useTankStatus();

  const readings = sensorData?.readings || [];
  const avgMoisture = readings.length > 0 ? Math.round(readings.reduce((s: number, r: any) => s + r.moisture, 0) / readings.length) : 0;

  const mockChartData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    water: Math.round(200 + Math.random() * 300),
    events: Math.round(1 + Math.random() * 4),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <CalendarClock className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Irrigation History</h1>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <Card>
        <CardContent>
          <p className="font-medium mb-4">Water Usage (Last 7 Days)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" label={{ value: 'Liters', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="water" fill="#059669" radius={[4, 4, 0, 0]} name="Water Used (L)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <p className="font-medium">Recent Events</p>
          {(!historyEvents || historyEvents.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-4">No irrigation events recorded</p>
          ) : (
            historyEvents.map((event: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  <Sprout className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{event.zoneName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.trigger === 'AUTO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {event.trigger}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{event.duration} min</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium">{formatDate(event.startTime)}</p>
                  <p className="text-xs text-gray-500">{formatTime(event.startTime)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <Droplet className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">~2,500 L</p>
            <p className="text-xs text-gray-500">Total Water Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{avgMoisture}%</p>
            <p className="text-xs text-gray-500">Avg Moisture</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <Gauge className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{tank?.percent || 0}%</p>
            <p className="text-xs text-gray-500">Tank Level</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
