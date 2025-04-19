
import React from 'react';
import { Room, Wall, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';

interface ElevationDoorsRendererProps {
  room: Room;
  wall: Wall;
  zoom: number;
  panOffset: Point;
}

const ElevationDoorsRenderer: React.FC<ElevationDoorsRendererProps> = ({
  room,
  wall,
  zoom,
  panOffset
}) => {
  const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  const wallDoors = room.doors.filter(door => door.wallId === wall.id);
  
  return wallDoors.map((door) => {
    const distanceAlongWall = Math.cos(wallAngle) * (door.position.x - wall.start.x) +
                             Math.sin(wallAngle) * (door.position.y - wall.start.y);
    
    const x = mmToPixels(distanceAlongWall, zoom) + panOffset.x;
    const y = mmToPixels(room.height - door.height, zoom) + panOffset.y;
    const width = mmToPixels(door.width, zoom);
    const height = mmToPixels(door.height, zoom);
    
    return (
      <g key={door.id}>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="2"
        />
        
        <circle 
          cx={x + width * 0.9} 
          cy={y + height * 0.5} 
          r={width * 0.03} 
          fill="#475569"
        />
        
        <text 
          x={x + width / 2} 
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1e293b"
          fontSize={Math.max(8, 12 * zoom)}
        >
          Door
        </text>
      </g>
    );
  });
};

export default ElevationDoorsRenderer;

