<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <Button icon="pi pi-arrow-left" text rounded class="me-2" @click="goBack" />
        <div class="pm-hero-icon"><i class="pi pi-wallet"></i></div>
        <div>
          <h4 class="pm-hero-title">Bayar Hutang</h4>
          <p class="pm-hero-sub">Faktur <strong>{{ noPenerimaan }}</strong></p>
        </div>
      </div>
    </div>

    <div v-if="header" class="det-wrap">
      <!-- STAT STRIP -->
      <div class="det-stat-strip">
        <div class="stat-card">
          <div class="stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-receipt"></i></div>
          <div>
            <div class="stat-lbl">Grand Total</div>
            <div class="stat-val" style="color:#0d9488">{{ formatCurrency(header.grand_total) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-check-circle"></i></div>
          <div>
            <div class="stat-lbl">Sudah Dibayar</div>
            <div class="stat-val" style="color:#2563eb">{{ formatCurrency(header.total_dibayar) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-ico" style="background:#fef2f2;color:#dc2626"><i class="pi pi-exclamation-circle"></i></div>
          <div>
            <div class="stat-lbl">Sisa Hutang</div>
            <div class="stat-val" style="color:#dc2626">{{ formatCurrency(header.sisa_hutang) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-ico" style="background:#fefce8;color:#a16207"><i class="pi pi-calendar"></i></div>
          <div>
            <div class="stat-lbl">Jatuh Tempo</div>
            <div class="stat-val" style="font-size:14px">{{ formatDate(header.jatuh_tempo) }}</div>
          </div>
        </div>
      </div>

      <!-- HEADER INFO -->
      <div class="info-row">
        <div><span class="info-lbl">No Faktur</span><span class="info-val mono">{{ header.no_faktur || '-' }}</span></div>
        <div><span class="info-lbl">Tanggal</span><span class="info-val mono">{{ formatDate(header.tanggal) }}</span></div>
        <div><span class="info-lbl">Supplier</span><span class="info-val">{{ header.nama_supplier }}</span></div>
        <div>
          <span class="info-lbl">Status</span>
          <span :class="Number(header.status_lunas) === 1 ? 'chip-lunas' : 'chip-kredit'">
            {{ Number(header.status_lunas) === 1 ? 'Lunas' : 'Kredit' }}
          </span>
        </div>
      </div>

      <!-- FORM BAYAR -->
      <div v-if="Number(header.status_lunas) !== 1" class="form-bayar">
        <h5 class="form-title">Input Pembayaran</h5>
        <div class="form-grid">
          <div class="form-field">
            <label>Jumlah Bayar</label>
            <input v-model.number="form.jumlah_bayar" type="number" min="1" :max="header.sisa_hutang" class="form-input" placeholder="0" />
          </div>
          <div class="form-field">
            <label>Tanggal Bayar</label>
            <input v-model="form.tanggal_bayar" type="date" class="form-input" />
          </div>
          <div class="form-field form-field-wide">
            <label>Catatan</label>
            <Textarea v-model="form.catatan" rows="1" class="form-input" placeholder="opsional" autoResize />
          </div>
        </div>
        <div class="form-actions">
          <Button
            label="Simpan Pembayaran"
            icon="pi pi-save"
            class="round-button2 btn-primary-pm"
            :loading="saving"
            :disabled="!form.jumlah_bayar || form.jumlah_bayar <= 0"
            @click="submitBayar"
          />
        </div>
      </div>

      <!-- RIWAYAT -->
      <div class="riwayat-section">
        <h5 class="form-title">Riwayat Pembayaran</h5>
        <div v-if="!riwayat.length" style="text-align:center;padding:24px;color:#94a3b8;font-size:12px">
          Belum ada pembayaran
        </div>
        <table v-else class="rekap-table">
          <thead>
            <tr>
              <th style="width:32px;text-align:center">#</th>
              <th>Tanggal Bayar</th>
              <th style="text-align:right">Jumlah Bayar</th>
              <th>Catatan</th>
              <th>Oleh</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in riwayat" :key="r.id_pembayaran">
              <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
              <td><span class="mono" style="font-size:11px">{{ formatDate(r.tanggal_bayar) }}</span></td>
              <td style="text-align:right"><span class="mono" style="font-weight:600;color:#0f766e">{{ formatCurrency(r.jumlah_bayar) }}</span></td>
              <td>{{ r.catatan || '-' }}</td>
              <td><span style="font-size:11px;color:#64748b">{{ r.user_id }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="!loading" style="text-align:center;padding:60px;color:#94a3b8">
      <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
      <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Faktur tidak ditemukan</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const noPenerimaan = route.query.no_penerimaan

const loading = ref(false)
const saving = ref(false)
const header = ref(null)
const riwayat = ref([])

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const form = ref({ jumlah_bayar: null, tanggal_bayar: todayStr(), catatan: '' })

async function fetchDetail() {
  loading.value = true
  try {
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_detail_hutang_faktur/${noPenerimaan}/${authStore.id_client}`
    )
    header.value = res.data?.response?.header || null
    riwayat.value = res.data?.response?.riwayat || []
  } catch {
    header.value = null
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail faktur', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function submitBayar() {
  saving.value = true
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/bayar_hutang`,
      {
        no_penerimaan: noPenerimaan,
        idclient: authStore.id_client,
        user_id: authStore.user_id,
        jumlah_bayar: form.value.jumlah_bayar,
        tanggal_bayar: form.value.tanggal_bayar,
        catatan: form.value.catatan,
      }
    )
    if (res.data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pembayaran berhasil disimpan', life: 3000 })
      form.value = { jumlah_bayar: null, tanggal_bayar: todayStr(), catatan: '' }
      await fetchDetail()
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Gagal menyimpan pembayaran', life: 4000 })
    }
  } catch (err) {
    const msg = err.response?.data?.metadata?.message || 'Gagal menyimpan pembayaran'
    toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 4000 })
  } finally {
    saving.value = false
  }
}

function goBack() { router.push({ name: 'RekapHutang' }) }

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(val) {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchDetail)
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0; }

.det-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

.det-stat-strip { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 16px;background:#fafafa;border-bottom:1px solid #e2e8f0; }
.stat-card { display:flex;align-items:center;gap:10px; }
.stat-ico { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
.stat-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.stat-val { font-size:16px;font-weight:700;color:#1e293b;margin-top:1px; }

.info-row { display:flex;flex-wrap:wrap;gap:24px;padding:12px 16px;border-bottom:1px solid #e2e8f0; }
.info-lbl { display:block;font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.info-val { display:block;font-size:13px;color:#1e293b;font-weight:600;margin-top:2px; }

.form-bayar { padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#f8fffe; }
.form-title { font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.4px;margin:0 0 10px; }
.form-grid { display:flex;gap:12px;flex-wrap:wrap; }
.form-field { display:flex;flex-direction:column;gap:4px;min-width:160px; }
.form-field-wide { flex:1; }
.form-field label { font-size:11px;color:#64748b;font-weight:600; }
.form-input { border:1px solid #d1d5db;border-radius:6px;padding:6px 9px;font-size:12px;color:#1e293b;font-family:inherit; }
.form-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.form-actions { margin-top:12px; }

.riwayat-section { padding:14px 16px; }

.rekap-table { width:100%;border-collapse:collapse;font-size:12px; }
.rekap-table thead tr { background:#f0fdfa; }
.rekap-table thead th { padding:6px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #99f6e4;white-space:nowrap; }
.rekap-table tbody tr { border-bottom:1px solid #f1f5f9; }
.rekap-table tbody tr:hover { background:#f8fafc; }
.rekap-table tbody td { padding:6px 8px;vertical-align:middle; }

.chip-lunas  { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534; }
.chip-kredit { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#fef3c7;color:#92400e; }

.mono { font-family:inherit;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }
</style>
