
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDesignContext } from '../context/DesignContext';
import RoomCreationModal from './RoomCreationModal';
import { 
  Layout, 
  Grid3x3,
  Ruler, 
  Home, 
  DoorClosed, 
  AppWindow, 
  SlidersHorizontal,
  Save,
  Upload,
  Eye,
  Box
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { room, setRoom, isGridVisible, toggleGrid, gridSize, setGridSize } = useDesignContext();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  const handleCreateRoom = (newRoom: any) => {
    setRoom(newRoom);
  };
  
  return (
    <div className="kitchen-sidebar w-64 h-full bg-slate-800 text-white overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">KitchenDesigner</h2>
        <Separator className="my-2 bg-gray-600" />
        
        <div className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold uppercase text-gray-400">Room</h3>
          <div className="space-y-2">
            <Button 
              onClick={() => setIsRoomModalOpen(true)} 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
            >
              <Home size={18} />
              <span>{room ? 'Edit Room' : 'Create Room'}</span>
            </Button>
          </div>
          
          <Separator className="my-2 bg-gray-600" />
          
          <h3 className="text-sm font-semibold uppercase text-gray-400">Elements</h3>
          <div className="space-y-2">
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
              disabled={!room}
            >
              <DoorClosed size={18} />
              <span>Add Door</span>
            </Button>
            
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
              disabled={!room}
            >
              <AppWindow size={18} />
              <span>Add Window</span>
            </Button>
            
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
              disabled={!room}
            >
              <Box size={18} />
              <span>Add Cabinet</span>
            </Button>
          </div>
          
          <Separator className="my-2 bg-gray-600" />
          
          <h3 className="text-sm font-semibold uppercase text-gray-400">View</h3>
          <div className="space-y-2">
            <Button 
              onClick={toggleGrid}
              className="w-full flex items-center justify-start gap-2"
              variant={isGridVisible ? "default" : "outline"}
            >
              <Grid3x3 size={18} />
              <span>{isGridVisible ? "Hide Grid" : "Show Grid"}</span>
            </Button>
            
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-gray-400">Grid Size</span>
              <select 
                value={gridSize} 
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="bg-slate-700 rounded px-2 py-1 text-sm w-full"
              >
                <option value={50}>50mm</option>
                <option value={100}>100mm</option>
                <option value={250}>250mm</option>
                <option value={500}>500mm</option>
              </select>
            </div>
            
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
              disabled={!room}
            >
              <Eye size={18} />
              <span>3D View</span>
            </Button>
          </div>
          
          <Separator className="my-2 bg-gray-600" />
          
          <h3 className="text-sm font-semibold uppercase text-gray-400">Project</h3>
          <div className="space-y-2">
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
              disabled={!room}
            >
              <Save size={18} />
              <span>Save Design</span>
            </Button>
            
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
            >
              <Upload size={18} />
              <span>Load Design</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Room Creation Modal */}
      <RoomCreationModal 
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onCreateRoom={handleCreateRoom}
        initialRoom={room}
      />
    </div>
  );
};

export default Sidebar;
