import { MapPin, Droplet, TestTube, CheckCircle, AlertCircle, Leaf, Sprout } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '@hydro-orbit/ui';
import { useFarms, useSensorReadings, useTankStatus, useIrrigationStatus, useStartManualIrrigation, useStopIrrigation } from '../hooks/useApi';

const mockCrops = [
  { name: 'Maize', area: '1.2 ha', harvest: '90 days', icon: Leaf, zoneId: 'zone-a' },
  { name: 'Beans', area: '0.8 ha', harvest: '60 days', icon: Leaf, zoneId: 'zone-b' },
  { name: 'Vegetables', area: '0.5 ha', harvest: '45 days', icon: Leaf, zoneId: 'zone-c' },
];

export default function FarmDetailPage() {
  const { data: farms } = useFarms();
  const { data: sensorData } = useSensorReadings();
  const { data: tank } = useTankStatus();
  const { data: irrigation } = useIrrigationStatus();
  const startIrr = useStartManualIrrigation();
  const stopIrr = useStopIrrigation();

  const farm = farms?.[0];
  const readings = sensorData?.readings || [];
  const irrigationZones = irrigation?.zones || [];

  const getStatusIcon = (moisture: number) => {
    if (moisture < 25) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (moisture < 40) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <MapPin className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{farm?.name || 'My Farm'}</h1>
          <p className="text-gray-500">{farm?.location || 'Eastern Province, Rwanda'}</p>
        </div>
        <span className="ml-auto"><Badge variant="success">Online</Badge></span>
      </div>

      <Card>
        <CardHeader title="Farm Zones" icon={<MapPin className="w-5 h-5" />} />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {readings.map((r: any) => {
              const zIrr = irrigationZones.find((z: any) => z.zoneId === r.zoneId);
              const bgColor = r.moisture < 25 ? 'bg-red-100 border-red-300' : r.moisture < 40 ? 'bg-yellow-100 border-yellow-300' : 'bg-emerald-100 border-emerald-300';
              return (
                <div key={r.zoneId} className={`rounded-lg p-4 border-2 ${bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.zoneName}</span>
                    {zIrr?.isActive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                  </div>
                  <div className="space-y-1 text-xs">
                    <p>Moisture: <strong>{r.moisture}%</strong></p>
                    <p>pH: <strong>{r.pH.toFixed(1)}</strong></p>
                    <p>Temp: <strong>{r.temperature}°C</strong></p>
                  </div>
                  <div className="mt-2 w-full bg-white/50 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${r.moisture < 25 ? 'bg-red-500' : r.moisture < 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, r.moisture)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-300" /> Optimal</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-300" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300" /> Critical</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Crops" icon={<Sprout className="w-5 h-5" />} />
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
        <CardHeader title="Zone Controls" />
        <CardContent className="space-y-4">
          {readings.map((r: any) => {
            const zIrr = irrigationZones.find((z: any) => z.zoneId === r.zoneId);
            return (
              <div key={r.zoneId} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(r.moisture)}
                  <div>
                    <p className="font-medium text-gray-900">{r.zoneName}</p>
                    <p className="text-xs text-gray-500">Moisture: {r.moisture}% | pH: {r.pH.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <Droplet className="w-4 h-4 mx-auto text-blue-500" />
                    <p className="text-sm font-medium">{r.moisture}%</p>
                  </div>
                  <div className="text-center">
                    <TestTube className="w-4 h-4 mx-auto text-green-500" />
                    <p className="text-sm font-medium">{r.pH.toFixed(1)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={zIrr?.isActive ? 'danger' : 'outline'}
                    onClick={() => zIrr?.isActive ? stopIrr.mutate(r.zoneId) : startIrr.mutate({ zoneId: r.zoneId })}
                    disabled={(zIrr?.isActive ? stopIrr : startIrr).isPending}
                  >
                    {zIrr?.isActive ? 'Stop' : 'Water'}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{farm?.area || '2.5'} ha</p>
            <p className="text-sm text-gray-500">Total Area</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{readings.length}</p>
            <p className="text-sm text-gray-500">Active Sensors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-2xl font-bold text-gray-900">{tank?.percent || 0}%</p>
            <p className="text-sm text-gray-500">Tank Level</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
