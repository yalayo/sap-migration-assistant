import { Navbar } from "@/components/layout/navbar";
import { AssessmentForm } from "@/components/assessment/assessment-form";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <AssessmentForm />
    </div>
  );
}
