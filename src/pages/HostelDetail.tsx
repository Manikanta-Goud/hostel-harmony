import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building2, Plus, ArrowLeft, Trash2, Layers, DoorOpen, Users, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const HostelDetail = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const { hostels, addFloor, deleteFloor, addRoom, deleteRoom, addStudent, deleteStudent, payments, recordPayment } = useHostel();
  const { toast } = useToast();

  const hostel = hostels.find(h => h.id === hostelId);
  
  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false);
  const [floorNumber, setFloorNumber] = useState('');
  
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [roomData, setRoomData] = useState({ roomNumber: '', capacity: '', monthlyRent: '' });
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [studentData, setStudentData] = useState({
    name: '', phone: '', email: '', emergencyContact: '', monthlyRent: ''
  });

  const currentMonth = format(new Date(), 'yyyy-MM');

  if (!hostel) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Hostel not found</p>
          <Button onClick={() => navigate('/hostels')} className="mt-4">Back to Hostels</Button>
        </Card>
      </div>
    );
  }

  const handleAddFloor = () => {
    const num = parseInt(floorNumber);
    if (isNaN(num) || num < 0) {
      toast({ title: "Please enter a valid floor number", variant: "destructive" });
      return;
    }
    if (hostel.floors.some(f => f.floorNumber === num)) {
      toast({ title: "This floor already exists", variant: "destructive" });
      return;
    }
    addFloor(hostel.id, num);
    setFloorNumber('');
    setIsAddFloorOpen(false);
    toast({ title: `Floor ${num} added successfully!` });
  };

  const handleAddRoom = () => {
    if (!roomData.roomNumber.trim() || !roomData.capacity || !roomData.monthlyRent) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    addRoom(hostel.id, selectedFloorId, {
      roomNumber: roomData.roomNumber,
      capacity: parseInt(roomData.capacity),
      monthlyRent: parseInt(roomData.monthlyRent)
    });
    setRoomData({ roomNumber: '', capacity: '', monthlyRent: '' });
    setIsAddRoomOpen(false);
    toast({ title: "Room added successfully!" });
  };

  const handleAddStudent = () => {
    if (!studentData.name.trim() || !studentData.phone.trim() || !studentData.monthlyRent) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    const floor = hostel.floors.find(f => f.rooms.some(r => r.id === selectedRoomId));
    if (!floor) return;
    
    addStudent(hostel.id, floor.id, selectedRoomId, {
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email || undefined,
      emergencyContact: studentData.emergencyContact || undefined,
      joinDate: new Date().toISOString(),
      monthlyRent: parseInt(studentData.monthlyRent)
    });
    setStudentData({ name: '', phone: '', email: '', emergencyContact: '', monthlyRent: '' });
    setIsAddStudentOpen(false);
    toast({ title: "Student added successfully!" });
  };

  const handlePaymentToggle = (studentId: string, amount: number) => {
    const existingPayment = payments.find(p => p.studentId === studentId && p.month === currentMonth);
    if (existingPayment?.status === 'paid') {
      recordPayment({ studentId, amount, month: currentMonth, status: 'due' });
      toast({ title: "Payment marked as unpaid" });
    } else {
      recordPayment({ studentId, amount, month: currentMonth, paidDate: new Date().toISOString(), status: 'paid' });
      toast({ title: "Payment recorded!" });
    }
  };

  const getPaymentStatus = (studentId: string) => {
    const payment = payments.find(p => p.studentId === studentId && p.month === currentMonth);
    return payment?.status || 'due';
  };

  const openAddRoom = (floorId: string) => {
    setSelectedFloorId(floorId);
    setIsAddRoomOpen(true);
  };

  const openAddStudent = (roomId: string, defaultRent: number) => {
    setSelectedRoomId(roomId);
    setStudentData(prev => ({ ...prev, monthlyRent: defaultRent.toString() }));
    setIsAddStudentOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/hostels')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Building2 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{hostel.name}</h1>
              <p className="text-sm text-muted-foreground">{hostel.address}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <Layers className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">{hostel.floors.length}</p>
              <p className="text-xs text-muted-foreground">Floors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <DoorOpen className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">
                {hostel.floors.reduce((a, f) => a + f.rooms.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Rooms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-2xl font-bold mt-1">
                {hostel.floors.reduce((a, f) => a + f.rooms.reduce((r, room) => r + room.students.length, 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Students</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Floor Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Floors & Rooms</h2>
          <Dialog open={isAddFloorOpen} onOpenChange={setIsAddFloorOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Floor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Floor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Floor Number</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 1"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddFloor} className="w-full">Add Floor</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Floors Accordion */}
        {hostel.floors.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No floors added yet. Add your first floor to start adding rooms.</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {hostel.floors
              .sort((a, b) => a.floorNumber - b.floorNumber)
              .map(floor => (
                <AccordionItem key={floor.id} value={floor.id} className="bg-background rounded-lg border">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Floor {floor.floorNumber}</span>
                      <Badge variant="secondary">{floor.rooms.length} rooms</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">
                        {floor.rooms.reduce((a, r) => a + r.students.length, 0)} students total
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAddRoom(floor.id)}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Room
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Delete this floor and all its rooms?')) {
                              deleteFloor(hostel.id, floor.id);
                              toast({ title: "Floor deleted" });
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {floor.rooms.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No rooms on this floor</p>
                    ) : (
                      <div className="space-y-3">
                        {floor.rooms.map(room => (
                          <Card key={room.id} className="bg-muted/50">
                            <CardHeader className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <DoorOpen className="w-4 h-4 text-primary" />
                                  <CardTitle className="text-base">Room {room.roomNumber}</CardTitle>
                                  <Badge variant={room.students.length >= room.capacity ? "destructive" : "outline"}>
                                    {room.students.length}/{room.capacity}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">₹{room.monthlyRent}/month</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={room.students.length >= room.capacity}
                                    onClick={() => openAddStudent(room.id, room.monthlyRent)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm('Delete this room?')) {
                                        deleteRoom(hostel.id, floor.id, room.id);
                                        toast({ title: "Room deleted" });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            {room.students.length > 0 && (
                              <CardContent className="py-2 px-4">
                                <div className="space-y-2">
                                  {room.students.map(student => {
                                    const status = getPaymentStatus(student.id);
                                    return (
                                      <div 
                                        key={student.id} 
                                        className="flex items-center justify-between py-2 px-3 rounded-md bg-background"
                                      >
                                        <div className="flex items-center gap-3">
                                          <Users className="w-4 h-4 text-muted-foreground" />
                                          <div>
                                            <p className="font-medium text-sm">{student.name}</p>
                                            <p className="text-xs text-muted-foreground">{student.phone}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant={status === 'paid' ? 'default' : 'outline'}
                                            className={status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}
                                            onClick={() => handlePaymentToggle(student.id, student.monthlyRent)}
                                          >
                                            <IndianRupee className="w-3 h-3 mr-1" />
                                            {status === 'paid' ? 'Paid' : `₹${student.monthlyRent}`}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() => {
                                              if (confirm(`Remove ${student.name}?`)) {
                                                deleteStudent(hostel.id, floor.id, room.id, student.id);
                                                toast({ title: "Student removed" });
                                              }
                                            }}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        )}

        {/* Add Room Dialog */}
        <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  placeholder="e.g., 101"
                  value={roomData.roomNumber}
                  onChange={(e) => setRoomData(prev => ({ ...prev, roomNumber: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 3"
                    value={roomData.capacity}
                    onChange={(e) => setRoomData(prev => ({ ...prev, capacity: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rent (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g., 5000"
                    value={roomData.monthlyRent}
                    onChange={(e) => setRoomData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleAddRoom} className="w-full">Add Room</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Full name"
                  value={studentData.name}
                  onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  placeholder="Mobile number"
                  value={studentData.phone}
                  onChange={(e) => setStudentData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={studentData.email}
                  onChange={(e) => setStudentData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  placeholder="Parent/Guardian number (optional)"
                  value={studentData.emergencyContact}
                  onChange={(e) => setStudentData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Rent (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={studentData.monthlyRent}
                  onChange={(e) => setStudentData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full">Add Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default HostelDetail;
