<template>
  <canvas ref="canvas" width="600" height="100"></canvas>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getWaveformData } from '../utils/waveform';

const props = defineProps({
  audio: Object,
  progress: Number
});

const canvas = ref(null);
const waveform = ref([]);

watch(() => props.audio, async (audio) => {
  if (audio && audio.src) {
    waveform.value = await getWaveformData(audio.src);
    drawWaveform();
  }
});

watch(() => props.progress, () => {
  drawWaveform();
});

function drawWaveform() {
  const ctx = canvas.value.getContext('2d');
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Draw stepped (bar) waveform and fill up to progress
  ctx.strokeStyle = '#888';
  const gap = 1;
  const barWidth = canvas.value.width / waveform.value.length - gap;
  const progressBar = props.progress * canvas.value.width;
  // Create a gradient for the progress fill
  const grad = ctx.createLinearGradient(0, 0, canvas.value.width, 0);
  grad.addColorStop(0, 'rgba(255, 140, 0, 0.7)');
  grad.addColorStop(1, 'rgba(255, 140, 0, 0.1)');
  for (let i = 0; i < waveform.value.length; i++) {
    const x = i * (barWidth + gap);
  const y = (1 - waveform.value[i]) * (canvas.value.height / 2);
  // Reflection is only 20% of the height, with a visible gap below center
  const reflectionHeight = canvas.value.height * 0.2;
  const reflectionGap = 3; // px gap between main and reflection
  const reflectionBase = canvas.value.height / 2 + reflectionGap;
  const yMirror = reflectionBase + (waveform.value[i]) * reflectionHeight;
    // Top bar
    ctx.beginPath();
    ctx.moveTo(x, canvas.value.height / 2);
    ctx.lineTo(x, y);
    ctx.lineTo(x + barWidth, y);
    ctx.lineTo(x + barWidth, canvas.value.height / 2);
    ctx.closePath();
    ctx.stroke();
    if (x < progressBar) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, canvas.value.height / 2);
      ctx.lineTo(x, y);
      ctx.lineTo(x + barWidth, y);
      ctx.lineTo(x + barWidth, canvas.value.height / 2);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, Math.min(barWidth, progressBar - x), canvas.value.height / 2);
      ctx.restore();
    }
    // Bottom (mirrored) bar (reflection)
    ctx.save();
    ctx.strokeStyle = '#444'; // much darker stroke
    ctx.beginPath();
    ctx.moveTo(x, reflectionBase);
    ctx.lineTo(x, yMirror);
    ctx.lineTo(x + barWidth, yMirror);
    ctx.lineTo(x + barWidth, reflectionBase);
    ctx.closePath();
    ctx.stroke();
    if (x < progressBar) {
      ctx.beginPath();
      ctx.moveTo(x, reflectionBase);
      ctx.lineTo(x, yMirror);
      ctx.lineTo(x + barWidth, yMirror);
      ctx.lineTo(x + barWidth, reflectionBase);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = 'rgba(30,30,30,0.85)'; // much darker fill
      ctx.fillRect(x, reflectionBase, Math.min(barWidth, progressBar - x), reflectionHeight);
    }
    ctx.restore();
  }
}
</script>

<style scoped>
canvas { width: 100%; height: 100px; }
</style>
