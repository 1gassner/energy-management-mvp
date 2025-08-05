import React, { useState, useEffect } from 'react';
import { ModernCard } from '@/components/ui/ModernCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Mail,
  Settings,
  Clock,
  Eye,
  Plus
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'energy' | 'financial' | 'maintenance' | 'compliance' | 'executive';
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients: string[];
  lastGenerated?: string;
  nextScheduled?: string;
  isActive: boolean;
  template: string;
  buildingIds: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  sections: string[];
  customizable: boolean;
}

const ReportsManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTab, setSelectedTab] = useState<'reports' | 'templates' | 'history'>('reports');
  const [, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Mock reports data
    const mockReports: Report[] = [
      {
        id: 'report-001',
        name: 'Monatlicher Energiebericht',
        description: 'Umfassender Überblick über Energieverbrauch und -produktion aller Gebäude',
        type: 'energy',
        format: 'pdf',
        frequency: 'monthly',
        recipients: ['buergermeister@hechingen.de', 'energiemanager@hechingen.de'],
        lastGenerated: '2024-07-31T10:00:00Z',
        nextScheduled: '2024-08-31T10:00:00Z',
        isActive: true,
        template: 'energy-monthly',
        buildingIds: ['all'],
        dateRange: {
          start: '2024-07-01',
          end: '2024-07-31'
        }
      },
      {
        id: 'report-002',
        name: 'Wartungskostenbericht',
        description: 'Detaillierte Aufstellung aller Wartungskosten und Trends',
        type: 'maintenance',
        format: 'xlsx',
        frequency: 'quarterly',
        recipients: ['techniker@hechingen.de', 'verwaltung@hechingen.de'],
        lastGenerated: '2024-07-01T09:00:00Z',
        nextScheduled: '2024-10-01T09:00:00Z',
        isActive: true,
        template: 'maintenance-costs',
        buildingIds: ['all'],
        dateRange: {
          start: '2024-04-01',
          end: '2024-06-30'
        }
      },
      {
        id: 'report-003',
        name: 'Executive Summary',
        description: 'Zusammenfassung für die Geschäftsleitung mit KPIs und Trends',
        type: 'executive',
        format: 'pdf',
        frequency: 'monthly',
        recipients: ['buergermeister@hechingen.de'],
        lastGenerated: '2024-07-31T16:00:00Z',
        nextScheduled: '2024-08-31T16:00:00Z',
        isActive: true,
        template: 'executive-summary',
        buildingIds: ['all'],
        dateRange: {
          start: '2024-07-01',
          end: '2024-07-31'
        }
      },
      {
        id: 'report-004',
        name: 'Compliance Report',
        description: 'Nachweis der Einhaltung aller relevanten Energiestandards',
        type: 'compliance',
        format: 'pdf',
        frequency: 'yearly',
        recipients: ['rechtsabteilung@hechingen.de', 'energiemanager@hechingen.de'],
        lastGenerated: '2024-01-15T14:00:00Z',
        nextScheduled: '2025-01-15T14:00:00Z',
        isActive: true,
        template: 'compliance-yearly',
        buildingIds: ['all'],
        dateRange: {
          start: '2023-01-01',
          end: '2023-12-31'
        }
      }
    ];

    const mockTemplates: ReportTemplate[] = [
      {
        id: 'energy-monthly',
        name: 'Monatlicher Energiebericht',
        description: 'Standardvorlage für monatliche Energieberichte',
        type: 'energy',
        sections: ['Verbrauchsübersicht', 'Produktionsdaten', 'Effizienzanalyse', 'Kostenaufstellung', 'Trends'],
        customizable: true
      },
      {
        id: 'maintenance-costs',
        name: 'Wartungskostenbericht',
        description: 'Detaillierte Kostenanalyse für Wartungsarbeiten',
        type: 'maintenance',
        sections: ['Kostenzusammenfassung', 'Kostentrends', 'Gerätekosten', 'Personalkosten', 'Prognosen'],
        customizable: true
      },
      {
        id: 'executive-summary',
        name: 'Executive Summary',
        description: 'Kompakte Führungskräfte-Übersicht',
        type: 'executive',
        sections: ['KPI Dashboard', 'Wichtige Entwicklungen', 'Handlungsempfehlungen', 'Budgetüberblick'],
        customizable: false
      }
    ];

    setReports(mockReports);
    setTemplates(mockTemplates);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'energy':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'financial':
        return <PieChart className="w-5 h-5 text-blue-500" />;
      case 'maintenance':
        return <Settings className="w-5 h-5 text-orange-500" />;
      case 'compliance':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'executive':
        return <BarChart3 className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'once':
        return 'Einmalig';
      case 'daily':
        return 'Täglich';
      case 'weekly':
        return 'Wöchentlich';
      case 'monthly':
        return 'Monatlich';
      case 'quarterly':
        return 'Quartalsweise';
      case 'yearly':
        return 'Jährlich';
      default:
        return frequency;
    }
  };

  const handleGenerateReport = (reportId: string) => {
    // In a real app, this would trigger report generation
    // Report generation logic would be implemented here
    // Update lastGenerated timestamp
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, lastGenerated: new Date().toISOString() }
        : report
    ));
  };

  const stats = {
    totalReports: reports.length,
    activeReports: reports.filter(r => r.isActive).length,
    scheduledReports: reports.filter(r => r.frequency !== 'once').length,
    reportsThisMonth: reports.filter(r => {
      if (!r.lastGenerated) return false;
      const lastGen = new Date(r.lastGenerated);
      const now = new Date();
      return lastGen.getMonth() === now.getMonth() && lastGen.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="container-modern bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Modern Header */}
      <ModernCard variant="glassmorphism" className="page-header mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              Reports & Analytics
            </h1>
            <p className="page-subtitle">
              Intelligente Berichte und Datenexporte für CityPulse Hechingen
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="status-badge-success">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span>{stats.activeReports} AKTIVE REPORTS</span>
              </div>
              <div className="status-badge-info">
                <Clock className="w-4 h-4 mr-2" />
                <span>{stats.scheduledReports} AUTOMATISIERT</span>
              </div>
              <div className="status-badge-warning">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>{stats.reportsThisMonth} DIESEN MONAT</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="modern-button-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Neuer Report</span>
          </button>
        </div>
      </ModernCard>

      {/* Statistics */}
      <div className="dashboard-grid mb-8">
        <MetricCard
          title="Gesamt Reports"
          value={stats.totalReports}
          icon={<FileText className="w-6 h-6" />}
          color="blue"
          variant="glassmorphism"
        />
        <MetricCard
          title="Aktive Reports"
          value={stats.activeReports}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          trend={{
            value: Math.round((stats.activeReports / stats.totalReports) * 100),
            isPositive: true,
            label: "% aktiv"
          }}
          variant="glassmorphism"
        />
        <MetricCard
          title="Automatisiert"
          value={stats.scheduledReports}
          icon={<Clock className="w-6 h-6" />}
          color="purple"
          variant="glassmorphism"
        />
        <MetricCard
          title="Diesen Monat"
          value={stats.reportsThisMonth}
          icon={<TrendingUp className="w-6 h-6" />}
          color="orange"
          variant="glassmorphism"
        />
      </div>

      {/* Modern Tabs */}
      <ModernCard variant="glassmorphism" className="p-6 mb-8">
        <div className="flex items-center justify-center">
          <nav className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {[
              { id: 'reports', label: '📊 Reports', icon: FileText },
              { id: 'templates', label: '📋 Vorlagen', icon: Settings },
              { id: 'history', label: '🕒 Verlauf', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </ModernCard>

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <ModernCard variant="glassmorphism" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Schnelle Aktionen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                <Download className="w-5 h-5 text-gray-500" />
                <span>Sofortiger Export</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 transition-colors">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                <span>Energiebericht</span>
              </button>
              <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition-colors">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <span>Executive Summary</span>
              </button>
            </div>
          </ModernCard>

          {/* Reports List */}
          <div className="space-y-4">
            {reports.map((report) => (
              <ModernCard key={report.id} variant="glassmorphism" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getTypeIcon(report.type)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {report.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Häufigkeit</p>
                        <p className="font-medium flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getFrequencyLabel(report.frequency)}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Format</p>
                        <p className="font-medium flex items-center space-x-1">
                          {getFormatIcon(report.format)}
                          <span>{report.format.toUpperCase()}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Letzter Export</p>
                        <p className="font-medium">
                          {report.lastGenerated 
                            ? new Date(report.lastGenerated).toLocaleDateString('de-DE')
                            : 'Noch nie'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Recipients */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Empfänger:</p>
                      <div className="flex flex-wrap gap-2">
                        {report.recipients.map((email, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{email}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <button 
                      onClick={() => handleGenerateReport(report.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Generieren</span>
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Anzeigen</span>
                    </button>
                    <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm transition-colors">
                      Bearbeiten
                    </button>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <ModernCard key={template.id} variant="glassmorphism" className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {getTypeIcon(template.type)}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>

                <div className="mb-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Abschnitte:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {template.sections.map((section, index) => (
                      <li key={index}>{section}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors">
                    Verwenden
                  </button>
                  {template.customizable && (
                    <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded text-sm transition-colors">
                      Anpassen
                    </button>
                  )}
                </div>
              </ModernCard>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <div className="space-y-6">
          <ModernCard variant="glassmorphism" className="p-6">
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Report-Verlauf wird geladen...
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Hier werden alle generierten Reports angezeigt.
              </p>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;