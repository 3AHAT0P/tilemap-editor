import { Tile } from './Tile';
import { Cell } from './Cell';
import { Coord } from './Coord';

export interface TilemapEditorState {
  currentTile: Tile | null;
  currentCell: Cell | null;
  workingDirectoryHandle: FileSystemDirectoryHandle | null;
  currentHoveredCoord: Coord | null;
}