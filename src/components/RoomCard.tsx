import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DoorOpen, Users, Trash2, Plus, ChevronDown, ChevronRight, Home, Pencil } from 'lucide-react';
import { Room } from '@/types/hostel';

interface RoomCardProps {
    room: Room;
    hostelId: string;
    floorId: string;
    onAddStudent: (roomId: string, rent: number) => void;
    onDeleteRoom: (hostelId: string, floorId: string, roomId: string) => void;
    onDeleteStudent: (hostelId: string, floorId: string, roomId: string, studentId: string) => void;
    onStudentClick?: (student: any) => void;
    onEditStudent?: (student: any, hostelId: string, floorId: string) => void;
    onEditRoom?: (room: any, hostelId: string, floorId: string) => void;
    toast: any;
    level?: number;
}

export function RoomCard({
    room,
    hostelId,
    floorId,
    onAddStudent,
    onDeleteRoom,
    onDeleteStudent,
    onStudentClick,
    onEditStudent,
    onEditRoom,
    toast,
    level = 0
}: RoomCardProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isStudentsExpanded, setIsStudentsExpanded] = useState(false);
    const hasSubRooms = room.subRooms && room.subRooms.length > 0;
    const hasStudents = room.students && room.students.length > 0;

    const getIcon = () => {
        if (room.roomType === 'section') return <Home className="w-4 h-4 text-orange-500" />;
        if (room.roomType === 'hall') return <Users className="w-4 h-4 text-blue-500" />;
        return <DoorOpen className="w-4 h-4 text-primary" />;
    };

    const getTitle = () => {
        if (room.roomType === 'section') return `📦 ${room.roomNumber}`;
        if (room.roomType === 'hall') return `🏛️ ${room.roomNumber}`;
        return `🚪 Room ${room.roomNumber}`;
    };

    return (
        <div className={`${level > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}>
            <Card className={`bg-muted/${50 - level * 10} ${room.roomType === 'section' ? 'border-orange-500/30' : ''}`}>
                <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {(hasSubRooms || hasStudents) && (
                                <button
                                    onClick={() => hasSubRooms ? setIsExpanded(!isExpanded) : setIsStudentsExpanded(!isStudentsExpanded)}
                                    className="p-0 hover:bg-accent rounded"
                                >
                                    {(hasSubRooms ? isExpanded : isStudentsExpanded) ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                            {getIcon()}
                            <CardTitle className="text-base">{getTitle()}</CardTitle>

                            {room.roomType !== 'section' && (
                                <>
                                    <Badge variant={room.students.length >= room.capacity ? "destructive" : "outline"}>
                                        {room.students.length}/{room.capacity}
                                    </Badge>
                                    {room.hasAttachedBathroom && (
                                        <Badge variant="secondary" className="text-xs">🚿 Attached Bath</Badge>
                                    )}
                                </>
                            )}

                            {hasSubRooms && (
                                <Badge variant="secondary">{room.subRooms.length} sub-rooms</Badge>
                            )}
                            {hasStudents && room.roomType !== 'section' && (
                                <Badge variant="outline" className="text-xs">{room.students.length} students</Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {room.roomType !== 'section' && room.monthlyRent > 0 && (
                                <span className="text-sm text-muted-foreground">₹{room.monthlyRent}/month</span>
                            )}

                            {room.roomType !== 'section' && onEditRoom && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEditRoom(room, hostelId, floorId)}
                                    title="Edit Room"
                                >
                                    <Pencil className="w-3 h-3" />
                                </Button>
                            )}

                            {room.roomType !== 'section' && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={room.students.length >= room.capacity}
                                    onClick={() => onAddStudent(room.id, room.monthlyRent)}
                                    title="Add Student"
                                >
                                    <Plus className="w-3 h-3" />
                                </Button>
                            )}

                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => {
                                    const confirmMsg = room.roomType === 'section'
                                        ? 'Delete this section and all its rooms?'
                                        : 'Delete this room?';
                                    if (confirm(confirmMsg)) {
                                        onDeleteRoom(hostelId, floorId, room.id);
                                        toast({ title: room.roomType === 'section' ? "Section deleted" : "Room deleted" });
                                    }
                                }}
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Students list (collapsible for non-section rooms) */}
                {hasStudents && room.roomType !== 'section' && isStudentsExpanded && (
                    <CardContent className="py-2 px-4 border-t">
                        <div className="space-y-2">
                            {room.students.map(student => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-2 bg-background rounded text-sm hover:bg-accent cursor-pointer transition-colors"
                                    onClick={() => onStudentClick && onStudentClick(student)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3" />
                                            <span className="font-medium">{student.name}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{student.phone}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">₹{student.monthlyRent}/mo</span>
                                        {onEditStudent && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditStudent(student, hostelId, floorId);
                                                }}
                                                title="Edit Student"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive h-6 w-6 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Remove this student?')) {
                                                    onDeleteStudent(hostelId, floorId, room.id, student.id);
                                                    toast({ title: "Student removed" });
                                                }
                                            }}
                                            title="Remove Student"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Render sub-rooms if expanded */}
            {isExpanded && hasSubRooms && (
                <div className="mt-3 space-y-3">
                    {room.subRooms.map(subRoom => (
                        <RoomCard
                            key={subRoom.id}
                            room={subRoom}
                            hostelId={hostelId}
                            floorId={floorId}
                            onAddStudent={onAddStudent}
                            onDeleteRoom={onDeleteRoom}
                            onDeleteStudent={onDeleteStudent}
                            onStudentClick={onStudentClick}
                            onEditStudent={onEditStudent}
                            onEditRoom={onEditRoom}
                            toast={toast}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
