import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertScopeSchema, Project, Scope } from "@shared/schema";
import { z } from "zod";

const scopeFormSchema = insertScopeSchema.extend({
  keyObjectives: z.array(z.string()).optional(),
});

type ScopeFormData = z.infer<typeof scopeFormSchema>;

interface ScopeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  scope?: Scope;
}

export function ScopeModal({ open, onOpenChange, project, scope }: ScopeModalProps) {
  const [objectives, setObjectives] = useState<string[]>(
    scope?.keyObjectives ? (scope.keyObjectives as string[]) : []
  );
  const [newObjective, setNewObjective] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScopeFormData>({
    resolver: zodResolver(scopeFormSchema),
    defaultValues: {
      projectId: project.id,
      name: scope?.name || "",
      description: scope?.description || "",
      boundaries: scope?.boundaries || "",
      successCriteria: scope?.successCriteria || "",
      constraints: scope?.constraints || "",
      keyObjectives: objectives,
    },
  });

  const createScopeMutation = useMutation({
    mutationFn: async (data: ScopeFormData) => {
      const res = await apiRequest("POST", "/api/scopes", {
        ...data,
        keyObjectives: objectives,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/scopes`] });
      toast({
        title: "Scope Created",
        description: "Project scope has been defined successfully.",
      });
      onOpenChange(false);
      form.reset();
      setObjectives([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Scope",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateScopeMutation = useMutation({
    mutationFn: async (data: ScopeFormData) => {
      const res = await apiRequest("PUT", `/api/scopes/${scope!.id}`, {
        ...data,
        keyObjectives: objectives,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/scopes`] });
      toast({
        title: "Scope Updated",
        description: "Project scope has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Scope",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ScopeFormData) => {
    if (scope) {
      updateScopeMutation.mutate(data);
    } else {
      createScopeMutation.mutate(data);
    }
  };

  const isLoading = createScopeMutation.isPending || updateScopeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {scope ? "Edit Scope" : "Define Project Scope"}
          </DialogTitle>
          <DialogDescription>
            Define the boundaries, objectives, and success criteria for your S/4HANA migration scope.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Scope Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Finance Module Migration, Core ERP Transformation"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Provide an overview of what this scope covers..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Key Objectives */}
            <div className="space-y-4">
              <div>
                <FormLabel className="text-base font-medium">Key Objectives</FormLabel>
                <p className="text-sm text-slate-600 mt-1">
                  Define specific goals and outcomes for this scope
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add an objective..."
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addObjective}
                  disabled={!newObjective.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {objectives.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {objectives.map((objective, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 pr-1">
                      {objective}
                      <button
                        type="button"
                        onClick={() => removeObjective(index)}
                        className="ml-2 hover:bg-slate-300 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Boundaries */}
            <FormField
              control={form.control}
              name="boundaries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Scope Boundaries</FormLabel>
                  <p className="text-sm text-slate-600">
                    Clearly define what is included and excluded from this scope
                  </p>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="In Scope:&#10;- Module X migration&#10;- Data conversion for entity Y&#10;&#10;Out of Scope:&#10;- Custom reports migration&#10;- Integration with system Z"
                      className="resize-none font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Success Criteria */}
            <FormField
              control={form.control}
              name="successCriteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Success Criteria</FormLabel>
                  <p className="text-sm text-slate-600">
                    Define measurable criteria for successful completion
                  </p>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="e.g., All financial transactions process correctly, Month-end close time reduced by 30%, User acceptance testing passed"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Constraints */}
            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Constraints & Assumptions</FormLabel>
                  <p className="text-sm text-slate-600">
                    Document any limitations, dependencies, or assumptions
                  </p>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="e.g., No downtime during business hours, Must complete before fiscal year-end, Legacy system remains operational"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Saving..." : scope ? "Update Scope" : "Create Scope"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}