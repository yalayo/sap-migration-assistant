import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Crown, Code, ChartBar, Database, Plug, Users } from "lucide-react";

export default function ResourcePlanningPage() {
  const { strategy } = useParams();
  const [, setLocation] = useLocation();

  const roles = [
    {
      title: "Executive Sponsor",
      fte: "1 FTE",
      subtitle: "Strategic Leadership",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Provides strategic direction, removes organizational blockers, and ensures alignment with business objectives throughout the migration.",
      responsibilities: [
        "Decision-making authority",
        "Stakeholder communication", 
        "Resource allocation"
      ]
    },
    {
      title: "Technical Lead",
      fte: "1 FTE",
      subtitle: "ABAP/Fiori/Basis Expert",
      icon: Code,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Manages custom code analysis, development activities, system infrastructure, and technical architecture decisions.",
      responsibilities: [
        "Custom code remediation",
        "System architecture design",
        "Development standards"
      ]
    },
    {
      title: "Functional Expert",
      fte: "2-3 FTE",
      subtitle: "Finance/Logistics/HR",
      icon: ChartBar,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Defines business requirements, validates S/4HANA processes, and ensures alignment with business objectives across key functional areas.",
      responsibilities: [
        "Business process design",
        "Requirements validation",
        "User acceptance testing"
      ]
    },
    {
      title: "Data Specialist",
      fte: "1-2 FTE",
      subtitle: "Data Migration Expert",
      icon: Database,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: "Oversees data profiling, cleansing, migration strategies, and validation processes to ensure data quality and integrity.",
      responsibilities: [
        "Data quality assessment",
        "Migration tool selection",
        "Data validation procedures"
      ]
    },
    {
      title: "Integration Expert",
      fte: "1 FTE",
      subtitle: "Systems Integration",
      icon: Plug,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Ensures seamless connectivity with third-party systems, legacy applications, and external interfaces throughout the migration.",
      responsibilities: [
        "API design and management",
        "Middleware configuration",
        "Integration testing"
      ]
    },
    {
      title: "Change Management Rep",
      fte: "1 FTE",
      subtitle: "User Adoption Expert",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Drives user adoption, develops training programs, and manages communication strategies to ensure successful organizational change.",
      responsibilities: [
        "Training program development",
        "Communication planning",
        "Resistance management"
      ]
    }
  ];

  const allocationData = [
    {
      role: "Executive Sponsor",
      planning: "25%",
      build: "15%",
      testing: "50%",
      color: "bg-purple-100 text-purple-800"
    },
    {
      role: "Technical Lead",
      planning: "100%",
      build: "100%",
      testing: "75%",
      color: "bg-blue-100 text-blue-800"
    },
    {
      role: "Functional Experts",
      planning: "75%",
      build: "80%",
      testing: "100%",
      color: "bg-green-100 text-green-800"
    },
    {
      role: "Data Specialist",
      planning: "100%",
      build: "60%",
      testing: "90%",
      color: "bg-amber-100 text-amber-800"
    },
    {
      role: "Integration Expert",
      planning: "50%",
      build: "80%",
      testing: "100%",
      color: "bg-red-100 text-red-800"
    },
    {
      role: "Change Management Rep",
      planning: "25%",
      build: "40%",
      testing: "100%",
      color: "bg-indigo-100 text-indigo-800"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Resource Planning & Team Structure</h1>
            <p className="text-lg text-slate-600">Recommended cross-functional team for your {strategy?.charAt(0).toUpperCase()}{strategy?.slice(1)} S/4HANA migration</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recommendation
          </Button>
        </div>

        {/* Team Overview */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">8-12</div>
                <p className="text-slate-600">Team Members</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">6-8</div>
                <p className="text-slate-600">Weeks per Cycle</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">3-4</div>
                <p className="text-slate-600">Parallel Workstreams</p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Shape Up Team Principles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-2">
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Cross-functional expertise in each team
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Fixed time budgets (appetite) for predictability
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Small teams for faster decision-making
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Uninterrupted work during build cycles
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Team Roles */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {roles.map((role, index) => (
            <Card key={index} className="shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`${role.bgColor} p-3 rounded-lg mr-4`}>
                    <role.icon className={`${role.color} h-6 w-6`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{role.title}</h3>
                    <p className="text-sm text-slate-600">{role.fte} | {role.subtitle}</p>
                  </div>
                </div>
                <p className="text-slate-700 mb-4">{role.description}</p>
                <div className="space-y-2 text-sm">
                  {role.responsibilities.map((resp, respIndex) => (
                    <div key={respIndex} className="flex items-center text-slate-600">
                      <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Allocation Timeline */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Resource Allocation Timeline</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Role</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      Planning Phase
                      <br />
                      <span className="font-normal text-slate-600">(2-4 weeks)</span>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      Build Cycles
                      <br />
                      <span className="font-normal text-slate-600">(6-8 weeks each)</span>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      Testing & Deployment
                      <br />
                      <span className="font-normal text-slate-600">(2-4 weeks)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocationData.map((allocation, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium">{allocation.role}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={allocation.color}>
                          {allocation.planning}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={allocation.color}>
                          {allocation.build}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={allocation.color}>
                          {allocation.testing}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            onClick={() => setLocation("/auth")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
            size="lg"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Proceed to Project Setup
          </Button>
        </div>
      </div>
    </div>
  );
}
