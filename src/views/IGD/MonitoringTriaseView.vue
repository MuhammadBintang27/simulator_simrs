<template>
  <div class="content">
    <Toast />

    <!-- ══ PRINT HEADER ══ -->
    <div class="print-kop no-screen">
      <div class="print-kop-title">MONITORING DATA TRIASE IGD</div>
      <div class="print-kop-sub">Tanggal: {{ formatDisplayDate(selectedDate) }}</div>
      <Divider />
    </div>

    <!-- ══ PAGE TOOLBAR ══ -->
    <Toolbar class="mb-2 no-print">
      <template #start>
        <div class="toolbar-start">
          <i class="fas fa-ambulance toolbar-ico"></i>
          <div>
            <div class="toolbar-title">Monitoring Data Triase IGD</div>
            <div class="toolbar-sub">Instalasi Gawat Darurat — Data Triase per Tanggal</div>
          </div>
        </div>
      </template>
      <template #end>
        <div class="toolbar-end">
          <Tag v-if="list.length > 0" :value="`${list.length} pasien`" />
          <Button
            icon="pi pi-print"
            label="Cetak"
            size="small"
            severity="secondary"
            :disabled="list.length === 0"
            @click="doPrint"
          />
        </div>
      </template>
    </Toolbar>

    <!-- ══ STAT ROW ══ -->
    <div class="stat-row mb-2">
      <div class="stat-card">
        <i class="fas fa-users stat-ico"></i>
        <div>
          <div class="stat-val">{{ list.length }}</div>
          <div class="stat-lbl">Total Pasien</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-check-circle stat-ico" style="color: var(--p-green-500)"></i>
        <div>
          <div class="stat-val" style="color: var(--p-green-500)">{{ jumlahVerif }}</div>
          <div class="stat-lbl">Sudah Verif</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-clock stat-ico" style="color: var(--p-orange-500)"></i>
        <div>
          <div class="stat-val" style="color: var(--p-orange-500)">{{ jumlahBelumVerif }}</div>
          <div class="stat-lbl">Belum Verif</div>
        </div>
      </div>
      <div class="stat-card">
        <i class="pi pi-percentage stat-ico" style="color: var(--p-primary-color)"></i>
        <div>
          <div class="stat-val" style="color: var(--p-primary-color)">{{ persenVerif }}%</div>
          <div class="stat-lbl">Terverifikasi</div>
        </div>
      </div>
    </div>

    <!-- ══ FILTER ══ -->
    <Panel header="Filter &amp; Pencarian" toggleable class="mb-2">
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-lbl">Tanggal</label>
          <DatePicker
            v-model="selectedDate"
            dateFormat="dd/mm/yy"
            placeholder="Pilih tanggal..."
            class="w-full"
          />
        </div>
        <div class="filter-group filter-group-grow">
          <label class="filter-lbl">Cari</label>
          <InputText
            v-model="filterKeyword"
            placeholder="No. MR / DPJP / Keterangan..."
            class="w-full"
          />
        </div>
        <div class="filter-group">
          <label class="filter-lbl">Status Verifikasi</label>
          <Select
            v-model="filterVerif"
            :options="verifFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="w-full"
            showClear
          />
        </div>
        <div class="filter-group filter-group-ket">
          <label class="filter-lbl">
            Keterangan / Disposisi
            <Badge
              v-if="filterKeterangan.length > 0"
              :value="filterKeterangan.length"
              severity="success"
              style="font-size: 9px; min-width: 16px; height: 16px"
            />
          </label>
          <div class="ket-wrap">
            <span
              v-if="keteranganOptions.length === 0"
              style="font-size: 11px; color: var(--p-text-muted-color); font-style: italic"
            >
              Muat data terlebih dahulu
            </span>
            <label
              v-for="opt in keteranganOptions"
              :key="opt.value"
              class="ket-chip"
              :class="{ 'ket-chip-active': filterKeterangan.includes(opt.value) }"
            >
              <Checkbox v-model="filterKeterangan" :value="opt.value" size="small" />
              <span>{{ opt.label }}</span>
              <Badge
                :value="String(list.filter((d) => d.keterangan === opt.value).length)"
                severity="secondary"
                style="font-size: 9px"
              />
            </label>
          </div>
        </div>
        <div class="filter-actions">
          <Button icon="pi pi-search" label="Cari" :loading="loading" @click="fetchData" class="filter-btn-cari" />
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            v-tooltip.top="'Reset'"
            @click="resetFilter"
          />
        </div>
      </div>
    </Panel>

    <!-- ══ TAB BAR ══ -->
    <div class="tab-bar mb-2">
      <Button
        label="Detail Pasien"
        icon="pi pi-list"
        :severity="activeTab === 'detail' ? 'primary' : 'secondary'"
        :outlined="activeTab !== 'detail'"
        size="small"
        class="tab-btn"
        @click="activeTab = 'detail'"
      />
      <Button
        label="Summary Dokter"
        icon="pi pi-chart-bar"
        :severity="activeTab === 'summary' ? 'primary' : 'secondary'"
        :outlined="activeTab !== 'summary'"
        size="small"
        class="tab-btn"
        @click="activeTab = 'summary'"
      />
    </div>

    <!-- ══ TAB: DETAIL ══ -->
    <div v-if="activeTab === 'detail'">
      <!-- Desktop DataTable -->
      <DataTable
        v-if="!isMobile"
        :value="filteredList"
        rowHover
        scrollable
        scrollHeight="62vh"
        size="small"
        :paginator="true"
        :rows="20"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 20, 50]"
        :rowClass="rowClass"
        showGridlines
      >
        <template #header>
          <div class="dt-header">
            <span style="font-weight: 700; font-size: 13px">
              <i class="pi pi-list me-1"></i>Daftar Pasien Triase
              <Tag
                :value="formatDisplayDate(selectedDate)"
                severity="secondary"
                style="font-size: 10px; margin-left: 6px"
              />
            </span>
            <Tag
              :value="`${filteredList.length}${filteredList.length !== list.length ? ' / ' + list.length : ''} pasien`"
              severity="info"
              style="font-size: 10px"
            />
          </div>
        </template>
        <template #empty>
          <div class="dt-empty">
            <i class="fas fa-ambulance" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px"></i>
            <div style="font-weight: 600">Tidak ada data triase</div>
            <small>Pilih tanggal dan klik Cari untuk memuat data</small>
          </div>
        </template>

        <Column header="#" style="width: 52px">
          <template #body="{ index }">
            <span style="font-size: 11px; font-weight: 600; color: var(--p-text-muted-color)">{{ index + 1 }}</span>
          </template>
        </Column>
        <Column field="NOMR" header="NO. REKAM MEDIS" style="width: 148px">
          <template #body="{ data }">
            <Tag :value="data.NOMR || '-'" severity="secondary" style="font-family: monospace; font-size: 11px; font-weight: 700" />
          </template>
        </Column>
        <Column field="dpjp" header="DPJP / DOKTER" style="min-width: 220px">
          <template #body="{ data }">
            <div style="display: flex; align-items: center; gap: 8px">
              <Avatar
                :label="dpjpInitial(data.dpjp)"
                shape="circle"
                size="small"
                style="background: var(--p-primary-100); color: var(--p-primary-700); font-size: 10px; font-weight: 700"
              />
              <span style="font-size: 12px; font-weight: 600">{{ data.dpjp || '—' }}</span>
            </div>
          </template>
        </Column>
        <Column field="keterangan" header="KETERANGAN / DISPOSISI" style="min-width: 240px">
          <template #body="{ data }">
            <span v-if="data.keterangan" style="font-size: 12px">
              <i class="pi pi-arrow-right me-1" style="font-size: 9px; color: var(--p-primary-color)"></i>
              {{ data.keterangan }}
            </span>
            <span v-else style="font-size: 11px; color: var(--p-text-muted-color); font-style: italic">Belum ada keterangan</span>
          </template>
        </Column>
        <Column field="telah_verif" header="STATUS VERIFIKASI" style="width: 200px">
          <template #body="{ data }">
            <Tag v-if="data.telah_verif === '1' || data.telah_verif === 1" value="Sudah Diverifikasi" severity="success" icon="pi pi-check" style="font-size: 11px" />
            <Tag v-else-if="data.telah_verif === '2' || data.telah_verif === 2" value="Belum Diinput Dokter" severity="warn" icon="pi pi-exclamation-triangle" style="font-size: 11px" />
            <Tag v-else value="Belum Diverifikasi" severity="danger" icon="pi pi-clock" style="font-size: 11px" />
          </template>
        </Column>
      </DataTable>

      <!-- Mobile Card List -->
      <div v-else class="mobile-detail">
        <div class="mobile-dt-header">
          <span class="mobile-dt-title"><i class="pi pi-list"></i> Daftar Pasien Triase</span>
          <Tag
            :value="`${filteredList.length}${filteredList.length !== list.length ? '/' + list.length : ''} pasien`"
            severity="info"
            style="font-size: 10px"
          />
        </div>

        <div v-if="filteredList.length === 0" class="mobile-empty">
          <i class="fas fa-ambulance" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px"></i>
          <div style="font-weight: 600">Tidak ada data triase</div>
          <small>Pilih tanggal dan klik Cari untuk memuat data</small>
        </div>

        <div
          v-for="(data, i) in mobilePaginatedList"
          :key="i"
          class="mc"
          :class="rowClass(data)"
        >
          <!-- baris 1: nomor + NOMR + status -->
          <div class="mc-r1">
            <span class="mc-num">{{ (mobilePage - 1) * mobilePageSize + i + 1 }}</span>
            <span class="mc-nomr-txt">{{ data.NOMR || '-' }}</span>
            <span
              class="mc-dot"
              :class="{
                'mc-dot-ok':   data.telah_verif === '1' || data.telah_verif === 1,
                'mc-dot-warn': data.telah_verif === '2' || data.telah_verif === 2,
                'mc-dot-err':  data.telah_verif !== '1' && data.telah_verif !== 1 && data.telah_verif !== '2' && data.telah_verif !== 2,
              }"
            ></span>
            <span class="mc-status-txt"
              :class="{
                'txt-ok':   data.telah_verif === '1' || data.telah_verif === 1,
                'txt-warn': data.telah_verif === '2' || data.telah_verif === 2,
                'txt-err':  data.telah_verif !== '1' && data.telah_verif !== 1 && data.telah_verif !== '2' && data.telah_verif !== 2,
              }"
            >{{ data.telah_verif === '1' || data.telah_verif === 1 ? 'Verif' : data.telah_verif === '2' || data.telah_verif === 2 ? 'Blm Input' : 'Blm Verif' }}</span>
          </div>
          <!-- baris 2: dpjp · keterangan -->
          <div class="mc-r2">
            <span class="mc-dpjp-name">{{ data.dpjp || '—' }}</span>
            <span v-if="data.keterangan" class="mc-ket"> · {{ data.keterangan }}</span>
            <span v-else class="mc-ket mc-ket-empty"> · —</span>
          </div>
        </div>

        <!-- Mobile Pagination -->
        <div v-if="mobilePageCount > 1" class="mobile-pager">
          <Button icon="pi pi-angle-double-left" text size="small" :disabled="mobilePage === 1" @click="mobilePage = 1" />
          <Button icon="pi pi-angle-left" text size="small" :disabled="mobilePage === 1" @click="mobilePage--" />
          <span class="mobile-pager-info">{{ mobilePage }} / {{ mobilePageCount }}</span>
          <Button icon="pi pi-angle-right" text size="small" :disabled="mobilePage >= mobilePageCount" @click="mobilePage++" />
          <Button icon="pi pi-angle-double-right" text size="small" :disabled="mobilePage >= mobilePageCount" @click="mobilePage = mobilePageCount" />
        </div>
      </div>
    </div>

    <!-- ══ TAB: SUMMARY ══ -->
    <div v-if="activeTab === 'summary'">
      <!-- Desktop DataTable -->
      <DataTable
        v-if="!isMobile"
        :value="summaryDokter"
        rowHover
        size="small"
        sortField="total"
        :sortOrder="-1"
        showGridlines
      >
        <template #header>
          <div class="dt-header">
            <span style="font-weight: 700; font-size: 13px">
              <i class="pi pi-chart-bar me-1"></i>Summary per Dokter / DPJP
              <Tag :value="formatDisplayDate(selectedDate)" severity="secondary" style="font-size: 10px; margin-left: 6px" />
            </span>
            <Tag :value="`${summaryDokter.length} dokter`" severity="info" style="font-size: 10px" />
          </div>
        </template>
        <template #empty>
          <div class="dt-empty">
            <i class="pi pi-chart-bar" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px"></i>
            <div style="font-weight: 600">Tidak ada data</div>
            <small>Pilih tanggal dan klik Cari untuk memuat data</small>
          </div>
        </template>

        <Column header="#" style="width: 52px">
          <template #body="{ index }">
            <span style="font-size: 11px; font-weight: 600; color: var(--p-text-muted-color)">{{ index + 1 }}</span>
          </template>
        </Column>
        <Column field="dpjp" header="DOKTER / DPJP" sortable style="min-width: 220px">
          <template #body="{ data }">
            <div style="display: flex; align-items: center; gap: 8px">
              <Avatar :label="dpjpInitial(data.dpjp)" shape="circle" size="small" style="background: var(--p-primary-100); color: var(--p-primary-700); font-size: 10px; font-weight: 700" />
              <span style="font-size: 12px; font-weight: 600">{{ data.dpjp || '—' }}</span>
            </div>
          </template>
        </Column>
        <Column field="total" header="TOTAL" sortable style="width: 110px; text-align: center">
          <template #body="{ data }">
            <Tag :value="String(data.total)" severity="secondary" style="font-weight: 700; min-width: 40px; justify-content: center" />
          </template>
        </Column>
        <Column field="verif" header="SUDAH VERIF" sortable style="width: 130px; text-align: center">
          <template #body="{ data }">
            <Tag :value="String(data.verif)" severity="success" style="font-weight: 700; min-width: 40px; justify-content: center" />
          </template>
        </Column>
        <Column field="belum" header="BELUM VERIF" sortable style="width: 130px; text-align: center">
          <template #body="{ data }">
            <Tag :value="String(data.belum)" severity="danger" style="font-weight: 700; min-width: 40px; justify-content: center" />
          </template>
        </Column>
        <Column field="persen" header="% VERIFIKASI" sortable style="min-width: 160px">
          <template #body="{ data }">
            <div style="display: flex; align-items: center; gap: 8px">
              <ProgressBar :value="data.persen" style="flex: 1; height: 8px" :showValue="false" :pt="{ value: { style: { background: progressColor(data.persen) } } }" />
              <span style="font-size: 11px; font-weight: 700; min-width: 34px; text-align: right; color: var(--p-primary-color)">{{ data.persen }}%</span>
            </div>
          </template>
        </Column>

        <ColumnGroup type="footer">
          <Row>
            <Column footer="TOTAL KESELURUHAN" :colspan="2" />
            <Column :footer="String(list.length)" />
            <Column :footer="String(jumlahVerif)" />
            <Column :footer="String(jumlahBelumVerif)" />
            <Column :footer="persenVerif + '%'" />
          </Row>
        </ColumnGroup>
      </DataTable>

      <!-- Mobile Summary Cards -->
      <div v-else class="mobile-summary">
        <div class="mobile-dt-header">
          <span class="mobile-dt-title"><i class="pi pi-chart-bar"></i> Summary per Dokter</span>
          <Tag :value="`${summaryDokter.length} dokter`" severity="info" style="font-size: 10px" />
        </div>

        <div v-if="summaryDokter.length === 0" class="mobile-empty">
          <i class="pi pi-chart-bar" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px"></i>
          <div style="font-weight: 600">Tidak ada data</div>
          <small>Pilih tanggal dan klik Cari untuk memuat data</small>
        </div>

        <!-- Total bar -->
        <div v-if="summaryDokter.length > 0" class="ms-total-bar">
          <span class="ms-total-item">Total <b>{{ list.length }}</b></span>
          <span class="ms-sep">|</span>
          <span class="ms-total-item" style="color: var(--p-green-600)">Verif <b>{{ jumlahVerif }}</b></span>
          <span class="ms-sep">|</span>
          <span class="ms-total-item" style="color: var(--p-red-500)">Blm <b>{{ jumlahBelumVerif }}</b></span>
          <span class="ms-sep">|</span>
          <span class="ms-total-item" style="color: var(--p-primary-color)"><b>{{ persenVerif }}%</b></span>
        </div>

        <!-- Per-doctor compact rows -->
        <div v-for="(data, i) in summaryDokter" :key="i" class="ms-row">
          <div class="ms-row-main">
            <span class="ms-num">{{ i + 1 }}</span>
            <span class="ms-av">{{ dpjpInitial(data.dpjp) }}</span>
            <span class="ms-name">{{ data.dpjp || '—' }}</span>
            <span class="ms-badges">
              <span class="ms-badge ms-badge-total">{{ data.total }}</span>
              <span class="ms-badge ms-badge-ok">{{ data.verif }}</span>
              <span class="ms-badge ms-badge-err">{{ data.belum }}</span>
              <span class="ms-badge ms-badge-pct">{{ data.persen }}%</span>
            </span>
          </div>
          <ProgressBar :value="data.persen" style="height: 4px; border-radius: 0 0 4px 4px" :showValue="false" :pt="{ value: { style: { background: progressColor(data.persen) } } }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'
