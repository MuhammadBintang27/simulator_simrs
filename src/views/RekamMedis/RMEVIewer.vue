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
        <button class="rme-btn rme-btn-print" @click="doPrint">
          🖨️ <span class="rme-btn-text">Cetak</span>
        </button>
        <!-- Quality selector + PDF button group -->
        <div class="rme-pdf-group">
          <div class="rme-quality-seg" :title="`Kualitas: ${currentQualityPreset.desc}`">
            <button
              v-for="p in PDF_QUALITY_PRESETS"
              :key="p.key"
              class="rme-qbtn"
              :class="{ active: pdfQuality === p.key }"
              @click="setPdfQuality(p.key)"
              :title="`${p.label} — ${p.desc}`"
              :disabled="isExportingPDF"
            >
              {{ p.label }}
            </button>
          </div>
          <button
            class="rme-btn rme-btn-pdf"
            @click="exportToPDF()"
            :disabled="isExportingPDF"
            :title="
              isExportingPDF
                ? exportProgress
                : `Export PDF (${currentQualityPreset.label} — ${currentQualityPreset.desc})`
            "
          >
            <span v-if="isExportingPDF">
              <i class="pi pi-spin pi-spinner" style="font-size: 11px"></i>
              <span class="rme-btn-text">{{ exportProgress || 'Memproses...' }}</span>
            </span>
            <span v-else>📥 <span class="rme-btn-text">PDF</span></span>
          </button>
        </div>
        <button
          class="rme-btn rme-btn-setting"
          @click="openSettings"
          title="Atur halaman yang ditampilkan"
        >
          <i class="pi pi-cog"></i> <span class="rme-btn-text">Setting</span>
        </button>
        <button class="rme-btn rme-btn-close" @click="goBack">
          ✕ <span class="rme-btn-text">Tutup</span>
        </button>
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

    <!-- Semua section — selalu tampil, dimmed bila di-toggle off -->
    <template v-for="sec in visibleNavSections" :key="sec.key">
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

  <!-- ════════════════════════════════════════════════
       AREA CETAK
  ════════════════════════════════════════════════ -->
  <div class="rme-print-area" :style="{ zoom: zoom / 100 }">
    <!-- Halaman 1: Header + Identitas -->
    <div class="rme-a4-page" data-section="cover" v-if="sectionVisible('cover')">
      <RMEHeaderSection :noreg="noreg" :dataPasien="dataPasien" :loading="loadingPatient" />
    </div>

    <!-- Halaman: Lembar Klaim JKN -->
    <div class="rme-a4-page" data-section="lembar-klaim" v-if="sectionVisible('lembar-klaim')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMELembarKlaim :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['lembar-klaim'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: SEP BPJS -->
    <div class="rme-a4-page" data-section="sep" v-if="sectionVisible('sep')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMESEPSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['sep'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: SPRI — Surat Rencana Rawat Inap -->
    <div class="rme-a4-page" data-section="spri-ranap" v-if="sectionVisible('spri-ranap')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>

      <RMESPRIsections :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['spri-ranap'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: Triase IGD (multi-halaman A4, dikelola oleh komponen) -->
    <template v-if="sectionVisible('triase')">
      <RMETriaseSection :noreg="noreg" :dataPasien="dataPasien" />
    </template>

    <!-- Halaman: Kajian Awal Dokter -->
    <div class="rme-a4-page" data-section="kajian-awal" v-if="sectionVisible('kajian-awal')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEKajianAwalDokterSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['kajian-awal'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: CPPT / SOAP (multi-halaman A4, dikelola oleh komponen) -->
    <template v-if="sectionVisible('cppt')">
      <RMECPPTSection :noreg="noreg" :dataPasien="dataPasien" />
    </template>

    <!-- Halaman: Resume Medis Rawat Jalan -->
    <div class="rme-a4-page" data-section="resume-rajal" v-if="sectionVisible('resume-rajal')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEResumeRawatJalan :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['resume-rajal'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: Siriraj Stroke Score -->
    <div class="rme-a4-page" data-section="siriraj" v-if="sectionVisible('siriraj')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMESirirajSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['siriraj'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman 4: Laboratorium -->
    <div class="rme-a4-page" data-section="lab" v-if="sectionVisible('lab')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMELabSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['lab'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman 5: Radiologi -->
    <div class="rme-a4-page" data-section="radiologi" v-if="sectionVisible('radiologi')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMERadiologiSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['radiologi'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman 6: Tindakan -->
    <div class="rme-a4-page" data-section="tindakan" v-if="sectionVisible('tindakan')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMETindakanSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['tindakan'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
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
      <div v-if="sectionDataStatus['kartu-obat'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman 8: Resume Medis / Discharge Summary -->
    <div class="rme-a4-page" data-section="resume" v-if="sectionVisible('resume')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEResumeMedisSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['resume'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: Surat Rujukan -->
    <div class="rme-a4-page" data-section="rujukan" v-if="sectionVisible('rujukan')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMERujukan :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['rujukan'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman: Laporan Hemodialisa -->
    <div class="rme-a4-page" data-section="hemodialisa" v-if="sectionVisible('hemodialisa')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEHDViewer :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['hemodialisa'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>

    <!-- Halaman 9: Billing / Rincian Tagihan -->
    <div class="rme-a4-page" data-section="billing" v-if="sectionVisible('billing')">
      <div class="rme-page-header-repeat">
        <span class="rme-phr-rm">RM: {{ dataPasien?.NOMR }}</span>
        <span class="rme-phr-name">{{ dataPasien?.NAMAPASIEN }}</span>
        <span class="rme-phr-reg">Reg: {{ noreg }}</span>
      </div>
      <RMEBillingSection :noreg="noreg" :dataPasien="dataPasien" />
      <div v-if="sectionDataStatus['billing'] === false" class="rme-section-no-data">
        <i class="pi pi-inbox"></i><span>Tidak ada data yang ditampilkan</span>
      </div>
    </div>
  </div>

  <!-- ════════════════════════════════════════════════
       OVERLAY: Auto-export mode
  ════════════════════════════════════════════════ -->
  <Teleport to="body">
    <div v-if="autoExport" class="rme-autoexport-overlay">
      <div class="rme-autoexport-box">
        <i class="pi pi-spin pi-spinner" style="font-size: 28px; color: #4a7ab5"></i>
        <div class="rme-autoexport-msg">{{ autoExportMsg }}</div>
        <div class="rme-autoexport-noreg">Reg: {{ noreg }}</div>
      </div>
    </div>
  </Teleport>

  <!-- ════════════════════════════════════════════════
       DIALOG: Pengaturan Tampilan Halaman
  ════════════════════════════════════════════════ -->
  <Dialog
    v-model:visible="showSettingsDialog"
    modal
    :style="{ width: '500px' }"
    class="rme-sd-dialog no-print"
    :pt="{ header: { class: 'rme-sd-header' } }"
  >
    <template #header>
      <div class="rme-sd-header-inner">
        <i class="pi pi-sliders-h rme-sd-header-icon"></i>
        <div>
          <div class="rme-sd-title">Pengaturan Tampilan Halaman</div>
          <div class="rme-sd-subtitle">
            Pilih halaman yang ditampilkan &amp; dicetak • Disimpan per pengguna
          </div>
        </div>
      </div>
    </template>

    <div class="rme-sd-body">
      <div
        v-for="sec in sections"
        :key="sec.key"
        class="rme-sd-item"
        :class="{ 'is-on': settingTemp[sec.key] }"
        @click="settingTemp[sec.key] = !settingTemp[sec.key]"
      >
        <span
          class="rme-sd-sec-icon"
          :style="`background:${sec.bgColor}; color:${sec.color}; border-color:${sec.borderColor}`"
        >
          {{ sec.icon }}
        </span>
        <div class="rme-sd-sec-info">
          <span class="rme-sd-sec-label">{{ sec.label }}</span>
          <span class="rme-sd-sec-key">
            {{ sec.key }}
            <span
              v-if="sec.jenisRawat"
              class="rme-sd-rawat-badge"
              :class="sec.jenisRawat === 'INAP' ? 'is-inap' : 'is-jalan'"
            >
              {{ sec.jenisRawat === 'INAP' ? '🏥 Rawat Inap' : '🚶 Rawat Jalan' }}
            </span>
          </span>
        </div>
        <div
          class="rme-sd-toggle"
          :class="{ 'is-on': settingTemp[sec.key] }"
          :style="settingTemp[sec.key] ? `background:${sec.color}` : ''"
        >
          <div class="rme-sd-toggle-knob"></div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="rme-sd-footer">
        <button class="rme-sd-btn-reset" @click="resetSettings" title="Aktifkan semua halaman">
          <i class="pi pi-refresh"></i> Reset Default
        </button>
        <div style="flex: 1"></div>
        <button class="rme-sd-btn-cancel" @click="showSettingsDialog = false">Batal</button>
        <button class="rme-sd-btn-save" @click="saveSettings" :disabled="savingSettings">
          <i v-if="savingSettings" class="pi pi-spin pi-spinner"></i>
          <i v-else class="pi pi-check"></i>
          {{ savingSettings ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </template>
  </Dialog>
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
import RMESPRIsections from './sections/RMESPRIsections.vue'
import RMESirirajSection from './sections/RMESirirajSection.vue'
import RMEResumeRawatJalan from './sections/RMEResumeRawatJalan.vue'
import RMELembarKlaim from './sections/RMELembarKlaim.vue'
import RMERujukan from './sections/RMERujukan.vue'
import RMEHDViewer from './sections/RMEHDViewer.vue'
import SpeedDial from 'primevue/speeddial'
import Dialog from 'primevue/dialog'

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
const { id_client, company, LINK_LOGO, user_id } = storeToRefs(authStore)

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
    key: 'cover',
    shortLabel: 'Identitas',
    label: 'Identitas Pasien',
    icon: '📋',
    color: '#162d4e',
    bgColor: '#eef2f8',
    borderColor: '#8da8cc',
    visible: true,
    jenisRawat: null,
  },
  {
    key: 'lembar-klaim',
    shortLabel: 'Lembar Klaim',
    label: 'Berkas Klaim Individual Pasien (JKN)',
    icon: '📑',
    color: '#0c7a6a',
    bgColor: '#f0fdf8',
    borderColor: '#99d4cb',
    visible: true,
    jenisRawat: null,
  },

  {
    key: 'sep',
    shortLabel: 'SEP BPJS',
    label: 'Surat Eligibilitas Peserta (SEP)',
    icon: '🏥',
    color: '#007d3a',
    bgColor: '#f0fff8',
    borderColor: '#a8cfa8',
    visible: true,
    jenisRawat: null,
  },
  {
    key: 'spri-ranap',
    shortLabel: 'SPRI',
    label: 'Surat Rencana Rawat Inap (SPRI)',
    icon: '🏨',
    color: '#1565c0',
    bgColor: '#e3f0fb',
    borderColor: '#90caf9',
    visible: true,
    jenisRawat: 'INAP',
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
    jenisRawat: null,
    condition: (p) => p.JENISRAWAT === 'JALAN' && p.KODEPOLI !== 'IGD',
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
    jenisRawat: null,
    condition: (p) => p.JENISRAWAT === 'INAP' || (p.JENISRAWAT === 'JALAN' && p.KODEPOLI === 'IGD'),
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
    jenisRawat: 'INAP',
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
    jenisRawat: 'INAP',
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
    jenisRawat: null,
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
    jenisRawat: null,
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
    jenisRawat: null,
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
    jenisRawat: null,
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
    jenisRawat: 'INAP',
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
    jenisRawat: 'INAP',
  },
  {
    key: 'rujukan',
    shortLabel: 'Rujukan',
    label: 'Surat Rujukan Rumah Sakit',
    icon: '🔀',
    color: '#0277bd',
    bgColor: '#e1f5fe',
    borderColor: '#81d4fa',
    visible: true,
    jenisRawat: null,
  },
  {
    key: 'hemodialisa',
    shortLabel: 'Hemodialisa',
    label: 'Laporan Hemodialisa',
    icon: '💉',
    color: '#00838f',
    bgColor: '#e0f7fa',
    borderColor: '#80deea',
    visible: true,
    jenisRawat: null,
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
    jenisRawat: null,
  },
])

