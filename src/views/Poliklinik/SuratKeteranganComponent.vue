<template>
  <div class="content">
    <Toast />
    <ConfirmDialog />

    <div class="sk-header">
      <div>
        <h5 class="sk-title"><i class="pi pi-file-edit mr-2"></i>Surat Keterangan</h5>
        <p class="sk-subtitle">Surat hanya dapat dicetak setelah item dinyatakan lunas di kasir.</p>
      </div>
      <Button label="Tambah Surat" icon="pi pi-plus" size="small" @click="openTambah" />
    </div>

    <DataTable
      :value="trxList"
      :loading="loadingTrxSurat"
      size="small"
      showGridlines
      class="sk-table"
      responsiveLayout="scroll"
    >
      <template #empty>
        <div class="sk-empty">Belum ada surat keterangan untuk kunjungan ini.</div>
      </template>

      <Column header="Jenis Surat" field="NAMA_SURAT" style="min-width: 180px">
        <template #body="{ data }">
          <div class="fw-semibold">{{ data.NAMA_SURAT || '-' }}</div>
          <small class="text-muted">{{ data.KATEGORI_SURAT }}</small>
        </template>
      </Column>

      <Column header="Tanggal Surat" style="width: 130px">
        <template #body="{ data }">{{ formatDate(data.TANGGAL_SURAT) }}</template>
      </Column>

      <Column header="Dokter Pemeriksa" field="DOKTER_PEMERIKSA" style="min-width: 150px" />

      <Column header="No. Surat" style="min-width: 160px">
        <template #body="{ data }">{{ data.NO_SURAT || '-' }}</template>
      </Column>

      <Column header="Status" style="width: 150px">
        <template #body="{ data }">
          <Tag :value="statusLabel(data).label" :severity="statusLabel(data).severity" />
        </template>
      </Column>

      <Column header="Cetak" style="width: 60px" class="text-center">
        <template #body="{ data }">{{ data.JUMLAH_CETAK || 0 }}x</template>
      </Column>

      <Column header="Tanda Tangan" style="min-width: 150px">
        <template #body="{ data }">
          <div v-if="signatures[data.ID]" class="sk-ttd-result">
            <div class="sk-ttd-username">
              <i class="pi pi-user"></i> {{ signatures[data.ID].username }}
            </div>
            <div class="sk-ttd-password">
              <i class="pi pi-lock"></i> {{ '•'.repeat(signatures[data.ID].password.length) }}
            </div>
          </div>
          <span v-else class="text-muted">-</span>
        </template>
      </Column>

      <Column header="Aksi" style="width: 220px">
        <template #body="{ data }">
          <div class="d-flex gap-1">
            <Button
              icon="pi pi-pen-to-square"
              size="small"
              severity="help"
              v-tooltip.top="signatures[data.ID] ? 'Tanda tangan ulang' : 'Tanda tangan digital'"
              @click="openTtd(data)"
            />
            <Button
              icon="pi pi-print"
              size="small"
              :severity="Number(data.STATUS_BAYAR) === 1 ? 'success' : 'secondary'"
              :disabled="Number(data.STATUS_BAYAR) !== 1 || printingId === data.ID"
              :loading="printingId === data.ID"
              v-tooltip.top="
                Number(data.STATUS_BAYAR) === 1
                  ? 'Cetak surat'
                  : 'Surat belum bisa dicetak, menunggu pelunasan pembayaran'
              "
              @click="cetak(data)"
            />
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="warning"
              :disabled="Number(data.STATUS_SURAT) === 1"
              v-tooltip.top="
                Number(data.STATUS_SURAT) === 1
                  ? 'Sudah diterbitkan (punya no. surat), tidak dapat diubah'
                  : 'Ubah isian'
              "
              @click="openEdit(data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              :disabled="Number(data.STATUS_SURAT) === 1"
              v-tooltip.top="
                Number(data.STATUS_SURAT) === 1
                  ? 'Sudah diterbitkan (punya no. surat), tidak dapat dibatalkan'
                  : 'Batalkan'
              "
              @click="confirmHapus(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- ── Dialog Tambah / Edit ── -->
    <Dialog
      v-model:visible="dialogVisible"
      modal
      :style="{ width: '640px', maxWidth: '95vw' }"
      :closable="!saving"
      :header="editMode ? 'Ubah Isian Surat' : 'Tambah Surat Keterangan'"
    >
      <div class="sk-form">
        <div class="mb-3" v-if="!editMode">
          <label class="form-label fw-semibold">
            Jenis Surat <span class="text-danger">*</span>
          </label>
          <Select
            v-model="form.id_jenis_surat"
            :options="jenisSuratAktif"
            optionLabel="NAMA_SURAT"
            optionValue="ID"
            placeholder="Pilih jenis surat..."
            class="w-100"
            :loading="loadingJenisSurat"
            @change="onJenisSuratChange"
          />
          <small v-if="selectedJenis" class="text-muted d-block mt-1">
            Tarif: {{ formatCurrency(selectedJenis.HARGAJUAL) }}
          </small>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Tujuan Surat</label>
          <InputText v-model="form.tujuan_surat" class="w-100" />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Hasil Pemeriksaan</label>
          <Textarea v-model="form.hasil_pemeriksaan" rows="3" class="w-100" />
        </div>

        <div v-for="field in activeFields" :key="field.key" class="mb-3">
          <label class="form-label fw-semibold">{{ field.label }}</label>
          <InputNumber
            v-if="field.type === 'number'"
            v-model="form.data_isian[field.key]"
            class="w-100"
          />
          <Select
            v-else-if="field.type === 'select'"
            v-model="form.data_isian[field.key]"
            :options="field.options"
            class="w-100"
          />
          <DatePicker
            v-else-if="field.type === 'date'"
            v-model="form.data_isian[field.key]"
            dateFormat="dd/mm/yy"
            class="w-100"
            showIcon
          />
          <Textarea
            v-else-if="field.type === 'textarea'"
            v-model="form.data_isian[field.key]"
            rows="3"
            class="w-100"
          />
          <InputText v-else v-model="form.data_isian[field.key]" class="w-100" />
        </div>

        <div v-if="!activeFields.length" class="sk-empty">
          Pilih jenis surat terlebih dahulu untuk menampilkan isian.
        </div>
      </div>

      <template #footer>
        <Button
          label="Batal"
          severity="secondary"
          outlined
          :disabled="saving"
          @click="dialogVisible = false"
        />
        <Button
          label="Simpan"
          icon="pi pi-save"
          :loading="saving"
          :disabled="!editMode && !form.id_jenis_surat"
          @click="save"
        />
      </template>
    </Dialog>

    <!-- ── Dialog Tanda Tangan Digital ── -->
    <TtdDigitalComponent_v2
      v-model:showFormOtorisasi="ttdDialogVisible"
      :formMode="2"
      @otpVerified="handleTtdVerified"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { storeToRefs } from 'pinia'
