
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, FileDown, Settings } from 'lucide-react';
import { useDesignContext } from '../context/DesignContext';

const Header: React.FC = () => {
  const { room } = useDesignContext();
  
  return (
    <header className="bg-slate-800 text-white h-12 flex items-center justify-between px-4">
      <div className="text-md font-semibold">
        {room ? `Kitchen Design - ${room.width}mm x ${room.length}mm` : 'New Design'}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          disabled={!room}
          className="text-xs h-8 text-white hover:bg-slate-700"
        >
          <Save size={16} className="mr-1" />
          Save
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={!room}
          className="text-xs h-8 text-white hover:bg-slate-700"
        >
          <FileDown size={16} className="mr-1" />
          Export
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs h-8 text-white hover:bg-slate-700"
        >
          <Settings size={16} className="mr-1" />
          Settings
        </Button>
      </div>
    </header>
  );
};

export default Header;
