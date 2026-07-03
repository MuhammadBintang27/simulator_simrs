<template>
  <Dialog
    v-model:visible="localVisible"
    :header="false"
    modal
    :closable="true"
    :style="{ width: '420px', maxWidth: '95vw' }"
    :pt="{ header: { style: 'display:none' }, content: { style: 'padding:0; border-radius: inherit' } }"
    @hide="emit('close')"
  >
    <div class="rad-wrap">
      <!-- ── Header ── -->
      <div class="rad-head">
        <div class="rad-head-icon">
          <i class="fas fa-prescription-bottle-alt" />
        </div>
        <div class="rad-head-info">
          <div class="rad-head-title">{{ resep?.NAMA || '—' }}</div>
          <div class="rad-head-sub">
            <Tag
              :value="resep?.NOMR || '–'"
              severity="secondary"
              style="font-family: monospace; font-size: 11px; font-weight: 700; padding: 1px 6px"
            />
            <span class="rad-dot">·</span>
            <span class="rad-poli">{{ resep?.POLI_RUANG || '—' }}</span>
            <span class="rad-dot">·</span>
            <span :class="['rad-status-chip', statusChipClass]">
              <span class="rad-status-dot" :class="statusDotClass" />
              {{ statusLabel }}
            </span>
          </div>
        </div>
        <button class="rad-close-btn" @click="localVisible = false">
          <i class="pi pi-times" />
        </button>
      </div>

      <!-- ── Waktu Tunggu Ticker ── -->
      <div class="rad-ticker">
        <div class="rad-ticker-block">
          <i class="pi pi-clock rad-ticker-ico" />
          <div>
            <div class="rad-ticker-lbl">Waktu Tunggu</div>
            <div :class="['rad-ticker-val', tungguClass]">{{ elapsedLabel }}</div>
          </div>
        </div>
        <div class="rad-ticker-block">
          <i class="pi pi-send rad-ticker-ico" style="color: var(--p-blue-500)" />
          <div>
            <div class="rad-ticker-lbl">Masuk</div>
            <div class="rad-ticker-val" style="color: var(--p-text-color)">{{ masukLabel }}</div>
          </div>
        </div>
        <div v-if="resep?.JENISRAWAT" class="rad-ticker-block">
          <i class="pi pi-hospital rad-ticker-ico" style="color: var(--p-orange-500)" />
          <div>
            <div class="rad-ticker-lbl">Jns Rawat</div>
            <div class="rad-ticker-val" style="color: var(--p-text-color)">
              {{ resep.JENISRAWAT }}
            </div>
          </div>
        </div>
      </div>

      <!-- ── DPJP ── -->
      <div v-if="resep?.DPJP" class="rad-dpjp">
        <Avatar
          :label="dpjpInitial"
          shape="circle"
          size="small"
          style="
            background: var(--p-primary-100);
            color: var(--p-primary-700);
            font-size: 11px;
            font-weight: 700;
            flex-shrink: 0;
            width: 28px;
            height: 28px;
          "
        />
        <span class="rad-dpjp-name">{{ resep.DPJP }}</span>
      </div>

      <!-- ── Divider ── -->
      <div class="rad-divider" />

      <!-- ── Action Buttons ── -->
      <div class="rad-actions">
        <button
          v-for="action in resolvedActions"
          :key="action.key"
          :class="['rad-action-btn', `rad-action-${action.key}`, { 'rad-action-disabled': action.disabled }]"
          :disabled="action.disabled"
          @click="handleAction(action)"
        >
          <i v-if="action.icon" :class="[action.icon, 'rad-action-ico']" />
          <span class="rad-action-label">{{ action.label }}</span>
          <span v-if="action.description" class="rad-action-desc">{{ action.description }}</span>
        </button>
      </div>

      <!-- ── Footer ── -->
      <div class="rad-footer">
        <span class="rad-footer-text">
          <i class="pi pi-hashtag" style="font-size: 9px" />
          {{ resep?.NOREGISTER || '—' }}
        </span>
        <Button
          label="Batal"
          size="small"
          severity="secondary"
          text
          @click="localVisible = false"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Avatar from 'primevue/avatar'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  resep: {
    type: Object,
    default: null,
  },
  /**
   * Array of action objects:
   * {
   *   key: string,          // unique key, e.g. 'proses'
   *   label: string,        // button label
   *   icon?: string,        // PrimeIcons / FA class
   *   description?: string, // small hint below label
   *   disabled?: boolean,
   * }
   *
   * Built-in keys with default styling: 'preview' | 'proses' | 'selesai'
   * You can also pass fully custom objects.
   */
  actions: {
    type: Array,
    default: () => ['preview', 'proses', 'selesai'],
  },
})

const emit = defineEmits(['update:visible', 'action', 'close'])

