import { Project, Pitch, Assessment, WorkPackage, Scope } from "@shared/schema";

export interface ProjectReport {
  project: Project;
  pitches: Pitch[];
  assessment?: Assessment;
  workPackages: WorkPackage[];
  scopes: Scope[];
  exportDate: string;
  exportedBy: string;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  includeDetails: boolean;
  includePitches: boolean;
  includeWorkPackages: boolean;
  includeAssessment: boolean;
  includeScopes: boolean;
}

// Generate CSV content for project data
export function generateProjectCSV(report: ProjectReport, options: ExportOptions): string {
  const lines: string[] = [];
  
  // Header information
  lines.push("S/4HANA Migration Project Report");
  lines.push(`Export Date: ${report.exportDate}`);
  lines.push(`Exported By: ${report.exportedBy}`);
  lines.push("");
  
  // Project Overview
  lines.push("PROJECT OVERVIEW");
  lines.push("Field,Value");
  lines.push(`Project Name,"${report.project.name}"`);
  lines.push(`Strategy,"${report.project.strategy}"`);
  lines.push(`Status,"${report.project.status}"`);
  lines.push(`Current Cycle,${report.project.currentCycle || 1}`);
  lines.push(`Cycle Phase,"${report.project.cyclePhase || 'planning'}"`);
  lines.push(`Build Duration,${report.project.buildCycleDuration || 6} weeks`);
  lines.push(`Cooldown Duration,${report.project.cooldownCycleDuration || 2} weeks`);
  lines.push(`Created Date,"${new Date(report.project.createdAt).toLocaleDateString()}"`);
  lines.push("");

  // Pitches section
  if (options.includePitches && report.pitches.length > 0) {
    lines.push("PITCHES");
    lines.push("Title,Status,Problem,Solution,Appetite (weeks),Business Value,Team Members,Cycle");
    report.pitches.forEach(pitch => {
      const teamMembers = pitch.teamMembers ? (pitch.teamMembers as string[]).join("; ") : "Unassigned";
      lines.push(`"${pitch.title}","${pitch.status}","${pitch.problem}","${pitch.solution}",${pitch.appetite},"${pitch.businessValue}","${teamMembers}",${pitch.cycle || 1}`);
    });
    lines.push("");
  }

  // Scopes section
  if (options.includeScopes && report.scopes.length > 0) {
    lines.push("SCOPES");
    lines.push("Name,Description,Success Criteria,Boundaries");
    report.scopes.forEach(scope => {
      const successCriteria = scope.successCriteria ? (scope.successCriteria as string[]).join("; ") : "";
      const boundaries = scope.boundaries ? (scope.boundaries as string[]).join("; ") : "";
      lines.push(`"${scope.name}","${scope.description || ''}","${successCriteria}","${boundaries}"`);
    });
    lines.push("");
  }

  // Work Packages section
  if (options.includeWorkPackages && report.workPackages.length > 0) {
    lines.push("WORK PACKAGES");
    lines.push("Name,Description,Phase,Progress (%),Assignee,Stuck,Scope");
    report.workPackages.forEach(wp => {
      const scopeName = report.scopes.find(s => s.id === wp.scopeId)?.name || "Unknown Scope";
      lines.push(`"${wp.name}","${wp.description || ''}","${wp.phase}",${wp.position},"${wp.assignee || ''}",${wp.isStuck ? 'Yes' : 'No'},"${scopeName}"`);
    });
    lines.push("");
  }

  // Assessment section
  if (options.includeAssessment && report.assessment) {
    lines.push("ASSESSMENT");
    lines.push("Field,Value");
    lines.push(`Recommendation Strategy,"${report.assessment.recommendedStrategy}"`);
    lines.push(`Complexity Score,${report.assessment.complexityScore || 'N/A'}`);
    lines.push(`Risk Level,"${report.assessment.riskLevel || 'N/A'}"`);
    lines.push(`Timeline Estimate,"${report.assessment.timelineEstimate || 'N/A'}"`);
    lines.push(`Assessment Date,"${new Date(report.assessment.createdAt).toLocaleDateString()}"`);
  }

  return lines.join('\n');
}

