<template>
  <div class="content">
    <Toast />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="router.push('/sales/pos')" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Laporan Penjualan</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">Sales Langsung — Apotik</div>
          </div>
        </div>
      </template>
      <template #end>
        <div class="filter-bar">
          <Button icon="pi pi-chart-line" label="Laba Rugi" severity="secondary" text size="small" @click="router.push('/sales/laba-rugi')" />
          <Button icon="pi pi-wallet" label="Kas Lain" severity="secondary" text size="small" @click="router.push('/sales/transaksi-lain')" />
        </div>
      </template>
    </Toolbar>

    <!-- ══ Filter periode — dipakai stat cards di bawah + tab-tab (Ringkasan/Buku Kas/dst) ══ -->
    <div class="period-toolbar">
      <div class="groupby-control">
        <label>Tampilkan per</label>
        <SelectButton
          v-model="ringkasanGroupBy"
          :options="groupByOptions"
          optionLabel="label"
          optionValue="value"
          @change="onGroupByChange"
        />
      </div>
      <div class="filter-bar">
        <DatePicker v-model="dateStart" dateFormat="dd M yy" placeholder="Tanggal mulai" showIcon iconDisplay="input" class="filter-date" @date-select="onManualDateChange" />
        <span class="filter-sep">—</span>
        <DatePicker v-model="dateEnd" dateFormat="dd M yy" placeholder="Tanggal akhir" showIcon iconDisplay="input" class="filter-date" @date-select="onManualDateChange" />
        <Button label="Terapkan" icon="pi pi-search" size="small" :loading="anyLoading" @click="applyFilter" />
      </div>
      <div class="periode-aktif-label">{{ periodeAktifLabel }}</div>
    </div>

    <!-- ══ Stat cards ══ -->
    <div class="stat-tabs-wrap">
      <Tabs v-model:value="activeStatTab">
        <TabList>
          <Tab value="penjualan"><i class="pi pi-chart-bar me-1"></i> Penjualan</Tab>
          <Tab value="kas"><i class="pi pi-wallet me-1"></i> Kas &amp; Metode Bayar</Tab>
          <Tab value="piutang"><i class="pi pi-clock me-1"></i> Piutang</Tab>
          <Tab value="saldo"><i class="pi pi-money-bill me-1"></i> Saldo Kas</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="penjualan">
            <div class="card elevation-0">
              <div class="card-body">
                <div class="stat-grid">
                  <div class="stat-tile">
                    <div class="stat-icon tone-neutral"><i class="pi pi-inbox"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalKotor) }}</div>
                      <div class="stat-label">Total Penjualan</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-info"><i class="pi pi-wallet"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalOmzet) }}</div>
                      <div class="stat-label">Omset Penjualan</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-danger"><i class="pi pi-exclamation-triangle"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalDibatalkanNilai) }}</div>
                      <div class="stat-label">Nilai Refund</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-success"><i class="pi pi-receipt"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ totalTransaksi }}</div>
                      <div class="stat-label">Jumlah Transaksi</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-danger"><i class="pi pi-replay"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ totalDibatalkanJumlah }}</div>
                      <div class="stat-label">Jumlah Transaksi Refund</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="kas">
            <div class="card elevation-0">
              <div class="card-body">
                <div class="stat-grid">
                  <div class="stat-tile">
                    <div class="stat-icon tone-info"><i class="pi pi-money-bill"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalTunai) }}</div>
                      <div class="stat-label">Total Tunai</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-success"><i class="pi pi-credit-card"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalNonTunai) }}</div>
                      <div class="stat-label">Total Non-Tunai</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-success"><i class="pi pi-plus-circle"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalPemasukanLain) }}</div>
                      <div class="stat-label">Pemasukan Lain</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-danger"><i class="pi pi-minus-circle"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalPengeluaranLain) }}</div>
                      <div class="stat-label">Pengeluaran Lain</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-danger"><i class="pi pi-truck"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalPembayaranSupplier) }}</div>
                      <div class="stat-label">Pembayaran Supplier</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="piutang">
            <div class="card elevation-0">
              <div class="card-body">
                <div class="stat-grid">
                  <div class="stat-tile">
                    <div class="stat-icon tone-warning"><i class="pi pi-clock"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalPiutangBaru) }}</div>
                      <div class="stat-label">Piutang Baru</div>
                    </div>
                  </div>
                  <div class="stat-tile">
                    <div class="stat-icon tone-info"><i class="pi pi-verified"></i></div>
                    <div class="stat-body">
                      <div class="stat-value">{{ formatRupiah(totalPembayaranPiutang) }}</div>
                      <div class="stat-label">Pembayaran Piutang</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="saldo">
            <div class="card elevation-0">
              <div class="card-body">
                <div class="saldo-kas-hero">
                  <div class="stat-icon tone-success saldo-kas-icon"><i class="pi pi-money-bill"></i></div>
                  <div>
                    <div class="saldo-kas-value">{{ formatRupiah(saldoKasBersih) }}</div>
                    <div class="stat-label">Saldo Kas Bersih</div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <Tabs v-model:value="activeMainTab">
      <TabList>
        <Tab value="ringkasan"><i class="pi pi-chart-bar me-1"></i> Ringkasan</Tab>
        <Tab value="terlaris"><i class="pi pi-star me-1"></i> Barang Terlaris</Tab>
        <Tab v-if="pakaiShift" value="shift"><i class="pi pi-history me-1"></i> Riwayat Shift</Tab>
        <Tab value="bukukas"><i class="pi pi-book me-1"></i> Buku Kas</Tab>
        <Tab value="recent"><i class="pi pi-clock me-1"></i> Transaksi Terbaru</Tab>
      </TabList>
      <TabPanels>
        <!-- ══ RINGKASAN ══ -->
        <TabPanel value="ringkasan">
          <div class="card elevation-0">
            <div class="card-body">
              <div class="chart-title">{{ periodeAktifLabel }} · {{ apiGroupBy === 'month' ? 'per bulan' : 'per hari' }}</div>
              <div v-if="loadingRingkasan" class="state-box-sm"><i class="pi pi-spin pi-spinner"></i><span>Memuat grafik...</span></div>
              <div v-else-if="ringkasanChartData.length === 0" class="state-box-sm"><i class="pi pi-chart-bar"></i><span>Tidak ada data pada rentang ini</span></div>
              <VChart v-else :option="ringkasanChartOption" autoresize style="height: 340px" />
            </div>
          </div>
          <div class="card elevation-0">
            <div class="card-body">
              <DataTable :value="ringkasanHarian" size="small" showGridlines :loading="loadingRingkasan" stripedRows>
                <Column field="TANGGAL" header="Periode" sortable footer="Total">
                  <template #body="{ data }">{{ periodeLabel(data) }}</template>
                </Column>
                <Column field="JUMLAH_TRANSAKSI" header="Jumlah Transaksi" sortable style="text-align: center" :footer="String(periodeTransaksi)" />
                <Column header="Total Tunai" sortable :footer="formatRupiah(periodeTunai)">
                  <template #body="{ data }">{{ formatRupiah(data.TOTAL_TUNAI) }}</template>
                </Column>
                <Column header="Total Non-Tunai" sortable :footer="formatRupiah(periodeNonTunai)">
                  <template #body="{ data }">{{ formatRupiah(data.TOTAL_NONTUNAI) }}</template>
                </Column>
                <Column header="Total Piutang" sortable :footer="formatRupiah(periodePiutang)">
                  <template #body="{ data }">{{ formatRupiah(data.TOTAL_PIUTANG) }}</template>
                </Column>
                <Column header="Total Omzet" sortable>
                  <template #body="{ data }"><b>{{ formatRupiah(data.TOTAL_OMZET) }}</b></template>
                  <template #footer><b>{{ formatRupiah(periodeOmzet) }}</b></template>
                </Column>
                <Column field="JUMLAH_DIBATALKAN_PENUH" header="Refund Penuh" sortable style="text-align: center" :footer="String(periodeRefundPenuh)" />
                <Column field="JUMLAH_DIBATALKAN_SEBAGIAN" header="Refund Sebagian" sortable style="text-align: center" :footer="String(periodeRefundSebagian)" />
                <Column header="Nilai Refund" sortable>
                  <template #body="{ data }"><span class="text-danger">{{ formatRupiah(data.TOTAL_DIBATALKAN) }}</span></template>
                  <template #footer><span class="text-danger">{{ formatRupiah(periodeRefundNilai) }}</span></template>
                </Column>
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- ══ BARANG TERLARIS ══ -->
        <TabPanel value="terlaris">
          <div class="card elevation-0">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <SelectButton v-model="topSellingSortBy" :options="sortByOptions" optionLabel="label" optionValue="value" @change="fetchTopSelling" />
                <div style="display: flex; align-items: center; gap: 8px">
                  <label style="font-size: 12px; color: var(--p-text-muted-color)">Tampilkan</label>
                  <Select v-model="topSellingLimit" :options="[10, 20, 50, 100, 200]" style="width: 90px" @change="fetchTopSelling" />
                </div>
              </div>
              <DataTable :value="topSelling" size="small" showGridlines stripedRows :loading="loadingTopSelling" paginator :rows="20">
                <Column header="#" style="width: 3rem; text-align: center">
                  <template #body="{ index }">{{ index + 1 }}</template>
                </Column>
                <Column field="BARCODE" header="Barcode" />
                <Column field="NAMA" header="Nama Barang" style="min-width: 14rem" />
                <Column field="TOTAL_QTY" header="Total Qty" sortable style="text-align: center" />
                <Column header="Total Nilai" sortable>
                  <template #body="{ data }"><b>{{ formatRupiah(data.TOTAL_NILAI) }}</b></template>
                </Column>
                <Column field="JUMLAH_TRANSAKSI" header="Jumlah Transaksi" sortable style="text-align: center" />
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- ══ RIWAYAT SHIFT ══ -->
        <TabPanel v-if="pakaiShift" value="shift">
          <div class="card elevation-0">
            <div class="card-body">
              <DataTable
                :value="riwayatShift"
                size="small"
                showGridlines
                stripedRows
                :loading="loadingRiwayatShift"
                paginator
                :rows="20"
                dataKey="ID"
                v-model:expandedRows="expandedShiftRows"
              >
                <Column expander style="width: 2.5rem" />
                <Column field="ID" header="ID" style="width: 4rem" />
                <Column field="IDUSER" header="Kasir" />
                <Column header="Waktu Buka">
                  <template #body="{ data }">{{ formatDateTime(data.WAKTU_BUKA) }}</template>
                </Column>
                <Column header="Waktu Tutup">
                  <template #body="{ data }">{{ data.WAKTU_TUTUP ? formatDateTime(data.WAKTU_TUTUP) : '-' }}</template>
                </Column>
                <Column header="Durasi">
                  <template #body="{ data }">{{ formatDurasiShift(data) }}</template>
                </Column>
                <Column field="JUMLAH_TRANSAKSI" header="Jml Transaksi" style="text-align: center" />
                <Column header="Selisih">
                  <template #body="{ data }">
                    <span v-if="data.SELISIH == null">-</span>
                    <b v-else :class="roundMoney(data.SELISIH) === 0 ? 'text-success' : 'text-danger'">{{ formatAngka(data.SELISIH) }}</b>
                  </template>
                </Column>
                <Column header="Status">
                  <template #body="{ data }">
                    <Tag :value="data.STATUS" :severity="data.STATUS === 'OPEN' ? 'success' : 'secondary'" />
                  </template>
                </Column>
                <template #expansion="{ data }">
                  <div class="shift-detail-grid">
                    <div><span>Modal Awal</span><b>{{ formatAngka(data.MODAL_AWAL) }}</b></div>
                    <div><span>Total Tunai</span><b>{{ formatAngka(data.TOTAL_TUNAI_LIVE) }}</b></div>
                    <div><span>Pemasukan Lain (Tunai)</span><b>{{ formatAngka(data.PEMASUKAN_LAIN_TUNAI) }}</b></div>
                    <div><span>Pengeluaran Lain (Tunai)</span><b>{{ formatAngka(data.PENGELUARAN_LAIN_TUNAI) }}</b></div>
                    <div><span>Modal Akhir</span><b>{{ data.MODAL_AKHIR != null ? formatAngka(data.MODAL_AKHIR) : '-' }}</b></div>
                    <div class="shift-detail-selisih" :class="{ 'is-zero': roundMoney(data.SELISIH) === 0 }">
                      <span>Selisih</span><b>{{ data.SELISIH == null ? '-' : formatAngka(data.SELISIH) }}</b>
                    </div>
                    <div><span>Total Non-Tunai</span><b>{{ formatAngka(data.TOTAL_NONTUNAI_LIVE) }}</b></div>
                    <div><span>Total Piutang</span><b>{{ formatAngka(data.TOTAL_PIUTANG_LIVE) }}</b></div>
                    <div><span>Refund Penuh</span><b>{{ data.JUMLAH_DIBATALKAN_PENUH }}</b></div>
                    <div><span>Refund Sebagian</span><b>{{ data.JUMLAH_DIBATALKAN_SEBAGIAN }}</b></div>
                    <div><span>Nilai Refund</span><b class="text-danger">{{ formatAngka(data.TOTAL_DIBATALKAN) }}</b></div>
                    <div v-if="data.CATATAN" class="shift-detail-catatan"><span>Catatan</span><b>{{ data.CATATAN }}</b></div>
                  </div>
                </template>
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- ══ BUKU KAS ══ -->
        <TabPanel value="bukukas">
          <div class="card elevation-0">
            <div class="card-body">
              <div class="chart-title">{{ periodeAktifLabel }} · Ledger gabungan penjualan + beban/pendapatan lain (bukan kas fisik laci)</div>
              <div class="saldo-awal-box">
                <span>Saldo Awal Periode</span>
                <b>{{ formatAngka(saldoAwalPeriode) }}</b>
              </div>
              <DataTable :value="bukuKas" size="small" showGridlines stripedRows :loading="loadingBukuKas" paginator :rows="30">
                <Column header="Tanggal" sortable field="TANGGAL">
                  <template #body="{ data }">{{ formatDateTime(data.TANGGAL) }}</template>
                </Column>
                <Column header="Tipe" field="TIPE">
                  <template #body="{ data }">
                    <Tag :value="data.TIPE === 'DEBIT' ? 'Debit' : 'Kredit'" :severity="data.TIPE === 'DEBIT' ? 'success' : 'danger'" style="font-size: 10px" />
                  </template>
                </Column>
                <Column header="Sumber" field="SUMBER">
                  <template #body="{ data }">
                    <span class="induk-chip">{{ data.SUMBER === 'PENJUALAN' ? 'Penjualan' : data.SUMBER }}</span>
                  </template>
                </Column>
                <Column field="REFERENSI" header="Referensi" />
                <Column field="KETERANGAN" header="Keterangan" style="min-width: 10rem" />
                <Column header="Jumlah" field="JUMLAH">
                  <template #body="{ data }">
                    <b :class="data.TIPE === 'DEBIT' ? 'text-success' : 'text-danger'">{{ data.TIPE === 'DEBIT' ? '' : '-' }}{{ formatAngka(data.JUMLAH) }}</b>
                  </template>
                </Column>
                <Column header="Saldo" field="SALDO">
                  <template #body="{ data }">{{ formatAngka(data.SALDO) }}</template>
                </Column>
                <template #empty>
                  <div class="state-box-sm">
                    <i class="pi pi-inbox"></i>
                    <span>Tidak ada transaksi kas pada periode ini</span>
                  </div>
                </template>
              </DataTable>
            </div>
          </div>
        </TabPanel>

        <!-- ══ TRANSAKSI TERBARU ══ -->
        <TabPanel value="recent">
          <div class="card elevation-0">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <Button icon="pi pi-refresh" label="Muat Ulang" size="small" severity="secondary" :loading="loadingRecent" @click="fetchRecentSales" />
                <div style="display: flex; align-items: center; gap: 8px">
                  <label style="font-size: 12px; color: var(--p-text-muted-color)">Tampilkan</label>
                  <Select v-model="recentLimit" :options="[20, 50, 100, 200]" style="width: 90px" @change="fetchRecentSales" />
                </div>
              </div>
              <div class="recent-grouped-wrap">
                <div v-if="loadingRecent" class="state-box-sm">
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Memuat transaksi...</span>
                </div>
                <div v-else-if="groupedReceipts.length === 0" class="state-box-sm">
                  <i class="pi pi-inbox"></i>
                  <span>Belum ada transaksi</span>
                </div>
                <div v-else class="receipt-list">
                  <div v-for="receipt in groupedReceipts" :key="receipt.RECEIPT_NO" class="receipt-card">
                    <button type="button" class="receipt-card-header" @click="toggleReceipt(receipt.RECEIPT_NO)">
                      <i class="pi" :class="isExpanded(receipt.RECEIPT_NO) ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
                      <span class="mono receipt-no">{{ receipt.RECEIPT_NO }}</span>
                      <span class="receipt-meta">{{ formatDateTime(receipt.TANGGAL) }} — {{ receipt.IDUSER }}</span>
                      <Tag v-if="receipt.voided" icon="pi pi-ban" value="Dibatalkan" severity="danger" style="font-size: 10px" />
                      <Tag v-else value="Aktif" severity="success" style="font-size: 10px" />
                      <span v-if="receipt.potongan > 0" class="receipt-potongan">Potongan {{ formatRupiah(receipt.potongan) }}</span>
                      <b class="receipt-total">{{ formatRupiah(receipt.total) }}</b>
                    </button>

                    <div v-if="isExpanded(receipt.RECEIPT_NO)" class="receipt-items-wrap">
                      <table class="receipt-items-table">
                        <thead>
                          <tr>
                            <th>Nama Barang</th>
                            <th>Barcode</th>
                            <th style="text-align: center">Qty</th>
                            <th style="text-align: right">Harga</th>
                            <th>Diskon</th>
                            <th style="text-align: right">Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="item in receipt.items" :key="item.ID_DETAIL ?? item.BARCODE + '-' + item.SUB_BARCODE">
                            <tr :class="{ 'receipt-item-voided': item.voided }">
                              <td>
                                {{ item.NAMA }}
                                <Tag v-if="item.isRacikanParent" value="Racikan" severity="help" style="font-size: 9px; margin-left: 4px" />
                              </td>
                              <td class="mono">{{ item.isRacikanParent ? '-' : item.BARCODE }}</td>
                              <td style="text-align: center">{{ item.isRacikanParent ? `${item.QTY} bks` : item.QTY }}</td>
                              <td style="text-align: right">{{ formatRupiah(item.HARGA) }}</td>
                              <td>
                                <span v-if="itemDiscount(item)" class="discount-badge">
                                  -{{ formatRupiah(itemDiscount(item).cut) }} ({{ itemDiscount(item).pct.toFixed(0) }}%)
                                </span>
                                <span v-else class="text-muted">-</span>
                              </td>
                              <td style="text-align: right"><b>{{ formatRupiah(item.TOTALAMOUNT) }}</b></td>
                              <td>
                                <Tag v-if="item.voided" value="Dibatalkan" severity="danger" style="font-size: 10px" />
                                <Tag v-else value="Aktif" severity="success" style="font-size: 10px" />
                              </td>
                            </tr>
                            <tr v-for="bahan in item.bahan" :key="bahan.ID_DETAIL" class="receipt-bahan-row">
                              <td colspan="7">— {{ bahan.NAMA }} ({{ bahan.QTY }})</td>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import Toolbar from 'primevue/toolbar'
