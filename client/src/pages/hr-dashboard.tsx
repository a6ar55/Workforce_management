import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { InteractiveMap } from "@/components/maps/interactive-map";
import { JobForm } from "@/components/jobs/job-form";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { useQuery } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";
import { 
  Users, 
  Play, 
  CheckCircle, 
  Clock,
  MapPin,
  Plus,
  UserRoundCheck,
  TrendingUp,
  Briefcase
} from "lucide-react";

export default function HRDashboard() {
  useRealtime();

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    select: (data: any) => data,
  });

  const { data: unassignedJobs } = useQuery({
    queryKey: ["/api/jobs", { status: "pending" }],
    select: (data: any) => data || [],
  });

  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data || [],
  });

  const sidebarItems = [
    { icon: TrendingUp, label: "Overview", href: "/hr", active: true },
    { icon: MapPin, label: "Job Map", href: "/hr/map" },
    { icon: Plus, label: "Create Job", href: "/hr/create" },
    { icon: Users, label: "Workers", href: "/hr/workers" },
  ];

  const metricCards = [
    {
      title: "Total Workers",
      value: metrics?.totalWorkers || 0,
      change: `${metrics?.availableWorkers || 0} available`,
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Jobs", 
      value: metrics?.activeJobs || 0,
      change: "In progress",
      icon: Play,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Completed Today",
      value: metrics?.completedToday || 0,
      change: "+3 from yesterday",
      icon: CheckCircle,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Pending Assignment",
      value: metrics?.pendingAssignment || 0,
      change: "Needs attention",
      icon: Clock,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

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
        title="HR Dashboard" 
        icon={UserRoundCheck}
        iconColor="text-blue-500"
      />
      
      <div className="flex">
        <Sidebar items={sidebarItems} />
        
        <main className="flex-1 p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((metric) => (
              <Card key={metric.title} className="animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${metric.bgColor} rounded-xl flex items-center justify-center`}>
                        <metric.icon className={metric.iconColor} size={24} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{metric.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Map and Job Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Job Map</CardTitle>
              </CardHeader>
              <CardContent>
                <InteractiveMap workers={workers} jobs={unassignedJobs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Job</CardTitle>
              </CardHeader>
              <CardContent>
                <JobForm />
              </CardContent>
            </Card>
          </div>

          {/* Unassigned Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unassigned Jobs</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {unassignedJobs?.length || 0} jobs pending assignment
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unassignedJobs?.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                        <Briefcase className="text-orange-600 dark:text-orange-400" size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{job.title}</h4>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.location?.address}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <select className="px-3 py-1 border rounded-lg text-sm bg-background">
                        <option>Select Worker</option>
                        {workers?.filter((w: any) => w.status === 'available').map((worker: any) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.user?.name} (Available)
                          </option>
                        ))}
                      </select>
                      <Button size="sm">Assign</Button>
                    </div>
                  </div>
                ))}
                
                {(!unassignedJobs || unassignedJobs.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="mx-auto mb-2" size={48} />
                    <p>No unassigned jobs</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
