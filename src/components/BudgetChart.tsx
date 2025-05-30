
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { storage } from '@/utils/storage';
import { Budget, ExpenseDetail, ExpenseHeader, ExpenseType } from '@/types/expense';

interface BudgetComparisonData {
  category: string;
  presupuestado: number;
  gastado: number;
  diferencia: number;
  porcentaje: number;
}

interface ExpenseTypeData {
  name: string;
  value: number;
  color: string;
}

const BudgetChart = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [comparisonData, setComparisonData] = useState<BudgetComparisonData[]>([]);
  const [expenseDistribution, setExpenseDistribution] = useState<ExpenseTypeData[]>([]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateChartData();
  }, [budgets, selectedMonth]);

  const loadData = () => {
    const loadedBudgets = storage.getBudgets();
    const loadedTypes = storage.getExpenseTypes();
    
    setBudgets(loadedBudgets);
    setExpenseTypes(loadedTypes);
  };

  const generateChartData = () => {
    const monthBudgets = budgets.filter(budget => budget.month === selectedMonth);
    const expenses = storage.getExpenseHeaders();
    const expenseDetails = storage.getExpenseDetails();

    // Calculate actual expenses for the selected month
    const monthExpenses = expenses.filter(expense => {
      const expenseMonth = expense.date.toISOString().slice(0, 7);
      return expenseMonth === selectedMonth;
    });

    const actualExpensesByType: Record<string, number> = {};
    
    monthExpenses.forEach(expense => {
      const details = expenseDetails.filter(detail => detail.expenseHeaderId === expense.id);
      details.forEach(detail => {
        if (!actualExpensesByType[detail.expenseTypeId]) {
          actualExpensesByType[detail.expenseTypeId] = 0;
        }
        actualExpensesByType[detail.expenseTypeId] += detail.amount;
      });
    });

    // Generate comparison data
    const comparison: BudgetComparisonData[] = monthBudgets.map(budget => {
      const expenseType = expenseTypes.find(type => type.id === budget.expenseTypeId);
      const actualSpent = actualExpensesByType[budget.expenseTypeId] || 0;
      const percentage = budget.budgetAmount > 0 ? (actualSpent / budget.budgetAmount) * 100 : 0;

      return {
        category: expenseType?.name || 'Sin categoría',
        presupuestado: budget.budgetAmount,
        gastado: actualSpent,
        diferencia: budget.budgetAmount - actualSpent,
        porcentaje: Math.round(percentage)
      };
    });

    setComparisonData(comparison);

    // Generate expense distribution data
    const distribution: ExpenseTypeData[] = Object.entries(actualExpensesByType)
      .map(([typeId, amount], index) => {
        const expenseType = expenseTypes.find(type => type.id === typeId);
        return {
          name: expenseType?.name || 'Sin categoría',
          value: amount,
          color: colors[index % colors.length]
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    setExpenseDistribution(distribution);
  };

  const getAvailableMonths = () => {
    const months = new Set<string>();
    budgets.forEach(budget => {
      months.add(budget.month);
    });
    
    // Add current month if not present
    const currentMonth = new Date().toISOString().slice(0, 7);
    months.add(currentMonth);
    
    return Array.from(months).sort().reverse();
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  };

  const getTotalBudget = () => {
    return comparisonData.reduce((total, item) => total + item.presupuestado, 0);
  };

  const getTotalSpent = () => {
    return comparisonData.reduce((total, item) => total + item.gastado, 0);
  };

  const getOverallPercentage = () => {
    const total = getTotalBudget();
    const spent = getTotalSpent();
    return total > 0 ? Math.round((spent / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gráfico Comparativo de Presupuestos</h1>
          <p className="text-gray-600">Compara tus presupuestos con los gastos reales</p>
        </div>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="month">Mes</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMonths().map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${getTotalBudget().toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${getTotalSpent().toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ejecución Total</CardTitle>
            <TrendingUp className={`h-4 w-4 ${getOverallPercentage() > 100 ? 'text-red-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getOverallPercentage() > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {getOverallPercentage()}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Budget vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparación Presupuesto vs Gasto Real - {formatMonth(selectedMonth)}
          </CardTitle>
          <CardDescription>
            Comparación detallada por categoría de gasto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay datos de presupuesto para el mes seleccionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'presupuestado' ? 'Presupuestado' : 'Gastado'
                  ]}
                />
                <Legend />
                <Bar dataKey="presupuestado" fill="#8884d8" name="Presupuestado" />
                <Bar dataKey="gastado" fill="#82ca9d" name="Gastado" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Expense Distribution */}
      {expenseDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribución de Gastos - {formatMonth(selectedMonth)}
            </CardTitle>
            <CardDescription>
              Distribución porcentual de gastos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monto']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      {comparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Categoría</CardTitle>
            <CardDescription>
              Análisis detallado de cada categoría de gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-right p-2">Presupuestado</th>
                    <th className="text-right p-2">Gastado</th>
                    <th className="text-right p-2">Diferencia</th>
                    <th className="text-right p-2">% Ejecución</th>
                    <th className="text-center p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{item.category}</td>
                      <td className="text-right p-2">${item.presupuestado.toFixed(2)}</td>
                      <td className="text-right p-2">${item.gastado.toFixed(2)}</td>
                      <td className={`text-right p-2 ${item.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${item.diferencia.toFixed(2)}
                      </td>
                      <td className="text-right p-2">{item.porcentaje}%</td>
                      <td className="text-center p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.porcentaje >= 100 ? 'bg-red-100 text-red-800' :
                          item.porcentaje >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.porcentaje >= 100 ? 'Excedido' :
                           item.porcentaje >= 80 ? 'Alerta' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetChart;
