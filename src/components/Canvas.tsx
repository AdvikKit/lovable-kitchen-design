
import React, { useState, useRef, useEffect } from 'react';
import { useDesignContext } from '../context/DesignContext';
import Grid from './Grid';
import Ruler from './Ruler';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mmToPixels, calculateMidpoint, formatMm } from '../utils/measurements';

const Canvas: React.FC = () => {
  const { 
    room, 
    selectedWall, 
    setSelectedWall, 
    zoom, 
    setZoom, 
    panOffset, 
    setPanOffset 
  } = useDesignContext();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  
  // Handle canvas zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom + delta));
    setZoom(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(5, zoom + 0.1);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.1);
    setZoom(newZoom);
  };
  
  // Handle canvas panning
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
  
  // Wall click handler
  const handleWallClick = (wallId: string) => {
    setSelectedWall(selectedWall === wallId ? null : wallId);
  };
  
  // Render walls
  const renderWalls = () => {
    if (!room) return null;
    
    return room.walls.map((wall) => {
      const startX = mmToPixels(wall.start.x, zoom);
      const startY = mmToPixels(wall.start.y, zoom);
      const endX = mmToPixels(wall.end.x, zoom);
      const endY = mmToPixels(wall.end.y, zoom);
      
      // Calculate wall length for display
      const wallLengthMm = Math.sqrt(
        Math.pow(wall.end.x - wall.start.x, 2) + 
        Math.pow(wall.end.y - wall.start.y, 2)
      );
      
      // Calculate midpoint for wall label
      const midpoint = calculateMidpoint(
        { x: startX, y: startY },
        { x: endX, y: endY }
      );
      
      // Calculate label offset for perpendicular display
      const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
      const isVertical = Math.abs(angle) === 90 || Math.abs(angle) === 270;
      
      // Wall label offset (perpendicular to wall)
      const labelOffsetX = isVertical ? -20 : 0;
      const labelOffsetY = isVertical ? 0 : -20;
      
      // Wall dimension offset
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
          
          {/* Wall label */}
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
          
          {/* Wall dimension */}
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
        </g>
      );
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2 bg-slate-200">
        <div className="flex items-center">
          <span className="mr-2 text-sm">Zoom: {Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="mr-1">
            <ZoomOut size={16} />
            <span className="ml-1">Zoom Out</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn size={16} />
            <span className="ml-1">Zoom In</span>
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
          <Ruler />
          <g transform={`translate(${30}px, ${30}px)`}> {/* Offset for rulers */}
            <Grid />
            {renderWalls()}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Canvas;
