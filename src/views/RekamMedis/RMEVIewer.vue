<template>
  <!-- ════════════════════════════════════════════════
       FLOATING TOOLBAR  (tidak tercetak)
  ════════════════════════════════════════════════ -->
  <div class="rme-toolbar no-print">
    <!-- Kiri: Logo + Nama RS -->
    <div class="rme-toolbar-brand">
      <img :src="LINK_LOGO || '/img/logo.png'" height="36" alt="logo" />
      <div class="rme-toolbar-brand-text">
        <span class="rme-tb-rs">{{ company }}</span>
        <span class="rme-tb-module">Rekam Medis Elektronik</span>
      </div>
    </div>

    <!-- Tengah: Info Pasien -->
    <div class="rme-toolbar-patient" v-if="!loadingPatient && dataPasien?.NAMAPASIEN">
      <strong class="rme-tb-name">{{ dataPasien.NAMAPASIEN }}</strong>
      <span class="rme-tb-meta">
        RM: {{ dataPasien.NOMR || '-' }} &nbsp;|&nbsp; Reg: {{ noreg }} &nbsp;|&nbsp;
        {{ dataPasien.JENISRAWAT || '' }}
      </span>
    </div>
    <div class="rme-toolbar-patient" v-else>
      <span class="rme-tb-meta">Memuat data pasien... ({{ noreg }})</span>
    </div>

    <!-- Kanan: Toggles + Aksi -->
    <div class="rme-toolbar-actions">
      <!-- Section Toggles -->
      <div class="rme-section-toggles">
        <!-- <label v-for="sec in sections" :key="sec.key" class="rme-toggle-label">
          <input type="checkbox" v-model="sec.visible" />
          {{ sec.shortLabel }}
        </label> -->
      </div>
      <!-- Zoom Controls -->
      <div class="rme-zoom-ctrl">
        <button
          class="rme-zoom-btn"
          @click="zoomOut"
          :disabled="zoom <= ZOOM_MIN"
          title="Perkecil (Ctrl+−)"
        >
          −
        </button>
        <input
          type="range"
          class="rme-zoom-slider"
          v-model.number="zoom"
          :min="ZOOM_MIN"
          :max="ZOOM_MAX"
          :step="ZOOM_STEP"
          @change="saveZoom"
        />
        <span class="rme-zoom-pct" @click="zoomReset" title="Klik untuk reset 100%"
          >{{ zoom }}%</span
        >
        <button
          class="rme-zoom-btn"
          @click="zoomIn"
          :disabled="zoom >= ZOOM_MAX"
          title="Perbesar (Ctrl+=)"
        >
          +
        </button>
      </div>
      <div class="rme-zoom-sep"></div>
      <div class="rme-tb-btns">
        <button class="rme-btn rme-btn-print" @click="doPrint">🖨️ Cetak</button>
        <button
          class="rme-btn rme-btn-pdf"
          @click="exportToPDF"
          :disabled="isExportingPDF"
          :title="isExportingPDF ? exportProgress : 'Export semua form ke file PDF'"
        >
          <span v-if="isExportingPDF">
            <i class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
            {{ exportProgress || 'Memproses...' }}
          </span>
          <span v-else>📥 Export PDF</span>
        </button>
        <button class="rme-btn rme-btn-close" @click="goBack">✕ Tutup</button>
      </div>
    </div>
  </div>

  <nav
    class="rme-sticky-nav no-print"
    :class="{ 'is-hover-mode': navMode === 'hover' }"
    aria-label="Navigasi halaman RME"
  >
    <!-- Toggle mode: selalu tampil vs hover -->
    <button
      class="rme-sticky-tab rme-nav-mode-toggle"
      @click.stop="toggleNavMode"
      :title="
        navMode === 'always'
          ? 'Mode: Selalu Tampil — klik untuk ubah ke Hover'
          : 'Mode: Hover Only — klik untuk ubah ke Selalu Tampil'
      "
      style="--tc: #555"
    >
      <span class="rst-icon">{{ navMode === 'always' ? '👁️' : '🫥' }}</span>
      <span class="rst-label">{{ navMode === 'always' ? 'Selalu' : 'Hover' }}</span>
    </button>

    <!-- Cover tab -->
    <button
      class="rme-sticky-tab"
      :class="{ 'is-active': activeSection === 'cover' }"
      style="--tc: #162d4e"
      @click="scrollToSection('cover')"
      title="Identitas Pasien"
    >
      <span class="rst-icon">📋</span>
      <span class="rst-label">Identitas</span>
    </button>

    <!-- Semua section — selalu tampil, dimmed bila di-toggle off -->
    <template v-for="sec in sections" :key="sec.key">
      <button
        class="rme-sticky-tab"
        :class="{
          'is-active': activeSection === sec.key,
          'is-hidden-sec': !sec.visible,
          'is-no-data': sectionDataStatus[sec.key] === false,
        }"
        :style="`--tc:${sec.color}`"
        @click="scrollToSection(sec.key)"
        :title="
          sec.label +
          (sectionDataStatus[sec.key] === false ? ' — Tidak ada data' : '') +
          (!sec.visible ? ' (tersembunyi)' : '')
        "
      >
        <span class="rst-icon">{{ sec.icon }}</span>
        <span class="rst-label">{{ sec.shortLabel }}</span>
      </button>
    </template>
  </nav>

  <!-- ════════════════════════════════════════════════
       FLOATING SPEED DIAL  (kanan bawah, tidak tercetak)
  ════════════════════════════════════════════════ -->
  <div class="rme-speeddial-wrap no-print">
    <SpeedDial
      :model="speedDialItems"
      direction="up"
      :transitionDelay="50"
      showIcon="pi pi-ellipsis-v"
      hideIcon="pi pi-times"
      :tooltipOptions="{ position: 'left' }"
    />
  </div>

  <!-- ════════════════════════════════════════════════
       AREA CETAK
  ════════════════════════════════════════════════ -->
  <div class="rme-print-area" :style="{ zoom: zoom / 100 }">
    <!-- Halaman 1: Header + Identitas -->
    <div class="rme-a4-page" data-section="cover">
      <RMEHeaderSection :noreg="noreg" :dataPasien="dataPasien" :loading="loadingPatient" />
    </div>

    <!-- Halaman: SEP BPJS -->
    <div class="rme-a4-page" data-section="sep" v-if="sectionVisible('sep')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMESEPSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 2: Triase IGD -->
    <div
      class="rme-a4-page"
      data-section="triase"
      v-if="sectionVisible('triase') || dataPasien.JENISRAWAT == 'INAP'"
    >
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMETriaseSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman: Kajian Awal Dokter -->
    <div
      class="rme-a4-page"
      data-section="kajian-awal"
      v-if="sectionVisible('kajian-awal') || dataPasien.JENISRAWAT == 'INAP'"
    >
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEKajianAwalDokterSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 3: CPPT / SOAP -->
    <div class="rme-a4-page" data-section="cppt" v-if="sectionVisible('cppt')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMECPPTSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman: Siriraj Stroke Score -->
    <div class="rme-a4-page" data-section="siriraj" v-if="sectionVisible('siriraj')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMESirirajSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 4: Laboratorium -->
    <div class="rme-a4-page" data-section="lab" v-if="sectionVisible('lab')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMELabSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 5: Radiologi -->
    <div class="rme-a4-page" data-section="radiologi" v-if="sectionVisible('radiologi')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMERadiologiSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 6: Tindakan -->
    <div class="rme-a4-page" data-section="tindakan" v-if="sectionVisible('tindakan')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMETindakanSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 7: Terapi / Obat -->
    <!-- <div class="rme-a4-page" data-section="terapi" v-if="sectionVisible('terapi')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMETeraphySection :noreg="noreg" :dataPasien="dataPasien" />
    </div> -->

    <!-- Halaman: Kartu Catatan Obat Pasien -->
    <div
      class="rme-a4-page rme-landscape-page"
      data-section="kartu-obat"
      v-if="sectionVisible('kartu-obat')"
    >
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <KartuCatatanObatView :noreg="noreg" :dataPasien="dataPasien" :embedded="true" />
    </div>

    <!-- Halaman: Resume Medis Rawat Jalan -->
    <div class="rme-a4-page" data-section="resume-rajal" v-if="sectionVisible('resume-rajal')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEResumeRawatJalan :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 8: Resume Medis / Discharge Summary -->
    <div class="rme-a4-page" data-section="resume" v-if="sectionVisible('resume')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEResumeMedisSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>

    <!-- Halaman 9: Billing / Rincian Tagihan -->
    <div class="rme-a4-page" data-section="billing" v-if="sectionVisible('billing')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEBillingSection :noreg="noreg" :dataPasien="dataPasien" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, provide, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

