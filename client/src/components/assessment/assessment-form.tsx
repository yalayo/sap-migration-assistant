import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { insertAssessmentSchema } from "@shared/schema";
import { assessmentEngine } from "@/lib/assessment-engine";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const TOTAL_STEPS = 7; // Added contact information step

interface AssessmentData {
  landscape?: string;
  modules?: string[];
  outcome?: string;
  customCode?: string;
  dataQuality?: string;
  dataVolume?: string;
  changeAppetite?: string;
  changeMaturity?: string;
  timeline?: string;
  budget?: string;
  orgSize?: string;
  industry?: string;
  regions?: string[];
  // Contact information
  contact?: {
    fullName?: string;
    email?: string;
    companyName?: string;
    jobTitle?: string;
    phone?: string;
  };
}

export function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { setValue, watch, handleSubmit } = useForm();

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assessments", data);
      return await res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Handle both authenticated and anonymous submissions
      const assessment = result.assessment || result;
      const assessmentId = assessment.id;
      
      // Show account creation info if this is a new account
      if (result.isNewAccount && result.tempPassword) {
        toast({
          title: "Account Created Successfully!",
          description: `Your account has been created. Login: ${result.user.email} | Password: ${result.tempPassword}`,
          duration: 10000, // Show for 10 seconds
        });
        
        // Store credentials temporarily for display on recommendation page
        sessionStorage.setItem('newAccountCredentials', JSON.stringify({
          email: result.user.email,
          password: result.tempPassword,
          fullName: result.user.fullName,
          companyName: result.user.companyName
        }));
      } else {
        toast({
          title: "Assessment Complete!",
          description: result.user ? 
            "Your personalized recommendation is ready." :
            "Your personalized recommendation is ready.",
        });
      }
      
      setLocation(`/recommendation/${assessmentId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Assessment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAssessmentData = (key: string, value: any) => {
    setAssessmentData(prev => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const submitAssessment = () => {
    const recommendation = assessmentEngine.generateRecommendation(assessmentData);
    const score = assessmentEngine.calculateScore(assessmentData);
    
    createAssessmentMutation.mutate({
      responses: assessmentData,
      recommendation,
      score,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Assessment Progress</span>
            <span className="text-sm text-slate-600">Step {currentStep} of {TOTAL_STEPS}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Step 1: Current Landscape */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Current SAP Landscape</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      What is your current SAP ECC system landscape?
                    </Label>
                    <RadioGroup 
                      value={assessmentData.landscape} 
                      onValueChange={(value) => updateAssessmentData("landscape", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <Label htmlFor="single">Single instance, minimal customization</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple" id="multiple" />
                        <Label htmlFor="multiple">Multiple instances, moderate customization</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="complex" id="complex" />
                        <Label htmlFor="complex">Highly complex, heavily customized environment</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Which SAP modules are currently in use? (Select all that apply)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "fi", label: "Finance (FI)" },
                        { id: "co", label: "Controlling (CO)" },
                        { id: "mm", label: "Materials Management (MM)" },
                        { id: "sd", label: "Sales & Distribution (SD)" },
                        { id: "pp", label: "Production Planning (PP)" },
                        { id: "hr", label: "Human Resources (HR)" },
                      ].map((module) => (
                        <div key={module.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={module.id}
                            checked={assessmentData.modules?.includes(module.id)}
                            onCheckedChange={(checked) => {
                              const modules = assessmentData.modules || [];
                              if (checked) {
                                updateAssessmentData("modules", [...modules, module.id]);
                              } else {
                                updateAssessmentData("modules", modules.filter(m => m !== module.id));
                              }
                            }}
                          />
                          <Label htmlFor={module.id}>{module.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Strategic Intent */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Strategic Objectives</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      What is your desired outcome from the S/4HANA migration?
                    </Label>
                    <RadioGroup 
                      value={assessmentData.outcome} 
                      onValueChange={(value) => updateAssessmentData("outcome", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clean_slate" id="clean_slate" />
                        <Label htmlFor="clean_slate">Clean slate - complete re-engineering</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="preserve" id="preserve" />
                        <Label htmlFor="preserve">Preserve proven business processes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phased" id="phased" />
                        <Label htmlFor="phased">Phased modernization approach</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      How critical is preserving existing custom code vs. adopting standard S/4HANA functionalities?
                    </Label>
                    <Select value={assessmentData.customCode} onValueChange={(value) => updateAssessmentData("customCode", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preserve_all">Preserve all custom code</SelectItem>
                        <SelectItem value="selective">Selective preservation with standardization</SelectItem>
                        <SelectItem value="minimize">Minimize custom code, adopt standards</SelectItem>
                        <SelectItem value="eliminate">Eliminate custom code entirely</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Data Quality */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Data Assessment</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      What is the approximate quality of your current master and transactional data?
                    </Label>
                    <RadioGroup 
                      value={assessmentData.dataQuality} 
                      onValueChange={(value) => updateAssessmentData("dataQuality", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="excellent" id="excellent" />
                        <Label htmlFor="excellent">Excellent - very clean and well-maintained</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="good" id="good" />
                        <Label htmlFor="good">Good - some minor issues that need cleanup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="poor" id="poor" />
                        <Label htmlFor="poor">Poor - significant cleanup and standardization needed</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Estimated data volume for migration
                    </Label>
                    <Select value={assessmentData.dataVolume} onValueChange={(value) => updateAssessmentData("dataVolume", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data volume..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt; 1TB)</SelectItem>
                        <SelectItem value="medium">Medium (1-10TB)</SelectItem>
                        <SelectItem value="large">Large (10-100TB)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (&gt; 100TB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Change Appetite */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Change Management</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      What is your organization's appetite for change and disruption during the migration?
                    </Label>
                    <RadioGroup 
                      value={assessmentData.changeAppetite} 
                      onValueChange={(value) => updateAssessmentData("changeAppetite", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minimal" id="minimal" />
                        <Label htmlFor="minimal">Minimal disruption - maintain current workflows</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate">Moderate change - selective improvements</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="significant" id="significant" />
                        <Label htmlFor="significant">Open to significant re-engineering</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Current change management maturity
                    </Label>
                    <Select value={assessmentData.changeMaturity} onValueChange={(value) => updateAssessmentData("changeMaturity", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select maturity level..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - limited change management experience</SelectItem>
                        <SelectItem value="medium">Medium - some change management processes</SelectItem>
                        <SelectItem value="high">High - mature change management practices</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Timeline & Budget */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Constraints</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      What is your target timeline for the migration project?
                    </Label>
                    <Select value={assessmentData.timeline} onValueChange={(value) => updateAssessmentData("timeline", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6_months">6 months or less</SelectItem>
                        <SelectItem value="12_months">6-12 months</SelectItem>
                        <SelectItem value="18_months">12-18 months</SelectItem>
                        <SelectItem value="24_months">18-24 months</SelectItem>
                        <SelectItem value="longer">Longer than 24 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Budget range for the migration project
                    </Label>
                    <Select value={assessmentData.budget} onValueChange={(value) => updateAssessmentData("budget", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Under $500K</SelectItem>
                        <SelectItem value="medium">$500K - $2M</SelectItem>
                        <SelectItem value="large">$2M - $10M</SelectItem>
                        <SelectItem value="enterprise">Over $10M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Organization Details */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Organization Profile</h2>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Organization size (number of employees)
                    </Label>
                    <Select value={assessmentData.orgSize} onValueChange={(value) => updateAssessmentData("orgSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt; 500)</SelectItem>
                        <SelectItem value="medium">Medium (500-2,000)</SelectItem>
                        <SelectItem value="large">Large (2,000-10,000)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (&gt; 10,000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Primary industry sector
                    </Label>
                    <Select value={assessmentData.industry} onValueChange={(value) => updateAssessmentData("industry", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="financial">Financial Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="energy">Energy & Utilities</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Geographic presence
                    </Label>
                    <div className="space-y-3">
                      {[
                        { id: "north_america", label: "North America" },
                        { id: "europe", label: "Europe" },
                        { id: "asia_pacific", label: "Asia Pacific" },
                        { id: "other", label: "Other regions" },
                      ].map((region) => (
                        <div key={region.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={region.id}
                            checked={assessmentData.regions?.includes(region.id)}
                            onCheckedChange={(checked) => {
                              const regions = assessmentData.regions || [];
                              if (checked) {
                                updateAssessmentData("regions", [...regions, region.id]);
                              } else {
                                updateAssessmentData("regions", regions.filter(r => r !== region.id));
                              }
                            }}
                          />
                          <Label htmlFor={region.id}>{region.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Contact Information */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Your Contact Information</h2>
                  <p className="text-slate-600">
                    To receive your personalized S/4HANA migration recommendations and create your account, 
                    please provide your contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                      value={assessmentData.contact?.fullName || ""}
                      onChange={(e) => updateAssessmentData("contact", { 
                        ...assessmentData.contact, 
                        fullName: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      value={assessmentData.contact?.email || ""}
                      onChange={(e) => updateAssessmentData("contact", { 
                        ...assessmentData.contact, 
                        email: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your company name"
                      value={assessmentData.contact?.companyName || ""}
                      onChange={(e) => updateAssessmentData("contact", { 
                        ...assessmentData.contact, 
                        companyName: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Job Title
                    </Label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your job title"
                      value={assessmentData.contact?.jobTitle || ""}
                      onChange={(e) => updateAssessmentData("contact", { 
                        ...assessmentData.contact, 
                        jobTitle: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label className="text-base font-medium text-slate-700 mb-3 block">
                      Phone Number
                    </Label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                      value={assessmentData.contact?.phone || ""}
                      onChange={(e) => updateAssessmentData("contact", { 
                        ...assessmentData.contact, 
                        phone: e.target.value 
                      })}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Privacy Note:</strong> Your information will be used to create your account and 
                    provide personalized migration recommendations. We respect your privacy and will not 
                    share your information with third parties.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <Button 
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={currentStep === 1 ? "invisible" : ""}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="flex space-x-3">
                {currentStep < TOTAL_STEPS ? (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={submitAssessment}
                    disabled={createAssessmentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Complete Assessment
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
