
import { Point, Wall, Cabinet, Room, Door, Window } from '../context/DesignContext';
import { calculateDistance, pixelsToMm, calculateWallAngle } from './measurements';

// Calculate the distance from a point to a line segment (wall)
export const distancePointToWall = (point: Point, wall: Wall): number => {
  const { start, end } = wall;
  
  // Vector from start to end
  const line = { x: end.x - start.x, y: end.y - start.y };
  
  // Vector from start to point
  const pointVec = { x: point.x - start.x, y: point.y - start.y };
  
  // Calculate the projection length
  const lineLength = line.x * line.x + line.y * line.y;
  const dotProduct = pointVec.x * line.x + pointVec.y * line.y;
  const t = Math.max(0, Math.min(1, dotProduct / lineLength));
  
  // Calculate the closest point on the line
  const closestPoint = {
    x: start.x + t * line.x,
    y: start.y + t * line.y
  };
  
  // Calculate the distance to the closest point
  return calculateDistance(point, closestPoint);
};

// Find the nearest wall to a point
export const findNearestWall = (point: Point, walls: Wall[], threshold: number): Wall | null => {
  let nearestWall = null;
  let minDistance = threshold;
  
  for (const wall of walls) {
    const distance = distancePointToWall(point, wall);
    if (distance < minDistance) {
      minDistance = distance;
      nearestWall = wall;
    }
  }
  
  return nearestWall;
};

// Find the nearest cabinet to another cabinet
export const findNearestCabinet = (
  cabinet: Cabinet, 
  cabinets: Cabinet[], 
  threshold: number,
  excludeId?: string
): { cabinet: Cabinet, edge: 'left' | 'right' | 'top' | 'bottom', distance: number } | null => {
  let nearestCabinet = null;
  let minDistance = threshold;
  let nearestEdge: 'left' | 'right' | 'top' | 'bottom' = 'left';
  
  // Skip if no other cabinets
  if (!cabinets || cabinets.length === 0) return null;
  
  for (const otherCabinet of cabinets) {
    // Skip self
    if (otherCabinet.id === (excludeId || cabinet.id)) continue;
    
    // Check each edge of the cabinet
    const edges = [
      { 
        edge: 'left' as const,
        distance: Math.abs((otherCabinet.position.x + otherCabinet.width) - cabinet.position.x),
        valid: Math.abs(otherCabinet.position.y - cabinet.position.y) < threshold || 
              Math.abs((otherCabinet.position.y + otherCabinet.depth) - (cabinet.position.y + cabinet.depth)) < threshold
      },
      { 
        edge: 'right' as const,
        distance: Math.abs(otherCabinet.position.x - (cabinet.position.x + cabinet.width)),
        valid: Math.abs(otherCabinet.position.y - cabinet.position.y) < threshold || 
              Math.abs((otherCabinet.position.y + otherCabinet.depth) - (cabinet.position.y + cabinet.depth)) < threshold
      },
      { 
        edge: 'top' as const,
        distance: Math.abs((otherCabinet.position.y + otherCabinet.depth) - cabinet.position.y),
        valid: Math.abs(otherCabinet.position.x - cabinet.position.x) < threshold || 
              Math.abs((otherCabinet.position.x + otherCabinet.width) - (cabinet.position.x + cabinet.width)) < threshold
      },
      { 
        edge: 'bottom' as const,
        distance: Math.abs(otherCabinet.position.y - (cabinet.position.y + cabinet.depth)),
        valid: Math.abs(otherCabinet.position.x - cabinet.position.x) < threshold || 
              Math.abs((otherCabinet.position.x + otherCabinet.width) - (cabinet.position.x + cabinet.width)) < threshold
      }
    ];
    
    for (const edge of edges) {
      if (edge.distance < minDistance && edge.valid) {
        minDistance = edge.distance;
        nearestCabinet = otherCabinet;
        nearestEdge = edge.edge;
      }
    }
  }
  
  if (nearestCabinet) {
    return { cabinet: nearestCabinet, edge: nearestEdge, distance: minDistance };
  }
  
  return null;
};

// Calculate snap position when snapping to another cabinet
export const calculateSnapPositionToCabinet = (
  cabinet: Cabinet, 
  nearestCabinet: Cabinet, 
  edge: 'left' | 'right' | 'top' | 'bottom'
): Point => {
  let newPosition = { ...cabinet.position };
  
  switch (edge) {
    case 'left':
      newPosition.x = nearestCabinet.position.x + nearestCabinet.width;
      break;
    case 'right':
      newPosition.x = nearestCabinet.position.x - cabinet.width;
      break;
    case 'top':
      newPosition.y = nearestCabinet.position.y + nearestCabinet.depth;
      break;
    case 'bottom':
      newPosition.y = nearestCabinet.position.y - cabinet.depth;
      break;
  }
  
  return newPosition;
};

// Calculate snap position along a wall for cabinets
export const calculateSnapPositionToWall = (cabinet: Cabinet, wall: Wall): Point => {
  const { start, end } = wall;
  
  // Calculate the wall angle
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  // Calculate the wall's perpendicular direction (wall normal)
  const wallNormal = {
    x: Math.sin(angle),
    y: -Math.cos(angle)
  };
  
  // Project the cabinet center onto the wall line
  const closestPoint = getPointOnWall({
    x: cabinet.position.x + cabinet.width / 2,
    y: cabinet.position.y + cabinet.depth / 2
  }, wall);
  
  // Calculate offset from the wall (half of wall thickness + half of cabinet depth)
  const offset = (wall.thickness / 2) + (cabinet.depth / 2);
  
  // Calculate the snapped position
  return {
    x: closestPoint.x + wallNormal.x * offset - cabinet.width / 2,
    y: closestPoint.y + wallNormal.y * offset - cabinet.depth / 2
  };
};

