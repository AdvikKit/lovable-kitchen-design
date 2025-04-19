
import { Cabinet, Point, SnapResult } from './types';

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
  
  if (!cabinets || cabinets.length === 0) return null;
  
  for (const otherCabinet of cabinets) {
    if (otherCabinet.id === (excludeId || cabinet.id)) continue;
    
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
export const calculateCabinetSnapPosition = (
  cabinet: Cabinet,
  nearestCabinet: Cabinet,
  edge: 'left' | 'right' | 'top' | 'bottom'
): SnapResult => {
  let position = { ...cabinet.position };
  
  switch (edge) {
    case 'left':
      position.x = nearestCabinet.position.x + nearestCabinet.width;
      break;
    case 'right':
      position.x = nearestCabinet.position.x - cabinet.width;
      break;
    case 'top':
      position.y = nearestCabinet.position.y + nearestCabinet.depth;
      break;
    case 'bottom':
      position.y = nearestCabinet.position.y - cabinet.depth;
      break;
  }
  
  return {
    snapped: true,
    position,
    rotation: 0,
    wallId: null
  };
};