import RMEHeaderSection from './sections/RMEHeaderSection.vue'
import RMETriaseSection from './sections/RMETriaseSection.vue'
import RMECPPTSection from './sections/RMECPPTSection.vue'
import RMELabSection from './sections/RMELabSection.vue'
import RMERadiologiSection from './sections/RMERadiologiSection.vue'
import RMETindakanSection from './sections/RMETindakanSection.vue'
import RMETeraphySection from './sections/RMETeraphySection.vue'
import KartuCatatanObatView from './KartuCatatanObatView.vue'
import RMEResumeMedisSection from './sections/RMEResumeMedisSection.vue'
import RMEBillingSection from './sections/RMEBillingSection.vue'
import RMEKajianAwalDokterSection from './sections/RMEKajianAwalDokterSection.vue'
import RMESEPSection from './sections/RMESEPSection.vue'
import RMESirirajSection from './sections/RMESirirajSection.vue'
import RMEResumeRawatJalan from './sections/RMEResumeRawatJalan.vue'
import SpeedDial from 'primevue/speeddial'

// ── Section data status (untuk sticky nav dimming) ───────────────────────────
const sectionDataStatus = reactive({})
provide('reportSectionData', (key, hasData) => {
  sectionDataStatus[key] = hasData
})

// ── Timeline perjalanan perawatan ─────────────────────────────────────────────
const timelineMap = reactive({})
provide('addTimelineEvent', (key, data) => {
  timelineMap[key] = data
})

