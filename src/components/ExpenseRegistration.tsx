
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Receipt, X } from 'lucide-react';
import { storage } from '@/utils/storage';
import { ExpenseHeader, ExpenseDetail, ExpenseType, MonetaryFund } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';

const ExpenseRegistration = () => {
  const [expenses, setExpenses] = useState<ExpenseHeader[]>([]);
  const [expenseDetails, setExpenseDetails] = useState<ExpenseDetail[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [monetaryFunds, setMonetaryFunds] = useState<MonetaryFund[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseHeader | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    monetaryFundId: '',
    commerceName: '',
    documentType: 'receipt' as const,
    observations: '',
    details: [{ expenseTypeId: '', amount: '', description: '' }]
  });
  const { toast } = useToast();

  useEffect(() => {
    loadExpenses();
    loadExpenseTypes();
    loadMonetaryFunds();
    loadExpenseDetails();
  }, []);

  const loadExpenses = () => {
    const loadedExpenses = storage.getExpenseHeaders();
    setExpenses(loadedExpenses);
  };

  const loadExpenseDetails = () => {
    const loadedDetails = storage.getExpenseDetails();
    setExpenseDetails(loadedDetails);
  };

  const loadExpenseTypes = () => {
    const loadedTypes = storage.getExpenseTypes();
    setExpenseTypes(loadedTypes);
  };

  const loadMonetaryFunds = () => {
    const loadedFunds = storage.getMonetaryFunds();
    setMonetaryFunds(loadedFunds);
  };

  const addDetailRow = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { expenseTypeId: '', amount: '', description: '' }]
    });
  };

  const removeDetailRow = (index: number) => {
    if (formData.details.length > 1) {
      const newDetails = formData.details.filter((_, i) => i !== index);
      setFormData({ ...formData, details: newDetails });
    }
  };

  const updateDetailRow = (index: number, field: string, value: string) => {
    const newDetails = [...formData.details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, details: newDetails });
  };

  const calculateTotal = () => {
    return formData.details.reduce((total, detail) => {
      return total + (parseFloat(detail.amount) || 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monetaryFundId || !formData.commerceName) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const validDetails = formData.details.filter(detail => 
      detail.expenseTypeId && detail.amount && parseFloat(detail.amount) > 0
    );

    if (validDetails.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un detalle de gasto válido",
        variant: "destructive",
      });
      return;
    }

    const total = calculateTotal();
    const expenseId = editingExpense?.id || Date.now().toString();

    const expenseHeader: ExpenseHeader = {
      id: expenseId,
      date: new Date(formData.date),
      monetaryFundId: formData.monetaryFundId,
      observations: formData.observations,
      commerceName: formData.commerceName,
      documentType: formData.documentType,
      total: total,
      createdAt: editingExpense?.createdAt || new Date()
    };

    const newDetails: ExpenseDetail[] = validDetails.map((detail, index) => ({
      id: editingExpense ? `${expenseId}-${index}` : `${expenseId}-${index}`,
      expenseHeaderId: expenseId,
      expenseTypeId: detail.expenseTypeId,
      amount: parseFloat(detail.amount)
    }));

    const existingHeaders = storage.getExpenseHeaders();
    const existingDetails = storage.getExpenseDetails();

    if (editingExpense) {
      const updatedHeaders = existingHeaders.map(expense => 
        expense.id === editingExpense.id ? expenseHeader : expense
      );
      const filteredDetails = existingDetails.filter(detail => detail.expenseHeaderId !== editingExpense.id);
      
      storage.saveExpenseHeaders(updatedHeaders);
      storage.saveExpenseDetails([...filteredDetails, ...newDetails]);
      
      toast({
        title: "Éxito",
        description: "Gasto actualizado correctamente",
      });
    } else {
      storage.saveExpenseHeaders([...existingHeaders, expenseHeader]);
      storage.saveExpenseDetails([...existingDetails, ...newDetails]);
      
      toast({
        title: "Éxito",
        description: "Gasto registrado correctamente",
      });
    }

    resetForm();
    loadExpenses();
    loadExpenseDetails();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      monetaryFundId: '',
      commerceName: '',
      documentType: 'receipt',
      observations: '',
      details: [{ expenseTypeId: '', amount: '', description: '' }]
    });
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (expense: ExpenseHeader) => {
    const details = expenseDetails.filter(detail => detail.expenseHeaderId === expense.id);
    
    setEditingExpense(expense);
    setFormData({
      date: expense.date.toISOString().split('T')[0],
      monetaryFundId: expense.monetaryFundId,
      commerceName: expense.commerceName,
      documentType: expense.documentType,
      observations: expense.observations,
      details: details.map(detail => ({
        expenseTypeId: detail.expenseTypeId,
        amount: detail.amount.toString(),
        description: ''
      }))
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const existingHeaders = storage.getExpenseHeaders();
    const existingDetails = storage.getExpenseDetails();
    
    const filteredHeaders = existingHeaders.filter(expense => expense.id !== id);
    const filteredDetails = existingDetails.filter(detail => detail.expenseHeaderId !== id);
    
    storage.saveExpenseHeaders(filteredHeaders);
    storage.saveExpenseDetails(filteredDetails);
    
    loadExpenses();
    loadExpenseDetails();
    
    toast({
      title: "Éxito",
      description: "Gasto eliminado correctamente",
    });
  };

  const getExpenseTypeName = (expenseTypeId: string) => {
    const expenseType = expenseTypes.find(type => type.id === expenseTypeId);
    return expenseType?.name || 'N/A';
  };

  const getMonetaryFundName = (monetaryFundId: string) => {
    const fund = monetaryFunds.find(fund => fund.id === monetaryFundId);
    return fund?.name || 'N/A';
  };

  const getExpenseDetailsForHeader = (headerId: string) => {
    return expenseDetails.filter(detail => detail.expenseHeaderId === headerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registro de Gastos</h1>
          <p className="text-gray-600">Registra y gestiona todos tus gastos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
              </DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto con sus detalles'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="commerceName">Comercio</Label>
                    <Input
                      id="commerceName"
                      value={formData.commerceName}
                      onChange={(e) => setFormData({...formData, commerceName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <Select
                      value={formData.documentType}
                      onValueChange={(value: 'receipt' | 'invoice' | 'other') => setFormData({...formData, documentType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receipt">Recibo</SelectItem>
                        <SelectItem value="invoice">Factura</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Detalles del Gasto</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDetailRow}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Detalle
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.details.map((detail, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Select
                            value={detail.expenseTypeId}
                            onValueChange={(value) => updateDetailRow(index, 'expenseTypeId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo de gasto" />
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
                        <div className="col-span-3">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Monto"
                            value={detail.amount}
                            onChange={(e) => updateDetailRow(index, 'amount', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Descripción"
                            value={detail.description}
                            onChange={(e) => updateDetailRow(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeDetailRow(index)}
                            disabled={formData.details.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-right font-bold">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingExpense ? 'Actualizar' : 'Registrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Lista de Gastos
          </CardTitle>
          <CardDescription>
            Historial de todos los gastos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay gastos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Comercio</TableHead>
                  <TableHead>Fondo</TableHead>
                  <TableHead>Tipo Documento</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date.toLocaleDateString()}</TableCell>
                    <TableCell>{expense.commerceName}</TableCell>
                    <TableCell>{getMonetaryFundName(expense.monetaryFundId)}</TableCell>
                    <TableCell className="capitalize">{expense.documentType}</TableCell>
                    <TableCell>${expense.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
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

export default ExpenseRegistration;