/* ── v-model bridge ── */
const localVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

/* ── Built-in action presets ── */
const PRESETS = {
  preview: {
    key: 'preview',
    label: 'Hanya Preview',
    icon: 'pi pi-eye',
    description: 'Buka tanpa ubah status',
  },
  proses: {
    key: 'proses',
    label: 'Proses',
    icon: 'pi pi-play-circle',
    description: 'Tandai sedang diproses',
  },
  selesai: {
    key: 'selesai',
    label: 'Selesai',
    icon: 'pi pi-check-circle',
    description: 'Tandai resep selesai',
  },
  tutup: {
    key: 'tutup',
    label: 'Tutup Saja',
    icon: 'pi pi-sign-out',
    description: 'Tutup tanpa mengubah status',
  },
  update: {
    key: 'update',
    label: 'Update Resep',
    icon: 'pi pi-file-edit',
    description: 'Buka & ubah resep yang sudah selesai',
  },
}

const resolvedActions = computed(() =>
  props.actions.map((a) => {
    if (typeof a === 'string') return PRESETS[a] ?? { key: a, label: a }
    return { ...(PRESETS[a.key] ?? {}), ...a }
  }),
)

/* ── Status helpers ── */
const statusLabel = computed(() => {
  const s = props.resep?.STATUS_PROGRESS
  if (s === 'C') return 'Selesai'
  if (s === 'P') return 'Proses'
  return 'Menunggu'
})

const statusDotClass = computed(() => {
  const s = props.resep?.STATUS_PROGRESS
  if (s === 'C') return 'dot-success'
  if (s === 'P') return 'dot-warn'
  return 'dot-danger'
})

const statusChipClass = computed(() => {
  const s = props.resep?.STATUS_PROGRESS
  if (s === 'C') return 'chip-success'
  if (s === 'P') return 'chip-warn'
  return 'chip-danger'
})

/* ── Masuk time ── */
const masukLabel = computed(() => {
  const val = props.resep?.JAM_KIRIM_RESEP
  if (!val) return '–'
  const m = String(val).match(/(\d{2}:\d{2})/)
  return m ? m[1] : '–'
})

/* ── DPJP initial ── */
const dpjpInitial = computed(() => {
  const name = props.resep?.DPJP
  if (!name) return '?'
  const clean = name.replace(/^dr\.?\s*/i, '').trim()
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
})

/* ── Elapsed ticker ── */
const elapsedMenit = ref(0)
let ticker = null

const startTicker = () => {
  stopTicker()
  calcElapsed()
  ticker = setInterval(calcElapsed, 10000)
}

const stopTicker = () => {
  if (ticker) {
    clearInterval(ticker)
    ticker = null
  }
}

const calcElapsed = () => {
  const r = props.resep
  if (!r?.JAM_KIRIM_RESEP) {
    elapsedMenit.value = 0
    return
  }
  const start = new Date(r.JAM_KIRIM_RESEP)
  if (isNaN(start)) {
    elapsedMenit.value = 0
    return
  }
  let end
  if (r.SELESAI && r.STATUS_PROGRESS === 'C') {
    const dateStr = r.JAM_KIRIM_RESEP.split(' ')[0]
    end = new Date(`${dateStr} ${r.SELESAI}:00`)
    if (end < start) end.setDate(end.getDate() + 1)
  } else {
    end = new Date()
  }
  const diff = end - start
  elapsedMenit.value = diff < 0 ? 0 : Math.floor(diff / 60000)
}

const elapsedLabel = computed(() => {
  const m = elapsedMenit.value
  if (!props.resep?.JAM_KIRIM_RESEP) return '–'
  if (m < 60) return `${m} mnt`
  const jam = Math.floor(m / 60)
  const sisa = m % 60
  return `${jam}j ${String(sisa).padStart(2, '0')}m`
})

const tungguClass = computed(() => {
  const m = elapsedMenit.value
  if (m <= 30) return 'tunggu-ok'
  if (m <= 60) return 'tunggu-warn'
  return 'tunggu-danger'
})

watch(
  () => props.visible,
  (v) => {
    if (v) startTicker()
    else stopTicker()
  },
  { immediate: true },
)

onUnmounted(stopTicker)

/* ── Action handler ── */
const handleAction = (action) => {
  if (action.disabled) return
  emit('action', {
    action: action.key,
    resep: props.resep,
    timestamp: new Date().toISOString(),
    elapsedMenit: elapsedMenit.value,
  })
  localVisible.value = false
}
</script>

<style scoped>
/* ── Wrapper ── */
.rad-wrap {
  display: flex;
  flex-direction: column;
  border-radius: inherit;
  overflow: hidden;
}

/* ── Header ── */
.rad-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 12px;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
}

