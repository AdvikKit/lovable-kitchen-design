
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CabinetColor } from '../data/cabinetCatalog';
import { Cabinet } from '../context/DesignContext';
import { v4 as uuidv4 } from 'uuid';

const cabinetFormSchema = z.object({
  width: z.number().min(200).max(1200),
  height: z.number().min(200).max(2400),
  depth: z.number().min(100).max(800),
  color: z.string(),
});

type CabinetFormValues = z.infer<typeof cabinetFormSchema>;

interface CabinetCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cabinet: any; // Using any for the initial cabinet from catalog
  onAddCabinet: (cabinet: Cabinet) => void;
  wallId: string | null;
}

const cabinetColors: CabinetColor[] = ['white', 'black', 'natural', 'walnut', 'cherry', 'gray', 'beige', 'navy'];

const CabinetCustomizationModal: React.FC<CabinetCustomizationModalProps> = ({ 
  isOpen, 
  onClose, 
  cabinet,
  onAddCabinet,
  wallId
}) => {
  const form = useForm<CabinetFormValues>({
    resolver: zodResolver(cabinetFormSchema),
    defaultValues: {
      width: cabinet?.width || 600,
      height: cabinet?.height || 720,
      depth: cabinet?.depth || 580,
      color: cabinet?.defaultColor || 'white'
    },
  });

  const handleSubmit = (values: CabinetFormValues) => {
    const newCabinet: Cabinet = {
      id: uuidv4(),
      type: cabinet.type,
      name: cabinet.name,
      width: values.width,
      height: values.height,
      depth: values.depth,
      position: { x: 100, y: 100 },
      rotation: 0,
      wallId: wallId,
      color: values.color
    };
    
    onAddCabinet(newCabinet);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Cabinet</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Cabinet width in millimeters</FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Cabinet height in millimeters</FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="depth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depth (mm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Cabinet depth in millimeters</FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cabinetColors.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ 
                                backgroundColor: color === 'natural' ? '#E3C395' : 
                                                color === 'walnut' ? '#5C4033' : 
                                                color === 'cherry' ? '#6E2E1C' : color 
                              }} 
                            />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Cabinet color</FormDescription>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Cabinet</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CabinetCustomizationModal;
