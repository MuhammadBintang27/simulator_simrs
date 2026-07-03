<template>
  <div>
    <Dialog
      v-model:visible="showDialog"
      modal
      :style="getDialogStyle()"
      :closable="true"
      header="Histori Pelayanan BPJS"
      :class="{ 'mobile-dialog': isMobile }"
    >
      <!-- Filter Bar -->
      <div class="filter-bar" :class="{ 'filter-bar-mobile': isMobile }">
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar mr-1"></i>
            Tanggal Mulai
          </label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
            :minDate="viewOnly ? null : minDate"
            :maxDate="viewOnly ? null : maxDate"
            class="filter-datepicker"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">
            <i class="pi pi-calendar mr-1"></i>
            Tanggal Selesai
          </label>
          <DatePicker
            v-model="endDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            showIcon
            iconDisplay="input"
            :minDate="viewOnly ? null : minDate"
            :maxDate="viewOnly ? null : maxDate"
            class="filter-datepicker"
          />
        </div>
        <div class="filter-group filter-group-action">
          <label class="filter-label">&nbsp;</label>
          <Button
            label="Cari"
            icon="pi pi-search"
            severity="primary"
            :loading="isLoading"
            @click="fetchData"
          />
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar" v-if="!isLoading && historiData.length > 0">
        <div class="stat-item">
          <span class="stat-val">{{ historiData.length }}</span>
          <span class="stat-lbl">Total Kunjungan</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">{{ countJenis('1') }}</span>
          <span class="stat-lbl">Rawat Inap</span>
        </div>
        <div class="stat-item">
          <span class="stat-val">{{ countJenis('2') }}</span>
          <span class="stat-lbl">Rawat Jalan</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <i class="pi pi-spin pi-spinner loading-icon"></i>
        <span>Memuat data histori...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading && historiData.length === 0" class="empty-state">
        <i class="pi pi-inbox empty-icon"></i>
        <h3 class="empty-title">Tidak Ada Data Histori</h3>
        <p class="empty-desc">Tidak ditemukan histori pelayanan pada periode yang dipilih.</p>
      </div>

      <!-- Mobile Card View -->
      <div v-else-if="isMobile" class="mobile-view">
        <div v-for="(item, index) in historiData" :key="item.noSep || index" class="histori-card">
          <div class="card-header-row">
            <div class="card-header-left">
              <Tag
                :severity="getJenisSeverity(item.jnsPelayanan)"
                :value="getJenisLabel(item.jnsPelayanan)"
                style="font-size: 0.72rem"
              />
              <div class="card-dates">
                <span class="card-date-item">
                  <i class="pi pi-sign-in card-date-icon"></i>
                  {{ item.tglSep || '—' }}
                </span>
                <span v-if="item.tglPlgSep" class="card-date-sep">→</span>
                <span v-if="item.tglPlgSep" class="card-date-item card-date-pulang">
                  <i class="pi pi-sign-out card-date-icon"></i>
                  {{ item.tglPlgSep }}
                </span>
              </div>
            </div>
            <Button
              v-if="!viewOnly"
              icon="pi pi-trash"
              severity="danger"
              size="small"
              outlined
              @click="hapusSEP(item)"
              v-tooltip.top="'Hapus SEP'"
            />
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">No. SEP</span>

              {{ item.noSep }}
            </div>
            <div class="info-row">
              <span class="label">Peserta</span>
              <span class="value">
                <strong>{{ item.namaPeserta }}</strong>
                <br />
                {{ item.noKartu }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Diagnosa</span>
              <span class="value">{{ item.diagnosa || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Poli</span>
              <span class="value">{{ item.poliTujSep || item.poli || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Kelas</span>
              <span class="value">{{ item.kelasRawat || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">No. Rujukan</span>
              {{ item.noRujukan || '-' }}
            </div>
            <div class="info-row" v-if="item.tglPlgSep">
              <span class="label">Tgl Pulang</span>
              <span class="value">{{ item.tglPlgSep }}</span>
            </div>
            <div class="info-row">
              <span class="label">RS Penerbit SEP</span>
              <span class="value">{{ item.ppkPelayanan || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div v-else class="table-responsive" style="max-height: 520px; overflow-y: auto">
        <table class="table table-bordered table-striped table-hover">
          <thead class="thead-light sticky-top">
            <tr>
              <th style="width: 3%">#</th>
              <th style="width: 13%">No. SEP</th>
              <th style="width: 8%">Tgl SEP</th>
              <th style="width: 12%">Peserta</th>
              <th style="width: 7%">Jenis</th>
              <th style="width: 5%">Kelas</th>
              <th style="width: 17%">Diagnosa</th>
              <th style="width: 10%">Poli / Unit</th>
              <th style="width: 9%">No. Rujukan</th>
              <th style="width: 11%">PPK Perujuk</th>
              <th v-if="!viewOnly" style="width: 5%; text-align: center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in historiData" :key="item.noSep || index">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <code style="font-size: 0.75rem; color: #2563eb">{{ item.noSep }}</code>
              </td>
              <td>
                <div class="tgl-sep-wrap">
                  <span class="tgl-masuk">
                    <i class="pi pi-sign-in" style="font-size: 0.65rem; margin-right: 3px"></i>
                    {{ item.tglSep || '—' }}
                  </span>
                  <span v-if="item.tglPlgSep" class="tgl-pulang">
                    <i class="pi pi-sign-out" style="font-size: 0.65rem; margin-right: 3px"></i>
                    {{ item.tglPlgSep }}
                  </span>
                </div>
              </td>
              <td>
                <strong style="font-size: 0.82rem">{{ item.namaPeserta }}</strong>
                <br />
                <small class="text-muted">{{ item.noKartu }}</small>
              </td>
              <td>
                <Tag
                  :severity="getJenisSeverity(item.jnsPelayanan)"
                  :value="getJenisLabel(item.jnsPelayanan)"
                  style="font-size: 0.68rem"
                />
              </td>
              <td>
                <span style="font-size: 0.8rem">{{ item.kelasRawat || '-' }}</span>
              </td>
              <td>
                <span style="font-size: 0.78rem">{{ item.diagnosa || '-' }}</span>
              </td>
              <td>
                <span style="font-size: 0.78rem; color: steelblue">
                  {{ item.poliTujSep || item.poli || '-' }}
                </span>
              </td>
              <td>
                <code style="font-size: 0.72rem">{{ item.noRujukan || '-' }}</code>
              </td>
              <td>
                <span style="font-size: 0.78rem">{{ item.ppkPelayanan || '-' }}</span>
              </td>
              <td v-if="!viewOnly" class="text-center">
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  size="small"
                  outlined
                  @click="hapusSEP(item)"
                  v-tooltip.top="'Hapus SEP ini'"
                  style="padding: 0.3rem 0.5rem"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary Footer -->
      <div class="table-summary" v-if="!isLoading && historiData.length > 0">
        <small class="text-muted">
          Menampilkan {{ historiData.length }} data histori &mdash;
          {{ formatDateDisplay(startDate) }} s/d {{ formatDateDisplay(endDate) }}
        </small>
      </div>

      <div class="button-group mt-2" :class="{ 'mobile-button-group': isMobile }">
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showDialog = false"
          :class="{ 'w-full': isMobile }"
        />
      </div>
    </Dialog>

    <ConfirmDialog group="riwayat-bpjs" />
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog'
import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const props = defineProps({
  noKartu: {
    type: String,
    default: null,
  },
  viewOnly: {
    type: Boolean,
    default: false,
  },
})

// ── State ──────────────────────────────────────────────────
const showDialog = ref(false)
const isLoading = ref(false)
const historiData = ref([])
const isMobile = ref(false)

const now = new Date()
const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3)
const startDate = ref(props.viewOnly ? new Date(now.getFullYear(), now.getMonth() - 1, 1) : minDate)
const endDate = ref(maxDate)

// ── Helpers ────────────────────────────────────────────────
const formatDateForAPI = (date) => {
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDateDisplay = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getJenisLabel = (kode) => {
  const map = { 1: 'Rawat Inap', 2: 'Rawat Jalan' }
  return map[String(kode)] ?? `Jenis ${kode}`
}

const getJenisSeverity = (kode) => {
  return String(kode) === '1' ? 'info' : 'success'
}

const countJenis = (kode) => historiData.value.filter((h) => String(h.jnsPelayanan) === kode).length

const getDialogStyle = () => ({ width: isMobile.value ? '95vw' : '85vw' })

// ── Toast ──────────────────────────────────────────────────
const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })

// ── API ────────────────────────────────────────────────────
const fetchData = async () => {
  if (!props.noKartu) {
    showError('Nomor kartu BPJS tidak tersedia.')
    return
  }
  try {
    isLoading.value = true
    historiData.value = []

    const noKartu = props.noKartu
    const tglAwal = formatDateForAPI(startDate.value)
    const tglAkhir = formatDateForAPI(endDate.value)
    const url = configStore.apiBaseUrl

    const response = await axios.post(
      `${url}/index.php/api/Bpjs_api/get_historis_pelayanan_v2/${noKartu}/${id_client.value}/${tglAwal}/${tglAkhir}/`,
    )

    if (response.data?.metaData?.code === '200') {
      historiData.value = response.data?.response?.histori ?? []
    } else {
      showError(response.data?.metaData?.message ?? 'Gagal memuat data histori.')
    }
  } catch (error) {
    console.error('Error fetching histori BPJS:', error)
    showError('Gagal memuat data histori pelayanan.')
  } finally {
    isLoading.value = false
  }
}

const hapusSEP = (item) => {
  confirm.require({
    group: 'riwayat-bpjs',
    message: `Yakin ingin menghapus SEP ${item.noSep}?`,
    header: 'Konfirmasi Hapus SEP',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const url = configStore.apiBaseUrl
        const response = await axios.post(
          `${url}/index.php/api/Bpjs_api/hapus_sep/${item.noSep}/${id_client.value}/${user_id.value}`,
        )

        if (response.data?.metaData?.code === '200') {
          historiData.value = historiData.value.filter((h) => h.noSep !== item.noSep)
          showSuccess(`SEP ${item.noSep} berhasil dihapus.`)
        } else {
          showError(response.data?.metaData?.message ?? 'Gagal menghapus SEP.')
        }
      } catch (error) {
        console.error('Error hapus SEP:', error)
        showError('Gagal menghapus SEP.')
      }
    },
  })
}

// ── Expose ─────────────────────────────────────────────────
const open = () => {
  showDialog.value = true
  fetchData()
}

defineExpose({ open })

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })
})
</script>

<style scoped>
/* ── Filter Bar ── */
.filter-bar {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.filter-bar-mobile {
  flex-direction: column;
  align-items: stretch;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.filter-group-action {
  justify-content: flex-end;
}
.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.filter-datepicker {
  min-width: 180px;
}

/* ── Stats Bar ── */
.stats-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  border-radius: 8px;
  margin-bottom: 0.85rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 90px;
  color: white;
}
.stat-val {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.2;
}
.stat-lbl {
  font-size: 0.7rem;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Loading / Empty ── */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 3rem 1rem;
  color: #64748b;
  font-size: 0.9rem;
}
.loading-icon {
  font-size: 1.4rem;
  color: #3b82f6;
}
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #64748b;
}
.empty-icon {
  font-size: 3rem;
  opacity: 0.2;
  display: block;
  margin-bottom: 1rem;
}
.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.4rem;
}
.empty-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  max-width: 380px;
  margin: 0 auto;
}

