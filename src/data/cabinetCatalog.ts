
// Cabinet Types
export type CabinetType = 'base' | 'wall' | 'tall' | 'loft' | 'appliance';

// Cabinet Finish
export type CabinetFinish = 'matte' | 'gloss';

// Cabinet Colors
export type CabinetColor = 
  'white' | 'black' | 'natural' | 'walnut' | 
  'cherry' | 'gray' | 'beige' | 'navy';

// Cabinet Shutter Type
export type ShutterType = 
  'plain' | 'glass' | 'aluminum' | 'louvered' | 
  'open' | 'drawer' | 'pullout';

// Cabinet Interface
export interface Cabinet {
  id: string;
  name: string;
  type: CabinetType;
  width: number;
  height: number;
  depth: number;
  shutterType: ShutterType;
  defaultFinish: CabinetFinish;
  defaultColor: CabinetColor;
  description: string;
  thumbnail: string; // path to image
}

// Cabinet Catalog
const cabinetCatalog: Record<CabinetType, Cabinet[]> = {
  base: [
    {
      id: 'base-001',
      name: 'Single Door Base',
      type: 'base',
      width: 400,
      height: 720,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Standard single door base cabinet',
      thumbnail: '/cabinets/base-single-door.svg',
    },
    {
      id: 'base-002',
      name: 'Double Door Base',
      type: 'base',
      width: 600,
      height: 720,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Standard double door base cabinet',
      thumbnail: '/cabinets/base-double-door.svg',
    },
    {
      id: 'base-003',
      name: 'Three Drawer Base',
      type: 'base',
      width: 500,
      height: 720,
      depth: 580,
      shutterType: 'drawer',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Three drawer base cabinet',
      thumbnail: '/cabinets/base-drawer.svg',
    },
    {
      id: 'base-004',
      name: 'Sink Base',
      type: 'base',
      width: 800,
      height: 720,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Base cabinet designed for sink installation',
      thumbnail: '/cabinets/base-sink.svg',
    },
    {
      id: 'base-005',
      name: 'Corner Base',
      type: 'base',
      width: 900,
      height: 720,
      depth: 900,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'L-shaped corner base cabinet',
      thumbnail: '/cabinets/base-corner.svg',
    }
  ],
  wall: [
    {
      id: 'wall-001',
      name: 'Single Door Wall',
      type: 'wall',
      width: 400,
      height: 600,
      depth: 300,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Standard single door wall cabinet',
      thumbnail: '/cabinets/wall-single-door.svg',
    },
    {
      id: 'wall-002',
      name: 'Double Door Wall',
      type: 'wall',
      width: 600,
      height: 600,
      depth: 300,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Standard double door wall cabinet',
      thumbnail: '/cabinets/wall-double-door.svg',
    },
    {
      id: 'wall-003',
      name: 'Glass Door Wall',
      type: 'wall',
      width: 500,
      height: 600,
      depth: 300,
      shutterType: 'glass',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Wall cabinet with glass doors',
      thumbnail: '/cabinets/wall-glass.svg',
    },
    {
      id: 'wall-004',
      name: 'Open Shelf Wall',
      type: 'wall',
      width: 600,
      height: 600,
      depth: 300,
      shutterType: 'open',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Open shelf wall cabinet',
      thumbnail: '/cabinets/wall-open.svg',
    },
    {
      id: 'wall-005',
      name: 'Corner Wall',
      type: 'wall',
      width: 600,
      height: 600,
      depth: 600,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Corner wall cabinet',
      thumbnail: '/cabinets/wall-corner.svg',
    }
  ],
  tall: [
    {
      id: 'tall-001',
      name: 'Pantry Cabinet',
      type: 'tall',
      width: 450,
      height: 2100,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Full height pantry cabinet',
      thumbnail: '/cabinets/tall-pantry.svg',
    },
    {
      id: 'tall-002',
      name: 'Broom Cabinet',
      type: 'tall',
      width: 600,
      height: 2100,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Full height cabinet for brooms and cleaning supplies',
      thumbnail: '/cabinets/tall-broom.svg',
    },
    {
      id: 'tall-003',
      name: 'Oven Housing',
      type: 'tall',
      width: 600,
      height: 2100,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Tall cabinet designed for oven and microwave',
      thumbnail: '/cabinets/tall-oven.svg',
    }
  ],
  loft: [
    {
      id: 'loft-001',
      name: 'Single Door Loft',
      type: 'loft',
      width: 450,
      height: 400,
      depth: 300,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Single door loft cabinet',
      thumbnail: '/cabinets/loft-single.svg',
    },
    {
      id: 'loft-002',
      name: 'Double Door Loft',
      type: 'loft',
      width: 750,
      height: 400,
      depth: 300,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Double door loft cabinet',
      thumbnail: '/cabinets/loft-double.svg',
    },
    {
      id: 'loft-003',
      name: 'Corner Loft',
      type: 'loft',
      width: 600,
      height: 400,
      depth: 600,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Corner loft cabinet',
      thumbnail: '/cabinets/loft-corner.svg',
    }
  ],
  appliance: [
    {
      id: 'app-001',
      name: 'Cooktop',
      type: 'appliance',
      width: 600,
      height: 50,
      depth: 510,
      shutterType: 'open',
      defaultFinish: 'matte',
      defaultColor: 'black',
      description: 'Standard 4-burner cooktop',
      thumbnail: '/cabinets/app-cooktop.svg',
    },
    {
      id: 'app-002',
      name: 'Chimney Hood',
      type: 'appliance',
      width: 600,
      height: 500,
      depth: 500,
      shutterType: 'open',
      defaultFinish: 'matte',
      defaultColor: 'black',
      description: 'Kitchen exhaust chimney',
      thumbnail: '/cabinets/app-chimney.svg',
    },
    {
      id: 'app-003',
      name: 'Dishwasher',
      type: 'appliance',
      width: 600,
      height: 720,
      depth: 580,
      shutterType: 'plain',
      defaultFinish: 'matte',
      defaultColor: 'white',
      description: 'Standard dishwasher',
      thumbnail: '/cabinets/app-dishwasher.svg',
    }
  ]
};

export default cabinetCatalog;
