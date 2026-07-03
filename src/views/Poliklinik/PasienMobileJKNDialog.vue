<template>
  <Dialog
    v-model:visible="visibleModel"
    modal
    :style="{ width: isMobile ? '95vw' : '1300px' }"
    :breakpoints="{ '960px': '92vw', '640px': '95vw' }"
    class="mjkn-dialog"
    @show="funcListPasienJKN"
    :pt="{ header: { class: 'mjkn-dialog-header' } }"
  >
    <template #header>
      <div class="mjkn-header">
        <div class="mjkn-header-left">
          <div class="mjkn-header-icon">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <div>
            <div class="mjkn-header-title">Pasien Mobile JKN</div>
            <div class="mjkn-header-sub">Antrian belum terbit SEP</div>
          </div>
        </div>
        <div class="mjkn-header-right">
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal"
            showIcon
            iconDisplay="input"
            class="mjkn-datepicker"
            @date-select="funcListPasienJKN"
          />
          <Button
            icon="pi pi-refresh"
            @click="funcListPasienJKN"
            :loading="loaddataMjkn"
            size="small"
            severity="secondary"
            outlined
            v-tooltip.bottom="'Refresh data'"
          />
        </div>
      </div>
    </template>

    <!-- Summary strip -->
    <div class="mjkn-summary">
      <div class="mjkn-chip chip-total">
        <i class="fas fa-users"></i>
        <div>
          <span class="chip-lbl">Total Antrian</span>
          <span class="chip-val">{{ listPasienJKN.length }}</span>
        </div>
      </div>
      <div class="mjkn-chip chip-aktif">
        <i class="fas fa-check-circle"></i>
        <div>
          <span class="chip-lbl">Aktif</span>
          <span class="chip-val">{{ listPasienJKN.filter(p => p.deleted != 1).length }}</span>
        </div>
      </div>
      <div class="mjkn-chip chip-nonaktif">
        <i class="fas fa-times-circle"></i>
        <div>
          <span class="chip-lbl">Nonaktif</span>
          <span class="chip-val">{{ listPasienJKN.filter(p => p.deleted == 1).length }}</span>
        </div>
      </div>
      <div class="mjkn-chip chip-rujukan">
        <i class="fas fa-file-medical"></i>
        <div>
          <span class="chip-lbl">Rujukan</span>
          <span class="chip-val">{{ listPasienJKN.filter(p => p.jeniskunjunganid == 1).length }}</span>
        </div>
      </div>
      <div class="mjkn-chip chip-kontrol">
        <i class="fas fa-redo"></i>
        <div>
          <span class="chip-lbl">Surat Kontrol</span>
          <span class="chip-val">{{ listPasienJKN.filter(p => p.jeniskunjunganid == 3).length }}</span>
        </div>
      </div>
    </div>

    <ProgressBar mode="indeterminate" style="height: 2px; margin-bottom: 6px" v-if="loaddataMjkn" />

    <!-- Toolbar -->
    <div class="mjkn-toolbar">
      <span class="mjkn-search-wrap">
        <i class="pi pi-search mjkn-search-icon" />
        <InputText
          v-model="globalSearch"
          placeholder="Cari pasien, NOKA, poli..."
          class="mjkn-search"
          size="small"
        />
      </span>
      <div class="mjkn-toolbar-right">
        <span class="mjkn-count-badge">{{ filteredCount }} data</span>
      </div>
    </div>

    <!-- Desktop Table -->
    <DataTable
      v-if="!isMobile"
      v-model:filters="filtersJKN"
      :value="listPasienJKN"
      :globalFilter="globalSearch"
      :globalFilterFields="['nomorkartu','nohp','kodepoli','pasien','namadokter','jeniskunjungan','waktu_checkin','nomorreferensi']"
      paginator
      :rows="15"
      :rowsPerPageOptions="[15, 25, 50, 100]"
      filterDisplay="menu"
      stripedRows
      rowHover
      scrollable
      scrollHeight="480px"
      sortField="nomorkartu"
      :sortOrder="1"
      responsiveLayout="scroll"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      currentPageReportTemplate="{first}–{last} dari {totalRecords}"
      class="mjkn-table p-datatable-sm"
      @filter="onFilter"
    >
      <template #empty>
        <div class="mjkn-empty">
          <i class="fas fa-inbox"></i>
          <span>Tidak ada data antrian</span>
        </div>
      </template>

      <!-- No -->
      <Column header="#" style="width: 2.2rem; text-align:center">
        <template #body="{ index }">
          <span class="row-no">{{ index + 1 }}</span>
        </template>
      </Column>

      <!-- Pasien -->
      <Column field="pasien" header="PASIEN" sortable style="min-width: 180px" filter>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Cari..." class="p-column-filter" />
        </template>
        <template #body="{ data }">
          <div class="cell-pasien">
            <div class="cell-name">{{ data.pasien }}</div>
            <div class="cell-sub"><i class="fas fa-ticket-alt mr-1 text-muted"></i>Antrian: <strong>{{ data.nomorantrianloket || '—' }}</strong></div>
          </div>
        </template>
      </Column>

      <!-- NOKA -->
      <Column field="nomorkartu" header="NOKA" sortable style="min-width: 140px" filter>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" placeholder="Cari NOKA..." class="p-column-filter" />
        </template>
        <template #body="{ data }">
          <span class="cell-mono">{{ data.nomorkartu }}</span>
        </template>
      </Column>

      <!-- No HP -->
      <Column field="nohp" header="NO HP" style="min-width: 110px" filter>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" :options="uniqueOptions('nohp')" optionLabel="label" optionValue="value" @change="filterCallback()" placeholder="HP" class="w-full" />
        </template>
        <template #body="{ data }">
          <span class="cell-mono">{{ data.nohp || '—' }}</span>
        </template>
      </Column>

      <!-- Poli + Dokter -->
      <Column field="kodepoli" header="POLI / DOKTER" sortable style="min-width: 160px" filter>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" :options="uniqueOptions('kodepoli')" optionLabel="label" optionValue="value" @change="filterCallback()" placeholder="Poli" class="w-full" />
        </template>
        <template #body="{ data }">
          <div>
            <div class="cell-poli">{{ data.kodepoli }}</div>
            <div class="cell-sub">{{ data.namadokter }}</div>
          </div>
        </template>
      </Column>

      <!-- Jenis Kunjungan -->
      <Column field="jeniskunjungan" header="JENIS" style="min-width: 110px" filter>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" :options="uniqueOptions('jeniskunjungan')" optionLabel="label" optionValue="value" @change="filterCallback()" placeholder="Jenis" class="w-full" />
        </template>
        <template #body="{ data }">
          <span :class="['jenis-badge', `jenis-${data.jeniskunjunganid}`]">
            <i :class="jenisIcon(data.jeniskunjunganid)"></i>
            {{ data.jeniskunjungan }}
          </span>
        </template>
      </Column>

      <!-- Check-in -->
      <Column field="waktu_checkin" header="CHECK-IN" sortable style="min-width: 100px">
        <template #body="{ data }">
          <span class="cell-time">
            <i class="fas fa-clock mr-1"></i>{{ data.waktu_checkin || '—' }}
          </span>
        </template>
      </Column>

      <!-- No Ref -->
      <Column field="nomorreferensi" header="NO REF" style="min-width: 120px" filter>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect v-model="filterModel.value" :options="uniqueOptions('nomorreferensi')" optionLabel="label" optionValue="value" @change="filterCallback()" placeholder="No Ref" class="w-full" />
        </template>
        <template #body="{ data }">
          <span class="cell-mono">{{ data.nomorreferensi || '—' }}</span>
        </template>
      </Column>

      <!-- Status -->
      <Column field="stts" header="STATUS" style="min-width: 80px">
        <template #body="{ data }">
          <span v-if="data.deleted == 1" class="stts-badge stts-nonaktif">
            <i class="fas fa-times-circle"></i> Nonaktif
          </span>
          <span v-else class="stts-badge stts-aktif">
            <i class="fas fa-check-circle"></i> Aktif
          </span>
        </template>
      </Column>

      <!-- Aksi -->
      <Column header="AKSI" style="width: 130px; text-align:center" frozen alignFrozen="right">
        <template #body="{ data }">
          <Button
            icon="pi pi-send"
            label="Terbitkan"
            @click="TerbitkanSEP(data)"
            :loading="data.loading"
            :disabled="data.deleted == 1"
            size="small"
            class="sep-btn"
            :class="{ 'sep-btn-disabled': data.deleted == 1 }"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Mobile Card View -->
    <div v-if="isMobile" class="mobile-list">
      <div
        v-for="(data, idx) in listPasienJKN"
        :key="idx"
        class="mobile-card"
        :class="{ 'mobile-card-nonaktif': data.deleted == 1 }"
      >
        <div class="mc-head">
          <div class="mc-name">
            <i class="fas fa-user-circle mc-icon"></i>
            <span>{{ data.pasien }}</span>
          </div>
          <span :class="['jenis-badge', `jenis-${data.jeniskunjunganid}`]">
            <i :class="jenisIcon(data.jeniskunjunganid)"></i>
            {{ data.jeniskunjungan }}
          </span>
        </div>
        <div class="mc-body">
          <div class="mc-row"><span>NOKA</span><span>{{ data.nomorkartu }}</span></div>
          <div class="mc-row"><span>No HP</span><span>{{ data.nohp }}</span></div>
          <div class="mc-row"><span>Poli</span><span>{{ data.kodepoli }}</span></div>
          <div class="mc-row"><span>Dokter</span><span>{{ data.namadokter }}</span></div>
          <div class="mc-row"><span>Check-in</span><span>{{ data.waktu_checkin }}</span></div>
          <div class="mc-row"><span>No Ref</span><span>{{ data.nomorreferensi }}</span></div>
          <div class="mc-row"><span>Antrian</span><strong>{{ data.nomorantrianloket }}</strong></div>
        </div>
        <div class="mc-foot">
          <Button
            icon="pi pi-send"
            label="Terbitkan SEP"
            @click="TerbitkanSEP(data)"
            :loading="data.loading"
            :disabled="data.deleted == 1"
            size="small"
            class="sep-btn w-full"
          />
        </div>
      </div>
      <div v-if="listPasienJKN.length === 0 && !loaddataMjkn" class="mjkn-empty">
        <i class="fas fa-inbox"></i>
        <span>Tidak ada data antrian</span>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible'])

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const configStore = useConfigStore()
const toast = useToast()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)

