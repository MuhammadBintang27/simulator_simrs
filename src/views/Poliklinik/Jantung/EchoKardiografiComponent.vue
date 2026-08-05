<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue'])

// ─── Pilihan gerakan dinding ──────────────────────────────────────
const MOTION_OPTS = [
  { value: 'N', label: 'Normal', fill: '#86efac', stroke: '#16a34a', text: '#14532d' },
  { value: 'H', label: 'Hipokinesis', fill: '#fde68a', stroke: '#b45309', text: '#78350f' },
  { value: 'AK', label: 'Akinesis', fill: '#fed7aa', stroke: '#c2410c', text: '#7c2d12' },
  { value: 'D', label: 'Diskinesis', fill: '#fca5a5', stroke: '#b91c1c', text: '#7f1d1d' },
  { value: 'AN', label: 'Aneurisma', fill: '#f9a8d4', stroke: '#9f1239', text: '#881337' },
  { value: 'TE', label: 'Tidak Eval', fill: '#e2e8f0', stroke: '#94a3b8', text: '#475569' },
]
const FILL_MAP = Object.fromEntries(MOTION_OPTS.map((o) => [o.value, o.fill]))

// ─── Definisi 17 segmen AHA ──────────────────────────────────────
const SEGS = [
  { id: 1, name: 'Basal Anterior', ring: 'basal', a1: -30, a2: 30 },
  { id: 2, name: 'Basal Anterolateral', ring: 'basal', a1: 30, a2: 90 },
  { id: 3, name: 'Basal Inferolateral', ring: 'basal', a1: 90, a2: 150 },
  { id: 4, name: 'Basal Inferior', ring: 'basal', a1: 150, a2: 210 },
  { id: 5, name: 'Basal Inferoseptal', ring: 'basal', a1: 210, a2: 270 },
  { id: 6, name: 'Basal Anteroseptal', ring: 'basal', a1: 270, a2: 330 },
  { id: 7, name: 'Mid Anterior', ring: 'mid', a1: -30, a2: 30 },
  { id: 8, name: 'Mid Anterolateral', ring: 'mid', a1: 30, a2: 90 },
  { id: 9, name: 'Mid Inferolateral', ring: 'mid', a1: 90, a2: 150 },
  { id: 10, name: 'Mid Inferior', ring: 'mid', a1: 150, a2: 210 },
  { id: 11, name: 'Mid Inferoseptal', ring: 'mid', a1: 210, a2: 270 },
  { id: 12, name: 'Mid Anteroseptal', ring: 'mid', a1: 270, a2: 330 },
  { id: 13, name: 'Apikal Anterior', ring: 'apical', a1: -45, a2: 45 },
  { id: 14, name: 'Apikal Lateral', ring: 'apical', a1: 45, a2: 135 },
  { id: 15, name: 'Apikal Inferior', ring: 'apical', a1: 135, a2: 225 },
  { id: 16, name: 'Apikal Septal', ring: 'apical', a1: 225, a2: 315 },
  { id: 17, name: 'Apex', ring: 'apex' },
]

const RING_R = { basal: [105, 155], mid: [58, 105], apical: [26, 58] }
const LABEL_R = { basal: 130, mid: 82, apical: 42 }
const CX = 160,
  CY = 160

const toRad = (d) => ((d - 90) * Math.PI) / 180
const pt = (r, a) => [CX + r * Math.cos(a), CY + r * Math.sin(a)]

function arcPath(r1, r2, a1, a2) {
  const s = toRad(a1),
    e = toRad(a2)
  const [xi1, yi1] = pt(r1, s),
    [xo1, yo1] = pt(r2, s)
  const [xo2, yo2] = pt(r2, e),
    [xi2, yi2] = pt(r1, e)
  const lg = a2 - a1 > 180 ? 1 : 0
  return `M${xi1},${yi1} L${xo1},${yo1} A${r2},${r2},0,${lg},1,${xo2},${yo2} L${xi2},${yi2} A${r1},${r1},0,${lg},0,${xi1},${yi1}Z`
}

function segPath(seg) {
  if (seg.ring === 'apex') return `M${CX - 26},${CY} a26,26,0,1,0,52,0 a26,26,0,1,0,-52,0`
  const [r1, r2] = RING_R[seg.ring]
  return arcPath(r1, r2, seg.a1, seg.a2)
}

function segLabelPos(seg) {
  if (seg.ring === 'apex') return { x: CX, y: CY }
  const mid = (seg.a1 + seg.a2) / 2
  const r = LABEL_R[seg.ring]
  const a = toRad(mid)
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
}

// ─── State form ───────────────────────────────────────────────────
const mkForm = () => ({
  jenis_echo: 'TTE',
  indikasi: '',
  lvedd: null,
  lvesd: null,
  ivsd: null,
  lvpwd: null,
  lvedv: null,
  lvesv: null,
  ef_simpson: null,
  fs: null,
  lv_mass: null,
  e_vel: null,
  a_vel: null,
  e_a_ratio: null,
  dt: null,
  ivrt: null,
  e_prime_s: null,
  e_prime_l: null,
  e_e_prime: null,
  grading_dias: null,
  la_diam: null,
  la_vol: null,
  ra_area: null,
  rvd: null,
  ao_root: null,
  asc_ao: null,
  tapse: null,
  s_prime_rv: null,
  rvfac: null,
  tr_vel: null,
  pasp: null,
  mr_grade: null,
  ms_mva: null,
  ms_grad: null,
  ar_grade: null,
  as_ava: null,
  as_grad: null,
  ao_vmax: null,
  tr_grade: null,
  pr_grade: null,
  efusi: 'Tidak Ada',
  lokasi_efusi: '',
  wall_motion: {},
  kesan: '',
})
const form = reactive(mkForm())

watch(
  () => props.modelValue,
  (v) => {
    if (v) Object.assign(form, v)
  },
  { immediate: true, deep: true },
)
watch(form, () => emit('update:modelValue', { ...form }), { deep: true })

// ─── Auto-kalkulasi ───────────────────────────────────────────────
watch([() => form.lvedv, () => form.lvesv], ([edv, esv]) => {
  if (edv > 0 && esv >= 0) form.ef_simpson = +(((edv - esv) / edv) * 100).toFixed(1)
})
watch([() => form.e_vel, () => form.a_vel], ([e, a]) => {
  if (e > 0 && a > 0) form.e_a_ratio = +(e / a).toFixed(2)
})
watch([() => form.e_vel, () => form.e_prime_s, () => form.e_prime_l], ([e, es, el]) => {
  const ep = es && el ? (es + el) / 2 : es || el
  if (e > 0 && ep > 0) form.e_e_prime = +(e / ep).toFixed(1)
})
// Auto-hitung PASP dari TR velocity: PASP = 4 × Vmax² + 10 (RAP estimasi)
watch(
  () => form.tr_vel,
  (tv) => {
    if (tv > 0) form.pasp = +(4 * tv * tv + 10).toFixed(1)
  },
)
// Auto-hitung LV Mass (ASE formula)
watch([() => form.lvedd, () => form.ivsd, () => form.lvpwd], ([ed, iv, pw]) => {
  if (ed > 0 && iv > 0 && pw > 0)
    form.lv_mass = +(0.8 * (1.04 * Math.pow(ed + iv + pw, 3) - Math.pow(ed, 3)) + 0.6).toFixed(1)
})

// ─── Range nilai normal referensi ────────────────────────────────
const RANGES = {
  lvedd: { min: 35, max: 56, unit: 'mm' },
  lvesd: { min: 20, max: 40, unit: 'mm' },
  ivsd: { min: 6, max: 12, unit: 'mm' },
  lvpwd: { min: 6, max: 12, unit: 'mm' },
  ef_simpson: { min: 55, max: null, unit: '%' },
  fs: { min: 25, max: 45, unit: '%' },
  e_a_ratio: { min: 0.8, max: 2.0, unit: '' },
  e_e_prime: { min: null, max: 14, unit: '' },
  la_diam: { min: null, max: 40, unit: 'mm' },
  ao_root: { min: null, max: 40, unit: 'mm' },
  asc_ao: { min: null, max: 40, unit: 'mm' },
  rvd: { min: null, max: 42, unit: 'mm' },
  tapse: { min: 17, max: null, unit: 'mm' },
  rvfac: { min: 35, max: null, unit: '%' },
  pasp: { min: null, max: 35, unit: 'mmHg' },
}

function isAbnormal(field, value) {
  if (value === null || value === undefined || value === '') return false
  const r = RANGES[field]
  if (!r) return false
  return (r.min !== null && value < r.min) || (r.max !== null && value > r.max)
}

function rangeHint(field) {
  const r = RANGES[field]
  if (!r) return ''
  if (r.min !== null && r.max !== null) return `Normal: ${r.min}–${r.max} ${r.unit}`
  if (r.min !== null) return `Normal: ≥${r.min} ${r.unit}`
  if (r.max !== null) return `Normal: ≤${r.max} ${r.unit}`
  return ''
}

// ─── Territory koroner ────────────────────────────────────────────
const TERRITORY = {
  LAD: [1, 6, 7, 12, 13, 16, 17],
  LCx: [2, 3, 8, 9, 14],
  RCA: [4, 5, 10, 11, 15],
}
const selectedTerritory = reactive({ artery: null, motion: null })

function setTerritoryMotion(artery, motionVal) {
  const updated = { ...form.wall_motion }
  TERRITORY[artery].forEach((id) => {
    updated[id] = motionVal
  })
  form.wall_motion = updated
}

// ─── Auto-generate kesan ──────────────────────────────────────────
function generateKesan() {
  const parts = []

  // Ukuran & dinding LV
  const lvedd = form.lvedd,
    ivsd = form.ivsd,
    lvpwd = form.lvpwd
  let lvDesc = lvedd
    ? lvedd > 56
      ? 'LV dilatasi'
      : lvedd < 35
        ? 'LV ukuran kecil'
        : 'LV ukuran normal'
    : 'LV'
  if (ivsd && lvpwd)
    lvDesc += ivsd > 12 || lvpwd > 12 ? ', hipertrofi dinding' : ', ketebalan dinding normal'
  parts.push(lvDesc)

  // Fungsi sistolik
  const ef = form.ef_simpson
  if (ef !== null) {
    if (ef >= 55) parts.push(`fungsi sistolik LV baik (EF ${ef}%)`)
    else if (ef >= 40) parts.push(`fungsi sistolik LV borderline (EF ${ef}%)`)
    else parts.push(`penurunan fungsi sistolik LV (EF ${ef}%)`)
  }

  // Fungsi diastolik
  if (form.grading_dias) {
    parts.push(
      form.grading_dias.toLowerCase().includes('normal')
        ? 'fungsi diastolik LV normal'
        : `disfungsi diastolik LV (${form.grading_dias})`,
    )
  }

  // Katup
  const valves = []
  if (form.mr_grade && form.mr_grade !== 'Tidak Ada') valves.push(`MR ${form.mr_grade}`)
  if (form.ar_grade && form.ar_grade !== 'Tidak Ada') valves.push(`AR ${form.ar_grade}`)
  if (form.tr_grade && form.tr_grade !== 'Tidak Ada') valves.push(`TR ${form.tr_grade}`)
  if (form.pr_grade && form.pr_grade !== 'Tidak Ada') valves.push(`PR ${form.pr_grade}`)
  parts.push(
    valves.length ? `tampak ${valves.join(', ')}` : 'katup-katup jantung dalam batas normal',
  )

  // Fungsi RV
  if (form.tapse !== null)
    parts.push(
      form.tapse < 17
        ? `fungsi sistolik RV menurun (TAPSE ${form.tapse} mm)`
        : `fungsi sistolik RV baik (TAPSE ${form.tapse} mm)`,
    )

  // Tekanan pulmonal
  if (form.pasp !== null)
    parts.push(
      form.pasp > 50
        ? `hipertensi pulmonal berat (PASP ${form.pasp} mmHg)`
        : form.pasp > 35
          ? `hipertensi pulmonal ringan-sedang (PASP ${form.pasp} mmHg)`
          : `tekanan arteri pulmonal normal (PASP ${form.pasp} mmHg)`,
    )

  // Perikardium
  parts.push(
    form.efusi && form.efusi !== 'Tidak Ada'
      ? `efusi perikardium ${form.efusi.toLowerCase()}`
      : 'tidak tampak efusi perikardium',
  )

  // Wall motion
  if (wmsi.value !== null)
    parts.push(
      parseFloat(wmsi.value) <= 1
        ? 'gerakan dinding segmental normal pada seluruh 17 segmen'
        : `gangguan gerakan dinding segmental (WMSI ${wmsi.value})`,
    )

  const hasil = parts.join('. ') + '.'
  form.kesan = hasil.charAt(0).toUpperCase() + hasil.slice(1)
}

// ─── WMSI ─────────────────────────────────────────────────────────
const WM_SCORE = { N: 1, H: 2, AK: 3, D: 4, AN: 5 }
const wmsi = computed(() => {
  const vals = SEGS.map((s) => form.wall_motion[s.id]).filter((v) => v && v !== 'TE')
  if (!vals.length) return null
  const sum = vals.reduce((a, v) => a + (WM_SCORE[v] || 1), 0)
  return (sum / vals.length).toFixed(2)
})

// ─── Popup segmen ─────────────────────────────────────────────────
const svgWrap = ref(null)
const popup = reactive({ visible: false, seg: null, x: 0, y: 0 })
const hoveredSeg = ref(null)

function openPopup(seg, evt) {
  const rect = svgWrap.value.getBoundingClientRect()
  let x = evt.clientX - rect.left + 10
  let y = evt.clientY - rect.top - 10
  if (x + 160 > rect.width) x = evt.clientX - rect.left - 170
  if (y + 180 > rect.height) y = evt.clientY - rect.top - 190
  popup.x = x
  popup.y = y
  popup.seg = seg
  popup.visible = true
}

function selectMotion(val) {
  form.wall_motion = { ...form.wall_motion, [popup.seg.id]: val }
  popup.visible = false
}

function segFill(seg) {
  return FILL_MAP[form.wall_motion[seg.id]] || '#f1f5f9'
}
function segStroke(seg) {
  return hoveredSeg.value === seg.id ? '#1d4ed8' : form.wall_motion[seg.id] ? '#fff' : '#cbd5e1'
}
function segStrokeW(seg) {
  return hoveredSeg.value === seg.id ? 2.5 : 1.5
}

// ─── Grade options ────────────────────────────────────────────────
const GRADE_OPTS = ['Tidak Ada', 'Trace', 'Ringan', 'Sedang', 'Berat']
const EFUSI_OPTS = ['Tidak Ada', 'Minimal', 'Sedang', 'Besar']
const DIAS_OPTS = [
  'Normal',
  'Grade I - Gangguan Relaksasi',
  'Grade II - Pseudonormal',
  'Grade III - Restriktif Reversibel',
  'Grade IV - Restriktif Ireversibel',
]
const JENIS_OPTS = ['TTE', 'TEE', 'Stress Echo', '3D Echo']

// ─── Template kesan cepat ─────────────────────────────────────────
const KESAN_TEMPLATES = [
  {
    label: 'Normal',
    text: 'LV ukuran dan ketebalan dinding normal. Fungsi sistolik LV baik, EF normal. Fungsi diastolik LV normal. Katup-katup jantung dalam batas normal, tidak tampak regurgitasi maupun stenosis yang bermakna. Perikardium normal, tidak tampak efusi. Gerakan dinding segmental normal pada seluruh 17 segmen.',
  },
  {
    label: 'Disfungsi Sistolik',
    text: 'LV dilatasi dengan penurunan fungsi sistolik global, EF menurun. Tampak gangguan gerakan dinding segmental. Fungsi diastolik terganggu. Katup mitral dan trikuspid dalam batas normal. Tidak tampak efusi perikardium yang bermakna.',
  },
  {
    label: 'Disfungsi Diastolik',
    text: 'LV ukuran normal, fungsi sistolik LV baik, EF normal. Disfungsi diastolik LV. LA membesar. Katup-katup jantung dalam batas normal. Perikardium normal, tidak tampak efusi.',
  },
  {
    label: 'Efusi Perikardium',
    text: 'Tampak efusi perikardium. Fungsi sistolik LV baik, EF dalam batas normal. Tidak tampak tanda-tanda tamponade jantung. Katup-katup jantung dalam batas normal. Gerakan dinding segmental normal.',
  },
  {
    label: 'Hipertensi',
    text: 'LV hipertrofi konsentrik. Fungsi sistolik LV baik, EF normal. Disfungsi diastolik LV grade I (gangguan relaksasi). LA sedikit membesar. Katup-katup jantung dalam batas normal. Tidak tampak efusi perikardium.',
  },
]

defineExpose({ getFormData: () => ({ ...form }) })
</script>

