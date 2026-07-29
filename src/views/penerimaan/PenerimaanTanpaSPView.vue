<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Menyimpan..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" :disabled="loading" />
        <div class="pm-hero-icon"><i class="pi pi-plus-circle"></i></div>
        <div>
          <h4 class="pm-hero-title">Penerimaan Tanpa SP</h4>
          <p class="pm-hero-sub">Terima barang langsung dari supplier tanpa Surat Pemesanan</p>
        </div>
      </div>
    </div>

    <div class="row g-3">

      <!-- SUPPLIER + KATEGORI -->
      <div class="col-12">
        <div class="pm-fm-section">
          <div class="sup-kat-grid">
            <div>
              <div class="pm-fm-section-title" style="border-bottom:none;padding-bottom:0;margin-bottom:8px"><i class="pi pi-building me-1"></i>SUPPLIER</div>
              <Select
                v-model="supplierObj"
                :options="supplierList"
                optionLabel="NAMASUPLIER"
                filter
                filterPlaceholder="Cari supplier..."
                placeholder="Pilih supplier..."
                class="w-100"
                :loading="supplierLoading"
                :disabled="loading"
                :class="{ 'p-invalid': errors.supplier }"
                @change="onSupplierSelect"
              />
              <small v-if="errors.supplier" class="text-danger d-block mt-1">{{ errors.supplier }}</small>
              <div v-if="supplierObj" class="sup-info mt-2">
                <div class="sup-info-row" v-if="supplierObj.ALAMAT">
                  <i class="pi pi-map-marker sup-info-ico"></i>
                  <span style="font-size:12px">{{ supplierObj.ALAMAT }}</span>
                </div>
                <div class="sup-info-row" v-if="supplierObj.NOHP || supplierObj.TELP">
                  <i class="pi pi-phone sup-info-ico"></i>
                  <span class="mono" style="font-size:12px">{{ supplierObj.NOHP || supplierObj.TELP }}</span>
                </div>
              </div>
            </div>
            <div class="sup-kat-divider"></div>
            <div>
              <div class="pm-fm-section-title" style="border-bottom:none;padding-bottom:0;margin-bottom:8px"><i class="pi pi-tag me-1"></i>KATEGORI</div>
              <div class="kategori-group">
                <button
                  v-for="k in kategoriOptions"
                  :key="k.value"
                  class="kategori-btn"
                  :class="{ active: jenisSP === k.value }"
                  type="button"
                  :disabled="loading"
                  @click="onKategoriChange(k.value)"
                >{{ k.label }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ITEMS TABLE -->
      <div class="col-12">
        <div class="pm-fm-section">
          <div class="pm-fm-section-title d-flex align-items-center justify-content-between">
            <span><i class="pi pi-list me-1"></i>DAFTAR ITEM</span>
            <Button icon="pi pi-plus" label="Tambah Item" size="small" class="round-button2 btn-primary-pm" @click="addItem" :disabled="loading" />
          </div>

          <div v-if="itemError" class="pm-warn-box mb-2">
            <i class="pi pi-exclamation-triangle me-1"></i>{{ itemError }}
          </div>

          <div style="overflow-x:auto">
            <table class="pm-items-table">
              <thead>
                <tr>
                  <th style="width:30px">#</th>
                  <th style="min-width:200px">Nama Barang</th>
                  <th style="width:110px">Satuan</th>
                  <th style="width:70px;text-align:center">Stok</th>
                  <th style="width:85px">Qty</th>
                  <th style="width:125px">Harga Satuan</th>
                  <th style="width:75px">Diskon %</th>
                  <th style="width:195px">Harga Jual / Margin</th>
                  <th style="width:110px">No Batch</th>
                  <th style="width:115px">Tgl Expired</th>
                  <th style="width:120px;text-align:right">Subtotal</th>
                  <th style="width:36px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in items" :key="i" :class="{ 'item-row-warn': item._error }">
                  <td class="mono" style="color:#94a3b8;text-align:center">{{ i + 1 }}</td>

                  <td>
                    <Select
                      v-model="item._barangObj"
                      :options="barangList"
                      optionLabel="NAMA"
                      filter
                      filterPlaceholder="Ketik min. 2 huruf untuk cari..."
                      placeholder="Pilih barang..."
                      class="w-100"
                      :loading="barangLoading"
                      :disabled="loading"
                      :class="{ 'p-invalid': item._error && !item._barangObj }"
                      @filter="onBarangFilter"
                      @change="() => onBarangSelect(item)"
                    >
                      <template #option="{ option }">
                        <div style="font-size:12px">
                          <div class="fw-semibold">{{ option.NAMA }}</div>
                          <div style="font-size:10px;color:#94a3b8">{{ option.IDBARANG }} · {{ option.KATEGORI }}</div>
                        </div>
                      </template>
                      <template #empty>
                        <div style="padding:10px 14px;font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px">
                          <i v-if="barangLoading" class="pi pi-spin pi-spinner"></i>
                          <span>{{ barangLoading ? 'Mencari barang...' : 'Ketik min. 2 huruf untuk mencari barang' }}</span>
                        </div>
                      </template>
                    </Select>
                    <small v-if="item._barangObj" style="font-size:10px;color:#94a3b8">{{ item.id_barang }}</small>
                  </td>

                  <td>
                    <Select
                      v-model="item.satuan"
                      :options="item.satuan_options"
                      placeholder="Satuan"
                      class="w-100"
                      :disabled="!item._barangObj || loading"
                    />
                  </td>

                  <td>
                    <div class="stok-box" :class="stokDisplay(item) === 0 ? 'stok-box-zero' : stokDisplay(item) !== null ? 'stok-box-ok' : 'stok-box-empty'">
                      <span v-if="stokDisplay(item) !== null" class="mono">{{ stokDisplay(item) }}</span>
                      <span v-else style="color:#cbd5e1">—</span>
                    </div>
                  </td>

                  <td>
                    <input
                      v-model.number="item.qty_diterima"
                      type="number" min="1"
                      class="pm-num-input"
                      :disabled="!item._barangObj || loading"
                      :class="{ 'input-warn': item._error }"
                    />
                  </td>

                  <td>
                    <input
                      v-model.number="item.harga_satuan"
                      type="number" min="0"
                      class="pm-num-input"
                      placeholder="0"
                      :disabled="!item._barangObj || loading"
                    />
                    <div v-if="hargaEfektif(item)" style="font-size:10px;color:#64748b;margin-top:2px;line-height:1.4">
                      <template v-if="item.diskon">
                        <span>- diskon: {{ formatCurrency(hargaSetelahDiskon(item)) }}</span><br>
                      </template>
                      <template v-if="form.pajak_include === 0 && form.pajak > 0">
                        <span style="color:#0d9488;font-weight:600">+ PPN: {{ formatCurrency(hargaEfektif(item)) }}</span>
                      </template>
                      <template v-else-if="item.diskon">
                        <span style="color:#0d9488;font-weight:600">netto: {{ formatCurrency(hargaSetelahDiskon(item)) }}</span>
                      </template>
                    </div>
                  </td>

                  <td>
                    <input
                      v-model.number="item.diskon"
                      type="number" min="0" max="100"
                      class="pm-num-input"
                      placeholder="0"
                      :disabled="!item._barangObj || loading"
                    />
                  </td>

                  <td>
                    <div class="hj-wrap">
                      <div v-if="item._harga_mode !== 'margin'" class="hj-input-wrap">
                        <input v-model.number="item.harga_jual" type="number" min="0" class="pm-num-input" placeholder="0" :disabled="!item._barangObj || loading" />
                      </div>
                      <div v-else class="hj-input-wrap">
                        <div style="display:flex;align-items:center;gap:4px">
                          <input v-model.number="item._margin" type="number" min="0" class="pm-num-input" placeholder="0" :disabled="!item._barangObj || !item.harga_satuan || loading" @input="() => computeHargaJual(item)" />
                          <span style="font-size:11px;color:#64748b">%</span>
                        </div>
                        <div v-if="item.harga_jual" style="font-size:10px;color:#0d9488;margin-top:2px">= {{ formatCurrency(item.harga_jual) }}</div>
                        <div v-else-if="!item.harga_satuan" style="font-size:10px;color:#94a3b8;margin-top:2px">isi harga satuan dulu</div>
                      </div>
                      <div class="hj-mode-toggle">
                        <button class="hj-mode-btn" :class="{ active: item._harga_mode !== 'margin' }" @click="setHargaMode(item, 'manual')" type="button" :disabled="!item._barangObj || loading">Harga Jual</button>
                        <button class="hj-mode-btn" :class="{ active: item._harga_mode === 'margin' }" @click="setHargaMode(item, 'margin')" type="button" :disabled="!item._barangObj || loading">Margin %</button>
                      </div>
                    </div>
                  </td>

                  <td>
                    <InputText v-model="item.no_batch" class="w-100" placeholder="BATCH-01" :disabled="!item._barangObj || loading" style="font-size:12px" />
                  </td>

                  <td>
                    <input type="date" v-model="item.tgl_expired" class="pm-date-input w-100" :disabled="!item._barangObj || loading" />
                  </td>

                  <td style="text-align:right;padding-right:10px">
                    <span v-if="subtotalItem(item)" class="mono" style="font-weight:600;color:#0f766e;font-size:12px">{{ formatCurrency(subtotalItem(item)) }}</span>
                    <span v-else style="color:#cbd5e1">—</span>
                  </td>

                  <td style="text-align:center">
                    <Button
                      icon="pi pi-times"
                      text rounded severity="danger"
                      size="small"
                      style="width:1.4rem;height:1.4rem;min-height:unset"
                      @click="removeItem(i)"
                      :disabled="loading"
                    />
                  </td>
                </tr>

                <tr v-if="items.length === 0">
                  <td colspan="11" style="text-align:center;color:#94a3b8;padding:36px;font-size:12px">
                    <i class="pi pi-inbox" style="font-size:24px;display:block;margin-bottom:8px;color:#cbd5e1"></i>
                    Belum ada item. Klik "Tambah Item" untuk menambahkan barang.
                  </td>
                </tr>
              </tbody>

              <tfoot v-if="grandTotal > 0">
                <tr class="grand-total-row">
                  <td colspan="9" style="text-align:right;font-weight:700;font-size:12px;color:#374151;padding:8px 10px">Grand Total</td>
                  <td style="text-align:right;padding:8px 10px">
                    <span class="mono" style="font-weight:700;font-size:13px;color:#0d9488">{{ formatCurrency(grandTotal) }}</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-if="items.length > 0" class="pm-items-summary">
            <span><strong>{{ items.length }}</strong> item ditambahkan</span>
            <span v-if="filledItems.length > 0" style="color:#0d9488">
              · <strong>{{ filledItems.length }}</strong> sudah lengkap
            </span>
          </div>
        </div>
      </div>

      <!-- PAJAK -->
      <div class="col-12">
        <div class="pajak-section">
          <div class="pajak-section-left">
            <i class="pi pi-percentage" style="font-size:13px;color:#0d9488"></i>
            <span class="pajak-section-label">Pajak</span>
            <div class="toggle-group-sm">
              <button class="toggle-btn-sm" :class="{ active: form.pajak_include === 1 }" @click="form.pajak_include = 1" type="button" :disabled="loading">Include</button>
              <button class="toggle-btn-sm" :class="{ active: form.pajak_include === 0 }" @click="form.pajak_include = 0" type="button" :disabled="loading">Exclude</button>
            </div>
          </div>
          <transition name="fade-slide">
            <div v-if="form.pajak_include === 0" class="pajak-section-right">
              <span style="font-size:12px;color:#64748b">Persentase:</span>
              <input v-model.number="form.pajak" type="number" min="0" max="100" class="pajak-pct-input" placeholder="0" :disabled="loading" />
              <span style="font-size:13px;color:#64748b;font-weight:600">%</span>
            </div>
            <div v-else class="pajak-section-right">
              <span class="pajak-include-note"><i class="pi pi-check me-1"></i>Harga sudah termasuk pajak</span>
            </div>
          </transition>
        </div>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="pm-page-footer">
      <Button label="Batal" severity="secondary" outlined class="round-button2" @click="goBack" :disabled="loading" />
      <Button
        label="Simpan Penerimaan"
        icon="pi pi-check"
        class="round-button2 btn-primary-pm"
        @click="bukaKonfirmasi"
        :disabled="filledItems.length === 0 || !supplierObj || loading"
      />
    </div>

    <!-- DIALOG KONFIRMASI -->
    <Dialog
      v-model:visible="konfirmasiVisible"
      header="Konfirmasi Penerimaan"
      modal
      :style="{ width: '520px', maxWidth: '96vw' }"
      :closable="!loading"
    >
      <div class="konf-sp-card">
        <div class="konf-sp-row">
          <span class="konf-lbl">Supplier</span>
          <span class="konf-val fw-semibold">{{ supplierObj?.NAMASUPLIER }}</span>
        </div>
        <div class="konf-sp-row">
          <span class="konf-lbl">Jumlah Item</span>
          <span class="konf-val">{{ filledItems.length }} item</span>
        </div>
        <div class="konf-sp-row" v-if="grandTotal > 0">
          <span class="konf-lbl">Grand Total</span>
          <span class="konf-val mono fw-bold" style="color:#0d9488">{{ formatCurrency(grandTotal) }}</span>
        </div>
      </div>

      <div class="konf-divider"></div>

      <div class="konf-form">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="konf-field">
            <label class="pm-fm-label">Tanggal Penerimaan <span class="text-danger">*</span></label>
            <input type="date" v-model="form.tanggal_penerimaan" class="pm-date-input w-100" :disabled="loading" />
          </div>
          <div class="konf-field">
            <label class="pm-fm-label">No. Faktur <span class="text-danger">*</span></label>
            <InputText v-model="form.no_faktur" class="w-100" placeholder="INV-001" :disabled="loading" style="font-size:12px" :class="{ 'p-invalid': konfErrors.no_faktur }" />
            <small v-if="konfErrors.no_faktur" class="text-danger d-block mt-1">{{ konfErrors.no_faktur }}</small>
          </div>
        </div>
        <div class="konf-field">
          <label class="pm-fm-label">Cara Bayar</label>
          <div class="cara-bayar-group">
            <button class="cara-bayar-btn" :class="{ active: form.payment_id === 1 }" @click="form.payment_id = 1" type="button" :disabled="loading">
              <span class="cb-icon"><i class="pi pi-wallet"></i></span>
              <span class="cb-text"><span class="cb-label">Tunai</span><span class="cb-sub">Bayar langsung</span></span>
            </button>
            <button class="cara-bayar-btn" :class="{ active: form.payment_id === 3 }" @click="form.payment_id = 3" type="button" :disabled="loading">
              <span class="cb-icon"><i class="pi pi-credit-card"></i></span>
              <span class="cb-text"><span class="cb-label">Kredit / Hutang</span><span class="cb-sub">Bayar nanti</span></span>
            </button>
          </div>
        </div>

        <transition name="fade-slide">
          <div v-if="form.payment_id === 3" class="konf-field">
            <label class="pm-fm-label">Tanggal Jatuh Tempo <span class="text-danger">*</span></label>
            <input type="date" v-model="form.jatuh_tempo" class="pm-date-input w-100" :disabled="loading" :class="{ 'input-date-warn': konfErrors.jatuh_tempo }" />
            <small v-if="konfErrors.jatuh_tempo" class="text-danger d-block mt-1">{{ konfErrors.jatuh_tempo }}</small>
          </div>
        </transition>

        <div class="konf-field">
          <label class="pm-fm-label">Foto / Lampiran Faktur <span class="pm-fm-opt">(opsional)</span></label>
          <div v-if="!lampiran.file"
            class="upload-area"
            :class="{ 'upload-area-drag': lampiran.isDrag }"
            @dragover.prevent="lampiran.isDrag = true"
            @dragleave="lampiran.isDrag = false"
            @drop.prevent="onFileDrop"
            @click="$refs.fileInput.click()"
          >
            <i class="pi pi-upload" style="font-size:20px;color:#94a3b8"></i>
            <div style="font-size:12px;color:#64748b;margin-top:6px">Klik atau drag file ke sini</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:2px">JPG, JPEG, PNG, PDF</div>
          </div>
          <div v-else class="upload-status upload-success">
            <i class="pi pi-paperclip" style="color:#16a34a;font-size:18px"></i>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;font-weight:600;color:#15803d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ lampiran.file.name }}</div>
              <div style="font-size:10px;color:#94a3b8">{{ (lampiran.file.size / 1024).toFixed(0) }} KB · akan diupload saat simpan</div>
            </div>
            <Button icon="pi pi-times" text rounded size="small" severity="danger" @click="hapusLampiran" :disabled="loading" />
          </div>
          <small v-if="lampiran.error" class="text-danger d-block mt-1">{{ lampiran.error }}</small>
          <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.pdf" style="display:none" @change="onFileSelect" />
        </div>
      </div>

      <template #footer>
        <Button label="Batal" severity="secondary" outlined class="round-button2" @click="konfirmasiVisible = false" :disabled="loading" />
        <Button label="Simpan Penerimaan" icon="pi pi-check" class="round-button2 btn-primary-pm" @click="submitPenerimaan" :loading="loading" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const today = new Date().toISOString().slice(0, 10)

const form = ref({
  tanggal_penerimaan: today,
  no_faktur: '',
  pajak: 0,
  pajak_include: 1,
  payment_id: 1,
  jatuh_tempo: '',
})

// ── SUPPLIER ──
const supplierList = ref([])
const supplierLoading = ref(false)
const supplierObj = ref(null)
const errors = ref({ supplier: '' })

function onSupplierSelect() {
  errors.value.supplier = ''
}

// ── KATEGORI ──
const kategoriOptions = [
  { label: 'Obat Umum', value: 'OBT' },
  { label: 'Psikotropika', value: 'PSI' },
  { label: 'Prekursor', value: 'PRE' },
  { label: 'Narkotika', value: 'NAR' },
  { label: 'Barang', value: 'BRG' },
]
const jenisSP = ref('OBT')

function onKategoriChange(val) {
  jenisSP.value = val
  items.value = []
  itemError.value = ''
  fetchBarang()
}

// ── BARANG ──
const barangList = ref([])
const barangLoading = ref(false)
let _barangTimer = null

async function fetchBarang(search = '') {
  barangLoading.value = true
  try {
    const params = { clientId: authStore.id_client, lokasiId: authStore.id_lokasi, jenis_sp: jenisSP.value, limit: search ? 50 : 10, page: 1, ARSIPKAN: 0 }
    if (search) params.search = search
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_list`, { params })
    barangList.value = res.data?.response || res.data?.data || res.data || []
  } catch {
    // silent
  } finally {
    barangLoading.value = false
  }
}

function onBarangFilter(e) {
  const keyword = e.value?.trim() ?? ''
  clearTimeout(_barangTimer)
  if (keyword.length > 0 && keyword.length < 2) return
  _barangTimer = setTimeout(() => fetchBarang(keyword), 400)
}

// ── ITEMS ──
const items = ref([])
const itemError = ref('')

function newItem() {
  return {
    _barangObj: null,
    id_barang: '',
    satuan: '',
    satuan_options: [],
    qty_diterima: 1,
    harga_satuan: null,
    diskon: null,
    harga_jual: null,
    _margin: null,
    _harga_mode: 'manual',
    no_batch: '',
    tgl_expired: '',
    stok_kecil: null,
    isi_sedang: null,
    isi_besar: null,
    _error: false,
  }
}

function addItem() { items.value.push(newItem()) }
function removeItem(i) { items.value.splice(i, 1); itemError.value = '' }

function onBarangSelect(item) {
  const b = item._barangObj
  if (!b) { item.id_barang = ''; item.satuan = ''; item.satuan_options = []; item.stok_kecil = null; return }
  item.id_barang = b.IDBARANG || b.ID || ''
  const opts = [b.SATUAN_KECIL, b.SATUAN_SEDANG, b.SATUAN_BESAR].filter(Boolean)
  item.satuan_options = opts
  item.satuan = opts[0] || ''
  item.harga_satuan = b.HARGA_JUAL ?? null
  item.stok_kecil = b.TOTAL_STOCK ?? null
  item.isi_sedang = b.ISI_SEDANG ?? null
  item.isi_besar = b.ISI_BESAR ?? null
  item._error = false
  item.harga_jual = null
  item._margin = null
  itemError.value = ''
}

function stokDisplay(item) {
  if (item.stok_kecil === null || !item._barangObj) return null
  const b = item._barangObj
  if (item.satuan === b.SATUAN_SEDANG && item.isi_sedang) return Math.floor(item.stok_kecil / item.isi_sedang)
  if (item.satuan === b.SATUAN_BESAR && item.isi_sedang && item.isi_besar) return Math.floor(item.stok_kecil / (item.isi_sedang * item.isi_besar))
  return item.stok_kecil
}

function setHargaMode(item, mode) {
  item._harga_mode = mode
  if (mode === 'manual') item._margin = null
  else item.harga_jual = null
}

function computeHargaJual(item) {
  if (!item.harga_satuan || item._margin == null) return
  item.harga_jual = Math.round(item.harga_satuan * (1 + item._margin / 100))
}

function hargaSetelahDiskon(item) {
  if (!item.harga_satuan) return null
  const diskon = Number(item.diskon) || 0
  return Math.round(item.harga_satuan * (1 - diskon / 100))
}

function hargaEfektif(item) {
  if (!item.harga_satuan) return null
  const netto = hargaSetelahDiskon(item)
  const pajak = Number(form.value.pajak) || 0
  if (form.value.pajak_include === 0 && pajak > 0) return Math.round(netto * (1 + pajak / 100))
  if (item.diskon) return netto
  return null
}

function subtotalItem(item) {
  const qty = Number(item.qty_diterima) || 0
  const harga = Number(item.harga_satuan) || 0
  if (!qty || !harga) return 0
  const diskon = Number(item.diskon) || 0
  const netto = Math.round(harga * (1 - diskon / 100))
  const pajak = Number(form.value.pajak) || 0
  if (form.value.pajak_include === 0 && pajak > 0) return Math.round(netto * (1 + pajak / 100)) * qty
  return netto * qty
}

const grandTotal = computed(() => items.value.reduce((sum, i) => sum + subtotalItem(i), 0))
const filledItems = computed(() => items.value.filter(i => i._barangObj && i.qty_diterima > 0))

// ── LAMPIRAN ──
const lampiran = ref({ file: null, error: '', isDrag: false })
function hapusLampiran() { lampiran.value = { file: null, error: '', isDrag: false } }
function onFileDrop(e) {
  lampiran.value.isDrag = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setLampiran(file)
}
function onFileSelect(e) {
  const file = e.target.files?.[0]
  if (file) setLampiran(file)
  e.target.value = ''
}
function setLampiran(file) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowed.includes(file.type)) {
    lampiran.value = { file: null, error: 'Format tidak didukung. Gunakan JPG, PNG, atau PDF.', isDrag: false }
    return
  }
  lampiran.value = { file, error: '', isDrag: false }
}

// ── VALIDASI & SUBMIT ──
const konfirmasiVisible = ref(false)
const konfErrors = ref({ jatuh_tempo: '', no_faktur: '' })

function validate() {
  errors.value.supplier = !supplierObj.value ? 'Supplier wajib dipilih' : ''
  if (errors.value.supplier) return false
  itemError.value = ''
  if (filledItems.value.length === 0) {
    itemError.value = 'Minimal 1 item harus diisi qty dan barang'
    return false
  }
  for (const item of filledItems.value) {
    if (!item.satuan) {
      item._error = true
      itemError.value = `Satuan wajib dipilih untuk ${item._barangObj?.NAMABARANG}`
      return false
    }
    if (!item.qty_diterima || item.qty_diterima <= 0) {
      item._error = true
      itemError.value = `Qty harus lebih dari 0 untuk ${item._barangObj?.NAMABARANG}`
      return false
    }
    if (!item.harga_satuan || item.harga_satuan <= 0) {
      item._error = true
      itemError.value = `Harga satuan wajib diisi untuk ${item._barangObj?.NAMABARANG}`
      return false
    }
  }
  return true
}

function bukaKonfirmasi() {
  if (!validate()) return
  konfErrors.value = { jatuh_tempo: '' }
  konfirmasiVisible.value = true
}

async function submitPenerimaan() {
  konfErrors.value = { jatuh_tempo: '', no_faktur: '' }
  if (!form.value.no_faktur?.trim()) {
    konfErrors.value.no_faktur = 'No. Faktur wajib diisi'
    return
  }
  if (form.value.payment_id === 3 && !form.value.jatuh_tempo) {
    konfErrors.value.jatuh_tempo = 'Tanggal jatuh tempo wajib diisi untuk pembayaran kredit'
    return
  }
  loading.value = true
  try {
    const details = filledItems.value.map(i => {
      const d = {
        id_barang: i.id_barang,
        satuan: i.satuan,
        qty_diterima: i.qty_diterima,
      }
      if (i.harga_satuan != null) d.harga_satuan = i.harga_satuan
      if (i.diskon != null && i.diskon !== '') d.diskon = i.diskon
      if (i.harga_jual) d.harga_jual = i.harga_jual
      if (i.no_batch) d.no_batch = i.no_batch
      if (i.tgl_expired) d.tgl_expired = i.tgl_expired
      return d
    })

    const payload = {
      id_supplier: String(supplierObj.value.IDSUPLIER || supplierObj.value.id || supplierObj.value.ID),
      tanggal_penerimaan: form.value.tanggal_penerimaan,
      user_id: authStore.user_id,
      idclient: authStore.id_client,
      id_lokasi: authStore.id_lokasi,
      pajak: Number(form.value.pajak) || 0,
      pajak_include: form.value.pajak_include,
      payment_id: form.value.payment_id,
      details,
    }
    payload.no_faktur = form.value.no_faktur.trim()
    if (form.value.payment_id === 3 && form.value.jatuh_tempo) payload.jatuh_tempo = form.value.jatuh_tempo

    let requestBody
    if (lampiran.value.file) {
      const fd = new FormData()
      fd.append('data', JSON.stringify(payload))
      fd.append('lampiran', lampiran.value.file)
      requestBody = fd
    } else {
      requestBody = payload
    }

    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/save_penerimaan_tanpa_sp`,
      requestBody
    )
    const code = res.data?.metadata?.code ?? res.data?.code
    if (code !== 200) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Gagal menyimpan penerimaan', life: 4000 })
      return
    }
    const noPenerimaan = res.data?.metadata?.no_penerimaan
    konfirmasiVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Penerimaan Berhasil',
      detail: noPenerimaan ? `No Penerimaan: ${noPenerimaan}` : 'Penerimaan berhasil disimpan',
      life: 5000,
    })
    router.push({ name: 'PenerimaanList' })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.metadata?.message || err.response?.data?.message || 'Gagal menyimpan penerimaan', life: 4000 })
  } finally {
    loading.value = false
  }
}