import DatePicker from 'primevue/datepicker'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { roundMoney, formatRupiah, formatAngka, formatCompact } from './utils/format'
import { formatDateTime, formatDurasiShift, formatDateOnlyForAPI, formatTglShort, formatTglFull } from './utils/date'
import { itemDiscount } from './utils/salesCalc'
import { groupReceiptsByReceiptNo } from './utils/receiptGrouping'
import { usePosSetting } from './composables/usePosSetting'

use([CanvasRenderer, BarChart, LineChart, TooltipComponent, LegendComponent, GridComponent])

const router = useRouter()
const route = useRoute()
// Tab awal bisa dituju langsung dari halaman lain, mis. router.push('/sales/laporan?tab=bukukas')
const activeMainTab = ref(typeof route.query.tab === 'string' ? route.query.tab : 'ringkasan')
// Stat cards dikelompokkan per tab (Penjualan/Kas/Piutang/Saldo Kas) biar nggak numpuk
// jadi satu wall of cards — semua tetap ikut filter periode yang sama seperti sebelumnya.
const activeStatTab = ref('penjualan')
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, id_lokasi } = storeToRefs(authStore)
const toast = useToast()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

const groupedReceipts = computed(() => groupReceiptsByReceiptNo(recentSales.value))

const expandedReceipts = ref(new Set())
const isExpanded = (receiptNo) => expandedReceipts.value.has(receiptNo)
const toggleReceipt = (receiptNo) => {
  const next = new Set(expandedReceipts.value)
  if (next.has(receiptNo)) next.delete(receiptNo)
  else next.add(receiptNo)
  expandedReceipts.value = next
}