import { useSuratStore, KATEGORI_SURAT_FIELDS } from '@/stores/surat'
import { useConfigStore } from '@/stores/config'
import TtdDigitalComponent_v2 from '@/components/TtdDigitalComponent_v2.vue'

const props = defineProps({
  datapasien: { type: Object, default: () => ({}) },
})

const toast = useToast()
const confirm = useConfirm()
const suratStore = useSuratStore()
const configStore = useConfigStore()
const { jenisSuratAktif, trxSuratList, loadingJenisSurat, loadingTrxSurat } =
  storeToRefs(suratStore)

const trxList = trxSuratList
const printingId = ref(null)

const noregister = computed(() => props.datapasien?.NOPENDAFTARAN)

// ── Tanda Tangan Digital (per baris surat) ──────────────────────────────
// TtdDigitalComponent_v2 formMode=2 cuma menampung ketikan username/password
// tanpa verifikasi ke server, hasilnya ditaruh di sini per ID surat supaya
// muncul di kolom "Tanda Tangan" pada baris yang bersangkutan.
const signatures = reactive({})
const ttdDialogVisible = ref(false)
const ttdTargetId = ref(null)

const openTtd = (data) => {
  ttdTargetId.value = data.ID
  ttdDialogVisible.value = true
}

const handleTtdVerified = (payload) => {
  if (ttdTargetId.value == null) return
  signatures[ttdTargetId.value] = { username: payload.username, password: payload.password }
}

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 4000 })

const formatCurrency = (val) =>
  val || val === 0
    ? new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(val)
    : '-'

const formatDate = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const statusLabel = (data) => {
  if (Number(data.STATUS_BAYAR) !== 1) return { label: 'Belum Lunas', severity: 'warn' }
  if (Number(data.STATUS_SURAT) === 1) return { label: 'Sudah Dicetak', severity: 'info' }
  return { label: 'Lunas, Siap Cetak', severity: 'success' }
}

// ── Form dialog ──────────────────────────────────────────────────────────
const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref(null)
const saving = ref(false)

