import { BellRing, AlertOctagon, AlertTriangle, Info, Check, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@hydro-orbit/ui';
import { useAlerts, useAcknowledgeAlert } from '../hooks/useApi';

const formatTime = (date: string | Date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AlertsPage() {
  const { data: alerts } = useAlerts();
  const acknowledge = useAcknowledgeAlert();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="danger">Critical</Badge>;
      case 'warning': return <Badge variant="warning">Warning</Badge>;
      case 'info': return <Badge variant="info">Info</Badge>;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-yellow-500 bg-yellow-50';
      case 'info': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return AlertOctagon;
      case 'warning': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 rounded-lg">
          <BellRing className="w-6 h-6 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" size="sm">All</Button>
        <Button variant="ghost" size="sm">Unread</Button>
        <Button variant="ghost" size="sm">Critical</Button>
        <Button variant="ghost" size="sm">Warning</Button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {alerts?.map((alert) => {
            const Icon = getAlertIcon(alert.severity);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg ${alert.acknowledged ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity.toLowerCase())}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityBadge(alert.severity.toLowerCase())}
                      {!alert.acknowledged && <Badge variant="default">New</Badge>}
                    </div>
                    <p className="text-gray-900">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(alert.createdAt as any)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alert.acknowledged && (
                      <Button variant="ghost" size="sm" onClick={() => acknowledge.mutate(alert.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
