
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, PiggyBank } from 'lucide-react';
import { storage } from '@/utils/storage';
import { Budget, ExpenseType } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    expenseTypeId: '',
    month: '',
    budgetAmount: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBudgets();
    loadExpenseTypes();
  }, []);

  const loadBudgets = () => {
    const loadedBudgets = storage.getBudgets();
    setBudgets(loadedBudgets);
  };

  const loadExpenseTypes = () => {
    const loadedTypes = storage.getExpenseTypes();
    setExpenseTypes(loadedTypes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expenseTypeId || !formData.month || !formData.budgetAmount) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;

    const budgetData: Budget = {
      id: editingBudget?.id || Date.now().toString(),
      userId: currentUser.id,
      expenseTypeId: formData.expenseTypeId,
      month: formData.month,
      budgetAmount: parseFloat(formData.budgetAmount),
      spentAmount: editingBudget?.spentAmount || 0,
      createdAt: editingBudget?.createdAt || new Date()
    };

    const existingBudgets = storage.getBudgets();
    
    if (editingBudget) {
      const updatedBudgets = existingBudgets.map(budget => 
        budget.id === editingBudget.id ? budgetData : budget
      );
      storage.saveBudgets(updatedBudgets);
      toast({
        title: "Éxito",
        description: "Presupuesto actualizado correctamente",
      });
    } else {
      const duplicateCheck = existingBudgets.find(b => 
        b.expenseTypeId === budgetData.expenseTypeId && 
        b.month === budgetData.month &&
        b.userId === budgetData.userId
      );

      if (duplicateCheck) {
        toast({
          title: "Error",
          description: "Ya existe un presupuesto para este tipo de gasto en este mes",
          variant: "destructive",
        });
        return;
      }

      storage.saveBudgets([...existingBudgets, budgetData]);
      toast({
        title: "Éxito",
        description: "Presupuesto creado correctamente",
      });
    }

    resetForm();
    loadBudgets();
  };

  const resetForm = () => {
    setFormData({
      expenseTypeId: '',
      month: '',
      budgetAmount: '',
    });
    setEditingBudget(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      expenseTypeId: budget.expenseTypeId,
      month: budget.month,
      budgetAmount: budget.budgetAmount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const existingBudgets = storage.getBudgets();
    const filteredBudgets = existingBudgets.filter(budget => budget.id !== id);
    storage.saveBudgets(filteredBudgets);
    loadBudgets();
    toast({
      title: "Éxito",
      description: "Presupuesto eliminado correctamente",
    });
  };

  const getExpenseTypeName = (expenseTypeId: string) => {
    const expenseType = expenseTypes.find(type => type.id === expenseTypeId);
    return expenseType?.name || 'N/A';
  };

  const calculatePercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.round((spent / budget) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Presupuestos</h1>
          <p className="text-gray-600">Gestión de presupuestos por tipo de gasto y mes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Presupuesto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </DialogTitle>
              <DialogDescription>
                {editingBudget ? 'Modifica los datos del presupuesto' : 'Crea un nuevo presupuesto para controlar tus gastos'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="expenseType">Tipo de Gasto</Label>
                  <Select
                    value={formData.expenseTypeId}
                    onValueChange={(value) => setFormData({...formData, expenseTypeId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo de gasto" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="month">Mes</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budgetAmount">Monto Presupuestado</Label>
                  <Input
                    id="budgetAmount"
                    type="number"
                    step="0.01"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBudget ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Lista de Presupuestos
          </CardTitle>
          <CardDescription>
            Presupuestos configurados por mes y tipo de gasto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay presupuestos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Gasto</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Presupuestado</TableHead>
                  <TableHead>Gastado</TableHead>
                  <TableHead>Porcentaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => {
                  const percentage = calculatePercentage(budget.spentAmount, budget.budgetAmount);
                  return (
                    <TableRow key={budget.id}>
                      <TableCell>{getExpenseTypeName(budget.expenseTypeId)}</TableCell>
                      <TableCell>{budget.month}</TableCell>
                      <TableCell>${budget.budgetAmount.toFixed(2)}</TableCell>
                      <TableCell>${budget.spentAmount.toFixed(2)}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          percentage >= 100 ? 'bg-red-100 text-red-800' :
                          percentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {percentage >= 100 ? 'Excedido' :
                           percentage >= 80 ? 'Alerta' : 'Normal'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(budget)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(budget.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Budgets;
