import { useState, useMemo } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Home,
    UserCheck,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid } from 'date-fns';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

export default function Expenses() {
    const {
        hostels,
        payments,
        staff,
        staffSalaries,
        utilities,
        suppliers,
        isLoading
    } = useHostel();

    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [searchTerm, setSearchTerm] = useState('');

    // Load utility bills from localStorage
    const electricityPayments = useMemo(() => {
        try {
            const saved = localStorage.getItem('electricityPayments');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }, [selectedMonth]);

    const gasPayments = useMemo(() => {
        try {
            const saved = localStorage.getItem('gasPayments');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    }, [selectedMonth]);

    const selectedHostel = hostels[0];

    // Recursive function to get all students with their room context
    const allStudentsWithContext = useMemo(() => {
        if (!selectedHostel) return [];

        const students: any[] = [];
        selectedHostel.floors.forEach(floor => {
            floor.rooms.forEach(room => {
                const processRoom = (r: any) => {
                    r.students.forEach((s: any) => {
                        students.push({
                            ...s,
                            hostelId: selectedHostel.id,
                            floorNumber: floor.floorNumber,
                            roomNumber: r.roomNumber,
                            occupancyType: r.occupancyType,
                            roomType: r.roomType
                        });
                    });
                    if (r.subRooms) {
                        r.subRooms.forEach(processRoom);
                    }
                };
                processRoom(room);
            });
        });
        return students;
    }, [selectedHostel]);

    const monthlyMetrics = useMemo(() => {
        if (!selectedHostel) return {
            studentRevenue: 0,
            familyRevenue: 0,
            totalRevenue: 0,
            utilityExpenses: 0,
            staffExpenses: 0,
            supplierExpenses: 0,
            totalExpenses: 0,
            profit: 0
        };

        const monthStart = startOfMonth(new Date(selectedMonth));
        const monthEnd = endOfMonth(new Date(selectedMonth));

        // Filter payments for this month
        const monthlyPayments = payments.filter(p => p.status === 'paid' && p.month === selectedMonth);

        let studentRevenue = 0;
        let familyRevenue = 0;

        monthlyPayments.forEach(p => {
            const student = allStudentsWithContext.find(s => s.id === p.studentId);
            if (student) {
                if (student.occupancyType === 'family') {
                    familyRevenue += p.amount;
                } else {
                    studentRevenue += p.amount;
                }
            }
        });

        const totalRevenue = studentRevenue + familyRevenue;

        const utilityExpenses = utilities
            .filter(u => {
                if (u.hostelId !== selectedHostel.id) return false;
                if (!u.date) return false;
                const utilityDate = parseISO(u.date);
                return isValid(utilityDate) && isWithinInterval(utilityDate, { start: monthStart, end: monthEnd });
            })
            .reduce((sum, u) => sum + u.price, 0);

        const staffExpenses = staffSalaries
            .filter(s => s.month === selectedMonth && s.status === 'paid')
            .reduce((sum, s) => sum + s.amount, 0);

        const supplierExpenses = suppliers
            .filter(s => s.hostelId === selectedHostel.id)
            .reduce((sum, s) => {
                // For per_unit suppliers, use totalAmount, otherwise use amount
                const cost = s.supplyType === 'per_unit' ? (s.totalAmount || 0) : s.amount;
                return sum + cost;
            }, 0);

        // Calculate electricity and gas expenses for the month
        const electricityExpenses = electricityPayments
            .filter((p: any) => p.month === selectedMonth)
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        const gasExpenses = gasPayments
            .filter((p: any) => p.month === selectedMonth)
            .reduce((sum: number, p: any) => sum + p.amount, 0);

        const hostelRent = selectedHostel?.propertyType === 'rented' ? (selectedHostel?.rentAmount || 0) : 0;
        const totalExpenses = utilityExpenses + staffExpenses + supplierExpenses + hostelRent + electricityExpenses + gasExpenses;
        const profit = totalRevenue - totalExpenses;

        return {
            studentRevenue,
            familyRevenue,
            totalRevenue,
            utilityExpenses,
            staffExpenses,
            supplierExpenses,
            hostelRent,
            electricityExpenses,
            gasExpenses,
            totalExpenses,
            profit
        };
    }, [selectedHostel, selectedMonth, payments, utilities, staffSalaries, suppliers, allStudentsWithContext]);

    const studentPayments = useMemo(() => {
        return payments
            .filter(p => p.month === selectedMonth && p.status === 'paid')
            .map(p => {
                const student = allStudentsWithContext.find(s => s.id === p.studentId);
                return { ...p, student };
            })
            .filter(item => item.student && item.student.occupancyType !== 'family');
    }, [payments, selectedMonth, allStudentsWithContext]);

    const familyPayments = useMemo(() => {
        return payments
            .filter(p => p.month === selectedMonth && p.status === 'paid')
            .map(p => {
                const student = allStudentsWithContext.find(s => s.id === p.studentId);
                return { ...p, student };
            })
            .filter(item => item.student && item.student.occupancyType === 'family');
    }, [payments, selectedMonth, allStudentsWithContext]);

    const supplierPaymentHistory = useMemo(() => {
        const monthStart = startOfMonth(new Date(selectedMonth));
        const monthEnd = endOfMonth(new Date(selectedMonth));

        const historicalUtilities = utilities.filter(u => {
            if (u.hostelId !== selectedHostel?.id) return false;
            if (!u.date) return false;
            const d = parseISO(u.date);
            return isValid(d) && isWithinInterval(d, { start: monthStart, end: monthEnd });
        }).map(u => ({ ...u, type: 'Utility' }));

        const activeSuppliers = suppliers.filter(s => s.hostelId === selectedHostel?.id)
            .map(s => ({ ...s, itemName: s.name, price: s.amount, date: selectedMonth + '-01', type: 'Supplier' }));

        return [...historicalUtilities, ...activeSuppliers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedHostel, selectedMonth, utilities, suppliers]);

    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-white bg-[#0a0f1a]">Loading...</div>;

    return (
        <MainLayout>
            <div className="flex-1">
                {/* Header - Desktop */}
                <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
                    <div className="flex justify-between items-center max-w-7xl mx-auto w-full gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                                Financial Dashboard
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Hostel Income & Expenditure Reports</p>
                        </div>

                        <div className="flex items-center gap-4 bg-[#1a2332] p-2 rounded-xl border border-gray-700">
                            <span className="text-sm font-medium text-blue-400 px-2 uppercase tracking-wider font-bold">Month:</span>
                            <Input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-[#0a0f1a] border-gray-700 h-9 text-sm w-40 font-bold"
                            />
                        </div>
                    </div>
                </header>

                {/* Mobile Header Info */}
                <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MobileNav />
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Financials</h2>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Real-time Tracking</p>
                            </div>
                        </div>
                        <div className="bg-[#1a2332] p-1.5 rounded-lg border border-gray-700 flex items-center gap-2">
                            <Input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-transparent border-none h-6 text-[10px] w-28 font-bold p-0 focus-visible:ring-0"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-4 md:px-8 py-4 md:py-8 max-w-7xl mx-auto w-full space-y-6 md:space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <Card className="bg-gradient-to-br from-blue-600/20 to-[#0f1f3a] border-blue-500/20 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-10 md:w-16 h-10 md:h-16 text-blue-400" />
                            </div>
                            <CardHeader className="p-3 md:pb-2">
                                <CardTitle className="text-[10px] md:text-sm font-bold text-blue-300 uppercase tracking-wider">Total Revenue</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                                <div className="text-xl md:text-3xl font-bold text-white leading-none">₹{monthlyMetrics.totalRevenue.toLocaleString()}</div>
                                <div className="flex items-center mt-1.5 md:mt-2 text-[10px] text-blue-400 font-bold uppercase tracking-tighter">
                                    <ArrowUpRight className="w-3 h-3 mr-1" /> Gross Income
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-600/20 to-[#0f1f3a] border-red-500/20 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <TrendingDown className="w-16 h-16 text-red-400" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-red-300">Total Expenses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">₹{monthlyMetrics.totalExpenses.toLocaleString()}</div>
                                <div className="flex items-center mt-2 text-xs text-red-400 font-medium">
                                    <ArrowDownRight className="w-3 h-3 mr-1" /> Operations
                                </div>
                            </CardContent>
                        </Card>

                        <Card className={`bg-gradient-to-br ${monthlyMetrics.profit >= 0 ? 'from-emerald-600/20 to-[#0f1f3a] border-emerald-500/20' : 'from-orange-600/20 to-[#0f1f3a] border-orange-500/20'} shadow-xl relative overflow-hidden group col-span-1 sm:col-span-2`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-16 h-16 text-emerald-400" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-300">Net Profit / Loss</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-between items-end">
                                <div>
                                    <div className={`text-3xl font-bold ${monthlyMetrics.profit >= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                                        ₹{monthlyMetrics.profit.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Efficiency: <span className="text-blue-400 font-bold">
                                            {monthlyMetrics.totalRevenue > 0
                                                ? ((monthlyMetrics.profit / monthlyMetrics.totalRevenue) * 100).toFixed(1)
                                                : 0}%
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Health Check</p>
                                    <p className={`text-sm font-bold ${monthlyMetrics.profit >= 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                        {monthlyMetrics.profit >= 0 ? 'STATUS: PROFITABLE' : 'STATUS: DEFICIT'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Tabs */}
                    <Tabs defaultValue="report" className="space-y-6">
                        <div className="relative group/tabs">
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0f1a] to-transparent z-40 pointer-events-none md:hidden opacity-0 group-hover/tabs:opacity-100 transition-opacity" />
                            <TabsList className="bg-[#0f1f3a]/80 backdrop-blur-md border border-gray-700/50 p-1.5 flex w-full md:w-fit gap-2 overflow-x-auto justify-start md:justify-center touch-pan-x">
                                <TabsTrigger value="report" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 gap-2 px-6 whitespace-nowrap transition-all duration-300 flex-shrink-0">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="hidden sm:inline">Financial Report</span>
                                    <span className="sm:hidden text-xs">Report</span>
                                </TabsTrigger>
                                <TabsTrigger value="students" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 gap-2 px-6 whitespace-nowrap transition-all duration-300 flex-shrink-0">
                                    <Users className="w-4 h-4" />
                                    <span className="hidden sm:inline">Students Income</span>
                                    <span className="sm:hidden text-xs">Students</span>
                                </TabsTrigger>
                                <TabsTrigger value="families" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 gap-2 px-6 whitespace-nowrap transition-all duration-300 flex-shrink-0">
                                    <Home className="w-4 h-4" />
                                    <span className="hidden sm:inline">Families Income</span>
                                    <span className="sm:hidden text-xs">Families</span>
                                </TabsTrigger>
                                <TabsTrigger value="staff" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-gray-400 gap-2 px-6 whitespace-nowrap transition-all duration-300 flex-shrink-0">
                                    <UserCheck className="w-4 h-4" />
                                    <span className="hidden sm:inline">Staff Payments</span>
                                    <span className="sm:hidden text-xs">Staff</span>
                                </TabsTrigger>
                                <TabsTrigger value="suppliers" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400 gap-2 px-6 whitespace-nowrap transition-all duration-300 flex-shrink-0">
                                    <Package className="w-4 h-4" />
                                    <span className="hidden sm:inline">Operations Cost</span>
                                    <span className="sm:hidden text-xs">Operations</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0f1a] to-transparent z-40 pointer-events-none md:hidden" />
                        </div>

                        {/* Financial Report Tab */}
                        <TabsContent value="report" className="m-0 focus-visible:ring-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-[#0f1f3a]/80 backdrop-blur-sm border-gray-700/50 shadow-2xl overflow-hidden group">
                                    <CardHeader className="bg-gradient-to-r from-blue-600/10 via-blue-600/5 to-transparent border-b border-gray-700/50 py-4 px-6 md:py-6">
                                        <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-3 text-blue-400">
                                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors"><TrendingUp className="w-5 h-5" /></div>
                                            Income Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-8 space-y-4 md:space-y-6">
                                        <div className="flex justify-between items-center p-4 bg-[#1a2332]/50 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2.5 md:p-3 bg-blue-500/10 rounded-xl border border-blue-500/10"><Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" /></div>
                                                <div>
                                                    <p className="text-sm md:text-base font-bold text-white leading-tight">Student Payments</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">{studentPayments.length} Active Accounts</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg md:text-2xl font-black text-white tracking-tight">₹{monthlyMetrics.studentRevenue.toLocaleString()}</p>
                                                <p className="text-[9px] md:text-[10px] text-blue-400 font-black uppercase tracking-widest mt-0.5">Primary Tier</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center p-4 bg-[#1a2332]/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2.5 md:p-3 bg-purple-500/10 rounded-xl border border-purple-500/10"><Home className="w-5 h-5 md:w-6 md:h-6 text-purple-400" /></div>
                                                <div>
                                                    <p className="text-sm md:text-base font-bold text-white leading-tight">Family Payments</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">{familyPayments.length} Active Accounts</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg md:text-2xl font-black text-white tracking-tight">₹{monthlyMetrics.familyRevenue.toLocaleString()}</p>
                                                <p className="text-[9px] md:text-[10px] text-purple-400 font-black uppercase tracking-widest mt-0.5">Hostel Tier</p>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-700/50 flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Gross Yield</p>
                                                <p className="text-2xl md:text-4xl font-black text-emerald-400 tracking-tighter">₹{monthlyMetrics.totalRevenue.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right pb-1">
                                                <p className="text-[10px] text-gray-500 font-bold mb-2">Market Target</p>
                                                <div className="w-28 md:w-40 h-2 bg-[#0a0f1a] rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[85%] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#0f1f3a]/80 backdrop-blur-sm border-gray-700/50 shadow-2xl overflow-hidden group">
                                    <CardHeader className="bg-gradient-to-r from-red-600/10 via-red-600/5 to-transparent border-b border-gray-700/50 py-4 px-6 md:py-6">
                                        <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-3 text-red-400">
                                            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors"><TrendingDown className="w-5 h-5" /></div>
                                            Expense Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-8 space-y-4 md:space-y-6">
                                        <div className="flex justify-between items-center p-4 bg-[#1a2332]/50 rounded-2xl border border-gray-700/50 hover:border-indigo-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2.5 md:p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/10"><UserCheck className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" /></div>
                                                <p className="text-sm md:text-base font-bold text-white leading-tight">Staff Salaries</p>
                                            </div>
                                            <p className="text-lg md:text-2xl font-black text-white tracking-tight">₹{monthlyMetrics.staffExpenses.toLocaleString()}</p>
                                        </div>

                                        <div className="flex justify-between items-center p-4 bg-[#1a2332]/50 rounded-2xl border border-gray-700/50 hover:border-orange-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2.5 md:p-3 bg-orange-500/10 rounded-xl border border-orange-500/10"><Package className="w-5 h-5 md:w-6 md:h-6 text-orange-400" /></div>
                                                <div>
                                                    <p className="text-sm md:text-base font-bold text-white leading-tight">Operational Costs</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">Utilities + Suppliers + Bills</p>
                                                </div>
                                            </div>
                                            <p className="text-lg md:text-2xl font-black text-white tracking-tight">₹{(monthlyMetrics.utilityExpenses + monthlyMetrics.supplierExpenses + monthlyMetrics.electricityExpenses + monthlyMetrics.gasExpenses).toLocaleString()}</p>
                                        </div>

                                        {/* Electricity Bill */}
                                        <div className="flex justify-between items-center p-3 md:p-4 bg-[#1a2332]/30 rounded-xl border border-blue-500/20 ml-4 md:ml-8">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded-lg"><DollarSign className="w-4 h-4 md:w-5 md:h-5 text-blue-400" /></div>
                                                <p className="text-xs md:text-sm font-semibold text-blue-300">Electricity Bill</p>
                                            </div>
                                            <p className="text-base md:text-lg font-bold text-blue-400">₹{monthlyMetrics.electricityExpenses.toLocaleString()}</p>
                                        </div>

                                        {/* Gas Bill */}
                                        <div className="flex justify-between items-center p-3 md:p-4 bg-[#1a2332]/30 rounded-xl border border-purple-500/20 ml-4 md:ml-8">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="p-2 bg-purple-500/10 rounded-lg"><DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-400" /></div>
                                                <p className="text-xs md:text-sm font-semibold text-purple-300">Gas Bill</p>
                                            </div>
                                            <p className="text-base md:text-lg font-bold text-purple-400">₹{monthlyMetrics.gasExpenses.toLocaleString()}</p>
                                        </div>

                                        <div className="flex justify-between items-center p-4 bg-[#1a2332]/50 rounded-2xl border border-gray-700/50 hover:border-red-500/30 transition-all hover:scale-[1.02]">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-2.5 md:p-3 bg-red-500/10 rounded-xl border border-red-500/10"><Home className="w-5 h-5 md:w-6 md:h-6 text-red-400" /></div>
                                                <div>
                                                    <p className="text-sm md:text-base font-bold text-white leading-tight">Hostel Rent</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 font-medium">Fixed Monthly</p>
                                                </div>
                                            </div>
                                            <p className="text-lg md:text-2xl font-black text-white tracking-tight">₹{monthlyMetrics.hostelRent.toLocaleString()}</p>
                                        </div>

                                        <div className="pt-6 border-t border-gray-700/50">
                                            <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Net Yield (After Ops)</p>
                                            <p className="text-2xl md:text-4xl font-black text-blue-400 tracking-tighter">₹{monthlyMetrics.profit.toLocaleString()}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Students Income Tab */}
                        <TabsContent value="students" className="m-0 focus-visible:ring-0 outline-none">
                            <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                <CardHeader className="border-b border-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6">
                                    <CardTitle className="text-lg font-bold">Student Payment Records</CardTitle>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <Input placeholder="Search students..." className="pl-10 h-10 bg-[#1a2332] border-gray-700 rounded-full w-full text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-gray-700/50">
                                        {studentPayments.length === 0 ? (
                                            <div className="py-20 text-center text-gray-500 px-4">No payments recorded for this month.</div>
                                        ) : (
                                            studentPayments.filter(p => !searchTerm || p.student.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => (
                                                <div key={p.id} className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-white text-base">{p.student.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                    Room {p.student.roomNumber}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Amount Paid</p>
                                                            <p className="text-lg font-bold text-emerald-400 leading-none mt-1">₹{p.amount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-1">
                                                        <span className="text-[10px] text-gray-500 font-medium">Transaction Date</span>
                                                        <span className="text-xs text-gray-300 font-medium">{p.paidDate ? ((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(p.paidDate)) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent px-6">
                                                    <TableHead className="text-gray-400 pl-6 text-xs uppercase font-bold tracking-widest">Student Name</TableHead>
                                                    <TableHead className="text-gray-400 text-xs uppercase font-bold tracking-widest">Room Allocation</TableHead>
                                                    <TableHead className="text-gray-400 text-xs uppercase font-bold tracking-widest">Payment Date</TableHead>
                                                    <TableHead className="text-right text-gray-400 pr-6 text-xs uppercase font-bold tracking-widest">Amount Disbursed</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {studentPayments.length === 0 ? (
                                                    <TableRow className="border-gray-700"><TableCell colSpan={4} className="text-center py-20 text-gray-500">No student payments recorded for this month.</TableCell></TableRow>
                                                ) : (
                                                    studentPayments.filter(p => !searchTerm || p.student.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p: any) => (
                                                        <TableRow key={p.id} className="border-gray-700 hover:bg-gray-800/20 group">
                                                            <TableCell className="font-bold text-white pl-6 py-4">{p.student.name}</TableCell>
                                                            <TableCell className="text-gray-300">
                                                                <span className="bg-[#1a3a5f] px-3 py-1 rounded-full text-xs border border-blue-500/20">
                                                                    Room {p.student.roomNumber}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-gray-400 text-sm">{p.paidDate ? ((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(p.paidDate)) : 'N/A'}</TableCell>
                                                            <TableCell className="text-right font-black text-emerald-400 pr-6 text-lg">₹{p.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Families Income Tab */}
                        <TabsContent value="families" className="m-0 focus-visible:ring-0 outline-none">
                            <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                <CardHeader className="border-b border-gray-700/50 p-4 md:p-6">
                                    <CardTitle className="text-lg font-bold">Family Payment Records</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-gray-700/50">
                                        {familyPayments.length === 0 ? (
                                            <div className="py-20 text-center text-gray-500 px-4">No family payments recorded for this month.</div>
                                        ) : (
                                            familyPayments.map((p: any) => (
                                                <div key={p.id} className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-white text-base">{p.student.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 border border-purple-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                    Family Room {p.student.roomNumber}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Amount Paid</p>
                                                            <p className="text-lg font-bold text-purple-400 leading-none mt-1">₹{p.amount.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-1">
                                                        <span className="text-[10px] text-gray-500 font-medium">Transaction Date</span>
                                                        <span className="text-xs text-gray-300 font-medium">{p.paidDate ? ((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(p.paidDate)) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent">
                                                    <TableHead className="text-gray-400 pl-6 px-4">Family Name</TableHead>
                                                    <TableHead className="text-gray-400 px-4">Room Allocation</TableHead>
                                                    <TableHead className="text-gray-400 px-4">Date Documented</TableHead>
                                                    <TableHead className="text-right text-gray-400 pr-6 px-4">Amount Collected</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {familyPayments.length === 0 ? (
                                                    <TableRow className="border-gray-700"><TableCell colSpan={4} className="text-center py-20 text-gray-500">No family payments recorded for this month.</TableCell></TableRow>
                                                ) : (
                                                    familyPayments.map((p: any) => (
                                                        <TableRow key={p.id} className="border-gray-700 hover:bg-gray-800/30">
                                                            <TableCell className="font-bold text-white pl-6 py-4 px-4">{p.student.name}</TableCell>
                                                            <TableCell className="text-gray-400 px-4">Family Room {p.student.roomNumber}</TableCell>
                                                            <TableCell className="text-gray-400 text-sm px-4">{p.paidDate ? ((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(p.paidDate)) : 'N/A'}</TableCell>
                                                            <TableCell className="text-right font-black text-purple-400 pr-6 px-4 text-lg">₹{p.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Staff Payments History Tab */}
                        <TabsContent value="staff" className="m-0 focus-visible:ring-0 outline-none">
                            <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                <CardHeader className="border-b border-gray-700/50 p-4 md:p-6">
                                    <CardTitle className="text-lg font-bold">Salary Disbursement History</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-gray-700/50">
                                        {staff.map((member) => {
                                            const salaryRecord = staffSalaries.find(s => s.staffId === member.id && s.month === selectedMonth);
                                            const isPaid = salaryRecord?.status === 'paid';
                                            return (
                                                <div key={member.id} className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-white text-base">{member.name}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 border border-gray-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                                    {member.role || 'Staff'}
                                                                </span>
                                                                {isPaid ? (
                                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter italic">Distributed</span>
                                                                ) : (
                                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter italic">Pending</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Monthly Wage</p>
                                                            <p className="text-lg font-bold text-white leading-none mt-1">₹{member.monthlySalary.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent font-bold px-4">
                                                    <TableHead className="text-gray-400 pl-6 px-4">Staff Member</TableHead>
                                                    <TableHead className="text-gray-400 px-4">Professional Role</TableHead>
                                                    <TableHead className="text-gray-400 px-4">Payment Status</TableHead>
                                                    <TableHead className="text-right text-gray-400 pr-6 px-4">Allocated Salary</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {staff.map((member) => {
                                                    const salaryRecord = staffSalaries.find(s => s.staffId === member.id && s.month === selectedMonth);
                                                    const isPaid = salaryRecord?.status === 'paid';
                                                    return (
                                                        <TableRow key={member.id} className="border-gray-700 hover:bg-gray-800/30">
                                                            <TableCell className="font-bold text-white pl-6 py-4 px-4">{member.name}</TableCell>
                                                            <TableCell className="text-gray-400 px-4">{member.role || 'Staff'}</TableCell>
                                                            <TableCell className="px-4">
                                                                {isPaid ? (
                                                                    <span className="text-emerald-400 text-[10px] font-black uppercase py-1 px-3 bg-emerald-400/5 rounded-full border border-emerald-400/20 tracking-widest">Paid</span>
                                                                ) : (
                                                                    <span className="text-orange-400 text-[10px] font-black uppercase py-1 px-3 bg-orange-400/5 rounded-full border border-orange-400/20 tracking-widest">Due</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-black text-white pr-6 text-lg px-4">₹{member.monthlySalary.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <div className="p-4 md:p-6 bg-[#1a2332]/30 text-right border-t border-gray-700/50">
                                        <span className="text-xs text-gray-500 uppercase font-black tracking-widest mr-4">Total Payroll Liability:</span>
                                        <span className="text-xl md:text-2xl font-black text-white">₹{monthlyMetrics.staffExpenses.toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Operations Cost Tab */}
                        <TabsContent value="suppliers" className="m-0 focus-visible:ring-0 outline-none">
                            <Card className="bg-[#0f1f3a] border-gray-700/50 shadow-2xl">
                                <CardHeader className="border-b border-gray-700/50 p-4 md:p-6">
                                    <CardTitle className="text-lg font-bold">Operational & Supply Expenditure</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Mobile Card View */}
                                    <div className="md:hidden divide-y divide-gray-700/50">
                                        {supplierPaymentHistory.length === 0 ? (
                                            <div className="py-20 text-center text-gray-500 px-4">No operational costs recorded for this month.</div>
                                        ) : (
                                            supplierPaymentHistory.map((item: any) => (
                                                <div key={item.id} className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-white text-base">{item.itemName}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.type === 'Utility' ? 'bg-orange-900/30 text-orange-400 border-orange-800/50' : 'bg-purple-900/30 text-purple-400 border-purple-800/50'}`}>
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Expense</p>
                                                            <p className="text-lg font-bold text-red-400 leading-none mt-1">₹{item.price.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-1">
                                                        <span className="text-[10px] text-gray-500 font-medium">Recorded On</span>
                                                        <span className="text-xs text-gray-300 font-medium">{((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(item.date))}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-gray-700 hover:bg-transparent font-bold">
                                                    <TableHead className="text-gray-400 pl-6 px-4">Expense Item / Asset</TableHead>
                                                    <TableHead className="text-gray-400 px-4">Economic Category</TableHead>
                                                    <TableHead className="text-gray-400 px-4">Transaction Date</TableHead>
                                                    <TableHead className="text-right text-gray-400 pr-6 px-4">Total Cost</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {supplierPaymentHistory.length === 0 ? (
                                                    <TableRow className="border-gray-700"><TableCell colSpan={4} className="text-center py-20 text-gray-500">No operational costs recorded for this month.</TableCell></TableRow>
                                                ) : (
                                                    supplierPaymentHistory.map((item: any) => (
                                                        <TableRow key={item.id} className="border-gray-700 hover:bg-gray-800/30">
                                                            <TableCell className="font-bold text-white pl-6 py-4 px-4">{item.itemName}</TableCell>
                                                            <TableCell className="px-4">
                                                                <span className={`text-[10px] font-black uppercase py-1 px-3 rounded-full border tracking-widest ${item.type === 'Utility' ? 'bg-orange-400/5 text-orange-400 border-orange-400/20' : 'bg-purple-400/5 text-purple-400 border-purple-400/20'}`}>
                                                                    {item.type}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-gray-400 text-sm px-4">{((d) => (isValid(d) ? format(d, 'MMM dd, yyyy') : 'N/A'))(parseISO(item.date))}</TableCell>
                                                            <TableCell className="text-right font-black text-red-400 pr-6 text-lg px-4">₹{item.price.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </MainLayout>
    );
}