/* ── Mobile Card ── */
.mobile-view {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 60vh;
  overflow-y: auto;
}
.histori-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.card-date {
  font-size: 0.78rem;
  color: #64748b;
}
.card-body {
  padding: 0.75rem 0.85rem;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
  font-size: 0.85rem;
}
.info-row:last-child {
  margin-bottom: 0;
}
.info-row .label {
  font-weight: 600;
  color: #64748b;
  min-width: 90px;
  flex-shrink: 0;
  font-size: 0.78rem;
}
.info-row .value {
  text-align: right;
  flex: 1;
  color: #1e293b;
  word-break: break-word;
}

/* ── Tgl SEP (desktop) ── */
.tgl-sep-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tgl-masuk {
  font-size: 0.78rem;
  white-space: nowrap;
  color: #1e293b;
}
.tgl-pulang {
  font-size: 0.75rem;
  white-space: nowrap;
  color: #0369a1;
  background: #e0f2fe;
  border-radius: 4px;
  padding: 1px 5px;
  display: inline-block;
}

/* ── Card dates (mobile) ── */
.card-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card-dates {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.card-date-item {
  font-size: 0.75rem;
  color: #475569;
}
.card-date-pulang {
  color: #0369a1;
  background: #e0f2fe;
  border-radius: 4px;
  padding: 1px 5px;
}
.card-date-sep {
  font-size: 0.7rem;
  color: #94a3b8;
}
.card-date-icon {
  font-size: 0.65rem;
  opacity: 0.7;
}

/* ── Table ── */
.table-summary {
  padding: 0.4rem 0.25rem;
  text-align: right;
}
.text-muted {
  color: #94a3b8;
}
.ml-2 {
  margin-left: 0.5rem;
}

/* ── Footer Buttons ── */
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.mobile-button-group {
  flex-direction: column;
}

@media (max-width: 768px) {
  .mobile-dialog {
    width: 100vw !important;
    max-width: 100% !important;
  }
}
</style>
