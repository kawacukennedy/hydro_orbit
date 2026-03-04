import { Network, Waves, TestTube, Gauge, Battery, BatteryWarning, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent, Badge } from '@hydro-orbit/ui';
import { useSensors } from '../hooks/useApi';
import { SensorType, SensorStatus } from '@hydro-orbit/shared-types';

export default function SensorsPage() {
  const { data: sensors } = useSensors();

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case SensorType.MOISTURE: return Waves;
      case SensorType.PH: return TestTube;
      case SensorType.WATER_LEVEL: return Gauge;
      default: return Waves;
    }
  };
  const getBatteryIcon = (battery: number) => {
    if (battery < 20) return <BatteryWarning className="w-4 h-4 text-red-500" />;
    return <Battery className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (status: SensorStatus) => {
    switch (status) {
      case SensorStatus.ONLINE: return <Badge variant="success">Online</Badge>;
      case SensorStatus.OFFLINE: return <Badge variant="danger">Offline</Badge>;
      case SensorStatus.LOW_BATTERY: return <Badge variant="warning">Low Battery</Badge>;
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
        {sensors?.map((sensor) => {
          const Icon = getSensorIcon(sensor.type);
          return (
            <Card key={sensor.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${sensor.status === SensorStatus.LOW_BATTERY ? 'bg-yellow-100' : 'bg-emerald-100'
                    }`}>
                    <Icon className={`w-6 h-6 ${sensor.status === SensorStatus.LOW_BATTERY ? 'text-yellow-600' : 'text-emerald-600'
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
                    <span className="font-medium">{sensor.zoneId || sensor.farmId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="capitalize font-medium">{sensor.type.toLowerCase().replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Value</span>
                    <span className="font-medium">{sensor.lastReading || 'N/A'} {sensor.type === SensorType.MOISTURE ? '%' : sensor.type === SensorType.WATER_LEVEL ? 'L' : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Battery</span>
                    <div className="flex items-center gap-1">
                      {getBatteryIcon(sensor.battery || 0)}
                      <span className={`font-medium ${(sensor.battery || 0) < 20 ? 'text-red-500' : ''
                        }`}>{sensor.battery || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                  {sensor.status === SensorStatus.ONLINE ? (
                    <><Wifi className="w-4 h-4 text-green-500" /> Connected</>
                  ) : (
                    <><WifiOff className="w-4 h-4 text-red-500" /> Disconnected</>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
