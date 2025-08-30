<template>
  <canvas ref="canvas" width="600" height="100" @click="handleCanvasClick"></canvas>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getWaveformData } from '../utils/waveform';


const props = defineProps({
  audio: Object,
  progress: Number,
  waveform: Array,
  onCanvasClick: Function
});
function handleCanvasClick(event) {
  if (!props.onCanvasClick) return;
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percent = x / rect.width;
  props.onCanvasClick(percent);
}

const canvas = ref(null);
const waveform = ref(props.waveform || []);

watch(() => props.audio, async (audio) => {
  if (props.waveform && props.waveform.length) {
    waveform.value = props.waveform;
    drawWaveform();
  } else if (audio && audio.src) {
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

  // Layout constants
  const gap = 1;
  const barWidth = canvas.value.width / waveform.value.length - gap;
  const progressBar = props.progress * canvas.value.width;
  const grad = ctx.createLinearGradient(0, 0, canvas.value.width, 0);
  grad.addColorStop(0, 'rgba(255, 140, 0, 0.7)');
  grad.addColorStop(1, 'rgba(255, 140, 0, 0.1)');

  // Heights
  const mainHeight = canvas.value.height * 0.5; // main waveform height
  const reflectionHeight = canvas.value.height * 0.2; // reflection height
  const reflectionGap = 3; // px gap between main and reflection
  const totalGroupHeight = mainHeight + reflectionGap + reflectionHeight;
  // Center the group vertically
  const groupTop = (canvas.value.height - totalGroupHeight) / 2;
  const mainBase = groupTop + mainHeight;
  const reflectionBase = mainBase + reflectionGap;

  for (let i = 0; i < waveform.value.length; i++) {
    const x = i * (barWidth + gap);
    // Top waveform
    const y = mainBase - waveform.value[i] * mainHeight;
    // Reflection
    const yMirror = reflectionBase + waveform.value[i] * reflectionHeight;

    // Top bar
    ctx.beginPath();
    ctx.moveTo(x, mainBase);
    ctx.lineTo(x, y);
    ctx.lineTo(x + barWidth, y);
    ctx.lineTo(x + barWidth, mainBase);
    ctx.closePath();
    ctx.strokeStyle = '#888';
    ctx.stroke();
    if (x < progressBar) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, mainBase);
      ctx.lineTo(x, y);
      ctx.lineTo(x + barWidth, y);
      ctx.lineTo(x + barWidth, mainBase);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = grad;
      ctx.fillRect(x, groupTop, Math.min(barWidth, progressBar - x), mainHeight);
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
