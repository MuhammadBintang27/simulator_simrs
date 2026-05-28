<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Toast />

  <div class="content">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title"><i class="fas fa-walking me-2"></i>Unit Fisioterapi</h1>
          <p class="hero-description">
            Daftar permintaan pelayanan fisioterapi yang masuk dari seluruh unit. Pilih pasien dan
            klik <strong>Proses</strong> untuk mulai melayani.
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-value">{{ allRequests.length }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card stat-warn">
          <div class="stat-value">{{ countPending }}</div>
          <div class="stat-label">Menunggu</div>
        </div>
        <div class="stat-card stat-success">
          <div class="stat-value">{{ countDilayani }}</div>
          <div class="stat-label">Dilayani</div>
        </div>
        <div class="stat-card stat-urgent">
          <div class="stat-value">{{ countUrgent }}</div>
          <div class="stat-label">Prioritas</div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title"><i class="pi pi-filter me-1"></i>Filter & Pencarian</h3>
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label"><i class="pi pi-calendar-plus me-1"></i>Tanggal</label>
          <DatePicker
            v-model="filterTanggal"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal"
            showIcon
            iconDisplay="input"
            @date-select="fetchData"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label"><i class="pi pi-info-circle me-1"></i>Status Layanan</label>
          <Select
            v-model="filterStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua status"
            showClear
          />
        </div>
        <div class="filter-group">
          <label class="filter-label"><i class="pi pi-search me-1"></i>Pencarian</label>
          <InputText v-model="filterKeyword" placeholder="No. MR, poli, klinis..." />
        </div>
        <div class="filter-group" style="justify-content: flex-end">
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            @click="fetchData"
            :loading="loading"
            class="round-button2"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="tabs-section">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">
            <i class="pi pi-list me-1"></i>
            Daftar Permintaan ({{ filteredList.length }})
          </h3>
        </div>

        <DataTable
          :value="filteredList"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} data"
          scrollHeight="520px"
          scrollable
          responsiveLayout="scroll"
          stripedRows
          emptyMessage="Tidak ada permintaan fisioterapi"
        >
          <Column header="#" style="width: 42px; text-align: center">
            <template #body="{ index }">
              <div class="queue-num">{{ index + 1 }}</div>
            </template>
          </Column>

          <Column header="INFORMASI PASIEN" style="min-width: 220px">
            <template #body="{ data }">
              <div class="patient-info">
                <div class="patient-details">
                  <strong class="patient-name"
                    >{{ data.norm ?? 'Pasien' }} - {{ data.nama_pasien }}</strong
                  >
                  <div class="patient-extra">
                    <i class="pi pi-building" style="font-size: 0.65rem"></i>
                    {{ data.poli_asal ?? '-' }}
                  </div>
                  <div class="patient-extra" style="color: darkcyan">
                    <i class="pi pi-calendar-clock" style="font-size: 0.65rem"></i>
                    {{ splitTgl(data.tgl_permintaan).tgl }}
                    <span style="color: #94a3b8"> {{ splitTgl(data.tgl_permintaan).jam }}</span>
                  </div>
                  <div class="patient-extra" style="color: #7c6f5e">
                    <i class="pi pi-user" style="font-size: 0.65rem"></i>
                    {{ hitungUsia(data.tgl_lahir_pasien).label }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column header="DOKTER PENGIRIM" style="min-width: 180px">
            <template #body="{ data }">
              <div class="address-info">
                <i class="pi pi-user me-1" style="color: darkturquoise"></i>
                <span style="color: steelblue">{{ data.nama_dokter ?? '-' }}</span>
              </div>
            </template>
          </Column>

          <Column header="KLINIS / KELUHAN" style="min-width: 200px">
            <template #body="{ data }">
              <div class="klinis-text">{{ data.klinis ?? '-' }}</div>
              <div v-if="data.lokasi_keluhan" class="klinis-sub">
                <i class="pi pi-map-marker" style="font-size: 0.6rem"></i>
                {{ data.lokasi_keluhan }}
              </div>
            </template>
          </Column>

          <Column header="NYERI" style="width: 80px; text-align: center">
            <template #body="{ data }">
              <Tag
                v-if="data.skala_nyeri != null"
                :value="`${data.skala_nyeri}/10`"
                :severity="
                  data.skala_nyeri <= 3 ? 'success' : data.skala_nyeri <= 6 ? 'warn' : 'danger'
                "
                style="font-size: 10px"
              />
              <span v-else style="color: #cbd5e1; font-size: 0.75rem">-</span>
            </template>
          </Column>

          <Column header="PRIORITAS" style="min-width: 120px">
            <template #body="{ data }">
              <span v-if="data.prioritas" :class="['prio-badge', getPrioClass(data.prioritas)]">
                <i class="pi pi-flag" style="font-size: 0.6rem"></i>
                {{ data.prioritas }}
              </span>
              <span v-else style="color: #cbd5e1; font-size: 0.75rem">-</span>
            </template>
          </Column>

          <Column header="STATUS" style="min-width: 100px">
            <template #body="{ data }">
              <div style="display: flex; flex-direction: column; gap: 3px">
                <span :class="['status-badge', data.status_kirim == 1 ? 'sb-sent' : 'sb-pending']">
                  {{ data.status_kirim == 1 ? 'Terkirim' : 'Pending' }}
                </span>
                <span :class="['status-badge', data.status_layanan == 1 ? 'sb-done' : 'sb-wait']">
                  {{ data.status_layanan == 1 ? 'Dilayani' : 'Menunggu' }}
                </span>
              </div>
            </template>
          </Column>

          <Column header="AKSI" style="min-width: 130px">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  label="Proses"
                  icon="pi pi-play-circle"
                  size="small"
                  class="round-button2"
                  :severity="data.status_layanan == 1 ? 'secondary' : 'success'"
                  @click="masukProses(data)"
                  v-tooltip.top="data.status_layanan == 1 ? 'Sudah dilayani' : 'Mulai proses'"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <div v-if="!loading && filteredList.length === 0" class="empty-state">
          <i class="pi pi-users empty-icon"></i>
          <h3 class="empty-title">Tidak Ada Permintaan</h3>
          <p class="empty-description">
            Belum ada permintaan fisioterapi pada tanggal ini. Coba ubah tanggal atau reset filter.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
const router = useRouter()

const loading = ref(false)
const allRequests = ref([])
const filterTanggal = ref(new Date())
const filterStatus = ref(null)
const filterKeyword = ref('')

const statusOptions = [
  { label: 'Menunggu', value: 0 },
  { label: 'Dilayani', value: 1 },
]

const countPending = computed(() => allRequests.value.filter((r) => r.status_layanan != 1).length)
const countDilayani = computed(() => allRequests.value.filter((r) => r.status_layanan == 1).length)
const countUrgent = computed(
  () =>
    allRequests.value.filter((r) => r.prioritas && r.prioritas.toLowerCase().includes('segera'))
      .length,
)

const filteredList = computed(() => {
  let list = allRequests.value
  if (filterStatus.value !== null && filterStatus.value !== undefined) {
    list = list.filter((r) => r.status_layanan == filterStatus.value)
  }
  const kw = filterKeyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (r) =>
        (r.norm ?? '').toLowerCase().includes(kw) ||
        (r.poli_asal ?? '').toLowerCase().includes(kw) ||
        (r.klinis ?? '').toLowerCase().includes(kw) ||
        (r.no_permintaan ?? '').toLowerCase().includes(kw) ||
        (r.nama_dokter ?? '').toLowerCase().includes(kw),
    )
  }
  return list
})

