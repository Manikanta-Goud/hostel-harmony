
import { useState, useMemo } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building2, Layers, Users, DoorOpen, ArrowLeft, User } from 'lucide-react';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';
import { StudentProfileDialog } from '@/components/StudentProfileDialog';
import { Pencil, Trash2 } from 'lucide-react';

const Rooms = () => {
    const { hostels } = useHostel();
    const [search, setSearch] = useState('');
    const [viewStack, setViewStack] = useState<any[]>([]); // Stack of rooms we have drilled into
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // 1. Get all top-level items (roots) from all hostels/floors
    const rootItems = useMemo(() => {
        const items: any[] = [];
        hostels.forEach(hostel => {
            hostel.floors.forEach(floor => {
                floor.rooms.forEach(room => {
                    items.push({
                        ...room,
                        hostelName: hostel.name,
                        hostelId: hostel.id,
                        floorId: floor.id,
                        floorNumber: floor.floorNumber,
                        // Tag root items
                        isRoot: true
                    });
                });
            });
        });
        return items;
    }, [hostels]);

    // 2. Flatten EVERYTHING for search purposes (so search works globally)
    const allSearchableItems = useMemo(() => {
        const items: any[] = [];
        const traverse = (room: any, hostelName: string, hostelId: string, floorId: string, floorNumber: number, partName: string | null = null) => {
            items.push({
                ...room,
                hostelName,
                hostelId,
                floorId,
                floorNumber,
                part: partName
            });
            if (room.subRooms) {
                room.subRooms.forEach((sub: any) => traverse(sub, hostelName, hostelId, floorId, floorNumber, room.roomNumber));
            }
        };

        hostels.forEach(h => {
            h.floors.forEach(f => {
                f.rooms.forEach(r => traverse(r, h.name, h.id, f.id, f.floorNumber));
            });
        });
        return items;
    }, [hostels]);

    // 3. Determine what to display
    const currentViewItems = useMemo(() => {
        // If Searching, show global search results (flat)
        if (search) {
            const lowerSearch = search.toLowerCase();
            return allSearchableItems.filter(item =>
                item.hostelName?.toLowerCase().includes(lowerSearch) ||
                item.roomNumber?.toLowerCase().includes(lowerSearch) ||
                (item.part && item.part.toLowerCase().includes(lowerSearch))
            );
        }

        // If Browsing
        const currentParent = viewStack[viewStack.length - 1];

        if (!currentParent) {
            // Root View
            return rootItems;
        } else {
            // Inside a Room/Part looking at children
            // We only show subRooms here. If it's a leaf room, we handle that in the render (Student View).
            if (currentParent.subRooms && currentParent.subRooms.length > 0) {
                return currentParent.subRooms.map((sub: any) => ({
                    ...sub,
                    hostelName: currentParent.hostelName,
                    hostelId: currentParent.hostelId,
                    floorId: currentParent.floorId,
                    floorNumber: currentParent.floorNumber,
                    part: currentParent.roomNumber
                }));
            }
            return []; // Should be student view if no subrooms
        }
    }, [search, viewStack, rootItems, allSearchableItems]);

    const handleCardClick = (item: any) => {
        // If we are searching, we might jump to context context, but simpler to just strictly drill down 
        // IF the item has subrooms OR students.
        // If searching, we reset search to enter "details"? Or maybe just expand?
        // Let's stick to simple navigation: Push to stack.

        // Note: If searching, 'item' carries its context.
        if (search) {
            setSearch(''); // Clear search to enter "browsing mode" for this item? 
            // Actually, if we click a leaf result in search, we want to see students.
            // If we click a Part in search, we want to see its subrooms.
            // So we push to stack.
        }
        setViewStack(prev => [...prev, item]);
    };

    const handleBack = () => {
        setViewStack(prev => prev.slice(0, -1));
    };

    const currentContextItem = viewStack[viewStack.length - 1];
    const isStudentView = currentContextItem && (!currentContextItem.subRooms || currentContextItem.subRooms.length === 0);

    return (
        <MainLayout>
            {/* Header - Desktop */}
            <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        {viewStack.length > 0 && (
                            <Button variant="ghost" size="icon" onClick={handleBack} className="text-gray-400 hover:text-white hover:bg-white/5">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                                {viewStack.length === 0 ? "Property Structure" : currentContextItem.roomNumber}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Navigate through your buildings and room hierarchies</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Header */}
            <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MobileNav />
                        {viewStack.length > 0 && (
                            <Button variant="ghost" size="icon" onClick={handleBack} className="text-gray-400 h-8 w-8">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {viewStack.length === 0 ? "Structure" : currentContextItem.roomNumber}
                            </h1>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Asset Explorer</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto flex-1">
                <main className="container mx-auto px-4 py-8">
                    {/* Search (Only visible at root or if searching) */}
                    {viewStack.length === 0 && (
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search rooms..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-[#0f1f3a] border-gray-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                    )}

                    {/* Views */}
                    {isStudentView ? (
                        // STUDENT NAME LIST VIEW
                        <Card className="bg-[#0f1f3a] border-gray-700/50 max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    Students in {currentContextItem.roomNumber}
                                </CardTitle>
                                <p className="text-sm text-gray-400">
                                    {currentContextItem.hostelName} • Floor {currentContextItem.floorNumber}
                                    {currentContextItem.part && ` • Part of ${currentContextItem.part} `}
                                </p>
                            </CardHeader>
                            <CardContent>
                                {currentContextItem.students && currentContextItem.students.length > 0 ? (
                                    <div className="grid gap-2">
                                        {currentContextItem.students.map((student: any, idx: number) => (
                                            <div key={idx}
                                                className="p-3 bg-gray-800/50 rounded-lg flex items-center justify-between border border-gray-700 hover:bg-gray-800 transition-colors cursor-pointer group"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setIsProfileOpen(true);
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <span className="text-white font-medium block">{student.name}</span>
                                                        <span className="text-xs text-gray-500">{student.occupation || 'Occupant'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                        <Pencil className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No students occupied in this room.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        // ROOM/CARD GRID VIEW
                        <>
                            {currentViewItems.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <DoorOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>{search ? 'No rooms found.' : 'No rooms available.'}</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {currentViewItems.map((room) => (
                                        <Card
                                            key={room.id}
                                            onClick={() => handleCardClick(room)}
                                            className="bg-[#0f1f3a] border-gray-700/50 hover:border-gray-600 transition-all cursor-pointer hover:bg-gray-800/30"
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                                            {room.roomNumber}
                                                            {room.part && (
                                                                <Badge variant="outline" className="text-xs font-normal border-gray-600 text-gray-400">
                                                                    In {room.part}
                                                                </Badge>
                                                            )}
                                                        </CardTitle>
                                                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                                            <Building2 className="w-3 h-3" /> {room.hostelName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-400">Floor</span>
                                                        <span className="text-white font-medium">{room.floorNumber === 0 ? 'Ground' : room.floorNumber}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-400">Items</span>
                                                        {room.subRooms && room.subRooms.length > 0 ? (
                                                            <span className="text-white font-medium flex items-center gap-1">
                                                                <Layers className="w-3 h-3" /> {room.subRooms.length} sub-rooms
                                                            </span>
                                                        ) : (
                                                            <span className="text-white font-medium flex items-center gap-1">
                                                                <Users className="w-3 h-3" /> {room.students?.length || 0} students
                                                            </span>
                                                        )}
                                                    </div>

                                                    {room.occupancyType === 'family' && (
                                                        <div className="mt-2 text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-center border border-orange-500/20">
                                                            Family Room
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {selectedStudent && currentContextItem && (
                <StudentProfileDialog
                    student={selectedStudent}
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    hostelId={currentContextItem.hostelId}
                    floorId={currentContextItem.floorId}
                />
            )}
        </MainLayout>
    );
};

export default Rooms;