const visibleSections = computed(() => sections.value.filter((s) => s.visible))

const sectionVisible = (key) => {
  const sec = sections.value.find((s) => s.key === key)
  if (!sec?.visible) return false
  // Sembunyikan section jika child sudah melapor tidak ada data (false)
  // undefined = belum melapor (masih loading) → tetap tampil
  if (sectionDataStatus[key] === false) return false
  const p = dataPasien.value
  if (p?.JENISRAWAT) {
    if (sec.condition) {
      if (!sec.condition(p)) return false
    } else if (sec.jenisRawat) {
      if (sec.jenisRawat !== p.JENISRAWAT) return false
    }
  }
  return true
}

// Hanya tampilkan tab nav yang relevan dengan jenis rawat pasien saat ini
const visibleNavSections = computed(() => {
  const p = dataPasien.value
  if (!p?.JENISRAWAT) return sections.value
  return sections.value.filter((s) => {
    if (s.condition) return s.condition(p)
    if (!s.jenisRawat) return true
    return s.jenisRawat === p.JENISRAWAT
  })
})

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

// ── Auto-export (batch mode dari KlaimManajemen) ──────────────────────────────
const autoExport = computed(
  () => route.query.autoexport === '1' || route.query.autoexport === 'true',
)
const autoExportMsg = ref('Memuat data RME...')