// Generate comprehensive JSON export
export function generateProjectJSON(report: ProjectReport, options: ExportOptions): string {
  const exportData: any = {
    exportInfo: {
      date: report.exportDate,
      exportedBy: report.exportedBy,
      format: "json",
      options: options
    },
    project: {
      id: report.project.id,
      name: report.project.name,
      strategy: report.project.strategy,
      status: report.project.status,
      currentCycle: report.project.currentCycle,
      cyclePhase: report.project.cyclePhase,
      buildCycleDuration: report.project.buildCycleDuration,
      cooldownCycleDuration: report.project.cooldownCycleDuration,
      createdAt: report.project.createdAt
    }
  };

  if (options.includePitches) {
    exportData.pitches = report.pitches.map(pitch => ({
      id: pitch.id,
      title: pitch.title,
      problem: pitch.problem,
      solution: pitch.solution,
      status: pitch.status,
      appetite: pitch.appetite,
      businessValue: pitch.businessValue,
      teamMembers: pitch.teamMembers,
      cycle: pitch.cycle,
      createdAt: pitch.createdAt
    }));
  }

  if (options.includeScopes) {
    exportData.scopes = report.scopes.map(scope => ({
      id: scope.id,
      name: scope.name,
      description: scope.description,
      successCriteria: scope.successCriteria,
      boundaries: scope.boundaries,
      createdAt: scope.createdAt
    }));
  }

  if (options.includeWorkPackages) {
    exportData.workPackages = report.workPackages.map(wp => ({
      id: wp.id,
      name: wp.name,
      description: wp.description,
      phase: wp.phase,
      position: wp.position,
      assignee: wp.assignee,
      isStuck: wp.isStuck,
      scopeId: wp.scopeId,
      scopeName: report.scopes.find(s => s.id === wp.scopeId)?.name,
      createdAt: wp.createdAt
    }));
  }

  if (options.includeAssessment && report.assessment) {
    exportData.assessment = {
      id: report.assessment.id,
      recommendedStrategy: report.assessment.recommendedStrategy,
      complexityScore: report.assessment.complexityScore,
      riskLevel: report.assessment.riskLevel,
      timelineEstimate: report.assessment.timelineEstimate,
      createdAt: report.assessment.createdAt
    };
  }

  return JSON.stringify(exportData, null, 2);
}

