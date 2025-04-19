
import React from 'react';
import { Window, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';

interface WindowsRendererProps {
  windows: Window[];
  zoom: number;
  panOffset: Point;
  elevationMode: boolean;
}

const WindowsRenderer: React.FC<WindowsRendererProps> = ({
  windows,
  zoom,
  panOffset,
  elevationMode
}) => {
  if (!windows || windows.length === 0 || elevationMode) return null;

  return windows.map((window) => {
    const x = mmToPixels(window.position.x, zoom) + panOffset.x;
    const y = mmToPixels(window.position.y, zoom) + panOffset.y;
    const width = mmToPixels(window.width, zoom);
    const thickness = mmToPixels(100, zoom);
    
    return (
      <g key={window.id} transform={`translate(${x}, ${y})`}>
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={thickness} 
          fill="#bfdbfe"
          stroke="#475569"
          strokeWidth="2"
        />
        
        <line 
          x1={width/2} 
          y1="0" 
          x2={width/2} 
          y2={thickness} 
          stroke="#475569" 
          strokeWidth="1" 
        />
        
        <line 
          x1="0" 
          y1={thickness/2} 
          x2={width} 
          y2={thickness/2} 
          stroke="#475569" 
          strokeWidth="1" 
        />
        
        <text 
          x={width / 2} 
          y={thickness / 2}
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

export default WindowsRenderer;
