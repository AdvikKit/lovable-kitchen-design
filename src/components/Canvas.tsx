import React, { useState, useRef, useEffect } from 'react';
import { useDesignContext } from '../context/DesignContext';
import Grid from './Grid';
import Ruler from './Ruler';
import { toast } from '@/components/ui/use-toast';
import { mmToPixels, formatMm, pixelsToMm, screenToRoomCoordinates } from '../utils/measurements';
import { findNearestWall, calculateWallSnapPosition } from '../utils/snapping/wall-snapping';
import { findNearestCabinet, calculateCabinetSnapPosition } from '../utils/snapping/cabinet-snapping';
import { calculateWallItemRotation, calculateWallItemPlacement } from '../utils/snapping/wall-items-snapping';
import { isPointInRoom } from '../utils/snapping/validation';
import { v4 as uuidv4 } from 'uuid';
import { ZoomIn, ZoomOut, Eye, RotateCcw, Move, Trash2, Magnet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

// Import our new components
import ToolBar from './canvas/ToolBar';
import WallsRenderer from './canvas/WallsRenderer';
import CabinetsRenderer from './canvas/CabinetsRenderer';
import DoorsRenderer from './canvas/DoorsRenderer';
import WindowsRenderer from './canvas/WindowsRenderer';
import ElevationView from './canvas/ElevationView';

const Canvas: React.FC = () => {
  const { 
    room, 
    selectedWall, 
    setSelectedWall, 
    zoom, 
    setZoom, 
    panOffset, 
    setPanOffset,
    elevationMode,
    setElevationMode,
    selectedCabinet,
    setSelectedCabinet,
    setRoom,
    isSnappingEnabled,
    setSnappingEnabled,
    snapThreshold,
    snapToCabinets,
    draggingItem,
    setDraggingItem
  } = useDesignContext();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMovingCabinet, setIsMovingCabinet] = useState(false);
  const [cabinetStartPos, setCabinetStartPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [initialDropPosition, setInitialDropPosition] = useState<{ x: number, y: number } | null>(null);
  
  // Event handlers and utility functions
  const resetView = () => {
    if (room && canvasRef.current) {
      const canvas = canvasRef.current;
      const canvasWidth = canvas.clientWidth;
      const canvasHeight = canvas.clientHeight;
      
      // Calculate zoom to fit room with some padding
      const roomWidthPx = mmToPixels(room.width, 1);
      const roomLengthPx = mmToPixels(room.length, 1);
      
      // Calculate zoom to fit based on shorter dimension with padding
      const zoomX = (canvasWidth - 100) / roomWidthPx;
      const zoomY = (canvasHeight - 100) / roomLengthPx;
      const newZoom = Math.min(Math.min(zoomX, zoomY), 1);
      
      // Center the room
      const centerX = (canvasWidth / 2) - (mmToPixels(room.width, newZoom) / 2);
      const centerY = (canvasHeight / 2) - (mmToPixels(room.length, newZoom) / 2);
      
      setZoom(newZoom);
      setPanOffset({ x: centerX, y: centerY });
      
      toast({
        title: "View Reset",
        description: "The room has been centered in the viewport.",
      });
    }
  };
  
  useEffect(() => {
    if (room) {
      resetView();
    }
  }, [room]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with ctrl/cmd key
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
      
      // Zoom centered on mouse position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const newPanOffsetX = mouseX - ((mouseX - panOffset.x) * (newZoom / zoom));
        const newPanOffsetY = mouseY - ((mouseY - panOffset.y) * (newZoom / zoom));
        
        setZoom(newZoom);
        setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
      }
    } else {
      // Pan with mouse wheel
      setPanOffset({
        x: panOffset.x - (e.deltaX * 0.5),
        y: panOffset.y - (e.deltaY * 0.5)
      });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(5, zoom * 1.2);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newPanOffsetX = centerX - ((centerX - panOffset.x) * (newZoom / zoom));
      const newPanOffsetY = centerY - ((centerY - panOffset.y) * (newZoom / zoom));
      
      setZoom(newZoom);
      setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
    } else {
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom / 1.2);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newPanOffsetX = centerX - ((centerX - panOffset.x) * (newZoom / zoom));
      const newPanOffsetY = centerY - ((centerY - panOffset.y) * (newZoom / zoom));
      
      setZoom(newZoom);
      setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
    } else {
      setZoom(newZoom);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      if (isMovingCabinet && selectedCabinet) {
        // Start moving cabinet
        setCabinetStartPos({
          x: e.clientX,
          y: e.clientY
        });
      } else if (draggingItem) {
        // Handle dropping the dragged item
        handleItemDrop(e);
      } else {
        // Normal canvas dragging
        setIsDragging(true);
        setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isMovingCabinet && !draggingItem) {
      // Pan canvas
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (isMovingCabinet && selectedCabinet && room) {
      // Move selected cabinet
      const dx = pixelsToMm(e.clientX - cabinetStartPos.x, zoom);
      const dy = pixelsToMm(e.clientY - cabinetStartPos.y, zoom);
      
      setCabinetStartPos({
        x: e.clientX,
        y: e.clientY
      });
      
      // Update cabinet position
      let updatedCabinets = room.cabinets.map(cabinet => {
        if (cabinet.id === selectedCabinet.id) {
          const newPosition = {
            x: cabinet.position.x + dx,
            y: cabinet.position.y + dy
          };
          
          // Check if snapping is enabled
          if (isSnappingEnabled) {
            // Check if snapping to other cabinets is enabled and there are other cabinets
            if (snapToCabinets && room.cabinets.length > 1) {
              const nearestCabinetInfo = findNearestCabinet(
                { ...cabinet, position: newPosition },
                room.cabinets,
                snapThreshold,
                cabinet.id
              );
              
              if (nearestCabinetInfo) {
                // Snap to nearest cabinet
                const snappedPosition = calculateCabinetSnapPosition(
                  { ...cabinet, position: newPosition },
                  nearestCabinetInfo.cabinet,
                  nearestCabinetInfo.edge
                );
                
                return {
                  ...cabinet,
                  position: snappedPosition,
                  wallId: null // Clear wall association when snapping to cabinet
                };
              }
            }
            
            // Find nearest wall for snapping
            const nearestWall = findNearestWall(
              { x: newPosition.x + cabinet.width/2, y: newPosition.y + cabinet.depth/2 },
              room.walls,
              snapThreshold
            );
            
            if (nearestWall) {
              // Snap to wall
              const snappedPosition = calculateWallSnapPosition(
                { ...cabinet, position: newPosition },
                nearestWall
              );
              
              return {
                ...cabinet,
                position: snappedPosition,
                rotation: snappedPosition.rotation || 0,
                wallId: nearestWall.id
              };
            }
          }
          
          // Make sure position is within room boundaries
          const constrainedPosition = {
            x: Math.max(0, Math.min(room.width - cabinet.width, newPosition.x)),
            y: Math.max(0, Math.min(room.length - cabinet.depth, newPosition.y))
          };
          
          // No snapping, just update position
          return {
            ...cabinet,
            position: constrainedPosition,
            wallId: null
          };
        }
        return cabinet;
      });
      
      setRoom({
        ...room,
        cabinets: updatedCabinets
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle dropping a dragged item from the sidebar
  const handleItemDrop = (e: React.MouseEvent) => {
    if (!room || !draggingItem) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert screen coordinates to room coordinates
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const roomCoords = screenToRoomCoordinates(mouseX, mouseY, panOffset, zoom);
    
    // Store initial drop position
    setInitialDropPosition(roomCoords);
    
    if (draggingItem.type === 'cabinet') {
      // Make sure the cabinet is placed inside the room
      if (!isPointInRoom(roomCoords, room)) {
        toast({
          title: "Invalid Placement",
          description: "Cabinets must be placed inside the room.",
          variant: "destructive"
        });
        setDraggingItem(null);
        return;
      }
      
      const cabinet = draggingItem.item;
      
      // Constrain position to room boundaries
      const constrainedPosition = {
        x: Math.max(0, Math.min(room.width - cabinet.width, roomCoords.x)),
        y: Math.max(0, Math.min(room.length - cabinet.depth, roomCoords.y))
      };
      
      // Find nearest wall for snapping if enabled
      let finalPosition = { ...constrainedPosition };
      let wallId = null;
      let rotation = 0;
      
      if (isSnappingEnabled) {
        // First check if we can snap to another cabinet
        if (snapToCabinets && room.cabinets.length > 0) {
          const nearestCabinetInfo = findNearestCabinet(
            { 
              ...cabinet, 
              position: constrainedPosition,
              id: 'temp-drop-id' // Temporary ID for the cabinet being dropped
            },
            room.cabinets,
            snapThreshold
          );
          
          if (nearestCabinetInfo) {
            finalPosition = calculateCabinetSnapPosition(
              { ...cabinet, position: constrainedPosition },
              nearestCabinetInfo.cabinet,
              nearestCabinetInfo.edge
            ).position;
          }
        }
        
        // If not snapped to cabinet, try wall
        if (finalPosition === constrainedPosition) {
          const nearestWall = findNearestWall(
            { x: constrainedPosition.x + cabinet.width/2, y: constrainedPosition.y + cabinet.depth/2 },
            room.walls,
            snapThreshold
          );
          
          if (nearestWall) {
            const snapResult = calculateWallSnapPosition(
              { ...cabinet, position: constrainedPosition },
              nearestWall
            );
            finalPosition = snapResult.position;
            wallId = nearestWall.id;
            rotation = snapResult.rotation || 0;
          }
        }
      }
      
      // Create new cabinet with unique ID
      const newCabinet = {
        id: uuidv4(),
        ...cabinet,
        position: finalPosition,
        rotation: rotation,
        wallId: wallId
      };
      
      // Add to room
      setRoom({
        ...room,
        cabinets: [...room.cabinets, newCabinet]
      });
      
      // Select the newly added cabinet
      setSelectedCabinet(newCabinet);
      
      toast({
        title: "Cabinet Added",
        description: `${cabinet.name} has been added to your design.`
      });
    } 
    else if (draggingItem.type === 'door') {
      // Doors must be placed on a wall
      const door = draggingItem.item;
      
      // Find nearest wall for door placement
      const nearestWall = findNearestWall(
        roomCoords,
        room.walls,
        snapThreshold * 3 // Increase threshold for easier placement
      );
      
      if (!nearestWall) {
        toast({
          title: "Invalid Placement",
          description: "Doors must be placed on a wall.",
          variant: "destructive"
        });
        setDraggingItem(null);
        return;
      }
      
      // Calculate door position on wall
      const doorPosition = calculateWallItemPlacement({...door, position: roomCoords}, nearestWall);
      const doorRotation = calculateWallItemRotation(nearestWall);
      
      // Create new door with unique ID
      const newDoor = {
        id: uuidv4(),
        ...door,
        position: doorPosition,
        rotation: doorRotation,
        wallId: nearestWall.id,
        isOpen: false
      };
      
      // Add to room
      setRoom({
        ...room,
        doors: [...(room.doors || []), newDoor]
      });
      
      toast({
        title: "Door Added",
        description: `A door has been added to your design.`
      });
    }
    else if (draggingItem.type === 'window') {
      // Windows must be placed on a wall
      const window = draggingItem.item;
      
      // Find nearest wall for window placement
      const nearestWall = findNearestWall(
        roomCoords,
        room.walls,
        snapThreshold * 3 // Increase threshold for easier placement
      );
      
      if (!nearestWall) {
        toast({
          title: "Invalid Placement",
          description: "Windows must be placed on a wall.",
          variant: "destructive"
        });
        setDraggingItem(null);
        return;
      }
      
      // Calculate window position on wall
      const windowPosition = calculateWallItemPlacement({...window, position: roomCoords}, nearestWall);
      
      // Create new window with unique ID
      const newWindow = {
        id: uuidv4(),
        ...window,
        position: windowPosition,
        wallId: nearestWall.id
      };
      
      // Add to room
      setRoom({
        ...room,
        windows: [...(room.windows || []), newWindow]
      });
      
      toast({
        title: "Window Added",
        description: `A window has been added to your design.`
      });
    }
    
    // Clear dragging item
    setDraggingItem(null);
  };
  
  const handleWallClick = (wallId: string) => {
    setSelectedWall(selectedWall === wallId ? null : wallId);
  };
  
  const toggleElevationMode = (wallId: string | null) => {
    if (elevationMode && selectedWall === wallId) {
      setElevationMode(false);
    } else {
      setElevationMode(true);
      setSelectedWall(wallId);
    }
  };
  
  const handleCabinetClick = (e: React.MouseEvent, cabinetId: string) => {
    e.stopPropagation();
    
    if (!room) return;
    
    const cabinet = room.cabinets.find(c => c.id === cabinetId);
    if (cabinet) {
      setSelectedCabinet(selectedCabinet?.id === cabinetId ? null : cabinet);
    }
  };
  
  const toggleCabinetMovement = () => {
    setIsMovingCabinet(!isMovingCabinet);
    toast({
      title: isMovingCabinet ? "Cabinet Movement Disabled" : "Cabinet Movement Enabled",
      description: isMovingCabinet ? 
        "You can now interact with other elements." : 
        "Click and drag the cabinet to move it."
    });
  };
  
  const deleteCabinet = () => {
    if (!room || !selectedCabinet) return;
    
    const updatedCabinets = room.cabinets.filter(cabinet => cabinet.id !== selectedCabinet.id);
    
    setRoom({
      ...room,
      cabinets: updatedCabinets
    });
    
    setSelectedCabinet(null);
    
    toast({
      title: "Cabinet Deleted",
      description: `${selectedCabinet.name} has been removed from your design.`
    });
  };
  
  const toggleSnapping = () => {
    setSnappingEnabled(!isSnappingEnabled);
    toast({
      title: isSnappingEnabled ? "Snapping Disabled" : "Snapping Enabled",
      description: isSnappingEnabled ?
        "Elements will move freely." :
        "Elements will snap to walls and other elements."
    });
  };
  
  const toggle3DView = () => {
    setElevationMode(!elevationMode);
    // If we're going to 3D view and no wall is selected, select the first wall
    if (!elevationMode && !selectedWall && room && room.walls.length > 0) {
      setSelectedWall(room.walls[0].id);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ToolBar 
        isSnappingEnabled={isSnappingEnabled}
        toggleSnapping={toggleSnapping}
        elevationMode={elevationMode}
        toggle3DView={toggle3DView}
        room={room}
        resetView={resetView}
        zoom={zoom}
        handleZoomOut={handleZoomOut}
        handleZoomIn={handleZoomIn}
      />
      
      <div 
        ref={canvasRef}
        className="kitchen-canvas w-full h-full bg-slate-100 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg width="100%" height="100%">
          {!elevationMode && <Ruler />}
          <g transform={`translate(${elevationMode ? 0 : 30}px, ${elevationMode ? 0 : 30}px)`}> 
            {!elevationMode && <Grid />}
            {elevationMode ? (
              room && selectedWall && (
                <ElevationView 
                  room={room}
                  selectedWall={selectedWall}
                  zoom={zoom}
                  panOffset={panOffset}
                  setElevationMode={setElevationMode}
                />
              )
            ) : (
              <>
                {room && (
                  <WallsRenderer 
                    walls={room.walls}
                    selectedWall={selectedWall}
                    zoom={zoom}
                    panOffset={panOffset}
                    elevationMode={elevationMode}
                    handleWallClick={handleWallClick}
                    toggleElevationMode={toggleElevationMode}
                  />
                )}
                {room && (
                  <CabinetsRenderer 
                    cabinets={room.cabinets}
                    selectedCabinet={selectedCabinet}
                    zoom={zoom}
                    panOffset={panOffset}
                    elevationMode={elevationMode}
                    isMovingCabinet={isMovingCabinet}
                    handleCabinetClick={handleCabinetClick}
                    toggleCabinetMovement={toggleCabinetMovement}
                    deleteCabinet={deleteCabinet}
                  />
                )}
                {room && (
                  <DoorsRenderer 
                    doors={room.doors}
                    zoom={zoom}
                    panOffset={panOffset}
                    elevationMode={elevationMode}
                  />
                )}
                {room && (
                  <WindowsRenderer 
                    windows={room.windows}
                    zoom={zoom}
                    panOffset={panOffset}
                    elevationMode={elevationMode}
                  />
                )}
              </>
            )}
          </g>
        </svg>
      </div>

      {room && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-70 p-2 rounded text-sm">
          <div>Room: {room.width}mm × {room.length}mm × {room.height}mm</div>
          <div>Tip: Hold Ctrl/Cmd while scrolling to zoom</div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
