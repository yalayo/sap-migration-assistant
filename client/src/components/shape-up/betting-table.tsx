import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react';

interface BettingTableProps {
  pitches: any[];
  onUpdatePitchStatus: (pitchId: string, status: string, notes?: string) => void;
  currentCycle: number;
  canBet?: boolean;
}

export default function BettingTable({
  pitches,
  onUpdatePitchStatus,
  currentCycle,
  canBet = false,
}: BettingTableProps) {
  const [selectedPitch, setSelectedPitch] = useState<any>(null);
  const [bettingNotes, setBettingNotes] = useState('');
  const [showBettingDialog, setShowBettingDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'selected':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'on_hold':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppetiteColor = (appetite: number) => {
    if (appetite <= 2) return 'bg-green-100 text-green-800';
    if (appetite <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleBet = (pitch: any, decision: string) => {
    setSelectedPitch(pitch);
    setBettingNotes('');
    setShowBettingDialog(true);
  };

  const confirmBet = (decision: string) => {
    if (selectedPitch) {
      onUpdatePitchStatus(selectedPitch.id, decision, bettingNotes);
      setShowBettingDialog(false);
      setSelectedPitch(null);
      setBettingNotes('');
    }
  };

  const pendingPitches = pitches.filter(p => p.status === 'pending' || !p.status);
  const reviewedPitches = pitches.filter(p => ['selected', 'rejected', 'on_hold'].includes(p.status));

  return (
    <div className="space-y-6">
      {/* Betting Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="w-5 h-5 mr-2" />
            Betting Table - Cycle {currentCycle + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Shape Up Betting Process:</strong>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>• Review each pitch's problem, solution, and appetite</li>
              <li>• Decide which pitches to bet on for the next cycle</li>
              <li>• Selected pitches become active work for the next {currentCycle + 1}-week cycle</li>
              <li>• Only bet on work you're confident can be completed within the appetite</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pending Pitches */}
      {pendingPitches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Pitches for Review ({pendingPitches.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pitch</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Appetite</TableHead>
                  <TableHead>Business Value</TableHead>
                  {canBet && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPitches.map((pitch) => (
                  <TableRow key={pitch.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pitch.title}</div>
                        {pitch.teamMembers && pitch.teamMembers.length > 0 && (
                          <div className="flex items-center text-sm text-slate-600 mt-1">
                            <Users className="w-3 h-3 mr-1" />
                            {pitch.teamMembers.length} team members
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700 max-w-xs truncate">
                        {pitch.problem || 'No problem statement'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAppetiteColor(pitch.appetite)}>
                        {pitch.appetite}w
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pitch.businessValue}
                      </Badge>
                    </TableCell>
                    {canBet && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleBet(pitch, 'selected')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Bet
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBet(pitch, 'on_hold')}
                            className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                          >
                            Hold
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBet(pitch, 'rejected')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Pass
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Reviewed Pitches */}
      {reviewedPitches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Betting Results ({reviewedPitches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pitch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Appetite</TableHead>
                  <TableHead>Business Value</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedPitches.map((pitch) => (
                  <TableRow key={pitch.id}>
                    <TableCell>
                      <div className="font-medium">{pitch.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(pitch.status)}
                        <Badge className={getStatusColor(pitch.status)}>
                          {pitch.status?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAppetiteColor(pitch.appetite)}>
                        {pitch.appetite}w
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {pitch.businessValue}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600 max-w-xs truncate">
                        {pitch.bettingNotes || 'No notes'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Pitches */}
      {pitches.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Pitches Yet</h2>
            <p className="text-slate-600">
              Create some pitches to start the betting process for the next cycle.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Betting Dialog */}
      <Dialog open={showBettingDialog} onOpenChange={setShowBettingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Betting Decision: {selectedPitch?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="betting-notes">Notes (Optional)</Label>
              <Textarea
                id="betting-notes"
                value={bettingNotes}
                onChange={(e) => setBettingNotes(e.target.value)}
                placeholder="Add reasoning for this decision..."
                className="mt-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowBettingDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmBet('selected')}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Bet
              </Button>
              <Button
                onClick={() => confirmBet('on_hold')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Put on Hold
              </Button>
              <Button
                onClick={() => confirmBet('rejected')}
                className="bg-red-600 hover:bg-red-700"
              >
                Pass
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}