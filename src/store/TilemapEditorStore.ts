import { defineStore } from 'pinia';

import type { TilemapEditorState, Tile, Cell, Coord } from './@types';

export const useTilemapEditorStore = defineStore('tilemapEditor', {
  state: (): TilemapEditorState => {
    return {
      currentTile: null,
      currentCell: null,
      workingDirectoryHandle: null,
      currentHoveredCoord: null,
    };
  },
  actions: {
    setCurrentTile(tile: Tile) {
      this.currentTile = tile;
    },
    setCurrentCell(cell: Cell) {
      this.currentCell = cell;
    },
    setTileInCurrentCell(tile: Tile) {
      if (this.currentCell == null) return;
      this.currentCell.tile = tile;
    },
    setWorkingDirectoryHandle(workingDirectoryHandle: FileSystemDirectoryHandle) {
      this.workingDirectoryHandle = workingDirectoryHandle;
    },
    setCurrentHoveredCoord(coord: Coord | null) {
      this.currentHoveredCoord = coord;
    },
  }
});
