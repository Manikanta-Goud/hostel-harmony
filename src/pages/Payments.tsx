import { useState, useMemo } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, CheckCircle, AlertCircle, Building2, DoorOpen } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

const Payments = () => {
  const { hostels, payments } = useHostel();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedHostel, setSelectedHostel] = useState('all');

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

  const { paidStudents, pendingStudents, totalExpected, totalCollected } = useMemo(() => {
    const paid: any[] = [];
    const pending: any[] = [];
    let expected = 0;
    let collected = 0;

    allStudents.forEach(student => {
      expected += student.monthlyRent;

      const payment = payments.find(p =>
        p.studentId === student.id &&
        p.month === selectedMonth &&
        p.status === 'paid'
      );

      if (payment) {
        paid.push(student);
        collected += payment.amount;
      } else {
        pending.push(student);
      }
    });

    return {
      paidStudents: paid,
      pendingStudents: pending,
      totalExpected: expected,
      totalCollected: collected
    };
  }, [allStudents, payments, selectedMonth]);



  return (
    <MainLayout>
      <header className="bg-[#0f1f3a] border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileNav />
            <div className="flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-green-400" />
              <h1 className="text-xl font-bold text-white">Payment Tracker</h1>
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
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-48">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-[#0f1f3a] border-gray-700 text-white">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1f3a] border-gray-700 text-white">
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-gray-800 focus:text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                <SelectTrigger className="bg-[#0f1f3a] border-gray-700 text-white">
                  <SelectValue placeholder="All hostels" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1f3a] border-gray-700 text-white">
                  <SelectItem value="all" className="focus:bg-gray-800 focus:text-white">All Hostels</SelectItem>
                  {hostels.map(h => (
                    <SelectItem key={h.id} value={h.id} className="focus:bg-gray-800 focus:text-white">{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#0f1f3a] border-gray-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Expected</p>
                    <p className="text-2xl font-bold text-white">₹{totalExpected.toLocaleString()}</p>
                  </div>
                  <IndianRupee className="w-8 h-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-950/30 border-green-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-400">Collected</p>
                    <p className="text-2xl font-bold text-green-400">₹{totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-green-500">{paidStudents.length} students</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className={pendingStudents.length > 0 ? "bg-orange-950/30 border-orange-700/50" : "bg-green-950/30 border-green-700/50"}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${pendingStudents.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>Pending</p>
                    <p className={`text-2xl font-bold ${pendingStudents.length > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                      ₹{(totalExpected - totalCollected).toLocaleString()}
                    </p>
                    <p className={`text-xs ${pendingStudents.length > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                      {pendingStudents.length} students
                    </p>
                  </div>
                  <AlertCircle className={`w-8 h-8 ${pendingStudents.length > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Payments */}
          {pendingStudents.length > 0 && (
            <Card className="mb-6 bg-[#0f1f3a] border-orange-700/50">
              <CardHeader className="bg-orange-950/30 border-b border-orange-700/30">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  Pending Payments ({pendingStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {pendingStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors border border-gray-700/50"
                    >
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Building2 className="w-3 h-3" />
                          <span>{student.hostelName}</span>
                          <span className="text-gray-600">•</span>
                          <DoorOpen className="w-3 h-3" />
                          <span>Room {student.roomNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 font-mono">
                          pending
                        </span>
                        <div className="px-3 py-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold">
                          ₹{student.monthlyRent}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paid Students */}
          <Card className="bg-[#0f1f3a] border-gray-700/50">
            <CardHeader className="bg-green-950/30 border-b border-green-700/30">
              <CardTitle className="text-lg flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                Paid ({paidStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {paidStudents.length === 0 ? (
                <p className="text-center py-4 text-gray-400">No payments recorded for this month</p>
              ) : (
                <div className="space-y-2">
                  {paidStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
                    >
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Building2 className="w-3 h-3" />
                          <span>{student.hostelName}</span>
                          <span className="text-gray-600">•</span>
                          <DoorOpen className="w-3 h-3" />
                          <span>Room {student.roomNumber}</span>
                        </div>
                      </div>
                      <div className="px-3 py-2 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        ₹{student.monthlyRent}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </MainLayout>
  );
};

export default Payments;
