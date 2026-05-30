import React, { useState } from 'react';
import { useHostel } from '@/contexts/HostelContext';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquareWarning, CalendarClock, CheckCircle2, User, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

const StudentDesk = () => {
  const { complaints, attendance, resolveComplaint } = useHostel();
  const [activeTab, setActiveTab] = useState('complaints');

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col bg-[#0a0f1a] text-white">
        {/* Header */}
        <header className="bg-[#0f1f3a] border-b border-gray-700/50 p-6 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400 flex items-center gap-3">
              <MessageSquareWarning className="w-8 h-8 text-orange-500" />
              Resident Desk
            </h1>
            <p className="text-gray-400 mt-2">Manage student complaints and view daily attendance</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-[#0f1f3a] border border-gray-700/50 p-1 w-full max-w-md grid grid-cols-2">
                <TabsTrigger value="complaints" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  Complaints ({complaints.filter(c => c.status === 'open').length})
                </TabsTrigger>
                <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Attendance
                </TabsTrigger>
              </TabsList>

              {/* COMPLAINTS TAB */}
              <TabsContent value="complaints" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {complaints.length === 0 ? (
                  <Card className="bg-[#0f1f3a] border-dashed border-gray-700">
                    <CardContent className="py-20 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
                      <p className="text-gray-400">There are no complaints submitted by students.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complaints.map(complaint => (
                      <Card key={complaint.id} className="bg-[#0f1f3a] border-gray-700/50 hover:border-orange-500/50 transition-colors group flex flex-col">
                        <CardHeader className="pb-3 border-b border-gray-800">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-4 h-4 text-orange-400" />
                                {complaint.studentName}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                <MapPin className="w-3 h-3 text-red-400" /> Room: {complaint.roomName}
                              </CardDescription>
                            </div>
                            <Badge className={complaint.status === 'open' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}>
                              {complaint.status.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            <p className="text-gray-300 text-sm italic border-l-2 border-orange-500/50 pl-3">
                              "{complaint.issue}"
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {format(new Date(complaint.date), 'MMM dd, yyyy - hh:mm a')}
                            </div>
                          </div>
                          
                          {complaint.status === 'open' && (
                            <Button 
                              onClick={() => resolveComplaint(complaint.id)}
                              className="w-full mt-4 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Resolved
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ATTENDANCE TAB */}
              <TabsContent value="attendance" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {attendance.length === 0 ? (
                  <Card className="bg-[#0f1f3a] border-dashed border-gray-700">
                    <CardContent className="py-20 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <CalendarClock className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Records Yet</h3>
                      <p className="text-gray-400">Students have not submitted any attendance records.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="bg-[#0f1f3a] rounded-xl border border-gray-700/50 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50 border-b border-gray-700/50">
                          <tr>
                            <th className="px-6 py-4 font-bold">Resident</th>
                            <th className="px-6 py-4 font-bold">Room</th>
                            <th className="px-6 py-4 font-bold">Date & Time</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold">Remarks / Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record) => (
                            <tr key={record.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-400" />
                                {record.studentName}
                              </td>
                              <td className="px-6 py-4 text-gray-400">
                                {record.roomName}
                              </td>
                              <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                                {format(new Date(record.date), 'MMM dd, yyyy HH:mm')}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className={record.status === 'present' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}>
                                  {record.status.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                {record.status === 'absent' ? (
                                  <span className="text-red-300/80 italic text-xs block max-w-xs truncate" title={record.reason}>
                                    {record.reason}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default StudentDesk;
