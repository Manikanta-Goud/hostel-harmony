import { useState, useMemo } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Package, Building2, Search, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { Requirement } from '@/types/hostel';

export default function Requirements() {
    const { hostels, requirements, addRequirement, updateRequirement, deleteRequirement, isLoading } = useHostel();
    const { toast } = useToast();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        hostelId: '',
        itemName: '',
        quantity: '1',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        vendor: '',
        notes: ''
    });

    const selectedHostelId = formData.hostelId || (hostels.length > 0 ? hostels[0].id : '');

    // Calculate monthly spending on requirements
    const monthlyMetrics = useMemo(() => {
        if (!selectedHostelId) return { totalSpent: 0, totalItems: 0, count: 0 };

        const monthStart = startOfMonth(new Date(selectedMonth));
        const monthEnd = endOfMonth(new Date(selectedMonth));

        const monthRequirements = requirements.filter(r => {
            if (r.hostelId !== selectedHostelId) return false;
            const reqDate = parseISO(r.date);
            return isWithinInterval(reqDate, { start: monthStart, end: monthEnd });
        });

        const totalSpent = monthRequirements.reduce((sum, r) => sum + r.amount, 0);
        const totalItems = monthRequirements.reduce((sum, r) => sum + r.quantity, 0);

        return { totalSpent, totalItems, count: monthRequirements.length };
    }, [selectedHostelId, selectedMonth, requirements]);

    const handleAddRequirement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addRequirement({
                hostelId: selectedHostelId,
                itemName: formData.itemName,
                quantity: parseInt(formData.quantity),
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
                vendor: formData.vendor || undefined,
                notes: formData.notes || undefined
            });
            toast({ title: 'Success', description: 'Requirement added successfully' });
            setIsAddDialogOpen(false);
            setFormData(prev => ({
                ...prev,
                itemName: '',
                quantity: '1',
                amount: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                vendor: '',
                notes: ''
            }));
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add requirement', variant: 'destructive' });
        }
    };

    const handleUpdateRequirement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequirement) return;
        try {
            await updateRequirement(selectedRequirement.id, {
                itemName: formData.itemName,
                quantity: parseInt(formData.quantity),
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString(),
                vendor: formData.vendor || undefined,
                notes: formData.notes || undefined
            });
            toast({ title: 'Success', description: 'Requirement updated successfully' });
            setIsEditDialogOpen(false);
            setSelectedRequirement(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update requirement', variant: 'destructive' });
        }
    };

    const handleDeleteRequirement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await deleteRequirement(id);
            toast({ title: 'Success', description: 'Requirement deleted successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete requirement', variant: 'destructive' });
        }
    };

    const openEditDialog = (requirement: Requirement) => {
        setSelectedRequirement(requirement);
        setFormData({
            hostelId: requirement.hostelId,
            itemName: requirement.itemName,
            quantity: requirement.quantity.toString(),
            amount: requirement.amount.toString(),
            date: format(parseISO(requirement.date), 'yyyy-MM-dd'),
            vendor: requirement.vendor || '',
            notes: requirement.notes || ''
        });
        setIsEditDialogOpen(true);
    };

    const filteredRequirements = requirements.filter(r =>
        r.hostelId === selectedHostelId &&
        format(parseISO(r.date), 'yyyy-MM') === selectedMonth &&
        (r.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0f1a]">
                <div className="text-blue-400 animate-pulse font-medium">Loading requirements...</div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
                {/* Header - Desktop */}
                <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
                    <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                Stock & Maintenance
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Manage essential requirements and asset tracking</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-gray-700">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                <select
                                    value={selectedHostelId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hostelId: e.target.value }))}
                                    className="bg-transparent border-none text-sm font-bold text-white focus:ring-0"
                                >
                                    {hostels.map(h => (
                                        <option key={h.id} value={h.id} className="bg-[#0f1f3a]">{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                            >
                                <Plus className="w-4 h-4" /> New Requirement
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Stock</h1>
                            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">Asset Registry</p>
                        </div>
                        <Button
                            onClick={() => setIsAddDialogOpen(true)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 rounded-lg"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-[#1a2332] px-3 py-2 rounded-xl border border-gray-700 flex items-center">
                            <Building2 className="w-4 h-4 text-blue-400 mr-2" />
                            <select
                                value={selectedHostelId}
                                onChange={(e) => setFormData(prev => ({ ...prev, hostelId: e.target.value }))}
                                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 p-0 w-full"
                            >
                                {hostels.map(h => (
                                    <option key={h.id} value={h.id} className="bg-[#0f1f3a]">{h.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-[#1a2332] px-3 py-2 rounded-xl border border-gray-700 flex items-center">
                            <Calendar className="w-4 h-4 text-purple-400 mr-2" />
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 p-0"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[#0f1f3a] border-gray-700 text-white placeholder:text-gray-500 h-11 rounded-xl"
                        />
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                        {/* Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-br from-blue-900/40 to-[#0f1f3a] border-white/5 shadow-xl">
                                <CardContent className="p-4 md:p-6">
                                    <p className="text-[10px] md:text-xs text-blue-400 uppercase font-bold tracking-widest">Monthly Spent</p>
                                    <p className="text-xl md:text-3xl font-bold mt-1 text-white">₹{monthlyMetrics.totalSpent.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-purple-900/40 to-[#0f1f3a] border-white/5 shadow-xl">
                                <CardContent className="p-4 md:p-6">
                                    <p className="text-[10px] md:text-xs text-purple-400 uppercase font-bold tracking-widest">Total Items</p>
                                    <p className="text-xl md:text-3xl font-bold mt-1 text-white">{monthlyMetrics.totalItems}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-green-900/40 to-[#0f1f3a] border-white/5 shadow-xl col-span-2 lg:col-span-1">
                                <CardContent className="p-4 md:p-6">
                                    <p className="text-[10px] md:text-xs text-green-400 uppercase font-bold tracking-widest">Purchase Records</p>
                                    <p className="text-xl md:text-3xl font-bold mt-1 text-white">{monthlyMetrics.count}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Inventory List */}
                        <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl overflow-hidden">
                            <CardHeader className="border-b border-white/5 px-4 md:px-6">
                                <CardTitle className="text-lg text-white font-bold">Registry Entries</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {filteredRequirements.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium">No purchase records found</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Desktop View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-white/5 hover:bg-transparent">
                                                        <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Date</TableHead>
                                                        <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Item</TableHead>
                                                        <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-right">Qty</TableHead>
                                                        <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest text-right">Amount</TableHead>
                                                        <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Vendor</TableHead>
                                                        <TableHead className="text-right text-gray-400 text-[10px] uppercase font-bold tracking-widest pr-6">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredRequirements.map(req => (
                                                        <TableRow key={req.id} className="border-white/5 hover:bg-white/5 group transition-colors">
                                                            <TableCell className="text-gray-400 text-xs">
                                                                {format(parseISO(req.date), 'dd MMM yyyy')}
                                                            </TableCell>
                                                            <TableCell className="font-bold text-white py-4">{req.itemName}</TableCell>
                                                            <TableCell className="text-right text-white font-medium">{req.quantity}</TableCell>
                                                            <TableCell className="text-right font-bold text-blue-400">₹{req.amount.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-col max-w-[200px]">
                                                                    <span className="text-xs text-gray-400 truncate font-bold uppercase tracking-wider">{req.vendor || '-'}</span>
                                                                    <span className="text-[10px] text-gray-600 truncate">{req.notes || ''}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(req)} className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                                        <Pencil className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRequirement(req.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-400">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="md:hidden divide-y divide-white/5">
                                            {filteredRequirements.map(req => (
                                                <div key={req.id} className="p-4 active:bg-white/5 transition-colors" onClick={() => openEditDialog(req)}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-white text-base">{req.itemName}</h3>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                                {format(parseISO(req.date), 'dd MMM yyyy')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-blue-400">₹{req.amount.toLocaleString()}</p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">Qty: {req.quantity}</p>
                                                        </div>
                                                    </div>
                                                    {req.vendor && (
                                                        <div className="mt-3 py-2 px-3 bg-[#1a2332] rounded-lg border border-gray-700">
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Supplier</p>
                                                            <p className="text-xs text-white font-medium mt-0.5">{req.vendor}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Global Dialogs */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md bg-[#0f1f3a] border-gray-700 text-white">
                    <DialogHeader><DialogTitle>New Purchase Record</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddRequirement} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Hostel</Label>
                            <Select value={selectedHostelId} onValueChange={(val) => setFormData(prev => ({ ...prev, hostelId: val }))}>
                                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select hostel" /></SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    {hostels.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input required value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" required min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="bg-gray-800 border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input type="number" required min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="bg-gray-800 border-gray-700" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Vendor</Label>
                            <Input value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Record</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md bg-[#0f1f3a] border-gray-700 text-white">
                    <DialogHeader><DialogTitle>Edit Record</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateRequirement} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Item Name</Label>
                            <Input required value={formData.itemName} onChange={(e) => setFormData({ ...formData, itemName: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input type="number" required min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="bg-gray-800 border-gray-700" />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount (₹)</Label>
                                <Input type="number" required min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="bg-gray-800 border-gray-700" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Vendor</Label>
                            <Input value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-gray-800 border-gray-700" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Update Record</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}
