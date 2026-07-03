<template>
  <div class="rme-section rme-lab-root">
    <!-- Loading -->
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data laboratorium...
    </div>

    <div v-else-if="error" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> {{ error }}
    </div>

    <div v-else-if="permintaan.length === 0" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data pemeriksaan laboratorium.
    </div>

    <!-- Satu dokumen per permintaan -->
    <div v-else>
      <div
        v-for="(perm, idx) in permintaan"
        :key="perm.TRANS"
        class="lab-doc"
        :class="{ 'lab-doc-break': idx < permintaan.length - 1 }"
      >
        <!-- ── Header RS ──────────────────────────────────────────────────── -->
        <div class="lab-doc-header">
          <img v-if="LINK_LOGO" :src="LINK_LOGO" alt="Logo RS" class="lab-doc-logo" />
          <div class="lab-doc-rs-info">
            <div class="lab-doc-rs-name">{{ company || 'Rumah Sakit' }}</div>
            <div class="lab-doc-rs-addr">{{ ALAMAT || '' }}</div>
          </div>
        </div>

        <hr class="lab-doc-hr" />

        <!-- ── Judul ─────────────────────────────────────────────────────── -->
        <div class="lab-doc-title">Hasil Pemeriksaan Laboratorium</div>

        <hr class="lab-doc-hr" />

        <!-- ── Info Pasien 2 kolom ───────────────────────────────────────── -->
        <div class="lab-doc-info-grid">
          <div class="lab-doc-info-col">
            <div class="lab-info-row">
              <span class="lab-info-lbl">R.M</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{ perm._pasien?.NOMR || dataPasien?.NOMR || '-' }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Nama</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                perm._pasien?.NAMAPASIEN || dataPasien?.NAMAPASIEN || '-'
              }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">JK &amp; Usia</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{ fmtJkUsia(perm._pasien || dataPasien) }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Domisili</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                perm._pasien?.ALAMAT || dataPasien?.ALAMAT || '-'
              }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Dokter Pengirim</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                perm._pasien?.DPJP || perm._pasien?.NAMADOKTER || dataPasien?.DPJP || '-'
              }}</span>
            </div>
          </div>

          <div class="lab-doc-info-col">
            <div class="lab-info-row">
              <span class="lab-info-lbl">No Pemeriksaan</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{ perm.TRANS || noreg || '-' }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Jenis Rawat</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                perm._pasien?.JENISRAWAT || dataPasien?.JENISRAWAT || '-'
              }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Cara Bayar</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                perm._pasien?.CARABAYAR || perm._pasien?.CARA_BAYAR || dataPasien?.CARABAYAR || '-'
              }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Tgl Permintaan</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                fmtDateShort(perm._pasien?.TANGGAL || perm.TANGGAL)
              }}</span>
            </div>
            <div class="lab-info-row">
              <span class="lab-info-lbl">Poli/Ruangan</span>
              <span class="lab-info-sep">:</span>
              <span class="lab-info-val">{{
                perm._pasien?.POLI_RUANG ||
                perm._pasien?.POLI ||
                perm._pasien?.RUANG ||
                dataPasien?.POLI ||
                '-'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Loading detail per dokumen -->
        <div v-if="perm._loading" class="rme-loading-row" style="padding: 6px 0">
          <span class="rme-loading-dot"></span> Memuat hasil pemeriksaan...
        </div>

        <!-- ── Tabel Hasil ────────────────────────────────────────────────── -->
        <template v-else-if="perm._detail && perm._detail.length > 0">
          <table class="lab-doc-table">
            <thead>
              <tr>
                <th class="col-pem">PEMERIKSAAN</th>
                <th class="col-met">METODE</th>
                <th class="col-has">HASIL</th>
                <th class="col-nor">NORMAL</th>
                <th class="col-sat">SATUAN</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(group, groupName) in groupedDetail(perm._detail)" :key="groupName">
                <tr class="lab-doc-group-row">
                  <td colspan="5">{{ groupName }}</td>
                </tr>
                <tr
                  v-for="(item, iidx) in group"
                  :key="item.ID || item.KODE_PEMERIKSAAN || iidx"
                  :class="['lab-doc-data-row', iidx % 2 === 0 ? 'row-even' : 'row-odd']"
                >
                  <td class="td-pem">
                    {{ item.PEMERIKSAAN || item.NAMA_PEMERIKSAAN || item.CAPTION || '-' }}
                  </td>
                  <td>{{ item.METODE || '-' }}</td>
                  <td :class="{ 'td-abnormal': isAbnormal(item) }">
                    {{ item.HASIL ?? item.RESULT ?? '-' }}
                  </td>
                  <td class="td-normal">{{ item.NORMAL || item.NILAI_NORMAL || '-' }}</td>
                  <td>{{ item.SATUAN || item.UNIT || '-' }}</td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- ── Footer dokumen ────────────────────────────────────────────── -->
          <div class="lab-doc-footer">
            <div class="lab-doc-kesan-area">
              <div class="lab-doc-kesan-row">
                <span class="lab-kesan-lbl">Kesan :</span>
                <div class="lab-kesan-box">{{ perm._pasien?.KESAN || '' }}</div>
              </div>
              <div class="lab-doc-notes">
                <p>
                  1. Interpretasi hasil laboratorium hanya dapat diberikan oleh Dokter yang memiliki
                  data klinis pasien.
                </p>
                <p>2. Tanda warna merah menunjukkan nilai di atas atau dibawah nilai normal.</p>
                <p>3. Bila ada yang kurang jelas, hubungi laboratorium</p>
              </div>
            </div>

            <div class="lab-doc-sig-area">
              <div class="lab-doc-sig-title">Dokter Pemeriksa</div>
              <div class="lab-doc-sig-date">
                {{ fmtDateShort(perm._pasien?.TGL_VERIFIED || perm._pasien?.TANGGAL) }}
              </div>
              <div class="lab-doc-qr-wrap">
                <QrcodeVue
                  v-if="perm._pasien?.PETUGAS_OTENTIKASI || perm._pasien?.NAMA_PETUGAS"
                  :value="perm._pasien?.PETUGAS_OTENTIKASI || perm._pasien?.NAMA_PETUGAS || ''"
                  :size="40"
                  level="H"
                />
                <div v-else class="lab-doc-qr-placeholder"></div>
              </div>
              <div class="lab-doc-sig-name">
                {{ perm._pasien?.PETUGAS_OTENTIKASI || perm._pasien?.NAMA_PETUGAS || '-' }}
              </div>
              <div class="lab-doc-sig-sub">-</div>
            </div>
          </div>
        </template>

        <div v-else class="rme-empty-note" style="margin-top: 8px">
          <i class="pi pi-minus-circle"></i> Detail hasil belum tersedia.
        </div>

        <!-- ── Print footer ──────────────────────────────────────────────── -->
        <div class="lab-doc-print-footer">
          <span>Print date : {{ printDateTime }}</span>
          <!-- <span>Petugas : {{ user_name || '' }}</span> -->
          <span>Halaman : {{ perm.TRANS || idx + 1 }}/{{ idx + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
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
const { id_client, company, ALAMAT, LINK_LOGO, user_name } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(true)
const error = ref(null)
const permintaan = ref([])

const printDateTime = computed(() => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
})

const fmtDateShort = (d) => {
  if (!d) return '-'
  try {
    const dt = new Date(d)
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`
  } catch {
    return d
  }
}

const fmtJkUsia = (p) => {
  if (!p) return '-'
  const jk = p.JENISKELAMIN === 'P' ? 'P' : p.JENISKELAMIN === 'L' ? 'L' : p.JENISKELAMIN || ''
  const usia = p.USIA_LENGKAP || p.USIA || ''
  return [jk, usia].filter(Boolean).join(' / ') || '-'
}

const groupedDetail = (detail) => {
  if (!detail?.length) return {}
  return detail.reduce((acc, item) => {
    const key = item.NAMA || item.GROUPING || item.KATEGORI || item.GROUP_NAME || 'Umum'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

const isAbnormal = (item) =>
  item.HASIL_TIDAK_NORMAL === '1' ||
  item.HASIL_TIDAK_NORMAL === 1 ||
  item.IS_ABNORMAL === '1' ||
  item.IS_ABNORMAL === 1 ||
  item.FLAG_ABNORMAL === '1'

const fetchDetail = async (noTransaksi) => {
  const url = configStore.apiApotikUrl
  const res = await axios.get(
    `${url}/index.php/api/sales/get_item_lab_master_detail/${noTransaksi}/${id_client.value}`,
  )
  const data = res.data
  const pasien = data?.pasien || null
  let items = []
  if (Array.isArray(data?.response)) items = data.response
  else if (Array.isArray(data?.detail)) items = data.detail
  else if (Array.isArray(data?.data)) items = data.data
  else if (Array.isArray(data)) items = data
  return { pasien, items }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const payload = {
      id_client: id_client.value,
      kategori: 'LABORATORIUM',
      noregister: props.noreg,
      mode: 1,
    }
    const url = configStore.apiApotikUrl
    const response = await axios.post(
      `${url}/index.php/api/sales/get_list_labor_dan_radiologi_v3`,
      payload,
    )
    const list = response.data?.response || []
    permintaan.value = list.map((p) => ({ ...p, _detail: [], _loading: true }))
  } catch (e) {
    error.value = 'Gagal memuat daftar laboratorium: ' + (e.message || '')
    console.error(e)
  } finally {
    loading.value = false
    reportSectionData('lab', permintaan.value.length > 0)
  }

  if (permintaan.value.length > 0) {
    await Promise.all(
      permintaan.value.map(async (perm, idx) => {
        try {
          const { pasien, items } = await fetchDetail(perm.TRANS)
          permintaan.value[idx] = {
            ...permintaan.value[idx],
            _pasien: pasien,
            _detail: items,
            _loading: false,
          }
        } catch {
          permintaan.value[idx] = {
            ...permintaan.value[idx],
            _pasien: null,
            _detail: [],
            _loading: false,
          }
        }
      }),
    )
  }
}

onMounted(fetchData)
</script>

<style scoped>
.rme-lab-root {
  padding: 0;
}

/* ── Dokumen ────────────────────────────────────────────────────────────── */
.lab-doc {
  font-family: Arial, sans-serif;
  font-size: 11px;
  color: #1a1a1a;
  padding: 4px 0 0;
}

.lab-doc-break {
  page-break-after: always;
  border-bottom: 2px dashed #ccc;
  margin-bottom: 20px;
  padding-bottom: 20px;
}

/* ── Header RS ──────────────────────────────────────────────────────────── */
.lab-doc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 6px;
}

.lab-doc-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex-shrink: 0;
}

.lab-doc-rs-info {
  display: flex;
  flex-direction: column;
}

.lab-doc-rs-name {
  font-size: 14px;
  font-weight: 700;
  font-variant: small-caps;
  letter-spacing: 0.04em;
  color: #111;
}

.lab-doc-rs-addr {
  font-size: 10px;
  color: #444;
  margin-top: 1px;
}

/* ── Divider ────────────────────────────────────────────────────────────── */
.lab-doc-hr {
  border: none;
  border-top: 1.5px solid #333;
  margin: 5px 0;
}

/* ── Judul ──────────────────────────────────────────────────────────────── */
.lab-doc-title {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  font-variant: small-caps;
  letter-spacing: 0.06em;
  padding: 4px 0;
}

/* ── Info Pasien ────────────────────────────────────────────────────────── */
.lab-doc-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
  padding: 6px 0 4px;
}

.lab-doc-info-col {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.lab-info-row {
  display: flex;
  align-items: flex-start;
  font-size: 11px;
  line-height: 1.55;
}

.lab-info-lbl {
  min-width: 100px;
  flex-shrink: 0;
  color: #222;
}

.lab-info-sep {
  width: 14px;
  flex-shrink: 0;
  color: #222;
}

.lab-info-val {
  color: #111;
  flex: 1;
}

/* ── Tabel ──────────────────────────────────────────────────────────────── */
.lab-doc-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 4px;
  font-size: 11px;
}

.lab-doc-table thead tr {
  background: #fff;
  border-top: 2px solid #333;
  border-bottom: 2px solid #333;
}

.lab-doc-table thead th {
  padding: 4px 6px;
  font-weight: 700;
  font-size: 10.5px;
  text-align: left;
  white-space: nowrap;
}

.col-pem {
  width: 34%;
}
.col-met {
  width: 16%;
}
.col-has {
  width: 12%;
}
.col-nor {
  width: 24%;
}
.col-sat {
  width: 14%;
}

/* Group header */
.lab-doc-group-row td {
  padding: 3px 6px;
  font-weight: 700;
  font-size: 11px;
  background: #fff;
  color: #111;
  border-bottom: 1px solid #bbb;
}

/* Data rows */
.lab-doc-data-row td {
  padding: 3px 6px;
  border-bottom: none;
  vertical-align: top;
}

.row-even {
  background: #f0f0f0;
}

.row-odd {
  background: #fff;
}

.td-pem {
  padding-left: 10px !important;
}

.td-abnormal {
  color: #c62828;
  font-weight: 700;
}

.td-normal {
  color: #444;
  font-size: 10.5px;
}

/* ── Footer dokumen ─────────────────────────────────────────────────────── */
.lab-doc-footer {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 10px;
  border-top: 1px solid #bbb;
  padding-top: 8px;
}

.lab-doc-kesan-area {
  flex: 1;
}

.lab-doc-kesan-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.lab-kesan-lbl {
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  padding-top: 2px;
}

.lab-kesan-box {
  flex: 1;
  min-height: 50px;
  border: 1px solid #aaa;
  padding: 4px 6px;
  font-size: 10.5px;
  background: #fff;
}

.lab-doc-notes {
  font-size: 9.5px;
  color: #333;
  line-height: 1.5;
}

.lab-doc-notes p {
  margin: 0;
}

/* Signature / QR area */
.lab-doc-sig-area {
  min-width: 110px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10.5px;
}

.lab-doc-sig-title {
  font-size: 10.5px;
  font-weight: 600;
}

.lab-doc-sig-date {
  font-size: 10px;
  margin-bottom: 4px;
}

.lab-doc-qr-wrap {
  margin: 3px 0;
}

.lab-doc-qr-placeholder {
  width: 72px;
  height: 72px;
  border: 1px solid #bbb;
  background: #f5f5f5;
}

.lab-doc-sig-name {
  font-size: 10.5px;
  font-weight: 600;
  margin-top: 2px;
}

.lab-doc-sig-sub {
  font-size: 10px;
  color: #555;
}

/* ── Print footer ───────────────────────────────────────────────────────── */
.lab-doc-print-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #aaa;
  margin-top: 10px;
  padding-top: 4px;
  font-size: 9.5px;
  color: #444;
}
</style>
