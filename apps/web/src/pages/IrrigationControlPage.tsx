import { Sprout, Bot, Play, Square, ToggleLeft, ToggleRight, CloudRain, Sun, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '@hydro-orbit/ui';
import { useIrrigationStatus, useSensorReadings, useStartManualIrrigation, useStopIrrigation, useSetIrrigationMode } from '../hooks/useApi';
import ScheduleView from '../components/ScheduleView';

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
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Irrigation Control</h1>
        <span className="ml-auto">
          <Badge variant={isRaining ? 'info' : 'default'}>
            {isRaining ? <><CloudRain className="w-3 h-3 inline mr-1" />Raining</> : <><Sun className="w-3 h-3 inline mr-1" />Clear</>}
          </Badge>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader title="Zone Controls" icon={<Bot className="w-5 h-5" />} />
          <CardContent className="space-y-4">
            {zones.map((zone: any) => {
              const sensor = readings.find((r: any) => r.zoneId === zone.zoneId);
              const canStart = !zone.isActive && !isRaining && sensor && sensor.moisture < 70;

              return (
                <div key={zone.zoneId} className="p-4 bg-gray-50 rounded-xl transition-all hover:bg-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${zone.isActive ? 'bg-emerald-500 animate-ping' : sensor && sensor.moisture < 25 ? 'bg-red-500' : sensor && sensor.moisture < 40 ? 'bg-amber-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-medium">{zone.zoneId.replace('zone-', 'Zone ').toUpperCase()}</p>
                        <p className="text-xs text-gray-500">
                          {sensor ? `Moisture: ${sensor.moisture}% · pH: ${sensor.pH.toFixed(1)}` : 'No data'}
                        </p>
                      </div>
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

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${zone.isActive ? 'bg-emerald-500' : sensor && sensor.moisture < 25 ? 'bg-red-500' : sensor && sensor.moisture < 40 ? 'bg-amber-500' : 'bg-emerald-400'}`}
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
                        {zone.isActive ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Irrigating...
                          </span>
                        ) : sensor && sensor.moisture >= 70 ? (
                          <span className="text-emerald-600">OK</span>
                        ) : (
                          <span className="text-amber-600">Low</span>
                        )}
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

        <ScheduleView />
      </div>

      <Card className="card-hover">
        <CardHeader title="System Summary" icon={<Bot className="w-5 h-5" />} />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
              <p className="text-2xl font-bold text-emerald-700">{zones.length}</p>
              <p className="text-sm text-emerald-600 font-medium">Total Zones</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{activeCount}</p>
              <p className="text-sm text-blue-600 font-medium">Active Now</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-2xl font-bold text-purple-700">{zones.filter(z => z.isAutoMode).length}</p>
              <p className="text-sm text-purple-600 font-medium">Auto Mode</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <p className="text-2xl font-bold text-amber-700">{readings.length}</p>
              <p className="text-sm text-amber-600 font-medium">Sensors Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
