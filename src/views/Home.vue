<template>
  <div>
    <Player v-for="song in songs" :key="song" :song="song" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Player from '../components/Player.vue';

const songs = ref([]);
onMounted(async () => {
  const res = await fetch('/mp3s/index.json');
  songs.value = await res.json();
});
</script>
