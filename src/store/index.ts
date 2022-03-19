import { defineStore } from 'pinia';
import type { Cell, Coord, Tile, Tilemap, TilemapEditorState } from './@types';


export const useTilemapStore = defineStore('tilemap', {
  state: (): Tilemap => {
    return {
      width: 5,
      height: 5,
      cells: {
        '0|0': null,
        '0|1': null,
        '0|2': null,
        '0|3': null,
        '0|4': null,
        
        '1|0': null,
        '1|1': null,
        '1|2': null,
        '1|3': null,
        '1|4': null,

        '2|0': null,
        '2|1': null,
        '2|2': null,
        '2|3': null,
        '2|4': null,

        '3|0': null,
        '3|1': null,
        '3|2': null,
        '3|3': null,
        '3|4': null,

        '4|0': null,
        '4|1': null,
        '4|2': null,
        '4|3': null,
        '4|4': null,
      }
    };
  },
  actions: {
    update(coord: Coord, tile: Tile) {
      this.cells[coord] = tile;
    }
  }
});


export const useCurrentTileStore = defineStore('currentTile', {
  state: (): { current: Tile | null } => {
    return {
      current: null,
    };
  },
  actions: {
    update(tile: Tile) {
      this.current = tile;
    }
  }
});

export const useTilesStore = defineStore('tiles', {
  state: (): { list: Tile[] } => {
    return {
      list: [],
    };
  },
  actions: {
    addItem(items: Tile) {
      this.list.push(items);
    }
  }
});

