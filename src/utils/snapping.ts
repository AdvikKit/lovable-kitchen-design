
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
  
  // Calculate distance from cabinet center to the wall
  const cabinetCenter = {
    x: cabinet.position.x + cabinet.width / 2,
    y: cabinet.position.y + cabinet.depth / 2
  };
  
  // Calculate offset from the wall (half of wall thickness + half of cabinet depth)
  const offset = (wall.thickness / 2) + (cabinet.depth / 2);
  
  // Calculate the snapped position
  const closestPoint = getPointOnWall(cabinetCenter, wall);
  
  return {
    x: closestPoint.x + wallNormal.x * offset - cabinet.width / 2,
    y: closestPoint.y + wallNormal.y * offset - cabinet.depth / 2
  };
};

// Calculate snap position along a wall for doors
export const calculateDoorSnapPositionToWall = (door: Door, wall: Wall): Point => {
  const { start, end } = wall;
  
  // Calculate the wall angle
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  // Get the wall length
  const wallLength = calculateDistance(start, end);
  
  // Place door midway along the wall if it fits
  const doorPosition = {
    x: start.x + (end.x - start.x) * 0.5 - door.width / 2,
    y: start.y + (end.y - start.y) * 0.5 - door.height / 2,
  };
  
  // Ensure door fits on the wall
  if (door.width > wallLength) {
    // If it doesn't fit, place at the start
    doorPosition.x = start.x;
    doorPosition.y = start.y;
  }
  
  return doorPosition;
};

// Calculate snap position along a wall for windows
export const calculateWindowSnapPositionToWall = (window: Window, wall: Wall): Point => {
  const { start, end } = wall;
  
  // Calculate the wall angle
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  
  // Get the wall length
  const wallLength = calculateDistance(start, end);
  
  // Place window midway along the wall if it fits
  const windowPosition = {
    x: start.x + (end.x - start.x) * 0.5 - window.width / 2,
    y: start.y + (end.y - start.y) * 0.5 - window.height / 2,
  };
  
  // Ensure window fits on the wall
  if (window.width > wallLength) {
    // If it doesn't fit, adjust to fit
    windowPosition.x = start.x;
    windowPosition.y = start.y;
  }
  
  return windowPosition;
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

// Check if a point is inside the room boundaries
export const isPointInRoom = (point: Point, room: Room): boolean => {
  if (!room) return false;
  
  return (
    point.x >= 0 && 
    point.x <= room.width && 
    point.y >= 0 && 
    point.y <= room.length
  );
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
