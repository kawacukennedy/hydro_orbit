import { CalendarClock, Sprout, AlertTriangle, Activity, Droplet } from 'lucide-react';
import { Card, CardContent, Badge } from '@hydro-orbit/ui';

const mockEvents = [
  { timestamp: new Date(Date.now() - 6 * 60 * 60000).toISOString(), event: 'Irrigation', zone: 'Zone A', duration: '15 min', volume: '75 L', icon: Sprout },
  { timestamp: new Date(Date.now() - 10 * 60 * 60000).toISOString(), event: 'Alert', zone: 'Zone B', message: 'Low moisture (18%)', severity: 'warning', icon: AlertTriangle },
  { timestamp: new Date(Date.now() - 23 * 60 * 60000).toISOString(), event: 'Sensor Reading', zone: 'Zone A', moisture: '32%', pH: '6.8', icon: Activity }
];

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <CalendarClock className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Irrigation History</h1>
      </div>

      <div className="flex gap-4 flex-wrap">
        <select className="px-4 py-2 border rounded-lg">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option>All Zones</option>
          <option>Zone A</option>
          <option>Zone B</option>
          <option>Zone C</option>
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option>All Events</option>
          <option>Irrigation</option>
          <option>Alert</option>
          <option>Sensor Reading</option>
        </select>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {mockEvents.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-lg">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{item.event}</span>
                  {item.event === 'Alert' && (
                    <Badge variant="warning">Warning</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.zone}</p>
                {item.event === 'Irrigation' && (
                  <p className="text-sm text-gray-500">
                    {item.duration} • {item.volume}
                  </p>
                )}
                {item.event === 'Alert' && (
                  <p className="text-sm text-gray-500">{item.message}</p>
                )}
                {item.event === 'Sensor Reading' && (
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> {item.moisture}
                    </span>
                    <span>pH: {item.pH}</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatDate(item.timestamp)}</p>
                <p className="text-sm text-gray-500">{formatTime(item.timestamp)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">2,500 L</p>
            <p className="text-sm text-gray-500">Total Water Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">45%</p>
            <p className="text-sm text-gray-500">Avg Moisture</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500">Irrigation Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
