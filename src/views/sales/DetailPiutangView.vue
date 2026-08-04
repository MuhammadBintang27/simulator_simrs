<template>
  <div class="content">
    <Toast />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="goBack" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Detail Piutang</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">No. Transaksi <strong>{{ receiptNo }}</strong></div>
          </div>
        </div>
      </template>
    </Toolbar>

    <div v-if="loading" style="text-align:center;padding:60px;color:#94a3b8">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
      <p style="margin-top:10px;font-size:13px">Memuat detail piutang...</p>
    </div>

    <div v-else-if="header" class="det-wrap">
      <!-- STAT STRIP -->
      <div class="det-stat-strip">
        <div class="stat-card">
          <div class="stat-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-receipt"></i></div>
          <div>
            <div class="stat-lbl">Grand Total</div>
            <div class="stat-val" style="color:#0d9488">{{ formatRupiah(header.grand_total) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-check-circle"></i></div>
          <div>
            <div class="stat-lbl">Sudah Dibayar</div>
            <div class="stat-val" style="color:#2563eb">{{ formatRupiah(header.total_dibayar) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-ico" style="background:#fef2f2;color:#dc2626"><i class="pi pi-exclamation-circle"></i></div>
          <div>
            <div class="stat-lbl">Sisa Piutang</div>
            <div class="stat-val" style="color:#dc2626">{{ formatRupiah(header.sisa_piutang) }}</div>
          </div>
        </div>
      </div>

      <!-- HEADER INFO -->
      <div class="info-row">
        <div><span class="info-lbl">Tanggal</span><span class="info-val mono">{{ formatDateTime(header.tanggal) }}</span></div>
        <div><span class="info-lbl">Pasien</span><span class="info-val">{{ header.nama_pasien || '-' }}</span></div>
        <div><span class="info-lbl">No RM</span><span class="info-val mono">{{ header.nomr || '-' }}</span></div>
        <div v-if="header.no_register"><span class="info-lbl">No Register</span><span class="info-val mono">{{ header.no_register }}</span></div>
        <div>
          <span class="info-lbl">Status</span>
          <span :class="Number(header.status_lunas) === 1 ? 'chip-lunas' : 'chip-kredit'">
            {{ header.status_lunas_label || (Number(header.status_lunas) === 1 ? 'Lunas' : 'Belum Lunas') }}
          </span>
        </div>
      </div>

      <!-- FORM BAYAR -->
      <div v-if="Number(header.status_lunas) !== 1" class="form-bayar">
        <h5 class="form-title">Input Pembayaran Cicilan</h5>
        <div class="form-grid">
          <div class="form-field">
            <label>Jumlah Bayar</label>
            <InputNumber v-model="form.jumlahBayar" mode="decimal" :min="1" :max="header.sisa_piutang" inputmode="decimal" class="form-input-num" placeholder="0" />
          </div>
          <div class="form-field">
            <label>Tanggal Bayar</label>
            <DatePicker v-model="form.tanggalBayar" dateFormat="dd M yy" showIcon iconDisplay="input" class="form-input-num" />
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
            :disabled="!form.jumlahBayar || form.jumlahBayar <= 0"
            @click="submitBayar"
          />
        </div>
      </div>

      <!-- RIWAYAT -->
      <div class="riwayat-section">
        <h5 class="form-title">Riwayat Cicilan</h5>
        <div v-if="!riwayat.length" style="text-align:center;padding:24px;color:#94a3b8;font-size:12px">
          Belum ada cicilan
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
            <tr v-for="(r, i) in riwayat" :key="i">
              <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
              <td><span class="mono" style="font-size:11px">{{ formatDateTime(r.tanggal_bayar) }}</span></td>
              <td style="text-align:right"><span class="mono" style="font-weight:600;color:#0f766e">{{ formatRupiah(r.jumlah_bayar) }}</span></td>
              <td>{{ r.catatan || '-' }}</td>
              <td><span style="font-size:11px;color:#64748b">{{ r.user_id }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else style="text-align:center;padding:60px;color:#94a3b8">
      <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
      <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Transaksi piutang tidak ditemukan</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import Toolbar from 'primevue/toolbar'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import axios from 'axios'
import { formatRupiah } from './utils/format'
import { formatDateTime, formatDateOnlyForAPI } from './utils/date'

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const apiUrl = `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`
const receiptNo = route.query.no_transaksi

const loading = ref(false)
const saving = ref(false)
const header = ref(null)
const riwayat = ref([])

const form = ref({ jumlahBayar: null, tanggalBayar: new Date(), catatan: '' })

async function fetchDetail() {
  loading.value = true
  try {
    const res = await axios.get(`${apiUrl}/detail_piutang/${receiptNo}/${authStore.id_client}`)
    const resp = res.data?.response ?? {}
    header.value = resp.header ?? resp ?? null
    riwayat.value = resp.riwayat || []
  } catch {
    header.value = null
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat detail piutang', life: 3000 })
  } finally {
    loading.value = false
  }
}

async function submitBayar() {
  saving.value = true
  try {
    const { data } = await axios.post(`${apiUrl}/bayar_piutang`, {
      RECEIPT_NO: receiptNo,
      IDCLIENT: Number(authStore.id_client),
      IDUSER: authStore.user_id,
      JUMLAH_BAYAR: form.value.jumlahBayar,
      TANGGAL_BAYAR: formatDateOnlyForAPI(form.value.tanggalBayar),
      CATATAN: form.value.catatan,
    })
    if (data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pembayaran cicilan berhasil disimpan', life: 3000 })
      form.value = { jumlahBayar: null, tanggalBayar: new Date(), catatan: '' }
      await fetchDetail()
    } else {
      toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menyimpan pembayaran', life: 4000 })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.response?.data?.metadata?.message || 'Gagal menyimpan pembayaran',
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push({ name: 'RekapPiutang' })
}

onMounted(fetchDetail)
</script>

<style scoped>
.det-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

.det-stat-strip { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px 16px;background:#fafafa;border-bottom:1px solid #e2e8f0; }
.stat-card { display:flex;align-items:center;gap:10px; }
.stat-ico { width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
.stat-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.stat-val { font-size:16px;font-weight:700;color:#1e293b;margin-top:1px; }

.info-row { display:flex;flex-wrap:wrap;gap:24px;padding:12px 16px;border-bottom:1px solid #e2e8f0; }
.info-lbl { display:block;font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.info-val { display:block;font-size:13px;color:#1e293b;font-weight:600;margin-top:2px; }

.form-bayar { padding:14px 16px;border-bottom:1px solid #e2e8f0;background:#f8fffe; }
.form-title { font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:.4px;margin:0 0 10px; }
.form-grid { display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end; }
.form-field { display:flex;flex-direction:column;gap:4px;min-width:160px; }
.form-field-wide { flex:1; }
.form-field label { font-size:11px;color:#64748b;font-weight:600; }
.form-input { border:1px solid #d1d5db;border-radius:6px;padding:6px 9px;font-size:12px;color:#1e293b;font-family:inherit;width:100%; }
.form-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.form-input-num { width:170px; }
.form-input-num :deep(input) { font-size:12px;padding:6px 9px; }
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