.rad-head-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--p-primary-50);
  color: var(--p-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.rad-head-info {
  flex: 1;
  min-width: 0;
}

.rad-head-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--p-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.rad-head-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.rad-dot {
  color: var(--p-text-muted-color);
  font-size: 10px;
}

.rad-poli {
  font-size: 11px;
  font-weight: 600;
  color: var(--p-text-muted-color);
}

/* status chip */
.rad-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
}

.chip-danger {
  background: var(--p-red-50);
  color: var(--p-red-700);
}
.chip-warn {
  background: var(--p-orange-50);
  color: var(--p-orange-700);
}
.chip-success {
  background: var(--p-green-50);
  color: var(--p-green-700);
}

.rad-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-danger {
  background: var(--p-red-500);
}
.dot-warn {
  background: var(--p-orange-400);
}
.dot-success {
  background: var(--p-green-500);
}

/* close button */
.rad-close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--p-text-muted-color);
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}
.rad-close-btn:hover {
  color: var(--p-text-color);
  background: var(--p-surface-100);
}

/* ── Ticker row ── */
.rad-ticker {
  display: flex;
  gap: 0;
  background: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
}

.rad-ticker-block {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-right: 1px solid var(--p-surface-200);
}

.rad-ticker-block:last-child {
  border-right: none;
}

.rad-ticker-ico {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}

.rad-ticker-lbl {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  line-height: 1;
  margin-bottom: 2px;
}

.rad-ticker-val {
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.tunggu-ok {
  color: var(--p-green-600);
}
.tunggu-warn {
  color: var(--p-orange-600);
}
.tunggu-danger {
  color: var(--p-red-600);
}

/* ── DPJP ── */
.rad-dpjp {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-100);
}

.rad-dpjp-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Divider ── */
.rad-divider {
  height: 1px;
  background: var(--p-surface-200);
}

/* ── Action Buttons ── */
.rad-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 14px 10px;
  background: var(--p-surface-0);
}

.rad-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s,
    transform 0.1s;
  background: var(--p-surface-50);
  width: 100%;
}

.rad-action-btn:hover:not(.rad-action-disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.rad-action-btn:active:not(.rad-action-disabled) {
  transform: translateY(0);
}

.rad-action-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rad-action-ico {
  font-size: 1.1rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.rad-action-label {
  font-size: 13px;
  font-weight: 700;
  flex: 1;
  color: var(--p-text-color);
}

.rad-action-desc {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  font-weight: 400;
  white-space: nowrap;
}

/* ── Built-in color theming ── */
.rad-action-preview {
  border-color: var(--p-surface-300);
}
.rad-action-preview .rad-action-ico {
  color: var(--p-text-muted-color);
}
.rad-action-preview:hover:not(.rad-action-disabled) {
  background: var(--p-surface-100);
  border-color: var(--p-surface-400);
}

.rad-action-proses {
  border-color: var(--p-orange-200);
  background: var(--p-orange-50);
}
.rad-action-proses .rad-action-ico {
  color: var(--p-orange-600);
}
.rad-action-proses .rad-action-label {
  color: var(--p-orange-700);
}
.rad-action-proses:hover:not(.rad-action-disabled) {
  background: var(--p-orange-100);
  border-color: var(--p-orange-400);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
}

.rad-action-selesai {
  border-color: var(--p-green-200);
  background: var(--p-green-50);
}
.rad-action-selesai .rad-action-ico {
  color: var(--p-green-600);
}
.rad-action-selesai .rad-action-label {
  color: var(--p-green-700);
}
.rad-action-selesai:hover:not(.rad-action-disabled) {
  background: var(--p-green-100);
  border-color: var(--p-green-400);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}

.rad-action-tutup {
  border-color: var(--p-surface-300);
}
.rad-action-tutup .rad-action-ico {
  color: var(--p-text-muted-color);
}
.rad-action-tutup:hover:not(.rad-action-disabled) {
  background: var(--p-surface-100);
  border-color: var(--p-surface-400);
}

.rad-action-update {
  border-color: var(--p-blue-200);
  background: var(--p-blue-50);
}
.rad-action-update .rad-action-ico {
  color: var(--p-blue-600);
}
.rad-action-update .rad-action-label {
  color: var(--p-blue-700);
}
.rad-action-update:hover:not(.rad-action-disabled) {
  background: var(--p-blue-100);
  border-color: var(--p-blue-400);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

/* ── Footer ── */
.rad-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px 10px;
  background: var(--p-surface-50);
  border-top: 1px solid var(--p-surface-200);
}

.rad-footer-text {
  font-size: 10px;
  font-family: monospace;
  color: var(--p-text-muted-color);
  display: flex;
  align-items: center;
  gap: 3px;
}
</style>