const splitTgl = (str) => {
  if (!str) return { tgl: '-', jam: '-' }
  const [tgl, jam] = str.split(' ')
  return { tgl: tgl ?? '-', jam: jam ?? '-' }
}

const formatDateForApi = (date) => {
  if (!date) return null
  const d = new Date(date)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Hitung usia berdasarkan tanggal lahir.
 * @param {string|Date} tgl_lahir_pasien  — format 'YYYY-MM-DD' atau objek Date
 * @returns {{ tahun: number, bulan: number, hari: number, label: string }}
 *   label contoh: "25 Thn 3 Bln 7 Hr"
 */
const hitungUsia = (tgl_lahir_pasien) => {
  if (!tgl_lahir_pasien) return { tahun: 0, bulan: 0, hari: 0, label: '-' }

  const lahir = new Date(tgl_lahir_pasien)
  if (isNaN(lahir.getTime())) return { tahun: 0, bulan: 0, hari: 0, label: '-' }

  const sekarang = new Date()

  let tahun = sekarang.getFullYear() - lahir.getFullYear()
  let bulan = sekarang.getMonth() - lahir.getMonth()
  let hari = sekarang.getDate() - lahir.getDate()

  // Koreksi hari negatif
  if (hari < 0) {
    bulan -= 1
    const bulanSebelumnya = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0)
    hari += bulanSebelumnya.getDate()
  }

  // Koreksi bulan negatif
  if (bulan < 0) {
    tahun -= 1
    bulan += 12
  }

  const label =
    tahun > 0
      ? `${tahun} Thn ${bulan} Bln ${hari} Hr`
      : bulan > 0
        ? `${bulan} Bln ${hari} Hr`
        : `${hari} Hr`

  return { tahun, bulan, hari, label }
}

