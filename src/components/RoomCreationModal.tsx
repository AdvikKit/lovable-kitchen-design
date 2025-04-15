
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createDefaultRoom } from '../utils/measurements';

interface RoomCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: any) => void;
  initialRoom?: any;
}

const RoomCreationModal: React.FC<RoomCreationModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateRoom,
  initialRoom 
}) => {
  const [width, setWidth] = useState(initialRoom?.width || 3000); // Default 3000mm (3m)
  const [length, setLength] = useState(initialRoom?.length || 4000); // Default 4000mm (4m)
  const [height, setHeight] = useState(initialRoom?.height || 2700); // Default 2700mm (2.7m)
  
  const handleCreateRoom = () => {
    const room = createDefaultRoom(
      parseInt(width.toString()), 
      parseInt(length.toString()), 
      parseInt(height.toString())
    );
    onCreateRoom(room);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] animate-fadeIn">
        <DialogHeader>
          <DialogTitle>{initialRoom ? 'Edit Room' : 'Create Room'}</DialogTitle>
          <DialogDescription>
            Enter the dimensions of your kitchen in millimeters.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              Width (mm)
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              min={1000}
              max={10000}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="length" className="text-right">
              Length (mm)
            </Label>
            <Input
              id="length"
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              min={1000}
              max={10000}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              Height (mm)
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              min={2000}
              max={4000}
              className="col-span-3"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateRoom}>
            {initialRoom ? 'Update Room' : 'Create Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomCreationModal;
