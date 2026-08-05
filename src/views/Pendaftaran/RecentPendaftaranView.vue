<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- ═══════════════ DESKTOP VIEW ═══════════════ -->

    <!-- ═══════════════ MOBILE VIEW ═══════════════ -->
    <div class="md:hidden">
      <Dialog
        v-model:visible="ShowRiwayatPendaftaran"
        modal
        :style="{ width: '95vw', maxWidth: '100%' }"
        :closable="true"
      >
        <template #header>
          <div class="dialog-header-content">
            <div class="dialog-header-icon">
              <i class="pi pi-list"></i>
            </div>
            <div>
              <p class="dialog-header-title">Riwayat Pendaftaran</p>
              <p class="dialog-header-sub">{{ filteredFact.length }} data ditemukan</p>
            </div>
          </div>
        </template>

        <div class="mobile-filter">
          <InputGroup class="filter-row-full">
            <InputGroupAddon class="mf-addon">Awal</InputGroupAddon>
            <DatePicker
              v-model="startDate"
              dateFormat="yy-mm-dd"
              showIcon
              :showButtonBar="true"
              placeholder="Tgl Awal"
              class="mf-datepicker"
              @date-select="clearQuickDate"
            />
            <InputGroupAddon class="mf-addon">Akhir</InputGroupAddon>
            <DatePicker
              v-model="endDate"
              dateFormat="yy-mm-dd"
              showIcon
              :showButtonBar="true"
              placeholder="Tgl Akhir"
              class="mf-datepicker"
              @date-select="clearQuickDate"
            />
            <InputText
              v-model="searchKeyword"
              placeholder="Nama / NIK / No MR"
              @keyup.enter="onSearch"
              class="mf-search-input"
            />
            <Button icon="pi pi-search" :loading="loading" class="btn-search" @click="onSearch" />
          </InputGroup>

          <div class="quick-date-row">
            <button
              :class="['quick-date-btn', selectedQuickDate === '2m' && 'quick-date-btn-active']"
              @click="setQuickDate(2, 'month', '2m')"
            >
              2 Bulan Lalu
            </button>
            <button
              :class="['quick-date-btn', selectedQuickDate === '1m' && 'quick-date-btn-active']"
              @click="setQuickDate(1, 'month', '1m')"
            >
              1 Bulan Lalu
            </button>
            <button
              :class="['quick-date-btn', selectedQuickDate === '2w' && 'quick-date-btn-active']"
              @click="setQuickDate(2, 'week', '2w')"
            >
              2 Minggu Lalu
            </button>
            <button
              :class="['quick-date-btn', selectedQuickDate === '1w' && 'quick-date-btn-active']"
              @click="setQuickDate(1, 'week', '1w')"
            >
              1 Minggu Lalu
            </button>
          </div>

          <div class="jenisrawat-filter-row">
            <span class="jr-label">Jenis Rawat</span>
            <label class="jr-radio-item">
              <RadioButton v-model="filterJenisRawat" value="ALL" name="jenisrawat" />
              <span>Semua</span>
            </label>
            <label class="jr-radio-item">
              <RadioButton v-model="filterJenisRawat" value="JALAN" name="jenisrawat" />
              <span>Rawat Jalan</span>
            </label>
            <label class="jr-radio-item">
              <RadioButton v-model="filterJenisRawat" value="INAP" name="jenisrawat" />
              <span>Rawat Inap</span>
            </label>
          </div>
        </div>

        <div class="mobile-cards">
          <div v-if="filteredFact.length === 0" class="empty-state">
            <i class="pi pi-inbox empty-icon"></i>
            <p class="empty-title">Tidak ada data</p>
            <p class="empty-sub">Coba ubah filter pencarian Anda</p>
          </div>

          <div
            v-for="(item, index) in paginatedMobileFact"
            :key="index"
            :class="['card-mobile', item.BATAL === '1' ? 'card-cancelled' : '']"
          >
            <div class="card-mobile-header">
              <div>
                <p class="card-label">No Registrasi</p>
                <p class="card-noreg">{{ item.NOPENDAFTARAN }}</p>
                <p v-if="item.NOSEP" class="card-nosep">SEP: {{ item.NOSEP }}</p>
              </div>

              <div class="card-header-time">
                <div class="time-chip time-chip--masuk">
                  <i class="pi pi-sign-in"></i>
                  <span class="time-chip-lbl">Masuk</span>
                  <span class="time-chip-val">{{ item.MASUKPOLY_DISPLAY || '-' }}</span>
                </div>
                <div class="time-chip-divider"></div>
                <div class="time-chip time-chip--keluar">
                  <i class="pi pi-sign-out"></i>
                  <span class="time-chip-lbl">Keluar</span>
                  <span class="time-chip-val">{{ item.KELUARPOLY || '-' }}</span>
                </div>
              </div>

              <span v-if="item.BATAL === '0'" class="status-badge status-aktif">
                <i class="pi pi-check-circle mr-1"></i>Aktif
              </span>
              <span v-else class="status-badge status-batal">
                <i class="pi pi-times-circle mr-1"></i>Batal
              </span>
            </div>

            <div class="card-mobile-body">
              <div class="card-patient-row">
                <div class="flex-1">
                  <p class="patient-name">{{ item.NAMAPASIEN }}</p>
                  <p class="patient-age">
                    {{ item.USIA_PASIEN.tahun }}T {{ item.USIA_PASIEN.bulan }}B
                    {{ item.USIA_PASIEN.hari }}H
                  </p>
                  <p class="patient-ids-inline">
                    MR:{{ item.NOMR }} &bull; NIK:{{ item.NOKTP }} &bull; BPJS:{{
                      item.NOJAMINAN || '-'
                    }}
                    <button
                      v-if="item.NOJAMINAN"
                      class="riwayat-bpjs-btn"
                      @click.stop="openRiwayatBPJS(item.NOJAMINAN)"
                      v-tooltip.top="'Lihat Riwayat BPJS'"
                    >
                      <i class="pi pi-history"></i>
                    </button>
                  </p>
                </div>
              </div>

              <div class="card-detail-inline">
                <span class="detail-chip" v-tooltip.top="'Dokter'"
                  ><i class="pi pi-user-md"></i>{{ item.NAMADOKTER }}</span
                >
                <span class="detail-sep">&bull;</span>
                <span class="detail-chip" v-tooltip.top="'Poli'"
                  ><i class="pi pi-map-marker"></i>{{ item.POLI }}</span
                >
                <span :class="['bayar-badge', bayarClass(item.CARABAYAR)]">{{
                  item.CARABAYAR
                }}</span>
                <span :class="['rawat-badge', rawatClass(item.JENISRAWAT)]">{{
                  item.JENISRAWAT
                }}</span>
                <span v-if="item.NOSEP" class="detail-chip mono" v-tooltip.top="'No SEP'"
                  >SEP:{{ item.NOSEP }}</span
                >
                <span v-if="item.STTS_PULANG" class="detail-chip detail-chip-pulang">{{
                  item.STTS_PULANG
                }}</span>
              </div>

              <div v-if="item.INI_BUKAN_PASIEN_KAMI === '1'" class="unclaim-notice">
                <i class="pi pi-exclamation-triangle mr-1"></i>
                Pasien unclaim &mdash; by: {{ item.DILAKUKAN_OLEH }}
              </div>

              <div
                v-if="item.BATAL === '0' && item.JENISRAWAT === 'JALAN' && item.ALASAN_BATAL"
                class="sep-batal-notice"
              >
                <i class="pi pi-info-circle mr-1"></i>
                <span
                  >SEP dibatalkan &mdash; Rujuk Rawat Inap:
                  <strong>{{ item.ALASAN_BATAL }}</strong></span
                >
              </div>
            </div>

            <div class="card-mobile-footer">
              <Button
                :disabled="item.BATAL !== '0'"
                icon="pi pi-print"
                label="Cetak"
                severity="info"
                size="small"
                outlined
                :loading="item.isLoading"
                @click="PrintSEP(item.NOSEP, item.NOPENDAFTARAN, item)"
                class="card-btn"
              />
              <Button
                :disabled="item.BATAL !== '0'"
                icon="pi pi-pencil"
                label="Edit"
                severity="success"
                size="small"
                outlined
                @click="editPendaftaran(item)"
                class="card-btn"
              />
              <Button
                :disabled="item.BATAL !== '0'"
                icon="pi pi-file-edit"
                label="Consent"
                severity="warning"
                size="small"
                outlined
                @click="openConsentDialog(item)"
                class="card-btn"
              />
              <Button
                :disabled="item.BATAL !== '0'"
                icon="pi pi-trash"
                label="Hapus"
                severity="danger"
                size="small"
                outlined
                @click="confirmDelete(item)"
                class="card-btn"
              />
              <Button
                :disabled="item.BATAL !== '0'"
                icon="pi pi-arrow-right"
                label="Tindak Lanjut"
                severity="success"
                size="small"
                @click="funtionSendToPoli(item)"
                class="card-btn"
              />
              <Button
                icon="pi pi-file-pdf"
                label="RM EL"
                severity="info"
                size="small"
                outlined
                @click="PrintRekamMedisEl(item)"
                class="card-btn"
                v-tooltip.top="'Rekam Medis Elektronik'"
              />
            </div>
          </div>
        </div>

        <div class="mobile-pagination">
          <Button
            icon="pi pi-chevron-left"
            text
            rounded
            @click="mobilePage--"
            :disabled="mobilePage === 1"
          />
          <div class="page-info">
            <span class="page-current">{{ mobilePage }}</span>
            <span class="page-sep">/</span>
            <span class="page-total">{{
              Math.ceil(filteredFact.length / mobileRowsPerPage) || 1
            }}</span>
          </div>
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            @click="mobilePage++"
            :disabled="mobilePage >= Math.ceil(filteredFact.length / mobileRowsPerPage)"
          />
        </div>
      </Dialog>
    </div>

    <!-- ═══════════════ INFORM CONSENT DIALOG ═══════════════ -->
    <Dialog
      v-model:visible="showConsentDialog"
      modal
      :style="{ width: '90vw', maxWidth: '420px' }"
      :closable="true"
    >
      <template #header>
        <div class="consent-dialog-header">
          <div class="consent-dialog-icon">
            <i class="pi pi-file-edit"></i>
          </div>
          <div>
            <p class="dialog-header-title" style="color: #1f2937">Inform Consent</p>
            <p class="dialog-header-sub" style="color: #6b7280">Pilih jenis formulir persetujuan</p>
          </div>
        </div>
      </template>

      <div class="consent-patient-info" v-if="selectedConsentRow">
        <i class="pi pi-user consent-patient-icon"></i>
        <div>
          <p class="consent-patient-name">{{ selectedConsentRow.NAMAPASIEN }}</p>
          <p class="consent-patient-meta">
            {{ selectedConsentRow.NOPENDAFTARAN }} &bull; {{ selectedConsentRow.NOMR }}
          </p>
        </div>
      </div>

      <div class="consent-options">
        <button class="consent-option-btn" @click="navigateToConsent('AnestesiConsentView')">
          <div class="consent-option-icon consent-anestesi">
            <i class="pi pi-bolt"></i>
          </div>
          <div class="consent-option-text">
            <p class="consent-option-title">Consent Anestesi</p>
            <p class="consent-option-desc">Persetujuan tindakan pembiusan / anestesi</p>
          </div>
          <i class="pi pi-chevron-right consent-option-arrow"></i>
        </button>

        <button class="consent-option-btn" @click="navigateToConsent('TindakanConsentView')">
          <div class="consent-option-icon consent-tindakan">
            <i class="pi pi-heart"></i>
          </div>
          <div class="consent-option-text">
            <p class="consent-option-title">Consent Tindakan</p>
            <p class="consent-option-desc">Persetujuan tindakan medis / operasi</p>
          </div>
          <i class="pi pi-chevron-right consent-option-arrow"></i>
        </button>

        <button class="consent-option-btn" @click="navigateToConsent('RanapConsentView')">
          <div class="consent-option-icon consent-ranap">
            <i class="pi pi-building"></i>
          </div>
          <div class="consent-option-text">
            <p class="consent-option-title">Consent Rawat Inap</p>
            <p class="consent-option-desc">Persetujuan perawatan / rawat inap</p>
          </div>
          <i class="pi pi-chevron-right consent-option-arrow"></i>
        </button>
      </div>
    </Dialog>

    <!-- ═══════════════ CONFIRMATION DIALOG ═══════════════ -->
    <Dialog
      v-model:visible="showDeleteConfirm"
      modal
      :style="{ width: '90vw', maxWidth: '460px' }"
      :closable="false"
    >
      <template #header>
        <div class="del-dialog-header">
          <div class="del-dialog-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <span>Konfirmasi Pembatalan</span>
        </div>
      </template>

      <div class="del-dialog-body">
        <p v-if="selectedRow" class="del-dialog-text">
          Anda akan membatalkan pendaftaran
          <strong class="text-primary">{{ selectedRow.NOPENDAFTARAN }}</strong> atas nama
          <strong>{{ selectedRow.NAMAPASIEN }}</strong
          >. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div class="del-field">
          <label class="filter-label">Alasan Pembatalan <span class="required-star">*</span></label>
          <InputText
            v-model="txtalasan_batal"
            placeholder="Tuliskan alasan pembatalan..."
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="del-dialog-footer">
          <Button
            label="Kembali"
            icon="pi pi-arrow-left"
            text
            severity="secondary"
            @click="showDeleteConfirm = false"
          />
          <Button
            label="Batalkan Pendaftaran"
            icon="pi pi-trash"
            severity="danger"
            @click="executeDelete"
          />
        </div>
      </template>
    </Dialog>

    <RiwayatBPJSComponent :no-kartu="selectedNoBPJS" :view-only="true" ref="riwayatBpjsRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import axios from 'axios'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import RiwayatBPJSComponent from '@/views/Pendaftaran/RiwayatBPJSComponent.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const router = useRouter()
