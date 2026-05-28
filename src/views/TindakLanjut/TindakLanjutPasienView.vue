<template>
  <Toast />
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Panel>
    <template #header>
      <div class="tl-header">
        <div class="tl-header-left">
          <i class="pi pi-send" style="font-size: 1.1rem; color: var(--p-primary-500)"></i>
          <span class="tl-header-title">Data Pemindahan / Rujukan Pasien</span>
          <Tag v-if="dataList.length > 0" :value="`${dataList.length} pasien`" severity="info" />
        </div>
        <div class="tl-header-right">
          <!-- Filter Status -->
          <div class="filter-status-group">
            <button
              class="filter-btn"
              :class="{ active: filterStatus === null }"
              @click="setFilter(null)"
            >
              Semua
            </button>
            <button
              class="filter-btn filter-btn-pending"
              :class="{ active: filterStatus === 0 }"
              @click="setFilter(0)"
            >
              <i class="pi pi-hourglass"></i> Belum Diproses
            </button>
            <button
              class="filter-btn filter-btn-done"
              :class="{ active: filterStatus === 1 }"
              @click="setFilter(1)"
            >
              <i class="pi pi-check-circle"></i> Sudah Diproses
            </button>
          </div>

          <DatePicker
            v-model="tanggal"
            dateFormat="dd/mm/yy"
            showIcon
            iconDisplay="input"
            placeholder="Pilih tanggal"
            @date-select="fetchData"
          />
          <Button
            icon="pi pi-refresh"
            size="small"
            severity="secondary"
            outlined
            :loading="loading"
            @click="fetchData"
          />
        </div>
      </div>
    </template>

    <!-- ── Summary Cards ── -->
    <div class="summary-cards">
      <div class="summary-card summary-card-total" @click="setFilter(null)">
        <div class="summary-icon"><i class="pi pi-users"></i></div>
        <div class="summary-body">
          <div class="summary-val">{{ dataList.length }}</div>
          <div class="summary-lbl">Total Pasien</div>
        </div>
      </div>
      <div class="summary-card summary-card-pending" @click="setFilter(0)">
        <div class="summary-icon"><i class="pi pi-hourglass"></i></div>
        <div class="summary-body">
          <div class="summary-val">{{ jumlahBelumProses }}</div>
          <div class="summary-lbl">Belum Diproses</div>
        </div>
      </div>
      <div class="summary-card summary-card-done" @click="setFilter(1)">
        <div class="summary-icon"><i class="pi pi-check-circle"></i></div>
        <div class="summary-body">
          <div class="summary-val">{{ jumlahSudahProses }}</div>
          <div class="summary-lbl">Sudah Diproses</div>
        </div>
      </div>
      <div class="summary-card summary-card-durasi">
        <div class="summary-icon"><i class="pi pi-clock"></i></div>
        <div class="summary-body">
          <div class="summary-val">{{ rataRataDurasi }}</div>
          <div class="summary-lbl">Rata-rata Durasi</div>
        </div>
      </div>
    </div>

    <DataTable
      :value="dataList"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      stripedRows
      dataKey="id"
      v-model:expandedRows="expandedRows"
      responsiveLayout="scroll"
      class="tl-table"
      :globalFilterFields="['pasien.nama_pasien', 'pasien.nomr', 'noregister']"
      v-model:filters="filters"
    >
      <template #header>
        <div class="tl-table-header">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Cari nama / No.RM / No.Pendaftaran..."
              size="small"
              style="width: 280px"
            />
          </IconField>
        </div>
      </template>

      <template #empty>
        <div class="tl-empty">
          <i class="pi pi-inbox"></i>
          <p>Tidak ada data pemindahan pasien</p>
        </div>
      </template>

      <Column expander style="width: 3rem" />

      <!-- Waktu -->
      <Column header="Waktu Kirim" style="min-width: 130px">
        <template #body="{ data }">
          <div class="cell-time">
            <span class="cell-time-val">{{ formatDateTime(data.waktu_kirim) }}</span>
            <span class="cell-durasi">
              <i class="pi pi-clock"></i>
              {{ formatDurasi(data.durasi) }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Pasien -->
      <Column header="Pasien" style="min-width: 180px">
        <template #body="{ data }">
          <div class="cell-pasien">
            <div class="cell-pasien-name">{{ data.pasien?.nama_pasien }}</div>
            <div class="cell-pasien-meta">
              <span>No.RM: {{ data.pasien?.nomr }}</span>
              <span class="cell-sep">·</span>
              <span
                >{{ data.pasien?.jenis_kelamin === 'P' ? 'Pr' : 'Lk' }},
                {{ hitungUsia(data.pasien?.tgl_lahir) }} th</span
              >
            </div>
            <div class="cell-pasien-meta">{{ data.noregister }}</div>
          </div>
        </template>
      </Column>

      <!-- Asal → Tujuan -->
      <Column header="Asal → Tujuan" style="min-width: 160px">
        <template #body="{ data }">
          <div class="cell-route">
            <span class="badge badge-gray">{{
              data.asal_ruangan_display || `Ruang ${data.asal_ruangan}`
            }}</span>
            <i class="pi pi-arrow-right" style="font-size: 10px; color: #6c757d"></i>
            <span class="badge badge-blue">{{
              data.tujuan_display || `Tujuan ${data.tujuan}`
            }}</span>
          </div>
        </template>
      </Column>

      <!-- Metode -->
      <Column header="Metode" style="min-width: 120px">
        <template #body="{ data }">
          <div class="cell-metode">
            <i :class="metodeIcon(data.metode_pemindahan_pasien)" style="font-size: 12px"></i>
            <span>{{ data.metode_pemindahan_pasien }}</span>
          </div>
        </template>
      </Column>

      <!-- Diagnosa -->
      <Column header="Diagnosa" style="min-width: 140px">
        <template #body="{ data }">
          <div class="cell-dx">{{ data.dx_utama?.toUpperCase() }}</div>
        </template>
      </Column>

      <!-- Masuk IGD -->
      <Column header="Masuk IGD" style="min-width: 110px">
        <template #body="{ data }">
          <span class="cell-time-val">{{ formatDateTime(data.pasien?.masukpoly) }}</span>
        </template>
      </Column>

      <!-- Status -->
      <Column header="Status" style="min-width: 120px">
        <template #body="{ data }">
          <span v-if="data.has_confirm === 1" class="badge-status badge-status-done">
            <i class="pi pi-check-circle"></i>
            Sudah Diproses
          </span>
          <span v-else class="badge-status badge-status-pending">
            <i class="pi pi-hourglass"></i>
            Belum Diproses
          </span>
        </template>
      </Column>

      <!-- Tindak Lanjut -->
      <Column header="Aksi" style="min-width: 130px; text-align: center">
        <template #body="{ data }">
          <Button
            icon="pi pi-arrow-right-arrow-left"
            label="Tindak Lanjut"
            size="small"
            class="btn-tindaklanjut"
            :severity="data.has_confirm === 1 ? 'secondary' : 'success'"
            :outlined="data.has_confirm === 1"
            @click="funtionSendToPoli(data)"
          />
        </template>
      </Column>

      <!-- Expand detail -->
      <template #expansion="{ data }">
        <div class="tl-detail">
          <div class="tl-detail-grid">
            <!-- Info Pasien -->
            <div class="tl-detail-card">
              <div class="tl-detail-card-title"><i class="pi pi-user"></i> Info Pasien</div>
              <table class="tl-info-table">
                <tbody>
                  <tr>
                    <td>Nama</td>
                    <td>{{ data.pasien?.nama_pasien }}</td>
                  </tr>
                  <tr>
                    <td>No. RM</td>
                    <td>{{ data.pasien?.nomr }}</td>
                  </tr>
                  <tr>
                    <td>No. Pendaftaran</td>
                    <td>{{ data.pasien?.nopendaftaran }}</td>
                  </tr>
                  <tr>
                    <td>Tgl. Lahir</td>
                    <td>
                      {{ data.pasien?.tgl_lahir }} ({{ hitungUsia(data.pasien?.tgl_lahir) }} tahun)
                    </td>
                  </tr>
                  <tr>
                    <td>Tempat Lahir</td>
                    <td>{{ data.pasien?.tempat_lahir || '—' }}</td>
                  </tr>
                  <tr>
                    <td>Jenis Kelamin</td>
                    <td>{{ data.pasien?.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki' }}</td>
                  </tr>
                  <tr>
                    <td>Masuk IGD</td>
                    <td>{{ formatDateTime(data.pasien?.masukpoly) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Info Pemindahan -->
            <div class="tl-detail-card">
              <div class="tl-detail-card-title"><i class="pi pi-send"></i> Info Pemindahan</div>
              <table class="tl-info-table">
                <tbody>
                  <tr>
                    <td>Asal Ruangan</td>
                    <td>{{ data.asal_ruangan_display || data.asal_ruangan }}</td>
                  </tr>
                  <tr>
                    <td>Tujuan</td>
                    <td>{{ data.tujuan_display || data.tujuan }}</td>
                  </tr>
                  <tr>
                    <td>Metode</td>
                    <td>{{ data.metode_pemindahan_pasien }}</td>
                  </tr>
                  <tr>
                    <td>Status Fungsional</td>
                    <td>{{ data.status_fungsional_pasien }}</td>
                  </tr>
                  <tr>
                    <td>Jenis Kasus</td>
                    <td>{{ data.jenis_kasus }}</td>
                  </tr>
                  <tr>
                    <td>Dx Utama</td>
                    <td>{{ data.dx_utama?.toUpperCase() }}</td>
                  </tr>
                  <tr>
                    <td>Dx Sekunder</td>
                    <td>{{ data.dx_sekunder || '—' }}</td>
                  </tr>
                  <tr>
                    <td>Waktu Kirim</td>
                    <td>{{ data.waktu_kirim }}</td>
                  </tr>
                  <tr>
                    <td>Waktu Diterima</td>
                    <td>{{ data.waktu_diterima || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Alat & Catatan -->
            <div class="tl-detail-card">
              <div class="tl-detail-card-title">
                <i class="pi pi-list"></i> Alat Medis & Catatan
              </div>

              <div class="tl-detail-section-lbl">Alat Medis Terpasang</div>
              <div class="tl-tags">
                <span v-if="data.alat_medis_yg_terpasang_display?.length === 0" class="tl-no-data"
                  >Tidak ada</span
                >
                <Tag
                  v-for="alat in data.alat_medis_yg_terpasang_display"
                  :key="alat"
                  :value="alat"
                  severity="info"
                  style="font-size: 11px"
                />
              </div>

              <div class="tl-detail-section-lbl mt-2">Gangguan</div>
              <div class="tl-tags">
                <span v-if="data.gangguan_display?.length === 0" class="tl-no-data">Tidak ada</span>
                <Tag
                  v-for="g in data.gangguan_display"
                  :key="g"
                  :value="g"
                  severity="warn"
                  style="font-size: 11px"
                />
              </div>

              <div class="tl-detail-section-lbl mt-2">Catatan</div>
              <div class="tl-catatan">{{ data.catatan || '—' }}</div>

              <div class="tl-detail-section-lbl mt-2">Perawat</div>
              <table class="tl-info-table">
                <tbody>
                  <tr>
                    <td>Pendamping</td>
                    <td>{{ data.perawat_pendamping_display || '—' }}</td>
                  </tr>
                  <tr>
                    <td>Penerima</td>
                    <td>{{ data.perawat_penerima_display || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </DataTable>
  </Panel>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import DatePicker from 'primevue/datepicker'
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const dataList = ref([])
const tanggal = ref(new Date())
const expandedRows = ref([])
const filterStatus = ref(null)

const jumlahBelumProses = computed(() => dataList.value.filter((d) => d.has_confirm !== 1).length)
const jumlahSudahProses = computed(() => dataList.value.filter((d) => d.has_confirm === 1).length)
const rataRataDurasi = computed(() => {
  const valid = dataList.value.filter((d) => d.durasi)
  if (!valid.length) return '—'
  const totalMenit = valid.reduce((s, d) => s + (d.durasi.jam * 60 + d.durasi.menit), 0)
  const avg = Math.round(totalMenit / valid.length)
  const j = Math.floor(avg / 60)
  const m = avg % 60
  return j > 0 ? `${j}j ${m}m` : `${m}m`
})

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// ── API ──────────────────────────────────────────────────
function formatTanggalAPI(date) {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function fetchData() {
  loading.value = true
  try {
    dataList.value = []
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Triaseigd/getdata_pemindahan_pasien`,
      {
        noregister: route.query.noreg ?? '',
        id_client: id_client.value,
        tanggal: formatTanggalAPI(tanggal.value),
        mode: 3,
      },
    )

    if (res.data?.metadata?.code === 200) {
      dataList.value = res.data.response ?? []
    } else {
      dataList.value = []
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data?.metadata?.message,
        life: 4000,
      })
    }
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Tidak dapat memuat data pemindahan',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

const funtionSendToPoli = async (status) => {
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',
    query: {
      noreg: status.noregister,
      noka: status.pasien.no_bpjs,
      nomr: status.pasien.nomr,
    },
  })
  window.open(routeData.href, '_blank')
}

// ── Helpers ──────────────────────────────────────────────
function formatDateTime(val) {
  if (!val) return '—'
  const d = new Date(val)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDurasi(dur) {
  if (!dur) return '—'
  const parts = []
  if (dur.hari > 0) parts.push(`${dur.hari}h`)
  if (dur.jam > 0) parts.push(`${dur.jam}j`)
  if (dur.menit > 0) parts.push(`${dur.menit}m`)
  return parts.join(' ') || '< 1m'
}

function hitungUsia(tglLahir) {
  if (!tglLahir) return '—'
  const lahir = new Date(tglLahir)
  const sekarang = new Date()
  let usia = sekarang.getFullYear() - lahir.getFullYear()
  const bulan = sekarang.getMonth() - lahir.getMonth()
  if (bulan < 0 || (bulan === 0 && sekarang.getDate() < lahir.getDate())) usia--
  return usia
}

function metodeIcon(metode) {
  if (!metode) return 'pi pi-question-circle'
  const m = metode.toLowerCase()
  if (m.includes('kursi')) return 'pi pi-directions'
  if (m.includes('jalan')) return 'pi pi-user'
  if (m.includes('brankar') || m.includes('tempat tidur')) return 'pi pi-th-large'
  return 'pi pi-arrow-right-arrow-left'
}

function setFilter(val) {
  filterStatus.value = val
  fetchData()
}

function onTindakLanjut(data) {
  toast.add({
    severity: 'info',
    summary: 'Tindak Lanjut',
    detail: `Pasien: ${data.pasien?.NAMAPASIEN} — ${data.tujuan_display || data.tujuan}`,
    life: 4000,
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* ── Summary Cards ── */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: box-shadow 0.15s;
  user-select: none;
}
.summary-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-card-total {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.summary-card-pending {
  background: #fefce8;
  border-color: #fde68a;
}
.summary-card-done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.summary-card-durasi {
  background: #f5f3ff;
  border-color: #ddd6fe;
  cursor: default;
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.summary-card-total .summary-icon {
  background: #dbeafe;
  color: #1d4ed8;
}
.summary-card-pending .summary-icon {
  background: #fef9c3;
  color: #b45309;
}
.summary-card-done .summary-icon {
  background: #dcfce7;
  color: #15803d;
}
.summary-card-durasi .summary-icon {
  background: #ede9fe;
  color: #6d28d9;
}

.summary-val {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}
.summary-card-total .summary-val {
  color: #1d4ed8;
}
.summary-card-pending .summary-val {
  color: #b45309;
}
.summary-card-done .summary-val {
  color: #15803d;
}
.summary-card-durasi .summary-val {
  color: #6d28d9;
}

.summary-lbl {
  font-size: 11px;
  color: #6c757d;
  margin-top: 3px;
  font-weight: 500;
}

/* Header */
.tl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.tl-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tl-header-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.tl-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Filter status group */
.filter-status-group {
  display: flex;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}
.filter-btn {
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  background: #fff;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
  border-right: 1px solid #dee2e6;
}
.filter-btn:last-child {
  border-right: none;
}
.filter-btn:hover {
  background: #f8f9fa;
}
.filter-btn.active {
  background: #e9ecef;
  color: #343a40;
  font-weight: 600;
}
.filter-btn-pending.active {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}
.filter-btn-pending.active .pi {
  color: #d97706;
}
.filter-btn-done.active {
  background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
}
.filter-btn-done.active .pi {
  color: #16a34a;
}

/* Table header */
.tl-table-header {
  display: flex;
  justify-content: flex-end;
  padding: 4px 0;
}

/* Empty */
.tl-empty {
  text-align: center;
  padding: 40px;
  color: #adb5bd;
}
.tl-empty i {
  font-size: 2rem;
  display: block;
  margin-bottom: 8px;
}

/* Cells */
.cell-time {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cell-time-val {
  font-size: 12px;
  font-weight: 500;
}
.cell-durasi {
  font-size: 11px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 3px;
}

.cell-pasien-name {
  font-weight: 600;
  font-size: 13px;
}
.cell-pasien-meta {
  font-size: 11px;
  color: #6c757d;
  display: flex;
  gap: 4px;
  align-items: center;
}
.cell-sep {
  opacity: 0.4;
}

.cell-route {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cell-metode {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.cell-dx {
  font-weight: 600;
  font-size: 12px;
}
.cell-dx-caption {
  font-size: 11px;
  color: #6c757d;
}

/* Expansion detail */
.tl-detail {
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
}
.tl-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.tl-detail-card {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 14px;
}
.tl-detail-card-title {
  font-weight: 600;
  font-size: 12px;
  color: var(--p-primary-600, #3b82f6);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.tl-info-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
}
.tl-info-table td {
  padding: 3px 4px;
  vertical-align: top;
}
.tl-info-table td:first-child {
  color: #6c757d;
  width: 42%;
  white-space: nowrap;
}
.tl-info-table td:last-child {
  font-weight: 500;
}

.tl-detail-section-lbl {
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 5px;
}
.tl-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 24px;
}
.tl-no-data {
  font-size: 11px;
  color: #adb5bd;
  font-style: italic;
}
.tl-catatan {
  font-size: 12px;
  color: #495057;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 6px 8px;
  min-height: 36px;
}

/* ── Pastel badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.badge-gray {
  background: #f0f0f0;
  color: #555;
}
.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-green {
  background: #dcfce7;
  color: #166534;
}
.badge-amber {
  background: #fef9c3;
  color: #92400e;
}
.badge-orange {
  background: #ffedd5;
  color: #9a3412;
}

/* ── Status badge has_confirm ── */
.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
}
.badge-status-done {
  background: #dcfce7;
  color: #15803d;
  border-color: #bbf7d0;
}
.badge-status-done .pi {
  color: #16a34a;
  font-size: 12px;
}
.badge-status-pending {
  background: #fef3c7;
  color: #b45309;
  border-color: #fde68a;
}
.badge-status-pending .pi {
  color: #d97706;
  font-size: 12px;
}

/* Tindak Lanjut button */
.btn-tindaklanjut {
  font-size: 12px;
}

.mt-2 {
  margin-top: 10px;
}
</style>