const form = reactive({
  id_jenis_surat: null,
  dokter_pemeriksa: '',
  sip_dokter: '',
  tempat_lahir: '',
  tujuan_surat: '',
  hasil_pemeriksaan: '',
  tanggal_surat: new Date(),
  data_isian: {},
})

const selectedJenis = computed(() =>
  jenisSuratAktif.value.find((j) => j.ID === form.id_jenis_surat),
)

// KATEGORI_SURAT di master bisa saja tersimpan dengan variasi huruf besar/kecil atau
// spasi berlebih (mis. "Sakit", " SAKIT") — normalisasi supaya field dinamis tetap
// muncul walau data master tidak 100% rapi.
const normalizeKategori = (kategori) => (kategori || '').toString().trim().toUpperCase()

const activeKategori = ref(null)
const activeFields = computed(() => KATEGORI_SURAT_FIELDS[activeKategori.value] || [])

const buildEmptyDataIsian = (kategori) => {
  const fields = KATEGORI_SURAT_FIELDS[normalizeKategori(kategori)] || []
  const obj = {}
  fields.forEach((f) => (obj[f.key] = null))
  return obj
}

// DATA_ISIAN tersimpan sebagai JSON (field 'date' jadi string) — DatePicker butuh objek
// Date supaya tampilannya mengikuti dateFormat="dd/mm/yy", bukan menampilkan string mentah.
const hydrateDataIsianDates = (kategori, dataIsian) => {
  const fields = KATEGORI_SURAT_FIELDS[normalizeKategori(kategori)] || []
  const obj = { ...dataIsian }
  fields.forEach((f) => {
    if (f.type === 'date' && obj[f.key]) {
      const d = new Date(obj[f.key])
      obj[f.key] = isNaN(d) ? null : d
    }
  })
  return obj
}

const onJenisSuratChange = () => {
  activeKategori.value = normalizeKategori(selectedJenis.value?.KATEGORI_SURAT)
  form.data_isian = buildEmptyDataIsian(activeKategori.value)
}

const openTambah = () => {
  editMode.value = false
  editId.value = null
  activeKategori.value = null
  form.id_jenis_surat = null
  form.dokter_pemeriksa = props.datapasien?.NAMADOKTER || ''
  form.sip_dokter = ''
  form.tempat_lahir = ''
  form.tujuan_surat = ''
  form.hasil_pemeriksaan = ''
  form.tanggal_surat = new Date()
  form.data_isian = {}
  dialogVisible.value = true
}

const openEdit = (data) => {
  editMode.value = true
  editId.value = data.ID
  activeKategori.value = normalizeKategori(data.KATEGORI_SURAT)
  form.id_jenis_surat = data.ID_JENIS_SURAT
  form.dokter_pemeriksa = data.DOKTER_PEMERIKSA || ''
  form.sip_dokter = data.DATA_ISIAN?.sip_dokter || ''
  form.tempat_lahir = data.DATA_ISIAN?.tempat_lahir || ''
  form.tujuan_surat = data.DATA_ISIAN?.tujuan_surat || ''
  form.hasil_pemeriksaan = data.DATA_ISIAN?.hasil_pemeriksaan || ''
  form.tanggal_surat = data.TANGGAL_SURAT ? new Date(data.TANGGAL_SURAT) : new Date()
  form.data_isian = hydrateDataIsianDates(data.KATEGORI_SURAT, {
    ...buildEmptyDataIsian(data.KATEGORI_SURAT),
    ...(data.DATA_ISIAN || {}),
  })
  dialogVisible.value = true
}

