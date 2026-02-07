import { useState, useMemo } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Search, Phone, Building2, DoorOpen, IndianRupee, Pencil, AlertCircle, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';
import { StudentProfileDialog } from '@/components/StudentProfileDialog';

const Students = () => {
  const { hostels, payments, updateStudent, recordPayment, deleteStudent } = useHostel();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContact: '',
    monthlyRent: 0,
    joinDate: ''
  });

  // Payment Dialog State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStudent, setPaymentStudent] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    pendingDays: '',
    nextPaymentDate: ''
  });

  const currentMonth = format(new Date(), 'yyyy-MM');

  const getAllStudentsFromRoom = (room: any, hostelName: string, hostelId: string, floorId: string): any[] => {
    let students = room.students?.map((s: any) => ({ ...s, hostelName, hostelId, floorId, roomNumber: room.roomNumber, occupancyType: room.occupancyType })) || [];
    if (room.subRooms && room.subRooms.length > 0) {
      students = students.concat(
        room.subRooms.flatMap((subRoom: any) => getAllStudentsFromRoom(subRoom, hostelName, hostelId, floorId))
      );
    }
    return students;
  };

  const allStudents = useMemo(() => {
    return hostels.flatMap(h =>
      h.floors.flatMap(f =>
        f.rooms.flatMap(r => getAllStudentsFromRoom(r, h.name, h.id, f.id))
      )
    );
  }, [hostels]);

  // Filter out families (keep only single students)
  const regularStudents = useMemo(() => {
    return allStudents.filter(s => s.occupancyType !== 'family' && (!s.memberCount || s.memberCount <= 1));
  }, [allStudents]);

  const filteredStudents = useMemo(() => {
    if (!search) return regularStudents;
    const lowerSearch = search.toLowerCase();
    return regularStudents.filter(s =>
      s.name.toLowerCase().includes(lowerSearch) ||
      s.phone.includes(search) ||
      s.hostelName.toLowerCase().includes(lowerSearch) ||
      s.roomNumber.toLowerCase().includes(lowerSearch)
    );
  }, [regularStudents, search]);

  const getPaymentInfo = (studentId: string) => {
    const payment = payments.find(p => p.studentId === studentId && p.month === currentMonth);
    return payment || { status: 'due', amount: 0 };
  };

  const handleOpenPayment = (student: any) => {
    const info = getPaymentInfo(student.id);
    setPaymentStudent(student);
    setPaymentForm({
      amount: info.status === 'paid' ? student.monthlyRent : (info.amount > 0 ? info.amount : student.monthlyRent),
      pendingDays: '',
      nextPaymentDate: (info as any).nextPaymentDate ? format(new Date((info as any).nextPaymentDate), 'yyyy-MM-dd') : ''
    });
    setIsPaymentOpen(true);
  };

  const handleMarkPayment = async () => {
    if (!paymentStudent) return;

    try {
      const amountPaid = Number(paymentForm.amount);
      const isFullPayment = amountPaid >= paymentStudent.monthlyRent;
      const status = isFullPayment ? 'paid' : 'partial';

      let nextDate = paymentForm.nextPaymentDate ? new Date(paymentForm.nextPaymentDate).toISOString() : undefined;

      // If user marks amount as 0, it is 'due' (unpaid)
      if (amountPaid <= 0) {
        await recordPayment({
          studentId: paymentStudent.id,
          amount: 0,
          month: currentMonth,
          status: 'due'
        });
      } else {
        await recordPayment({
          studentId: paymentStudent.id,
          amount: amountPaid,
          month: currentMonth,
          status: status,
          paidDate: new Date().toISOString(),
          remainingAmount: Math.max(0, paymentStudent.monthlyRent - amountPaid),
          nextPaymentDate: nextDate
        });
      }

      setIsPaymentOpen(false);
      setPaymentStudent(null);

      toast({
        title: "Success",
        description: `Payment marked as ${status}`
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive"
      });
    }
  };

  const openEditStudent = (student: any) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      phone: student.phone,
      email: student.email || '',
      emergencyContact: student.emergencyContact || '',
      monthlyRent: student.monthlyRent,
      joinDate: student.joinDate ? format(new Date(student.joinDate), 'yyyy-MM-dd') : ''
    });
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;
    try {
      await updateStudent(
        'dummy-hostel', 'dummy-floor', 'dummy-room',
        editingStudent.id,
        {
          name: editFormData.name,
          phone: editFormData.phone,
          email: editFormData.email,
          emergencyContact: editFormData.emergencyContact,
          monthlyRent: Number(editFormData.monthlyRent),
          joinDate: editFormData.joinDate ? new Date(editFormData.joinDate).toISOString() : undefined
        }
      );
      setEditingStudent(null);
      toast({
        title: "Success",
        description: "Student updated successfully"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = async () => {
    if (!editingStudent) return;
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

    try {
      await deleteStudent(
        'dummy-hostel', 'dummy-floor', 'dummy-room',
        editingStudent.id
      );
      setEditingStudent(null);
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive"
      });
    }
  };

  // Stats
  const paidCount = regularStudents.filter(s => getPaymentInfo(s.id).status === 'paid').length;
  const partialCount = regularStudents.filter(s => getPaymentInfo(s.id).status === 'partial').length;
  const pendingCount = regularStudents.filter(s => {
    const status = getPaymentInfo(s.id).status;
    return status === 'due' || status === 'overdue';
  }).length;

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
        {/* Header - Desktop */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                Student Directory
              </h1>
              <p className="text-gray-400 text-sm mt-1">Manage and track occupant payments</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1a2332] px-4 py-2 rounded-xl border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Real-time Data</span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent">
          <div className="flex items-center gap-3">
            <MobileNav />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Occupants</h1>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-0.5">Live Directory</p>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0f1f3a] border-gray-700 text-white placeholder:text-gray-500 h-11 rounded-xl"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#0f1f3a] border-white/5 shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-white">{regularStudents.length}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{paidCount}</p>
                  <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Paid</p>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20 shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">{partialCount}</p>
                  <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Partial</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/20 shadow-xl">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
                  <p className="text-[10px] uppercase font-bold text-orange-500 tracking-wider">Due</p>
                </CardContent>
              </Card>
            </div>

            {/* Students List/Table */}
            <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 px-4 md:px-6">
                <CardTitle className="text-lg text-white font-bold">
                  {search ? `Found ${filteredStudents.length}` : `${regularStudents.length} Students`}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">{search ? 'No matches found' : 'No students added'}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Occupant</TableHead>
                            <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Contact</TableHead>
                            <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Assignment</TableHead>
                            <TableHead className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Monthly Rent</TableHead>
                            <TableHead className="text-right text-gray-400 text-[10px] uppercase font-bold tracking-widest pr-6">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map(student => {
                            const info = getPaymentInfo(student.id);
                            const status = info.status;
                            return (
                              <TableRow key={student.id} className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setEditingStudent(student)}>
                                <TableCell className="py-4">
                                  <div className="font-bold text-white">{student.name}</div>
                                  {status === 'partial' && (
                                    <div className="text-[10px] text-orange-400 flex items-center gap-1 mt-1 font-bold">
                                      <AlertCircle className="w-3 h-3" /> Received: ₹{info.amount}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <Phone className="w-3.5 h-3.5" /> {student.phone}
                                  </a>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="whitespace-nowrap font-medium">{student.hostelName}</span>
                                    <span className="text-gray-700">•</span>
                                    <DoorOpen className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="whitespace-nowrap font-medium">Room {student.roomNumber}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300 font-bold">
                                  <div>₹{student.monthlyRent.toLocaleString()}</div>
                                  {status === 'partial' && (
                                    <div className="text-[10px] text-red-500 font-bold">Due: ₹{(info as any).remainingAmount}</div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <Button
                                    size="sm"
                                    className={
                                      status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-bold h-7 uppercase px-4' :
                                        status === 'partial' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 text-[10px] font-bold h-7 uppercase px-4' :
                                          'bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold h-7 uppercase px-4'
                                    }
                                    onClick={(e) => { e.stopPropagation(); handleOpenPayment(student); }}
                                  >
                                    {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Mark Paid'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile List View */}
                    <div className="md:hidden divide-y divide-white/5">
                      {filteredStudents.map(student => {
                        const info = getPaymentInfo(student.id);
                        const status = info.status;
                        return (
                          <div key={student.id} className="p-4 active:bg-white/5 transition-colors" onClick={() => setEditingStudent(student)}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-white text-base">{student.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                                  <Building2 className="w-3 h-3 text-blue-400" /> {student.hostelName}
                                  <span className="text-gray-700">•</span>
                                  <DoorOpen className="w-3 h-3 text-purple-400" /> Room {student.roomNumber}
                                </div>
                              </div>
                              <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20' :
                                status === 'partial' ? 'bg-orange-500/10 text-orange-400 border border-orange-400/20' :
                                  'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Due'}
                              </div>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rent</span>
                                <span className="text-sm font-bold text-white">₹{student.monthlyRent.toLocaleString()}</span>
                              </div>
                              <div className="flex gap-2">
                                <a href={`tel:${student.phone}`} className="p-2 bg-[#1a2332] rounded-lg border border-gray-700 text-orange-400" onClick={(e) => e.stopPropagation()}>
                                  <Phone className="w-4 h-4" />
                                </a>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 h-8 text-[10px] font-bold uppercase"
                                  onClick={(e) => { e.stopPropagation(); handleOpenPayment(student); }}
                                >
                                  Update
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Payment Logic Dialog */}
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="bg-[#1a2332] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Mark Payment for {paymentStudent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs uppercase">Total Rent</Label>
                  <div className="text-2xl font-bold text-white">₹{paymentStudent?.monthlyRent}</div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs uppercase">Due Amount</Label>
                  <div className="text-2xl font-bold text-orange-400">
                    ₹{Math.max(0, (paymentStudent?.monthlyRent || 0) - paymentForm.amount)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Amount Paid (₹)</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="bg-[#0f1f3a] border-gray-600 text-white text-lg"
                />
                <p className="text-xs text-gray-400">
                  Enter the amount actually paid by the student.
                </p>
              </div>

              {paymentForm.amount < (paymentStudent?.monthlyRent || 0) && paymentForm.amount > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-orange-400" />
                    Payment Promise Date
                  </Label>
                  <Input
                    type="date"
                    value={paymentForm.nextPaymentDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                    className="bg-[#0f1f3a] border-gray-600 text-white"
                  />
                  <p className="text-xs text-orange-400/80">
                    When will the remaining ₹{(paymentStudent?.monthlyRent || 0) - paymentForm.amount} be paid?
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsPaymentOpen(false)} className="text-gray-400">Cancel</Button>
              <Button onClick={handleMarkPayment} className="bg-green-600 hover:bg-green-700 text-white">
                {paymentForm.amount >= (paymentStudent?.monthlyRent || 0) ? 'Mark Full Paid' : 'Mark Partial Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {editingStudent && (
          <StudentProfileDialog
            student={editingStudent}
            isOpen={!!editingStudent}
            onClose={() => setEditingStudent(null)}
            hostelId={editingStudent.hostelId}
            floorId={editingStudent.floorId}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Students;