// Calculate snap position along a wall for doors
export const calculateDoorSnapPositionToWall = (door: Door, wall: Wall): Point => {
  const { start, end } = wall;
  
  // Get the point on the wall
  const wallPoint = getPointOnWall({
    x: door.position.x + door.width / 2,
    y: door.position.y + door.height / 2
  }, wall);
  
  // Calculate wall angle
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  // Door should be centered on the wall
  return {
    x: wallPoint.x - door.width / 2,
    y: wallPoint.y - door.height / 2
  };
};

// Calculate snap position along a wall for windows
export const calculateWindowSnapPositionToWall = (window: Window, wall: Wall): Point => {
  const { start, end } = wall;
  
  // Get the point on the wall
  const wallPoint = getPointOnWall({
    x: window.position.x + window.width / 2,
    y: window.position.y + window.height / 2
  }, wall);
  
  // Windows should be centered on the wall
  return {
    x: wallPoint.x - window.width / 2,
    y: wallPoint.y - window.height / 2
  };
};

// Find the closest point on a wall to another point
export const getPointOnWall = (point: Point, wall: Wall): Point => {
  const { start, end } = wall;
  
  // Vector from start to end
  const line = { x: end.x - start.x, y: end.y - start.y };
  
  // Vector from start to point
  const pointVec = { x: point.x - start.x, y: point.y - start.y };
  
  // Calculate the projection length
  const lineLength = line.x * line.x + line.y * line.y;
  const dotProduct = pointVec.x * line.x + pointVec.y * line.y;
  const t = Math.max(0, Math.min(1, dotProduct / lineLength));
  
  // Calculate the closest point on the line
  return {
    x: start.x + t * line.x,
    y: start.y + t * line.y
  };
};

// Calculate the cabinet rotation based on wall angle
export const calculateCabinetRotationFromWall = (wall: Wall): number => {
  // Calculate the wall angle in degrees
  const angle = calculateWallAngle(wall);
  
  // Convert angle to the nearest 90-degree rotation (0, 90, 180, 270)
  return Math.round(angle / 90) * 90;
};

// Calculate the door or window rotation based on wall angle
export const calculateWallItemRotation = (wall: Wall): number => {
  // Get the wall angle in degrees
  return calculateWallAngle(wall);
};

// Enhanced check for detecting if a point is inside a room
export const isPointInRoom = (point: Point, room: Room): boolean => {
  if (!room) return false;
  
  return (
    point.x >= 0 && 
    point.x <= room.width && 
    point.y >= 0 && 
    point.y <= room.length
  );
};

// Enhanced check for if an item can be placed on a wall
export const isOnWall = (
  item: { width: number; height: number; position: Point },
  wall: Wall,
  threshold: number
): boolean => {
  const itemCenter = {
    x: item.position.x + item.width / 2,
    y: item.position.y + item.height / 2
  };
  
  const distance = distancePointToWall(itemCenter, wall);
  return distance <= threshold;
};

// Calculate if a wall item (door/window) is properly placed on a wall
export const canPlaceWallItem = (
  item: { width: number; height: number; position: Point },
  wall: Wall,
  room: Room,
  threshold: number
): { canPlace: boolean; message?: string } => {
  // First check if it's on a wall
  if (!isOnWall(item, wall, threshold)) {
    return { canPlace: false, message: "Items must be placed directly on a wall." };
  }
  
  // Check if it's inside the room boundaries
  const corners = [
    item.position,
    { x: item.position.x + item.width, y: item.position.y },
    { x: item.position.x, y: item.position.y + item.height },
    { x: item.position.x + item.width, y: item.position.y + item.height }
  ];
  
  for (const corner of corners) {
    if (!isPointInRoom(corner, room)) {
      return { canPlace: false, message: "Items must be placed within room boundaries." };
    }
  }
  
  return { canPlace: true };
};

// Check if a cabinet can be placed at the given position
export const canPlaceCabinet = (cabinet: Cabinet, room: Room): boolean => {
  if (!room) return false;
  
  // Check if the cabinet is entirely within the room
  const topLeft = cabinet.position;
  const topRight = { x: cabinet.position.x + cabinet.width, y: cabinet.position.y };
  const bottomLeft = { x: cabinet.position.x, y: cabinet.position.y + cabinet.depth };
  const bottomRight = { x: cabinet.position.x + cabinet.width, y: cabinet.position.y + cabinet.depth };
  
  return (
    isPointInRoom(topLeft, room) &&
    isPointInRoom(topRight, room) &&
    isPointInRoom(bottomLeft, room) &&
    isPointInRoom(bottomRight, room)
  );
};

// Check if two cabinets collide
export const cabinetsCollide = (cabinet1: Cabinet, cabinet2: Cabinet): boolean => {
  // Simple AABB collision check
  return !(
    cabinet1.position.x + cabinet1.width < cabinet2.position.x ||
    cabinet1.position.x > cabinet2.position.x + cabinet2.width ||
    cabinet1.position.y + cabinet1.depth < cabinet2.position.y ||
    cabinet1.position.y > cabinet2.position.y + cabinet2.depth
  );
};

// Calculate position for a wall item (door/window) that ensures it's on the wall
export const calculateWallItemPlacement = (
  item: { width: number; height: number; position: Point },
  wall: Wall
): Point => {
  // Get point on wall
  const wallPoint = getPointOnWall(
    { x: item.position.x + item.width/2, y: item.position.y + item.height/2 }, 
    wall
  );
  
  return {
    x: wallPoint.x - item.width / 2,
    y: wallPoint.y - item.height / 2
  };
};
