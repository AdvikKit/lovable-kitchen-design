
import React from 'react';
import { useDesignContext } from '../context/DesignContext';
import { mmToPixels } from '../utils/measurements';

const Ruler: React.FC = () => {
  const { room, zoom, gridSize, panOffset } = useDesignContext();
  
  if (!room) return null;
  
  const width = mmToPixels(room.width, zoom);
  const height = mmToPixels(room.length, zoom);
  const rulerSize = 30; // pixels
  const rulerInterval = mmToPixels(gridSize * 5, zoom); // Show major ticks every 5 grid units
  
  // Extra space for rulers
  const padding = mmToPixels(gridSize * 5, zoom);
  
  // Calculate ruler boundaries
  const startX = -padding;
  const endX = width + padding;
  const startY = -padding;
  const endY = height + padding;
  
  // Create horizontal ruler marks
  const horizontalMarks = [];
  for (let x = startX; x <= endX; x += rulerInterval) {
    const tickHeight = 10; // pixels
    horizontalMarks.push(
      <g key={`hm-${x}`} transform={`translate(${x + panOffset.x}, 0)`}>
        <line x1={0} y1={0} x2={0} y2={tickHeight} className="kitchen-ruler" />
        <text 
          x={0} 
          y={tickHeight + 10} 
          className="kitchen-ruler-text"
        >
          {Math.round(x / mmToPixels(1, zoom))}
        </text>
      </g>
    );
  }
  
  // Create vertical ruler marks
  const verticalMarks = [];
  for (let y = startY; y <= endY; y += rulerInterval) {
    const tickWidth = 10; // pixels
    verticalMarks.push(
      <g key={`vm-${y}`} transform={`translate(0, ${y + panOffset.y})`}>
        <line x1={0} y1={0} x2={tickWidth} y2={0} className="kitchen-ruler" />
        <text 
          x={tickWidth + 10} 
          y={0} 
          className="kitchen-ruler-text"
          dominantBaseline="middle"
        >
          {Math.round(y / mmToPixels(1, zoom))}
        </text>
      </g>
    );
  }
  
  return (
    <>
      {/* Horizontal ruler */}
      <g className="kitchen-ruler" transform={`translate(${rulerSize}, 0)`}>
        <rect x={0} y={0} width="100%" height={rulerSize} fill="white" stroke="gray" strokeWidth={1} />
        {horizontalMarks}
      </g>
      
      {/* Vertical ruler */}
      <g className="kitchen-ruler" transform={`translate(0, ${rulerSize})`}>
        <rect x={0} y={0} width={rulerSize} height="100%" fill="white" stroke="gray" strokeWidth={1} />
        {verticalMarks}
      </g>
      
      {/* Corner square */}
      <rect x={0} y={0} width={rulerSize} height={rulerSize} fill="white" stroke="gray" strokeWidth={1} />
    </>
  );
};

export default Ruler;
