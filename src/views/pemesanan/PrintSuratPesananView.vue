<template>
  <div class="sp-wrap">
    <!-- Toolbar — tersembunyi saat print -->
    <div class="sp-toolbar no-print">
      <button class="sp-btn sp-btn-print" @click="doPrint" :disabled="loading || downloading">
        {{ downloading ? 'Mengunduh...' : '&#128438; Unduh PDF' }}
      </button>
      <button class="sp-btn sp-btn-close" @click="closeTab">&#x2715; Tutup</button>
    </div>

    <div v-if="loading" class="sp-center-msg">Memuat data surat pesanan...</div>

    <div v-else-if="!head" class="sp-center-msg sp-err">Data tidak ditemukan.</div>

    <div v-else class="sp-paper" id="sp-paper">

      <!-- ===== KOP SURAT ===== -->
      <div class="sp-kop">
        <img v-if="LINK_LOGO" :src="LINK_LOGO" class="sp-kop-logo" alt="Logo RS" />
        <div class="sp-kop-text">
          <div class="sp-kop-nama">{{ company }}</div>
          <div class="sp-kop-alamat">{{ toTitleCase(ALAMAT) }}</div>
        </div>
      </div>
      <hr class="sp-kop-hr" />

      <!-- ===== JUDUL ===== -->
      <div class="sp-judul-block">
        <div class="sp-judul">{{ spTitle }}</div>
        <div class="sp-nosp">Nomor: {{ head.no_sp }}</div>
      </div>

      <!-- ===== BODY SURAT ===== -->
      <div class="sp-letter">
        <p class="sp-letter-p">Yang bertanda tangan di bawah ini:</p>

        <div class="sp-info-grid sp-info-apoteker">
          <span class="sp-lbl">Nama</span><span class="sp-sep">:</span>
          <span>{{ head.nama_pj || '.................................................................' }}</span>
          <template v-if="head.jenis_sp !== 'BRG'">
            <span class="sp-lbl">No. SIPA</span><span class="sp-sep">:</span>
            <span>{{ head.no_sipa || '.................................................................' }}</span>
          </template>
        </div>

        <p class="sp-letter-p">
          Mengajukan pemesanan {{ labelJenisSP(head.jenis_sp) }} kepada:
        </p>

        <div class="sp-info-grid sp-info-supplier">
          <span class="sp-lbl">Nama Distributor/ PBF</span><span class="sp-sep">:</span>
          <span>{{ head.nama_supplier || '.................................................................' }}</span>
          <span class="sp-lbl">No. Izin</span><span class="sp-sep">:</span>
          <span>{{ head.no_izin_pbf || '.................................................................' }}</span>
          <span class="sp-lbl">No. CDOB</span><span class="sp-sep">:</span>
          <span>{{ head.no_sertifikat_cdob || '.................................................................' }}</span>
        </div>

        <p class="sp-letter-p">Adapun rincian pesanan sebagai berikut:</p>
      </div>

      <!-- ===== TABEL ITEM ===== -->
      <table class="sp-table">
        <thead>
          <tr>
            <th class="sp-col-no">No</th>
            <th class="sp-col-nama">Nama Produk</th>
            <th class="sp-col-jml">Jumlah</th>
            <th class="sp-col-sat">Satuan</th>
            <th class="sp-col-harga">Harga Satuan</th>
            <th class="sp-col-subtotal">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in details" :key="i">
            <td class="sp-col-no">{{ i + 1 }}</td>
            <td class="sp-col-nama">{{ item.nama_barang }}</td>
            <td class="sp-col-jml">{{ item.qty_pesan }}</td>
            <td class="sp-col-sat">{{ item.satuan }}</td>
            <td class="sp-col-harga">{{ item.harga_satuan ? formatCurrency(item.harga_satuan) : '-' }}</td>
            <td class="sp-col-subtotal">{{ (item.total_harga || subtotal(item)) > 0 ? formatCurrency(item.total_harga || subtotal(item)) : '-' }}</td>
          </tr>
          <tr v-for="n in emptyRows" :key="`e-${n}`" class="sp-empty-row">
            <td class="sp-col-no">&nbsp;</td>
            <td class="sp-col-nama"></td>
            <td class="sp-col-jml"></td>
            <td class="sp-col-sat"></td>
            <td class="sp-col-harga"></td>
            <td class="sp-col-subtotal"></td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="sp-grand-total-row">
            <td colspan="5" style="text-align:right;font-weight:bold;padding:6px 8px">Grand Total</td>
            <td class="sp-col-subtotal" style="font-weight:bold;padding:6px 8px">{{ (apiGrandTotal || grandTotal) > 0 ? formatCurrency(apiGrandTotal || grandTotal) : '-' }}</td>
          </tr>
        </tfoot>
      </table>

      <!-- ===== TANDA TANGAN ===== -->
      <div class="sp-sign-wrapper">
        <div class="sp-sign-block">
          <div class="sp-sign-tempat">________________, {{ formatDateLong(head.tanggal_sp) }}</div>
          <template v-if="hasOtorisasi?.sudah_otorisasi">
            <QrcodeVue
              :value="hasOtorisasi.qr_content || hasOtorisasi.pj?.nama || head.nama_pj || 'APJ'"
              :size="80"
              level="H"
              class="sp-qr"
            />
          </template>
          <template v-else>
            <div class="sp-ttd-space"></div>
          </template>
          <div class="sp-apj">{{ head.nama_pj || 'APJ' }}</div>
          <div v-if="head.jenis_sp !== 'BRG'" class="sp-sipa">SIPA No. {{ head.no_sipa || '............' }}</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { company, LINK_LOGO, ALAMAT, id_client } = storeToRefs(authStore)

