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
import { Building2, Plus, ArrowLeft, Trash2, Layers, DoorOpen, Users, IndianRupee, Pencil, MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RoomCard } from '@/components/RoomCard';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

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
    memberCount: '',
    aadharNumber: '',
    permanentAddress: '',
    occupation: '',
    workAddress: '',
    fatherName: '',
    motherName: '',
    parentPhone: ''
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
      <MainLayout>
        <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0f1a] text-white">
          <Card className="bg-[#0f1f3a] border-white/5 p-12 text-center max-w-sm shadow-2xl">
            <Building2 className="w-16 h-16 mx-auto mb-6 text-gray-600" />
            <h2 className="text-xl font-bold mb-2">Hostel Not Found</h2>
            <p className="text-gray-400 mb-8">The property you are looking for doesn't exist or was removed.</p>
            <Button onClick={() => navigate('/hostels')} className="w-full bg-blue-600 hover:bg-blue-700">
              Return to Portfolio
            </Button>
          </Card>
        </div>
      </MainLayout>
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
      if (!roomData.wing.trim() || !roomData.hallName.trim() || !roomData.hallCapacity || !roomData.numberOfRooms) {
        toast({ title: "Please fill all section fields", variant: "destructive" });
        return;
      }

      addRoom(hostel.id, selectedFloorId, {
        roomNumber: roomData.hallName,
        capacity: parseInt(roomData.hallCapacity),
        monthlyRent: parseInt(roomData.numberOfRooms),
        roomType: 'section',
        occupancyType: roomData.occupancyType as 'students' | 'family',
        wing: roomData.wing
      });
    } else {
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

    const floor = hostel.floors.find(f => {
      const room = findRoom(f.rooms);
      return room !== null;
    });

    if (!floor) {
      toast({ title: "Error: Floor not found", variant: "destructive" });
      return;
    }

    const joinDate = new Date(studentData.joinDate);
    let nextPaymentDue: Date;

    if (studentData.paymentCycle === 'custom') {
      const customDays = parseInt(studentData.customDays);
      nextPaymentDue = new Date(joinDate);
      nextPaymentDue.setDate(nextPaymentDue.getDate() + customDays);
    } else {
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
      memberCount: parseInt(studentData.memberCount) || 1,
      aadharNumber: studentData.aadharNumber,
      permanentAddress: studentData.permanentAddress,
      occupation: studentData.occupation,
      workAddress: studentData.workAddress,
      fatherName: studentData.fatherName,
      motherName: studentData.motherName,
      parentPhone: studentData.parentPhone
    });
    setStudentData({
      name: '', phone: '', email: '', emergencyContact: '', monthlyRent: '',
      joinDate: new Date().toISOString().split('T')[0],
      paymentCycle: 'monthly',
      customDays: '',
      memberCount: '',
      aadharNumber: '',
      permanentAddress: '',
      occupation: '',
      workAddress: '',
      fatherName: '',
      motherName: '',
      parentPhone: ''
    });
    setIsAddStudentOpen(false);
    toast({ title: "Occupant added successfully!" });
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
    setRoomData(prev => ({ ...prev, roomType: 'room' }));
    setIsAddRoomOpen(true);
  };

  const openAddSubRoom = (parentId: string) => {
    const findRoomAndFloor = (id: string): { room: any, floor: any } | null => {
      for (const floor of hostel.floors) {
        const room = floor.rooms.find(r => r.id === id);
        if (room) return { room, floor };
      }
      return null;
    };

    const result = findRoomAndFloor(parentId);
    if (result) {
      setSelectedFloorId(result.floor.id);
      setSelectedParentId(parentId);
      setRoomData(prev => ({
        ...prev,
        roomType: 'room',
        occupancyType: result.room.occupancyType
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

  const countStudentsInRoom = (room: any): number => {
    let count = room.students?.length || 0;
    if (room.subRooms && room.subRooms.length > 0) {
      count += room.subRooms.reduce((acc: number, subRoom: any) => acc + countStudentsInRoom(subRoom), 0);
    }
    return count;
  };

  const countFamilyMembers = (room: any): number => {
    let count = 0;
    count += room.students?.filter((s: any) => room.occupancyType === 'family' || (s.memberCount > 1)).length || 0;
    if (room.subRooms && room.subRooms.length > 0) {
      count += room.subRooms.reduce((acc: number, subRoom: any) => acc + countFamilyMembers(subRoom), 0);
    }
    return count;
  };

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
    <MainLayout>
      <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
        {/* Header - Desktop */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/hostels')} className="text-gray-400 hover:text-white hover:bg-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                  {hostel.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-500 text-xs mt-1 uppercase font-bold tracking-tight">
                  <MapPin className="w-3 h-3 text-red-500/70" /> {hostel.address}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={openEditHostel} className="border-gray-700 bg-transparent text-gray-300 hover:text-white hover:bg-white/5 font-bold">
                <Pencil className="w-4 h-4 mr-2" /> Edit Property
              </Button>
              <Button onClick={() => setIsAddFloorOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                <Plus className="w-4 h-4" /> Add Floor
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{hostel.name}</h1>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Asset Blueprint</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddFloorOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 rounded-lg">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-tight px-1">
            <MapPin className="w-3 h-3 text-red-500" /> {hostel.address}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-[#0f1f3a] border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <Layers className="w-10 h-10 text-blue-400" />
                </div>
                <CardContent className="p-4 md:p-6 relative z-10">
                  <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Levels</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{hostel.floors.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1f3a] border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <DoorOpen className="w-10 h-10 text-emerald-400" />
                </div>
                <CardContent className="p-4 md:p-6 relative z-10">
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Rooms</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {hostel.floors.reduce((a, f) => a + f.rooms.length, 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1f3a] border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-purple-400" />
                </div>
                <CardContent className="p-4 md:p-6 relative z-10">
                  <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest">Students</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    {hostel.floors.reduce((a, f) => a + f.rooms.reduce((r, room) => r + countStudentsInRoom(room), 0), 0)}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#0f1f3a] border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                  <Users className="w-10 h-10 text-orange-400" />
                </div>
                <CardContent className="p-4 md:p-6 relative z-10">
                  <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest">Families</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1 text-orange-400">
                    {hostel.floors.reduce((a, f) => a + f.rooms.reduce((r, room) => r + countFamilyMembers(room), 0), 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm md:text-lg font-bold uppercase tracking-widest text-gray-500">Infrastructure</h2>
              </div>

              {hostel.floors.length === 0 ? (
                <Card className="bg-[#0f1f3a] border-dashed border-white/5 shadow-2xl">
                  <CardContent className="py-20 text-center">
                    <div className="bg-blue-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Layers className="w-10 h-10 text-blue-500 opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Initialize Floor Plan</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mb-8">This property doesn't have any levels yet. Add the ground floor to start mapping rooms.</p>
                    <Button onClick={() => setIsAddFloorOpen(true)} className="bg-blue-600">Add First Floor</Button>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {hostel.floors
                    .sort((a, b) => a.floorNumber - b.floorNumber)
                    .map(floor => (
                      <AccordionItem key={floor.id} value={floor.id} className="bg-[#0f1f3a] rounded-xl border-white/5 overflow-hidden shadow-lg border">
                        <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-white/5 group transition-all">
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-data-[state=open]:bg-blue-500 group-data-[state=open]:text-white transition-all">
                              <span className="font-bold">{floor.floorNumber}</span>
                            </div>
                            <div>
                              <p className="font-bold text-white text-lg">Level {floor.floorNumber}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                  <DoorOpen className="w-3 h-3" /> {floor.rooms.length} Units
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {floor.rooms.reduce((a, r) => a + countStudentsInRoom(r), 0)} Residents
                                </span>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6 pt-2">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pt-4 border-t border-white/5">
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 font-bold h-9 px-4 rounded-lg" onClick={() => openAddRoom(floor.id)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Unit
                              </Button>
                              <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-gray-500 hover:text-white border border-white/5 hover:bg-white/5" onClick={() => openEditFloor(floor)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 text-gray-500 hover:text-red-400 border border-white/5 hover:bg-red-500/5"
                                onClick={() => {
                                  if (confirm('Delete this level and all its units?')) {
                                    deleteFloor(hostel.id, floor.id);
                                    toast({ title: "Level removed" });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {floor.rooms.map(room => (
                              <RoomCard
                                key={room.id}
                                room={room}
                                hostelId={hostel.id}
                                floorId={floor.id}
                                onAddStudent={openAddStudent}
                                onDeleteRoom={deleteRoom}
                                onDeleteStudent={deleteStudent}
                                onStudentClick={handleStudentClick}
                                onEditStudent={openEditStudent}
                                onEditRoom={openEditRoom}
                                onAddSubRoom={openAddSubRoom}
                                toast={toast}
                              />
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modern Dialogs */}
      <Dialog open={isAddFloorOpen} onOpenChange={setIsAddFloorOpen}>
        <DialogContent className="bg-[#0f1f3a] border-gray-700 text-white">
          <DialogHeader><DialogTitle>Map New Level</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Floor Number</Label>
              <Input type="number" min="0" placeholder="e.g. 2" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} className="bg-gray-800 border-gray-700" />
            </div>
            <Button onClick={handleAddFloor} className="w-full bg-blue-600 hover:bg-blue-700">Add Floor to Blueprint</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="bg-[#0f1f3a] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedParentId ? 'Configure Sub-Unit' : 'Initialize Unit/Section'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Building Component Type</Label>
              <Select value={roomData.roomType} onValueChange={(value) => setRoomData(prev => ({ ...prev, roomType: value }))} disabled={!!selectedParentId}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0f1f3a] border-gray-700 text-white">
                  <SelectItem value="room">Individual Room</SelectItem>
                  <SelectItem value="section">Complex Section (Hall + Sub-rooms)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Occupancy Allocation</Label>
              <Select value={roomData.occupancyType} onValueChange={(value) => setRoomData(prev => ({ ...prev, occupancyType: value }))}>
                <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#0f1f3a] border-gray-700 text-white">
                  <SelectItem value="students">👨‍🎓 Academic Students</SelectItem>
                  <SelectItem value="family">👨‍👩‍👧‍👦 Private Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {roomData.roomType === 'section' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Wing/Area</Label><Input placeholder="A-Wing" value={roomData.wing} onChange={(e) => setRoomData({ ...roomData, wing: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                  <div className="space-y-2"><Label>Hall Name</Label><Input placeholder="East Hall" value={roomData.hallName} onChange={(e) => setRoomData({ ...roomData, hallName: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Total Pax</Label><Input type="number" value={roomData.hallCapacity} onChange={(e) => setRoomData({ ...roomData, hallCapacity: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                  <div className="space-y-2"><Label>Room Count</Label><Input type="number" value={roomData.numberOfRooms} onChange={(e) => setRoomData({ ...roomData, numberOfRooms: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2"><Label>Room Identifier</Label><Input placeholder="101" value={roomData.roomNumber} onChange={(e) => setRoomData({ ...roomData, roomNumber: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Capacity</Label><Input type="number" value={roomData.capacity} onChange={(e) => setRoomData({ ...roomData, capacity: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                  <div className="space-y-2"><Label>Monthly (₹)</Label><Input type="number" value={roomData.monthlyRent} onChange={(e) => setRoomData({ ...roomData, monthlyRent: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
                </div>
              </div>
            )}
            <Button onClick={handleAddRoom} className="w-full bg-blue-600 hover:bg-blue-700 font-bold">Initialize Unit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other dialogs kept for functionality but styled slightly for consistency */}
      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#0f1f3a] border-gray-700 text-white">
          <DialogHeader><DialogTitle>Register New Resident</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={studentData.name} onChange={(e) => setStudentData({ ...studentData, name: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input value={studentData.phone} onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
              <div className="space-y-2"><Label>Aadhar *</Label><Input value={studentData.aadharNumber} onChange={(e) => setStudentData({ ...studentData, aadharNumber: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
            </div>
            <div className="space-y-2"><Label>Join Date</Label><Input type="date" value={studentData.joinDate} onChange={(e) => setStudentData({ ...studentData, joinDate: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cycle</Label>
                <Select value={studentData.paymentCycle} onValueChange={(val) => setStudentData({ ...studentData, paymentCycle: val })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f1f3a] border-gray-700 text-white">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Rent (₹)</Label><Input type="number" value={studentData.monthlyRent} onChange={(e) => setStudentData({ ...studentData, monthlyRent: e.target.value })} className="bg-gray-800 border-gray-700" /></div>
            </div>
            <Button onClick={handleAddStudent} className="w-full bg-blue-600 hover:bg-blue-700 font-bold">Complete Registration</Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default HostelDetail;
