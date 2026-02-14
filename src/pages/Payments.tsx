import { useState, useMemo, useEffect } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, CheckCircle, AlertCircle, Building2, DoorOpen, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format, subMonths } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

const Payments = () => {
  const { hostels, payments } = useHostel();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Utility bill payments - stored in localStorage
  const [hostelRentPayments, setHostelRentPayments] = useState<{ id: string; date: string; amount: number; month: string }[]>(() => {
    const saved = localStorage.getItem('hostelRentPayments');
    return saved ? JSON.parse(saved) : [];
  });

  const [electricityPayments, setElectricityPayments] = useState<{ id: string; date: string; amount: number; month: string; units?: number }[]>(() => {
    const saved = localStorage.getItem('electricityPayments');
    return saved ? JSON.parse(saved) : [];
  });

  const [gasPayments, setGasPayments] = useState<{ id: string; date: string; amount: number; month: string; units?: number }[]>(() => {
    const saved = localStorage.getItem('gasPayments');
    return saved ? JSON.parse(saved) : [];
  });


  // Save to localStorage whenever payments change
  useEffect(() => {
    localStorage.setItem('hostelRentPayments', JSON.stringify(hostelRentPayments));
  }, [hostelRentPayments]);

  useEffect(() => {
    localStorage.setItem('electricityPayments', JSON.stringify(electricityPayments));
  }, [electricityPayments]);

  useEffect(() => {
    localStorage.setItem('gasPayments', JSON.stringify(gasPayments));
  }, [gasPayments]);

  // Dialog states for add forms
  const [showRentDialog, setShowRentDialog] = useState(false);
  const [showElectricityDialog, setShowElectricityDialog] = useState(false);
  const [showGasDialog, setShowGasDialog] = useState(false);

  // Form data states
  const [rentForm, setRentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0] });
  const [electricityForm, setElectricityForm] = useState({ amount: '', units: '', date: new Date().toISOString().split('T')[0] });
  const [gasForm, setGasForm] = useState({ amount: '', units: '', date: new Date().toISOString().split('T')[0] });

  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  }), []);

  // Recursive function to get all students from a room and its sub-rooms
  const getAllStudentsFromRoom = (room: any, hostelName: string): any[] => {
    let students = room.students?.map((s: any) => ({ ...s, hostelName, roomNumber: room.roomNumber })) || [];
    if (room.subRooms && room.subRooms.length > 0) {
      students = students.concat(
        room.subRooms.flatMap((subRoom: any) => getAllStudentsFromRoom(subRoom, hostelName))
      );
    }
    return students;
  };

  const allStudents = useMemo(() => {
    return hostels.flatMap(h => {
      if (selectedHostel !== 'all' && h.id !== selectedHostel) return [];
      return h.floors.flatMap(f =>
        f.rooms.flatMap(r => getAllStudentsFromRoom(r, h.name))
      );
    });
  }, [hostels, selectedHostel]);

  const { paidStudents, partialStudents, pendingStudents, totalExpected, totalCollected } = useMemo(() => {
    const paid: any[] = [];
    const partial: any[] = [];
    const pending: any[] = [];
    let expected = 0;
    let collected = 0;

    allStudents.forEach(student => {
      expected += student.monthlyRent;

      const payment = payments.find(p =>
        p.studentId === student.id &&
        p.month === selectedMonth
      );

      if (payment && payment.status === 'paid') {
        paid.push({ ...student, payment });
        collected += payment.amount;
      } else if (payment && payment.status === 'partial') {
        partial.push({ ...student, payment });
        collected += payment.amount;
      } else {
        pending.push({ ...student, payment }); // Payment might be 'due' or undefined
      }
    });

    return {
      paidStudents: paid.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
      partialStudents: partial.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
      pendingStudents: pending.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
      totalExpected: expected,
      totalCollected: collected
    };
  }, [allStudents, payments, selectedMonth, searchTerm]);



  return (
    <MainLayout>
      <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
        {/* Header - Desktop */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                Payment Tracker
              </h1>
              <p className="text-gray-400 text-sm mt-1">Monitor revenue and pending dues across hostels</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-gray-700">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Month</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-white focus:ring-0"
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value} className="bg-[#0f1f3a]">{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#1a2332] px-3 py-1.5 rounded-lg border border-gray-700">
                <Building2 className="w-4 h-4 text-blue-400" />
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-white focus:ring-0"
                >
                  <option value="all" className="bg-[#0f1f3a]">All Hostels</option>
                  {hostels.map(h => (
                    <option key={h.id} value={h.id} className="bg-[#0f1f3a]">{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-[#1a2332] border-gray-700 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav />
              <h1 className="text-2xl font-bold text-white tracking-tight">Payments</h1>
            </div>
            <div className="bg-[#1a2332] px-2 py-1 rounded-lg border border-gray-700 flex items-center">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-white focus:ring-0 p-0"
              >
                {monthOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-[#0f1f3a]">{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search student by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-[#1a2332] border-gray-700 rounded-lg text-xs"
            />
          </div>
          <div className="flex overflow-x-auto gap-2">
            <button
              onClick={() => setSelectedHostel('all')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${selectedHostel === 'all'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-[#1a2332] border-gray-700 text-gray-400'
                }`}
            >
              All Hostels
            </button>
            {hostels.map(h => (
              <button
                key={h.id}
                onClick={() => setSelectedHostel(h.id)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border ${selectedHostel === h.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-[#1a2332] border-gray-700 text-gray-400'
                  }`}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#0f1f3a] border-white/5 shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-widest">Expected</p>
                      <p className="text-xl md:text-3xl font-bold text-white mt-1">₹{totalExpected.toLocaleString()}</p>
                    </div>
                    <IndianRupee className="w-8 h-8 md:w-10 md:h-10 text-gray-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] md:text-xs text-emerald-400 uppercase font-bold tracking-widest">Collected</p>
                      <p className="text-xl md:text-3xl font-bold text-emerald-400 mt-1">₹{totalCollected.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-emerald-500/60 mt-1 uppercase tracking-tighter">{paidStudents.length} Students</p>
                    </div>
                    <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-500/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className={pendingStudents.length > 0 ? "bg-orange-500/10 border-orange-500/20 shadow-xl" : "bg-emerald-500/10 border-emerald-500/20 shadow-xl"}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-[10px] md:text-xs uppercase font-bold tracking-widest ${pendingStudents.length > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>Pending</p>
                      <p className={`text-xl md:text-3xl font-bold mt-1 ${pendingStudents.length > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        ₹{(totalExpected - totalCollected).toLocaleString()}
                      </p>
                      <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${pendingStudents.length > 0 ? 'text-orange-500/60' : 'text-emerald-500/60'}`}>
                        {pendingStudents.length} Students
                      </p>
                    </div>
                    <AlertCircle className={`w-8 h-8 md:w-10 md:h-10 ${pendingStudents.length > 0 ? 'text-orange-500/20' : 'text-emerald-500/20'}`} />
                  </div>
                </CardContent>
              </Card>

              {/* Hostel Rent Card */}
              <Card className="bg-red-500/10 border-red-500/20 shadow-xl">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] md:text-xs text-red-400 uppercase font-bold tracking-widest">Hostel Rent</p>
                      <p className="text-xl md:text-3xl font-bold text-red-400 mt-1">₹1,20,000</p>
                      <p className="text-[10px] font-bold text-red-500/60 mt-1 uppercase tracking-tighter">Monthly Expense</p>
                    </div>
                    <Building2 className="w-8 h-8 md:w-10 md:h-10 text-red-500/20" />
                  </div>
                </CardContent>
              </Card>
            </div>


            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="bg-[#0f1f3a] border border-gray-700/50 p-1 flex w-full md:w-fit gap-1 overflow-x-auto">
                <TabsTrigger value="pending" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4" /> <span className="text-xs md:text-sm">Pending ({pendingStudents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="partial" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4" /> <span className="text-xs md:text-sm">Partial ({partialStudents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="paid" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                  <CheckCircle className="w-4 h-4" /> <span className="text-xs md:text-sm">Collected ({paidStudents.length})</span>
                </TabsTrigger>
                <TabsTrigger value="hostel-rent" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                  <Building2 className="w-4 h-4" /> <span className="text-xs md:text-sm">Hostel Rent</span>
                </TabsTrigger>
                <TabsTrigger value="electricity" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                  <DoorOpen className="w-4 h-4" /> <span className="text-xs md:text-sm">Electricity</span>
                </TabsTrigger>
                <TabsTrigger value="gas" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 gap-2 shrink-0">
                  <IndianRupee className="w-4 h-4" /> <span className="text-xs md:text-sm">Gas Bill</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="m-0">
                <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Due Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pendingStudents.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>All clear! No pending payments.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {pendingStudents.map(student => (
                          <div key={student.id} className="flex justify-between items-center p-4 md:p-6 hover:bg-white/5 transition-colors">
                            <div>
                              <p className="font-bold text-white text-base md:text-lg">{student.name}</p>
                              <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                <Building2 className="w-3 h-3 text-blue-400" /> {student.hostelName}
                                <span className="text-gray-700 mx-1">•</span>
                                <DoorOpen className="w-3 h-3 text-purple-400" /> Room {student.roomNumber}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-2xl font-bold text-orange-400">₹{student.monthlyRent.toLocaleString()}</div>
                              <div className="text-[10px] text-orange-500/60 font-bold uppercase tracking-widest mt-1">Status: Due</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="partial" className="m-0">
                <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Partial Receipts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {partialStudents.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No partial payments found.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {partialStudents.map(student => (
                          <div key={student.id} className="flex justify-between items-center p-4 md:p-6 hover:bg-white/5 transition-colors">
                            <div>
                              <p className="font-bold text-white text-base md:text-lg">{student.name}</p>
                              <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                                <Building2 className="w-3 h-3 text-blue-400" /> {student.hostelName}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-bold text-yellow-500">Paid: ₹{student.payment.amount.toLocaleString()}</div>
                              <div className="text-sm font-bold text-red-500 mt-1">Balance: ₹{(student.payment.remainingAmount || (student.monthlyRent - student.payment.amount)).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="paid" className="m-0">
                <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Completed Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {paidStudents.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No payments collected for this period.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {paidStudents.map(student => (
                          <div key={student.id} className="flex justify-between items-center p-4 md:p-6 hover:bg-white/5 transition-colors">
                            <div>
                              <p className="font-bold text-white text-base md:text-lg">{student.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Cleared</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-2xl font-bold text-emerald-400">₹{student.payment.amount.toLocaleString()}</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {student.payment.paidDate ? format(new Date(student.payment.paidDate), 'dd MMM yyyy') : '-'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hostel Rent Tab */}
              <TabsContent value="hostel-rent" className="m-0">
                <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                        <Building2 className="w-5 h-5" /> Hostel Rent Payments
                      </CardTitle>
                      <Button
                        onClick={() => setShowRentDialog(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Payment
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                        <p className="text-xs text-gray-400">Total Rent</p>
                        <p className="text-2xl font-bold text-white">₹1,20,000</p>
                        <p className="text-xs text-gray-500 mt-1">Monthly Target</p>
                      </div>
                      <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                        <p className="text-xs text-gray-400">Paid This Month</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          ₹{hostelRentPayments
                            .filter((p: any) => p.month === selectedMonth)
                            .reduce((sum: number, p: any) => sum + p.amount, 0)
                            .toLocaleString()}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          {hostelRentPayments.filter((p: any) => p.month === selectedMonth).length} payment(s)
                        </p>
                      </div>
                      <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                        <p className="text-xs text-gray-400">Remaining</p>
                        <p className="text-2xl font-bold text-orange-400">
                          ₹{(120000 - hostelRentPayments
                            .filter((p: any) => p.month === selectedMonth)
                            .reduce((sum: number, p: any) => sum + p.amount, 0))
                            .toLocaleString()}
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          {Math.round(((120000 - hostelRentPayments.filter((p: any) => p.month === selectedMonth).reduce((sum: number, p: any) => sum + p.amount, 0)) / 120000) * 100)}% pending
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-700/50">
                      {hostelRentPayments
                        .filter((p: any) => p.month === selectedMonth)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment: any) => (
                          <div key={payment.id} className="p-4 hover:bg-gray-800/30 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-white">Payment</p>
                              <p className="text-sm text-gray-400">{format(new Date(payment.date), 'dd MMM yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-emerald-400">₹{payment.amount.toLocaleString()}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Delete this payment?')) {
                                    const updated = hostelRentPayments.filter((p: any) => p.id !== payment.id);
                                    setHostelRentPayments(updated);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 h-6"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      {hostelRentPayments.filter((p: any) => p.month === selectedMonth).length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                          No payments recorded for this month. Click "Add Payment" to record a payment.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Electricity Bill Tab */}
              <TabsContent value="electricity" className="m-0">
                <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-blue-400 flex items-center gap-2">
                        <DoorOpen className="w-5 h-5" /> Electricity Bills
                      </CardTitle>
                      <Button
                        onClick={() => setShowElectricityDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Bill
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                        <p className="text-xs text-gray-400">This Month</p>
                        <p className="text-2xl font-bold text-blue-400">
                          ₹{electricityPayments
                            .filter((p: any) => p.month === selectedMonth)
                            .reduce((sum: number, p: any) => sum + p.amount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-500/10 p-4 rounded-lg border border-gray-500/20">
                        <p className="text-xs text-gray-400">Last Month</p>
                        <p className="text-2xl font-bold text-gray-400">
                          ₹{electricityPayments
                            .filter((p: any) => {
                              const lastMonth = format(subMonths(new Date(selectedMonth), 1), 'yyyy-MM');
                              return p.month === lastMonth;
                            })
                            .reduce((sum: number, p: any) => sum + p.amount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-gray-400">Units (This Month)</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {electricityPayments
                            .filter((p: any) => p.month === selectedMonth)
                            .reduce((sum: number, p: any) => sum + (p.units || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-700/50">
                      {electricityPayments
                        .filter((p: any) => p.month === selectedMonth)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment: any) => (
                          <div key={payment.id} className="p-4 hover:bg-gray-800/30 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-white">Electricity Bill</p>
                              <p className="text-sm text-gray-400">{format(new Date(payment.date), 'dd MMM yyyy')}</p>
                              {payment.units && <p className="text-xs text-blue-400">{payment.units} units</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-400">₹{payment.amount.toLocaleString()}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Delete this bill?')) {
                                    const updated = electricityPayments.filter((p: any) => p.id !== payment.id);
                                    setElectricityPayments(updated);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 h-6"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      {electricityPayments.filter((p: any) => p.month === selectedMonth).length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                          No electricity bills recorded for this month. Click "Add Bill" to add one.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Gas Bill Tab */}
              <TabsContent value="gas" className="m-0">
                <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
                        <IndianRupee className="w-5 h-5" /> Gas Bills
                      </CardTitle>
                      <Button
                        onClick={() => setShowGasDialog(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Bill
                      </Button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                        <p className="text-xs text-gray-400">This Month</p>
                        <p className="text-2xl font-bold text-purple-400">
                          ₹{gasPayments
                            .filter((p: any) => p.month === selectedMonth)
                            .reduce((sum: number, p: any) => sum + p.amount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-500/10 p-4 rounded-lg border border-gray-500/20">
                        <p className="text-xs text-gray-400">Last Month</p>
                        <p className="text-2xl font-bold text-gray-400">
                          ₹{gasPayments
                            .filter((p: any) => {
                              const lastMonth = format(subMonths(new Date(selectedMonth), 1), 'yyyy-MM');
                              return p.month === lastMonth;
                            })
                            .reduce((sum: number, p: any) => sum + p.amount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                        <p className="text-xs text-gray-400">Units (This Month)</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {gasPayments
                            .filter((p: any) => p.month === selectedMonth)
                            .reduce((sum: number, p: any) => sum + (p.units || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-700/50">
                      {gasPayments
                        .filter((p: any) => p.month === selectedMonth)
                        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment: any) => (
                          <div key={payment.id} className="p-4 hover:bg-gray-800/30 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-white">Gas Bill</p>
                              <p className="text-sm text-gray-400">{format(new Date(payment.date), 'dd MMM yyyy')}</p>
                              {payment.units && <p className="text-xs text-purple-400">{payment.units} units</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-purple-400">₹{payment.amount.toLocaleString()}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Delete this bill?')) {
                                    const updated = gasPayments.filter((p: any) => p.id !== payment.id);
                                    setGasPayments(updated);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 h-6"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      {gasPayments.filter((p: any) => p.month === selectedMonth).length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                          No gas bills recorded for this month. Click "Add Bill" to add one.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Hostel Rent Payment Dialog */}
      <Dialog open={showRentDialog} onOpenChange={setShowRentDialog}>
        <DialogContent className="bg-[#0f1f3a] border-red-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Add Hostel Rent Payment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rent-amount" className="text-white">Payment Amount (₹)</Label>
              <Input
                id="rent-amount"
                type="number"
                placeholder="Enter amount (e.g., 40000)"
                value={rentForm.amount}
                onChange={(e) => setRentForm({ ...rentForm, amount: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white text-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent-date" className="text-white">Payment Date</Label>
              <Input
                id="rent-date"
                type="date"
                value={rentForm.date}
                onChange={(e) => setRentForm({ ...rentForm, date: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white h-12"
              />
            </div>
            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
              <p className="text-xs text-gray-400">Monthly Rent Target</p>
              <p className="text-2xl font-bold text-white">₹1,20,000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRentDialog(false)} className="border-gray-700">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (rentForm.amount && rentForm.date) {
                  const newPayment = {
                    id: Date.now().toString(),
                    amount: parseFloat(rentForm.amount),
                    date: rentForm.date,
                    month: selectedMonth
                  };
                  setHostelRentPayments([...hostelRentPayments, newPayment]);
                  setRentForm({ amount: '', date: new Date().toISOString().split('T')[0] });
                  setShowRentDialog(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rentForm.amount || !rentForm.date}
            >
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Electricity Bill Dialog */}
      <Dialog open={showElectricityDialog} onOpenChange={setShowElectricityDialog}>
        <DialogContent className="bg-[#0f1f3a] border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-400 flex items-center gap-2">
              <DoorOpen className="w-6 h-6" />
              Add Electricity Bill
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="elec-amount" className="text-white">Bill Amount (₹)</Label>
              <Input
                id="elec-amount"
                type="number"
                placeholder="Enter bill amount"
                value={electricityForm.amount}
                onChange={(e) => setElectricityForm({ ...electricityForm, amount: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white text-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elec-units" className="text-white">Units Consumed (Optional)</Label>
              <Input
                id="elec-units"
                type="number"
                placeholder="Enter units consumed"
                value={electricityForm.units}
                onChange={(e) => setElectricityForm({ ...electricityForm, units: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elec-date" className="text-white">Bill Date</Label>
              <Input
                id="elec-date"
                type="date"
                value={electricityForm.date}
                onChange={(e) => setElectricityForm({ ...electricityForm, date: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowElectricityDialog(false)} className="border-gray-700">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (electricityForm.amount && electricityForm.date) {
                  const newPayment = {
                    id: Date.now().toString(),
                    amount: parseFloat(electricityForm.amount),
                    units: electricityForm.units ? parseFloat(electricityForm.units) : undefined,
                    date: electricityForm.date,
                    month: selectedMonth
                  };
                  setElectricityPayments([...electricityPayments, newPayment]);
                  setElectricityForm({ amount: '', units: '', date: new Date().toISOString().split('T')[0] });
                  setShowElectricityDialog(false);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!electricityForm.amount || !electricityForm.date}
            >
              Add Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gas Bill Dialog */}
      <Dialog open={showGasDialog} onOpenChange={setShowGasDialog}>
        <DialogContent className="bg-[#0f1f3a] border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-400 flex items-center gap-2">
              <IndianRupee className="w-6 h-6" />
              Add Gas Bill
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gas-amount" className="text-white">Bill Amount (₹)</Label>
              <Input
                id="gas-amount"
                type="number"
                placeholder="Enter bill amount"
                value={gasForm.amount}
                onChange={(e) => setGasForm({ ...gasForm, amount: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white text-lg h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gas-units" className="text-white">Units/Cylinders (Optional)</Label>
              <Input
                id="gas-units"
                type="number"
                placeholder="Enter cylinders count"
                value={gasForm.units}
                onChange={(e) => setGasForm({ ...gasForm, units: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gas-date" className="text-white">Bill Date</Label>
              <Input
                id="gas-date"
                type="date"
                value={gasForm.date}
                onChange={(e) => setGasForm({ ...gasForm, date: e.target.value })}
                className="bg-[#1a2332] border-gray-700 text-white h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGasDialog(false)} className="border-gray-700">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (gasForm.amount && gasForm.date) {
                  const newPayment = {
                    id: Date.now().toString(),
                    amount: parseFloat(gasForm.amount),
                    units: gasForm.units ? parseFloat(gasForm.units) : undefined,
                    date: gasForm.date,
                    month: selectedMonth
                  };
                  setGasPayments([...gasPayments, newPayment]);
                  setGasForm({ amount: '', units: '', date: new Date().toISOString().split('T')[0] });
                  setShowGasDialog(false);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!gasForm.amount || !gasForm.date}
            >
              Add Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Payments;