// "Tampilkan per" itu pilihan PERIODE LAPORAN (hari ini / minggu ini / bulan ini / tahun ini),
// bukan rentang tanggal bebas — jadi rentang tanggal SELALU dikunci ke batas periode itu (lihat
// onGroupByChange). Breakdown grafik di dalam periode pakai satuan yang lebih kecil (apiGroupBy):
// hari ini/minggu ini/bulan ini → per hari, tahun ini → per bulan. Kalau breakdown-nya ikut
// disamakan dengan periode (mis. "minggu ini" di-groupBy 'week'), semua data ke-gabung 1 batang
// (persis komplain awal) karena rentangnya emang cuma 1 minggu.
const apiGroupBy = computed(() => (ringkasanGroupBy.value === 'year' ? 'month' : 'day'))

const periodeLabel = (row) => {
  if (!row?.TANGGAL) return '-'
  if (apiGroupBy.value === 'month') {
    const d = new Date(row.TANGGAL)
    return isNaN(d.getTime()) ? row.TANGGAL : d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }
  return formatTglFull(row.TANGGAL)
}
const periodeLabelShort = (row) => {
  if (!row?.TANGGAL) return ''
  if (apiGroupBy.value === 'month') {
    const d = new Date(row.TANGGAL)
    return isNaN(d.getTime()) ? row.TANGGAL : d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
  }
  return formatTglShort(row.TANGGAL)
}

