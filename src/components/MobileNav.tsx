import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export const MobileNav = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-[#0a0f1a] border-r border-gray-800 w-72">
                <Sidebar className="w-full border-none shadow-2xl shadow-blue-500/10" />
            </SheetContent>
        </Sheet>
    );
};
