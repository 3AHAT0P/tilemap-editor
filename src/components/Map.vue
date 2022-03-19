<script setup lang="ts">
  import { PropType } from 'vue';

  import { useTilemapStore } from '@/store';
  import { Coord, Tile } from '@/store/@types';

  const props = defineProps({
    currentTile: Object as PropType<Tile | null>,
    currentHoveredCoord: String as PropType<Coord | null>,
  });
  
  const emit = defineEmits([
    'onActiveCellChange',
    'onHoveredCoordChange',
    'onTileDraw',
  ]);

  const tilemapStore = useTilemapStore();

  const selectActiveCell = (coord: Coord, tile: Tile | null) => {
    if (tile == null) return;
    emit('onActiveCellChange', { coord, tile })
  }

  const drawCurrentTileToMap = (coord: Coord) => {
    if (props.currentTile == null) return;
    const tileCopy = { ...props.currentTile };
    tilemapStore.update(coord, tileCopy);
    emit('onTileDraw', coord, tileCopy);
  }

  const setHover = (coord: Coord | null) => {
    if (props.currentTile == null) return;
    emit('onHoveredCoordChange', coord);
  }
</script>

<template>
  <div class="map-preview" @mouseleave="setHover(null)">
    <div
      v-for="(tile, coord) in tilemapStore.cells"
      :key="coord"
      class="map-cell"
      @click="drawCurrentTileToMap(coord)"
      @contextmenu.prevent="selectActiveCell(coord, tile)"
      @mouseover="setHover(coord)"
    >
      <img
        v-if="tile != null && props.currentHoveredCoord !== coord"
        :src="tile.sourcePath"
        :alt="coord"
        class="map-cell-image"
      />
      <div
        v-else
      ></div>
      <img
        v-if="props.currentTile != null && props.currentHoveredCoord === coord"
        :src="props.currentTile.sourcePath"
        :alt="coord"
        class="map-cell-image"
      />
    </div>
  </div>
</template>

<style scoped>
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

.map-cell {
  border: 1px solid grey;
  image-rendering: pixelated;
}

.map-cell-image {
  width: 100%;
  height: 100%;
}
</style>
