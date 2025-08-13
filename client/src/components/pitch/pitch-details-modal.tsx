import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Clock,
  Users,
  Target,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
  X,
} from 'lucide-react';

interface PitchDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pitch: any;
  project: any;
  canManage?: boolean;
}

export default function PitchDetailsModal({
  open,
  onOpenChange,
  pitch,
  project,
  canManage = false,
}: PitchDetailsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(
    pitch?.teamMembers || []
  );
  const [cyclePlanningNotes, setCyclePlanningNotes] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');
  const [convertToProject, setConvertToProject] = useState(false);
  const [projectName, setProjectName] = useState(`${pitch?.title} Project`);

  // Fetch available team members (mock data for now)
  const availableTeamMembers = [
    'John Smith - Developer',
    'Sarah Johnson - Designer', 
    'Mike Chen - Product Manager',
    'Emily Davis - QA Engineer',
    'Alex Thompson - DevOps',
    'Lisa Wilson - Business Analyst',
  ];

  const selectPitchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', `/api/pitches/${pitch.id}`, {
        status: 'selected',
        cycle: project.currentCycle + 1,
        teamMembers: selectedTeamMembers,
        cyclePlanningNotes: cyclePlanningNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/pitches`] });
      toast({
        title: 'Success',
        description: 'Pitch selected for next cycle!',
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to select pitch: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const convertToProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/projects', {
        name: projectName,
        strategy: 'hybrid',
        description: pitch.problem,
        sourceType: 'pitch_conversion',
        sourcePitchId: pitch.id,
        teamMembers: selectedTeamMembers,
        buildCycleDuration: project.buildCycleDuration,
        cooldownCycleDuration: project.cooldownCycleDuration,
      });
      return response.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Success',
        description: `Pitch converted to project: ${newProject.name}`,
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to convert pitch: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleAddTeamMember = () => {
    if (newTeamMember && !selectedTeamMembers.includes(newTeamMember)) {
      setSelectedTeamMembers([...selectedTeamMembers, newTeamMember]);
      setNewTeamMember('');
    }
  };

  const handleRemoveTeamMember = (member: string) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(m => m !== member));
  };

  const handleSelectForCycle = () => {
    if (convertToProject) {
      convertToProjectMutation.mutate();
    } else {
      selectPitchMutation.mutate({});
    }
  };

  if (!pitch) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppetiteColor = (appetite: number) => {
    if (appetite <= 2) return 'bg-green-100 text-green-800';
    if (appetite <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{pitch.title}</span>
            <Badge className={getStatusColor(pitch.status)}>
              {pitch.status?.replace('_', ' ') || 'Draft'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="planning">Cycle Planning</TabsTrigger>
            <TabsTrigger value="conversion">Project Conversion</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Problem Statement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="w-5 h-5 mr-2" />
                    Problem Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {pitch.problem || 'No problem statement provided'}
                  </p>
                </CardContent>
              </Card>

              {/* Solution Approach */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Solution Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {pitch.solution || 'No solution approach provided'}
                  </p>
                </CardContent>
              </Card>

              {/* Appetite & Business Value */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="w-5 h-5 mr-2" />
                    Appetite & Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time Appetite</span>
                    <Badge className={getAppetiteColor(pitch.appetite)}>
                      {pitch.appetite} weeks
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Business Value</span>
                    <Badge variant="outline">{pitch.businessValue}</Badge>
                  </div>
                  {pitch.cycle && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Assigned Cycle</span>
                      <Badge>{pitch.cycle}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Roadblocks & Dependencies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Roadblocks & Dependencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {pitch.roadblocks || 'No roadblocks or dependencies identified'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Team Members */}
            {pitch.teamMembers && pitch.teamMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2" />
                    Current Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pitch.teamMembers.map((member: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cycle Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Select for Cycle {project.currentCycle + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Assignment */}
                <div>
                  <Label className="text-sm font-medium">Assign Team Members</Label>
                  <div className="mt-2 space-y-3">
                    {/* Add new team member */}
                    <div className="flex gap-2">
                      <Select value={newTeamMember} onValueChange={setNewTeamMember}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeamMembers
                            .filter(member => !selectedTeamMembers.includes(member))
                            .map((member) => (
                              <SelectItem key={member} value={member}>
                                {member}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddTeamMember}
                        disabled={!newTeamMember}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Selected team members */}
                    {selectedTeamMembers.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-600">Selected Team:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeamMembers.map((member) => (
                            <Badge key={member} variant="secondary" className="pr-1">
                              {member}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2 hover:bg-red-100"
                                onClick={() => handleRemoveTeamMember(member)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Planning Notes */}
                <div>
                  <Label htmlFor="planning-notes" className="text-sm font-medium">
                    Cycle Planning Notes
                  </Label>
                  <Textarea
                    id="planning-notes"
                    value={cyclePlanningNotes}
                    onChange={(e) => setCyclePlanningNotes(e.target.value)}
                    placeholder="Add any specific notes for this cycle..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                {canManage && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleSelectForCycle}
                      disabled={selectPitchMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {selectPitchMutation.isPending ? (
                        'Selecting...'
                      ) : (
                        <>
                          Select for Cycle {project.currentCycle + 1}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Conversion Tab */}
          <TabsContent value="conversion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Convert to Standalone Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Converting this pitch to a standalone project will create a new project 
                    with its own cycles, betting table, and hill charts. This is useful for 
                    larger initiatives that need dedicated management.
                  </p>
                </div>

                {/* Project Name */}
                <div>
                  <Label htmlFor="project-name" className="text-sm font-medium">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="mt-2"
                    placeholder="Enter project name..."
                  />
                </div>

                {/* Team Assignment (reuse from planning tab) */}
                <div>
                  <Label className="text-sm font-medium">Initial Team Members</Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex gap-2">
                      <Select value={newTeamMember} onValueChange={setNewTeamMember}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeamMembers
                            .filter(member => !selectedTeamMembers.includes(member))
                            .map((member) => (
                              <SelectItem key={member} value={member}>
                                {member}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddTeamMember}
                        disabled={!newTeamMember}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedTeamMembers.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-slate-600">Project Team:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTeamMembers.map((member) => (
                            <Badge key={member} variant="secondary" className="pr-1">
                              {member}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2 hover:bg-red-100"
                                onClick={() => handleRemoveTeamMember(member)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        setConvertToProject(true);
                        handleSelectForCycle();
                      }}
                      disabled={convertToProjectMutation.isPending || !projectName.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {convertToProjectMutation.isPending ? (
                        'Converting...'
                      ) : (
                        <>
                          Convert to Standalone Project
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}