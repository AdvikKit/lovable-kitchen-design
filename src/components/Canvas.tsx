
import React, { useState, useRef, useEffect } from 'react';
import { useDesignContext } from '../context/DesignContext';
import Grid from './Grid';
import Ruler from './Ruler';
import { ZoomIn, ZoomOut, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mmToPixels, calculateMidpoint, formatMm } from '../utils/measurements';
import { toast } from '@/components/ui/use-toast';

const Canvas: React.FC = () => {
  const { 
    room, 
    selectedWall, 
    setSelectedWall, 
    zoom, 
    setZoom, 
    panOffset, 
    setPanOffset,
    elevationMode,
    setElevationMode
  } = useDesignContext();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  // Reset view to fit room in viewport
  const resetView = () => {
    if (room && canvasRef.current) {
      const canvas = canvasRef.current;
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      
      // Calculate zoom to fit room with some padding
      const roomWidthPx = mmToPixels(room.width, 1);
      const roomLengthPx = mmToPixels(room.length, 1);
      
      // Calculate zoom to fit based on shorter dimension with padding
      const zoomX = (canvasWidth - 100) / roomWidthPx;
      const zoomY = (canvasHeight - 100) / roomLengthPx;
      const newZoom = Math.min(Math.min(zoomX, zoomY), 1);
      
      // Center the room
      const centerX = (canvasWidth / 2) - (mmToPixels(room.width, newZoom) / 2);
      const centerY = (canvasHeight / 2) - (mmToPixels(room.length, newZoom) / 2);
      
      setZoom(newZoom);
      setPanOffset({ x: centerX, y: centerY });
      
      toast({
        title: "View Reset",
        description: "The room has been centered in the viewport.",
      });
    }
  };
  
  // Center room when it's first created
  useEffect(() => {
    if (room) {
      resetView();
    }
  }, [room]);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with ctrl/cmd key
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
      
      // Zoom centered on mouse position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newPanOffsetX = mouseX - ((mouseX - panOffset.x) * (newZoom / zoom));
        const newPanOffsetY = mouseY - ((mouseY - panOffset.y) * (newZoom / zoom));
        
        setZoom(newZoom);
        setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
      }
    } else {
      // Pan with mouse wheel
      setPanOffset({
        x: panOffset.x - (e.deltaX * 0.5),
        y: panOffset.y - (e.deltaY * 0.5)
      });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(5, zoom * 1.2);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newPanOffsetX = centerX - ((centerX - panOffset.x) * (newZoom / zoom));
      const newPanOffsetY = centerY - ((centerY - panOffset.y) * (newZoom / zoom));
      
      setZoom(newZoom);
      setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
    } else {
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom / 1.2);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newPanOffsetX = centerX - ((centerX - panOffset.x) * (newZoom / zoom));
      const newPanOffsetY = centerY - ((centerY - panOffset.y) * (newZoom / zoom));
      
      setZoom(newZoom);
      setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
    } else {
      setZoom(newZoom);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWallClick = (wallId: string) => {
    setSelectedWall(selectedWall === wallId ? null : wallId);
    
    if (elevationMode) {
      console.log(`Viewing elevation for Wall ${wallId}`);
    }
  };
  
  const toggleElevationMode = (wallId: string | null) => {
    if (elevationMode && selectedWall === wallId) {
      setElevationMode(false);
    } else {
      setElevationMode(true);
      setSelectedWall(wallId);
    }
  };
  
  const renderWalls = () => {
    if (!room) return null;
    
    return room.walls.map((wall) => {
      const startX = mmToPixels(wall.start.x, zoom);
      const startY = mmToPixels(wall.start.y, zoom);
      const endX = mmToPixels(wall.end.x, zoom);
      const endY = mmToPixels(wall.end.y, zoom);
      
      const wallLengthMm = Math.sqrt(
        Math.pow(wall.end.x - wall.start.x, 2) + 
        Math.pow(wall.end.y - wall.start.y, 2)
      );
      
      const midpoint = calculateMidpoint(
        { x: startX, y: startY },
        { x: endX, y: endY }
      );
      
      const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
      const isVertical = Math.abs(angle) === 90 || Math.abs(angle) === 270;
      
      const labelOffsetX = isVertical ? -20 : 0;
      const labelOffsetY = isVertical ? 0 : -20;
      
      const dimensionOffsetX = isVertical ? 0 : 0;
      const dimensionOffsetY = isVertical ? 0 : 15;
      
      return (
        <g 
          key={wall.id} 
          transform={`translate(${panOffset.x}px, ${panOffset.y}px)`}
          onClick={() => handleWallClick(wall.id)}
          style={{ cursor: 'pointer' }}
        >
          <line 
            x1={startX} 
            y1={startY} 
            x2={endX} 
            y2={endY}
            className={selectedWall === wall.id ? "kitchen-wall-selected" : "kitchen-wall"}
            strokeWidth="2"
            stroke={selectedWall === wall.id ? "#3b82f6" : "#475569"}
          />
          
          <text 
            x={midpoint.x + labelOffsetX} 
            y={midpoint.y + labelOffsetY}
            className="kitchen-wall-label"
            fill="#475569"
            fontSize="12"
            transform={isVertical ? `rotate(90,${midpoint.x},${midpoint.y})` : ''}
          >
            Wall {wall.label}
          </text>
          
          <text 
            x={midpoint.x + dimensionOffsetX} 
            y={midpoint.y + dimensionOffsetY}
            className="kitchen-wall-dimension"
            fill="#475569"
            fontSize="10"
            transform={isVertical ? `rotate(90,${midpoint.x},${midpoint.y})` : ''}
          >
            {formatMm(wallLengthMm, wallLengthMm >= 1000)}
          </text>
          
          {selectedWall === wall.id && (
            <g 
              className="elevation-button" 
              transform={`translate(${midpoint.x + (isVertical ? -40 : 0)}, ${midpoint.y + (isVertical ? 0 : -40)})`}
              onClick={(e) => {
                e.stopPropagation();
                toggleElevationMode(wall.id);
              }}
            >
              <circle cx="0" cy="0" r="15" fill={elevationMode ? "#3b82f6" : "#94a3b8"} />
              <foreignObject x="-8" y="-8" width="16" height="16">
                <Eye size={16} color="white" />
              </foreignObject>
            </g>
          )}
        </g>
      );
    });
  };
  
  const renderElevation = () => {
    if (!elevationMode || !selectedWall || !room) return null;
    
    const wall = room.walls.find(w => w.id === selectedWall);
    if (!wall) return null;
    
    const wallLengthMm = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    const wallWidthPx = mmToPixels(wallLengthMm, zoom);
    const wallHeightPx = mmToPixels(room.height, zoom);
    
    return (
      <g transform={`translate(${panOffset.x}px, ${panOffset.y}px)`}>
        <rect
          x="0"
          y="0"
          width={wallWidthPx}
          height={wallHeightPx}
          fill="#f8fafc"
          stroke="#475569"
          strokeWidth="2"
        />
        
        <text
          x={wallWidthPx / 2}
          y={20}
          textAnchor="middle"
          fill="#475569"
          fontSize="14"
          fontWeight="bold"
        >
          Wall {wall.label} - Elevation View
        </text>
        
        <text
          x={wallWidthPx / 2}
          y={40}
          textAnchor="middle"
          fill="#475569"
          fontSize="12"
        >
          {formatMm(wallLengthMm, wallLengthMm >= 1000)} × {formatMm(room.height, room.height >= 1000)}
        </text>
        
        <line
          x1="0"
          y1={wallHeightPx}
          x2={wallWidthPx}
          y2={wallHeightPx}
          stroke="#64748b"
          strokeWidth="2"
        />
        
        <g
          onClick={() => setElevationMode(false)}
          style={{ cursor: 'pointer' }}
          transform={`translate(${wallWidthPx - 30}, 30)`}
        >
          <circle cx="0" cy="0" r="15" fill="#ef4444" />
          <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12">×</text>
        </g>
      </g>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2 bg-slate-200 space-x-2">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={resetView} className="mr-1">
            <RotateCcw size={16} />
            <span className="ml-1">Center</span>
          </Button>
          <span className="mx-2 text-sm">Zoom: {Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="mr-1">
            <ZoomOut size={16} />
            <span className="ml-1">-</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn size={16} />
            <span className="ml-1">+</span>
          </Button>
        </div>
      </div>
      
      <div 
        ref={canvasRef}
        className="kitchen-canvas w-full h-full bg-slate-100 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="100%" height="100%">
          {!elevationMode && <Ruler />}
          <g transform={`translate(${elevationMode ? 0 : 30}px, ${elevationMode ? 0 : 30}px)`}> 
            {!elevationMode && <Grid />}
            {elevationMode ? renderElevation() : renderWalls()}
          </g>
        </svg>
      </div>

      {room && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-70 p-2 rounded text-sm">
          <div>Room: {room.width}mm × {room.length}mm × {room.height}mm</div>
          <div>Tip: Hold Ctrl/Cmd while scrolling to zoom</div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
