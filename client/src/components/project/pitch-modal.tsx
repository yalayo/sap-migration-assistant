import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { X, Save, Check, Loader2 } from "lucide-react";
import { insertPitchSchema, Pitch } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const pitchFormSchema = insertPitchSchema.extend({
  teamMembers: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  externalDependencies: z.string().optional(),
});

type PitchFormData = z.infer<typeof pitchFormSchema>;

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function PitchModal({ isOpen, onClose, projectId }: PitchModalProps) {
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();

  const form = useForm<PitchFormData>({
    resolver: zodResolver(pitchFormSchema),
    defaultValues: {
      projectId,
      title: "",
      problem: "",
      solution: "",
      appetite: 6,
      businessValue: "",
      roadblocks: "",
      status: "shaped",
      teamMembers: [],
      dependencies: [],
      externalDependencies: "",
    },
  });

  // Get existing pitches for dependencies
  const { data: existingPitches = [] } = useQuery<Pitch[]>({
    queryKey: ["/api/projects", projectId, "pitches"],
    enabled: isOpen,
  });

  const createPitchMutation = useMutation({
    mutationFn: async (data: PitchFormData) => {
      const pitchData = {
        ...data,
        teamMembers: data.teamMembers || [],
        dependencies: [
          ...(data.dependencies || []),
          ...(data.externalDependencies ? [data.externalDependencies] : [])
        ],
      };
      
      const res = await apiRequest("POST", "/api/pitches", pitchData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "pitches"] });
      toast({
        title: isDraft ? "Draft Saved!" : "Pitch Created!",
        description: isDraft ? "Your pitch has been saved as a draft." : "Your pitch has been created and added to the betting table.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create pitch",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setIsDraft(false);
    onClose();
  };

  const onSubmit = (data: PitchFormData) => {
    createPitchMutation.mutate(data);
  };

  const saveDraft = () => {
    setIsDraft(true);
    form.handleSubmit((data) => {
      createPitchMutation.mutate({ ...data, status: "shaped" });
    })();
  };

  const teamRoles = [
    { id: "tech_lead", label: "Technical Lead" },
    { id: "func_expert_fi", label: "Functional Expert (FI)" },
    { id: "func_expert_co", label: "Functional Expert (CO)" },
    { id: "func_expert_mm", label: "Functional Expert (MM)" },
    { id: "func_expert_sd", label: "Functional Expert (SD)" },
    { id: "data_specialist", label: "Data Specialist" },
    { id: "integration", label: "Integration Expert" },
    { id: "change_mgmt", label: "Change Management Rep" },
  ];

  const appetiteOptions = [
    { value: 6, label: "6 weeks - Quick wins, focused features, or proof of concepts" },
    { value: 8, label: "8 weeks - Standard features with moderate complexity" },
    { value: 10, label: "10 weeks - Complex features requiring significant coordination" },
    { value: 12, label: "12 weeks - Major initiatives with high complexity and risk" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-bold text-slate-900">Create New Pitch</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Problem Statement */}
            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-slate-900">
                    Problem Statement
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the enterprise-level challenge being addressed (e.g., 'Legacy data structure causes slow financial close')"
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-sm text-slate-600">Clearly articulate the business problem this pitch will solve.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pitch Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-slate-900">
                    Pitch Title
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Give your pitch a clear, descriptive title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Proposed Solution */}
            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-slate-900">
                    Proposed Solution
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="High-level description of the migration chunk or functionality to be delivered (e.g., 'Implement new G/L in S/4HANA for parallel accounting')"
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-sm text-slate-600">Outline the solution approach without getting into detailed specifications.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Appetite (Fixed Time) */}
            <FormField
              control={form.control}
              name="appetite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-slate-900">
                    Appetite (Fixed Time)
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle duration..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appetiteOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-600">Fixed time budget that cannot be extended. Choose based on complexity and risk.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Value */}
            <FormField
              control={form.control}
              name="businessValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-slate-900">
                    Anticipated Business Value
                    <span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the expected benefits from completing this pitch (e.g., '20% reduction in month-end close time, improved financial reporting accuracy')"
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-sm text-slate-600">Quantify the expected business impact where possible.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Roadblocks/Unknowns */}
            <FormField
              control={form.control}
              name="roadblocks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-slate-900">
                    Identified Roadblocks/Unknowns
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Capture potential complexities (e.g., 'complex legacy custom code', 'poor data quality in source system', 'unclear integration requirements')"
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-sm text-slate-600">List known risks and unknowns that could impact delivery.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dependencies */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-slate-900">Dependencies</Label>
              
              {/* Internal Dependencies */}
              {existingPitches.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-3 block">
                    Internal Dependencies (Other Pitches)
                  </Label>
                  <div className="space-y-2">
                    {existingPitches.map((pitch) => (
                      <div key={pitch.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dep-${pitch.id}`}
                          checked={form.watch("dependencies")?.includes(pitch.id) || false}
                          onCheckedChange={(checked) => {
                            const currentDeps = form.getValues("dependencies") || [];
                            if (checked) {
                              form.setValue("dependencies", [...currentDeps, pitch.id]);
                            } else {
                              form.setValue("dependencies", currentDeps.filter(id => id !== pitch.id));
                            }
                          }}
                        />
                        <Label htmlFor={`dep-${pitch.id}`} className="text-slate-700">
                          {pitch.title} ({pitch.status.charAt(0).toUpperCase() + pitch.status.slice(1)})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Dependencies */}
              <FormField
                control={form.control}
                name="externalDependencies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      External Dependencies
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="External dependencies (e.g., vendor deliverables, third-party integrations)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Team Assignment */}
            <div>
              <Label className="text-lg font-semibold text-slate-900 mb-3 block">
                Assigned Team Members
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {teamRoles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`team-${role.id}`}
                      checked={form.watch("teamMembers")?.includes(role.id) || false}
                      onCheckedChange={(checked) => {
                        const currentTeam = form.getValues("teamMembers") || [];
                        if (checked) {
                          form.setValue("teamMembers", [...currentTeam, role.id]);
                        } else {
                          form.setValue("teamMembers", currentTeam.filter(id => id !== role.id));
                        }
                      }}
                    />
                    <Label htmlFor={`team-${role.id}`} className="text-slate-700">
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                disabled={createPitchMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="secondary"
                onClick={saveDraft}
                disabled={createPitchMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {createPitchMutation.isPending && isDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button 
                type="submit"
                disabled={createPitchMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createPitchMutation.isPending && !isDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Check className="mr-2 h-4 w-4" />
                Create Pitch
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
