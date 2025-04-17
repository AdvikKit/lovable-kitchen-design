
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  label: string;
  start: Point;
  end: Point;
  thickness: number;
}

export interface Cabinet {
  id: string;
  type: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  position: Point;
  rotation: number;
  wallId: string | null;
  color: string;
}

export interface Room {
  width: number;
  length: number;
  height: number;
  walls: Wall[];
  cabinets: Cabinet[];
}

interface DesignContextProps {
  room: Room | null;
  setRoom: (room: Room | null) => void;
  selectedWall: string | null;
  setSelectedWall: (wallId: string | null) => void;
  isGridVisible: boolean;
  gridSize: number;
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: Point;
  setPanOffset: (offset: Point) => void;
  elevationMode: boolean;
  setElevationMode: (mode: boolean) => void;
  selectedCabinet: Cabinet | null;
  setSelectedCabinet: (cabinet: Cabinet | null) => void;
  customizingCabinet: boolean;
  setCustomizingCabinet: (customizing: boolean) => void;
  isSnappingEnabled: boolean;
  setSnappingEnabled: (enabled: boolean) => void;
  snapThreshold: number;
}

const DesignContext = createContext<DesignContextProps | undefined>(undefined);

export const useDesignContext = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignContext must be used within a DesignProvider');
  }
  return context;
};

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedWall, setSelectedWall] = useState<string | null>(null);
  const [isGridVisible, setIsGridVisible] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(100); // 100mm grid
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [elevationMode, setElevationMode] = useState<boolean>(false);
  const [selectedCabinet, setSelectedCabinet] = useState<Cabinet | null>(null);
  const [customizingCabinet, setCustomizingCabinet] = useState<boolean>(false);
  const [isSnappingEnabled, setSnappingEnabled] = useState<boolean>(true);
  const [snapThreshold, setSnapThreshold] = useState<number>(20); // 20mm snap threshold

  const value = {
    room,
    setRoom,
    selectedWall,
    setSelectedWall,
    isGridVisible,
    gridSize,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    elevationMode,
    setElevationMode,
    selectedCabinet,
    setSelectedCabinet,
    customizingCabinet,
    setCustomizingCabinet,
    isSnappingEnabled,
    setSnappingEnabled,
    snapThreshold,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
};