const ORDER = ['registrasi', 'triase', 'kajian-awal', 'cppt', 'tindakan', 'keluar']
const timelineEvents = computed(() => {
  return ORDER.flatMap((key) => (timelineMap[key] ? [timelineMap[key]] : []))
})

const timelineDuration = computed(() => {
  return timelineMap['keluar']?.duration || ''
})

// ── Nav display mode ──────────────────────────────────────────────────────────
const navMode = ref(localStorage.getItem('rme_nav_mode') || 'always')
const toggleNavMode = () => {
  navMode.value = navMode.value === 'always' ? 'hover' : 'always'
  localStorage.setItem('rme_nav_mode', navMode.value)
}

// ── Zoom ──────────────────────────────────────────────────────────────────────
const ZOOM_STEP = 10
const ZOOM_MIN = 50
const ZOOM_MAX = 150
const zoom = ref(Number(localStorage.getItem('rme_zoom') || 100))

const saveZoom = () => localStorage.setItem('rme_zoom', String(zoom.value))
const zoomIn = () => {
  zoom.value = Math.min(zoom.value + ZOOM_STEP, ZOOM_MAX)
  saveZoom()
}
const zoomOut = () => {
  zoom.value = Math.max(zoom.value - ZOOM_STEP, ZOOM_MIN)
  saveZoom()
}
const zoomReset = () => {
  zoom.value = 100
  saveZoom()
}

const onKeyZoom = (e) => {
  if (!e.ctrlKey) return
  if (e.key === '=' || e.key === '+') {
    e.preventDefault()
    zoomIn()
  }
  if (e.key === '-') {
    e.preventDefault()
    zoomOut()
  }
  if (e.key === '0') {
    e.preventDefault()
    zoomReset()
  }
}
const onWheelZoom = (e) => {
  if (!e.ctrlKey) return
  e.preventDefault()
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

// ── Route & Store ───────────────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, company, LINK_LOGO } = storeToRefs(authStore)

// ── Params ──────────────────────────────────────────────────────────────────────
const noreg = computed(() => String(route.query.noreg || route.params.noreg || ''))

// ── Data Pasien ─────────────────────────────────────────────────────────────────
const dataPasien = ref({})
const loadingPatient = ref(true)

const fetchPatient = async () => {
  if (!noreg.value) {
    loadingPatient.value = false
    return
  }
  loadingPatient.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(url + '/index.php/api/transaksi_pasien/history_versi4', {
      mod: 1,
      noregister: noreg.value,
      id_client: id_client.value,
    })

    if (res.data?.response?.length > 0) {
      dataPasien.value = res.data.response[0]
      timelineMap['registrasi'] = {
        key: 'registrasi',
        label: 'Registrasi Masuk',
        icon: '🏥',
        color: '#162d4e',
        datetime: dataPasien.value.MASUKPOLY || dataPasien.value.TGLREG || '',
        meta: dataPasien.value.POLI || dataPasien.value.JENISRAWAT || '',
      }
    }
  } catch (e) {
    console.error('Gagal memuat data pasien', e)
  } finally {
    loadingPatient.value = false
  }
}

