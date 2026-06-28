import { Link } from 'react-router-dom';
import { Sun, Droplet, Gauge, Clock, TrendingDown, TrendingUp, Hand, Map, Activity, AlertTriangle, AlertOctagon, Zap, CloudRain, Sprout } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '@hydro-orbit/ui';
import { useAuthStore } from '../stores/authStore';
import { useSensorReadings, useTankStatus, useSolarStatus, useAlerts, useIrrigationStatus, useSensorHistory } from '../hooks/useApi';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: sensorData } = useSensorReadings();
  const { data: tank } = useTankStatus();
  const { data: solar } = useSolarStatus();
  const { data: alertsData } = useAlerts();
  const { data: irrigation } = useIrrigationStatus();
  const { data: history } = useSensorHistory(24);

  const readings = sensorData?.readings || [];
  const alerts = alertsData?.alerts || [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const avgMoisture = readings.length > 0 ? Math.round(readings.reduce((s: number, r: any) => s + r.moisture, 0) / readings.length) : 0;
  const mainStatus = avgMoisture < 25 ? 'critical' : avgMoisture < 40 ? 'low' : avgMoisture > 75 ? 'high' : 'normal';

  const chartData = (history || []).filter((_: any, i: number) => i % 3 === 0).slice(-60).map((h: any) => ({
    time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    moisture: h.moisture,
    temperature: h.temperature,
  }));

  const tankColor = tank ? (tank.percent < 20 ? 'text-red-500' : tank.percent < 40 ? 'text-yellow-500' : 'text-emerald-500') : 'text-gray-400';
  const moistureColor = avgMoisture < 25 ? 'text-red-500' : avgMoisture < 40 ? 'text-yellow-500' : 'text-emerald-500';

  const formatTimeAgo = (dateStr: number | string | Date) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sun className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.name || 'Farmer'}!</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${mainStatus === 'normal' ? 'bg-emerald-500' : mainStatus === 'low' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500 capitalize">{mainStatus === 'normal' ? 'All systems normal' : mainStatus === 'low' ? 'Needs attention' : 'Alert'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${avgMoisture < 25 ? 'bg-red-100' : avgMoisture < 40 ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <Droplet className={`w-6 h-6 ${avgMoisture < 25 ? 'text-red-600' : avgMoisture < 40 ? 'text-yellow-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Soil Moisture</p>
              <p className={`text-xl font-semibold ${moistureColor}`}>{avgMoisture}%</p>
              <p className="text-xs text-gray-400">Across {readings.length} zones</p>
            </div>
            {avgMoisture < 30 && <TrendingDown className="w-4 h-4 text-red-500 ml-auto" />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${tank && tank.percent < 20 ? 'bg-red-100' : tank && tank.percent < 40 ? 'bg-yellow-100' : 'bg-cyan-100'}`}>
              <Gauge className={`w-6 h-6 ${tank && tank.percent < 20 ? 'text-red-600' : tank && tank.percent < 40 ? 'text-yellow-600' : 'text-cyan-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Water Tank</p>
              <p className={`text-xl font-semibold ${tankColor}`}>{tank?.percent || 0}%</p>
              <p className="text-xs text-gray-400">{tank?.level?.toLocaleString() || 0} / {tank?.capacity?.toLocaleString() || 0} L</p>
            </div>
            {tank && tank.percent < 30 && <TrendingDown className="w-4 h-4 text-red-500 ml-auto" />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${solar?.isCharging ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Zap className={`w-6 h-6 ${solar?.isCharging ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Solar Power</p>
              <p className="text-xl font-semibold text-gray-900">{solar?.power || 0}W</p>
              <p className="text-xs text-gray-400">Battery: {solar?.batteryLevel || 0}%</p>
            </div>
            {solar?.isCharging && <TrendingUp className="w-4 h-4 text-green-500 ml-auto" />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${irrigation?.isRaining ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <CloudRain className={`w-6 h-6 ${irrigation?.isRaining ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Weather</p>
              <p className="text-xl font-semibold text-gray-900">{irrigation?.isRaining ? 'Raining' : 'Clear'}</p>
              <p className="text-xs text-gray-400">{Math.round(readings[0]?.temperature || 25)}°C / {Math.round(readings[0]?.humidity || 60)}% RH</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Soil Moisture & Temperature (24h)" icon={<Activity className="w-5 h-5" />} />
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.3}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#9ca3af" domain={[15, 45]} label={{ value: '°C', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area yAxisId="left" type="monotone" dataKey="moisture" stroke="#059669" fill="url(#colorMoisture)" strokeWidth={2} dot={false} name="Moisture %" />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp °C" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Zone Status" icon={<Sprout className="w-5 h-5" />} />
          <CardContent className="space-y-4">
            {readings.map((r: any) => {
              const zIrr = irrigation?.zones.find((z: any) => z.zoneId === r.zoneId);
              const isActive = zIrr?.isActive;
              const zMoistureColor = r.moisture < 25 ? 'bg-red-500' : r.moisture < 40 ? 'bg-yellow-500' : 'bg-emerald-500';
              const barWidth = Math.min(100, Math.max(5, r.moisture));
              return (
                <div key={r.zoneId} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{r.zoneName.split(' - ')[0]}</span>
                    <div className="flex items-center gap-2">
                      {isActive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                      <span className={`text-sm font-semibold ${r.moisture < 25 ? 'text-red-600' : r.moisture < 40 ? 'text-yellow-600' : 'text-emerald-600'}`}>{r.moisture}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${zMoistureColor}`} style={{ width: `${barWidth}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>pH: {r.pH.toFixed(1)}</span>
                    <span>{isActive ? 'Irrigating...' : zIrr?.isAutoMode ? 'Auto' : 'Manual'}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/dashboard/irrigation" className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                <Hand className="w-6 h-6" />
                <span className="text-sm font-medium">Manual Water</span>
              </Link>
              <Link to="/dashboard/farm/farm-1" className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Map className="w-6 h-6" />
                <span className="text-sm font-medium">View Farm</span>
              </Link>
              <Link to="/dashboard/sensors" className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <Activity className="w-6 h-6" />
                <span className="text-sm font-medium">Sensors</span>
              </Link>
              <Link to="/dashboard/history" className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Clock className="w-6 h-6" />
                <span className="text-sm font-medium">History</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recent Alerts" />
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No alerts</p>
            ) : (
              alerts.slice(0, 4).map((alert: any) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${alert.acknowledged ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}>
                  {alert.severity === 'critical' ? <AlertOctagon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{alert.message}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(alert.createdAt)}</p>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))
            )}
            <Link to="/dashboard/alerts" className="block text-center text-sm text-emerald-600 hover:underline mt-2">
              View all alerts
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