const loading = ref(true)
const downloading = ref(false)
const head = ref(null)
const details = ref([])
const apiGrandTotal = ref(0)
const hasOtorisasi = ref(null)

const emptyRows = computed(() => Math.max(0, 5 - details.value.length))

const spTitleMap = {
  OBT: 'SURAT PESANAN OBAT',
  PSI: 'SURAT PESANAN PSIKOTROPIKA',
  PRE: 'SURAT PESANAN PREKURSOR',
  NAR: 'SURAT PESANAN NARKOTIKA',
  BRG: 'SURAT PESANAN BARANG',
}
const spTitle = computed(() => spTitleMap[head.value?.jenis_sp] || 'SURAT PESANAN')

function toTitleCase(str) {
  if (!str) return ''
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function subtotal(item) {
  return (Number(item.qty_pesan) || 0) * (Number(item.harga_satuan) || 0)
}

const grandTotal = computed(() => details.value.reduce((sum, item) => sum + subtotal(item), 0))

const jenisSPLabel = {
  OBT: 'obat',
  PSI: 'obat yang mengandung psikotropika',
  PRE: 'obat yang mengandung prekursor',
  NAR: 'obat yang mengandung narkotika',
  BRG: 'barang',
}
function labelJenisSP(kode) { return jenisSPLabel[kode] || kode || 'obat' }

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function formatDateLong(val) {
  if (!val) return '-'
  const d = new Date(val)
  if (isNaN(d)) return val
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── image-to-base64 helpers ──────────────────────────────────────────────────
const _imgCache = new Map()

const _blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const _tryFetch = async (url) => {
  try {
    const resp = await fetch(url, { cache: 'force-cache' })
    if (resp.ok) return await _blobToBase64(await resp.blob())
  } catch { /* gagal */ }
  return null
}

const _fetchImgBase64 = async (src) => {
  if (_imgCache.has(src)) return _imgCache.get(src)
  let b64 = null
  if (src.includes('ws-simrs.net')) {
    const proxyUrl = src.replace('https://ws-simrs.net', '/ws-simrs-assets')
    b64 = await _tryFetch(proxyUrl)
  }
  if (!b64) b64 = await _tryFetch(src)
  if (!b64) {
    try {
      const img = Array.from(document.querySelectorAll('img')).find(i => i.src === src)
      if (img?.complete && img.naturalWidth > 0) {
        const c = document.createElement('canvas')
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext('2d').drawImage(img, 0, 0)
        b64 = c.toDataURL('image/png')
      }
    } catch { /* canvas tainted */ }
  }
  _imgCache.set(src, b64)
  return b64
}

const _prepareImages = async (el) => {
  const imgs = [...el.querySelectorAll('img[src]')]
  const toRestore = []
  for (const img of imgs) {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) continue
    const b64 = await _fetchImgBase64(src)
    if (b64) {
      toRestore.push({ img, origSrc: src })
      img.src = b64
    }
  }
  return () => toRestore.forEach(({ img, origSrc }) => (img.src = origSrc))
}
// ────────────────────────────────────────────────────────────────────────────

async function doPrint() {
  if (downloading.value) return
  downloading.value = true
  const el = document.getElementById('sp-paper')
  const restore = await _prepareImages(el)
  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    })
    restore()
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pageW) / canvas.width
    let y = 0
    let page = 0
    while (y < imgH) {
      if (page > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, -y, pageW, imgH)
      y += pageH
      page++
    }
    const safeName = (head.value?.nama_supplier || 'supplier').replace(/[\\/:*?"<>|]/g, '')
    pdf.save(`SP_${safeName}.pdf`)
  } catch (err) {
    restore()
    console.error('Gagal export PDF:', err)
  } finally {
    downloading.value = false
    _imgCache.clear()
  }
}

function closeTab() { window.close() }

