import { MapPin, Droplet, TestTube, CheckCircle, XCircle, AlertCircle, Leaf } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@hydro-orbit/ui';
import { useFarm, useFarmStats } from '../hooks/useApi';

const mockCrops = [
  { name: 'Tomatoes', area: '0.8 ha', harvest: '45 days', icon: Leaf },
  { name: 'Maize', area: '1.2 ha', harvest: '90 days', icon: Leaf },
  { name: 'Beans', area: '0.5 ha', harvest: '60 days', icon: Leaf }
];

export default function FarmDetailPage() {
  const { data: farm } = useFarm('farm-1');
  const { data: stats } = useFarmStats('farm-1');

  const getStatusIcon = (status: 'good' | 'dry' | 'wet') => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dry': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'wet': return <XCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <MapPin className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{farm?.name || 'My Farm'}</h1>
          <p className="text-gray-500">{farm?.location || 'Location'}</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Farm Map" />
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg relative overflow-hidden">
            <div className="absolute inset-4 grid grid-cols-2 gap-4">
              {farm?.zones.map((zone, i) => {
                const isDry = zone.moistureThreshold > 25;
                const status = isDry ? 'dry' : 'good';
                return (
                  <div
                    key={i}
                    className={`rounded-lg p-4 flex flex-col items-center justify-center ${status === 'dry' ? 'bg-orange-100 border-2 border-orange-300' :
                      'bg-green-100 border-2 border-green-300'
                      }`}
                  >
                    <span className="font-medium text-sm text-center">{zone.name}</span>
                    <span className="text-xs text-gray-600 font-bold">{zone.cropType}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 rounded" />
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-300 rounded" />
              <span>Dry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-300 rounded" />
              <span>Wet</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Crops" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockCrops.map((crop, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <crop.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{crop.name}</p>
                  <p className="text-sm text-gray-500">{crop.area}</p>
                  <p className="text-xs text-emerald-600">Harvest: {crop.harvest}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Zones" />
        <CardContent className="space-y-4">
          {farm?.zones.map((zone, i) => {
            const isDry = zone.moistureThreshold > 25;
            const status: 'dry' | 'wet' | 'good' = isDry ? 'dry' : 'good';
            return (
              <div key={i} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div>
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    <p className="text-sm text-gray-500">Threshold: {zone.moistureThreshold}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <Droplet className="w-4 h-4 mx-auto text-blue-500" />
                    <p className="text-sm font-medium">--</p>
                  </div>
                  <div className="text-center">
                    <TestTube className="w-4 h-4 mx-auto text-green-500" />
                    <p className="text-sm font-medium">--</p>
                  </div>
                  <Button size="sm" variant="outline">Water Now</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{farm?.area || '--'} ha</p>
            <p className="text-sm text-gray-500">Total Area</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{stats?.activeSensors || 0}</p>
            <p className="text-sm text-gray-500">Active Sensors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{stats?.waterUsageToday || 0} L</p>
            <p className="text-sm text-gray-500">Water Used Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
