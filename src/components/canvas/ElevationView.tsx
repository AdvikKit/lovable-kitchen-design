
import React from 'react';
import { Room, Wall, Point } from '@/context/DesignContext';
import { mmToPixels, formatMm } from '@/utils/measurements';
import ElevationCabinetsRenderer from './elevation/ElevationCabinetsRenderer';
import ElevationDoorsRenderer from './elevation/ElevationDoorsRenderer';
import ElevationWindowsRenderer from './elevation/ElevationWindowsRenderer';

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
      
      <ElevationCabinetsRenderer room={room} wall={wall} zoom={zoom} panOffset={panOffset} />
      <ElevationDoorsRenderer room={room} wall={wall} zoom={zoom} panOffset={panOffset} />
      <ElevationWindowsRenderer room={room} wall={wall} zoom={zoom} panOffset={panOffset} />
      
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
