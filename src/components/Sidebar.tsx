
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDesignContext } from '../context/DesignContext';
import RoomCreationModal from './RoomCreationModal';
import CabinetCatalog from './CabinetCatalog';
import { Cabinet } from '../data/cabinetCatalog';
import { toast } from '@/components/ui/use-toast';
import { 
  Home, 
  DoorClosed, 
  AppWindow, 
  Eye,
  Save,
  Upload,
  Magnet,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { 
    room, 
    setRoom,
    elevationMode,
    setElevationMode,
    isSnappingEnabled,
    setSnappingEnabled
  } = useDesignContext();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  const handleCreateRoom = (newRoom: any) => {
    // Initialize room with empty cabinets array if not present
    setRoom({
      ...newRoom,
      cabinets: newRoom.cabinets || []
    });
    
    toast({
      title: "Room Created",
      description: "Your room has been created. Now you can add cabinets and other elements."
    });
  };
  
  const handleSelectCabinet = (cabinet: Cabinet) => {
    console.log('Selected cabinet:', cabinet);
    // Cabinet selection is now handled in CabinetCatalog
  };
  
  const handle3DView = () => {
    setElevationMode(!elevationMode);
  };
  
  const toggleSnapping = () => {
    setSnappingEnabled(!isSnappingEnabled);
    toast({
      title: isSnappingEnabled ? "Snapping Disabled" : "Snapping Enabled",
      description: isSnappingEnabled ?
        "Elements will move freely." :
        "Elements will snap to walls and other elements."
    });
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
              variant={isSnappingEnabled ? "default" : "outline"}
              onClick={toggleSnapping}
              disabled={!room}
            >
              <Magnet size={18} />
              <span>Snap to Walls</span>
            </Button>
          </div>
          
          <Separator className="my-2 bg-gray-600" />
          
          <h3 className="text-sm font-semibold uppercase text-gray-400">Cabinets</h3>
          {room ? (
            <CabinetCatalog onSelectCabinet={handleSelectCabinet} />
          ) : (
            <div className="text-sm text-gray-400 p-2">
              Create a room to add cabinets
            </div>
          )}
          
          <Separator className="my-2 bg-gray-600" />
          
          <h3 className="text-sm font-semibold uppercase text-gray-400">View</h3>
          <div className="space-y-2">
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant={elevationMode ? "default" : "outline"}
              onClick={handle3DView}
              disabled={!room}
            >
              <Eye size={18} />
              <span>Elevation View</span>
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
