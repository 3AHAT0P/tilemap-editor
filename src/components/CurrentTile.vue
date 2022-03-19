<script setup lang="ts">
  import { PropType } from 'vue';

  import { Tile } from '@/store/@types';

  const props = defineProps({
    current: Object as PropType<Tile | null>,
  });

</script>

<template>
  <div class="current-tile">
    <img
      v-if="props.current != null"
      :src="props.current.sourcePath"
      alt="tile-preview"
      class="tile-preview"
    >
    <textarea
      v-if="props.current != null"
      v-model="props.current.rawStringProperties"
      class="tile-properties"
    >

    </textarea>
  </div>
</template>

<style>
.current-tile {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 128px 1fr;
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