const getPrioClass = (p) => {
  if (!p) return ''
  const lp = p.toLowerCase()
  if (lp.includes('segera') || lp.includes('urgent')) return 'prio-urgent'
  if (lp.includes('tinggi')) return 'prio-high'
  return 'prio-normal'
}

const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/riwayat_permintaan_fisio`,
      {
        id_client: id_client.value,
        tgl_awal: formatDateForApi(filterTanggal.value),
        tgl_akhir: formatDateForApi(filterTanggal.value),
        mode: 3,
      },
    )
    allRequests.value = res.data?.data || []
  } catch (err) {
    console.error(err)
    showError('Gagal memuat data permintaan')
  } finally {
    loading.value = false
  }
}

const masukProses = (item) => {
  router.push({
    name: 'ProsesFisioterapiView',
    params: {
      noreg: item.no_register ?? item.noregister ?? '',
    },
    query: {
      no_permintaan: item.no_permintaan,
      noreg: item.noregister ?? '',
      norm: item.norm ?? '',
      nama_pasien: item.nama_pasien ?? '',
      tgl_lahir_pasien: item.tgl_lahir_pasien ?? '',
      jenis_kelamin: item.jenis_kelamin ?? '',
      poli_asal: item.poli_asal ?? '',
      nama_dokter: item.nama_dokter ?? '',
      klinis: item.klinis ?? '',
      lokasi_keluhan: item.lokasi_keluhan ?? '',
      skala_nyeri: item.skala_nyeri ?? '',
      prioritas: item.prioritas ?? '',
      tgl_permintaan: item.tgl_permintaan ?? '',
      status_layanan: item.status_layanan ?? '',
    },
  })
}

onMounted(() => fetchData())
</script>

<style scoped>
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  border-radius: 3px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.hero-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}
.hero-description {
  font-size: 0.84rem;
  opacity: 0.88;
  margin: 0;
  max-width: 480px;
}
.hero-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  text-align: center;
  min-width: 72px;
}
.stat-warn {
  background: rgba(245, 158, 11, 0.3);
  border-color: rgba(245, 158, 11, 0.5);
}
.stat-success {
  background: rgba(34, 197, 94, 0.3);
  border-color: rgba(34, 197, 94, 0.5);
}
.stat-urgent {
  background: rgba(220, 38, 38, 0.3);
  border-color: rgba(220, 38, 38, 0.5);
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}
.stat-label {
  font-size: 0.68rem;
  opacity: 0.85;
  margin-top: 3px;
}
.filter-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}
.filter-header {
  margin-bottom: 0.75rem;
}
.filter-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: darkcyan;
  margin: 0;
  display: flex;
  align-items: center;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.75rem 1rem;
  align-items: end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
}
.tabs-section {
  margin-bottom: 1.5rem;
}
.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.table-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: darkcyan;
  margin: 0;
  display: flex;
  align-items: center;
}
:deep(.p-datatable-thead > tr > th) {
  background: #f0fafa !important;
  color: darkcyan !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid darkcyan !important;
}
:deep(.p-datatable-tbody > tr > td) {
  font-size: 0.82rem;
  vertical-align: middle;
}
:deep(.p-datatable-tbody > tr:hover > td) {
  background: #f0fafa !important;
}
.patient-info {
  cursor: default;
}
.patient-name {
  font-size: 0.88rem;
  color: #1e293b;
  display: block;
}
.patient-extra {
  font-size: 0.72rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.klinis-text {
  font-size: 0.78rem;
  color: #1e293b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.klinis-sub {
  font-size: 0.65rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}
.address-info {
  display: flex;
  align-items: center;
  font-size: 0.82rem;
}
.queue-num {
  font-size: 0.78rem;
  font-weight: 700;
  color: darkcyan;
  text-align: center;
}
.action-buttons {
  display: flex;
  gap: 4px;
}
.prio-badge {
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
}
.prio-urgent {
  color: #dc2626;
  background: #fee2e2;
}
.prio-high {
  color: #d97706;
  background: #fef3c7;
}
.prio-normal {
  color: #2563eb;
  background: #dbeafe;
}
.status-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 7px;
  border-radius: 999px;
  display: inline-block;
  white-space: nowrap;
}
.sb-sent {
  background: #dcfce7;
  color: #15803d;
}
.sb-pending {
  background: #fef3c7;
  color: #b45309;
}
.sb-done {
  background: #cffafe;
  color: darkcyan;
}
.sb-wait {
  background: #f1f5f9;
  color: #64748b;
}
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}
.empty-icon {
  font-size: 2.5rem;
  opacity: 0.3;
  display: block;
  margin-bottom: 0.75rem;
}
.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.4rem;
}
.empty-description {
  font-size: 0.82rem;
  color: #94a3b8;
}
.round-button2 {
  border-radius: 6px;
}
</style>
