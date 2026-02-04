import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, ArrowLeft, Trash2, Layers, DoorOpen, Users, IndianRupee, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RoomCard } from '@/components/RoomCard';

const HostelDetail = () => {
  const { hostelId } = useParams();
  const navigate = useNavigate();
  const { hostels, addFloor, updateFloor, deleteFloor, addRoom, deleteRoom, addStudent, deleteStudent, updateStudent, updateRoom, updateHostel, payments, recordPayment } = useHostel();
  const { toast } = useToast();

  const hostel = hostels.find(h => h.id === hostelId);

  const [isAddFloorOpen, setIsAddFloorOpen] = useState(false);
  const [floorNumber, setFloorNumber] = useState('');

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [roomData, setRoomData] = useState({
    roomNumber: '',
    capacity: '',
    monthlyRent: '',
    roomType: 'room', // 'room' or 'section'
    occupancyType: 'students', // 'students' or 'family'
    wing: '',
    hallName: '',
    hallCapacity: '',
    numberOfRooms: ''
  });

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [studentData, setStudentData] = useState({
    name: '', phone: '', email: '', emergencyContact: '', monthlyRent: '',
    joinDate: new Date().toISOString().split('T')[0],
    paymentCycle: 'monthly',
    customDays: '',
    memberCount: ''
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);

  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editStudentData, setEditStudentData] = useState({ name: '', phone: '', email: '', emergencyContact: '', monthlyRent: '', memberCount: '' });

  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editRoomData, setEditRoomData] = useState({ roomNumber: '', capacity: '', monthlyRent: '', occupancyType: '' });

  const [editingHostel, setEditingHostel] = useState(false);
  const [editHostelData, setEditHostelData] = useState({ name: '', address: '' });

  const [isEditFloorOpen, setIsEditFloorOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<any>(null);
  const [newFloorNumber, setNewFloorNumber] = useState('');

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

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
    if (roomData.roomType === 'section') {
      // Validate section fields
      if (!roomData.wing.trim() || !roomData.hallName.trim() || !roomData.hallCapacity || !roomData.numberOfRooms) {
        toast({ title: "Please fill all section fields", variant: "destructive" });
        return;
      }

      addRoom(hostel.id, selectedFloorId, {
        roomNumber: roomData.hallName,
        capacity: parseInt(roomData.hallCapacity),
        monthlyRent: parseInt(roomData.numberOfRooms), // Temporarily using this field for number of rooms
        roomType: 'section',
        occupancyType: roomData.occupancyType as 'students' | 'family',
        wing: roomData.wing
      });
    } else {
      // Regular room validation
      if (!roomData.roomNumber.trim() || !roomData.capacity || !roomData.monthlyRent) {
        toast({ title: "Please fill all fields", variant: "destructive" });
        return;
      }

      addRoom(hostel.id, selectedFloorId, {
        roomNumber: roomData.roomNumber,
        capacity: parseInt(roomData.capacity),
        monthlyRent: parseInt(roomData.monthlyRent),
        occupancyType: roomData.occupancyType as 'students' | 'family',
        parentRoomId: selectedParentId || undefined
      });
    }

    setRoomData({
      roomNumber: '',
      capacity: '',
      monthlyRent: '',
      roomType: 'room',
      occupancyType: 'students',
      wing: '',
      hallName: '',
      hallCapacity: '',
      numberOfRooms: ''
    });
    setSelectedParentId(null);
    setIsAddRoomOpen(false);
    toast({ title: roomData.roomType === 'section' ? "Section added successfully!" : "Room added successfully!" });
  };

  const handleAddStudent = () => {
    if (!studentData.name.trim() || !studentData.monthlyRent) {
      toast({ title: "Please fill required fields (Name & Rent)", variant: "destructive" });
      return;
    }

    if (studentData.paymentCycle === 'custom' && (!studentData.customDays || parseInt(studentData.customDays) <= 0)) {
      toast({ title: "Please enter valid custom days", variant: "destructive" });
      return;
    }

    // Recursive function to find room in hierarchy
    const findRoom = (rooms: any[]): any => {
      for (const room of rooms) {
        if (room.id === selectedRoomId) return room;
        if (room.subRooms && room.subRooms.length > 0) {
          const found = findRoom(room.subRooms);
          if (found) return found;
        }
      }
      return null;
    };

    // Find the floor containing the room
    const floor = hostel.floors.find(f => {
      const room = findRoom(f.rooms);
      return room !== null;
    });

    if (!floor) {
      toast({ title: "Error: Floor not found", variant: "destructive" });
      return;
    }

    // Calculate next payment due date
    const joinDate = new Date(studentData.joinDate);
    let nextPaymentDue: Date;

    if (studentData.paymentCycle === 'custom') {
      const customDays = parseInt(studentData.customDays);
      nextPaymentDue = new Date(joinDate);
      nextPaymentDue.setDate(nextPaymentDue.getDate() + customDays);
    } else {
      // Monthly cycle - add 1 month
      nextPaymentDue = new Date(joinDate);
      nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
    }

    addStudent(hostel.id, floor.id, selectedRoomId, {
      name: studentData.name,
      phone: studentData.phone,
      email: studentData.email || undefined,
      emergencyContact: studentData.emergencyContact || undefined,
      joinDate: studentData.joinDate,
      monthlyRent: parseInt(studentData.monthlyRent),
      paymentCycle: studentData.paymentCycle as 'monthly' | 'custom',
      customDays: studentData.paymentCycle === 'custom' ? parseInt(studentData.customDays) : undefined,
      nextPaymentDue: nextPaymentDue.toISOString(),
      memberCount: parseInt(studentData.memberCount) || 1
    });
    setStudentData({
      name: '', phone: '', email: '', emergencyContact: '', monthlyRent: '',
      joinDate: new Date().toISOString().split('T')[0],
      paymentCycle: 'monthly',
      customDays: '',
      memberCount: ''
    });
    setIsAddStudentOpen(false);
    toast({ title: "Occupant added successfully!" });
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

  const openEditFloor = (floor: any) => {
    setEditingFloor(floor);
    setNewFloorNumber(floor.floorNumber.toString());
    setIsEditFloorOpen(true);
  };

  const handleEditFloor = async () => {
    if (!editingFloor || !newFloorNumber) return;
    const num = parseInt(newFloorNumber);
    if (isNaN(num)) {
      toast({ title: "Invalid floor number", variant: "destructive" });
      return;
    }
    if (hostel.floors.some(f => f.floorNumber === num && f.id !== editingFloor.id)) {
      toast({ title: "This floor number already exists", variant: "destructive" });
      return;
    }
    try {
      await updateFloor(hostel.id, editingFloor.id, num);
      setIsEditFloorOpen(false);
      setEditingFloor(null);
      toast({ title: "Floor updated successfully" });
    } catch (error) {
      toast({ title: "Failed to update floor", variant: "destructive" });
    }
  };

  const openAddRoom = (floorId: string) => {
    setSelectedFloorId(floorId);
    setSelectedParentId(null);
    setRoomData(prev => ({ ...prev, roomType: 'room' })); // Default
    setIsAddRoomOpen(true);
  };

  const openAddSubRoom = (parentId: string) => {
    // Find the room and its floor
    // Helper to find room by ID
    const findRoomAndFloor = (id: string): { room: any, floor: any } | null => {
      for (const floor of hostel.floors) {
        const room = floor.rooms.find(r => r.id === id);
        if (room) return { room, floor };
        // Check subrooms if needed (though we usually add to top-level sections)
        // If we support nested sections, we'd need recursion here.
        // Assuming sections are top-level rooms for now or just searching flat list of that floor
        // But room here is the section.
      }
      return null;
    };

    const result = findRoomAndFloor(parentId);
    if (result) {
      setSelectedFloorId(result.floor.id);
      setSelectedParentId(parentId);
      setRoomData(prev => ({
        ...prev,
        roomType: 'room', // Enforce adding a room, not another section
        occupancyType: result.room.occupancyType // Inherit occupancy type
      }));
      setIsAddRoomOpen(true);
    }
  };

  const openAddStudent = (roomId: string, defaultRent: number) => {
    setSelectedRoomId(roomId);
    setStudentData(prev => ({ ...prev, monthlyRent: defaultRent.toString() }));
    setIsAddStudentOpen(true);
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsStudentDetailsOpen(true);
  };

  // Recursive function to count all students in a room and its sub-rooms
  const countStudentsInRoom = (room: any): number => {
    let count = room.students?.length || 0;
    if (room.subRooms && room.subRooms.length > 0) {
      count += room.subRooms.reduce((acc: number, subRoom: any) => acc + countStudentsInRoom(subRoom), 0);
    }
    return count;
  };

  // Helper to count family members recursively
  const countFamilyMembers = (room: any): number => {
    let count = 0;
    // Count as family if room is 'family' type OR if the occupant has > 1 members recorded
    count += room.students?.filter((s: any) => room.occupancyType === 'family' || (s.memberCount > 1)).length || 0;

    // Recursive check for sub-rooms
    if (room.subRooms && room.subRooms.length > 0) {
      count += room.subRooms.reduce((acc: number, subRoom: any) => acc + countFamilyMembers(subRoom), 0);
    }
    return count;
  };

  // Helper to count family rooms (designated space)
  const countFamilyRooms = (room: any): number => {
    let count = room.occupancyType === 'family' ? 1 : 0;
    if (room.subRooms?.length > 0) {
      count += room.subRooms.reduce((acc: number, subRoom: any) => acc + countFamilyRooms(subRoom), 0);
    }
    return count;
  };

  const openEditStudent = (student: any, hostelId: string, floorId: string) => {
    setEditingStudent({ ...student, hostelId, floorId });
    setEditStudentData({
      name: student.name,
      phone: student.phone,
      email: student.email || '',
      emergencyContact: student.emergencyContact || '',
      monthlyRent: student.monthlyRent.toString(),
      memberCount: (student.memberCount || 1).toString()
    });
  };

  const handleEditStudent = async () => {
    if (!editStudentData.name.trim() || !editStudentData.phone.trim() || !editStudentData.monthlyRent) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    try {
      await updateStudent(editingStudent.hostelId, editingStudent.floorId, editingStudent.roomId, editingStudent.id, {
        name: editStudentData.name,
        phone: editStudentData.phone,
        email: editStudentData.email || undefined,
        emergencyContact: editStudentData.emergencyContact || undefined,
        monthlyRent: parseInt(editStudentData.monthlyRent),
        memberCount: parseInt(editStudentData.memberCount) || 1
      });
      setEditingStudent(null);
      toast({ title: "Student updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update student", variant: "destructive" });
    }
  };

  const openEditRoom = (room: any, hostelId: string, floorId: string) => {
    setEditingRoom({ ...room, hostelId, floorId });
    setEditRoomData({
      roomNumber: room.roomNumber,
      capacity: room.capacity.toString(),
      monthlyRent: room.monthlyRent.toString(),
      occupancyType: room.occupancyType || 'students'
    });
  };

  const handleEditRoom = async () => {
    if (!editRoomData.roomNumber.trim() || !editRoomData.capacity || !editRoomData.monthlyRent) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await updateRoom(editingRoom.hostelId, editingRoom.floorId, editingRoom.id, {
        roomNumber: editRoomData.roomNumber,
        capacity: parseInt(editRoomData.capacity),
        monthlyRent: parseInt(editRoomData.monthlyRent),
        occupancyType: editRoomData.occupancyType as 'students' | 'family'
      });
      setEditingRoom(null);
      toast({ title: "Room updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update room", variant: "destructive" });
    }
  };

  const openEditHostel = () => {
    setEditingHostel(true);
    setEditHostelData({
      name: hostel.name,
      address: hostel.address
    });
  };

  const handleEditHostel = async () => {
    if (!editHostelData.name.trim() || !editHostelData.address.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await updateHostel(hostel.id, {
        name: editHostelData.name,
        address: editHostelData.address
      });
      setEditingHostel(false);
      toast({ title: "Hostel updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update hostel", variant: "destructive" });
    }
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
          <Button variant="outline" size="sm" onClick={openEditHostel}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Hostel
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                {hostel.floors.reduce((a, f) => a + f.rooms.reduce((r, room) => r + countStudentsInRoom(room), 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Students (Heads)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="relative inline-block">
                <Users className="w-5 h-5 mx-auto text-orange-500" />
                <span className="absolute -top-1 -right-2 text-[10px] bg-orange-100 text-orange-600 px-1 rounded-full border border-orange-200">Family</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-orange-600">
                {hostel.floors.reduce((a, f) => a + f.rooms.reduce((r, room) => r + countFamilyMembers(room), 0), 0)}
              </p>
              <p className="text-xs text-orange-600">Families</p>
              <p className="text-[10px] text-orange-400 mt-1">
                {hostel.floors.reduce((a, f) => a + f.rooms.reduce((r, room) => r + countFamilyRooms(room), 0), 0)} Rooms Designated
              </p>
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
                        {floor.rooms.reduce((a, r) => a + countStudentsInRoom(r), 0)} students total
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAddRoom(floor.id)}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Room
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditFloor(floor)}>
                          <Pencil className="w-3 h-3" />
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
                          <RoomCard
                            key={room.id}
                            room={room}
                            hostelId={hostel.id}
                            floorId={floor.id}
                            onAddStudent={openAddStudent}
                            onDeleteRoom={deleteRoom}
                            onDeleteStudent={deleteStudent}
                            onStudentClick={handleStudentClick} onEditStudent={openEditStudent}
                            onEditRoom={openEditRoom} onAddSubRoom={openAddSubRoom} toast={toast}
                          />
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedParentId ? 'Add Sub-Room' : 'Add Room/Section'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Room Type Selection */}
              <div className="space-y-2">
                <Label>Room Type *</Label>
                <Select
                  value={roomData.roomType}
                  onValueChange={(value) => setRoomData(prev => ({ ...prev, roomType: value }))}
                  disabled={!!selectedParentId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">Simple Room</SelectItem>
                    <SelectItem value="section">Section (with Hall & Rooms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Occupancy Type Selection */}
              <div className="space-y-2">
                <Label>Occupancy Type *</Label>
                <Select
                  value={roomData.occupancyType}
                  onValueChange={(value) => setRoomData(prev => ({ ...prev, occupancyType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Who can occupy?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">👨‍🎓 Students</SelectItem>
                    <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {roomData.occupancyType === 'family'
                    ? 'This room is designated for families. You can track family count.'
                    : 'This room is designated for individual students.'}
                </p>
              </div>

              {roomData.roomType === 'section' ? (
                // Section Fields
                <>
                  <div className="space-y-2">
                    <Label>Section/Wing Name *</Label>
                    <Input
                      placeholder="e.g., A-Wing, B-Wing, Part 1"
                      value={roomData.wing}
                      onChange={(e) => setRoomData(prev => ({ ...prev, wing: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Hall Name *</Label>
                    <Input
                      placeholder="e.g., Main Hall, Common Hall"
                      value={roomData.hallName}
                      onChange={(e) => setRoomData(prev => ({ ...prev, hallName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{roomData.occupancyType === 'family' ? 'Family Capacity *' : 'Student Capacity *'}</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder={roomData.occupancyType === 'family' ? "e.g., 2 Families" : "e.g., 10 Students"}
                      value={roomData.hallCapacity}
                      onChange={(e) => setRoomData(prev => ({ ...prev, hallCapacity: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      {roomData.occupancyType === 'family'
                        ? 'Maximum number of families this hall can accommodate'
                        : 'Maximum number of students this hall can accommodate'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Number of Sub-Rooms *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 3"
                      value={roomData.numberOfRooms}
                      onChange={(e) => setRoomData(prev => ({ ...prev, numberOfRooms: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">Number of individual rooms in this section</p>
                  </div>
                </>
              ) : (
                // Simple Room Fields
                <>
                  <div className="space-y-2">
                    <Label>Room Number *</Label>
                    <Input
                      placeholder="e.g., 101"
                      value={roomData.roomNumber}
                      onChange={(e) => setRoomData(prev => ({ ...prev, roomNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{roomData.occupancyType === 'family' ? 'Family Count (Max) *' : 'Student Capacity *'}</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 1"
                        value={roomData.capacity}
                        onChange={(e) => setRoomData(prev => ({ ...prev, capacity: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Rent (₹) *</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g., 5000"
                        value={roomData.monthlyRent}
                        onChange={(e) => setRoomData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button onClick={handleAddRoom} className="w-full">
                {roomData.roomType === 'section' ? 'Add Section' : 'Add Room'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Floor Dialog */}
        <Dialog open={isEditFloorOpen} onOpenChange={setIsEditFloorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Floor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Floor Number</Label>
                <Input
                  type="number"
                  min="0"
                  value={newFloorNumber}
                  onChange={(e) => setNewFloorNumber(e.target.value)}
                />
              </div>
              <Button onClick={handleEditFloor} className="w-full">Update Floor</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Student/Occupant Dialog */}
        <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Occupant</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name / Family Head Name *</Label>
                <Input
                  placeholder="Full name"
                  value={studentData.name}
                  onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Show Member Count for Family Rooms */}
              {(() => {
                const flatRooms = hostel.floors.flatMap(f => f.rooms.concat(f.rooms.flatMap(r => r.subRooms || [])));
                const r = flatRooms.find(room => room.id === selectedRoomId);
                if (r?.occupancyType === 'family') {
                  return (
                    <div className="space-y-2">
                      <Label>Total Family Members *</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 4"
                        value={studentData.memberCount}
                        onChange={(e) => setStudentData(prev => ({ ...prev, memberCount: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Include Head, Spouse, Children</p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-2">
                <Label>Phone (Optional for Family)</Label>
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
                <Label>Emergency Contact / Spouse Number</Label>
                <Input
                  placeholder="Optional"
                  value={studentData.emergencyContact}
                  onChange={(e) => setStudentData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Join Date *</Label>
                <Input
                  type="date"
                  value={studentData.joinDate}
                  onChange={(e) => setStudentData(prev => ({ ...prev, joinDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Cycle *</Label>
                <Select
                  value={studentData.paymentCycle}
                  onValueChange={(value) => setStudentData(prev => ({ ...prev, paymentCycle: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                    <SelectItem value="custom">Custom Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {studentData.paymentCycle === 'custom' && (
                <div className="space-y-2">
                  <Label>Number of Days *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 10, 20, 45"
                    value={studentData.customDays}
                    onChange={(e) => setStudentData(prev => ({ ...prev, customDays: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Payment will be due after {studentData.customDays || '0'} days from join date
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Monthly Rent (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={studentData.monthlyRent}
                  onChange={(e) => setStudentData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full">Add Occupant</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Details Dialog */}
        <Dialog open={isStudentDetailsOpen} onOpenChange={setIsStudentDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{selectedStudent.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-muted-foreground w-32">Phone:</span>
                      <span>{selectedStudent.phone}</span>
                    </div>
                    {selectedStudent.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground w-32">Email:</span>
                        <span>{selectedStudent.email}</span>
                      </div>
                    )}
                    {selectedStudent.emergencyContact && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground w-32">Emergency:</span>
                        <span>{selectedStudent.emergencyContact}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-muted-foreground w-32">Join Date:</span>
                      <span>{format(new Date(selectedStudent.joinDate), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-muted-foreground w-32">Monthly Rent:</span>
                      <span className="font-semibold text-primary">₹{selectedStudent.monthlyRent}</span>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  onClick={() => setIsStudentDetailsOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={editStudentData.name}
                onChange={(e) => setEditStudentData({ ...editStudentData, name: e.target.value })}
                placeholder="Student name"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={editStudentData.phone}
                onChange={(e) => setEditStudentData({ ...editStudentData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editStudentData.email}
                onChange={(e) => setEditStudentData({ ...editStudentData, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label>Emergency Contact</Label>
              <Input
                value={editStudentData.emergencyContact}
                onChange={(e) => setEditStudentData({ ...editStudentData, emergencyContact: e.target.value })}
                placeholder="Emergency contact number"
              />
            </div>
            <div>
              <Label>Monthly Rent *</Label>
              <Input
                type="number"
                value={editStudentData.monthlyRent}
                onChange={(e) => setEditStudentData({ ...editStudentData, monthlyRent: e.target.value })}
                placeholder="Monthly rent amount"
              />
            </div>

            {/* Show Member Count if it seems to be relevant (e.g. > 1 or just allow editing) */}
            <div>
              <Label>Family Member Count</Label>
              <Input
                type="number"
                min="1"
                value={editStudentData.memberCount}
                onChange={(e) => setEditStudentData({ ...editStudentData, memberCount: e.target.value })}
                placeholder="e.g. 4"
              />
              <p className="text-xs text-muted-foreground">Update if family size changes.</p>
            </div>
            <Button onClick={handleEditStudent} className="w-full">Update Student</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Room Number *</Label>
              <Input
                value={editRoomData.roomNumber}
                onChange={(e) => setEditRoomData({ ...editRoomData, roomNumber: e.target.value })}
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <Label>Capacity *</Label>
              <Input
                type="number"
                value={editRoomData.capacity}
                onChange={(e) => setEditRoomData({ ...editRoomData, capacity: e.target.value })}
                placeholder="e.g., 3"
                min="1"
              />
            </div>
            <div>
              <Label>Monthly Rent (₹) *</Label>
              <Input
                type="number"
                value={editRoomData.monthlyRent}
                onChange={(e) => setEditRoomData({ ...editRoomData, monthlyRent: e.target.value })}
                placeholder="e.g., 5000"
                min="0"
              />
            </div>
            <div>
              <Label>Occupancy Type</Label>
              <Select
                value={editRoomData.occupancyType}
                onValueChange={(value) => setEditRoomData({ ...editRoomData, occupancyType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Who can occupy?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">👨‍🎓 Students</SelectItem>
                  <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditRoom} className="w-full">Update Room</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Hostel Dialog */}
      <Dialog open={editingHostel} onOpenChange={setEditingHostel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hostel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Hostel Name *</Label>
              <Input
                value={editHostelData.name}
                onChange={(e) => setEditHostelData({ ...editHostelData, name: e.target.value })}
                placeholder="Hostel name"
              />
            </div>
            <div>
              <Label>Address *</Label>
              <Input
                value={editHostelData.address}
                onChange={(e) => setEditHostelData({ ...editHostelData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            <Button onClick={handleEditHostel} className="w-full">Update Hostel</Button>
          </div>
        </DialogContent>
      </Dialog>    </div>
  );
};

export default HostelDetail;
