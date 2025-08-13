import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Clock, Users, Target, ArrowLeft } from 'lucide-react';
import { HillChart } from '@/components/shape-up/hill-chart';
import { InteractiveHillChart } from '@/components/shape-up/interactive-hill-chart';
import { BettingTable } from '@/components/shape-up/betting-table';
import { PitchCreationModal } from '@/components/shape-up/pitch-creation-modal';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { Project } from '@shared/schema';

export default function ShapeUpPage() {
  const params = useParams();
  const projectId = params.projectId;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPitchModal, setShowPitchModal] = useState(false);

  // Fetch all projects for project selection if no projectId
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: !projectId,
  });

  // If no projectId, show project selection
  if (!projectId) {
    if (projectsLoading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading projects...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-slate-900">Shape Up Projects</h1>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-8">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No Projects Available</h2>
              <p className="text-slate-500 mb-6">Create a project first to access Shape Up methodology features.</p>
              <Button onClick={() => setLocation('/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Select a project to manage with Shape Up:</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setLocation(`/shape-up/${project.id}`)}>
                    <CardHeader>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline">{project.strategy}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-2">
                        Cycle {project.currentCycle || 1} - {project.cyclePhase || 'planning'}
                      </p>
                      <Button size="sm" className="w-full">
                        Manage with Shape Up →
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: getQueryFn(),
    enabled: !!projectId,
  });

  // Fetch pitches for this project
  const { data: pitches = [], isLoading: pitchesLoading } = useQuery({
    queryKey: ['/api/pitches', projectId],
    queryFn: getQueryFn(),
    enabled: !!projectId,
  });

  // Fetch work packages for hill charts
  const { data: workPackages = [], isLoading: workPackagesLoading } = useQuery({
    queryKey: ['/api/work-packages', projectId],
    queryFn: getQueryFn(),
    enabled: !!projectId,
  });

  // Create new pitch mutation
  const createPitchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/pitches', {
        ...data,
        projectId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pitches', projectId] });
      toast({
        title: 'Success',
        description: 'Pitch created successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create pitch: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update pitch status mutation (for betting)
  const updatePitchMutation = useMutation({
    mutationFn: async ({ pitchId, status, notes }: { pitchId: string; status: string; notes?: string }) => {
      const response = await apiRequest('PATCH', `/api/pitches/${pitchId}`, {
        status,
        bettingNotes: notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pitches', projectId] });
      toast({
        title: 'Success',
        description: 'Pitch status updated successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update pitch: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update work package position mutation (for hill chart)
  const updateWorkPackageMutation = useMutation({
    mutationFn: async ({ workPackageId, position, phase }: { workPackageId: string; position: number; phase: string }) => {
      const response = await apiRequest('PATCH', `/api/work-packages/${workPackageId}`, {
        position,
        phase,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-packages', projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update work package: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create work package mutation (for adding new scopes to hill chart)
  const createWorkPackageMutation = useMutation({
    mutationFn: async ({ pitchId, name, description }: { pitchId: string; name: string; description?: string }) => {
      const response = await apiRequest('POST', '/api/work-packages', {
        pitchId,
        name,
        description,
        position: 10, // Start at beginning of uphill
        phase: 'uphill',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-packages', projectId] });
      toast({
        title: 'Success',
        description: 'Work package created successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create work package: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleCreatePitch = (data: any) => {
    createPitchMutation.mutate(data);
  };

  const handleUpdatePitchStatus = (pitchId: string, status: string, notes?: string) => {
    updatePitchMutation.mutate({ pitchId, status, notes });
  };

  const handleUpdateWorkPackagePosition = (workPackageId: string, position: number, phase: 'uphill' | 'downhill') => {
    updateWorkPackageMutation.mutate({ workPackageId, position, phase });
  };

  const handleAddWorkPackage = (pitchId: string) => (name: string, description?: string) => {
    createWorkPackageMutation.mutate({ pitchId, name, description });
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Project Not Found</h2>
            <p className="text-slate-600">The requested project could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canBet = user?.role === 'manager' || user?.role === 'admin';
  const activePitches = pitches.filter((p: any) => p.status === 'active');
  const selectedPitches = pitches.filter((p: any) => p.status === 'selected');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
              <p className="text-slate-600 mt-2">Shape Up Project Management • {project.strategy} Strategy</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                Cycle {project.currentCycle}
              </Badge>
              <Badge variant="outline">
                <Clock className="w-4 h-4 mr-1" />
                {project.buildCycleDuration}w cycles
              </Badge>
              <Button
                onClick={() => setShowPitchModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Pitch
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="hill-charts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hill-charts" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Hill Charts
            </TabsTrigger>
            <TabsTrigger value="betting-table" className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Betting Table
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Hill Charts Tab */}
          <TabsContent value="hill-charts">
            <div className="space-y-6">
              {activePitches.length > 0 ? (
                activePitches.map((pitch: any) => {
                  const pitchWorkPackages = workPackages.filter((wp: any) => wp.pitchId === pitch.id);
                  return (
                    <InteractiveHillChart
                      key={pitch.id}
                      workPackages={pitchWorkPackages}
                      onUpdatePosition={handleUpdateWorkPackagePosition}
                      onAddWorkPackage={handleAddWorkPackage(pitch.id)}
                      pitchTitle={pitch.title}
                    />
                  );
                })
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <TrendingUp className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">No Active Pitches</h2>
                    <p className="text-slate-600 mb-4">
                      Create and select pitches through the betting table to see their progress here.
                    </p>
                    <Button
                      onClick={() => setShowPitchModal(true)}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Pitch
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Betting Table Tab */}
          <TabsContent value="betting-table">
            <BettingTable
              pitches={pitches}
              onUpdatePitchStatus={handleUpdatePitchStatus}
              currentCycle={project.currentCycle}
              canBet={canBet}
            />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cycle Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Cycle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cycle Number</span>
                      <Badge>{project.currentCycle}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-medium">{project.buildCycleDuration} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cool-down</span>
                      <span className="font-medium">{project.cooldownCycleDuration} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phase</span>
                      <Badge variant="outline">{project.cyclePhase}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pitch Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pitches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Shaped</span>
                      <span className="font-medium">{pitches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Selected</span>
                      <span className="font-medium text-green-600">{selectedPitches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Active</span>
                      <span className="font-medium text-blue-600">{activePitches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Completed</span>
                      <span className="font-medium text-slate-600">
                        {pitches.filter((p: any) => p.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Work Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Work Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Work Packages</span>
                      <span className="font-medium">{workPackages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Uphill (Figuring out)</span>
                      <span className="font-medium text-amber-600">
                        {workPackages.filter((wp: any) => wp.phase === 'uphill').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Downhill (Executing)</span>
                      <span className="font-medium text-green-600">
                        {workPackages.filter((wp: any) => wp.phase === 'downhill').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Stuck</span>
                      <span className="font-medium text-red-600">
                        {workPackages.filter((wp: any) => wp.isStuck).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>Activity tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pitch Creation Modal */}
        <PitchCreationModal
          open={showPitchModal}
          onOpenChange={setShowPitchModal}
          onCreatePitch={handleCreatePitch}
          projectStrategy={project.strategy}
        />
      </div>
    </div>
  );
}