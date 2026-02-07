import { useState } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Layers, DoorOpen, Users, IndianRupee, AlertTriangle, Plus, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

const Dashboard = () => {
  const { hostels, payments, recordPayment } = useHostel();
  const { owner } = useAuth();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);

  // ... (rest of logic remains same until return) ...
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Recursive function to count all students in a room and its sub-rooms
  const countStudentsInRoom = (room: any): number => {
    let count = room.students?.length || 0;
    if (room.subRooms && room.subRooms.length > 0) {
      count += room.subRooms.reduce((acc: number, subRoom: any) => acc + countStudentsInRoom(subRoom), 0);
    }
    return count;
  };

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

  // Calculate statistics
  const totalHostels = hostels.length;
  const totalFloors = hostels.reduce((acc, h) => acc + h.floors.length, 0);
  const totalRooms = hostels.reduce((acc, h) => acc + h.floors.reduce((a, f) => a + f.rooms.length, 0), 0);
  const totalStudents = hostels.reduce((acc, h) =>
    acc + h.floors.reduce((a, f) =>
      a + f.rooms.reduce((r, room) => r + countStudentsInRoom(room), 0), 0), 0);

  // Get all students with their payment status
  const allStudents = hostels.flatMap(h =>
    h.floors.flatMap(f =>
      f.rooms.flatMap(r => getAllStudentsFromRoom(r, h.name))
    )
  );

  const paidThisMonth = allStudents.filter(s =>
    payments.some(p => p.studentId === s.id && p.month === currentMonth && p.status === 'paid')
  ).length;

  const pendingPayments = totalStudents - paidThisMonth;

  const expectedRevenue = allStudents.reduce((acc, s) => acc + s.monthlyRent, 0);
  const collectedRevenue = payments
    .filter(p => p.month === currentMonth && p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  // Get students with pending payments based on next payment due date
  const studentsWithPendingPayments = allStudents.filter(s => {
    // Check if payment is due based on nextPaymentDue date
    if (s.nextPaymentDue) {
      const dueDate = new Date(s.nextPaymentDue);
      const today = new Date();
      // Payment is due if today is on or after the due date
      if (today >= dueDate) {
        // Check if payment has been made for this cycle
        const payment = payments.find(p => {
          if (p.studentId !== s.id) return false;
          // Check if payment was made after the last due date
          if (p.paidDate) {
            const paidDate = new Date(p.paidDate);
            return paidDate >= new Date(s.joinDate) && p.status === 'paid';
          }
          return false;
        });

        // If no recent payment found or payment is marked as due, include in pending
        return !payment;
      }
    }

    // Fallback to monthly check for students without nextPaymentDue
    const payment = payments.find(p => p.studentId === s.id && p.month === currentMonth);
    return !payment || payment.status !== 'paid';
  });

  const handleMarkAsPaid = (student: any) => {
    // Calculate next payment due date after marking as paid
    let newNextPaymentDue: Date;
    const currentDueDate = student.nextPaymentDue ? new Date(student.nextPaymentDue) : new Date();

    if (student.paymentCycle === 'custom' && student.customDays) {
      newNextPaymentDue = new Date(currentDueDate);
      newNextPaymentDue.setDate(newNextPaymentDue.getDate() + student.customDays);
    } else {
      newNextPaymentDue = new Date(currentDueDate);
      newNextPaymentDue.setMonth(newNextPaymentDue.getMonth() + 1);
    }

    recordPayment({
      studentId: student.id,
      amount: student.monthlyRent,
      month: currentMonth,
      paidDate: new Date().toISOString(),
      status: 'paid'
    });

    // Update student's next payment due date
    // Note: You'll need to add an updateStudent function call here
  };

  return (
    <MainLayout>
      <div className="flex-1">
        {/* Header - Desktop */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 sticky top-0 z-10 hidden md:block">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
              <p className="text-sm text-gray-400 mt-1">Welcome back, {owner?.name}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell (Desktop) */}
              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                    {studentsWithPendingPayments.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs ring-2 ring-[#0f1f3a]">
                        {studentsWithPendingPayments.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 border-gray-700 bg-[#0f1f3a]" align="end">
                  <div className="bg-[#0f1f3a] border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Payment Reminders</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {studentsWithPendingPayments.length} student{studentsWithPendingPayments.length !== 1 ? 's' : ''} with pending payments
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setNotificationOpen(false)} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <ScrollArea className="max-h-[400px]">
                      {studentsWithPendingPayments.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>All payments are up to date!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-700">
                          {studentsWithPendingPayments.map((student) => (
                            <div key={student.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-white">{student.name}</h4>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-400">
                                    <span>{student.hostelName} • Room {student.roomNumber}</span>
                                    <div className="mt-1 font-semibold text-orange-400">₹{student.monthlyRent} due</div>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => handleMarkAsPaid(student)} className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs">
                                  Paid
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Mobile Header Info */}
        <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Hello, {owner?.name?.split(' ')[0]}</h2>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
              </div>
            </div>

            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-300 hover:bg-white/5">
                  <Bell className="w-6 h-6" />
                  {studentsWithPendingPayments.length > 0 && (
                    <Badge className="absolute -top-0 -right-0 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] ring-2 ring-[#0a0f1a]">
                      {studentsWithPendingPayments.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-32px)] ml-4 p-0 border-gray-700 bg-[#0f1f3a]" align="center">
                <div className="bg-[#0f1f3a] border border-gray-700 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Reminders</h3>
                    <Button variant="ghost" size="icon" onClick={() => setNotificationOpen(false)} className="text-gray-400">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <ScrollArea className="max-h-[60vh]">
                    {/* Same list logic as desktop but compact for mobile */}
                    <div className="divide-y divide-gray-700">
                      {studentsWithPendingPayments.map((student) => (
                        <div key={student.id} className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-white">{student.name}</h4>
                              <p className="text-[10px] text-gray-400">Room {student.roomNumber} • ₹{student.monthlyRent}</p>
                            </div>
                            <Button size="sm" onClick={() => handleMarkAsPaid(student)} className="bg-green-600 h-8 px-4 text-xs font-bold">
                              MARK PAID
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="px-4 md:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
          {/* Payment Alert Banner */}
          {studentsWithPendingPayments.length > 0 && (
            <Card className="mb-6 bg-orange-950/30 border-orange-700/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-400 mb-1">Payment Reminder</h3>
                    <p className="text-sm text-gray-300">
                      You have <span className="font-bold text-orange-400">{studentsWithPendingPayments.length}</span> student{studentsWithPendingPayments.length !== 1 ? 's' : ''} with pending payments for {format(new Date(), 'MMMM yyyy')}.
                      Total pending amount: <span className="font-bold text-orange-400">₹{studentsWithPendingPayments.reduce((sum, s) => sum + s.monthlyRent, 0).toLocaleString()}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => setNotificationOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#0f1f3a] border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Hostels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{totalHostels}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1f3a] border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Floors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{totalFloors}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1f3a] border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4" />
                  Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{totalRooms}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1f3a] border-gray-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{totalStudents}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button onClick={() => navigate('/hostels')} size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Building2 className="w-4 h-4 mr-2" />
              Manage Hostels
            </Button>
            <Button onClick={() => navigate('/students')} variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800/30">
              <Users className="w-4 h-4 mr-2" />
              View All Students
            </Button>
            <Button onClick={() => navigate('/payments')} variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800/30">
              <IndianRupee className="w-4 h-4 mr-2" />
              Payment Tracker
            </Button>
          </div>

          {/* Hostels Overview */}
          <Card className="bg-[#0f1f3a] border-gray-700/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Your Hostels</CardTitle>
              <Button size="sm" onClick={() => navigate('/hostels')} className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Hostel
              </Button>
            </CardHeader>
            <CardContent>
              {hostels.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hostels added yet.</p>
                  <p className="text-sm">Click "Add Hostel" to get started.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hostels.map(hostel => {
                    const floors = hostel.floors.length;
                    const rooms = hostel.floors.reduce((a, f) => a + f.rooms.length, 0);
                    const students = hostel.floors.reduce((a, f) =>
                      a + f.rooms.reduce((r, room) => r + countStudentsInRoom(room), 0), 0);

                    return (
                      <Card
                        key={hostel.id}
                        className="cursor-pointer hover:border-orange-500 transition-colors bg-[#1a2332] border-gray-700/50"
                        onClick={() => navigate(`/hostels/${hostel.id}`)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-white">{hostel.name}</CardTitle>
                          <p className="text-sm text-gray-400">{hostel.address}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span>{floors} floors</span>
                            <span>{rooms} rooms</span>
                            <span>{students} students</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div >
    </MainLayout >
  );
};

export default Dashboard;
