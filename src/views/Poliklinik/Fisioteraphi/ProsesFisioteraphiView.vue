<template>
  <loading_overlay :is-loading="loading" message="Memuat data..." />
  <Toast />

  <div class="content">
    <!-- ══ HERO BANNER ══ -->
    <div class="hero-banner">
      <div class="hero-top">
        <Button
          icon="pi pi-arrow-left"
          label="Kembali"
          size="small"
          severity="secondary"
          class="btn-back"
          @click="router.back()"
        />
        <div class="hero-breadcrumb">
          <span>Fisioterapi</span>
          <i class="pi pi-chevron-right" style="font-size: 0.6rem; margin: 0 4px"></i>
          <span>Proses Layanan</span>
        </div>
      </div>

      <div class="hero-body">
        <!-- Identitas kiri -->
        <div class="hero-identity">
          <div class="hero-avatar">
            <i
              :class="q.jenis_kelamin?.toLowerCase() === 'p' ? 'fas fa-female' : 'fas fa-male'"
            ></i>
          </div>
          <div>
            <p class="hero-norm">{{ q.norm || '-' }}</p>
            <h1 class="hero-name">{{ q.nama_pasien || 'Data Pasien' }}</h1>
            <div class="hero-tags">
              <span class="htag htag-usia">
                <i class="pi pi-user me-1"></i>
                {{ usia.label }}
              </span>
              <span class="htag htag-gender">
                <i class="pi pi-venus-mars me-1"></i>
                {{ q.jenis_kelamin || '-' }}
              </span>
              <span class="htag" :class="q.status_layanan == '1' ? 'htag-done' : 'htag-pending'">
                <i class="pi pi-circle-fill me-1" style="font-size: 0.45rem"></i>
                {{ q.status_layanan == '1' ? 'Sudah Dilayani' : 'Menunggu Layanan' }}
              </span>
              <span v-if="q.prioritas" class="htag" :class="prioritasTagClass">
                <i class="pi pi-flag me-1"></i>
                {{ q.prioritas }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stat kotak kanan -->
        <div class="hero-stats">
          <div class="hstat">
            <div class="hstat-icon" style="background: rgba(255, 255, 255, 0.15)">
              <i class="pi pi-hashtag"></i>
            </div>
            <div>
              <div class="hstat-label">No. Permintaan</div>
              <div class="hstat-value">{{ q.no_permintaan || '-' }}</div>
            </div>
          </div>
          <div class="hstat">
            <div class="hstat-icon" style="background: rgba(255, 255, 255, 0.15)">
              <i class="pi pi-file-edit"></i>
            </div>
            <div>
              <div class="hstat-label">No. Register</div>
              <div class="hstat-value">{{ q.no_register || '-' }}</div>
            </div>
          </div>
          <div class="hstat">
            <div class="hstat-icon" style="background: rgba(255, 255, 255, 0.15)">
              <i class="pi pi-clock"></i>
            </div>
            <div>
              <div class="hstat-label">Tgl. Permintaan</div>
              <div class="hstat-value">{{ formatTgl(q.tgl_permintaan) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ INFO ROW ══ -->
    <div class="info-row">
      <!-- Pengirim -->
      <Panel class="panel-card">
        <template #header>
          <h6 style="color: darkcyan">
            <i class="fas fa-hospital-user me-1"></i><strong>PENGIRIM</strong>
          </h6>
        </template>
        <div class="ic-body">
          <div class="ic-field">
            <span class="ic-label">Poli / Unit Asal</span>
            <span class="ic-value">{{ q.poli_asal || '-' }}</span>
          </div>
          <div class="ic-field">
            <span class="ic-label">Dokter Pengirim</span>
            <span class="ic-value">{{ q.nama_dokter || '-' }}</span>
          </div>
        </div>
      </Panel>

      <!-- Klinis -->
      <Panel class="panel-card panel-card--wide">
        <template #header>
          <h6 style="color: darkcyan">
            <i class="fas fa-stethoscope me-1"></i><strong>DATA KLINIS</strong>
          </h6>
        </template>
        <div class="ic-body">
          <div class="ic-field">
            <span class="ic-label">Keluhan / Klinis</span>
            <span class="ic-value">{{ q.klinis || '-' }}</span>
          </div>
          <div class="ic-field" v-if="q.lokasi_keluhan">
            <span class="ic-label">Lokasi Keluhan</span>
            <span class="ic-value">{{ q.lokasi_keluhan }}</span>
          </div>
          <div class="ic-field" v-if="q.skala_nyeri">
            <span class="ic-label">Skala Nyeri</span>
            <span class="ic-value">
              <div class="nyeri-bar">
                <div
                  class="nyeri-fill"
                  :style="{ width: `${Number(q.skala_nyeri) * 10}%`, background: nyeriColor }"
                ></div>
              </div>
              <span class="nyeri-label" :style="{ color: nyeriColor }">
                {{ q.skala_nyeri }} / 10 — {{ nyeriKategori }}
              </span>
            </span>
          </div>
        </div>
      </Panel>

      <!-- Identitas Pasien -->
      <Panel class="panel-card">
        <template #header>
          <h6 style="color: darkcyan">
            <i class="fas fa-id-card me-1"></i><strong>IDENTITAS PASIEN</strong>
          </h6>
        </template>
        <div class="ic-body">
          <div class="ic-field">
            <span class="ic-label">No. Rekam Medis</span>
            <span class="ic-value font-mono">{{ q.norm || '-' }}</span>
          </div>
          <div class="ic-field">
            <span class="ic-label">Tanggal Lahir</span>
            <span class="ic-value">{{ q.tgl_lahir_pasien || '-' }}</span>
          </div>
          <div class="ic-field">
            <span class="ic-label">Usia</span>
            <span class="ic-value usia-chip">{{ usia.label }}</span>
          </div>
          <div class="ic-field">
            <span class="ic-label">Jenis Kelamin</span>
            <span class="ic-value">{{ q.jenis_kelamin || '-' }}</span>
          </div>
        </div>
      </Panel>
    </div>
  </div>
  <TindakanForm v-if="fact" :datapasien="fact"></TindakanForm>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import Panel from 'primevue/panel'
import axios from 'axios'

import TindakanForm from '@/components/PoliklinikComponent/TindakanCompnent.vue'

// import TindakanCompnent from '@/components/TindakanComponent.vue'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const fact = ref([])

// ── Query params ───────────────────────────────────────────
const q = computed(() => ({
  no_permintaan: route.query.no_permintaan ?? '',
  no_register: route.params.noreg ?? '',
  norm: route.query.norm ?? '',
  nama_pasien: route.query.nama_pasien ?? '',
  tgl_lahir_pasien: route.query.tgl_lahir_pasien ?? '',
  jenis_kelamin: route.query.jenis_kelamin ?? '',
  poli_asal: route.query.poli_asal ?? '',
  nama_dokter: route.query.nama_dokter ?? '',
  klinis: route.query.klinis ?? '',
  lokasi_keluhan: route.query.lokasi_keluhan ?? '',
  skala_nyeri: route.query.skala_nyeri ?? '',
  prioritas: route.query.prioritas ?? '',
  tgl_permintaan: route.query.tgl_permintaan ?? '',
  status_layanan: route.query.status_layanan ?? '',
}))

// ── Hitung usia ────────────────────────────────────────────
const usia = computed(() => {
  const tgl = q.value.tgl_lahir_pasien
  if (!tgl) return { label: '-' }
  const lahir = new Date(tgl)
  if (isNaN(lahir.getTime())) return { label: '-' }
  const now = new Date()
  let tahun = now.getFullYear() - lahir.getFullYear()
  let bulan = now.getMonth() - lahir.getMonth()
  let hari = now.getDate() - lahir.getDate()
  if (hari < 0) {
    bulan--
    hari += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (bulan < 0) {
    tahun--
    bulan += 12
  }
  const label =
    tahun > 0
      ? `${tahun} Thn ${bulan} Bln ${hari} Hr`
      : bulan > 0
        ? `${bulan} Bln ${hari} Hr`
        : `${hari} Hr`
  return { tahun, bulan, hari, label }
})

// ── Nyeri helpers ──────────────────────────────────────────
const nyeriColor = computed(() => {
  const n = Number(q.value.skala_nyeri)
  if (n <= 3) return '#10b981'
  if (n <= 6) return '#f59e0b'
  return '#ef4444'
})

const nyeriKategori = computed(() => {
  const n = Number(q.value.skala_nyeri)
  if (n <= 3) return 'Ringan'
  if (n <= 6) return 'Sedang'
  return 'Berat'
})

// ── Prioritas class ────────────────────────────────────────
const prioritasTagClass = computed(() => {
  const p = (q.value.prioritas ?? '').toLowerCase()
  if (p.includes('segera') || p.includes('urgent')) return 'htag-urgent'
  if (p.includes('tinggi')) return 'htag-high'
  return 'htag-normal'
})

// ── Format tanggal ─────────────────────────────────────────
const formatTgl = (str) => {
  if (!str) return '-'
  const [tgl, jam] = str.split(' ')
  return jam ? `${tgl}  ${jam}` : tgl
}

// ── Fetch tindakan ─────────────────────────────────────────
const fetchData = async () => {
  try {
    loading.value = true

    const param = {
      mod: 1,
      noregister: route.params.noreg,
      id_client: id_client.value,
    }

    console.log('call data pasein')

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, param)

    console.log('call data trans', response.data.response)

    if (response.data.response && response.data.response.length > 0) {
      fact.value = response.data.response[0]
    }

    loading.value = false
  } catch (error) {
    console.error('Error fetching patient data:', error)
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
/* ══════════════════════════════════════════
   HERO BANNER
══════════════════════════════════════════ */
.hero-banner {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 5px;
  padding: 1.25rem 1.5rem 1.5rem;
  margin-bottom: 1.25rem;
  color: #fff;
  box-shadow: 0 6px 24px rgba(8, 145, 178, 0.3);
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.btn-back {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
  flex-shrink: 0;
}
.btn-back:hover {
  background: rgba(255, 255, 255, 0.25) !important;
}

.hero-breadcrumb {
  font-size: 0.78rem;
  opacity: 0.75;
  display: flex;
  align-items: center;
  gap: 2px;
}

.hero-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Avatar + nama */
.hero-identity {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.hero-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.hero-norm {
  font-size: 0.72rem;
  opacity: 0.7;
  margin: 0 0 2px;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.hero-name {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.6rem;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.htag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.htag-usia {
  background: rgba(255, 255, 255, 0.18);
}
.htag-gender {
  background: rgba(255, 255, 255, 0.12);
}
.htag-done {
  background: rgba(16, 185, 129, 0.35);
  border-color: rgba(16, 185, 129, 0.5);
}
.htag-pending {
  background: rgba(245, 158, 11, 0.35);
  border-color: rgba(245, 158, 11, 0.5);
}
.htag-urgent {
  background: rgba(239, 68, 68, 0.4);
  border-color: rgba(239, 68, 68, 0.6);
}
.htag-high {
  background: rgba(249, 115, 22, 0.4);
  border-color: rgba(249, 115, 22, 0.6);
}
.htag-normal {
  background: rgba(255, 255, 255, 0.12);
}

/* Stat kotak kanan */
.hero-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-self: flex-start;
}

.hstat {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  min-width: 140px;
}

.hstat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.hstat-label {
  font-size: 0.64rem;
  opacity: 0.72;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
  margin-bottom: 3px;
}

.hstat-value {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2; /* ════════════════════════════════════════════
   INFO ROW — Panel layout
════════════════════════════════════════════ */
}
.info-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  align-items: stretch;
}

.panel-card {
  flex: 1;
  min-width: 220px;
}
.panel-card--wide {
  flex: 2;
  min-width: 280px;
}
.panel-tindakan {
  margin-bottom: 1.25rem;
}

/* Panel info sama tinggi
   .panel-card IS the p-panel root element, so prefix selector di luar :deep() */
.panel-card :deep(.p-panel-content-container) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.panel-card :deep(.p-panel-content) {
  flex: 1;
  padding: 0 !important;
}

/* PrimeVue Panel overrides */
:deep(.p-panel-header) {
  background: linear-gradient(90deg, #f0fdfa, #f8fafc) !important;
  padding: 0.6rem 1rem !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

:deep(.p-panel-content) {
  padding: 0 !important;
}

/* Field / value */
.ic-body {
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.ic-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ic-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ic-value {
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.4;
}
.font-mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.08em;
  color: #0891b2;
  font-weight: 700;
}
.usia-chip {
  display: inline-block;
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
  border-radius: 20px;
  padding: 1px 10px;
  font-size: 0.78rem;
  font-weight: 700;
}

/* Nyeri bar */
.nyeri-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
  width: 100%;
  max-width: 220px;
}
.nyeri-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}
.nyeri-label {
  font-size: 0.78rem;
  font-weight: 700;
}

/* Empty state */
.ts-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-body {
    flex-direction: column;
  }
  .hero-stats {
    width: 100%;
  }
  .hstat {
    min-width: 0;
    flex: 1;
  }
  .info-row {
    flex-direction: column;
  }
  .panel-card,
  .panel-card--wide {
    flex: unset;
    width: 100%;
  }
}
</style>
