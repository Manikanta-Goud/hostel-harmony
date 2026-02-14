import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Owner } from '@/types/hostel';

interface AuthContextType {
  owner: Owner | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedOwner = localStorage.getItem('hostel_owner');
    if (storedOwner) {
      setOwner(JSON.parse(storedOwner));
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('hostel_users') || '[]');
    if (users.find((u: any) => u.email === email)) return false;

    const newUser = { id: email, name, email, password };
    users.push(newUser);
    localStorage.setItem('hostel_users', JSON.stringify(users));

    const ownerData: Owner = { id: email, name, email, phone: '0000000000' };
    setOwner(ownerData);
    localStorage.setItem('hostel_owner', JSON.stringify(ownerData));
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo account for Srinivas
    if (email === 'srinivas@gmail.com' && password === '12345678') {
      const srinivasData: Owner = {
        id: 'srinivas@gmail.com',
        name: 'Srinivas',
        email: 'srinivas@gmail.com',
        phone: '0000000000'
      };
      setOwner(srinivasData);
      localStorage.setItem('hostel_owner', JSON.stringify(srinivasData));
      return true;
    }

    // Default admin account (now normal)
    if (email === 'admin@hostel.com' && password === 'admin123') {
      const adminData: Owner = {
        id: 'admin@hostel.com',
        name: 'Admin Owner',
        email: 'admin@hostel.com',
        phone: '9876543210'
      };
      setOwner(adminData);
      localStorage.setItem('hostel_owner', JSON.stringify(adminData));
      return true;
    }

    const users = JSON.parse(localStorage.getItem('hostel_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);

    if (found) {
      const ownerData: Owner = {
        id: found.id,
        name: found.name,
        email: found.email,
        phone: '0000000000'
      };
      setOwner(ownerData);
      localStorage.setItem('hostel_owner', JSON.stringify(ownerData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setOwner(null);
    localStorage.removeItem('hostel_owner');
  };

  return (
    <AuthContext.Provider value={{ owner, isAuthenticated: !!owner, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
