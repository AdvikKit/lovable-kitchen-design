
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoomCreationModal from './RoomCreationModal';
import CabinetCatalog from './CabinetCatalog';
import { useDesignContext } from '../context/DesignContext';
import CabinetCustomizationModal from './CabinetCustomizationModal';
import { 
  ChevronDown, 
  ChevronUp, 
  DoorClosed, 
  Wind,
  Eye, 
  LayoutGrid,
  Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isCabinetCatalogOpen, setIsCabinetCatalogOpen] = useState(false);
  const [isCabinetCatalogCollapsed, setIsCabinetCatalogCollapsed] = useState(false);
  const { 
    selectedCabinet, 
    customizingCabinet, 
    setCustomizingCabinet, 
    setDraggingItem,
    room, 
    selectedWall,
    setRoom
  } = useDesignContext();
  
  const toggleCabinetCatalog = () => {
    setIsCabinetCatalogCollapsed(!isCabinetCatalogCollapsed);
  };

  const handleCabinetSelect = (cabinet) => {
    setDraggingItem({ type: 'cabinet', item: cabinet });
  };

  const handleDoorDrag = (doorType) => {
    const door = {
      width: doorType === 'Single Door' ? 800 : 1200,
      height: 2100,
      position: { x: 0, y: 0 },
      isOpen: false
    };
    setDraggingItem({ type: 'door', item: door });
  };

  const handleWindowDrag = (windowType) => {
    const window = {
      width: windowType === 'Standard' ? 1000 : (windowType === 'Large' ? 1500 : 2000), 
      height: 1200,
      position: { x: 0, y: 1000 }  // Default position at 1m from floor
    };
    setDraggingItem({ type: 'window', item: window });
  };
  
  const handleAddCabinet = (cabinet) => {
    if (room) {
      const updatedRoom = {
        ...room,
        cabinets: [...room.cabinets, cabinet]
      };
      // Update the room with the new cabinet
      setRoom(updatedRoom);
    }
    setCustomizingCabinet(false);
  };
  
  return (
    <div className="w-64 flex-shrink-0 border-r bg-secondary/50 flex flex-col">
      <div className="p-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => setIsRoomModalOpen(true)}>
          <span className="mr-2 h-4 w-4 flex items-center justify-center">+</span>
          Create Room
        </Button>
      </div>
      
      <ScrollArea className="flex-1 space-y-4 p-4">
        <Tabs defaultValue="catalog" className="w-full space-y-4">
          <TabsList>
            <TabsTrigger value="catalog" className="data-[state=active]:bg-muted data-[state=active]:text-muted-foreground">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-muted data-[state=active]:text-muted-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="catalog" className="space-y-4">
            <div className="rounded-md border">
              <Button 
                variant="ghost" 
                className="flex w-full items-center justify-between p-2 text-sm font-medium aria-expanded:rotate-180"
                aria-expanded={!isCabinetCatalogCollapsed}
                onClick={toggleCabinetCatalog}
              >
                <span>Cabinets</span>
                {isCabinetCatalogCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              {!isCabinetCatalogCollapsed && (
                <div className="border-t p-2">
                  <CabinetCatalog onSelectCabinet={handleCabinetSelect} />
                </div>
              )}
            </div>
            
            <div className="rounded-md border">
              <Button 
                variant="ghost" 
                className="flex w-full items-center justify-between p-2 text-sm font-medium aria-expanded:rotate-180"
                aria-expanded={!isCabinetCatalogCollapsed}
              >
                <span>Doors</span>
                <DoorClosed className="h-4 w-4" />
              </Button>
              <div className="flex gap-2 px-2 pb-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onMouseDown={() => handleDoorDrag('Single Door')}
                  draggable
                  onDragStart={() => handleDoorDrag('Single Door')}
                >Single Door</Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onMouseDown={() => handleDoorDrag('Double Door')}
                  draggable
                  onDragStart={() => handleDoorDrag('Double Door')}
                >Double Door</Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Button 
                variant="ghost" 
                className="flex w-full items-center justify-between p-2 text-sm font-medium aria-expanded:rotate-180"
                aria-expanded={!isCabinetCatalogCollapsed}
              >
                <span>Windows</span>
                <Wind className="h-4 w-4" />
              </Button>
              <div className="flex gap-2 px-2 pb-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onMouseDown={() => handleWindowDrag('Standard')}
                  draggable
                  onDragStart={() => handleWindowDrag('Standard')}
                >Standard</Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onMouseDown={() => handleWindowDrag('Large')}
                  draggable
                  onDragStart={() => handleWindowDrag('Large')}
                >Large</Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onMouseDown={() => handleWindowDrag('Bay Window')}
                  draggable
                  onDragStart={() => handleWindowDrag('Bay Window')}
                >Bay Window</Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div>
              Settings content
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
      
      <RoomCreationModal isOpen={isRoomModalOpen} onOpenChange={setIsRoomModalOpen} />
      
      {selectedCabinet && customizingCabinet && (
        <CabinetCustomizationModal
          isOpen={customizingCabinet}
          onClose={() => setCustomizingCabinet(false)}
          cabinet={selectedCabinet}
          onAddCabinet={handleAddCabinet}
          wallId={selectedWall}
        />
      )}
    </div>
  );
};

export default Sidebar;
