import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostel } from '@/contexts/HostelContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Trash2, Edit, Layers, DoorOpen, Users, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { MobileNav } from '@/components/MobileNav';

const Hostels = () => {
  const { hostels, addHostel, updateHostel, deleteHostel } = useHostel();
  const { owner } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<any>(null);
  const [formData, setFormData] = useState<{name: string, address: string, propertyType: 'owned'|'rented', rentAmount: string}>({ name: '', address: '', propertyType: 'owned', rentAmount: '' });

  const handleAdd = async () => {
    if (!formData.name || !formData.address) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      await addHostel({
        name: formData.name,
        address: formData.address,
        propertyType: formData.propertyType,
        rentAmount: formData.propertyType === 'rented' ? Number(formData.rentAmount) : 0,
        ownerId: owner?.id || 'default-owner',
        totalCapacity: 0
      });
      setFormData({ name: '', address: '', propertyType: 'owned', rentAmount: '' });
      setIsAddOpen(false);
      toast({ title: "Success", description: "Hostel added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add hostel", variant: "destructive" });
    }
  };

  const openEdit = (hostel: any) => {
    setEditingHostel(hostel);
    setFormData({ name: hostel.name, address: hostel.address, propertyType: hostel.propertyType || 'owned', rentAmount: hostel.rentAmount ? hostel.rentAmount.toString() : '' });
  };

  const handleUpdate = async () => {
    if (!editingHostel) return;
    try {
      await updateHostel(editingHostel.id, { 
        name: formData.name, 
        address: formData.address,
        propertyType: formData.propertyType,
        rentAmount: formData.propertyType === 'rented' ? Number(formData.rentAmount) : 0
      });
      setEditingHostel(null);
      setFormData({ name: '', address: '', propertyType: 'owned', rentAmount: '' });
      toast({ title: "Success", description: "Hostel updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update hostel", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteHostel(id);
        toast({ title: "Success", description: "Hostel deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete hostel", variant: "destructive" });
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
        {/* Header - Desktop */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20 hidden md:block">
          <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
                Manage Hostels
              </h1>
              <p className="text-gray-400 text-sm mt-1">Configure your property portfolio and room structures</p>
            </div>
            {hostels.length === 0 && (
              <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                <Plus className="w-4 h-4" /> Add New Hostel
              </Button>
            )}
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gradient-to-b from-[#0f1f3a] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileNav />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Properties</h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Asset Management</p>
              </div>
            </div>
            {hostels.length === 0 && (
              <Button onClick={() => setIsAddOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 rounded-lg">
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{hostels.length} Active Portfolio(s)</p>
            </div>

            {hostels.length === 0 ? (
              <Card className="bg-[#0f1f3a] border-white/5 shadow-2xl">
                <CardContent className="py-20 text-center">
                  <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-10 h-10 text-emerald-500 opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Properties Found</h3>
                  <p className="text-gray-400 max-w-xs mx-auto mb-8">Start by adding your first hostel building to the system.</p>
                  <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600">Initialize First Property</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map(hostel => {
                  const floors = hostel.floors.length;
                  const rooms = hostel.floors.reduce((a, f) => a + f.rooms.length, 0);
                  const students = hostel.floors.reduce((a, f) =>
                    a + f.rooms.reduce((r, room) => r + room.students.length, 0), 0);

                  return (
                    <Card key={hostel.id} className="bg-[#0f1f3a] border-white/5 overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
                      <div className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-6 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="cursor-pointer flex-1" onClick={() => navigate(`/hostels/${hostel.id}`)}>
                            <CardTitle className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {hostel.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-gray-500 text-xs mt-2 uppercase font-bold tracking-tight">
                              <MapPin className="w-3 h-3 text-red-400" /> {hostel.address}
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => openEdit(hostel)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(hostel.id, hostel.name)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-4">
                        <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5 mb-4">
                          <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Floors</p>
                            <div className="flex items-center justify-center gap-1.5 font-bold text-white">
                              <Layers className="w-3 h-3 text-emerald-400" /> {floors}
                            </div>
                          </div>
                          <div className="text-center border-x border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Rooms</p>
                            <div className="flex items-center justify-center gap-1.5 font-bold text-white">
                              <DoorOpen className="w-3 h-3 text-blue-400" /> {rooms}
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Live</p>
                            <div className="flex items-center justify-center gap-1.5 font-bold text-white">
                              <Users className="w-3 h-3 text-purple-400" /> {students}
                            </div>
                          </div>
                        </div>
                        <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest h-10 border border-white/5" onClick={() => navigate(`/hostels/${hostel.id}`)}>
                          View Structure
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Dialogs */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogContent className="bg-[#0f1f3a] border-gray-700 text-white">
                <DialogHeader><DialogTitle>Register Property</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Hostel Name</Label>
                    <Input placeholder="e.g. Skyline Residency" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="bg-gray-800 border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input placeholder="Full street address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="bg-gray-800 border-gray-700" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <div className="flex gap-4 p-2 bg-gray-800/50 rounded-md border border-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.propertyType === 'owned'} onChange={() => setFormData(prev => ({ ...prev, propertyType: 'owned' }))} className="text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500" />
                        <span className="text-sm">Owned Property</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.propertyType === 'rented'} onChange={() => setFormData(prev => ({ ...prev, propertyType: 'rented' }))} className="text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500" />
                        <span className="text-sm">Rented Property</span>
                      </label>
                    </div>
                  </div>

                  {formData.propertyType === 'rented' && (
                    <div className="space-y-2">
                      <Label>Monthly Rent Amount to pay Building Owner (₹)</Label>
                      <Input type="number" min="0" placeholder="e.g. 50000" value={formData.rentAmount} onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))} className="bg-gray-800 border-gray-700" />
                    </div>
                  )}

                  <Button onClick={handleAdd} className="w-full bg-emerald-600 hover:bg-emerald-700">Add Property</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!editingHostel} onOpenChange={(open) => !open && setEditingHostel(null)}>
              <DialogContent className="bg-[#0f1f3a] border-gray-700 text-white">
                <DialogHeader><DialogTitle>Edit Property</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Hostel Name</Label>
                    <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="bg-gray-800 border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="bg-gray-800 border-gray-700" />
                  </div>

                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <div className="flex gap-4 p-2 bg-gray-800/50 rounded-md border border-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.propertyType === 'owned'} onChange={() => setFormData(prev => ({ ...prev, propertyType: 'owned' }))} className="text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500" />
                        <span className="text-sm">Owned Property</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={formData.propertyType === 'rented'} onChange={() => setFormData(prev => ({ ...prev, propertyType: 'rented' }))} className="text-emerald-500 bg-gray-900 border-gray-700 focus:ring-emerald-500" />
                        <span className="text-sm">Rented Property</span>
                      </label>
                    </div>
                  </div>

                  {formData.propertyType === 'rented' && (
                    <div className="space-y-2">
                      <Label>Monthly Rent Amount to pay Building Owner (₹)</Label>
                      <Input type="number" min="0" placeholder="e.g. 50000" value={formData.rentAmount} onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))} className="bg-gray-800 border-gray-700" />
                    </div>
                  )}

                  <Button onClick={handleUpdate} className="w-full bg-emerald-600 hover:bg-emerald-700">Update Portfolio</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default Hostels;
