import { Network, Waves, TestTube, Gauge, Battery, BatteryWarning, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, Badge } from '@hydro-orbit/ui';

const mockSensors = [
  { id: 's1', type: 'moisture', location: 'Zone A', value: '32%', battery: 98, status: 'online', icon: Waves },
  { id: 's2', type: 'pH', location: 'Zone A', value: '6.8', battery: 95, status: 'online', icon: TestTube },
  { id: 's3', type: 'waterLevel', location: 'Main Tank', value: '1200L', battery: 100, status: 'online', icon: Gauge },
  { id: 's4', type: 'moisture', location: 'Zone B', value: '20%', battery: 45, status: 'lowBattery', icon: Waves },
  { id: 's5', type: 'pH', location: 'Zone B', value: '7.2', battery: 80, status: 'online', icon: TestTube }
];

export default function SensorsPage() {
  const getBatteryIcon = (battery: number) => {
    if (battery < 20) return <BatteryWarning className="w-4 h-4 text-red-500" />;
    return <Battery className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge variant="success">Online</Badge>;
      case 'offline': return <Badge variant="danger">Offline</Badge>;
      case 'lowBattery': return <Badge variant="warning">Low Battery</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <Network className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sensor Network</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSensors.map((sensor) => (
          <Card key={sensor.id}>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  sensor.status === 'lowBattery' ? 'bg-yellow-100' : 'bg-emerald-100'
                }`}>
                  <sensor.icon className={`w-6 h-6 ${
                    sensor.status === 'lowBattery' ? 'text-yellow-600' : 'text-emerald-600'
                  }`} />
                </div>
                {getStatusBadge(sensor.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ID</span>
                  <span className="font-medium">{sensor.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="font-medium">{sensor.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="capitalize font-medium">{sensor.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Value</span>
                  <span className="font-medium">{sensor.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Battery</span>
                  <div className="flex items-center gap-1">
                    {getBatteryIcon(sensor.battery)}
                    <span className={`font-medium ${
                      sensor.battery < 20 ? 'text-red-500' : ''
                    }`}>{sensor.battery}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                {sensor.status === 'online' ? (
                  <><Wifi className="w-4 h-4 text-green-500" /> Connected</>
                ) : (
                  <><WifiOff className="w-4 h-4 text-red-500" /> Disconnected</>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
