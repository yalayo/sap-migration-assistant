import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Play, ClipboardList, Route, ChartArea } from "lucide-react";

export default function HomePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl md:text-6xl">
              Transform Your SAP Journey with
              <span className="text-blue-600"> Shape Up Methodology</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-600">
              Guide your SAP ECC to S/4HANA migration with predictable, value-driven outcomes using proven Shape Up principles. 
              Get personalized recommendations and track progress with visual hill charts.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Button 
                onClick={() => setLocation("/assessment")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg"
                size="lg"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Assessment
              </Button>
              <Button 
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg text-lg font-semibold border border-slate-300"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Accelerate Your Migration Success</h2>
            <p className="mt-4 text-lg text-slate-600">Comprehensive tools for every phase of your S/4HANA transformation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-200 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-blue-600 text-3xl mb-4">
                  <ClipboardList className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Assessment</h3>
                <p className="text-slate-600">Comprehensive questionnaire to analyze your current SAP landscape and strategic objectives for personalized recommendations.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-200 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-green-600 text-3xl mb-4">
                  <Route className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Strategy Recommendation</h3>
                <p className="text-slate-600">AI-driven recommendations for Greenfield, Brownfield, or Hybrid approaches tailored to your organization's needs.</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow duration-200 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="text-purple-600 text-3xl mb-4">
                  <ChartArea className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Visual Progress Tracking</h3>
                <p className="text-slate-600">Interactive hill charts to visualize project progress and identify bottlenecks in real-time using Shape Up methodology.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
