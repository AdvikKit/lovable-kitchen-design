
import React from 'react';
import { Room, Wall, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';

interface ElevationWindowsRendererProps {
  room: Room;
  wall: Wall;
  zoom: number;
  panOffset: Point;
}

const ElevationWindowsRenderer: React.FC<ElevationWindowsRendererProps> = ({
  room,
  wall,
  zoom,
  panOffset
}) => {
  const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  const wallWindows = room.windows.filter(window => window.wallId === wall.id);
  
  return wallWindows.map((window) => {
    const distanceAlongWall = Math.cos(wallAngle) * (window.position.x - wall.start.x) +
                             Math.sin(wallAngle) * (window.position.y - wall.start.y);
    
    const x = mmToPixels(distanceAlongWall, zoom) + panOffset.x;
    const y = mmToPixels(room.height - window.position.y - window.height, zoom) + panOffset.y;
    const width = mmToPixels(window.width, zoom);
    const height = mmToPixels(window.height, zoom);
    
    return (
      <g key={window.id}>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill="#bfdbfe"
          stroke="#475569"
          strokeWidth="2"
        />
        
        <line 
          x1={x + width/2} 
          y1={y} 
          x2={x + width/2} 
          y2={y + height} 
          stroke="#475569" 
          strokeWidth="1" 
        />
        
        <line 
          x1={x} 
          y1={y + height/2} 
          x2={x + width} 
          y2={y + height/2} 
          stroke="#475569" 
          strokeWidth="1" 
        />
        
        <text 
          x={x + width / 2} 
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1e293b"
          fontSize={Math.max(8, 12 * zoom)}
        >
          Window
        </text>
      </g>
    );
  });
};

export default ElevationWindowsRenderer;

