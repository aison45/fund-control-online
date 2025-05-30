
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, PiggyBank } from 'lucide-react';
import { storage } from '@/utils/storage';
import { Deposit, MonetaryFund } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

const Deposits = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [monetaryFunds, setMonetaryFunds] = useState<MonetaryFund[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    monetaryFundId: '',
    amount: '',
    description: '',
    referenceNumber: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadDeposits();
    loadMonetaryFunds();
  }, []);

  const loadDeposits = () => {
    const loadedDeposits = storage.getDeposits();
    setDeposits(loadedDeposits);
  };

  const loadMonetaryFunds = () => {
    const loadedFunds = storage.getMonetaryFunds();
    setMonetaryFunds(loadedFunds);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monetaryFundId || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios correctamente",
        variant: "destructive",
      });
      return;
    }

    const depositData: Deposit = {
      id: editingDeposit?.id || Date.now().toString(),
      date: new Date(formData.date),
      monetaryFundId: formData.monetaryFundId,
      amount: parseFloat(formData.amount),
      createdAt: editingDeposit?.createdAt || new Date()
    };

    const existingDeposits = storage.getDeposits();
    const existingFunds = storage.getMonetaryFunds();

    // Update monetary fund balance
    const updatedFunds = existingFunds.map(fund => {
      if (fund.id === formData.monetaryFundId) {
        const oldAmount = editingDeposit ? editingDeposit.amount : 0;
        const newBalance = fund.balance - oldAmount + depositData.amount;
        return { ...fund, balance: newBalance };
      }
      return fund;
    });

    if (editingDeposit) {
      const updatedDeposits = existingDeposits.map(deposit => 
        deposit.id === editingDeposit.id ? depositData : deposit
      );
      storage.saveDeposits(updatedDeposits);
      storage.saveMonetaryFunds(updatedFunds);
      
      toast({
        title: "Éxito",
        description: "Depósito actualizado correctamente",
      });
    } else {
      storage.saveDeposits([...existingDeposits, depositData]);
      storage.saveMonetaryFunds(updatedFunds);
      
      toast({
        title: "Éxito",
        description: "Depósito registrado correctamente",
      });
    }

    resetForm();
    loadDeposits();
    loadMonetaryFunds();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      monetaryFundId: '',
      amount: '',
      description: '',
      referenceNumber: ''
    });
    setEditingDeposit(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setFormData({
      date: deposit.date.toISOString().split('T')[0],
      monetaryFundId: deposit.monetaryFundId,
      amount: deposit.amount.toString(),
      description: '',
      referenceNumber: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (deposit: Deposit) => {
    const existingDeposits = storage.getDeposits();
    const existingFunds = storage.getMonetaryFunds();
    
    // Update monetary fund balance (subtract the deposit amount)
    const updatedFunds = existingFunds.map(fund => {
      if (fund.id === deposit.monetaryFundId) {
        return { ...fund, balance: fund.balance - deposit.amount };
      }
      return fund;
    });
    
    const filteredDeposits = existingDeposits.filter(d => d.id !== deposit.id);
    
    storage.saveDeposits(filteredDeposits);
    storage.saveMonetaryFunds(updatedFunds);
    
    loadDeposits();
    loadMonetaryFunds();
    
    toast({
      title: "Éxito",
      description: "Depósito eliminado correctamente",
    });
  };

  const getMonetaryFundName = (monetaryFundId: string) => {
    const fund = monetaryFunds.find(fund => fund.id === monetaryFundId);
    return fund?.name || 'N/A';
  };

  const getTotalDeposits = () => {
    return deposits.reduce((total, deposit) => total + deposit.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Depósitos</h1>
          <p className="text-gray-600">Registra ingresos y depósitos a tus fondos monetarios</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Depósito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDeposit ? 'Editar Depósito' : 'Nuevo Depósito'}
              </DialogTitle>
              <DialogDescription>
                {editingDeposit ? 'Modifica los datos del depósito' : 'Registra un nuevo depósito o ingreso'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monetaryFund">Fondo Monetario</Label>
                  <Select
                    value={formData.monetaryFundId}
                    onValueChange={(value) => setFormData({...formData, monetaryFundId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un fondo" />
                    </SelectTrigger>
                    <SelectContent>
                      {monetaryFunds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.name} - ${fund.balance.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Monto</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del depósito (opcional)"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referenceNumber">Número de Referencia</Label>
                  <Input
                    id="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                    placeholder="Número de referencia o transferencia (opcional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDeposit ? 'Actualizar' : 'Registrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Depósitos</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalDeposits().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Suma total de todos los depósitos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depósitos este Mes</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${deposits.filter(d => {
                const depositMonth = d.date.getMonth();
                const currentMonth = new Date().getMonth();
                return depositMonth === currentMonth;
              }).reduce((total, deposit) => total + deposit.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Depósitos del mes actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Depósito</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${deposits.length > 0 ? Math.max(...deposits.map(d => d.amount)).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monto del depósito más reciente
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Lista de Depósitos
          </CardTitle>
          <CardDescription>
            Historial de todos los depósitos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay depósitos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fondo Monetario</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.sort((a, b) => b.date.getTime() - a.date.getTime()).map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>{deposit.date.toLocaleDateString()}</TableCell>
                    <TableCell>{getMonetaryFundName(deposit.monetaryFundId)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      +${deposit.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(deposit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(deposit)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default Deposits;
