
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Wallet, Banknote } from 'lucide-react';
import { storage } from '@/utils/storage';
import { MonetaryFund } from '@/types/expense';
import { toast } from 'sonner';

const MonetaryFunds = () => {
  const [funds, setFunds] = useState<MonetaryFund[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<MonetaryFund | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'bank' | 'cash',
    balance: 0
  });

  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = () => {
    const savedFunds = storage.getMonetaryFunds();
    setFunds(savedFunds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingFund) {
      // Update existing fund
      const updatedFunds = funds.map(fund =>
        fund.id === editingFund.id
          ? { 
              ...fund, 
              name: formData.name, 
              type: formData.type,
              balance: formData.balance
            }
          : fund
      );
      setFunds(updatedFunds);
      storage.saveMonetaryFunds(updatedFunds);
      toast.success('Fondo monetario actualizado correctamente');
    } else {
      // Create new fund
      const newFund: MonetaryFund = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        balance: formData.balance,
        createdAt: new Date()
      };
      
      const updatedFunds = [...funds, newFund];
      setFunds(updatedFunds);
      storage.saveMonetaryFunds(updatedFunds);
      toast.success('Fondo monetario creado correctamente');
    }

    resetForm();
  };

  const handleEdit = (fund: MonetaryFund) => {
    setEditingFund(fund);
    setFormData({
      name: fund.name,
      type: fund.type,
      balance: fund.balance
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este fondo monetario?')) {
      const updatedFunds = funds.filter(fund => fund.id !== id);
      setFunds(updatedFunds);
      storage.saveMonetaryFunds(updatedFunds);
      toast.success('Fondo monetario eliminado correctamente');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'bank', balance: 0 });
    setEditingFund(null);
    setIsDialogOpen(false);
  };

  const getTotalBalance = () => {
    return funds.reduce((total, fund) => total + fund.balance, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fondos Monetarios</h2>
          <p className="text-muted-foreground">
            Gestiona tus cuentas bancarias y fondos de efectivo
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Fondo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalBalance().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              En {funds.length} fondo(s)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Bancarias</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funds.filter(f => f.type === 'bank').length}
            </div>
            <p className="text-xs text-muted-foreground">
              ${funds.filter(f => f.type === 'bank').reduce((sum, f) => sum + f.balance, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {funds.filter(f => f.type === 'cash').length}
            </div>
            <p className="text-xs text-muted-foreground">
              ${funds.filter(f => f.type === 'cash').reduce((sum, f) => sum + f.balance, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fondos Monetarios</CardTitle>
          <CardDescription>
            Administra tus cuentas bancarias y fondos de caja menuda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund) => (
                <TableRow key={fund.id}>
                  <TableCell className="font-medium">{fund.name}</TableCell>
                  <TableCell>
                    <Badge variant={fund.type === 'bank' ? 'default' : 'secondary'}>
                      {fund.type === 'bank' ? 'Cuenta Bancaria' : 'Efectivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">${fund.balance.toLocaleString()}</TableCell>
                  <TableCell>{fund.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(fund)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fund.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {funds.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay fondos monetarios registrados
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFund ? 'Editar Fondo Monetario' : 'Nuevo Fondo Monetario'}
            </DialogTitle>
            <DialogDescription>
              {editingFund 
                ? 'Modifica los datos del fondo monetario' 
                : 'Crea un nuevo fondo monetario (cuenta bancaria o efectivo)'
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
                placeholder="Ej: Cuenta Corriente, Caja Chica, etc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'bank' | 'cash') => 
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Cuenta Bancaria</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance Inicial *</Label>
              <Input
                id="balance"
                type="number"
                min="0"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingFund ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonetaryFunds;
