import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hostel, Floor, Room, Student, Payment, Expense, Requirement, Staff, StaffSalary, Utility, Supplier } from '@/types/hostel';
import { supabase } from '@/lib/supabase';

interface HostelContextType {
  hostels: Hostel[];
  payments: Payment[];
  expenses: Expense[];
  requirements: Requirement[];
  staff: Staff[];
  staffSalaries: StaffSalary[];
  utilities: Utility[];
  suppliers: Supplier[];
  addHostel: (hostel: Omit<Hostel, 'id' | 'floors'>) => Promise<void>;
  updateHostel: (id: string, hostel: Partial<Hostel>) => Promise<void>;
  deleteHostel: (id: string) => Promise<void>;
  addFloor: (hostelId: string, floorNumber: number) => Promise<void>;
  updateFloor: (hostelId: string, floorId: string, floorNumber: number) => Promise<void>;
  deleteFloor: (hostelId: string, floorId: string) => Promise<void>;
  addRoom: (hostelId: string, floorId: string, room: Omit<Room, 'id' | 'floorId' | 'students'>) => Promise<void>;
  updateRoom: (hostelId: string, floorId: string, roomId: string, room: Partial<Room>) => Promise<void>;
  deleteRoom: (hostelId: string, floorId: string, roomId: string) => Promise<void>;
  addStudent: (hostelId: string, floorId: string, roomId: string, student: Omit<Student, 'id' | 'roomId'>) => Promise<void>;
  updateStudent: (hostelId: string, floorId: string, roomId: string, studentId: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (hostelId: string, floorId: string, roomId: string, studentId: string) => Promise<void>;
  recordPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  getStudentPayments: (studentId: string) => Payment[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addRequirement: (requirement: Omit<Requirement, 'id'>) => Promise<void>;
  updateRequirement: (id: string, requirement: Partial<Requirement>) => Promise<void>;
  deleteRequirement: (id: string) => Promise<void>;
  addStaff: (staff: Omit<Staff, 'id'>) => Promise<void>;
  updateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  payStaffSalary: (salary: Omit<StaffSalary, 'id'>) => Promise<void>;
  addUtility: (utility: Omit<Utility, 'id'>) => Promise<void>;
  updateUtility: (id: string, utility: Partial<Utility>) => Promise<void>;
  deleteUtility: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export function HostelProvider({ children }: { children: ReactNode }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffSalaries, setStaffSalaries] = useState<StaffSalary[]>([]);
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
            occupancyType: r.occupancy_type || 'students',
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
              monthlyRent: s.monthly_rent,
              paymentCycle: s.payment_cycle || 'monthly',
              customDays: s.custom_days || undefined,
              nextPaymentDue: s.next_payment_due || undefined,
              memberCount: s.member_count || 1,
              aadharNumber: s.aadhar_number,
              permanentAddress: s.permanent_address,
              occupation: s.occupation,
              workAddress: s.work_address,
              fatherName: s.father_name,
              motherName: s.mother_name,
              parentPhone: s.parent_phone
            })),
            subRooms: []
          }));

          // Build parent-child hierarchy
          const roomMap = new Map(allRooms.map(r => [r.id, r]));
          const topLevelRooms: any[] = [];

          allRooms.forEach(room => {
            if (room.parentRoomId) {
              const parent: any = roomMap.get(room.parentRoomId);
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
        paidDate: p.paid_date,
        remainingAmount: p.remaining_amount,
        nextPaymentDate: p.next_payment_date
      }));

      setPayments(transformedPayments);

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
      }

      const transformedExpenses: Expense[] = (expensesData || []).map((e: any) => ({
        id: e.id,
        hostelId: e.hostel_id,
        category: e.category,
        description: e.description,
        amount: e.amount,
        date: e.date,
        notes: e.notes
      }));

      setExpenses(transformedExpenses);

      // Fetch requirements (kept for backward compatibility)
      const { data: requirementsData, error: requirementsError } = await supabase
        .from('requirements')
        .select('*')
        .order('date', { ascending: false });

      if (requirementsError) {
        console.error('Error fetching requirements:', requirementsError);
      }

      const transformedRequirements: Requirement[] = (requirementsData || []).map((r: any) => ({
        id: r.id,
        hostelId: r.hostel_id,
        itemName: r.item_name,
        quantity: r.quantity,
        amount: r.amount,
        date: r.date,
        vendor: r.vendor,
        notes: r.notes
      }));

      setRequirements(transformedRequirements);

      // Fetch staff
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: true });

      if (staffError && staffError.code !== 'PGRST116') {
        console.error('Error fetching staff:', staffError);
      }

      const transformedStaff: Staff[] = (staffData || []).map((s: any) => ({
        id: s.id,
        hostelId: s.hostel_id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        area: s.area,
        role: s.role,
        monthlySalary: s.monthly_salary,
        joinDate: s.join_date
      }));

      setStaff(transformedStaff);

      // Fetch staff salaries
      const { data: staffSalariesData, error: staffSalariesError } = await supabase
        .from('staff_salaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (staffSalariesError && staffSalariesError.code !== 'PGRST116') {
        console.error('Error fetching staff salaries:', staffSalariesError);
      }

      const transformedStaffSalaries: StaffSalary[] = (staffSalariesData || []).map((s: any) => ({
        id: s.id,
        staffId: s.staff_id,
        amount: s.amount,
        month: s.month,
        status: s.status,
        paidDate: s.paid_date
      }));

      setStaffSalaries(transformedStaffSalaries);

      // Fetch utilities
      const { data: utilitiesData, error: utilitiesError } = await supabase
        .from('utilities')
        .select('*')
        .order('date', { ascending: false });

      if (utilitiesError && utilitiesError.code !== 'PGRST116') {
        console.error('Error fetching utilities:', utilitiesError);
      }

      const transformedUtilities: Utility[] = (utilitiesData || []).map((u: any) => ({
        id: u.id,
        hostelId: u.hostel_id,
        itemName: u.item_name,
        price: u.price,
        date: u.date,
        description: u.description
      }));

      setUtilities(transformedUtilities);

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: true });

      if (suppliersError && suppliersError.code !== 'PGRST116') {
        console.error('Error fetching suppliers:', suppliersError);
      }

      const transformedSuppliers: Supplier[] = (suppliersData || []).map((s: any) => ({
        id: s.id,
        hostelId: s.hostel_id,
        name: s.name,
        supplies: s.supplies,
        amount: s.amount,
        phone: s.phone,
        supplyType: s.supply_type || 'fixed',
        perUnitPrice: s.per_unit_price,
        currentMonthUnits: s.current_month_units || 0,
        totalAmount: s.total_amount,
        month: s.month
      }));

      setSuppliers(transformedSuppliers);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up real-time subscriptions for all tables
    const hostelSubscription = supabase
      .channel('hostels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hostels' }, () => {
        loadData();
      })
      .subscribe();

    const floorSubscription = supabase
      .channel('floors-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'floors' }, () => {
        loadData();
      })
      .subscribe();

    const roomSubscription = supabase
      .channel('rooms-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        loadData();
      })
      .subscribe();

    const studentSubscription = supabase
      .channel('students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        loadData();
      })
      .subscribe();

    const paymentSubscription = supabase
      .channel('payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        loadData();
      })
      .subscribe();

    const staffSubscription = supabase
      .channel('staff-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        loadData();
      })
      .subscribe();

    const staffSalariesSubscription = supabase
      .channel('staff_salaries-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_salaries' }, () => {
        loadData();
      })
      .subscribe();

    const utilitiesSubscription = supabase
      .channel('utilities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'utilities' }, () => {
        loadData();
      })
      .subscribe();

    const suppliersSubscription = supabase
      .channel('suppliers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
        loadData();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(hostelSubscription);
      supabase.removeChannel(floorSubscription);
      supabase.removeChannel(roomSubscription);
      supabase.removeChannel(studentSubscription);
      supabase.removeChannel(paymentSubscription);
      supabase.removeChannel(staffSubscription);
      supabase.removeChannel(staffSalariesSubscription);
      supabase.removeChannel(utilitiesSubscription);
      supabase.removeChannel(suppliersSubscription);
    };
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const addHostel = async (hostel: Omit<Hostel, 'id' | 'floors'>) => {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .insert([{
          owner_id: hostel.ownerId || 'default-owner',
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

  const updateFloor = async (hostelId: string, floorId: string, floorNumber: number) => {
    const { error } = await supabase
      .from('floors')
      .update({ floor_number: floorNumber })
      .eq('id', floorId);

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
            capacity: 0,
            monthly_rent: 0,
            room_type: 'section',
            occupancy_type: room.occupancyType || 'students',
            wing: room.wing || null,
            parent_room_id: null
          }])
          .select()
          .single();

        if (sectionError) throw sectionError;
        const sectionId = sectionData.id;

        // Step 2: Create the hall inside this section
        const hallName = `${room.roomNumber} (${room.wing})`;
        const { error: hallError } = await supabase
          .from('rooms')
          .insert([{
            floor_id: floorId,
            room_number: hallName,
            capacity: room.capacity || 10,
            monthly_rent: 0,
            room_type: 'hall',
            occupancy_type: room.occupancyType || 'students',
            wing: room.wing || null,
            parent_room_id: sectionId,
            has_attached_bathroom: false
          }]);

        if (hallError) throw hallError;

        // Step 3: Create placeholder sub-rooms
        const numRooms = room.monthlyRent || 0;
        if (numRooms > 0) {
          const subRoomsToCreate = [];
          for (let i = 1; i <= numRooms; i++) {
            subRoomsToCreate.push({
              floor_id: floorId,
              room_number: `Room ${i} (${room.wing})`,
              capacity: 3,
              monthly_rent: 5000,
              room_type: 'room',
              occupancy_type: room.occupancyType || 'students',
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
            occupancy_type: room.occupancyType || 'students',
            wing: room.wing || null,
            parent_room_id: room.parentRoomId || null,
            has_attached_bathroom: room.hasAttachedBathroom || false
          }]);

        if (error) throw error;
      }

      await refreshData();
    } catch (error: any) {
      console.error('Error adding room:', error);
      throw error;
    }
  };

  const updateRoom = async (hostelId: string, floorId: string, roomId: string, room: Partial<Room>) => {
    const updateData: any = {};
    if (room.roomNumber) updateData.room_number = room.roomNumber;
    if (room.capacity !== undefined) updateData.capacity = room.capacity;
    if (room.monthlyRent !== undefined) updateData.monthly_rent = room.monthlyRent;
    if (room.occupancyType !== undefined) updateData.occupancy_type = room.occupancyType;

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
        monthly_rent: student.monthlyRent,
        payment_cycle: student.paymentCycle || 'monthly',
        custom_days: student.customDays || null,
        next_payment_due: student.nextPaymentDue || null,
        member_count: student.memberCount || 1,
        aadhar_number: student.aadharNumber || null,
        permanent_address: student.permanentAddress || null,
        occupation: student.occupation || null,
        work_address: student.workAddress || null,
        father_name: student.fatherName || null,
        mother_name: student.motherName || null,
        parent_phone: student.parentPhone || null
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
    if (student.memberCount !== undefined) updateData.member_count = student.memberCount;
    if (student.joinDate !== undefined) updateData.join_date = student.joinDate;
    if (student.aadharNumber !== undefined) updateData.aadhar_number = student.aadharNumber;
    if (student.permanentAddress !== undefined) updateData.permanent_address = student.permanentAddress;
    if (student.occupation !== undefined) updateData.occupation = student.occupation;
    if (student.workAddress !== undefined) updateData.work_address = student.workAddress;
    if (student.fatherName !== undefined) updateData.father_name = student.fatherName;
    if (student.motherName !== undefined) updateData.mother_name = student.motherName;
    if (student.parentPhone !== undefined) updateData.parent_phone = student.parentPhone;

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
      paid_date: payment.paidDate || null,
      remaining_amount: payment.remainingAmount || 0,
      next_payment_date: payment.nextPaymentDate || null
    };

    if (existing) {
      const { error } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
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

  // Expense CRUD operations
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const { error } = await supabase
      .from('expenses')
      .insert([{
        hostel_id: expense.hostelId,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        notes: expense.notes || null
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    const updateData: any = {};
    if (expense.category) updateData.category = expense.category;
    if (expense.description) updateData.description = expense.description;
    if (expense.amount !== undefined) updateData.amount = expense.amount;
    if (expense.date) updateData.date = expense.date;
    if (expense.notes !== undefined) updateData.notes = expense.notes || null;

    const { error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  // Requirement CRUD operations (kept for backward compatibility)
  const addRequirement = async (requirement: Omit<Requirement, 'id'>) => {
    const { error } = await supabase
      .from('requirements')
      .insert([{
        hostel_id: requirement.hostelId,
        item_name: requirement.itemName,
        quantity: requirement.quantity,
        amount: requirement.amount,
        date: requirement.date,
        vendor: requirement.vendor || null,
        notes: requirement.notes || null
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateRequirement = async (id: string, requirement: Partial<Requirement>) => {
    const updateData: any = {};
    if (requirement.itemName) updateData.item_name = requirement.itemName;
    if (requirement.quantity !== undefined) updateData.quantity = requirement.quantity;
    if (requirement.amount !== undefined) updateData.amount = requirement.amount;
    if (requirement.date) updateData.date = requirement.date;
    if (requirement.vendor !== undefined) updateData.vendor = requirement.vendor || null;
    if (requirement.notes !== undefined) updateData.notes = requirement.notes || null;

    const { error } = await supabase
      .from('requirements')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteRequirement = async (id: string) => {
    const { error } = await supabase
      .from('requirements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  // Staff CRUD operations
  const addStaff = async (staff: Omit<Staff, 'id'>) => {
    const { error } = await supabase
      .from('staff')
      .insert([{
        hostel_id: staff.hostelId,
        name: staff.name,
        phone: staff.phone,
        email: staff.email || null,
        area: staff.area || null,
        role: staff.role || null,
        monthly_salary: staff.monthlySalary,
        join_date: staff.joinDate || new Date().toISOString()
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateStaff = async (id: string, staff: Partial<Staff>) => {
    const updateData: any = {};
    if (staff.name) updateData.name = staff.name;
    if (staff.phone) updateData.phone = staff.phone;
    if (staff.email !== undefined) updateData.email = staff.email || null;
    if (staff.area !== undefined) updateData.area = staff.area || null;
    if (staff.role !== undefined) updateData.role = staff.role || null;
    if (staff.monthlySalary !== undefined) updateData.monthly_salary = staff.monthlySalary;

    const { error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteStaff = async (id: string) => {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  // Staff Salary operations
  const payStaffSalary = async (salary: Omit<StaffSalary, 'id'>) => {
    const { data: existing, error: fetchError } = await supabase
      .from('staff_salaries')
      .select('id')
      .eq('staff_id', salary.staffId)
      .eq('month', salary.month)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const salaryData = {
      staff_id: salary.staffId,
      amount: salary.amount,
      month: salary.month,
      status: salary.status,
      paid_date: salary.paidDate || null
    };

    if (existing) {
      const { error } = await supabase
        .from('staff_salaries')
        .update(salaryData)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('staff_salaries')
        .insert([salaryData]);

      if (error) throw error;
    }

    await refreshData();
  };

  // Utility CRUD operations
  const addUtility = async (utility: Omit<Utility, 'id'>) => {
    const { error } = await supabase
      .from('utilities')
      .insert([{
        hostel_id: utility.hostelId,
        item_name: utility.itemName,
        price: utility.price,
        date: utility.date,
        description: utility.description || null
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateUtility = async (id: string, utility: Partial<Utility>) => {
    const updateData: any = {};
    if (utility.itemName) updateData.item_name = utility.itemName;
    if (utility.price !== undefined) updateData.price = utility.price;
    if (utility.date) updateData.date = utility.date;
    if (utility.description !== undefined) updateData.description = utility.description || null;

    const { error } = await supabase
      .from('utilities')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteUtility = async (id: string) => {
    const { error } = await supabase
      .from('utilities')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  // Supplier CRUD operations
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    const { error } = await supabase
      .from('suppliers')
      .insert([{
        hostel_id: supplier.hostelId,
        name: supplier.name,
        supplies: supplier.supplies,
        amount: supplier.amount,
        phone: supplier.phone || null,
        supply_type: supplier.supplyType || 'fixed',
        per_unit_price: supplier.perUnitPrice || null,
        current_month_units: supplier.currentMonthUnits || 0,
        total_amount: supplier.totalAmount || null,
        month: supplier.month || null
      }]);

    if (error) throw error;
    await refreshData();
  };

  const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
    const updateData: any = {};
    if (supplier.name) updateData.name = supplier.name;
    if (supplier.supplies) updateData.supplies = supplier.supplies;
    if (supplier.amount !== undefined) updateData.amount = supplier.amount;
    if (supplier.phone !== undefined) updateData.phone = supplier.phone || null;
    if (supplier.supplyType !== undefined) updateData.supply_type = supplier.supplyType;
    if (supplier.perUnitPrice !== undefined) updateData.per_unit_price = supplier.perUnitPrice;
    if (supplier.currentMonthUnits !== undefined) updateData.current_month_units = supplier.currentMonthUnits;
    if (supplier.totalAmount !== undefined) updateData.total_amount = supplier.totalAmount;
    if (supplier.month !== undefined) updateData.month = supplier.month;

    const { error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await refreshData();
  };

  return (
    <HostelContext.Provider value={{
      hostels,
      payments,
      expenses,
      requirements,
      staff,
      staffSalaries,
      utilities,
      suppliers,
      addHostel,
      updateHostel,
      deleteHostel,
      addFloor,
      updateFloor,
      deleteFloor,
      addRoom,
      updateRoom,
      deleteRoom,
      addStudent,
      updateStudent,
      deleteStudent,
      recordPayment,
      getStudentPayments,
      addExpense,
      updateExpense,
      deleteExpense,
      addRequirement,
      updateRequirement,
      deleteRequirement,
      addStaff,
      updateStaff,
      deleteStaff,
      payStaffSalary,
      addUtility,
      updateUtility,
      deleteUtility,
      addSupplier,
      updateSupplier,
      deleteSupplier,
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
