
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

// Default door and window dimensions
const DEFAULT_DOOR = {
  width: 900,
  height: 2100,
  position: { x: 0, y: 0 },
  rotation: 0,
  isOpen: false
};

const DEFAULT_WINDOW = {
  width: 1200,
  height: 1000,
  position: { x: 0, y: 1000 } // Positioned 1m from the floor
};

const Sidebar: React.FC = () => {
  const { 
    room, 
    setRoom,
    elevationMode,
    setElevationMode,
    isSnappingEnabled,
    setSnappingEnabled,
    setDraggingItem
  } = useDesignContext();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  const handleCreateRoom = (newRoom: any) => {
    // Initialize room with empty cabinets, doors, and windows arrays
    setRoom({
      ...newRoom,
      cabinets: newRoom.cabinets || [],
      doors: newRoom.doors || [],
      windows: newRoom.windows || []
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
  
  const startDragDoor = () => {
    if (!room) {
      toast({
        title: "Create Room First",
        description: "You need to create a room before adding doors.",
        variant: "destructive"
      });
      return;
    }
    
    setDraggingItem({
      type: 'door',
      item: DEFAULT_DOOR
    });
    
    toast({
      title: "Adding Door",
      description: "Drag and drop the door onto a wall."
    });
  };
  
  const startDragWindow = () => {
    if (!room) {
      toast({
        title: "Create Room First",
        description: "You need to create a room before adding windows.",
        variant: "destructive"
      });
      return;
    }
    
    setDraggingItem({
      type: 'window',
      item: DEFAULT_WINDOW
    });
    
    toast({
      title: "Adding Window",
      description: "Drag and drop the window onto a wall."
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
              onMouseDown={startDragDoor}
            >
              <DoorClosed size={18} />
              <span>Add Door</span>
            </Button>
            
            <Button 
              className="w-full flex items-center justify-start text-white gap-2"
              variant="outline"
              disabled={!room}
              onMouseDown={startDragWindow}
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
