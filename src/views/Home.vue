<template>
  <div>
    <Player 
      v-for="(song, idx) in songs" 
      :key="song.file || song" 
      :song="song.file || song" 
      :waveform="song.waveform" 
      :index="idx" 
      @play-next="handlePlayNext"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Player from '../components/Player.vue';

const songs = ref([]);
onMounted(async () => {
  const res = await fetch(import.meta.env.BASE_URL + 'mp3s/index.json');
  const data = await res.json();
  // If index.json is an array of {file, waveform}, use as-is; else fallback to old format
  if (Array.isArray(data) && data.length && data[0].file && data[0].waveform) {
    songs.value = data;
  } else {
    // fallback: old format, just filenames
    songs.value = data.map(f => ({ file: f, waveform: null }));
  }
});

function handlePlayNext(currentIdx) {
  const nextIdx = currentIdx + 1;
  if (nextIdx < songs.value.length) {
    // Use the event bus to tell the next player to play
    const playerBus = window.__playerBus;
    if (playerBus) {
      playerBus.dispatchEvent(new CustomEvent('playSongAtIndex', { detail: nextIdx }));
    }
  }
}
</script>
