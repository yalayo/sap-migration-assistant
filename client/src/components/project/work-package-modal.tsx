import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { insertWorkPackageSchema, Scope, WorkPackage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const workPackageFormSchema = insertWorkPackageSchema.pick({
  name: true,
  description: true,
  position: true,
  phase: true,
  isStuck: true,
  assignee: true,
}).extend({
  scopeId: z.string(),
  // Create a dummy pitchId since work packages need it but we'll create a scope-level pitch
  pitchId: z.string().optional(),
});

type WorkPackageFormData = z.infer<typeof workPackageFormSchema>;

interface WorkPackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: Scope;
  workPackage?: WorkPackage;
}

export function WorkPackageModal({ open, onOpenChange, scope, workPackage }: WorkPackageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<WorkPackageFormData>({
    resolver: zodResolver(workPackageFormSchema),
    defaultValues: {
      name: workPackage?.name || "",
      description: workPackage?.description || "",
      position: workPackage?.position || 10,
      phase: workPackage?.phase || "uphill",
      isStuck: workPackage?.isStuck || false,
      assignee: workPackage?.assignee || "",
      scopeId: scope.id,
    },
  });

  const createWorkPackageMutation = useMutation({
    mutationFn: async (data: WorkPackageFormData) => {
      // Create a scope-level pitch if needed, or use existing one
      const res = await apiRequest("POST", "/api/work-packages", {
        ...data,
        pitchId: `scope-${scope.id}`, // We'll create scope-level pitches
        scopeId: scope.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/scopes/${scope.id}/work-packages`] });
      toast({
        title: "Work Package Created",
        description: "The work package has been added to the scope.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Work Package",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWorkPackageMutation = useMutation({
    mutationFn: async (data: WorkPackageFormData) => {
      const res = await apiRequest("PUT", `/api/work-packages/${workPackage!.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/scopes/${scope.id}/work-packages`] });
      toast({
        title: "Work Package Updated",
        description: "The work package has been updated successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Work Package",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkPackageFormData) => {
    if (workPackage) {
      updateWorkPackageMutation.mutate(data);
    } else {
      createWorkPackageMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {workPackage ? "Edit Work Package" : "Create Work Package"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Data Migration - Customer Master" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this work package involves..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select phase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="uphill">Uphill (Figuring Out)</SelectItem>
                        <SelectItem value="downhill">Downhill (Executing)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Team member or lead" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isStuck"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Stuck</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Mark if this work package is blocked or needs attention
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createWorkPackageMutation.isPending || updateWorkPackageMutation.isPending}
              >
                {workPackage ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}