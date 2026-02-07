import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex h-screen bg-[#0a0f1a] overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex" />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
                <div className="flex-1 overflow-y-auto scrollbar-hide lg:scrollbar-default">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
