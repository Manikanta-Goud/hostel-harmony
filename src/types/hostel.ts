export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  joinDate: string;
  monthlyRent: number;
  roomId: string;
  paymentCycle?: 'monthly' | 'custom'; // Payment cycle type
  customDays?: number; // Number of days if custom cycle
  nextPaymentDue?: string; // Next payment due date
  memberCount?: number; // For family occupancy
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  month: string; // Format: "YYYY-MM"
  paidDate?: string;
  status: 'paid' | 'due' | 'overdue' | 'partial';
  remainingAmount?: number;
  nextPaymentDate?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floorId: string;
  capacity: number;
  monthlyRent: number;
  roomType?: 'hall' | 'room' | 'section';
  occupancyType?: 'students' | 'family'; // Who can occupy this room
  wing?: string;
  parentRoomId?: string;
  hasAttachedBathroom?: boolean;
  students: Student[];
  subRooms?: Room[]; // Child rooms for sections
}

export interface Floor {
  id: string;
  floorNumber: number;
  hostelId: string;
  rooms: Room[];
}

export interface Hostel {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  totalCapacity?: number;
  floors: Floor[];
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
}
