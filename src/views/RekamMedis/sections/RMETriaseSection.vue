<template>
  <div class="rme-section">
    <div class="rme-section-title">
      <i class="pi pi-heart-fill no-print" style="color: #e53935"></i>
      TRIASE IGD
    </div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data triase...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data triase untuk kunjungan ini.
    </div>

    <div v-else>
      <!-- ── Ringkasan Nilai Triase ─────────────────────────────────────────── -->
      <div v-if="nilaiTriase" class="triase-score-row">
        <div class="triase-score-box ts-emergensi">
          <div class="ts-count">{{ nilaiTriase.EMERGENSI || 0 }}</div>
          <div class="ts-lbl">EMERGENSI</div>
        </div>
        <div class="triase-score-box ts-urgent">
          <div class="ts-count">{{ nilaiTriase.URGENT || 0 }}</div>
          <div class="ts-lbl">URGENT</div>
        </div>
        <div class="triase-score-box ts-nonurgent">
          <div class="ts-count">{{ nilaiTriase.NON_URGENT || 0 }}</div>
          <div class="ts-lbl">NON URGENT</div>
        </div>
        <div class="triase-score-box ts-death">
          <div class="ts-count">{{ nilaiTriase.DEATH_ON_ARRIVAL || 0 }}</div>
          <div class="ts-lbl">DEATH ON ARRIVAL</div>
        </div>
        <div class="triase-score-kesimpulan" :class="'ts-kes-' + kesimpulanKey">
          Kategori: <strong>{{ kesimpulanTriase }}</strong>
        </div>
      </div>

      <!-- ── Cara Masuk Pasien ──────────────────────────────────────────────── -->
      <div class="rme-subsection-title">Cara Masuk Pasien</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tr>
              <td class="rme-td-lbl">Waktu Masuk</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.waktu || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Diantar Oleh</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.diantar_oleh || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Transportasi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.transportasi || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">DPJP</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.namadokter_sp || '-' }}</td>
            </tr>
          </table>
        </div>
        <div class="rme-info-col">
          <table class="rme-tbl-info">
            <tr>
              <td class="rme-td-lbl">Kesadaran</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.kesadaran || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Status Psikologi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ header.status_psikologi || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Resiko Jatuh</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                <span
                  :class="[
                    'rme-badge',
                    header.resiko_jatuh === 'YA' ? 'rme-badge-danger' : 'rme-badge-success',
                  ]"
                >
                  {{ header.resiko_jatuh || '-' }}
                </span>
              </td>
            </tr>
            <tr v-if="header.telah_verif">
              <td class="rme-td-lbl">Verifikasi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val" style="color: #2e7d32">
                {{ header.telah_verif }}
                <span v-if="header.jam_verif"> — {{ header.jam_verif }}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- ── Anamnese Singkat ───────────────────────────────────────────────── -->
      <div class="rme-subsection-title">Anamnese Singkat</div>
      <div class="rme-info-grid">
        <div class="rme-info-col">
          <div class="triase-field-lbl">Keluhan Utama</div>
          <div class="rme-textarea-box">{{ header.keluhan_utama || '-' }}</div>
        </div>
        <div class="rme-info-col">
          <div class="triase-field-lbl">Riwayat Penyakit Dahulu</div>
          <div class="rme-textarea-box">{{ header.riwayat_penyakit_dahulu || '-' }}</div>
        </div>
      </div>

      <!-- ── Tanda-Tanda Vital ──────────────────────────────────────────────── -->
      <div class="rme-subsection-title">Keadaan Umum / Tanda-Tanda Vital</div>
      <div class="rme-vital-grid">
        <div class="rme-vital-card">
          <div class="rme-vital-label">Suhu</div>
          <div class="rme-vital-value">{{ header.suhu ?? '-' }}</div>
          <div class="rme-vital-unit">°C</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">TD</div>
          <div class="rme-vital-value">
            {{ header.tensi_sistol ?? '-' }}/{{ header.tensi_distol ?? '-' }}
          </div>
          <div class="rme-vital-unit">mmHg</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Nadi</div>
          <div class="rme-vital-value">{{ header.nadipermenit ?? '-' }}</div>
          <div class="rme-vital-unit">x/mnt</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Saturasi O₂</div>
          <div class="rme-vital-value">{{ header.saturasi ?? '-' }}</div>
          <div class="rme-vital-unit">%</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Pernapasan</div>
          <div class="rme-vital-value">{{ header.respirasi ?? '-' }}</div>
          <div class="rme-vital-unit">x/mnt</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Berat Badan</div>
          <div class="rme-vital-value">{{ header.bb ?? '-' }}</div>
          <div class="rme-vital-unit">kg</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Tinggi Badan</div>
          <div class="rme-vital-value">{{ header.tb ?? '-' }}</div>
          <div class="rme-vital-unit">cm</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Skala Nyeri</div>
          <div class="rme-vital-value">{{ header.nyeri ?? '-' }}</div>
          <div class="rme-vital-unit">/10</div>
        </div>
        <div class="rme-vital-card">
          <div class="rme-vital-label">Kesadaran</div>
          <div class="rme-vital-value" style="font-size: 10px; line-height: 1.3">
            {{ header.kesadaran ?? '-' }}
          </div>
          <div class="rme-vital-unit">&nbsp;</div>
        </div>
      </div>
      <div v-if="header.lokasinyeri" class="triase-field-note">
        <strong>Lokasi Nyeri:</strong> {{ header.lokasinyeri }}
      </div>

      <!-- ── Tabel Pemeriksaan Triase ───────────────────────────────────────── -->
      <div v-if="triaseFact && triaseFact.length > 0">
        <div class="rme-subsection-title">Hasil Pemeriksaan Triase</div>
        <table class="rme-tbl-data triase-tbl">
          <thead>
            <tr>
              <th style="width: 18%">PEMERIKSAAN</th>
              <th class="tc-head tc-head-emergensi" style="width: 20.5%">EMERGENSI</th>
              <th class="tc-head tc-head-urgent" style="width: 20.5%">URGENT</th>
              <th class="tc-head tc-head-nonurgent" style="width: 20.5%">NON URGENT</th>
              <th class="tc-head tc-head-death" style="width: 20.5%">DEATH ON ARRIVAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in triaseFact" :key="group.grouping">
              <td>
                <strong>{{ group.grouping }}</strong>
              </td>

              <!-- EMERGENSI col (sk_1/val_1) -->
              <td>
                <template v-for="(det, idx) in group.details" :key="'e' + idx">
                  <div
                    v-if="det.sk_1"
                    :class="[
                      'triase-item',
                      det.checked_val_1 ? 'triase-checked tc-txt-emergensi' : 'triase-unchecked',
                    ]"
                  >
                    <span v-if="det.checked_val_1" class="triase-check-icon">✓</span>
                    {{ det.sk_1 }}
                  </div>
                </template>
              </td>

              <!-- URGENT col (sk_2/val_2) -->
              <td>
                <template v-for="(det, idx) in group.details" :key="'u' + idx">
                  <div
                    v-if="det.sk_2"
                    :class="[
                      'triase-item',
                      det.checked_val_2 ? 'triase-checked tc-txt-urgent' : 'triase-unchecked',
                    ]"
                  >
                    <span v-if="det.checked_val_2" class="triase-check-icon">✓</span>
                    {{ det.sk_2 }}
                  </div>
                </template>
              </td>

              <!-- NON URGENT col (sk_4/val_4) -->
              <td>
                <template v-for="(det, idx) in group.details" :key="'n' + idx">
                  <div
                    v-if="det.sk_4"
                    :class="[
                      'triase-item',
                      det.checked_val_4 ? 'triase-checked tc-txt-nonurgent' : 'triase-unchecked',
                    ]"
                  >
                    <span v-if="det.checked_val_4" class="triase-check-icon">✓</span>
                    {{ det.sk_4 }}
                  </div>
                </template>
              </td>

              <!-- DEATH ON ARRIVAL col (sk_5/val_5) -->
              <td>
                <template v-for="(det, idx) in group.details" :key="'d' + idx">
                  <div
                    v-if="det.sk_5"
                    :class="[
                      'triase-item',
                      det.checked_val_5 ? 'triase-checked tc-txt-death' : 'triase-unchecked',
                    ]"
                  >
                    <span v-if="det.checked_val_5" class="triase-check-icon">✓</span>
                    {{ det.sk_5 }}
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Secondary Survey ──────────────────────────────────────────────── -->
      <div v-if="secondarySurvey && secondarySurvey.length > 0">
        <div class="rme-subsection-title">Secondary Survey</div>
        <table class="rme-tbl-data">
          <thead>
            <tr>
              <th style="width: 30%">OBJEK</th>
              <th>KONDISI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in secondarySurvey" :key="item.id">
              <td>
                <strong>{{ item.organ }}</strong>
              </td>
              <td>
                <span v-if="item.kondisi === 'NORMAL'" class="rme-badge rme-badge-success">
                  NORMAL
                </span>
                <span v-else>{{ item.kondisi || 'NORMAL' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Catatan Penting ────────────────────────────────────────────────── -->
      <div v-if="header.catatanpenting || header.CATATANPENTING">
        <div class="rme-subsection-title">Catatan Penting</div>
        <div class="rme-textarea-box">
          {{ header.catatanpenting || header.CATATANPENTING }}
        </div>
      </div>

      <!-- ── Rencana Tindak Lanjut ─────────────────────────────────────────── -->
      <div v-if="rtl">
        <div class="rme-subsection-title">Rencana Tindak Lanjut</div>
        <div class="triase-rtl-row">
          <span :class="['rme-badge', getRtlBadge(rtl.STATUS)]">{{ rtlLabel }}</span>
          <span v-if="rtl.KETERANGAN" style="margin-left: 8px; font-size: 12px">
            {{ rtl.KETERANGAN }}
          </span>
        </div>
      </div>

      <!-- ═══════════════════════ SOAP / CPPT IGD ═══════════════════════════════ -->
      <div class="rme-subsection-title igd-soap-section-title">
        <i class="pi pi-file-edit" style="color: #00897b; margin-right: 4px"></i>
        Catatan SOAP / CPPT IGD
      </div>

      <div v-if="loadingSOAP" class="rme-loading-row" style="margin: 6px 0">
        <span class="rme-loading-dot"></span> Memuat catatan SOAP...
      </div>
      <div v-else-if="!fact || fact.length === 0" class="rme-empty-note">
        <i class="pi pi-minus-circle"></i> Belum ada catatan SOAP untuk kunjungan ini.
      </div>
      <div v-else class="igd-soap-list">
        <div
          v-for="item in fact"
          :key="item.id"
          class="igd-soap-card"
          :class="{ 'igd-soap-auth': item.hasbeen_auth == 1 }"
        >
          <!-- header -->
          <div class="igd-soap-hdr">
            <div class="igd-soap-hdr-left">
              <span class="igd-soap-counter">#{{ item.counter }}</span>
              <span
                :class="[
                  'rme-badge',
                  item.jenis_dok === 'SBAR' ? 'rme-badge-warning' : 'igd-badge-teal',
                ]"
              >
                {{ item.jenis_dok || 'SOAP' }}
              </span>
              <span class="igd-soap-time">{{ item.waktu_display || '-' }}</span>
            </div>
            <div class="igd-soap-hdr-right">
              <span class="igd-soap-ppa">
                <strong>{{ item.profesi || '' }}</strong>
                <span v-if="item.verif_user_display"> — {{ item.verif_user_display }}</span>
              </span>
              <span v-if="item.hasbeen_auth == 1" class="rme-badge rme-badge-success">
                {{ '✓' }} Terotorisasi
              </span>
            </div>
          </div>

          <!-- TTV -->
          <div v-if="hasTTV(item)" class="igd-soap-ttv">
            <span v-if="Number(item.suhu) > 0">🌡 {{ item.suhu }}°C</span>
            <span v-if="Number(item.sistole) > 0"
              >🩺 {{ item.sistole }}/{{ item.diastole }} mmHg</span
            >
            <span v-if="Number(item.nadi) > 0">❤️ {{ item.nadi }}x/mnt</span>
            <span v-if="Number(item.spo2) > 0">🫁 SpO₂ {{ item.spo2 }}%</span>
            <span v-if="Number(item.pernafasan) > 0 || Number(item.respirasi) > 0">
              🌬 {{ item.pernafasan || item.respirasi }}x/mnt
            </span>
            <span v-if="Number(item.gcs) > 0">🧠 GCS {{ item.gcs }}</span>
          </div>

          <!-- SOAP grid -->
          <div class="igd-soap-grid">
            <div v-if="item.subject" class="igd-soap-field igd-soap-s">
              <div class="igd-soap-lbl">{{ item.caption1 || 'S' }}</div>
              <div class="igd-soap-val" v-html="formatText(item.subject)"></div>
            </div>
            <div v-if="item.object_display || item.object" class="igd-soap-field igd-soap-o">
              <div class="igd-soap-lbl">{{ item.caption2 || 'O' }}</div>
              <div
                class="igd-soap-val igd-soap-obj-html"
                v-html="item.object_display || formatText(item.object)"
              ></div>
            </div>
            <div v-if="item.asessment" class="igd-soap-field igd-soap-a">
              <div class="igd-soap-lbl">{{ item.caption3 || 'A' }}</div>
              <div class="igd-soap-val" v-html="formatText(item.asessment)"></div>
            </div>
            <div v-if="item.plan" class="igd-soap-field igd-soap-p">
              <div class="igd-soap-lbl">{{ item.caption4 || 'P' }}</div>
              <div class="igd-soap-val" v-html="formatText(item.plan)"></div>
            </div>
          </div>

          <!-- Catatan penting -->
          <div v-if="item.catatan_penting" class="igd-soap-catatan">
            <span class="igd-soap-catatan-lbl">📌 Catatan Penting:</span>
            {{ item.catatan_penting }}
          </div>

          <!-- SBAR -->
          <div v-if="item.jenis_dok === 'SBAR'" class="igd-soap-verif">
            <template v-if="item.verif == 1">
              <span class="rme-badge rme-badge-success">{{ '✓' }} Terverifikasi DPJP</span>
              <span v-if="item.profesi_verif" class="igd-soap-ppa-sm">
                {{ item.profesi_verif }} — {{ item.verif_by_name }}
              </span>
            </template>
            <span v-else class="rme-badge rme-badge-warning">⏳ Menunggu Verifikasi DPJP</span>
          </div>

          <!-- QR otorisasi -->
          <div v-if="item.hasbeen_auth == 1" class="igd-soap-qr">
            <QrcodeVue
              :value="qrValueSOAP(item)"
              :size="64"
              level="H"
              render-as="svg"
              class="igd-soap-qr-code"
            />
            <div class="igd-soap-qr-info">
              <div class="igd-soap-qr-title">✓ Dokumen Terotorisasi</div>
              <div v-if="item.time_auth" class="igd-soap-qr-time">{{ item.time_auth }}</div>
              <div v-if="item.verif_user_display" class="igd-soap-qr-by">
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
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
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
const header = ref({})
const triaseFact = ref([])
const nilaiTriase = ref(null)
const secondarySurvey = ref([])
const rtl = ref(null)

// SOAP / CPPT IGD — state terpisah agar tidak memblokir tampilan triase
const fact = ref([])
const loadingSOAP = ref(false)

// Data dianggap ada jika API mengembalikan code 200
const hasData = computed(() => header.value?.code === 200)

// Tentukan kategori triase tertinggi
const kesimpulanKey = computed(() => {
  if (!nilaiTriase.value) return ''
  if ((nilaiTriase.value.EMERGENSI || 0) > 0) return 'emergensi'
  if ((nilaiTriase.value.URGENT || 0) > 0) return 'urgent'
  if ((nilaiTriase.value.NON_URGENT || 0) > 0) return 'nonurgent'
  if ((nilaiTriase.value.DEATH_ON_ARRIVAL || 0) > 0) return 'death'
  return ''
})

const kesimpulanTriase = computed(() => {
  const k = kesimpulanKey.value
  if (k === 'emergensi') return 'EMERGENSI'
  if (k === 'urgent') return 'URGENT'
  if (k === 'nonurgent') return 'NON URGENT'
  if (k === 'death') return 'DEATH ON ARRIVAL'
  return 'BELUM DITENTUKAN'
})

// Label rencana tindak lanjut berdasar kode STATUS
const rtlLabel = computed(() => {
  if (!rtl.value) return '-'
  const map = {
    1: 'Pulang',
    2: 'Observasi',
    3: 'Rawat Jalan',
    4: 'Rujuk Keluar',
    5: 'APS (Atas Permintaan Sendiri)',
    6: 'Meninggal',
    7: 'Rawat Inap',
  }
  return map[rtl.value.STATUS] || `Status ${rtl.value.STATUS}`
})

const getRtlBadge = (status) => {
  const map = {
    1: 'rme-badge-success',
    2: 'rme-badge-info',
    3: 'rme-badge-info',
    4: 'rme-badge-warning',
    5: 'rme-badge-warning',
    6: 'rme-badge-danger',
    7: 'rme-badge-dark',
  }
  return map[status] || 'rme-badge-default'
}

/**
 * Tentukan noregister yang dipakai untuk query triase IGD:
 *  - Rawat Jalan → NOPENDAFTARAN
 *  - Rawat Inap / IGD / lainnya → NOREFF_IGD (nomor reff dari IGD)
 * Fallback ke props.noreg (URL) bila field dataPasien belum tersedia.
 */
const getNoregTriase = () => {
  const jenis = props.dataPasien?.JENISRAWAT
  if (jenis === 'JALAN') return props.dataPasien.NOPENDAFTARAN || props.noreg
  if (jenis) return props.dataPasien.NOREFF_IGD || props.noreg
  return props.noreg // dataPasien belum ada — fallback
}

/** Escape plain-text field agar aman di v-html */
const formatText = (text) => {
  if (!text) return '-'
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

/** Cek apakah ada TTV yang terisi */
const hasTTV = (item) =>
  Number(item.suhu) > 0 ||
  Number(item.sistole) > 0 ||
  Number(item.nadi) > 0 ||
  Number(item.spo2) > 0 ||
  Number(item.pernafasan) > 0 ||
  Number(item.respirasi) > 0 ||
  Number(item.gcs) > 0

/** Nilai QR untuk SOAP yang sudah otorisasi */
const qrValueSOAP = (item) =>
  ['SOAP-IGD', item.id, props.noreg, item.time_auth, item.profesi, item.verif_user_display]
    .map((v) => v ?? '')
    .join('|')

const fetchDatasOAP_igd = async () => {
  loadingSOAP.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/Triaseigd/get_soap`,
      { mode: 4, noregister: getNoregTriase(), id_client: id_client.value },
      { headers: { 'Content-Type': 'application/json' } },
    )
    fact.value = (response.data?.response || []).filter((x) => x.deleted !== '1')
  } catch (e) {
    console.error('Gagal memuat SOAP IGD:', e)
  } finally {
    loadingSOAP.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const payload = {
      noregister: getNoregTriase(),
      id_client: id_client.value,
      norm: props.dataPasien?.NOMR || '',
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/Triaseigd/getitem_triase`, payload)

    const data = response.data
    header.value = data.header || {}
    triaseFact.value = data.response || []
    nilaiTriase.value = data.nilatriase || null

    if (data.survey && data.survey.length > 0) {
      secondarySurvey.value = data.survey
    }

    // Rencana tindak lanjut ada di dalam header
    if (data.header?.STATUS !== undefined && data.header?.STATUS !== null) {
      rtl.value = {
        STATUS: data.header.STATUS,
        KETERANGAN: data.header.KETERANGAN || '',
      }
    }
  } catch (e) {
    error.value = 'Gagal memuat data triase: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
  }
}

