import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, ArrowLeft, Search, Phone, Building2, DoorOpen, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

const Students = () => {
  const navigate = useNavigate();
  const { hostels, payments, recordPayment } = useHostel();
  const [search, setSearch] = useState('');

  const currentMonth = format(new Date(), 'yyyy-MM');

  // Get all students with location info
  const allStudents = hostels.flatMap(h =>
    h.floors.flatMap(f =>
      f.rooms.flatMap(r =>
        r.students.map(s => ({
          ...s,
          hostelId: h.id,
          hostelName: h.name,
          floorNumber: f.floorNumber,
          floorId: f.id,
          roomNumber: r.roomNumber
        }))
      )
    )
  );

  const filteredStudents = allStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.hostelName.toLowerCase().includes(search.toLowerCase()) ||
    s.roomNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getPaymentStatus = (studentId: string) => {
    const payment = payments.find(p => p.studentId === studentId && p.month === currentMonth);
    return payment?.status || 'due';
  };

  const handlePaymentToggle = (studentId: string, amount: number) => {
    const status = getPaymentStatus(studentId);
    if (status === 'paid') {
      recordPayment({ studentId, amount, month: currentMonth, status: 'due' });
    } else {
      recordPayment({ studentId, amount, month: currentMonth, paidDate: new Date().toISOString(), status: 'paid' });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">All Students</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, hostel, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{allStudents.length}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {allStudents.filter(s => getPaymentStatus(s.id) === 'paid').length}
              </p>
              <p className="text-xs text-green-600">Paid This Month</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-orange-700">
                {allStudents.filter(s => getPaymentStatus(s.id) !== 'paid').length}
              </p>
              <p className="text-xs text-orange-600">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {search ? `Found ${filteredStudents.length} students` : `${allStudents.length} Students`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>{search ? 'No students match your search' : 'No students added yet'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map(student => {
                      const status = getPaymentStatus(student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <a href={`tel:${student.phone}`} className="flex items-center gap-1 text-primary">
                              <Phone className="w-3 h-3" />
                              {student.phone}
                            </a>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="w-3 h-3" />
                              <span>{student.hostelName}</span>
                              <span>•</span>
                              <DoorOpen className="w-3 h-3" />
                              <span>Room {student.roomNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>₹{student.monthlyRent}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant={status === 'paid' ? 'default' : 'outline'}
                              className={status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}
                              onClick={() => handlePaymentToggle(student.id, student.monthlyRent)}
                            >
                              <IndianRupee className="w-3 h-3 mr-1" />
                              {status === 'paid' ? 'Paid' : 'Mark Paid'}
                            </Button>
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
    </div>
  );
};

export default Students;
