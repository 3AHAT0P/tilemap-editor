<script setup lang="ts">
  import { PropType } from 'vue';

  import { Cell } from '@/store/@types';

  const props = defineProps({
    current: Object as PropType<Cell | null>,
  });

</script>

<template>
  <div class="current-cell">
    <img
      v-if="props.current != null"
      :src="props.current.tile.sourcePath"
      alt="current cell tile preview"
      class="tile-preview"
    >
    <textarea
      v-if="props.current != null"
      v-model="props.current.tile.rawStringProperties"
      class="tile-properties"
    >

    </textarea>
  </div>
</template>

<style>
.current-cell {
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
