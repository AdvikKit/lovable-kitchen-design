
import React from 'react';
import { ZoomIn, ZoomOut, Eye, RotateCcw, Magnet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { toast } from '@/components/ui/use-toast';

interface ToolBarProps {
  isSnappingEnabled: boolean;
  toggleSnapping: () => void;
  elevationMode: boolean;
  toggle3DView: () => void;
  room: any | null;
  resetView: () => void;
  zoom: number;
  handleZoomOut: () => void;
  handleZoomIn: () => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  isSnappingEnabled,
  toggleSnapping,
  elevationMode,
  toggle3DView,
  room,
  resetView,
  zoom,
  handleZoomOut,
  handleZoomIn
}) => {
  return (
    <div className="flex justify-between p-2 bg-slate-200 items-center">
      <div className="flex items-center">
        <Toggle
          pressed={isSnappingEnabled}
          onPressedChange={toggleSnapping}
          aria-label="Toggle snapping"
          className="mr-2"
        >
          <Magnet size={16} className="mr-1" />
          Snap
        </Toggle>
        
        <Button 
          variant={elevationMode ? "default" : "outline"} 
          size="sm" 
          onClick={toggle3DView}
          disabled={!room}
          className="mr-2"
        >
          <Eye size={16} className="mr-1" />
          3D View
        </Button>
      </div>
      <div className="flex items-center">
        <Button variant="outline" size="sm" onClick={resetView} className="mr-1">
          <RotateCcw size={16} />
          <span className="ml-1">Center</span>
        </Button>
        <span className="mx-2 text-sm">Zoom: {Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="sm" onClick={handleZoomOut} className="mr-1">
          <ZoomOut size={16} />
          <span className="ml-1">-</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn size={16} />
          <span className="ml-1">+</span>
        </Button>
      </div>
    </div>
  );
};

export default ToolBar;
