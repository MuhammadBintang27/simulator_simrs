<template>
  <aside class="rme-timeline-panel no-print">
    <div class="rtp-header">
      <span class="rtp-title">Perjalanan Perawatan</span>
    </div>

    <div class="rtp-body">
      <!-- Durasi -->
      <div v-if="duration" class="rtp-duration">
        <span class="rtp-dur-icon">⏱</span>
        <span class="rtp-dur-text">{{ duration }}</span>
      </div>

      <!-- Timeline events -->
      <div class="rtp-list">
        <div v-for="(ev, idx) in events" :key="ev.key" class="rtp-item">
          <!-- Dot + connector -->
          <div class="rtp-line-col">
            <div v-if="idx > 0" class="rtp-connector-top"></div>
            <div class="rtp-dot" :style="{ background: ev.color }"></div>
            <div v-if="idx < events.length - 1" class="rtp-connector-bot"></div>
          </div>

          <!-- Content -->
          <div class="rtp-content">
            <div class="rtp-ev-label">{{ ev.label }}</div>
            <div v-if="ev.datetime" class="rtp-ev-time">{{ ev.datetime }}</div>
            <div v-if="ev.meta" class="rtp-ev-meta">{{ ev.meta }}</div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="events.length === 0" class="rtp-empty">
          <span class="rtp-loading-dot"></span>
          <span>Memuat...</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  events: { type: Array, default: () => [] },
  duration: { type: String, default: '' },
})
</script>

<style scoped>
.rme-timeline-panel {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 160px;
  background: linear-gradient(135deg, #2d1b69 0%, #09504a 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  z-index: 900;
  overflow: hidden;
}

/* Header */
.rtp-header {
  padding: 8px 10px 7px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
.rtp-title {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

/* Body */
.rtp-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}
.rtp-body::-webkit-scrollbar {
  width: 3px;
}
.rtp-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

/* Durasi */
.rtp-duration {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 10px 10px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.08);
  border-left: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
.rtp-dur-icon {
  font-size: 11px;
}
.rtp-dur-text {
  font-size: 9.5px;
  font-weight: 600;
  color: rgba(220, 235, 255, 0.85);
  line-height: 1.3;
}

/* Timeline list */
.rtp-list {
  padding: 0 10px 0 8px;
  display: flex;
  flex-direction: column;
}

/* Item row */
.rtp-item {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

/* Dot + connector column */
.rtp-line-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 10px;
}
.rtp-connector-top {
  width: 1.5px;
  flex: 0 0 6px;
  background: rgba(255, 255, 255, 0.18);
}
.rtp-connector-bot {
  width: 1.5px;
  flex: 1;
  min-height: 8px;
  background: rgba(255, 255, 255, 0.18);
}
.rtp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.2),
    0 0 5px rgba(0, 0, 0, 0.25);
}

/* Content */
.rtp-content {
  padding: 1px 0 10px;
  flex: 1;
  min-width: 0;
}
.rtp-ev-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(225, 235, 255, 0.9);
  line-height: 1.3;
}
.rtp-ev-time {
  font-size: 9px;
  color: rgba(170, 190, 230, 0.7);
  margin-top: 2px;
  line-height: 1.3;
}
.rtp-ev-meta {
  font-size: 8.5px;
  color: rgba(140, 165, 210, 0.55);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Empty */
.rtp-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.35);
  padding: 8px 0;
}
.rtp-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
