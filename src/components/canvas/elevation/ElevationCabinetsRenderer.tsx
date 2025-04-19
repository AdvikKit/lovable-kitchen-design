
import React from 'react';
import { Room, Wall, Cabinet, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';

interface ElevationCabinetsRendererProps {
  room: Room;
  wall: Wall;
  zoom: number;
  panOffset: Point;
}

const ElevationCabinetsRenderer: React.FC<ElevationCabinetsRendererProps> = ({
  room,
  wall,
  zoom,
  panOffset
}) => {
  const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  const wallCabinets = room.cabinets.filter(cabinet => cabinet.wallId === wall.id);
  
  return wallCabinets.map((cabinet) => {
    const distanceAlongWall = Math.cos(wallAngle) * (cabinet.position.x - wall.start.x) +
                             Math.sin(wallAngle) * (cabinet.position.y - wall.start.y);
    
    const x = mmToPixels(distanceAlongWall, zoom) + panOffset.x;
    const y = mmToPixels(room.height - cabinet.height, zoom) + panOffset.y;
    const width = mmToPixels(cabinet.width, zoom);
    const height = mmToPixels(cabinet.height, zoom);
    
    let fillColor = cabinet.color;
    if (fillColor === 'natural') fillColor = '#E3C395';
    else if (fillColor === 'walnut') fillColor = '#5C4033';
    else if (fillColor === 'cherry') fillColor = '#6E2E1C';
    
    return (
      <g key={cabinet.id}>
        <rect 
          x={x}
          y={y}
          width={width} 
          height={height} 
          fill={fillColor}
          stroke="#475569"
          strokeWidth="1"
        />
        
        <rect 
          x={x + width * 0.45} 
          y={y + height * 0.5} 
          width={width * 0.1} 
          height={height * 0.2} 
          fill="#94a3b8"
        />
        
        <text 
          x={x + width / 2} 
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={cabinet.color === 'black' ? "white" : "black"}
          fontSize={Math.max(8, 12 * zoom)}
          fontWeight="bold"
        >
          {cabinet.name}
        </text>
      </g>
    );
  });
};

export default ElevationCabinetsRenderer;

