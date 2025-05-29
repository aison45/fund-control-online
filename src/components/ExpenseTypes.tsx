
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { storage } from '@/utils/storage';
import { ExpenseType } from '@/types/expense';
import { toast } from 'sonner';

const ExpenseTypes = () => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpenseType, setEditingExpenseType] = useState<ExpenseType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const loadExpenseTypes = () => {
    const types = storage.getExpenseTypes();
    setExpenseTypes(types);
  };

  const generateNextCode = () => {
    const codes = expenseTypes.map(type => parseInt(type.code)).filter(code => !isNaN(code));
    const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
    return (maxCode + 1).toString().padStart(3, '0');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpenseType) {
      // Update existing expense type
      const updatedTypes = expenseTypes.map(type =>
        type.id === editingExpenseType.id
          ? { ...type, name: formData.name, description: formData.description }
          : type
      );
      setExpenseTypes(updatedTypes);
      storage.saveExpenseTypes(updatedTypes);
      toast.success('Tipo de gasto actualizado correctamente');
    } else {
      // Create new expense type
      const newExpenseType: ExpenseType = {
        id: Date.now().toString(),
        code: generateNextCode(),
        name: formData.name,
        description: formData.description,
        createdAt: new Date()
      };
      
      const updatedTypes = [...expenseTypes, newExpenseType];
      setExpenseTypes(updatedTypes);
      storage.saveExpenseTypes(updatedTypes);
      toast.success('Tipo de gasto creado correctamente');
    }

    resetForm();
  };

  const handleEdit = (expenseType: ExpenseType) => {
    setEditingExpenseType(expenseType);
    setFormData({
      name: expenseType.name,
      description: expenseType.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este tipo de gasto?')) {
      const updatedTypes = expenseTypes.filter(type => type.id !== id);
      setExpenseTypes(updatedTypes);
      storage.saveExpenseTypes(updatedTypes);
      toast.success('Tipo de gasto eliminado correctamente');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingExpenseType(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tipos de Gasto</h2>
          <p className="text-muted-foreground">
            Gestiona los tipos de gastos para categorizar tus transacciones
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Tipo de Gasto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Gasto</CardTitle>
          <CardDescription>
            Los códigos se generan automáticamente de forma secuencial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseTypes.map((expenseType) => (
                <TableRow key={expenseType.id}>
                  <TableCell className="font-mono">{expenseType.code}</TableCell>
                  <TableCell className="font-medium">{expenseType.name}</TableCell>
                  <TableCell>{expenseType.description}</TableCell>
                  <TableCell>{expenseType.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(expenseType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(expenseType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {expenseTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay tipos de gasto registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpenseType ? 'Editar Tipo de Gasto' : 'Nuevo Tipo de Gasto'}
            </DialogTitle>
            <DialogDescription>
              {editingExpenseType 
                ? 'Modifica los datos del tipo de gasto' 
                : 'El código se generará automáticamente'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Alimentación, Transporte, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional del tipo de gasto"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingExpenseType ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseTypes;