const waitForSectionsReady = () =>
  new Promise((resolve) => {
    const STABILIZE_MS = 2500
    const MAX_WAIT_MS = 35000
    let stabilizeTimer = null
    const done = () => {
      clearTimeout(stabilizeTimer)
      stopWatcher()
      resolve()
    }
    const reschedule = () => {
      clearTimeout(stabilizeTimer)
      stabilizeTimer = setTimeout(done, STABILIZE_MS)
    }
    const stopWatcher = watch(sectionDataStatus, reschedule, { deep: true })
    reschedule()
    setTimeout(done, MAX_WAIT_MS)
  })

// ── Export PDF ────────────────────────────────────────────────────────────────
const isExportingPDF = ref(false)
const exportProgress = ref('')

const PDF_QUALITY_PRESETS = [
  { key: 'tinggi', label: 'Tinggi', scale: 2, imgQuality: 0.92, desc: '~3–8 MB, kualitas terbaik' },
  { key: 'sedang', label: 'Sedang', scale: 1.5, imgQuality: 0.78, desc: '~1–3 MB, seimbang' },
  { key: 'rendah', label: 'Rendah', scale: 1, imgQuality: 0.6, desc: '< 1 MB, file kecil' },
]
const pdfQuality = ref(localStorage.getItem('rme_pdf_quality') || 'sedang')
const currentQualityPreset = computed(
  () => PDF_QUALITY_PRESETS.find((p) => p.key === pdfQuality.value) || PDF_QUALITY_PRESETS[1],
)
const setPdfQuality = (key) => {
  pdfQuality.value = key
  localStorage.setItem('rme_pdf_quality', key)
}

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
    const resp = await fetch(url)
    if (!resp.ok) return null
    // Tolak HTML (SPA try_files fallback dari nginx), terima semua content-type lain
    const ct = resp.headers.get('content-type') || ''
    if (ct.startsWith('text/html')) return null
    return await _blobToBase64(await resp.blob())
  } catch {
    /* gagal — CORS, network error, dll */
  }
  return null
}

