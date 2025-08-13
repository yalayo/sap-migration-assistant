import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Target, Lightbulb, TrendingUp } from 'lucide-react';

const pitchSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  problem: z.string().min(10, 'Problem statement must be at least 10 characters'),
  solution: z.string().min(10, 'Solution description must be at least 10 characters'),
  appetite: z.number().min(1).max(26), // 1-26 weeks
  businessValue: z.string().min(10, 'Business value must be at least 10 characters'),
  roadblocks: z.string().optional(),
  dependencies: z.string().optional(),
  teamMembers: z.string().optional(),
});

type PitchFormData = z.infer<typeof pitchSchema>;

interface PitchCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePitch: (data: PitchFormData) => void;
  projectStrategy: string;
}

const appetiteOptions = [
  { weeks: 2, label: '2 weeks - Small fix or spike', description: 'Quick wins, bug fixes, or exploration' },
  { weeks: 4, label: '4 weeks - Feature addition', description: 'Small feature or enhancement' },
  { weeks: 6, label: '6 weeks - Standard cycle', description: 'Most common cycle length in Shape Up' },
  { weeks: 8, label: '8 weeks - Large feature', description: 'Complex feature or integration' },
  { weeks: 12, label: '12 weeks - Major initiative', description: 'Significant system changes or modules' },
  { weeks: 16, label: '16 weeks - Big bet', description: 'Large transformation or new capability' },
];

const strategyExamples = {
  greenfield: {
    problems: [
      'Legacy financial processes are too slow for real-time reporting',
      'Current system cannot handle our growing transaction volume',
      'Manual reconciliation processes cause month-end delays'
    ],
    solutions: [
      'Implement S/4HANA Finance with real-time analytics',
      'Design new data architecture for high-volume processing',
      'Build automated reconciliation workflows'
    ]
  },
  brownfield: {
    problems: [
      'Custom reports are breaking after each SAP update',
      'Performance is degrading with current data volume',
      'Integration with new cloud services is complex'
    ],
    solutions: [
      'Convert custom reports to S/4HANA embedded analytics',
      'Optimize existing code for S/4HANA architecture',
      'Implement modern integration patterns with APIs'
    ]
  },
  hybrid: {
    problems: [
      'Need to maintain operations during gradual migration',
      'Different business units have varying readiness levels',
      'Risk of disruption to critical business processes'
    ],
    solutions: [
      'Phase migration starting with non-critical modules',
      'Implement parallel systems with data synchronization',
      'Create module-by-module transformation roadmap'
    ]
  }
};

export function PitchCreationModal({ open, onOpenChange, onCreatePitch, projectStrategy }: PitchCreationModalProps) {
  const [selectedAppetite, setSelectedAppetite] = useState<number>(6);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PitchFormData>({
    resolver: zodResolver(pitchSchema),
    defaultValues: {
      appetite: 6,
    },
  });

  const watchedValues = watch();
  const examples = strategyExamples[projectStrategy as keyof typeof strategyExamples] || strategyExamples.greenfield;

  const onSubmit = (data: PitchFormData) => {
    onCreatePitch(data);
    reset();
    onOpenChange(false);
  };

  const fillExample = (field: 'problem' | 'solution', index: number) => {
    const example = field === 'problem' ? examples.problems[index] : examples.solutions[index];
    setValue(field, example);
  };

  const selectedAppetiteInfo = appetiteOptions.find(opt => opt.weeks === selectedAppetite);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
            Create New Pitch
          </DialogTitle>
          <DialogDescription>
            Shape a new problem-solution pair for your S/4HANA migration. Focus on the problem first, then propose a bounded solution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Pitch Title *
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Finance Real-time Reporting"
                  className={errors.title ? 'border-red-300' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Problem Statement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="problem" className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                    Problem Statement *
                  </Label>
                </div>
                <Textarea
                  id="problem"
                  {...register('problem')}
                  placeholder="What specific business problem are you solving? Be concrete and measurable."
                  className={`h-24 ${errors.problem ? 'border-red-300' : ''}`}
                />
                {errors.problem && (
                  <p className="text-sm text-red-600 mt-1">{errors.problem.message}</p>
                )}
              </div>

              {/* Solution */}
              <div>
                <Label htmlFor="solution" className="flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1 text-blue-500" />
                  Proposed Solution *
                </Label>
                <Textarea
                  id="solution"
                  {...register('solution')}
                  placeholder="How will you solve this problem? Keep it high-level but concrete enough to guide implementation."
                  className={`h-24 ${errors.solution ? 'border-red-300' : ''}`}
                />
                {errors.solution && (
                  <p className="text-sm text-red-600 mt-1">{errors.solution.message}</p>
                )}
              </div>

              {/* Business Value */}
              <div>
                <Label htmlFor="businessValue" className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  Business Value *
                </Label>
                <Textarea
                  id="businessValue"
                  {...register('businessValue')}
                  placeholder="What business benefits will this deliver? How will you measure success?"
                  className={`h-20 ${errors.businessValue ? 'border-red-300' : ''}`}
                />
                {errors.businessValue && (
                  <p className="text-sm text-red-600 mt-1">{errors.businessValue.message}</p>
                )}
              </div>

              {/* Appetite */}
              <div>
                <Label className="flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-1 text-purple-500" />
                  Appetite (Time Budget) *
                </Label>
                <Select
                  value={selectedAppetite.toString()}
                  onValueChange={(value) => {
                    const weeks = parseInt(value);
                    setSelectedAppetite(weeks);
                    setValue('appetite', weeks);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appetiteOptions.map((option) => (
                      <SelectItem key={option.weeks} value={option.weeks.toString()}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAppetiteInfo && (
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedAppetiteInfo.description}
                  </p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-900">Optional Details</h4>
                
                <div>
                  <Label htmlFor="roadblocks">Known Roadblocks & Risks</Label>
                  <Textarea
                    id="roadblocks"
                    {...register('roadblocks')}
                    placeholder="What challenges or unknowns do you foresee?"
                    className="h-16"
                  />
                </div>

                <div>
                  <Label htmlFor="dependencies">Dependencies</Label>
                  <Input
                    id="dependencies"
                    {...register('dependencies')}
                    placeholder="Other pitches, systems, or resources this depends on"
                  />
                </div>

                <div>
                  <Label htmlFor="teamMembers">Suggested Team Members</Label>
                  <Input
                    id="teamMembers"
                    {...register('teamMembers')}
                    placeholder="Roles or specific people needed for this work"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar with examples and guidance */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shape Up Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Problem First</Badge>
                    <p className="text-slate-600">
                      Start with a concrete business problem, not a solution you want to build.
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Fixed Time</Badge>
                    <p className="text-slate-600">
                      Choose a time budget you're comfortable with, then fit the solution to that constraint.
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Right Level</Badge>
                    <p className="text-slate-600">
                      Be concrete enough to guide work, but abstract enough to allow creativity.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Examples for {projectStrategy}</CardTitle>
                  <CardDescription>Click to use as starting points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Problem Examples:</h5>
                    <div className="space-y-2">
                      {examples.problems.map((problem, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => fillExample('problem', index)}
                          className="text-left text-xs text-slate-600 hover:text-slate-900 block w-full p-2 hover:bg-slate-50 rounded transition-colors"
                        >
                          {problem}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Solution Examples:</h5>
                    <div className="space-y-2">
                      {examples.solutions.map((solution, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => fillExample('solution', index)}
                          className="text-left text-xs text-slate-600 hover:text-slate-900 block w-full p-2 hover:bg-slate-50 rounded transition-colors"
                        >
                          {solution}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Pitch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}