/* ══════════ Filter tanggal ══════════ */
// Nilai awal di sini cuma placeholder sebelum mount — onMounted langsung panggil
// onGroupByChange() yang mengunci ulang dateStart/dateEnd sesuai ringkasanGroupBy
// default ('day' → hari ini saja), supaya konsisten dengan tombol "Harian" yang aktif.
const now = new Date()
const dateStart = ref(new Date(now.getFullYear(), now.getMonth(), 1))
const dateEnd = ref(now)

const anyLoading = computed(
  () => loadingRingkasanKas.value || loadingRingkasan.value || loadingTopSelling.value || loadingRiwayatShift.value || loadingBukuKas.value,
)

// Label rentang tanggal yang lagi aktif, ditampilkan di atas stat cards supaya
// jelas kalau angka-angka itu bukan all-time, tapi ikut filter saat ini.
const periodeAktifLabel = computed(() => {
  const start = formatTglFull(dateStart.value)
  const end = formatTglFull(dateEnd.value)
  if (!start || !end) return ''
  return start === end ? `Periode: ${start}` : `Periode: ${start} — ${end}`
})

const applyFilter = () => {
  fetchRingkasanKas()
  fetchRingkasanHarian()
  fetchTopSelling()
  if (pakaiShift.value) fetchRiwayatShift()
  fetchBukuKas()
}

