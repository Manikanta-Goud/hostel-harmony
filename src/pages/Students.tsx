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

const Students = () => {
  const { hostels, payments, updateStudent, recordPayment } = useHostel();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    emergencyContact: '',
    monthlyRent: 0
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

  const getAllStudentsFromRoom = (room: any, hostelName: string): any[] => {
    let students = room.students?.map((s: any) => ({ ...s, hostelName, roomNumber: room.roomNumber, occupancyType: room.occupancyType })) || [];
    if (room.subRooms && room.subRooms.length > 0) {
      students = students.concat(
        room.subRooms.flatMap((subRoom: any) => getAllStudentsFromRoom(subRoom, hostelName))
      );
    }
    return students;
  };

  const allStudents = useMemo(() => {
    return hostels.flatMap(h =>
      h.floors.flatMap(f =>
        f.rooms.flatMap(r => getAllStudentsFromRoom(r, h.name))
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
      monthlyRent: student.monthlyRent
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
          monthlyRent: Number(editFormData.monthlyRent)
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

  // Stats
  const paidCount = regularStudents.filter(s => getPaymentInfo(s.id).status === 'paid').length;
  const partialCount = regularStudents.filter(s => getPaymentInfo(s.id).status === 'partial').length;
  const pendingCount = regularStudents.filter(s => {
    const status = getPaymentInfo(s.id).status;
    return status === 'due' || status === 'overdue';
  }).length;

  return (
    <MainLayout>
      <header className="bg-[#0f1f3a] border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-500" />
              <h1 className="text-xl font-bold text-white">All Students</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium">Real-time Data</span>
          </div>
        </div>
      </header>

      <div className="overflow-y-auto flex-1">
        <main className="container mx-auto px-4 py-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, hostel, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0f1f3a] border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#0f1f3a] border-gray-700/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-white">{regularStudents.length}</p>
                <p className="text-xs text-gray-400">Total Students</p>
              </CardContent>
            </Card>

            <Card className="bg-green-950/30 border-green-700/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-green-400">{paidCount}</p>
                <p className="text-xs text-green-500">Paid Students</p>
              </CardContent>
            </Card>

            <Card className="bg-red-950/30 border-red-700/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-red-400">{partialCount}</p>
                <p className="text-xs text-red-500">Partially Paid</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-950/30 border-orange-700/50">
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
                <p className="text-xs text-orange-500">Pending Students</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card className="bg-[#0f1f3a] border-gray-700/50">
            <CardHeader className="border-b border-gray-700/50">
              <CardTitle className="text-lg text-white">
                {search ? `Found ${filteredStudents.length} students` : `${regularStudents.length} Students`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>{search ? 'No students match your search' : 'No students added yet'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Phone</TableHead>
                        <TableHead className="text-gray-400">Location</TableHead>
                        <TableHead className="text-gray-400">Rent</TableHead>
                        <TableHead className="text-right text-gray-400">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => {
                        const info = getPaymentInfo(student.id);
                        const status = info.status;
                        return (
                          <TableRow key={student.id} className="border-gray-700 hover:bg-gray-800/50">
                            <TableCell className="font-medium text-white">
                              {student.name}
                              {status === 'partial' && (
                                <div className="text-xs text-red-400 flex items-center gap-1 mt-1 font-bold">
                                  <AlertCircle className="w-3 h-3" />
                                  Received: ₹{info.amount}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <a href={`tel:${student.phone}`} className="flex items-center gap-1 text-orange-400 hover:text-orange-300">
                                <Phone className="w-3 h-3" />
                                {student.phone}
                              </a>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Building2 className="w-3 h-3" />
                                <span className="whitespace-nowrap">{student.hostelName}</span>
                                <span className="text-gray-600">•</span>
                                <DoorOpen className="w-3 h-3" />
                                <span className="whitespace-nowrap">Room {student.roomNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div>₹{student.monthlyRent}</div>
                              {status === 'partial' && (
                                <div className="text-xs text-red-400">Due: ₹{(info as any).remainingAmount}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditStudent(student)}
                                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={
                                    status === 'paid' ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' :
                                      status === 'partial' ? 'bg-red-500/10 text-red-500 border-red-500 hover:bg-red-500/20' :
                                        'border-green-600 text-green-500 hover:bg-green-900/10'
                                  }
                                  onClick={() => handleOpenPayment(student)}
                                >
                                  {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partial' : 'Mark Paid'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Edit Student Dialog */}
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent className="bg-[#1a2332] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Name</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-[#0f1f3a] border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="bg-[#0f1f3a] border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Monthly Rent</Label>
                <Input
                  type="number"
                  value={editFormData.monthlyRent}
                  onChange={(e) => setEditFormData({ ...editFormData, monthlyRent: Number(e.target.value) })}
                  className="bg-[#0f1f3a] border-gray-600 text-white"
                />
              </div>
              <Button onClick={handleEditStudent} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Update Student</Button>
            </div>
          </DialogContent>
        </Dialog>

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

      </div>
    </MainLayout>
  );
};

export default Students;
