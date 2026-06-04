<template>
  <Dialog
    v-model:visible="dialogVisible"
    :style="{ width: '98vw', maxWidth: '1500px' }"
    :contentStyle="{ padding: '0.75rem 1rem 1rem', overflowX: 'hidden' }"
    :maximizable="true"
    modal
    :closable="!loadingList"
    class="list-sesi-dialog"
  >
    <!-- ══ HEADER SLOT ══ -->
    <template #header>
      <div class="sesi-dlg-hdr">
        <div class="sesi-dlg-hdr-icon">
          <i class="fas fa-hand-holding-heart"></i>
        </div>
        <div>
          <div class="sesi-dlg-hdr-title">Daftar Sesi Donor Darah</div>
          <div class="sesi-dlg-hdr-sub">Unit Transfusi Darah — Riwayat &amp; List Sesi Donor</div>
        </div>
        <Tag
          v-if="sesiList.length > 0"
          :value="`${sesiList.length} data`"
          severity="info"
          style="
            font-size: 11px;
            margin-left: 12px;
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.4);
          "
        />
      </div>
    </template>

    <Toast />
    <loading_overlay :is-loading="loadingList" message="Memuat data sesi donor..." />

    <!-- ══ STAT STRIP SESI ══ -->
    <div class="utd-stat-strip">
      <div class="strip-stat" style="--c: darkcyan">
        <i class="fas fa-hand-holding-heart strip-ico"></i>
        <span class="strip-num">{{ sesiList.length }}</span>
        <span class="strip-lbl">Total Sesi</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat" style="--c: #2e7d32">
        <i class="pi pi-check-circle strip-ico"></i>
        <span class="strip-num">{{ countByHasil('LAYAK') }}</span>
        <span class="strip-lbl">Layak</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat" style="--c: #ef6c00">
        <i class="pi pi-clock strip-ico"></i>
        <span class="strip-num">{{ countByHasil('DITUNDA') }}</span>
        <span class="strip-lbl">Ditunda</span>
      </div>
      <div class="strip-div"></div>
      <div class="strip-stat" style="--c: #c62828">
        <i class="pi pi-times-circle strip-ico"></i>
        <span class="strip-num">{{ countByHasil('DITOLAK') }}</span>
        <span class="strip-lbl">Ditolak</span>
      </div>
    </div>

    <!-- ══ FILTER BAR ══ -->
    <div class="utd-filter-bar">
      <div class="utd-filter-group">
        <label class="utd-filter-label"><i class="pi pi-calendar me-1"></i>Dari Tanggal</label>
        <DatePicker
          v-model="filterTglDari"
          dateFormat="dd/mm/yy"
          placeholder="Dari..."
          class="filter-datepicker"
        />
      </div>
      <div class="utd-filter-group">
        <label class="utd-filter-label"><i class="pi pi-calendar me-1"></i>Sampai</label>
        <DatePicker
          v-model="filterTglSampai"
          dateFormat="dd/mm/yy"
          placeholder="Sampai..."
          class="filter-datepicker"
        />
      </div>
      <div class="utd-filter-group utd-filter-search">
        <label class="utd-filter-label"><i class="pi pi-search me-1"></i>Cari</label>
        <InputText
          v-model="filterKeyword"
          placeholder="No. sesi, nama, RM, jenis donor..."
          class="w-100"
        />
      </div>
      <div class="utd-filter-actions">
        <Button
          icon="pi pi-search"
          label="Cari"
          class="round-button2 btn-primary-utd"
          :loading="loadingList"
          @click="fetchSesiList"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          class="round-button2"
          v-tooltip.top="'Reset filter'"
          @click="resetFilter"
        />
        <Button
          icon="pi pi-print"
          label="Cetak Daftar"
          severity="secondary"
          class="round-button2"
          :disabled="filteredSesiList.length === 0 || loadingList"
          v-tooltip.top="'Cetak seluruh daftar yang tampil'"
          @click="cetakDaftar"
        />
      </div>
    </div>

    <!-- ══ TABEL LIST SESI DONOR ══ -->
    <div class="utd-table-wrap">
      <DataTable
        :value="filteredSesiList"
        showGridlines
        rowHover
        scrollable
        scrollHeight="60vh"
        size="small"
        responsiveLayout="scroll"
        :paginator="true"
        :rows="20"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 20, 50]"
        class="utd-datatable"
      >
        <template #empty>
          <div class="utd-empty">
            <div class="utd-empty-icon"><i class="fas fa-hand-holding-heart"></i></div>
            <p class="utd-empty-title">Belum ada data sesi donor</p>
            <small>Pilih rentang tanggal dan klik "Cari"</small>
          </div>
        </template>

        <Column header="#" style="width: 40px; text-align: center">
          <template #body="{ index }">
            <span style="font-size: 11px">{{ index + 1 }}</span>
          </template>
        </Column>

        <Column field="no_sesi" header="NO. SESI" style="min-width: 155px">
          <template #body="{ data }">
            <span class="mono fw-semibold text-teal">{{ data.no_sesi || '-' }}</span>
          </template>
        </Column>

        <Column field="nama_donor" header="PENDONOR" style="min-width: 190px">
          <template #body="{ data }">
            <div>
              <div
                class="fw-semibold"
                style="font-size: 12px; display: flex; align-items: center; gap: 4px"
              >
                <i
                  :class="data.jenis_kelamin === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                  :style="{
                    color: data.jenis_kelamin === 'P' ? 'violet' : 'steelblue',
                    fontSize: '10px',
                  }"
                ></i>
                {{ data.nama_donor || '-' }}
              </div>
              <div class="mono" style="font-size: 10.5px; color: #94a3b8">
                RM: {{ data.norm || '-' }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="tgl_donor" header="TGL. DONOR" style="min-width: 120px">
          <template #body="{ data }">
            <span>{{ formatTgl(data.tgl_donor) }}</span>
          </template>
        </Column>

        <Column field="jenis_donor" header="JENIS DONOR" style="min-width: 160px">
          <template #body="{ data }">
            <Tag
              :value="jenisDonorLabel(data.jenis_donor)"
              severity="info"
              style="font-size: 10px; white-space: nowrap"
            />
          </template>
        </Column>

        <Column header="TANDA VITAL" style="min-width: 220px">
          <template #body="{ data }">
            <div class="vital-row">
              <span class="vital-chip">
                <i class="pi pi-chart-bar me-1"></i>{{ data.berat_badan }} kg
              </span>
              <span class="vital-chip">
                <i class="fas fa-heartbeat me-1"></i>{{ data.tekanan_darah }}
              </span>
              <span class="vital-chip">Hb {{ data.hemoglobin }}</span>
              <span class="vital-chip">
                <i class="pi pi-sun me-1"></i>{{ data.suhu_tubuh }}°C
              </span>
              <span class="vital-chip"> <i class="fas fa-heart me-1"></i>{{ data.nadi }}/m </span>
            </div>
          </template>
        </Column>

        <Column field="hasil_screening" header="SCREENING" style="min-width: 145px">
          <template #body="{ data }">
            <div>
              <Tag
                :value="data.hasil_screening || '-'"
                :severity="hasilScreeningSeverity(data.hasil_screening)"
                style="font-size: 10px"
              />
              <div v-if="data.alasan_tolak" class="ket-text mt-1" style="color: #c62828">
                <i class="pi pi-info-circle me-1"></i>{{ data.alasan_tolak }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="id_petugas" header="PETUGAS" style="min-width: 120px">
          <template #body="{ data }">
            <span class="mono" style="font-size: 11px">{{ data.id_petugas || '-' }}</span>
          </template>
        </Column>

        <Column field="created_at" header="DICATAT" style="min-width: 130px">
          <template #body="{ data }">
            <span style="font-size: 11px; color: #64748b">{{ formatTgl(data.created_at) }}</span>
          </template>
        </Column>

        <Column header="HASIL DONOR" frozen alignFrozen="right" style="min-width: 110px">
          <template #body="{ data }">
            <Button
              icon="pi pi-clipboard"
              label="Input"
              size="small"
              text
              rounded
              severity="warn"
              v-tooltip.top="'Input hasil donor'"
              @click="openHasilForm(data)"
            />
          </template>
        </Column>

        <Column header="AKSI" frozen alignFrozen="right" style="min-width: 70px">
          <template #body="{ data }">
            <Button
              icon="pi pi-print"
              size="small"
              text
              rounded
              severity="info"
              v-tooltip.top="'Cetak sesi ini'"
              @click="cetakSesi(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>

  <!-- ══ DIALOG FORM HASIL DONOR ══ -->
  <Dialog
    v-model:visible="showHasilForm"
    :style="{ width: '700px', maxWidth: '98vw' }"
    :contentStyle="{ padding: '1rem 1.25rem 0.5rem' }"
    modal
    :closable="!loadingHasilForm"
    class="hasil-donor-dialog"
  >
    <template #header>
      <div class="sesi-dlg-hdr">
        <div class="sesi-dlg-hdr-icon"><i class="fas fa-tint"></i></div>
        <div>
          <div class="sesi-dlg-hdr-title">Input Hasil Donor</div>
          <div class="sesi-dlg-hdr-sub">
            {{ selectedSesi?.no_sesi }} — {{ selectedSesi?.nama_donor }}
          </div>
        </div>
      </div>
    </template>

    <div class="hasil-form">
      <!-- Status Screening -->
      <div class="hasil-field">
        <label class="hasil-label">Status Screening <span class="req">*</span></label>
        <div class="status-btn-group">
          <button
            v-for="opt in statusScreeningOptions"
            :key="opt.value"
            :class="[
              'status-btn',
              `status-btn--${opt.value.toLowerCase()}`,
              { active: hasilForm.status_screening === opt.value },
            ]"
            type="button"
            @click="hasilForm.status_screening = opt.value"
          >
            <i
              :class="
                opt.value === 'LAYAK'
                  ? 'pi pi-check-circle'
                  : opt.value === 'DITUNDA'
                    ? 'pi pi-clock'
                    : 'pi pi-times-circle'
              "
              class="me-1"
            ></i>
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Kantong Darah — hanya tampil jika Diterima -->
      <template v-if="hasilForm.status_screening === 'LAYAK'">
        <div class="hasil-field">
          <label class="hasil-label">Jumlah Kantong <span class="req">*</span></label>
          <InputNumber
            v-model="hasilForm.jumlah_kantong"
            :min="1"
            :max="10"
            showButtons
            buttonLayout="horizontal"
            decrementButtonClass="p-button-secondary"
            incrementButtonClass="p-button-secondary"
            style="width: 130px"
          />
        </div>

        <div class="hasil-field">
          <label class="hasil-label">Detail Kantong Darah</label>
          <div class="kantong-inputs">
            <div v-for="(k, i) in kantongList" :key="i" class="kantong-card">
              <div class="kantong-card-header">
                <span class="kantong-num">{{ i + 1 }}</span>
                <span class="kantong-card-title">Kantong #{{ i + 1 }}</span>
              </div>
              <div class="kantong-card-body">
                <div class="kantong-grid">
                  <div class="kantong-field">
                    <label class="kantong-field-label">No. Kantong</label>
                    <InputText
                      v-model="k.no_kantong"
                      :placeholder="`No. kantong ${i + 1}`"
                      size="small"
                      style="width: 100%"
                    />
                  </div>
                  <div class="kantong-field">
                    <label class="kantong-field-label"
                      >Golongan Darah <span class="req">*</span></label
                    >
                    <Select
                      v-model="k.golongan"
                      :options="golonganOptions"
                      placeholder="Pilih"
                      size="small"
                      style="width: 100%"
                    />
                  </div>
                  <div class="kantong-field">
                    <label class="kantong-field-label"
                      >Jenis Komponen <span class="req">*</span></label
                    >
                    <Select
                      v-model="k.jenis_komponen"
                      :options="jenisKomponenOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Pilih"
                      size="small"
                      style="width: 100%"
                    />
                  </div>
                  <div class="kantong-field">
                    <label class="kantong-field-label">Volume (ml)</label>
                    <InputNumber
                      v-model="k.volume_ml"
                      :min="50"
                      :max="1000"
                      :step="50"
                      size="small"
                      style="width: 100%"
                    />
                  </div>
                  <div class="kantong-field">
                    <label class="kantong-field-label">Tgl. Expired</label>
                    <DatePicker
                      v-model="k.tgl_expired"
                      dateFormat="dd/mm/yy"
                      placeholder="Tgl expired"
                      size="small"
                      style="width: 100%"
                    />
                  </div>
                  <div class="kantong-field">
                    <label class="kantong-field-label">Suhu Simpan (°C)</label>
                    <InputNumber
                      v-model="k.suhu"
                      :min="-30"
                      :max="40"
                      :maxFractionDigits="1"
                      placeholder="Opsional"
                      size="small"
                      style="width: 100%"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Catatan -->
      <div class="hasil-field">
        <label class="hasil-label">
          {{ hasilForm.status_screening === 'DITOLAK' ? 'Alasan Penolakan' : 'Catatan' }}
        </label>
        <Textarea
          v-model="hasilForm.catatan"
          :placeholder="
            hasilForm.status_screening === 'DITOLAK'
              ? 'Masukkan alasan penolakan...'
              : 'Catatan tambahan (opsional)...'
          "
          rows="3"
          class="w-100"
          autoResize
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="Batal"
        severity="secondary"
        outlined
        class="round-button2"
        :disabled="loadingHasilForm"
        @click="showHasilForm = false"
      />
      <Button
        label="Simpan"
        icon="pi pi-save"
        class="round-button2 btn-primary-utd"
        :loading="loadingHasilForm"
        @click="simpanHasil"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const router = useRouter()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()

// ── Dialog Props / Emits ───────────────────────────────────
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// ── Auto-refresh saat dialog dibuka ───────────────────────
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) fetchSesiList()
  },
)