const toast = useToast()

const loading = ref(false)
const ShowRiwayatPendaftaran = ref(false)
const searchKeyword = ref('')
const showDeleteConfirm = ref(false)
const riwayatBpjsRef = ref(null)
const selectedNoBPJS = ref(null)

const openRiwayatBPJS = (noKartu) => {
  selectedNoBPJS.value = noKartu
  riwayatBpjsRef.value.open()
}
const selectedRow = ref(null)
const fact = ref([])
const txtalasan_batal = ref('')
const showConsentDialog = ref(false)
const selectedConsentRow = ref(null)

const startDate = ref(new Date())
const endDate = ref(new Date())

const mobilePage = ref(1)
const mobileRowsPerPage = ref(5)

const filterJenisRawat = ref('ALL')
watch(filterJenisRawat, () => {
  mobilePage.value = 1
})

const filteredFact = computed(() => {
  if (filterJenisRawat.value === 'ALL') return fact.value
  return fact.value.filter(
    (item) => (item.JENISRAWAT || '').toUpperCase() === filterJenisRawat.value,
  )
})

const paginatedMobileFact = computed(() => {
  const start = (mobilePage.value - 1) * mobileRowsPerPage.value
  return filteredFact.value.slice(start, start + mobileRowsPerPage.value)
})

