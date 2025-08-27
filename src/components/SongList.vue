<template>
  <div class="song-list">
    <h2>Songs</h2>
    <ul>
      <li v-for="song in songs" :key="song">
        <button @click="selectSong(song)">{{ song }}</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const emit = defineEmits(['select-song']);
const songs = ref([]);

onMounted(async () => {
  const res = await fetch('/mp3s/index.json');
  songs.value = await res.json();
});

function selectSong(song) {
  emit('select-song', song);
}
</script>
