<template>
  <div class="content">
    <Dialog
      v-model:visible="dialogVisible"
      modal
      header="Pasien Mobile JKN"
      :style="{ width: isMobile ? '95vw' : '1400px' }"
      :breakpoints="{ '960px': '90vw', '640px': '95vw' }"
      class="patient-detail-dialog"
      :closable="true"
      @hide="onDialogHide"
    >
      <div class="tabs-section">
        <div class="table-container">
          <div class="table-header">
            <h3 class="table-title">
              <i class="pi pi-list"></i>
              Daftar Pasien ({{ listPasienJKN.length }})
            </h3>
            <div class="table-actions">
              <DatePicker
                v-model="startDate"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal"
                showIcon
                iconDisplay="input"
                style="max-width: 180px"
              />
              <Button
                icon="pi pi-refresh"
                label="Refresh"
                @click="funcListPasienJKN"
                :loading="loaddataMjkn"
                class="round-button"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      <ProgressBar mode="indeterminate" style="height: 3px" v-if="loaddataMjkn" />

      <DataTable
        v-model:filters="filtersJKN"
        :value="listPasienJKN"
        paginator
        :rows="isMobile ? 5 : 10"
        :rowsPerPageOptions="isMobile ? [5, 10, 25] : [10, 25, 50, 100]"
        filterDisplay="menu"
        stripedRows
        scrollable
        :scrollHeight="isMobile ? '400px' : '600px'"
        :globalFilterFields="[
          'kodebooking',
          'nomorkartu',
          'nohp',
          'kodepoli',
          'pasien',
          'namadokter',
          'jeniskunjungan',
          'waktu_checkin',
          'stts',
          'nomorreferensi',
        ]"
        :sortField="'nomorkartu'"
        :sortOrder="1"
        responsiveLayout="scroll"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} pasien"
        class="elegant-datatable"
      >
        <template #empty>
          <div class="text-center p-3">Tidak ada data</div>
        </template>

        <Column v-if="!isMobile" field="nomorkartu" header="NOKA" sortable filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('nomorkartu')"
              placeholder="Pilih NOKA"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" field="nohp" header="NO HP" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('nohp')"
              placeholder="Pilih No HP"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" field="kodepoli" header="POLI" sortable filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('kodepoli')"
              placeholder="Pilih Poli"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" field="pasien" header="PASIEN" filter>
          <template #filter="{ filterModel, filterCallback }">
            <InputText
              v-model="filterModel.value"
              type="text"
              placeholder="Cari Pasien"
              @input="filterCallback()"
              class="p-column-filter w-full"
            />
          </template>
          <template #body="slotProps">
            {{ slotProps.data.pasien }} <br />
            Antrian :<strong> {{ slotProps.data.nomorantrianloket }}</strong>
          </template>
        </Column>

        <Column v-if="!isMobile" field="namadokter" header="DOKTER" sortable filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('namadokter')"
              placeholder="Pilih Dokter"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            {{ slotProps.data.kodedokter }} {{ slotProps.data.namadokter }}
          </template>
        </Column>

        <Column v-if="!isMobile" field="jeniskunjungan" header="JENIS KUNJUNGAN" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('jeniskunjungan')"
              placeholder="Pilih Jenis"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            <Tag severity="info" v-if="slotProps.data.jeniskunjunganid == 1">
              <small><i class="fas fa-user mr-2"></i>{{ slotProps.data.jeniskunjungan }}</small>
            </Tag>
            <Tag severity="warn" v-if="slotProps.data.jeniskunjunganid == 3">
              <small><i class="fas fa-user mr-2"></i>{{ slotProps.data.jeniskunjungan }}</small>
            </Tag>
            <Tag severity="success" v-if="slotProps.data.jeniskunjunganid == 4">
              <small><i class="fas fa-user mr-2"></i>{{ slotProps.data.jeniskunjungan }}</small>
            </Tag>
          </template>
        </Column>

        <Column v-if="!isMobile" field="waktu_checkin" header="STTS CHECKIN" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('waktu_checkin')"
              placeholder="Pilih Waktu"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            <i class="fas fa-clock text-blue-500 mr-2"></i>{{ slotProps.data.waktu_checkin }}
          </template>
        </Column>

        <Column v-if="!isMobile" field="stts" header="STTS AKTIF" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('stts')"
              placeholder="Pilih Status"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
          <template #body="slotProps">
            <Tag severity="warn" v-if="slotProps.data.deleted == 1">
              <span class="text-red-500 font-semibold">
                <i class="fas fa-times-circle"></i> {{ slotProps.data.stts }}
              </span>
            </Tag>
          </template>
        </Column>

        <Column v-if="!isMobile" field="nomorreferensi" header="NO REF" filter>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="uniqueOptions('nomorreferensi')"
              placeholder="Pilih No Ref"
              optionLabel="label"
              optionValue="value"
              @change="filterCallback()"
              class="w-full"
            />
          </template>
        </Column>

        <Column v-if="!isMobile" header="AKSI" style="width: 180px">
          <template #body="slotProps">
            <Button
              icon="pi pi-check"
              label="Terbitkan SEP"
              @click="TerbitkanSEP(slotProps.data)"
              :loading="slotProps.data.loading"
              :disabled="slotProps.data.deleted == 1"
              class="round-button2 w-full"
              size="small"
              style="width: 100%"
            />
          </template>
        </Column>

        <!-- Mobile card view -->
        <Column v-if="isMobile" header="Data Pasien" style="width: 100%">
          <template #body="slotProps">
            <div class="mobile-card">
              <div class="mobile-card-header">
                <div>
                  <i class="fas fa-user text-sky-500 mr-2"></i>
                  <strong>{{ slotProps.data.pasien }}</strong>
                </div>
                <Tag severity="warn" v-if="slotProps.data.deleted == 1" class="ml-2">
                  <small>Nonaktif</small>
                </Tag>
              </div>
              <div class="mobile-card-body">
                <div class="mobile-info-row">
                  <span class="label">Kode Book:</span>
                  <span class="value">{{ slotProps.data.kodebooking }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">NOKA:</span>
                  <span class="value">{{ slotProps.data.nomorkartu }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">No HP:</span>
                  <span class="value">{{ slotProps.data.nohp }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">Poli:</span>
                  <span class="value">{{ slotProps.data.kodepoli }}</span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">Dokter:</span>
                  <span class="value"
                    >{{ slotProps.data.kodedokter }} - {{ slotProps.data.namadokter }}</span
                  >
                </div>
                <div class="mobile-info-row">
                  <span class="label">Jenis:</span>
                  <Tag severity="info" v-if="slotProps.data.jeniskunjunganid == 1">
                    <small>{{ slotProps.data.jeniskunjungan }}</small>
                  </Tag>
                  <Tag severity="warn" v-if="slotProps.data.jeniskunjunganid == 3">
                    <small>{{ slotProps.data.jeniskunjungan }}</small>
                  </Tag>
                  <Tag severity="success" v-if="slotProps.data.jeniskunjunganid == 4">
                    <small>{{ slotProps.data.jeniskunjungan }}</small>
                  </Tag>
                </div>
                <div class="mobile-info-row">
                  <span class="label">Check-in:</span>
                  <span class="value">
                    <i class="fas fa-clock text-blue-500 mr-1"></i
                    >{{ slotProps.data.waktu_checkin }}
                  </span>
                </div>
                <div class="mobile-info-row">
                  <span class="label">No Ref:</span>
                  <span class="value">{{ slotProps.data.nomorreferensi }}</span>
                </div>
              </div>
              <div class="mobile-card-footer">
                <Button
                  icon="pi pi-check"
                  label="Terbitkan SEP"
                  @click="TerbitkanSEP(slotProps.data)"
                  :loading="slotProps.data.loading"
                  :disabled="slotProps.data.deleted == 1"
                  class="round-button2"
                  size="small"
                  style="width: 100%"
                />
              </div>
            </div>
          </template>
        </Column>
      </DataTable>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { FilterMatchMode } from '@primevue/core/api'
import DatePicker from 'primevue/datepicker'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const router = useRouter()
const configStore = useConfigStore()
const toast = useToast()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)

const dialogVisible = ref(true)
const startDate = ref(new Date())
const listPasienJKN = ref([])
const loaddataMjkn = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const onDialogHide = () => {
  router.back()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  funcListPasienJKN()
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
  waktu_checkin: { value: null, matchMode: FilterMatchMode.IN },
  stts: { value: null, matchMode: FilterMatchMode.IN },
  nomorreferensi: { value: null, matchMode: FilterMatchMode.IN },
  kodebooking: { value: null, matchMode: FilterMatchMode.IN },
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const uniqueOptions = (field) => {
  const values = [...new Set(listPasienJKN.value.map((item) => item[field]))]
  return values.map((v) => ({ label: v, value: v }))
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const showSuccess = (message = 'Berhasil') => {
  toast.add({ severity: 'success', summary: 'Berhasil', detail: message, life: 3000 })
}

const showInfo = (message = 'Informasi') => {
  toast.add({ severity: 'info', summary: 'Informasi', detail: message, life: 3000 })
}

const showError = (message = 'Terjadi kesalahan') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}

const funcListPasienJKN = async () => {
  try {
    loaddataMjkn.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/mobil_jkn/getdataantrian_mbjkn/${id_client.value}/${formatDate(startDate.value)}`,
    )
    listPasienJKN.value = response.data.belum_terbit_sep || []
  } catch (error) {
    console.error('Error fetching Pasien JKN:', error)
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

    let wich_url = ''
    if (data.jeniskunjunganid == 3) {
      wich_url = `${url}/index.php/api/bpjs_api/TerbitsepDariSuratKontrol`
    } else {
      wich_url = `${url}/index.php/api/bpjs_api/terbitsepDariRujukan`
    }

    const response = await axios.post(wich_url, param)
    if (response.data.metadata.code == 200) {
      showSuccess(response.data.metadata.message)
      funcListPasienJKN()
    } else {
      showInfo(response.data.metadata.message)
    }
  } catch (error) {
    console.error(error)
    showError('Gagal menerbitkan SEP')
  } finally {
    data.loading = false
  }
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.round-button2 {
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.1rem 0.5rem;
  font-size: 0.78rem;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  background: #e6edf7;
  color: #162d4e;
}

/* Mobile card */
.mobile-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  background: #f8fafc;
}
.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.mobile-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
}
.mobile-info-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.78rem;
}
.mobile-info-row .label {
  color: #64748b;
  font-weight: 600;
  min-width: 75px;
}
.mobile-info-row .value {
  color: #1e293b;
}
.mobile-card-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
}
</style>
