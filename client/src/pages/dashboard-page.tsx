import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PitchModal } from "@/components/project/pitch-modal";
import { HillChart } from "@/components/project/hill-chart";
import { ProjectSettingsModal } from "@/components/project/project-settings-modal";
import { ProjectCreationModal } from "@/components/project/project-creation-modal";
import { ScopeList } from "@/components/project/scope-list";
import { ExportModal } from "@/components/project/export-modal";
import { 
  Plus, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowRight,
  Settings,
  Target,
  Download
} from "lucide-react";
import { Project, Pitch, WorkPackage } from "@shared/schema";

export default function DashboardPage() {
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showProjectCreationModal, setShowProjectCreationModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"projects" | "overview" | "scopes" | "pitches">("projects");

  // Debug logging
  console.log('Dashboard render - showProjectCreationModal:', showProjectCreationModal);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const activeProject = selectedProject || projects.find(p => p.status === "active") || projects[0];

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

  // If no projects exist, show welcome screen with project creation
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Welcome to Your Migration Hub</h2>
            <p className="text-slate-600 mb-8">Start your S/4HANA transformation journey by creating your first migration project</p>
            <Button 
              onClick={() => {
                console.log('Button clicked, setting modal to true');
                setShowProjectCreationModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
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
            <h1 className="text-3xl font-bold text-slate-900">Migration Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Manage your S/4HANA transformation projects and track progress
            </p>
          </div>
          <div className="flex gap-3">
            {activeProject && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedProject(activeProject);
                  setShowExportModal(true);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            )}
            <Button 
              onClick={() => setShowProjectCreationModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "projects", label: "Projects", icon: Target },
              ...(activeProject ? [
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "scopes", label: "Scopes", icon: Target },
                { id: "pitches", label: "Pitches", icon: Lightbulb },
              ] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <tab.icon className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id ? "text-blue-500" : "text-slate-400 group-hover:text-slate-500"
                }`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-slate-900">{project.name}</CardTitle>
                          <Badge 
                            variant={
                              project.status === "active" ? "default" :
                              project.status === "completed" ? "secondary" :
                              "outline"
                            }
                          >
                            {project.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">S/4HANA Migration Project</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveTab("overview");
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowExportModal(true);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowProjectSettings(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Strategy:</span>
                        <div className="text-slate-600 capitalize">{project.strategy}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Cycle:</span>
                        <div className="text-slate-600">#{project.currentCycle || 1} ({project.cyclePhase || "planning"})</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Build Duration:</span>
                        <div className="text-slate-600">{project.buildCycleDuration || 6} weeks</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Cooldown:</span>
                        <div className="text-slate-600">{project.cooldownCycleDuration || 2} weeks</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Project Stats - shown on overview tab */}
        {activeTab === "overview" && activeProject && (
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
        )}

        {/* Tab Content */}
        {activeTab === "overview" && activeProject && (
          <>
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
          </>
        )}

        {/* Scopes Tab */}
        {activeTab === "scopes" && activeProject && (
          <ScopeList project={activeProject} />
        )}

        {/* Pitches Tab */}
        {activeTab === "pitches" && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">All Pitches</h3>
              <Button 
                onClick={() => setShowPitchModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Pitch
              </Button>
            </div>
            
            {pitches.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-300">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center space-y-4">
                    <Lightbulb className="h-12 w-12 text-slate-400 mx-auto" />
                    <div>
                      <h4 className="text-lg font-medium text-slate-700 mb-2">
                        No pitches created yet
                      </h4>
                      <p className="text-slate-500 mb-4">
                        Create your first pitch to start shaping work for your S/4HANA migration project.
                      </p>
                      <Button 
                        onClick={() => setShowPitchModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Pitch
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pitches.map((pitch) => (
                  <Card key={pitch.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                pitch.status === "active" ? "default" :
                                pitch.status === "completed" ? "secondary" :
                                "outline"
                              }
                            >
                              {pitch.status.toUpperCase()}
                            </Badge>
                            <CardTitle className="text-lg text-slate-900">{pitch.title}</CardTitle>
                          </div>
                          <p className="text-sm text-slate-600">{pitch.problem}</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          <div>{pitch.appetite} weeks</div>
                          <div>Cycle {pitch.cycle || 1}</div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <p className="text-slate-700">{pitch.solution}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600">
                            Team: {pitch.teamMembers ? (pitch.teamMembers as string[]).join(", ") : "Unassigned"}
                          </span>
                          <Badge variant="outline">
                            {pitch.businessValue}
                          </Badge>
                        </div>
                        <Button variant="link" className="text-blue-600 hover:text-blue-700">
                          View Details →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {console.log('About to render modal, state:', showProjectCreationModal)}
      {showProjectCreationModal && (
        <div>
          {console.log('Modal should render now')}
          <ProjectCreationModal
            open={showProjectCreationModal}
            onOpenChange={setShowProjectCreationModal}
          />
        </div>
      )}
      {!showProjectCreationModal && console.log('Modal state is false, not rendering')}
      
      {activeProject && (
        <>
          <PitchModal 
            isOpen={showPitchModal} 
            onClose={() => setShowPitchModal(false)}
            projectId={activeProject.id}
          />
          
          <ProjectSettingsModal
            open={showProjectSettings}
            onOpenChange={setShowProjectSettings}
            project={activeProject}
          />
          
          <ExportModal
            open={showExportModal}
            onOpenChange={setShowExportModal}
            project={selectedProject}
          />
        </>
      )}
    </div>
  );
}
