import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hostel, Floor, Room, Student, Payment } from '@/types/hostel';
import { supabase } from '@/lib/supabase';

interface HostelContextType {
  hostels: Hostel[];
  payments: Payment[];
  addHostel: (hostel: Omit<Hostel, 'id' | 'floors'>) => Promise<void>;
  updateHostel: (id: string, hostel: Partial<Hostel>) => Promise<void>;
  deleteHostel: (id: string) => Promise<void>;
  addFloor: (hostelId: string, floorNumber: number) => Promise<void>;
  deleteFloor: (hostelId: string, floorId: string) => Promise<void>;
  addRoom: (hostelId: string, floorId: string, room: Omit<Room, 'id' | 'floorId' | 'students'>) => Promise<void>;
  updateRoom: (hostelId: string, floorId: string, roomId: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (hostelId: string, floorId: string, roomId: string) => Promise<void>;
  addStudent: (hostelId: string, floorId: string, roomId: string, student: Omit<Student, 'id' | 'roomId'>) => Promise<void>;
  updateStudent: (hostelId: string, floorId: string, roomId: string, studentId: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (hostelId: string, floorId: string, roomId: string, studentId: string) => Promise<void>;
  recordPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  getStudentPayments: (studentId: string) => Payment[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export function HostelProvider({ children }: { children: ReactNode }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from Supabase
  const loadData = async () => {
    try {
      setIsLoading(true);

      // Fetch hostels with all nested data
      const { data: hostelsData, error: hostelsError } = await supabase
        .from('hostels')
        .select(`
          *,
          floors (
            *,
            rooms (
              *,
              students (*)
            )
          )
        `)
        .order('created_at', { ascending: true });

      if (hostelsError) throw hostelsError;

      // Transform the data to match our type structure
      const transformedHostels: Hostel[] = (hostelsData || []).map((h: any) => ({
        id: h.id,
        ownerId: h.owner_id,
        name: h.name,
        address: h.address,
        totalCapacity: h.total_capacity || 0,
        floors: (h.floors || []).map((f: any) => {
          const allRooms = (f.rooms || []).map((r: any) => ({
            id: r.id,
            floorId: r.floor_id,
            roomNumber: r.room_number,
            capacity: r.capacity,
            monthlyRent: r.monthly_rent,
            roomType: r.room_type || 'room',
            wing: r.wing || undefined,
            parentRoomId: r.parent_room_id || undefined,
            hasAttachedBathroom: r.has_attached_bathroom || false,
            students: (r.students || []).map((s: any) => ({
              id: s.id,
              roomId: s.room_id,
              name: s.name,
              phone: s.phone,
              email: s.email,
              emergencyContact: s.emergency_contact,
              joinDate: s.join_date,
              monthlyRent: s.monthly_rent
            })),
            subRooms: []
          }));

          // Build parent-child hierarchy
          const roomMap = new Map(allRooms.map(r => [r.id, r]));
          const topLevelRooms: any[] = [];

          allRooms.forEach(room => {
            if (room.parentRoomId) {
              const parent = roomMap.get(room.parentRoomId);
              if (parent) {
                parent.subRooms.push(room);
              }
            } else {
              topLevelRooms.push(room);
            }
          });

          return {
            id: f.id,
            hostelId: f.hostel_id,
            floorNumber: f.floor_number,
            rooms: topLevelRooms
          };
        })
      }));

      setHostels(transformedHostels);

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      const transformedPayments: Payment[] = (paymentsData || []).map((p: any) => ({
        id: p.id,
        studentId: p.student_id,
        amount: p.amount,
        month: p.month,
        status: p.status,
        paidDate: p.paid_date
      }));

      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const addHostel = async (hostel: Omit<Hostel, 'id' | 'floors'>) => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .insert([{
          owner_id: hostel.ownerId || 'default-owner', // Use ownerId if provided, otherwise default
          name: hostel.name,
          address: hostel.address,
          total_capacity: hostel.totalCapacity || 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding hostel:', error);
        throw error;
      }

      console.log('Hostel added successfully:', data);
      await refreshData();
    } catch (error) {
      console.error('Failed to add hostel:', error);
      throw error;
    }
  };

  const updateHostel = async (id: string, hostel: Partial<Hostel>) => {
    const updateData: any = {};
    if (hostel.name) updateData.name = hostel.name;
    if (hostel.address) updateData.address = hostel.address;
    if (hostel.totalCapacity !== undefined) updateData.total_capacity = hostel.totalCapacity;

    const { error } = await supabase
      .from('hostels')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteHostel = async (id: string) => {
    const { error } = await supabase
      .from('hostels')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const addFloor = async (hostelId: string, floorNumber: number) => {
    const { error } = await supabase
      .from('floors')
      .insert([{
        hostel_id: hostelId,
        floor_number: floorNumber
      }]);

    if (error) throw error;
    await refreshData();
  };

  const deleteFloor = async (hostelId: string, floorId: string) => {
    const { error } = await supabase
      .from('floors')
      .delete()
      .eq('id', floorId);

    if (error) throw error;
    await refreshData();
  };

  const addRoom = async (hostelId: string, floorId: string, room: Omit<Room, 'id' | 'floorId' | 'students'>) => {
    try {
      // If roomType is 'section', create section + hall + sub-rooms
      if (room.roomType === 'section') {
        // Step 1: Create the section container
        const { data: sectionData, error: sectionError } = await supabase
          .from('rooms')
          .insert([{
            floor_id: floorId,
            room_number: room.wing || 'Section',
            capacity: 0, // Section itself doesn't hold students
            monthly_rent: 0,
            room_type: 'section',
            wing: room.wing || null,
            parent_room_id: null
          }])
          .select()
          .single();

        if (sectionError) throw sectionError;
        const sectionId = sectionData.id;

        // Step 2: Create the hall inside this section
        const { error: hallError } = await supabase
          .from('rooms')
          .insert([{
            floor_id: floorId,
            room_number: room.roomNumber || 'Hall',
            capacity: room.capacity || 10,
            monthly_rent: 0, // Halls don't have rent
            room_type: 'hall',
            wing: room.wing || null,
            parent_room_id: sectionId,
            has_attached_bathroom: false
          }]);

        if (hallError) throw hallError;

        // Step 3: Create placeholder sub-rooms
        const numRooms = room.monthlyRent || 0; // We stored number of rooms in monthlyRent field temporarily
        if (numRooms > 0) {
          const subRoomsToCreate = [];
          for (let i = 1; i <= numRooms; i++) {
            subRoomsToCreate.push({
              floor_id: floorId,
              room_number: `Room ${i}`,
              capacity: 3, // Default capacity
              monthly_rent: 5000, // Default rent (can be edited later)
              room_type: 'room',
              wing: room.wing || null,
              parent_room_id: sectionId,
              has_attached_bathroom: false
            });
          }

          const { error: roomsError } = await supabase
            .from('rooms')
            .insert(subRoomsToCreate);

          if (roomsError) throw roomsError;
        }
      } else {
        // Regular single room creation
        const { error } = await supabase
          .from('rooms')
          .insert([{
            floor_id: floorId,
            room_number: room.roomNumber,
            capacity: room.capacity,
            monthly_rent: room.monthlyRent,
            room_type: room.roomType || 'room',
            wing: room.wing || null,
            parent_room_id: room.parentRoomId || null,
            has_attached_bathroom: room.hasAttachedBathroom || false
          }]);

        if (error) throw error;
      }

      await refreshData();
    } catch (error: any) {
      console.error('Error adding room:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      throw error;
    }
  };

  const updateRoom = async (hostelId: string, floorId: string, roomId: string, room: Partial<Room>) => {
    const updateData: any = {};
    if (room.roomNumber) updateData.room_number = room.roomNumber;
    if (room.capacity !== undefined) updateData.capacity = room.capacity;
    if (room.monthlyRent !== undefined) updateData.monthly_rent = room.monthlyRent;

    const { error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', roomId);

    if (error) throw error;
    await refreshData();
  };

  const deleteRoom = async (hostelId: string, floorId: string, roomId: string) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
    await refreshData();
  };

  const addStudent = async (hostelId: string, floorId: string, roomId: string, student: Omit<Student, 'id' | 'roomId'>) => {
    const { error } = await supabase
      .from('students')
      .insert([{
        room_id: roomId,
        name: student.name,
        phone: student.phone,
        email: student.email || null,
        emergency_contact: student.emergencyContact || null,
        join_date: student.joinDate || new Date().toISOString(),
        monthly_rent: student.monthlyRent
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateStudent = async (hostelId: string, floorId: string, roomId: string, studentId: string, student: Partial<Student>) => {
    const updateData: any = {};
    if (student.name) updateData.name = student.name;
    if (student.phone) updateData.phone = student.phone;
    if (student.email !== undefined) updateData.email = student.email || null;
    if (student.emergencyContact !== undefined) updateData.emergency_contact = student.emergencyContact || null;
    if (student.monthlyRent !== undefined) updateData.monthly_rent = student.monthlyRent;

    const { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', studentId);

    if (error) throw error;
    await refreshData();
  };

  const deleteStudent = async (hostelId: string, floorId: string, roomId: string, studentId: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) throw error;
    await refreshData();
  };

  const recordPayment = async (payment: Omit<Payment, 'id'>) => {
    const { data: existing, error: fetchError } = await supabase
      .from('payments')
      .select('id')
      .eq('student_id', payment.studentId)
      .eq('month', payment.month)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const paymentData = {
      student_id: payment.studentId,
      amount: payment.amount,
      month: payment.month,
      status: payment.status,
      paid_date: payment.paidDate || null
    };

    if (existing) {
      // Update existing payment
      const { error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new payment
      const { error } = await supabase
        .from('payments')
        .insert([paymentData]);

      if (error) throw error;
    }

    await refreshData();
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId);
  };

  return (
    <HostelContext.Provider value={{
      hostels,
      payments,
      addHostel,
      updateHostel,
      deleteHostel,
      addFloor,
      deleteFloor,
      addRoom,
      updateRoom,
      deleteRoom,
      addStudent,
      updateStudent,
      deleteStudent,
      recordPayment,
      getStudentPayments,
      isLoading,
      refreshData
    }}>
      {children}
    </HostelContext.Provider>
  );
}

export function useHostel() {
  const context = useContext(HostelContext);
  if (context === undefined) {
    throw new Error('useHostel must be used within a HostelProvider');
  }
  return context;
}
