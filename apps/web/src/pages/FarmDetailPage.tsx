import { MapPin, Droplet, TestTube, CheckCircle, XCircle, AlertCircle, Leaf } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@hydro-orbit/ui';

const mockZones = [
  { name: 'Zone A (Tomatoes)', moisture: '45%', pH: '6.5', status: 'good', lastWatered: '3h ago' },
  { name: 'Zone B (Maize)', moisture: '20%', pH: '7.2', status: 'dry', lastWatered: '12h ago' },
  { name: 'Zone C (Beans)', moisture: '60%', pH: '6.8', status: 'wet', lastWatered: '1h ago' }
];

const mockCrops = [
  { name: 'Tomatoes', area: '0.8 ha', harvest: '45 days', icon: Leaf },
  { name: 'Maize', area: '1.2 ha', harvest: '90 days', icon: Leaf },
  { name: 'Beans', area: '0.5 ha', harvest: '60 days', icon: Leaf }
];

export default function FarmDetailPage() {
  const getStatusIcon = (status: string) => {
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
          <h1 className="text-2xl font-bold text-gray-900">My Farm</h1>
          <p className="text-gray-500">Kigali, Rwanda</p>
        </div>
      </div>

      <Card>
        <CardHeader title="Farm Map" />
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg relative overflow-hidden">
            <div className="absolute inset-4 grid grid-cols-3 gap-4">
              {mockZones.map((zone, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-4 flex flex-col items-center justify-center ${
                    zone.status === 'dry' ? 'bg-orange-100 border-2 border-orange-300' :
                    zone.status === 'wet' ? 'bg-blue-100 border-2 border-blue-300' :
                    'bg-green-100 border-2 border-green-300'
                  }`}
                >
                  <span className="font-medium text-sm">{zone.name}</span>
                  <span className="text-xs text-gray-600">{zone.moisture}</span>
                </div>
              ))}
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
          {mockZones.map((zone, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(zone.status)}
                <div>
                  <p className="font-medium text-gray-900">{zone.name}</p>
                  <p className="text-sm text-gray-500">Last watered: {zone.lastWatered}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <Droplet className="w-4 h-4 mx-auto text-blue-500" />
                  <p className="text-sm font-medium">{zone.moisture}</p>
                </div>
                <div className="text-center">
                  <TestTube className="w-4 h-4 mx-auto text-green-500" />
                  <p className="text-sm font-medium">{zone.pH}</p>
                </div>
                <Button size="sm" variant="outline">Water Now</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">2.5 ha</p>
            <p className="text-sm text-gray-500">Total Area</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500">Active Sensors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">350 L</p>
            <p className="text-sm text-gray-500">Water Used Today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