// ── State ─────────────────────────────────────────────────
const sesiList = ref([])
const loadingList = ref(false)
const filterTglDari = ref(new Date())
const filterTglSampai = ref(new Date())
const filterKeyword = ref('')

// ── Form Hasil Donor ──────────────────────────────────────
const showHasilForm = ref(false)
const loadingHasilForm = ref(false)
const selectedSesi = ref(null)

const statusScreeningOptions = [
  { label: 'Diterima', value: 'LAYAK' },
  { label: 'Diproses', value: 'DITUNDA' },
  { label: 'Ditolak', value: 'DITOLAK' },
]

const hasilFormDefault = { status_screening: 'LAYAK', jumlah_kantong: 1, catatan: '' }
const hasilForm = ref({ ...hasilFormDefault })

const kantongDefault = () => ({
  no_kantong: '',
  golongan: '',
  jenis_komponen: 'WB',
  volume_ml: 450,
  tgl_expired: null,
  suhu: null,
})
const kantongList = ref([kantongDefault()])

const golonganOptions = ['A', 'B', 'AB', 'O']
const jenisKomponenOptions = [
  { label: 'Whole Blood (WB)', value: 'WB' },
  { label: 'Packed Red Cells (PRC)', value: 'PRC' },
  { label: 'Fresh Frozen Plasma (FFP)', value: 'FFP' },
  { label: 'Thrombocyte Concentrate (TC)', value: 'TC' },
  { label: 'Washed Erythrocyte (WE)', value: 'WE' },
]

