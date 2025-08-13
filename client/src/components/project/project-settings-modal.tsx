import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Clock, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";

interface ProjectSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function ProjectSettingsModal({ open, onOpenChange, project }: ProjectSettingsModalProps) {
  const [buildCycleDuration, setBuildCycleDuration] = useState(project.buildCycleDuration || 6);
  const [cooldownCycleDuration, setCooldownCycleDuration] = useState(project.cooldownCycleDuration || 2);
  const [cyclePhase, setCyclePhase] = useState(project.cyclePhase || "planning");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/projects/${project.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Settings Updated",
        description: "Shape Up cycle configuration has been saved successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProjectMutation.mutate({
      buildCycleDuration,
      cooldownCycleDuration,
      cyclePhase,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Project Settings
          </DialogTitle>
          <DialogDescription>
            Configure Shape Up methodology cycles for your {project.name} project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Shape Up Cycle Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Clock className="h-4 w-4" />
              Shape Up Cycle Configuration
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buildCycleDuration" className="text-sm text-slate-600">
                  Build Cycle Duration
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="buildCycleDuration"
                    type="number"
                    min="1"
                    max="12"
                    value={buildCycleDuration}
                    onChange={(e) => setBuildCycleDuration(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-slate-500">weeks</span>
                </div>
                <p className="text-xs text-slate-500">
                  Time allocated for building pitches (typically 6 weeks)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldownCycleDuration" className="text-sm text-slate-600">
                  Cooldown Duration
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cooldownCycleDuration"
                    type="number"
                    min="1"
                    max="4"
                    value={cooldownCycleDuration}
                    onChange={(e) => setCooldownCycleDuration(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-slate-500">weeks</span>
                </div>
                <p className="text-xs text-slate-500">
                  Time for betting table and planning (typically 2 weeks)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Current Cycle Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Calendar className="h-4 w-4" />
              Current Cycle Status
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cyclePhase" className="text-sm text-slate-600">
                Current Phase
              </Label>
              <Select value={cyclePhase} onValueChange={setCyclePhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning & Shaping</SelectItem>
                  <SelectItem value="building">Building Phase</SelectItem>
                  <SelectItem value="cooldown">Cooldown & Betting</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {cyclePhase === "planning" && "Defining problems and shaping solutions"}
                {cyclePhase === "building" && "Active development and delivery"}
                {cyclePhase === "cooldown" && "Reflection, planning, and betting on next cycle"}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Cycle #{project.currentCycle || 1}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Total cycle length: {buildCycleDuration + cooldownCycleDuration} weeks 
                ({buildCycleDuration} build + {cooldownCycleDuration} cooldown)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateProjectMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateProjectMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}