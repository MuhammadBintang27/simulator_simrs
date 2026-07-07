<template>
  <Dialog
    v-model:visible="isVisible"
    :header="isEditMode ? `Edit ${bucketLabel}` : `Tambah ${bucketLabel} Baru`"
    modal
    maximizable
    :style="{ width: '820px', maxWidth: '96vw' }"
    :breakpoints="{ '900px': '96vw' }"
    :contentStyle="{ padding: '1rem', overflowY: 'auto', maxHeight: '80vh' }"
    @hide="onHide"
  >
    <loading_overlay :is-loading="loading" message="Memproses..." />

    <div class="row g-3">
      <!-- ── MAIN FORM ──────────────────────────────────────────────── -->
      <div class="col-md-8">
        <!-- INFORMASI DASAR -->
        <div class="fm-section mb-3">
          <div class="fm-section-title"><i class="pi pi-info-circle me-1"></i>INFORMASI DASAR</div>

          <div class="mb-2">
            <label class="fm-label">Nama <span class="text-danger">*</span></label>
            <InputText
              v-model="form.NAMA"
              class="w-100"
              :class="{ 'p-invalid': errors.NAMA }"
              maxlength="200"
              @blur="validateField('NAMA')"
              :disabled="loading"
            />
            <small v-if="errors.NAMA" class="text-danger d-block mt-1">{{ errors.NAMA }}</small>
          </div>

          <div class="mb-2">
            <label class="fm-label">Kategori <span class="text-danger">*</span></label>
            <Select
              v-model="form.KATEGORI"
              :options="kategoriList.filter((k) => k.NAMA_KATEGORI?.trim())"
              optionLabel="NAMA_KATEGORI"
              optionValue="NAMA_KATEGORI"
              placeholder="Pilih kategori..."
              filter
              class="w-100"
              :class="{ 'p-invalid': errors.KATEGORI }"
              @change="validateField('KATEGORI')"
              :disabled="loading"
            />
            <small v-if="errors.KATEGORI" class="text-danger d-block mt-1">{{
              errors.KATEGORI
            }}</small>
          </div>

          <div v-if="bucket === 'OBAT_BMHP'" class="mb-1">
            <label class="fm-label">Klasifikasi</label>
            <div class="klasifikasi-row">
              <div class="klasifikasi-item">
                <Checkbox
                  v-model="form.iskronis"
                  :binary="true"
                  inputId="ck_kronis"
                  :disabled="loading"
                />
                <label for="ck_kronis" class="klasifikasi-label">Kronis</label>
              </div>
              <div class="klasifikasi-item">
                <Checkbox
                  v-model="form.iskonsinyasi"
                  :binary="true"
                  inputId="ck_konsinyasi"
                  :disabled="loading"
                />
                <label for="ck_konsinyasi" class="klasifikasi-label">Konsinyasi</label>
              </div>
            </div>
          </div>

          <div v-if="bucket === 'OBAT_BMHP'" class="row g-2 mb-1">
            <div :class="showGolongan ? 'col-6' : 'col-12'">
              <label class="fm-label">Klasifikasi Obat <span class="text-danger">*</span></label>
              <Select
                v-model="form.KLASIFIKASI_OBAT"
                :options="klasifikasiList"
                optionLabel="nama"
                optionValue="kode"
                placeholder="Pilih klasifikasi..."
                class="w-100"
                :disabled="loading"
                @change="onKlasifikasiChange"
              />
            </div>
            <div v-if="showGolongan" class="col-6">
              <label class="fm-label">Golongan <span class="text-danger">*</span></label>
              <Select
                v-model="form.GOLONGAN"
                :options="golonganOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih golongan..."
                class="w-100"
                :class="{ 'p-invalid': errors.GOLONGAN }"
                @change="errors.GOLONGAN = ''"
                :disabled="loading"
              />
              <small v-if="errors.GOLONGAN" class="text-danger d-block mt-1">{{
                errors.GOLONGAN
              }}</small>
            </div>
          </div>
        </div>

        <!-- SATUAN BERTINGKAT (non-JASA) -->
        <div v-if="bucket !== 'JASA'" class="fm-section mb-3">
          <div class="fm-section-title"><i class="pi pi-box me-1"></i>SATUAN BERTINGKAT</div>

          <div class="row g-2 mb-2">
            <div class="col-4">
              <label class="fm-label">Satuan Kecil <span class="text-danger">*</span></label>
              <InputText
                v-model="form.SATUAN_KECIL"
                class="w-100"
                :class="{ 'p-invalid': errors.SATUAN_KECIL }"
                placeholder="Tablet, Pcs..."
                @blur="validateSatuan"
                :disabled="loading"
              />
              <small v-if="errors.SATUAN_KECIL" class="text-danger d-block mt-1">{{
                errors.SATUAN_KECIL
              }}</small>
            </div>
            <div class="col-4">
              <label class="fm-label">Satuan Sedang <span class="fm-opt">(opsional)</span></label>
              <InputText
                v-model="form.SATUAN_SEDANG"
                class="w-100"
                placeholder="Strip, Pack..."
                @input="validateSatuan"
                :disabled="loading"
              />
            </div>
            <div class="col-4">
              <label class="fm-label">Satuan Besar <span class="fm-opt">(opsional)</span></label>
              <InputText
                v-model="form.SATUAN_BESAR"
                class="w-100"
                placeholder="Box, Rim..."
                @input="validateSatuan"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="row g-2">
            <div class="col-6">
              <label class="fm-label">
                Isi Sedang → Kecil
                <span v-if="form.SATUAN_SEDANG" class="text-danger">*</span>
                <span v-else class="fm-opt">(opsional)</span>
              </label>
              <InputText
                v-model.number="form.ISI_SEDANG_KE_KECIL"
                type="number"
                min="1"
                class="w-100"
                :class="{ 'p-invalid': errors.ISI_SEDANG_KE_KECIL }"
                :disabled="loading || !form.SATUAN_SEDANG"
              />
              <small v-if="errors.ISI_SEDANG_KE_KECIL" class="text-danger d-block mt-1">{{
                errors.ISI_SEDANG_KE_KECIL
              }}</small>
              <small v-else-if="form.SATUAN_SEDANG && form.SATUAN_KECIL" class="fm-hint">
                1 {{ form.SATUAN_SEDANG }} = ? {{ form.SATUAN_KECIL }}
              </small>
            </div>
            <div class="col-6">
              <label class="fm-label">
                Isi Besar → Sedang
                <span v-if="form.SATUAN_BESAR" class="text-danger">*</span>
                <span v-else class="fm-opt">(opsional)</span>
              </label>
              <InputText
                v-model.number="form.ISI_BESAR_KE_SEDANG"
                type="number"
                min="1"
                class="w-100"
                :class="{ 'p-invalid': errors.ISI_BESAR_KE_SEDANG }"
                :disabled="loading || !form.SATUAN_BESAR"
              />
              <small v-if="errors.ISI_BESAR_KE_SEDANG" class="text-danger d-block mt-1">{{
                errors.ISI_BESAR_KE_SEDANG
              }}</small>
              <small
                v-else-if="form.SATUAN_BESAR && (form.SATUAN_SEDANG || form.SATUAN_KECIL)"
                class="fm-hint"
              >
                1 {{ form.SATUAN_BESAR }} = ?
                {{ form.SATUAN_SEDANG || form.SATUAN_KECIL }}
              </small>
            </div>
          </div>

          <div
            v-if="form.SATUAN_KECIL && form.SATUAN_SEDANG && form.ISI_SEDANG_KE_KECIL"
            class="konversi-preview mt-2"
          >
            <i class="pi pi-calculator me-1"></i>
            1 {{ form.SATUAN_SEDANG }} = {{ form.ISI_SEDANG_KE_KECIL }} {{ form.SATUAN_KECIL }}
            <span v-if="form.SATUAN_BESAR && form.ISI_BESAR_KE_SEDANG">
              &nbsp;|&nbsp; 1 {{ form.SATUAN_BESAR }} =
              {{ form.ISI_BESAR_KE_SEDANG * form.ISI_SEDANG_KE_KECIL }} {{ form.SATUAN_KECIL }}
            </span>
          </div>
        </div>

        <!-- HARGA JASA -->
        <div v-if="bucket === 'JASA'" class="fm-section mb-3">
          <div class="fm-section-title"><i class="pi pi-money-bill me-1"></i>HARGA JASA</div>
          <div class="row g-2">
            <div class="col-6">
              <label class="fm-label">Harga Beli / Modal</label>
              <InputText
                v-model.number="form.HARGABELI"
                type="number"
                min="0"
                class="w-100"
                placeholder="0"
                :disabled="loading"
              />
              <small class="fm-hint">Biaya atau modal jasa</small>
            </div>
            <div class="col-6">
              <label class="fm-label">Harga Jual</label>
              <InputText
                v-model.number="form.HARGAJUAL"
                type="number"
                min="0"
                class="w-100"
                placeholder="0"
                :disabled="loading"
              />
              <small class="fm-hint">Tarif yang ditagihkan ke pasien</small>
            </div>
          </div>
        </div>

        <!-- INFORMASI FARMASI (OBAT_BMHP) -->
        <div v-if="bucket === 'OBAT_BMHP'" class="fm-section mb-3">
          <div class="fm-section-title"><i class="pi pi-heart me-1"></i>INFORMASI FARMASI</div>

          <div class="mb-2">
            <label class="fm-label">Grouping</label>
            <Select
              v-model="form.GROUPING"
              :options="groupingList"
              optionLabel="NAMA_GROUP"
              optionValue="NAMA_GROUP"
              placeholder="Ketik atau pilih grouping..."
              editable
              class="w-100"
              :disabled="loading"
            />
            <small
              v-if="form.GROUPING && !groupingList.some((g) => g.NAMA_GROUP === form.GROUPING)"
              class="text-success"
              style="font-size: 11px"
            >
              <i class="pi pi-plus-circle me-1" />Grouping baru — akan ditambahkan ke master saat
              disimpan
            </small>
          </div>

          <div class="mb-2">
            <label class="fm-label">Bentuk Sediaan</label>
            <Select
              v-model="sediaanInput"
              :options="sediaanList"
              optionLabel="NAMA_SEDIAAN"
              dataKey="NAMA_SEDIAAN"
              placeholder="Pilih bentuk sediaan..."
              filter
              class="w-100"
              :disabled="loading"
              @change="onSediaanSelect"
            >
              <template #value="{ value, placeholder }">
                <span v-if="value">{{ value.NAMA_SEDIAAN }}</span>
                <span v-else class="p-placeholder">{{ placeholder }}</span>
              </template>
            </Select>
          </div>

          <div class="mb-2">
            <label class="fm-label">Rute Pemberian</label>
            <Select
              v-model="ruteInput"
              :options="ruteList"
              optionLabel="NAMA_RUTE"
              dataKey="NAMA_RUTE"
              placeholder="Pilih rute pemberian..."
              filter
              class="w-100"
              :disabled="loading"
              @change="onRuteSelect"
            >
              <template #value="{ value, placeholder }">
                <span v-if="value">{{ value.NAMA_RUTE }}</span>
                <span v-else class="p-placeholder">{{ placeholder }}</span>
              </template>
            </Select>
          </div>

          <div class="row g-2">
            <div class="col-4">
              <label class="fm-label">Kandungan</label>
              <InputText
                v-model.number="form.KANDUNGAN"
                type="number"
                min="0"
                class="w-100"
                placeholder="500"
                :disabled="loading"
              />
            </div>
            <div class="col-4">
              <label class="fm-label">Satuan Kandungan</label>
              <InputText
                v-model="form.SATUAN_KANDUNGAN"
                class="w-100"
                placeholder="mg, ml..."
                :disabled="loading"
              />
            </div>
            <div class="col-4">
              <label class="fm-label">Volume UOM</label>
              <InputText
                v-model="form.VOLUME_UOM_NAME"
                class="w-100"
                placeholder="mL, L..."
                :disabled="loading"
              />
            </div>
          </div>
        </div>

        <!-- CATATAN -->
        <div class="fm-section">
          <div class="fm-section-title"><i class="pi pi-comment me-1"></i>CATATAN</div>
          <div v-if="bucket !== 'JASA'" class="mb-3">
            <label class="fm-label">Jumlah Minimum Stok</label>
            <div class="d-flex align-items-center gap-3">
              <InputText
                v-model.number="form.STOCKMINIMUM"
                type="number"
                min="0"
                placeholder="0"
                style="max-width: 150px"
                :disabled="loading"
                @input="onStokMinChange"
              />
              <div class="stok-min-hint" :class="form.GUNAKAN_STOCK_MIN ? 'hint-on' : 'hint-off'">
                <i
                  :class="form.GUNAKAN_STOCK_MIN ? 'pi pi-check-circle' : 'pi pi-minus-circle'"
                  class="me-1"
                ></i>
                <span v-if="form.GUNAKAN_STOCK_MIN"
                  >Aktif — peringatan jika stok &lt; {{ form.STOCKMINIMUM }}</span
                >
                <span v-else>Isi angka &gt; 0 untuk mengaktifkan</span>
              </div>
            </div>
          </div>
          <div>
            <label class="fm-label">Catatan</label>
            <Textarea
              v-model="form.CATATAN"
              rows="3"
              class="w-100"
              maxlength="255"
              placeholder="Catatan tambahan (opsional)..."
              :disabled="loading"
            />
          </div>
        </div>
      </div>

      <!-- ── SIDEBAR ────────────────────────────────────────────────── -->
      <div class="col-md-4">
        <div class="fm-info-card">
          <div class="fm-info-header"><i :class="bucketIcon + ' me-2'"></i>{{ bucketLabel }}</div>
          <hr class="my-2" style="border-color: #e2e8f0" />
          <div class="fm-hint-list">
            <div class="fw-semibold mb-1" style="font-size: 11px; color: #475569">WAJIB DIISI:</div>
            <div class="fm-hint-item">• Nama</div>
            <div class="fm-hint-item">• Kategori</div>
            <div v-if="bucket !== 'JASA'" class="fm-hint-item">• Satuan Kecil</div>
            <template v-if="bucket === 'OBAT_BMHP'">
              <hr class="my-2" style="border-color: #e2e8f0" />
              <div class="fw-semibold mb-1" style="font-size: 11px; color: #475569">FARMASI:</div>
              <div class="fm-hint-item">
                • Pilih atau tambah zat aktif, sediaan, dan rute dari dropdown
              </div>
            </template>
            <template v-if="bucket === 'JASA'">
              <hr class="my-2" style="border-color: #e2e8f0" />
              <div class="fw-semibold mb-1" style="font-size: 11px; color: #475569">HARGA:</div>
              <div class="fm-hint-item">• Harga Beli = biaya/modal</div>
              <div class="fm-hint-item">• Harga Jual = tarif ke pasien</div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-inner">
        <div class="d-flex align-items-center gap-2">
          <Button
            v-if="isEditMode"
            label="Hapus"
            icon="pi pi-trash"
            severity="danger"
            outlined
            size="small"
            @click="confirmDelete"
            :disabled="loading"
          />
          <span v-if="!isEditMode && lastSavedAt" class="draft-indicator">
            <i class="pi pi-cloud-upload"></i>
            Draft tersimpan {{ formatDraftTime(lastSavedAt) }}
            <button class="draft-clear-btn" @click="clearDraft" title="Hapus draft">
              <i class="pi pi-times"></i>
            </button>
          </span>
        </div>
        <div class="d-flex gap-2">
          <Button label="Batal" severity="secondary" outlined @click="close" :disabled="loading" />
          <Button
            label="Simpan"
            icon="pi pi-save"
            class="btn-primary-barang"
            @click="submitForm"
            :loading="loading"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'

const props = defineProps({
  visible: { type: Boolean, required: true },
  bucket: { type: String, required: true },
  itemId: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:visible', 'saved'])

const toast = useToast()
const confirm = useConfirm()
const configStore = useConfigStore()
const authStore = useAuthStore()

const loading = ref(false)
const lastSavedAt = ref(null)
let autosaveTimer = null

// ── COMPUTED ───────────────────────────────────────────────────────────────
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const isEditMode = computed(() => !!props.itemId)

const bucketLabel = computed(() => {
  const map = { OBAT_BMHP: 'Obat / BMHP', ATK: 'ATK', JASA: 'Jasa' }
  return map[props.bucket] || 'Barang'
})

const bucketIcon = computed(() => {
  const map = { OBAT_BMHP: 'pi pi-heart', ATK: 'pi pi-pen-to-square', JASA: 'pi pi-wrench' }
  return map[props.bucket] || 'pi pi-box'
})

const bucketRule = computed(() => {
  if (props.bucket === 'OBAT_BMHP') return { jual: true, stok: true }
  if (props.bucket === 'ATK') return { jual: false, stok: true }
  if (props.bucket === 'JASA') return { jual: false, stok: false }
  return { jual: false, stok: false }
})

// ── FORM STATE ─────────────────────────────────────────────────────────────
const defaultForm = () => ({
  NAMA: '',
  KATEGORI: '',
  MEREK: '',
  JENIS: '',
  BARCODE: '',
  IDBARANG: '',
  SATUAN_KECIL: '',
  SATUAN_SEDANG: '',
  SATUAN_BESAR: '',
  ISI_SEDANG_KE_KECIL: null,
  ISI_BESAR_KE_SEDANG: null,
  HARGABELI: null,
  HARGAJUAL: null,
  GROUPING: '',
  BENTUK_SEDIAAN: '',
  CODE_SEDIAAN: '',
  RUTE: '',
  KODE_RUTE: '',
  KANDUNGAN: null,
  SATUAN_KANDUNGAN: '',
  VOLUME_UOM_NAME: '',
  STOCKMINIMUM: 0,
  GUNAKAN_STOCK_MIN: false,
  CATATAN: '',
  iskronis: false,
  iskonsinyasi: false,
  KLASIFIKASI_OBAT: 'UMUM',
  GOLONGAN: null,
})

const form = ref(defaultForm())
const errors = ref({
  NAMA: '',
  KATEGORI: '',
  SATUAN_KECIL: '',
  ISI_SEDANG_KE_KECIL: '',
  ISI_BESAR_KE_SEDANG: '',
  GOLONGAN: '',
})

// Kategori & Farmasi
const kategoriList = ref([])
const sediaanList = ref([])
const ruteList = ref([])
const groupingList = ref([])
const klasifikasiList = ref([])

const golonganOptions = [
  { label: 'Golongan I', value: 'I' },
  { label: 'Golongan II', value: 'II' },
  { label: 'Golongan III', value: 'III' },
  { label: 'Golongan IV', value: 'IV' },
]

const showGolongan = computed(() => {
  const selected = klasifikasiList.value.find((k) => k.kode === form.value.KLASIFIKASI_OBAT)
  return selected?.ada_sub_golongan === '1' || selected?.ada_sub_golongan === 1
})

function onKlasifikasiChange() {
  if (!showGolongan.value) form.value.GOLONGAN = null
  errors.value.GOLONGAN = ''
}
// Sediaan & Rute Select binding
const sediaanInput = ref(null)
const ruteInput = ref(null)

// ── HELPERS ────────────────────────────────────────────────────────────────
const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

// ── AUTOSAVE / DRAFT ───────────────────────────────────────────────────────
const draftKey = computed(() => `barang_form_draft_${props.bucket}`)

function saveDraft() {
  if (!props.visible || isEditMode.value) return
  localStorage.setItem(
    draftKey.value,
    JSON.stringify({ form: form.value, savedAt: new Date().toISOString() }),
  )
  lastSavedAt.value = new Date()
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(draftKey.value)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearDraft() {
  localStorage.removeItem(draftKey.value)
  lastSavedAt.value = null
}

function formatDraftTime(date) {
  if (!date) return ''
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

watch(
  form,
  () => {
    if (!props.visible || isEditMode.value) return
    clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(saveDraft, 2000)
  },
  { deep: true },
)

function onStokMinChange() {
  form.value.GUNAKAN_STOCK_MIN = Number(form.value.STOCKMINIMUM) > 0
}

function validateField(name) {
  const val = form.value[name]
  if (!val || !val.toString().trim()) {
    errors.value[name] = name === 'NAMA' ? 'Nama barang wajib diisi' : 'Kategori wajib diisi'
    return false
  }
  if (name === 'NAMA' && val.length < 2) {
    errors.value[name] = 'Minimal 2 karakter'
    return false
  }
  errors.value[name] = ''
  return true
}

function validateSatuan() {
  errors.value.SATUAN_KECIL = ''
  errors.value.ISI_SEDANG_KE_KECIL = ''
  errors.value.ISI_BESAR_KE_SEDANG = ''
  if (props.bucket !== 'JASA') {
    if (!form.value.SATUAN_KECIL) errors.value.SATUAN_KECIL = 'Satuan kecil wajib diisi'
    if (form.value.SATUAN_SEDANG && !form.value.ISI_SEDANG_KE_KECIL)
      errors.value.ISI_SEDANG_KE_KECIL = 'Wajib diisi jika satuan sedang diisi'
    if (form.value.SATUAN_BESAR && !form.value.ISI_BESAR_KE_SEDANG)
      errors.value.ISI_BESAR_KE_SEDANG = 'Wajib diisi jika satuan besar diisi'
  }
}

function validateForm() {
  let valid = validateField('NAMA') & validateField('KATEGORI')
  validateSatuan()
  if (showGolongan.value && !form.value.GOLONGAN) {
    errors.value.GOLONGAN = 'Golongan wajib dipilih'
    valid = false
  } else {
    errors.value.GOLONGAN = ''
  }
  if (Object.values(errors.value).some((e) => e)) valid = false
  return !!valid
}

// ── GROUPING: auto-create saat submit jika belum ada di master ─────────────
async function ensureGroupingExists(name) {
  if (!name) return
  const exists = groupingList.value.some((g) => g.NAMA_GROUP === name)
  if (!exists) {
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/inventory/master_grouping_create`,
      { NAMA_GROUP: name },
      { params: { clientId: authStore.id_client } },
    )
  }
}

// ── SEDIAAN / RUTE: Select change handlers ─────────────────────────────────
function onSediaanSelect() {
  if (sediaanInput.value) {
    form.value.BENTUK_SEDIAAN = sediaanInput.value.NAMA_SEDIAAN
    form.value.CODE_SEDIAAN = sediaanInput.value.KODE_SEDIAAN || ''
  }
}
function onRuteSelect() {
  if (ruteInput.value) {
    form.value.RUTE = ruteInput.value.NAMA_RUTE
    form.value.KODE_RUTE = ruteInput.value.KODE_RUTE || ''
  }
}

function close() {
  emit('update:visible', false)
}

function onHide() {
  form.value = defaultForm()
  errors.value = {
    NAMA: '',
    KATEGORI: '',
    SATUAN_KECIL: '',
    ISI_SEDANG_KE_KECIL: '',
    ISI_BESAR_KE_SEDANG: '',
    GOLONGAN: '',
  }
  sediaanInput.value = null
  ruteInput.value = null
  lastSavedAt.value = null
  clearTimeout(autosaveTimer)
}

// ── API: DROPDOWNS ─────────────────────────────────────────────────────────
async function fetchMasterDropdowns() {
  const clientId = authStore.id_client
  try {
    const requests = [
      axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/kategori_list`, {
        params: { clientId, bucket: props.bucket },
      }),
    ]
    if (props.bucket === 'OBAT_BMHP') {
      requests.push(
        axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_sediaan_list`, {
          params: { clientId },
        }),
        axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_rute_list`, {
          params: { clientId },
        }),
        axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_grouping_list`, {
          params: { clientId },
        }),
        axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/master_klasifikasi_list`, {
          params: { clientId },
        }),
      )
    }

    const [kategoriRes, sediaanRes, ruteRes, groupingRes, klasifikasiRes] =
      await Promise.all(requests)
    kategoriList.value = kategoriRes.data?.response || kategoriRes.data || []
    if (props.bucket === 'OBAT_BMHP') {
      sediaanList.value = sediaanRes.data?.response || sediaanRes.data || []
      ruteList.value = ruteRes.data?.response || ruteRes.data || []
      groupingList.value = groupingRes.data?.response || groupingRes.data || []
      klasifikasiList.value = klasifikasiRes.data?.response || klasifikasiRes.data || []
    }
  } catch (err) {
    console.error('Error fetching master dropdowns:', err)
  }
}