/**
 * Tunggu hingga dataPasien.JENISRAWAT tersedia (async di parent),
 * lalu fetch. `immediate: true` menangani kasus dataPasien sudah ada
 * saat komponen mount; watch menangani kasus dataPasien belum ada.
 */
watch(
  () => props.dataPasien?.JENISRAWAT,
  (jenisrawat) => {
    if (jenisrawat) {
      fetchData()
      fetchDatasOAP_igd()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* ── Ringkasan skor triase ─────────────────────────────────────────── */
.triase-score-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.triase-score-box {
  text-align: center;
  border-radius: 6px;
  padding: 8px 14px;
  min-width: 72px;
  color: #fff;
}
.ts-count {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}
.ts-lbl {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin-top: 3px;
  white-space: nowrap;
}
.ts-emergensi {
  background: #c62828;
}
.ts-urgent {
  background: #f9a825;
  color: #333;
}
.ts-nonurgent {
  background: #2e7d32;
}
.ts-death {
  background: #212121;
}

.triase-score-kesimpulan {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  background: #f5f5f5;
  color: #444;
  min-width: 120px;
  border: 1.5px solid #e0e0e0;
}
.ts-kes-emergensi {
  background: #ffebee;
  color: #c62828;
  border-color: #ef9a9a;
}
.ts-kes-urgent {
  background: #fffde7;
  color: #e65100;
  border-color: #ffe082;
}
.ts-kes-nonurgent {
  background: #e8f5e9;
  color: #1b5e20;
  border-color: #a5d6a7;
}
.ts-kes-death {
  background: #212121;
  color: #fff;
  border-color: #000;
}

/* ── Tabel triase ─────────────────────────────────────────────────── */
.triase-tbl thead th {
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  padding: 5px 4px;
}
.tc-head {
  color: #fff;
}
.tc-head-emergensi {
  background: #c62828 !important;
}
.tc-head-urgent {
  background: #f9a825 !important;
  color: #333 !important;
}
.tc-head-nonurgent {
  background: #2e7d32 !important;
}
.tc-head-death {
  background: #212121 !important;
}

.triase-item {
  font-size: 10px;
  padding: 1px 0;
  line-height: 1.4;
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.triase-checked {
  font-weight: 700;
}
.triase-unchecked {
  color: #bbb;
  font-size: 9.5px;
}
.triase-check-icon {
  font-size: 11px;
  flex-shrink: 0;
}
.tc-txt-emergensi {
  color: #b71c1c;
}
.tc-txt-urgent {
  color: #bf360c;
}
.tc-txt-nonurgent {
  color: #1b5e20;
}
.tc-txt-death {
  color: #212121;
}

/* ── Helper classes ───────────────────────────────────────────────── */
.triase-field-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  margin-bottom: 3px;
}
.triase-field-note {
  font-size: 11px;
  padding: 4px 8px;
  color: #555;
  margin-top: 4px;
}
.triase-rtl-row {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  font-size: 12px;
  gap: 6px;
}

/* ══════════════════════════════════════════════
   IGD SOAP — desain teal, berbeda dari CPPT
   ══════════════════════════════════════════════ */
.igd-soap-section-title {
  margin-top: 14px;
}
.igd-soap-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

/* Card: left-border teal */
.igd-soap-card {
  border: 1px solid #b2dfdb;
  border-left: 4px solid #00897b;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}
.igd-soap-auth {
  border-left-color: #2e7d32;
  background: #fafffe;
}

/* Header ringan — tidak ada gradient gelap seperti CPPT */
.igd-soap-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  padding: 5px 10px;
  background: #e0f2f1;
  border-bottom: 1px solid #b2dfdb;
}
.igd-soap-hdr-left,
.igd-soap-hdr-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.igd-soap-counter {
  font-size: 10px;
  font-weight: 700;
  color: #00695c;
  background: rgba(0, 105, 92, 0.12);
  border-radius: 10px;
  padding: 1px 7px;
  flex-shrink: 0;
}
.igd-badge-teal {
  background: #00897b !important;
  color: #fff !important;
  border-color: #00897b !important;
}
.igd-soap-time {
  font-size: 10px;
  color: #555;
}
.igd-soap-ppa {
  font-size: 10px;
  color: #444;
}
.igd-soap-ppa-sm {
  font-size: 10px;
  color: #555;
  margin-left: 6px;
}

/* TTV — pill teal */
.igd-soap-ttv {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px 10px;
  background: #f0faf9;
  border-bottom: 1px dashed #b2dfdb;
  font-size: 10px;
}
.igd-soap-ttv span {
  background: #e0f2f1;
  color: #004d40;
  border-radius: 12px;
  padding: 1px 8px;
  white-space: nowrap;
}

/* SOAP grid — 2 kolom x 2 baris */
.igd-soap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 1px;
  background: #b2dfdb;
  padding: 1px;
}
.igd-soap-field {
  background: #fff;
  padding: 5px 8px;
  min-height: 32px;
}
.igd-soap-s {
  grid-column: 1;
  grid-row: 1;
}
.igd-soap-o {
  grid-column: 2;
  grid-row: 1;
}
.igd-soap-a {
  grid-column: 1;
  grid-row: 2;
}
.igd-soap-p {
  grid-column: 2;
  grid-row: 2;
}

.igd-soap-lbl {
  font-size: 9px;
  font-weight: 700;
  color: #00897b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
  border-bottom: 1px solid #e0f2f1;
  padding-bottom: 2px;
}
.igd-soap-val {
  font-size: 11px;
  color: #333;
  line-height: 1.5;
}
.igd-soap-obj-html :deep(*) {
  font-size: 11px !important;
  font-family: 'Segoe UI', Arial, sans-serif !important;
  line-height: 1.5 !important;
  color: #333 !important;
}

/* Catatan penting */
.igd-soap-catatan {
  margin: 6px 10px 0;
  padding: 4px 8px;
  background: #fff8e1;
  border-left: 3px solid #f9a825;
  border-radius: 2px;
  font-size: 11px;
  color: #5d4037;
}
.igd-soap-catatan-lbl {
  font-weight: 700;
  margin-right: 4px;
}

/* SBAR & QR */
.igd-soap-verif {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-top: 1px dashed #b2dfdb;
  font-size: 11px;
}
.igd-soap-qr {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 10px 8px;
  padding: 5px 8px;
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 4px;
}
.igd-soap-qr-code {
  flex-shrink: 0;
  background: #fff;
  padding: 3px;
  border-radius: 3px;
}
.igd-soap-qr-info {
  flex: 1;
}
.igd-soap-qr-title {
  font-size: 10px;
  font-weight: 700;
  color: #2e7d32;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.igd-soap-qr-time,
.igd-soap-qr-by {
  font-size: 10px;
  color: #555;
  margin-top: 1px;
}
.igd-soap-qr-by {
  font-style: italic;
}

@media print {
  .igd-soap-qr {
    border-color: #888;
    background: #f8fdf8;
  }
}
</style>
