<template>
  <div class="player">
    <h3>{{ song }}</h3>
    <audio ref="audio" :src="`/mp3s/${song}`" @timeupdate="onTimeUpdate" @ended="onEnded" @play="onPlay" @pause="onPause"></audio>
    <button @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</button>
    <Waveform :audio="audio" :progress="progress" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Waveform from './Waveform.vue';

const props = defineProps({ song: String });
const audio = ref(null);
const isPlaying = ref(false);
const progress = ref(0);

function togglePlay() {
  if (!audio.value) return;
  if (audio.value.paused) {
    audio.value.play();
  } else {
    audio.value.pause();
  }
}

function onTimeUpdate() {
  if (!audio.value) return;
  progress.value = audio.value.currentTime / audio.value.duration;
}

function onEnded() {
  isPlaying.value = false;
  progress.value = 0;
}

function onPlay() {
  isPlaying.value = true;
}

function onPause() {
  isPlaying.value = false;
}

watch(() => props.song, () => {
  if (audio.value) {
    audio.value.pause();
    audio.value.currentTime = 0;
    progress.value = 0;
    isPlaying.value = false;
  }
});
</script>

<style scoped>
.player { margin: 1em 0; }
</style>