// ── API: DETAIL (edit mode) ────────────────────────────────────────────────
async function fetchBarangDetail(id) {
  loading.value = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/barang_detail/${id}`,
      { params: { clientId: authStore.id_client } },
    )
    const data = res.data?.response || res.data
    if (!data) {
      showError('Data barang tidak ditemukan')
      close()
      return
    }

    form.value = {
      NAMA: data.NAMA || '',
      KATEGORI: data.KATEGORI || '',
      MEREK: data.MEREK || '',
      JENIS: data.JENIS || '',
      BARCODE: data.BARCODE || '',
      IDBARANG: data.IDBARANG || '',
      SATUAN_KECIL: data.SATUAN_KECIL || '',
      SATUAN_SEDANG: data.SATUAN_SEDANG || '',
      SATUAN_BESAR: data.SATUAN_BESAR || '',
      ISI_SEDANG_KE_KECIL: data.ISI_SEDANG_KE_KECIL || null,
      ISI_BESAR_KE_SEDANG: data.ISI_BESAR_KE_SEDANG || null,
      HARGABELI: data.HARGABELI || null,
      HARGAJUAL: data.HARGAJUAL || null,
      GROUPING: data.GROUPING || '',
      BENTUK_SEDIAAN: data.BENTUK_SEDIAAN || '',
      CODE_SEDIAAN: data.CODE_SEDIAAN || '',
      RUTE: data.RUTE || '',
      KODE_RUTE: data.KODE_RUTE || '',
      KANDUNGAN: data.KANDUNGAN || null,
      SATUAN_KANDUNGAN: data.SATUAN_KANDUNGAN || '',
      VOLUME_UOM_NAME: data.VOLUME_UOM_NAME || '',
      STOCKMINIMUM: data.STOCKMINIMUM || 0,
      GUNAKAN_STOCK_MIN: !!Number(data.GUNAKAN_STOCK_MIN),
      CATATAN: data.CATATAN || '',
      iskronis: !!Number(data.ISKRONIS),
      iskonsinyasi: !!Number(data.ISKONSINYASI),
      KLASIFIKASI_OBAT: data.KLASIFIKASI_OBAT || 'UMUM',
      GOLONGAN: data.GOLONGAN || null,
    }

    if (data.BENTUK_SEDIAAN)
      sediaanInput.value = sediaanList.value.find(
        (s) => s.NAMA_SEDIAAN === data.BENTUK_SEDIAAN,
      ) || { NAMA_SEDIAAN: data.BENTUK_SEDIAAN, KODE_SEDIAAN: data.CODE_SEDIAAN || '' }
    if (data.RUTE)
      ruteInput.value = ruteList.value.find((r) => r.NAMA_RUTE === data.RUTE) || {
        NAMA_RUTE: data.RUTE,
        KODE_RUTE: data.KODE_RUTE || '',
      }
  } catch (err) {
    console.error('Error fetching barang detail:', err)
    showError('Gagal mengambil data barang')
    close()
  } finally {
    loading.value = false
  }
}

// ── API: SAVE ──────────────────────────────────────────────────────────────
async function submitForm() {
  if (!validateForm()) {
    showError('Periksa kembali data yang diisi')
    return
  }

  loading.value = true
  try {
    if (form.value.GROUPING) await ensureGroupingExists(form.value.GROUPING)
    const clientId = authStore.id_client
    const payload = {
      NAMA: form.value.NAMA,
      KATEGORI: form.value.KATEGORI,
      MEREK: form.value.MEREK,
      JENIS: form.value.JENIS,
      BARCODE: form.value.BARCODE,
      IDBARANG: form.value.IDBARANG,
      CATATAN: form.value.CATATAN,
      ISKRONIS: form.value.iskronis ? 1 : 0,
      ISKONSINYASI: form.value.iskonsinyasi ? 1 : 0,
      KLASIFIKASI_OBAT: form.value.KLASIFIKASI_OBAT,
      GOLONGAN: showGolongan.value ? form.value.GOLONGAN : null,
      // Hardcoded per bucket — tidak ditampilkan ke user
      UNTUK_DIJUAL: bucketRule.value.jual ? 1 : 0,
      POTONGSTOCK: bucketRule.value.stok ? 1 : 0,
      GUNAKAN_STOCK_MIN: form.value.GUNAKAN_STOCK_MIN ? 1 : 0,
      STOCKMINIMUM: form.value.STOCKMINIMUM,
    }

    if (props.bucket !== 'JASA') {
      payload.SATUAN_KECIL = form.value.SATUAN_KECIL
      if (form.value.SATUAN_SEDANG) {
        payload.SATUAN_SEDANG = form.value.SATUAN_SEDANG
        payload.ISI_SEDANG_KE_KECIL = form.value.ISI_SEDANG_KE_KECIL
      }
      if (form.value.SATUAN_BESAR) {
        payload.SATUAN_BESAR = form.value.SATUAN_BESAR
        payload.ISI_BESAR_KE_SEDANG = form.value.ISI_BESAR_KE_SEDANG
      }
    }

    if (props.bucket === 'JASA') {
      payload.HARGABELI = form.value.HARGABELI
      payload.HARGAJUAL = form.value.HARGAJUAL
    }

    if (props.bucket === 'OBAT_BMHP') {
      payload.GROUPING = form.value.GROUPING
      payload.BENTUK_SEDIAAN = form.value.BENTUK_SEDIAAN
      payload.CODE_SEDIAAN = form.value.CODE_SEDIAAN
      payload.RUTE = form.value.RUTE
      payload.KODE_RUTE = form.value.KODE_RUTE
      payload.KANDUNGAN = form.value.KANDUNGAN
      payload.SATUAN_KANDUNGAN = form.value.SATUAN_KANDUNGAN
      payload.VOLUME_UOM_NAME = form.value.VOLUME_UOM_NAME
    }

    const finalPayload = Object.fromEntries(
      Object.entries(payload).map(([k, v]) => [
        k,
        typeof v === 'string' && v ? v.trim().toUpperCase() : v,
      ]),
    )

    let res
    if (isEditMode.value) {
      res = await axios.put(
        `${configStore.apiApotikUrl}/index.php/api/inventory/barang_update/${props.itemId}`,
        finalPayload,
        { params: { clientId } },
      )
    } else {
      res = await axios.post(
        `${configStore.apiApotikUrl}/index.php/api/inventory/barang_create`,
        finalPayload,
        { params: { clientId, lokasiId: authStore.id_lokasi } },
      )
    }

    const meta = res.data?.metadata
    if (meta && meta.code !== 200) {
      showError(meta.message || 'Gagal menyimpan data')
      return
    }

    showSuccess(isEditMode.value ? 'Barang berhasil diperbarui' : 'Barang berhasil ditambahkan')
    clearDraft()
    emit('saved')
    close()
  } catch (err) {
    console.error('Error submitting form:', err)
    showError('Gagal menyimpan data barang')
  } finally {
    loading.value = false
  }
}

// ── API: DELETE ────────────────────────────────────────────────────────────
function confirmDelete() {
  confirm.require({
    message: 'Hapus barang ini? Data akan ditandai sebagai dihapus.',
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    acceptClass: 'p-button-danger',
    accept: async () => {
      loading.value = true
      try {
        await axios.delete(
          `${configStore.apiApotikUrl}/index.php/api/inventory/barang_delete/${props.itemId}`,
          { params: { clientId: authStore.id_client } },
        )
        showSuccess('Barang berhasil dihapus')
        emit('saved')
        close()
      } catch (err) {
        showError('Gagal menghapus barang')
      } finally {
        loading.value = false
      }
    },
  })
}

// ── LIFECYCLE ──────────────────────────────────────────────────────────────
watch(
  () => props.visible,
  async (val) => {
    if (!val) return
    form.value = defaultForm()
    sediaanInput.value = null
    ruteInput.value = null
    await fetchMasterDropdowns()
    if (props.itemId) {
      await fetchBarangDetail(props.itemId)
    } else {
      const draft = loadDraft()
      if (draft?.form) {
        Object.assign(form.value, draft.form)
        lastSavedAt.value = draft.savedAt ? new Date(draft.savedAt) : null
        toast.add({
          severity: 'info',
          summary: 'Draft dipulihkan',
          detail: 'Data form sebelumnya dimuat otomatis',
          life: 3500,
        })
      }
    }
  },
)
</script>

<style scoped>
/* ── SECTION ─────────────────────────────────────────────────────────────── */
.fm-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px 14px;
}
.fm-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #006064;
  border-bottom: 1px solid #e0f7fa;
  padding-bottom: 6px;
  margin-bottom: 10px;
}
.fm-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 4px;
}
.fm-opt {
  font-weight: 400;
  color: #9ca3af;
  font-size: 11px;
}
.fm-hint {
  font-size: 11px;
  color: #6b7280;
  display: block;
  margin-top: 3px;
}

/* ── INPUT + ADD ──────────────────────────────────────────────────────────── */
.input-with-add {
  display: flex;
  gap: 8px;
  align-items: center;
}
.input-with-add .flex-1 {
  flex: 1;
  min-width: 0;
}

/* ── KONVERSI PREVIEW ─────────────────────────────────────────────────────── */
.konversi-preview {
  background: #f0fdfa;
  border: 1px solid #b2dfdb;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  color: #0f766e;
}

/* ── STOK MIN HINT ────────────────────────────────────────────────────────── */
.stok-min-hint {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.hint-on {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}
.hint-off {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* ── INFO CARD ────────────────────────────────────────────────────────────── */
.fm-info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 14px;
  position: sticky;
  top: 0;
}
.fm-info-header {
  font-size: 13px;
  font-weight: 700;
  color: #006064;
  margin-bottom: 10px;
}
.fm-info-rules {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fm-rule {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.rule-yes {
  background: #f0fdf4;
  color: #166534;
}
.rule-no {
  background: #fef2f2;
  color: #991b1b;
}
.fm-hint-list {
  font-size: 11.5px;
  color: #475569;
  line-height: 1.8;
}
.fm-hint-item {
  color: #64748b;
  font-size: 11px;
}

/* ── MODAL FOOTER ─────────────────────────────────────────────────────────── */
.modal-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* ── KLASIFIKASI CHECKBOX ROW ─────────────────────────────────────────────── */
.klasifikasi-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 6px;
}
.klasifikasi-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.klasifikasi-label {
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

/* ── DRAFT INDICATOR ──────────────────────────────────────────────────────── */
.draft-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #0891b2;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  border-radius: 4px;
  padding: 3px 8px;
  white-space: nowrap;
}
.draft-clear-btn {
  background: none;
  border: none;
  padding: 0 2px;
  cursor: pointer;
  color: #0891b2;
  font-size: 10px;
  line-height: 1;
  display: flex;
  align-items: center;
}
.draft-clear-btn:hover {
  color: #164e63;
}

/* ── BUTTONS ──────────────────────────────────────────────────────────────── */
.btn-primary-barang {
  background: darkcyan !important;
  border-color: darkcyan !important;
  color: #fff !important;
}
.btn-primary-barang:hover {
  background: #008b99 !important;
  border-color: #008b99 !important;
}
</style>
