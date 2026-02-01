import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHostel } from '@/contexts/HostelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, ArrowLeft, Trash2, Edit, Layers, DoorOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Hostels = () => {
  const { hostels, addHostel, updateHostel, deleteHostel } = useHostel();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    try {
      await addHostel({ ...formData, ownerId: 'default-owner' });
      setFormData({ name: '', address: '' });
      setIsAddOpen(false);
      toast({ title: "Hostel added successfully!" });
    } catch (error) {
      console.error('Error adding hostel:', error);
      toast({ title: "Failed to add hostel", description: "Please check the console for errors", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!editingHostel || !formData.name.trim() || !formData.address.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    try {
      await updateHostel(editingHostel, formData);
      setFormData({ name: '', address: '' });
      setEditingHostel(null);
      toast({ title: "Hostel updated successfully!" });
    } catch (error) {
      console.error('Error updating hostel:', error);
      toast({ title: "Failed to update hostel", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This will remove all floors, rooms, and students.`)) {
      try {
        await deleteHostel(id);
        toast({ title: "Hostel deleted successfully!" });
      } catch (error) {
        console.error('Error deleting hostel:', error);
        toast({ title: "Failed to delete hostel", variant: "destructive" });
      }
    }
  };

  const openEdit = (hostel: typeof hostels[0]) => {
    setFormData({ name: hostel.name, address: hostel.address });
    setEditingHostel(hostel.id);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Manage Hostels</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">{hostels.length} hostel(s)</p>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Hostel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Hostel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hostel Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Boys Hostel A"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g., 123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">Add Hostel</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {hostels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No hostels yet. Add your first hostel to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostels.map(hostel => {
              const floors = hostel.floors.length;
              const rooms = hostel.floors.reduce((a, f) => a + f.rooms.length, 0);
              const students = hostel.floors.reduce((a, f) =>
                a + f.rooms.reduce((r, room) => r + room.students.length, 0), 0);

              return (
                <Card key={hostel.id} className="group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() => navigate(`/hostels/${hostel.id}`)}
                      >
                        <CardTitle className="text-lg hover:text-primary transition-colors">
                          {hostel.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{hostel.address}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(hostel)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(hostel.id, hostel.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="flex gap-4 text-sm text-muted-foreground cursor-pointer"
                      onClick={() => navigate(`/hostels/${hostel.id}`)}
                    >
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {floors}
                      </span>
                      <span className="flex items-center gap-1">
                        <DoorOpen className="w-3 h-3" /> {rooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {students}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingHostel} onOpenChange={(open) => !open && setEditingHostel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Hostel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Hostel Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <Button onClick={handleUpdate} className="w-full">Update Hostel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Hostels;
