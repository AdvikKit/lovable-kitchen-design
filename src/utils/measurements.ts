
import { Point, Wall, Room } from '../context/DesignContext';

// Convert millimeters to pixels for rendering
export const mmToPixels = (mm: number, zoom: number = 1): number => {
  // 1mm = 2 pixels at default zoom
  return mm * 2 * zoom;
};

// Convert pixels to millimeters for calculations
export const pixelsToMm = (pixels: number, zoom: number = 1): number => {
  return pixels / (2 * zoom);
};

// Calculate distance between two points
export const calculateDistance = (point1: Point, point2: Point): number => {
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

// Snap value to grid
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// Calculate midpoint between two points
export const calculateMidpoint = (point1: Point, point2: Point): Point => {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Format millimeters to display string (e.g., "1200mm" or "1.2m")
export const formatMm = (mm: number, useMeters: boolean = false): string => {
  if (useMeters && mm >= 1000) {
    return `${(mm / 1000).toFixed(1)}m`;
  }
  return `${Math.round(mm)}mm`;
};

// Create default room walls based on width and length
export const createDefaultRoom = (width: number, length: number, height: number): Room => {
  const wallThickness = 100; // 100mm wall thickness
  
  const walls = [
    // Wall A (top)
    {
      id: generateId(),
      label: 'A',
      start: { x: 0, y: 0 },
      end: { x: width, y: 0 },
      thickness: wallThickness,
    },
    // Wall B (right)
    {
      id: generateId(),
      label: 'B',
      start: { x: width, y: 0 },
      end: { x: width, y: length },
      thickness: wallThickness,
    },
    // Wall C (bottom)
    {
      id: generateId(),
      label: 'C',
      start: { x: width, y: length },
      end: { x: 0, y: length },
      thickness: wallThickness,
    },
    // Wall D (left)
    {
      id: generateId(),
      label: 'D',
      start: { x: 0, y: length },
      end: { x: 0, y: 0 },
      thickness: wallThickness,
    },
  ];

  return {
    width,
    length,
    height,
    walls,
    cabinets: []
  };
};

// Calculate wall angle in degrees
export const calculateWallAngle = (wall: Wall): number => {
  return Math.atan2(
    wall.end.y - wall.start.y,
    wall.end.x - wall.start.x
  ) * (180 / Math.PI);
};

// Calculate wall length
export const calculateWallLength = (wall: Wall): number => {
  return calculateDistance(wall.start, wall.end);
};

// Check if a point is near a wall
export const isPointNearWall = (point: Point, wall: Wall, threshold: number): boolean => {
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
  const distance = calculateDistance(point, closestPoint);
  
  return distance <= threshold;
};
