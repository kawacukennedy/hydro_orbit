import { useState } from 'react';
import { BellRing, AlertOctagon, AlertTriangle, Info, Check, Clock } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@hydro-orbit/ui';
import { useAlerts, useAcknowledgeAlert, useAcknowledgeAllAlerts } from '../hooks/useApi';

const formatTime = (dateStr: number | string | Date) => {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const { data: alertsData } = useAlerts(filter === 'unread' ? true : undefined, filter === 'critical' || filter === 'warning' ? filter : undefined);
  const acknowledge = useAcknowledgeAlert();
  const acknowledgeAll = useAcknowledgeAllAlerts();

  const alerts = alertsData?.alerts || [];
  const unreadCount = alertsData?.unreadCount || 0;

  const filters = [
    { key: null, label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'critical', label: 'Critical' },
    { key: 'warning', label: 'Warning' },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="danger">Critical</Badge>;
      case 'warning': return <Badge variant="warning">Warning</Badge>;
      default: return <Badge variant="info">Info</Badge>;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertOctagon;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-600';
      case 'warning': return 'bg-yellow-50 text-yellow-600';
      default: return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-lg">
            <BellRing className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          {unreadCount > 0 && (
            <Badge variant="danger">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => acknowledgeAll.mutate()} disabled={acknowledgeAll.isPending}>
            <Check className="w-4 h-4 mr-1" /> Acknowledge All
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key || 'all'}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <BellRing className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No alerts to display</p>
            </div>
          ) : (
            alerts.map((alert: any) => {
              const Icon = getAlertIcon(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg ${alert.acknowledged ? 'bg-gray-50 opacity-70' : 'bg-white border border-gray-200'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg shrink-0 ${getSeverityBg(alert.severity)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(alert.severity)}
                        {!alert.acknowledged && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">New</span>}
                      </div>
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatTime(alert.createdAt)}</span>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button variant="ghost" size="sm" onClick={() => acknowledge.mutate(alert.id)} disabled={acknowledge.isPending}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
