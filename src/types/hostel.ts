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
  aadharNumber?: string;
  permanentAddress?: string;
  occupation?: string;
  workAddress?: string;
  fatherName?: string;
  motherName?: string;
  parentPhone?: string;
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
  propertyType?: 'owned' | 'rented';
  rentAmount?: number;
  floors: Floor[];
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Expense {
  id: string;
  hostelId: string;
  category: 'utilities' | 'staff' | 'supplies' | 'other';
  description: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface Staff {
  id: string;
  hostelId: string;
  name: string;
  phone: string;
  email?: string;
  area?: string;
  role?: string;
  monthlySalary: number;
  joinDate: string;
}

export interface StaffSalary {
  id: string;
  staffId: string;
  amount: number;
  month: string; // Format: "YYYY-MM"
  status: 'paid' | 'due' | 'pending';
  paidDate?: string;
}

export interface Utility {
  id: string;
  hostelId: string;
  itemName: string;
  price: number;
  date: string;
  description?: string;
}

export interface Supplier {
  id: string;
  hostelId: string;
  name: string;
  supplies: string;
  amount: number; // For fixed monthly cost suppliers
  phone?: string;
  supplyType?: 'fixed' | 'per_unit'; // Type of pricing
  perUnitPrice?: number; // Price per unit (e.g., per can for water)
  currentMonthUnits?: number; // Current month's unit count (e.g., water cans)
  totalAmount?: number; // Calculated total for per_unit suppliers
  month?: string; // Track which month this record is for (format: "YYYY-MM")
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  month: string; // Format: "YYYY-MM"
  unitCount?: number; // Units delivered this month
  amount: number; // Amount paid
  paidDate: string;
}

export interface HostelRentPayment {
  id: string;
  hostelId: string;
  month: string; // Format: "YYYY-MM"
  amount: number;
  paidDate?: string;
  status: 'paid' | 'pending';
}

export interface Requirement {
  id: string;
  hostelId: string;
  itemName: string;
  quantity: number;
  amount: number;
  date: string;
  vendor?: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  hostelId: string;
  studentName: string;
  roomName: string;
  issue: string;
  date: string;
  status: 'open' | 'resolved';
}

export interface AttendanceRecord {
  id: string;
  hostelId: string;
  studentName: string;
  roomName: string;
  date: string;
  status: 'present' | 'absent';
  reason?: string;
}