/* ══════════ Ringkasan ══════════ */
const ringkasanHarian = ref([])
const loadingRingkasan = ref(false)
const ringkasanGroupBy = ref('day')
const groupByOptions = [
  { label: 'Harian', value: 'day' },
  { label: 'Mingguan', value: 'week' },
  { label: 'Bulanan', value: 'month' },
  { label: 'Tahunan', value: 'year' },
]

// Kunci rentang tanggal ke BATAS PENUH periode yang dipilih (bukan cuma s.d. hari ini) —
// mingguan = Senin s.d. Minggu, bulanan = tanggal 1 s.d. akhir bulan, tahunan = 1 Jan s.d.
// 31 Des — supaya grafik bisa nampilin skeleton periode kosong (lihat ringkasanChartData)
// walaupun belum ada transaksi di hari/bulan yang belum lewat.
const onGroupByChange = () => {
  const now = new Date()

  switch (ringkasanGroupBy.value) {
    case 'week': {
      const day = now.getDay() // 0=Minggu..6=Sabtu
      const diffToMonday = day === 0 ? 6 : day - 1
      const monday = new Date(now)
      monday.setDate(now.getDate() - diffToMonday)
      dateStart.value = monday
      dateEnd.value = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
      break
    }
    case 'month':
      dateStart.value = new Date(now.getFullYear(), now.getMonth(), 1)
      dateEnd.value = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'year':
      dateStart.value = new Date(now.getFullYear(), 0, 1)
      dateEnd.value = new Date(now.getFullYear(), 11, 31)
      break
    default:
      dateStart.value = new Date() // hari ini saja
      dateEnd.value = new Date()
  }

  applyFilter()
}

// Kalau user ubah tanggal manual lewat DatePicker, lepas highlight preset "Tampilkan per"
// supaya nggak ada dua kontrol yang kelihatan aktif tapi ngasih rentang berbeda.
const onManualDateChange = () => {
  ringkasanGroupBy.value = null
}