async function checkOtorisasi(idPemesanan) {
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/Pemesanan/cek_otorisasi_sp`,
      { idclient: id_client.value, id_pemesanan: idPemesanan }
    )
    if (res.data?.code === 200) hasOtorisasi.value = res.data.data
  } catch {
    // otorisasi belum ada
  }
}

onMounted(async () => {
  const idPemesanan = route.params.id_pemesanan
  try {
    const [detailRes] = await Promise.all([
      axios.get(`${configStore.apiApotikUrl}/index.php/api/Pemesanan/get_detail_pemesanan/${idPemesanan}/${id_client.value}`),
      checkOtorisasi(idPemesanan),
    ])
    if (detailRes.data?.code === 200) {
      const data = detailRes.data?.data || {}
      head.value = data.head || null
      details.value = data.details || []
      apiGrandTotal.value = data.grand_total || 0
    }
  } catch (err) {
    console.error('Gagal memuat SP:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #e5e7eb;
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  color: #1a1a1a;
}

/* ── TOOLBAR ── */
.sp-toolbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: #1e293b;
  padding: 8px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.sp-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  font-family: sans-serif;
}
.sp-btn-print { background: #0d9488; color: #fff; }
.sp-btn-print:hover:not(:disabled) { background: #0f766e; }
.sp-btn-print:disabled { opacity: .5; cursor: default; }
.sp-btn-close { background: #64748b; color: #fff; }
.sp-btn-close:hover { background: #475569; }

/* ── WRAP ── */
.sp-wrap { padding-top: 56px; min-height: 100vh; }

/* ── LOADING / ERROR ── */
.sp-center-msg {
  text-align: center;
  margin-top: 80px;
  font-family: sans-serif;
  font-size: 14px;
  color: #64748b;
}
.sp-err { color: #dc2626; }

/* ── PAPER ── */
.sp-paper {
  background: #fff;
  width: 210mm;
  min-height: 297mm;
  margin: 20px auto 40px;
  padding: 20mm 20mm 18mm;
  box-shadow: 0 2px 16px rgba(0,0,0,.18);
  font-family: 'Times New Roman', Times, serif;
}

/* ── KOP SURAT ── */
.sp-kop {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 10px;
}
.sp-kop-logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  flex-shrink: 0;
}
.sp-kop-text { flex: 1; }
.sp-kop-nama {
  font-size: 16pt;
  font-weight: bold;
  text-transform: uppercase;
  color: #1a1a1a;
  line-height: 1.2;
}
.sp-kop-alamat {
  font-size: 10pt;
  color: #333;
  margin-top: 3px;
}
.sp-kop-hr {
  border: none;
  border-top: 3px double #1a1a1a;
  margin: 0 0 14px;
}

/* ── JUDUL ── */
.sp-judul-block {
  text-align: center;
  margin-bottom: 20px;
}
.sp-judul {
  font-size: 14pt;
  font-weight: bold;
  text-decoration: underline;
  text-underline-offset: 3px;
  letter-spacing: 1px;
}
.sp-nosp {
  font-size: 10.5pt;
  margin-top: 4px;
  color: #1a1a1a;
}

/* ── BODY SURAT ── */
.sp-letter {
  font-size: 10.5pt;
  line-height: 1.8;
  margin-bottom: 14px;
}
.sp-letter-p {
  margin: 6px 0;
}
.sp-info-grid {
  display: grid;
  gap: 0;
  margin: 2px 0 6px 8px;
  line-height: 1.7;
}
.sp-info-apoteker  { grid-template-columns: 90px 14px 1fr; }
.sp-info-supplier  { grid-template-columns: 160px 14px 1fr; }
.sp-lbl { color: #1a1a1a; }
.sp-sep { text-align: center; }

/* ── TABLE ── */
.sp-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
  font-size: 10.5pt;
}
.sp-table th, .sp-table td {
  border: 1px solid #555;
  padding: 5px 8px;
  vertical-align: middle;
}
.sp-table thead tr { background: #f5f5f5; }
.sp-table thead th { font-weight: bold; text-align: left; }
.sp-col-no       { width: 36px; text-align: center; }
.sp-col-jml      { width: 60px; text-align: center; }
.sp-col-sat      { width: 80px; }
.sp-col-harga    { width: 110px; text-align: right; }
.sp-col-subtotal { width: 110px; text-align: right; }
.sp-grand-total-row { background: #f5f5f5; border-top: 2px solid #555; }
.sp-empty-row td { height: 22px; }

/* ── TANDA TANGAN ── */
.sp-sign-wrapper {
  display: flex;
  justify-content: flex-end;
}
.sp-sign-block {
  text-align: center;
  min-width: 180px;
}
.sp-sign-tempat {
  font-size: 10.5pt;
  margin-bottom: 6px;
  white-space: nowrap;
}
.sp-ttd-space { height: 70px; }
.sp-apj { font-size: 10.5pt; font-weight: bold; margin-top: 4px; }
.sp-sipa { font-size: 10pt; }
.sp-qr { display: block; margin: 4px auto 4px; }

/* ── PRINT MEDIA ── */
@media print {
  .no-print { display: none !important; }
}
</style>
