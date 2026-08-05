<template>
  <div>
    <Dialog
      v-model:visible="showDialog"
      modal
      :style="{ width: '80vw' }"
      :closable="true"
      header="Riwayat Surat Kontrol Ulang"
    >
      <!-- Toolbar -->
      <div class="filter-bar">
        <div style="flex: 1; font-size: 12px; color: #64748b">
          <i class="pi pi-info-circle mr-1"></i>
          Menampilkan riwayat kontrol ulang untuk pasien dengan No. RM
          <strong>{{ nomr || '—' }}</strong>
        </div>
        <Button
          label="Muat Ulang"
          icon="pi pi-refresh"
          severity="secondary"
          size="small"
          :loading="isLoading"
          @click="fetchData"
        />
      </div>

      <!-- Stats Bar -->
      <div v-if="!isLoading && listData.length > 0" class="stats-bar">
        <div class="stat-item">
          <span class="stat-val">{{ listData.length }}</span>
          <span class="stat-lbl">Total SKU</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <i class="pi pi-spin pi-spinner loading-icon"></i>
        <span>Memuat riwayat surat kontrol ulang...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isLoading && listData.length === 0" class="empty-state">
        <i class="pi pi-inbox empty-icon"></i>
        <h3 class="empty-title">Tidak Ada Data</h3>
        <p class="empty-desc">
          Tidak ditemukan riwayat surat kontrol ulang pada periode yang dipilih.
        </p>
      </div>

      <!-- Table -->
      <div v-else class="table-responsive" style="max-height: 480px; overflow-y: auto">
        <table class="table table-bordered table-striped table-hover">
          <thead class="thead-light sticky-top">
            <tr>
              <th style="width: 3%">#</th>
              <th style="width: 16%" class="th-sort" @click="setSort('NO_KONTROL_ULANG')">
                No. Kontrol Ulang <i :class="sortIcon('NO_KONTROL_ULANG')" class="sort-icon"></i>
              </th>
              <th style="width: 16%" class="th-sort" @click="setSort('NOSEP')">
                No. SEP <i :class="sortIcon('NOSEP')" class="sort-icon"></i>
              </th>
              <th style="width: 8%" class="th-sort" @click="setSort('TGLSEP')">
                Tgl SEP <i :class="sortIcon('TGLSEP')" class="sort-icon"></i>
              </th>
              <th style="width: 8%" class="th-sort" @click="setSort('TANGGAL_KONTROL')">
                Tgl Kontrol <i :class="sortIcon('TANGGAL_KONTROL')" class="sort-icon"></i>
              </th>
              <th style="width: 10%" class="th-sort" @click="setSort('POLI')">
                Poli <i :class="sortIcon('POLI')" class="sort-icon"></i>
              </th>
              <th style="width: 14%" class="th-sort" @click="setSort('NAMADOKTER')">
                Dokter <i :class="sortIcon('NAMADOKTER')" class="sort-icon"></i>
              </th>
              <th class="th-sort" @click="setSort('KODE_DIAGNOSA')">
                Diagnosa <i :class="sortIcon('KODE_DIAGNOSA')" class="sort-icon"></i>
              </th>
              <th style="width: 9%" class="th-sort" @click="setSort('STTS')">
                Status <i :class="sortIcon('STTS')" class="sort-icon"></i>
              </th>
              <th style="width: 5%; text-align: center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in sortedData" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="copy-cell">
                  <code style="font-size: 0.73rem; color: #2563eb">{{
                    item.NO_KONTROL_ULANG || '—'
                  }}</code>
                  <button
                    v-if="item.NO_KONTROL_ULANG"
                    class="copy-btn"
                    :class="{ 'copy-btn--copied': copiedIndex === index }"
                    @click="copyToClipboard(item.NO_KONTROL_ULANG, index)"
                    :title="copiedIndex === index ? 'Tersalin!' : 'Salin No. Kontrol'"
                  >
                    <i :class="copiedIndex === index ? 'pi pi-check' : 'pi pi-copy'"></i>
                  </button>
                </div>
              </td>
              <td>
                <code style="font-size: 0.73rem; color: #475569">{{ item.NOSEP || '—' }}</code>
              </td>
              <td style="font-size: 0.82rem; white-space: nowrap">{{ item.TGLSEP || '—' }}</td>
              <td style="font-size: 0.82rem; white-space: nowrap; color: #0369a1; font-weight: 600">
                {{ item.TANGGAL_KONTROL || '—' }}
              </td>
              <td style="font-size: 0.82rem; color: steelblue; font-weight: 600">
                {{ item.POLI || '—' }}
              </td>
              <td style="font-size: 0.82rem">{{ item.NAMADOKTER || '—' }}</td>
              <td style="font-size: 0.78rem">{{ item.KODE_DIAGNOSA || '—' }}</td>
              <td class="text-center">
                <Tag
                  :severity="item.STTS === 'Terbit SEP' ? 'success' : 'secondary'"
                  :value="item.STTS || '—'"
                  style="font-size: 0.65rem"
                />
              </td>
              <td class="text-center">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  severity="warning"
                  rounded
                  title="Edit Surat Kontrol"
                  @click="openEditDialog(item)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-summary" v-if="!isLoading && listData.length > 0">
        <small class="text-muted">Menampilkan {{ listData.length }} riwayat kontrol ulang</small>
      </div>

      <div class="button-group mt-2">
        <Button
          label="Data Server BPJS"
          icon="pi pi-server"
          severity="info"
          @click="openBpjsModal"
        />
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="showDialog = false"
        />
      </div>
    </Dialog>
    <!-- ── Modal Data Server BPJS ── -->
    <Dialog
      v-model:visible="bpjsDetailVisible"
      modal
      :style="{ width: '72rem' }"
      :closable="true"
      header="Data Server BPJS — Rencana Kontrol Ulang"
    >
      <!-- Filter bulan/tahun -->
      <div class="filter-bar" style="margin-bottom: 1rem">
        <div style="flex: 1; font-size: 12px; color: #64748b">
          <i class="pi pi-credit-card mr-1"></i>
          No. Kartu: <strong>{{ noKartu || '—' }}</strong>
        </div>
        <div class="filter-group" style="flex-direction: row; align-items: center; gap: 8px">
          <label class="filter-label" style="margin: 0">Bulan/Tahun:</label>
          <DatePicker
            v-model="bpjsTanggal"
            view="month"
            dateFormat="MM yy"
            placeholder="Pilih bulan"
            showIcon
            iconDisplay="input"
            style="min-width: 160px"
          />
        </div>
        <Button
          label="Cari"
          icon="pi pi-search"
          severity="info"
          :loading="bpjsDetailLoading"
          @click="fetchBpjsList"
        />
      </div>

      <!-- Loading -->
      <div v-if="bpjsDetailLoading" class="loading-state">
        <i class="pi pi-spin pi-spinner loading-icon"></i>
        <span>Mengambil data dari server BPJS...</span>
      </div>

      <!-- Empty -->
      <div v-else-if="!bpjsDetailLoading && bpjsList.length === 0" class="empty-state">
        <i class="pi pi-inbox empty-icon"></i>
        <h3 class="empty-title">{{ bpjsDetailError ? 'Gagal Memuat' : 'Tidak Ada Data' }}</h3>
        <p class="empty-desc">
          {{ bpjsDetailError || 'Tidak ada rencana kontrol pada periode ini.' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="table-responsive" style="max-height: 440px; overflow-y: auto">
        <table class="table table-bordered table-striped table-hover">
          <thead class="thead-light sticky-top">
            <tr>
              <th style="width: 3%">#</th>
              <th style="width: 17%">No. Surat Kontrol</th>
              <th style="width: 9%">Jenis</th>
              <th style="width: 9%">Tgl Kontrol</th>
              <th style="width: 8%">Tgl SEP</th>
              <th style="width: 15%">Poli Tujuan</th>
              <th style="width: 15%">Dokter</th>
              <th style="width: 9%; text-align: center">Terbit SEP</th>
              <th style="width: 6%; text-align: center">Sync</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in bpjsList" :key="i">
              <td class="text-center">{{ i + 1 }}</td>
              <td>
                <code style="font-size: 0.73rem; color: #2563eb">
                  {{ item.noSuratKontrol || '—' }}
                </code>
              </td>
              <td style="font-size: 0.78rem">{{ item.namaJnsKontrol || '—' }}</td>
              <td style="font-size: 0.82rem; white-space: nowrap; color: #0369a1; font-weight: 600">
                {{ item.tglRencanaKontrol || '—' }}
              </td>
              <td style="font-size: 0.82rem; white-space: nowrap">{{ item.tglSEP || '—' }}</td>
              <td style="font-size: 0.82rem; color: steelblue">
                {{ item.namaPoliTujuan || item.poliTujuan || '—' }}
              </td>
              <td style="font-size: 0.82rem">{{ item.namaDokter || '—' }}</td>
              <td class="text-center">
                <Tag
                  :severity="item.terbitSEP === 'Sudah' ? 'success' : 'secondary'"
                  :value="item.terbitSEP || '—'"
                  style="font-size: 0.65rem"
                />
              </td>
              <td class="text-center">
                <Button
                  size="small"
                  :icon="
                    syncResultMap[item.noSuratKontrol] === 'success'
                      ? 'pi pi-check'
                      : syncResultMap[item.noSuratKontrol] === 'error'
                        ? 'pi pi-times'
                        : 'pi pi-cloud-download'
                  "
                  :severity="
                    syncResultMap[item.noSuratKontrol] === 'success'
                      ? 'success'
                      : syncResultMap[item.noSuratKontrol] === 'error'
                        ? 'danger'
                        : 'info'
                  "
                  :loading="!!syncingMap[item.noSuratKontrol]"
                  :disabled="!!syncingMap[item.noSuratKontrol]"
                  :title="`Sync ${item.noSuratKontrol} ke SIMRS`"
                  rounded
                  @click="syncItem(item)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-summary" v-if="!bpjsDetailLoading && bpjsList.length > 0">
        <small class="text-muted">{{ bpjsList.length }} rencana kontrol dari server BPJS</small>
      </div>

      <div class="button-group mt-3">
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          outlined
          @click="bpjsDetailVisible = false"
        />
      </div>
    </Dialog>

    <!-- ── Dialog Edit Surat Kontrol ── -->
    <Dialog
      v-model:visible="editDialog"
      modal
      :style="{ width: '480px' }"
      :closable="!isSaving"
      header="Edit Surat Kontrol"
    >
      <div class="edit-form">
        <!-- No. Kontrol (readonly) -->
        <div class="form-row">
          <label class="form-label">No. Kontrol Ulang</label>
          <InputText
            :value="editForm.NO_KONTROL_ULANG || '—'"
            disabled
            class="w-full"
            style="font-family: monospace; font-size: 0.85rem"
          />
        </div>

        <!-- No. SEP (readonly) -->
        <div class="form-row">
          <label class="form-label">No. SEP</label>
          <InputText
            :value="editForm.NOSEP || '—'"
            disabled
            class="w-full"
            style="font-family: monospace; font-size: 0.85rem"
          />
        </div>

        <!-- Poliklinik -->
        <div class="form-row">
          <label class="form-label">Poliklinik</label>
          <Select
            v-model="editForm.POLI_SELECTED"
            :options="listPoliKlinik"
            optionLabel="nama"
            placeholder="Pilih Poliklinik"
            :loading="isLoadingPoli"
            filter
            appendTo="body"
            class="w-full"
          />
        </div>

        <!-- Tanggal Kontrol -->
        <div class="form-row">
          <label class="form-label">Tanggal Kontrol <span class="required">*</span></label>
          <DatePicker
            v-model="editForm.TANGGAL_KONTROL_DATE"
            dateFormat="yy-mm-dd"
            showIcon
            iconDisplay="input"
            class="w-full"
            placeholder="Pilih tanggal kontrol"
          />
        </div>

        <!-- Diagnosa -->
        <div class="form-row">
          <label class="form-label">Kode Diagnosa</label>
          <InputText
            v-model="editForm.KODE_DIAGNOSA"
            class="w-full"
            placeholder="Contoh: J00, A15.0"
          />
        </div>
      </div>

      <div class="button-group mt-3">
        <Button
          label="Simpan"
          icon="pi pi-save"
          severity="success"
          :loading="isSaving"
          @click="saveEdit"
        />
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="isSaving"
          @click="editDialog = false"
        />
      </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const props = defineProps({
  noKartu: { type: String, default: null },
  nomr: { type: String, default: null },
  noregister: { type: String, default: null },
})

const showDialog = ref(false)
const isLoading = ref(false)
const listData = ref([])
const copiedIndex = ref(null)
const sortKey = ref('TANGGAL_KONTROL')
const sortDir = ref('desc')

const sortedData = computed(() => {
  if (!sortKey.value) return listData.value
  return [...listData.value].sort((a, b) => {
    const va = a[sortKey.value] ?? ''
    const vb = b[sortKey.value] ?? ''
    const cmp = String(va).localeCompare(String(vb), 'id', { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const setSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortIcon = (key) => {
  if (sortKey.value !== key) return 'pi pi-sort-alt'
  return sortDir.value === 'asc' ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down-alt'
}

const copyToClipboard = (text, index) => {
  navigator.clipboard.writeText(text).then(() => {
    copiedIndex.value = index
    setTimeout(() => {
      copiedIndex.value = null
    }, 1800)
  })
}

// ── BPJS live modal ──────────────────────────────────────────
const bpjsDetailVisible = ref(false)
const bpjsDetailLoading = ref(false)
const bpjsList = ref([])
const bpjsDetailError = ref(null)
const bpjsTanggal = ref(new Date())

const syncingMap = ref({}) // { [noSuratKontrol]: true } saat loading
const syncResultMap = ref({}) // { [noSuratKontrol]: 'success' | 'error' }

const openBpjsModal = () => {
  bpjsDetailVisible.value = true
  bpjsList.value = []
  bpjsDetailError.value = null
  syncingMap.value = {}
  syncResultMap.value = {}
  fetchBpjsList()
}

const fetchBpjsList = async () => {
  if (!props.noKartu) {
    bpjsDetailError.value = 'No. Kartu BPJS tidak tersedia.'
    return
  }
  bpjsDetailLoading.value = true
  bpjsList.value = []
  bpjsDetailError.value = null
  try {
    const url = configStore.apiBaseUrl
    const d = bpjsTanggal.value ? new Date(bpjsTanggal.value) : new Date()
    const y = d.getFullYear()
    const m = d.getMonth()
    const tglAwal = new Date(y, m, 1).toISOString().slice(0, 10)
    const tglAkhir = new Date(y, m + 1, 0).toISOString().slice(0, 10)
    const res = await axios.post(`${url}/index.php/api/bpjs_api/ListRencanaKontrol`, {
      no_kartu: props.noKartu,
      tanggal: tglAwal,
      tanggal_akhir: tglAkhir,
      id_client: id_client.value,
    })
    const code = res.data?.metaData?.code
    if (code === '200' || code === 200) {
      const raw = res.data?.response

      bpjsList.value = Array.isArray(raw) ? raw : Array.isArray(raw?.list) ? raw.list : []
    } else {
      bpjsDetailError.value = res.data?.metaData?.message ?? 'Data tidak ditemukan.'
    }
  } catch {
    bpjsDetailError.value = 'Koneksi ke server BPJS gagal.'
  } finally {
    bpjsDetailLoading.value = false
  }
}

const syncItem = async (item) => {
  const key = item.noSuratKontrol
  if (syncingMap.value[key]) return

  syncingMap.value = { ...syncingMap.value, [key]: true }
  syncResultMap.value = { ...syncResultMap.value, [key]: null }

  try {
    const payload = {
      no_kontrol_ulang: item.noSuratKontrol,
      noregister: props.noregister,
      noSepAsalKontrol: item.noSepAsalKontrol,
      noKartu: item.noKartu,
      norm: props.nomr,
      kodeDokter: item.kodeDokter,
      poliTujuan: item.poliTujuan,
      tglRencanaKontrol: item.tglRencanaKontrol,
      tglSEP: item.tglSEP,
      terbitSEP: item.terbitSEP,
      kodeDiagnosa: '',
      user_id: authStore.user_id,
      id_client: id_client.value,
    }

    console.log('Sync Result', JSON.stringify(payload))
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/bpjs_api/sync_no_kontrol_ulang`, payload)

    const code = res.data?.code
    const action = res.data?.action

    if (code === 200 || code === '200') {
      syncResultMap.value = { ...syncResultMap.value, [key]: 'success' }
      toast.add({
        severity: 'success',
        summary: 'Sync Berhasil',
        detail: `${key} — ${action === 'insert' ? 'Data baru disimpan' : 'Data diperbarui'} ke SIMRS`,
        life: 3500,
      })
    } else {
      syncResultMap.value = { ...syncResultMap.value, [key]: 'error' }
      toast.add({
        severity: 'error',
        summary: 'Sync Gagal',
        detail: res.data?.message || 'Terjadi kesalahan saat menyimpan data.',
        life: 5000,
      })
    }
  } catch {
    syncResultMap.value = { ...syncResultMap.value, [key]: 'error' }
    toast.add({
      severity: 'error',
      summary: 'Sync Gagal',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    const next = { ...syncingMap.value }
    delete next[key]
    syncingMap.value = next
  }
}

const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })

const fetchData = async () => {
  if (!props.nomr) {
    showError('No. Rekam Medis pasien tidak tersedia.')
    return
  }
  isLoading.value = true
  listData.value = []
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.get(
      `${url}/index.php/api/transaksi_pasien/getdatakontrolulang/${id_client.value}/${props.nomr}/3`,
    )

    console.log('Riwayat Surat Kontrol Ulang', response.data)
    const body = response.data
    if (Array.isArray(body)) {
      listData.value = body
    } else if (Array.isArray(body?.data)) {
      listData.value = body.data
    } else if (Array.isArray(body?.response)) {
      listData.value = body.response
    } else {
      listData.value = []
    }
  } catch {
    showError('Gagal memuat riwayat surat kontrol ulang.')
  } finally {
    isLoading.value = false
  }
}

// ── Edit Surat Kontrol ────────────────────────────────────────
const editDialog = ref(false)
const isSaving = ref(false)
const isLoadingPoli = ref(false)
const listPoliKlinik = ref([])
const editForm = ref({
  NO_KONTROL_ULANG: '',
  NOSEP: '',
  TANGGAL_KONTROL: '',
  TANGGAL_KONTROL_DATE: null,
  KODE_DIAGNOSA: '',
  POLI_SELECTED: null,
})

const loadPoliKlinik = async () => {
  if (listPoliKlinik.value.length > 0) return
  isLoadingPoli.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.get(`${url}/index.php/api/data_referensi/datapoly/${id_client.value}`)
    if (Array.isArray(res.data)) listPoliKlinik.value = res.data
  } catch {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Gagal memuat daftar poliklinik.',
      life: 3000,
    })
  } finally {
    isLoadingPoli.value = false
  }
}

const openEditDialog = (item) => {
  const matchedPoli =
    listPoliKlinik.value.find((p) => p.nama === item.POLI || p.kode === item.POLI) || null

  editForm.value = {
    NO_KONTROL_ULANG: item.NO_KONTROL_ULANG || '',
    NOSEP: item.NOSEP || '',
    TANGGAL_KONTROL: item.TANGGAL_KONTROL || '',
    TANGGAL_KONTROL_DATE: item.TANGGAL_KONTROL ? new Date(item.TANGGAL_KONTROL) : null,
    KODE_DIAGNOSA: item.KODE_DIAGNOSA || '',
    POLI_SELECTED: matchedPoli,
  }
  loadPoliKlinik()
  editDialog.value = true
}

const saveEdit = async () => {
  if (!editForm.value.TANGGAL_KONTROL_DATE) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Tanggal kontrol wajib diisi.',
      life: 3000,
    })
    return
  }

  isSaving.value = true
  try {
    const url = configStore.apiBaseUrl
    const d = new Date(editForm.value.TANGGAL_KONTROL_DATE)
    const tgl = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const payload = {
      no_kontrol: editForm.value.NO_KONTROL_ULANG,
      tanggal_kontrol: tgl,
      kode_diagnosa: editForm.value.KODE_DIAGNOSA,
      kode_poli: editForm.value.POLI_SELECTED?.kode || '',
      nama_poli: editForm.value.POLI_SELECTED?.nama || '',
      user_id: authStore.user_id,
      id_client: id_client.value,
    }

    const response = await axios.post(
      `${url}/index.php/api/data_referensi/editSuratKontrol`,
      payload,
    )

    const code = response.data?.code
    if (code === 200 || code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Surat kontrol berhasil diperbarui.',
        life: 3000,
      })
      editDialog.value = false
      fetchData()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: response.data?.message || 'Terjadi kesalahan saat menyimpan.',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    isSaving.value = false
  }
}

const open = () => {
  showDialog.value = true
  fetchData()
}

defineExpose({ open })
</script>

<style scoped>
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
.stats-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%);
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

.table-summary {
  padding: 0.4rem 0.25rem;
  text-align: right;
}
.text-muted {
  color: #94a3b8;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.th-sort {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.th-sort:hover {
  background: #e2e8f0;
}
.sort-icon {
  font-size: 0.65rem;
  margin-left: 4px;
  opacity: 0.5;
  vertical-align: middle;
}
.th-sort:hover .sort-icon,
.th-sort .pi-sort-amount-up-alt,
.th-sort .pi-sort-amount-down-alt {
  opacity: 1;
  color: #2563eb;
}

.copy-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.copy-btn {
  flex-shrink: 0;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2px 5px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.7rem;
  line-height: 1;
  transition: all 0.15s;
}
.copy-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.copy-btn--copied {
  background: #dcfce7 !important;
  border-color: #86efac !important;
  color: #16a34a !important;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem 0;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
}
.required {
  color: #ef4444;
}
</style>
