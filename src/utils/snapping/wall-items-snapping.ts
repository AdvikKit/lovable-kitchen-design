
import { Door, Window, Wall, Point } from './types';
import { getPointOnWall } from './wall-snapping';

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

// Calculate the door or window rotation based on wall angle
export const calculateWallItemRotation = (wall: Wall): number => {
  return Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x) * (180 / Math.PI);
};
