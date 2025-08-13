import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, Target, Users, Route, Sprout, Recycle, ArrowRight, Key, Copy, User, Building } from "lucide-react";
import { Assessment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function RecommendationPage() {
  const { assessmentId } = useParams();
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState<any>(null);
  const { toast } = useToast();

  // Check for new account credentials
  useEffect(() => {
    const storedCredentials = sessionStorage.getItem('newAccountCredentials');
    if (storedCredentials) {
      setCredentials(JSON.parse(storedCredentials));
      // Clear from sessionStorage after displaying
      sessionStorage.removeItem('newAccountCredentials');
    }
  }, []);

  const { data: assessment, isLoading } = useQuery<Assessment>({
    queryKey: ["/api/assessments", assessmentId],
    enabled: !!assessmentId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your recommendation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-slate-600">Assessment not found</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const strategy = assessment.recommendation || "hybrid";
  const responses = assessment.responses as any;

  const strategyConfig = {
    greenfield: {
      title: "Greenfield Approach (New Implementation)",
      description: "Complete new implementation",
      icon: Sprout,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      timeline: "12-24 months",
      risk: "High",
      riskColor: "text-red-600",
      innovation: "High",
      innovationColor: "text-green-600"
    },
    brownfield: {
      title: "Brownfield Approach (System Conversion)",
      description: "System conversion",
      icon: Recycle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      timeline: "6-12 months",
      risk: "Low",
      riskColor: "text-green-600",
      innovation: "Low",
      innovationColor: "text-red-600"
    },
    hybrid: {
      title: "Hybrid Approach (Selective Data Transition)",
      description: "Selective data transition",
      icon: Route,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      timeline: "8-18 months",
      risk: "Medium",
      riskColor: "text-yellow-600",
      innovation: "Medium",
      innovationColor: "text-blue-600"
    }
  };

  const recommendedStrategy = strategyConfig[strategy as keyof typeof strategyConfig];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Your Migration Strategy Recommendation</h1>
          <p className="text-lg text-slate-600">Based on your assessment, here's our personalized recommendation for your S/4HANA migration</p>
        </div>

        {/* New Account Credentials */}
        {credentials && (
          <Alert className="mb-8 border-blue-200 bg-blue-50">
            <Key className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900">Account Created Successfully!</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
                      toast({
                        title: "Credentials Copied",
                        description: "Login credentials copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Credentials
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Welcome, {credentials.fullName}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      <span>{credentials.companyName}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-blue-900">Email:</span> {credentials.email}
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Temporary Password:</span> 
                      <code className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800">{credentials.password}</code>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-blue-700 bg-blue-100 p-3 rounded">
                  <strong>Important:</strong> Please save these credentials securely. You can use them to log in and access your migration dashboard, create projects, and track your S/4HANA transformation progress.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommended Strategy Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className={`${recommendedStrategy.bgColor} p-3 rounded-lg mr-4`}>
                <recommendedStrategy.icon className={`${recommendedStrategy.color} h-8 w-8`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{recommendedStrategy.title}</h2>
                <p className="text-slate-600">Recommended migration strategy</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Why This Strategy?</h3>
                <ul className="space-y-2 text-slate-700">
                  {responses.landscape === "complex" && (
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Complex multi-instance environment requires phased approach</span>
                    </li>
                  )}
                  {responses.changeAppetite === "moderate" && (
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Moderate change appetite aligns with selective modernization</span>
                    </li>
                  )}
                  {(responses.dataVolume === "large" || responses.dataVolume === "enterprise") && (
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Large data volume benefits from staged migration</span>
                    </li>
                  )}
                  {(responses.timeline === "12_months" || responses.timeline === "18_months") && (
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Timeline constraints favor incremental delivery</span>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Shape Up Benefits</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Fixed 6-week cycles for predictable progress</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Hill charts provide clear progress visibility</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Cross-functional teams reduce communication overhead</span>
                  </li>
                  <li className="flex items-start">
                    <Target className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Focused problem-solving approach</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy Comparison */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(strategyConfig).map(([key, config]) => (
            <Card key={key} className={`${key === strategy ? `${config.bgColor} ${config.borderColor} border-2` : 'border border-slate-200'} relative`}>
              {key === strategy && (
                <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white">
                  Recommended
                </Badge>
              )}
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <config.icon className={`${config.color} h-6 w-6 mr-3`} />
                  <h3 className="text-lg font-semibold text-slate-900">{config.title.split(' ')[0]}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">{config.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Timeline:</span>
                    <span className="font-medium">{config.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Risk:</span>
                    <span className={`font-medium ${config.riskColor}`}>{config.risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Innovation:</span>
                    <span className={`font-medium ${config.innovationColor}`}>{config.innovation}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Steps */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommended Next Steps</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Immediate Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</div>
                    <span className="text-slate-700">Set up cross-functional migration team</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</div>
                    <span className="text-slate-700">Define first migration pitch (6-week cycle)</span>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</div>
                    <span className="text-slate-700">Conduct detailed data quality assessment</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Resource Planning</h3>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setLocation(`/resource-planning/${strategy}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View Detailed Resource Plan
                  </Button>
                  <Button 
                    onClick={() => setLocation("/auth")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Start Project Setup
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
