import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { WorkPackage } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface HillChartProps {
  workPackages: WorkPackage[];
  pitchId: string;
}

export function HillChart({ workPackages, pitchId }: HillChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const updateWorkPackageMutation = useMutation({
    mutationFn: async ({ id, position, phase }: { id: string; position: number; phase: string }) => {
      const res = await apiRequest("PUT", `/api/work-packages/${id}`, { position, phase });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pitches", pitchId, "work-packages"] });
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 300 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    drawHillChart(ctx, rect.width, 300, workPackages);
  }, [workPackages]);

  const drawHillChart = (ctx: CanvasRenderingContext2D, width: number, height: number, packages: WorkPackage[]) => {
    ctx.clearRect(0, 0, width, height);
    
    // Draw hill background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, height);
    
    // Draw hill curve
    ctx.beginPath();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    const centerX = width / 2;
    const bottomY = height - 50;
    const topY = 50;
    
    // Left side (uphill)
    ctx.moveTo(50, bottomY);
    ctx.quadraticCurveTo(centerX, topY, centerX, bottomY);
    
    // Right side (downhill)  
    ctx.quadraticCurveTo(centerX, topY, width - 50, bottomY);
    ctx.stroke();
    
    // Draw center line
    ctx.beginPath();
    ctx.strokeStyle = '#94A3B8';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX, bottomY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw labels
    ctx.fillStyle = '#475569';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Figuring Things Out', centerX / 2, bottomY + 30);
    ctx.fillText('Making It Happen', centerX + centerX / 2, bottomY + 30);
    
    // Draw work packages
    packages.forEach((pkg, index) => {
      const normalizedPosition = Math.max(0, Math.min(100, pkg.position)) / 100;
      const x = 50 + (width - 100) * normalizedPosition;
      const hillY = calculateHillY(normalizedPosition, topY, bottomY, width);
      const y = hillY - 30; // Offset from hill curve
      
      // Color based on index
      const hue = (index * 60) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;
      
      // Draw dot
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x, y, pkg.isStuck ? 8 : 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw stuck indicator
      if (pkg.isStuck) {
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw label
      ctx.fillStyle = '#1E293B';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(pkg.name, x, y - 15);
    });
  };

  const calculateHillY = (normalizedX: number, topY: number, bottomY: number, width: number) => {
    // Quadratic curve: y = a(x - h)² + k
    // Where (h,k) is vertex at (0.5, topY) and curve passes through (0, bottomY) and (1, bottomY)
    const a = 4 * (bottomY - topY);
    const h = 0.5;
    const k = topY;
    return a * Math.pow(normalizedX - h, 2) + k;
  };

  const getMousePos = (canvas: HTMLCanvasElement, event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const findWorkPackageAtPosition = (x: number, y: number, packages: WorkPackage[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const width = canvas.offsetWidth;
    const height = 300;
    const topY = 50;
    const bottomY = height - 50;

    for (const pkg of packages) {
      const normalizedPosition = Math.max(0, Math.min(100, pkg.position)) / 100;
      const pkgX = 50 + (width - 100) * normalizedPosition;
      const hillY = calculateHillY(normalizedPosition, topY, bottomY, width);
      const pkgY = hillY - 30;

      const distance = Math.sqrt(Math.pow(x - pkgX, 2) + Math.pow(y - pkgY, 2));
      if (distance <= 12) {
        return pkg;
      }
    }
    return null;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePos(canvas, event.nativeEvent);
    const pkg = findWorkPackageAtPosition(mousePos.x, mousePos.y, workPackages);
    
    if (pkg) {
      setDragging(pkg.id);
      const width = canvas.offsetWidth;
      const normalizedPosition = Math.max(0, Math.min(100, pkg.position)) / 100;
      const pkgX = 50 + (width - 100) * normalizedPosition;
      setDragOffset({
        x: mousePos.x - pkgX,
        y: 0,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getMousePos(canvas, event.nativeEvent);
    const width = canvas.offsetWidth;
    
    // Calculate new position
    const newX = mousePos.x - dragOffset.x;
    const normalizedX = Math.max(0, Math.min(1, (newX - 50) / (width - 100)));
    const newPosition = Math.round(normalizedX * 100);
    
    // Determine phase
    const phase = normalizedX < 0.5 ? "uphill" : "downhill";
    
    // Update work package position optimistically
    const updatedPackages = workPackages.map(pkg => 
      pkg.id === dragging 
        ? { ...pkg, position: newPosition, phase }
        : pkg
    );
    
    // Redraw with updated position
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawHillChart(ctx, width, 300, updatedPackages);
    }
  };

  const handleMouseUp = () => {
    if (!dragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pkg = workPackages.find(p => p.id === dragging);
    if (pkg) {
      const width = canvas.offsetWidth;
      const normalizedPosition = Math.max(0, Math.min(100, pkg.position)) / 100;
      const phase = normalizedPosition < 50 ? "uphill" : "downhill";
      
      updateWorkPackageMutation.mutate({
        id: pkg.id,
        position: pkg.position,
        phase,
      });
    }

    setDragging(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="hill-chart-container w-full h-[300px] relative">
      <canvas
        ref={canvasRef}
        className="hill-chart-canvas w-full h-full bg-slate-50 border border-slate-200 rounded cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
