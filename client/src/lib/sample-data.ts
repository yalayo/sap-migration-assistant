// Sample data generator for Shape Up methodology demonstration

export const generateSamplePitch = (projectId: string, strategy: string) => {
  const strategyExamples = {
    greenfield: {
      title: "Finance Real-time Analytics Implementation",
      problem: "Current month-end closing takes 15 days due to manual reconciliation processes and batch-only data processing, causing delays in financial reporting and decision-making.",
      solution: "Implement S/4HANA Finance with embedded analytics, automated reconciliation workflows, and real-time data processing for immediate financial insights.",
      businessValue: "Reduce month-end close from 15 days to 3 days, enable real-time financial dashboards for executives, and eliminate manual reconciliation errors saving 40 hours per month.",
      appetite: 8,
      roadblocks: "Legacy data quality issues in vendor master data, custom GL account mappings need validation, integration with existing BI tools requires analysis.",
      dependencies: "Data cleansing project completion, BI team availability, approval for new chart of accounts structure"
    },
    brownfield: {
      title: "Performance Optimization for High Volume Processing",
      problem: "System performance degrades significantly during peak transaction periods (month-end, quarter-end) causing timeouts and user complaints, especially in order processing.",
      solution: "Optimize existing custom code for S/4HANA architecture, implement HANA-specific database optimizations, and convert heavy batch jobs to real-time processing.",
      businessValue: "Improve system response time by 60%, eliminate timeout errors during peak periods, and increase user satisfaction while maintaining existing business processes.",
      appetite: 6,
      roadblocks: "Complex custom code analysis required, database optimization impact assessment, potential downtime for implementation.",
      dependencies: "System maintenance window availability, performance testing environment setup, business user acceptance testing"
    },
    hybrid: {
      title: "Phased Migration - Finance Module Priority",
      problem: "Need to modernize finance processes without disrupting ongoing operations in sales and manufacturing modules that aren't ready for migration yet.",
      solution: "Implement selective data transition starting with finance module, establish data synchronization with existing ECC modules, create integration layer for seamless operations.",
      businessValue: "Modernize critical finance functions immediately, reduce migration risk through phased approach, maintain business continuity across all modules.",
      appetite: 12,
      roadblocks: "Complex data synchronization requirements, integration layer design challenges, potential data consistency issues between systems.",
      dependencies: "Finance team training completion, integration middleware selection, data governance framework establishment"
    }
  };

  const example = strategyExamples[strategy as keyof typeof strategyExamples] || strategyExamples.greenfield;
  
  return {
    projectId,
    title: example.title,
    problem: example.problem,
    solution: example.solution,
    appetite: example.appetite,
    businessValue: example.businessValue,
    roadblocks: example.roadblocks,
    dependencies: example.dependencies,
    status: 'shaped' as const
  };
};

export const generateSampleWorkPackages = (pitchId: string) => {
  return [
    {
      pitchId,
      name: "Data Analysis",
      description: "Analyze current data quality and migration requirements",
      position: 15,
      phase: 'uphill' as const,
      isStuck: false,
      assignee: "Data Specialist"
    },
    {
      pitchId,
      name: "System Configuration", 
      description: "Configure S/4HANA modules and settings",
      position: 35,
      phase: 'uphill' as const,
      isStuck: false,
      assignee: "Technical Lead"
    },
    {
      pitchId,
      name: "Integration Development",
      description: "Develop interfaces with existing systems",
      position: 65,
      phase: 'downhill' as const,
      isStuck: false,
      assignee: "Integration Expert"
    },
    {
      pitchId,
      name: "User Training",
      description: "Train end users on new processes",
      position: 85,
      phase: 'downhill' as const,
      isStuck: false,
      assignee: "Change Management"
    },
    {
      pitchId,
      name: "Custom Code Analysis",
      description: "Analyze and remediate custom ABAP code",
      position: 25,
      phase: 'uphill' as const,
      isStuck: true,
      assignee: "ABAP Developer"
    }
  ];
};