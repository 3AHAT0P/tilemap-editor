<script setup lang="ts">
  import { useTilesStore } from '@/store';
  import { getBase64URL } from '@/utils/getBase64URL';
  import { getFilesRecursively } from '@/utils/getFilesRecursively';

  const tilesStore = useTilesStore();

  const emit = defineEmits(['onActiveTileChange', 'onWorkingDirectoryHandleChange']);

  const loadTiles = async () => {
    const directoryHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();

    emit('onWorkingDirectoryHandleChange', directoryHandle);
    const fileList: File[] = [];
    await getFilesRecursively(fileList, directoryHandle, { type: 'image/png' });

    fileList
      .forEach(async (file: File) => {
        tilesStore.addItem({
          sourceType: 'DATA_URL',
          sourcePath: await getBase64URL(file),
          rawStringProperties: '',
        });
      });
  }
</script>

<template>
  <div class="tile-selector">
    <div class="tile-list">
      <template v-for="tile in tilesStore.list" :key="tile.sourcePath">
        <img
          :src="tile.sourcePath"
          :alt="tile.sourcePath"
          class="map-cell"
          @click="emit('onActiveTileChange', tile)"
        />
      </template>
    </div>
    <div class="actions">
      <button type="button" class="load" @click="loadTiles">Load</button>
    </div>
  </div>
</template>

<style>
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
</style>