// ── Sections (dengan icon & warna untuk sticky nav) ─────────────────────────────
const sections = ref([
  {
    key: 'sep',
    shortLabel: 'SEP BPJS',
    label: 'Surat Eligibilitas Peserta (SEP)',
    icon: '🏥',
    color: '#007d3a',
    bgColor: '#f0fff8',
    borderColor: '#a8cfa8',
    visible: true,
  },
  {
    key: 'triase',
    shortLabel: 'Triase',
    label: 'Triase IGD',
    icon: '🚨',
    color: '#b71c1c',
    bgColor: '#fff5f5',
    borderColor: '#ef9a9a',
    visible: true,
  },
  {
    key: 'kajian-awal',
    shortLabel: 'Kajian Awal',
    label: 'Kajian Awal Dokter (DPJP)',
    icon: '🩻',
    color: '#1565c0',
    bgColor: '#e3f0fb',
    borderColor: '#90caf9',
    visible: true,
  },
  {
    key: 'cppt',
    shortLabel: 'CPPT',
    label: 'CPPT / SOAP',
    icon: '📝',
    color: '#1a3a5f',
    bgColor: '#f0f4ff',
    borderColor: '#90caf9',
    visible: true,
  },
  {
    key: 'siriraj',
    shortLabel: 'Siriraj',
    label: 'Siriraj Stroke Score',
    icon: '🧠',
    color: '#7b1fa2',
    bgColor: '#f3e5f5',
    borderColor: '#ce93d8',
    visible: true,
  },
  {
    key: 'lab',
    shortLabel: 'Lab',
    label: 'Laboratorium',
    icon: '🔬',
    color: '#6a1b9a',
    bgColor: '#faf0ff',
    borderColor: '#ce93d8',
    visible: true,
  },
  {
    key: 'radiologi',
    shortLabel: 'Radiologi',
    label: 'Radiologi',
    icon: '🩻',
    color: '#00695c',
    bgColor: '#f0faf8',
    borderColor: '#80cbc4',
    visible: true,
  },
  {
    key: 'tindakan',
    shortLabel: 'Tindakan',
    label: 'Tindakan / Prosedur',
    icon: '🔧',
    color: '#bf360c',
    bgColor: '#fff8f0',
    borderColor: '#ffab91',
    visible: true,
  },

  {
    key: 'kartu-obat',
    shortLabel: 'Kartu Obat',
    label: 'Kartu Catatan Obat Pasien',
    icon: '📋',
    color: '#4a7ab5',
    bgColor: '#f0f6fc',
    borderColor: '#b2c8dd',
    visible: true,
  },
  {
    key: 'resume-rajal',
    shortLabel: 'Resume Rajal',
    label: 'Resume Medis Rawat Jalan',
    icon: '🏥',
    color: '#1a6b4a',
    bgColor: '#f0fdf4',
    borderColor: '#b2dfce',
    visible: true,
  },
  {
    key: 'resume',
    shortLabel: 'Resume',
    label: 'Resume Medis / Discharge Summary',
    icon: '📄',
    color: '#1a6b4a',
    bgColor: '#f0fdf4',
    borderColor: '#b2dfce',
    visible: true,
  },
  {
    key: 'billing',
    shortLabel: 'Billing',
    label: 'Rincian Tagihan Pasien',
    icon: '🧾',
    color: '#bf360c',
    bgColor: '#fff8f0',
    borderColor: '#ffab91',
    visible: true,
  },
])

const visibleSections = computed(() => sections.value.filter((s) => s.visible))
const sectionVisible = (key) => sections.value.find((s) => s.key === key)?.visible ?? true

// ── Sticky Nav — Active Section Detection ────────────────────────────────────────
const activeSection = ref('cover')
let observer = null

const setupObserver = () => {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      let best = null
      let bestRatio = 0
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio
          best = entry
        }
      })
      if (best) activeSection.value = best.target.dataset.section
    },
    {
      // Trigger saat halaman mengisi bagian tengah viewport (~30%)
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0,
    },
  )
  document.querySelectorAll('.rme-a4-page[data-section]').forEach((el) => {
    observer.observe(el)
  })
}

// Scroll ke section dan beri efek flash
const scrollToSection = (key) => {
  const el = document.querySelector('.rme-a4-page[data-section="' + key + '"]')
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 76
  window.scrollTo({ top, behavior: 'smooth' })
  // Flash outline singkat
  el.classList.add('rme-page-flash')
  setTimeout(() => el.classList.remove('rme-page-flash'), 700)
}

// Re-setup observer saat visibility section berubah
watch(sections, () => nextTick(setupObserver), { deep: true })

// ── Actions ─────────────────────────────────────────────────────────────────────
const doPrint = () => window.print()
const goBack = () => (window.history.length > 1 ? router.back() : window.close())

// ── Export PDF ────────────────────────────────────────────────────────────────
const isExportingPDF = ref(false)
const exportProgress = ref('')

// Cache base64 agar URL yang sama tidak di-fetch berkali-kali
const _imgBase64Cache = new Map()

const _blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const _tryFetch = async (url) => {
  try {
    const resp = await fetch(url, { cache: 'force-cache' })
    if (resp.ok) return await _blobToBase64(await resp.blob())
  } catch {
    /* gagal */
  }
  return null
}

const _fetchImageBase64 = async (src) => {
  if (_imgBase64Cache.has(src)) return _imgBase64Cache.get(src)

  let b64 = null

  // 1) Untuk URL ws-simrs.net: gunakan dev-proxy DULU agar tidak memicu CORS error di console.
  //    Di production, URL proxy tidak akan tersedia — langsung lanjut ke step 2.
  if (src.includes('ws-simrs.net')) {
    const proxyUrl = src.replace('https://ws-simrs.net', '/ws-simrs-assets')
    b64 = await _tryFetch(proxyUrl)
  }

  // 2) Fetch langsung (berhasil jika server punya header CORS, atau URL same-origin)
  if (!b64) b64 = await _tryFetch(src)

  // 3) Fallback canvas: berlaku jika img sudah ter-load dengan crossOrigin="anonymous"
  if (!b64) {
    try {
      const img = Array.from(document.querySelectorAll('img')).find((i) => i.src === src)
      if (img?.complete && img.naturalWidth > 0) {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext('2d').drawImage(img, 0, 0)
        b64 = c.toDataURL('image/png')
      }
    } catch {
      /* canvas tainted — skip */
    }
  }

  _imgBase64Cache.set(src, b64)
  return b64
}

