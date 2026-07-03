<script setup>
import { reactive, ref, watch, nextTick } from 'vue'

// ─── Props & Emits ────────────────────────────────────────────
const props = defineProps({
  modelValue: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

// ─── Active State ─────────────────────────────────────────────
const activeTab  = ref('inspeksi')   // PrimeVue 4 Tabs pakai value string
const activeZones = reactive({ palpasi: null, perkusi: null, auskultasi: null })

// ─── Form Data ────────────────────────────────────────────────
const formData = reactive({
  inspeksi: {
    bentuk_dada: '',
    pola_napas: '',
    frekuensi_napas: null,
    retraksi: '',
    sianosis: '',
    clubbing_fingers: ''
  },
  palpasi: {
    KA:  { fremitus: '', nyeri_tekan: '', catatan: '' },
    KT:  { fremitus: '', nyeri_tekan: '', catatan: '' },
    KB:  { fremitus: '', nyeri_tekan: '', catatan: '' },
    KiA: { fremitus: '', nyeri_tekan: '', catatan: '' },
    KiT: { fremitus: '', nyeri_tekan: '', catatan: '' },
    KiB: { fremitus: '', nyeri_tekan: '', catatan: '' }
  },
  perkusi: {
    KA:  { hasil: '', catatan: '' },
    KT:  { hasil: '', catatan: '' },
    KB:  { hasil: '', catatan: '' },
    KiA: { hasil: '', catatan: '' },
    KiT: { hasil: '', catatan: '' },
    KiB: { hasil: '', catatan: '' }
  },
  auskultasi: {
    KA:  { suara_dasar: '', suara_tambahan: [], catatan: '' },
    KT:  { suara_dasar: '', suara_tambahan: [], catatan: '' },
    KB:  { suara_dasar: '', suara_tambahan: [], catatan: '' },
    KiA: { suara_dasar: '', suara_tambahan: [], catatan: '' },
    KiT: { suara_dasar: '', suara_tambahan: [], catatan: '' },
    KiB: { suara_dasar: '', suara_tambahan: [], catatan: '' }
  }
})

// ─── Sync dari modelValue (termasuk setelah load async) ──────
let isApplying = false

function applyModelValue(mv) {
  if (!mv) return
  isApplying = true
  if (mv.inspeksi) Object.assign(formData.inspeksi, mv.inspeksi)
  for (const tabKey of ['palpasi', 'perkusi', 'auskultasi']) {
    if (mv[tabKey]) {
      for (const zoneKey of Object.keys(formData[tabKey])) {
        if (mv[tabKey][zoneKey]) Object.assign(formData[tabKey][zoneKey], mv[tabKey][zoneKey])
      }
    }
  }
  nextTick(() => { isApplying = false })
}

applyModelValue(props.modelValue)
watch(() => props.modelValue, applyModelValue)

// ─── Options ──────────────────────────────────────────────────
const optBentukDada = [
  'Normal/Simetris', 'Barrel chest', 'Kifoskoliosis',
  'Pectus excavatum', 'Pectus carinatum', 'Asimetris'
]
const optPolaNapas      = ['Eupnea', 'Takipnea', 'Bradipnea', 'Cheyne-Stokes', 'Kussmaul', 'Apneustik']
const optRetraksi       = ['Tidak ada', 'Ringan', 'Sedang', 'Berat']
const optSianosis       = ['Tidak ada', 'Perifer', 'Sentral']
const optClubbingFingers= ['Tidak ada', 'Grade 1', 'Grade 2', 'Grade 3']
const optFremitus       = ['Normal', 'Meningkat', 'Menurun', 'Menghilang']
const optPerkusi        = ['Sonor', 'Redup', 'Pekak', 'Hipersonor', 'Timpani']
const optSuaraDasar     = ['Normal', 'Melemah', 'Mengeras', 'Menghilang']
const optSuaraTambahan  = [
  'Rhonki basah halus', 'Rhonki basah kasar', 'Rhonki kering',
  'Wheezing', 'Krepitasi', 'Pleural friction rub', 'Tidak ada'
]

// ─── SVG Config ───────────────────────────────────────────────
const svgTabs    = ['palpasi', 'perkusi', 'auskultasi']
const TAB_HEADERS = { palpasi: 'Palpasi', perkusi: 'Perkusi', auskultasi: 'Auskultasi' }
const ZONE_LABELS = {
  KA: 'Kanan - Atas', KT: 'Kanan - Tengah', KB: 'Kanan - Bawah',
  KiA: 'Kiri - Atas', KiT: 'Kiri - Tengah', KiB: 'Kiri - Bawah'
}

const ZONE_CENTERS = {
  KA: [82, 87],   KT: [82, 203],   KB: [82, 307],
  KiA: [228, 87], KiT: [228, 203], KiB: [228, 307]
}

const ZONE_RECTS = {
  KA:  { x: -5,  y: 0,   w: 165, h: 148, clip: 'kan' },
  KT:  { x: -5,  y: 148, w: 165, h: 110, clip: 'kan' },
  KB:  { x: -5,  y: 258, w: 165, h: 140, clip: 'kan' },
  KiA: { x: 150, y: 0,   w: 165, h: 148, clip: 'kir' },
  KiT: { x: 150, y: 148, w: 165, h: 110, clip: 'kir' },
  KiB: { x: 150, y: 258, w: 165, h: 140, clip: 'kir' }
}

const PERKUSI_FILL = {
  Sonor: '#86EFAC', Redup: '#FCA5A5', Pekak: '#F87171',
  Hipersonor: '#FDE68A', Timpani: '#FCD34D'
}

// ─── Methods ──────────────────────────────────────────────────
function selectZone(tabKey, zoneKey) {
  activeZones[tabKey] = activeZones[tabKey] === zoneKey ? null : zoneKey
}

function hasZoneData(tabKey, zoneKey) {
  const d = formData[tabKey][zoneKey]
  if (tabKey === 'palpasi')    return !!(d.fremitus || d.nyeri_tekan || d.catatan)
  if (tabKey === 'perkusi')    return !!(d.hasil || d.catatan)
  if (tabKey === 'auskultasi') return !!(d.suara_dasar || d.suara_tambahan?.length || d.catatan)
  return false
}

function getZoneFill(tabKey, zoneKey) {
  const isSelected = activeZones[tabKey] === zoneKey
  const d = formData[tabKey][zoneKey]

  if (tabKey === 'perkusi' && d.hasil) {
    const base = PERKUSI_FILL[d.hasil] || '#F1F5F9'
    return isSelected ? darken(base, 25) : base
  }

  const hasData = hasZoneData(tabKey, zoneKey)
  if (isSelected) return hasData ? '#60A5FA' : '#93C5FD'
  return hasData ? '#BAE6FD' : '#F1F5F9'
}

function darken(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - amount)
  const g = Math.max(0, ((n >> 8) & 0xff) - amount)
  const b = Math.max(0, (n & 0xff) - amount)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function getZoneSummary(tabKey, zoneKey) {
  const d = formData[tabKey][zoneKey]
  if (tabKey === 'palpasi' && d.fremitus)  return d.fremitus
  if (tabKey === 'perkusi' && d.hasil)     return d.hasil
  if (tabKey === 'auskultasi') {
    const parts = []
    if (d.suara_dasar)          parts.push(d.suara_dasar)
    if (d.suara_tambahan?.length) parts.push(`+${d.suara_tambahan.length}`)
    return parts.join(' ')
  }
  return ''
}

function getPerkusiChipClass(opt, currentValue) {
  const colorClass = {
    Sonor: 'chip-green', Redup: 'chip-red', Pekak: 'chip-red',
    Hipersonor: 'chip-yellow', Timpani: 'chip-yellow'
  }[opt] || ''
  return ['chip', colorClass, { 'chip--active': currentValue === opt }]
}

function toggleSuaraTambahan(zoneKey, item) {
  const list = formData.auskultasi[zoneKey].suara_tambahan
  if (item === 'Tidak ada') {
    formData.auskultasi[zoneKey].suara_tambahan = list.includes('Tidak ada') ? [] : ['Tidak ada']
    return
  }
  const cleaned = list.filter(x => x !== 'Tidak ada')
  const idx = cleaned.indexOf(item)
  formData.auskultasi[zoneKey].suara_tambahan = idx === -1
    ? [...cleaned, item]
    : cleaned.filter((_, i) => i !== idx)
}

// ─── Watch → Emit ─────────────────────────────────────────────
watch(formData, (val) => {
  if (isApplying) return
  emit('update:modelValue', JSON.parse(JSON.stringify(val)))
}, { deep: true })

// ─── Public API ───────────────────────────────────────────────
defineExpose({
  getFormData: () => JSON.parse(JSON.stringify(formData)),
  reset() {
    Object.assign(formData.inspeksi, {
      bentuk_dada: '', pola_napas: '', frekuensi_napas: null,
      retraksi: '', sianosis: '', clubbing_fingers: ''
    })
    for (const tab of ['palpasi', 'perkusi', 'auskultasi']) {
      for (const zone of Object.keys(formData[tab])) {
        if (tab === 'palpasi')
          Object.assign(formData[tab][zone], { fremitus: '', nyeri_tekan: '', catatan: '' })
        else if (tab === 'perkusi')
          Object.assign(formData[tab][zone], { hasil: '', catatan: '' })
        else
          Object.assign(formData[tab][zone], { suara_dasar: '', suara_tambahan: [], catatan: '' })
      }
    }
    Object.assign(activeZones, { palpasi: null, perkusi: null, auskultasi: null })
  }
})
</script>

<template>
  <div class="pfp">
    <!-- PrimeVue 4: Tabs + TabList + Tab + TabPanels + TabPanel -->
    <Tabs v-model:value="activeTab">

      <TabList>
        <Tab value="inspeksi">Inspeksi</Tab>
        <Tab v-for="tabKey in svgTabs" :key="`tab-${tabKey}`" :value="tabKey">
          {{ TAB_HEADERS[tabKey] }}
        </Tab>
      </TabList>

      <TabPanels>

        <!-- ══════════════════════ PANEL: INSPEKSI ══════════════════════ -->
        <TabPanel value="inspeksi">
          <div class="inspeksi-grid">

            <div class="field-group">
              <label class="field-label">Bentuk Dada</label>
              <Select
                v-model="formData.inspeksi.bentuk_dada"
                :options="optBentukDada"
                placeholder="Pilih bentuk dada..."
                class="w-full"
                show-clear
              />
            </div>

            <div class="field-group">
              <label class="field-label">Pola Napas</label>
              <Select
                v-model="formData.inspeksi.pola_napas"
                :options="optPolaNapas"
                placeholder="Pilih pola napas..."
                class="w-full"
                show-clear
              />
            </div>

            <div class="field-group">
              <label class="field-label">
                Frekuensi Napas
                <span class="unit">(RR / menit)</span>
              </label>
              <InputNumber
                v-model="formData.inspeksi.frekuensi_napas"
                :min="0"
                :max="99"
                :use-grouping="false"
                placeholder="0"
                suffix=" x/mnt"
                class="w-full"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Retraksi</label>
              <Select
                v-model="formData.inspeksi.retraksi"
                :options="optRetraksi"
                placeholder="Pilih retraksi..."
                class="w-full"
                show-clear
              />
            </div>

            <div class="field-group">
              <label class="field-label">Sianosis</label>
              <Select
                v-model="formData.inspeksi.sianosis"
                :options="optSianosis"
                placeholder="Pilih sianosis..."
                class="w-full"
                show-clear
              />
            </div>

            <div class="field-group">
              <label class="field-label">Clubbing Fingers</label>
              <Select
                v-model="formData.inspeksi.clubbing_fingers"
                :options="optClubbingFingers"
                placeholder="Pilih grade..."
                class="w-full"
                show-clear
              />
            </div>

          </div>
        </TabPanel>

        <!-- ══════════════════════ PANELS: PALPASI / PERKUSI / AUSKULTASI ══════════════════════ -->
        <TabPanel v-for="tabKey in svgTabs" :key="`panel-${tabKey}`" :value="tabKey">
          <div class="lung-layout">

            <!-- ─── Kolom SVG ─── -->
            <div class="svg-col">
              <p class="svg-hint">
                <i class="pi pi-hand-pointer" style="font-size:0.8rem"></i>
                Klik zona untuk mengisi data {{ TAB_HEADERS[tabKey] }}
              </p>

              <svg
                viewBox="0 0 310 385"
                xmlns="http://www.w3.org/2000/svg"
                class="lung-svg"
                aria-label="Diagram paru anterior"
              >
                <defs>
                  <clipPath :id="`kan_${tabKey}`">
                    <path d="M 82,26 C 108,18 140,36 150,66 C 157,94 154,138 151,182 C 147,225 140,266 128,300 C 116,332 99,352 80,356 C 61,360 43,344 32,324 C 21,304 18,274 20,242 C 22,210 28,176 34,143 C 40,110 46,76 56,52 C 66,30 72,22 82,26 Z" />
                  </clipPath>
                  <clipPath :id="`kir_${tabKey}`">
                    <path d="M 228,26 C 202,18 170,36 160,66 C 153,94 156,138 159,182 C 163,225 170,266 182,300 C 194,332 211,352 230,356 C 249,360 267,344 278,324 C 289,304 292,274 290,242 C 288,210 282,176 276,143 C 270,110 264,76 254,52 C 244,30 238,22 228,26 Z" />
                  </clipPath>
                </defs>

                <!-- Header label -->
                <text x="82"  y="13" text-anchor="middle" fill="#1E293B" font-size="13" font-weight="600" pointer-events="none">Kanan</text>
                <text x="228" y="13" text-anchor="middle" fill="#1E293B" font-size="13" font-weight="600" pointer-events="none">Kiri</text>

                <!-- KANAN zones -->
                <rect x="-5"  y="0"   width="165" height="148" :clip-path="`url(#kan_${tabKey})`" :fill="getZoneFill(tabKey,'KA')"  class="lung-zone" @click="selectZone(tabKey,'KA')" />
                <rect x="-5"  y="148" width="165" height="110" :clip-path="`url(#kan_${tabKey})`" :fill="getZoneFill(tabKey,'KT')"  class="lung-zone" @click="selectZone(tabKey,'KT')" />
                <rect x="-5"  y="258" width="165" height="140" :clip-path="`url(#kan_${tabKey})`" :fill="getZoneFill(tabKey,'KB')"  class="lung-zone" @click="selectZone(tabKey,'KB')" />

                <!-- KIRI zones -->
                <rect x="150" y="0"   width="165" height="148" :clip-path="`url(#kir_${tabKey})`" :fill="getZoneFill(tabKey,'KiA')" class="lung-zone" @click="selectZone(tabKey,'KiA')" />
                <rect x="150" y="148" width="165" height="110" :clip-path="`url(#kir_${tabKey})`" :fill="getZoneFill(tabKey,'KiT')" class="lung-zone" @click="selectZone(tabKey,'KiT')" />
                <rect x="150" y="258" width="165" height="140" :clip-path="`url(#kir_${tabKey})`" :fill="getZoneFill(tabKey,'KiB')" class="lung-zone" @click="selectZone(tabKey,'KiB')" />

                <!-- Lung outlines -->
                <path d="M 82,26 C 108,18 140,36 150,66 C 157,94 154,138 151,182 C 147,225 140,266 128,300 C 116,332 99,352 80,356 C 61,360 43,344 32,324 C 21,304 18,274 20,242 C 22,210 28,176 34,143 C 40,110 46,76 56,52 C 66,30 72,22 82,26 Z"
                  fill="none" stroke="#475569" stroke-width="2" pointer-events="none" />
                <path d="M 228,26 C 202,18 170,36 160,66 C 153,94 156,138 159,182 C 163,225 170,266 182,300 C 194,332 211,352 230,356 C 249,360 267,344 278,324 C 289,304 292,274 290,242 C 288,210 282,176 276,143 C 270,110 264,76 254,52 C 244,30 238,22 228,26 Z"
                  fill="none" stroke="#475569" stroke-width="2" pointer-events="none" />

                <!-- Divider lines Kanan -->
                <line x1="-5"  y1="148" x2="160" y2="148" :clip-path="`url(#kan_${tabKey})`" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" pointer-events="none" />
                <line x1="-5"  y1="258" x2="160" y2="258" :clip-path="`url(#kan_${tabKey})`" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" pointer-events="none" />

                <!-- Divider lines Kiri -->
                <line x1="150" y1="148" x2="315" y2="148" :clip-path="`url(#kir_${tabKey})`" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" pointer-events="none" />
                <line x1="150" y1="258" x2="315" y2="258" :clip-path="`url(#kir_${tabKey})`" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="5,3" pointer-events="none" />

                <!-- Zone labels + data summary -->
                <!-- v-for object: (value, key) -->
                <template v-for="(_, zone) in ZONE_RECTS" :key="`lbl_${zone}`">
                  <text
                    :x="ZONE_CENTERS[zone][0]"
                    :y="ZONE_CENTERS[zone][1] - 8"
                    text-anchor="middle" fill="#475569" font-size="10" pointer-events="none"
                  >{{ zone.endsWith('A') ? 'Atas' : zone.endsWith('T') ? 'Tengah' : 'Bawah' }}</text>

                  <text
                    v-if="getZoneSummary(tabKey, zone)"
                    :x="ZONE_CENTERS[zone][0]"
                    :y="ZONE_CENTERS[zone][1] + 8"
                    text-anchor="middle" fill="#1E293B" font-size="9" font-weight="600" pointer-events="none"
                  >{{ getZoneSummary(tabKey, zone) }}</text>
                </template>

                <!-- Selection border overlay -->
                <template v-for="(rect, zone) in ZONE_RECTS" :key="`sel_${zone}`">
                  <rect
                    v-if="activeZones[tabKey] === zone"
                    :x="rect.x" :y="rect.y" :width="rect.w" :height="rect.h"
                    :clip-path="`url(#${rect.clip}_${tabKey})`"
                    fill="none" stroke="#2563EB" stroke-width="3" pointer-events="none"
                  />
                </template>
              </svg>

              <!-- Legenda Perkusi -->
              <div v-if="tabKey === 'perkusi'" class="perkusi-legend">
                <span class="legend-item legend-sonor">Sonor</span>
                <span class="legend-item legend-abnormal">Redup / Pekak</span>
                <span class="legend-item legend-warning">Hipersonor / Timpani</span>
              </div>
            </div>

            <!-- ─── Kolom Panel Input ─── -->
            <div class="panel-col">
              <transition name="panel-slide" mode="out-in">

                <div v-if="activeZones[tabKey]" :key="activeZones[tabKey]" class="zone-form">
                  <div class="zone-form-header">
                    <i class="pi pi-map-marker"></i>
                    {{ ZONE_LABELS[activeZones[tabKey]] }}
                  </div>

                  <!-- PALPASI -->
                  <template v-if="tabKey === 'palpasi'">
                    <div class="field-group">
                      <label class="field-label">Fremitus Vokal</label>
                      <div class="chip-row">
                        <span
                          v-for="opt in optFremitus" :key="opt"
                          :class="['chip', { 'chip--active': formData.palpasi[activeZones.palpasi].fremitus === opt }]"
                          @click="formData.palpasi[activeZones.palpasi].fremitus = opt"
                        >{{ opt }}</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label class="field-label">Nyeri Tekan</label>
                      <div class="chip-row">
                        <span
                          v-for="opt in ['Ada', 'Tidak Ada']" :key="opt"
                          :class="['chip', opt === 'Ada' ? 'chip-danger' : '', { 'chip--active': formData.palpasi[activeZones.palpasi].nyeri_tekan === opt }]"
                          @click="formData.palpasi[activeZones.palpasi].nyeri_tekan = opt"
                        >{{ opt }}</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label class="field-label">Catatan</label>
                      <Textarea
                        v-model="formData.palpasi[activeZones.palpasi].catatan"
                        rows="3" placeholder="Catatan palpasi zona ini..."
                        class="w-full" auto-resize
                      />
                    </div>
                  </template>

                  <!-- PERKUSI -->
                  <template v-if="tabKey === 'perkusi'">
                    <div class="field-group">
                      <label class="field-label">Hasil Perkusi</label>
                      <div class="chip-row chip-row--wrap">
                        <span
                          v-for="opt in optPerkusi" :key="opt"
                          :class="getPerkusiChipClass(opt, formData.perkusi[activeZones.perkusi].hasil)"
                          @click="formData.perkusi[activeZones.perkusi].hasil = opt"
                        >{{ opt }}</span>
                      </div>
                    </div>

                    <div v-if="formData.perkusi[activeZones.perkusi].hasil" class="hasil-badge">
                      <span :class="`hasil-badge__tag hasil-badge__tag--${
                          ['Redup','Pekak'].includes(formData.perkusi[activeZones.perkusi].hasil) ? 'abnormal'
                        : ['Hipersonor','Timpani'].includes(formData.perkusi[activeZones.perkusi].hasil) ? 'warning'
                        : 'normal'
                      }`">
                        <i :class="`pi pi-${
                          ['Redup','Pekak'].includes(formData.perkusi[activeZones.perkusi].hasil) ? 'exclamation-triangle'
                        : ['Hipersonor','Timpani'].includes(formData.perkusi[activeZones.perkusi].hasil) ? 'info-circle'
                        : 'check-circle'}`"></i>
                        {{ formData.perkusi[activeZones.perkusi].hasil === 'Sonor' ? 'Normal'
                          : ['Redup','Pekak'].includes(formData.perkusi[activeZones.perkusi].hasil) ? 'Abnormal'
                          : 'Perhatian' }}
                      </span>
                    </div>

                    <div class="field-group">
                      <label class="field-label">Catatan</label>
                      <Textarea
                        v-model="formData.perkusi[activeZones.perkusi].catatan"
                        rows="3" placeholder="Catatan perkusi zona ini..."
                        class="w-full" auto-resize
                      />
                    </div>
                  </template>

                  <!-- AUSKULTASI -->
                  <template v-if="tabKey === 'auskultasi'">
                    <div class="field-group">
                      <label class="field-label">Suara Dasar</label>
                      <div class="chip-row">
                        <span
                          v-for="opt in optSuaraDasar" :key="opt"
                          :class="['chip', { 'chip--active': formData.auskultasi[activeZones.auskultasi].suara_dasar === opt }]"
                          @click="formData.auskultasi[activeZones.auskultasi].suara_dasar = opt"
                        >{{ opt }}</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label class="field-label">
                        Suara Tambahan
                        <span class="unit">(pilih semua yang ada)</span>
                      </label>
                      <div class="chip-row chip-row--wrap">
                        <span
                          v-for="opt in optSuaraTambahan" :key="opt"
                          :class="['chip', opt === 'Tidak ada' ? 'chip-muted' : '', { 'chip--active': formData.auskultasi[activeZones.auskultasi].suara_tambahan.includes(opt) }]"
                          @click="toggleSuaraTambahan(activeZones.auskultasi, opt)"
                        >{{ opt }}</span>
                      </div>
                    </div>

                    <div class="field-group">
                      <label class="field-label">Catatan</label>
                      <Textarea
                        v-model="formData.auskultasi[activeZones.auskultasi].catatan"
                        rows="3" placeholder="Catatan auskultasi zona ini..."
                        class="w-full" auto-resize
                      />
                    </div>
                  </template>
                </div>

                <div v-else class="empty-state" key="empty">
                  <div class="empty-icon"><i class="pi pi-hand-pointer"></i></div>
                  <p class="empty-text">
                    Pilih zona paru pada diagram<br>
                    untuk memasukkan data {{ TAB_HEADERS[tabKey] }}
                  </p>
                </div>

              </transition>
            </div>
          </div>
        </TabPanel>

      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.pfp { font-size: 0.875rem; }

/* ── Inspeksi grid ── */
.inspeksi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem 1.5rem;
  padding: 0.75rem 0.25rem;
}

/* ── Lung tab layout ── */
.lung-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  padding: 0.5rem 0.25rem;
  min-height: 420px;
}

/* ── SVG column ── */
.svg-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.svg-hint {
  font-size: 0.75rem;
  color: #64748B;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.lung-svg {
  width: 310px;
  height: 390px;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: #F8FAFC;
  display: block;
}

.lung-zone {
  cursor: pointer;
  transition: fill 0.18s ease;
}
.lung-zone:hover { opacity: 0.82; }

/* ── Perkusi legend ── */
.perkusi-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}

.legend-item {
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.18rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid;
}
.legend-sonor    { background:#F0FDF4; border-color:#86EFAC; color:#166534; }
.legend-abnormal { background:#FFF5F5; border-color:#FCA5A5; color:#991B1B; }
.legend-warning  { background:#FFFBEB; border-color:#FDE68A; color:#92400E; }

/* ── Panel column ── */
.panel-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Zone form ── */
.zone-form { display: flex; flex-direction: column; gap: 1.1rem; }

.zone-form-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1D4ED8;
  padding-bottom: 0.65rem;
  border-bottom: 2px solid #BFDBFE;
}

/* ── Field groups ── */
.field-group { display: flex; flex-direction: column; gap: 0.4rem; }

.field-label { font-size: 0.82rem; font-weight: 600; color: #374151; }

.unit { font-weight: 400; color: #6B7280; font-size: 0.75rem; }

/* ── Chips ── */
.chip-row { display: flex; flex-wrap: nowrap; gap: 0.45rem; align-items: center; }
.chip-row--wrap { flex-wrap: wrap; }

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid #CBD5E1;
  background: #F8FAFC;
  color: #374151;
  user-select: none;
  transition: all 0.14s ease;
  white-space: nowrap;
  line-height: 1.4;
}
.chip:hover { border-color: #94A3B8; background: #F1F5F9; }
.chip--active { background: #1D4ED8; border-color: #1D4ED8; color: #fff; }

.chip-green              { border-color:#86EFAC; background:#F0FDF4; color:#166534; }
.chip-green:hover        { background:#DCFCE7; }
.chip-green.chip--active { background:#16A34A; border-color:#16A34A; color:#fff; }

.chip-red              { border-color:#FCA5A5; background:#FFF5F5; color:#991B1B; }
.chip-red:hover        { background:#FEE2E2; }
.chip-red.chip--active { background:#DC2626; border-color:#DC2626; color:#fff; }

.chip-yellow              { border-color:#FDE68A; background:#FFFBEB; color:#92400E; }
.chip-yellow:hover        { background:#FEF9C3; }
.chip-yellow.chip--active { background:#D97706; border-color:#D97706; color:#fff; }

.chip-danger              { border-color:#FCA5A5; }
.chip-danger.chip--active { background:#DC2626; border-color:#DC2626; color:#fff; }

.chip-muted { color:#64748B; }

/* ── Hasil badge ── */
.hasil-badge { margin: -0.4rem 0 -0.2rem; }
.hasil-badge__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.22rem 0.65rem;
  border-radius: 9999px;
}
.hasil-badge__tag--normal   { background:#DCFCE7; color:#15803D; }
.hasil-badge__tag--abnormal { background:#FEE2E2; color:#B91C1C; }
.hasil-badge__tag--warning  { background:#FEF9C3; color:#B45309; }

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  gap: 0.75rem;
  color: #94A3B8;
}
.empty-icon { font-size: 2.2rem; opacity: 0.45; }
.empty-text { font-size: 0.82rem; text-align: center; line-height: 1.6; margin: 0; max-width: 200px; }

/* ── Transition ── */
.panel-slide-enter-active,
.panel-slide-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; transform: translateX(10px); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .inspeksi-grid  { grid-template-columns: repeat(2, 1fr); }
  .lung-layout    { grid-template-columns: 1fr; }
  .svg-col        { border-bottom: 1px solid #E2E8F0; padding-bottom: 1rem; }
}
@media (max-width: 520px) {
  .inspeksi-grid  { grid-template-columns: 1fr; }
}
</style>
