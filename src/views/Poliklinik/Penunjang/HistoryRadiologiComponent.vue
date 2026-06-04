<template>
  <!-- Main Dialog: Riwayat Radiologi -->
  <Dialog
    v-model:visible="visible"
    :style="{ width: '92vw', maxWidth: '1280px' }"
    modal
    :draggable="false"
    maximizable
    dismissableMask
    @hide="onHide"
    class="rad-dialog"
  >
    <template #header>
      <div class="rad-dlg-header">
        <div class="rad-dlg-header__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div class="rad-dlg-header__text">
          <span class="rad-dlg-header__title">Riwayat Radiologi</span>
          <span class="rad-dlg-header__sub">Citra medis &amp; diagnosa pasien</span>
        </div>
      </div>
    </template>

    <!-- Loading bar -->
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px; border-radius: 0" />

    <!-- Stats Row -->
    <div class="rad-stats">
      <div class="rad-stat-card">
        <div class="rad-stat-card__icon rad-stat-card__icon--blue">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
        </div>
        <div class="rad-stat-card__body">
          <span class="rad-stat-card__label">Total Pemeriksaan</span>
          <span class="rad-stat-card__value">{{ fact.length }}</span>
        </div>
      </div>
      <div class="rad-stat-card">
        <div class="rad-stat-card__icon rad-stat-card__icon--green">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="rad-stat-card__body">
          <span class="rad-stat-card__label">Selesai</span>
          <span class="rad-stat-card__value">{{
            fact.filter((f) => f.STATUS_PROGRESS?.toLowerCase().includes('c')).length
          }}</span>
        </div>
      </div>
      <div class="rad-stat-card">
        <div class="rad-stat-card__icon rad-stat-card__icon--amber">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="rad-stat-card__body">
          <span class="rad-stat-card__label">Dalam Proses</span>
          <span class="rad-stat-card__value">{{
            fact.filter((f) => f.STATUS_PROGRESS?.toLowerCase().includes('m')).length
          }}</span>
        </div>
      </div>
    </div>

    <!-- Search Toolbar -->
    <div class="rad-toolbar">
      <div class="rad-toolbar__left">
        <span class="rad-toolbar__title">Daftar Pemeriksaan</span>
        <Tag :value="`${filteredFact.length} data`" severity="secondary" class="rad-toolbar__tag" />
      </div>
      <div class="rad-toolbar__right">
        <div class="rad-search-wrap">
          <i class="pi pi-search rad-search-icon" />
          <InputText
            v-model="searchQuery"
            placeholder="Cari pemeriksaan, dokter..."
            class="rad-search-input"
          />
          <button v-if="searchQuery" class="rad-search-clear" @click="searchQuery = ''">
            <i class="pi pi-times" />
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="rad-table-wrap">
      <DataTable
        :value="filteredFact"
        paginator
        :rows="10"
        stripedRows
        removableSort
        responsiveLayout="scroll"
        class="rad-datatable"
      >
        <template #empty>
          <div class="rad-empty">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="rad-empty__icon"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>Tidak ada riwayat ditemukan.</p>
          </div>
        </template>

        <Column field="TANGGAL" header="Tanggal" sortable style="width: 130px">
          <template #body="{ data }">
            <div class="rad-date">
              <span class="rad-date__main">{{ formatDisplayDate(data.TANGGAL) }}</span>
              <span class="rad-date__time">{{ formatTime(data.TANGGAL) }} WIB</span>
            </div>
          </template>
        </Column>

        <Column field="NAMA" header="Pemeriksaan" sortable>
          <template #body="{ data }">
            <div class="rad-exam">
              <div class="rad-exam__dot"></div>
              <div>
                <div class="rad-exam__name">{{ data.NAMA }}</div>
                <div class="rad-exam__cat">{{ data.KATEGORI || 'Radiologi' }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="DPJP" header="Dokter &amp; Unit" style="width: 220px">
          <template #body="{ data }">
            <div class="rad-doc">
              <div class="rad-doc__name">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {{ data.DPJP || '—' }}
              </div>
              <div class="rad-doc__unit">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {{ data.POLI_RUANG || '—' }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="NO_REG" header="No. Registrasi" style="width: 140px">
          <template #body="{ data }">
            <span class="rad-noreg">{{ data.TRANS || '—' }}</span>
          </template>
        </Column>

        <Column field="STATUS_PROGRESS" header="Status" style="width: 130px">
          <template #body="{ data }">
            <span :class="['rad-badge', getBadgeClass(data.STATUS_PROGRESS)]">
              <span class="rad-badge__dot"></span>
              {{ data.STATUS_PROGRESS || '—' }}
            </span>
          </template>
        </Column>

        <Column header="" style="width: 60px; text-align: center">
          <template #body="{ data }">
            <Button
              icon="pi pi-file-edit"
              size="small"
              text
              rounded
              severity="info"
              title="Lihat Detail"
              @click="get_details_radiologi(data.TRANS)"
              class="rad-action-btn"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <div class="rad-dlg-footer">
        <span class="rad-dlg-footer__note"
          >Data bersumber dari sistem informasi radiologi rumah sakit.</span
        >
        <Button
          label="Keluar"
          icon="pi pi-times"
          severity="danger"
          outlined
          size="small"
          @click="visible = false"
        />
      </div>
    </template>
  </Dialog>

  <!-- Detail Dialog -->
  <Dialog
    v-model:visible="showDetails"
    :style="{ width: '96vw', maxWidth: '1100px' }"
    modal
    :draggable="false"
    class="rad-detail-dialog"
  >
    <template #header>
      <div class="rad-detail-header">
        <div class="rad-detail-header__badge">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div>
          <div class="rad-detail-header__title">Hasil Bacaan Radiologi</div>
          <div class="rad-detail-header__sub">Ekspertise &amp; lampiran citra medis</div>
        </div>
      </div>
    </template>

    <div v-if="details_radiologi && details_radiologi.pasien" class="rad-detail-body">
      <!-- Patient Banner -->
      <div class="rad-patient-banner">
        <div class="rad-patient-banner__avatar">
          {{ details_radiologi.pasien.NAMA?.charAt(0) || 'P' }}
        </div>
        <div class="rad-patient-banner__info">
          <div class="rad-patient-banner__name">{{ details_radiologi.pasien.NAMA }}</div>
          <div class="rad-patient-banner__meta">
            <span class="rad-chip">{{ details_radiologi.pasien.NOMR }}</span>
            <span class="rad-chip">{{ details_radiologi.pasien.JENISKELAMIN }}</span>
            <span class="rad-chip">{{ details_radiologi.pasien.USIA }} Tahun</span>
          </div>
        </div>
        <div class="rad-patient-banner__doctor">
          <div class="rad-patient-banner__doctor-label">Dokter Pemeriksa</div>
          <div class="rad-patient-banner__doctor-name">{{ details_radiologi.pasien.DPJP }}</div>
          <div class="rad-patient-banner__doctor-unit">
            {{ details_radiologi.pasien.POLI_RUANG }}
          </div>
        </div>
      </div>

      <!-- Result Cards -->
      <div class="rad-results">
        <div
          v-for="(item, index) in details_radiologi.response"
          :key="index"
          class="rad-result-card"
        >
          <div class="rad-result-card__header">
            <div class="rad-result-card__title-row">
              <div class="rad-result-card__num">{{ String(index + 1).padStart(2, '0') }}</div>
              <div class="rad-result-card__title-info">
                <div class="rad-result-card__name">{{ item.NAMA }}</div>
                <div class="rad-result-card__date">Permintaan: {{ item.TANGGAL_REQ }}</div>
              </div>
              <Tag
                :value="item.STATUS_PROGRESS || 'Proses'"
                :severity="item.STATUS_PROGRESS?.toLowerCase().includes('c') ? 'success' : 'warn'"
                class="rad-result-card__status"
              />
            </div>
          </div>

          <div class="rad-result-card__body">
            <!-- Expertise -->
            <div class="rad-expertise">
              <div class="rad-expertise__label">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Ekspertise / Hasil Bacaan
              </div>
              <div
                class="rad-expertise__content"
                v-html="
                  item.HASIL_BACA || '<em style=\'color:#9ca3af\'>Hasil bacaan belum tersedia.</em>'
                "
              ></div>
            </div>

            <!-- Attachments -->
            <div v-if="item.attachment?.length" class="rad-attachments">
              <div class="rad-attachments__label">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Lampiran Citra Medis ({{ item.attachment.length }})
              </div>
              <div class="rad-attachments__grid">
                <div v-for="img in item.attachment" :key="img.id" class="rad-img-card">
                  <div class="rad-img-card__frame">
                    <Image
                      :src="img.link_img"
                      alt="Radiology"
                      preview
                      imageStyle="width:100%;height:100%;object-fit:cover;cursor:pointer;"
                    />
                  </div>
                  <div class="rad-img-card__caption">{{ img.caption_file }}</div>
                </div>
              </div>
            </div>

            <div v-if="!item.attachment?.length" class="rad-no-attachment">
              <i class="pi pi-image" style="font-size: 1.5rem; color: var(--surface-300)" />
              <span>Tidak ada lampiran gambar.</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="rad-detail-footer">
        <span class="rad-detail-footer__info">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Data bersifat konfidensial — hanya untuk keperluan klinis.
        </span>
        <Button
          label="Selesai"
          icon="pi pi-check"
          severity="success"
          outlined
          size="small"
          @click="showDetails = false"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  datapasien: { type: Object, required: true, validator: (v) => v && typeof v === 'object' },
})
const emit = defineEmits(['update:modelValue'])

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const loading = ref(false)
const fact = ref([])
const showDetails = ref(false)
const details_radiologi = ref(null)
const searchQuery = ref('')

