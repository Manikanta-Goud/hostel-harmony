import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex min-h-screen bg-[#1a2332]">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex" />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