function goBack() { router.push({ name: 'PenerimaanList' }) }

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(async () => {
  supplierLoading.value = true
  try {
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/supplier_all`, {
      params: { clientId: authStore.id_client },
    })
    supplierList.value = res.data?.response || res.data || []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat daftar supplier', life: 3000 })
  } finally {
    supplierLoading.value = false
  }
  fetchBarang()
})
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0;white-space:nowrap; }

.pm-fm-section { background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:0; }
.pm-fm-section-title { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;padding-bottom:8px;border-bottom:1px solid #ccfbf1;margin-bottom:12px; }
.pm-fm-label { font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;display:block; }
.pm-fm-opt { font-weight:400;color:#94a3b8;font-size:11px; }

.pm-date-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;font-family:inherit;color:#1e293b;background:#fff;height:34px; }
.pm-date-input:focus { outline:none;border-color:#0d9488; }
.pm-date-input:disabled { background:#f8fafc;color:#94a3b8; }

.sup-kat-grid { display:grid;grid-template-columns:1fr auto 1fr;gap:0;align-items:start; }
.sup-kat-divider { width:1px;background:#e2e8f0;margin:0 20px;align-self:stretch; }
.sup-info { display:flex;flex-direction:column;gap:4px; }
.sup-info-row { display:flex;align-items:flex-start;gap:6px;color:#475569; }
.sup-info-ico { font-size:11px;color:#94a3b8;margin-top:2px;flex-shrink:0; }

.pm-items-table { width:100%;border-collapse:collapse;font-size:12px; }
.pm-items-table thead tr { background:#f0fdfa; }
.pm-items-table thead th { padding:5px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.pm-items-table tbody tr { border-bottom:1px solid #e2e8f0; }
.pm-items-table tbody tr:hover { background:#f8fafc; }
.pm-items-table tbody td { padding:5px 6px;vertical-align:top; }
.item-row-warn { background:#fff7ed !important; }
.stok-box { border:1px solid #e2e8f0;border-radius:5px;padding:5px 8px;font-size:12px;font-weight:700;text-align:center;background:#f8fafc;min-height:34px;display:flex;align-items:center;justify-content:center; }
.stok-box-ok   { color:#0f766e;border-color:#99f6e4;background:#f0fdfa; }
.stok-box-zero { color:#dc2626;border-color:#fca5a5;background:#fff1f2; }
.stok-box-empty { color:#cbd5e1; }
.item-row-warn td { background:#fff7ed !important; }
.grand-total-row { background:#f0fdfa;border-top:2px solid #99f6e4; }

.pm-num-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;width:100%;font-family:inherit;color:#1e293b;height:34px; }
.pm-num-input:focus { outline:none;border-color:#0d9488; }
.pm-num-input.input-warn { border-color:#f97316; }
.pm-num-input:disabled { background:#f8fafc;color:#94a3b8; }
.pm-items-table, .pm-items-table *:not(i):not([class*="pi"]) { font-family:inherit !important; }
:deep(.pm-items-table .p-inputtext) { border-radius:5px !important;height:34px !important;font-size:12px !important;padding:5px 8px !important; }
:deep(.pm-items-table .p-select) { border-radius:5px !important;height:34px !important;font-size:12px !important; }
:deep(.pm-items-table .p-select-label) { font-size:12px !important;padding:5px 8px !important;line-height:1.5 !important; }

.pm-items-summary { margin-top:8px;font-size:12px;color:#64748b;display:flex;align-items:center;gap:6px; }
.pm-warn-box { background:#fff7ed;border:1px solid #fed7aa;border-radius:5px;padding:7px 12px;font-size:12px;color:#c2410c; }

.hj-wrap { display:flex;flex-direction:column;gap:3px; }
.hj-mode-toggle { display:flex;border:1px solid #e2e8f0;border-radius:5px;overflow:hidden;height:24px;margin-top:3px; }
.hj-mode-btn { flex:1;border:none;background:#f8fafc;font-size:10px;font-weight:600;color:#94a3b8;cursor:pointer;padding:0 6px;transition:all .12s;white-space:nowrap; }
.hj-mode-btn:hover:not(:disabled) { background:#f0fdfa;color:#0d9488; }
.hj-mode-btn.active { background:#0d9488;color:#fff; }
.hj-mode-btn:disabled { cursor:not-allowed;opacity:.6; }
.hj-input-wrap { margin-top:0; }

.pajak-section { display:flex;align-items:center;justify-content:space-between;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:10px 16px;gap:16px;flex-wrap:wrap; }
.pajak-section-left { display:flex;align-items:center;gap:10px; }
.pajak-section-label { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488; }
.pajak-section-right { display:flex;align-items:center;gap:8px; }
.toggle-group-sm { display:flex;border:1px solid #d1d5db;border-radius:5px;overflow:hidden;height:30px; }
.toggle-btn-sm { flex:1;border:none;background:#fff;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;padding:0 12px;transition:all .12s;white-space:nowrap; }
.toggle-btn-sm:hover:not(:disabled) { background:#f0fdfa; }
.toggle-btn-sm.active { background:#0d9488;color:#fff; }
.toggle-btn-sm:disabled { cursor:not-allowed;opacity:.6; }
.pajak-pct-input { border:1px solid #d1d5db;border-radius:5px;padding:4px 8px;font-size:13px;width:70px;font-family:inherit;color:#1e293b;height:30px; }
.pajak-pct-input:focus { outline:none;border-color:#0d9488; }
.pajak-include-note { font-size:12px;color:#15803d;font-weight:600; }

.pm-page-footer { display:flex;justify-content:flex-end;gap:8px;padding:16px 0 8px;margin-top:8px;border-top:1px solid #e2e8f0; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
.mono { font-family:inherit;font-size:12px; }

.konf-sp-card { background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:12px 14px;margin-bottom:4px; }
.konf-sp-row { display:grid;grid-template-columns:110px 1fr;gap:6px;padding:3px 0;font-size:12px; }
.konf-lbl { color:#64748b; }
.konf-val { color:#1e293b;font-weight:500; }
.konf-divider { height:1px;background:#e2e8f0;margin:14px 0; }
.konf-form { display:flex;flex-direction:column;gap:12px; }
.konf-field { display:flex;flex-direction:column;gap:4px; }
.input-date-warn { border-color:#f97316 !important; }

.cara-bayar-group { display:flex;gap:10px; }
.cara-bayar-btn { display:flex;align-items:center;gap:10px;border:2px solid #e2e8f0;border-radius:10px;background:#fff;padding:10px 16px;cursor:pointer;transition:all .15s;flex:1;text-align:left;min-width:0; }
.cara-bayar-btn:hover:not(:disabled) { border-color:#0d9488;background:#f0fdfa; }
.cara-bayar-btn.active { border-color:#0d9488;background:#f0fdfa;box-shadow:0 0 0 3px rgba(13,148,136,.1); }
.cara-bayar-btn:disabled { cursor:not-allowed;opacity:.55; }
.cb-icon { width:36px;height:36px;border-radius:8px;background:#e2e8f0;color:#64748b;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:all .15s; }
.cara-bayar-btn.active .cb-icon { background:#0d9488;color:#fff; }
.cb-text { display:flex;flex-direction:column;gap:1px;min-width:0; }
.cb-label { font-size:13px;font-weight:700;color:#1e293b;white-space:nowrap; }
.cb-sub { font-size:10px;color:#94a3b8;white-space:nowrap; }
.cara-bayar-btn.active .cb-label { color:#0d9488; }

.upload-area { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:2px dashed #cbd5e1;border-radius:8px;padding:20px 12px;cursor:pointer;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;transition:border-color .15s,background .15s;user-select:none; }
.upload-area:hover { border-color:#0d9488;background:#f0fdfa;color:#0d9488; }
.upload-area-drag { border-color:#0d9488 !important;background:#f0fdfa !important;color:#0d9488 !important; }
.upload-status { display:flex;align-items:center;gap:10px;border-radius:8px;padding:10px 12px;font-size:12px; }
.upload-success { background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d; }

.fade-slide-enter-active,.fade-slide-leave-active { transition:opacity .15s,transform .15s; }
.fade-slide-enter-from,.fade-slide-leave-to { opacity:0;transform:translateX(-6px); }

.kategori-group { display:flex;gap:6px;flex-wrap:wrap; }
.kategori-btn { border:1.5px solid #e2e8f0;border-radius:6px;background:#f8fafc;color:#64748b;font-size:11px;font-weight:600;padding:5px 12px;cursor:pointer;transition:all .12s;white-space:nowrap; }
.kategori-btn:hover:not(:disabled) { border-color:#0d9488;background:#f0fdfa;color:#0d9488; }
.kategori-btn.active { border-color:#0d9488;background:#0d9488;color:#fff; }
.kategori-btn:disabled { cursor:not-allowed;opacity:.6; }
</style>