// Konversi semua <img> di dalam elemen ke base64, kembalikan fungsi restore
const _prepareImages = async (el) => {
  const imgs = [...el.querySelectorAll('img[src]')]
  const toRestore = []
  for (const img of imgs) {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue
    const b64 = await _fetchImageBase64(src)
    if (b64) {
      toRestore.push({ img, origSrc: src })
      img.src = b64
    }
  }
  return () => toRestore.forEach(({ img, origSrc }) => (img.src = origSrc))
}

const exportToPDF = async () => {
  if (isExportingPDF.value) return
  isExportingPDF.value = true
  exportProgress.value = 'Mempersiapkan...'

  const prevZoom = zoom.value
  zoom.value = 100
  await nextTick()

  try {
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ])

    const pages = document.querySelectorAll('.rme-a4-page')
    if (!pages.length) throw new Error('Tidak ada halaman untuk diekspor')

    let pdf = null

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const isLandscape = page.classList.contains('rme-landscape-page')
      const orientation = isLandscape ? 'landscape' : 'portrait'
      const sectionKey = page.dataset.section || `halaman-${i + 1}`

      exportProgress.value = `Memproses ${i + 1}/${pages.length}: ${sectionKey}...`

      // Konversi gambar ke base64 agar tidak terblokir CORS canvas-taint
      const restoreImages = await _prepareImages(page)

      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: page.scrollWidth,
        windowHeight: page.scrollHeight,
      })

      // Kembalikan src asli setelah capture
      restoreImages()

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      if (i === 0) {
        pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation })
      } else {
        pdf.addPage('a4', orientation)
      }

      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgW = pdfW
      const imgH = (canvas.height * imgW) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, imgW, Math.min(imgH, pdfH))
    }

    const patientName = (dataPasien.value?.NAMAPASIEN || 'Pasien').replace(/\s+/g, '_')
    const nomr = dataPasien.value?.NOMR || noreg.value
    exportProgress.value = 'Menyimpan PDF...'
    pdf.save(`RME_${nomr}_${patientName}_${noreg.value}.pdf`)
  } catch (err) {
    console.error('Export PDF gagal:', err)
    alert('Gagal mengekspor PDF: ' + err.message)
  } finally {
    zoom.value = prevZoom
    isExportingPDF.value = false
    exportProgress.value = ''
    _imgBase64Cache.clear()
  }
}

// ── Speed Dial items ─────────────────────────────────────────────────────────────
const speedDialItems = computed(() => [
  {
    label: 'Cetak Dokumen',
    icon: 'pi pi-print',
    command: () => doPrint(),
  },
  {
    label: isExportingPDF.value ? exportProgress.value : 'Export ke PDF',
    icon: isExportingPDF.value ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf',
    command: () => exportToPDF(),
  },
  {
    label: 'Ke Atas',
    icon: 'pi pi-angle-double-up',
    command: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
  },
  {
    label: 'Perbesar Tampilan',
    icon: 'pi pi-plus-circle',
    command: () => zoomIn(),
  },
  {
    label: 'Reset Zoom',
    icon: 'pi pi-undo',
    command: () => zoomReset(),
  },
  {
    label: 'Perkecil Tampilan',
    icon: 'pi pi-minus-circle',
    command: () => zoomOut(),
  },
  {
    label: navMode.value === 'always' ? 'Nav: Ubah ke Mode Hover' : 'Nav: Ubah ke Selalu Tampil',
    icon: navMode.value === 'always' ? 'pi pi-eye-slash' : 'pi pi-eye',
    command: () => toggleNavMode(),
  },
  {
    label: 'Tutup RME',
    icon: 'pi pi-sign-out',
    command: () => goBack(),
  },
])

// ── Lifecycle ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchPatient()
  nextTick(setupObserver)
  document.addEventListener('keydown', onKeyZoom)
  document.addEventListener('wheel', onWheelZoom, { passive: false })
})
onUnmounted(() => {
  if (observer) observer.disconnect()
  document.removeEventListener('keydown', onKeyZoom)
  document.removeEventListener('wheel', onWheelZoom)
})
</script>

<style>
/* ════ SCREEN STYLES ════════════════════════════════════════════════════════ */
body {
  background: #e3e8f0;
  margin: 0;
  font-size: 13px;
  color: #1a1a2e;
}

/* ── Toolbar ── */
.rme-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}
.rme-toolbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;
}
.rme-toolbar-brand img {
  border-radius: 4px;
}
.rme-toolbar-brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.rme-tb-rs {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.rme-tb-module {
  font-size: 11px;
  opacity: 1;
}
.rme-toolbar-patient {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.3;
}
.rme-tb-name {
  font-size: 14px;
  font-weight: 700;
}
.rme-tb-meta {
  font-size: 11px;
  opacity: 1;
}
.rme-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rme-section-toggles {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 20px;
}
.rme-toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.rme-tb-btns {
  display: flex;
  gap: 6px;
}
.rme-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}
.rme-btn-print {
  background: #43a047;
  color: #fff;
}
.rme-btn-print:hover {
  background: #2e7d32;
}
.rme-btn-pdf {
  background: #1565c0;
  color: #fff;
  min-width: 110px;
  transition: background 0.15s;
}
.rme-btn-pdf:hover:not(:disabled) {
  background: #0d47a1;
}
.rme-btn-pdf:disabled {
  background: #5c8fc7;
  cursor: not-allowed;
  opacity: 0.85;
}
.rme-btn-close {
  background: #e53935;
  color: #fff;
}
.rme-btn-close:hover {
  background: #b71c1c;
}

