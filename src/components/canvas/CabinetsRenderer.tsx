
import React from 'react';
import { Move, Trash2 } from 'lucide-react';
import { Cabinet, Point } from '@/context/DesignContext';
import { mmToPixels } from '@/utils/measurements';

interface CabinetsRendererProps {
  cabinets: Cabinet[];
  selectedCabinet: Cabinet | null;
  zoom: number;
  panOffset: Point;
  elevationMode: boolean;
  isMovingCabinet: boolean;
  handleCabinetClick: (e: React.MouseEvent, cabinetId: string) => void;
  toggleCabinetMovement: () => void;
  deleteCabinet: () => void;
}

const CabinetsRenderer: React.FC<CabinetsRendererProps> = ({
  cabinets,
  selectedCabinet,
  zoom,
  panOffset,
  elevationMode,
  isMovingCabinet,
  handleCabinetClick,
  toggleCabinetMovement,
  deleteCabinet
}) => {
  if (!cabinets || cabinets.length === 0 || elevationMode) return null;

  return cabinets.map((cabinet) => {
    const x = mmToPixels(cabinet.position.x, zoom) + panOffset.x;
    const y = mmToPixels(cabinet.position.y, zoom) + panOffset.y;
    const width = mmToPixels(cabinet.width, zoom);
    const height = mmToPixels(cabinet.depth, zoom);
    const isSelected = selectedCabinet?.id === cabinet.id;
    
    let fillColor = cabinet.color;
    if (fillColor === 'natural') fillColor = '#E3C395';
    else if (fillColor === 'walnut') fillColor = '#5C4033';
    else if (fillColor === 'cherry') fillColor = '#6E2E1C';
    
    return (
      <g 
        key={cabinet.id} 
        transform={`translate(${x}, ${y}) rotate(${cabinet.rotation}, ${width/2}, ${height/2})`}
        onClick={(e) => handleCabinetClick(e, cabinet.id)}
        style={{ cursor: isMovingCabinet && isSelected ? 'move' : 'pointer' }}
      >
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill={fillColor}
          stroke={isSelected ? "#3b82f6" : "#475569"}
          strokeWidth={isSelected ? "2" : "1"}
          opacity="0.8"
        />
        
        {cabinet.type === 'base' && (
          <rect 
            x={width * 0.1} 
            y={height * 0.1} 
            width={width * 0.8} 
            height={height * 0.8} 
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        )}
        
        <text 
          x={width / 2} 
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={cabinet.color === 'black' ? "white" : "black"}
          fontSize={Math.max(8, 12 * zoom)}
          fontWeight="bold"
        >
          {cabinet.name}
        </text>
        
        <text 
          x={width / 2} 
          y={(height / 2) + 15 * zoom}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={cabinet.color === 'black' ? "white" : "black"}
          fontSize={Math.max(6, 10 * zoom)}
        >
          {cabinet.width}×{cabinet.height}mm
        </text>
        
        {isSelected && (
          <g className="cabinet-controls">
            <g 
              transform={`translate(${width - 20}, ${-20})`}
              onClick={(e) => {
                e.stopPropagation();
                toggleCabinetMovement();
              }}
            >
              <circle cx="0" cy="0" r="15" fill={isMovingCabinet ? "#3b82f6" : "#94a3b8"} />
              <foreignObject x="-8" y="-8" width="16" height="16">
                <Move size={16} color="white" />
              </foreignObject>
            </g>
            
            <g 
              transform={`translate(${width - 20}, ${20})`}
              onClick={(e) => {
                e.stopPropagation();
                deleteCabinet();
              }}
            >
              <circle cx="0" cy="0" r="15" fill="#ef4444" />
              <foreignObject x="-8" y="-8" width="16" height="16">
                <Trash2 size={16} color="white" />
              </foreignObject>
            </g>
          </g>
        )}
      </g>
    );
  });
};

export default CabinetsRenderer;
