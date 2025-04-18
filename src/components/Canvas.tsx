
import React, { useState, useRef, useEffect } from 'react';
import { useDesignContext } from '../context/DesignContext';
import Grid from './Grid';
import Ruler from './Ruler';
import { ZoomIn, ZoomOut, Eye, RotateCcw, Move, Trash2, Magnet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { 
  mmToPixels, 
  calculateMidpoint, 
  formatMm, 
  pixelsToMm, 
  screenToRoomCoordinates,
  roomToScreenCoordinates
} from '../utils/measurements';
import { toast } from '@/components/ui/use-toast';
import { 
  findNearestWall, 
  calculateSnapPositionToWall, 
  isPointInRoom,
  calculateCabinetRotationFromWall,
  calculateDoorSnapPositionToWall,
  calculateWindowSnapPositionToWall,
  calculateWallItemRotation,
  calculateWallItemPlacement,
  isOnWall,
  canPlaceWallItem,
  distancePointToWall
} from '../utils/snapping';
import { v4 as uuidv4 } from 'uuid';

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
    draggingItem,
    setDraggingItem
  } = useDesignContext();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isMovingCabinet, setIsMovingCabinet] = useState(false);
  const [cabinetStartPos, setCabinetStartPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Reset view to fit room in viewport
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
  
  // Center room when it's first created
  useEffect(() => {
    if (room) {
      resetView();
    }
  }, [room]);

  // Track mouse position for drag and drop
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
            // Find nearest wall for snapping
            const nearestWall = findNearestWall(
              { x: newPosition.x + cabinet.width/2, y: newPosition.y + cabinet.depth/2 },
              room.walls,
              snapThreshold
            );
            
            if (nearestWall) {
              // Snap to wall
              const snappedPosition = calculateSnapPositionToWall(
                { ...cabinet, position: newPosition },
                nearestWall
              );
              
              // Calculate rotation based on wall
              const wallRotation = calculateCabinetRotationFromWall(nearestWall);
              
              return {
                ...cabinet,
                position: snappedPosition,
                rotation: wallRotation,
                wallId: nearestWall.id
              };
            }
          }
          
          // No snapping, just update position
          return {
            ...cabinet,
            position: newPosition,
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

    console.log("Room coords for drop:", roomCoords);
    console.log("Room dimensions:", room.width, "x", room.length);
    console.log("Is point in room:", isPointInRoom(roomCoords, room));
    
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
      
      // Find nearest wall for snapping if enabled
      let finalPosition = { ...roomCoords };
      let wallId = null;
      let rotation = 0;
      
      if (isSnappingEnabled) {
        const nearestWall = findNearestWall(
          { x: roomCoords.x + cabinet.width/2, y: roomCoords.y + cabinet.depth/2 },
          room.walls,
          snapThreshold
        );
        
        if (nearestWall) {
          finalPosition = calculateSnapPositionToWall(
            { ...cabinet, position: roomCoords },
            nearestWall
          );
          wallId = nearestWall.id;
          rotation = calculateCabinetRotationFromWall(nearestWall);
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

      // Calculate distance to the wall
      const distanceToWall = distancePointToWall(roomCoords, nearestWall);
      console.log("Distance to wall:", distanceToWall, "threshold:", snapThreshold * 3);
      
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

  // Render dragging item preview (follows the mouse)
  const renderDraggingItem = () => {
    if (!draggingItem || !canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = mousePos.x - rect.left;
    const mouseY = mousePos.y - rect.top;
    
    if (draggingItem.type === 'cabinet') {
      const cabinet = draggingItem.item;
      const width = mmToPixels(cabinet.width, zoom);
      const height = mmToPixels(cabinet.depth, zoom);
      
      return (
        <g 
          transform={`translate(${mouseX - width/2}px, ${mouseY - height/2}px)`}
          opacity="0.7"
        >
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={height} 
            fill="#94a3b8"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text 
            x={width / 2} 
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize="12"
          >
            {cabinet.name}
          </text>
        </g>
      );
    } else if (draggingItem.type === 'door') {
      const door = draggingItem.item;
      const width = mmToPixels(door.width, zoom);
      const height = mmToPixels(door.height, zoom);
      
      return (
        <g 
          transform={`translate(${mouseX - width/2}px, ${mouseY - height/2}px)`}
          opacity="0.7"
        >
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={10} // Thinner representation for doors in top view
            fill="#cbd5e1"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text 
            x={width / 2} 
            y={20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize="10"
          >
            Door
          </text>
        </g>
      );
    } else if (draggingItem.type === 'window') {
      const window = draggingItem.item;
      const width = mmToPixels(window.width, zoom);
      const height = mmToPixels(window.height, zoom);
      
      return (
        <g 
          transform={`translate(${mouseX - width/2}px, ${mouseY - height/2}px)`}
          opacity="0.7"
        >
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={10} // Thinner representation for windows in top view
            fill="#bfdbfe"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text 
            x={width / 2} 
            y={20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize="10"
          >
            Window
          </text>
        </g>
      );
    }
    
    return null;
  };
  
  const renderWalls = () => {
    if (!room) return null;
    
    return room.walls.map((wall) => {
      // Convert wall coordinates to pixels with zoom
      const startX = mmToPixels(wall.start.x, zoom) + panOffset.x;
      const startY = mmToPixels(wall.start.y, zoom) + panOffset.y;
      const endX = mmToPixels(wall.end.x, zoom) + panOffset.x;
      const endY = mmToPixels(wall.end.y, zoom) + panOffset.y;
      
      // Calculate wall direction and thickness
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      // Calculate wall thickness (perpendicular to wall direction)
      const thickness = mmToPixels(wall.thickness, zoom);
      const perpX = -Math.sin(angle) * thickness;
      const perpY = Math.cos(angle) * thickness;
      
      // Calculate wall polygon points with thickness
      const points = [
        { x: startX, y: startY },
        { x: endX, y: endY },
        { x: endX + perpX, y: endY + perpY },
        { x: startX + perpX, y: startY + perpY }
      ];
      
      const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');
      
      // Calculate wall length for display
      const wallLengthMm = length;
      
      // Calculate midpoint for labels
      const midpoint = calculateMidpoint(
        { x: startX, y: startY },
        { x: endX, y: endY }
      );
      
      const midpointOuter = calculateMidpoint(
        { x: startX + perpX, y: startY + perpY },
        { x: endX + perpX, y: endY + perpY }
      );
      
      const labelMidpoint = calculateMidpoint(midpoint, midpointOuter);
      
      // Determine wall orientation for label placement
      const angle_deg = angle * (180 / Math.PI);
      const isVertical = Math.abs(Math.abs(angle_deg) - 90) < 45;
      
      const labelOffsetX = isVertical ? -20 : 0;
      const labelOffsetY = isVertical ? 0 : -20;
      
      const dimensionOffsetX = isVertical ? 0 : 0;
      const dimensionOffsetY = isVertical ? 0 : 15;
      
      return (
        <g 
          key={wall.id}
          onClick={() => handleWallClick(wall.id)}
          style={{ cursor: 'pointer' }}
        >
          {/* Wall polygon with thickness */}
          <polygon 
            points={pointsString} 
            fill={selectedWall === wall.id ? "#C5DCFF" : "#E2E8F0"}
            stroke={selectedWall === wall.id ? "#3b82f6" : "#475569"}
            strokeWidth="1"
          />
          
          {/* Wall label */}
          <text 
            x={labelMidpoint.x + labelOffsetX} 
            y={labelMidpoint.y + labelOffsetY}
            className="kitchen-wall-label"
            fill="#475569"
            fontSize="12"
            transform={isVertical ? `rotate(90,${labelMidpoint.x},${labelMidpoint.y})` : ''}
          >
            Wall {wall.label}
          </text>
          
          {/* Wall dimension */}
          <text 
            x={labelMidpoint.x + dimensionOffsetX} 
            y={labelMidpoint.y + dimensionOffsetY}
            className="kitchen-wall-dimension"
            fill="#475569"
            fontSize="10"
            transform={isVertical ? `rotate(90,${labelMidpoint.x},${labelMidpoint.y})` : ''}
          >
            {formatMm(wallLengthMm, wallLengthMm >= 1000)}
          </text>
          
          {/* Elevation button for selected wall */}
          {selectedWall === wall.id && (
            <g 
              className="elevation-button" 
              transform={`translate(${midpoint.x + (isVertical ? -40 : 0)}, ${midpoint.y + (isVertical ? 0 : -40)})`}
              onClick={(e) => {
                e.stopPropagation();
                toggleElevationMode(wall.id);
              }}
            >
              <circle cx="0" cy="0" r="15" fill={elevationMode ? "#3b82f6" : "#94a3b8"} />
              <foreignObject x="-8" y="-8" width="16" height="16">
                <Eye size={16} color="white" />
              </foreignObject>
            </g>
          )}
        </g>
      );
    });
  };
  
  const renderCabinets = () => {
    if (!room || !room.cabinets || room.cabinets.length === 0 || elevationMode) return null;
    
    return room.cabinets.map((cabinet) => {
      const x = mmToPixels(cabinet.position.x, zoom) + panOffset.x;
      const y = mmToPixels(cabinet.position.y, zoom) + panOffset.y;
      const width = mmToPixels(cabinet.width, zoom);
      const height = mmToPixels(cabinet.depth, zoom); // In top view, depth is height
      const isSelected = selectedCabinet?.id === cabinet.id;
      
      // Base color based on cabinet color
      let fillColor = cabinet.color;
      if (fillColor === 'natural') fillColor = '#E3C395';
      else if (fillColor === 'walnut') fillColor = '#5C4033';
      else if (fillColor === 'cherry') fillColor = '#6E2E1C';
      
      return (
        <g 
          key={cabinet.id} 
          transform={`translate(${x}, ${y}) rotate(${cabinet.rotation}, ${width/2}, ${height/2})`}
          onClick={(e) => handleCabinetClick(e, cabinet.id)}
          style={{ cursor: isMovingCabinet && isSelected ? 'move' : 'pointer' }}
        >
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={height} 
            fill={fillColor}
            stroke={isSelected ? "#3b82f6" : "#475569"}
            strokeWidth={isSelected ? "2" : "1"}
            opacity="0.8"
          />
          
          {cabinet.type === 'base' && (
            <rect 
              x={width * 0.1} 
              y={height * 0.1} 
              width={width * 0.8} 
              height={height * 0.8} 
              fill="none"
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )}
          
          <text 
            x={width / 2} 
            y={height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={cabinet.color === 'black' ? "white" : "black"}
            fontSize={Math.max(8, 12 * zoom)}
            fontWeight="bold"
          >
            {cabinet.name}
          </text>
          
          <text 
            x={width / 2} 
            y={(height / 2) + 15 * zoom}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={cabinet.color === 'black' ? "white" : "black"}
            fontSize={Math.max(6, 10 * zoom)}
          >
            {cabinet.width}×{cabinet.height}mm
          </text>
          
          {isSelected && (
            <g className="cabinet-controls">
              <g 
                transform={`translate(${width - 20}, ${-20})`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCabinetMovement();
                }}
              >
                <circle cx="0" cy="0" r="15" fill={isMovingCabinet ? "#3b82f6" : "#94a3b8"} />
                <foreignObject x="-8" y="-8" width="16" height="16">
                  <Move size={16} color="white" />
                </foreignObject>
              </g>
              
              <g 
                transform={`translate(${width - 20}, ${20})`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCabinet();
                }}
              >
                <circle cx="0" cy="0" r="15" fill="#ef4444" />
                <foreignObject x="-8" y="-8" width="16" height="16">
                  <Trash2 size={16} color="white" />
                </foreignObject>
              </g>
            </g>
          )}
        </g>
      );
    });
  };

  // Render doors in top view
  const renderDoors = () => {
    if (!room || !room.doors || room.doors.length === 0 || elevationMode) return null;
    
    return room.doors.map((door) => {
      const x = mmToPixels(door.position.x, zoom) + panOffset.x;
      const y = mmToPixels(door.position.y, zoom) + panOffset.y;
      const width = mmToPixels(door.width, zoom);
      const thickness = mmToPixels(100, zoom); // Constant door thickness for visualization
      
      return (
        <g 
          key={door.id} 
          transform={`translate(${x}, ${y}) rotate(${door.rotation}, ${width/2}, ${thickness/2})`}
        >
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={thickness} 
            fill="#cbd5e1"
            stroke="#475569"
            strokeWidth="2"
          />
          
          {/* Door swing arc */}
          <path 
            d={`M ${width} ${thickness/2} A ${width} ${width} 0 0 ${door.isOpen ? 1 : 0} ${width} ${thickness/2 + width}`}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          
          <text 
            x={width / 2} 
            y={thickness / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize={Math.max(8, 12 * zoom)}
          >
            Door
          </text>
        </g>
      );
    });
  };

  // Render windows in top view
  const renderWindows = () => {
    if (!room || !room.windows || room.windows.length === 0 || elevationMode) return null;
    
    return room.windows.map((window) => {
      const x = mmToPixels(window.position.x, zoom) + panOffset.x;
      const y = mmToPixels(window.position.y, zoom) + panOffset.y;
      const width = mmToPixels(window.width, zoom);
      const thickness = mmToPixels(100, zoom); // Constant window thickness for visualization
      
      return (
        <g 
          key={window.id} 
          transform={`translate(${x}, ${y})`}
        >
          <rect 
            x="0" 
            y="0" 
            width={width} 
            height={thickness} 
            fill="#bfdbfe"
            stroke="#475569"
            strokeWidth="2"
          />
          
          {/* Window panes */}
          <line 
            x1={width/2} 
            y1="0" 
            x2={width/2} 
            y2={thickness} 
            stroke="#475569" 
            strokeWidth="1" 
          />
          
          <line 
            x1="0" 
            y1={thickness/2} 
            x2={width} 
            y2={thickness/2} 
            stroke="#475569" 
            strokeWidth="1" 
          />
          
          <text 
            x={width / 2} 
            y={thickness / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize={Math.max(8, 12 * zoom)}
          >
            Window
          </text>
        </g>
      );
    });
  };
  
  const renderElevationCabinets = () => {
    if (!elevationMode || !selectedWall || !room || !room.cabinets || room.cabinets.length === 0) return null;
    
    // Filter cabinets assigned to the selected wall
    const wallCabinets = room.cabinets.filter(cabinet => cabinet.wallId === selectedWall);
    
    const wall = room.walls.find(w => w.id === selectedWall);
    if (!wall) return null;
    
    // Calculate wall length
    const wallLengthMm = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    return wallCabinets.map((cabinet) => {
      const x = mmToPixels(cabinet.position.x, zoom) + panOffset.x;
      const y = mmToPixels(room.height - cabinet.position.y - cabinet.height, zoom) + panOffset.y;
      const width = mmToPixels(cabinet.width, zoom);
      const height = mmToPixels(cabinet.height, zoom);
      const isSelected = selectedCabinet?.id === cabinet.id;
      
      // Base color based on cabinet color
      let fillColor = cabinet.color;
      if (fillColor === 'natural') fillColor = '#E3C395';
      else if (fillColor === 'walnut') fillColor = '#5C4033';
      else if (fillColor === 'cherry') fillColor = '#6E2E1C';
      
      return (
        <g 
          key={cabinet.id} 
          onClick={(e) => handleCabinetClick(e, cabinet.id)}
          style={{ cursor: 'pointer' }}
        >
          <rect 
            x={x}
            y={y}
            width={width} 
            height={height} 
            fill={fillColor}
            stroke={isSelected ? "#3b82f6" : "#475569"}
            strokeWidth={isSelected ? "2" : "1"}
          />
          
          {/* Cabinet handle */}
          <rect 
            x={x + width * 0.45} 
            y={y + height * 0.5} 
            width={width * 0.1} 
            height={height * 0.2} 
            fill="#94a3b8"
          />
          
          <text 
            x={x + width / 2} 
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={cabinet.color === 'black' ? "white" : "black"}
            fontSize={Math.max(8, 12 * zoom)}
            fontWeight="bold"
          >
            {cabinet.name}
          </text>
        </g>
      );
    });
  };

  // Render doors in elevation view
  const renderElevationDoors = () => {
    if (!elevationMode || !selectedWall || !room || !room.doors) return null;
    
    // Filter doors assigned to the selected wall
    const wallDoors = room.doors.filter(door => door.wallId === selectedWall);
    
    return wallDoors.map((door) => {
      // Position in elevation view (bottom of wall)
      const x = mmToPixels(door.position.x, zoom) + panOffset.x;
      const y = mmToPixels(room.height - door.height, zoom) + panOffset.y; // Doors typically go to floor
      const width = mmToPixels(door.width, zoom);
      const height = mmToPixels(door.height, zoom);
      
      return (
        <g key={door.id}>
          <rect 
            x={x} 
            y={y} 
            width={width} 
            height={height} 
            fill="#cbd5e1"
            stroke="#475569"
            strokeWidth="2"
          />
          
          {/* Door handle */}
          <circle 
            cx={x + width * 0.9} 
            cy={y + height * 0.5} 
            r={width * 0.03} 
            fill="#475569"
          />
          
          <text 
            x={x + width / 2} 
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize={Math.max(8, 12 * zoom)}
          >
            Door
          </text>
        </g>
      );
    });
  };

  // Render windows in elevation view
  const renderElevationWindows = () => {
    if (!elevationMode || !selectedWall || !room || !room.windows) return null;
    
    // Filter windows assigned to the selected wall
    const wallWindows = room.windows.filter(window => window.wallId === selectedWall);
    
    return wallWindows.map((window) => {
      const x = mmToPixels(window.position.x, zoom) + panOffset.x;
      const y = mmToPixels(room.height - window.position.y - window.height, zoom) + panOffset.y;
      const width = mmToPixels(window.width, zoom);
      const height = mmToPixels(window.height, zoom);
      
      return (
        <g key={window.id}>
          <rect 
            x={x} 
            y={y} 
            width={width} 
            height={height} 
            fill="#bfdbfe"
            stroke="#475569"
            strokeWidth="2"
          />
          
          {/* Window panes */}
          <line 
            x1={x + width/2} 
            y1={y} 
            x2={x + width/2} 
            y2={y + height} 
            stroke="#475569" 
            strokeWidth="1" 
          />
          
          <line 
            x1={x} 
            y1={y + height/2} 
            x2={x + width} 
            y2={y + height/2} 
            stroke="#475569" 
            strokeWidth="1" 
          />
          
          <text 
            x={x + width / 2} 
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1e293b"
            fontSize={Math.max(8, 12 * zoom)}
          >
            Window
          </text>
        </g>
      );
    });
  };
  
  const renderElevation = () => {
    if (!elevationMode || !selectedWall || !room) return null;
    
    const wall = room.walls.find(w => w.id === selectedWall);
    if (!wall) return null;
    
    const wallLengthMm = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    const wallWidthPx = mmToPixels(wallLengthMm, zoom);
    const wallHeightPx = mmToPixels(room.height, zoom);
    
    return (
      <>
        <rect
          x={panOffset.x}
          y={panOffset.y}
          width={wallWidthPx}
          height={wallHeightPx}
          fill="#f8fafc"
          stroke="#475569"
          strokeWidth="2"
        />
        
        <text
          x={panOffset.x + wallWidthPx / 2}
          y={panOffset.y + 20}
          textAnchor="middle"
          fill="#475569"
          fontSize="14"
          fontWeight="bold"
        >
          Wall {wall.label} - Elevation View
        </text>
        
        <text
          x={panOffset.x + wallWidthPx / 2}
          y={panOffset.y + 40}
          textAnchor="middle"
          fill="#475569"
          fontSize="12"
        >
          {formatMm(wallLengthMm, wallLengthMm >= 1000)} × {formatMm(room.height, room.height >= 1000)}
        </text>
        
        <line
          x1={panOffset.x}
          y1={panOffset.y + wallHeightPx}
          x2={panOffset.x + wallWidthPx}
          y2={panOffset.y + wallHeightPx}
          stroke="#64748b"
          strokeWidth="2"
        />
        
        {renderElevationCabinets()}
        {renderElevationDoors()}
        {renderElevationWindows()}
        
        <g
          onClick={() => setElevationMode(false)}
          style={{ cursor: 'pointer' }}
          transform={`translate(${panOffset.x + wallWidthPx - 30}, ${panOffset.y + 30})`}
        >
          <circle cx="0" cy="0" r="15" fill="#ef4444" />
          <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12">×</text>
        </g>
      </>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between p-2 bg-slate-200 items-center">
        <div className="flex items-center">
          <Toggle
            pressed={isSnappingEnabled}
            onPressedChange={toggleSnapping}
            aria-label="Toggle snapping"
            className="mr-2"
          >
            <Magnet size={16} className="mr-1" />
            Snap
          </Toggle>
          
          <Button 
            variant={elevationMode ? "default" : "outline"} 
            size="sm" 
            onClick={toggle3DView}
            disabled={!room}
            className="mr-2"
          >
            <Eye size={16} className="mr-1" />
            3D View
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={resetView} className="mr-1">
            <RotateCcw size={16} />
            <span className="ml-1">Center</span>
          </Button>
          <span className="mx-2 text-sm">Zoom: {Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="mr-1">
            <ZoomOut size={16} />
            <span className="ml-1">-</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn size={16} />
            <span className="ml-1">+</span>
          </Button>
        </div>
      </div>
      
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
            {elevationMode ? renderElevation() : (
              <>
                {renderWalls()}
                {renderCabinets()}
                {renderDoors()}
                {renderWindows()}
              </>
            )}
            {draggingItem && renderDraggingItem()}
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
