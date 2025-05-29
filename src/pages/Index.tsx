
import { useState, useEffect } from 'react';
import LoginPage from '@/components/LoginPage';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import ExpenseTypes from '@/components/ExpenseTypes';
import MonetaryFunds from '@/components/MonetaryFunds';
import { storage } from '@/utils/storage';
import { User } from '@/types/expense';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    // Initialize storage and check for existing user session
    storage.init();
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'expense-types':
        return <ExpenseTypes />;
      case 'monetary-funds':
        return <MonetaryFunds />;
      case 'budgets':
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Presupuestos</h2><p className="text-gray-600">Próximamente...</p></div>;
      case 'expenses':
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Registro de Gastos</h2><p className="text-gray-600">Próximamente...</p></div>;
      case 'deposits':
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Depósitos</h2><p className="text-gray-600">Próximamente...</p></div>;
      case 'movements-query':
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Consulta de Movimientos</h2><p className="text-gray-600">Próximamente...</p></div>;
      case 'budget-chart':
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Gráfico Comparativo</h2><p className="text-gray-600">Próximamente...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default Index;
