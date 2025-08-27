<template>
  <div>
    <Player 
      v-for="(song, idx) in songs" 
      :key="song" 
      :song="song" 
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
  songs.value = await res.json();
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
