
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
          className="text-xs h-8 text-white"
        >
          <Save size={16} className="mr-1" />
          <span>Save</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={!room}
          className="text-xs h-8 text-white"
        >
          <FileDown size={16} className="mr-1" />
          <span>Export</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-xs h-8"
        >
          <Settings size={16} />
          <span className="ml-1">Settings</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