const toDateStr = (val) => {
  if (!val) return null
  const d = val instanceof Date ? val : new Date(val)
  if (isNaN(d)) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// sip_dokter, tempat_lahir, tujuan_surat & hasil_pemeriksaan bersifat generik (tidak
// tergantung KATEGORI_SURAT), disatukan ke dalam DATA_ISIAN supaya bisa dipakai sebagai
// placeholder {{sip_dokter}} / {{tempat_lahir}} / {{tujuan_surat}} / {{hasil_pemeriksaan}}
// di TEMPLATE_HTML jenis surat apa pun.
const buildDataIsianPayload = () => {
  // field 'date' di data_isian berupa objek Date (dari DatePicker) — simpan sebagai
  // string tanggal polos (YYYY-MM-DD), bukan toISOString(), supaya tidak bergeser
  // sehari akibat konversi ke UTC dan tetap bisa ditampilkan ulang sebagai dd/mm/yy.
  const dataIsian = { ...form.data_isian }
  activeFields.value.forEach((f) => {
    if (f.type === 'date' && dataIsian[f.key]) {
      dataIsian[f.key] = toDateStr(dataIsian[f.key])
    }
  })

  return {
    ...dataIsian,
    sip_dokter: form.sip_dokter,
    tempat_lahir: form.tempat_lahir,
    tujuan_surat: form.tujuan_surat,
    hasil_pemeriksaan: form.hasil_pemeriksaan,
  }
}

const save = async () => {
  saving.value = true
  try {
    if (editMode.value) {
      const res = await suratStore.updateTrxSurat({
        id: editId.value,
        dokter_pemeriksa: form.dokter_pemeriksa,
        tanggal_surat: toDateStr(form.tanggal_surat),
        data_isian: buildDataIsianPayload(),
      })
      if (Number(res?.code) === 200) {
        showSuccess(res.message || 'Isian berhasil diperbarui')
        dialogVisible.value = false
        await suratStore.fetchTrxByNoregister(noregister.value)
      } else {
        showError(res?.message || 'Gagal menyimpan')
      }
    } else {
      const res = await suratStore.buatTrxSurat({
        noregister: noregister.value,
        id_jenis_surat: form.id_jenis_surat,
        dokter_pemeriksa: form.dokter_pemeriksa,
        tanggal_surat: toDateStr(form.tanggal_surat),
        data_isian: buildDataIsianPayload(),
      })
      if (Number(res?.code) === 200) {
        showSuccess(res.message || 'Surat berhasil dibuat')
        dialogVisible.value = false
        await suratStore.fetchTrxByNoregister(noregister.value)
      } else {
        showError(res?.message || 'Gagal menyimpan')
      }
    }
  } catch {
    showError('Koneksi ke server gagal')
  } finally {
    saving.value = false
  }
}

const confirmHapus = (data) => {
  confirm.require({
    message: `Batalkan surat "${data.NAMA_SURAT}"?`,
    header: 'Konfirmasi Pembatalan',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Tidak',
    acceptLabel: 'Batalkan',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const res = await suratStore.hapusTrxSurat(data.ID)
      if (Number(res?.code) === 200) {
        showSuccess(res.message || 'Surat berhasil dibatalkan')
        await suratStore.fetchTrxByNoregister(noregister.value)
      } else {
        showError(res?.message || 'Gagal membatalkan surat')
      }
    },
  })
}

// Template sekarang berupa file Word (.docx) yang diisi & dikonversi ke PDF di
// server (lihat M_surat.php::cetak_surat) — tinggal buka PDF-nya di tab baru.
// Tab dibuka SEBELUM request async selesai supaya tidak diblokir popup blocker,
// lalu diarahkan (location.href) begitu URL PDF-nya didapat.
const cetak = async (data) => {
  if (Number(data.STATUS_BAYAR) !== 1) {
    showError('Surat belum bisa dicetak, menunggu pelunasan pembayaran')
    return
  }
  printingId.value = data.ID
  const win = window.open('', '_blank')
  try {
    const res = await suratStore.cetakSurat(data.ID)
    if (Number(res?.code) === 200 && res.response?.pdf) {
      const pdfUrl = `${configStore.apiBaseUrl}/${res.response.pdf}`
      if (win) {
        win.location.href = pdfUrl
      } else {
        window.open(pdfUrl, '_blank')
      }
      await suratStore.fetchTrxByNoregister(noregister.value)
    } else {
      win?.close()
      showError(res?.message || 'Gagal mencetak surat')
    }
  } catch {
    win?.close()
    showError('Koneksi ke server gagal')
  } finally {
    printingId.value = null
  }
}

watch(
  noregister,
  (val) => {
    if (val) suratStore.fetchTrxByNoregister(val)
  },
  { immediate: true },
)

suratStore.fetchJenisSurat()
</script>

<style scoped>
.sk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.sk-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}
.sk-subtitle {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: #64748b;
}
.sk-empty {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 12.5px;
}
.sk-form .form-label {
  font-size: 12.5px;
}
.sk-ttd-result {
  font-size: 12px;
  line-height: 1.6;
}
.sk-ttd-username {
  font-weight: 600;
  color: #1e293b;
}
.sk-ttd-password {
  color: #64748b;
  letter-spacing: 1px;
}
.sk-ttd-result i {
  font-size: 11px;
  margin-right: 4px;
  color: #94a3b8;
}
</style>
