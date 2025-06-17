import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { JobCard } from "@/components/jobs/job-card";
import { PhotoUpload } from "@/components/upload/photo-upload";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Camera,
  FileText,
  User,
  HardHat,
  Play,
  Square
} from "lucide-react";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myJobs } = useQuery({
    queryKey: ["/api/jobs/my"],
    select: (data: any) => data || [],
  });

  const { data: currentTimeTracking } = useQuery({
    queryKey: ["/api/time-tracking/current"],
    select: (data: any) => data,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/time-tracking/clock-in", {
        location: { lat: 40.7128, lng: -74.0060 } // Mock location
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking/current"] });
      toast({ title: "Clocked in successfully" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/time-tracking/clock-out", {
        location: { lat: 40.7128, lng: -74.0060 } // Mock location
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-tracking/current"] });
      toast({ title: "Clocked out successfully" });
    },
  });

  const sidebarItems = [
    { icon: Briefcase, label: "My Jobs", href: "/worker", active: true },
    { icon: Clock, label: "Time Tracking", href: "/worker/time" },
    { icon: Camera, label: "Photo Reports", href: "/worker/photos" },
    { icon: FileText, label: "Reports", href: "/worker/reports" },
    { icon: User, label: "Profile", href: "/worker/profile" },
  ];

  const todayJobs = myJobs?.filter((job: any) => {
    const today = new Date();
    const jobDate = new Date(job.scheduledAt || job.createdAt);
    return jobDate.toDateString() === today.toDateString();
  }) || [];

  const pendingJobs = myJobs?.filter((job: any) => 
    ['assigned', 'in_progress'].includes(job.status)
  ) || [];

  const completedThisWeek = myJobs?.filter((job: any) => {
    if (job.status !== 'completed' || !job.completedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(job.completedAt) > weekAgo;
  })?.length || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        title="Worker Dashboard" 
        icon={HardHat}
        iconColor="text-orange-500"
        showStatus={true}
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          {/* Clock In/Out and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-green-600 dark:text-green-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentTimeTracking ? "Currently clocked in" : "Currently clocked out"}
                </p>
                <Button 
                  variant={currentTimeTracking ? "destructive" : "default"}
                  className="w-full"
                  onClick={() => currentTimeTracking ? clockOutMutation.mutate() : clockInMutation.mutate()}
                  disabled={clockInMutation.isPending || clockOutMutation.isPending}
                >
                  {currentTimeTracking ? <Square className="mr-2" size={16} /> : <Play className="mr-2" size={16} />}
                  {currentTimeTracking ? "Clock Out" : "Clock In"}
                </Button>
                {currentTimeTracking && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Started: {new Date(currentTimeTracking.clockInTime).toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-blue-600 dark:text-blue-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Today's Jobs</h3>
                <p className="text-3xl font-bold">{todayJobs.length}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingJobs.length} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold mb-2">This Week</h3>
                <p className="text-3xl font-bold">{completedThisWeek}</p>
                <p className="text-sm text-muted-foreground">Jobs completed</p>
              </CardContent>
            </Card>
          </div>

          {/* My Jobs */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Assigned Jobs</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select className="px-3 py-1 border rounded-lg text-sm bg-background">
                    <option>Priority</option>
                    <option>Date</option>
                    <option>Location</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myJobs?.map((job: any) => (
                  <JobCard key={job.id} job={job} />
                ))}
                
                {(!myJobs || myJobs.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto mb-2" size={48} />
                    <p>No assigned jobs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload and Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Photo Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit Job Report</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Status</label>
                    <select className="w-full px-3 py-2 border rounded-lg bg-background">
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Needs Materials</option>
                      <option>Issue Found</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Work Description</label>
                    <textarea 
                      rows={4} 
                      placeholder="Describe the work performed, any issues found, materials used..."
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Spent (hours)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      placeholder="2.5"
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    />
                  </div>

                  <Button className="w-full">
                    <FileText className="mr-2" size={16} />
                    Submit Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
