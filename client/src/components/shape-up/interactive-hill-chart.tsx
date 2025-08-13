import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';

interface WorkPackage {
  id: string;
  name: string;
  description?: string;
  position: number; // 0-100 along the hill
  phase: 'uphill' | 'downhill';
  isStuck?: boolean;
  color?: string;
}

interface InteractiveHillChartProps {
  workPackages: WorkPackage[];
  onUpdatePosition: (workPackageId: string, position: number, phase: 'uphill' | 'downhill') => void;
  onAddWorkPackage?: (name: string, description?: string) => void;
  onAddScope?: (name: string, description?: string) => void;
  pitchTitle?: string;
  readOnly?: boolean;
  showScopeCreation?: boolean;
}

export function InteractiveHillChart({ 
  workPackages, 
  onUpdatePosition, 
  onAddWorkPackage,
  onAddScope,
  pitchTitle = "Work Packages",
  readOnly = false,
  showScopeCreation = false
}: InteractiveHillChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreatingScope, setIsCreatingScope] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageDesc, setNewPackageDesc] = useState('');

  // SVG dimensions and hill curve calculations
  const svgWidth = 800;
  const svgHeight = 300;
  const hillPadding = 50;
  const hillWidth = svgWidth - 2 * hillPadding;
  const hillHeight = 150;
  const hillTop = 80;

  // Generate hill curve path (bell curve)
  const generateHillPath = useCallback(() => {
    const points: { x: number; y: number }[] = [];
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 to 1
      const x = hillPadding + t * hillWidth;
      
      // Bell curve formula: y = a * exp(-((x-b)^2)/(2*c^2))
      // Where a = height, b = center, c = width
      const normalizedX = (t - 0.5) * 6; // Scale to -3 to 3 for nice bell curve
      const y = hillTop + hillHeight * Math.exp(-(normalizedX * normalizedX) / 2);
      
      points.push({ x, y });
    }
    
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [hillPadding, hillWidth, hillHeight, hillTop]);

  // Convert position (0-100) to SVG coordinates
  const positionToCoords = useCallback((position: number) => {
    const t = position / 100;
    const x = hillPadding + t * hillWidth;
    
    // Calculate y position on the hill curve
    const normalizedX = (t - 0.5) * 6;
    const y = hillTop + hillHeight * Math.exp(-(normalizedX * normalizedX) / 2);
    
    return { x, y };
  }, [hillPadding, hillWidth, hillHeight, hillTop]);

  // Convert SVG coordinates to position (0-100)
  const coordsToPosition = useCallback((x: number) => {
    const clampedX = Math.max(hillPadding, Math.min(x, hillPadding + hillWidth));
    const t = (clampedX - hillPadding) / hillWidth;
    return Math.round(t * 100);
  }, [hillPadding, hillWidth]);

  // Determine phase based on position
  const getPhaseFromPosition = useCallback((position: number): 'uphill' | 'downhill' => {
    return position < 50 ? 'uphill' : 'downhill';
  }, []);

  // Handle mouse down on work package dot
  const handleMouseDown = useCallback((e: React.MouseEvent, workPackageId: string) => {
    if (readOnly) return;
    
    e.preventDefault();
    setDraggedItem(workPackageId);
    
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      const workPackage = workPackages.find(wp => wp.id === workPackageId);
      if (workPackage) {
        const coords = positionToCoords(workPackage.position);
        setDragOffset({
          x: e.clientX - svgRect.left - coords.x,
          y: e.clientY - svgRect.top - coords.y
        });
      }
    }
  }, [readOnly, workPackages, positionToCoords]);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItem || readOnly) return;
    
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      const x = e.clientX - svgRect.left - dragOffset.x;
      const newPosition = coordsToPosition(x);
      const newPhase = getPhaseFromPosition(newPosition);
      
      onUpdatePosition(draggedItem, newPosition, newPhase);
    }
  }, [draggedItem, readOnly, dragOffset, coordsToPosition, getPhaseFromPosition, onUpdatePosition]);

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Set up global mouse events for dragging
  useEffect(() => {
    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, handleMouseMove, handleMouseUp]);

  // Handle adding new work package or scope
  const handleAddPackage = () => {
    if (newPackageName.trim()) {
      // Always call the appropriate handler based on what button was clicked
      if (onAddWorkPackage) {
        onAddWorkPackage(newPackageName.trim(), newPackageDesc.trim() || undefined);
      }
      setNewPackageName('');
      setNewPackageDesc('');
      setShowAddForm(false);
    }
  };

  // Handle adding new scope
  const handleAddScopeAction = () => {
    if (newPackageName.trim() && onAddScope) {
      onAddScope(newPackageName.trim(), newPackageDesc.trim() || undefined);
      setNewPackageName('');
      setNewPackageDesc('');
      setShowAddForm(false);
    }
  };

  // Generate colors for work packages
  const getWorkPackageColor = (index: number, isStuck?: boolean) => {
    if (isStuck) return '#ef4444'; // red for stuck items
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
    return colors[index % colors.length];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{pitchTitle}</CardTitle>
          <div className="flex gap-2">
            {!readOnly && onAddWorkPackage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreatingScope(false);
                  setShowAddForm(true);
                }}
                disabled={showAddForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Work Package
              </Button>
            )}
            {!readOnly && showScopeCreation && onAddScope && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreatingScope(true);
                  setShowAddForm(true);
                }}
                disabled={showAddForm}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project Scope
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new work package form */}
        {showAddForm && (
          <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
            <input
              type="text"
              placeholder={isCreatingScope ? "Scope name..." : "Work package name..."}
              value={newPackageName}
              onChange={(e) => setNewPackageName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)..."
              value={newPackageDesc}
              onChange={(e) => setNewPackageDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={isCreatingScope ? handleAddScopeAction : handleAddPackage} 
                disabled={!newPackageName.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreatingScope ? "Add Scope" : "Add Work Package"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setShowAddForm(false);
                setIsCreatingScope(false);
                setNewPackageName('');
                setNewPackageDesc('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Hill Chart SVG */}
        <div className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="border rounded-lg bg-white"
            style={{ cursor: draggedItem ? 'grabbing' : 'default' }}
          >
            {/* Hill curve */}
            <path
              d={generateHillPath()}
              stroke="#e2e8f0"
              strokeWidth="3"
              fill="none"
            />
            
            {/* Center line */}
            <line
              x1={svgWidth / 2}
              y1={hillTop - 20}
              x2={svgWidth / 2}
              y2={svgHeight - 30}
              stroke="#cbd5e1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Phase labels */}
            <text
              x={svgWidth / 4}
              y={svgHeight - 10}
              textAnchor="middle"
              className="fill-slate-600 text-sm font-medium"
            >
              FIGURING THINGS OUT
            </text>
            <text
              x={(3 * svgWidth) / 4}
              y={svgHeight - 10}
              textAnchor="middle"
              className="fill-slate-600 text-sm font-medium"
            >
              MAKING IT HAPPEN
            </text>
            
            {/* Work package dots */}
            {workPackages.map((workPackage, index) => {
              const coords = positionToCoords(workPackage.position);
              const color = workPackage.color || getWorkPackageColor(index, workPackage.isStuck);
              const isDragging = draggedItem === workPackage.id;
              
              return (
                <g key={workPackage.id}>
                  {/* Dot */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isDragging ? 12 : 10}
                    fill={color}
                    stroke="white"
                    strokeWidth="3"
                    className={`transition-all ${!readOnly ? 'cursor-grab hover:scale-110' : ''} ${
                      isDragging ? 'scale-125 shadow-lg' : ''
                    }`}
                    onMouseDown={(e) => handleMouseDown(e, workPackage.id)}
                  />
                  
                  {/* Label */}
                  <text
                    x={coords.x}
                    y={coords.y - 20}
                    textAnchor="middle"
                    className="fill-slate-700 text-xs font-medium pointer-events-none"
                  >
                    {workPackage.name}
                  </text>
                  
                  {/* Stuck indicator */}
                  {workPackage.isStuck && (
                    <text
                      x={coords.x + 15}
                      y={coords.y + 5}
                      className="fill-red-500 text-xs font-bold pointer-events-none"
                    >
                      !
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Work packages list */}
        {workPackages.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-slate-900">Work Packages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {workPackages.map((workPackage, index) => {
                const color = workPackage.color || getWorkPackageColor(index, workPackage.isStuck);
                return (
                  <div
                    key={workPackage.id}
                    className="flex items-center p-3 border rounded-lg hover:bg-slate-50"
                  >
                    <div
                      className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{workPackage.name}</div>
                      {workPackage.description && (
                        <div className="text-sm text-slate-600 truncate">{workPackage.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {workPackage.isStuck && (
                        <Badge variant="destructive" className="text-xs">Stuck</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {workPackage.phase}
                      </Badge>
                      <span className="text-xs text-slate-500">{workPackage.position}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {workPackages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <p>No work packages yet. Add some scopes to track progress on the hill chart.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}