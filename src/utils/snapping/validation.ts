import { Point, Room, Cabinet } from './types';

// Check if a point is inside the room boundaries
export const isPointInRoom = (point: Point, room: Room): boolean => {
  return point.x >= 0 && point.x <= room.width && point.y >= 0 && point.y <= room.length;
};
