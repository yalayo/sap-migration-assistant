import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PitchModal } from "@/components/project/pitch-modal";
import { HillChart } from "@/components/project/hill-chart";
import { 
  Plus, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { Project, Pitch, WorkPackage } from "@shared/schema";

export default function DashboardPage() {
  const [showPitchModal, setShowPitchModal] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const activeProject = projects.find(p => p.status === "active") || projects[0];

  const { data: pitches = [], isLoading: pitchesLoading } = useQuery<Pitch[]>({
    queryKey: ["/api/projects", activeProject?.id, "pitches"],
    enabled: !!activeProject,
  });

  const activePitch = pitches.find(p => p.status === "active");

  const { data: workPackages = [] } = useQuery<WorkPackage[]>({
    queryKey: ["/api/pitches", activePitch?.id, "work-packages"],
    enabled: !!activePitch,
  });

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Your Migration Hub</h2>
            <p className="text-slate-600 mb-8">Complete an assessment to start your first project</p>
            <Button onClick={() => window.location.href = "/assessment"}>
              Start Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedPitches = pitches.filter(p => p.status === "completed").length;
  const activePitches = pitches.filter(p => p.status === "active").length;
  const shapedPitches = pitches.filter(p => p.status === "shaped").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{activeProject.name}</h1>
            <p className="text-slate-600 mt-1">
              {activeProject.strategy.charAt(0).toUpperCase() + activeProject.strategy.slice(1)} approach • 
              Status: {activeProject.status.charAt(0).toUpperCase() + activeProject.status.slice(1)}
            </p>
          </div>
          <Button 
            onClick={() => setShowPitchModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Pitch
          </Button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{activePitches + shapedPitches}</div>
                  <div className="text-sm text-slate-600">Active Pitches</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{completedPitches}</div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-lg mr-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {activePitch ? Math.max(0, (activePitch.appetite * 7) - Math.floor((Date.now() - new Date(activePitch.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 0}
                  </div>
                  <div className="text-sm text-slate-600">Days Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {activePitch?.teamMembers ? (activePitch.teamMembers as string[]).length : 0}
                  </div>
                  <div className="text-sm text-slate-600">Team Members</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Cycle Overview */}
        {activePitch && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Current Cycle: {activePitch.title}</CardTitle>
                <Badge variant="secondary">
                  Week {Math.ceil((Date.now() - new Date(activePitch.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7))} of {activePitch.appetite}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Hill Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Progress Hill Chart</h3>
                <HillChart workPackages={workPackages} pitchId={activePitch.id} />
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {workPackages.map((pkg, index) => (
                  <div key={pkg.id} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2`} style={{backgroundColor: `hsl(${index * 60}, 70%, 50%)`}}></div>
                    <span className="text-slate-700">{pkg.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Betting Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Betting Table</CardTitle>
              <Button variant="link" className="text-blue-600 hover:text-blue-700">
                View All Pitches
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {pitches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No pitches created yet</p>
                <Button onClick={() => setShowPitchModal(true)}>
                  Create Your First Pitch
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pitches.map((pitch) => (
                  <div 
                    key={pitch.id} 
                    className={`border rounded-lg p-6 ${
                      pitch.status === "active" ? "border-blue-200 bg-blue-50" :
                      pitch.status === "completed" ? "border-green-200 bg-green-50" :
                      "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Badge 
                          variant={
                            pitch.status === "active" ? "default" :
                            pitch.status === "completed" ? "secondary" :
                            "outline"
                          }
                          className="mr-3"
                        >
                          {pitch.status.toUpperCase()}
                        </Badge>
                        <h3 className="text-lg font-semibold text-slate-900">{pitch.title}</h3>
                      </div>
                      <span className="text-sm text-slate-600">{pitch.appetite} weeks • Cycle {pitch.cycle || 1}</span>
                    </div>
                    <p className="text-slate-700 mb-3">{pitch.problem}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-600">
                          Team: {pitch.teamMembers ? (pitch.teamMembers as string[]).join(", ") : "Unassigned"}
                        </span>
                        <span className="text-slate-600">•</span>
                        <Badge 
                          variant={
                            pitch.status === "active" ? "default" :
                            pitch.status === "completed" ? "secondary" :
                            "outline"
                          }
                        >
                          {pitch.status === "active" ? "On Track" : 
                           pitch.status === "completed" ? "Delivered" : 
                           "Ready to Bet"}
                        </Badge>
                      </div>
                      <Button variant="link" className="text-blue-600 hover:text-blue-700">
                        View Details →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pitch Modal */}
      <PitchModal 
        isOpen={showPitchModal} 
        onClose={() => setShowPitchModal(false)}
        projectId={activeProject.id}
      />
    </div>
  );
}
