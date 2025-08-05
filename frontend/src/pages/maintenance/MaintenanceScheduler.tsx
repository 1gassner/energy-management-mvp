import React, { useState, useEffect } from 'react';
import { ModernCard } from '@/components/ui/ModernCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  Calendar, 
  Clock, 
  User, 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  XCircle,
  Plus,
  Filter,
  Download,
  Building2,
  Euro,
  FileText
} from 'lucide-react';

interface MaintenanceEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  buildingName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  scheduledDate: string;
  estimatedDuration: number;
  assignedTechnician?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  tasks: string[];
  requiredParts: string[];
  cost?: number;
}

const MaintenanceScheduler: React.FC = () => {
  const [events, setEvents] = useState<MaintenanceEvent[]>([]);
  const [, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'timeline'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Load maintenance events
  useEffect(() => {
    const mockEvents: MaintenanceEvent[] = [
      {
        id: 'maint-001',
        deviceId: 'device-001',
        deviceName: 'Hauptwärmepumpe',
        buildingName: 'Rathaus',
        type: 'preventive',
        status: 'scheduled',
        scheduledDate: '2024-08-15',
        estimatedDuration: 120,
        assignedTechnician: 'Klaus Fischer',
        priority: 'medium',
        description: 'Quartalswartung der Hauptwärmepumpe',
        tasks: [
          'Luftfilter reinigen',
          'Kältemittelstand prüfen',
          'Sensoren kalibrieren',
          'Verdampfer inspizieren'
        ],
        requiredParts: ['Luftfilter', 'Dichtungen'],
        cost: 450
      },
      {
        id: 'maint-002',
        deviceId: 'device-003',
        deviceName: 'Poolpumpe Hauptbecken',
        buildingName: 'Hallenbad',
        type: 'corrective',
        status: 'in_progress',
        scheduledDate: '2024-08-08',
        estimatedDuration: 90,
        assignedTechnician: 'Thomas Weber',
        priority: 'high',
        description: 'Reparatur defektes Laufrad',
        tasks: [
          'Pumpe demontieren',
          'Laufrad austauschen',
          'Dichtungen erneuern',
          'Funktionstest'
        ],
        requiredParts: ['Laufrad', 'O-Ring Set', 'Dichtmasse'],
        cost: 680
      },
      {
        id: 'maint-003',
        deviceId: 'device-002',
        deviceName: 'Solaranlage Dach',
        buildingName: 'Gymnasium',
        type: 'inspection',
        status: 'overdue',
        scheduledDate: '2024-08-01',
        estimatedDuration: 180,
        assignedTechnician: 'Maria Schmidt',
        priority: 'medium',
        description: 'Jahresinspektion Solaranlage',
        tasks: [
          'Module reinigen',
          'Verkabelung prüfen',
          'Wechselrichter testen',
          'Ertragsmessung'
        ],
        requiredParts: [],
        cost: 320
      },
      {
        id: 'maint-004',
        deviceId: 'device-001',
        deviceName: 'Hauptwärmepumpe',
        buildingName: 'Rathaus',
        type: 'emergency',
        status: 'scheduled',
        scheduledDate: '2024-08-10',
        estimatedDuration: 60,
        assignedTechnician: 'Klaus Fischer',
        priority: 'critical',
        description: 'Störung: Hochdruckwarnung',
        tasks: [
          'Fehlerbehebung',
          'Drucksensoren prüfen',
          'System neu kalibrieren'
        ],
        requiredParts: ['Drucksensor'],
        cost: 850
      }
    ];
    setEvents(mockEvents);
  }, []);

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (filterPriority !== 'all' && event.priority !== filterPriority) return false;
    return true;
  });

  // Statistics
  const stats = {
    total: events.length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    inProgress: events.filter(e => e.status === 'in_progress').length,
    overdue: events.filter(e => e.status === 'overdue').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalCost: events.reduce((sum, event) => sum + (event.cost || 0), 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'Vorbeugende Wartung';
      case 'corrective':
        return 'Reparatur';
      case 'emergency':
        return 'Notfall';
      case 'inspection':
        return 'Inspektion';
      default:
        return type;
    }
  };

  return (
    <div className="container-modern bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Modern Header */}
      <ModernCard variant="glassmorphism" className="page-header mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              Wartungsplanung
            </h1>
            <p className="page-subtitle">
              Intelligente Planung und Überwachung aller Wartungsarbeiten in Hechingen
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="status-badge-success">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>{stats.completed} ABGESCHLOSSEN</span>
              </div>
              <div className="status-badge-warning">
                <Clock className="w-4 h-4 mr-2" />
                <span>{stats.inProgress} IN ARBEIT</span>
              </div>
              <div className="status-badge-danger">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span>{stats.overdue} ÜBERFÄLLIG</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="modern-button-secondary flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button className="modern-button-primary flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Neue Wartung</span>
            </button>
          </div>
        </div>
      </ModernCard>

      {/* Statistics */}
      <div className="dashboard-grid mb-8">
        <MetricCard
          title="Geplante Wartungen"
          value={stats.scheduled}
          icon={<Calendar className="w-6 h-6" />}
          trend={{
            value: 12,
            isPositive: true,
            label: "vs. letzter Monat"
          }}
          color="blue"
          variant="glassmorphism"
        />
        
        <MetricCard
          title="In Bearbeitung"
          value={stats.inProgress}
          icon={<PlayCircle className="w-6 h-6" />}
          trend={{
            value: 25,
            isPositive: true,
            label: "Effizienz"
          }}
          color="orange"
          variant="glassmorphism"
        />
        
        <MetricCard
          title="Überfällige Wartungen"
          value={stats.overdue}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={{
            value: 30,
            isPositive: false,
            label: "Reduktion erforderlich"
          }}
          color="red"
          variant="glassmorphism"
        />
        
        <MetricCard
          title="Wartungskosten"
          value={new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
          }).format(stats.totalCost)}
          unit="/Monat"
          icon={<Euro className="w-6 h-6" />}
          trend={{
            value: 15,
            isPositive: true,
            label: "Einsparung"
          }}
          color="green"
          variant="glassmorphism"
        />
      </div>

      {/* Modern Filters */}
      <ModernCard variant="glassmorphism" className="p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Intelligente Filter</span>
          </div>
          
          <div className="flex flex-wrap gap-4 flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="modern-select min-w-[150px]"
            >
              <option value="all">🔄 Alle Status</option>
              <option value="scheduled">📅 Geplant</option>
              <option value="in_progress">⚡ In Bearbeitung</option>
              <option value="overdue">⚠️ Überfällig</option>
              <option value="completed">✅ Abgeschlossen</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="modern-select min-w-[150px]"
            >
              <option value="all">🎯 Alle Prioritäten</option>
              <option value="critical">🔴 Kritisch</option>
              <option value="high">🟠 Hoch</option>
              <option value="medium">🟡 Mittel</option>
              <option value="low">🟢 Niedrig</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`modern-tab-button ${viewMode === 'list' ? 'active' : ''}`}
            >
              📋 Liste
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`modern-tab-button ${viewMode === 'calendar' ? 'active' : ''}`}
            >
              📅 Kalender
            </button>
          </div>
        </div>
      </ModernCard>

      {/* Modern Maintenance Events List */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <ModernCard key={event.id} variant="glassmorphism" className="overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {event.deviceName}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPriorityColor(event.priority)}`}>
                          {event.priority}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                          {getTypeLabel(event.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Gebäude</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.buildingName}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Termin</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(event.scheduledDate).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Techniker</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.assignedTechnician || 'Nicht zugewiesen'}</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Dauer</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{event.estimatedDuration} min</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
                  </div>

                  {/* Tasks */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      Arbeitsschritte
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {event.tasks.map((task, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Parts */}
                  {event.requiredParts.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-green-600" />
                        Benötigte Teile
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.requiredParts.map((part, index) => (
                          <span key={index} className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-4">
                  {event.cost && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                      <Euro className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Geschätzte Kosten</p>
                      <p className="text-xl font-bold text-green-600">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(event.cost)}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-3 min-w-[150px]">
                    {event.status === 'scheduled' && (
                      <button className="modern-button-success flex items-center justify-center space-x-2">
                        <PlayCircle className="w-4 h-4" />
                        <span>Starten</span>
                      </button>
                    )}
                    {event.status === 'in_progress' && (
                      <button className="modern-button-primary flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Abschließen</span>
                      </button>
                    )}
                    <button className="modern-button-secondary flex items-center justify-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Keine Wartungstermine gefunden
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Keine Wartungstermine entsprechen den aktuellen Filterkriterien.
          </p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduler;