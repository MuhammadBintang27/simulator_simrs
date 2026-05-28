<template>
  <div v-if="isLoading" class="text-center p-4">
    <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem" />
    <div class="mt-2 text-muted" style="font-size: 0.85rem">Memuat data odontogram...</div>
  </div>

  <div v-else class="odonto-wrap">
    <!-- ══ HERO ══ -->
    <Panel class="hero-panel">
      <div class="hero-body">
        <div class="hero-left">
          <div class="hero-icon-wrap"><i class="fas fa-tooth"></i></div>
          <div>
            <div class="hero-title">Odontogram — Peta Kondisi Gigi</div>
            <div class="hero-sub">Poli Gigi & Mulut · Pemeriksaan Klinis</div>
          </div>
        </div>
        <div class="hero-chips">
          <div class="hero-chip">
            <span class="chip-label">Gigi Bermasalah</span>
            <span class="chip-val" :class="totalAffected > 0 ? 'chip-danger' : 'chip-ok'">
              {{ totalAffected }}
            </span>
          </div>
          <div class="hero-chip" v-if="selectedCondition">
            <span class="chip-label">Kondisi dipilih</span>
            <span class="chip-val chip-ok">{{ selectedCondition }}</span>
          </div>
        </div>
      </div>
    </Panel>

    <!-- ══ PALETTE ══ -->
    <Panel>
      <template #header>
        <h6 style="color: darkcyan">
          <strong
            ><i class="fas fa-palette mr-2"></i>PILIH KONDISI — KLIK PERMUKAAN GIGI UNTUK
            MENANDAI</strong
          >
        </h6>
      </template>
      <div class="pal-row">
        <button
          v-for="cond in conditions"
          :key="cond.code"
          class="pal-btn"
          :class="{ 'pal-active': selectedCondition === cond.code }"
          @click="selectedCondition = selectedCondition === cond.code ? null : cond.code"
        >
          <span
            class="pal-swatch"
            :style="{ background: cond.fill, border: `2px solid ${cond.stroke}` }"
          ></span>
          <span class="pal-code">{{ cond.code }}</span>
          <span class="pal-text">{{ cond.label }}</span>
        </button>
        <button
          class="pal-btn pal-clr"
          :class="{ 'pal-active': !selectedCondition }"
          @click="selectedCondition = null"
        >
          <span class="pal-swatch" style="background: #fff; border: 2px solid #ccc"></span>
          <span class="pal-code">CLR</span>
          <span class="pal-text">Hapus</span>
        </button>
      </div>
      <div v-if="selectedCondition" class="pal-hint">
        <i class="pi pi-info-circle"></i>
        Kondisi <strong>{{ selectedCondition }}</strong> dipilih —
        {{
          isWholeCondition(selectedCondition)
            ? 'klik gigi mana saja untuk menandai seluruh gigi'
            : 'klik permukaan untuk menandai'
        }}
      </div>
    </Panel>

    <!-- ══ ODONTOGRAM ══ -->
    <Panel>
      <template #header>
        <h6 style="color: darkcyan">
          <strong><i class="fas fa-th mr-2"></i>ODONTOGRAM</strong>
        </h6>
      </template>

      <div class="odonto-chart">
        <!-- Direction header -->
        <div class="dir-row">
          <span class="dir-label">← KANAN PASIEN</span>
          <span class="dir-mid">|</span>
          <span class="dir-label">KIRI PASIEN →</span>
        </div>

        <!-- Upper permanent -->
        <div class="arch-row">
          <div class="teeth-half half-right">
            <div v-for="num in upperRight" :key="num" class="tooth-cell">
              <span class="t-num">{{ num }}</span>
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                @click-surface="clickSurface"
              />
            </div>
          </div>
          <div class="midline-v"></div>
          <div class="teeth-half half-left">
            <div v-for="num in upperLeft" :key="num" class="tooth-cell">
              <span class="t-num">{{ num }}</span>
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                @click-surface="clickSurface"
              />
            </div>
          </div>
        </div>

        <!-- Upper deciduous -->
        <div class="arch-row arch-deci">
          <div class="teeth-half half-right">
            <div class="t-spacer" v-for="i in 3" :key="'usr' + i"></div>
            <div v-for="num in upperRightD" :key="num" class="tooth-cell">
              <span class="t-num t-num-sm">{{ num }}</span>
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                :small="true"
                @click-surface="clickSurface"
              />
            </div>
          </div>
          <div class="midline-v"></div>
          <div class="teeth-half half-left">
            <div v-for="num in upperLeftD" :key="num" class="tooth-cell">
              <span class="t-num t-num-sm">{{ num }}</span>
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                :small="true"
                @click-surface="clickSurface"
              />
            </div>
          </div>
        </div>

        <!-- Jaw divider -->
        <div class="jaw-div">
          <span class="jaw-lbl">RAHANG ATAS</span>
          <div class="jaw-line"></div>
          <span class="jaw-lbl">RAHANG BAWAH</span>
        </div>

        <!-- Lower deciduous -->
        <div class="arch-row arch-deci">
          <div class="teeth-half half-right">
            <div class="t-spacer" v-for="i in 3" :key="'lrd' + i"></div>
            <div v-for="num in lowerRightD" :key="num" class="tooth-cell">
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                :small="true"
                @click-surface="clickSurface"
              />
              <span class="t-num t-num-sm">{{ num }}</span>
            </div>
          </div>
          <div class="midline-v"></div>
          <div class="teeth-half half-left">
            <div v-for="num in lowerLeftD" :key="num" class="tooth-cell">
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                :small="true"
                @click-surface="clickSurface"
              />
              <span class="t-num t-num-sm">{{ num }}</span>
            </div>
          </div>
        </div>

        <!-- Lower permanent -->
        <div class="arch-row">
          <div class="teeth-half half-right">
            <div v-for="num in lowerRight" :key="num" class="tooth-cell">
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                @click-surface="clickSurface"
              />
              <span class="t-num">{{ num }}</span>
            </div>
          </div>
          <div class="midline-v"></div>
          <div class="teeth-half half-left">
            <div v-for="num in lowerLeft" :key="num" class="tooth-cell">
              <component
                :is="ToothSvg"
                :num="num"
                :teeth-data="teethData"
                :conditions="conditions"
                @click-surface="clickSurface"
              />
              <span class="t-num">{{ num }}</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend-row">
          <div v-for="cond in conditions" :key="cond.code" class="legend-item">
            <span
              class="legend-swatch"
              :style="{ background: cond.fill, border: `1px solid ${cond.stroke}` }"
            ></span>
            <span class="legend-text">{{ cond.code }} — {{ cond.label }}</span>
          </div>
        </div>
      </div>
    </Panel>

    <!-- ══ CATATAN ══ -->
    <Panel>
      <template #header>
        <h6 style="color: darkcyan">
          <strong><i class="fas fa-notes-medical mr-2"></i>KELUHAN & CATATAN PERAWATAN</strong>
        </h6>
      </template>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label-sm">Keluhan Utama Pasien</label>
          <Textarea
            v-model="form.keluhan"
            rows="3"
            class="w-100 custom-textarea"
            placeholder="Tuliskan keluhan utama pasien..."
          />
        </div>
        <div class="col-md-6">
          <label class="form-label-sm">Rencana Perawatan / Catatan</label>
          <Textarea
            v-model="form.catatan"
            rows="3"
            class="w-100 custom-textarea"
            placeholder="Catatan pemeriksaan dan rencana tindakan..."
          />
        </div>
      </div>
    </Panel>

    <!-- ══ ACTION BAR ══ -->
    <div class="visus-action-bar">
      <Button
        label="Riwayat"
        icon="pi pi-history"
        severity="secondary"
        outlined
        @click="openHistory"
      />
      <span v-if="lastSaved" class="saved-info">
        <i class="pi pi-check-circle"></i> Disimpan pukul {{ lastSaved }}
      </span>
      <Button
        label="Simpan Odontogram"
        icon="pi pi-save"
        severity="success"
        :loading="isSaving"
        @click="simpan"
      />
    </div>
  </div>

  <!-- ══ DIALOG RIWAYAT ══ -->
  <Dialog
    v-model:visible="showHistory"
    header="Riwayat Odontogram"
    :style="{ width: '680px', maxWidth: '95vw' }"
    modal
    :draggable="false"
  >
    <!-- Loading -->
    <div v-if="historyLoading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: darkcyan" />
      <div class="mt-2 text-muted" style="font-size: 0.85rem">Memuat riwayat...</div>
    </div>

    <!-- Kosong -->
    <div v-else-if="!historyList.length" class="hist-empty">
      <i class="pi pi-inbox" style="font-size: 2rem; color: #cbd5e1"></i>
      <div>Belum ada riwayat odontogram untuk kunjungan ini</div>
    </div>

    <!-- Timeline -->
    <div v-else class="hist-timeline">
      <div v-for="(item, idx) in historyList" :key="item.id" class="hist-item">
        <div class="hist-line-wrap">
          <div class="hist-dot" :class="idx === 0 ? 'hist-dot-latest' : ''"></div>
          <div v-if="idx < historyList.length - 1" class="hist-vline"></div>
        </div>
        <div class="hist-card">
          <!-- Header -->
          <div class="hist-head">
            <div class="hist-date">
              <i class="pi pi-calendar mr-1"></i>
              {{ formatHistDate(item.updated_at || item.created_at) }}
              <span v-if="idx === 0" class="hist-badge-latest">Terbaru</span>
            </div>
            <div class="hist-user">
              <i class="pi pi-user mr-1"></i>
              {{ item.user_nama || 'User #' + item.user_id }}
            </div>
          </div>

          <!-- Gigi bermasalah -->
          <div class="hist-teeth-row" v-if="getAffectedTeeth(item.teeth_data).length">
            <span class="hist-sect-lbl">Gigi:</span>
            <div class="hist-tags">
              <span
                v-for="t in getAffectedTeeth(item.teeth_data)"
                :key="t.num"
                class="hist-tooth-tag"
                :style="{ background: t.color + '22', borderColor: t.color, color: t.color }"
                :title="t.detail"
              >
                <strong>{{ t.num }}</strong>
                <span class="hist-tag-cond">{{ t.condLabel }}</span>
              </span>
            </div>
          </div>
          <div v-else class="hist-no-teeth">Tidak ada kondisi gigi yang tercatat</div>

          <!-- Keluhan & catatan -->
          <div class="hist-notes" v-if="item.keluhan || item.catatan">
            <div v-if="item.keluhan" class="hist-note-row">
              <span class="hist-sect-lbl">Keluhan:</span>
              <span class="hist-note-val">{{ item.keluhan }}</span>
            </div>
            <div v-if="item.catatan" class="hist-note-row">
              <span class="hist-sect-lbl">Catatan:</span>
              <span class="hist-note-val">{{ item.catatan }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Dialog>

  <Toast />
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineComponent, h } from 'vue'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const props = defineProps({
  noregister: { type: String, default: null },
  dataset: { type: Object, default: null },
})

const emit = defineEmits(['saved'])

// ── Teeth Layout ─────────────────────────────────────────
const upperRight = [18, 17, 16, 15, 14, 13, 12, 11]
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28]
const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41]
const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38]
const upperRightD = [55, 54, 53, 52, 51]
const upperLeftD = [61, 62, 63, 64, 65]
const lowerRightD = [85, 84, 83, 82, 81]
const lowerLeftD = [71, 72, 73, 74, 75]

const allTeeth = [
  ...upperRight,
  ...upperLeft,
  ...lowerRight,
  ...lowerLeft,
  ...upperRightD,
  ...upperLeftD,
  ...lowerRightD,
  ...lowerLeftD,
]

// ── Conditions ───────────────────────────────────────────
const conditions = [
  { code: 'K', label: 'Karies', fill: '#ef4444', stroke: '#b91c1c', whole: false },
  { code: 'A', label: 'Amalgam', fill: '#6b7280', stroke: '#374151', whole: false },
  { code: 'CO', label: 'Komposit', fill: '#93c5fd', stroke: '#1d4ed8', whole: false },
  { code: 'F', label: 'Fraktur', fill: '#fb923c', stroke: '#c2410c', whole: false },
  { code: 'RKA', label: 'Perawatan Sal. Akar', fill: '#c084fc', stroke: '#7e22ce', whole: false },
  { code: 'GTC', label: 'Mahkota / Crown', fill: '#fbbf24', stroke: '#b45309', whole: true },
  { code: 'GTL', label: 'Gigi Tiruan Lepasan', fill: '#34d399', stroke: '#065f46', whole: true },
  { code: 'X', label: 'Cabut / Hilang', fill: '#9ca3af', stroke: '#4b5563', whole: true },
  { code: 'UNE', label: 'Un-Erupted', fill: '#e0e7ff', stroke: '#6366f1', whole: true },
  { code: 'AN', label: 'Anomali', fill: '#fde68a', stroke: '#d97706', whole: true },
]

const isWholeCondition = (code) => conditions.find((c) => c.code === code)?.whole ?? false

// ── Teeth Data ───────────────────────────────────────────
const teethData = reactive({})
allTeeth.forEach((num) => {
  teethData[num] = { B: null, M: null, D: null, L: null, O: null, whole: null }
})

// ── Interaction ──────────────────────────────────────────
const selectedCondition = ref(null)

const clickSurface = (num, surface) => {
  if (!teethData[num]) return
  if (!selectedCondition.value) {
    teethData[num][surface] = null
    teethData[num].whole = null
    return
  }
  if (isWholeCondition(selectedCondition.value)) {
    teethData[num].whole =
      teethData[num].whole === selectedCondition.value ? null : selectedCondition.value
  } else {
    teethData[num][surface] =
      teethData[num][surface] === selectedCondition.value ? null : selectedCondition.value
  }
}

// ── Stats ────────────────────────────────────────────────
const totalAffected = computed(
  () =>
    Object.keys(teethData).filter((num) => {
      const t = teethData[num]
      return t.whole || t.B || t.M || t.D || t.L || t.O
    }).length,
)

// ── Tooth SVG (render function sub-component) ────────────
const ToothSvg = defineComponent({
  props: {
    num: { type: Number, required: true },
    teethData: { type: Object, required: true },
    conditions: { type: Array, required: true },
    small: { type: Boolean, default: false },
  },
  emits: ['click-surface'],
  setup(props, { emit }) {
    const getFill = (surface) => {
      const code = props.teethData[props.num]?.[surface]
      return code ? (props.conditions.find((c) => c.code === code)?.fill ?? '#ffffff') : '#ffffff'
    }
    const getWhole = () => props.teethData[props.num]?.whole ?? null
    const getWholeColor = () => {
      const w = getWhole()
      return w ? (props.conditions.find((c) => c.code === w)?.fill ?? 'transparent') : 'transparent'
    }

    return () => {
      const s = props.small ? 45 : 62
      const i = props.small ? 14 : 18
      const whole = getWhole()
      const elems = [
        h('rect', {
          x: 0,
          y: 0,
          width: s,
          height: s,
          fill: '#f9fafb',
          stroke: '#d1d5db',
          'stroke-width': 0.5,
        }),
      ]

      if (whole) {
        elems.push(
          h('rect', { x: 0, y: 0, width: s, height: s, fill: getWholeColor(), opacity: 0.75 }),
        )
        if (whole === 'X') {
          elems.push(
            h('line', {
              x1: 3,
              y1: 3,
              x2: s - 3,
              y2: s - 3,
              stroke: '#1f2937',
              'stroke-width': 2,
              'stroke-linecap': 'round',
            }),
            h('line', {
              x1: s - 3,
              y1: 3,
              x2: 3,
              y2: s - 3,
              stroke: '#1f2937',
              'stroke-width': 2,
              'stroke-linecap': 'round',
            }),
          )
        } else {
          elems.push(
            h(
              'text',
              {
                x: s / 2,
                y: s / 2 + 4,
                'text-anchor': 'middle',
                'font-size': props.small ? 9 : 12,
                fill: '#1f2937',
                'font-weight': 'bold',
              },
              whole,
            ),
          )
        }
        elems.push(
          h('rect', {
            x: 0,
            y: 0,
            width: s,
            height: s,
            fill: 'transparent',
            style: 'cursor:pointer',
            onClick: () => emit('click-surface', props.num, 'O'),
          }),
        )
      } else {
        const surfaces = [
          { key: 'B', points: `0,0 ${s},0 ${s - i},${i} ${i},${i}` },
          { key: 'D', points: `${s},0 ${s - i},${i} ${s - i},${s - i} ${s},${s}` },
          { key: 'L', points: `${i},${s - i} ${s - i},${s - i} ${s},${s} 0,${s}` },
          { key: 'M', points: `0,0 ${i},${i} ${i},${s - i} 0,${s}` },
        ]
        surfaces.forEach(({ key, points }) => {
          elems.push(
            h('polygon', {
              points,
              fill: getFill(key),
              stroke: '#9ca3af',
              'stroke-width': 0.5,
              style: 'cursor:pointer',
              onClick: () => emit('click-surface', props.num, key),
            }),
          )
        })
        elems.push(
          h('rect', {
            x: i,
            y: i,
            width: s - 2 * i,
            height: s - 2 * i,
            fill: getFill('O'),
            stroke: '#9ca3af',
            'stroke-width': 0.5,
            style: 'cursor:pointer',
            onClick: () => emit('click-surface', props.num, 'O'),
          }),
        )
      }

      return h(
        'svg',
        { class: props.small ? 'tooth-svg-sm' : 'tooth-svg', viewBox: `0 0 ${s} ${s}` },
        elems,
      )
    }
  },
})

// ── Form ─────────────────────────────────────────────────
const form = reactive({ keluhan: '', catatan: '' })
const isLoading = ref(false)
const isSaving = ref(false)
const lastSaved = ref(null)

// ── API ──────────────────────────────────────────────────
async function getData() {
  if (!props.noregister) return
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/penunjang/get_odontogram`, {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
      id_client: id_client.value,
    })
    if (res.data?.code === 200 && res.data?.data) {
      const d = res.data.data
      if (d.teeth_data) {
        Object.entries(d.teeth_data).forEach(([num, val]) => {
          if (teethData[num]) Object.assign(teethData[num], val)
        })
      }
      if (d.keluhan) form.keluhan = d.keluhan
      if (d.catatan) form.catatan = d.catatan
    }
  } catch (err) {
    console.error('getData odontogram:', err)
  } finally {
    isLoading.value = false
  }
}

async function simpan() {
  isSaving.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
      id_client: id_client.value,
      user_id: user_id.value,
      teeth_data: teethData,
      keluhan: form.keluhan,
      catatan: form.catatan,
    }

    const res = await axios.post(`${url}/index.php/api/penunjang/save_odontogram`, payload)

    if (res.data?.code == 200 || res.data?.status === 'success') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Odontogram tersimpan',
        life: 3000,
      })
      lastSaved.value = new Date().toLocaleTimeString('id-ID')
      emit('saved')
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data?.message ?? 'Gagal menyimpan',
        life: 4000,
      })
    }
  } catch (err) {
    console.error('simpan odontogram:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan saat menyimpan',
      life: 5000,
    })
  } finally {
    isSaving.value = false
  }
}

// ── Riwayat ──────────────────────────────────────────────
const showHistory = ref(false)
const historyLoading = ref(false)
const historyList = ref([])

async function openHistory() {
  showHistory.value = true
  historyList.value = []
  historyLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/penunjang/get_odontogram`, {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
      id_client: id_client.value,
      mode: 3,
    })

    if (res.data?.code === 200 && Array.isArray(res.data?.data)) {
      historyList.value = res.data.data

      console.log('Riwayat odontogram response:', res.data)
    }
  } catch (err) {
    console.error('loadHistory:', err)
  } finally {
    historyLoading.value = false
  }
}

function formatHistDate(dt) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getAffectedTeeth(td) {
  if (!td) return []
  return Object.entries(td)
    .filter(([, v]) => v && (v.whole || v.B || v.M || v.D || v.L || v.O))
    .map(([num, v]) => {
      const primaryCode = v.whole || v.B || v.M || v.D || v.L || v.O
      const cond = conditions.find((c) => c.code === primaryCode)
      const surfaces = ['B', 'M', 'D', 'L', 'O'].filter((s) => v[s]).map((s) => `${s}:${v[s]}`)
      const detail = v.whole ? `Seluruh gigi: ${v.whole}` : surfaces.join(', ')
      const condLabel = v.whole || (surfaces.length > 1 ? `${surfaces.length} sisi` : primaryCode)
      return { num, detail, condLabel, color: cond?.stroke ?? '#6b7280' }
    })
}

onMounted(() => getData())
</script>

<style scoped>
.odonto-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Hero ── */
.hero-panel :deep(.p-panel-content) {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  padding: 1rem 1.25rem;
  border-radius: 6px;
}
.hero-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  color: white;
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.hero-icon-wrap {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}
.hero-title {
  font-size: 1rem;
  font-weight: 700;
}
.hero-sub {
  font-size: 0.78rem;
  opacity: 0.8;
  margin-top: 2px;
}
.hero-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.hero-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 0.4rem 0.85rem;
  min-width: 90px;
}
.chip-label {
  font-size: 0.65rem;
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.chip-val {
  font-size: 0.95rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.6;
}
.chip-ok {
  opacity: 1;
  color: #a7f3d0;
}
.chip-danger {
  opacity: 1;
  color: #fca5a5;
}

/* ── Palette ── */
.pal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}
.pal-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.78rem;
  transition: all 0.15s;
}
.pal-btn:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}
.pal-btn.pal-active {
  border-color: #2d1b69;
  background: #ede9fe;
  font-weight: 700;
}
.pal-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}
.pal-code {
  font-weight: 700;
  font-size: 0.75rem;
  color: #1e293b;
}
.pal-text {
  color: #64748b;
  font-size: 0.72rem;
}
.pal-hint {
  font-size: 0.78rem;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
}

/* ── Chart ── */
.odonto-chart {
  overflow-x: auto;
  padding-bottom: 4px;
}
.dir-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
  padding: 0 4px;
  min-width: 1060px;
}
.dir-mid {
  font-size: 0.9rem;
  color: #cbd5e1;
}

.arch-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-width: 1060px;
}
.arch-deci {
  margin: 2px 0;
}

.teeth-half {
  display: flex;
  align-items: flex-end;
}
.half-right {
  justify-content: flex-end;
}
.half-left {
  justify-content: flex-start;
}

.midline-v {
  width: 2px;
  height: 50px;
  background: #94a3b8;
  margin: 0 3px;
  flex-shrink: 0;
}

.tooth-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1px;
  /* 3D setup */
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition:
    transform 0.14s ease,
    filter 0.14s ease;
}

/* ── Efek 3D saat hover ── */
.tooth-cell:hover {
  transform: perspective(400px) translateY(-5px) scale(1.12);
  z-index: 20;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.28)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.18));
}

/* Efek tekan / klik */
.tooth-cell:active {
  transform: perspective(400px) translateY(-1px) scale(1.04);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition-duration: 0.05s;
}

/* Nomor gigi ikut menyala saat hover */
.tooth-cell:hover .t-num,
.tooth-cell:hover .t-num-sm {
  color: darkcyan;
  font-weight: 700;
}

/* Outline ring pada SVG saat hover */
.tooth-cell:hover :deep(.tooth-svg),
.tooth-cell:hover :deep(.tooth-svg-sm) {
  outline: 2px solid rgba(0, 139, 139, 0.6);
  outline-offset: 1px;
  border-radius: 2px;
}

.t-num {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
  min-width: 22px;
  transition: color 0.14s ease;
}
.t-num-sm {
  font-size: 0.64rem;
  min-width: 17px;
}
.t-spacer {
  width: 34px;
  flex-shrink: 0;
}

/* Tooth SVG sizes (matched to render function) */
:deep(.tooth-svg) {
  width: 44px;
  height: 44px;
  display: block;
}
:deep(.tooth-svg-sm) {
  width: 32px;
  height: 32px;
  display: block;
}

/* ── Jaw Divider ── */
.jaw-div {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  min-width: 1060px;
}
.jaw-lbl {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  white-space: nowrap;
  letter-spacing: 0.06em;
}
.jaw-line {
  flex: 1;
  height: 1px;
  background: #cbd5e1;
}

/* ── Legend ── */
.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-top: 12px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-width: 1060px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
.legend-text {
  font-size: 0.7rem;
  color: #475569;
}

/* ── Misc ── */
.form-label-sm {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}
.custom-textarea {
  font-size: 13px !important;
  line-height: 1.4;
}
.visus-action-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 10px 14px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}
.saved-info {
  font-size: 0.8rem;
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ── Timeline Riwayat ── */
.hist-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.85rem;
}
.hist-timeline {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  max-height: 70vh;
  overflow-y: auto;
}
.hist-item {
  display: flex;
  gap: 0;
  position: relative;
}
.hist-line-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
}
.hist-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid #94a3b8;
  flex-shrink: 0;
  margin-top: 6px;
}
.hist-dot-latest {
  background: darkcyan;
  border-color: darkcyan;
  box-shadow: 0 0 0 3px rgba(0, 139, 139, 0.18);
}
.hist-vline {
  width: 2px;
  flex: 1;
  background: #e2e8f0;
  min-height: 20px;
  margin: 4px 0;
}
.hist-card {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  margin-left: 8px;
}
.hist-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.hist-date {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 5px;
}
.hist-badge-latest {
  background: darkcyan;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 10px;
  letter-spacing: 0.04em;
}
.hist-user {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hist-teeth-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.hist-no-teeth {
  font-size: 0.75rem;
  color: #94a3b8;
  font-style: italic;
  margin-bottom: 6px;
}
.hist-sect-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  white-space: nowrap;
  margin-top: 2px;
}
.hist-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.hist-tooth-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1.5px solid;
  font-size: 0.72rem;
  cursor: default;
}
.hist-tag-cond {
  font-size: 0.68rem;
  opacity: 0.85;
}
.hist-notes {
  border-top: 1px solid #f1f5f9;
  padding-top: 6px;
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hist-note-row {
  display: flex;
  gap: 6px;
  font-size: 0.78rem;
  color: #475569;
  align-items: baseline;
}
.hist-note-val {
  color: #334155;
}
</style>