const filteredFact = computed(() => {
  if (!searchQuery.value.trim()) return fact.value
  const q = searchQuery.value.toLowerCase()
  return fact.value.filter(
    (f) =>
      f.NAMA?.toLowerCase().includes(q) ||
      f.DPJP?.toLowerCase().includes(q) ||
      f.STATUS_PROGRESS?.toLowerCase().includes(q) ||
      f.TRANS?.toLowerCase().includes(q) ||
      f.POLI_RUANG?.toLowerCase().includes(q),
  )
})

watch(visible, (val) => {
  if (val) {
    fetchData()
  }
})

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/transaksi_pasien/get_data_penunjang_pasien_v2/`,
      {
        id_client: id_client.value,
        user_id: user_id.value,
        nomr: props.datapasien?.NOMR,
        kategori: 'RADIOLOGI',
        mode: 3,
      },
    )
    if (response.data.code == 200) {
      fact.value = response.data.response
    } else {
      showWarning('Tidak ada data ditemukan.')
    }
  } catch (error) {
    console.error(error)
    showError('Gagal memuat data radiologi.')
  } finally {
    loading.value = false
  }
}

const get_details_radiologi = async (no_receipt) => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl
    const response = await axios.post(`${url}/index.php/api/sales/get_detail_radiologi_v2`, {
      user_id: user_id.value,
      no_receipt,
      mode: 1,
      id_client: id_client.value,
    })
    details_radiologi.value = response.data
    showDetails.value = true
  } catch (error) {
    console.error(error)
    showError('Gagal memuat detail radiologi.')
  } finally {
    loading.value = false
  }
}

const getBadgeClass = (status) => {
  if (!status) return 'rad-badge--default'
  const s = status.toLowerCase()
  if (s.includes('c')) return 'rad-badge--success'
  if (s.includes('m')) return 'rad-badge--warning'
  return 'rad-badge--default'
}

const onHide = () => {
  fact.value = []
  searchQuery.value = ''
}

const formatDisplayDate = (date) => {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return isNaN(d)
      ? '—'
      : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

const formatTime = (date) => {
  if (!date) return '—'
  try {
    const d = new Date(date)
    return isNaN(d) ? '—' : d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
const showWarning = (msg) =>
  toast.add({ severity: 'warn', summary: 'Peringatan', detail: msg, life: 4000 })
</script>

<style scoped>
/* ===========================
   MAIN DIALOG
=========================== */
.rad-dialog :deep(.p-dialog-header) {
  background: var(--surface-card);
  padding: 1rem 1.25rem 0.875rem;
  border-bottom: 1px solid var(--surface-border);
}
.rad-dialog :deep(.p-dialog-content) {
  background: var(--surface-ground);
  padding: 1.125rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rad-dialog :deep(.p-dialog-footer) {
  background: var(--surface-card);
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--surface-border);
}

/* Header */
.rad-dlg-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rad-dlg-header__icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #1a56db14;
  color: #1a56db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rad-dlg-header__title {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: -0.01em;
}
.rad-dlg-header__sub {
  display: block;
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 1px;
}

/* Stats */
.rad-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.rad-stat-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: box-shadow 0.18s;
}
.rad-stat-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}
.rad-stat-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rad-stat-card__icon--blue {
  background: #1a56db14;
  color: #1a56db;
}
.rad-stat-card__icon--green {
  background: #05855114;
  color: #057a55;
}
.rad-stat-card__icon--amber {
  background: #d9770614;
  color: #b45309;
}
.rad-stat-card__label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-color-secondary);
  margin-bottom: 3px;
}
.rad-stat-card__value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
  letter-spacing: -0.02em;
}

/* Search Toolbar */
.rad-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  padding: 10px 14px;
}
.rad-toolbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rad-toolbar__title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: -0.01em;
}
.rad-toolbar__tag :deep(.p-tag) {
  font-size: 10px;
  padding: 2px 7px;
}
.rad-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rad-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.rad-search-icon {
  position: absolute;
  left: 9px;
  font-size: 11px;
  color: var(--text-color-secondary);
  pointer-events: none;
  z-index: 1;
}
.rad-search-input {
  padding-left: 28px !important;
  padding-right: 28px !important;
  height: 32px;
  font-size: 12px;
  width: 220px;
  border-radius: 7px;
}
.rad-search-clear {
  position: absolute;
  right: 7px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color-secondary);
  font-size: 10px;
  display: flex;
  align-items: center;
  padding: 0;
  line-height: 1;
}
.rad-search-clear:hover {
  color: var(--text-color);
}

/* Table */
.rad-table-wrap {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  overflow: hidden;
}
.rad-datatable :deep(.p-datatable-thead > tr > th) {
  background: #eef2fb !important;
  color: #374151;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 10px 14px;
  border-bottom: 1px solid #dce6f8 !important;
}
.rad-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 11px 14px;
  border-bottom: 1px solid var(--surface-border) !important;
  vertical-align: middle;
}
.rad-datatable :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none !important;
}
.rad-datatable :deep(.p-datatable-tbody > tr.p-row-odd > td) {
  background: #f8faff;
}
.rad-datatable :deep(.p-datatable-tbody > tr:hover > td) {
  background: #eef2fb !important;
}
.rad-datatable :deep(.p-paginator) {
  background: var(--surface-ground) !important;
  border-top: 1px solid var(--surface-border);
  padding: 8px 14px;
  font-size: 12px;
}

/* Table cells */
.rad-date__main {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
}
.rad-date__time {
  display: block;
  font-size: 10px;
  color: var(--text-color-secondary);
  margin-top: 2px;
}

.rad-exam {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.rad-exam__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1a56db;
  margin-top: 5px;
  flex-shrink: 0;
}
.rad-exam__name {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-color);
  line-height: 1.4;
}
.rad-exam__cat {
  font-size: 10px;
  color: var(--text-color-secondary);
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rad-doc {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.rad-doc__name {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color);
}
.rad-doc__name svg {
  color: #1a56db;
  flex-shrink: 0;
}
.rad-doc__unit {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-color-secondary);
}

.rad-noreg {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: var(--text-color-secondary);
  background: var(--surface-ground);
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid var(--surface-border);
}

/* Badge */
.rad-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px 3px 7px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.rad-badge__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.rad-badge--success {
  background: #d1fae5;
  color: #065f46;
}
.rad-badge--success .rad-badge__dot {
  background: #10b981;
}
.rad-badge--warning {
  background: #fef3c7;
  color: #92400e;
}
.rad-badge--warning .rad-badge__dot {
  background: #f59e0b;
}
.rad-badge--default {
  background: var(--surface-200);
  color: var(--text-color-secondary);
}
.rad-badge--default .rad-badge__dot {
  background: var(--text-color-secondary);
}

/* Action button */
.rad-action-btn :deep(.p-button) {
  width: 30px;
  height: 30px;
}

/* Empty */
.rad-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
}
.rad-empty__icon {
  color: var(--surface-300);
  margin-bottom: 10px;
}
.rad-empty p {
  font-size: 13px;
  color: var(--text-color-secondary);
}

/* Footer */
.rad-dlg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}
.rad-dlg-footer__note {
  font-size: 10.5px;
  color: var(--text-color-secondary);
  font-style: italic;
}

/* ===========================
   DETAIL DIALOG
=========================== */
.rad-detail-dialog :deep(.p-dialog-header) {
  background: var(--surface-card);
  padding: 1rem 1.375rem 0.875rem;
  border-bottom: 1px solid var(--surface-border);
}
.rad-detail-dialog :deep(.p-dialog-content) {
  background: var(--surface-ground);
  padding: 0;
}
.rad-detail-dialog :deep(.p-dialog-footer) {
  background: var(--surface-card);
  padding: 0.75rem 1.375rem;
  border-top: 1px solid var(--surface-border);
}

/* Detail header */
.rad-detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rad-detail-header__badge {
  width: 32px;
  height: 32px;
  background: #1a56db14;
  color: #1a56db;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rad-detail-header__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: -0.01em;
}
.rad-detail-header__sub {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 1px;
}

/* Detail body */
.rad-detail-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Patient banner */
.rad-patient-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 1.125rem 1.375rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}
.rad-patient-banner__avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1a56db22, #1a56db44);
  color: #1a56db;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid #1a56db30;
}
.rad-patient-banner__info {
  flex: 1;
}
.rad-patient-banner__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 5px;
  letter-spacing: -0.01em;
}
.rad-patient-banner__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.rad-chip {
  font-size: 10.5px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--surface-ground);
  color: var(--text-color-secondary);
  border: 1px solid var(--surface-border);
}
.rad-patient-banner__doctor {
  text-align: right;
  flex-shrink: 0;
}
.rad-patient-banner__doctor-label {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-color-secondary);
  margin-bottom: 3px;
}
.rad-patient-banner__doctor-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a56db;
}
.rad-patient-banner__doctor-unit {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 2px;
}

/* Results */
.rad-results {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.rad-result-card {
  border-bottom: 1px solid var(--surface-border);
}
.rad-result-card:last-child {
  border-bottom: none;
}

.rad-result-card__header {
  padding: 1rem 1.375rem 0.875rem;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}
.rad-result-card__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rad-result-card__title-info {
  flex: 1;
}
.rad-result-card__status {
  margin-left: auto;
}
.rad-result-card__num {
  font-size: 24px;
  font-weight: 800;
  color: var(--surface-border);
  letter-spacing: -0.04em;
  line-height: 1;
  min-width: 32px;
  font-variant-numeric: tabular-nums;
}
.rad-result-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: -0.01em;
}
.rad-result-card__date {
  font-size: 11px;
  color: var(--text-color-secondary);
  margin-top: 2px;
}

.rad-result-card__body {
  padding: 1.125rem 1.375rem;
  background: var(--surface-ground);
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

/* Expertise */
.rad-expertise__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-color-secondary);
  margin-bottom: 8px;
}
.rad-expertise__content {
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-color);
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-left: 3px solid #1a56db;
  border-radius: 0 7px 7px 0;
  padding: 12px 14px;
  white-space: pre-line;
  min-height: 60px;
}

/* Attachments */
.rad-attachments__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-color-secondary);
  margin-bottom: 10px;
}
.rad-attachments__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.rad-img-card {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
  background: #0a0a0a;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.rad-img-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
}
.rad-img-card__frame {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rad-img-card__caption {
  padding: 6px 10px;
  font-size: 10px;
  color: #9ca3af;
  text-align: center;
  background: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid #1f2937;
}

/* No attachment placeholder */
.rad-no-attachment {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 1.5rem 0;
  color: var(--text-color-secondary);
  font-size: 11px;
}

/* Detail footer */
.rad-detail-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}
.rad-detail-footer__info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: var(--text-color-secondary);
  font-style: italic;
}
</style>
