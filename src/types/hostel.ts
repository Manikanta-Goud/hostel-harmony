export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  joinDate: string;
  monthlyRent: number;
  roomId: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  month: string; // Format: "YYYY-MM"
  paidDate?: string;
  status: 'paid' | 'due' | 'overdue';
}

export interface Room {
  id: string;
  roomNumber: string;
  floorId: string;
  capacity: number;
  monthlyRent: number;
  students: Student[];
}

export interface Floor {
  id: string;
  floorNumber: number;
  hostelId: string;
  rooms: Room[];
}

export interface Hostel {
  id: string;
  name: string;
  address: string;
  floors: Floor[];
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
}
