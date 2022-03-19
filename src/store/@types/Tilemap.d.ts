import { Coord } from './Coord';
import { Tile } from './Tile';

export interface Tilemap {
  width: number;
  height: number;
  cells: Record<Coord, Tile | null>; // `x|y`, 3|4
}