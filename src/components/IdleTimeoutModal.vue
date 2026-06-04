<template>
  <Teleport to="body">
    <div v-if="show" class="idle-overlay">
      <div class="idle-modal">
        <div class="idle-icon">&#9201;</div>
        <h3 class="idle-title">Sesi Akan Berakhir</h3>
        <template v-if="secondsLeft > 0">
          <p class="idle-desc">Anda tidak aktif. Sesi akan berakhir dalam</p>
          <div class="idle-countdown">{{ formattedTime }}</div>
          <p class="idle-desc-small">Klik <strong>Tetap Login</strong> untuk melanjutkan sesi.</p>
        </template>
        <template v-else>
          <p class="idle-desc">Anda telah tidak aktif lebih dari <strong>3 jam</strong>.</p>
          <p class="idle-desc-small">Klik <strong>Tetap Login</strong> untuk melanjutkan, atau logout jika Anda selesai.</p>
        </template>
        <div class="idle-actions">
          <button class="idle-btn-stay" @click="$emit('stay')">Tetap Login</button>
          <button class="idle-btn-logout" @click="$emit('logout')">Logout Sekarang</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  secondsLeft: { type: Number, required: true },
})

defineEmits(['stay', 'logout'])

const formattedTime = computed(() => {
  const m = Math.floor(props.secondsLeft / 60)
  const s = props.secondsLeft % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
</script>

<style scoped>
.idle-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.idle-modal {
  background: #fff;
  border-radius: 12px;
  padding: 36px 40px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.idle-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.idle-title {
  font-size: 20px;
  font-weight: 700;
  color: #c0392b;
  margin: 0 0 10px;
}

.idle-desc {
  font-size: 14px;
  color: #555;
  margin: 0 0 8px;
}

.idle-countdown {
  font-size: 48px;
  font-weight: 800;
  color: #c0392b;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  margin: 8px 0 12px;
}

.idle-desc-small {
  font-size: 13px;
  color: #777;
  margin: 0 0 24px;
}

.idle-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.idle-btn-stay {
  background: #2980b9;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.idle-btn-stay:hover {
  background: #1a6fa0;
}

.idle-btn-logout {
  background: transparent;
  color: #c0392b;
  border: 1px solid #c0392b;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.idle-btn-logout:hover {
  background: #c0392b;
  color: #fff;
}
</style>