const selectedQuickDate = ref(null)

const setQuickDate = (amount, unit, key) => {
  const end = new Date()
  const start = new Date()
  if (unit === 'month') {
    start.setMonth(start.getMonth() - amount)
  } else {
    start.setDate(start.getDate() - amount * 7)
  }
  startDate.value = start
  endDate.value = end
  selectedQuickDate.value = key
  onSearch()
}

const clearQuickDate = () => {
  selectedQuickDate.value = null
}

const bayarClass = (carabayar = '') => {
  const v = carabayar.toUpperCase()
  if (v.includes('WAITING LIST')) return 'bayar-waiting'
  if (v.includes('KETENAGAKERJAAN')) return 'bayar-ketenagakerjaan'
  if (v.includes('BPJS')) return 'bayar-bpjs'
  if (v.includes('UMUM')) return 'bayar-umum'
  return 'bayar-other'
}

const rawatClass = (jenis = '') => {
  const v = jenis.toUpperCase()
  if (v.includes('JALAN') || v.includes('JALAN')) return 'rawat-jalan'
  if (v.includes('INAP') || v.includes('INAP')) return 'rawat-inap'
  if (v.includes('IGD') || v.includes('IGD')) return 'rawat-igd'
  return 'rawat-other'
}

const rowStatusClass = (data) => (data.BATAL === '1' ? 'row-cancelled' : '')

