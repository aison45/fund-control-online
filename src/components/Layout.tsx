
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  TrendingUp, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Wallet,
  PiggyBank,
  Receipt,
  Plus,
  Search
} from 'lucide-react';
import { storage } from '@/utils/storage';

interface LayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Layout = ({ children, activeSection, onSectionChange, onLogout }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = storage.getCurrentUser();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      key: 'dashboard'
    },
    {
      title: 'Mantenimientos',
      icon: Settings,
      key: 'maintenance',
      submenu: [
        { title: 'Tipos de Gasto', key: 'expense-types', icon: Receipt },
        { title: 'Fondos Monetarios', key: 'monetary-funds', icon: Wallet }
      ]
    },
    {
      title: 'Movimientos',
      icon: TrendingUp,
      key: 'movements',
      submenu: [
        { title: 'Presupuestos', key: 'budgets', icon: PiggyBank },
        { title: 'Registro de Gastos', key: 'expenses', icon: Receipt },
        { title: 'Depósitos', key: 'deposits', icon: Plus }
      ]
    },
    {
      title: 'Consultas y Reportes',
      icon: BarChart3,
      key: 'reports',
      submenu: [
        { title: 'Consulta de Movimientos', key: 'movements-query', icon: Search },
        { title: 'Gráfico Comparativo', key: 'budget-chart', icon: BarChart3 }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="financial-gradient text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10 lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-bold">Control de Gastos</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Bienvenido, {currentUser?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full overflow-y-auto pt-16 lg:pt-0">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={item.key}>
                  <Button
                    variant={activeSection === item.key ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      onSectionChange(item.key);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.title}
                  </Button>
                  {item.submenu && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Button
                          key={subitem.key}
                          variant={activeSection === subitem.key ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            onSectionChange(subitem.key);
                            setSidebarOpen(false);
                          }}
                        >
                          <subitem.icon className="h-3 w-3 mr-2" />
                          {subitem.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
