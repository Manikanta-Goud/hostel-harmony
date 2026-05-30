import { useState, useEffect } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Staff, Hostel } from '@/types/hostel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Building2,
    Lightbulb,
    Truck,
    Wallet,
    CheckCircle,
    Plus,
    Edit,
    Trash2,
    Calendar,
    Users,
    UserCog,
    IndianRupee,
    Phone,
    MapPin,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isValid } from 'date-fns';
import { Utility, Supplier } from '@/types/hostel';
import { Textarea } from '@/components/ui/textarea';

const StaffOverview = () => {
    const {
        staff: allStaff,
        hostels,
        addStaff,
        updateStaff,
        deleteStaff,
        utilities,
        suppliers,
        addUtility,
        updateUtility,
        deleteUtility,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        staffSalaries,
        payStaffSalary
    } = useHostel();
    const { toast } = useToast();
    const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    useEffect(() => {
        if (hostels.length > 0 && !selectedHostel) {
            setSelectedHostel(hostels[0]);
        }
    }, [hostels, selectedHostel]);

    // Staff Dialog State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        area: '',
        role: '',
        monthlySalary: 0,
    });

    // Utility dialogs
    const [isAddUtilityDialogOpen, setIsAddUtilityDialogOpen] = useState(false);
    const [isEditUtilityDialogOpen, setIsEditUtilityDialogOpen] = useState(false);
    const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
    const [utilityFormData, setUtilityFormData] = useState({
        itemName: '',
        price: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
    });

    // Supplier dialogs
    const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
    const [isEditSupplierDialogOpen, setIsEditSupplierDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierFormData, setSupplierFormData] = useState({
        name: '',
        supplies: '',
        amount: '',
        phone: '',
        supplyType: 'fixed' as 'fixed' | 'per_unit',
        perUnitPrice: '',
        currentMonthUnits: '0'
    });

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            area: '',
            role: '',
            monthlySalary: 0,
        });
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHostel?.id) {
            toast({ title: 'Error', description: 'Please create and select a hostel first.', variant: 'destructive' });
            return;
        }

        try {
            await addStaff({
                hostelId: selectedHostel.id,
                ...formData,
                joinDate: new Date().toISOString(),
            });
            toast({ title: 'Success', description: 'Staff member added successfully' });
            resetForm();
            setIsAddDialogOpen(false);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to add staff member. Check database tables.', variant: 'destructive' });
        }
    };

    const handleEditStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return;

        try {
            await updateStaff(selectedStaff.id, formData);
            toast({ title: 'Success', description: 'Staff member updated successfully' });
            setIsEditDialogOpen(false);
            setSelectedStaff(null);
            resetForm();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to update staff member', variant: 'destructive' });
        }
    };

    const openEditDialog = (staffMember: Staff) => {
        setSelectedStaff(staffMember);
        setFormData({
            name: staffMember.name,
            phone: staffMember.phone,
            email: staffMember.email || '',
            area: staffMember.area || '',
            role: staffMember.role || '',
            monthlySalary: staffMember.monthlySalary,
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteStaff = async (id: string) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await deleteStaff(id);
            toast({ title: 'Success', description: 'Staff member deleted successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete staff member', variant: 'destructive' });
        }
    };

    // Utility handlers
    const handleAddUtility = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHostel?.id) {
            toast({ title: 'Error', description: 'Please create and select a hostel first.', variant: 'destructive' });
            return;
        }
        try {
            await addUtility({
                hostelId: selectedHostel.id,
                itemName: utilityFormData.itemName,
                price: parseFloat(utilityFormData.price),
                date: new Date(utilityFormData.date).toISOString(),
                description: utilityFormData.description || undefined
            });
            toast({ title: 'Success', description: 'Utility added successfully' });
            setIsAddUtilityDialogOpen(false);
            setUtilityFormData({ itemName: '', price: '', date: format(new Date(), 'yyyy-MM-dd'), description: '' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add utility', variant: 'destructive' });
        }
    };

    const handleUpdateUtility = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUtility) return;
        try {
            await updateUtility(selectedUtility.id, {
                itemName: utilityFormData.itemName,
                price: parseFloat(utilityFormData.price),
                date: new Date(utilityFormData.date).toISOString(),
                description: utilityFormData.description || undefined
            });
            toast({ title: 'Success', description: 'Utility updated successfully' });
            setIsEditUtilityDialogOpen(false);
            setSelectedUtility(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update utility', variant: 'destructive' });
        }
    };

    const handleDeleteUtility = async (id: string) => {
        if (!confirm('Are you sure you want to delete this utility?')) return;
        try {
            await deleteUtility(id);
            toast({ title: 'Success', description: 'Utility deleted successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete utility', variant: 'destructive' });
        }
    };

    const openEditUtilityDialog = (utility: Utility) => {
        setSelectedUtility(utility);
        setUtilityFormData({
            itemName: utility.itemName,
            price: utility.price.toString(),
            date: utility.date.includes('T') ? ((d) => (isValid(d) ? format(d, 'yyyy-MM-dd') : 'N/A'))(parseISO(utility.date)) : utility.date,
            description: utility.description || ''
        });
        setIsEditUtilityDialogOpen(true);
    };

    // Supplier handlers
    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHostel?.id) {
            toast({ title: 'Error', description: 'Please create and select a hostel first.', variant: 'destructive' });
            return;
        }
        try {
            const supplierData: any = {
                hostelId: selectedHostel.id,
                name: supplierFormData.name,
                supplies: supplierFormData.supplies,
                amount: parseFloat(supplierFormData.amount),
                phone: supplierFormData.phone || undefined,
                supplyType: supplierFormData.supplyType,
                month: selectedMonth
            };

            if (supplierFormData.supplyType === 'per_unit') {
                supplierData.perUnitPrice = parseFloat(supplierFormData.perUnitPrice);
                supplierData.currentMonthUnits = parseInt(supplierFormData.currentMonthUnits) || 0;
                supplierData.totalAmount = parseFloat(supplierFormData.perUnitPrice) * parseInt(supplierFormData.currentMonthUnits);
            }

            await addSupplier(supplierData);
            toast({ title: 'Success', description: 'Supplier added successfully' });
            setIsAddSupplierDialogOpen(false);
            setSupplierFormData({ name: '', supplies: '', amount: '', phone: '', supplyType: 'fixed', perUnitPrice: '', currentMonthUnits: '0' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add supplier', variant: 'destructive' });
        }
    };

    const handleUpdateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;
        try {
            const supplierData: any = {
                name: supplierFormData.name,
                supplies: supplierFormData.supplies,
                amount: parseFloat(supplierFormData.amount),
                phone: supplierFormData.phone || undefined,
                supplyType: supplierFormData.supplyType,
                month: selectedMonth
            };

            if (supplierFormData.supplyType === 'per_unit') {
                supplierData.perUnitPrice = parseFloat(supplierFormData.perUnitPrice);
                supplierData.currentMonthUnits = parseInt(supplierFormData.currentMonthUnits) || 0;
                supplierData.totalAmount = parseFloat(supplierFormData.perUnitPrice) * parseInt(supplierFormData.currentMonthUnits);
            }

            await updateSupplier(selectedSupplier.id, supplierData);
            toast({ title: 'Success', description: 'Supplier updated successfully' });
            setIsEditSupplierDialogOpen(false);
            setSelectedSupplier(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update supplier', variant: 'destructive' });
        }
    };

    const handleDeleteSupplier = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await deleteSupplier(id);
            toast({ title: 'Success', description: 'Supplier deleted successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete supplier', variant: 'destructive' });
        }
    };

    const openEditSupplierDialog = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setSupplierFormData({
            name: supplier.name,
            supplies: supplier.supplies,
            amount: supplier.amount.toString(),
            phone: supplier.phone || '',
            supplyType: supplier.supplyType || 'fixed',
            perUnitPrice: supplier.perUnitPrice?.toString() || '',
            currentMonthUnits: supplier.currentMonthUnits?.toString() || '0'
        });
        setIsEditSupplierDialogOpen(true);
    };

    // Staff salary handlers
    const handlePaySalary = async (staffId: string, staffMember: any) => {
        if (!confirm(`Pay salary to ${staffMember.name}?`)) return;
        try {
            await payStaffSalary({
                staffId: staffId,
                amount: staffMember.monthlySalary,
                month: selectedMonth,
                status: 'paid',
                paidDate: new Date().toISOString()
            });
            toast({ title: 'Success', description: 'Salary paid successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to pay salary', variant: 'destructive' });
        }
    };

    const handleUnpaySalary = async (staffId: string, staffMember: any) => {
        if (!confirm(`Mark salary for ${staffMember.name} as pending (unpaid)?`)) return;
        try {
            await payStaffSalary({
                staffId: staffId,
                amount: staffMember.monthlySalary,
                month: selectedMonth,
                status: 'pending',
                paidDate: undefined
            });
            toast({ title: 'Success', description: 'Salary status updated to pending' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update salary status', variant: 'destructive' });
        }
    };

    const filteredStaff = allStaff.filter(member =>
        member.hostelId === selectedHostel?.id &&
        (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (member.role || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredUtilities = utilities.filter(u => {
        if (!selectedHostel || u.hostelId !== selectedHostel.id) return false;
        const monthStart = startOfMonth(new Date(selectedMonth));
        const monthEnd = endOfMonth(new Date(selectedMonth));
        const utilityDate = parseISO(u.date);
        return isWithinInterval(utilityDate, { start: monthStart, end: monthEnd });
    });

    const filteredSuppliers = suppliers.filter(s => s.hostelId === selectedHostel?.id);

    const totalMonthlySalaries = filteredStaff.reduce((sum, member) => sum + member.monthlySalary, 0);

    return (
        <MainLayout>
            <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
                {/* Header - Desktop */}
                <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-10 hidden md:block">
                    <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Staff & Logistics
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Manage personnel, utilities, and suppliers</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-gray-700">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-sm font-medium text-white"
                                />
                            </div>

                            {hostels.length > 0 && (
                                <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-gray-700">
                                    <Building2 className="w-4 h-4 text-blue-400" />
                                    <select
                                        value={selectedHostel?.id}
                                        onChange={(e) => setSelectedHostel(hostels.find(h => h.id === e.target.value) || null)}
                                        className="bg-transparent border-none focus:outline-none text-sm font-medium pr-1"
                                    >
                                        {hostels.map(h => (
                                            <option key={h.id} value={h.id} className="bg-[#0f1f3a]">{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MobileNav />
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Staff & Ops</h1>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-0.5">{selectedHostel?.name}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-[#1a2332] px-2 py-1 rounded-lg border border-gray-700 flex items-center">
                                <input
                                    type="month"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-[10px] font-bold text-white w-24"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                            <Card className="bg-gradient-to-br from-blue-900/40 to-[#0f1f3a] border-gray-700/50 shadow-xl overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:scale-110 transition-transform">
                                    <UserCog className="w-10 md:w-16 h-10 md:h-16 text-blue-400" />
                                </div>
                                <CardContent className="p-4 md:p-6 relative z-10">
                                    <p className="text-blue-300/80 text-[10px] md:text-sm font-medium uppercase tracking-wider">Total Staff</p>
                                    <div className="flex items-end gap-2 mt-1 md:mt-2">
                                        <p className="text-2xl md:text-4xl font-bold">{filteredStaff.length}</p>
                                        <span className="text-blue-400 text-[10px] md:text-sm mb-1 font-medium hidden sm:inline">Members</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-900/40 to-[#0f1f3a] border-gray-700/50 shadow-xl overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:scale-110 transition-transform">
                                    <IndianRupee className="w-10 md:w-16 h-10 md:h-16 text-purple-400" />
                                </div>
                                <CardContent className="p-4 md:p-6 relative z-10">
                                    <p className="text-purple-300/80 text-[10px] md:text-sm font-medium uppercase tracking-wider">Payroll</p>
                                    <div className="flex items-end gap-2 mt-1 md:mt-2">
                                        <p className="text-2xl md:text-4xl font-bold text-purple-400">₹{totalMonthlySalaries.toLocaleString()}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-900/40 to-[#0f1f3a] border-gray-700/50 shadow-xl overflow-hidden group col-span-2 md:col-span-1">
                                <div className="absolute top-0 right-0 p-2 md:p-3 opacity-10 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-10 md:w-16 h-10 md:h-16 text-green-400" />
                                </div>
                                <CardContent className="p-4 md:p-6 relative z-10">
                                    <p className="text-green-300/80 text-[10px] md:text-sm font-medium uppercase tracking-wider">Active Hostel</p>
                                    <div className="flex items-end gap-2 mt-1 md:mt-2">
                                        <p className="text-lg md:text-xl font-bold truncate max-w-[150px] md:max-w-[200px]">{selectedHostel?.name || '---'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tabs for different operational categories */}
                        <Tabs defaultValue="staff" className="space-y-6">
                            <TabsList className="bg-[#0f1f3a] border border-gray-700/50 p-1 flex w-full md:w-fit gap-1 overflow-x-auto">
                                <TabsTrigger value="staff" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                                    <Users className="w-4 h-4" /> <span className="text-xs md:text-sm">Staff</span>
                                </TabsTrigger>
                                <TabsTrigger value="utilities" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                                    <Lightbulb className="w-4 h-4" /> <span className="text-xs md:text-sm">Utilities</span>
                                </TabsTrigger>
                                <TabsTrigger value="suppliers" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                                    <Truck className="w-4 h-4" /> <span className="text-xs md:text-sm">Suppliers</span>
                                </TabsTrigger>
                                <TabsTrigger value="salaries" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                                    <Wallet className="w-4 h-4" /> <span className="text-xs md:text-sm">Salaries</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Staff Tab */}
                            <TabsContent value="staff" className="m-0 space-y-6">
                                <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                    <CardHeader className="border-b border-gray-700/50 p-4 md:p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg md:text-xl font-bold">Staff Directory</CardTitle>
                                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white h-9 whitespace-nowrap"
                                                        onClick={resetForm}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        <span className="hidden sm:inline">Add Staff Member</span>
                                                        <span className="sm:hidden text-xs">Add Staff</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl bg-[#0f1f3a] border-gray-700 text-white">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-bold">Add New Staff Member</DialogTitle>
                                                    </DialogHeader>
                                                    <form onSubmit={handleAddStaff} className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-300">Name *</Label>
                                                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-300">Phone *</Label>
                                                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-300">Role</Label>
                                                                <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g., Cook, Cleaner" className="bg-[#1a2332] border-gray-600" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-gray-300">Monthly Salary *</Label>
                                                                <Input type="number" value={formData.monthlySalary || ''} onChange={(e) => setFormData({ ...formData, monthlySalary: parseInt(e.target.value) || 0 })} required className="bg-[#1a2332] border-gray-600" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end gap-2 pt-4">
                                                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-gray-600">Cancel</Button>
                                                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Add Staff</Button>
                                                        </div>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <div className="relative w-full">
                                            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <Input
                                                placeholder="Search by name or role..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 bg-[#1a2332] border-gray-700 h-10 text-sm rounded-full w-full"
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {/* Mobile Card View */}
                                        <div className="md:hidden divide-y divide-gray-700/50">
                                            {filteredStaff.length === 0 ? (
                                                <div className="py-20 text-center text-gray-500 px-4">No staff members found matching "{searchTerm}"</div>
                                            ) : (
                                                filteredStaff.map((member) => (
                                                    <div key={member.id} className="p-4 space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-bold text-white text-lg">{member.name}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 border border-blue-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                        {member.role || 'Staff'}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 font-medium">Joined {((d) => (isValid(d) ? format(d, 'MMM yyyy') : 'N/A'))(parseISO(member.joinDate))}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)} className="h-9 w-9 p-0 text-gray-400 hover:text-white bg-gray-800/30"><Edit className="w-4 h-4" /></Button>
                                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStaff(member.id)} className="h-9 w-9 p-0 text-gray-400 hover:text-red-400 bg-gray-800/30"><Trash2 className="w-4 h-4" /></Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between items-end">
                                                            <div className="text-left">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Monthly Salary</p>
                                                                <p className="text-xl font-bold text-blue-400 mt-1">₹{member.monthlySalary.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto text-white">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-gray-700 hover:bg-transparent">
                                                        <TableHead className="text-gray-400 font-medium pl-6">Name</TableHead>
                                                        <TableHead className="text-gray-400 font-medium">Role</TableHead>
                                                        <TableHead className="text-gray-400 font-medium text-right">Join Date</TableHead>
                                                        <TableHead className="text-gray-400 font-medium text-right">Salary</TableHead>
                                                        <TableHead className="text-gray-400 font-medium text-right pr-6">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredStaff.length === 0 ? (
                                                        <TableRow className="border-gray-700">
                                                            <TableCell colSpan={5} className="text-center py-20 text-gray-500 px-6">No staff members found.</TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        filteredStaff.map((member) => (
                                                            <TableRow key={member.id} className="border-gray-700 hover:bg-gray-800/30 group px-6">
                                                                <TableCell className="font-medium text-white pl-6">{member.name}</TableCell>
                                                                <TableCell>
                                                                    <span className="px-2.5 py-1 bg-blue-900/50 text-blue-300 border border-blue-800 rounded-full text-xs font-semibold">
                                                                        {member.role || 'Staff'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right text-gray-400 text-sm whitespace-nowrap">{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                                                                <TableCell className="text-right font-bold text-blue-400">₹{member.monthlySalary.toLocaleString()}</TableCell>
                                                                <TableCell className="text-right pr-6">
                                                                    <div className="flex justify-end gap-1">
                                                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(member)} className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"><Edit className="w-4 h-4" /></Button>
                                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteStaff(member.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"><Trash2 className="w-4 h-4" /></Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Utilities Tab */}
                            <TabsContent value="utilities" className="m-0 space-y-6">
                                <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                    <CardHeader className="border-b border-gray-700/50 p-4 md:p-6 flex flex-row items-center justify-between py-4 px-4 md:px-6">
                                        <CardTitle className="text-lg md:text-xl font-bold">Monthly Utilities</CardTitle>
                                        <Dialog open={isAddUtilityDialogOpen} onOpenChange={setIsAddUtilityDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-orange-600 hover:bg-orange-700 text-white h-9 whitespace-nowrap">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    <span className="hidden sm:inline">Add Utility Entry</span>
                                                    <span className="sm:hidden text-xs">Add Entry</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl bg-[#0f1f3a] border-gray-700 text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold">Add New Utility Entry</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleAddUtility} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-300">Item/Service *</Label>
                                                            <Input value={utilityFormData.itemName} onChange={(e) => setUtilityFormData({ ...utilityFormData, itemName: e.target.value })} required placeholder="e.g., Electricity, Water" className="bg-[#1a2332] border-gray-600" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-300">Price (₹) *</Label>
                                                            <Input type="number" value={utilityFormData.price} onChange={(e) => setUtilityFormData({ ...utilityFormData, price: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-300">Date *</Label>
                                                            <Input type="date" value={utilityFormData.date} onChange={(e) => setUtilityFormData({ ...utilityFormData, date: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-300">Notes</Label>
                                                            <Textarea value={utilityFormData.description} onChange={(e) => setUtilityFormData({ ...utilityFormData, description: e.target.value })} className="bg-[#1a2332] border-gray-600 h-10" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-4">
                                                        <Button type="button" variant="outline" onClick={() => setIsAddUtilityDialogOpen(false)} className="border-gray-600">Cancel</Button>
                                                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Add Entry</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent">
                                                    <TableHead className="text-gray-400 font-medium">Date</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Item</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Price</TableHead>
                                                    <TableHead className="text-gray-400 font-medium text-right pr-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUtilities.length === 0 ? (
                                                    <TableRow className="border-gray-700">
                                                        <TableCell colSpan={4} className="text-center py-20 text-gray-500">No utility entries for this month.</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredUtilities.map((utility) => (
                                                        <TableRow key={utility.id} className="border-gray-700 hover:bg-gray-800/30 group">
                                                            <TableCell className="text-sm text-gray-400">{((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(utility.date))}</TableCell>
                                                            <TableCell className="font-medium text-white">{utility.itemName}</TableCell>
                                                            <TableCell className="font-bold text-orange-400">₹{utility.price.toLocaleString()}</TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <Button variant="ghost" size="sm" onClick={() => openEditUtilityDialog(utility)} className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"><Edit className="w-4 h-4" /></Button>
                                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUtility(utility.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"><Trash2 className="w-4 h-4" /></Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Suppliers Tab */}
                            <TabsContent value="suppliers" className="m-0 space-y-6">
                                <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                    <CardHeader className="border-b border-gray-700/50 p-4 md:p-6 flex flex-row items-center justify-between py-4 px-4 md:px-6">
                                        <CardTitle className="text-lg md:text-xl font-bold">Hostel Suppliers</CardTitle>
                                        <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-purple-600 hover:bg-purple-700 text-white h-9 whitespace-nowrap">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    <span className="hidden sm:inline">Add Supplier Record</span>
                                                    <span className="sm:hidden text-xs">Add Supplier</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl bg-[#0f1f3a] border-gray-700 text-white">
                                                <DialogHeader>
                                                    <DialogTitle className="text-2xl font-bold">Add New Supplier</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleAddSupplier} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-300">Supplier Name *</Label>
                                                            <Input value={supplierFormData.name} onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })} required placeholder="e.g., Shankar Anna" className="bg-[#1a2332] border-gray-600" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-gray-300">Supplies *</Label>
                                                            <Input value={supplierFormData.supplies} onChange={(e) => setSupplierFormData({ ...supplierFormData, supplies: e.target.value })} required placeholder="e.g., Water Cans" className="bg-[#1a2332] border-gray-600" />
                                                        </div>
                                                        <div className="space-y-2 col-span-2">
                                                            <Label className="text-gray-300">Supply Type *</Label>
                                                            <select
                                                                value={supplierFormData.supplyType}
                                                                onChange={(e) => setSupplierFormData({ ...supplierFormData, supplyType: e.target.value as 'fixed' | 'per_unit' })}
                                                                className="w-full bg-[#1a2332] border border-gray-600 text-white rounded-md px-3 py-2"
                                                            >
                                                                <option value="fixed">Fixed Monthly Amount</option>
                                                                <option value="per_unit">Per Unit (e.g., Water Cans)</option>
                                                            </select>
                                                        </div>
                                                        {supplierFormData.supplyType === 'fixed' ? (
                                                            <div className="space-y-2 col-span-2">
                                                                <Label className="text-gray-300">Monthly Amount (₹) *</Label>
                                                                <Input type="number" value={supplierFormData.amount} onChange={(e) => setSupplierFormData({ ...supplierFormData, amount: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-300">Price Per Unit (₹) *</Label>
                                                                    <Input type="number" value={supplierFormData.perUnitPrice} onChange={(e) => setSupplierFormData({ ...supplierFormData, perUnitPrice: e.target.value })} required placeholder="e.g., 15" className="bg-[#1a2332] border-gray-600" />
                                                                    <p className="text-xs text-gray-500">Price per can/unit</p>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-gray-300">Current Month Units</Label>
                                                                    <Input type="number" value={supplierFormData.currentMonthUnits} onChange={(e) => setSupplierFormData({ ...supplierFormData, currentMonthUnits: e.target.value, amount: (parseFloat(supplierFormData.perUnitPrice) * parseInt(e.target.value) || 0).toString() })} placeholder="0" className="bg-[#1a2332] border-gray-600" />
                                                                    <p className="text-xs text-gray-500">Number of cans this month</p>
                                                                </div>
                                                                <div className="space-y-2 col-span-2">
                                                                    <Label className="text-gray-300">Total Amount (₹)</Label>
                                                                    <Input type="number" value={supplierFormData.amount} readOnly className="bg-[#1a2332] border-gray-600 opacity-70" />
                                                                    <p className="text-xs text-gray-500">Auto-calculated: {supplierFormData.currentMonthUnits} × ₹{supplierFormData.perUnitPrice}</p>
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="space-y-2 col-span-2">
                                                            <Label className="text-gray-300">Phone</Label>
                                                            <Input value={supplierFormData.phone} onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })} className="bg-[#1a2332] border-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 pt-4">
                                                        <Button type="button" variant="outline" onClick={() => setIsAddSupplierDialogOpen(false)} className="border-gray-600">Cancel</Button>
                                                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Add Supplier</Button>
                                                    </div>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent">
                                                    <TableHead className="text-gray-400 font-medium">Supplier</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Supplies</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Units/Amount</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Total Cost</TableHead>
                                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredSuppliers.length === 0 ? (
                                                    <TableRow className="border-gray-700">
                                                        <TableCell colSpan={5} className="text-center py-20 text-gray-500">No suppliers listed.</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredSuppliers.map((supplier) => (
                                                        <TableRow key={supplier.id} className="border-gray-700 hover:bg-gray-800/30 group">
                                                            <TableCell className="font-medium text-white">{supplier.name}</TableCell>
                                                            <TableCell className="text-gray-400">{supplier.supplies}</TableCell>
                                                            <TableCell className="text-gray-400">
                                                                {supplier.supplyType === 'per_unit' ? (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-blue-400">{supplier.currentMonthUnits || 0} units</span>
                                                                        <span className="text-xs text-gray-500">@₹{supplier.perUnitPrice}/unit</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-gray-500">Fixed</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-bold text-purple-400">
                                                                ₹{(supplier.supplyType === 'per_unit' ? (supplier.totalAmount || 0) : supplier.amount).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <Button variant="ghost" size="sm" onClick={() => openEditSupplierDialog(supplier)} className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"><Edit className="w-4 h-4" /></Button>
                                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"><Trash2 className="w-4 h-4" /></Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Salaries Tab */}
                            <TabsContent value="salaries" className="m-0 space-y-6">
                                <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                    <CardHeader className="border-b border-gray-700/50 p-4 md:p-6">
                                        <CardTitle className="text-lg md:text-xl font-bold">
                                            <span className="hidden sm:inline">Staff Salary Payments - </span>
                                            <span className="sm:hidden font-bold">Salaries: </span>
                                            {format(new Date(selectedMonth), 'MMM yyyy')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent">
                                                    <TableHead className="text-gray-400 font-medium">Staff Name</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Monthly Salary</TableHead>
                                                    <TableHead className="text-gray-400 font-medium">Status</TableHead>
                                                    <TableHead className="text-right pr-6">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredStaff.map((member) => {
                                                    const salaryRecord = staffSalaries.find(s => s.staffId === member.id && s.month === selectedMonth);
                                                    const isPaid = salaryRecord?.status === 'paid';
                                                    return (
                                                        <TableRow key={member.id} className="border-gray-700 hover:bg-gray-800/30">
                                                            <TableCell className="font-medium text-white">{member.name}</TableCell>
                                                            <TableCell className="font-bold text-green-400">₹{member.monthlySalary.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                {isPaid ? (
                                                                    <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">
                                                                        <CheckCircle className="w-3.5 h-3.5" /> PAID
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1.5 text-orange-400 text-sm font-bold bg-orange-400/10 px-2 py-1 rounded border border-orange-400/20">
                                                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" /> PENDING
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right pr-6">
                                                                <div className="flex flex-col items-end gap-1">
                                                                    {!isPaid ? (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handlePaySalary(member.id, member)}
                                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-4 font-bold text-xs"
                                                                        >
                                                                            MARK AS PAID
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleUnpaySalary(member.id, member)}
                                                                            className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 h-8 px-4 font-bold text-[10px] uppercase border border-gray-700/50"
                                                                        >
                                                                            Mark Unpaid
                                                                        </Button>
                                                                    )}
                                                                    {isPaid && salaryRecord?.paidDate && (
                                                                        <span className="text-[9px] text-gray-500 font-medium tracking-tight">
                                                                            Processed on {((d) => (isValid(d) ? format(d, 'MMM dd') : 'N/A'))(parseISO(salaryRecord.paidDate))}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Edit Utility Dialog */}
                <Dialog open={isEditUtilityDialogOpen} onOpenChange={setIsEditUtilityDialogOpen}>
                    <DialogContent className="max-w-md bg-[#0f1f3a] border-gray-700 text-white">
                        <DialogHeader><DialogTitle>Edit Utility Entry</DialogTitle></DialogHeader>
                        <form onSubmit={handleUpdateUtility} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Item/Service</Label>
                                <Input value={utilityFormData.itemName} onChange={(e) => setUtilityFormData({ ...utilityFormData, itemName: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input type="number" value={utilityFormData.price} onChange={(e) => setUtilityFormData({ ...utilityFormData, price: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={utilityFormData.date} onChange={(e) => setUtilityFormData({ ...utilityFormData, date: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditUtilityDialogOpen(false)} className="border-gray-600">Cancel</Button>
                                <Button type="submit" className="bg-orange-600">Update</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Staff Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl bg-[#0f1f3a] border-gray-700 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Edit Staff Member</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditStaff} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Name *</Label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Phone *</Label>
                                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Role</Label>
                                    <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g., Cook, Cleaner" className="bg-[#1a2332] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Monthly Salary *</Label>
                                    <Input type="number" value={formData.monthlySalary || ''} onChange={(e) => setFormData({ ...formData, monthlySalary: parseInt(e.target.value) || 0 })} required className="bg-[#1a2332] border-gray-600" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-600">Cancel</Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Update Staff</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Supplier Dialog */}
                <Dialog open={isEditSupplierDialogOpen} onOpenChange={setIsEditSupplierDialogOpen}>
                    <DialogContent className="max-w-2xl bg-[#0f1f3a] border-gray-700 text-white">
                        <DialogHeader><DialogTitle className="text-2xl font-bold">Edit Supplier</DialogTitle></DialogHeader>
                        <form onSubmit={handleUpdateSupplier} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Supplier Name</Label>
                                    <Input value={supplierFormData.name} onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Supplies</Label>
                                    <Input value={supplierFormData.supplies} onChange={(e) => setSupplierFormData({ ...supplierFormData, supplies: e.target.value })} required className="bg-[#1a2332] border-gray-700" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-gray-300">Supply Type *</Label>
                                    <select
                                        value={supplierFormData.supplyType}
                                        onChange={(e) => setSupplierFormData({ ...supplierFormData, supplyType: e.target.value as 'fixed' | 'per_unit' })}
                                        className="w-full bg-[#1a2332] border border-gray-600 text-white rounded-md px-3 py-2"
                                    >
                                        <option value="fixed">Fixed Monthly Amount</option>
                                        <option value="per_unit">Per Unit (e.g., Water Cans)</option>
                                    </select>
                                </div>
                                {supplierFormData.supplyType === 'fixed' ? (
                                    <div className="space-y-2 col-span-2">
                                        <Label>Monthly Amount (₹)</Label>
                                        <Input type="number" value={supplierFormData.amount} onChange={(e) => setSupplierFormData({ ...supplierFormData, amount: e.target.value })} required className="bg-[#1a2332] border-gray-600" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Price Per Unit (₹) *</Label>
                                            <Input type="number" value={supplierFormData.perUnitPrice} onChange={(e) => setSupplierFormData({ ...supplierFormData, perUnitPrice: e.target.value })} required placeholder="e.g., 15" className="bg-[#1a2332] border-gray-600" />
                                            <p className="text-xs text-gray-500">Price per can/unit</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Current Month Units</Label>
                                            <Input type="number" value={supplierFormData.currentMonthUnits} onChange={(e) => setSupplierFormData({ ...supplierFormData, currentMonthUnits: e.target.value, amount: (parseFloat(supplierFormData.perUnitPrice) * parseInt(e.target.value) || 0).toString() })} placeholder="0" className="bg-[#1a2332] border-gray-600" />
                                            <p className="text-xs text-gray-500">Add new cans taken today</p>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label className="text-gray-300">Total Amount (₹)</Label>
                                            <Input type="number" value={supplierFormData.amount} readOnly className="bg-[#1a2332] border-gray-600 opacity-70" />
                                            <p className="text-xs text-gray-500">Auto-calculated: {supplierFormData.currentMonthUnits} × ₹{supplierFormData.perUnitPrice}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditSupplierDialogOpen(false)} className="border-gray-600">Cancel</Button>
                                <Button type="submit" className="bg-purple-600">Update</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default StaffOverview;
