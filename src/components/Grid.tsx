
import React from 'react';
import { useDesignContext } from '../context/DesignContext';
import { mmToPixels } from '../utils/measurements';

const Grid: React.FC = () => {
  const { isGridVisible, gridSize, zoom, room, panOffset } = useDesignContext();
  
  if (!isGridVisible) {
    return null;
  }
  
  const gridSizePixels = mmToPixels(gridSize, zoom);
  const width = room ? mmToPixels(room.width, zoom) : 5000;
  const height = room ? mmToPixels(room.length, zoom) : 5000;
  
  // Create horizontal and vertical grid lines
  const horizontalLines = [];
  const verticalLines = [];
  
  // Add extra space around the room
  const padding = gridSizePixels * 5;
  
  // Calculate grid boundaries
  const startX = -padding;
  const endX = width + padding;
  const startY = -padding;
  const endY = height + padding;
  
  // Create horizontal lines
  for (let y = startY; y <= endY; y += gridSizePixels) {
    horizontalLines.push(
      <line 
        key={`h-${y}`}
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        transform={`translate(${panOffset.x}px, ${panOffset.y}px)`}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray={gridSize >= 250 ? "" : "2,2"}
      />
    );
  }
  
  // Create vertical lines
  for (let x = startX; x <= endX; x += gridSizePixels) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={startY}
        x2={x}
        y2={endY}
        transform={`translate(${panOffset.x}px, ${panOffset.y}px)`}
        stroke="#e2e8f0"
        strokeWidth="1"
        strokeDasharray={gridSize >= 250 ? "" : "2,2"}
      />
    );
  }
  
  return (
    <g className="kitchen-grid">
      {horizontalLines}
      {verticalLines}
    </g>
  );
};

export default Grid;