import Panel from 'primevue/panel'
import Divider from 'primevue/divider'
import ProgressBar from 'primevue/progressbar'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const selectedDate = ref(new Date())
const loading = ref(false)
const list = ref([])
const filterKeyword = ref('')
const filterVerif = ref(null)
const filterKeterangan = ref([])
const activeTab = ref('detail')

const isMobile = ref(window.innerWidth < 640)
const mobilePageSize = 15
const mobilePage = ref(1)

const onResize = () => {
  isMobile.value = window.innerWidth < 640
}

const verifFilterOptions = [
  { label: 'Sudah Diverifikasi', value: '1' },
  { label: 'Belum Diverifikasi', value: '0' },
  { label: 'Belum Diinput Dokter', value: '2' },
]

const keteranganOptions = computed(() => {
  const unique = [...new Set(list.value.map((d) => d.keterangan).filter(Boolean))].sort()
  return unique.map((v) => ({ label: v, value: v }))
})

const jumlahVerif = computed(
  () => list.value.filter((x) => x.telah_verif === '1' || x.telah_verif === 1).length,
)
const jumlahBelumVerif = computed(
  () => list.value.filter((x) => x.telah_verif !== '1' && x.telah_verif !== 1).length,
)
const persenVerif = computed(() => {
  if (!list.value.length) return 0
  return Math.round((jumlahVerif.value / list.value.length) * 100)
})

