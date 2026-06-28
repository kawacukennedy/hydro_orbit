import { Sprout, Bot, Play, Square, ToggleLeft, ToggleRight, CloudRain, Sun } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '@hydro-orbit/ui';
import { useIrrigationStatus, useSensorReadings, useStartManualIrrigation, useStopIrrigation, useSetIrrigationMode } from '../hooks/useApi';

export default function IrrigationControlPage() {
  const { data: irrigation } = useIrrigationStatus();
  const { data: sensorData } = useSensorReadings();
  const startIrr = useStartManualIrrigation();
  const stopIrr = useStopIrrigation();
  const setMode = useSetIrrigationMode();

  const readings = sensorData?.readings || [];
  const zones = irrigation?.zones || [];
  const isRaining = irrigation?.isRaining || false;

  const activeCount = zones.filter(z => z.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <Sprout className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Irrigation Control</h1>
        <span className="ml-auto"><Badge variant={isRaining ? 'info' : 'default'}>
          {isRaining ? <><CloudRain className="w-3 h-3 inline mr-1" />Raining</> : <><Sun className="w-3 h-3 inline mr-1" />Clear</>}
        </Badge></span>
      </div>

      <Card>
        <CardHeader title="Zone Controls" />
        <CardContent className="space-y-4">
          {zones.map((zone: any) => {
            const sensor = readings.find((r: any) => r.zoneId === zone.zoneId);
            const canStart = !zone.isActive && !isRaining && sensor && sensor.moisture < 70;

            return (
              <div key={zone.zoneId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{zone.zoneId.replace('zone-', 'Zone ').toUpperCase()}</p>
                    <p className="text-xs text-gray-500">
                      {sensor ? `Moisture: ${sensor.moisture}% | pH: ${sensor.pH.toFixed(1)}` : 'No data'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMode.mutate({ zoneId: zone.zoneId, auto: !zone.isAutoMode })}
                      className={`p-2 rounded-lg transition-colors ${zone.isAutoMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}
                      title={zone.isAutoMode ? 'Switch to manual' : 'Switch to auto'}
                    >
                      {zone.isAutoMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <span className="text-xs text-gray-400 w-8">{zone.isAutoMode ? 'Auto' : 'Man'}</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${zone.isActive ? 'bg-emerald-500 animate-pulse' : '#cbd5e1'}`}
                    style={{ width: `${sensor ? Math.min(100, sensor.moisture) : 50}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {zone.isActive ? (
                      <Button size="sm" variant="danger" onClick={() => stopIrr.mutate(zone.zoneId)} disabled={stopIrr.isPending}>
                        <Square className="w-4 h-4 mr-1" /> Stop
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => startIrr.mutate({ zoneId: zone.zoneId })} disabled={!canStart || startIrr.isPending}>
                        <Play className="w-4 h-4 mr-1" /> Water
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {zone.isActive ? 'Irrigating...' : sensor && sensor.moisture >= 70 ? 'OK' : 'Ready'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {zone.lastIrrigation ? new Date(zone.lastIrrigation).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="System Summary" icon={<Bot className="w-5 h-5" />} />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-700">{zones.length}</p>
              <p className="text-sm text-emerald-600">Total Zones</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
              <p className="text-sm text-blue-600">Active Now</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{zones.filter(z => z.isAutoMode).length}</p>
              <p className="text-sm text-purple-600">Auto Mode</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{readings.length}</p>
              <p className="text-sm text-amber-600">Sensors Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