const fetchRingkasanHarian = async () => {
  loadingRingkasan.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/ringkasan_harian`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        dateStart: formatDateOnlyForAPI(dateStart.value),
        dateEnd: formatDateOnlyForAPI(dateEnd.value),
        groupBy: apiGroupBy.value,
      },
    })
    // BE ngasih data terbaru dulu (DESC); grafik & tabel butuh urutan kronologis (ASC).
    ringkasanHarian.value = (data?.response ?? []).slice().sort((a, b) => new Date(a.TANGGAL) - new Date(b.TANGGAL))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat ringkasan harian', life: 4000 })
  } finally {
    loadingRingkasan.value = false
  }
}

// Ringkasan periode — dijumlah dari ringkasanHarian (breakdown per hari/bulan yang sudah ikut
// filter tanggal aktif), ditampilkan sebagai baris total di footer tabel tab "Ringkasan".
const periodeRefundNilai = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.TOTAL_DIBATALKAN) || 0), 0))
const periodeOmzet = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.TOTAL_OMZET) || 0), 0))
const periodeTunai = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.TOTAL_TUNAI) || 0), 0))
const periodeNonTunai = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.TOTAL_NONTUNAI) || 0), 0))
const periodePiutang = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.TOTAL_PIUTANG) || 0), 0))
const periodeTransaksi = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.JUMLAH_TRANSAKSI) || 0), 0))
const periodeRefundPenuh = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.JUMLAH_DIBATALKAN_PENUH) || 0), 0))
const periodeRefundSebagian = computed(() => ringkasanHarian.value.reduce((s, d) => s + (Number(d.JUMLAH_DIBATALKAN_SEBAGIAN) || 0), 0))

/* ══════════ Stat cards (ikut filter periode) ══════════ */
// Satu endpoint ringkasan_kas ngasih semua 10 angka card sekaligus untuk periode
// dateStart..dateEnd — jadi nggak perlu lagi gabungin ringkasan_harian + laba_rugi manual di FE.
const loadingRingkasanKas = ref(false)
const emptyRingkasanKas = () => ({
  TOTAL_PENJUALAN: 0,
  NILAI_REFUND: 0,
  OMSET_PENJUALAN: 0,
  PEMASUKAN_LAIN: 0,
  PENGELUARAN_LAIN: 0,
  PEMBAYARAN_SUPPLIER: 0,
  SALDO_KAS_BERSIH: 0,
  TOTAL_TUNAI: 0,
  TOTAL_NONTUNAI: 0,
  JUMLAH_TRANSAKSI: 0,
  JUMLAH_TRANSAKSI_REFUND: 0,
  TOTAL_PIUTANG_BARU: 0,
  PEMBAYARAN_PIUTANG: 0,
})
const ringkasanKas = ref(emptyRingkasanKas())

const fetchRingkasanKas = async () => {
  loadingRingkasanKas.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/ringkasan_kas`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        dateStart: formatDateOnlyForAPI(dateStart.value),
        dateEnd: formatDateOnlyForAPI(dateEnd.value),
      },
    })
    // BE endpoint lain di sini bungkus payload di { response: ... }, tapi contoh ringkasan_kas
    // yang dikasih flat (nggak dibungkus) — terima dua-duanya biar nggak kosong kalau ternyata
    // di respons asli tetap dibungkus "response".
    ringkasanKas.value = { ...emptyRingkasanKas(), ...(data?.response ?? data ?? {}) }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat ringkasan kas', life: 4000 })
  } finally {
    loadingRingkasanKas.value = false
  }
}

const totalKotor = computed(() => Number(ringkasanKas.value.TOTAL_PENJUALAN) || 0)
const totalDibatalkanNilai = computed(() => Number(ringkasanKas.value.NILAI_REFUND) || 0)
const totalOmzet = computed(() => Number(ringkasanKas.value.OMSET_PENJUALAN) || 0)
const totalPemasukanLain = computed(() => Number(ringkasanKas.value.PEMASUKAN_LAIN) || 0)
const totalPengeluaranLain = computed(() => Number(ringkasanKas.value.PENGELUARAN_LAIN) || 0)
const totalPembayaranSupplier = computed(() => Number(ringkasanKas.value.PEMBAYARAN_SUPPLIER) || 0)
// SALDO_KAS_BERSIH dihitung BE (sudah ikut kurangi PEMBAYARAN_SUPPLIER), bukan dijumlah ulang di FE.
const saldoKasBersih = computed(() => Number(ringkasanKas.value.SALDO_KAS_BERSIH) || 0)
const totalTunai = computed(() => Number(ringkasanKas.value.TOTAL_TUNAI) || 0)
const totalNonTunai = computed(() => Number(ringkasanKas.value.TOTAL_NONTUNAI) || 0)
const totalTransaksi = computed(() => Number(ringkasanKas.value.JUMLAH_TRANSAKSI) || 0)
const totalDibatalkanJumlah = computed(() => Number(ringkasanKas.value.JUMLAH_TRANSAKSI_REFUND) || 0)
const totalPiutangBaru = computed(() => Number(ringkasanKas.value.TOTAL_PIUTANG_BARU) || 0)
const totalPembayaranPiutang = computed(() => Number(ringkasanKas.value.PEMBAYARAN_PIUTANG) || 0)

const toDateKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const toMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
const emptyPeriodRow = (key) => ({
  TANGGAL: key,
  JUMLAH_TRANSAKSI: 0,
  TOTAL_TUNAI: 0,
  TOTAL_NONTUNAI: 0,
  TOTAL_OMZET: 0,
  JUMLAH_DIBATALKAN_PENUH: 0,
  JUMLAH_DIBATALKAN_SEBAGIAN: 0,
  TOTAL_DIBATALKAN: 0,
  TOTAL_KOTOR: 0,
})

