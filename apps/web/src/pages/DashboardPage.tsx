import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Droplet, Gauge, TestTube, Clock, TrendingDown, TrendingUp, Hand, Map, Activity, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '@hydro-orbit/ui';
import { useAuthStore } from '../stores/authStore';

const mockSensors = [
  { id: '1', type: 'MOISTURE', lastReading: 32, status: 'ONLINE' },
  { id: '2', type: 'MOISTURE', lastReading: 28, status: 'ONLINE' },
  { id: '3', type: 'PH', lastReading: 6.8, status: 'ONLINE' },
  { id: '4', type: 'WATER_LEVEL', lastReading: 1200, status: 'ONLINE' },
];

const mockAlerts = [
  { id: '1', severity: 'WARNING', message: 'Low water level in Tank B', createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: '2', severity: 'CRITICAL', message: 'pH imbalance detected in Zone 3', createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
];

const mockFarms = [
  { id: 'farm-1', name: 'Green Valley Farm', location: 'Kigali, Rwanda', area: 2.5 },
];

interface Sensor {
  id: string;
  type: string;
  lastReading: number;
  status: string;
}

interface Alert {
  id: string;
  severity: string;
  message: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [sensors] = useState<Sensor[]>(mockSensors);
  const [alerts] = useState<Alert[]>(mockAlerts);
  const [farms] = useState(mockFarms);
  const [isLoading, setIsLoading] = useState(true);

  const [summaryData, setSummaryData] = useState([
    { title: 'Soil Moisture', value: '--%', icon: Droplet, color: 'blue', trend: null as string | null, status: 'normal' },
    { title: 'Water Level', value: '-- L', icon: Gauge, color: 'cyan', status: 'good' },
    { title: 'pH Level', value: '--', icon: TestTube, color: 'green', status: 'optimal' },
    { title: 'Last Irrigation', value: 'Never', icon: Clock, color: 'gray', status: 'normal' }
  ]);

  const [recentAlerts, setRecentAlerts] = useState([
    { message: 'No alerts', time: '', severity: 'info', icon: Activity }
  ]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    setTimeout(() => {
      if (sensors && sensors.length > 0) {
        const moistureSensors = sensors.filter((s) => s.type === 'MOISTURE');
        const phSensors = sensors.filter((s) => s.type === 'PH');
        const waterSensors = sensors.filter((s) => s.type === 'WATER_LEVEL');

        const avgMoisture = moistureSensors.length > 0
          ? (moistureSensors.reduce((acc, s) => acc + (s.lastReading || 0), 0) / moistureSensors.length).toFixed(0)
          : '--';
        
        const avgPh = phSensors.length > 0
          ? (phSensors.reduce((acc, s) => acc + (s.lastReading || 0), 0) / phSensors.length).toFixed(1)
          : '--';

        const waterLevel = waterSensors.length > 0
          ? (waterSensors[0]?.lastReading || 0)
          : 0;

        setSummaryData([
          { title: 'Soil Moisture', value: `${avgMoisture}%`, icon: Droplet, color: 'blue', trend: 'down', status: Number(avgMoisture) < 30 ? 'dry' : 'normal' },
          { title: 'Water Level', value: `${waterLevel.toLocaleString()} L`, icon: Gauge, color: 'cyan', status: waterLevel > 500 ? 'good' : 'low' },
          { title: 'pH Level', value: avgPh, icon: TestTube, color: 'green', status: Number(avgPh) >= 6 && Number(avgPh) <= 7 ? 'optimal' : 'imbalanced' },
          { title: 'Last Irrigation', value: '2 hours ago', icon: Clock, color: 'gray', status: 'normal' }
        ]);
      }

      if (alerts && alerts.length > 0) {
        const formattedAlerts = alerts.slice(0, 3).map((alert) => ({
          message: alert.message,
          time: formatTimeAgo(alert.createdAt),
          severity: alert.severity.toLowerCase(),
          icon: alert.severity === 'CRITICAL' ? AlertOctagon : AlertTriangle
        }));
        setRecentAlerts(formattedAlerts);
      }

      setIsLoading(false);
    }, 500);
  }, [sensors, alerts]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const currentFarm = farms && farms.length > 0 ? farms[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sun className="w-8 h-8 text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.name || 'Farmer'}!</h1>
      </div>

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryData.map((card) => (
              <Card key={card.title}>
                <CardContent className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    card.color === 'blue' ? 'bg-blue-100' :
                    card.color === 'cyan' ? 'bg-cyan-100' :
                    card.color === 'green' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    <card.icon className={`w-6 h-6 ${
                      card.color === 'blue' ? 'text-blue-600' :
                      card.color === 'cyan' ? 'text-cyan-600' :
                      card.color === 'green' ? 'text-green-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-xl font-semibold text-gray-900">{card.value}</p>
                  </div>
                  {card.trend === 'down' && (
                    <TrendingDown className="w-4 h-4 text-red-500 ml-auto" />
                  )}
                  {card.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader title="Soil Moisture Trend (Last 24h)" icon={<TrendingDown className="w-5 h-5" />} />
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Chart visualization</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Quick Actions" />
              <CardContent className="flex gap-3 flex-wrap">
                <Link to="/dashboard/irrigation" className="flex-1 flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">
                  <Hand className="w-5 h-5" />
                  <span>Manual Water</span>
                </Link>
                <Link to={currentFarm ? `/dashboard/farm/${currentFarm.id}` : '/dashboard/create-farm'} className="flex-1 flex items-center justify-center gap-2 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                  <Map className="w-5 h-5" />
                  <span>View Farm</span>
                </Link>
                <Link to="/dashboard/sensors" className="flex-1 flex items-center justify-center gap-2 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                  <Activity className="w-5 h-5" />
                  <span>Sensors</span>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Recent Alerts" />
              <CardContent className="space-y-3">
                {recentAlerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <alert.icon className={`w-5 h-5 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-500' :
                      alert.severity === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      {alert.time && <p className="text-xs text-gray-500">{alert.time}</p>}
                    </div>
                    <Badge variant={
                      alert.severity === 'critical' ? 'danger' :
                      alert.severity === 'warning' ? 'warning' :
                      'info'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                <Link to="/dashboard/alerts" className="block text-center text-sm text-emerald-600 hover:underline mt-2">
                  View all alerts
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
