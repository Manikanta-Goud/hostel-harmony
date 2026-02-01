import { useHostel } from '@/contexts/HostelContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Layers, DoorOpen, Users, IndianRupee, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Sidebar from '@/components/Sidebar';

const Dashboard = () => {
  const { hostels, payments } = useHostel();
  const { owner } = useAuth();
  const navigate = useNavigate();

  const currentMonth = format(new Date(), 'yyyy-MM');

  // Calculate statistics
  const totalHostels = hostels.length;
  const totalFloors = hostels.reduce((acc, h) => acc + h.floors.length, 0);
  const totalRooms = hostels.reduce((acc, h) => acc + h.floors.reduce((a, f) => a + f.rooms.length, 0), 0);
  const totalStudents = hostels.reduce((acc, h) =>
    acc + h.floors.reduce((a, f) =>
      a + f.rooms.reduce((r, room) => r + room.students.length, 0), 0), 0);

  // Get all students with their payment status
  const allStudents = hostels.flatMap(h =>
    h.floors.flatMap(f =>
      f.rooms.flatMap(r =>
        r.students.map(s => ({ ...s, hostelName: h.name, roomNumber: r.roomNumber }))
      )
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

  return (
    <div className="flex min-h-screen bg-[#1a2332]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 sticky top-0 z-10">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-gray-400 mt-1">Welcome back, {owner?.name}</p>
          </div>
        </header>

        <div className="px-8 py-8">
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

          {/* Revenue Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-green-950/30 border-green-700/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Collected This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-400">₹{collectedRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-500">{paidThisMonth} students paid</p>
              </CardContent>
            </Card>

            <Card className={pendingPayments > 0 ? "bg-orange-950/30 border-orange-700/50" : "bg-green-950/30 border-green-700/50"}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium flex items-center gap-2 ${pendingPayments > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  Pending This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${pendingPayments > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  ₹{(expectedRevenue - collectedRevenue).toLocaleString()}
                </p>
                <p className={`text-sm ${pendingPayments > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  {pendingPayments} students pending
                </p>
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
                      a + f.rooms.reduce((r, room) => r + room.students.length, 0), 0);

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
      </main>
    </div>
  );
};

export default Dashboard;
