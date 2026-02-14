import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, MapPin, Briefcase, Calendar, CreditCard, Trash2, Pencil, Save, X, Clock } from 'lucide-react';
import { useHostel } from '@/contexts/HostelContext';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, differenceInMonths } from 'date-fns';

interface StudentProfileDialogProps {
    student: any;
    isOpen: boolean;
    onClose: () => void;
    hostelId: string;
    floorId: string;
}

// Helper function to convert date string (yyyy-MM-dd) to ISO string without timezone issues
function formatDateToISO(dateString: string): string {
    // Parse the date string manually to avoid timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in UTC to avoid local timezone shift
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return date.toISOString();
}

export function StudentProfileDialog({ student, isOpen, onClose, hostelId, floorId }: StudentProfileDialogProps) {
    const { updateStudent, deleteStudent, recordPayment, payments } = useHostel();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});

    // Payment State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        nextPaymentDate: ''
    });

    const currentMonth = format(new Date(), 'yyyy-MM');

    // Load latest student data or use prop? 
    // Prop might be stale if we update context. Ideally we find the student from context again, 
    // but for now let's assume prop is okay or we'll refresh on edit success.

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                phone: student.phone,
                email: student.email || '',
                emergencyContact: student.emergencyContact || '',
                monthlyRent: student.monthlyRent,
                joinDate: student.joinDate ? student.joinDate.split('T')[0] : '',
                aadharNumber: student.aadharNumber || '',
                permanentAddress: student.permanentAddress || '',
                occupation: student.occupation || '',
                workAddress: student.workAddress || '',
                fatherName: student.fatherName || '',
                motherName: student.motherName || '',
                parentPhone: student.parentPhone || '',
                memberCount: student.memberCount || 1,
            });
        }
    }, [student, isOpen]);

    const paymentInfo = useMemo(() => {
        if (!student) return { status: 'due', amount: 0 };
        const p = payments.find(pay => pay.studentId === student.id && pay.month === currentMonth);
        return p || { status: 'due', amount: 0 };
    }, [student, payments, currentMonth]);

    // Calculate stay statistics
    const stayStats = useMemo(() => {
        if (!student?.joinDate) return null;

        const joinDate = new Date(student.joinDate);
        const today = new Date();

        const totalDays = differenceInDays(today, joinDate);
        const totalMonths = differenceInMonths(today, joinDate);




        return {
            joinDate,
            totalDays,
            totalMonths
        };
    }, [student]);


    const handleEditSave = async () => {
        try {
            await updateStudent(hostelId, floorId, student.roomId, student.id, {
                ...formData,
                monthlyRent: Number(formData.monthlyRent),
                memberCount: Number(formData.memberCount),
                joinDate: formData.joinDate ? formatDateToISO(formData.joinDate) : undefined,
                // Fields that might be empty strings should be null or undefined if optional?
                // Context handles undefined, but empty string might pass through.
                email: formData.email || undefined,
                aadharNumber: formData.aadharNumber || undefined,
                // ... etc
            });
            setIsEditing(false);
            toast({ title: "Profile updated successfully" });
        } catch (e) {
            console.error('Update error:', e);
            console.error('Error details:', JSON.stringify(e, null, 2));
            toast({
                title: "Failed to update profile",
                description: (e as any)?.message || (e as any)?.hint || String(e),
                variant: "destructive"
            });
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this occupant? This action cannot be undone.")) return;
        try {
            await deleteStudent(hostelId, floorId, student.roomId, student.id);
            toast({ title: "Occupant deleted" });
            onClose();
        } catch (e) {
            toast({ title: "Falied to delete", variant: "destructive" });
        }
    };

    const paymentStatus = paymentInfo.status;

    const handlePayment = async () => {
        try {
            const amountPaid = Number(paymentForm.amount);
            const rent = student.monthlyRent;
            const status = amountPaid >= rent ? 'paid' : (amountPaid > 0 ? 'partial' : 'due');
            const nextDate = paymentForm.nextPaymentDate ? new Date(paymentForm.nextPaymentDate).toISOString() : undefined;

            await recordPayment({
                studentId: student.id,
                amount: amountPaid,
                month: currentMonth,
                status: status,
                paidDate: new Date().toISOString(),
                remainingAmount: Math.max(0, rent - amountPaid),
                nextPaymentDate: nextDate
            });
            setIsPaymentOpen(false);
            toast({ title: `Payment recorded as ${status}` });
        } catch (e) {
            toast({ title: "Payment failed", variant: "destructive" });
        }
    };

    if (!student) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl bg-[#1a2332] text-white border-gray-700 max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-2xl font-bold flex flex-col">
                            {isEditing ? 'Edit Profile' : student.name}
                            {!isEditing && <span className="text-sm font-normal text-gray-400 mt-1">{student.occupation || 'Occupant'}</span>}
                        </DialogTitle>
                        {!isEditing && (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                paymentStatus === 'partial' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                {paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'partial' ? 'Partial' : 'Due'}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
                    <div className="p-6 pb-20">
                        {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name *</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Aadhar Number</Label>
                                    <Input value={formData.aadharNumber} onChange={e => setFormData({ ...formData, aadharNumber: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Rent</Label>
                                    <Input type="number" value={formData.monthlyRent} onChange={e => setFormData({ ...formData, monthlyRent: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Join Date</Label>
                                    <Input type="date" value={formData.joinDate} onChange={e => setFormData({ ...formData, joinDate: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Occupation</Label>
                                    <Input value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} className="bg-[#0f1f3a] border-gray-600" placeholder="Student / Employee" />
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <Label>Permanent Address</Label>
                                    <Input value={formData.permanentAddress} onChange={e => setFormData({ ...formData, permanentAddress: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label>Work/College Address</Label>
                                    <Input value={formData.workAddress} onChange={e => setFormData({ ...formData, workAddress: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Father's Name</Label>
                                    <Input value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mother's Name</Label>
                                    <Input value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Parent Phone</Label>
                                    <Input value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} className="bg-[#0f1f3a] border-gray-600" />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-white">{student.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-white">Joined: {student.joinDate ? format(new Date(student.joinDate), 'PPP') : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Briefcase className="w-4 h-4" />
                                        <span className="text-white">{student.occupation || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <CreditCard className="w-4 h-4" />
                                        <span className="text-white">Rent: ₹{student.monthlyRent}</span>
                                    </div>
                                </div>

                                {/* Stay Statistics Card */}
                                {stayStats && (
                                    <div className="bg-gradient-to-br from-orange-500/10 to-purple-500/10 p-4 rounded-lg border border-orange-500/20 space-y-3">
                                        <h4 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Stay Statistics
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400">Joined On</p>
                                                <p className="text-white font-semibold">{format(stayStats.joinDate, 'PPP')}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400">Total Days</p>
                                                <p className="text-white font-semibold text-lg">{stayStats.totalDays} days</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-400">Total Months</p>
                                                <p className="text-white font-semibold text-lg">{stayStats.totalMonths} months</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Address Card */}
                                <div className="bg-[#0f1f3a] p-4 rounded-lg space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Addresses
                                    </h4>
                                    <div className="text-sm text-gray-400">
                                        <p><strong className="text-gray-500">Permanent:</strong> {student.permanentAddress || 'Not provided'}</p>
                                        <p className="mt-1"><strong className="text-gray-500">Work/College:</strong> {student.workAddress || 'Not provided'}</p>
                                    </div>
                                </div>

                                {/* Family Details */}
                                <div className="bg-[#0f1f3a] p-4 rounded-lg space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Family Details
                                    </h4>
                                    <div className="text-sm text-gray-400 grid grid-cols-2 gap-2">
                                        <p><strong className="text-gray-500">Father:</strong> {student.fatherName || '-'}</p>
                                        <p><strong className="text-gray-500">Mother:</strong> {student.motherName || '-'}</p>
                                        <p className="col-span-2"><strong className="text-gray-500">Parent Phone:</strong> {student.parentPhone || '-'}</p>
                                    </div>
                                </div>

                                {/* Aadhar */}
                                {student.aadharNumber && (
                                    <div className="bg-[#0f1f3a] p-4 rounded-lg">
                                        <p className="text-sm text-gray-400">
                                            <strong className="text-gray-500">Aadhar Number:</strong> {student.aadharNumber}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {!isPaymentOpen && (
                    <DialogFooter className="p-4 border-t border-gray-700 bg-[#1a2332]">
                        {isEditing ? (
                            <div className="flex gap-2 w-full">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 text-gray-400">Cancel</Button>
                                <Button onClick={handleEditSave} className="flex-1 bg-green-600 hover:bg-green-700">
                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="destructive"
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <div className="flex-1 flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                                    </Button>
                                    <Button
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                        onClick={() => {
                                            setIsPaymentOpen(true);
                                            setPaymentForm({
                                                amount: paymentStatus === 'paid' ? student.monthlyRent : ((paymentInfo as any).remainingAmount || student.monthlyRent),
                                                nextPaymentDate: ''
                                            });
                                        }}
                                    >
                                        <IndianRupee className="w-4 h-4 mr-1" />
                                        {paymentStatus === 'paid' ? 'Paid' : 'Pay Rent'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogFooter>
                )}

                {/* Inline Payment Dialog Logic */}
                {isPaymentOpen && (
                    <div className="p-4 border-t border-gray-700 bg-[#0f1f3a] animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Record Payment</h3>
                            <Button size="sm" variant="ghost" onClick={() => setIsPaymentOpen(false)}><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-400 text-xs">Total Rent</Label>
                                    <div className="text-xl font-bold text-white">₹{student.monthlyRent}</div>
                                </div>
                                <div>
                                    <Label className="text-gray-400 text-xs">Pending</Label>
                                    <div className="text-xl font-bold text-orange-400">
                                        ₹{Math.max(0, student.monthlyRent - paymentForm.amount)}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label>Amount Paid via this transaction</Label>
                                <Input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={e => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                    className="bg-[#1a2332] border-gray-600 text-lg"
                                />
                            </div>
                            {paymentForm.amount < student.monthlyRent && paymentForm.amount > 0 && (
                                <div className="space-in-2">
                                    <Label>Promise Date for Remaining Balance</Label>
                                    <Input
                                        type="date"
                                        value={paymentForm.nextPaymentDate}
                                        onChange={e => setPaymentForm(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                                        className="bg-[#1a2332] border-gray-600"
                                    />
                                </div>
                            )}
                            <Button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-700">
                                Confirm {paymentForm.amount >= student.monthlyRent ? 'Full Payment' : 'Partial Payment'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function IndianRupee({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5-10" /><path d="M6 13h3" /><path d="M9 13c6.627 0 12 5.373 12 12" />
        </svg>
    )
}
