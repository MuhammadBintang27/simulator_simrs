<template>
  <Toast />

  <!-- Content Header -->
  <div class="content-header">
    <div class="container-fluid">
      <div class="row mb-2">
        <div class="col-sm-6">
          <h1 class="m-0">Monitoring Rekam Medis Elektronik</h1>
        </div>
        <div class="col-sm-6">
          <ol class="breadcrumb float-sm-right">
            <li class="breadcrumb-item"><a href="#">Home</a></li>
            <li class="breadcrumb-item active">Monitoring RME</li>
          </ol>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="content">
    <div class="container-fluid">
      <!-- Summary Cards -->
      <div class="row">
        <div class="col-lg-3 col-6">
          <div class="small-box bg-info">
            <div class="inner">
              <h3>{{ fact.length }}</h3>
              <p>Total Pasien</p>
            </div>
            <div class="icon"><i class="pi pi-users"></i></div>
          </div>
        </div>
        <div class="col-lg-3 col-6">
          <div class="small-box bg-success">
            <div class="inner">
              <h3>{{ completedCount }}</h3>
              <p>Data Lengkap</p>
            </div>
            <div class="icon"><i class="pi pi-check-circle"></i></div>
          </div>
        </div>
        <div class="col-lg-3 col-6">
          <div class="small-box bg-warning">
            <div class="inner">
              <h3>{{ partialCount }}</h3>
              <p>Sebagian Terkirim</p>
            </div>
            <div class="icon"><i class="pi pi-exclamation-circle"></i></div>
          </div>
        </div>
        <div class="col-lg-3 col-6">
          <div class="small-box bg-danger">
            <div class="inner">
              <h3>{{ emptyCount }}</h3>
              <p>Belum Terkirim</p>
            </div>
            <div class="icon"><i class="pi pi-times-circle"></i></div>
          </div>
        </div>
      </div>

      <!-- Table Card -->
      <div class="card card-primary card-outline">
        <div class="card-header">
          <h3 class="card-title">
            <i class="pi pi-table mr-1"></i>
            Data Rekam Medis Elektronik
          </h3>
          <div class="card-tools">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              size="small"
              :loading="loading"
              @click="fetchData"
            />
          </div>
        </div>

        <div class="card-body">
          <!-- Filter Row -->
          <div class="row mb-3">
            <div class="col-md-4">
              <InputGroup>
                <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
                <InputText
                  v-model="globalFilter"
                  placeholder="Cari No. Register / No. SEP..."
                  size="small"
                />
              </InputGroup>
            </div>
            <div class="col-md-3">
              <Select
                v-model="selectedStatus"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                placeholder="Filter Status"
                size="small"
                class="w-100"
              />
            </div>
            <div class="col-md-5 text-right">
              <Button
                label="Export Excel"
                icon="pi pi-file-excel"
                severity="success"
                size="small"
                outlined
                @click="exportData"
              />
            </div>
          </div>

          <!-- DataTable -->
          <DataTable
            :value="filteredFact"
            :loading="loading"
            stripedRows
            showGridlines
            scrollable
            scrollHeight="500px"
            :paginator="true"
            :rows="15"
            :rowsPerPageOptions="[10, 15, 25, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            size="small"
          >
            <template #empty>
              <div class="text-center py-4 text-muted">
                <i class="pi pi-inbox" style="font-size: 2rem"></i>
                <p class="mt-2 mb-0">Tidak ada data rekam medis</p>
              </div>
            </template>

            <Column header="No" style="width: 55px">
              <template #body="{ index }">
                <span class="badge badge-secondary">{{ index + 1 }}</span>
              </template>
            </Column>

            <Column field="noregister" header="No. Register" style="min-width: 145px">
              <template #body="{ data }">
                <span class="badge badge-primary" style="font-family: monospace; font-size: 11px">
                  {{ data.noregister }}
                </span>
              </template>
            </Column>

            <Column field="nosep" header="No. SEP" style="min-width: 155px">
              <template #body="{ data }">
                <span style="font-family: monospace; font-size: 12px">{{ data.nosep || '-' }}</span>
              </template>
            </Column>

            <Column
              field="composition"
              header="Composition"
              style="min-width: 120px; text-align: center"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.composition ? 'Terkirim' : 'Belum'"
                  :severity="data.composition ? 'success' : 'danger'"
                  :icon="data.composition ? 'pi pi-check' : 'pi pi-times'"
                />
              </template>
            </Column>

            <Column field="obat" header="Obat" style="min-width: 110px; text-align: center">
              <template #body="{ data }">
                <Tag
                  :value="data.obat ? 'Terkirim' : 'Belum'"
                  :severity="data.obat ? 'success' : 'danger'"
                  :icon="data.obat ? 'pi pi-check' : 'pi pi-times'"
                />
              </template>
            </Column>

            <Column
              field="radiologi"
              header="Radiologi"
              style="min-width: 110px; text-align: center"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.radiologi ? 'Terkirim' : 'Belum'"
                  :severity="data.radiologi ? 'success' : 'danger'"
                  :icon="data.radiologi ? 'pi pi-check' : 'pi pi-times'"
                />
              </template>
            </Column>

            <Column field="lab" header="Lab" style="min-width: 110px; text-align: center">
              <template #body="{ data }">
                <Tag
                  :value="data.lab ? 'Terkirim' : 'Belum'"
                  :severity="data.lab ? 'success' : 'danger'"
                  :icon="data.lab ? 'pi pi-check' : 'pi pi-times'"
                />
              </template>
            </Column>

            <Column header="Kelengkapan" style="min-width: 160px">
              <template #body="{ data }">
                <div class="d-flex align-items-center gap-2">
                  <ProgressBar
                    :value="getCompletionPercent(data)"
                    style="height: 8px; flex: 1; min-width: 80px"
                    :pt="{ value: { style: { background: getProgressColor(data) } } }"
                  />
                  <small class="text-muted">{{ getCompletionPercent(data) }}%</small>
                </div>
              </template>
            </Column>

            <Column header="Aksi" style="min-width: 90px; text-align: center">
              <template #body="{ data }">
                <Button
                  icon="pi pi-eye"
                  rounded
                  text
                  severity="info"
                  size="small"
                  v-tooltip.top="'Lihat Detail'"
                  @click="viewDetail(data)"
                />
                <Button
                  icon="pi pi-send"
                  rounded
                  text
                  severity="success"
                  size="small"
                  v-tooltip.top="'Kirim Ulang'"
                  @click="sendData(data)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>

  <!-- Detail Dialog -->
  <Dialog
    v-model:visible="detailDialog"
    :header="`Detail RME — ${selectedRecord?.noregister}`"
    modal
    :style="{ width: '480px' }"
  >
    <div v-if="selectedRecord">
      <div class="row mb-3">
        <div class="col-6">
          <small class="text-muted d-block">No. Register</small>
          <span class="badge badge-primary" style="font-size: 13px; font-family: monospace">
            {{ selectedRecord.noregister }}
          </span>
        </div>
        <div class="col-6">
          <small class="text-muted d-block">No. SEP</small>
          <span style="font-family: monospace; font-size: 13px">{{
            selectedRecord.nosep || '-'
          }}</span>
        </div>
      </div>

      <Divider />

      <div class="row">
        <div v-for="item in statusItems" :key="item.key" class="col-6 mb-2">
          <div class="info-box mb-0">
            <span
              class="info-box-icon"
              :class="selectedRecord[item.key] ? 'bg-success' : 'bg-danger'"
              style="height: 60px; line-height: 60px; font-size: 24px"
            >
              <i :class="item.icon"></i>
            </span>
            <div class="info-box-content" style="padding: 8px 10px">
              <span class="info-box-text">{{ item.label }}</span>
              <span class="info-box-number" style="font-size: 13px">
                <Tag
                  :value="selectedRecord[item.key] ? 'Terkirim' : 'Belum'"
                  :severity="selectedRecord[item.key] ? 'success' : 'danger'"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      <div class="d-flex justify-content-between">
        <span class="text-muted">Kelengkapan Data</span>
        <strong>{{ getCompletionPercent(selectedRecord) }}%</strong>
      </div>
      <ProgressBar
        :value="getCompletionPercent(selectedRecord)"
        class="mt-1"
        style="height: 10px"
        :pt="{ value: { style: { background: getProgressColor(selectedRecord) } } }"
      />
    </div>

    <template #footer>
      <Button label="Tutup" icon="pi pi-times" severity="secondary" @click="detailDialog = false" />
      <Button label="Kirim Ulang" icon="pi pi-send" severity="success" @click="sendAndClose" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

