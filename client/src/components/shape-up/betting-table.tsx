import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Clock, Target, AlertTriangle, Users, CheckCircle, XCircle } from 'lucide-react';
import { Pitch } from '@shared/schema';

interface BettingTableProps {
  pitches: Pitch[];
  onUpdatePitchStatus: (pitchId: string, status: string, notes?: string) => void;
  currentCycle: number;
  canBet: boolean; // Based on user role
}

export function BettingTable({ pitches, onUpdatePitchStatus, currentCycle, canBet }: BettingTableProps) {
  const [selectedPitch, setSelectedPitch] = useState<Pitch | null>(null);
  const [bettingNotes, setBettingNotes] = useState('');

  const getPriorityColor = (appetite: number) => {
    if (appetite <= 6) return 'bg-green-100 text-green-800';
    if (appetite <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shaped': return 'bg-blue-100 text-blue-800';
      case 'betting': return 'bg-purple-100 text-purple-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBet = (pitch: Pitch, decision: 'selected' | 'abandoned') => {
    onUpdatePitchStatus(pitch.id, decision, bettingNotes);
    setSelectedPitch(null);
    setBettingNotes('');
  };

  const activePitches = pitches.filter(p => ['shaped', 'betting'].includes(p.status));
  const selectedPitches = pitches.filter(p => p.status === 'selected');
  const completedPitches = pitches.filter(p => ['completed', 'abandoned'].includes(p.status));

  return (
    <div className="space-y-6">
      {/* Current Cycle Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Betting Table - Cycle {currentCycle}</span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Clock className="w-4 h-4 mr-1" />
                6-week cycles
              </Badge>
              {canBet && (
                <Badge className="bg-purple-100 text-purple-800">
                  Betting Phase
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Review shaped pitches and decide which ones to bet on for the upcoming cycle. 
            Each pitch represents a problem worth solving with a fixed time budget (appetite).
          </p>
        </CardContent>
      </Card>

      {/* Pitches Ready for Betting */}
      {activePitches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Pitches Ready for Betting ({activePitches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activePitches.map((pitch) => (
                <div key={pitch.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{pitch.title}</h3>
                      <div className="flex items-center space-x-4 mb-3">
                        <Badge className={getPriorityColor(pitch.appetite)}>
                          {pitch.appetite} weeks
                        </Badge>
                        <Badge className={getStatusColor(pitch.status)}>
                          {pitch.status}
                        </Badge>
                      </div>
                    </div>
                    {canBet && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPitch(pitch)}
                          >
                            Review & Bet
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{pitch.title}</DialogTitle>
                            <DialogDescription>
                              Review this pitch and decide whether to bet on it for the next cycle.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Problem Statement */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Problem</h4>
                              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                                {pitch.problem}
                              </p>
                            </div>

                            {/* Proposed Solution */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Proposed Solution</h4>
                              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                                {pitch.solution}
                              </p>
                            </div>

                            {/* Business Value */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Business Value</h4>
                              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                                {pitch.businessValue}
                              </p>
                            </div>

                            {/* Appetite & Roadblocks */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-slate-900 mb-2">Appetite</h4>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-slate-500" />
                                  <span className="text-slate-700">{pitch.appetite} weeks</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900 mb-2">Known Roadblocks</h4>
                                <p className="text-slate-700 text-sm">
                                  {pitch.roadblocks || 'None identified'}
                                </p>
                              </div>
                            </div>

                            {/* Betting Notes */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-2">Betting Notes (Optional)</h4>
                              <Textarea
                                placeholder="Add any notes about your decision..."
                                value={bettingNotes}
                                onChange={(e) => setBettingNotes(e.target.value)}
                                className="h-20"
                              />
                            </div>

                            {/* Betting Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => handleBet(pitch, 'abandoned')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Pass
                              </Button>
                              <Button
                                onClick={() => handleBet(pitch, 'selected')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Bet on This
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Problem:</span>
                      <p className="mt-1">{pitch.problem.substring(0, 100)}...</p>
                    </div>
                    <div>
                      <span className="font-medium">Business Value:</span>
                      <p className="mt-1">{pitch.businessValue.substring(0, 100)}...</p>
                    </div>
                  </div>

                  {pitch.roadblocks && (
                    <div className="mt-3 flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 p-2 rounded">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{pitch.roadblocks}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Pitches for Current Cycle */}
      {selectedPitches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Selected for Current Cycle ({selectedPitches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedPitches.map((pitch) => (
                <div key={pitch.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{pitch.title}</h4>
                    <p className="text-sm text-slate-600">{pitch.appetite} week budget</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Selected
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Pitches */}
      {completedPitches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-slate-500" />
              Previous Decisions ({completedPitches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedPitches.map((pitch) => (
                <div key={pitch.id} className="flex items-center justify-between p-2 text-sm">
                  <span className="text-slate-700">{pitch.title}</span>
                  <Badge className={getStatusColor(pitch.status)}>
                    {pitch.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activePitches.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Pitches Ready</h3>
            <p className="text-slate-600">
              Create and shape some pitches to get started with the betting process.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}