// Untuk preset periode (mingguan/bulanan/tahunan) yang rentangnya sudah dikunci ke batas penuh
// periode (lihat onGroupByChange), grafik nampilin SEMUA titik periode itu (mis. Jan—Des,
// Senin—Minggu) walaupun belum ada transaksi di sana, supaya kelihatan sebagai garis tren yang
// utuh — bukan cuma titik-titik yang kebetulan ada datanya. Custom range/harian tetap sparse
// (apa adanya dari BE) karena rentangnya bisa sembarang panjang.
const ringkasanChartData = computed(() => {
  if (!['week', 'month', 'year'].includes(ringkasanGroupBy.value)) return ringkasanHarian.value

  const byKey = new Map(ringkasanHarian.value.map((row) => [String(row.TANGGAL).slice(0, 10), row]))
  const result = []

  if (apiGroupBy.value === 'month') {
    let cur = new Date(dateStart.value.getFullYear(), dateStart.value.getMonth(), 1)
    const end = new Date(dateEnd.value.getFullYear(), dateEnd.value.getMonth(), 1)
    while (cur <= end) {
      const key = toMonthKey(cur)
      result.push(byKey.get(key) || emptyPeriodRow(key))
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
    }
  } else {
    let cur = new Date(dateStart.value.getFullYear(), dateStart.value.getMonth(), dateStart.value.getDate())
    const end = new Date(dateEnd.value.getFullYear(), dateEnd.value.getMonth(), dateEnd.value.getDate())
    while (cur <= end) {
      const key = toDateKey(cur)
      result.push(byKey.get(key) || emptyPeriodRow(key))
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1)
    }
  }
  return result
})

const ringkasanChartOption = computed(() => {
  const data = ringkasanChartData.value
  const totalPerPeriode = data.map((d) => (Number(d.TOTAL_TUNAI) || 0) + (Number(d.TOTAL_NONTUNAI) || 0))
  return {
    color: ['#2a78d6', '#1baf7a', '#f2994a'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v) => formatRupiah(v),
    },
    legend: { data: ['Tunai', 'Non-Tunai', 'Tren Omzet'], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 55, right: 16, top: 20, bottom: 40, containLabel: false },
    xAxis: {
      type: 'category',
      data: data.map((d) => periodeLabelShort(d)),
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisLabel: { fontSize: 10, color: '#898781' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: '#898781', formatter: (v) => formatCompact(v) },
      splitLine: { lineStyle: { color: '#e1e0d9' } },
    },
    series: [
      { name: 'Tunai', type: 'bar', stack: 'total', data: data.map((d) => Number(d.TOTAL_TUNAI) || 0), barMaxWidth: 28 },
      {
        name: 'Non-Tunai',
        type: 'bar',
        stack: 'total',
        data: data.map((d) => Number(d.TOTAL_NONTUNAI) || 0),
        barMaxWidth: 28,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          color: '#6b6a63',
          formatter: (p) => formatCompact(totalPerPeriode[p.dataIndex] || 0),
        },
      },
      {
        name: 'Tren Omzet',
        type: 'line',
        data: totalPerPeriode,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#f2994a' },
        lineStyle: { width: 2 },
        z: 10,
      },
    ],
  }
})

/* ══════════ Buku Kas ══════════ */
// Listing mentah dari BE (terbaru dulu), termasuk SALDO per baris (saldo setelah transaksi
// itu diterapkan) — dihitung BE, ditampilkan apa adanya di FE.
const loadingBukuKas = ref(false)
const bukuKas = ref([])
const saldoAwalPeriode = ref(0)

const fetchBukuKas = async () => {
  loadingBukuKas.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/buku_kas`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        dateStart: formatDateOnlyForAPI(dateStart.value),
        dateEnd: formatDateOnlyForAPI(dateEnd.value),
      },
    })
    bukuKas.value = data?.response?.rows ?? []
    saldoAwalPeriode.value = data?.response?.SALDO_AWAL_PERIODE ?? 0
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat buku kas', life: 4000 })
  } finally {
    loadingBukuKas.value = false
  }
}

/* ══════════ Barang Terlaris ══════════ */
const topSelling = ref([])
const loadingTopSelling = ref(false)
const topSellingSortBy = ref('qty')
const topSellingLimit = ref(20)
const sortByOptions = [
  { label: 'Urutkan: Qty', value: 'qty' },
  { label: 'Urutkan: Nilai', value: 'nilai' },
]

const fetchTopSelling = async () => {
  loadingTopSelling.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/top_selling`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        dateStart: formatDateOnlyForAPI(dateStart.value),
        dateEnd: formatDateOnlyForAPI(dateEnd.value),
        sortBy: topSellingSortBy.value,
        limit: topSellingLimit.value,
      },
    })
    topSelling.value = data?.response ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat barang terlaris', life: 4000 })
  } finally {
    loadingTopSelling.value = false
  }
}

/* ══════════ Riwayat Shift ══════════ */
const riwayatShift = ref([])
const loadingRiwayatShift = ref(false)
const expandedShiftRows = ref([])

const fetchRiwayatShift = async () => {
  loadingRiwayatShift.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/riwayat_shift`, {
      params: {
        clientId: id_client.value,
        lokasiId: id_lokasi.value,
        dateStart: formatDateOnlyForAPI(dateStart.value),
        dateEnd: formatDateOnlyForAPI(dateEnd.value),
        limit: 100,
      },
    })
    riwayatShift.value = data?.response ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat riwayat shift', life: 4000 })
  } finally {
    loadingRiwayatShift.value = false
  }
}

/* ══════════ Pengaturan POS (pakai shift) ══════════ */
const { pakaiShift, fetchPosSetting } = usePosSetting(apiUrl, { id_client })

/* ══════════ Transaksi Terbaru ══════════ */
const recentSales = ref([])
const loadingRecent = ref(false)
const recentLimit = ref(50)

const fetchRecentSales = async () => {
  loadingRecent.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/recent_sales`, {
      params: { clientId: id_client.value, lokasiId: id_lokasi.value, limit: recentLimit.value },
    })
    recentSales.value = data?.response ?? []
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat transaksi terbaru', life: 4000 })
  } finally {
    loadingRecent.value = false
  }
}

