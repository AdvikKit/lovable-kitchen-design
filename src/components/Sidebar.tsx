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
  Maximize2, 
  Move, 
  Plus, 
  Settings, 
  Door,
  Window,
  Eye, 
  LayoutGrid
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isCabinetCatalogOpen, setIsCabinetCatalogOpen] = useState(false);
  const [isCabinetCustomizationOpen, setIsCabinetCustomizationOpen] = useState(false);
  const [isCabinetCatalogCollapsed, setIsCabinetCatalogCollapsed] = useState(false);
  const { selectedCabinet, customizingCabinet } = useDesignContext();
  
  const toggleCabinetCatalog = () => {
    setIsCabinetCatalogCollapsed(!isCabinetCatalogCollapsed);
  };
  
  return (
    <div className="w-64 flex-shrink-0 border-r bg-secondary/50 flex flex-col">
      <div className="p-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => setIsRoomModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
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
                  <CabinetCatalog />
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
                <Door className="h-4 w-4" />
              </Button>
              <div className="flex gap-2 px-2 pb-2">
                <Button size="sm" variant="outline">Single Door</Button>
                <Button size="sm" variant="outline">Double Door</Button>
                <Button size="sm" variant="outline">Sliding Door</Button>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Button 
                variant="ghost" 
                className="flex w-full items-center justify-between p-2 text-sm font-medium aria-expanded:rotate-180"
                aria-expanded={!isCabinetCatalogCollapsed}
              >
                <span>Windows</span>
                <Window className="h-4 w-4" />
              </Button>
              <div className="flex gap-2 px-2 pb-2">
                <Button size="sm" variant="outline">Standard</Button>
                <Button size="sm" variant="outline">Large</Button>
                <Button size="sm" variant="outline">Bay Window</Button>
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
      
      <RoomCreationModal open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen} />
      {selectedCabinet && <CabinetCustomizationModal open={customizingCabinet} onOpenChange={() => {}} />}
    </div>
  );
};

export default Sidebar;