/* ── Print area ── */
.rme-print-area {
  margin-top: 68px;
  padding: 20px 148px 40px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* ── A4 Paper ── */
.rme-a4-page {
  background: #fff;
  width: 210mm;
  min-height: 60mm;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  border-radius: 2px;
  padding: 14mm 14mm 10mm;
  box-sizing: border-box;
  page-break-after: always;
}

/* ── Page repeat header ── */
.rme-page-header-repeat {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 4px;
  margin-bottom: 10px;
}
.rme-phr-name {
  font-weight: 700;
  color: #162d4e;
}

/* ── Header RS ── */
.rme-rs-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
  padding-bottom: 10px;
  border-bottom: 3px solid #162d4e;
  background: linear-gradient(180deg, #f2f6fc 0%, #ffffff 100%);
  padding: 10px 12px;
  border-radius: 4px;
}
.rme-rs-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}
.rme-rs-info {
  flex: 1;
}
.rme-rs-name {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 2px;
  color: #162d4e;
}
.rme-rs-addr {
  font-size: 11px;
  color: #555;
  margin: 0;
}
.rme-rs-tagline {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #162d4e;
  margin: 2px 0 0;
}
.rme-rs-barcode {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
}
.rme-noreg-box {
  display: flex;
  flex-direction: column;
}
.rme-noreg-label {
  font-size: 10px;
  color: #777;
}
.rme-noreg-val {
  font-size: 13px;
  font-weight: 700;
}
.rme-divider-thick {
  border: none;
  border-top: 2px solid #b2c8dd;
  margin: 8px 0 12px;
}

/* ── Section ── */
.rme-section {
  margin-bottom: 8px;
}
.rme-section-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #dde8f4 0%, #edf3fa 100%);
  color: #162d4e;
  padding: 5px 10px;
  border-left: 4px solid #162d4e;
  margin-bottom: 10px;
}
.rme-subsection-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #37474f;
  border-bottom: 1px solid #cfd8dc;
  margin: 10px 0 6px;
  padding-bottom: 3px;
}

