import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Table, Code, Loader2 } from "lucide-react";
import { Project, Pitch, WorkPackage, Scope, Assessment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  generateProjectCSV, 
  generateProjectJSON, 
  generateProjectHTML,
  downloadFile, 
  generateFileName,
  type ProjectReport,
  type ExportOptions 
} from "@/lib/export-utils";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

export function ExportModal({ open, onOpenChange, project }: ExportModalProps) {
  if (!project) {
    return null;
  }
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'html',
    includeDetails: true,
    includePitches: true,
    includeWorkPackages: true,
    includeAssessment: true,
    includeScopes: true,
  });

  // Fetch all related data
  const { data: pitches = [] } = useQuery<Pitch[]>({
    queryKey: ["/api/projects", project.id, "pitches"],
    enabled: open && !!project,
  });

  const { data: scopes = [] } = useQuery<Scope[]>({
    queryKey: ["/api/projects", project.id, "scopes"],
    enabled: open && !!project,
  });

  const { data: workPackages = [] } = useQuery<WorkPackage[]>({
    queryKey: ["/api/projects", project.id, "work-packages"],
    enabled: open && !!project,
  });

  const { data: assessment } = useQuery<Assessment>({
    queryKey: ["/api/projects", project.id, "assessment"],
    enabled: open && !!project && exportOptions.includeAssessment,
  });

  const handleExport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export project reports.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const report: ProjectReport = {
        project,
        pitches: exportOptions.includePitches ? pitches : [],
        assessment: exportOptions.includeAssessment ? assessment : undefined,
        workPackages: exportOptions.includeWorkPackages ? workPackages : [],
        scopes: exportOptions.includeScopes ? scopes : [],
        exportDate: new Date().toLocaleString(),
        exportedBy: user.fullName || user.username,
      };

      let content: string;
      let mimeType: string;
      let fileExtension: string;

      switch (exportOptions.format) {
        case 'csv':
          content = generateProjectCSV(report, exportOptions);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
        case 'json':
          content = generateProjectJSON(report, exportOptions);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
        case 'html':
        default:
          content = generateProjectHTML(report, exportOptions);
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
      }

      const filename = generateFileName(project.name, fileExtension);
      downloadFile(content, filename, mimeType);

      toast({
        title: "Export Complete",
        description: `Project report exported as ${filename}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    html: FileText,
    csv: Table,
    json: Code,
  };

  const formatDescriptions = {
    html: "Comprehensive HTML report with styling - ideal for viewing and sharing",
    csv: "Structured data format - perfect for Excel and data analysis",
    json: "Machine-readable format - great for integrations and APIs",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Project Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Project: {project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Strategy:</span>
                  <div className="text-slate-600 capitalize">{project.strategy}</div>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="text-slate-600 capitalize">{project.status}</div>
                </div>
                <div>
                  <span className="font-medium">Available Data:</span>
                  <div className="text-slate-600">
                    {pitches.length} pitches, {scopes.length} scopes, {workPackages.length} work packages
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Export Format</h3>
            <Select
              value={exportOptions.format}
              onValueChange={(value: 'html' | 'csv' | 'json') => 
                setExportOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(formatDescriptions).map(([format, description]) => {
                  const Icon = formatIcons[format as keyof typeof formatIcons];
                  return (
                    <SelectItem key={format} value={format}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{format.toUpperCase()}</div>
                          <div className="text-xs text-slate-500">{description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Content Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3">Include in Export</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-details"
                  checked={exportOptions.includeDetails}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeDetails: checked as boolean }))
                  }
                />
                <label htmlFor="include-details" className="text-sm">
                  Project Details & Overview
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-pitches"
                  checked={exportOptions.includePitches}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includePitches: checked as boolean }))
                  }
                />
                <label htmlFor="include-pitches" className="text-sm">
                  Pitches ({pitches.length} available)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-scopes"
                  checked={exportOptions.includeScopes}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeScopes: checked as boolean }))
                  }
                />
                <label htmlFor="include-scopes" className="text-sm">
                  Project Scopes ({scopes.length} available)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-work-packages"
                  checked={exportOptions.includeWorkPackages}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeWorkPackages: checked as boolean }))
                  }
                />
                <label htmlFor="include-work-packages" className="text-sm">
                  Work Packages ({workPackages.length} available)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-assessment"
                  checked={exportOptions.includeAssessment}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeAssessment: checked as boolean }))
                  }
                />
                <label htmlFor="include-assessment" className="text-sm">
                  Assessment Results {assessment ? "(available)" : "(not available)"}
                </label>
              </div>
            </div>
          </div>

          {/* Export Preview */}
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Export Preview</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <div>Format: {exportOptions.format.toUpperCase()}</div>
                <div>
                  Sections: {[
                    exportOptions.includeDetails && "Project Details",
                    exportOptions.includePitches && pitches.length > 0 && "Pitches",
                    exportOptions.includeScopes && scopes.length > 0 && "Scopes", 
                    exportOptions.includeWorkPackages && workPackages.length > 0 && "Work Packages",
                    exportOptions.includeAssessment && assessment && "Assessment"
                  ].filter(Boolean).join(", ") || "None selected"}
                </div>
                <div>Filename: {generateFileName(project.name, exportOptions.format)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}