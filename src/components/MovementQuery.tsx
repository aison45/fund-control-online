
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { storage } from '@/utils/storage';
import { ExpenseHeader, ExpenseDetail, Deposit, ExpenseType, MonetaryFund } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

interface Movement {
  id: string;
  date: Date;
  type: 'expense' | 'deposit';
  description: string;
  amount: number;
  monetaryFund: string;
  category?: string;
}

const MovementQuery = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [monetaryFunds, setMonetaryFunds] = useState<MonetaryFund[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    movementType: '',
    monetaryFundId: '',
    expenseTypeId: '',
    minAmount: '',
    maxAmount: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, filters]);

  const loadData = () => {
    const expenses = storage.getExpenseHeaders();
    const expenseDetails = storage.getExpenseDetails();
    const deposits = storage.getDeposits();
    const types = storage.getExpenseTypes();
    const funds = storage.getMonetaryFunds();

    setExpenseTypes(types);
    setMonetaryFunds(funds);

    // Combine expenses and deposits into movements
    const allMovements: Movement[] = [];

    // Add expenses
    expenses.forEach(expense => {
      const fund = funds.find(f => f.id === expense.monetaryFundId);
      const details = expenseDetails.filter(d => d.expenseHeaderId === expense.id);
      
      if (details.length > 0) {
        details.forEach(detail => {
          const expenseType = types.find(t => t.id === detail.expenseTypeId);
          allMovements.push({
            id: `expense-${detail.id}`,
            date: expense.date,
            type: 'expense',
            description: `${expense.commerceName} - ${expenseType?.name || 'Sin categoría'}`,
            amount: -detail.amount, // Negative for expenses
            monetaryFund: fund?.name || 'N/A',
            category: expenseType?.name
          });
        });
      } else {
        allMovements.push({
          id: `expense-${expense.id}`,
          date: expense.date,
          type: 'expense',
          description: expense.commerceName,
          amount: -expense.total,
          monetaryFund: fund?.name || 'N/A'
        });
      }
    });

    // Add deposits
    deposits.forEach(deposit => {
      const fund = funds.find(f => f.id === deposit.monetaryFundId);
      allMovements.push({
        id: `deposit-${deposit.id}`,
        date: deposit.date,
        type: 'deposit',
        description: 'Depósito',
        amount: deposit.amount, // Positive for deposits
        monetaryFund: fund?.name || 'N/A'
      });
    });

    // Sort by date (newest first)
    allMovements.sort((a, b) => b.date.getTime() - a.date.getTime());
    setMovements(allMovements);
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(movement => movement.date >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(movement => movement.date <= toDate);
    }

    // Movement type filter
    if (filters.movementType) {
      filtered = filtered.filter(movement => movement.type === filters.movementType);
    }

    // Monetary fund filter
    if (filters.monetaryFundId) {
      const selectedFund = monetaryFunds.find(f => f.id === filters.monetaryFundId);
      if (selectedFund) {
        filtered = filtered.filter(movement => movement.monetaryFund === selectedFund.name);
      }
    }

    // Expense type filter (only for expenses)
    if (filters.expenseTypeId) {
      const selectedType = expenseTypes.find(t => t.id === filters.expenseTypeId);
      if (selectedType) {
        filtered = filtered.filter(movement => 
          movement.type === 'expense' && movement.category === selectedType.name
        );
      }
    }

    // Amount range filter
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(movement => Math.abs(movement.amount) >= minAmount);
    }

    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(movement => Math.abs(movement.amount) <= maxAmount);
    }

    setFilteredMovements(filtered);
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      movementType: '',
      monetaryFundId: '',
      expenseTypeId: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Monto', 'Fondo', 'Categoría'];
    const csvContent = [
      headers.join(','),
      ...filteredMovements.map(movement => [
        movement.date.toLocaleDateString(),
        movement.type === 'expense' ? 'Gasto' : 'Depósito',
        `"${movement.description}"`,
        movement.amount.toFixed(2),
        `"${movement.monetaryFund}"`,
        `"${movement.category || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Éxito",
      description: "Reporte exportado correctamente",
    });
  };

  const getTotalExpenses = () => {
    return filteredMovements
      .filter(m => m.type === 'expense')
      .reduce((total, movement) => total + Math.abs(movement.amount), 0);
  };

  const getTotalDeposits = () => {
    return filteredMovements
      .filter(m => m.type === 'deposit')
      .reduce((total, movement) => total + movement.amount, 0);
  };

  const getNetBalance = () => {
    return getTotalDeposits() - getTotalExpenses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consulta de Movimientos</h1>
          <p className="text-gray-600">Consulta y filtra todos tus movimientos financieros</p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredMovements.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${getTotalDeposits().toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${getTotalExpenses().toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <TrendingUp className={`h-4 w-4 ${getNetBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNetBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {getNetBalance() >= 0 ? '+' : ''}${getNetBalance().toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="movementType">Tipo de Movimiento</Label>
              <Select
                value={filters.movementType}
                onValueChange={(value) => setFilters({...filters, movementType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                  <SelectItem value="deposit">Depósitos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="monetaryFund">Fondo Monetario</Label>
              <Select
                value={filters.monetaryFundId}
                onValueChange={(value) => setFilters({...filters, monetaryFundId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {monetaryFunds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expenseType">Tipo de Gasto</Label>
              <Select
                value={filters.expenseTypeId}
                onValueChange={(value) => setFilters({...filters, expenseTypeId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minAmount">Monto Mínimo</Label>
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxAmount">Monto Máximo</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                placeholder="999999.99"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>

            <div className="grid gap-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Resultados ({filteredMovements.length} movimientos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron movimientos que coincidan con los filtros
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fondo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{movement.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        movement.type === 'expense' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {movement.type === 'expense' ? 'Gasto' : 'Depósito'}
                      </span>
                    </TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell>{movement.category || 'N/A'}</TableCell>
                    <TableCell>{movement.monetaryFund}</TableCell>
                    <TableCell className={`text-right font-medium ${
                      movement.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.amount >= 0 ? '+' : ''}${movement.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MovementQuery;
