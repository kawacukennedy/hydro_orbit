import { Clock, Calendar, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, Badge } from '@hydro-orbit/ui';
import { useIrrigationSchedules, useDeleteSchedule } from '../hooks/useApi';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleView() {
  const { data: schedules } = useIrrigationSchedules();
  const deleteSchedule = useDeleteSchedule();

  if (!schedules || schedules.length === 0) return null;

  return (
    <Card>
      <CardHeader title="Irrigation Schedule" icon={<Calendar className="w-5 h-5" />} />
      <CardContent className="space-y-3">
        {schedules.map((sch: any) => (
          <div key={sch.id} className={`p-4 rounded-lg border-2 transition-all ${
            sch.enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{sch.zoneId.replace('zone-', 'Zone ').toUpperCase()}</span>
                <Badge variant={sch.enabled ? 'success' : 'default'}>{sch.enabled ? 'Active' : 'Paused'}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{sch.time}</span>
                <span className="text-xs text-gray-500">({sch.duration}min)</span>
                <button
                  onClick={() => deleteSchedule.mutate(sch.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS.map(day => (
                <span key={day} className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  sch.days?.includes(day)
                    ? 'bg-emerald-200 text-emerald-800'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {day}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
