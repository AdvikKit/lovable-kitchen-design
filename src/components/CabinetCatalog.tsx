
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Move, Edit, Box } from 'lucide-react';
import cabinetCatalog, { CabinetType, Cabinet as CatalogCabinet } from '../data/cabinetCatalog';
import { ScrollArea } from '@/components/ui/scroll-area';
import CabinetCustomizationModal from './CabinetCustomizationModal';
import { useDesignContext, Cabinet } from '../context/DesignContext';
import { toast } from '@/components/ui/use-toast';

interface CabinetCatalogProps {
  onSelectCabinet: (cabinet: CatalogCabinet) => void;
}

const CabinetCatalog: React.FC<CabinetCatalogProps> = ({ onSelectCabinet }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CabinetType>('base');
  const [selectedCatalogCabinet, setSelectedCatalogCabinet] = useState<CatalogCabinet | null>(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState<boolean>(false);
  
  const { 
    room, 
    setRoom, 
    selectedWall,
    setSelectedCabinet,
    setCustomizingCabinet
  } = useDesignContext();
  
  const filteredCabinets = cabinetCatalog[activeTab].filter(cabinet => 
    cabinet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cabinet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleCabinetSelect = (cabinet: CatalogCabinet) => {
    setSelectedCatalogCabinet(cabinet);
    setIsCustomizationModalOpen(true);
    onSelectCabinet(cabinet);
  };
  
  const handleAddCustomCabinet = (newCabinet: Cabinet) => {
    if (!room) return;
    
    const updatedRoom = {
      ...room,
      cabinets: [...(room.cabinets || []), newCabinet]
    };
    
    setRoom(updatedRoom);
    setSelectedCabinet(newCabinet);
    setCustomizingCabinet(false);
    
    toast({
      title: "Cabinet Added",
      description: `${newCabinet.name} has been added to your design.`
    });
  };
  
  return (
    <div className="cabinet-catalog w-full">
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search cabinets..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="base" value={activeTab} onValueChange={(value) => setActiveTab(value as CabinetType)}>
        <TabsList className="w-full">
          <TabsTrigger value="base" className="flex-1">Base</TabsTrigger>
          <TabsTrigger value="wall" className="flex-1">Wall</TabsTrigger>
          <TabsTrigger value="tall" className="flex-1">Tall</TabsTrigger>
          <TabsTrigger value="loft" className="flex-1">Loft</TabsTrigger>
          <TabsTrigger value="appliance" className="flex-1">Appliance</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[320px] mt-2">
          <div className="grid grid-cols-2 gap-2 p-1">
            {filteredCabinets.map((cabinet) => (
              <div 
                key={cabinet.id}
                className="bg-slate-700 p-2 rounded cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => handleCabinetSelect(cabinet)}
              >
                <div className="bg-slate-800 h-24 flex items-center justify-center mb-2 rounded">
                  <div className="w-16 h-16 bg-slate-700 rounded flex items-center justify-center text-sm">
                    <Box className="w-10 h-10 text-white opacity-70" />
                  </div>
                </div>
                <div className="text-xs font-medium truncate">{cabinet.name}</div>
                <div className="text-[10px] text-gray-400">{cabinet.width}W x {cabinet.height}H x {cabinet.depth}D mm</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[10px] bg-blue-800 px-1.5 py-0.5 rounded text-blue-100">
                    {cabinet.type}
                  </div>
                  <div className="flex gap-1">
                    <Edit className="w-3 h-3 text-gray-400" />
                    <Move className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCabinets.length === 0 && (
              <div className="col-span-2 text-center py-10 text-gray-400">
                No cabinets found matching your search
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
      
      {selectedCatalogCabinet && (
        <CabinetCustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          cabinet={selectedCatalogCabinet}
          onAddCabinet={handleAddCustomCabinet}
          wallId={selectedWall}
        />
      )}
    </div>
  );
};

export default CabinetCatalog;
