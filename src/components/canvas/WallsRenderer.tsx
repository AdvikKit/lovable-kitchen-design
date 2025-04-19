
import React from 'react';
import { Eye } from 'lucide-react';
import { Wall, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';
import { calculateMidpoint, formatMm } from '@/utils/measurements';

interface WallsRendererProps {
  walls: Wall[];
  selectedWall: string | null;
  zoom: number;
  panOffset: Point;
  elevationMode: boolean;
  handleWallClick: (wallId: string) => void;
  toggleElevationMode: (wallId: string) => void;
}

const WallsRenderer: React.FC<WallsRendererProps> = ({
  walls,
  selectedWall,
  zoom,
  panOffset,
  elevationMode,
  handleWallClick,
  toggleElevationMode
}) => {
  if (!walls || elevationMode) return null;

  return walls.map((wall) => {
    const startX = mmToPixels(wall.start.x, zoom) + panOffset.x;
    const startY = mmToPixels(wall.start.y, zoom) + panOffset.y;
    const endX = mmToPixels(wall.end.x, zoom) + panOffset.x;
    const endY = mmToPixels(wall.end.y, zoom) + panOffset.y;
    
    const dx = wall.end.x - wall.start.x;
    const dy = wall.end.y - wall.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const thickness = mmToPixels(wall.thickness, zoom);
    const perpX = -Math.sin(angle) * thickness;
    const perpY = Math.cos(angle) * thickness;
    
    const points = [
      { x: startX, y: startY },
      { x: endX, y: endY },
      { x: endX + perpX, y: endY + perpY },
      { x: startX + perpX, y: startY + perpY }
    ];
    
    const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
    const midpoint = calculateMidpoint({ x: startX, y: startY }, { x: endX, y: endY });
    const midpointOuter = calculateMidpoint(
      { x: startX + perpX, y: startY + perpY },
      { x: endX + perpX, y: endY + perpY }
    );
    const labelMidpoint = calculateMidpoint(midpoint, midpointOuter);
    
    const angle_deg = angle * (180 / Math.PI);
    const isVertical = Math.abs(Math.abs(angle_deg) - 90) < 45;
    
    return (
      <g 
        key={wall.id}
        onClick={() => handleWallClick(wall.id)}
        style={{ cursor: 'pointer' }}
      >
        <polygon 
          points={pointsString} 
          fill={selectedWall === wall.id ? "#C5DCFF" : "#E2E8F0"}
          stroke={selectedWall === wall.id ? "#3b82f6" : "#475569"}
          strokeWidth="1"
        />
        
        <text 
          x={labelMidpoint.x + (isVertical ? -20 : 0)} 
          y={labelMidpoint.y + (isVertical ? 0 : -20)}
          className="kitchen-wall-label"
          fill="#475569"
          fontSize="12"
          transform={isVertical ? `rotate(90,${labelMidpoint.x},${labelMidpoint.y})` : ''}
        >
          Wall {wall.label}
        </text>
        
        <text 
          x={labelMidpoint.x} 
          y={labelMidpoint.y + (isVertical ? 0 : 15)}
          className="kitchen-wall-dimension"
          fill="#475569"
          fontSize="10"
          transform={isVertical ? `rotate(90,${labelMidpoint.x},${labelMidpoint.y})` : ''}
        >
          {formatMm(length, length >= 1000)}
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
            <circle cx="0" cy="0" r="15" fill="#94a3b8" />
            <foreignObject x="-8" y="-8" width="16" height="16">
              <Eye size={16} color="white" />
            </foreignObject>
          </g>
        )}
      </g>
    );
  });
};

export default WallsRenderer;
