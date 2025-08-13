import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Building,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { User, Assessment, Project } from "@shared/schema";

interface AssessmentWithUser extends Assessment {
  user: Pick<User, 'id' | 'fullName' | 'companyName' | 'email' | 'createdAt'>;
}

interface ProjectWithUser extends Project {
  user: Pick<User, 'id' | 'fullName' | 'companyName' | 'email'>;
}

export default function ManagementDashboardPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [strategyFilter, setStrategyFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentWithUser | null>(null);

  // Fetch all assessments with user data
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<AssessmentWithUser[]>({
    queryKey: ["/api/management/assessments"],
    enabled: user?.role === 'manager' || user?.role === 'admin',
  });

  // Fetch all projects with user data
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithUser[]>({
    queryKey: ["/api/management/projects"],
    enabled: user?.role === 'manager' || user?.role === 'admin',
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/management/users"],
    enabled: user?.role === 'manager' || user?.role === 'admin',
  });

  // Check authorization
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600">You don't have permission to access the management dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = !searchTerm || 
      assessment.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStrategy = strategyFilter === "all" || assessment.recommendedStrategy === strategyFilter;
    const matchesRisk = riskFilter === "all" || assessment.riskLevel === riskFilter;
    
    return matchesSearch && matchesStrategy && matchesRisk;
  });

  // Calculate statistics
  const stats = {
    totalAssessments: assessments.length,
    totalUsers: users.length,
    totalProjects: projects.length,
    completionRate: users.length > 0 ? ((assessments.length / users.length) * 100).toFixed(1) : '0',
    strategies: {
      greenfield: assessments.filter(a => a.recommendedStrategy === 'greenfield').length,
      brownfield: assessments.filter(a => a.recommendedStrategy === 'brownfield').length,
      hybrid: assessments.filter(a => a.recommendedStrategy === 'hybrid').length,
    },
    riskLevels: {
      low: assessments.filter(a => a.riskLevel === 'low').length,
      medium: assessments.filter(a => a.riskLevel === 'medium').length,
      high: assessments.filter(a => a.riskLevel === 'high').length,
    },
    recentAssessments: assessments.filter(a => {
      const daysDiff = (new Date().getTime() - new Date(a.completedAt).getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    }).length
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'greenfield': return 'text-green-600 bg-green-50';
      case 'brownfield': return 'text-blue-600 bg-blue-50';
      case 'hybrid': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Management Dashboard</h1>
          <p className="text-slate-600">Monitor and analyze customer assessments and project data</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.recentAssessments} completed this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completionRate}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Migration projects in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.riskLevels.high}</div>
              <p className="text-xs text-muted-foreground">
                Assessments requiring attention
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      <SelectItem value="greenfield">Greenfield</SelectItem>
                      <SelectItem value="brownfield">Brownfield</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{assessment.user.fullName || 'Unknown'}</div>
                              <div className="text-sm text-slate-500">{assessment.user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-slate-400" />
                              {assessment.user.companyName || 'Not provided'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStrategyColor(assessment.recommendedStrategy || '')}>
                              {assessment.recommendedStrategy || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRiskBadgeVariant(assessment.riskLevel || '')}>
                              {assessment.riskLevel || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {assessment.timelineEstimate || 'Not estimated'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-500">
                              {new Date(assessment.completedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAssessment(assessment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cycle</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{project.user.fullName}</div>
                              <div className="text-sm text-slate-500">{project.user.companyName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStrategyColor(project.strategy)}>
                              {project.strategy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            Cycle {project.currentCycle} ({project.cyclePhase})
                          </TableCell>
                          <TableCell>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Assessment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const hasAssessment = assessments.some(a => a.userId === user.id);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.fullName || 'Unknown'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.companyName || 'Not provided'}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'manager' ? 'default' : 'outline'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {hasAssessment ? (
                                <Badge variant="default">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Greenfield</span>
                      <span className="text-sm font-medium">{stats.strategies.greenfield}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(stats.strategies.greenfield / stats.totalAssessments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Brownfield</span>
                      <span className="text-sm font-medium">{stats.strategies.brownfield}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(stats.strategies.brownfield / stats.totalAssessments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hybrid</span>
                      <span className="text-sm font-medium">{stats.strategies.hybrid}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(stats.strategies.hybrid / stats.totalAssessments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Low Risk</span>
                      <span className="text-sm font-medium">{stats.riskLevels.low}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(stats.riskLevels.low / stats.totalAssessments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium Risk</span>
                      <span className="text-sm font-medium">{stats.riskLevels.medium}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(stats.riskLevels.medium / stats.totalAssessments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High Risk</span>
                      <span className="text-sm font-medium">{stats.riskLevels.high}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(stats.riskLevels.high / stats.totalAssessments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Assessment Detail Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4"
                  onClick={() => setSelectedAssessment(null)}
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Customer</label>
                    <p className="text-sm text-slate-600">{selectedAssessment.user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <p className="text-sm text-slate-600">{selectedAssessment.user.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-slate-600">{selectedAssessment.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Completed</label>
                    <p className="text-sm text-slate-600">
                      {new Date(selectedAssessment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Recommended Strategy</label>
                    <Badge className={getStrategyColor(selectedAssessment.recommendedStrategy || '')}>
                      {selectedAssessment.recommendedStrategy}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Risk Level</label>
                    <Badge variant={getRiskBadgeVariant(selectedAssessment.riskLevel || '')}>
                      {selectedAssessment.riskLevel}
                    </Badge>
                  </div>
                </div>
                
                {selectedAssessment.recommendation && (
                  <div>
                    <label className="text-sm font-medium">Recommendation</label>
                    <p className="text-sm text-slate-600 mt-1">{selectedAssessment.recommendation}</p>
                  </div>
                )}

                {selectedAssessment.responses && (
                  <div>
                    <label className="text-sm font-medium">Assessment Responses</label>
                    <pre className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedAssessment.responses, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}