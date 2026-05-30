import React, { useState } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, MessageSquareWarning, CalendarClock, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useSearchParams } from 'react-router-dom';

const StudentPortal = () => {
  const { hostelId } = useParams();
  const [searchParams] = useSearchParams();
  const hostelName = searchParams.get('name');
  
  const { addComplaint, addAttendance } = useHostel();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('attendance');
  const [formData, setFormData] = useState({
    studentName: '',
    roomName: '',
    issue: '',
    attendanceStatus: 'present',
    reason: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentName.trim() || !formData.roomName.trim()) {
      toast({ title: "Please enter your name and room number", variant: "destructive" });
      return;
    }

    if (!hostelId) {
      toast({ title: "Invalid Portal Link", description: "Missing hostel reference in URL.", variant: "destructive" });
      return;
    }

    if (activeTab === 'complaints') {
      if (!formData.issue.trim()) {
        toast({ title: "Please describe your complaint", variant: "destructive" });
        return;
      }
      addComplaint({
        hostelId,
        studentName: formData.studentName,
        roomName: formData.roomName,
        issue: formData.issue
      });
      toast({ title: "Complaint submitted successfully" });
    } else {
      if (formData.attendanceStatus === 'absent' && !formData.reason.trim()) {
        toast({ title: "Please provide a reason for absence", variant: "destructive" });
        return;
      }
      addAttendance({
        hostelId,
        studentName: formData.studentName,
        roomName: formData.roomName,
        status: formData.attendanceStatus as 'present' | 'absent',
        reason: formData.attendanceStatus === 'absent' ? formData.reason : undefined
      });
      toast({ title: "Attendance recorded successfully" });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        studentName: '',
        roomName: '',
        issue: '',
        attendanceStatus: 'present',
        reason: ''
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0f1f3a] border-gray-700/50 text-white shadow-2xl">
        <CardHeader className="text-center pb-2 border-b border-gray-700/50 mb-4">
          <div className="mx-auto w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
            {hostelName ? `${hostelName} Portal` : 'Resident Portal'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Submit daily attendance or log a complaint for {hostelName || 'your hostel'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <h3 className="text-xl font-bold">Successfully Submitted!</h3>
              <p className="text-gray-400">Thank you. The management has received your submission.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Full Name *</Label>
                  <Input 
                    placeholder="e.g. John Doe"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="bg-gray-800 border-gray-700 focus:border-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Room Number / Name *</Label>
                  <Input 
                    placeholder="e.g. 101 or A-Wing"
                    value={formData.roomName}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                    className="bg-gray-800 border-gray-700 focus:border-orange-500"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 p-1">
                  <TabsTrigger value="attendance" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <CalendarClock className="w-4 h-4 mr-2" /> Attendance
                  </TabsTrigger>
                  <TabsTrigger value="complaints" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    <MessageSquareWarning className="w-4 h-4 mr-2" /> Complaint
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="attendance" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-3">
                    <Label>Today's Status</Label>
                    <RadioGroup 
                      value={formData.attendanceStatus} 
                      onValueChange={(val) => setFormData({ ...formData, attendanceStatus: val })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 p-3 rounded-lg flex-1 cursor-pointer hover:border-gray-500 transition-colors">
                        <RadioGroupItem value="present" id="present" />
                        <Label htmlFor="present" className="cursor-pointer flex-1">Present</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 p-3 rounded-lg flex-1 cursor-pointer hover:border-gray-500 transition-colors">
                        <RadioGroupItem value="absent" id="absent" />
                        <Label htmlFor="absent" className="cursor-pointer flex-1">Absent</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.attendanceStatus === 'absent' && (
                    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                      <Label className="text-red-400">Reason for Absence *</Label>
                      <Textarea 
                        placeholder="Please provide a brief reason..."
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="bg-gray-800 border-gray-700 focus:border-red-500 min-h-[80px]"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="complaints" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <Label className="text-red-400">Describe the Issue *</Label>
                    <Textarea 
                      placeholder="e.g. AC is not working, Water leaking in bathroom..."
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      className="bg-gray-800 border-gray-700 focus:border-red-500 min-h-[120px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold mt-6 shadow-lg shadow-blue-900/20">
                Submit {activeTab === 'attendance' ? 'Attendance' : 'Complaint'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPortal;
