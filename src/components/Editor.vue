<script setup lang="ts">
  import { Tile, Tilemap, useCurrentTileStore, useTilemapStore, useTilesStore } from '@/store';
  import { ref } from 'vue';

  interface Cell {
    coord: `${number}|${number}`;
    tile: Tile;
  }

  const tilemapStore = useTilemapStore();
  const tilesStore = useTilesStore();
  const currentTileStore = useCurrentTileStore();

  const currentCell = ref<Cell | null>(null);
  const workingDirectoryHandle = ref<FileSystemDirectoryHandle | null>(null);

  const selectActiveTile = (tile: Tile) => {
    currentTileStore.update(tile);
  }

  const selectActiveCell = (coord: `${number}|${number}`, tile: Tile | null) => {
    if (tile == null) return;
    currentCell.value = { coord, tile };
  }

  const drawCurrentTileToMap = (coord: `${number}|${number}`) => {
    if (currentTileStore.current == null) return;
    const tileCopy = { ...currentTileStore.current };
    tilemapStore.update(coord, tileCopy);
    if (coord === currentCell.value?.coord) currentCell.value.tile = tileCopy;
  }

  const getBase64URL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadTiles = async () => {
    const directoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();

    workingDirectoryHandle.value = directoryHandle;
    const fileList: File[] = [];
    await getFilesRecursively(fileList, directoryHandle);

    fileList
      .forEach(async (file: File) => {
        tilesStore.addItem({
          sourceType: 'DATA_URL',
          sourcePath: await getBase64URL(file),
          rawStringProperties: '',
        });
      });
  }

  const getFilesRecursively = async (
    accumulator: File[],
    entry: FileSystemFileHandle | FileSystemDirectoryHandle,
  ) => {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      if (file !== null) accumulator.push(file);

    } else if (entry.kind === 'directory') {
      for await (const handle of entry.values()) {
        await getFilesRecursively(accumulator, handle);
      }
    }
  }

  const currentHoveredCoord = ref<`${number}|${number}` | null>(null);
  const setHover = (coords: `${number}|${number}`) => {
    if (currentTileStore.current == null) return;
    currentHoveredCoord.value = coords;
  }

  const loadTilemap = async () => {
    const fileHandle: FileSystemFileHandle = (await window.showOpenFilePicker())[0];
    const tilemapFile: File = await fileHandle.getFile();
    const tilemap = JSON.parse(await tilemapFile.text());
    console.log(tilemap);
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
          .split('\n')
          .forEach((line: string) => {
            const [key, type, value] = line.split(':');
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

    if (workingDirectoryHandle.value == null) return;
    const fileHandle = await workingDirectoryHandle.value.getFileHandle('tilemap.json', { create: true })
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
    <div class="map-preview" @mouseleave="currentHoveredCoord = null">
      <div
        v-for="(cell, coord) in tilemapStore.cells"
        :key="coord"
        class="map-cell"
        @click="drawCurrentTileToMap(coord)"
        @contextmenu.prevent="selectActiveCell(coord, cell)"
        @mouseover="setHover(coord)"
      >
        <img
          v-if="cell != null && currentHoveredCoord !== coord"
          :src="cell.sourcePath"
          :alt="coord"
          class="map-cell-image"
        />
        <div
          v-else
        ></div>
        <img
          v-if="currentTileStore.current != null && currentHoveredCoord === coord"
          :src="currentTileStore.current.sourcePath"
          :alt="coord"
          class="map-cell-image"
        />
      </div>
    </div>
    <div class="tile">
      <img
        v-if="currentTileStore.current !== null"
        :src="currentTileStore.current.sourcePath"
        alt="tile-preview"
        class="tile-preview"
      >
      <textarea
        v-if="currentTileStore.current !== null"
        v-model="currentTileStore.current.rawStringProperties"
        class="tile-properties"
      >

      </textarea>
    </div>
    <div class="current-cell">
      <img
        v-if="currentCell !== null"
        :src="currentCell.tile.sourcePath"
        alt="123"
        class="tile-preview"
      >
      <textarea
        v-if="currentCell !== null"
        v-model="currentCell.tile.rawStringProperties"
        class="tile-properties"
      >

      </textarea>
    </div>
    <div class="tile-selector">
      <div class="tile-list">
        <template v-for="tile in tilesStore.list" :key="tile.sourcePath">
          <img
            :src="tile.sourcePath"
            :alt="tile.sourcePath"
            class="map-cell"
            @click="selectActiveTile(tile)"
          />
        </template>
      </div>
      <div class="actions">
        <button type="button" class="load" @click="loadTiles">Load</button>
      </div>
    </div>
  </div>
</template>

<style>
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

.tile {
  grid-area: tile;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 128px 1fr;
  border: 1px solid blue;
}

.current-cell {
  grid-area: cell;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 128px 1fr;
  border: 1px solid blue;
}

.tile-selector {
  grid-area: selector;
  display: grid;
  grid-template-columns: 1fr 64px;
  grid-template-rows: 1fr;
  place-items: stretch;
  border: 1px solid red;
}

.tile-list {
  display: grid;
  grid-template-rows: repeat(4, 64px);
  grid-auto-columns: 64px;
  grid-auto-flow: dense column;
  place-items: stretch;
  overflow: auto;
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

.tile-properties {
  resize: none;
}

</style>
