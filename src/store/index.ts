import { defineStore } from 'pinia';

export interface Tilemap {
  width: number;
  height: number;
  cells: Record<`${number}|${number}`, Tile | null>; // `x|y`, 3|4
}

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
    update(coord: `${number}|${number}`, tile: Tile) {
      this.cells[coord] = tile;
    }
  }
});

export interface Tile {
  sourceType: 'DATA_URL' | 'FS_URL';
  sourcePath: string;
  rawStringProperties: string;
}

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