// Generate HTML report content
export function generateProjectHTML(report: ProjectReport, options: ExportOptions): string {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S/4HANA Migration Project Report - ${report.project.name}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; color: #1e293b; margin: 0 0 10px 0; }
        .subtitle { color: #64748b; font-size: 16px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; background: #f8fafc; }
        .card-title { font-weight: 600; color: #1e293b; margin-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        .table th { background: #f1f5f9; font-weight: 600; color: #1e293b; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
        .status.active { background: #dbeafe; color: #1d4ed8; }
        .status.completed { background: #dcfce7; color: #166534; }
        .status.planning { background: #fef3c7; color: #92400e; }
        .badge { background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .export-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 30px; font-size: 14px; color: #64748b; }
        .progress-bar { background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden; margin: 5px 0; }
        .progress-fill { background: #3b82f6; height: 100%; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">S/4HANA Migration Project Report</h1>
            <p class="subtitle">${report.project.name}</p>
        </div>
        
        <div class="export-info">
            <strong>Export Information:</strong> Generated on ${report.exportDate} by ${report.exportedBy}
        </div>

        <div class="section">
            <h2 class="section-title">Project Overview</h2>
            <div class="grid">
                <div class="card">
                    <div class="card-title">Migration Strategy</div>
                    <div style="text-transform: capitalize; font-size: 18px; font-weight: 500;">${report.project.strategy}</div>
                </div>
                <div class="card">
                    <div class="card-title">Current Status</div>
                    <div class="status ${report.project.status}">${report.project.status}</div>
                </div>
                <div class="card">
                    <div class="card-title">Current Cycle</div>
                    <div>Cycle ${report.project.currentCycle || 1} (${report.project.cyclePhase || 'planning'})</div>
                </div>
                <div class="card">
                    <div class="card-title">Cycle Configuration</div>
                    <div>${report.project.buildCycleDuration || 6} weeks build + ${report.project.cooldownCycleDuration || 2} weeks cooldown</div>
                </div>
            </div>
        </div>

        ${options.includePitches && report.pitches.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Pitches Overview (${report.pitches.length})</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Appetite</th>
                        <th>Business Value</th>
                        <th>Team</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.pitches.map(pitch => `
                        <tr>
                            <td><strong>${pitch.title}</strong><br><small style="color: #64748b;">${pitch.problem}</small></td>
                            <td><span class="status ${pitch.status}">${pitch.status}</span></td>
                            <td>${pitch.appetite} weeks</td>
                            <td><span class="badge">${pitch.businessValue}</span></td>
                            <td>${pitch.teamMembers ? (pitch.teamMembers as string[]).join(', ') : 'Unassigned'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${options.includeScopes && report.scopes.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Project Scopes (${report.scopes.length})</h2>
            ${report.scopes.map(scope => `
                <div class="card" style="margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #1e293b;">${scope.name}</h3>
                    ${scope.description ? `<p style="color: #64748b; margin: 10px 0;">${scope.description}</p>` : ''}
                    ${scope.successCriteria && scope.successCriteria.length > 0 ? `
                        <div style="margin: 15px 0;">
                            <strong style="color: #1e293b;">Success Criteria:</strong>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                ${(scope.successCriteria as string[]).map(criteria => `<li style="color: #64748b;">${criteria}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${scope.boundaries && scope.boundaries.length > 0 ? `
                        <div style="margin: 15px 0;">
                            <strong style="color: #1e293b;">Boundaries:</strong>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                ${(scope.boundaries as string[]).map(boundary => `<li style="color: #64748b;">${boundary}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${options.includeWorkPackages && report.workPackages.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Work Packages (${report.workPackages.length})</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Package Name</th>
                        <th>Phase</th>
                        <th>Progress</th>
                        <th>Assignee</th>
                        <th>Status</th>
                        <th>Scope</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.workPackages.map(wp => {
                        const scopeName = report.scopes.find(s => s.id === wp.scopeId)?.name || 'Unknown';
                        return `
                            <tr>
                                <td><strong>${wp.name}</strong>${wp.description ? `<br><small style="color: #64748b;">${wp.description}</small>` : ''}</td>
                                <td><span class="badge">${wp.phase}</span></td>
                                <td>
                                    <div>${wp.position}%</div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${wp.position}%"></div>
                                    </div>
                                </td>
                                <td>${wp.assignee || 'Unassigned'}</td>
                                <td>${wp.isStuck ? '<span style="color: #dc2626; font-weight: 500;">Stuck</span>' : '<span style="color: #16a34a;">On Track</span>'}</td>
                                <td>${scopeName}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        ${options.includeAssessment && report.assessment ? `
        <div class="section">
            <h2 class="section-title">Assessment Results</h2>
            <div class="grid">
                <div class="card">
                    <div class="card-title">Recommended Strategy</div>
                    <div style="text-transform: capitalize; font-size: 18px; font-weight: 500;">${report.assessment.recommendedStrategy}</div>
                </div>
                ${report.assessment.complexityScore ? `
                <div class="card">
                    <div class="card-title">Complexity Score</div>
                    <div style="font-size: 18px; font-weight: 500;">${report.assessment.complexityScore}</div>
                </div>
                ` : ''}
                ${report.assessment.riskLevel ? `
                <div class="card">
                    <div class="card-title">Risk Level</div>
                    <div style="font-size: 18px; font-weight: 500;">${report.assessment.riskLevel}</div>
                </div>
                ` : ''}
                ${report.assessment.timelineEstimate ? `
                <div class="card">
                    <div class="card-title">Timeline Estimate</div>
                    <div style="font-size: 18px; font-weight: 500;">${report.assessment.timelineEstimate}</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; text-align: center;">
            Generated by S/4HANA Migration Assistant • ${report.exportDate}
        </div>
    </div>
</body>
</html>
  `;
  
  return html;
}

// Download function for browser
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate filename with timestamp
export function generateFileName(projectName: string, format: string): string {
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-');
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitizedName}_report_${timestamp}.${format}`;
}