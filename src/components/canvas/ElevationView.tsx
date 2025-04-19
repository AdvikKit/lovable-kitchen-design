
import React from 'react';
import { Room, Wall, Cabinet, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';
import { formatMm } from '@/utils/measurements';

interface ElevationViewProps {
  room: Room;
  selectedWall: string;
  zoom: number;
  panOffset: Point;
  setElevationMode: (mode: boolean) => void;
}

const ElevationView: React.FC<ElevationViewProps> = ({
  room,
  selectedWall,
  zoom,
  panOffset,
  setElevationMode
}) => {
  const wall = room.walls.find(w => w.id === selectedWall);
  if (!wall) return null;
  
  const wallLengthMm = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + 
    Math.pow(wall.end.y - wall.start.y, 2)
  );
  
  const wallWidthPx = mmToPixels(wallLengthMm, zoom);
  const wallHeightPx = mmToPixels(room.height, zoom);
  
  // Render cabinets in elevation view
  const renderElevationCabinets = () => {
    const wallCabinets = room.cabinets.filter(cabinet => cabinet.wallId === selectedWall);
    const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    
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

  // Render doors in elevation view
  const renderElevationDoors = () => {
    const wallDoors = room.doors.filter(door => door.wallId === selectedWall);
    const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    
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

  // Render windows in elevation view
  const renderElevationWindows = () => {
    const wallWindows = room.windows.filter(window => window.wallId === selectedWall);
    const wallAngle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
    
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

  return (
    <>
      <rect
        x={panOffset.x}
        y={panOffset.y}
        width={wallWidthPx}
        height={wallHeightPx}
        fill="#f8fafc"
        stroke="#475569"
        strokeWidth="2"
      />
      
      <text
        x={panOffset.x + wallWidthPx / 2}
        y={panOffset.y + 20}
        textAnchor="middle"
        fill="#475569"
        fontSize="14"
        fontWeight="bold"
      >
        Wall {wall.label} - Elevation View
      </text>
      
      <text
        x={panOffset.x + wallWidthPx / 2}
        y={panOffset.y + 40}
        textAnchor="middle"
        fill="#475569"
        fontSize="12"
      >
        {formatMm(wallLengthMm, wallLengthMm >= 1000)} × {formatMm(room.height, room.height >= 1000)}
      </text>
      
      <line
        x1={panOffset.x}
        y1={panOffset.y + wallHeightPx}
        x2={panOffset.x + wallWidthPx}
        y2={panOffset.y + wallHeightPx}
        stroke="#64748b"
        strokeWidth="2"
      />
      
      {renderElevationCabinets()}
      {renderElevationDoors()}
      {renderElevationWindows()}
      
      <g
        onClick={() => setElevationMode(false)}
        style={{ cursor: 'pointer' }}
        transform={`translate(${panOffset.x + wallWidthPx - 30}, ${panOffset.y + 30})`}
      >
        <circle cx="0" cy="0" r="15" fill="#ef4444" />
        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12">×</text>
      </g>
    </>
  );
};

export default ElevationView;
