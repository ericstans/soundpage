<template>
  <div class="player">
    <h3>{{ song }}</h3>
    <audio ref="audio" :src="`/mp3s/${song}`" @timeupdate="onTimeUpdate" @ended="onEnded" @play="onPlay" @pause="onPause"></audio>
    <button @click="togglePlay">{{ isPlaying ? 'Pause' : 'Play' }}</button>
    <Waveform :audio="audio" :progress="progress" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import Waveform from './Waveform.vue';

// Simple event bus for play control
const playerBus = window.__playerBus = window.__playerBus || new EventTarget();

const props = defineProps({ song: String });
const audio = ref(null);
const isPlaying = ref(false);
const progress = ref(0);

function togglePlay() {
  if (!audio.value) return;
  if (audio.value.paused) {
    // Tell all other players to pause
    playerBus.dispatchEvent(new CustomEvent('pauseAll', { detail: { except: props.song } }));
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

function handlePauseAll(e) {
  if (audio.value && !audio.value.paused && e.detail.except !== props.song) {
    audio.value.pause();
    audio.value.currentTime = 0;
    progress.value = 0;
    isPlaying.value = false;
  }
}

onMounted(() => {
  playerBus.addEventListener('pauseAll', handlePauseAll);
});
onBeforeUnmount(() => {
  playerBus.removeEventListener('pauseAll', handlePauseAll);
});

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
