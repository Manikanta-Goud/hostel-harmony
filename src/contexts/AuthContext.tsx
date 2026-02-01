import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Owner } from '@/types/hostel';

interface AuthContextType {
  owner: Owner | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock owners for demo - will be replaced with Supabase auth
const MOCK_OWNERS: (Owner & { password: string })[] = [
  { id: '1', name: 'Admin Owner', email: 'admin@hostel.com', phone: '9876543210', password: 'admin123' },
  { id: '2', name: 'Manager One', email: 'manager1@hostel.com', phone: '9876543211', password: 'manager123' },
];

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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - will be replaced with Supabase
    const found = MOCK_OWNERS.find(o => o.email === email && o.password === password);
    if (found) {
      const { password: _, ...ownerData } = found;
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
    <AuthContext.Provider value={{ owner, isAuthenticated: !!owner, login, logout, isLoading }}>
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