const startDate = ref(new Date())
const listPasienJKN = ref([])
const loaddataMjkn = ref(false)
const isMobile = ref(false)
const globalSearch = ref('')
const filteredCount = ref(0)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const filtersJKN = ref({
  nomorkartu: { value: null, matchMode: FilterMatchMode.CONTAINS },
  nohp: { value: null, matchMode: FilterMatchMode.IN },
  kodepoli: { value: null, matchMode: FilterMatchMode.IN },
  pasien: { value: null, matchMode: FilterMatchMode.CONTAINS },
  namadokter: { value: null, matchMode: FilterMatchMode.IN },
  jeniskunjungan: { value: null, matchMode: FilterMatchMode.IN },
  nomorreferensi: { value: null, matchMode: FilterMatchMode.IN },
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const onFilter = (e) => {
  filteredCount.value = e.filteredValue?.length ?? listPasienJKN.value.length
}

const uniqueOptions = (field) => {
  const values = [...new Set(listPasienJKN.value.map((item) => item[field]))]
  return values.filter(Boolean).map((v) => ({ label: v, value: v }))
}

const jenisIcon = (id) => {
  if (id == 1) return 'fas fa-file-import'
  if (id == 3) return 'fas fa-redo'
  if (id == 4) return 'fas fa-hospital'
  return 'fas fa-user'
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const showSuccess = (message) => toast.add({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 })
const showInfo = (message) => toast.add({ severity: 'info', summary: 'Info', detail: message, life: 3000 })
const showError = (message) => toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })

const funcListPasienJKN = async () => {
  try {
    loaddataMjkn.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/mobil_jkn/getdataantrian_mbjkn/${id_client.value}/${formatDate(startDate.value)}`,
    )
    listPasienJKN.value = response.data.belum_terbit_sep || []
    filteredCount.value = listPasienJKN.value.length
  } catch (error) {
    showError('Gagal memuat data Pasien Mobile JKN')
  } finally {
    loaddataMjkn.value = false
  }
}

const TerbitkanSEP = async (data) => {
  try {
    data.loading = true
    const url = configStore.apiBaseUrl
    const param = {
      id_client: id_client.value,
      nomorreferensi: data.nomorreferensi,
      jenis_kunjungan: data.jeniskunjunganid,
      user_id: user_id.value,
      tglsep: formatDate(startDate.value),
      kd_dokter: data.kodedokter,
      dokterSelected: { KDDOKTER: data.kodedokter },
      kd_poli: data.kodepoli == 'PAR' ? '097' : data.kodepoli,
      kode_booking: data.kodebooking,
    }
    const wich_url =
      data.jeniskunjunganid == 3
        ? `${url}/index.php/api/bpjs_api/TerbitsepDariSuratKontrol`
        : `${url}/index.php/api/bpjs_api/terbitsepDariRujukan`

    const response = await axios.post(wich_url, param)
    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)
      funcListPasienJKN()
    } else {
      showInfo(response.data.metadata.message)
    }
  } catch {
    showError('Gagal menerbitkan SEP')
  } finally {
    data.loading = false
  }
}
</script>

<style scoped>
/* ── Dialog header override ── */
:deep(.mjkn-dialog .p-dialog-header) {
  padding: 0 !important;
  background: linear-gradient(135deg, #0f2d5e 0%, #1a6e8a 100%) !important;
  border-radius: 10px 10px 0 0;
}
:deep(.mjkn-dialog .p-dialog-header-close) {
  color: rgba(255,255,255,0.8) !important;
}
:deep(.mjkn-dialog .p-dialog-header-close:hover) {
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
}
:deep(.mjkn-dialog .p-dialog-content) {
  padding: 12px 14px 10px;
}

/* ── Custom header ── */
.mjkn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  width: 100%;
  flex-wrap: wrap;
}
.mjkn-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mjkn-header-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #fff;
  flex-shrink: 0;
}
.mjkn-header-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}
.mjkn-header-sub {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.2;
}
.mjkn-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
:deep(.mjkn-datepicker .p-datepicker-input) {
  font-size: 0.75rem !important;
  padding: 0.3rem 0.5rem !important;
  height: 28px;
}
:deep(.mjkn-datepicker) {
  height: 28px;
}

/* ── Summary chips ── */
.mjkn-summary {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding: 8px 0 6px;
  margin-bottom: 6px;
}
.mjkn-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 6px;
  flex: 1;
  min-width: 100px;
  border: 1px solid transparent;
}
.mjkn-chip i { font-size: 13px; opacity: 0.75; flex-shrink: 0; }
.chip-lbl {
  display: block;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.72;
  line-height: 1.2;
}
.chip-val {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.chip-total   { background: #dde8f4; border-color: #b2c8dd; color: #162d4e; }
.chip-aktif   { background: #daf0e6; border-color: #9ecfb8; color: #1e5c38; }
.chip-nonaktif{ background: #fde0e0; border-color: #e8a0a0; color: #8a2020; }
.chip-rujukan { background: #d6e8f8; border-color: #9fbfdf; color: #1a3a5f; }
.chip-kontrol { background: #fef0c8; border-color: #e8c96a; color: #6a4a08; }

/* ── Toolbar ── */
.mjkn-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.mjkn-search-wrap {
  position: relative;
  flex: 1;
  max-width: 320px;
}
.mjkn-search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: #94a3b8;
  pointer-events: none;
}
:deep(.mjkn-search.p-inputtext) {
  width: 100%;
  padding-left: 26px !important;
  font-size: 0.75rem !important;
  height: 28px;
  border-radius: 6px;
}
.mjkn-toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mjkn-count-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: #4a7ab5;
  background: #dde8f4;
  border: 1px solid #b2c8dd;
  border-radius: 99px;
  padding: 2px 9px;
}

/* ── Table ── */
:deep(.mjkn-table.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.28rem 0.45rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #e6edf7;
  color: #162d4e;
  border-bottom: 2px solid #b2c8dd;
}
:deep(.mjkn-table.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.18rem 0.45rem;
  font-size: 0.7rem;
  line-height: 1.35;
}
:deep(.mjkn-table.p-datatable .p-datatable-tbody > tr) {
  height: 34px;
}
:deep(.mjkn-table.p-datatable .p-datatable-tbody > tr:hover > td) {
  background: #f0f7ff !important;
}
:deep(.mjkn-table .p-paginator) {
  padding: 4px 8px;
  font-size: 0.72rem;
}

.row-no {
  font-size: 0.62rem;
  color: #94a3b8;
  font-weight: 600;
  display: block;
  text-align: center;
}

/* cell styles */
.cell-pasien { display: flex; flex-direction: column; gap: 1px; }
.cell-name { font-size: 0.72rem; font-weight: 600; color: #1e293b; }
.cell-sub { font-size: 0.62rem; color: #64748b; }
.cell-poli { font-size: 0.7rem; font-weight: 600; color: #1a3a5f; }
.cell-mono { font-size: 0.68rem; font-family: monospace; color: #374151; letter-spacing: 0.02em; }
.cell-time { font-size: 0.68rem; color: #2563eb; white-space: nowrap; }
.text-muted { color: #94a3b8; }

/* jenis badge */
.jenis-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 0.62rem;
  font-weight: 600;
  white-space: nowrap;
}
.jenis-1 { background: #dbeafe; color: #1d4ed8; }
.jenis-3 { background: #fef3c7; color: #92400e; }
.jenis-4 { background: #d1fae5; color: #065f46; }

/* status badge */
.stts-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 0.62rem;
  font-weight: 600;
  white-space: nowrap;
}
.stts-aktif    { background: #d1fae5; color: #065f46; }
.stts-nonaktif { background: #fee2e2; color: #991b1b; }

/* action button */
.sep-btn {
  font-size: 0.68rem !important;
  padding: 0.2rem 0.55rem !important;
  border-radius: 5px !important;
  background: linear-gradient(135deg, #0f2d5e, #1a6e8a) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em;
  transition: opacity 0.15s;
}
.sep-btn:hover:not(:disabled) { opacity: 0.88; }
.sep-btn-disabled,
.sep-btn:disabled { background: #e2e8f0 !important; color: #94a3b8 !important; cursor: not-allowed; }

/* empty state */
.mjkn-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 2.5rem 1rem;
  color: #94a3b8;
  font-size: 0.8rem;
}
.mjkn-empty i { font-size: 2rem; opacity: 0.4; }

/* ── Mobile card list ── */
.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 2px;
}
.mobile-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.mobile-card-nonaktif { opacity: 0.65; }
.mc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: linear-gradient(135deg, #f0f7ff, #e8f4f8);
  border-bottom: 1px solid #e2e8f0;
}
.mc-icon { font-size: 1rem; color: #0ea5e9; margin-right: 6px; }
.mc-name { font-size: 0.82rem; font-weight: 700; color: #1e293b; }
.mc-body {
  padding: 8px 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  row-gap: 3px;
}
.mc-row {
  display: contents;
}
.mc-row > span:first-child {
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.mc-row > span:last-child,
.mc-row > strong {
  font-size: 0.7rem;
  color: #1e293b;
}
.mc-foot {
  padding: 6px 10px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}
</style>
