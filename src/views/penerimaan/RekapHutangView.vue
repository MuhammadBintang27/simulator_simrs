<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />

    <!-- HERO -->
    <div class="pm-hero mb-2">
      <div class="pm-hero-left">
        <div class="pm-hero-icon"><i class="pi pi-wallet"></i></div>
        <div>
          <h4 class="pm-hero-title">Rekap Hutang Supplier</h4>
          <p class="pm-hero-sub">Faktur pembelian kredit — lunas &amp; belum lunas</p>
        </div>
      </div>
    </div>

    <!-- RINGKASAN CARDS -->
    <div v-if="ringkasan" class="ringkasan-strip">
      <div class="ring-card">
        <div class="ring-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-receipt"></i></div>
        <div><div class="ring-lbl">Total Faktur</div><div class="ring-val">{{ ringkasan.jumlah_faktur }}</div></div>
      </div>
      <div class="ring-card">
        <div class="ring-ico" style="background:#dcfce7;color:#166534"><i class="pi pi-check-circle"></i></div>
        <div><div class="ring-lbl">Lunas</div><div class="ring-val" style="color:#166534">{{ ringkasan.jumlah_lunas }}</div></div>
      </div>
      <div class="ring-card">
        <div class="ring-ico" style="background:#fef3c7;color:#92400e"><i class="pi pi-clock"></i></div>
        <div><div class="ring-lbl">Belum Lunas</div><div class="ring-val" style="color:#92400e">{{ ringkasan.jumlah_belum_lunas }}</div></div>
      </div>
      <div class="ring-card">
        <div class="ring-ico" style="background:#eff6ff;color:#2563eb"><i class="pi pi-wallet"></i></div>
        <div><div class="ring-lbl">Sudah Dibayar</div><div class="ring-val" style="color:#2563eb">{{ formatCurrency(ringkasan.total_dibayar) }}</div></div>
      </div>
      <div class="ring-card">
        <div class="ring-ico" style="background:#fef2f2;color:#dc2626"><i class="pi pi-exclamation-circle"></i></div>
        <div><div class="ring-lbl">Sisa Hutang</div><div class="ring-val" style="color:#dc2626">{{ formatCurrency(ringkasan.total_sisa_hutang) }}</div></div>
      </div>
    </div>

    <!-- STATUS TABS -->
    <div class="status-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        class="status-tab"
        :class="{ active: statusLunas === tab.value }"
        @click="setStatusTab(tab.value)"
      >{{ tab.label }}</button>
    </div>

    <!-- FILTER BAR -->
    <div class="pm-filter-bar">
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-search"></i></span>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Cari no faktur / no penerimaan / supplier..."
          class="search-input"
          :disabled="loading"
          @keyup.enter="fetchRekap"
        />
      </div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Periode</span>
        <input v-model="periode" type="month" class="periode-input" :disabled="loading" @keyup.enter="fetchRekap" />
        <Button v-if="periode" icon="pi pi-times" text rounded size="small" v-tooltip.top="'Hapus periode'" @click="periode = ''" :disabled="loading" />
      </div>
      <div class="pm-filter-group">
        <Button
          :label="groupBy === 'none' ? 'List Flat' : 'Per PBF'"
          :icon="groupBy === 'none' ? 'pi pi-list' : 'pi pi-sitemap'"
          severity="secondary"
          outlined
          class="round-button2"
          @click="toggleGroupBy"
        />
      </div>
      <div class="pm-filter-actions ms-auto">
        <Button icon="pi pi-search" label="Tampilkan" class="round-button2 btn-primary-pm" :loading="loading" @click="fetchRekap" />
        <Button icon="pi pi-refresh" severity="secondary" outlined class="round-button2" v-tooltip.top="'Reset'" @click="resetFilter" :disabled="loading" />
      </div>
    </div>

    <!-- CONTENT -->
    <div class="rekap-wrap">
      <div v-if="loading" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p style="margin-top:10px;font-size:13px">Memuat rekap hutang...</p>
      </div>
      <div v-else-if="!data.length && fetched" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
        <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Tidak ada faktur hutang</p>
      </div>

      <!-- FLAT MODE -->
      <div v-else-if="groupBy === 'none' && data.length" style="overflow-x:auto">
        <table class="rekap-table">
          <thead>
            <tr>
              <th style="width:32px;text-align:center">#</th>
              <th>No Penerimaan</th>
              <th>No Faktur</th>
              <th>Tanggal</th>
              <th>Supplier</th>
              <th style="text-align:right">Grand Total</th>
              <th style="text-align:right">Dibayar</th>
              <th style="text-align:right">Sisa Hutang</th>
              <th style="text-align:center">Jatuh Tempo</th>
              <th style="text-align:center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in data" :key="row.no_penerimaan" class="rekap-row" @click="bukaDetail(row)">
              <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
              <td><span class="mono" style="font-weight:600;color:#0d9488">{{ row.no_penerimaan }}</span></td>
              <td><span class="mono">{{ row.no_faktur || '-' }}</span></td>
              <td><span class="mono" style="font-size:11px">{{ formatDate(row.tanggal) }}</span></td>
              <td>{{ row.nama_supplier }}</td>
              <td style="text-align:right"><span class="mono">{{ formatCurrency(row.grand_total) }}</span></td>
              <td style="text-align:right"><span class="mono" style="color:#64748b">{{ formatCurrency(row.total_dibayar) }}</span></td>
              <td style="text-align:right"><span class="mono" style="font-weight:700;color:#dc2626">{{ formatCurrency(row.sisa_hutang) }}</span></td>
              <td style="text-align:center">
                <span :class="row.jatuh_tempo_lewat ? 'chip-lewat' : 'chip-normal'">
                  {{ formatDate(row.jatuh_tempo) }}
                </span>
              </td>
              <td style="text-align:center">
                <span :class="Number(row.status_lunas) === 1 ? 'chip-lunas' : 'chip-kredit'">
                  {{ row.status_lunas_label || (Number(row.status_lunas) === 1 ? 'Lunas' : 'Belum Lunas') }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="rekap-grand">
              <td colspan="7" style="font-weight:700;font-size:11px;letter-spacing:.4px">TOTAL SISA HUTANG</td>
              <td style="text-align:right;font-weight:800;font-size:12px;color:#dc2626">{{ formatCurrency(grandSisaHutang) }}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- PBF MODE -->
      <div v-else-if="groupBy === 'pbf' && data.length" class="pbf-list">
        <div v-for="pbf in data" :key="pbf.id_supplier" class="pbf-card">
          <div class="pbf-header" @click="toggleExpand(pbf.id_supplier)">
            <i :class="isExpanded(pbf.id_supplier) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            <span class="pbf-name">{{ pbf.nama_supplier }}</span>
            <span class="pbf-count">{{ pbf.jumlah_faktur }} faktur</span>
            <span v-if="pbfRingkasan(pbf)" class="pbf-progress">
              <span class="chip-lunas">{{ pbfRingkasan(pbf).jumlah_lunas }} lunas</span>
              <span class="chip-kredit">{{ pbfRingkasan(pbf).jumlah_belum_lunas }} belum</span>
            </span>
            <span class="pbf-total">{{ formatCurrency(pbf.total_sisa_hutang) }}</span>
          </div>
          <div v-if="isExpanded(pbf.id_supplier)" style="overflow-x:auto">
            <table class="rekap-table">
              <thead>
                <tr>
                  <th style="width:32px;text-align:center">#</th>
                  <th>No Penerimaan</th>
                  <th>No Faktur</th>
                  <th>Tanggal</th>
                  <th style="text-align:right">Grand Total</th>
                  <th style="text-align:right">Dibayar</th>
                  <th style="text-align:right">Sisa Hutang</th>
                  <th style="text-align:center">Jatuh Tempo</th>
                  <th style="text-align:center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in pbf.fakturs" :key="row.no_penerimaan" class="rekap-row" @click="bukaDetail(row)">
                  <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
                  <td><span class="mono" style="font-weight:600;color:#0d9488">{{ row.no_penerimaan }}</span></td>
                  <td><span class="mono">{{ row.no_faktur || '-' }}</span></td>
                  <td><span class="mono" style="font-size:11px">{{ formatDate(row.tanggal) }}</span></td>
                  <td style="text-align:right"><span class="mono">{{ formatCurrency(row.grand_total) }}</span></td>
                  <td style="text-align:right"><span class="mono" style="color:#64748b">{{ formatCurrency(row.total_dibayar) }}</span></td>
                  <td style="text-align:right"><span class="mono" style="font-weight:700;color:#dc2626">{{ formatCurrency(row.sisa_hutang) }}</span></td>
                  <td style="text-align:center">
                    <span :class="row.jatuh_tempo_lewat ? 'chip-lewat' : 'chip-normal'">
                      {{ formatDate(row.jatuh_tempo) }}
                    </span>
                  </td>
                  <td style="text-align:center">
                    <span :class="Number(row.status_lunas) === 1 ? 'chip-lunas' : 'chip-kredit'">
                      {{ row.status_lunas_label || (Number(row.status_lunas) === 1 ? 'Lunas' : 'Belum Lunas') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
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

const statusTabs = [
  { value: null, label: 'Semua' },
  { value: 0, label: 'Belum Lunas' },
  { value: 1, label: 'Lunas' },
]

const loading = ref(false)
const fetched = ref(false)
const data = ref([])
const groupBy = ref('none')
const expanded = ref(new Set())
const statusLunas = ref(0)
const ringkasan = ref(null)

const filters = ref({ search: '' })
const periode = ref('') // format 'YYYY-MM' from <input type="month">

const grandSisaHutang = computed(() => data.value.reduce((s, r) => s + (Number(r.sisa_hutang) || 0), 0))

function setStatusTab(value) {
  statusLunas.value = value
  fetchRekap()
}

function pbfRingkasan(pbf) {
  return pbf.ringkasan || null
}

function toggleGroupBy() {
  groupBy.value = groupBy.value === 'none' ? 'pbf' : 'none'
  fetchRekap()
}

function toggleExpand(idSupplier) {
  const next = new Set(expanded.value)
  if (next.has(idSupplier)) next.delete(idSupplier)
  else next.add(idSupplier)
  expanded.value = next
}

function isExpanded(idSupplier) {
  return expanded.value.has(idSupplier)
}

async function fetchRekap() {
  loading.value = true
  try {
    const params = { idclient: authStore.id_client, group_by: groupBy.value }
    if (authStore.id_lokasi) params.id_lokasi = authStore.id_lokasi
    if (filters.value.search) params.search = filters.value.search
    if (statusLunas.value !== null) params.status_lunas = statusLunas.value
    if (periode.value) {
      const [tahun, bulan] = periode.value.split('-')
      params.tahun = Number(tahun)
      params.bulan = Number(bulan)
    }
    const res = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/PenerimaanV3/get_rekap_hutang`,
      { params }
    )
    data.value = res.data?.response ?? res.data?.data ?? []
    ringkasan.value = res.data?.ringkasan || null
    fetched.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat rekap hutang', life: 3000 })
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filters.value = { search: '' }
  periode.value = ''
  statusLunas.value = 0
  fetchRekap()
}

function bukaDetail(row) {
  router.push({
    name: 'BayarHutang',
    query: { no_penerimaan: row.no_penerimaan },
  })
}

function formatDate(val) {
  if (!val) return '-'
  const d = new Date(val)
  return isNaN(d) ? val : d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatCurrency(val) {
  if (!val) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

onMounted(fetchRekap)
</script>

<style scoped>
.pm-hero { display:flex;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%);border:1px solid #99f6e4;border-radius:8px;padding:12px 16px;flex-wrap:wrap; }
.pm-hero-left { display:flex;align-items:center;gap:12px;flex:1;min-width:0; }
.pm-hero-icon { width:40px;height:40px;background:linear-gradient(135deg,#0d9488,#0f766e);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0; }
.pm-hero-title { font-size:16px;font-weight:700;color:#134e4a;margin:0;white-space:nowrap; }
.pm-hero-sub { font-size:11px;color:#0f766e;margin:1px 0 0; }

.pm-filter-bar { display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:10px;flex-wrap:wrap; }
.pm-filter-group { display:flex;align-items:center;gap:6px; }
.pm-filter-label { font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:3px;white-space:nowrap; }
.pm-filter-actions { display:flex;align-items:center;gap:6px; }
.search-input { width:280px;border:1px solid #d1d5db;border-radius:6px;padding:5px 8px;font-size:12px;color:#1e293b; }
.search-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.search-input:disabled { background:#f8fafc;color:#94a3b8; }
.periode-input { border:1px solid #d1d5db;border-radius:6px;padding:5px 8px;font-size:12px;color:#1e293b; }
.periode-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.periode-input:disabled { background:#f8fafc;color:#94a3b8; }

/* RINGKASAN CARDS */
.ringkasan-strip { display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:10px; }
.ring-card { display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px; }
.ring-ico { width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0; }
.ring-lbl { font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.4px; }
.ring-val { font-size:15px;font-weight:700;color:#1e293b;margin-top:1px; }

/* STATUS TABS */
.status-tabs { display:flex;gap:6px;margin-bottom:10px; }
.status-tab { border:1px solid #d1d5db;background:#fff;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;color:#64748b;cursor:pointer;transition:all .15s; }
.status-tab:hover { border-color:#0d9488;color:#0d9488; }
.status-tab.active { background:#0d9488;border-color:#0d9488;color:#fff; }

.pbf-progress { display:flex;gap:4px; }

.rekap-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

.rekap-table { width:100%;border-collapse:collapse;font-size:12px; }
.rekap-table thead tr { background:#f0fdfa; }
.rekap-table thead th { padding:6px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #99f6e4;white-space:nowrap; }

.rekap-row { border-bottom:1px solid #f1f5f9;cursor:pointer; }
.rekap-row:hover { background:#f8fafc; }
.rekap-table tbody td { padding:6px 8px;vertical-align:middle; }

.rekap-grand { background:#f0fdfa;border-top:2px solid #99f6e4; }
.rekap-grand td { padding:7px 8px;font-size:11px;color:#374151; }

.chip-normal { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#f1f5f9;color:#475569; }
.chip-lewat { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#fee2e2;color:#b91c1c; }
.chip-lunas { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534; }
.chip-kredit { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#fef3c7;color:#92400e; }

.mono { font-family:inherit;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }

/* PBF accordion */
.pbf-list { padding:8px; }
.pbf-card { border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;overflow:hidden; }
.pbf-header { display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;cursor:pointer;font-size:12px; }
.pbf-header:hover { background:#f0fdfa; }
.pbf-header .pi { color:#0d9488;font-size:11px; }
.pbf-name { font-weight:700;color:#1e293b;flex:1; }
.pbf-count { font-size:11px;color:#94a3b8; }
.pbf-total { font-weight:800;color:#dc2626;font-size:12px; }
</style>