const editPendaftaran = (data) => {
  const routeData = router.resolve({
    name: 'EditPendaftaranComponent',
    params: { noreg: data.NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
}

const funtionSendToPoli = (status) => {
  const routeData = router.resolve({
    name: 'FormPoliKlinikView',
    query: { noreg: status.NOPENDAFTARAN, noka: status.NOJAMINAN, nomr: status.NOMR },
  })
  window.open(routeData.href, '_blank')
}

const PrintRekamMedisEl = (item) => {
  const routeData = router.resolve({
    name: 'RMEViewer',
    query: { noreg: item.NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
}

const openConsentDialog = (row) => {
  selectedConsentRow.value = row
  showConsentDialog.value = true
}

const navigateToConsent = (routeName) => {
  if (!selectedConsentRow.value) return
  const routeData = router.resolve({
    name: routeName,
    params: { noreg: selectedConsentRow.value.NOPENDAFTARAN },
  })
  window.open(routeData.href, '_blank')
  showConsentDialog.value = false
}

const showSuccess = (message = 'Berhasil') =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 })

const showError = (message = 'Terjadi kesalahan') =>
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })

const showWarning = (message) =>
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: message, life: 4000 })

const PrintSEP = async (nosep, noregister, row) => {
  row.isLoading = true
  try {
    const data = {
      data: { NOPENDAFTARAN: noregister, NOSEP: nosep, id_client: id_client.value, NORM: row.NOMR },
    }

    const response = await axios.post(`${configStore.laravel}/get_data_sep_api`, data)
    window.open(response.data, '_blank')
  } finally {
    row.isLoading = false
  }
}

