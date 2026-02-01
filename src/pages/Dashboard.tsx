import { useHostel } from '@/contexts/HostelContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Layers, DoorOpen, Users, IndianRupee, AlertTriangle, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const { hostels, payments } = useHostel();
  const { owner, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Hostel Manager</h1>
              <p className="text-sm text-muted-foreground">Welcome, {owner?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Hostels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalHostels}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Floors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalFloors}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DoorOpen className="w-4 h-4" />
                Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalRooms}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalStudents}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Collected This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">₹{collectedRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">{paidThisMonth} students paid</p>
            </CardContent>
          </Card>

          <Card className={pendingPayments > 0 ? "border-orange-200 bg-orange-50/50" : "border-green-200 bg-green-50/50"}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${pendingPayments > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                <AlertTriangle className="w-4 h-4" />
                Pending This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${pendingPayments > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                ₹{(expectedRevenue - collectedRevenue).toLocaleString()}
              </p>
              <p className={`text-sm ${pendingPayments > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {pendingPayments} students pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={() => navigate('/hostels')} size="lg">
            <Building2 className="w-4 h-4 mr-2" />
            Manage Hostels
          </Button>
          <Button onClick={() => navigate('/students')} variant="outline" size="lg">
            <Users className="w-4 h-4 mr-2" />
            View All Students
          </Button>
          <Button onClick={() => navigate('/payments')} variant="outline" size="lg">
            <IndianRupee className="w-4 h-4 mr-2" />
            Payment Tracker
          </Button>
        </div>

        {/* Hostels Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Hostels</CardTitle>
            <Button size="sm" onClick={() => navigate('/hostels')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Hostel
            </Button>
          </CardHeader>
          <CardContent>
            {hostels.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => navigate(`/hostels/${hostel.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{hostel.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{hostel.address}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4 text-sm text-muted-foreground">
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
      </main>
    </div>
  );
};

export default Dashboard;
