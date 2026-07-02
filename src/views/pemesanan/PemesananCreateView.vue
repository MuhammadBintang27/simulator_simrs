<template>
  <div class="content">
    <Toast />
    <loading_overlay :is-loading="loading" message="Menyimpan..." />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" :disabled="loading" />
        <div class="pm-hero-icon"><i class="pi pi-shopping-cart"></i></div>
        <div>
          <h4 class="pm-hero-title">{{ isBRG ? 'Buat Surat Pesanan Barang' : 'Buat Surat Pesanan Obat' }}</h4>
          <p class="pm-hero-sub">Isi detail pesanan dan daftar barang</p>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- ── INFO PESANAN ── -->
      <div class="col-12">
        <div class="pm-fm-section">
          <div class="pm-fm-section-title"><i class="pi pi-info-circle me-1"></i>INFO PESANAN</div>

          <div class="row g-0">
            <!-- KIRI: FORM -->
            <div class="col-md-6 form-panel">
              <div class="form-grid">
                <div class="pm-field">
                  <label class="pm-fm-label">Supplier <span class="text-danger">*</span></label>
                  <Select
                    v-model="supplierObj"
                    :options="supplierList"
                    optionLabel="NAMASUPLIER"
                    filter
                    filterPlaceholder="Cari supplier..."
                    placeholder="Pilih supplier..."
                    class="w-100"
                    :class="{ 'p-invalid': errors.supplier }"
                    :disabled="loading"
                    @change="onSupplierSelect"
                  />
                  <small v-if="errors.supplier" class="text-danger d-block mt-1">{{ errors.supplier }}</small>
                </div>
                <div class="pm-field">
                  <label class="pm-fm-label">Jenis SP <span class="text-danger">*</span></label>
                  <Select
                    v-model="jenisSP"
                    :options="jenisSPOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-100"
                    :disabled="loading || isBRG"
                    @change="onJenisSPChange"
                  />
                </div>
                <div class="pm-field">
                  <label class="pm-fm-label">Tanggal SP <span class="text-danger">*</span></label>
                  <input type="date" v-model="form.tanggal_sp" class="pm-date-input w-100" :disabled="loading" />
                </div>
                <div class="pm-field">
                  <label class="pm-fm-label">No. Referensi Penawaran <span class="pm-fm-opt">(opsional)</span></label>
                  <InputText v-model="form.no_referensi" class="w-100" placeholder="SPH/2026/..." :disabled="loading" />
                </div>
                <div v-if="needsApoteker" class="pm-field pm-field-full">
                  <label class="pm-fm-label">Apoteker <span class="pm-fm-opt">(opsional, dikonfirmasi saat otorisasi)</span></label>
                  <Select
                    v-model="apotekerObj"
                    :options="apotekerList"
                    optionLabel="nama"
                    filter
                    filterPlaceholder="Cari apoteker..."
                    placeholder="Pilih apoteker..."
                    class="w-100"
                    :disabled="loading"
                  />
                  <small v-if="apotekerObj?.no_sipa" style="font-size:11px;color:#64748b;display:block;margin-top:2px">
                    SIPA: {{ apotekerObj.no_sipa }}
                  </small>
                </div>
                <div class="pm-field pm-field-last pm-field-full">
                  <label class="pm-fm-label">Keterangan <span class="pm-fm-opt">(opsional)</span></label>
                  <textarea
                    v-model="form.keterangan"
                    class="pm-textarea w-100"
                    rows="2"
                    placeholder="Catatan tambahan..."
                    :disabled="loading"
                  />
                </div>
              </div>
            </div>

            <!-- KANAN: DETAIL SUPPLIER -->
            <div class="col-md-6 detail-panel">
              <div v-if="!supplierObj" class="sup-placeholder">
                <i class="pi pi-building"></i>
                <p>Pilih supplier untuk melihat detail</p>
              </div>
              <template v-else>
                <div class="sup-detail-card">
                  <div class="sup-detail-name">{{ supplierObj.NAMASUPLIER }}</div>
                  <div class="sup-detail-rows">
                    <div class="sup-detail-row" v-if="supplierObj.ALAMAT">
                      <span class="sup-lbl"><i class="pi pi-map-marker"></i>Alamat</span>
                      <span class="sup-val">{{ supplierObj.ALAMAT }}</span>
                    </div>
                    <div class="sup-detail-row" v-if="supplierObj.NOHP || supplierObj.TELP">
                      <span class="sup-lbl"><i class="pi pi-phone"></i>No HP</span>
                      <span class="sup-val mono">{{ supplierObj.NOHP || supplierObj.TELP }}</span>
                    </div>
                    <div class="sup-detail-row">
                      <span class="sup-lbl"><i class="pi pi-file"></i>No Izin PBF</span>
                      <span class="sup-val mono">{{ supplierObj.NO_IZIN_PBF || form.no_izin_pbf || '-' }}</span>
                    </div>
                    <div class="sup-detail-row">
                      <span class="sup-lbl"><i class="pi pi-verified"></i>No CDOB</span>
                      <span class="sup-val mono">{{ supplierObj.NO_SERTIFIKAT_CDOB || form.no_sertifikat_cdob || '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="sup-riwayat">
                  <div class="sup-riwayat-title"><i class="pi pi-history me-1"></i>Riwayat Pesanan</div>
                  <div v-if="riwayatLoading" style="padding:10px;text-align:center;font-size:12px;color:#94a3b8">
                    <i class="pi pi-spin pi-spinner"></i> Memuat...
                  </div>
                  <div v-else-if="!riwayatSP.length" style="padding:10px;text-align:center;font-size:12px;color:#94a3b8">
                    Belum ada riwayat pesanan ke supplier ini
                  </div>
                  <div v-else class="riwayat-list">
                    <div
                      v-for="sp in riwayatSP"
                      :key="sp.id_pemesanan"
                      class="riwayat-item"
                      @click="openDetailSP(sp.id_pemesanan)"
                    >
                      <div class="riwayat-left">
                        <span class="riwayat-no">{{ sp.no_sp }}</span>
                        <span class="riwayat-date">{{ formatDate(sp.tanggal_sp) }}</span>
                      </div>
                      <div class="riwayat-right">
                        <span class="status-badge" :class="`status-${(sp.status_label||'').toLowerCase().replace(/\s+/g, '-')}`">{{ sp.status_label }}</span>
                        <span class="riwayat-total">{{ sp.grand_total ? formatCurrency(sp.grand_total) : '-' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ── DAFTAR ITEM ── -->
      <div class="col-12">
        <div class="pm-fm-section">
          <div class="pm-fm-section-title d-flex justify-content-between align-items-center">
            <span>
              <i class="pi pi-list me-1"></i>DAFTAR ITEM
              <span class="jenis-badge ms-2" :class="`jenis-${jenisSP.toLowerCase()}`">{{ jenisSP }}</span>
              <span v-if="jenisSP === 'NAR'" style="font-size:10px;color:#dc2626;margin-left:6px;font-weight:600">maks 1 item</span>
            </span>
            <Button
              icon="pi pi-plus"
              label="Tambah Item"
              size="small"
              severity="success"
              outlined
              class="round-button2"
              @click="addItem"
              :disabled="loading || (jenisSP === 'NAR' && items.length >= 1)"
            />
          </div>

          <div v-if="barangList.length === 0 && barangList.length > 0" class="pm-info-box mb-2">
            <i class="pi pi-info-circle me-1"></i>
            Tidak ada barang dengan klasifikasi <strong>{{ jenisSP }}</strong> di master data.
          </div>

          <div v-if="itemError" class="pm-warn-box mb-2">
            <i class="pi pi-exclamation-triangle me-1"></i>{{ itemError }}
          </div>

          <div style="overflow-x:auto">
            <table class="pm-items-table">
              <thead>
                <tr>
                  <th style="width:32px">#</th>
                  <th style="min-width:240px">Barang <span class="text-danger">*</span></th>
                  <th style="width:90px">Stok saat ini</th>
                  <th style="width:85px">QTY Pesanan<span class="text-danger">*</span></th>
                  <th style="width:115px">Satuan <span class="text-danger">*</span></th>
                  <th style="width:130px">Harga Satuan</th>
                  <th style="width:130px">Subtotal</th>
                  <th style="width:38px"></th>
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
                      filterPlaceholder="Ketik min. 3 huruf untuk cari..."
                      placeholder="Pilih barang..."
                      class="w-100"
                      :class="{ 'p-invalid': item._error }"
                      :disabled="loading"
                      :loading="barangLoading"
                      @change="() => onBarangSelect(item)"
                      @filter="onBarangFilter"
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
                          <span>{{ barangLoading ? 'Mencari barang...' : 'Ketik min. 3 huruf untuk mencari barang' }}</span>
                        </div>
                      </template>
                    </Select>
                    <small v-if="item._barangObj" style="font-size:10px;color:#64748b">
                      ID: {{ item._barangObj.IDBARANG }}
                    </small>
                  </td>

                  <td style="text-align:center">
                    <span v-if="item._barangObj" class="mono" style="font-size:12px" :style="stokDisplay(item) === 0 ? 'color:#dc2626;font-weight:700' : 'color:#64748b'">
                      {{ stokDisplay(item) ?? '-' }}
                    </span>
                    <span v-else style="color:#cbd5e1;font-size:12px">-</span>
                  </td>

                  <td>
                    <input
                      v-model.number="item.qty_pesan"
                      type="number"
                      min="1"
                      class="pm-num-input"
                      :disabled="loading"
                    />
                  </td>

                  <td>
                    <Select
                      v-model="item.satuan"
                      :options="item.satuan_options"
                      placeholder="Pilih satuan..."
                      class="w-100"
                      :class="{ 'p-invalid': item._error && !item.satuan }"
                      :disabled="loading || !item._barangObj"
                    />
                  </td>

                  <td>
                    <input
                      v-model.number="item.harga_satuan"
                      type="number"
                      min="0"
                      class="pm-num-input"
                      placeholder="0"
                      :disabled="loading"
                    />
                  </td>

                  <td class="mono" style="text-align:right;color:#0f766e;font-weight:600;padding-right:10px">
                    {{ subtotal(item) > 0 ? formatCurrency(subtotal(item)) : '-' }}
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
                  <td colspan="7" style="text-align:center;color:#94a3b8;padding:24px;font-size:12px">
                    Klik "Tambah Item" untuk menambahkan barang yang dipesan
                  </td>
                </tr>
              </tbody>

              <!-- GRAND TOTAL -->
              <tfoot v-if="items.length > 0">
                <tr class="grand-total-row">
                  <td colspan="5" style="text-align:right;font-weight:700;font-size:12px;color:#374151;padding:8px 10px">
                    Grand Total
                  </td>
                  <td class="mono" style="text-align:right;font-weight:700;font-size:13px;color:#0d9488;padding:8px 10px">
                    {{ grandTotal > 0 ? formatCurrency(grandTotal) : '-' }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div v-if="items.length > 0" class="pm-items-summary">
            <span><strong>{{ items.length }}</strong> item ditambahkan</span>
            <span v-if="jenisSP === 'NAR' && items.length >= 1" style="color:#dc2626;font-size:11px;font-weight:600">
              · Batas maksimum tercapai
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL SP MODAL -->
    <Dialog
      v-model:visible="detailVisible"
      header="Detail Surat Pesanan"
      modal
      :style="{ width: '720px', maxWidth: '96vw' }"
      :contentStyle="{ padding: '1rem' }"
    >
      <div v-if="detailLoading" style="text-align:center;padding:30px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:1.5rem"></i>
      </div>
      <template v-else-if="detailData">
        <div class="row g-3 mb-3">
          <div class="col-md-6">
            <div class="det-section-title"><i class="pi pi-file me-1"></i>INFO SURAT PESANAN</div>
            <div class="det-row"><span class="det-lbl">No SP</span><span class="det-val mono fw-bold" style="color:#0d9488">{{ detailData.head?.no_sp }}</span></div>
            <div class="det-row"><span class="det-lbl">Tanggal</span><span class="det-val mono">{{ formatDate(detailData.head?.tanggal_sp) }}</span></div>
            <div class="det-row"><span class="det-lbl">Status</span>
              <span class="det-val">
                <span class="status-badge" :class="`status-${(detailData.head?.status_label||'').toLowerCase().replace(/\s+/g, '-')}`">{{ detailData.head?.status_label }}</span>
              </span>
            </div>
            <div class="det-row"><span class="det-lbl">Keterangan</span><span class="det-val">{{ detailData.head?.keterangan || '-' }}</span></div>
          </div>
          <div class="col-md-6">
            <div class="det-section-title"><i class="pi pi-truck me-1"></i>INFO SUPPLIER</div>
            <div class="det-row"><span class="det-lbl">Nama</span><span class="det-val fw-semibold">{{ detailData.head?.nama_supplier }}</span></div>
            <div class="det-row"><span class="det-lbl">No Izin PBF</span><span class="det-val mono">{{ detailData.head?.no_izin_pbf || '-' }}</span></div>
            <div class="det-row"><span class="det-lbl">No CDOB</span><span class="det-val mono">{{ detailData.head?.no_sertifikat_cdob || '-' }}</span></div>
            <template v-if="detailData.head?.nama_pj">
              <div class="det-section-title mt-2"><i class="pi pi-user me-1"></i>PJ</div>
              <div class="det-row"><span class="det-lbl">Nama</span><span class="det-val fw-semibold">{{ detailData.head.nama_pj }}</span></div>
              <div class="det-row"><span class="det-lbl">No SIPA</span><span class="det-val mono">{{ detailData.head.no_sipa || '-' }}</span></div>
            </template>
          </div>
        </div>
        <div class="det-section-title"><i class="pi pi-list me-1"></i>DAFTAR ITEM ({{ detailData.details?.length || 0 }})</div>
        <div style="overflow-x:auto">
          <table class="det-table">
            <thead>
              <tr><th>#</th><th>Nama Barang</th><th>QTY</th><th>Satuan</th><th style="text-align:right">Harga Satuan</th><th style="text-align:right">Subtotal</th></tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in detailData.details" :key="i">
                <td class="mono" style="color:#94a3b8">{{ i + 1 }}</td>
                <td><div class="fw-semibold" style="font-size:12px">{{ item.nama_barang }}</div></td>
                <td class="mono fw-semibold">{{ item.qty_pesan }}</td>
                <td>{{ item.satuan }}</td>
                <td class="mono" style="text-align:right">{{ item.harga_satuan ? formatCurrency(item.harga_satuan) : '-' }}</td>
                <td class="mono" style="text-align:right">{{ item.total_harga ? formatCurrency(item.total_harga) : '-' }}</td>
              </tr>
            </tbody>
            <tfoot v-if="detailData.details?.length">
              <tr style="background:#f0fdfa;border-top:2px solid #99f6e4">
                <td colspan="5" style="text-align:right;font-weight:700;font-size:12px;padding:6px 8px;color:#374151">Grand Total</td>
                <td class="mono" style="text-align:right;font-weight:700;font-size:12px;padding:6px 8px;color:#0d9488">{{ detailData.grand_total ? formatCurrency(detailData.grand_total) : '-' }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>
    </Dialog>

    <!-- TTD DIGITAL -->
    <ttdUser
      v-model:showFormOtorisasi="showOtorisasi"
      link_ttd="otorisasi_suratpemesanan"
      :record_id="pendingIdPemesanan"
      @otpVerified="onOtorisasiSuccess"
    />

    <!-- FOOTER ACTIONS -->
    <div class="pm-page-footer">
      <Button label="Batal" severity="secondary" outlined class="round-button2" @click="goBack" :disabled="loading" />
      <Button
        label="Simpan Draft"
        icon="pi pi-save"
        severity="secondary"
        class="round-button2"
        @click="submitDraft"
        :loading="loading"
      />
      <Button
        label="Simpan & Otorisasi"
        icon="pi pi-pen-to-square"
        class="round-button2 btn-primary-pm"
        @click="submitAndOtorisasi"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import axios from 'axios'
import ttdUser from '@/components/TtdDigitalComponent.vue'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const isBRG = computed(() => route.query.mode === 'brg')

const loading = ref(false)
const supplierList = ref([])
const barangList = ref([])
const apotekerList = ref([])
const supplierObj = ref(null)
const apotekerObj = ref(null)
const jenisSP = ref('OBT')

const needsApoteker = computed(() => jenisSP.value !== 'BRG')
const showOtorisasi = ref(false)
const pendingIdPemesanan = ref(null)

const jenisSPOptions = computed(() => isBRG.value
  ? [{ label: 'Surat Pesanan Barang', value: 'BRG' }]
  : [
      { label: 'Obat Umum', value: 'OBT' },
      { label: 'Psikotropika', value: 'PSI', hint: 'hanya item PSI' },
      { label: 'Prekursor', value: 'PRE', hint: 'hanya item PRE' },
      { label: 'Narkotika', value: 'NAR', hint: 'maks 1 item' },
    ]
)

const barangLoading = ref(false)
let _barangTimer = null

async function fetchBarang(search = '') {
  barangLoading.value = true
  try {
    const params = { clientId: authStore.id_client, lokasiId: authStore.id_lokasi, jenis_sp: jenisSP.value, limit: search ? 50 : 10, page: 1, ARSIPKAN: 0 }
    if (search) params.search = search
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_list`, { params })
    barangList.value = res.data?.response || res.data?.data || res.data || []
  } catch (err) {
    console.error('Error fetching barang:', err)
  } finally {
    barangLoading.value = false
  }
}

function onBarangFilter(e) {
  const keyword = e.value?.trim() ?? ''
  clearTimeout(_barangTimer)
  if (keyword.length > 0 && keyword.length < 3) return
  _barangTimer = setTimeout(() => fetchBarang(keyword), 400)
}

const today = new Date().toISOString().slice(0, 10)
const form = ref({ no_izin_pbf: '', no_sertifikat_cdob: '', keterangan: '', no_referensi: '', tanggal_sp: today })
const errors = ref({ supplier: '' })
const items = ref([])
const itemError = ref('')

function newItem() {
  return { _barangObj: null, id_barang: '', qty_pesan: 1, satuan: '', harga_satuan: null, satuan_options: [], stok_kecil: null, isi_sedang: null, isi_besar: null, _error: false }
}

function addItem() { items.value.push(newItem()) }

function removeItem(i) {
  items.value.splice(i, 1)
  itemError.value = ''
}

function subtotal(item) {
  const qty = Number(item.qty_pesan) || 0
  const harga = Number(item.harga_satuan) || 0
  return qty * harga
}

const grandTotal = computed(() => items.value.reduce((sum, item) => sum + subtotal(item), 0))

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function onBarangSelect(item) {
  const b = item._barangObj
  if (!b) { item.id_barang = ''; item.satuan = ''; item.satuan_options = []; return }
  item.id_barang = b.IDBARANG || b.ID || ''
  item.stok_kecil = b.TOTAL_STOCK ?? null
  item.isi_sedang = b.ISI_SEDANG_KE_KECIL || null
  item.isi_besar = b.ISI_BESAR_KE_SEDANG || null
  const opts = [b.SATUAN_KECIL, b.SATUAN_SEDANG, b.SATUAN_BESAR].filter(Boolean)
  item.satuan_options = opts
  item.satuan = opts[0] || ''
  item._error = false
  itemError.value = ''
}

function stokDisplay(item) {
  if (item.stok_kecil === null || !item._barangObj) return null
  const b = item._barangObj
  if (item.satuan === b.SATUAN_SEDANG && item.isi_sedang) return Math.floor(item.stok_kecil / item.isi_sedang)
  if (item.satuan === b.SATUAN_BESAR && item.isi_sedang && item.isi_besar) return Math.floor(item.stok_kecil / (item.isi_sedang * item.isi_besar))
  return item.stok_kecil
}

function onJenisSPChange() {
  items.value = []
  itemError.value = ''
  if (!needsApoteker.value) apotekerObj.value = null
  fetchBarang()
}

function onSupplierSelect() {
  const s = supplierObj.value
  if (!s) return
  errors.value.supplier = ''
  if (s.no_izin_pbf || s.NO_IZIN_PBF) form.value.no_izin_pbf = s.no_izin_pbf || s.NO_IZIN_PBF || ''
  if (s.no_sertifikat_cdob || s.NO_SERTIFIKAT_CDOB) form.value.no_sertifikat_cdob = s.no_sertifikat_cdob || s.NO_SERTIFIKAT_CDOB || ''
  fetchRiwayatSP(s.IDSUPLIER || s.id || s.ID)
}

const riwayatSP = ref([])
const riwayatLoading = ref(false)

async function fetchRiwayatSP(id_supplier) {
  riwayatSP.value = []
  riwayatLoading.value = true
  try {
    const res = await axios.post(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_list_pemesanan`, {
      idclient: authStore.id_client,
      id_supplier,
      limit: 10,
      page: 1,
    })
    riwayatSP.value = res.data?.response || []
  } catch {
    // riwayat bersifat informatif, gagal tidak perlu notif
  } finally {
    riwayatLoading.value = false
  }
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

async function openDetailSP(id_pemesanan) {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_detail_pemesanan/${id_pemesanan}/${authStore.id_client}`
    )
    if (res.data?.code !== 200) { detailVisible.value = false; return }
    detailData.value = res.data?.data || res.data
  } catch {
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function validateForm() {
  errors.value.supplier = !supplierObj.value ? 'Supplier wajib dipilih' : ''
  if (errors.value.supplier) return false


  itemError.value = ''

  if (items.value.length === 0) {
    itemError.value = 'Minimal 1 item harus ditambahkan'
    return false
  }

  for (const item of items.value) {
    item._error = !item.id_barang
    if (!item.id_barang) { itemError.value = 'Semua baris item harus memilih barang'; return false }
    if (!item.qty_pesan || item.qty_pesan < 1) { itemError.value = 'Qty pesan harus lebih dari 0'; return false }
    if (!item.satuan) { itemError.value = 'Satuan wajib diisi di semua item'; return false }
  }

  if (jenisSP.value === 'NAR' && items.value.length > 1) {
    itemError.value = 'SP Narkotika hanya boleh berisi 1 item'
    return false
  }

  return true
}

async function doSave() {
  const payload = {
    id_supplier: supplierObj.value.IDSUPLIER || supplierObj.value.id || supplierObj.value.ID,
    idclient: authStore.id_client,
    id_lokasi: authStore.id_lokasi,
    jenis_sp: jenisSP.value,
    tanggal_sp: form.value.tanggal_sp,
    details: items.value.map(i => ({
      id_barang: i.id_barang,
      qty_pesan: Number(i.qty_pesan),
      satuan: i.satuan,
      ...(i.harga_satuan ? { harga_satuan: Number(i.harga_satuan) } : {}),
    })),
  }
  if (form.value.keterangan) payload.keterangan = form.value.keterangan
  if (form.value.no_izin_pbf) payload.no_izin_pbf = form.value.no_izin_pbf
  if (form.value.no_sertifikat_cdob) payload.no_sertifikat_cdob = form.value.no_sertifikat_cdob
  if (form.value.no_referensi) payload.no_referensi = form.value.no_referensi
  if (needsApoteker.value && apotekerObj.value) payload.id_pj = apotekerObj.value.id

  const res = await axios.post(
    `${configStore.apiApotikUrl}/index.php/api/Pemesanan/save_pemesanan`,
    payload
  )
  if (res.data?.code !== 200) throw new Error(res.data?.message || 'Gagal menyimpan SP')
  return res.data?.data
}

async function submitDraft() {
  if (!validateForm()) return
  loading.value = true
  try {
    const data = await doSave()
    toast.add({ severity: 'success', summary: 'Draft Tersimpan', detail: data?.no_sp ? `No SP: ${data.no_sp}` : 'SP disimpan sebagai draft', life: 5000 })
    router.push({ name: 'PemesananListView', query: { mode: isBRG.value ? 'brg' : 'obat' } })
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Gagal menyimpan SP', life: 5000 })
  } finally {
    loading.value = false
  }
}

async function submitAndOtorisasi() {
  if (!validateForm()) return
  loading.value = true
  try {
    const data = await doSave()
    pendingIdPemesanan.value = data?.id_pemesanan
    toast.add({ severity: 'success', summary: 'SP Tersimpan', detail: `Silakan lakukan otorisasi ${isBRG.value ? 'PJ' : 'apoteker'}`, life: 4000 })
    showOtorisasi.value = true
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Gagal menyimpan SP', life: 5000 })
  } finally {
    loading.value = false
  }
}

function onOtorisasiSuccess() {
  router.push({ name: 'PemesananListView', query: { mode: isBRG.value ? 'brg' : 'obat' } })
}

function goBack() {
  router.push({ name: 'PemesananListView', query: { mode: isBRG.value ? 'brg' : 'obat' } })
}

async function fetchApoteker() {
  try {
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_apoteker_list/${authStore.id_client}`)
    if (res.data?.code !== 200) return
    apotekerList.value = res.data?.response || []
    apotekerObj.value = apotekerList.value.find(a => a.is_default === 1) ?? apotekerList.value[0] ?? null
  } catch {
    // silent
  }
}

onMounted(async () => {
  if (isBRG.value) {
    jenisSP.value = 'BRG'
    apotekerObj.value = null
  }
  try {
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/supplier_all`, {
      params: { clientId: authStore.id_client },
    })
    supplierList.value = res.data?.response || res.data || []
  } catch (err) {
    console.error('Error fetching supplier:', err)
  }
  fetchBarang()
  if (!isBRG.value) fetchApoteker()
})
</script>

<style scoped>
/* ── HERO ── */
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0;white-space:nowrap; }

/* ── SECTION ── */
.pm-fm-section { background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:0; }
.pm-fm-section-title { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;padding-bottom:8px;border-bottom:1px solid #ccfbf1;margin-bottom:12px; }
.pm-fm-label { font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;display:block; }
.pm-fm-opt { font-weight:400;color:#94a3b8;font-size:11px; }

/* ── DATE INPUT ── */
.pm-date-input { border:1px solid #d1d5db;border-radius:5px;padding:7px 10px;font-size:13px;color:#1e293b;background:#fff;height:38px; }
.pm-date-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.pm-date-input:disabled { background:#f8fafc;color:#94a3b8; }

/* ── TEXTAREA ── */
.pm-textarea { border:1px solid #d1d5db;border-radius:5px;padding:7px 10px;font-size:13px;color:#1e293b;resize:vertical;min-height:60px;font-family:inherit; }
.pm-textarea:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }

/* ── ITEMS TABLE ── */
.pm-items-table { width:100%;border-collapse:collapse;font-size:12px; }
.pm-items-table thead tr { background:#f0fdfa; }
.pm-items-table thead th { padding:5px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.pm-items-table tbody tr { border-bottom:1px solid #e2e8f0; }
.pm-items-table tbody tr:hover:not(.item-row-warn) { background:#f8fafc; }
.pm-items-table tbody td { padding:4px 6px;vertical-align:middle; }
.item-row-warn { background:#fff7ed !important; }
.item-row-warn td { background:#fff7ed !important; }
.grand-total-row { background:#f0fdfa;border-top:2px solid #99f6e4; }

/* ── NUMBER INPUT ── */
.pm-num-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;width:100%;font-family:monospace;color:#1e293b; }
.pm-num-input:focus { outline:none;border-color:#0d9488; }

/* ── SUMMARY ── */
.pm-items-summary { margin-top:8px;font-size:12px;color:#64748b;display:flex;align-items:center;gap:6px; }

/* ── WARN / INFO BOX ── */
.pm-warn-box { background:#fff7ed;border:1px solid #fed7aa;border-radius:5px;padding:7px 12px;font-size:12px;color:#c2410c; }
.pm-info-box { background:#eff6ff;border:1px solid #bfdbfe;border-radius:5px;padding:7px 12px;font-size:12px;color:#1d4ed8; }

/* ── BADGES ── */
.jenis-badge { display:inline-block;padding:2px 7px;border-radius:10px;font-size:10.5px;font-weight:700;letter-spacing:.4px;white-space:nowrap; }
.jenis-obt   { background:#dbeafe;color:#1d4ed8; }
.jenis-brg   { background:#f1f5f9;color:#475569; }
.jenis-keras { background:#fef3c7;color:#92400e; }
.jenis-psi   { background:#ede9fe;color:#6d28d9; }
.jenis-pre   { background:#fce7f3;color:#9d174d; }
.jenis-nar   { background:#fee2e2;color:#dc2626; }

/* ── PAGE FOOTER ── */
.pm-page-footer { display:flex;justify-content:flex-end;gap:8px;padding:16px 0 8px;margin-top:8px;border-top:1px solid #e2e8f0; }

/* ── FORM PANEL LAYOUT ── */
.form-panel { border-right:1px solid #e2e8f0;padding-right:20px; }
.detail-panel { padding-left:20px; }
.form-grid { display:grid;grid-template-columns:1fr 1fr;gap:0 12px; }
.pm-field { padding:4px 0;border-bottom:1px solid #f1f5f9; }
.pm-field-last { border-bottom:none; }
.pm-field-full { grid-column:1 / -1; }

/* ── SUPPLIER DETAIL ── */
.sup-placeholder { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:120px;color:#cbd5e1;font-size:12px;border:1px dashed #e2e8f0;border-radius:6px;gap:6px; }
.sup-placeholder .pi { font-size:2rem; }
.sup-detail-card { background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;margin-bottom:8px; }
.sup-detail-name { font-size:13px;font-weight:700;color:#134e4a;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0; }
.sup-detail-rows { display:flex;flex-direction:column;gap:3px; }
.sup-detail-row { display:grid;grid-template-columns:110px 1fr;gap:6px;font-size:12px;padding:2px 0; }
.sup-lbl { color:#64748b;display:flex;align-items:center;gap:4px; }
.sup-lbl .pi { font-size:10px; }
.sup-val { color:#1e293b; }

/* ── RIWAYAT SP ── */
.sup-riwayat { background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px; }
.sup-riwayat-title { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;padding-bottom:6px;border-bottom:1px solid #ccfbf1;margin-bottom:8px; }
.riwayat-list { display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto; }
.riwayat-item { display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:5px;cursor:pointer;border:1px solid #e2e8f0;background:#fff;gap:8px; }
.riwayat-item:hover { background:#f0fdfa;border-color:#99f6e4; }
.riwayat-left { display:flex;flex-direction:column;gap:1px; }
.riwayat-no { font-size:12px;font-weight:600;color:#0d9488;font-family:monospace; }
.riwayat-date { font-size:10px;color:#94a3b8; }
.riwayat-right { display:flex;flex-direction:column;align-items:flex-end;gap:2px; }
.riwayat-total { font-size:11px;color:#374151;font-family:monospace; }

/* ── STATUS BADGES ── */
.status-badge { display:inline-block;padding:2px 8px;border-radius:10px;font-size:10.5px;font-weight:700; }
.status-draft         { background:#fef9c3;color:#854d0e; }
.status-siap-dikirim  { background:#fef3c7;color:#d97706; }
.status-dikirim       { background:#dbeafe;color:#1d4ed8; }
.status-diterima      { background:#dcfce7;color:#15803d; }
.status-selesai       { background:#f1f5f9;color:#475569; }

/* ── DETAIL TABLE ── */
.det-section-title { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;padding:4px 0;border-bottom:1px solid #ccfbf1;margin-bottom:8px; }
.det-row { display:grid;grid-template-columns:130px 1fr;gap:6px;padding:3px 0;font-size:12px; }
.det-lbl { color:#64748b; }
.det-val { color:#1e293b;font-weight:500; }
.det-table { width:100%;border-collapse:collapse;font-size:12px;margin-top:6px; }
.det-table thead tr { background:#f0fdfa; }
.det-table thead th { padding:5px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.det-table tbody tr { border-bottom:1px solid #e2e8f0; }
.det-table tbody tr:hover { background:#f0fdfa; }
.det-table tbody td { padding:4px 8px;vertical-align:middle; }

/* ── MISC ── */
.mono { font-family:monospace;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
