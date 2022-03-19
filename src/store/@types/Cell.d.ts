import { Coord } from './Coord';
import { Tile } from './Tile';

export interface Cell {
  coord: Coord;
  tile: Tile;
}