const filteredList = computed(() => {
  let data = list.value
  const kw = filterKeyword.value.toLowerCase().trim()
  if (kw) {
    data = data.filter(
      (d) =>
        d.NOMR?.toLowerCase().includes(kw) ||
        d.dpjp?.toLowerCase().includes(kw) ||
        d.keterangan?.toLowerCase().includes(kw),
    )
  }
  if (filterVerif.value !== null && filterVerif.value !== undefined) {
    data = data.filter((d) => String(d.telah_verif) === filterVerif.value)
  }
  if (filterKeterangan.value.length > 0) {
    data = data.filter((d) => filterKeterangan.value.includes(d.keterangan))
  }
  return data
})

const mobilePageCount = computed(() => Math.max(1, Math.ceil(filteredList.value.length / mobilePageSize)))

const mobilePaginatedList = computed(() => {
  const start = (mobilePage.value - 1) * mobilePageSize
  return filteredList.value.slice(start, start + mobilePageSize)
})

const summaryDokter = computed(() => {
  const map = {}
  list.value.forEach((p) => {
    const key = p.dpjp || '(Tidak Diisi)'
    if (!map[key]) map[key] = { dpjp: key, total: 0, verif: 0, belum: 0 }
    map[key].total++
    if (p.telah_verif === '1' || p.telah_verif === 1) map[key].verif++
    else map[key].belum++
  })
  return Object.values(map)
    .map((d) => ({ ...d, persen: d.total > 0 ? Math.round((d.verif / d.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
})

const formatDateParam = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fetchData = async () => {
  if (!selectedDate.value) return
  loading.value = true
  list.value = []
  mobilePage.value = 1
  try {
    const tanggal = formatDateParam(selectedDate.value)
    const response = await axios.get(
      `${configStore.apiBaseUrl}/index.php/api/triaseigd/get_triase_by_tanggal/${id_client.value}/${tanggal}`,
    )
    list.value = Array.isArray(response.data.response) ? response.data.response : []
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat data triase IGD',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  selectedDate.value = new Date()
  filterKeyword.value = ''
  filterVerif.value = null
  filterKeterangan.value = []
  mobilePage.value = 1
  fetchData()
}

const formatDisplayDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const dpjpInitial = (name) => {
  if (!name) return '?'
  const clean = name.replace(/^dr\.?\s*/i, '').trim()
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return clean.slice(0, 2).toUpperCase()
}

const rowClass = (data) => ({
  'row-verified': data.telah_verif === '1' || data.telah_verif === 1,
  'row-not-input': data.telah_verif === '2' || data.telah_verif === 2,
  'row-pending':
    data.telah_verif !== '1' &&
    data.telah_verif !== 1 &&
    data.telah_verif !== '2' &&
    data.telah_verif !== 2,
})

onMounted(() => {
  fetchData()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const progressColor = (pct) => {
  // 0% = merah (hue 0) → 100% = hijau (hue 120), via HSL
  const hue = Math.round((Math.min(Math.max(pct, 0), 100) / 100) * 120)
  return `hsl(${hue}, 68%, 42%)`
}

function doPrint() {
  window.print()
}
</script>

<style scoped>
/* ── Toolbar ── */
.toolbar-start {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toolbar-ico {
  font-size: 1.25rem;
  color: var(--p-primary-color);
}
.toolbar-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.toolbar-sub {
  font-size: 0.72rem;
  color: var(--p-text-muted-color);
}
.toolbar-end {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Stat Row ── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius-md, 8px);
  padding: 12px 16px;
  box-shadow: var(--p-shadow-1, 0 1px 3px rgba(0, 0, 0, 0.06));
}
.stat-ico {
  font-size: 1.4rem;
  color: var(--p-text-muted-color);
  flex-shrink: 0;
}
.stat-val {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 2px;
}
.stat-lbl {
  font-size: 0.68rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

/* ── Filter Grid ── */
.filter-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 140px;
}
.filter-group-grow {
  flex: 1;
  min-width: 200px;
}
.filter-group-ket {
  flex: 2;
  min-width: 220px;
}
.filter-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 4px;
}
.filter-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

/* Keterangan chips */
.ket-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 6px 8px;
  background: var(--p-surface-50, #f8fafc);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius-md, 6px);
  min-height: 36px;
  align-items: center;
}
.ket-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 6px;
  border-radius: 20px;
  border: 1px solid var(--p-surface-300);
  background: var(--p-surface-0);
  cursor: pointer;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--p-text-color);
  user-select: none;
  transition: border-color 0.15s, background 0.15s;
}
.ket-chip:hover {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50, #f0f4ff);
}
.ket-chip-active {
  border-color: var(--p-primary-color) !important;
  background: var(--p-primary-50, #eff6ff) !important;
  font-weight: 700;
}

/* ── Tab Bar ── */
.tab-bar {
  display: flex;
  gap: 6px;
}
.tab-btn {
  flex: 1;
}

/* ── DataTable header/empty ── */
.dt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}
.dt-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--p-text-muted-color);
}

/* ── Row accent ── */
:deep(.p-datatable-tbody > tr.row-verified > td:first-child) {
  border-left: 3px solid var(--p-green-500);
}
:deep(.p-datatable-tbody > tr.row-pending > td:first-child) {
  border-left: 3px solid var(--p-orange-500);
}
:deep(.p-datatable-tbody > tr.row-not-input > td:first-child) {
  border-left: 3px solid var(--p-red-500);
}

/* ── Mobile shared ── */
.mobile-detail,
.mobile-summary {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mobile-dt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
  border-bottom: 1px solid var(--p-surface-200);
  margin-bottom: 2px;
}
.mobile-dt-title {
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 5px;
}
.mobile-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--p-text-muted-color);
}

/* ── Detail compact card (2 baris) ── */
.mc {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-150, var(--p-surface-200));
  border-left: 3px solid var(--p-surface-300);
  border-radius: 6px;
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mc.row-verified  { border-left-color: var(--p-green-500); }
.mc.row-pending   { border-left-color: var(--p-orange-500); }
.mc.row-not-input { border-left-color: var(--p-red-400); }

/* baris 1 */
.mc-r1 {
  display: flex;
  align-items: center;
  gap: 5px;
}
.mc-num {
  font-size: 10px;
  font-weight: 600;
  color: var(--p-text-muted-color);
  min-width: 14px;
  flex-shrink: 0;
}
.mc-nomr-txt {
  font-family: monospace;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.mc-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-left: 2px;
}
.mc-dot-ok   { background: var(--p-green-500); }
.mc-dot-warn { background: var(--p-orange-400); }
.mc-dot-err  { background: var(--p-red-500); }
.mc-status-txt {
  font-size: 10px;
  font-weight: 600;
}
.txt-ok   { color: var(--p-green-600); }
.txt-warn { color: var(--p-orange-500); }
.txt-err  { color: var(--p-red-500); }

/* baris 2 */
.mc-r2 {
  font-size: 11px;
  color: var(--p-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 19px;
}
.mc-dpjp-name {
  font-weight: 600;
}
.mc-ket {
  color: var(--p-text-muted-color);
}
.mc-ket-empty {
  font-style: italic;
}

/* Mobile Pagination */
.mobile-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 0;
  border-top: 1px solid var(--p-surface-200);
  margin-top: 4px;
}
.mobile-pager-info {
  font-size: 12px;
  font-weight: 600;
  min-width: 52px;
  text-align: center;
  color: var(--p-text-muted-color);
}

/* ── Summary compact rows ── */
.ms-total-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: var(--p-surface-50, #f8fafc);
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  font-size: 11px;
  flex-wrap: wrap;
}
.ms-total-item { display: flex; align-items: center; gap: 4px; }
.ms-sep { color: var(--p-surface-300); font-size: 12px; }

.ms-row {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 6px;
  overflow: hidden;
}
.ms-row-main {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
}
.ms-num {
  font-size: 10px;
  font-weight: 600;
  color: var(--p-text-muted-color);
  min-width: 14px;
  flex-shrink: 0;
}
.ms-av {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--p-primary-100);
  color: var(--p-primary-700);
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ms-name {
  font-size: 12px;
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.ms-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.ms-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 24px;
  text-align: center;
}
.ms-badge-total { background: var(--p-surface-100); color: var(--p-text-muted-color); }
.ms-badge-ok    { background: var(--p-green-50,  #f0fdf4); color: var(--p-green-700,  #15803d); border: 1px solid var(--p-green-200,  #bbf7d0); }
.ms-badge-err   { background: var(--p-red-50,    #fef2f2); color: var(--p-red-700,    #b91c1c); border: 1px solid var(--p-red-200,    #fecaca); }
.ms-badge-pct   { background: var(--p-primary-50, #eff6ff); color: var(--p-primary-700); border: 1px solid var(--p-primary-200, #bfdbfe); }

/* ── Print ── */
.no-screen {
  display: none;
}
.print-kop {
  text-align: center;
  margin-bottom: 10px;
}
.print-kop-title {
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.print-kop-sub {
  font-size: 11px;
  color: #666;
}

@media print {
  .no-print {
    display: none !important;
  }
  .no-screen {
    display: block !important;
  }
}

/* ══ RESPONSIVE: MOBILE (< 640px) ══ */
@media (max-width: 639px) {
  /* Stat Row: 2x2 grid */
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .stat-card {
    padding: 10px 12px;
    gap: 8px;
  }
  .stat-val {
    font-size: 1.15rem;
  }
  .stat-ico {
    font-size: 1.1rem;
  }

  /* Toolbar: smaller text */
  .toolbar-title {
    font-size: 0.85rem;
  }
  .toolbar-sub {
    font-size: 0.65rem;
  }
  .toolbar-ico {
    font-size: 1rem;
  }

  /* Filter: stack single column */
  .filter-grid {
    flex-direction: column;
    gap: 8px;
  }
  .filter-group,
  .filter-group-grow,
  .filter-group-ket {
    min-width: unset;
    width: 100%;
    flex: unset;
  }
  .filter-actions {
    width: 100%;
  }
  .filter-btn-cari {
    flex: 1;
  }

  /* Ket chips: wrap tighter */
  .ket-chip {
    font-size: 11px;
    padding: 4px 8px 4px 6px;
  }
}

/* ══ RESPONSIVE: TABLET (640px - 768px) ══ */
@media (min-width: 640px) and (max-width: 767px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .filter-grid {
    flex-wrap: wrap;
  }
  .filter-group,
  .filter-group-grow {
    min-width: 45%;
    flex: 1 1 45%;
  }
  .filter-group-ket {
    width: 100%;
    flex: 1 1 100%;
  }
  .filter-actions {
    width: 100%;
  }
}
</style>
