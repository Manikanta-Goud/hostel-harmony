import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HostelProvider } from "@/contexts/HostelContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Hostels from "./pages/Hostels";
import HostelDetail from "./pages/HostelDetail";
import Rooms from "./pages/Rooms";
import Students from "./pages/Students";
import Families from "./pages/Families";
import StaffOverview from "./pages/StaffOverview";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import Requirements from "./pages/Requirements";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <HostelProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/hostels" element={
                <ProtectedRoute><Hostels /></ProtectedRoute>
              } />
              <Route path="/hostels/:hostelId" element={
                <ProtectedRoute><HostelDetail /></ProtectedRoute>
              } />
              <Route path="/rooms" element={
                <ProtectedRoute><Rooms /></ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute><Students /></ProtectedRoute>
              } />
              <Route path="/families" element={
                <ProtectedRoute><Families /></ProtectedRoute>
              } />
              <Route path="/staff" element={
                <ProtectedRoute><StaffOverview /></ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute><Payments /></ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute><Expenses /></ProtectedRoute>
              } />
              <Route path="/requirements" element={
                <ProtectedRoute><Requirements /></ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HostelProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
