import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Filter,
  Download,
  RefreshCw,
  UserCheck,
  UserX
} from 'lucide-react';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { notificationService } from '@/services/notification.service';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'buergermeister' | 'manager' | 'gebaeudemanager' | 'user' | 'buerger';
  department?: string;
  phone?: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Mock data for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Max Mustermann',
      email: 'max.mustermann@hechingen.de',
      role: 'admin',
      department: 'IT-Abteilung',
      phone: '+49 7471 930-0',
      lastLogin: '2024-01-15T10:30:00Z',
      status: 'active',
      createdAt: '2023-01-15T08:00:00Z'
    },
    {
      id: '2',
      name: 'Anna Schmidt',
      email: 'anna.schmidt@hechingen.de',
      role: 'manager',
      department: 'Energiemanagement',
      phone: '+49 7471 930-123',
      lastLogin: '2024-01-14T16:45:00Z',
      status: 'active',
      createdAt: '2023-03-10T09:15:00Z'
    },
    {
      id: '3',
      name: 'Dr. Martin Weber',
      email: 'martin.weber@hechingen.de',
      role: 'buergermeister',
      department: 'Bürgermeisteramt',
      phone: '+49 7471 930-100',
      lastLogin: '2024-01-14T14:20:00Z',
      status: 'active',
      createdAt: '2022-11-01T10:00:00Z'
    },
    {
      id: '4',
      name: 'Sarah Mueller',
      email: 'sarah.mueller@hechingen.de',
      role: 'gebaeudemanager',
      department: 'Liegenschaftsamt',
      phone: '+49 7471 930-200',
      lastLogin: '2024-01-13T11:15:00Z',
      status: 'active',
      createdAt: '2023-06-15T12:30:00Z'
    },
    {
      id: '5',
      name: 'Thomas Fischer',
      email: 'thomas.fischer@hechingen.de',
      role: 'user',
      department: 'Schulverwaltung',
      phone: '+49 7471 930-300',
      lastLogin: '2024-01-12T09:00:00Z',
      status: 'inactive',
      createdAt: '2023-09-20T14:45:00Z'
    }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(mockUsers);
      } catch (error) {
        notificationService.error('Fehler beim Laden der Benutzerdaten');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const roleLabels = {
    admin: 'Administrator',
    buergermeister: 'Bürgermeister',
    manager: 'Manager',
    gebaeudemanager: 'Gebäudemanager',
    user: 'Benutzer',
    buerger: 'Bürger'
  };

  const getRoleColor = (role: string) => {
    const colorMap = {
      admin: 'bg-red-500/20 text-red-300 border-red-400/30',
      buergermeister: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      manager: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      gebaeudemanager: 'bg-green-500/20 text-green-300 border-green-400/30',
      user: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
      buerger: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
    };
    return colorMap[role as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      active: 'bg-green-500/20 text-green-300 border-green-400/30',
      inactive: 'bg-red-500/20 text-red-300 border-red-400/30',
      pending: 'bg-orange-500/20 text-orange-300 border-orange-400/30'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowCreateModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
      setUsers(users.filter(u => u.id !== userId));
      notificationService.success('Benutzer erfolgreich gelöscht');
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as any }
        : user
    ));
    notificationService.success('Benutzerstatus aktualisiert');
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      notificationService.warning('Bitte wählen Sie mindestens einen Benutzer aus');
      return;
    }

    switch (action) {
      case 'activate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) 
            ? { ...user, status: 'active' as any }
            : user
        ));
        notificationService.success(`${selectedUsers.length} Benutzer aktiviert`);
        break;
      case 'deactivate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) 
            ? { ...user, status: 'inactive' as any }
            : user
        ));
        notificationService.success(`${selectedUsers.length} Benutzer deaktiviert`);
        break;
      case 'delete':
        if (window.confirm(`Sind Sie sicher, dass Sie ${selectedUsers.length} Benutzer löschen möchten?`)) {
          setUsers(users.filter(user => !selectedUsers.includes(user.id)));
          notificationService.success(`${selectedUsers.length} Benutzer gelöscht`);
        }
        break;
    }
    setSelectedUsers([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Lade Benutzerdaten..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Eco Header */}
        <EcoCard variant="glass" className="p-8" glow="purple">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3 flex items-center gap-4">
                <Users className="w-12 h-12 text-purple-400" />
                Benutzerverwaltung
              </h1>
              <p className="text-purple-200/80 text-lg">
                Verwaltung aller Systembenutzer und Berechtigungen
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUsers(mockUsers)}
                className="px-6 py-3 bg-white/10 border border-purple-400/30 text-purple-200 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:bg-white/20 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Aktualisieren
              </button>
              <button
                onClick={handleCreateUser}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 hover:shadow-2xl font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Benutzer hinzufügen
              </button>
            </div>
          </div>
        </EcoCard>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EcoKPICard
            title="Gesamte Benutzer"
            value={userStats.total}
            icon={Users}
            color="purple"
            progress={85}
          />
          <EcoKPICard
            title="Aktive Benutzer"
            value={userStats.active}
            icon={UserCheck}
            color="green"
            trend={{
              value: Math.round((userStats.active / userStats.total) * 100),
              isPositive: true,
              label: "% aktiv"
            }}
            progress={(userStats.active / userStats.total) * 100}
          />
          <EcoKPICard
            title="Inaktive Benutzer"
            value={userStats.inactive}
            icon={UserX}
            color="orange"
            progress={20}
          />
          <EcoKPICard
            title="Administratoren"
            value={userStats.admins}
            icon={Shield}
            color="blue"
            progress={60}
          />
        </div>

        {/* Filters and Actions */}
        <EcoCard variant="glass" className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Benutzer suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/20 border border-purple-400/30 rounded-xl text-white placeholder-purple-200/60 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm transition-all duration-300"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-black/20 border border-purple-400/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-sm min-w-[180px]"
                >
                  <option value="all" className="bg-slate-800">Alle Rollen</option>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-800">{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-400/30 rounded-xl hover:bg-green-500/30 transition-colors duration-300 font-medium"
                >
                  Aktivieren
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-4 py-2 bg-orange-500/20 text-orange-300 border border-orange-400/30 rounded-xl hover:bg-orange-500/30 transition-colors duration-300 font-medium"
                >
                  Deaktivieren
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xl hover:bg-red-500/30 transition-colors duration-300 font-medium"
                >
                  Löschen
                </button>
              </div>
            )}

            {/* Export */}
            <button
              onClick={() => notificationService.info('Export wird vorbereitet...')}
              className="px-6 py-3 bg-white/10 border border-purple-400/30 text-purple-200 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 font-medium"
            >
              <Download className="w-4 h-4" />
              Exportieren
            </button>
          </div>
        </EcoCard>

        {/* Users Table */}
        <EcoCard variant="glass" className="p-6">
          <div className="overflow-x-auto bg-black/20 rounded-2xl backdrop-blur-sm">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-5 h-5 rounded border-purple-400/30 bg-black/20 text-purple-500 focus:ring-purple-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Abteilung
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Letzter Login
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-purple-200 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-purple-400/30 bg-black/20 text-purple-500 focus:ring-purple-500 focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-lg font-bold text-white">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-purple-200/80 flex items-center gap-2 mt-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-purple-200/80 flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-3 py-1 text-sm font-bold rounded-full border",
                        getRoleColor(user.role)
                      )}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        {user.department || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-3 py-1 text-sm font-bold rounded-full border",
                        getStatusColor(user.status)
                      )}>
                        {user.status === 'active' ? 'Aktiv' : user.status === 'inactive' ? 'Inaktiv' : 'Ausstehend'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-200/80">
                      {new Date(user.lastLogin).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-500/30 transition-colors duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={cn(
                            "p-2 rounded-xl border transition-colors duration-300",
                            user.status === 'active' 
                              ? 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30' 
                              : 'bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30'
                          )}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xl hover:bg-red-500/30 transition-colors duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EcoCard>

        {/* Info Alert */}
        <EcoCard variant="glass" className="p-6 border-l-4 border-purple-400">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Benutzerverwaltung</h3>
              <p className="text-purple-200/80">
                Hier können Sie alle Systembenutzer verwalten, Rollen zuweisen und Berechtigungen anpassen. 
                Änderungen werden sofort wirksam.
              </p>
            </div>
          </div>
        </EcoCard>
      </div>
    </div>
  );
};

export default UserManagement;