
import { Point, Room, Wall } from './types';
import { distancePointToWall } from './wall-snapping';

// Check if a point is inside a room
export const isPointInRoom = (point: Point, room: Room): boolean => {
  if (!room) return false;
  
  return (
    point.x >= 0 && 
    point.x <= room.width && 
    point.y >= 0 && 
    point.y <= room.length
  );
};

// Check if an item is properly placed on a wall
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
