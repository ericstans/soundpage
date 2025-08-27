<template>
  <div>
    <SongList @select-song="selectSong" />
    <Player v-if="currentSong" :song="currentSong" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SongList from '../components/SongList.vue';
import Player from '../components/Player.vue';

const currentSong = ref(null);
function selectSong(song) {
  currentSong.value = song;
}
</script>
