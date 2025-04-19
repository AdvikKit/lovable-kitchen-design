
import { Point, Wall, SnapResult } from './types';
import { calculateDistance } from '../measurements';

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
export const calculateWallSnapPosition = (item: { 
  width: number; 
  depth: number; 
  position: Point 
}, wall: Wall): SnapResult => {
  // Calculate the wall angle
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  
  // Calculate the wall's perpendicular direction (wall normal)
  const wallNormal = {
    x: Math.sin(angle),
    y: -Math.cos(angle)
  };
  
  // Project the item center onto the wall line
  const closestPoint = getPointOnWall({
    x: item.position.x + item.width / 2,
    y: item.position.y + item.depth / 2
  }, wall);
  
  // Calculate offset from the wall (half of wall thickness + half of item depth)
  const offset = (wall.thickness / 2) + (item.depth / 2);
  
  return {
    snapped: true,
    position: {
      x: closestPoint.x + wallNormal.x * offset - item.width / 2,
      y: closestPoint.y + wallNormal.y * offset - item.depth / 2
    },
    rotation: Math.round(angle * (180 / Math.PI) / 90) * 90,
    wallId: wall.id
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