const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return null
  }
}

const confirmDelete = (row) => {
  selectedRow.value = row
  txtalasan_batal.value = ''
  showDeleteConfirm.value = true
}

const executeDelete = () => {
  if (!selectedRow.value) return
  if (!txtalasan_batal.value.trim()) {
    showError('Alasan pembatalan wajib diisi')
    return
  }
  deleteRow(selectedRow.value)
  showDeleteConfirm.value = false
  selectedRow.value = null
}

const deleteRow = async (row) => {
  try {
    loading.value = true
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/data_referensi/batal_pendaftaran_v4`,
      {
        noregister: row.NOPENDAFTARAN,
        id_client: id_client.value,
        tglawal: formatDateOnlyForAPI(startDate.value),
        nosep: row.NOSEP,
        user_id: user_id.value,
        norm: row.NOMR,
        alasan_batal: txtalasan_batal.value,
      },
    )
    if (response.data.code == 200) {
      showSuccess(`Pendaftaran ${row.NOPENDAFTARAN} berhasil dibatalkan`)
      fetchData(10)
    } else {
      showWarning(response.data.message)
    }
  } catch {
    showError('Gagal membatalkan pendaftaran')
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  mobilePage.value = 1
  fetchData('7.1')
}

const fetchData = async (mode) => {
  try {
    loading.value = true
    const response = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      {
        mod: mode,
        tglawal: formatDateOnlyForAPI(startDate.value),
        tglakhir: formatDateOnlyForAPI(endDate.value),
        id_client: id_client.value,
        norm: searchKeyword.value,
      },
    )
    fact.value = [...response.data.response]
  } catch {
    showError('Gagal memuat data pendaftaran')
  } finally {
    loading.value = false
  }
}

defineExpose({ fetchData, ShowRiwayatPendaftaran })
onMounted(() => {})
</script>

<style scoped>
:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #56a7a0 0%, #11998e 100%);
  border-bottom: none;
  padding: 1rem 1.25rem;
}

:deep(.p-dialog .p-dialog-header .p-dialog-header-icon) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.p-dialog .p-dialog-header .p-dialog-header-icon:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1rem 1.25rem;
}

.dialog-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dialog-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.dialog-header-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.dialog-header-sub {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.875rem;
  flex-wrap: wrap;
}

.filter-date-group {
  flex-shrink: 0;
}

.filter-search-group {
  flex: 1;
  min-width: 180px;
}

.filter-addon {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  letter-spacing: 0.03em;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.btn-search {
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

:deep(.date-picker-sm .p-inputtext) {
  font-size: 0.82rem;
  padding: 0.35rem 0.5rem;
}

:deep(.date-picker-sm .p-datepicker-trigger) {
  padding: 0.35rem 0.5rem;
}

.stats-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  font-size: 0.78rem;
}

.stat-chip-success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.stat-chip-danger {
  background: #fef2f2;
  border-color: #fecaca;
}

.stat-chip-icon {
  font-size: 0.8rem;
  color: #2563eb;
}

.stat-chip-success .stat-chip-icon {
  color: #16a34a;
}

.stat-chip-danger .stat-chip-icon {
  color: #dc2626;
}

.stat-chip-label {
  color: #4b5563;
  font-weight: 500;
}

.stat-chip-value {
  font-weight: 700;
  color: #1f2937;
}

:deep(.pro-table .p-datatable-thead > tr > th) {
  background: #1e3a5f;
  color: #fff;
  padding: 0.5rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  border-color: #2563eb;
}

:deep(.pro-table .p-datatable-tbody > tr > td) {
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  border-color: #e5e7eb;
  vertical-align: middle;
}

:deep(.pro-table .p-datatable-tbody > tr:nth-child(even)) {
  background: #f9fafb;
}

:deep(.pro-table .p-datatable-tbody > tr.row-cancelled > td) {
  opacity: 0.6;
  background: #fef2f2 !important;
}

:deep(.pro-table .p-datatable-wrapper::-webkit-scrollbar) {
  height: 5px;
}

:deep(.pro-table .p-datatable-wrapper::-webkit-scrollbar-thumb) {
  background: #93c5fd;
  border-radius: 8px;
}

:deep(.pro-table .p-paginator) {
  padding: 0.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  font-size: 0.8rem;
}

.noreg-badge {
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e3a5f;
  background: #eff6ff;
  padding: 0.15rem 0.4rem;
  border-radius: 1px;
  border: 1px solid #bfdbfe;
}

.nomr-text {
  font-family: monospace;
  font-weight: 600;
  color: #374151;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.patient-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.patient-avatar-sm {
  width: 28px;
  height: 28px;
  font-size: 0.65rem;
}

.patient-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.82rem;
  margin: 0;
  line-height: 1.3;
}

.patient-age {
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0;
}

.nosep-text {
  font-family: monospace;
  font-size: 0.78rem;
  color: #4b5563;
}

.dokter-cell {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.dokter-icon {
  color: #7c3aed;
  font-size: 0.8rem;
}

.poli-badge {
  font-size: 0.78rem;
  font-weight: 600;
  color: #1e40af;
}

.bayar-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}

.bayar-bpjs {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.bayar-umum {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.bayar-waiting {
  background: #ede9fe;
  color: #5b21b6;
  border: 1px solid #ddd6fe;
}

.bayar-ketenagakerjaan {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.bayar-other {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.date-text {
  font-size: 0.78rem;
  color: #4b5563;
  white-space: nowrap;
}

.rawat-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}

.rawat-jalan {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.rawat-inap {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.rawat-igd {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.rawat-other {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-aktif {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.status-batal {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
}

.action-btn {
  width: 30px !important;
  height: 30px !important;
  padding: 0 !important;
}

.mobile-filter {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 1px;
  margin-bottom: 1rem;
}

.filter-row-full {
  width: 100%;
}

.mf-addon {
  flex: 0 0 auto;
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  padding: 0 0.45rem;
}

.mf-datepicker {
  flex: 0 1 auto !important;
  width: auto !important;
}

:deep(.mf-datepicker .p-inputtext) {
  min-width: 78px;
  max-width: 110px;
  font-size: 0.78rem;
  padding: 0.35rem 0.3rem;
}

:deep(.mf-datepicker .p-datepicker-trigger) {
  padding: 0 0.35rem;
}

:deep(.mf-search-input) {
  flex: 1 1 80px;
  min-width: 0;
  font-size: 0.78rem;
}

.quick-date-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.quick-date-btn {
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s;
}

.quick-date-btn:hover {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.quick-date-btn-active {
  background: #1d4ed8;
  color: #fff;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.25);
}

.quick-date-btn-active:hover {
  background: #1e40af;
  border-color: #1e40af;
}

.jenisrawat-filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding-top: 0.25rem;
  border-top: 1px dashed #e5e7eb;
}

.jr-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.jr-radio-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #374151;
  cursor: pointer;
}

.w-full {
  width: 100%;
}

.flex-1 {
  flex: 1;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-mobile {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}

.card-mobile:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-cancelled {
  border-color: #fca5a5;
  opacity: 0.78;
}

.card-mobile-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.6rem;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
}
.card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header-time {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-label-dark {
  font-size: 0.65rem;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-noreg {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.card-nosep {
  font-family: monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 1px 0 0;
  letter-spacing: 0.01em;
}

.card-date {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}
.time-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
}
.time-chip i {
  font-size: 8px;
  opacity: 0.8;
  color: #fff;
}
.time-chip-lbl {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.time-chip-val {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  font-family: monospace;
}
.time-chip--masuk {
  border-color: rgba(134, 239, 172, 0.4);
}
.time-chip--keluar {
  border-color: rgba(253, 186, 116, 0.4);
}
.time-chip-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.25);
}

.mt-1 {
  margin-top: 0.25rem;
}

.text-right {
  text-align: right;
}

.mr-1 {
  margin-right: 0.25rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.card-mobile-body {
  padding: 0.35rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-patient-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.patient-ids-inline {
  font-size: 0.68rem;
  color: #6b7280;
  margin-top: 0.1rem;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.riwayat-bpjs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.65rem;
  cursor: pointer;
  line-height: 1;
  transition:
    background 0.15s,
    color 0.15s;
  flex-shrink: 0;
}
.riwayat-bpjs-btn:hover {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.card-detail-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 3px;
  column-gap: 6px;
  font-size: 0.72rem;
  color: #4b5563;
  line-height: 1.3;
}

.detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-chip i {
  font-size: 0.68rem;
  color: #9ca3af;
}

.detail-chip.mono {
  font-family: monospace;
  color: #374151;
}

.detail-chip-pulang {
  color: #0f766e;
  font-weight: 600;
}

.detail-sep {
  color: #d1d5db;
}

.card-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-bayar-row {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.unclaim-notice {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 0.72rem;
  color: #c2410c;
  font-weight: 500;
}

.sep-batal-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  font-size: 0.62rem;
  color: #1d4ed8;
  font-weight: 500;
}

.card-mobile-footer {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  padding: 0.3rem 0.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.card-btn {
  flex: 1;
  min-width: 60px;
  font-size: 0.75rem !important;
}

.mobile-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 0 0;
  margin-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
}

.page-current {
  font-weight: 700;
  color: #2563eb;
  font-size: 1rem;
}

.page-sep {
  color: #9ca3af;
}

.page-total {
  color: #6b7280;
}

.del-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-weight: 600;
  color: #991b1b;
  font-size: 0.95rem;
}

.del-dialog-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  font-size: 1rem;
}

.del-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.del-dialog-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.text-primary {
  color: #2563eb;
}

.del-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.required-star {
  color: #dc2626;
}

.del-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  display: block;
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.25rem;
}

.empty-sub {
  font-size: 0.8rem;
  margin: 0;
}

.consent-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.consent-dialog-icon {
  width: 38px;
  height: 38px;
  border-radius: 2px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.consent-patient-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  margin-bottom: 0.875rem;
}

.consent-patient-icon {
  color: #d97706;
  font-size: 1rem;
  flex-shrink: 0;
}

.consent-patient-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: #1f2937;
  margin: 0;
}

.consent-patient-meta {
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0;
  font-family: monospace;
}

.consent-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.consent-option-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s,
    background 0.15s,
    box-shadow 0.15s;
  width: 100%;
}

.consent-option-btn:hover {
  border-color: #f59e0b;
  background: #fffbeb;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.15);
}

.consent-option-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.consent-anestesi {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.consent-tindakan {
  background: linear-gradient(135deg, #ec4899, #db2777);
}
.consent-ranap {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.consent-option-text {
  flex: 1;
}

.consent-option-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.consent-option-desc {
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0;
}

.consent-option-arrow {
  color: #9ca3af;
  font-size: 0.75rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .hidden.md\:block {
    display: none !important;
  }

  .md\:hidden {
    display: block !important;
  }
}

@media (min-width: 769px) {
  .hidden.md\:block {
    display: block !important;
  }

  .md\:hidden {
    display: none !important;
  }
}
</style>
