
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDesignContext } from '../context/DesignContext';
import RoomCreationModal from './RoomCreationModal';
import CabinetCatalog from './CabinetCatalog';
import { Cabinet } from '../data/cabinetCatalog';
import { 
  Home, 
  DoorClosed, 
  AppWindow, 
  Eye,
  Save,
  Upload,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { room, setRoom } = useDesignContext();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  
  const handleCreateRoom = (newRoom: any) => {
    setRoom(newRoom);
  };
  
  const handleSelectCabinet = (cabinet: Cabinet) => {
    console.log('Selected cabinet:', cabinet);
    // We'll implement actual cabinet placement in a future update
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
