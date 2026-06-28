import { useState } from 'react';
import { BellRing, AlertOctagon, AlertTriangle, Info, Check, Clock, RefreshCw } from 'lucide-react';
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
  const { data: alertsData, refetch } = useAlerts(filter === 'unread' ? true : undefined, filter === 'critical' || filter === 'warning' ? filter : undefined);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          {unreadCount > 0 && (
            <Badge variant="danger">{unreadCount} unread</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => acknowledgeAll.mutate()} disabled={acknowledgeAll.isPending}>
              <Check className="w-4 h-4 mr-1" /> Acknowledge All
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key || 'all'}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <BellRing className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-lg font-medium text-gray-900">All clear!</p>
              <p className="text-sm text-gray-500 mt-1">No alerts to display</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: any) => {
            const Icon = getAlertIcon(alert.severity);
            return (
              <div
                key={alert.id}
                className={`card-hover p-4 rounded-xl transition-all ${
                  alert.acknowledged ? 'bg-gray-50 opacity-70' : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-50 text-red-600' : alert.severity === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityBadge(alert.severity)}
                      {!alert.acknowledged && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{formatTime(alert.createdAt)}</span>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button variant="ghost" size="sm" onClick={() => acknowledge.mutate(alert.id)} disabled={acknowledge.isPending} className="shrink-0">
                      <Check className="w-4 h-4 mr-1" /> Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
