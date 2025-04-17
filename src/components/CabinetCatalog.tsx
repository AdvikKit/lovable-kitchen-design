
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import cabinetCatalog, { CabinetType, Cabinet } from '../data/cabinetCatalog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CabinetCatalogProps {
  onSelectCabinet: (cabinet: Cabinet) => void;
}

const CabinetCatalog: React.FC<CabinetCatalogProps> = ({ onSelectCabinet }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<CabinetType>('base');
  
  const filteredCabinets = cabinetCatalog[activeTab].filter(cabinet => 
    cabinet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cabinet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
                onClick={() => onSelectCabinet(cabinet)}
              >
                <div className="bg-slate-800 h-24 flex items-center justify-center mb-2 rounded">
                  {/* Would show cabinet thumbnail here. Using placeholder for now */}
                  <div className="w-16 h-16 bg-slate-700 rounded flex items-center justify-center text-sm">
                    {cabinet.type[0].toUpperCase()}
                  </div>
                </div>
                <div className="text-xs font-medium truncate">{cabinet.name}</div>
                <div className="text-[10px] text-gray-400">{cabinet.width}W x {cabinet.height}H x {cabinet.depth}D mm</div>
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
    </div>
  );
};

export default CabinetCatalog;
