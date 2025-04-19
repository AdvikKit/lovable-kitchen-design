
import React from 'react';
import { Door, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';

interface DoorsRendererProps {
  doors: Door[];
  zoom: number;
  panOffset: Point;
  elevationMode: boolean;
}

const DoorsRenderer: React.FC<DoorsRendererProps> = ({
  doors,
  zoom,
  panOffset,
  elevationMode
}) => {
  if (!doors || doors.length === 0 || elevationMode) return null;

  return doors.map((door) => {
    const x = mmToPixels(door.position.x, zoom) + panOffset.x;
    const y = mmToPixels(door.position.y, zoom) + panOffset.y;
    const width = mmToPixels(door.width, zoom);
    const thickness = mmToPixels(100, zoom);
    
    return (
      <g 
        key={door.id} 
        transform={`translate(${x}, ${y}) rotate(${door.rotation}, ${width/2}, ${thickness/2})`}
      >
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={thickness} 
          fill="#cbd5e1"
          stroke="#475569"
          strokeWidth="2"
        />
        
        <path 
          d={`M ${width} ${thickness/2} A ${width} ${width} 0 0 ${door.isOpen ? 1 : 0} ${width} ${thickness/2 + width}`}
          fill="none"
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        
        <text 
          x={width / 2} 
          y={thickness / 2}
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

export default DoorsRenderer;
