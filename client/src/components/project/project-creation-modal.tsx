import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCreationModal({ open, onOpenChange }: ProjectCreationModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    strategy: "hybrid",
    status: "planning",
    buildCycleDuration: 6,
    cooldownCycleDuration: 2,
    currentCycle: 1,
    cyclePhase: "planning",
  });

  console.log('ProjectCreationModal render - open:', open);

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Sending project data:', data);
      const res = await apiRequest("POST", "/api/projects", data);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      return await res.json();
    },
    onSuccess: (project) => {
      console.log('Project created successfully:', project);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project Created",
        description: "Your migration project has been created successfully.",
      });
      onOpenChange(false);
      setFormData({
        name: "",
        strategy: "hybrid",
        status: "planning",
        buildCycleDuration: 6,
        cooldownCycleDuration: 2,
        currentCycle: 1,
        cyclePhase: "planning",
      });
    },
    onError: (error) => {
      console.error('Project creation error:', error);
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Migration Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Project Name</label>
            <Input
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Migration Strategy</label>
            <Select value={formData.strategy} onValueChange={(value) => handleInputChange('strategy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="greenfield">Greenfield (New Implementation)</SelectItem>
                <SelectItem value="brownfield">Brownfield (System Conversion)</SelectItem>
                <SelectItem value="hybrid">Hybrid (Selective Data Transition)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Build Cycle (weeks)</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={formData.buildCycleDuration}
                onChange={(e) => handleInputChange('buildCycleDuration', parseInt(e.target.value) || 6)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cooldown (weeks)</label>
              <Input
                type="number"
                min="1"
                max="4"
                value={formData.cooldownCycleDuration}
                onChange={(e) => handleInputChange('cooldownCycleDuration', parseInt(e.target.value) || 2)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Initial Status</label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}