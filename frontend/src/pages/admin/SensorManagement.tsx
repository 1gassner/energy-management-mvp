import React, { useState, useEffect } from 'react';
import { allMockSensors, mockBuildings } from '@/services/mock/mockData';
import { Sensor, Building } from '@/types';
import { Card } from '../../components/ui/Card';
import { Plus, Edit3, Trash2, Search, AlertTriangle } from 'lucide-react';

interface SensorWithBuilding extends Sensor {
  buildingName: string;
}

const SensorManagement: React.FC = () => {
  const [sensors, setSensors] = useState<SensorWithBuilding[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<SensorWithBuilding[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorWithBuilding | null>(null);

  // Initialize sensors with building names
  useEffect(() => {
    const sensorsWithBuildings: SensorWithBuilding[] = allMockSensors.map(sensor => {
      const building = mockBuildings.find(b => b.id === sensor.buildingId);
      return {
        ...sensor,
        buildingName: building?.name || 'Unbekanntes Gebäude'
      };
    });
    setSensors(sensorsWithBuildings);
    setFilteredSensors(sensorsWithBuildings);
  }, []);

  // Filter sensors based on search and filters
  useEffect(() => {
    let filtered = sensors;

    if (searchTerm) {
      filtered = filtered.filter(sensor => 
        sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sensor.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBuilding) {
      filtered = filtered.filter(sensor => sensor.buildingId === selectedBuilding);
    }

    if (selectedType) {
      filtered = filtered.filter(sensor => sensor.type === selectedType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(sensor => sensor.status === selectedStatus);
    }

    setFilteredSensors(filtered);
  }, [sensors, searchTerm, selectedBuilding, selectedType, selectedStatus]);

  const sensorTypes = Array.from(new Set(sensors.map(s => s.type)));
  const statusOptions = ['active', 'inactive', 'error'];

  const handleCreateSensor = () => {
    setEditingSensor(null);
    setShowCreateModal(true);
  };

  const handleEditSensor = (sensor: SensorWithBuilding) => {
    setEditingSensor(sensor);
    setShowCreateModal(true);
  };

  const handleDeleteSensor = (sensorId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Sensor löschen möchten?')) {
      setSensors(prev => prev.filter(s => s.id !== sensorId));
    }
  };

  const handleSaveSensor = (sensorData: Partial<Sensor>) => {
    if (editingSensor) {
      // Update existing sensor
      setSensors(prev => prev.map(s => 
        s.id === editingSensor.id 
          ? { ...s, ...sensorData, lastReading: new Date().toISOString() }
          : s
      ));
    } else {
      // Create new sensor
      const newSensor: SensorWithBuilding = {
        id: `sensor-${Date.now()}`,
        buildingId: sensorData.buildingId || '',
        type: sensorData.type || 'energy',
        name: sensorData.name || '',
        value: sensorData.value || 0,
        unit: sensorData.unit || '',
        status: sensorData.status || 'active',
        lastReading: new Date().toISOString(),
        metadata: sensorData.metadata,
        buildingName: mockBuildings.find(b => b.id === sensorData.buildingId)?.name || ''
      };
      setSensors(prev => [...prev, newSensor]);
    }
    setShowCreateModal(false);
    setEditingSensor(null);
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSensorTypeIcon = (type: string) => {
    switch (type) {
      case 'energy': return '⚡';
      case 'temperature': return '🌡️';
      case 'pool': return '🏊';
      case 'sports': return '🏃';
      case 'education': return '📚';
      case 'heritage': return '🏛️';
      default: return '📊';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sensorverwaltung</h1>
              <p className="text-gray-600 mt-2">
                Verwaltung aller {sensors.length} Sensoren in {mockBuildings.length} Gebäuden
              </p>
            </div>
            <button
              onClick={handleCreateSensor}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Neuer Sensor</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Sensoren gesamt</p>
                <p className="text-2xl font-bold text-gray-900">{sensors.length}</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Aktive Sensoren</p>
                <p className="text-2xl font-bold text-green-600">
                  {sensors.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Fehlerhaft</p>
                <p className="text-2xl font-bold text-red-600">
                  {sensors.filter(s => s.status === 'error').length}
                </p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Gebäude abgedeckt</p>
                <p className="text-2xl font-bold text-blue-600">{mockBuildings.length}</p>
              </div>
              <div className="text-3xl">🏢</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Sensor suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle Gebäude</option>
              {mockBuildings.map(building => (
                <option key={building.id} value={building.id}>{building.name}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle Typen</option>
              {sensorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Alle Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Sensors Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sensor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gebäude
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktueller Wert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letzte Messung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSensors.map((sensor) => (
                  <tr key={sensor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">{getSensorTypeIcon(sensor.type)}</div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sensor.name}</div>
                          <div className="text-sm text-gray-500">{sensor.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sensor.buildingName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{sensor.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {sensor.value} {sensor.unit}
                      </div>
                      {sensor.metadata?.critical && (
                        <div className="flex items-center text-xs text-orange-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Kritisch
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSensorStatusColor(sensor.status)}`}>
                        {sensor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sensor.lastReading).toLocaleString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditSensor(sensor)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSensor(sensor.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSensors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-2">📊</div>
              <p className="text-gray-500">Keine Sensoren gefunden</p>
              <p className="text-gray-400 text-sm">Versuchen Sie andere Filterkriterien</p>
            </div>
          )}
        </Card>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <SensorModal
            sensor={editingSensor}
            buildings={mockBuildings}
            onSave={handleSaveSensor}
            onClose={() => {
              setShowCreateModal(false);
              setEditingSensor(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Sensor Modal Component
interface SensorModalProps {
  sensor: SensorWithBuilding | null;
  buildings: Building[];
  onSave: (sensor: Partial<Sensor>) => void;
  onClose: () => void;
}

const SensorModal: React.FC<SensorModalProps> = ({ sensor, buildings, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: sensor?.name || '',
    buildingId: sensor?.buildingId || '',
    type: sensor?.type || 'energy',
    value: sensor?.value || 0,
    unit: sensor?.unit || '',
    status: sensor?.status || 'active',
    metadata: {
      location: sensor?.metadata?.location || '',
      critical: sensor?.metadata?.critical || false,
      alertThreshold: sensor?.metadata?.alertThreshold || undefined,
      description: sensor?.metadata?.description || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {sensor ? 'Sensor bearbeiten' : 'Neuen Sensor erstellen'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gebäude</label>
              <select
                value={formData.buildingId}
                onChange={(e) => setFormData(prev => ({ ...prev, buildingId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Gebäude auswählen</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="energy">Energie</option>
                <option value="temperature">Temperatur</option>
                <option value="pool">Pool</option>
                <option value="sports">Sport</option>
                <option value="education">Bildung</option>
                <option value="heritage">Denkmalschutz</option>
                <option value="occupancy">Auslastung</option>
                <option value="pump">Pumpe</option>
                <option value="water_quality">Wasserqualität</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="error">Fehler</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wert</label>
              <input
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. kWh, °C, %"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
            <input
              type="text"
              value={formData.metadata.location}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metadata: { ...prev.metadata, location: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="z.B. Hauptzähler, Erdgeschoss"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              value={formData.metadata.description}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metadata: { ...prev.metadata, description: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Zusätzliche Informationen zum Sensor"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="critical"
              checked={formData.metadata.critical}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metadata: { ...prev.metadata, critical: e.target.checked }
              }))}
              className="mr-2"
            />
            <label htmlFor="critical" className="text-sm text-gray-700">
              Kritischer Sensor (erfordert besondere Aufmerksamkeit)
            </label>
          </div>
          
          {formData.metadata.critical && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert-Schwellwert</label>
              <input
                type="number"
                step="0.1"
                value={formData.metadata.alertThreshold || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  metadata: { ...prev.metadata, alertThreshold: parseFloat(e.target.value) || undefined }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Wert bei dem Alert ausgelöst wird"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {sensor ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SensorManagement;