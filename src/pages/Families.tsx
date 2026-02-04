import { useState, useMemo } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Users, Search, Phone, Building2, DoorOpen, IndianRupee, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

const Families = () => {
    const { hostels, payments, updateStudent, recordPayment } = useHostel();
    const { toast } = useToast();
    const [search, setSearch] = useState('');
    const [editingFamily, setEditingFamily] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        phone: '',
        email: '',
        emergencyContact: '',
        monthlyRent: 0,
        memberCount: 0
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

    // Filter only families (occupancyType === 'family' or memberCount > 1)
    const allFamilies = useMemo(() => {
        return allStudents.filter(s => s.occupancyType === 'family' || (s.memberCount && s.memberCount > 1));
    }, [allStudents]);

    const filteredFamilies = useMemo(() => {
        if (!search) return allFamilies;
        const lowerSearch = search.toLowerCase();
        return allFamilies.filter(s =>
            s.name.toLowerCase().includes(lowerSearch) ||
            s.phone.includes(search) ||
            s.hostelName.toLowerCase().includes(lowerSearch) ||
            s.roomNumber.toLowerCase().includes(lowerSearch)
        );
    }, [allFamilies, search]);

    const getPaymentStatus = (studentId: string) => {
        const payment = payments.find(p => p.studentId === studentId && p.month === currentMonth);
        return payment?.status || 'due';
    };

    // Stats
    const paidCount = filteredFamilies.filter(s => getPaymentStatus(s.id) === 'paid').length;
    const pendingCount = filteredFamilies.length - paidCount;

    const handlePaymentToggle = async (studentId: string, amount: number) => {
        const status = getPaymentStatus(studentId);
        try {
            if (status === 'paid') {
                // Mark as due (unpay)
                await recordPayment({
                    studentId,
                    amount,
                    month: currentMonth,
                    status: 'due'
                });
            } else {
                // Mark as paid
                await recordPayment({
                    studentId,
                    amount,
                    month: currentMonth,
                    status: 'paid',
                    paidDate: new Date().toISOString()
                });
            }
            toast({
                title: "Success",
                description: "Payment status updated"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update payment",
                variant: "destructive"
            });
        }
    };

    const openEditFamily = (student: any) => {
        setEditingFamily(student);
        setEditFormData({
            name: student.name,
            phone: student.phone,
            email: student.email || '',
            emergencyContact: student.emergencyContact || '',
            monthlyRent: student.monthlyRent,
            memberCount: student.memberCount || 1
        });
    };

    const handleEditFamily = async () => {
        if (!editingFamily) return;
        try {
            await updateStudent(
                'dummy-hostel', 'dummy-floor', 'dummy-room',
                editingFamily.id,
                {
                    name: editFormData.name,
                    phone: editFormData.phone,
                    email: editFormData.email,
                    emergencyContact: editFormData.emergencyContact,
                    monthlyRent: Number(editFormData.monthlyRent),
                    memberCount: Number(editFormData.memberCount)
                }
            );
            setEditingFamily(null);
            toast({
                title: "Success",
                description: "Family updated successfully"
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update family",
                variant: "destructive"
            });
        }
    };

    return (
        <MainLayout>
            <header className="bg-[#0f1f3a] border-b border-gray-700/50 sticky top-0 z-10 flex-shrink-0">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <MobileNav />
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-orange-500" />
                            <h1 className="text-xl font-bold text-white">Families</h1>
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
                            placeholder="Search by head name, phone, hostel, or room..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-[#0f1f3a] border-gray-700 text-white placeholder:text-gray-500"
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-[#0f1f3a] border-gray-700/50">
                            <CardContent className="pt-4 text-center">
                                <p className="text-2xl font-bold text-white">{filteredFamilies.length}</p>
                                <p className="text-xs text-gray-400">Total Families</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-950/30 border-green-700/50">
                            <CardContent className="pt-4 text-center">
                                <p className="text-2xl font-bold text-green-400">{paidCount}</p>
                                <p className="text-xs text-green-500">Rent Paid Families</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-orange-950/30 border-orange-700/50">
                            <CardContent className="pt-4 text-center">
                                <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
                                <p className="text-xs text-orange-500">Rent Pending Families</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Families Table */}
                    <Card className="bg-[#0f1f3a] border-gray-700/50">
                        <CardHeader className="border-b border-gray-700/50">
                            <CardTitle className="text-lg text-white">
                                {search ? `Found ${filteredFamilies.length} families` : `${allFamilies.length} Families`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredFamilies.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>{search ? 'No families match your search' : 'No families added yet'}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-700 hover:bg-gray-800/50">
                                                <TableHead className="text-gray-400">Family Head</TableHead>
                                                <TableHead className="text-gray-400">Phone</TableHead>
                                                <TableHead className="text-gray-400">Location</TableHead>
                                                <TableHead className="text-gray-400">Members</TableHead>
                                                <TableHead className="text-gray-400">Rent</TableHead>
                                                <TableHead className="text-right text-gray-400">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredFamilies.map(family => {
                                                const status = getPaymentStatus(family.id);
                                                return (
                                                    <TableRow key={family.id} className="border-gray-700 hover:bg-gray-800/50">
                                                        <TableCell className="font-medium text-white">{family.name}</TableCell>
                                                        <TableCell>
                                                            <a href={`tel:${family.phone}`} className="flex items-center gap-1 text-orange-400 hover:text-orange-300">
                                                                <Phone className="w-3 h-3" />
                                                                {family.phone}
                                                            </a>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                <Building2 className="w-3 h-3" />
                                                                <span className="whitespace-nowrap">{family.hostelName}</span>
                                                                <span className="text-gray-600">•</span>
                                                                <DoorOpen className="w-3 h-3" />
                                                                <span className="whitespace-nowrap">Room {family.roomNumber}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {family.memberCount || 1}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">₹{family.monthlyRent}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => openEditFamily(family)}
                                                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant={status === 'paid' ? 'default' : 'outline'}
                                                                    className={status === 'paid'
                                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                        : 'border-green-600 text-green-500 hover:bg-green-900/30'}
                                                                    onClick={() => handlePaymentToggle(family.id, family.monthlyRent)}
                                                                >
                                                                    <IndianRupee className="w-3 h-3 mr-1" />
                                                                    {status === 'paid' ? 'Paid' : 'Mark Paid'}
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

                {/* Edit Family Dialog */}
                <Dialog open={!!editingFamily} onOpenChange={(open) => !open && setEditingFamily(null)}>
                    <DialogContent className="bg-[#1a2332] border-gray-700 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-white">Edit Family Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-gray-300">Head Name *</Label>
                                <Input
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="Family head name"
                                    className="bg-[#0f1f3a] border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300">Phone *</Label>
                                <Input
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    placeholder="Phone number"
                                    className="bg-[#0f1f3a] border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300">Members Count</Label>
                                <Input
                                    type="number"
                                    value={editFormData.memberCount}
                                    onChange={(e) => setEditFormData({ ...editFormData, memberCount: Number(e.target.value) })}
                                    placeholder="Count"
                                    className="bg-[#0f1f3a] border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300">Monthly Rent *</Label>
                                <Input
                                    type="number"
                                    value={editFormData.monthlyRent}
                                    onChange={(e) => setEditFormData({ ...editFormData, monthlyRent: Number(e.target.value) })}
                                    placeholder="Monthly rent amount"
                                    className="bg-[#0f1f3a] border-gray-600 text-white"
                                />
                            </div>
                            <Button onClick={handleEditFamily} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Update Family</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
};

export default Families;