/* ── Info Grid ── */
.rme-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.rme-tbl-info {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.rme-td-lbl {
  width: 38%;
  color: #555;
  padding: 2px 0;
  white-space: nowrap;
}
.rme-td-sep {
  width: 4%;
  color: #888;
}
.rme-td-val {
  color: #1a1a2e;
  font-size: 12px;
  padding: 2px 4px;
}
.mono {
  font-family: 'Courier New', monospace;
}

/* ── Vital Grid ── */
.rme-vital-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}
.rme-vital-card {
  border: 1px solid #b2c8dd;
  border-top: 2.5px solid #1a3a5f;
  border-radius: 4px;
  padding: 6px 4px;
  text-align: center;
  background: #f7fafd;
}
.rme-vital-label {
  font-size: 9px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.rme-vital-value {
  font-size: 16px;
  font-weight: 700;
  color: #162d4e;
  line-height: 1.2;
}
.rme-vital-unit {
  font-size: 9px;
  color: #888;
}

/* ── Tables ── */
.rme-tbl-data {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  margin-bottom: 8px;
}
.rme-tbl-data th {
  background: #e6edf7;
  color: #162d4e;
  font-weight: 700;
  padding: 5px 7px;
  border: 1px solid #b2c8dd;
  text-align: left;
  font-size: 11px;
}
.rme-tbl-data td {
  padding: 4px 7px;
  border: 1px solid #e0e0e0;
  vertical-align: top;
}
.rme-tbl-data tr:nth-child(even) td {
  background: #f5f5f5;
}
.rme-tbl-group-hdr td {
  background: #fff8e1 !important;
  font-weight: 700;
  font-size: 11px;
  color: #5d4037;
}
.pl-3 {
  padding-left: 18px !important;
}
.text-center {
  text-align: center;
}

/* ── Lab / Rad cards ── */
.rme-lab-card {
  border: 1px solid #cddaeb;
  border-top: 2px solid #1a3a5f;
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}
.rme-lab-card-header {
  background: linear-gradient(90deg, #dde8f4 0%, #edf3fa 100%);
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.rme-lab-no {
  font-size: 11px;
  color: #777;
  margin-left: 8px;
}
.rme-lab-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #555;
}
.rme-rad-klinis {
  font-size: 11px;
  color: #555;
  padding: 4px 10px;
  background: #fafafa;
}

/* ── CPPT cards ── */
.rme-cppt-card {
  border: 1px solid #cddaeb;
  border-top: 2px solid #1a3a5f;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}
.rme-cppt-auth {
  border-top-color: #2e7d32;
  border-color: #81c784;
}
.rme-cppt-header {
  background: linear-gradient(90deg, #dde8f4 0%, #edf3fa 100%);
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.rme-cppt-header-left {
  display: flex;
  gap: 8px;
  align-items: center;
}
.rme-cppt-header-right {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
}
.rme-cppt-time {
  font-size: 11px;
  color: #555;
}
.rme-cppt-ppa {
  font-size: 11px;
  color: #333;
}
.rme-cppt-body {
  padding: 8px 10px;
}
.rme-cppt-ttv {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 11px;
  color: #455a64;
  margin-bottom: 6px;
  padding: 4px 6px;
  background: #f0f5fb;
  border-radius: 3px;
}
.rme-cppt-soap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.rme-cppt-soap-item {
  background: #f7fafd;
  border: 1px solid #dde8f4;
  border-radius: 3px;
  padding: 5px 8px;
  min-height: 36px;
}
.rme-cppt-soap-label {
  font-weight: 800;
  font-size: 12px;
  color: #162d4e;
  border-left: 3px solid #162d4e;
  padding-left: 5px;
  margin-bottom: 2px;
}
.rme-cppt-soap-content {
  font-size: 12px;
  color: #333;
  padding-left: 8px;
}
.rme-cppt-verif {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
}

/* ── Badges ── */
.rme-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.rme-badge-primary {
  background: #e6edf7;
  color: #3949ab;
}
.rme-badge-info {
  background: #e1f5fe;
  color: #0277bd;
}
.rme-badge-success {
  background: #e8f5e9;
  color: #2e7d32;
}
.rme-badge-warning {
  background: #fff8e1;
  color: #f57f17;
}
.rme-badge-danger {
  background: #fde8e8;
  color: #c62828;
}
.rme-badge-dark {
  background: #263238;
  color: #fff;
}
.rme-badge-default {
  background: #eeeeee;
  color: #555;
}

/* ── States ── */
.rme-loading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a3a5f;
  font-size: 12px;
  padding: 10px 0;
}
.rme-loading-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #1a3a5f;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.rme-empty-note {
  font-size: 12px;
  color: #90a4ae;
  font-style: italic;
  padding: 8px 4px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.rme-textarea-box {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 6px 10px;
  font-size: 12px;
  white-space: pre-wrap;
}
.rme-info-value {
  font-size: 12px;
  padding: 4px 0;
}
.rme-skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rme-skeleton-row {
  height: 14px;
  background: linear-gradient(90deg, #e0e0e0 25%, #eeeeee 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

/* ══════════════════════════════════════════════════════
   STICKY NAVIGATION — ARROW TABS
══════════════════════════════════════════════════════ */
.rme-sticky-nav {
  position: fixed;
  right: 0;
  /* mulai di bawah toolbar, sisakan ruang dari bawah */
  top: 64px;
  bottom: 8px;
  z-index: 950;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
  pointer-events: auto;

  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.rme-sticky-nav::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* ── Satu tab: bentuk panah (chevron) → ── */
.rme-sticky-tab {
  clip-path: polygon(12px 0%, 100% 0%, 100% 100%, 12px 100%, 0% 50%);
  background: rgba(255, 255, 255, 0.88);
  color: #555;
  border: none;
  display: flex;
  align-items: center;
  gap: 5px;
  width: 138px;

  padding: 5px 10px 5px 18px;
  cursor: pointer;
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.14);
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
  position: relative;
  outline: none;
  flex-shrink: 0;
}

/* Icon */
.rst-icon {
  font-size: 12px;
  flex-shrink: 0;
  line-height: 1;
}

/* Label — selalu terlihat */
.rst-label {
  flex: 1;
  font-size: 10px;
  letter-spacing: 0.1px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* HOVER: sedikit terang, warna tema */
.rme-sticky-tab:hover {
  background: rgba(245, 245, 245, 0.97);
  color: var(--tc, #162d4e);
  box-shadow: -5px 3px 16px rgba(0, 0, 0, 0.22);
}

/* ACTIVE: warna tema penuh */
.rme-sticky-tab.is-active {
  background: var(--tc, #162d4e);
  color: #fff;
  box-shadow: -6px 3px 18px rgba(0, 0, 0, 0.32);
  font-weight: 700;
}

/* Section tersembunyi (toggle off) — dimmed */
.rme-sticky-tab.is-hidden-sec {
  opacity: 0.38;
}
.rme-sticky-tab.is-hidden-sec:hover {
  opacity: 0.7;
}

/* Section tanpa data — border tipis mengikuti bentuk arrow via drop-shadow */
.rme-sticky-tab.is-no-data {
  opacity: 1;
  background: rgba(248, 248, 248, 0.82);
  color: #bfbfbf;
  filter: drop-shadow(-1.5px 0px 0 #c8c8c8) drop-shadow(0px -1.5px 0 #c8c8c8)
    drop-shadow(0px 1.5px 0 #c8c8c8);
}
.rme-sticky-tab.is-no-data:hover {
  opacity: 0.75;
  filter: drop-shadow(-2px 0px 0 #aaa) drop-shadow(0px -2px 0 #aaa) drop-shadow(0px 2px 0 #aaa);
}
.rme-sticky-tab.is-no-data.is-active {
  opacity: 1;
  filter: none;
}

/* Efek klik */
.rme-sticky-tab:active {
  transform: scale(0.97);
}

/* ── Hover mode: nav tersembunyi sebagian di kanan, muncul saat di-hover ── */
.rme-sticky-nav.is-hover-mode {
  transform: translateX(105px);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.rme-sticky-nav.is-hover-mode:hover {
  transform: translateX(0);
}

/* Tombol toggle mode nav */
.rme-nav-mode-toggle {
  background: rgba(230, 230, 230, 0.85) !important;
  color: #666 !important;
  opacity: 0.65;
  margin-bottom: 2px;
}
.rme-nav-mode-toggle:hover {
  opacity: 1 !important;
  background: rgba(220, 220, 220, 0.98) !important;
  color: #333 !important;
}

/* Flash outline saat navigate */
.rme-page-flash {
  animation: rmeFlash 0.65s ease;
}
@keyframes rmeFlash {
  0% {
    outline: 2px solid #162d4e;
    outline-offset: 0;
  }
  40% {
    outline: 3px solid #3d6494;
    outline-offset: 3px;
  }
  100% {
    outline: 0px solid transparent;
    outline-offset: 0;
  }
}

/* ── Zoom Controls ── */
.rme-zoom-ctrl {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 3px 8px;
}
.rme-zoom-sep {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}
.rme-zoom-btn {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 2px;
  width: 24px;
  height: 24px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s,
    transform 0.1s;
  flex-shrink: 0;
  padding: 0;
}
.rme-zoom-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.28);
  transform: scale(1.08);
}
.rme-zoom-btn:active:not(:disabled) {
  transform: scale(0.94);
}
.rme-zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.rme-zoom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80px;
  height: 3px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.25);
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
}
.rme-zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: transform 0.12s;
}
.rme-zoom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.25);
}
.rme-zoom-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
}
.rme-zoom-pct {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  min-width: 34px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.3px;
}
.rme-zoom-pct:hover {
  color: #fff;
  text-decoration: underline dotted;
}

/* ── Landscape page (Kartu Catatan Obat) ── */
.rme-landscape-page {
  width: 297mm;
  overflow-x: auto;
}

@page landscape {
  size: A4 landscape;
}

/* ── Speed Dial Floating ── */
.rme-speeddial-wrap {
  position: fixed;
  bottom: 24px;
  right: 39px;
  z-index: 960;
}

/* Tombol utama (bulat, gradien toolbar) */
.rme-speeddial-wrap .p-speeddial-button.p-button {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  border: none !important;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%) !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.42) !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease !important;
}
.rme-speeddial-wrap .p-speeddial-button.p-button:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 26px rgba(0, 0, 0, 0.55) !important;
  background: linear-gradient(135deg, #3d2b79 0%, #19a89e 100%) !important;
}

/* Item action (lingkaran kecil di atasnya) */
.rme-speeddial-wrap .p-speeddial-action {
  width: 40px !important;
  height: 40px !important;
  background: #fff !important;
  color: #2d1b69 !important;
  border: 1px solid #ddd !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18) !important;
  transition:
    transform 0.15s ease,
    background 0.15s ease !important;
}
.rme-speeddial-wrap .p-speeddial-action:hover {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%) !important;
  color: #fff !important;
  border-color: transparent !important;
  transform: scale(1.12) !important;
}

/* Tooltip label di kiri item */
.rme-speeddial-wrap .p-speeddial-item .p-tooltip .p-tooltip-text {
  font-size: 11px !important;
  padding: 3px 8px !important;
  white-space: nowrap !important;
}

/* ════ PRINT MEDIA ══════════════════════════════════════════════════════════ */
@media print {
  .no-print,
  .rme-toolbar,
  .rme-sticky-nav {
    display: none !important;
  }

  body {
    background: #fff !important;
    font-size: 11px;
  }

  .rme-print-area {
    margin-top: 0 !important;
    margin-left: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
    align-items: stretch !important;
  }

  .rme-a4-page {
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    padding: 10mm 12mm !important;
    page-break-after: always;
    break-after: page;
  }

  .rme-landscape-page {
    page: landscape;
    width: 297mm !important;
    overflow-x: visible;
  }

  .rme-tbl-data tr {
    page-break-inside: avoid;
  }

  .rme-badge {
    border: 1px solid currentColor !important;
  }

  .rme-loading-row,
  .rme-loading-dot {
    display: none !important;
  }
}
</style>
