import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight, Plus, BarChart3 } from "lucide-react";
import { Scope, WorkPackage } from "@shared/schema";
import { HillChart } from "./hill-chart";
import { WorkPackageModal } from "@/components/project/work-package-modal";

interface ScopeWorkPackagesSectionProps {
  scope: Scope;
}

export function ScopeWorkPackagesSection({ scope }: ScopeWorkPackagesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWorkPackageModal, setShowWorkPackageModal] = useState(false);

  const { data: workPackages = [], isLoading } = useQuery<WorkPackage[]>({
    queryKey: [`/api/scopes/${scope.id}/work-packages`],
    enabled: isOpen, // Only fetch when expanded
  });

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <Collapsible.Trigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              Work Packages & Hill Chart ({workPackages.length})
            </span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-600" />
          )}
        </Button>
      </Collapsible.Trigger>
      
      <Collapsible.Content className="space-y-4 mt-4">
        {isLoading ? (
          <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <>
            {workPackages.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-300">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center space-y-3">
                    <BarChart3 className="h-8 w-8 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-sm text-slate-600 mb-3">
                        No work packages defined for this scope yet.
                      </p>
                      <Button 
                        onClick={() => setShowWorkPackageModal(true)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Work Package
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Hill Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-700">
                        Progress Hill Chart
                      </CardTitle>
                      <Button 
                        onClick={() => setShowWorkPackageModal(true)}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Package
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <HillChart 
                      workPackages={workPackages} 
                      pitchId={`scope-${scope.id}`}
                    />
                  </CardContent>
                </Card>

                {/* Work Package List */}
                <div className="grid gap-2">
                  {workPackages.map((workPackage) => (
                    <div 
                      key={workPackage.id} 
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: `hsl(${(workPackages.indexOf(workPackage) * 60) % 360}, 70%, 50%)` 
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {workPackage.name}
                          </div>
                          {workPackage.description && (
                            <div className="text-xs text-slate-600">
                              {workPackage.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{workPackage.phase}</span>
                        <span>•</span>
                        <span>{workPackage.position}%</span>
                        {workPackage.isStuck && (
                          <span className="text-red-600 font-medium">Stuck</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <WorkPackageModal
          open={showWorkPackageModal}
          onOpenChange={setShowWorkPackageModal}
          scope={scope}
        />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}