<template>
  <div class="echo-wrapper" @click.self="popup.visible = false">
    <!-- ══ A. Jenis & Indikasi ══════════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-wave-pulse" style="color: #dc2626; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0"><strong>JENIS PEMERIKSAAN ECHO</strong></h6>
        </div>
      </template>
      <div class="row">
        <div class="col-md-3">
          <label class="field-label">Jenis Ekokardiografi</label>
          <Select v-model="form.jenis_echo" :options="JENIS_OPTS" class="w-full" />
        </div>
        <div class="col-md-9">
          <label class="field-label">Indikasi Pemeriksaan</label>
          <InputText
            v-model="form.indikasi"
            class="w-full"
            placeholder="Indikasi klinis / keluhan utama..."
          />
        </div>
      </div>
    </Panel>

    <!-- ══ B. Dimensi & Fungsi LV ══════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-chart-bar" style="color: #2563eb; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0">
            <strong>DIMENSI &amp; FUNGSI VENTRIKEL KIRI (LV)</strong>
          </h6>
        </div>
      </template>
      <div class="row g-3">
        <div class="col-md-3" :class="{ 'fg-abnormal': isAbnormal('lvedd', form.lvedd) }">
          <label class="field-label">LVEDD (mm) <span class="range-hint">35–56</span></label>
          <InputGroup
            ><InputNumber
              v-model="form.lvedd"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              placeholder="35–56"
              fluid
            />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('lvedd', form.lvedd)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('lvedd') }}</small
          >
        </div>
        <div class="col-md-3" :class="{ 'fg-abnormal': isAbnormal('lvesd', form.lvesd) }">
          <label class="field-label">LVESD (mm) <span class="range-hint">20–40</span></label>
          <InputGroup
            ><InputNumber
              v-model="form.lvesd"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              placeholder="20–40"
              fluid
            />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('lvesd', form.lvesd)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('lvesd') }}</small
          >
        </div>
        <div class="col-md-3" :class="{ 'fg-abnormal': isAbnormal('ivsd', form.ivsd) }">
          <label class="field-label">IVSd (mm) <span class="range-hint">6–12</span></label>
          <InputGroup
            ><InputNumber
              v-model="form.ivsd"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              placeholder="6–12"
              fluid
            />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('ivsd', form.ivsd)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('ivsd') }}</small
          >
        </div>
        <div class="col-md-3" :class="{ 'fg-abnormal': isAbnormal('lvpwd', form.lvpwd) }">
          <label class="field-label">LVPWd (mm) <span class="range-hint">6–12</span></label>
          <InputGroup
            ><InputNumber
              v-model="form.lvpwd"
              :min-fraction-digits="1"
              :max-fraction-digits="1"
              placeholder="6–12"
              fluid
            />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('lvpwd', form.lvpwd)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('lvpwd') }}</small
          >
        </div>
        <div class="col-md-3">
          <label class="field-label">LVEDV (mL)</label>
          <InputGroup
            ><InputNumber v-model="form.lvedv" :min-fraction-digits="0" placeholder="EDV" fluid />
            <InputGroupAddon>mL</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-3">
          <label class="field-label">LVESV (mL)</label>
          <InputGroup
            ><InputNumber v-model="form.lvesv" :min-fraction-digits="0" placeholder="ESV" fluid />
            <InputGroupAddon>mL</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-3" :class="{ 'fg-abnormal': isAbnormal('ef_simpson', form.ef_simpson) }">
          <label class="field-label">EF Simpson (%) <span class="range-hint">≥55</span></label>
          <InputGroup>
            <InputNumber
              v-model="form.ef_simpson"
              :min-fraction-digits="1"
              placeholder="Auto / Manual"
              fluid
            />
            <InputGroupAddon>%</InputGroupAddon>
          </InputGroup>
          <div
            v-if="form.ef_simpson !== null"
            class="ef-badge"
            :class="
              form.ef_simpson >= 55
                ? 'ef-badge--ok'
                : form.ef_simpson >= 40
                  ? 'ef-badge--border'
                  : 'ef-badge--low'
            "
          >
            {{
              form.ef_simpson >= 55
                ? 'Normal (≥55%)'
                : form.ef_simpson >= 40
                  ? 'Borderline (40–54%)'
                  : 'Disfungsi Sistolik (<40%)'
            }}
          </div>
        </div>
        <div class="col-md-3" :class="{ 'fg-abnormal': isAbnormal('fs', form.fs) }">
          <label class="field-label">FS (%) <span class="range-hint">25–45</span></label>
          <InputGroup
            ><InputNumber v-model="form.fs" :min-fraction-digits="1" placeholder="25–45" fluid />
            <InputGroupAddon>%</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('fs', form.fs)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('fs') }}</small
          >
        </div>
        <div class="col-md-3">
          <label class="field-label">LV Mass (g) <span class="range-hint">Auto</span></label>
          <InputGroup
            ><InputNumber v-model="form.lv_mass" :min-fraction-digits="0" fluid />
            <InputGroupAddon>g</InputGroupAddon></InputGroup
          >
        </div>
      </div>
    </Panel>

    <!-- ══ C. Fungsi Diastolik ════════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-wave-pulse" style="color: #7c3aed; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0"><strong>FUNGSI DIASTOLIK LV</strong></h6>
        </div>
      </template>
      <div class="row g-3">
        <div class="col-md-2">
          <label class="field-label">E (cm/s)</label>
          <InputGroup
            ><InputNumber v-model="form.e_vel" :min-fraction-digits="1" fluid />
            <InputGroupAddon>cm/s</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">A (cm/s)</label>
          <InputGroup
            ><InputNumber v-model="form.a_vel" :min-fraction-digits="1" fluid />
            <InputGroupAddon>cm/s</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('e_a_ratio', form.e_a_ratio) }">
          <label class="field-label">E/A Ratio <span class="range-hint">0.8–2.0</span></label>
          <InputGroup
            ><InputNumber
              v-model="form.e_a_ratio"
              :min-fraction-digits="2"
              placeholder="Auto"
              fluid
            />
            <InputGroupAddon>—</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('e_a_ratio', form.e_a_ratio)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('e_a_ratio') }}</small
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">DT (ms)</label>
          <InputGroup
            ><InputNumber v-model="form.dt" :min-fraction-digits="0" fluid />
            <InputGroupAddon>ms</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">IVRT (ms)</label>
          <InputGroup
            ><InputNumber v-model="form.ivrt" :min-fraction-digits="0" fluid />
            <InputGroupAddon>ms</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">E' Septal (cm/s)</label>
          <InputGroup
            ><InputNumber v-model="form.e_prime_s" :min-fraction-digits="1" fluid />
            <InputGroupAddon>cm/s</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">E' Lateral (cm/s)</label>
          <InputGroup
            ><InputNumber v-model="form.e_prime_l" :min-fraction-digits="1" fluid />
            <InputGroupAddon>cm/s</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('e_e_prime', form.e_e_prime) }">
          <label class="field-label">E/E' Ratio <span class="range-hint">≤14</span></label>
          <InputGroup
            ><InputNumber
              v-model="form.e_e_prime"
              :min-fraction-digits="1"
              placeholder="Auto"
              fluid
            />
            <InputGroupAddon>—</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('e_e_prime', form.e_e_prime)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> Tekanan pengisian LV meningkat</small
          >
        </div>
        <div class="col-md-8">
          <label class="field-label">Grading Disfungsi Diastolik</label>
          <Select
            v-model="form.grading_dias"
            :options="DIAS_OPTS"
            placeholder="— Pilih Grade —"
            class="w-full"
          />
        </div>
      </div>
    </Panel>

    <!-- ══ D. Dimensi Ruang & RV ══════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-objects-column" style="color: #0d9488; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0">
            <strong>DIMENSI RUANG JANTUNG &amp; FUNGSI RV</strong>
          </h6>
        </div>
      </template>
      <div class="row g-3">
        <div class="col-md-2">
          <label class="field-label">LA Diameter (mm)</label>
          <InputGroup
            ><InputNumber v-model="form.la_diam" :min-fraction-digits="1" fluid />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">LA Volume (mL)</label>
          <InputGroup
            ><InputNumber v-model="form.la_vol" :min-fraction-digits="0" fluid />
            <InputGroupAddon>mL</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">RA Area (cm²)</label>
          <InputGroup
            ><InputNumber v-model="form.ra_area" :min-fraction-digits="1" fluid />
            <InputGroupAddon>cm²</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('rvd', form.rvd) }">
          <label class="field-label">RVd (mm) <span class="range-hint">≤42</span></label>
          <InputGroup
            ><InputNumber v-model="form.rvd" :min-fraction-digits="1" fluid />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('rvd', form.rvd)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('rvd') }}</small
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('ao_root', form.ao_root) }">
          <label class="field-label">Aorta Root (mm) <span class="range-hint">≤40</span></label>
          <InputGroup
            ><InputNumber v-model="form.ao_root" :min-fraction-digits="1" fluid />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('ao_root', form.ao_root)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('ao_root') }}</small
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('asc_ao', form.asc_ao) }">
          <label class="field-label">Ascending Ao (mm) <span class="range-hint">≤40</span></label>
          <InputGroup
            ><InputNumber v-model="form.asc_ao" :min-fraction-digits="1" fluid />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('asc_ao', form.asc_ao)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('asc_ao') }}</small
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('tapse', form.tapse) }">
          <label class="field-label">TAPSE (mm) <span class="range-hint">≥17</span></label>
          <InputGroup
            ><InputNumber v-model="form.tapse" :min-fraction-digits="1" fluid />
            <InputGroupAddon>mm</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('tapse', form.tapse)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> Disfungsi sistolik RV</small
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">S' RV (cm/s)</label>
          <InputGroup
            ><InputNumber v-model="form.s_prime_rv" :min-fraction-digits="1" fluid />
            <InputGroupAddon>cm/s</InputGroupAddon></InputGroup
          >
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('rvfac', form.rvfac) }">
          <label class="field-label">RVFAC (%) <span class="range-hint">≥35</span></label>
          <InputGroup
            ><InputNumber v-model="form.rvfac" :min-fraction-digits="1" fluid />
            <InputGroupAddon>%</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('rvfac', form.rvfac)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i> {{ rangeHint('rvfac') }}</small
          >
        </div>
        <div class="col-md-2">
          <label class="field-label">TR Velocity (m/s)</label>
          <InputGroup
            ><InputNumber v-model="form.tr_vel" :min-fraction-digits="2" fluid />
            <InputGroupAddon>m/s</InputGroupAddon></InputGroup
          >
          <small class="range-hint-inline">Auto-hitung PASP</small>
        </div>
        <div class="col-md-2" :class="{ 'fg-abnormal': isAbnormal('pasp', form.pasp) }">
          <label class="field-label">PASP (mmHg) <span class="range-hint">≤35</span></label>
          <InputGroup
            ><InputNumber v-model="form.pasp" :min-fraction-digits="0" fluid />
            <InputGroupAddon>mmHg</InputGroupAddon></InputGroup
          >
          <small v-if="isAbnormal('pasp', form.pasp)" class="abnormal-msg"
            ><i class="pi pi-exclamation-triangle"></i>
            {{ form.pasp > 50 ? 'Hipertensi pulmonal berat' : 'Hipertensi pulmonal' }}
          </small>
        </div>
      </div>
    </Panel>

    <!-- ══ E. Katup ═══════════════════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-circle-fill" style="color: #ea580c; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0"><strong>PENILAIAN KATUP JANTUNG</strong></h6>
        </div>
      </template>
      <div class="katup-grid">
        <!-- Mitral -->
        <div class="katup-card">
          <div class="katup-title">
            <i class="pi pi-wave-pulse" style="color: #e11d48"></i> Katup Mitral
          </div>
          <div class="mb-2">
            <label class="field-label">Regurgitasi Mitral (MR)</label>
            <Select
              v-model="form.mr_grade"
              :options="GRADE_OPTS"
              class="w-full"
              placeholder="— Grade —"
            />
          </div>
          <div class="row g-2">
            <div class="col-6">
              <label class="field-label">MVA (cm²)</label>
              <InputNumber
                v-model="form.ms_mva"
                :min-fraction-digits="2"
                fluid
                placeholder="Stenosis"
              />
            </div>
            <div class="col-6">
              <label class="field-label">Mean Grad (mmHg)</label>
              <InputNumber v-model="form.ms_grad" :min-fraction-digits="1" fluid />
            </div>
          </div>
        </div>
        <!-- Aorta -->
        <div class="katup-card">
          <div class="katup-title">
            <i
              class="pi pi-arrow-up-right-and-arrow-down-left-from-center"
              style="color: #0284c7"
            ></i>
            Katup Aorta
          </div>
          <div class="mb-2">
            <label class="field-label">Regurgitasi Aorta (AR)</label>
            <Select
              v-model="form.ar_grade"
              :options="GRADE_OPTS"
              class="w-full"
              placeholder="— Grade —"
            />
          </div>
          <div class="row g-2">
            <div class="col-4">
              <label class="field-label">AVA (cm²)</label>
              <InputNumber v-model="form.as_ava" :min-fraction-digits="2" fluid />
            </div>
            <div class="col-4">
              <label class="field-label">Mean Grad</label>
              <InputNumber v-model="form.as_grad" :min-fraction-digits="1" fluid />
            </div>
            <div class="col-4">
              <label class="field-label">Vmax (m/s)</label>
              <InputNumber v-model="form.ao_vmax" :min-fraction-digits="2" fluid />
            </div>
          </div>
        </div>
        <!-- Trikuspid & Pulmonal -->
        <div class="katup-card">
          <div class="katup-title">
            <i class="pi pi-star" style="color: #7c3aed"></i> Trikuspid &amp; Pulmonal
          </div>
          <div class="mb-3">
            <label class="field-label">Regurgitasi Trikuspid (TR)</label>
            <Select
              v-model="form.tr_grade"
              :options="GRADE_OPTS"
              class="w-full"
              placeholder="— Grade —"
            />
          </div>
          <div>
            <label class="field-label">Regurgitasi Pulmonal (PR)</label>
            <Select
              v-model="form.pr_grade"
              :options="GRADE_OPTS"
              class="w-full"
              placeholder="— Grade —"
            />
          </div>
        </div>
      </div>
    </Panel>

    <!-- ══ F. Perikardium ═════════════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-stop-circle" style="color: #475569; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0"><strong>PERIKARDIUM</strong></h6>
        </div>
      </template>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="field-label">Efusi Perikardium</label>
          <Select v-model="form.efusi" :options="EFUSI_OPTS" class="w-full" />
        </div>
        <div class="col-md-9" v-if="form.efusi !== 'Tidak Ada'">
          <label class="field-label">Lokasi Efusi</label>
          <InputText
            v-model="form.lokasi_efusi"
            class="w-full"
            placeholder="Anterior / Posterior / Sirkumferensial..."
          />
        </div>
      </div>
    </Panel>

    <!-- ══ G. Bullseye 17 Segmen ══════════════════════════════════ -->
    <Panel toggleable>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-bullseye" style="color: #dc2626; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0">
            <strong>GERAKAN DINDING — BULLSEYE 17 SEGMEN</strong>
          </h6>
        </div>
      </template>
      <template #icons>
        <div v-if="wmsi" class="wmsi-tag">
          WMSI: <strong>{{ wmsi }}</strong>
          <span class="wmsi-int" :class="wmsi <= 1 ? 'ok' : wmsi <= 1.5 ? 'mild' : 'bad'">
            {{ wmsi <= 1 ? 'Normal' : wmsi <= 1.5 ? 'Ringan' : wmsi <= 2 ? 'Sedang' : 'Berat' }}
          </span>
        </div>
      </template>

      <div class="bullseye-layout">
        <!-- SVG Bullseye -->
        <div class="svg-container" ref="svgWrap">
          <svg viewBox="0 0 320 320" class="bullseye-svg" @click.self="popup.visible = false">
            <!-- Orientation labels -->
            <text x="160" y="10" text-anchor="middle" class="orient-lbl">ANT</text>
            <text x="160" y="316" text-anchor="middle" class="orient-lbl">INF</text>
            <text x="4" y="163" text-anchor="start" class="orient-lbl">SEP</text>
            <text x="316" y="163" text-anchor="end" class="orient-lbl">LAT</text>

            <!-- Ring labels -->
            <text
              :x="CX + 133 * Math.cos(toRad(-15))"
              :y="CY + 133 * Math.sin(toRad(-15))"
              class="ring-lbl"
            >
              BASAL
            </text>
            <text
              :x="CX + 83 * Math.cos(toRad(-18))"
              :y="CY + 83 * Math.sin(toRad(-18))"
              class="ring-lbl"
            >
              MID
            </text>

            <!-- All 17 segments -->
            <g
              v-for="seg in SEGS"
              :key="seg.id"
              @click.stop="openPopup(seg, $event)"
              @mouseenter="hoveredSeg = seg.id"
              @mouseleave="hoveredSeg = null"
              class="seg-group"
            >
              <path
                :d="segPath(seg)"
                :fill="segFill(seg)"
                :stroke="segStroke(seg)"
                :stroke-width="segStrokeW(seg)"
              />
              <text
                :x="segLabelPos(seg).x"
                :y="segLabelPos(seg).y + 1"
                text-anchor="middle"
                dominant-baseline="middle"
                class="seg-num"
                :font-size="seg.ring === 'apex' ? 9 : seg.ring === 'apical' ? 8 : 8"
              >
                {{ seg.id }}
              </text>
            </g>

            <!-- Outer border circle -->
            <circle :cx="CX" :cy="CY" r="155" fill="none" stroke="#94a3b8" stroke-width="1.5" />
          </svg>

          <!-- Popup pilih gerakan -->
          <div
            v-if="popup.visible"
            class="seg-popup"
            :style="{ left: popup.x + 'px', top: popup.y + 'px' }"
          >
            <div class="seg-popup__title">
              <i class="pi pi-map-marker"></i>
              Segmen {{ popup.seg?.id }} — {{ popup.seg?.name }}
            </div>
            <button
              v-for="opt in MOTION_OPTS"
              :key="opt.value"
              class="seg-popup__btn"
              :style="{ background: opt.bg, borderColor: opt.fill, color: opt.text || opt.stroke }"
              @click.stop="selectMotion(opt.value)"
            >
              <span class="seg-popup__dot" :style="{ background: opt.fill }"></span>
              {{ opt.label }}
              <i
                v-if="form.wall_motion[popup.seg?.id] === opt.value"
                class="pi pi-check ml-auto"
              ></i>
            </button>
          </div>
        </div>

        <!-- Panel kanan: legenda + tabel segmen -->
        <div class="bullseye-right">
          <!-- Legend -->
          <div class="legend-box">
            <div class="legend-title">LEGENDA</div>
            <div v-for="opt in MOTION_OPTS" :key="opt.value" class="legend-row">
              <span
                class="legend-dot"
                :style="{ background: opt.fill, borderColor: opt.stroke || opt.fill }"
              ></span>
              <span class="legend-label">{{ opt.label }}</span>
            </div>
          </div>

          <!-- Tabel segmen -->
          <div class="seg-table-wrap">
            <table class="seg-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Segmen</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="seg in SEGS"
                  :key="seg.id"
                  :class="{ 'seg-row--active': hoveredSeg === seg.id }"
                  @click="
                    openPopup(seg, {
                      clientX: svgWrap?.getBoundingClientRect().left + 20,
                      clientY: svgWrap?.getBoundingClientRect().top + 20,
                    })
                  "
                  @mouseenter="hoveredSeg = seg.id"
                  @mouseleave="hoveredSeg = null"
                >
                  <td class="seg-id">{{ seg.id }}</td>
                  <td class="seg-name">{{ seg.name }}</td>
                  <td>
                    <span
                      v-if="form.wall_motion[seg.id]"
                      class="seg-status-chip"
                      :style="{
                        background: FILL_MAP[form.wall_motion[seg.id]],
                        border: '1px solid #e2e8f0',
                      }"
                    >
                      {{ MOTION_OPTS.find((o) => o.value === form.wall_motion[seg.id])?.label }}
                    </span>
                    <span v-else class="seg-status-empty">— klik —</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Input per territory koroner -->
      <div class="territory-wrap mt-3">
        <div class="territory-title"><i class="pi pi-map"></i> Set per Territory Koroner</div>
        <div class="territory-rows">
          <div v-for="artery in ['LAD', 'LCx', 'RCA']" :key="artery" class="territory-row">
            <span class="territory-label" :class="`artery-${artery.toLowerCase()}`">{{
              artery
            }}</span>
            <span class="territory-segs">Seg {{ TERRITORY[artery].join(', ') }}</span>
            <div class="territory-btns">
              <button
                v-for="opt in MOTION_OPTS"
                :key="opt.value"
                type="button"
                class="territory-btn"
                :style="{ background: opt.fill, borderColor: opt.stroke, color: opt.text }"
                @click="setTerritoryMotion(artery, opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol reset -->
      <div class="mt-2 d-flex gap-2 flex-wrap">
        <Button
          label="Reset Semua Normal"
          icon="pi pi-refresh"
          severity="success"
          size="small"
          outlined
          @click="form.wall_motion = Object.fromEntries(SEGS.map((s) => [s.id, 'N']))"
        />
        <Button
          label="Reset Kosong"
          icon="pi pi-trash"
          severity="secondary"
          size="small"
          outlined
          @click="form.wall_motion = {}"
        />
      </div>
    </Panel>

    <!-- ══ H. Kesan ════════════════════════════════════════════════ -->
    <Panel>
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px">
          <i class="pi pi-file-edit" style="color: #16a34a; font-size: 15px"></i>
          <h6 style="color: darkcyan; margin: 0"><strong>KESAN / KESIMPULAN ECHO</strong></h6>
        </div>
      </template>

      <!-- Template cepat -->
      <div class="kesan-templates">
        <Button
          icon="pi pi-magic"
          label="Generate Otomatis"
          size="small"
          severity="info"
          @click="generateKesan"
          style="font-size: 11px; padding: 3px 10px"
        />
        <span class="kesan-tpl-label" style="margin-left: 4px">atau template:</span>
        <button
          v-for="tpl in KESAN_TEMPLATES"
          :key="tpl.label"
          class="kesan-tpl-btn"
          type="button"
          @click="form.kesan = tpl.text"
        >
          {{ tpl.label }}
        </button>
        <button
          v-if="form.kesan"
          class="kesan-tpl-btn kesan-tpl-btn--clear"
          type="button"
          @click="form.kesan = ''"
        >
          <i class="pi pi-times"></i> Hapus
        </button>
      </div>

      <Textarea
        v-model="form.kesan"
        :rows="7"
        auto-resize
        placeholder="Tuliskan kesan / kesimpulan hasil pemeriksaan ekokardiografi di sini..."
        class="custom-textarea"
      />

      <!-- Info karakter -->
      <div class="kesan-footer">
        <span class="kesan-char">{{ form.kesan?.length ?? 0 }} karakter</span>
        <span class="kesan-hint"
          ><i class="pi pi-info-circle"></i> Kesan akan dicetak pada laporan echo</span
        >
      </div>
    </Panel>
  </div>
