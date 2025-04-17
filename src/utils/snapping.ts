
import { Point, Wall, Cabinet, Room } from '../context/DesignContext';
import { calculateDistance, pixelsToMm } from './measurements';

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

// Calculate snap position along a wall
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
  
  const distance = distancePointToWall(cabinetCenter, wall);
  
  // Calculate offset from the wall (half of wall thickness + half of cabinet depth)
  const offset = (wall.thickness / 2) + (cabinet.depth / 2);
  
  // Calculate the snapped position
  const closestPoint = getPointOnWall(cabinetCenter, wall);
  
  return {
    x: closestPoint.x + wallNormal.x * offset - cabinet.width / 2,
    y: closestPoint.y + wallNormal.y * offset - cabinet.depth / 2
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
  const { start, end } = wall;
  
  // Calculate the wall angle in degrees
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  
  // Convert angle to the nearest 90-degree rotation (0, 90, 180, 270)
  return Math.round(angle / 90) * 90;
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