const loading = ref(false)
const fact = ref([])
const globalFilter = ref('')
const selectedStatus = ref(null)
const detailDialog = ref(false)
const selectedRecord = ref(null)

const statusOptions = [
  { label: 'Semua Status', value: null },
  { label: 'Lengkap (100%)', value: 'complete' },
  { label: 'Sebagian', value: 'partial' },
  { label: 'Belum Terkirim', value: 'empty' },
]

const statusItems = [
  { key: 'composition', label: 'Composition', icon: 'pi pi-file-edit' },
  { key: 'obat', label: 'Obat', icon: 'pi pi-box' },
  { key: 'radiologi', label: 'Radiologi', icon: 'pi pi-image' },
  { key: 'lab', label: 'Laboratorium', icon: 'pi pi-chart-bar' },
]

const fields = ['composition', 'obat', 'radiologi', 'lab']

const getCompletionPercent = (row) => {
  const sent = fields.filter((f) => !!row[f]).length
  return Math.round((sent / fields.length) * 100)
}

const getProgressColor = (row) => {
  const pct = getCompletionPercent(row)
  if (pct === 100) return '#28a745'
  if (pct > 0) return '#ffc107'
  return '#dc3545'
}

const getRowStatus = (row) => {
  const pct = getCompletionPercent(row)
  if (pct === 100) return 'complete'
  if (pct > 0) return 'partial'
  return 'empty'
}

