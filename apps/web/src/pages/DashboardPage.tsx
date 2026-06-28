import { Link } from 'react-router-dom';
import { Sun, Gauge, Activity, AlertTriangle, AlertOctagon, Hand, Map, Clock, Sprout } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '@hydro-orbit/ui';
import { useAuthStore } from '../stores/authStore';
import { useSensorReadings, useTankStatus, useSolarStatus, useAlerts, useIrrigationStatus, useSensorHistory } from '../hooks/useApi';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GaugeChart from '../components/Gauge';
import TankVisual from '../components/TankVisual';
import WeatherWidget from '../components/WeatherWidget';
import SystemHealth from '../components/SystemHealth';

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-200">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.name || 'Farmer'}!</h1>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          mainStatus === 'normal' ? 'bg-emerald-50 text-emerald-700' : mainStatus === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
        }`}>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
            mainStatus === 'normal' ? 'bg-emerald-500' : mainStatus === 'low' ? 'bg-amber-500' : 'bg-red-500 animate-ping'
          }`} />
          <span className="text-sm font-medium capitalize">
            {mainStatus === 'normal' ? 'All systems normal' : mainStatus === 'low' ? 'Needs attention' : 'Critical alert'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="flex items-center justify-center py-4">
            <GaugeChart
              value={avgMoisture}
              label="Soil Moisture"
              unit="%"
              size={110}
              status={avgMoisture < 25 ? 'critical' : avgMoisture < 40 ? 'low' : avgMoisture > 75 ? 'high' : 'normal'}
            />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="flex items-center justify-center py-4">
            <GaugeChart
              value={tank?.percent || 0}
              label="Water Tank"
              unit="%"
              size={110}
              status={tank && tank.percent < 20 ? 'critical' : tank && tank.percent < 40 ? 'low' : 'normal'}
            />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="flex items-center justify-center py-4">
            <GaugeChart
              value={solar?.batteryLevel || 0}
              label="Battery"
              unit="%"
              size={110}
              status={solar && solar.batteryLevel < 15 ? 'critical' : solar && solar.batteryLevel < 30 ? 'low' : 'normal'}
            />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="flex items-center justify-center py-4">
            <GaugeChart
              value={solar?.power || 0}
              label="Solar Output"
              unit="W"
              size={110}
              status={solar && solar.power < 10 ? 'low' : 'normal'}
            />
          </CardContent>
        </Card>
      </div>

      <SystemHealth
        batteryLevel={solar?.batteryLevel || 0}
        solarPower={solar?.power || 0}
        isCharging={solar?.isCharging || false}
        totalSensors={readings.length}
        onlineSensors={readings.length}
        activeIrrigations={irrigation?.zones.filter((z: any) => z.isActive).length || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 card-hover">
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
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Area yAxisId="left" type="monotone" dataKey="moisture" stroke="#059669" fill="url(#colorMoisture)" strokeWidth={2} dot={false} name="Moisture %" />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp °C" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="card-hover">
            <CardHeader title="Weather" icon={<Sun className="w-5 h-5" />} />
            <CardContent className="flex justify-center py-4">
              <WeatherWidget
                temperature={Math.round(readings[0]?.temperature || 25)}
                humidity={Math.round(readings[0]?.humidity || 60)}
                isRaining={irrigation?.isRaining || false}
              />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader title="Water Tank" icon={<Gauge className="w-5 h-5" />} />
            <CardContent className="flex justify-center py-2">
              <TankVisual
                level={tank?.level || 0}
                capacity={tank?.capacity || 5000}
                percent={tank?.percent || 0}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader title="Zone Status" icon={<Sprout className="w-5 h-5" />} />
          <CardContent className="space-y-4">
            {readings.map((r: any) => {
              const zIrr = irrigation?.zones.find((z: any) => z.zoneId === r.zoneId);
              const isActive = zIrr?.isActive;
              const zMoistureColor = r.moisture < 25 ? 'bg-red-500' : r.moisture < 40 ? 'bg-yellow-500' : 'bg-emerald-500';
              const barWidth = Math.min(100, Math.max(5, r.moisture));
              return (
                <div key={r.zoneId} className="p-3 bg-gray-50 rounded-xl transition-all hover:bg-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{r.zoneName.split(' - ')[0]}</span>
                    <div className="flex items-center gap-2">
                      {isActive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
                      <span className={`text-sm font-semibold ${r.moisture < 25 ? 'text-red-600' : r.moisture < 40 ? 'text-yellow-600' : 'text-emerald-600'}`}>{r.moisture}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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

        <Card className="card-hover">
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/dashboard/irrigation" className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all hover:scale-105">
                <Hand className="w-6 h-6" />
                <span className="text-sm font-medium">Manual Water</span>
              </Link>
              <Link to="/dashboard/farm/farm-1" className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all hover:scale-105">
                <Map className="w-6 h-6" />
                <span className="text-sm font-medium">View Farm</span>
              </Link>
              <Link to="/dashboard/sensors" className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all hover:scale-105">
                <Activity className="w-6 h-6" />
                <span className="text-sm font-medium">Sensors</span>
              </Link>
              <Link to="/dashboard/history" className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all hover:scale-105">
                <Clock className="w-6 h-6" />
                <span className="text-sm font-medium">History</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader title="Recent Alerts" />
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Sprout className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm text-gray-500">No alerts - all clear!</p>
              </div>
            ) : (
              alerts.slice(0, 4).map((alert: any) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  alert.acknowledged ? 'bg-gray-50' : 'bg-white border border-gray-200 shadow-sm'
                }`}>
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
            <Link to="/dashboard/alerts" className="block text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline mt-2">
              View all alerts →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
