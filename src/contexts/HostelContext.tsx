import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hostel, Floor, Room, Student, Payment } from '@/types/hostel';

interface HostelContextType {
  hostels: Hostel[];
  payments: Payment[];
  addHostel: (hostel: Omit<Hostel, 'id' | 'floors'>) => void;
  updateHostel: (id: string, hostel: Partial<Hostel>) => void;
  deleteHostel: (id: string) => void;
  addFloor: (hostelId: string, floorNumber: number) => void;
  deleteFloor: (hostelId: string, floorId: string) => void;
  addRoom: (hostelId: string, floorId: string, room: Omit<Room, 'id' | 'floorId' | 'students'>) => void;
  updateRoom: (hostelId: string, floorId: string, roomId: string, room: Partial<Room>) => void;
  deleteRoom: (hostelId: string, floorId: string, roomId: string) => void;
  addStudent: (hostelId: string, floorId: string, roomId: string, student: Omit<Student, 'id' | 'roomId'>) => void;
  updateStudent: (hostelId: string, floorId: string, roomId: string, studentId: string, student: Partial<Student>) => void;
  deleteStudent: (hostelId: string, floorId: string, roomId: string, studentId: string) => void;
  recordPayment: (payment: Omit<Payment, 'id'>) => void;
  getStudentPayments: (studentId: string) => Payment[];
  isLoading: boolean;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 15);

export function HostelProvider({ children }: { children: ReactNode }) {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedHostels = localStorage.getItem('hostel_data');
    const storedPayments = localStorage.getItem('hostel_payments');
    if (storedHostels) setHostels(JSON.parse(storedHostels));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('hostel_data', JSON.stringify(hostels));
    }
  }, [hostels, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('hostel_payments', JSON.stringify(payments));
    }
  }, [payments, isLoading]);

  const addHostel = (hostel: Omit<Hostel, 'id' | 'floors'>) => {
    setHostels(prev => [...prev, { ...hostel, id: generateId(), floors: [] }]);
  };

  const updateHostel = (id: string, hostel: Partial<Hostel>) => {
    setHostels(prev => prev.map(h => h.id === id ? { ...h, ...hostel } : h));
  };

  const deleteHostel = (id: string) => {
    setHostels(prev => prev.filter(h => h.id !== id));
  };

  const addFloor = (hostelId: string, floorNumber: number) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: [...h.floors, { id: generateId(), floorNumber, hostelId, rooms: [] }]
        };
      }
      return h;
    }));
  };

  const deleteFloor = (hostelId: string, floorId: string) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return { ...h, floors: h.floors.filter(f => f.id !== floorId) };
      }
      return h;
    }));
  };

  const addRoom = (hostelId: string, floorId: string, room: Omit<Room, 'id' | 'floorId' | 'students'>) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: h.floors.map(f => {
            if (f.id === floorId) {
              return {
                ...f,
                rooms: [...f.rooms, { ...room, id: generateId(), floorId, students: [] }]
              };
            }
            return f;
          })
        };
      }
      return h;
    }));
  };

  const updateRoom = (hostelId: string, floorId: string, roomId: string, room: Partial<Room>) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: h.floors.map(f => {
            if (f.id === floorId) {
              return {
                ...f,
                rooms: f.rooms.map(r => r.id === roomId ? { ...r, ...room } : r)
              };
            }
            return f;
          })
        };
      }
      return h;
    }));
  };

  const deleteRoom = (hostelId: string, floorId: string, roomId: string) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: h.floors.map(f => {
            if (f.id === floorId) {
              return { ...f, rooms: f.rooms.filter(r => r.id !== roomId) };
            }
            return f;
          })
        };
      }
      return h;
    }));
  };

  const addStudent = (hostelId: string, floorId: string, roomId: string, student: Omit<Student, 'id' | 'roomId'>) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: h.floors.map(f => {
            if (f.id === floorId) {
              return {
                ...f,
                rooms: f.rooms.map(r => {
                  if (r.id === roomId) {
                    return {
                      ...r,
                      students: [...r.students, { ...student, id: generateId(), roomId }]
                    };
                  }
                  return r;
                })
              };
            }
            return f;
          })
        };
      }
      return h;
    }));
  };

  const updateStudent = (hostelId: string, floorId: string, roomId: string, studentId: string, student: Partial<Student>) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: h.floors.map(f => {
            if (f.id === floorId) {
              return {
                ...f,
                rooms: f.rooms.map(r => {
                  if (r.id === roomId) {
                    return {
                      ...r,
                      students: r.students.map(s => s.id === studentId ? { ...s, ...student } : s)
                    };
                  }
                  return r;
                })
              };
            }
            return f;
          })
        };
      }
      return h;
    }));
  };

  const deleteStudent = (hostelId: string, floorId: string, roomId: string, studentId: string) => {
    setHostels(prev => prev.map(h => {
      if (h.id === hostelId) {
        return {
          ...h,
          floors: h.floors.map(f => {
            if (f.id === floorId) {
              return {
                ...f,
                rooms: f.rooms.map(r => {
                  if (r.id === roomId) {
                    return { ...r, students: r.students.filter(s => s.id !== studentId) };
                  }
                  return r;
                })
              };
            }
            return f;
          })
        };
      }
      return h;
    }));
  };

  const recordPayment = (payment: Omit<Payment, 'id'>) => {
    setPayments(prev => {
      const existing = prev.find(p => p.studentId === payment.studentId && p.month === payment.month);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, ...payment } : p);
      }
      return [...prev, { ...payment, id: generateId() }];
    });
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
      isLoading
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
