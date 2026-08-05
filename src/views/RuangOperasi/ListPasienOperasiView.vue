<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />

  <div class="op-page">
    <!-- PAGE HEADER -->
    <div class="op-header">
      <div class="op-header__left">
        <div class="op-header__icon">
          <i class="pi pi-building"></i>
        </div>
        <div>
          <h1 class="op-header__title">Jadwal Pasien Operasi</h1>
          <p class="op-header__desc">Manajemen jadwal dan status pelaksanaan tindakan bedah</p>
        </div>
      </div>
      <div class="op-header__stats">
        <div class="op-stat">
          <i class="pi pi-calendar op-stat__icon"></i>
          <div class="op-stat__body">
            <span class="op-stat__val">{{ totalDijadwalkan }}</span>
            <span class="op-stat__lbl">Dijadwalkan</span>
          </div>
        </div>
        <div class="op-stat op-stat--success">
          <i class="pi pi-check-circle op-stat__icon"></i>
          <div class="op-stat__body">
            <span class="op-stat__val">{{ totalTerlaksana }}</span>
            <span class="op-stat__lbl">Terlaksana</span>
          </div>
        </div>
        <div class="op-stat op-stat--danger">
          <i class="pi pi-times-circle op-stat__icon"></i>
          <div class="op-stat__body">
            <span class="op-stat__val">{{ totalDibatalkan }}</span>
            <span class="op-stat__lbl">Dibatalkan</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="op-toolbar">
      <div class="op-toolbar__left">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="globalFilter"
            placeholder="Cari nama, No MR, alamat..."
            style="width: 240px"
            @keyup.enter="fetchData"
          />
        </IconField>
        <div class="op-toolbar__date-group">
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Tanggal Mulai"
            showIcon
            iconDisplay="input"
          />
          <span class="op-toolbar__date-sep"><i class="pi pi-arrow-right"></i></span>
          <DatePicker
            v-model="endDate"
            dateFormat="dd M yy"
            placeholder="Tanggal Selesai"
            showIcon
            iconDisplay="input"
          />
        </div>
      </div>
      <Button icon="pi pi-refresh" label="Refresh" @click="fetchData" outlined size="small" />
    </div>

    <!-- DATA TABLE -->
    <div class="op-table-wrap">
      <DataTable
        :value="filteredFact"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        sortMode="multiple"
        showGridlines
        scrollable
        scrollHeight="480px"
        size="small"
        stripedRows
        class="op-table"
        tableStyle="min-width: 1240px"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
        currentPageReportTemplate="Menampilkan {first}–{last} dari {totalRecords} data"
      >
        <template #empty>
          <div class="op-empty">
            <i class="pi pi-inbox"></i>
            <p>Tidak ada data operasi untuk ditampilkan</p>
            <small>Coba ubah filter tanggal atau kata kunci pencarian</small>
          </div>
        </template>

        <Column field="nomorrm" header="No. RM" sortable style="min-width: 110px" />
        <Column field="nama" header="Nama Pasien" sortable style="min-width: 180px" />
        <Column field="jeniskelamin" header="JK" sortable style="min-width: 58px" />
        <Column field="usia" header="Usia" sortable style="min-width: 65px" />
        <Column field="alamat" header="Alamat" style="min-width: 170px" />
        <Column field="kodebooking" header="Kode Booking" style="min-width: 130px" />
        <Column field="NOSEP" header="No. SEP" style="min-width: 130px" />
        <Column header="Tindakan" style="min-width: 150px">
          <template #body="{ data }">
            <div class="tindakan-tags">
              <Tag v-if="data.tindakan" :value="data.tindakan" severity="secondary" />
              <Tag v-if="data.tindakan2" :value="data.tindakan2" severity="secondary" />
            </div>
          </template>
        </Column>
        <Column field="namapoli" header="Poli" sortable style="min-width: 120px" />
        <Column field="dokter" header="Dokter" style="min-width: 160px" />
        <Column header="Tgl Operasi" sortable style="min-width: 120px">
          <template #body="{ data }">
            {{ formatDate_database(data.tanggaloperasi) }}
          </template>
        </Column>
        <Column field="jam" header="Jam" style="min-width: 75px" />
        <Column header="Status" style="min-width: 135px">
          <template #body="{ data }">
            <Tag
              :severity="statusSeverity(data.terlaksana)"
              :value="statusBadgeLabel(data.terlaksana)"
              :icon="statusBadgeIcon(data.terlaksana)"
            />
          </template>
        </Column>
        <Column header="Aksi" frozen alignFrozen="right" style="min-width: 105px">
          <template #body="{ data }">
            <div class="op-row-actions">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                outlined
                rounded
                v-tooltip.top="'Edit Data Operasi'"
                @click="openEditModal(data)"
              />
              <Button
                icon="pi pi-arrow-right"
                size="small"
                rounded
                v-tooltip.top="'Lakukan Persiapan'"
                @click="lakukan_persiapan(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- MODAL UPDATE OPERASI -->
    <Dialog
      v-model:visible="modalVisible"
      modal
      :closable="true"
      :draggable="false"
      :style="{ width: '630px', maxWidth: '96vw' }"
    >
      <template #header>
        <div class="dlg-hd">
          <div class="dlg-hd__icon"><i class="pi pi-calendar-plus"></i></div>
          <div>
            <div class="dlg-hd__title">Update Data Operasi</div>
            <div class="dlg-hd__sub" v-if="editForm.nama">
              <i class="pi pi-user"></i>&nbsp;{{ editForm.nama }}
              <span class="dlg-hd__sep">·</span>
              <i class="pi pi-id-card"></i>&nbsp;{{ editForm.nomorrm }}
            </div>
          </div>
        </div>
      </template>

      <div class="dlg-body">
        <!-- Status banner -->
        <div class="dlg-status" :class="`dlg-status--${statusBarVariant}`">
          <i :class="currentStatusIcon"></i>
          <span
            >Status Saat Ini:&nbsp;<strong>{{ currentStatusLabel }}</strong></span
          >
        </div>

        <!-- Informasi Pasien -->
        <div class="dlg-sec">
          <div class="dlg-sec__title"><i class="pi pi-user"></i> Informasi Pasien</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">No. Rekam Medis</span>
              <span class="info-val">{{ editForm.nomorrm || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Nama Pasien</span>
              <span class="info-val">{{ editForm.nama || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Kode Booking</span>
              <span class="info-val">{{ editForm.kodebooking || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Dokter Operator</span>
              <span class="info-val">{{ editForm.dokter || '—' }}</span>
            </div>
          </div>
        </div>

        <Divider />

        <!-- Jenis Tindakan -->
        <div class="dlg-sec">
          <div class="dlg-sec__title"><i class="pi pi-heart"></i> Jenis Tindakan Operasi</div>
          <div class="field-col">
            <label class="field-lbl">Tindakan 1 <span class="req">*</span></label>
            <Select
              v-model="editForm.jenistindakan"
              :options="list_tindakan_operas"
              optionLabel="NAMA"
              optionValue="IDBARANG"
              placeholder="— Pilih jenis tindakan —"
              filter
              showClear
              class="w-full"
            >
              <template #option="{ option }">
                <div class="opt-row">
                  <span class="opt-kode">{{ option.IDBARANG }}</span>
                  <span>{{ option.NAMA }}</span>
                </div>
              </template>
            </Select>
          </div>
          <div class="field-col" style="margin-top: 0.75rem">
            <label class="field-lbl"> Tindakan 2 <span class="opt-badge">Opsional</span> </label>
            <Select
              v-model="editForm.jenistindakan_dua"
              :options="list_tindakan_operas"
              optionLabel="NAMA"
              optionValue="IDBARANG"
              placeholder="— Pilih jenis tindakan —"
              filter
              showClear
              class="w-full"
            >
              <template #option="{ option }">
                <div class="opt-row">
                  <span class="opt-kode">{{ option.IDBARANG }}</span>
                  <span>{{ option.NAMA }}</span>
                </div>
              </template>
            </Select>
          </div>
        </div>

        <Divider />

        <!-- Jadwal -->
        <div class="dlg-sec">
          <div class="dlg-sec__title"><i class="pi pi-clock"></i> Jadwal Operasi</div>
          <div class="two-col">
            <div class="field-col">
              <label class="field-lbl">Tanggal Operasi <span class="req">*</span></label>
              <DatePicker
                v-model="editForm.tanggaloperasi"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal"
                showIcon
                iconDisplay="input"
                class="w-full"
              />
            </div>
            <div class="field-col">
              <label class="field-lbl">Jam Operasi <span class="req">*</span></label>
              <DatePicker id="datepicker-timeonly" v-model="editForm.jam" timeOnly fluid />
            </div>
          </div>
        </div>

        <Divider />

        <!-- Ruang Operasi -->
        <div class="dlg-sec">
          <div class="dlg-sec__title"><i class="pi pi-building"></i> Ruang Operasi</div>
          <div class="field-col">
            <label class="field-lbl">Pilih Ruang <span class="req">*</span></label>
            <Select
              v-model="editForm.ruangoperasi"
              :options="ruang_operasi"
              optionLabel="nama"
              optionValue="id"
              placeholder="— Pilih ruang operasi —"
              class="w-full"
            >
              <template #option="{ option }">
                <div class="opt-row">
                  <i class="pi pi-building" style="color: var(--p-primary-color)"></i>
                  <span>{{ option.nama }}</span>
                </div>
              </template>
            </Select>
          </div>
        </div>

        <Divider />

        <!-- Status -->
        <div class="dlg-sec">
          <div class="dlg-sec__title"><i class="pi pi-flag"></i> Perubahan Status</div>
          <div class="status-chips">
            <div
              v-for="s in statusOptions"
              :key="s.value"
              :class="['schip', s.cls, { active: editForm.terlaksana === s.value }]"
              @click="editForm.terlaksana = s.value"
            >
              <i :class="[s.icon, 'schip__icon']"></i>
              <div class="schip__body">
                <span class="schip__label">{{ s.label }}</span>
                <span class="schip__desc">{{ s.desc }}</span>
              </div>
              <div class="schip__check" v-if="editForm.terlaksana === s.value">
                <i class="pi pi-check"></i>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <!-- Catatan -->
        <div class="dlg-sec">
          <div class="dlg-sec__title">
            <i class="pi pi-file-edit"></i> Catatan <span class="opt-badge">Opsional</span>
          </div>
          <Textarea
            v-model="editForm.catatan"
            rows="3"
            placeholder="Tambahkan catatan untuk perubahan ini..."
            class="w-full"
            autoResize
          />
        </div>
      </div>

      <template #footer>
        <div class="dlg-footer">
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="modalVisible = false"
          />
          <Button
            label="Simpan Perubahan"
            icon="pi pi-save"
            @click="submitUpdate"
            :loading="saving"
          />
        </div>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
const router = useRouter()

const loading = ref(false)
const fact = ref([])
const globalFilter = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())

const modalVisible = ref(false)
const saving = ref(false)

const editForm = ref({
  nopendaftaran: '',
  noregister: '',
  kodebooking: '',
  nomorrm: '',
  nama: '',
  dokter: '',
  jenistindakan: null,
  jenistindakan_dua: null,
  tanggaloperasi: null,
  jam: '',
  ruangoperasi: null,
  terlaksana: 0,
  catatan: '',
})

const statusOptions = [
  {
    value: 0,
    label: 'Dijadwalkan',
    desc: 'Operasi telah terjadwal',
    icon: 'pi pi-calendar',
    cls: 'schip-blue',
  },
  {
    value: 1,
    label: 'Terlaksana',
    desc: 'Operasi telah dilakukan',
    icon: 'pi pi-check-circle',
    cls: 'schip-green',
  },
  {
    value: 2,
    label: 'Dibatalkan',
    desc: 'Operasi dibatalkan',
    icon: 'pi pi-times-circle',
    cls: 'schip-red',
  },
]

const filteredFact = computed(() => {
  if (!globalFilter.value) return fact.value
  const q = globalFilter.value.toLowerCase()
  return fact.value.filter(
    (r) =>
      (r.nama ?? '').toLowerCase().includes(q) ||
      (r.nomorrm ?? '').toLowerCase().includes(q) ||
      (r.alamat ?? '').toLowerCase().includes(q) ||
      (r.kodebooking ?? '').toLowerCase().includes(q),
  )
})

const totalDijadwalkan = computed(() => fact.value.filter((r) => Number(r.terlaksana) === 0).length)
const totalTerlaksana = computed(() => fact.value.filter((r) => Number(r.terlaksana) === 1).length)
const totalDibatalkan = computed(() => fact.value.filter((r) => Number(r.terlaksana) === 2).length)

const currentStatusLabel = computed(
  () => statusOptions.find((s) => s.value === editForm.value.terlaksana)?.label ?? '—',
)
const currentStatusIcon = computed(
  () => statusOptions.find((s) => s.value === editForm.value.terlaksana)?.icon ?? 'pi pi-question',
)
const statusBarVariant = computed(() => {
  const map = { 0: 'blue', 1: 'green', 2: 'red' }
  return map[editForm.value.terlaksana] ?? 'blue'
})

const formatDate_database = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatDateTime_database = (date, time) => {
  if (!date || !time) return null
  return `${date} ${time}`
}

const form_time_only = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

const statusSeverity = (val) => {
  const map = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[Number(val)] ?? 'info'
}

const statusBadgeIcon = (val) =>
  statusOptions.find((s) => s.value === Number(val))?.icon ?? 'pi pi-circle'

const statusBadgeLabel = (val) => statusOptions.find((s) => s.value === Number(val))?.label ?? '—'

const openEditModal = (row) => {
  editForm.value = {
    nopendaftaran: row.noregister,
    noregister: row.noregister ?? '',
    kodebooking: row.kodebooking ?? '',
    nomorrm: row.nomorrm ?? '',
    nama: row.nama ?? '',
    dokter: row.dokter ?? '',
    jenistindakan: row.jenistindakan ?? null,
    jenistindakan_dua: row.jenistindakan_dua ?? null,
    tanggaloperasi: row.tanggaloperasi ? new Date(row.tanggaloperasi) : new Date(),
    jam: new Date(row.tanggaloperasi),
    ruangoperasi: row.ruangoperasi ?? null,
    terlaksana: Number(row.terlaksana ?? 0),
    catatan: '',
    KodePoliBPJS: row.kodepoli,
    namapoli: row.namapoli,
    kodepolirs: row.kodepolirs,
  }
  modalVisible.value = true
}

const lakukan_persiapan = (row) => {
  const rd = router.resolve({
    name: 'PersiapanOperasiVIew',
    params: { id: row.NOPENDAFTARAN },
    query: { noreg: row.noregister, kodebooking: row.kodebooking, nomr: row.nomorrm },
  })
  window.open(rd.href, '_blank')
}

const fetchData = async () => {
  try {
    loading.value = true
    const searchTerm = globalFilter.value.trim()
    const param = {
      tanggalawal: formatDate_database(startDate.value),
      tanggalakhir: formatDate_database(endDate.value),
      id_client: id_client.value,
      mode: searchTerm ? 4 : 3,
      ...(searchTerm && { nomorrm: searchTerm }),
    }
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/Mobil_jkn/getjadwaloperasi_v4`, param)
    if (res.data.metadata?.code !== '200') {
      toast.add({ severity: 'warn', summary: 'Info', detail: 'Data tidak ditemukan', life: 3000 })
      fact.value = []
      return
    }
    fact.value = [...res.data.response]
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 4000 })
  } finally {
    loading.value = false
  }
}

const ruang_operasi = ref([])
const list_ruang_operasi = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const res = await axios.get(
      `${url}/index.php/api/data_referensi/list_ruang_operasi/${id_client.value}`,
    )
    if (res.data.metadata?.code !== 200) {
      toast.add({ severity: 'warn', summary: 'Info', detail: 'Data tidak ditemukan', life: 3000 })
      return
    }
    ruang_operasi.value = [...res.data.response]
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 4000 })
  } finally {
    loading.value = false
  }
}

const list_tindakan_operas = ref([])
const get_list_tindakan_operasi = async () => {
  try {
    loading.value = true
    const url = configStore.apiApotikUrl
    const res = await axios.get(`${url}/index.php/api/barang/get_listoperasi/${id_client.value}`)
    if (res.data.metadata?.code !== '200') {
      toast.add({ severity: 'warn', summary: 'Info', detail: 'Data tidak ditemukan', life: 3000 })
      return
    }
    list_tindakan_operas.value = [...res.data.response]
  } catch (err) {
    console.error(err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 4000 })
  } finally {
    loading.value = false
  }
}

const submitUpdate = async () => {
  if (!editForm.value.jenistindakan) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: 'Pilih jenis tindakan terlebih dahulu.',
      life: 3000,
    })
    return
  }
  if (!editForm.value.tanggaloperasi) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: 'Pilih tanggal operasi.',
      life: 3000,
    })
    return
  }
  if (!editForm.value.jam || editForm.value.jam.length < 5) {
    toast.add({
      severity: 'warn',
      summary: 'Validasi',
      detail: 'Isi jam operasi dengan format HH:MM.',
      life: 3000,
    })
    return
  }
  if (!editForm.value.ruangoperasi) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Pilih ruang operasi.', life: 3000 })
    return
  }

  try {
    saving.value = true
    const tanggal = formatDate_database(editForm.value.tanggaloperasi)
    const waktu = form_time_only(editForm.value.jam)
    const param = {
      id_client: id_client.value,
      nopendaftaran: editForm.value.nopendaftaran,
      kodebooking: editForm.value.kodebooking,
      jenistindakan: editForm.value.jenistindakan,
      jenistindakan_dua: editForm.value.jenistindakan_dua,
      tanggaloperasi: formatDateTime_database(tanggal, waktu),
      jam: form_time_only(editForm.value.jam),
      ruangoperasi: editForm.value.ruangoperasi,
      terlaksana: editForm.value.terlaksana,
      catatan: editForm.value.catatan,
      KodePoliBPJS: editForm.value.KodePoliBPJS,
      namapoli: editForm.value.namapoli,
      kodepolirs: editForm.value.kodepolirs,
      mode: 1,
    }
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/Mobil_jkn/updatejadwaloperasiv2`, param)
    if (res.data.metadata?.code !== 200) {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res.data.metadata?.message ?? 'Update gagal.',
        life: 4000,
      })
      return
    }
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data operasi berhasil diperbarui.',
      life: 3000,
    })
    modalVisible.value = false
    await fetchData()
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan saat menyimpan.',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchData()
  get_list_tindakan_operasi()
  list_ruang_operasi()
})
</script>