</template>

<style scoped>
.echo-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.custom-textarea {
  font-size: 13px !important;
  line-height: 1.3;
  width: 100%;
  padding: 12px !important;
  margin-bottom: 1em;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  display: block;
  margin-bottom: 4px;
}

/* EF badge */
.ef-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-top: 4px;
  display: inline-block;
}
.ef-badge--ok {
  background: #dcfce7;
  color: #15803d;
}
.ef-badge--border {
  background: #fef3c7;
  color: #b45309;
}
.ef-badge--low {
  background: #fee2e2;
  color: #b91c1c;
}

/* WMSI tag */
.wmsi-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.wmsi-int {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 999px;
  font-weight: 600;
}
.wmsi-int.ok {
  background: #dcfce7;
  color: #16a34a;
}
.wmsi-int.mild {
  background: #fef3c7;
  color: #b45309;
}
.wmsi-int.bad {
  background: #fee2e2;
  color: #b91c1c;
}

/* Katup */
.katup-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.katup-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
}
.katup-title {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Bullseye layout */
.bullseye-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.svg-container {
  position: relative;
  flex-shrink: 0;
  width: 320px;
}
.bullseye-svg {
  width: 320px;
  height: 320px;
  display: block;
  cursor: crosshair;
  user-select: none;
}

.seg-group {
  cursor: pointer;
  transition: opacity 0.1s;
}
.seg-group:hover path {
  opacity: 0.85;
}

.orient-lbl {
  font-size: 9px;
  font-weight: 700;
  fill: #64748b;
  letter-spacing: 0.5px;
}
.ring-lbl {
  font-size: 7px;
  fill: #94a3b8;
}
.seg-num {
  fill: #1e293b;
  font-weight: 700;
  pointer-events: none;
}

/* Popup */
.seg-popup {
  position: absolute;
  z-index: 50;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  padding: 8px;
  width: 168px;
}
.seg-popup__title {
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  padding: 0 4px 6px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.seg-popup__btn {
  width: 100%;
  text-align: left;
  border-radius: 6px;
  padding: 5px 8px;
  margin-bottom: 3px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: filter 0.1s;
}
.seg-popup__btn:hover {
  filter: brightness(0.95);
}
.seg-popup__btn:last-child {
  margin-bottom: 0;
}
.seg-popup__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Right panel */
.bullseye-right {
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Legend */
.legend-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
}
.legend-title {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}
.legend-row:last-child {
  margin-bottom: 0;
}
.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1.5px solid #e2e8f0;
  flex-shrink: 0;
}
.legend-label {
  font-size: 12px;
  color: #334155;
  font-weight: 500;
}

/* Segment table */
.seg-table-wrap {
  overflow-y: auto;
  max-height: 260px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.seg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.seg-table thead tr {
  background: #f8fafc;
  position: sticky;
  top: 0;
}
.seg-table th {
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}
.seg-table td {
  padding: 5px 8px;
  border-bottom: 1px solid #f1f5f9;
}
.seg-table tbody tr:last-child td {
  border-bottom: none;
}
.seg-table tbody tr {
  cursor: pointer;
}
.seg-table tbody tr:hover {
  background: #f8fafc;
}
.seg-row--active {
  background: #eff6ff !important;
}
.seg-id {
  font-weight: 700;
  color: #1e293b;
  width: 24px;
}
.seg-name {
  color: #475569;
}
.seg-status-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  display: inline-block;
}
.seg-status-empty {
  font-size: 11px;
  color: #cbd5e1;
}

/* ── Highlight nilai abnormal ── */
.fg-abnormal .field-label {
  color: #dc2626;
}
.fg-abnormal :deep(.p-inputnumber-input) {
  border-color: #fca5a5;
  background: #fff5f5;
}
.fg-abnormal :deep(.p-inputgroup) {
  border-radius: 6px;
  box-shadow: 0 0 0 2px #fee2e2;
}
.range-hint {
  font-size: 10px;
  font-weight: 400;
  color: #94a3b8;
  margin-left: 4px;
}
.range-hint-inline {
  font-size: 10px;
  color: #94a3b8;
  display: block;
  margin-top: 2px;
}
.abnormal-msg {
  font-size: 11px;
  color: #dc2626;
  font-weight: 600;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── Territory koroner ── */
.territory-wrap {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
}
.territory-title {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.territory-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.territory-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.territory-label {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  min-width: 44px;
  text-align: center;
  flex-shrink: 0;
}
.artery-lad {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}
.artery-lcx {
  background: #fce7f3;
  color: #9d174d;
  border: 1px solid #f9a8d4;
}
.artery-rca {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #86efac;
}
.territory-segs {
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
  min-width: 80px;
}
.territory-btns {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.territory-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: filter 0.1s;
}
.territory-btn:hover {
  filter: brightness(0.92);
}

/* Kesan panel */
.kesan-templates {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.kesan-tpl-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  margin-right: 2px;
}
.kesan-tpl-btn {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid #bae6fd;
  background: #f0f9ff;
  color: #0369a1;
  cursor: pointer;
  transition:
    background 0.12s,
    border-color 0.12s;
}
.kesan-tpl-btn:hover {
  background: #e0f2fe;
  border-color: #7dd3fc;
}
.kesan-tpl-btn--clear {
  border-color: #fca5a5;
  background: #fff1f2;
  color: #be123c;
}
.kesan-tpl-btn--clear:hover {
  background: #ffe4e6;
}
.kesan-area {
  font-size: 13px;
  line-height: 1.7;
  resize: vertical;
}
.kesan-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}
.kesan-char {
  font-weight: 600;
  color: #64748b;
}
.kesan-hint {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Responsive */
@media (max-width: 640px) {
  .katup-grid {
    grid-template-columns: 1fr;
  }
  .bullseye-layout {
    flex-direction: column;
  }
  .svg-container,
  .bullseye-svg {
    width: 280px;
    height: 280px;
  }
}
:deep(.p-panel-header) {
  padding: 8px 14px;
  background: #f8fafc;
}
:deep(.p-panel-content) {
  padding: 14px;
}
</style>