onMounted(async () => {
  await fetchPosSetting()
  // Kunci dateStart/dateEnd ke "hari ini saja" dulu (sesuai ringkasanGroupBy default 'day')
  // sebelum fetch pertama — kalau nggak, tombol "Harian" kelihatan aktif tapi datanya masih
  // pakai default awal-bulan-ke-hari-ini, jadi kelihatan salah nampilin sebulan.
  onGroupByChange()
  fetchRecentSales()
})
</script>

<style scoped>
.discount-badge {
  color: var(--p-orange-600, #ea580c);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.recent-grouped-wrap {
  max-height: 65vh;
  overflow-y: auto;
}

.receipt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.receipt-card {
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 10px;
  overflow: hidden;
}

.receipt-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: var(--p-surface-0, #fff);
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.receipt-card-header:hover {
  background: var(--p-surface-50, #f8fafc);
}

.receipt-no {
  font-weight: 700;
  font-size: 13px;
}

.receipt-meta {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.receipt-potongan {
  font-size: 11px;
  color: var(--p-orange-600, #ea580c);
  font-weight: 600;
}

.receipt-total {
  margin-left: auto;
  font-size: 14px;
  white-space: nowrap;
}

.receipt-items-wrap {
  border-top: 1px solid var(--p-content-border-color, #eee);
  overflow-x: auto;
}

.receipt-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.receipt-items-table th {
  text-align: left;
  font-size: 10.5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  background: var(--p-surface-50, #f8fafc);
  padding: 6px 10px;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
  white-space: nowrap;
}

.receipt-items-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--p-content-border-color, #f1f1ee);
}

.receipt-items-table tbody tr:last-child td {
  border-bottom: none;
}

.receipt-item-voided {
  opacity: 0.55;
}

.receipt-item-voided td {
  text-decoration: line-through;
}

.receipt-bahan-row td {
  font-size: 10.5px;
  color: var(--p-text-muted-color);
  padding-left: 24px;
  background: var(--p-surface-50, #f8fafc);
}

.mono {
  font-family: ui-monospace, "Cascadia Code", "SF Mono", Menlo, Consolas, monospace;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-date {
  width: 150px;
}

.filter-sep {
  color: var(--p-text-muted-color);
}

.period-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.groupby-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.groupby-control label {
  font-size: 12px;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.periode-aktif-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--p-text-color);
}

.chart-title {
  font-size: 12px;
  color: var(--p-text-muted-color);
  margin-bottom: 8px;
}

.saldo-awal-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--p-text-color);
  background: var(--p-content-hover-background);
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.stat-tabs-wrap {
  margin-bottom: 16px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.saldo-kas-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 4px;
}

.saldo-kas-icon {
  width: 56px;
  height: 56px;
  font-size: 22px;
}

.saldo-kas-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.25;
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  background: var(--p-surface-0, #fff);
  border: 1px solid var(--p-content-border-color, #eee);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.stat-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.stat-tile-highlight {
  border-color: var(--p-green-200, #bbf7d0);
  background: var(--p-green-50, #f0fdf4);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-icon.tone-neutral {
  background: var(--p-surface-100, #f1f2f4);
  color: var(--p-text-muted-color, #6b7280);
}

.stat-icon.tone-info {
  background: var(--p-blue-50, #e7f0fd);
  color: var(--p-blue-500, #2a78d6);
}

.stat-icon.tone-success {
  background: var(--p-green-50, #e6f6ef);
  color: var(--p-green-600, #1baf7a);
}

.stat-icon.tone-danger {
  background: var(--p-red-50, #fdeceb);
  color: var(--p-red-500, #e05252);
}

.stat-icon.tone-warning {
  background: var(--p-yellow-50, #fefce8);
  color: var(--p-yellow-700, #a16207);
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  word-break: break-word;
}

.stat-label {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
}

.state-box-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 10px;
  color: var(--p-text-muted-color);
  font-size: 13px;
}

.state-box-sm i {
  font-size: 1.8rem;
  opacity: 0.4;
}

.text-success {
  color: var(--p-green-600, #16a34a);
}

.text-danger {
  color: var(--p-red-500, #ef4444);
}

.me-1 {
  margin-right: 4px;
}

.induk-chip {
  font-size: 12.5px;
  color: var(--p-text-color);
  white-space: nowrap;
}

.shift-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  padding: 10px 6px;
}

.shift-detail-grid > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: var(--p-surface-50, #f8fafc);
  border-radius: 8px;
}

.shift-detail-grid span {
  color: var(--p-text-muted-color);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.shift-detail-selisih {
  grid-column: span 2;
}

.shift-detail-selisih b {
  color: var(--p-red-500, #ef4444);
}

.shift-detail-selisih.is-zero b {
  color: var(--p-green-600, #16a34a);
}

.shift-detail-catatan {
  grid-column: 1 / -1;
}
</style>
