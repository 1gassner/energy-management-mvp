import React, { useState, useEffect } from 'react';
import { Device, DeviceType, DeviceStatus, DeviceCategory } from '@/types/devices';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter,
  Settings,
  Wrench,
  Zap,
  Thermometer,
  Activity,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Cpu,
  HardDrive
} from 'lucide-react';

interface DeviceWithBuilding extends Device {
  buildingName: string;
}

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<DeviceWithBuilding[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<DeviceWithBuilding[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedType, setSelectedType] = useState<DeviceType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<DeviceStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDevice, setNewDevice] = useState<Partial<Device>>({});

  // Device Analytics
  const deviceStats = {
    total: devices.length,
    online: devices.filter(d => d.status === DeviceStatus.ONLINE).length,
    maintenance: devices.filter(d => d.status === DeviceStatus.MAINTENANCE).length,
    offline: devices.filter(d => d.status === DeviceStatus.OFFLINE).length,
    maintenanceDue: devices.filter(d => {
      if (!d.nextMaintenanceDate) return false;
      const nextMaintenance = new Date(d.nextMaintenanceDate);
      const now = new Date();
      const daysDiff = (nextMaintenance.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7; // Due within 7 days
    }).length
  };

  const totalMonthlyCost = devices.reduce((sum, device) => sum + device.monthlyOperatingCost, 0);

  // Load mock devices
  useEffect(() => {
    const mockDevices: DeviceWithBuilding[] = [
      {
        id: 'device-001',
        name: 'Hauptwärmepumpe',
        type: DeviceType.HEAT_PUMP,
        category: DeviceCategory.HVAC,
        buildingId: 'rathaus-hechingen',
        buildingName: 'Rathaus',
        location: 'Heizungskeller',
        status: DeviceStatus.ONLINE,
        manufacturer: 'Viessmann',
        model: 'Vitocal 300-G',
        serialNumber: 'VIT-2024-001',
        firmwareVersion: '2.1.4',
        purchaseDate: '2023-03-15',
        installationDate: '2023-04-01',
        warrantyExpiry: '2028-04-01',
        lastMaintenanceDate: '2024-06-15',
        nextMaintenanceDate: '2024-12-15',
        purchasePrice: 18500,
        monthlyOperatingCost: 450,
        energyConsumption: 1200,
        maintenanceSchedule: {
          frequency: 'quarterly',
          tasks: [
            {
              id: 'task-001',
              name: 'Filterreinigung',
              description: 'Luftfilter reinigen und prüfen',
              estimatedDuration: 30,
              requiredTools: ['Schraubenzieher', 'Druckluft'],
              requiredParts: [],
              priority: 'medium'
            }
          ]
        },
        maintenanceHistory: [],
        sensorIds: ['sensor-001', 'sensor-002'],
        createdAt: '2023-04-01T10:00:00Z',
        updatedAt: '2024-07-15T14:30:00Z',
        createdBy: 'admin@citypulse.com'
      },
      {
        id: 'device-002',
        name: 'Solaranlage Dach',
        type: DeviceType.SOLAR_PANEL,
        category: DeviceCategory.ENERGY_PRODUCTION,
        buildingId: 'gymnasium-hechingen',
        buildingName: 'Gymnasium',
        location: 'Hauptdach',
        status: DeviceStatus.ONLINE,
        manufacturer: 'SolarWorld',
        model: 'Sunmodule Plus SW 280',
        serialNumber: 'SW-2024-GYM-001',
        purchaseDate: '2023-06-01',
        installationDate: '2023-07-15',
        warrantyExpiry: '2043-07-15',
        lastMaintenanceDate: '2024-05-20',
        nextMaintenanceDate: '2025-05-20',
        purchasePrice: 125000,
        monthlyOperatingCost: 50,
        energyConsumption: -2800,
        maintenanceSchedule: {
          frequency: 'yearly',
          tasks: [
            {
              id: 'task-002',
              name: 'Panelreinigung',
              description: 'Solarmodule reinigen und Verkabelung prüfen',
              estimatedDuration: 180,
              requiredTools: ['Hochdruckreiniger', 'Multimeter'],
              requiredParts: [],
              priority: 'medium'
            }
          ]
        },
        maintenanceHistory: [],
        sensorIds: ['sensor-003', 'sensor-004'],
        createdAt: '2023-07-15T10:00:00Z',
        updatedAt: '2024-05-20T14:30:00Z',
        createdBy: 'admin@citypulse.com'
      },
      {
        id: 'device-003',
        name: 'Poolpumpe Hauptbecken',
        type: DeviceType.POOL_PUMP,
        category: DeviceCategory.POOL_EQUIPMENT,
        buildingId: 'hallenbad-hechingen',
        buildingName: 'Hallenbad',
        location: 'Technikraum',
        status: DeviceStatus.MAINTENANCE,
        manufacturer: 'Grundfos',
        model: 'MAGNA3 80-120',
        serialNumber: 'GRU-2024-HAL-001',
        purchaseDate: '2023-01-10',
        installationDate: '2023-02-01',
        warrantyExpiry: '2026-02-01',
        lastMaintenanceDate: '2024-08-01',
        nextMaintenanceDate: '2024-11-01',
        purchasePrice: 8500,
        monthlyOperatingCost: 350,
        energyConsumption: 850,
        maintenanceSchedule: {
          frequency: 'monthly',
          tasks: [
            {
              id: 'task-003',
              name: 'Filterwechsel',
              description: 'Pumpenfilter wechseln und Dichtungen prüfen',
              estimatedDuration: 45,
              requiredTools: ['Rohrzange', 'Dichtmittel'],
              requiredParts: ['Filter', 'O-Ring Set'],
              priority: 'high'
            }
          ]
        },
        maintenanceHistory: [],
        sensorIds: ['sensor-005', 'sensor-006'],
        createdAt: '2023-02-01T10:00:00Z',
        updatedAt: '2024-08-01T14:30:00Z',
        createdBy: 'admin@citypulse.com'
      }
    ];

    setDevices(mockDevices);
    setFilteredDevices(mockDevices);
  }, []);

  // Filter devices
  useEffect(() => {
    let filtered = devices;

    if (searchTerm) {
      filtered = filtered.filter(device => 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBuilding) {
      filtered = filtered.filter(device => device.buildingId === selectedBuilding);
    }

    if (selectedType) {
      filtered = filtered.filter(device => device.type === selectedType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(device => device.status === selectedStatus);
    }

    setFilteredDevices(filtered);
  }, [devices, searchTerm, selectedBuilding, selectedType, selectedStatus]);

  const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case DeviceStatus.ONLINE:
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case DeviceStatus.OFFLINE:
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case DeviceStatus.MAINTENANCE:
        return <Wrench className="w-6 h-6 text-orange-400" />;
      case DeviceStatus.ERROR:
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return <Activity className="w-6 h-6 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: DeviceType) => {
    switch (type) {
      case DeviceType.HEAT_PUMP:
        return <Thermometer className="w-6 h-6 text-white" />;
      case DeviceType.SOLAR_PANEL:
        return <Zap className="w-6 h-6 text-white" />;
      case DeviceType.POOL_PUMP:
        return <Activity className="w-6 h-6 text-white" />;
      default:
        return <Settings className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Eco Header */}
        <EcoCard variant="glass" className="p-8" glow="blue">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-3 flex items-center gap-4">
                <HardDrive className="w-12 h-12 text-cyan-400" />
                Geräteverwaltung
              </h1>
              <p className="text-cyan-200/80 text-lg">
                Verwaltung aller technischen Geräte und Assets
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25 hover:shadow-2xl font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Neues Gerät</span>
            </button>
          </div>
        </EcoCard>

        {/* Device Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EcoKPICard
            title="Geräte Gesamt"
            value={deviceStats.total}
            icon={Cpu}
            color="blue"
            progress={85}
          />
          <EcoKPICard
            title="Online"
            value={deviceStats.online}
            icon={CheckCircle}
            color="green"
            trend={{
              value: Math.round((deviceStats.online / deviceStats.total) * 100),
              isPositive: true,
              label: "% Online"
            }}
            progress={(deviceStats.online / deviceStats.total) * 100}
          />
          <EcoKPICard
            title="Wartung fällig"
            value={deviceStats.maintenanceDue}
            icon={Calendar}
            color="orange"
            progress={25}
          />
          <EcoKPICard
            title="Monatliche Kosten"
            value={new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(totalMonthlyCost)}
            icon={DollarSign}
            color="green"
            progress={70}
          />
        </div>

        {/* Search and Filters */}
        <EcoCard variant="glass" className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Geräte suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-6 py-3 rounded-xl flex items-center gap-3 font-medium transition-all duration-300",
                showFilters
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/25 shadow-lg'
                  : 'bg-white/10 text-cyan-200 hover:bg-white/20 border border-cyan-400/30'
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-cyan-400/20">
              {/* Building Filter */}
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
              >
                <option value="" className="bg-slate-800">Alle Gebäude</option>
                <option value="rathaus-hechingen" className="bg-slate-800">Rathaus</option>
                <option value="gymnasium-hechingen" className="bg-slate-800">Gymnasium</option>
                <option value="hallenbad-hechingen" className="bg-slate-800">Hallenbad</option>
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DeviceType)}
                className="px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
              >
                <option value="" className="bg-slate-800">Alle Typen</option>
                <option value={DeviceType.HEAT_PUMP} className="bg-slate-800">Wärmepumpe</option>
                <option value={DeviceType.SOLAR_PANEL} className="bg-slate-800">Solaranlage</option>
                <option value={DeviceType.POOL_PUMP} className="bg-slate-800">Poolpumpe</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as DeviceStatus)}
                className="px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
              >
                <option value="" className="bg-slate-800">Alle Status</option>
                <option value={DeviceStatus.ONLINE} className="bg-slate-800">Online</option>
                <option value={DeviceStatus.OFFLINE} className="bg-slate-800">Offline</option>
                <option value={DeviceStatus.MAINTENANCE} className="bg-slate-800">Wartung</option>
              </select>
            </div>
          )}
        </EcoCard>

        {/* Device List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <EcoCard key={device.id} variant="glass" className="p-6 group" hover={true} glow="blue">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {getTypeIcon(device.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {device.name}
                    </h3>
                    <p className="text-cyan-200/80 text-sm">
                      {device.buildingName} • {device.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(device.status)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-200/60 text-sm">Hersteller:</span>
                  <span className="font-medium text-white">{device.manufacturer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-200/60 text-sm">Modell:</span>
                  <span className="font-medium text-white">{device.model}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-200/60 text-sm">Nächste Wartung:</span>
                  <span className="font-medium text-cyan-300">
                    {device.nextMaintenanceDate 
                      ? new Date(device.nextMaintenanceDate).toLocaleDateString('de-DE')
                      : 'Nicht geplant'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl backdrop-blur-sm">
                  <span className="text-cyan-200/60 text-sm">Monatliche Kosten:</span>
                  <span className="font-bold text-green-400">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(device.monthlyOperatingCost)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 font-medium shadow-lg">
                  Details
                </button>
                <button className="px-4 py-3 bg-white/10 text-cyan-200 rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-cyan-400/30">
                  <Wrench className="w-4 h-4" />
                </button>
              </div>
            </EcoCard>
          ))}
        </div>

        {filteredDevices.length === 0 && (
          <EcoCard variant="glass" className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Settings className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Keine Geräte gefunden
            </h3>
            <p className="text-cyan-200/80">
              Keine Geräte entsprechen den aktuellen Filterkriterien.
            </p>
          </EcoCard>
        )}

        {/* Create Device Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" onClick={() => setShowCreateModal(false)} />
            <EcoCard variant="glass" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10" size="lg">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Neues Gerät hinzufügen</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const deviceId = `device-${Date.now()}`;
                  const newDeviceComplete: DeviceWithBuilding = {
                    id: deviceId,
                    name: newDevice.name || 'Neues Gerät',
                    type: newDevice.type || DeviceType.SENSOR,
                    category: newDevice.category || DeviceCategory.MONITORING,
                    buildingId: newDevice.buildingId || 'rathaus-hechingen',
                    buildingName: 'Rathaus',
                    location: newDevice.location || 'Unbekannt',
                    status: DeviceStatus.ONLINE,
                    manufacturer: newDevice.manufacturer || 'Unbekannt',
                    model: newDevice.model || 'Unbekannt',
                    serialNumber: newDevice.serialNumber || 'N/A',
                    firmwareVersion: '1.0.0',
                    purchaseDate: new Date().toISOString().split('T')[0],
                    installationDate: new Date().toISOString().split('T')[0],
                    warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString().split('T')[0],
                    purchasePrice: newDevice.purchasePrice || 0,
                    monthlyOperatingCost: newDevice.monthlyOperatingCost || 0,
                    energyConsumption: newDevice.energyConsumption || 0,
                    maintenanceSchedule: { frequency: 'monthly', tasks: [] },
                    maintenanceHistory: [],
                    sensorIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'admin@citypulse.com'
                  };
                  
                  setDevices(prev => [...prev, newDeviceComplete]);
                  setNewDevice({});
                  setShowCreateModal(false);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Gerätename</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm transition-all duration-300"
                        value={newDevice.name || ''}
                        onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                        placeholder="z.B. Wärmepumpe Keller"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Gerätetyp</label>
                      <select
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.type || ''}
                        onChange={(e) => setNewDevice({...newDevice, type: e.target.value as DeviceType})}
                        required
                      >
                        <option value="" className="bg-slate-800">Typ auswählen</option>
                        <option value={DeviceType.HEAT_PUMP} className="bg-slate-800">Wärmepumpe</option>
                        <option value={DeviceType.SOLAR_PANEL} className="bg-slate-800">Solaranlage</option>
                        <option value={DeviceType.SENSOR} className="bg-slate-800">Sensor</option>
                        <option value={DeviceType.HVAC} className="bg-slate-800">Lüftung</option>
                        <option value={DeviceType.LIGHTING} className="bg-slate-800">Beleuchtung</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Standort</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.location || ''}
                        onChange={(e) => setNewDevice({...newDevice, location: e.target.value})}
                        placeholder="z.B. Heizungskeller"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Hersteller</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.manufacturer || ''}
                        onChange={(e) => setNewDevice({...newDevice, manufacturer: e.target.value})}
                        placeholder="z.B. Viessmann"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Modell</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.model || ''}
                        onChange={(e) => setNewDevice({...newDevice, model: e.target.value})}
                        placeholder="z.B. Vitocal 300-G"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Seriennummer</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.serialNumber || ''}
                        onChange={(e) => setNewDevice({...newDevice, serialNumber: e.target.value})}
                        placeholder="z.B. VIT-2024-001"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Anschaffungspreis (€)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.purchasePrice || ''}
                        onChange={(e) => setNewDevice({...newDevice, purchasePrice: parseFloat(e.target.value) || 0})}
                        placeholder="z.B. 18500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cyan-200 mb-3">Monatliche Betriebskosten (€)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-black/20 border border-cyan-400/30 rounded-xl text-white placeholder-cyan-200/60 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                        value={newDevice.monthlyOperatingCost || ''}
                        onChange={(e) => setNewDevice({...newDevice, monthlyOperatingCost: parseFloat(e.target.value) || 0})}
                        placeholder="z.B. 450"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-cyan-400/20">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 bg-white/10 border border-cyan-400/30 rounded-xl text-cyan-200 hover:bg-white/20 transition-all duration-300 font-medium"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
                    >
                      Gerät hinzufügen
                    </button>
                  </div>
                </form>
              </div>
            </EcoCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;