import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkPackage } from '@shared/schema';

interface HillChartProps {
  workPackages: WorkPackage[];
  onUpdatePosition: (workPackageId: string, newPosition: number, newPhase: 'uphill' | 'downhill') => void;
  pitchTitle: string;
}

interface DraggableWorkPackage extends WorkPackage {
  x: number;
  y: number;
}

export function HillChart({ workPackages, onUpdatePosition, pitchTitle }: HillChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const width = 800;
  const height = 400;
  const hillHeight = 200;
  const hillCenterX = width / 2;
  const hillCenterY = height - 100;
  const radius = 300;

  // Generate hill curve path
  const generateHillPath = () => {
    const startX = hillCenterX - radius;
    const endX = hillCenterX + radius;
    const startY = hillCenterY;
    const endY = hillCenterY;
    const peakX = hillCenterX;
    const peakY = hillCenterY - hillHeight;

    return `M ${startX} ${startY} Q ${peakX} ${peakY} ${endX} ${endY}`;
  };

  // Convert position (0-100) to coordinates on the hill
  const positionToCoordinates = useCallback((position: number) => {
    const normalizedPosition = Math.max(0, Math.min(100, position));
    const angle = (normalizedPosition / 100) * Math.PI; // 0 to π
    const x = hillCenterX - radius * Math.cos(angle);
    const y = hillCenterY - radius * Math.sin(angle);
    return { x, y };
  }, [hillCenterX, hillCenterY, radius]);

  // Convert coordinates to position (0-100)
  const coordinatesToPosition = useCallback((x: number, y: number) => {
    const dx = x - hillCenterX;
    const dy = hillCenterY - y;
    let angle = Math.atan2(dy, -dx);
    if (angle < 0) angle = 0;
    if (angle > Math.PI) angle = Math.PI;
    return (angle / Math.PI) * 100;
  }, [hillCenterX, hillCenterY]);

  // Prepare work packages with coordinates
  const draggableWorkPackages: DraggableWorkPackage[] = workPackages.map(wp => {
    const coords = positionToCoordinates(wp.position);
    return {
      ...wp,
      x: coords.x,
      y: coords.y
    };
  });

  const handleMouseDown = (workPackageId: string) => {
    setDraggedItem(workPackageId);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedItem || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Constrain to hill curve
    const newPosition = coordinatesToPosition(x, y);
    const newPhase = newPosition <= 50 ? 'uphill' : 'downhill';
    
    onUpdatePosition(draggedItem, newPosition, newPhase);
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  const getStatusColor = (phase: string, position: number) => {
    if (phase === 'uphill') {
      return position < 25 ? '#ef4444' : '#f59e0b'; // red to amber
    } else {
      return position > 75 ? '#22c55e' : '#3b82f6'; // blue to green
    }
  };

  const getTooltipContent = (wp: WorkPackage) => {
    const phase = wp.phase === 'uphill' ? 'Figuring things out' : 'Executing the plan';
    const progress = wp.position < 25 ? 'Just started' :
                    wp.position < 50 ? 'Making progress' :
                    wp.position < 75 ? 'Clear path ahead' : 'Almost done';
    
    return (
      <div className="text-xs">
        <div className="font-semibold">{wp.name}</div>
        <div>Phase: {phase}</div>
        <div>Progress: {progress}</div>
        {wp.assignee && <div>Assigned to: {wp.assignee}</div>}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Hill Chart: {pitchTitle}</span>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Uphill (Figuring out)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Downhill (Executing)</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Drag work packages to update their progress. Uphill = figuring things out, Downhill = executing with clear plan.
          </p>
        </div>
        
        <TooltipProvider>
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Hill curve */}
            <path
              d={generateHillPath()}
              stroke="#94a3b8"
              strokeWidth="3"
              fill="none"
              className="hill-curve"
            />
            
            {/* Peak marker */}
            <circle
              cx={hillCenterX}
              cy={hillCenterY - hillHeight}
              r="4"
              fill="#64748b"
            />
            <text
              x={hillCenterX}
              y={hillCenterY - hillHeight - 15}
              textAnchor="middle"
              className="text-xs fill-slate-600"
            >
              Peak
            </text>

            {/* Phase labels */}
            <text
              x={hillCenterX - 150}
              y={hillCenterY + 40}
              textAnchor="middle"
              className="text-sm fill-slate-600 font-medium"
            >
              Figuring things out
            </text>
            <text
              x={hillCenterX + 150}
              y={hillCenterY + 40}
              textAnchor="middle"
              className="text-sm fill-slate-600 font-medium"
            >
              Executing
            </text>

            {/* Vertical divider at peak */}
            <line
              x1={hillCenterX}
              y1={hillCenterY - hillHeight}
              x2={hillCenterX}
              y2={hillCenterY + 50}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Work packages */}
            {draggableWorkPackages.map((wp) => (
              <Tooltip key={wp.id}>
                <TooltipTrigger asChild>
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r="12"
                    fill={getStatusColor(wp.phase, wp.position)}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer hover:stroke-slate-400 transition-all duration-200"
                    style={{
                      transform: draggedItem === wp.id ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onMouseDown={() => handleMouseDown(wp.id)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {getTooltipContent(wp)}
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Work package labels */}
            {draggableWorkPackages.map((wp) => (
              <text
                key={`label-${wp.id}`}
                x={wp.x}
                y={wp.y - 20}
                textAnchor="middle"
                className="text-xs fill-slate-700 font-medium pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {wp.name.length > 15 ? wp.name.substring(0, 15) + '...' : wp.name}
              </text>
            ))}
          </svg>
        </TooltipProvider>

        {/* Work packages legend */}
        <div className="mt-6">
          <h4 className="font-medium text-slate-900 mb-3">Work Packages</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {workPackages.map((wp) => (
              <div key={wp.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getStatusColor(wp.phase, wp.position) }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{wp.name}</div>
                  <div className="text-xs text-slate-500">
                    {wp.phase === 'uphill' ? 'Figuring out' : 'Executing'} • {Math.round(wp.position)}%
                  </div>
                </div>
                {wp.isStuck && (
                  <Badge variant="destructive" className="text-xs">Stuck</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}