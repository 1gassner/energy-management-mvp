import React, { useState, useEffect } from 'react';
import EcoCard from '@/components/ui/EcoCard';
import EcoKPICard from '@/components/ui/EcoKPICard';
import { cn } from '@/lib/utils';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Calculator,
  Target,
  Zap,
  Building2
} from 'lucide-react';

interface BudgetItem {
  id: string;
  category: string;
  subcategory: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on-track' | 'warning' | 'exceeded';
  lastUpdated: string;
  buildingId?: string;
  buildingName?: string;
}

interface BudgetPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  totalSpent: number;
  active: boolean;
}

const BudgetManagement: React.FC = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('2024');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Mock data
  const mockBudgetPeriods: BudgetPeriod[] = [
    {
      id: '2024',
      name: 'Haushaltsjahr 2024',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      totalBudget: 2500000,
      totalSpent: 1850000,
      active: true
    },
    {
      id: '2023',
      name: 'Haushaltsjahr 2023',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      totalBudget: 2200000,
      totalSpent: 2150000,
      active: false
    }
  ];

  const mockBudgetItems: BudgetItem[] = [
    {
      id: '1',
      category: 'Energiekosten',
      subcategory: 'Strom Rathaus',
      budgeted: 180000,
      spent: 142000,
      remaining: 38000,
      percentage: 78.9,
      status: 'warning',
      lastUpdated: '2024-08-01T10:30:00Z',
      buildingId: 'rathaus',
      buildingName: 'Rathaus'
    },
    {
      id: '2',
      category: 'Energiekosten',
      subcategory: 'Gas Heizung',
      budgeted: 320000,
      spent: 245000,
      remaining: 75000,
      percentage: 76.6,
      status: 'on-track',
      lastUpdated: '2024-08-01T10:30:00Z'
    },
    {
      id: '3',
      category: 'Wartung & Instandhaltung',
      subcategory: 'HVAC-Systeme',
      budgeted: 85000,
      spent: 92000,
      remaining: -7000,
      percentage: 108.2,
      status: 'exceeded',
      lastUpdated: '2024-08-01T10:30:00Z'
    },
    {
      id: '4',
      category: 'Investitionen',
      subcategory: 'Solaranlage Gymnasium',
      budgeted: 450000,
      spent: 380000,
      remaining: 70000,
      percentage: 84.4,
      status: 'on-track',
      lastUpdated: '2024-08-01T10:30:00Z',
      buildingId: 'gymnasium',
      buildingName: 'Gymnasium'
    },
    {
      id: '5',
      category: 'Energiekosten',
      subcategory: 'Strom Hallenbad',
      budgeted: 95000,
      spent: 78000,
      remaining: 17000,
      percentage: 82.1,
      status: 'on-track',
      lastUpdated: '2024-08-01T10:30:00Z',
      buildingId: 'hallenbad',
      buildingName: 'Hallenbad'
    },
    {
      id: '6',
      category: 'Optimierung',
      subcategory: 'Smart Meter Installation',
      budgeted: 125000,
      spent: 67000,
      remaining: 58000,
      percentage: 53.6,
      status: 'on-track',
      lastUpdated: '2024-08-01T10:30:00Z'
    }
  ];

  useEffect(() => {
    setBudgetPeriods(mockBudgetPeriods);
    setBudgetItems(mockBudgetItems);
  }, []);

  const currentPeriod = budgetPeriods.find(p => p.id === activePeriod);
  
  const filteredItems = budgetItems.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const budgetStats = {
    totalBudgeted: budgetItems.reduce((sum, item) => sum + item.budgeted, 0),
    totalSpent: budgetItems.reduce((sum, item) => sum + item.spent, 0),
    totalRemaining: budgetItems.reduce((sum, item) => sum + item.remaining, 0),
    onTrack: budgetItems.filter(item => item.status === 'on-track').length,
    warning: budgetItems.filter(item => item.status === 'warning').length,
    exceeded: budgetItems.filter(item => item.status === 'exceeded').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'warning':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'exceeded':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'exceeded':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const categories = Array.from(new Set(budgetItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Eco Header */}
        <EcoCard variant="glass" className="p-8" glow="green">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent mb-3 flex items-center gap-4">
                <Calculator className="w-12 h-12 text-emerald-400" />
                Budget-Management
              </h1>
              <p className="text-emerald-200/80 text-lg">
                Verwaltung und Überwachung aller Energiebudgets und Ausgaben
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={activePeriod}
                onChange={(e) => setActivePeriod(e.target.value)}
                className="px-4 py-3 bg-black/20 border border-emerald-400/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm"
              >
                {budgetPeriods.map(period => (
                  <option key={period.id} value={period.id} className="bg-slate-800">
                    {period.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 hover:shadow-2xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Budget hinzufügen
              </button>
            </div>
          </div>
        </EcoCard>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EcoKPICard
            title="Gesamtbudget"
            value={new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(budgetStats.totalBudgeted)}
            icon={Target}
            color="green"
            progress={75}
          />
          <EcoKPICard
            title="Ausgegeben"
            value={new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(budgetStats.totalSpent)}
            icon={DollarSign}
            color="blue"
            trend={{
              value: Math.round((budgetStats.totalSpent / budgetStats.totalBudgeted) * 100),
              isPositive: false,
              label: "% vom Budget"
            }}
            progress={(budgetStats.totalSpent / budgetStats.totalBudgeted) * 100}
          />
          <EcoKPICard
            title="Verbleibendes Budget"
            value={new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(budgetStats.totalRemaining)}
            icon={Euro}
            color={budgetStats.totalRemaining >= 0 ? "green" : "orange"}
            trend={{
              value: Math.round((budgetStats.totalRemaining / budgetStats.totalBudgeted) * 100),
              isPositive: budgetStats.totalRemaining >= 0,
              label: "% verbleibend"
            }}
            progress={budgetStats.totalRemaining >= 0 ? 
              (budgetStats.totalRemaining / budgetStats.totalBudgeted) * 100 : 0
            }
          />
          <EcoKPICard
            title="Überschreitungen"
            value={budgetStats.exceeded}
            icon={AlertTriangle}
            color="orange"
            subtitle={`von ${budgetItems.length} Budgets`}
            progress={(budgetStats.exceeded / budgetItems.length) * 100}
          />
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EcoCard variant="glass" className="p-6 col-span-2" glow="green">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Budget-Verteilung</h3>
                <p className="text-emerald-200/80">Nach Kategorien</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {categories.map(category => {
                const categoryItems = budgetItems.filter(item => item.category === category);
                const categoryBudget = categoryItems.reduce((sum, item) => sum + item.budgeted, 0);
                const categorySpent = categoryItems.reduce((sum, item) => sum + item.spent, 0);
                const percentage = (categorySpent / categoryBudget) * 100;
                
                return (
                  <div key={category} className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-white">{category}</h4>
                      <span className="text-emerald-300 font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div 
                        className={cn(
                          "h-3 rounded-full transition-all duration-1000 ease-out",
                          percentage > 100 ? "bg-gradient-to-r from-red-500 to-red-600" :
                          percentage > 80 ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                          "bg-gradient-to-r from-emerald-500 to-green-600"
                        )}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-emerald-200/60">
                        Ausgegeben: {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(categorySpent)}
                      </span>
                      <span className="text-emerald-200/60">
                        Budget: {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(categoryBudget)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </EcoCard>

          <EcoCard variant="glass" className="p-6" glow="blue">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Status-Übersicht</h3>
                <p className="text-blue-200/80">Budget-Gesundheit</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {Math.round((budgetStats.onTrack / budgetItems.length) * 100)}%
                </div>
                <p className="text-blue-200/80">Budgets im Ziel</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">Im Ziel</span>
                  </div>
                  <span className="text-green-300 font-bold">{budgetStats.onTrack}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-500/20 rounded-xl border border-orange-400/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-300 font-medium">Warnung</span>
                  </div>
                  <span className="text-orange-300 font-bold">{budgetStats.warning}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-xl border border-red-400/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-300 font-medium">Überschritten</span>
                  </div>
                  <span className="text-red-300 font-bold">{budgetStats.exceeded}</span>
                </div>
              </div>
            </div>
          </EcoCard>
        </div>

        {/* Search and Filters */}
        <EcoCard variant="glass" className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Budget-Kategorien suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-emerald-400/30 rounded-xl text-white placeholder-emerald-200/60 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-black/20 border border-emerald-400/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm min-w-[180px]"
                >
                  <option value="all" className="bg-slate-800">Alle Kategorien</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-slate-800">{category}</option>
                  ))}
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-black/20 border border-emerald-400/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 backdrop-blur-sm"
              >
                <option value="all" className="bg-slate-800">Alle Status</option>
                <option value="on-track" className="bg-slate-800">Im Ziel</option>
                <option value="warning" className="bg-slate-800">Warnung</option>
                <option value="exceeded" className="bg-slate-800">Überschritten</option>
              </select>

              <button
                onClick={() => console.log('Export budget data')}
                className="px-6 py-3 bg-white/10 border border-emerald-400/30 text-emerald-200 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3 font-medium"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </EcoCard>

        {/* Budget Items Table */}
        <EcoCard variant="glass" className="p-6">
          <div className="overflow-x-auto bg-black/20 rounded-2xl backdrop-blur-sm">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Kategorie / Unterkategorie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Ausgegeben
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Verbleibend
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Fortschritt
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-200 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white text-lg">{item.subcategory}</div>
                        <div className="text-sm text-emerald-200/80 flex items-center gap-2 mt-1">
                          {item.buildingName && (
                            <>
                              <Building2 className="w-4 h-4" />
                              {item.buildingName} •
                            </>
                          )}
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-lg">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(item.budgeted)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-300">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(item.spent)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "font-medium",
                        item.remaining >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(item.remaining)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={cn(
                          "inline-flex px-3 py-1 text-sm font-bold rounded-full border",
                          getStatusColor(item.status)
                        )}>
                          {item.status === 'on-track' ? 'Im Ziel' :
                           item.status === 'warning' ? 'Warnung' : 'Überschritten'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">
                          {item.percentage.toFixed(1)}%
                        </span>
                        <div className="w-20 bg-white/10 rounded-full h-2">
                          <div 
                            className={cn(
                              "h-2 rounded-full transition-all duration-500",
                              item.percentage > 100 ? "bg-gradient-to-r from-red-500 to-red-600" :
                              item.percentage > 80 ? "bg-gradient-to-r from-orange-500 to-orange-600" :
                              "bg-gradient-to-r from-emerald-500 to-green-600"
                            )}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl hover:bg-blue-500/30 transition-colors duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => console.log('Delete', item.id)}
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

        {filteredItems.length === 0 && (
          <EcoCard variant="glass" className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Keine Budget-Einträge gefunden
            </h3>
            <p className="text-emerald-200/80">
              Keine Einträge entsprechen den aktuellen Filterkriterien.
            </p>
          </EcoCard>
        )}

        {/* Info Alert */}
        <EcoCard variant="glass" className="p-6 border-l-4 border-emerald-400">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Budget-Management</h3>
              <p className="text-emerald-200/80">
                Überwachen Sie alle Energiebudgets in Echtzeit. Rote Markierungen zeigen Budgetüberschreitungen an, 
                orange Bereiche warnen vor kritischen Ausgabenständen. Nutzen Sie die Filterfunktionen für detaillierte Analysen.
              </p>
            </div>
          </div>
        </EcoCard>
      </div>
    </div>
  );
};

export default BudgetManagement;