const completedCount = computed(
  () => fact.value.filter((r) => getRowStatus(r) === 'complete').length,
)
const partialCount = computed(() => fact.value.filter((r) => getRowStatus(r) === 'partial').length)
const emptyCount = computed(() => fact.value.filter((r) => getRowStatus(r) === 'empty').length)

const filteredFact = computed(() => {
  let data = fact.value
  if (globalFilter.value) {
    const q = globalFilter.value.toLowerCase()
    data = data.filter(
      (r) =>
        (r.noregister || '').toLowerCase().includes(q) || (r.nosep || '').toLowerCase().includes(q),
    )
  }
  if (selectedStatus.value) data = data.filter((r) => getRowStatus(r) === selectedStatus.value)
  return data
})

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/get_data`)
    fact.value = [...response.data.response]
    if (!fact.value.length) fact.value = generateDemoData()
  } catch {
    fact.value = generateDemoData()
    toast.add({ severity: 'warn', summary: 'Info', detail: 'Menggunakan data demo', life: 3000 })
  } finally {
    loading.value = false
  }
}

const generateDemoData = () =>
  Array.from({ length: 20 }, (_, i) => ({
    noregister: `REG-2025-${String(i + 1).padStart(4, '0')}`,
    nosep: Math.random() > 0.2 ? `0101R00${String(i + 100)}01` : null,
    composition: Math.random() > 0.3 ? '2025-01-15 10:30:00' : null,
    obat: Math.random() > 0.4 ? '2025-01-15 11:00:00' : null,
    radiologi: Math.random() > 0.6 ? '2025-01-15 12:00:00' : null,
    lab: Math.random() > 0.5 ? '2025-01-15 13:00:00' : null,
  }))

const viewDetail = (row) => {
  selectedRecord.value = row
  detailDialog.value = true
}
const sendAndClose = () => {
  sendData(selectedRecord.value)
  detailDialog.value = false
}
const sendData = (row) =>
  toast.add({
    severity: 'info',
    summary: 'Mengirim',
    detail: `Mengirim ulang ${row.noregister}`,
    life: 3000,
  })
const exportData = () =>
  toast.add({
    severity: 'success',
    summary: 'Export',
    detail: 'Data berhasil diekspor',
    life: 3000,
  })

onMounted(() => fetchData())
</script>
