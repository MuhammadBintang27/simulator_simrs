<template>
  <div class="content">
    <Toast />
    <ConfirmDialog />
    <loading_overlay :is-loading="loading" message="Memuat..." />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" :disabled="loading" />
        <div class="pm-hero-icon"><i class="pi pi-shopping-cart"></i></div>
        <div>
          <h4 class="pm-hero-title">
            {{ head?.no_sp || 'Surat Pesanan' }}
            <span v-if="head" class="status-badge ms-2" :class="`status-${(head.status_label||'').toLowerCase().replace(/\s+/g,'-')}`">
              {{ head.status_label }}
            </span>
          </h4>
          <p class="pm-hero-sub">{{ isEditable ? (spStatus === 1 ? 'Mengedit SP ini akan mereset otorisasi ke Draft' : 'Edit surat pesanan') : 'Detail surat pesanan' }}</p>
        </div>
      </div>
      <Button icon="pi pi-print" label="Cetak" severity="secondary" outlined class="round-button2" @click="cetakSP" :disabled="loading || !head || isEditable" />
    </div>

    <div v-if="!loading && head && spStatus === 1" class="pm-warn-box mb-2" style="display:flex;align-items:center;gap:8px">
      <i class="pi pi-exclamation-triangle" style="color:#d97706;font-size:16px;flex-shrink:0"></i>
      <span>SP ini sudah diotorisasi. Menyimpan perubahan akan <strong>membatalkan otorisasi</strong> dan mengembalikan status ke <strong>Draft</strong>.</span>
    </div>

    <div v-if="!loading && head" class="row g-3">
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
                    :disabled="!isEditable || loading"
                    @change="onSupplierSelect"
                  />
                </div>
                <div class="pm-field">
                  <label class="pm-fm-label">Jenis SP</label>
                  <Select
                    v-model="jenisSP"
                    :options="jenisSPOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-100"
                    :disabled="true"
                  />
                </div>
                <div class="pm-field">
                  <label class="pm-fm-label">Tanggal SP <span class="text-danger">*</span></label>
                  <input type="date" v-model="form.tanggal_sp" class="pm-date-input w-100" :disabled="!isEditable || loading" />
                </div>
                <div class="pm-field">
                  <label class="pm-fm-label">No. Referensi Penawaran <span class="pm-fm-opt">(opsional)</span></label>
                  <InputText v-model="form.no_referensi" class="w-100" placeholder="SPH/2026/..." :disabled="!isEditable || loading" />
                </div>
                <div v-if="needsApoteker" class="pm-field pm-field-full">
                  <label class="pm-fm-label">Apoteker</label>
                  <Select
                    v-model="apotekerObj"
                    :options="apotekerList"
                    optionLabel="nama"
                    filter
                    filterPlaceholder="Cari apoteker..."
                    placeholder="Pilih apoteker..."
                    class="w-100"
                    :disabled="!isEditable || loading"
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
                    :disabled="!isEditable || loading"
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
                      <span class="sup-val mono">{{ supplierObj.NO_IZIN_PBF || head?.no_izin_pbf || '-' }}</span>
                    </div>
                    <div class="sup-detail-row">
                      <span class="sup-lbl"><i class="pi pi-verified"></i>No CDOB</span>
                      <span class="sup-val mono">{{ supplierObj.NO_SERTIFIKAT_CDOB || head?.no_sertifikat_cdob || '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="sup-riwayat mt-2">
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
                      @click="$router.push({ name: 'PemesananEditView', params: { id_pemesanan: sp.id_pemesanan } })"
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
            </span>
            <Button
              v-if="isEditable"
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

          <div v-if="itemError" class="pm-warn-box mb-2">
            <i class="pi pi-exclamation-triangle me-1"></i>{{ itemError }}
          </div>

          <div style="overflow-x:auto">
            <table class="pm-items-table">
              <thead>
                <tr>
                  <th style="width:32px">#</th>
                  <th style="min-width:200px">Barang <span class="text-danger">*</span></th>
                  <th v-if="isEditable" style="width:90px">Stok saat ini</th>
                  <th style="width:85px">QTY <span class="text-danger">*</span></th>
                  <th style="width:115px">Satuan</th>
                  <th style="width:130px">Harga Satuan</th>
                  <th style="width:130px">Subtotal</th>
                  <th v-if="isEditable" style="width:38px"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in items" :key="i">
                  <td class="mono" style="color:#94a3b8;text-align:center">{{ i + 1 }}</td>

                  <td>
                    <template v-if="isEditable">
                      <Select
                        v-model="item._barangObj"
                        :options="barangList"
                        optionLabel="NAMA"
                        filter
                        filterPlaceholder="Ketik min. 3 huruf untuk cari..."
                        placeholder="Pilih barang..."
                        class="w-100"
                        :disabled="loading"
                        :loading="barangLoading"
                        @change="() => onBarangSelect(item)"
                        @filter="onBarangFilter"
                      >
                        <template #value="{ value }">
                          <span v-if="value?.NAMA || item.nama_barang">{{ value?.NAMA || item.nama_barang }}</span>
                          <span v-else style="color:#94a3b8">Pilih barang...</span>
                        </template>
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
                    </template>
                    <template v-else>
                      <span style="font-size:12px;font-weight:600">{{ item._barangObj?.NAMA || item.nama_barang }}</span>
                      <div class="mono" style="font-size:10px;color:#94a3b8">{{ item.id_barang }}</div>
                    </template>
                  </td>

                  <td v-if="isEditable" style="text-align:center">
                    <span v-if="item._barangObj && item.stok_kecil !== null" class="mono" style="font-size:12px"
                      :style="stokDisplay(item) === 0 ? 'color:#dc2626;font-weight:700' : 'color:#64748b'">
                      {{ stokDisplay(item) ?? '-' }}
                    </span>
                    <span v-else style="color:#cbd5e1;font-size:12px">-</span>
                  </td>

                  <td>
                    <input v-if="isEditable"
                      v-model.number="item.qty_pesan" type="number" min="1"
                      class="pm-num-input" :disabled="loading" />
                    <span v-else class="mono fw-semibold">{{ item.qty_pesan }}</span>
                  </td>

                  <td>
                    <Select v-if="isEditable && item.satuan_options?.length > 1"
                      v-model="item.satuan"
                      :options="item.satuan_options"
                      class="w-100"
                      :disabled="loading || !item._barangObj"
                    />
                    <span v-else>{{ item.satuan }}</span>
                  </td>

                  <td>
                    <input v-if="isEditable"
                      v-model.number="item.harga_satuan" type="number" min="0"
                      class="pm-num-input" placeholder="0" :disabled="loading" />
                    <span v-else class="mono">{{ item.harga_satuan ? formatCurrency(item.harga_satuan) : '-' }}</span>
                  </td>

                  <td class="mono" style="text-align:right;color:#0f766e;font-weight:600;padding-right:10px">
                    {{ subtotal(item) > 0 ? formatCurrency(subtotal(item)) : '-' }}
                  </td>

                  <td v-if="isEditable" style="text-align:center">
                    <Button icon="pi pi-times" text rounded severity="danger" size="small"
                      style="width:1.4rem;height:1.4rem;min-height:unset"
                      @click="removeItem(i)" :disabled="loading" />
                  </td>
                </tr>

                <tr v-if="items.length === 0">
                  <td :colspan="isEditable ? 8 : 6" style="text-align:center;color:#94a3b8;padding:24px;font-size:12px">
                    Tidak ada item
                  </td>
                </tr>
              </tbody>

              <tfoot v-if="items.length > 0">
                <tr class="grand-total-row">
                  <td :colspan="isEditable ? 5 : 4" style="text-align:right;font-weight:700;font-size:12px;color:#374151;padding:8px 10px">Grand Total</td>
                  <td class="mono" style="text-align:right;font-weight:700;font-size:13px;color:#0d9488;padding:8px 10px">
                    {{ grandTotal > 0 ? formatCurrency(grandTotal) : '-' }}
                  </td>
                  <td v-if="isEditable"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TTD DIGITAL -->
    <ttdUser
      v-model:showFormOtorisasi="showOtorisasi"
      link_ttd="otorisasi_suratpemesanan"
      :record_id="idPemesanan"
      @otpVerified="onOtorisasiSuccess"
    />

    <!-- FOOTER ACTIONS -->
    <div class="pm-page-footer">
      <Button label="Kembali" severity="secondary" outlined class="round-button2" @click="goBack" :disabled="loading" />
      <template v-if="isEditable">
        <Button label="Simpan Perubahan" icon="pi pi-save" severity="secondary" class="round-button2"
          @click="submitUpdate" :loading="loading" />
        <Button label="Simpan & Otorisasi" icon="pi pi-pen-to-square"
          class="round-button2 btn-primary-pm" @click="submitAndOtorisasi" :loading="loading" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Toast from 'primevue/toast'
import axios from 'axios'
import ttdUser from '@/components/TtdDigitalComponent.vue'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const idPemesanan = route.params.id_pemesanan

const loading = ref(true)
const head = ref(null)
const supplierList = ref([])
const barangList = ref([])
const apotekerList = ref([])
const supplierObj = ref(null)
const apotekerObj = ref(null)
const jenisSP = ref('OBT')
const spStatus = ref(-1)

const needsApoteker = computed(() => jenisSP.value !== 'BRG')
const isEditable = computed(() => spStatus.value === 0 || spStatus.value === 1)
const showOtorisasi = ref(false)

const jenisSPOptions = [
  { label: 'Obat Umum', value: 'OBT' },
  { label: 'Psikotropika', value: 'PSI' },
  { label: 'Prekursor', value: 'PRE' },
  { label: 'Narkotika', value: 'NAR' },
  { label: 'Surat Pesanan Barang', value: 'BRG' },
]


const barangLoading = ref(false)
let _barangTimer = null

async function fetchBarang(search = '') {
  barangLoading.value = true
  try {
    const params = { clientId: authStore.id_client, lokasiId: authStore.id_lokasi, jenis_sp: jenisSP.value, limit: search ? 50 : 10, page: 1, ARSIPKAN: 0 }
    if (search) params.search = search
    const res = await axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/barang_list`, { params })
    barangList.value = res.data?.response || res.data?.data || res.data || []
  } catch { /* silent */ } finally {
    barangLoading.value = false
  }
}

function onBarangFilter(e) {
  const keyword = e.value?.trim() ?? ''
  clearTimeout(_barangTimer)
  if (keyword.length > 0 && keyword.length < 3) return
  _barangTimer = setTimeout(() => fetchBarang(keyword), 400)
}

const form = ref({ keterangan: '', no_referensi: '', tanggal_sp: '' })
const items = ref([])
const itemError = ref('')

function newItem() {
  return { _barangObj: null, id_barang: '', nama_barang: '', qty_pesan: 1, satuan: '', harga_satuan: null, satuan_options: [], stok_kecil: null, isi_sedang: null, isi_besar: null, _error: false }
}

function addItem() { items.value.push(newItem()) }
function removeItem(i) { items.value.splice(i, 1); itemError.value = '' }

function subtotal(item) {
  return (Number(item.qty_pesan) || 0) * (Number(item.harga_satuan) || 0)
}

const grandTotal = computed(() => items.value.reduce((sum, item) => sum + subtotal(item), 0))

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function onBarangSelect(item) {
  const b = item._barangObj
  if (!b) return // jangan clear id_barang saat PrimeVue reset karena tidak cocok options
  item.id_barang = b.IDBARANG || b.ID || ''
  item.nama_barang = b.NAMA || ''
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

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function onSupplierSelect() {
  const s = supplierObj.value
  if (!s) return
  fetchRiwayatSP(s.IDSUPLIER || s.id || s.ID)
}

function validateForm() {
  if (!supplierObj.value) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Supplier wajib dipilih', life: 3000 })
    return false
  }
  if (items.value.length === 0) { itemError.value = 'Minimal 1 item harus ditambahkan'; return false }
  for (const item of items.value) {
    const barangId = item._barangObj?.IDBARANG || item.id_barang
    item._error = !barangId
    if (!barangId) { itemError.value = 'Semua baris item harus memilih barang'; return false }
    if (!item.qty_pesan || item.qty_pesan < 1) { itemError.value = 'Qty pesan harus lebih dari 0'; return false }
    if (!item.satuan) { itemError.value = 'Satuan wajib diisi di semua item'; return false }
  }
  if (jenisSP.value === 'NAR' && items.value.length > 1) { itemError.value = 'SP Narkotika hanya boleh berisi 1 item'; return false }
  return true
}

function buildPayload() {
  const payload = {
    id_pemesanan: idPemesanan,
    idclient: authStore.id_client,
    id_supplier: supplierObj.value.IDSUPLIER || supplierObj.value.id || supplierObj.value.ID,
    id_lokasi: authStore.id_lokasi,
    jenis_sp: jenisSP.value,
    details: items.value.map(i => ({
      id_barang: i._barangObj?.IDBARANG || i.id_barang,
      qty_pesan: Number(i.qty_pesan),
      satuan: i.satuan,
      ...(i.harga_satuan ? { harga_satuan: Number(i.harga_satuan) } : {}),
    })),
  }
  if (form.value.keterangan) payload.keterangan = form.value.keterangan
  if (form.value.no_referensi) payload.no_referensi = form.value.no_referensi
  if (needsApoteker.value && apotekerObj.value) payload.id_pj = apotekerObj.value.id
  return payload
}

async function doUpdate() {
  const res = await axios.post(
    `${configStore.apiApotikUrl}/index.php/api/Pemesanan/edit_pemesanan`,
    buildPayload()
  )
  if (res.data?.code !== 200) throw new Error(res.data?.message || 'Gagal menyimpan perubahan')
  return res.data?.data
}

async function submitUpdate() {
  if (!validateForm()) return

  const executeSave = async () => {
    loading.value = true
    try {
      await doUpdate()
      const detail = spStatus.value === 1
        ? 'SP disimpan. Status kembali ke Draft — silakan otorisasi ulang.'
        : 'Perubahan SP berhasil disimpan'
      toast.add({ severity: 'success', summary: 'Berhasil', detail, life: 4000 })
      router.push({ name: 'PemesananListView', query: { mode: jenisSP.value === 'BRG' ? 'brg' : 'obat' } })
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 5000 })
    } finally {
      loading.value = false
    }
  }

  if (spStatus.value === 1) {
    confirm.require({
      message: 'Menyimpan perubahan akan membatalkan otorisasi apoteker dan mengembalikan status SP ke Draft. Lanjutkan?',
      header: 'Reset Otorisasi',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Batal',
      acceptLabel: 'Ya, Simpan',
      acceptClass: 'p-button-warning',
      accept: executeSave,
    })
    return
  }

  await executeSave()
}

async function submitAndOtorisasi() {
  if (!validateForm()) return

  const executeSaveAndOtorisasi = async () => {
    loading.value = true
    try {
      await doUpdate()
      toast.add({ severity: 'success', summary: 'SP Tersimpan', detail: 'Silakan lakukan otorisasi apoteker', life: 4000 })
      showOtorisasi.value = true
    } catch (err) {
      toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 5000 })
    } finally {
      loading.value = false
    }
  }

  if (spStatus.value === 1) {
    confirm.require({
      message: 'Menyimpan perubahan akan membatalkan otorisasi sebelumnya. SP akan kembali ke Draft, lalu Anda dapat otorisasi ulang. Lanjutkan?',
      header: 'Reset Otorisasi',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Batal',
      acceptLabel: 'Ya, Lanjut',
      acceptClass: 'p-button-warning',
      accept: executeSaveAndOtorisasi,
    })
    return
  }

  await executeSaveAndOtorisasi()
}

function onOtorisasiSuccess() {
  router.push({ name: 'PemesananListView', query: { mode: jenisSP.value === 'BRG' ? 'brg' : 'obat' } })
}

function goBack() { router.push({ name: 'PemesananListView', query: { mode: jenisSP.value === 'BRG' ? 'brg' : 'obat' } }) }

function cetakSP() {
  const url = router.resolve({ name: 'PrintSuratPesanan', params: { id_pemesanan: idPemesanan } }).href
  window.open(url, '_blank')
}

onMounted(async () => {
  try {
    const [detailRes, supplierRes, apotekerRes] = await Promise.all([
      axios.get(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_detail_pemesanan/${idPemesanan}/${authStore.id_client}`),
      axios.get(`${configStore.apiApotikUrl}/index.php/api/inventory/supplier_all`, { params: { clientId: authStore.id_client } }),
      axios.get(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_apoteker_list/${authStore.id_client}`),
    ])

    supplierList.value = supplierRes.data?.response || supplierRes.data || []
    apotekerList.value = apotekerRes.data?.code === 200 ? (apotekerRes.data?.response || []) : []

    if (detailRes.data?.code !== 200) {
      toast.add({ severity: 'error', summary: 'Tidak Ditemukan', detail: 'Data SP tidak ditemukan', life: 4000 })
      router.push({ name: 'PemesananListView' })
      return
    }

    const data = detailRes.data?.data || {}
    const h = data.head || {}
    head.value = h
    spStatus.value = Number(h.status ?? -1)
    jenisSP.value = h.jenis_sp || 'OBT'
    form.value.tanggal_sp = h.tanggal_sp?.slice(0, 10) || ''
    form.value.no_referensi = h.no_referensi || ''
    form.value.keterangan = h.keterangan || ''

    supplierObj.value = supplierList.value.find(s =>
      (s.IDSUPLIER || s.id || s.ID) == (h.id_supplier)
    ) || null

    if (supplierObj.value) fetchRiwayatSP(h.id_supplier)

    if (h.id_pj) {
      apotekerObj.value = apotekerList.value.find(a => a.id == h.id_pj) || null
    }

    items.value = (data.details || []).map(d => ({
      _barangObj: { NAMA: d.nama_barang, IDBARANG: d.id_barang },
      id_barang: d.id_barang,
      nama_barang: d.nama_barang,
      qty_pesan: d.qty_pesan,
      satuan: d.satuan,
      harga_satuan: d.harga_satuan || null,
      satuan_options: [d.satuan],
      stok_kecil: null,
      isi_sedang: null,
      isi_besar: null,
      _error: false,
    }))

    if (spStatus.value === 0 || spStatus.value === 1) fetchBarang()
  } catch (err) {
    console.error('Gagal memuat SP:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data SP', life: 4000 })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap;display:flex;align-items:center;gap:8px; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0;white-space:nowrap; }

.pm-fm-section { background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px 16px;margin-bottom:0; }
.pm-fm-section-title { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0d9488;padding-bottom:8px;border-bottom:1px solid #ccfbf1;margin-bottom:12px; }
.pm-fm-label { font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;display:block; }
.pm-fm-opt { font-weight:400;color:#94a3b8;font-size:11px; }

.pm-date-input { border:1px solid #d1d5db;border-radius:5px;padding:7px 10px;font-size:13px;color:#1e293b;background:#fff;height:38px; }
.pm-date-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.pm-date-input:disabled { background:#f8fafc;color:#94a3b8; }

.pm-textarea { border:1px solid #d1d5db;border-radius:5px;padding:7px 10px;font-size:13px;color:#1e293b;resize:vertical;min-height:60px;font-family:inherit; }
.pm-textarea:focus { outline:none;border-color:#0d9488; }
.pm-textarea:disabled { background:#f8fafc;color:#94a3b8; }

.form-panel { border-right:1px solid #e2e8f0;padding-right:20px; }
.detail-panel { padding-left:20px; }
.form-grid { display:grid;grid-template-columns:1fr 1fr;gap:0 12px; }
.pm-field { padding:4px 0;border-bottom:1px solid #f1f5f9; }
.pm-field-last { border-bottom:none; }
.pm-field-full { grid-column:1 / -1; }

.sup-placeholder { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:120px;color:#cbd5e1;font-size:12px;border:1px dashed #e2e8f0;border-radius:6px;gap:6px; }
.sup-placeholder .pi { font-size:2rem; }
.sup-detail-card { background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px; }
.sup-detail-name { font-size:13px;font-weight:700;color:#134e4a;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0; }
.sup-detail-rows { display:flex;flex-direction:column;gap:3px; }
.sup-detail-row { display:grid;grid-template-columns:110px 1fr;gap:6px;font-size:12px;padding:2px 0; }
.sup-lbl { color:#64748b;display:flex;align-items:center;gap:4px; }
.sup-lbl .pi { font-size:10px; }
.sup-val { color:#1e293b; }

.pm-items-table { width:100%;border-collapse:collapse;font-size:12px; }
.pm-items-table thead tr { background:#f0fdfa; }
.pm-items-table thead th { padding:5px 8px;text-align:left;font-size:10.5px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.4px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.pm-items-table tbody tr { border-bottom:1px solid #e2e8f0; }
.pm-items-table tbody tr:hover { background:#f8fafc; }
.pm-items-table tbody td { padding:4px 6px;vertical-align:middle; }
.grand-total-row { background:#f0fdfa;border-top:2px solid #99f6e4; }

.pm-num-input { border:1px solid #d1d5db;border-radius:5px;padding:5px 8px;font-size:12px;width:100%;font-family:monospace;color:#1e293b; }
.pm-num-input:focus { outline:none;border-color:#0d9488; }

.pm-warn-box { background:#fff7ed;border:1px solid #fed7aa;border-radius:5px;padding:7px 12px;font-size:12px;color:#c2410c; }

.jenis-badge { display:inline-block;padding:2px 7px;border-radius:10px;font-size:10.5px;font-weight:700;letter-spacing:.4px;white-space:nowrap; }
.jenis-obt   { background:#dbeafe;color:#1d4ed8; }
.jenis-psi   { background:#ede9fe;color:#6d28d9; }
.jenis-pre   { background:#fce7f3;color:#9d174d; }
.jenis-nar   { background:#fee2e2;color:#dc2626; }
.jenis-brg   { background:#f1f5f9;color:#475569; }

.status-badge { display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700; }
.status-draft         { background:#fef9c3;color:#854d0e; }
.status-siap-dikirim  { background:#fef3c7;color:#d97706; }
.status-dikirim       { background:#dbeafe;color:#1d4ed8; }
.status-diterima      { background:#dcfce7;color:#15803d; }
.status-selesai       { background:#f1f5f9;color:#475569; }

.pm-page-footer { display:flex;justify-content:flex-end;gap:8px;padding:16px 0 8px;margin-top:8px;border-top:1px solid #e2e8f0; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
.mono { font-family:monospace;font-size:12px; }

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
</style>
