import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IndianRupee, ArrowLeft, CheckCircle, AlertCircle, Building2, DoorOpen } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Payments = () => {
  const navigate = useNavigate();
  const { hostels, payments, recordPayment } = useHostel();
  const { toast } = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedHostel, setSelectedHostel] = useState<string>('all');

  // Generate last 12 months options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

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

  const filteredStudents = selectedHostel === 'all' 
    ? allStudents 
    : allStudents.filter(s => s.hostelId === selectedHostel);

  const getPaymentStatus = (studentId: string, month: string) => {
    const payment = payments.find(p => p.studentId === studentId && p.month === month);
    return payment?.status || 'due';
  };

  const handlePaymentToggle = (studentId: string, amount: number) => {
    const status = getPaymentStatus(studentId, selectedMonth);
    if (status === 'paid') {
      recordPayment({ studentId, amount, month: selectedMonth, status: 'due' });
      toast({ title: "Payment marked as unpaid" });
    } else {
      recordPayment({ 
        studentId, 
        amount, 
        month: selectedMonth, 
        paidDate: new Date().toISOString(), 
        status: 'paid' 
      });
      toast({ title: "Payment recorded!" });
    }
  };

  const paidStudents = filteredStudents.filter(s => getPaymentStatus(s.id, selectedMonth) === 'paid');
  const pendingStudents = filteredStudents.filter(s => getPaymentStatus(s.id, selectedMonth) !== 'paid');

  const totalExpected = filteredStudents.reduce((acc, s) => acc + s.monthlyRent, 0);
  const totalCollected = paidStudents.reduce((acc, s) => acc + s.monthlyRent, 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Payment Tracker</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="w-48">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={selectedHostel} onValueChange={setSelectedHostel}>
              <SelectTrigger>
                <SelectValue placeholder="All hostels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hostels</SelectItem>
                {hostels.map(h => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expected</p>
                  <p className="text-2xl font-bold">₹{totalExpected.toLocaleString()}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Collected</p>
                  <p className="text-2xl font-bold text-green-700">₹{totalCollected.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{paidStudents.length} students</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className={pendingStudents.length > 0 ? "border-orange-200 bg-orange-50/50" : "border-green-200 bg-green-50/50"}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${pendingStudents.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>Pending</p>
                  <p className={`text-2xl font-bold ${pendingStudents.length > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                    ₹{(totalExpected - totalCollected).toLocaleString()}
                  </p>
                  <p className={`text-xs ${pendingStudents.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {pendingStudents.length} students
                  </p>
                </div>
                <AlertCircle className={`w-8 h-8 ${pendingStudents.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        {pendingStudents.length > 0 && (
          <Card className="mb-6 border-orange-200">
            <CardHeader className="bg-orange-50/50">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                <AlertCircle className="w-5 h-5" />
                Pending Payments ({pendingStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {pendingStudents.map(student => (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span>{student.hostelName}</span>
                        <span>•</span>
                        <DoorOpen className="w-3 h-3" />
                        <span>Room {student.roomNumber}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePaymentToggle(student.id, student.monthlyRent)}
                    >
                      <IndianRupee className="w-4 h-4 mr-1" />
                      ₹{student.monthlyRent}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paid Students */}
        <Card>
          <CardHeader className="bg-green-50/50">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Paid ({paidStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {paidStudents.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No payments recorded for this month</p>
            ) : (
              <div className="space-y-2">
                {paidStudents.map(student => (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-green-50/30"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        <span>{student.hostelName}</span>
                        <span>•</span>
                        <DoorOpen className="w-3 h-3" />
                        <span>Room {student.roomNumber}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-green-600 text-green-600"
                      onClick={() => handlePaymentToggle(student.id, student.monthlyRent)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      ₹{student.monthlyRent}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Payments;
