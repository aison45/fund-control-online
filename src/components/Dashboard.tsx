
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Receipt, TrendingUp, PiggyBank } from 'lucide-react';
import { storage } from '@/utils/storage';
import { useMemo } from 'react';

const Dashboard = () => {
  const monetaryFunds = storage.getMonetaryFunds();
  const expenseHeaders = storage.getExpenseHeaders();
  const expenseDetails = storage.getExpenseDetails();
  const deposits = storage.getDeposits();
  const budgets = storage.getBudgets();

  const stats = useMemo(() => {
    const totalBalance = monetaryFunds.reduce((sum, fund) => sum + fund.balance, 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthExpenses = expenseHeaders
      .filter(header => header.date.toISOString().slice(0, 7) === currentMonth)
      .reduce((sum, header) => sum + header.total, 0);
    
    const currentMonthDeposits = deposits
      .filter(deposit => deposit.date.toISOString().slice(0, 7) === currentMonth)
      .reduce((sum, deposit) => sum + deposit.amount, 0);
    
    const currentMonthBudget = budgets
      .filter(budget => budget.month === currentMonth)
      .reduce((sum, budget) => sum + budget.budgetAmount, 0);

    return {
      totalBalance,
      currentMonthExpenses,
      currentMonthDeposits,
      currentMonthBudget,
      totalFunds: monetaryFunds.length,
      totalExpenses: expenseHeaders.length
    };
  }, [monetaryFunds, expenseHeaders, deposits, budgets]);

  const dashboardCards = [
    {
      title: 'Balance Total',
      value: `$${stats.totalBalance.toLocaleString()}`,
      description: `En ${stats.totalFunds} fondo(s) monetario(s)`,
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Gastos del Mes',
      value: `$${stats.currentMonthExpenses.toLocaleString()}`,
      description: `${expenseHeaders.filter(h => h.date.toISOString().slice(0, 7) === new Date().toISOString().slice(0, 7)).length} transacción(es)`,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Depósitos del Mes',
      value: `$${stats.currentMonthDeposits.toLocaleString()}`,
      description: `${deposits.filter(d => d.date.toISOString().slice(0, 7) === new Date().toISOString().slice(0, 7)).length} depósito(s)`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Presupuesto del Mes',
      value: `$${stats.currentMonthBudget.toLocaleString()}`,
      description: `${budgets.filter(b => b.month === new Date().toISOString().slice(0, 7)).length} presupuesto(s)`,
      icon: PiggyBank,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general de tu control de gastos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="expense-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fondos Monetarios</CardTitle>
            <CardDescription>
              Estado actual de tus fondos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monetaryFunds.map((fund) => (
                <div key={fund.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{fund.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{fund.type === 'bank' ? 'Cuenta Bancaria' : 'Efectivo'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${fund.balance.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas transacciones registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseHeaders
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{expense.commerceName}</p>
                      <p className="text-sm text-gray-600">{expense.date.toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">-${expense.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              {expenseHeaders.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay transacciones registradas</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
