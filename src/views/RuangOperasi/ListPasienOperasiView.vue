<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />

  <div class="content">
    <!-- ═══════════════════════════════════════════════════════
         HERO SECTION
    ═══════════════════════════════════════════════════════ -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <i class="pi pi-heart"></i>
        </div>
        <div class="hero-text">
          <h1 class="hero-title">Pendaftaran Pasien Operasi</h1>
          <p class="hero-description">
            Pendaftaran pasien operasi dilakukan sebagai langkah awal sebelum tindakan bedah. Proses
            ini mencakup pengisian data identitas pasien, riwayat kesehatan, diagnosa medis, serta
            jenis operasi yang akan dilakukan.
          </p>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-calendar"></i></div>
          <div class="stat-value">{{ totalDijadwalkan }}</div>
          <div class="stat-label">Dijadwalkan</div>
        </div>
        <div class="stat-card stat-green">
          <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
          <div class="stat-value">{{ totalTerlaksana }}</div>
          <div class="stat-label">Terlaksana</div>
        </div>
        <div class="stat-card stat-red">
          <div class="stat-icon"><i class="pi pi-times-circle"></i></div>
          <div class="stat-value">{{ totalDibatalkan }}</div>
          <div class="stat-label">Dibatalkan</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         FILTER SECTION
    ═══════════════════════════════════════════════════════ -->
    <div class="filter-section">
      <div class="filter-header">
        <h3 class="filter-title">
          <i class="pi pi-sliders-h"></i>
          Filter &amp; Pencarian
        </h3>
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label class="filter-label"><i class="pi pi-search"></i> Pencarian Global</label>
          <InputText v-model="globalFilter" placeholder="Cari nama, No MR, alamat..." />
        </div>
        <div class="filter-group">
          <label class="filter-label"><i class="pi pi-calendar-plus"></i> Tanggal Mulai</label>
          <DatePicker
            v-model="startDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal mulai"
            showIcon
            iconDisplay="input"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label"><i class="pi pi-calendar-minus"></i> Tanggal Selesai</label>
          <DatePicker
            v-model="endDate"
            dateFormat="dd M yy"
            placeholder="Pilih tanggal selesai"
            showIcon
            iconDisplay="input"
          />
        </div>
        <div class="filter-group filter-action">
          <Button
            icon="pi pi-refresh"
            label="Refresh"
            @click="fetchData"
            class="round-button2"
            size="small"
          />
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         DATA TABLE
    ═══════════════════════════════════════════════════════ -->
    <Panel class="table-panel">
      <DataTable
        :value="filteredFact"
        paginator
        :rows="10"
        responsiveLayout="scroll"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        sortMode="multiple"
        showGridlines
        scrollable
        scrollHeight="480px"
        class="op-table"
      >
        <Column field="nomorrm" header="No. RM" sortable style="min-width: 100px" />
        <Column field="nama" header="Nama Pasien" sortable style="min-width: 160px" />
        <Column field="jeniskelamin" header="JK" sortable style="min-width: 55px" />
        <Column field="usia" header="Usia" sortable style="min-width: 60px" />
        <Column field="alamat" header="Alamat" style="min-width: 160px" />
        <Column field="kodebooking" header="Kode Booking" style="min-width: 120px" />
        <Column field="tindakan" header="Tindakan" style="min-width: 120px">
          <template #body="slotProps">
            <small class="badge badge-success"
              ><i class="far fa-clock"></i> {{ slotProps.data.tindakan }}</small
            >
            <small v-if="slotProps.data.tindakan2" class="badge badge-success"
              ><i class="far fa-clock"></i> {{ slotProps.data.tindakan2 }}</small
            >
          </template>
        </Column>
        <Column field="namapoli" header="Poli" sortable style="min-width: 120px" />
        <Column field="dokter" header="Dokter" style="min-width: 140px" />
        <Column header="Tgl Operasi" sortable style="min-width: 140px">
          <template #body="slotProps">
            {{ formatDate_database(slotProps.data.tanggaloperasi) }}
          </template>
        </Column>
        <Column field="jam" header="Jam" style="min-width: 70px" />
        <Column header="Status" style="min-width: 120px">
          <template #body="slotProps">
            <span :class="['status-badge', statusBadgeClass(slotProps.data.terlaksana)]">
              <i :class="statusBadgeIcon(slotProps.data.terlaksana)"></i>
              {{ statusBadgeLabel(slotProps.data.terlaksana) }}
            </span>
          </template>
        </Column>
        <Column header="Aksi" style="min-width: 120px; position: sticky; right: 0">
          <template #body="slotProps">
            <div class="action-btns">
              <Button
                icon="pi pi-pencil"
                class="btn-edit"
                size="small"
                v-tooltip.top="'Edit Data Operasi'"
                @click="openEditModal(slotProps.data)"
              />
              <Button
                icon="pi pi-arrow-right"
                class="btn-goto"
                size="small"
                v-tooltip.top="'Lakukan Persiapan'"
                @click="lakukan_persiapan(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Panel>

    <!-- ═══════════════════════════════════════════════════════
         MODAL UPDATE OPERASI
    ═══════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="modalVisible"
      modal
      :closable="true"
      :style="{ width: '620px', maxWidth: '96vw' }"
      :pt="{
        root: { class: 'op-modal' },
        header: { class: 'op-modal-header' },
        content: { class: 'op-modal-content' },
        footer: { class: 'op-modal-footer' },
      }"
    >
      <!-- Modal Header -->
      <template #header>
        <div class="modal-hd-wrap">
          <div class="modal-hd-icon"><i class="pi pi-calendar-plus"></i></div>
          <div>
            <div class="modal-hd-title">Update Data Operasi</div>
            <div class="modal-hd-sub" v-if="editForm.nama">
              <i class="pi pi-user"></i>&nbsp;{{ editForm.nama }}
              &nbsp;&nbsp;
              <i class="pi pi-id-card"></i>&nbsp;{{ editForm.nomorrm }}
            </div>
          </div>
        </div>
      </template>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Status strip -->
        <div :class="['status-strip', currentStatusStripClass]">
          <i :class="currentStatusIcon"></i>
          <span
            >Status Saat Ini: <strong>{{ currentStatusLabel }}</strong></span
          >
        </div>

        <!-- ── Informasi Pasien (readonly) ── -->
        <div class="mcard">
          <div class="mcard-label"><i class="pi pi-user"></i> Informasi Pasien</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">No. RM</span>
              <span class="info-val">{{ editForm.nomorrm || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Nama</span>
              <span class="info-val">{{ editForm.nama || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Kode Booking</span>
              <span class="info-val">{{ editForm.kodebooking || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Dokter</span>
              <span class="info-val">{{ editForm.dokter || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- ── Jenis Tindakan ── -->

        <div class="mcard">
          <div class="mcard-label"><i class="pi pi-heart"></i> Jenis Tindakan Operasi</div>
          <div class="field-wrap">
            <label class="field-label">Pilih Tindakan 1<span class="req">*</span></label>
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
              <template #option="sp">
                <div class="tindakan-opt">
                  <span class="tindakan-kode">{{ sp.option.IDBARANG }}</span>
                  <span>{{ sp.option.NAMA }}</span>
                </div>
              </template>
            </Select>
          </div>
          <div class="field-wrap mt-3">
            <label class="field-label">Pilih Tindakan 2 </label>
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
              <template #option="sp">
                <div class="tindakan-opt">
                  <span class="tindakan-kode">{{ sp.option.IDBARANG }}</span>
                  <span>{{ sp.option.NAMA }}</span>
                </div>
              </template>
            </Select>
          </div>
        </div>

        <!-- ── Jadwal ── -->
        <div class="mcard">
          <div class="mcard-label"><i class="pi pi-clock"></i> Jadwal Operasi</div>
          <div class="two-col">
            <div class="field-wrap">
              <label class="field-label">Tanggal Operasi <span class="req">*</span></label>
              <DatePicker
                v-model="editForm.tanggaloperasi"
                dateFormat="dd M yy"
                placeholder="Pilih tanggal"
                showIcon
                iconDisplay="input"
                class="w-full"
              />
            </div>
            <div class="field-wrap">
              <label class="field-label">Jam Operasi <span class="req">*</span></label>

              <DatePicker id="datepicker-timeonly" v-model="editForm.jam" timeOnly fluid />
              <!-- <InputText
                v-model="editForm.jam"
                placeholder="08:00"
                class="w-full"
                maxlength="5"
                @input="onJamInput"
              /> -->
            </div>
          </div>
        </div>

        <!-- ── Ruang Operasi ── -->
        <div class="mcard">
          <div class="mcard-label"><i class="pi pi-building"></i> Ruang Operasi</div>
          <div class="field-wrap">
            <label class="field-label">Pilih Ruang <span class="req">*</span></label>
            <Select
              v-model="editForm.ruangoperasi"
              :options="ruang_operasi"
              optionLabel="nama"
              optionValue="id"
              placeholder="— Pilih ruang operasi —"
              class="w-full"
            >
              <template #option="sp">
                <div class="ruang-opt">
                  <i class="pi pi-building" style="color: #71b280"></i>
                  <span>{{ sp.option.nama }}</span>
                </div>
              </template>
            </Select>
          </div>
        </div>

        <!-- ── Status ── -->
        <div class="mcard">
          <div class="mcard-label"><i class="pi pi-flag"></i> Perubahan Status</div>
          <div class="status-chips">
            <div
              v-for="s in statusOptions"
              :key="s.value"
              :class="['schip', s.cls, { active: editForm.terlaksana === s.value }]"
              @click="editForm.terlaksana = s.value"
            >
              <div class="schip-icon"><i :class="s.icon"></i></div>
              <div class="schip-body">
                <div class="schip-label">{{ s.label }}</div>
                <div class="schip-desc">{{ s.desc }}</div>
              </div>
              <div class="schip-check" v-if="editForm.terlaksana === s.value">
                <i class="pi pi-check"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Catatan ── -->
        <div class="mcard">
          <div class="mcard-label">
            <i class="pi pi-file-edit"></i> Catatan Perubahan <span class="opt-tag">Opsional</span>
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
      <!-- /modal-body -->

      <!-- Modal Footer -->
      <template #footer>
        <div class="modal-foot">
          <Button
            label="Batal"
            icon="pi pi-times"
            class="btn-cancel"
            severity="secondary"
            outlined
            @click="modalVisible = false"
          />
          <Button
            label="Simpan Perubahan"
            icon="pi pi-save"
            class="btn-save"
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

// ─── Stores ──────────────────────────────────────────────────────────────────
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
const router = useRouter()

// ─── Page State ──────────────────────────────────────────────────────────────
const loading = ref(false)
const fact = ref([])
const globalFilter = ref('')
const startDate = ref(new Date())
const endDate = ref(new Date())

// ─── Modal State ─────────────────────────────────────────────────────────────
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

// ─── Computed ─────────────────────────────────────────────────────────────────
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

const currentStatusLabel = computed(() => {
  return statusOptions.find((s) => s.value === editForm.value.terlaksana)?.label ?? '—'
})
const currentStatusIcon = computed(() => {
  return statusOptions.find((s) => s.value === editForm.value.terlaksana)?.icon ?? 'pi pi-question'
})
const currentStatusStripClass = computed(() => {
  const map = { 0: 'strip-blue', 1: 'strip-green', 2: 'strip-red' }
  return map[editForm.value.terlaksana] ?? 'strip-blue'
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const renderDate = (row) => {
  if (!row.tanggaloperasi) return '—'
  return new Date(row.tanggaloperasi).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const statusBadgeClass = (val) => {
  const map = { 0: 'badge-blue', 1: 'badge-green', 2: 'badge-red' }
  return map[Number(val)] ?? 'badge-blue'
}
const statusBadgeIcon = (val) => {
  return statusOptions.find((s) => s.value === Number(val))?.icon ?? 'pi pi-circle'
}
const statusBadgeLabel = (val) => {
  return statusOptions.find((s) => s.value === Number(val))?.label ?? '—'
}

const onJamInput = (e) => {
  let v = e.target.value.replace(/\D/g, '')
  if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2, 4)
  editForm.value.jam = v
}

// ─── Actions ──────────────────────────────────────────────────────────────────
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

// ─── Fetch ────────────────────────────────────────────────────────────────────
const fetchData = async () => {
  try {
    loading.value = true
    const param = {
      tanggalawal: formatDate_database(startDate.value),
      tanggalakhir: formatDate_database(endDate.value),
      id_client: id_client.value,
      mode: 3,
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
      fact.value = []
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
      fact.value = []
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

// ─── Submit Update ────────────────────────────────────────────────────────────
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
/* ══════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════ */
.hero-section {
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 0.75rem;
  color: white;
  box-shadow: 0 12px 32px rgba(19, 78, 94, 0.28);
}
.hero-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.hero-icon {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.hero-title {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}
.hero-description {
  font-size: 0.8rem;
  opacity: 0.88;
  line-height: 1.55;
  margin: 0;
}
.hero-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  min-width: 140px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.stat-card.stat-green {
  background: rgba(34, 197, 94, 0.25);
  border-color: rgba(34, 197, 94, 0.4);
}
.stat-card.stat-red {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.4);
}
.stat-icon {
  font-size: 1.1rem;
  opacity: 0.85;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
.stat-label {
  font-size: 0.72rem;
  opacity: 0.85;
  font-weight: 500;
}

/* ══════════════════════════════════════════════════
   FILTER
══════════════════════════════════════════════════ */
.filter-section {
  background: white;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  border: 1px solid #e9edf2;
}
.filter-header {
  margin-bottom: 1rem;
}
.filter-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}
.filter-title i {
  color: #71b280;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-action {
  justify-content: flex-end;
}
.filter-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ══════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════ */
.table-panel {
  margin-top: 0;
}

:deep(.op-table .p-datatable-thead > tr > th) {
  font-weight: 700;
  font-size: 0.78rem;
  border: 1px solid #2d7a5a;
  white-space: nowrap;
}
:deep(.op-table .p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f7faf8;
}
:deep(.op-table .p-datatable-tbody > tr:hover) {
  background-color: #e8f5ec !important;
}
:deep(.op-table .p-datatable-tbody > tr > td) {
  padding: 0.45rem 0.65rem;
  font-size: 0.82rem;
  border-color: #e5eee8;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.65rem;
  border-radius: 20px;
  font-size: 0.73rem;
  font-weight: 700;
}
.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-green {
  background: #dcfce7;
  color: #15803d;
}
.badge-red {
  background: #fee2e2;
  color: #b91c1c;
}

.action-btns {
  display: flex;
  gap: 0.4rem;
}
.btn-edit {
  background: #f0f9ff !important;
  border: 1px solid #bae6fd !important;
  color: #0369a1 !important;
}
.btn-edit:hover {
  background: #0ea5e9 !important;
  color: white !important;
}
.btn-goto {
  background: #f0fdf4 !important;
  border: 1px solid #bbf7d0 !important;
  color: #15803d !important;
}
.btn-goto:hover {
  background: #22c55e !important;
  color: white !important;
}

/* ══════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════ */
:deep(.op-modal-header) {
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
  padding: 1.1rem 1.5rem;
  border-radius: 10px 10px 0 0;
}
:deep(.op-modal-content) {
  padding: 0;
  background: #f4f8f5;
}
:deep(.op-modal-footer) {
  padding: 1rem 1.5rem;
  background: #eaf2ec;
  border-top: 1px solid #d0e8d5;
}

.modal-hd-wrap {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: white;
}
.modal-hd-icon {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  padding: 0.7rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
}
.modal-hd-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}
.modal-hd-sub {
  font-size: 0.77rem;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 0.1rem;
}

/* ── Modal Body ── */
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

/* Status strip */
.status-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 500;
}
.strip-blue {
  background: #dbeafe;
  color: #1d4ed8;
  border-left: 4px solid #3b82f6;
}
.strip-green {
  background: #dcfce7;
  color: #15803d;
  border-left: 4px solid #22c55e;
}
.strip-red {
  background: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

/* Cards */
.mcard {
  background: white;
  border-radius: 10px;
  padding: 0.2rem 1.1rem;
  border: 1px solid #deeae1;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.mcard-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.mcard-label i {
  color: #71b280;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.info-key {
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.info-val {
  font-size: 0.84rem;
  font-weight: 600;
  color: #1e293b;
}

/* Fields */
.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
}
.req {
  color: #ef4444;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Dropdown options */
.tindakan-opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.tindakan-kode {
  font-size: 0.68rem;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  min-width: 58px;
  text-align: center;
}
.ruang-opt {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Status Chips */
.status-chips {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}
.schip {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 2px solid transparent;
  position: relative;
  user-select: none;
}
.schip-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.schip-label {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
}
.schip-desc {
  font-size: 0.67rem;
  opacity: 0.75;
  margin-top: 0.2rem;
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
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
}

.schip-green {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}
.schip-green.active {
  background: #22c55e;
  color: white;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.35);
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
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.schip-check {
  position: absolute;
  top: -7px;
  right: -7px;
  background: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}
.schip-check i {
  font-size: 0.62rem;
  color: #15803d;
  font-weight: 900;
}

/* Opt tag */
.opt-tag {
  font-size: 0.62rem;
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  font-weight: 600;
  margin-left: 0.4rem;
  text-transform: none;
  letter-spacing: 0;
}

/* Footer */
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* PrimeVue input overrides */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-textarea) {
  border-radius: 8px;
  font-size: 0.87rem;
}
:deep(.p-inputtext:focus),
:deep(.p-dropdown.p-focus),
:deep(.p-dropdown:focus) {
  border-color: #71b280 !important;
  box-shadow: 0 0 0 3px rgba(113, 178, 128, 0.22) !important;
}
:deep(.w-full) {
  width: 100% !important;
}
</style>
