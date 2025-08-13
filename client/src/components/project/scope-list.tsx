import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Plus, Edit, Calendar, CheckCircle } from "lucide-react";
import { Project, Scope } from "@shared/schema";
import { ScopeModal } from "./scope-modal";
import { ScopeWorkPackagesSection } from "./scope-work-packages-section";

interface ScopeListProps {
  project: Project;
}

export function ScopeList({ project }: ScopeListProps) {
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | undefined>();

  const { data: scopes = [], isLoading } = useQuery<Scope[]>({
    queryKey: [`/api/projects/${project.id}/scopes`],
  });

  const handleEditScope = (scope: Scope) => {
    setEditingScope(scope);
    setShowScopeModal(true);
  };

  const handleCloseModal = () => {
    setShowScopeModal(false);
    setEditingScope(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">Project Scopes</h3>
        </div>
        <Button 
          onClick={() => setShowScopeModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Define Scope
        </Button>
      </div>

      {scopes.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <Target className="h-12 w-12 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-lg font-medium text-slate-700 mb-2">
                  No scopes defined yet
                </h4>
                <p className="text-slate-500 mb-4">
                  Define project scopes to organize your S/4HANA migration work and track progress effectively.
                </p>
                <Button 
                  onClick={() => setShowScopeModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Define Your First Scope
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {scopes.map((scope) => (
            <Card key={scope.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-slate-900">{scope.name}</CardTitle>
                    {scope.description && (
                      <p className="text-sm text-slate-600">{scope.description}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditScope(scope)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Objectives */}
                {scope.keyObjectives && (scope.keyObjectives as string[]).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Key Objectives
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {(scope.keyObjectives as string[]).map((objective, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Boundaries */}
                {scope.boundaries && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2">Scope Boundaries</h5>
                    <div className="bg-slate-50 p-3 rounded-md">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">
                        {scope.boundaries}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Success Criteria and Constraints */}
                <div className="grid md:grid-cols-2 gap-4">
                  {scope.successCriteria && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 mb-2">Success Criteria</h5>
                      <p className="text-sm text-slate-600">{scope.successCriteria}</p>
                    </div>
                  )}

                  {scope.constraints && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-700 mb-2">Constraints</h5>
                      <p className="text-sm text-slate-600">{scope.constraints}</p>
                    </div>
                  )}
                </div>

                <Separator />
                
                {/* Work Packages Section */}
                <ScopeWorkPackagesSection scope={scope} />

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(scope.createdAt).toLocaleDateString()}
                  </div>
                  {scope.updatedAt !== scope.createdAt && (
                    <div className="flex items-center gap-1">
                      Updated {new Date(scope.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ScopeModal
        open={showScopeModal}
        onOpenChange={handleCloseModal}
        project={project}
        scope={editingScope}
      />
    </div>
  );
}