const _fetchImageBase64 = async (src) => {
  if (_imgBase64Cache.has(src)) return _imgBase64Cache.get(src)

  let b64 = null
  const _dbg = (step, ok) =>
    console.debug(`[img-b64] step=${step} ok=${ok} src=${src.slice(-60)}`)

  // 1) Dev-proxy Vite: hanya aktif saat npm run dev (Vite dev server)
  if (src.includes('ws-simrs.net')) {
    const proxyUrl = src.replace('https://ws-simrs.net', '/ws-simrs-assets')
    b64 = await _tryFetch(proxyUrl)
    _dbg(1, !!b64)
  }

  // 2) Backend API proxy untuk semua gambar cross-origin (production fallback)
  //    Requires: route GET index.php/api/img_proxy?url=... di CodeIgniter API
  if (!b64) {
    try {
      const isCrossOrigin = new URL(src).origin !== window.location.origin
      if (isCrossOrigin) {
        const proxyUrl = `${configStore.apiBaseUrl}index.php/api/img_proxy?url=${encodeURIComponent(src)}`
        b64 = await _tryFetch(proxyUrl)
        _dbg(2, !!b64)
      }
    } catch { /* URL tidak valid, skip */ }
  }

  // 3) Fetch langsung (same-origin atau server dengan CORS header)
  if (!b64) {
    b64 = await _tryFetch(src)
    _dbg(3, !!b64)
  }

  // 4) Fallback canvas dari DOM img yang sudah ada (perlu crossOrigin="anonymous")
  if (!b64) {
    try {
      const resolvedSrc = new URL(src, window.location.href).href
      const img = Array.from(document.querySelectorAll('img')).find(
        (i) => i.src === resolvedSrc || i.getAttribute('src') === src,
      )
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
    _dbg(4, !!b64)
  }

  // 5) Load ulang dengan crossOrigin="anonymous" (berhasil jika server kirim CORS header)
  if (!b64) {
    b64 = await new Promise((resolve) => {
      const tmpImg = new Image()
      tmpImg.crossOrigin = 'anonymous'
      const timer = setTimeout(() => resolve(null), 8000)
      tmpImg.onload = () => {
        clearTimeout(timer)
        try {
          const c = document.createElement('canvas')
          c.width = tmpImg.naturalWidth
          c.height = tmpImg.naturalHeight
          c.getContext('2d').drawImage(tmpImg, 0, 0)
          resolve(c.toDataURL('image/png'))
        } catch {
          resolve(null)
        }
      }
      tmpImg.onerror = () => {
        clearTimeout(timer)
        resolve(null)
      }
      tmpImg.src = src
    })
    _dbg(5, !!b64)
  }

  _imgBase64Cache.set(src, b64)
  return b64
}

// Tunggu semua img dalam elemen selesai load sebelum capture
const _waitForImages = (el, timeout = 10000) =>
  new Promise((resolve) => {
    const imgs = [...el.querySelectorAll('img[src]')]
    const incomplete = imgs.filter((img) => !img.complete || img.naturalWidth === 0)
    if (!incomplete.length) {
      resolve()
      return
    }
    let remaining = incomplete.length
    const timer = setTimeout(resolve, timeout)
    const done = () => {
      if (--remaining <= 0) {
        clearTimeout(timer)
        resolve()
      }
    }
    incomplete.forEach((img) => {
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
    })
  })

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

const exportToPDF = async (returnBuffer = false) => {
  if (isExportingPDF.value) return
  isExportingPDF.value = true
  exportProgress.value = 'Mempersiapkan...'

  const preset = currentQualityPreset.value
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
      const sectionKey = page.dataset.section || `halaman-${i + 1}`

      exportProgress.value = `Memproses ${i + 1}/${pages.length}: ${sectionKey}...`

      // Tunggu semua img selesai load, lalu konversi ke base64 agar tidak terblokir CORS
      await _waitForImages(page)
      const restoreImages = await _prepareImages(page)

      const rect = page.getBoundingClientRect()
      const captureW = page.offsetWidth || Math.round(rect.width)
      const captureH = page.scrollHeight

      const canvas = await html2canvas(page, {
        scale: preset.scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: captureW,
        height: captureH,
      })

      // Kembalikan src asli setelah capture
      restoreImages()

      const imgData = canvas.toDataURL('image/jpeg', preset.imgQuality)

      // Lebar A4 dalam mm (portrait=210, landscape=297)
      const pageWidthMM = isLandscape ? 297 : 210
      // Tinggi halaman PDF menyesuaikan tinggi konten aktual (bukan fixed A4)
      const pageHeightMM = (canvas.height / canvas.width) * pageWidthMM

      if (i === 0) {
        pdf = new jsPDF({ unit: 'mm', format: [pageWidthMM, pageHeightMM] })
      } else {
        pdf.addPage([pageWidthMM, pageHeightMM])
      }

      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH)
    }

    const nosep = dataPasien.value?.NOSEP || noreg.value
    const filename = `${nosep}.pdf`
    exportProgress.value = 'Menyimpan PDF...'
    if (returnBuffer) {
      const buffer = pdf.output('arraybuffer')
      return { buffer, filename }
    }
    pdf.save(filename)
  } catch (err) {
    console.error('Export PDF gagal:', err)
    if (!returnBuffer) alert('Gagal mengekspor PDF: ' + err.message)
    throw err
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
    label: 'Pengaturan Halaman',
    icon: 'pi pi-sliders-h',
    command: () => openSettings(),
  },
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
// ── Section Settings Dialog ──────────────────────────────────────────────────────
const showSettingsDialog = ref(false)
const settingTemp = reactive({})
const savingSettings = ref(false)

const openSettings = () => {
  sections.value.forEach((s) => {
    settingTemp[s.key] = s.visible
  })
  showSettingsDialog.value = true
}

const resetSettings = () => {
  sections.value.forEach((s) => {
    settingTemp[s.key] = true
  })
}

const STORAGE_KNOWN_KEYS = 'rme_setting_known_keys'

const fetchSectionSettings = async () => {
  if (!id_client.value || !user_id.value) return
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/otorisasi/get_rme_setting`,
      { id_client: id_client.value, user_id: user_id.value },
    )
    const visibleKeys = res.data?.response
    if (Array.isArray(visibleKeys)) {
      // Daftar section yang dikenal saat settings terakhir disimpan
      const knownAtSave = JSON.parse(localStorage.getItem(STORAGE_KNOWN_KEYS) || '[]')
      sections.value.forEach((s) => {
        if (knownAtSave.length === 0 || knownAtSave.includes(s.key)) {
          // Section yang sudah dikenal → terapkan saved state
          s.visible = visibleKeys.includes(s.key)
        }
        // Section baru (tidak ada di knownAtSave) → biarkan default visible: true
      })
    }
  } catch {
    // Silently use defaults
  }
}

const saveSettings = async () => {
  savingSettings.value = true
  sections.value.forEach((s) => {
    s.visible = settingTemp[s.key]
  })
  const visibleKeys = sections.value.filter((s) => s.visible).map((s) => s.key)
  // Simpan daftar semua section yang dikenal saat ini
  localStorage.setItem(STORAGE_KNOWN_KEYS, JSON.stringify(sections.value.map((s) => s.key)))
  try {
    await axios.post(`${configStore.apiBaseUrl}/index.php/api/otorisasi/save_rme_setting`, {
      id_client: id_client.value,
      user_id: user_id.value,
      sections_visible: visibleKeys,
    })
  } catch {
    // Setting tetap tersimpan lokal walau API gagal
  } finally {
    savingSettings.value = false
    showSettingsDialog.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchPatient(), fetchSectionSettings()])
  nextTick(setupObserver)
  document.addEventListener('keydown', onKeyZoom)
  document.addEventListener('wheel', onWheelZoom, { passive: false })
  if (window.innerWidth < 640 && !localStorage.getItem('rme_zoom')) {
    zoom.value = Math.max(40, Math.floor((window.innerWidth - 16) / 7.94))
  }

  // ── Mode auto-export (dipanggil dari batch export KlaimManajemen) ──
  if (autoExport.value) {
    autoExportMsg.value = 'Memuat data RME...'
    await waitForSectionsReady()
    autoExportMsg.value = 'Membuat file PDF...'
    await nextTick()
    try {
      const result = await exportToPDF(true)
      if (result?.buffer) {
        window.parent.postMessage(
          {
            type: 'rme_export_done',
            noreg: noreg.value,
            filename: result.filename,
            pdfBuffer: result.buffer,
          },
          '*',
          [result.buffer],
        )
      } else {
        window.parent.postMessage({ type: 'rme_export_done', noreg: noreg.value }, '*')
      }
    } catch (e) {
      window.parent.postMessage(
        {
          type: 'rme_export_error',
          noreg: noreg.value,
          message: String(e?.message || e),
        },
        '*',
      )
    }
  }
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
  align-items: center;
}

/* ── PDF quality selector ── */
.rme-pdf-group {
  display: flex;
  align-items: stretch;
  gap: 0;
}
.rme-quality-seg {
  display: flex;
  border-radius: 4px 0 0 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-right: none;
}
.rme-qbtn {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.75);
  border: none;
  padding: 0 9px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  transition:
    background 0.15s,
    color 0.15s;
  line-height: 1;
}
.rme-qbtn:last-child {
  border-right: none;
}
.rme-qbtn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.24);
  color: #fff;
}
.rme-qbtn.active {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 700;
}
.rme-qbtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.rme-pdf-group .rme-btn-pdf {
  border-radius: 0 4px 4px 0;
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
  gap: 12px;
}

/* ── A4 Paper ── */
.rme-a4-page {
  background: #fff;
  width: 210mm;
  min-height: 297mm;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
  border-radius: 2px;
  padding: 14mm 14mm 10mm;
  box-sizing: border-box;
  position: relative;
  /* Page-break guide every 297mm for screen preview */
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent calc(297mm - 1px),
    #d0d9e8 calc(297mm - 1px),
    #d0d9e8 297mm
  );
}

/* ── No-data overlay (screen only, tidak tercetak) ── */
.rme-section-no-data {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(241, 245, 249, 0.97);
  border: 2px dashed #cbd5e1;
  color: #64748b;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  z-index: 10;
  border-radius: 4px;
}
.rme-section-no-data i {
  font-size: 3.5rem;
  color: #94a3b8;
  opacity: 0.7;
}
.rme-section-no-data span {
  background: #fff;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  color: #475569;
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
.rme-badge-secondary {
  background: #f3f4f6;
  color: #6b7280;
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

/* ════ MOBILE ≤ 640px ═══════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  /* ── Toolbar: 2-row compact ── */
  .rme-toolbar {
    height: auto;
    flex-wrap: wrap;
    padding: 5px 8px;
    gap: 4px;
    row-gap: 0;
    min-height: 52px;
  }
  .rme-toolbar-brand {
    min-width: unset;
    flex: 1;
    order: 1;
  }
  .rme-toolbar-brand-text {
    display: none; /* hide RS name — saves space */
  }
  .rme-toolbar-actions {
    order: 2;
    gap: 4px;
  }
  /* Hide zoom slider on mobile — use speed dial instead */
  .rme-zoom-ctrl,
  .rme-zoom-sep {
    display: none;
  }
  .rme-toolbar-patient {
    order: 3;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    padding: 3px 0 1px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }
  .rme-tb-name {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 45vw;
  }
  .rme-tb-meta {
    font-size: 9px;
    opacity: 0.88;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* Buttons: icon only — hide text label */
  .rme-btn {
    padding: 6px 8px;
    font-size: 14px;
    min-width: 36px;
    justify-content: center;
    display: flex;
    align-items: center;
  }
  .rme-btn-text {
    display: none;
  }
  .rme-btn-pdf {
    min-width: unset;
  }

  /* ── Print area: bottom padding for nav bar ── */
  .rme-print-area {
    margin-top: 80px;
    padding: 8px 4px 68px 4px;
    overflow-x: auto;
  }

  /* ── Nav: horizontal scrollable bottom bar ── */
  .rme-sticky-nav {
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 56px !important;
    flex-direction: row !important;
    overflow-y: hidden !important;
    overflow-x: auto !important;
    padding: 5px 6px !important;
    gap: 4px !important;
    background: rgba(255, 255, 255, 0.97) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border-top: 1px solid #dee2e6 !important;
    border-radius: 0 !important;
    box-shadow: 0 -3px 14px rgba(0, 0, 0, 0.12) !important;
    align-items: center !important;
    /* Disable hover-mode slide on mobile */
    transform: none !important;
    transition: none !important;
  }
  /* Regular pill tabs — no arrow clip-path */
  .rme-sticky-tab {
    clip-path: none !important;
    border-radius: 8px !important;
    width: auto !important;
    min-width: 46px !important;
    height: 42px !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 2px 7px !important;
    gap: 1px !important;
    background: #f0f4f8 !important;
    color: #555 !important;
    box-shadow: none !important;
    border: 1px solid #e0e6ed !important;
    flex-shrink: 0 !important;
  }
  .rme-sticky-tab.is-active {
    background: var(--tc, #162d4e) !important;
    color: #fff !important;
    border-color: transparent !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22) !important;
  }
  .rme-sticky-tab:hover {
    box-shadow: none !important;
  }
  .rme-sticky-tab.is-no-data {
    filter: none !important;
    opacity: 0.45 !important;
  }
  .rst-icon {
    font-size: 15px !important;
    line-height: 1 !important;
  }
  .rst-label {
    font-size: 8px !important;
    text-align: center !important;
    line-height: 1.1 !important;
  }
  /* Hide the nav mode toggle on mobile (no hover mode concept) */
  .rme-nav-mode-toggle {
    display: none !important;
  }

  /* ── Speed dial: above bottom nav ── */
  .rme-speeddial-wrap {
    bottom: 64px !important;
    right: 10px !important;
  }
}

/* ════ PRINT MEDIA ══════════════════════════════════════════════════════════ */
@media print {
  .no-print,
  .rme-toolbar,
  .rme-sticky-nav,
  .rme-section-no-data {
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
    background-image: none !important;
    width: 100% !important;
    min-height: auto !important;
    padding: 10mm 12mm !important;
    /* Jangan paksa halaman baru setelah section kecil.
       break-inside: avoid → section dipindah ke halaman baru jika tidak muat,
       tapi tidak memaksa halaman kosong setelah section yang kecil. */
    break-inside: avoid;
    break-after: auto;
    margin-bottom: 0 !important;
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

/* ════ SETTINGS DIALOG ════════════════════════════════════════════════════════ */
.rme-sd-header {
  padding: 0 !important;
}
.rme-sd-header-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px 14px;
  background: linear-gradient(135deg, #162d4e 0%, #1e4080 100%);
  border-radius: 8px 8px 0 0;
  width: 100%;
}
.rme-sd-header-icon {
  font-size: 22px;
  color: #7eb3e8;
  flex-shrink: 0;
}
.rme-sd-title {
  font-size: 15px;
  font-weight: 700;
  color: #e8f0fb;
  line-height: 1.3;
}
.rme-sd-subtitle {
  font-size: 11px;
  color: #8fadd4;
  margin-top: 2px;
}

.rme-sd-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 4px 4px;
  max-height: 60vh;
  overflow-y: auto;
}

.rme-sd-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid #e8ecf4;
  background: #f9fafc;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  user-select: none;
}
.rme-sd-item:hover {
  background: #eef3fc;
  border-color: #c2d3f0;
}
.rme-sd-item.is-on {
  background: #f0f6ff;
  border-color: #b2c8f0;
}

.rme-sd-sec-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.rme-sd-sec-info {
  flex: 1;
  min-width: 0;
}
.rme-sd-sec-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1a2d4e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rme-sd-sec-key {
  display: block;
  font-size: 10px;
  color: #8899bb;
  margin-top: 1px;
}
.rme-sd-rawat-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 8px;
  margin-left: 4px;
  vertical-align: middle;
}
.rme-sd-rawat-badge.is-inap {
  background: #e3f0fb;
  color: #1565c0;
}
.rme-sd-rawat-badge.is-jalan {
  background: #f0fdf4;
  color: #1a6b4a;
}

/* Toggle switch */
.rme-sd-toggle {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #d0d8e8;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s;
}
.rme-sd-toggle-knob {
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: left 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.rme-sd-toggle.is-on .rme-sd-toggle-knob {
  left: 21px;
}

/* Footer */
.rme-sd-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.rme-sd-btn-reset {
  background: none;
  border: 1px solid #c0cce0;
  color: #5570a0;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}
.rme-sd-btn-reset:hover {
  background: #eef3fc;
}
.rme-sd-btn-cancel {
  background: #f4f6f9;
  border: 1px solid #d0d8e8;
  color: #445577;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
.rme-sd-btn-cancel:hover {
  background: #e8ecf4;
}
.rme-sd-btn-save {
  background: #1a4080;
  border: none;
  color: #fff;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: background 0.15s;
}
.rme-sd-btn-save:hover:not(:disabled) {
  background: #162d4e;
}
.rme-sd-btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toolbar setting button */
.rme-btn-setting {
  background: #2a4a7a;
  border-color: #3a5a8a;
  color: #d4e4f8;
}
.rme-btn-setting:hover {
  background: #1a3a6a;
}

/* ── Auto-export overlay ── */
.rme-autoexport-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.96);
  display: flex;
  align-items: center;
  justify-content: center;
}
.rme-autoexport-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 36px 52px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  text-align: center;
  border: 1px solid #dde8f4;
}
.rme-autoexport-msg {
  font-size: 16px;
  font-weight: 600;
  color: #162d4e;
}
.rme-autoexport-noreg {
  font-size: 12px;
  color: #888;
}
</style>
