<template>
  <div class="player-container">
    <img class="cover" :src="coverSrc" :alt="`${song} cover`" @error="handleImgError" />
    <div class="player">
    <div class="player-header">
      <button class="play-btn" @click="togglePlay" :aria-label="isPlaying ? 'Pause' : 'Play'">
        <span v-if="!isPlaying" class="icon">
          <svg width="18" height="18" viewBox="0 0 18 18"><polygon points="4,3 15,9 4,15" fill="#fff"/></svg>
        </span>
        <span v-else class="icon">
          <svg width="18" height="18" viewBox="0 0 18 18"><rect x="4" y="3" width="3" height="12" fill="#fff"/><rect x="11" y="3" width="3" height="12" fill="#fff"/></svg>
        </span>
      </button>
      <h3>{{ song }}</h3>
    </div>
  <audio ref="audio" :src="audioSrc" @timeupdate="onTimeUpdate" @ended="onEnded" @play="onPlay" @pause="onPause"></audio>
    <Waveform :audio="audio" :progress="progress" />
  </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import Waveform from './Waveform.vue';

// Simple event bus for play control
const playerBus = window.__playerBus = window.__playerBus || new EventTarget();

const props = defineProps({ song: String });
const coverSrc = ref(getCoverSrc(props.song));
const audioSrc = computed(() => import.meta.env.BASE_URL + 'mp3s/' + props.song);
function getCoverSrc(song) {
  // Remove extension and replace with .png
  const base = song.replace(/\.[^/.]+$/, '');
  return import.meta.env.BASE_URL + `images/${base}.png`;
}
function handleImgError(e) {
  e.target.src = import.meta.env.BASE_URL + 'images/default.png';
}
import { computed } from 'vue';
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
.player-container {
  display: flex;
  align-items: stretch;
  gap: 1.2em;
  margin: 1em 0;
  width: 100%;
  box-sizing: border-box;
}
.cover {
  height: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 8px;
  background: #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  align-self: stretch;
  min-width: 64px;
  max-width: 180px;
}
.player {
  flex: 1 1 0%;
  width: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}
.player-header {
  display: flex;
  align-items: center;
  gap: 0.75em;
}
.play-btn {
  width: 2.5em;
  height: 2.5em;
  border: none;
  border-radius: 50%;
  background: #ff8c00;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  margin-right: 0.5em;
}
.play-btn:hover {
  background: #ffa733;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
h3 {
  margin: 0;
  font-size: 1.1em;
  font-weight: 500;
  word-break: break-all;
}
</style>
