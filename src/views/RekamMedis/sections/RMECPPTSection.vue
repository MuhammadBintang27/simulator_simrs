<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-file-edit no-print" style="color: #1a3a5f"></i>
      CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT / SOAP)
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat catatan CPPT...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!fact || fact.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Belum ada catatan CPPT/SOAP untuk kunjungan ini.
    </div>

    <div v-else>
      <div
        v-for="item in fact"
        :key="item.id"
        class="rme-cppt-card"
        :class="{ 'rme-cppt-auth': item.hasbeen_auth == 1 }"
      >
        <!-- Header -->
        <div class="rme-cppt-header">
          <div class="rme-cppt-header-left">
            <span class="rme-cppt-counter">#{{ item.counter }}</span>
            <span
              class="rme-badge"
              :class="item.jenis_dok === 'SBAR' ? 'rme-badge-warning' : 'rme-badge-primary'"
            >
              {{ item.jenis_dok || 'CPPT' }}
            </span>
            <span class="rme-cppt-time">{{ item.waktu_display || '-' }}</span>
          </div>
          <div class="rme-cppt-header-right">
            <span class="rme-cppt-ppa">
              <strong>{{ item.profesi || '' }}</strong>
              <span v-if="item.verif_user_display"> — {{ item.verif_user_display }}</span>
            </span>
            <span v-if="item.hasbeen_auth == 1" class="rme-badge rme-badge-success">
              {{ '✓' }} Terotorisasi
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="rme-cppt-body">
          <!-- TTV ringkas (dari field numerik) -->
          <div v-if="hasTTV(item)" class="rme-cppt-ttv">
            <span v-if="Number(item.suhu) > 0">🌡 {{ item.suhu }}°C</span>
            <span v-if="Number(item.sistole) > 0">
              🩺 {{ item.sistole }}/{{ item.diastole }} mmHg
            </span>
            <span v-if="Number(item.nadi) > 0">❤️ {{ item.nadi }}x/mnt</span>
            <span v-if="Number(item.spo2) > 0">🫁 SpO₂ {{ item.spo2 }}%</span>
            <span v-if="Number(item.pernafasan) > 0 || Number(item.respirasi) > 0">
              🌬 {{ item.pernafasan || item.respirasi }}x/mnt
            </span>
            <span v-if="Number(item.gcs) > 0">🧠 GCS {{ item.gcs }}</span>
          </div>

          <!-- Grid SOAP / SBAR -->
          <div class="rme-cppt-soap-grid">
            <!-- S: Subjektif (plain text) -->
            <div v-if="item.subject" class="rme-cppt-soap-item">
              <div class="rme-cppt-soap-label">{{ item.caption1 || 'S' }}</div>
              <div class="rme-cppt-soap-content" v-html="formatText(item.subject)"></div>
            </div>

            <!--
              O: Objektif — object_display dari server sudah HTML (div, br, b, dll).
              Render langsung dengan v-html tanpa escape.
              Fallback ke item.object (plain text) jika object_display kosong.
            -->
            <div v-if="item.object_display || item.object" class="rme-cppt-soap-item">
              <div class="rme-cppt-soap-label">{{ item.caption2 || 'O' }}</div>
              <div
                class="rme-cppt-soap-content rme-cppt-obj-html"
                v-html="item.object_display || formatText(item.object)"
              ></div>
            </div>

            <!-- A: Asesment (plain text) -->
            <div v-if="item.asessment" class="rme-cppt-soap-item">
              <div class="rme-cppt-soap-label">{{ item.caption3 || 'A' }}</div>
              <div class="rme-cppt-soap-content" v-html="formatText(item.asessment)"></div>
            </div>

            <!-- P: Plan (plain text) -->
            <div v-if="item.plan" class="rme-cppt-soap-item">
              <div class="rme-cppt-soap-label">{{ item.caption4 || 'P' }}</div>
              <div class="rme-cppt-soap-content" v-html="formatText(item.plan)"></div>
            </div>
          </div>

          <!-- Catatan Penting -->
          <div v-if="item.catatan_penting" class="rme-cppt-catatan">
            <span class="rme-cppt-catatan-lbl">📌 Catatan Penting:</span>
            {{ item.catatan_penting }}
          </div>

          <!-- SBAR: status verifikasi DPJP -->
          <div v-if="item.jenis_dok === 'SBAR'" class="rme-cppt-verif">
            <template v-if="item.verif == 1">
              <span class="rme-badge rme-badge-success">{{ '✓' }} Terverifikasi DPJP</span>
              <span v-if="item.profesi_verif" class="rme-cppt-ppa">
                {{ item.profesi_verif }} — {{ item.verif_by_name }}
              </span>
            </template>
            <span v-else class="rme-badge rme-badge-warning">⏳ Menunggu Verifikasi DPJP</span>
          </div>

          <!-- QR Code: tampil hanya bila sudah diotorisasi -->
          <div v-if="item.hasbeen_auth == 1" class="rme-cppt-qr">
            <QrcodeVue
              :value="qrValue(item)"
              :size="50"
              level="H"
              render-as="svg"
              class="rme-cppt-qr-code"
            />
            <div class="rme-cppt-qr-info">
              <div class="rme-cppt-qr-title">✓ Dokumen Terotorisasi</div>
              <div v-if="item.time_auth" class="rme-cppt-qr-time">{{ item.time_auth }}</div>
              <div v-if="item.verif_user_display" class="rme-cppt-qr-by">
                {{ item.verif_user_display }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  noreg: { type: String, required: true },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const loading = ref(true)
const error = ref(null)
const fact = ref([])

/** TTV ditampilkan hanya bila ada minimal satu nilai > 0 */
const hasTTV = (item) =>
  Number(item.suhu) > 0 ||
  Number(item.sistole) > 0 ||
  Number(item.nadi) > 0 ||
  Number(item.spo2) > 0 ||
  Number(item.pernafasan) > 0 ||
  Number(item.respirasi) > 0 ||
  Number(item.gcs) > 0

/**
 * Bangun nilai QR untuk entry yang sudah diotorisasi.
 * Format: CPPT|{id}|{noregister}|{time_auth}|{profesi}|{verif_user_display}
 */
const qrValue = (item) =>
  ['CPPT', item.id, props.noreg, item.time_auth, item.profesi, item.verif_user_display]
    .map((v) => v ?? '')
    .join('|')

/**
 * Hanya untuk field plain-text (subject, asessment, plan).
 * Escape HTML lalu konversi newline ke <br/>.
 * JANGAN gunakan untuk object_display yang sudah HTML dari server.
 */
const formatText = (text) => {
  if (!text) return '-'
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Triaseigd/get_soap`,
      {
        mode: 4,
        noregister: props.noreg,
        id_client: id_client.value,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    // Filter item yang sudah dihapus
    fact.value = (response.data?.response || []).filter((x) => x.deleted !== '1')
  } catch (e) {
    error.value = 'Gagal memuat data CPPT: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* Nomor urut entry */
.rme-cppt-counter {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(0, 0, 0, 0.22);
  border-radius: 10px;
  padding: 1px 7px;
  flex-shrink: 0;
}

/*
  Normalisasi HTML dari object_display.
  Server mengirim inline style font-family/font-size yg terlalu besar.
  Override agar sesuai tema cetak RME.
*/
.rme-cppt-obj-html :deep(*) {
  font-size: 11px !important;
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
  line-height: 1.55 !important;
  color: #333 !important;
}

/* Catatan penting */
.rme-cppt-catatan {
  margin-top: 6px;
  padding: 4px 8px;
  background: #fff8e1;
  border-left: 3px solid #f9a825;
  border-radius: 2px;
  font-size: 11px;
  color: #5d4037;
}
.rme-cppt-catatan-lbl {
  font-weight: 700;
  margin-right: 4px;
}

/* ── QR Code otorisasi ────────────────────────────────── */
.rme-cppt-qr {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 6px 10px;
  background: #f0f7f0;
  border: 1px solid #a5d6a7;
  border-radius: 4px;
}

.rme-cppt-qr-code {
  flex-shrink: 0;
  /* Sedikit border putih agar QR tidak mepet di background hijau */
  background: #fff;
  padding: 3px;
  border-radius: 3px;
}

.rme-cppt-qr-info {
  flex: 1;
  min-width: 0;
}

.rme-cppt-qr-title {
  font-size: 10px;
  font-weight: 700;
  color: #2e7d32;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rme-cppt-qr-time {
  font-size: 10px;
  color: #4a6e4c;
  margin-top: 2px;
}

.rme-cppt-qr-by {
  font-size: 10px;
  color: #555;
  margin-top: 1px;
  font-style: italic;
}

/* Cetak: pastikan QR tetap terlihat di print */
@media print {
  .rme-cppt-qr {
    border-color: #888;
    background: #f8fdf8;
  }
}
</style>
