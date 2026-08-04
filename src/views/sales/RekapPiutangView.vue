<template>
  <div class="content">
    <Toast />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="router.push('/sales/pos')" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Rekap Piutang</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">Sales Langsung — Apotik</div>
          </div>
        </div>
      </template>
    </Toolbar>

    <!-- RINGKASAN CARDS -->
    <div v-if="ringkasan" class="ringkasan-strip">
      <div class="ring-card">
        <div class="ring-ico" style="background:#f0fdfa;color:#0d9488"><i class="pi pi-receipt"></i></div>
        <div><div class="ring-lbl">Total Transaksi</div><div class="ring-val">{{ ringkasan.jumlah_transaksi }}</div></div>
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
        <div><div class="ring-lbl">Sudah Dibayar</div><div class="ring-val" style="color:#2563eb">{{ formatRupiah(ringkasan.total_dibayar) }}</div></div>
      </div>
      <div class="ring-card">
        <div class="ring-ico" style="background:#fef2f2;color:#dc2626"><i class="pi pi-exclamation-circle"></i></div>
        <div><div class="ring-lbl">Sisa Piutang</div><div class="ring-val" style="color:#dc2626">{{ formatRupiah(ringkasan.total_sisa_piutang) }}</div></div>
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
          placeholder="Cari no transaksi / no RM / nama pasien..."
          class="search-input"
          :disabled="loading"
          @keyup.enter="fetchRekap"
        />
      </div>
      <div class="pm-filter-group">
        <span class="pm-filter-label"><i class="pi pi-calendar"></i>Periode</span>
        <DatePicker v-model="dateStart" dateFormat="dd M yy" placeholder="Tanggal mulai" showIcon iconDisplay="input" class="periode-date" :disabled="loading" />
        <DatePicker v-model="dateEnd" dateFormat="dd M yy" placeholder="Tanggal akhir" showIcon iconDisplay="input" class="periode-date" :disabled="loading" />
      </div>
      <div class="pm-filter-group">
        <Button
          :label="groupBy === 'none' ? 'List Flat' : 'Per Pasien'"
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
        <p style="margin-top:10px;font-size:13px">Memuat rekap piutang...</p>
      </div>
      <div v-else-if="!data.length && fetched" style="text-align:center;padding:60px;color:#94a3b8">
        <i class="pi pi-inbox" style="font-size:2.5rem;color:#cbd5e1"></i>
        <p style="margin-top:12px;font-size:13px;font-weight:600;color:#64748b">Tidak ada transaksi piutang</p>
      </div>

      <!-- FLAT MODE -->
      <div v-else-if="groupBy === 'none' && data.length" style="overflow-x:auto">
        <table class="rekap-table">
          <thead>
            <tr>
              <th style="width:32px;text-align:center">#</th>
              <th>No Transaksi</th>
              <th>Tanggal</th>
              <th>No RM</th>
              <th>Nama Pasien</th>
              <th style="text-align:right">Grand Total</th>
              <th style="text-align:right">Dibayar</th>
              <th style="text-align:right">Sisa Piutang</th>
              <th style="text-align:center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in data" :key="row.no_transaksi" class="rekap-row" @click="bukaDetail(row)">
              <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
              <td><span class="mono" style="font-weight:600;color:#0d9488">{{ row.no_transaksi }}</span></td>
              <td><span class="mono" style="font-size:11px">{{ formatDateTime(row.tanggal) }}</span></td>
              <td><span class="mono">{{ row.nomr || '-' }}</span></td>
              <td>{{ row.nama_pasien || '-' }}</td>
              <td style="text-align:right"><span class="mono">{{ formatRupiah(row.grand_total) }}</span></td>
              <td style="text-align:right"><span class="mono" style="color:#64748b">{{ formatRupiah(row.total_dibayar) }}</span></td>
              <td style="text-align:right"><span class="mono" style="font-weight:700;color:#dc2626">{{ formatRupiah(row.sisa_piutang) }}</span></td>
              <td style="text-align:center">
                <span :class="Number(row.status_lunas) === 1 ? 'chip-lunas' : 'chip-kredit'">
                  {{ row.status_lunas_label || (Number(row.status_lunas) === 1 ? 'Lunas' : 'Belum Lunas') }}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="rekap-grand">
              <td colspan="7" style="font-weight:700;font-size:11px;letter-spacing:.4px">TOTAL SISA PIUTANG</td>
              <td style="text-align:right;font-weight:800;font-size:12px;color:#dc2626">{{ formatRupiah(grandSisaPiutang) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- GROUP PASIEN MODE -->
      <div v-else-if="groupBy === 'pasien' && data.length" class="pasien-list">
        <div v-for="grp in data" :key="grp.nomr" class="pasien-card">
          <div class="pasien-header" @click="toggleExpand(grp.nomr)">
            <i :class="isExpanded(grp.nomr) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
            <span class="pasien-name">{{ grp.nama_pasien }}</span>
            <span class="pasien-nomr mono">No RM {{ grp.nomr }}</span>
            <span class="pasien-count">{{ grp.jumlah_transaksi }} transaksi</span>
            <span v-if="grpRingkasan(grp)" class="pasien-progress">
              <span class="chip-lunas">{{ grpRingkasan(grp).jumlah_lunas }} lunas</span>
              <span class="chip-kredit">{{ grpRingkasan(grp).jumlah_belum_lunas }} belum</span>
            </span>
            <span class="pasien-total">{{ formatRupiah(grp.total_sisa_piutang) }}</span>
          </div>
          <div v-if="isExpanded(grp.nomr)" style="overflow-x:auto">
            <table class="rekap-table">
              <thead>
                <tr>
                  <th style="width:32px;text-align:center">#</th>
                  <th>No Transaksi</th>
                  <th>Tanggal</th>
                  <th style="text-align:right">Grand Total</th>
                  <th style="text-align:right">Dibayar</th>
                  <th style="text-align:right">Sisa Piutang</th>
                  <th style="text-align:center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in grp.transaksi" :key="row.no_transaksi" class="rekap-row" @click="bukaDetail(row)">
                  <td style="text-align:center;color:#94a3b8;font-size:11px">{{ i + 1 }}</td>
                  <td><span class="mono" style="font-weight:600;color:#0d9488">{{ row.no_transaksi }}</span></td>
                  <td><span class="mono" style="font-size:11px">{{ formatDateTime(row.tanggal) }}</span></td>
                  <td style="text-align:right"><span class="mono">{{ formatRupiah(row.grand_total) }}</span></td>
                  <td style="text-align:right"><span class="mono" style="color:#64748b">{{ formatRupiah(row.total_dibayar) }}</span></td>
                  <td style="text-align:right"><span class="mono" style="font-weight:700;color:#dc2626">{{ formatRupiah(row.sisa_piutang) }}</span></td>
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
import Toolbar from 'primevue/toolbar'
import DatePicker from 'primevue/datepicker'
import axios from 'axios'
import { formatRupiah } from './utils/format'
import { formatDateTime, formatDateOnlyForAPI } from './utils/date'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

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
const now = new Date()
const dateStart = ref(new Date(now.getFullYear(), now.getMonth(), 1))
const dateEnd = ref(now)

const grandSisaPiutang = computed(() => data.value.reduce((s, r) => s + (Number(r.sisa_piutang) || 0), 0))

function setStatusTab(value) {
  statusLunas.value = value
  fetchRekap()
}

function grpRingkasan(grp) {
  return grp.ringkasan || null
}

function toggleGroupBy() {
  groupBy.value = groupBy.value === 'none' ? 'pasien' : 'none'
  fetchRekap()
}

function toggleExpand(nomr) {
  const next = new Set(expanded.value)
  if (next.has(nomr)) next.delete(nomr)
  else next.add(nomr)
  expanded.value = next
}

function isExpanded(nomr) {
  return expanded.value.has(nomr)
}

async function fetchRekap() {
  loading.value = true
  try {
    const params = {
      clientId: authStore.id_client,
      lokasiId: authStore.id_lokasi,
      groupBy: groupBy.value,
      dateStart: formatDateOnlyForAPI(dateStart.value),
      dateEnd: formatDateOnlyForAPI(dateEnd.value),
    }
    if (filters.value.search) params.search = filters.value.search
    if (statusLunas.value !== null) params.statusLunas = statusLunas.value
    const res = await axios.get(`${apiUrl.value}/rekap_piutang`, { params })
    data.value = res.data?.response ?? res.data?.data ?? []
    ringkasan.value = res.data?.ringkasan || null
    fetched.value = true
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat rekap piutang', life: 3000 })
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filters.value = { search: '' }
  dateStart.value = new Date(now.getFullYear(), now.getMonth(), 1)
  dateEnd.value = now
  statusLunas.value = 0
  fetchRekap()
}

function bukaDetail(row) {
  router.push({
    name: 'DetailPiutang',
    query: { no_transaksi: row.no_transaksi },
  })
}

onMounted(fetchRekap)
</script>

<style scoped>
.pm-filter-bar { display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-bottom:10px;flex-wrap:wrap; }
.pm-filter-group { display:flex;align-items:center;gap:6px; }
.pm-filter-label { font-size:11px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:3px;white-space:nowrap; }
.pm-filter-actions { display:flex;align-items:center;gap:6px; }
.search-input { width:260px;border:1px solid #d1d5db;border-radius:6px;padding:5px 8px;font-size:12px;color:#1e293b; }
.search-input:focus { outline:none;border-color:#0d9488;box-shadow:0 0 0 2px rgba(13,148,136,.15); }
.search-input:disabled { background:#f8fafc;color:#94a3b8; }
.periode-date { width:140px; }
.periode-date :deep(input) { font-size:12px;padding:5px 8px; }

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

.pasien-progress { display:flex;gap:4px; }

.rekap-wrap { background:#fff;border:1px solid #e2e8f0;border-top:3px solid #0d9488;border-radius:6px;overflow:hidden; }

.rekap-table { width:100%;border-collapse:collapse;font-size:12px; }
.rekap-table thead tr { background:#f0fdfa; }
.rekap-table thead th { padding:6px 8px;text-align:left;font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #99f6e4;white-space:nowrap; }

.rekap-row { border-bottom:1px solid #f1f5f9;cursor:pointer; }
.rekap-row:hover { background:#f8fafc; }
.rekap-table tbody td { padding:6px 8px;vertical-align:middle; }

.rekap-grand { background:#f0fdfa;border-top:2px solid #99f6e4; }
.rekap-grand td { padding:7px 8px;font-size:11px;color:#374151; }

.chip-lunas { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534; }
.chip-kredit { display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;background:#fef3c7;color:#92400e; }

.mono { font-family:inherit;font-size:12px; }
.btn-primary-pm { background:#0d9488 !important;border-color:#0d9488 !important;color:#fff !important; }
.btn-primary-pm:hover { background:#0f766e !important;border-color:#0f766e !important; }
.round-button2 { border-radius:6px;font-size:12px;padding:6px 12px; }

/* Grup per pasien accordion */
.pasien-list { padding:8px; }
.pasien-card { border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;overflow:hidden; }
.pasien-header { display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;cursor:pointer;font-size:12px; }
.pasien-header:hover { background:#f0fdfa; }
.pasien-header .pi { color:#0d9488;font-size:11px; }
.pasien-name { font-weight:700;color:#1e293b; }
.pasien-nomr { font-size:11px;color:#94a3b8; }
.pasien-count { font-size:11px;color:#94a3b8;flex:1; }
.pasien-total { font-weight:800;color:#dc2626;font-size:12px; }
</style>
