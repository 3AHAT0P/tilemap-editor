<script setup lang="ts">
  import { ref } from 'vue';

  import { useTilemapStore } from '@/store';
  import { Coord, Tile, Tilemap } from '@/store/@types';
  import { useTilemapEditorStore } from '@/store/TilemapEditorStore';

  import Map from './Map.vue';
  import TileList from './TileList.vue';
  import CurrentTile from './CurrentTile.vue';
  import CurrentCell from './CurrentCell.vue';

  const tilemapStore = useTilemapStore();
  const tilemapEditorStore = useTilemapEditorStore();

  const workingDirectoryHandle = ref<FileSystemDirectoryHandle | null>(null);

  const updateCurrentCell = (coord: Coord, tile: Tile) => {
    if (coord === tilemapEditorStore.currentCell?.coord) tilemapEditorStore.setTileInCurrentCell(tile);
  }

  const loadTilemap = async () => {
    const fileHandle: FileSystemFileHandle = (await window.showOpenFilePicker())[0];
    const tilemapFile: File = await fileHandle.getFile();
    const tilemap = JSON.parse(await tilemapFile.text());

    tilemapStore.width = tilemap.width;
    tilemapStore.height = tilemap.height;
    tilemapStore.cells = {};
    for (const [coord, tileInfo] of Object.entries(tilemap.cells) as [`${number}|${number}`, any][]) {
      if (tileInfo === null) {
        tilemapStore.cells[coord] = null;
        continue;
      }
      const tile = {
        sourceType: tileInfo.sourceType,
        sourcePath: tileInfo.sourcePath,
        rawStringProperties: '',
      };
      for (const [key, value] of Object.entries(tileInfo)) {
        if (key === 'sourceType' || key === 'sourcePath') continue;
        if (Array.isArray(value)) tile.rawStringProperties += `${key}:array:${JSON.stringify(value).replaceAll('"', '')}\n`;
        else if (typeof value === 'boolean') tile.rawStringProperties += `${key}:boolean:${value}\n`;
        else if (typeof value === 'number') tile.rawStringProperties += `${key}:number:${value}\n`;
        else if (typeof value === 'string') tile.rawStringProperties += `${key}:string:${value}\n`;
      }
      tilemapStore.cells[coord] = tile;
    }
  }

  const saveTilemap = async () => {
    const tilemap: Tilemap & { cells: Record<`${number}|${number}`, any>} = {
      width: tilemapStore.width,
      height: tilemapStore.height,
      cells: {},
    };

    for (const [coord, tile] of Object.entries(tilemapStore.cells) as [`${number}|${number}`, Tile][]) {
      if (tile === null) {
        tilemap.cells[coord] = null;
        continue;
      }
      const tileInfo: any = {};
      tileInfo.sourceType = tile.sourceType;
      tileInfo.sourcePath = tile.sourcePath;
      if (tile.rawStringProperties !== '') {
        tile.rawStringProperties
          .trim()
          .split('\n')
          .forEach((line: string) => {
            const [key, type, value] = line.split(':').map((str) => str.trim());
            if (key === '') return;
            if (value == null) {
              tileInfo[key] = true;
            } else if (type === 'boolean') {
              tileInfo[key] = value === 'true';
            } else if (type === 'number') {
              tileInfo[key] = Number(value);
            } else if (type === 'string') {
              tileInfo[key] = value;
            } else if (type === 'array') {
              tileInfo[key] = JSON.parse(value);
            } else {
              throw new Error('Parse error!');
            }
          });
      }
      tilemap.cells[coord] = tileInfo;
    }

    if (tilemapEditorStore.workingDirectoryHandle == null) return;
    const fileHandle = await tilemapEditorStore.workingDirectoryHandle.getFileHandle('tilemap.json', { create: true })
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(tilemap));
    await writable.close();
  }

</script>

<template>
  <div class="editor">
    <div class="header">
      <div class="actions">
        <button type="button" class="button" @click="loadTilemap">Load tilemap</button>
        <button type="button" class="button" @click="saveTilemap">Save tilemap</button>
      </div>
    </div>
    <Map
      class="map-preview"
      :currentTile="tilemapEditorStore.currentTile"
      :currentHoveredCoord="tilemapEditorStore.currentHoveredCoord"
      @onActiveCellChange="(cell) => tilemapEditorStore.setCurrentCell(cell)"
      @onHoveredCoordChange="(coord) => tilemapEditorStore.setCurrentHoveredCoord(coord)"
      @onTileDraw="(coord, tile) => updateCurrentCell(coord, tile)"
    />
    <CurrentTile class="current-tile" :current="tilemapEditorStore.currentTile" />
    <CurrentCell class="current-cell" :current="tilemapEditorStore.currentCell" />
    <TileList
      class="tile-selector"
      @onActiveTileChange="(tile) => tilemapEditorStore.setCurrentTile(tile)"
      @onWorkingDirectoryHandleChange="(directoryHandle) => tilemapEditorStore.setWorkingDirectoryHandle(directoryHandle)"
    />
  </div>
</template>

<style scoped>
.editor {
  width: 100%;
  height: 100%;
  
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 48px repeat(5, 1fr);
  grid-template-areas: "header header header header"
                       "map map map tile"
                       "map map map tile"
                       "map map map cell"
                       "map map map cell"
                       "selector selector selector selector";
  background-image: url("/assets/background.jpg");
  background-size: 500px;
}

.header {
  grid-area: header;
}

.map-preview {
  grid-area: map;
  display: grid;
  grid-template-columns: repeat(v-bind('tilemapStore.width'), 64px);
  grid-template-rows: repeat(v-bind('tilemapStore.height'), 64px);
  border: 1px solid green;
  overflow: auto;
  place-items: stretch;
  background-image: url("/assets/preview-background.jpg");
  background-size: 300px;
}

.current-tile {
  grid-area: tile;
  border: 1px solid blue;
}

.current-cell {
  grid-area: cell;
  border: 1px solid blue;
}

.tile-selector {
  grid-area: selector;
  border: 1px solid red;
}

.map-cell {
  border: 1px solid grey;
  image-rendering: pixelated;
}

.map-cell-image {
  width: 100%;
  height: 100%;
}

.tile-preview {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
  place-self: center;
}

</style>