// ── Computed ─────────────────────────────────────────────
const filteredSesiList = computed(() => {
  const kw = filterKeyword.value.toLowerCase().trim()
  if (!kw) return sesiList.value
  return sesiList.value.filter(
    (d) =>
      d.no_sesi?.toLowerCase().includes(kw) ||
      d.nama_donor?.toLowerCase().includes(kw) ||
      d.norm?.toLowerCase().includes(kw) ||
      d.jenis_donor?.toLowerCase().includes(kw) ||
      d.hasil_screening?.toLowerCase().includes(kw),
  )
})

const countByHasil = (val) => sesiList.value.filter((d) => d.hasil_screening === val).length

// ── Options (untuk lookup label) ──────────────────────────
const jenisDonorOptions = [
  { label: 'Darah Lengkap (Whole Blood)', value: 'WB' },
  { label: 'Apheresis Trombosit', value: 'APHERESIS_TC' },
  { label: 'Apheresis Plasma', value: 'APHERESIS_PLASMA' },
  { label: 'Apheresis Eritrosit', value: 'APHERESIS_RBC' },
  { label: 'Darah Tali Pusat', value: 'CORD_BLOOD' },
]

// ── Helpers ───────────────────────────────────────────────
const formatTgl = (val) => {
  if (!val) return '-'
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return val
  }
}

const formatDateForApi = (date) => {
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const jenisDonorLabel = (val) => jenisDonorOptions.find((o) => o.value === val)?.label ?? val ?? '-'

const hasilScreeningSeverity = (val) => {
  const map = { LAYAK: 'success', DITUNDA: 'warn', DITOLAK: 'danger' }
  return map[val] ?? 'secondary'
}

const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

// ── API: Get List Sesi Donor ──────────────────────────────
const fetchSesiList = async () => {
  try {
    loadingList.value = true
    const res = await axios.post(`${configStore.apiBaseUrl}/index.php/api/utd/get_sesi_donor`, {
      mode: '3',
      tgl_dari: formatDateForApi(filterTglDari.value),
      tgl_sampai: formatDateForApi(filterTglSampai.value),
      id_client: id_client.value,
    })
    sesiList.value = res.data?.data ?? []
  } catch {
    showError('Gagal memuat data sesi donor')
  } finally {
    loadingList.value = false
  }
}

const resetFilter = () => {
  filterTglDari.value = new Date()
  filterTglSampai.value = new Date()
  filterKeyword.value = ''
  fetchSesiList()
}

// ── Form Hasil Donor ──────────────────────────────────────
watch(
  () => hasilForm.value.jumlah_kantong,
  (newVal) => {
    const n = Math.max(1, Math.min(20, parseInt(newVal) || 1))
    const cur = kantongList.value.length
    if (n > cur) {
      for (let i = cur; i < n; i++) kantongList.value.push(kantongDefault())
    } else if (n < cur) {
      kantongList.value = kantongList.value.slice(0, n)
    }
  },
)

const openHasilForm = (data) => {
  selectedSesi.value = data
  const stored = data.no_kantong
    ? (() => {
        try {
          return JSON.parse(data.no_kantong)
        } catch {
          return []
        }
      })()
    : []
  const jml = parseInt(data.jumlah_kantong) || 1
  hasilForm.value = {
    status_screening: data.hasil_screening || 'LAYAK',
    jumlah_kantong: jml,
    catatan: data.alasan_tolak || '',
  }
  kantongList.value = Array.from({ length: jml }, (_, i) => {
    const s = stored[i] || {}
    return {
      no_kantong: typeof s === 'string' ? s : s.no_kantong || '',
      golongan: s.golongan || '',
      jenis_komponen: s.jenis_komponen || 'WB',
      volume_ml: s.volume_ml || 450,
      tgl_expired: s.tgl_expired ? new Date(s.tgl_expired) : null,
      suhu: s.suhu ?? null,
    }
  })
  showHasilForm.value = true
}

const simpanHasil = async () => {
  if (!selectedSesi.value) return
  try {
    loadingHasilForm.value = true
    const sesi = selectedSesi.value
    const isLayak = hasilForm.value.status_screening === 'LAYAK'
    const noKantongArr = kantongList.value
      .filter((k) => k.no_kantong?.trim())
      .map((k) => k.no_kantong.trim())

    // ── 1. Update sesi donor ────────────────────────────────────────────────
    await axios.post(`${configStore.apiBaseUrl}/index.php/api/utd/simpan_sesi_donor`, {
      mode: 'update',
      id_client: id_client.value,
      user_id: user_id.value,
      no_sesi: sesi.no_sesi,
      hasil_screening: hasilForm.value.status_screening,
      alasan_tolak: hasilForm.value.catatan || '',
      jumlah_kantong: isLayak ? hasilForm.value.jumlah_kantong : null,
      no_kantong: isLayak && noKantongArr.length > 0 ? JSON.stringify(noKantongArr) : null,
    })

    if (isLayak) {
      const keteranganPenerimaan = [
        `Donor langsung. Norm: ${sesi.norm}`,
        sesi.nama_donor ? `Nama: ${sesi.nama_donor}` : '',
        hasilForm.value.catatan ? `Catatan: ${hasilForm.value.catatan}` : '',
      ]
        .filter(Boolean)
        .join(' | ')

      // ── 2. Simpan penerimaan darah ──────────────────────────────────────
      await axios.post(`${configStore.apiBaseUrl}/index.php/api/utd/simpan_penerimaan_darah`, {
        mode: 'insert',
        id_client: id_client.value,
        user_id: user_id.value,
        created_by: user_id.value,
        no_penerimaan: sesi.no_sesi,
        id_petugas_penerima: user_id.value,
        tgl_penerimaan: sesi.tgl_donor,
        no_surat_jalan: sesi.no_sesi,
        asal_pmi: `Donor Langsung${sesi.nama_donor ? ' - ' + sesi.nama_donor : ''}`,
        jumlah_kantong: hasilForm.value.jumlah_kantong,
        STATUS: 0,
        keterangan: keteranganPenerimaan,
      })

      // ── 3. Simpan stok darah per kantong ───────────────────────────────
      const stokData = kantongList.value
        .filter((k) => k.no_kantong?.trim())
        .map((k) => ({
          no_kantong: k.no_kantong.trim(),
          id_penerimaan: sesi.no_sesi,
          golongan: k.golongan,
          jenis_komponen: k.jenis_komponen,
          volume_ml: k.volume_ml,
          tgl_masuk: sesi.tgl_donor,
          tgl_expired: formatDateForApi(k.tgl_expired),
          suhu_terima: k.suhu,
          kondisi_fisik: 'BAIK',
          STATUS: 0,
        }))

      if (stokData.length > 0) {
        await axios.post(`${configStore.apiBaseUrl}/index.php/api/utd/simpan_stok_darah`, {
          mode: 'insert',
          id_client: id_client.value,
          user_id: user_id.value,
          data: stokData,
        })
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: isLayak
        ? 'Hasil donor, penerimaan & stok darah berhasil disimpan'
        : 'Hasil donor berhasil disimpan',
      life: 3000,
    })
    showHasilForm.value = false
    fetchSesiList()
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan saat menyimpan',
      life: 5000,
    })
  } finally {
    loadingHasilForm.value = false
  }
}

// ── Print: Cetak satu sesi ────────────────────────────────
const cetakSesi = (data) => {
  sessionStorage.setItem('print_sesi_donor', JSON.stringify(data))
  const routeData = router.resolve({
    name: 'PrintOutsesiDonor',
    query: { mode: 'single', no_sesi: data.no_sesi },
  })
  window.open(routeData.href, '_blank')
}

// ── Print: Cetak seluruh daftar yang tampil ───────────────
const cetakDaftar = () => {
  const payload = {
    list: filteredSesiList.value,
    tgl_dari: formatDateForApi(filterTglDari.value),
    tgl_sampai: formatDateForApi(filterTglSampai.value),
  }
  sessionStorage.setItem('print_sesi_donor_list', JSON.stringify(payload))
  const routeData = router.resolve({
    name: 'PrintOutsesiDonor',
    query: {
      mode: 'list',
      tgl_dari: formatDateForApi(filterTglDari.value),
      tgl_sampai: formatDateForApi(filterTglSampai.value),
    },
  })
  window.open(routeData.href, '_blank')
}
</script>

<style scoped>
/* ── Dialog Header (gradient) ── */
:deep(.list-sesi-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  padding: 0.7rem 1.25rem;
}
:deep(.list-sesi-dialog .p-dialog-header-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}
:deep(.list-sesi-dialog .p-dialog-header-icon:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

/* ── Header slot content ── */
.sesi-dlg-hdr {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.sesi-dlg-hdr-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.sesi-dlg-hdr-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
}
.sesi-dlg-hdr-sub {
  font-size: 0.68rem;
  opacity: 0.85;
  margin-top: 2px;
}

/* ── Stat Strip ── */
.utd-stat-strip {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 2px solid darkcyan;
  border-radius: 4px;
  padding: 0 6px;
  margin-bottom: 0.6rem;
  height: 38px;
  overflow-x: auto;
  gap: 0;
  flex-wrap: nowrap;
}
.strip-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  white-space: nowrap;
}
.strip-ico {
  font-size: 10px;
  color: var(--c, darkcyan);
  flex-shrink: 0;
}
.strip-num {
  font-size: 15px;
  font-weight: 800;
  color: var(--c, #1e293b);
  line-height: 1;
}
.strip-lbl {
  font-size: 9.5px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.strip-div {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  flex-shrink: 0;
}

/* ── Filter Bar ── */
.utd-filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid darkcyan;
  border-radius: 4px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 0.85rem;
}
.utd-filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}
.utd-filter-search {
  flex: 1;
  min-width: 200px;
}
.utd-filter-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.filter-datepicker {
  width: 100%;
}
.utd-filter-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.btn-primary-utd {
  background: darkcyan !important;
  border-color: darkcyan !important;
}
.btn-primary-utd:hover {
  background: #00838f !important;
  border-color: #00838f !important;
}

/* ── Table ── */
.utd-table-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-top: 3px solid darkcyan;
  border-radius: 4px;
  overflow: hidden;
}
:deep(.utd-datatable .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.6rem;
  font-size: 12px;
}
:deep(.utd-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.6rem;
  font-size: 11px;
  background: #f0fdfa;
  color: #006064;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.mono {
  font-family: monospace;
  font-size: 11.5px;
}
.text-teal {
  color: #00838f;
}
.ket-text {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  display: block;
}

/* ── Vital chips ── */
.vital-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.vital-chip {
  display: inline-flex;
  align-items: center;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  color: #0369a1;
  white-space: nowrap;
}

/* ── Empty State ── */
.utd-empty {
  text-align: center;
  padding: 40px 20px;
}
.utd-empty-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #e0f2f1, #b2dfdb);
  border-radius: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 22px;
  color: #00838f;
}
.utd-empty-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  margin: 0 0 4px;
}
.utd-empty small {
  font-size: 12px;
  color: #9ca3af;
}

/* ── Dialog Hasil Donor ── */
:deep(.hasil-donor-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  padding: 0.7rem 1.25rem;
}
:deep(.hasil-donor-dialog .p-dialog-header-icon) {
  color: rgba(255, 255, 255, 0.8) !important;
}
:deep(.hasil-donor-dialog .p-dialog-header-icon:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}
:deep(.hasil-donor-dialog .p-dialog-footer) {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.hasil-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.hasil-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hasil-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.req {
  color: #e53935;
}
.status-btn-group {
  display: flex;
  gap: 8px;
}
.status-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  color: #475569;
}
.status-btn:hover {
  border-color: #94a3b8;
}
.status-btn--layak.active {
  background: #dcfce7;
  border-color: #22c55e;
  color: #15803d;
}
.status-btn--ditunda.active {
  background: #fff7ed;
  border-color: #f97316;
  color: #c2410c;
}
.status-btn--ditolak.active {
  background: #fef2f2;
  border-color: #ef4444;
  color: #b91c1c;
}
.kantong-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kantong-card {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}
.kantong-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdfa;
  padding: 5px 10px;
  border-bottom: 1px solid #e2e8f0;
}
.kantong-card-title {
  font-size: 11px;
  font-weight: 700;
  color: #006064;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kantong-card-body {
  padding: 10px;
}
.kantong-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.kantong-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.kantong-field-label {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.kantong-num {
  width: 20px;
  height: 20px;
  background: darkcyan;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