<style scoped>
/* ── Layout ── */
.op-page {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* ── Header ── */
.op-header {
  background: linear-gradient(135deg, var(--p-primary-700) 0%, var(--p-primary-400) 100%);
  border-radius: 12px;
  padding: 1.4rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.op-header__left {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.op-header__icon {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.op-header__title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
  color: white;
}

.op-header__desc {
  font-size: 0.78rem;
  opacity: 0.82;
  margin: 0;
  color: white;
}

.op-header__stats {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.op-stat {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.7rem 1rem;
  min-width: 120px;
  color: white;
}

.op-stat--success {
  background: rgba(34, 197, 94, 0.22);
  border-color: rgba(34, 197, 94, 0.38);
}

.op-stat--danger {
  background: rgba(239, 68, 68, 0.22);
  border-color: rgba(239, 68, 68, 0.38);
}

.op-stat__icon {
  font-size: 1.25rem;
  opacity: 0.88;
}

.op-stat__val {
  display: block;
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1.1;
}

.op-stat__lbl {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
  font-weight: 500;
}

/* ── Toolbar ── */
.op-toolbar {
  background: var(--p-surface-0, #ffffff);
  border: 1px solid var(--p-surface-200, #e5e7eb);
  border-radius: 10px;
  padding: 0.8rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.op-toolbar__left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.op-toolbar__date-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.op-toolbar__date-sep {
  color: var(--p-text-muted-color, #94a3b8);
  font-size: 0.75rem;
}

/* ── Table ── */
.op-table-wrap {
  background: var(--p-surface-0, #ffffff);
  border: 1px solid var(--p-surface-200, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

:deep(.op-table .p-datatable-thead > tr > th) {
  font-size: 0.73rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.045em;
  white-space: nowrap;
  background: var(--p-surface-50, #f9fafb);
}

:deep(.op-table .p-datatable-tbody > tr > td) {
  font-size: 0.83rem;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
}

.tindakan-tags {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.op-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 2.5rem 1rem;
  color: var(--p-text-muted-color, #94a3b8);
  text-align: center;
}

.op-empty i {
  font-size: 2.2rem;
  opacity: 0.35;
}

.op-empty p {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
}

.op-empty small {
  font-size: 0.77rem;
  opacity: 0.75;
}

.op-row-actions {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

/* ── Dialog Header ── */
:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, var(--p-primary-700) 0%, var(--p-primary-500) 100%);
  padding: 1rem 1.4rem;
  border-radius: 12px 12px 0 0;
}

:deep(.p-dialog .p-dialog-header-icon) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.p-dialog .p-dialog-header-icon:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 0;
  background: var(--p-surface-50, #f8fafc);
}

:deep(.p-dialog .p-dialog-footer) {
  padding: 0.85rem 1.25rem;
  background: var(--p-surface-100, #f1f5f9);
  border-top: 1px solid var(--p-surface-200, #e5e7eb);
}

.dlg-hd {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.dlg-hd__icon {
  width: 2.2rem;
  height: 2.2rem;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  color: white;
}

.dlg-hd__title {
  font-size: 0.98rem;
  font-weight: 700;
  color: white;
}

.dlg-hd__sub {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.1rem;
}

.dlg-hd__sep {
  margin: 0 0.4rem;
  opacity: 0.5;
}

/* Dialog Body */
.dlg-body {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 72vh;
}

.dlg-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.82rem;
  font-weight: 500;
  margin: 0.85rem 1.25rem 0;
  border-radius: 8px;
}

.dlg-status--blue {
  background: #dbeafe;
  color: #1d4ed8;
  border-left: 3px solid #3b82f6;
}

.dlg-status--green {
  background: #dcfce7;
  color: #15803d;
  border-left: 3px solid #22c55e;
}

.dlg-status--red {
  background: #fee2e2;
  color: #b91c1c;
  border-left: 3px solid #ef4444;
}

.dlg-sec {
  padding: 0.9rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.dlg-sec__title {
  font-size: 0.69rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.065em;
  color: var(--p-text-muted-color, #64748b);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.1rem;
}

.dlg-sec__title i {
  color: var(--p-primary-color);
  font-size: 0.8rem;
}

:deep(.p-divider) {
  margin: 0;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem 1.75rem;
  background: var(--p-surface-0, white);
  border: 1px solid var(--p-surface-200, #e5e7eb);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.info-key {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--p-text-muted-color, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-val {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--p-text-color, #1e293b);
}

/* Fields */
.field-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-lbl {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-color, #374151);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.req {
  color: #ef4444;
}

.opt-badge {
  font-size: 0.59rem;
  background: var(--p-primary-100, #ddeee9);
  color: var(--p-primary-700, #345f50);
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* Dropdown options */
.opt-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.opt-kode {
  font-size: 0.66rem;
  background: var(--p-primary-100, #ddeee9);
  color: var(--p-primary-700, #345f50);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  min-width: 54px;
  text-align: center;
  flex-shrink: 0;
}

/* Status Chips */
.status-chips {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.schip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.16s ease;
  border: 2px solid transparent;
  position: relative;
  user-select: none;
}

.schip__icon {
  font-size: 1.05rem;
  flex-shrink: 0;
}

.schip__body {
  display: flex;
  flex-direction: column;
}

.schip__label {
  font-size: 0.79rem;
  font-weight: 700;
  line-height: 1;
}

.schip__desc {
  font-size: 0.63rem;
  opacity: 0.72;
  margin-top: 0.15rem;
}

.schip-blue {
  background: #f0f9ff;
  color: #0369a1;
  border-color: #bae6fd;
}
.schip-blue.active {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
  box-shadow: 0 3px 12px rgba(14, 165, 233, 0.3);
}

.schip-green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.schip-green.active {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
  box-shadow: 0 3px 12px rgba(34, 197, 94, 0.3);
}

.schip-red {
  background: #fff1f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.schip-red.active {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
  box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
}

.schip__check {
  position: absolute;
  top: -7px;
  right: -7px;
  background: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14);
}

.schip__check i {
  font-size: 0.58rem;
  color: #15803d;
}

/* Dialog Footer */
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

:deep(.w-full) {
  width: 100% !important;
}
</style>
