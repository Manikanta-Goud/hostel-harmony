import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, LayoutDashboard, Layers, Users, CreditCard, LogOut, Receipt, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
    className?: string;
}

const Sidebar = ({ className = '' }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { owner, logout } = useAuth();

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Hostels', icon: Building2, path: '/hostels' },
        { name: 'Rooms', icon: Layers, path: '/rooms' },
        { name: 'Families', icon: Users, path: '/families' },
        { name: 'Students', icon: Users, path: '/students' },
        { name: 'Staff Overview', icon: UserCog, path: '/staff' },
        { name: 'Payments', icon: CreditCard, path: '/payments' },
        { name: 'Expenses', icon: Receipt, path: '/expenses' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={cn("flex flex-col h-screen bg-[#0f1f3a] text-gray-300 w-64", className)}>
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-700/50">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-xl font-bold text-white">HostelHub</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                                ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-700/50 p-4 space-y-2">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                            {owner?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <span className="text-gray-200 font-medium">{owner?.name || 'User'}</span>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
