
import { Point, Wall, Cabinet, Door, Window } from '@/context/DesignContext';

export interface SnapResult {
  snapped: boolean;
  position: Point;
  rotation?: number;
  wallId?: string | null;
}

export type { Point, Wall, Cabinet, Door, Window };
