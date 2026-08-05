<template>
  <Toast />

  <div class="poli-anak-wrapper">
    <!-- Banner: data dari kunjungan sebelumnya -->
    <div v-if="isFromPrevVisit" class="prev-banner">
      <div class="prev-banner__icon"><i class="pi pi-history"></i></div>
      <div class="prev-banner__body">
        <span class="prev-banner__title">Data Kunjungan Sebelumnya</span>
        <span class="prev-banner__sub">
          Ditampilkan dari kunjungan <strong>{{ prevVisitDate }}</strong
          >. Simpan untuk mencatat perubahan pada kunjungan ini.
        </span>
      </div>
    </div>

    <!-- Banner: draft belum disimpan -->
    <div v-if="hasDraft" class="draft-banner">
      <div class="draft-banner__icon"><i class="pi pi-pencil"></i></div>
      <div class="draft-banner__body">
        <span class="draft-banner__title">Data belum disimpan</span>
        <span class="draft-banner__sub">
          Klik <strong>Simpan Data</strong> untuk menyimpan ke server.
        </span>
      </div>
    </div>

    <!-- Banner: sudah disimpan -->

    <!-- ═══ Panel Utama ═══ -->
    <Panel>
      <template #header>
        <div class="sec-hdr">
          <div>
            <h6 style="color: darkcyan"><strong>ANTROPOMETRI &amp; KURVA PERTUMBUHAN</strong></h6>
            <div class="sec-hdr__sub">
              Penilaian status gizi berdasarkan Standar WHO 2006 — Poli Anak
            </div>
          </div>
        </div>
      </template>
      <template #icons>
        <Button
          label="Riwayat"
          icon="pi pi-history"
          class="p-button-outlined p-button-secondary mr-2"
          size="small"
          @click="bukaRiwayat"
          :loading="riwayatLoading"
        />
        <Button
          label="Simpan Data"
          icon="pi pi-save"
          :loading="loading"
          @click="simpanData"
          class="p-button-success"
          size="small"
        />
      </template>

      <!-- Info Pasien -->
      <div class="info-pasien mb-3">
        <Tag class="mr-2" severity="info">
          <i class="pi pi-calendar mr-1"></i>
          Usia: {{ usiaTampil }}
        </Tag>
        <Tag class="mr-2" :severity="genderPasien === 'L' ? 'secondary' : 'contrast'">
          <i :class="genderPasien === 'L' ? 'pi pi-mars mr-1' : 'pi pi-venus mr-1'"></i>
          {{ genderPasien === 'L' ? 'Laki-laki' : 'Perempuan' }}
        </Tag>
        <Tag severity="warn" v-if="usiaBulan > 60">
          <i class="pi pi-exclamation-triangle mr-1"></i>
          Usia &gt; 60 bulan — referensi WHO 0–5 tahun
        </Tag>
      </div>

      <!-- ═══ Section 1: Pengukuran Antropometri ═══ -->
      <Panel class="section-panel">
        <template #header>
          <span class="section-title">
            <i class="pi pi-ruler mr-2"></i>Pengukuran Antropometri
          </span>
        </template>

        <div class="row g-3">
          <!-- BB -->
          <div class="col-md-4 col-lg-2">
            <label class="form-label field-label">Berat Badan (kg)</label>
            <InputGroup>
              <InputNumber
                v-model="form.bb"
                :min="0"
                :max="200"
                :minFractionDigits="1"
                :maxFractionDigits="2"
                placeholder="0.0"
                class="w-full"
                @update:modelValue="onMeasurementChange"
              />
              <InputGroupAddon>kg</InputGroupAddon>
            </InputGroup>
            <small v-if="beratBadanSynced" class="synced-hint">
              <i class="pi pi-link"></i> dari form pemeriksaan
            </small>
          </div>

          <!-- TB/PB dengan toggle -->
          <div class="col-md-4 col-lg-3">
            <label class="form-label field-label">
              {{ usiaBulan < 24 ? 'Panjang Badan (cm)' : 'Tinggi Badan (cm)' }}
              <Tag
                :severity="usiaBulan < 24 ? 'info' : 'success'"
                style="font-size: 0.65rem; padding: 1px 5px"
              >
                {{ usiaBulan < 24 ? 'Berbaring' : 'Berdiri' }}
              </Tag>
            </label>
            <InputGroup>
              <InputNumber
                v-model="form.tb"
                :min="0"
                :max="250"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                placeholder="0.0"
                class="w-full"
                @update:modelValue="onMeasurementChange"
              />
              <InputGroupAddon>cm</InputGroupAddon>
            </InputGroup>
            <small v-if="tinggiBadanSynced" class="synced-hint">
              <i class="pi pi-link"></i> dari form pemeriksaan
            </small>
          </div>

          <!-- LK -->
          <div class="col-md-4 col-lg-2">
            <label class="form-label field-label">Lingkar Kepala (cm)</label>
            <InputGroup>
              <InputNumber
                v-model="form.lk"
                :min="0"
                :max="100"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                placeholder="0.0"
                class="w-full"
                @update:modelValue="onMeasurementChange"
              />
              <InputGroupAddon>cm</InputGroupAddon>
            </InputGroup>
          </div>

          <!-- LILA -->
          <div class="col-md-4 col-lg-2">
            <label class="form-label field-label">LILA (cm)</label>
            <InputGroup>
              <InputNumber
                v-model="form.lila"
                :min="0"
                :max="60"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                placeholder="0.0"
                class="w-full"
              />
              <InputGroupAddon>cm</InputGroupAddon>
            </InputGroup>
          </div>

          <!-- Lingkar Dada -->
          <div class="col-md-4 col-lg-2">
            <label class="form-label field-label">Lingkar Dada (cm)</label>
            <InputGroup>
              <InputNumber
                v-model="form.lingkarDada"
                :min="0"
                :max="120"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                placeholder="0.0"
                class="w-full"
              />
              <InputGroupAddon>cm</InputGroupAddon>
            </InputGroup>
          </div>

          <!-- Lingkar Perut -->
          <div class="col-md-4 col-lg-2">
            <label class="form-label field-label">Lingkar Perut (cm)</label>
            <InputGroup>
              <InputNumber
                v-model="form.lingkarPerut"
                :min="0"
                :max="150"
                :minFractionDigits="1"
                :maxFractionDigits="1"
                placeholder="0.0"
                class="w-full"
              />
              <InputGroupAddon>cm</InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </Panel>

      <!-- ═══ Section 2: Hasil Kalkulasi & Status Gizi ═══ -->
      <div class="row mt-3">
        <!-- IMT Card -->
        <div class="col-md-3">
          <div class="imt-card">
            <div class="imt-card__label">Indeks Massa Tubuh (IMT)</div>
            <div class="imt-card__value" :style="{ color: imtColor }">
              {{ imtValue !== null ? imtValue.toFixed(2) : '—' }}
            </div>
            <div class="imt-card__unit">kg/m²</div>
            <div class="imt-card__formula">BB / (TB/100)²</div>
          </div>
        </div>

        <!-- Status Gizi Cards -->
        <div class="col-md-9">
          <div class="row g-2">
            <div class="col-md-3" v-for="item in statusGizi" :key="item.label">
              <div class="status-card" :class="item.colorClass">
                <div class="status-card__title">{{ item.label }}</div>
                <div class="status-card__zscore">
                  Z = {{ item.z !== null ? item.z.toFixed(2) : '—' }}
                </div>
                <div class="status-card__status">{{ item.status }}</div>
                <div class="status-card__value" v-if="item.value !== null">
                  {{ item.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Section 3: Kurva Pertumbuhan ═══ -->
      <Panel class="section-panel mt-3">
        <template #header>
          <span class="section-title">
            <i class="pi pi-chart-line mr-2"></i>Kurva Pertumbuhan WHO 2006
          </span>
        </template>

        <Tabs v-model:value="activeChartTab">
          <TabList>
            <Tab value="bbu">BB/U — Berat Badan/Umur</Tab>
            <Tab value="tbu">TB/U — Tinggi/Umur</Tab>
            <Tab value="lku" v-if="usiaBulan <= 60">LK/U — Lingkar Kepala/Umur</Tab>
            <Tab value="imtu">IMT/U — IMT/Umur</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="bbu">
              <div class="chart-legend">
                <span class="legend-item p97">P97</span>
                <span class="legend-item p50">P50 (Median)</span>
                <span class="legend-item p3">P3</span>
                <span class="legend-item pasien">Pasien</span>
              </div>
              <VChart
                v-if="activeChartTab === 'bbu'"
                :option="chartBBU"
                autoresize
                style="height: 360px"
              />
            </TabPanel>
            <TabPanel value="tbu">
              <div class="chart-legend">
                <span class="legend-item p97">P97</span>
                <span class="legend-item p50">P50 (Median)</span>
                <span class="legend-item p3">P3</span>
                <span class="legend-item pasien">Pasien</span>
              </div>
              <VChart
                v-if="activeChartTab === 'tbu'"
                :option="chartTBU"
                autoresize
                style="height: 360px"
              />
            </TabPanel>
            <TabPanel value="lku">
              <div class="chart-legend">
                <span class="legend-item p97">P97</span>
                <span class="legend-item p50">P50 (Median)</span>
                <span class="legend-item p3">P3</span>
                <span class="legend-item pasien">Pasien</span>
              </div>
              <VChart
                v-if="activeChartTab === 'lku'"
                :option="chartLKU"
                autoresize
                style="height: 360px"
              />
            </TabPanel>
            <TabPanel value="imtu">
              <div class="chart-legend">
                <span class="legend-item p97">P97</span>
                <span class="legend-item p50">P50 (Median)</span>
                <span class="legend-item p3">P3</span>
                <span class="legend-item pasien">Pasien</span>
              </div>
              <VChart
                v-if="activeChartTab === 'imtu'"
                :option="chartIMTU"
                autoresize
                style="height: 360px"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Panel>

      <!-- ═══ Section 4: Catatan Klinis & Simpan ═══ -->
      <Panel class="section-panel mt-3">
        <template #header>
          <span class="section-title"><i class="pi pi-file-edit mr-2"></i>Catatan Klinis</span>
        </template>
        <Textarea
          v-model="form.catatan"
          rows="3"
          class="w-full"
          placeholder="Catatan tambahan, rekomendasi, atau interpretasi klinis..."
          autoResize
        />
        <div class="mt-3 d-flex justify-content-end">
          <Button
            label="Simpan Data Antropometri"
            icon="pi pi-save"
            :loading="loading"
            @click="simpanData"
            class="p-button-success"
          />
        </div>
      </Panel>
    </Panel>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- Dialog: Riwayat & Perbandingan                                 -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <Dialog
      v-model:visible="showRiwayat"
      modal
      :style="{ width: '92vw', maxWidth: '1200px' }"
      :breakpoints="{ '960px': '95vw' }"
      :closable="true"
      header="Riwayat Antropometri & Perbandingan"
    >
      <Tabs v-model:value="riwayatTab">
        <TabList>
          <Tab value="list">
            <i class="pi pi-list mr-1"></i>
            Daftar Kunjungan
            <Badge
              v-if="riwayatList.length"
              :value="riwayatList.length"
              class="ml-2"
              severity="info"
            />
          </Tab>
          <Tab value="compare" :disabled="selectedVisits.length < 2">
            <i class="pi pi-objects-column mr-1"></i>
            Perbandingan
            <Badge
              v-if="selectedVisits.length >= 2"
              :value="selectedVisits.length"
              class="ml-2"
              severity="warn"
            />
          </Tab>
          <Tab value="tren">
            <i class="pi pi-chart-line mr-1"></i>
            Tren Pertumbuhan
          </Tab>
        </TabList>

        <TabPanels>
          <!-- ── Tab 1: Daftar Kunjungan ──────────────────────────── -->
          <TabPanel value="list">
            <div class="riwayat-toolbar mb-3">
              <span class="riwayat-hint">
                <i class="pi pi-info-circle mr-1"></i>
                Pilih 2–4 kunjungan untuk dibandingkan
              </span>
              <Button
                v-if="selectedVisits.length >= 2"
                label="Bandingkan Terpilih"
                icon="pi pi-objects-column"
                size="small"
                class="p-button-warning"
                @click="riwayatTab = 'compare'"
              />
            </div>

            <DataTable
              :value="riwayatList"
              v-model:selection="selectedVisits"
              dataKey="TGLREG"
              :selectionMode="null"
              size="small"
              stripedRows
              scrollable
              scrollHeight="380px"
            >
              <!-- Checkbox kolom -->
              <Column style="width: 50px; text-align: center">
                <template #header>
                  <span style="font-size: 0.75rem">Pilih</span>
                </template>
                <template #body="{ data }">
                  <Checkbox
                    :modelValue="isSelected(data)"
                    @change="toggleSelect(data)"
                    :binary="true"
                    :disabled="!isSelected(data) && selectedVisits.length >= 4"
                  />
                </template>
              </Column>

              <Column header="Tanggal" style="min-width: 120px">
                <template #body="{ data }">
                  <span class="tgl-cell">{{ formatTgl(data.TGLREG) }}</span>
                </template>
              </Column>

              <Column header="BB (kg)" style="min-width: 80px">
                <template #body="{ data }">
                  <span class="num-cell">{{ data.BB ?? '—' }}</span>
                </template>
              </Column>

              <Column header="TB/PB (cm)" style="min-width: 90px">
                <template #body="{ data }">
                  <span class="num-cell">{{ data.TB ?? '—' }}</span>
                </template>
              </Column>

              <Column header="IMT" style="min-width: 70px">
                <template #body="{ data }">
                  <span class="num-cell">{{ data.IMT ?? '—' }}</span>
                </template>
              </Column>

              <Column header="LK (cm)" style="min-width: 80px">
                <template #body="{ data }">
                  <span class="num-cell">{{ data.LK ?? '—' }}</span>
                </template>
              </Column>

              <Column header="Status Gizi" style="min-width: 120px">
                <template #body="{ data }">
                  <Tag
                    :value="data.STATUS_GIZI ?? '—'"
                    :severity="statusSeverity(data.STATUS_GIZI)"
                  />
                </template>
              </Column>

              <Column header="Z BB/U" style="min-width: 75px">
                <template #body="{ data }">
                  <span :class="zClass(data.Z_BBU)">{{
                    data.Z_BBU !== null ? data.Z_BBU?.toFixed(2) : '—'
                  }}</span>
                </template>
              </Column>

              <Column header="Z TB/U" style="min-width: 75px">
                <template #body="{ data }">
                  <span :class="zClass(data.Z_TBU)">{{
                    data.Z_TBU !== null ? data.Z_TBU?.toFixed(2) : '—'
                  }}</span>
                </template>
              </Column>

              <Column header="Z IMT/U" style="min-width: 75px">
                <template #body="{ data }">
                  <span :class="zClass(data.Z_IMTU)">{{
                    data.Z_IMTU !== null ? data.Z_IMTU?.toFixed(2) : '—'
                  }}</span>
                </template>
              </Column>

              <template #empty>
                <div class="empty-state">
                  <i class="pi pi-inbox" style="font-size: 2rem; opacity: 0.4"></i>
                  <p>Belum ada riwayat kunjungan</p>
                </div>
              </template>
            </DataTable>
          </TabPanel>

          <!-- ── Tab 2: Perbandingan ───────────────────────────────── -->
          <TabPanel value="compare">
            <div v-if="selectedVisits.length < 2" class="empty-state mt-3">
              <i class="pi pi-info-circle" style="font-size: 2rem; opacity: 0.4"></i>
              <p>Pilih minimal 2 kunjungan dari tab Daftar Kunjungan</p>
            </div>

            <div v-else>
              <!-- Header kunjungan terpilih -->
              <div class="compare-header mb-3">
                <div class="compare-col compare-label-col">
                  <span class="compare-metric-title">Parameter</span>
                </div>
                <div
                  v-for="(v, i) in selectedVisitsSorted"
                  :key="i"
                  class="compare-col"
                  :style="{
                    background: visitColors[i] + '18',
                    borderTop: '3px solid ' + visitColors[i],
                  }"
                >
                  <div class="compare-visit-date">{{ formatTgl(v.TGLREG) }}</div>
                  <div class="compare-visit-label">Kunjungan {{ i + 1 }}</div>
                </div>
              </div>

              <!-- Baris perbandingan -->
              <div
                v-for="metric in compareMetrics"
                :key="metric.key"
                class="compare-row"
                :class="{ 'compare-row--divider': metric.divider }"
              >
                <div class="compare-col compare-label-col">
                  <span class="compare-metric-name">{{ metric.label }}</span>
                  <span v-if="metric.unit" class="compare-metric-unit">{{ metric.unit }}</span>
                </div>
                <div
                  v-for="(v, i) in selectedVisitsSorted"
                  :key="i"
                  class="compare-col"
                  :class="metric.colorFn ? metric.colorFn(v[metric.key]) : ''"
                >
                  <span class="compare-value">
                    {{
                      v[metric.key] !== null && v[metric.key] !== undefined
                        ? metric.fmt
                          ? metric.fmt(v[metric.key])
                          : v[metric.key]
                        : '—'
                    }}
                  </span>
                  <!-- Delta dari kunjungan sebelumnya -->
                  <span
                    v-if="
                      i > 0 &&
                      v[metric.key] !== null &&
                      selectedVisitsSorted[i - 1][metric.key] !== null
                    "
                    class="compare-delta"
                    :class="
                      deltaClass(
                        v[metric.key],
                        selectedVisitsSorted[i - 1][metric.key],
                        metric.positiveIsGood,
                      )
                    "
                  >
                    {{ deltaLabel(v[metric.key], selectedVisitsSorted[i - 1][metric.key]) }}
                  </span>
                </div>
              </div>
            </div>
          </TabPanel>

          <!-- ── Tab 3: Tren Pertumbuhan ──────────────────────────── -->
          <TabPanel value="tren">
            <div class="tren-toolbar mb-3">
              <span class="tren-label">Tampilkan:</span>
              <div class="tren-btns">
                <Button
                  v-for="opt in trenOptions"
                  :key="opt.key"
                  :label="opt.label"
                  size="small"
                  :class="[
                    'mr-1',
                    activeTren === opt.key ? 'p-button-primary' : 'p-button-outlined',
                  ]"
                  @click="activeTren = opt.key"
                />
              </div>
            </div>
            <VChart
              v-if="riwayatTab === 'tren'"
              :option="chartTren"
              autoresize
              style="height: 420px"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import Toast from 'primevue/toast'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Checkbox from 'primevue/checkbox'
import Badge from 'primevue/badge'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

use([
  CanvasRenderer,
  LineChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
])

const props = defineProps({
  datapasien: { type: Object, default: null },
  beratBadan: { type: Number, default: null },
  tinggiBadan: { type: Number, default: null },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_name } = storeToRefs(authStore)
const toast = useToast()

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const isFromPrevVisit = ref(false)
const hasDraft = ref(false)
const lastSaved = ref(null)
const prevVisitDate = ref(null)
const activeChartTab = ref('bbu')

const form = ref({
  bb: null,
  tb: null,
  lk: null,
  lila: null,
  lingkarDada: null,
  lingkarPerut: null,
  catatan: '',
})

// ── Helpers pasien ─────────────────────────────────────────────────────────────
const usiaBulan = computed(() => {
  if (!props.datapasien?.TGLLAHIR) return 0
  const tgl = new Date(props.datapasien.TGLLAHIR)
  const now = new Date()
  return (now.getFullYear() - tgl.getFullYear()) * 12 + (now.getMonth() - tgl.getMonth())
})

const usiaTampil = computed(() => {
  const total = usiaBulan.value
  const thn = Math.floor(total / 12)
  const bln = total % 12
  if (thn === 0) return `${bln} bulan`
  if (bln === 0) return `${thn} tahun`
  return `${thn} tahun ${bln} bulan`
})

const genderPasien = computed(() => props.datapasien?.JENISKELAMIN ?? 'L')

const beratBadanSynced = computed(() => props.beratBadan && form.value.bb === props.beratBadan)
const tinggiBadanSynced = computed(() => props.tinggiBadan && form.value.tb === props.tinggiBadan)

// ── IMT ────────────────────────────────────────────────────────────────────────
const imtValue = computed(() => {
  if (!form.value.bb || !form.value.tb || form.value.tb === 0) return null
  return form.value.bb / Math.pow(form.value.tb / 100, 2)
})

const imtColor = computed(() => {
  const v = imtValue.value
  if (v === null) return '#6c757d'
  if (v < 14) return '#dc3545'
  if (v < 18.5) return '#fd7e14'
  if (v < 25) return '#198754'
  if (v < 30) return '#fd7e14'
  return '#dc3545'
})

// ══════════════════════════════════════════════════════════════════════════════
// Referensi WHO 2006 (usia 0–60 bulan)
// Sumber: WHO Child Growth Standards 2006
// ══════════════════════════════════════════════════════════════════════════════
const WHO_AGES = [0, 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60]
const WHO_LK_AGES = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]

const WHO = {
  bb: {
    L: {
      p3: [2.5, 5.0, 6.4, 7.2, 7.9, 8.5, 9.0, 9.5, 9.9, 10.7, 11.4, 12.1, 12.7, 13.3, 13.9],
      p50: [3.3, 6.4, 7.9, 8.9, 9.6, 10.3, 10.9, 11.5, 12.2, 13.3, 14.3, 15.3, 16.3, 17.3, 18.3],
      p97: [4.4, 8.0, 9.8, 11.0, 12.0, 12.8, 13.7, 14.7, 15.3, 17.0, 18.3, 19.8, 21.2, 22.7, 24.2],
    },
    P: {
      p3: [2.4, 4.6, 5.8, 6.6, 7.2, 7.8, 8.2, 8.7, 9.1, 9.8, 10.4, 11.0, 11.6, 12.2, 12.7],
      p50: [3.2, 5.8, 7.3, 8.2, 8.9, 9.6, 10.2, 10.9, 11.5, 12.5, 13.9, 14.7, 15.5, 16.3, 17.2],
      p97: [4.2, 7.5, 9.3, 10.5, 11.5, 12.4, 13.2, 14.1, 15.0, 16.4, 17.7, 19.1, 20.5, 21.9, 23.4],
    },
  },
  tb: {
    L: {
      p3: [
        46.1, 57.3, 63.3, 67.5, 71.0, 73.8, 76.0, 78.2, 80.2, 83.6, 86.4, 89.2, 91.9, 94.4, 96.7,
      ],
      p50: [
        49.9, 61.4, 67.6, 72.0, 75.7, 79.1, 82.3, 85.1, 87.8, 92.7, 96.1, 99.3, 102.3, 105.1, 107.7,
      ],
      p97: [
        53.4, 65.5, 71.9, 76.5, 80.5, 84.2, 87.7, 90.7, 94.0, 99.0, 102.7, 106.4, 109.4, 112.3,
        115.4,
      ],
    },
    P: {
      p3: [
        45.4, 55.6, 61.2, 65.3, 68.7, 71.5, 73.7, 76.0, 78.0, 81.7, 84.7, 87.5, 90.2, 92.7, 95.2,
      ],
      p50: [
        49.1, 59.8, 65.7, 70.1, 74.0, 77.5, 80.7, 83.7, 86.4, 91.2, 95.1, 98.7, 101.8, 105.0, 107.8,
      ],
      p97: [
        52.9, 63.9, 69.8, 74.5, 78.4, 82.0, 85.8, 89.1, 92.1, 97.3, 101.6, 105.3, 108.6, 112.1,
        115.5,
      ],
    },
  },
  lk: {
    L: {
      p3: [32.1, 38.6, 41.5, 43.5, 44.9, 45.7, 46.4, 47.0, 47.5, 47.9, 48.4, 48.8, 49.0],
      p50: [34.5, 40.5, 43.3, 45.3, 46.8, 47.7, 48.4, 49.0, 49.5, 50.0, 50.4, 50.8, 51.0],
      p97: [36.9, 42.4, 45.2, 47.1, 48.6, 49.6, 50.3, 51.0, 51.5, 51.9, 52.4, 52.8, 53.1],
    },
    P: {
      p3: [31.7, 37.3, 40.2, 42.2, 43.5, 44.4, 45.1, 45.7, 46.2, 46.7, 47.1, 47.4, 47.7],
      p50: [33.9, 39.5, 42.2, 44.2, 45.8, 46.8, 47.6, 48.3, 48.8, 49.3, 49.7, 50.0, 50.3],
      p97: [36.1, 41.6, 44.2, 46.2, 47.8, 48.9, 49.9, 50.6, 51.2, 51.6, 52.0, 52.4, 52.8],
    },
  },
  imt: {
    L: {
      p3: [
        10.2, 14.0, 14.7, 15.0, 15.1, 14.9, 14.8, 14.7, 14.5, 14.2, 14.0, 14.0, 14.0, 14.1, 14.2,
      ],
      p50: [
        12.7, 16.4, 17.3, 17.5, 17.3, 17.0, 16.8, 16.6, 16.4, 16.1, 15.9, 15.8, 15.8, 15.8, 15.9,
      ],
      p97: [
        16.0, 19.9, 20.9, 21.0, 20.8, 20.5, 20.2, 20.0, 19.7, 19.1, 18.6, 18.3, 18.3, 18.4, 18.5,
      ],
    },
    P: {
      p3: [
        10.1, 13.2, 13.9, 14.3, 14.4, 14.3, 14.1, 14.0, 13.9, 13.7, 13.5, 13.5, 13.5, 13.6, 13.7,
      ],
      p50: [
        12.6, 15.6, 16.6, 17.0, 17.0, 16.8, 16.7, 16.5, 16.2, 15.9, 15.7, 15.6, 15.6, 15.7, 15.8,
      ],
      p97: [
        15.9, 19.0, 19.9, 20.2, 20.2, 20.1, 19.9, 19.7, 19.4, 19.0, 18.7, 18.4, 18.5, 18.7, 18.9,
      ],
    },
  },
}

// ── Helpers kalkulasi z-score ─────────────────────────────────────────────────
function interpolateRef(ages, values, ageMonths) {
  const clampedAge = Math.max(ages[0], Math.min(ages[ages.length - 1], ageMonths))
  for (let i = 0; i < ages.length - 1; i++) {
    if (clampedAge >= ages[i] && clampedAge <= ages[i + 1]) {
      const ratio = (clampedAge - ages[i]) / (ages[i + 1] - ages[i])
      return values[i] + ratio * (values[i + 1] - values[i])
    }
  }
  return values[values.length - 1]
}

function calcZScore(value, refData, ages, ageMonths) {
  const gKey = genderPasien.value === 'P' ? 'P' : 'L'
  const p3 = interpolateRef(ages, refData[gKey].p3, ageMonths)
  const p50 = interpolateRef(ages, refData[gKey].p50, ageMonths)
  const p97 = interpolateRef(ages, refData[gKey].p97, ageMonths)
  const sd = (p97 - p3) / (2 * 1.881)
  if (sd === 0) return 0
  return (value - p50) / sd
}

// ── Status Gizi ────────────────────────────────────────────────────────────────
function bbUStatus(z) {
  if (z === null) return { label: '—', colorClass: 'status-neutral' }
  if (z < -3) return { label: 'Gizi Buruk', colorClass: 'status-danger' }
  if (z < -2) return { label: 'Gizi Kurang', colorClass: 'status-warning' }
  if (z <= 2) return { label: 'Gizi Baik', colorClass: 'status-success' }
  return { label: 'Lebih Gizi', colorClass: 'status-warning' }
}

function tbUStatus(z) {
  if (z === null) return { label: '—', colorClass: 'status-neutral' }
  if (z < -3) return { label: 'Sangat Pendek', colorClass: 'status-danger' }
  if (z < -2) return { label: 'Pendek', colorClass: 'status-warning' }
  if (z <= 3) return { label: 'Normal', colorClass: 'status-success' }
  return { label: 'Tinggi', colorClass: 'status-info' }
}

function imtUStatus(z) {
  if (z === null) return { label: '—', colorClass: 'status-neutral' }
  if (z < -3) return { label: 'Sangat Kurus', colorClass: 'status-danger' }
  if (z < -2) return { label: 'Kurus', colorClass: 'status-warning' }
  if (z <= 1) return { label: 'Normal', colorClass: 'status-success' }
  if (z <= 2) return { label: 'Berisiko Gemuk', colorClass: 'status-warning' }
  if (z <= 3) return { label: 'Gemuk', colorClass: 'status-danger' }
  return { label: 'Obesitas', colorClass: 'status-danger' }
}

function lkUStatus(z) {
  if (z === null) return { label: '—', colorClass: 'status-neutral' }
  if (z < -3) return { label: 'Mikrosefali Berat', colorClass: 'status-danger' }
  if (z < -2) return { label: 'Mikrosefali', colorClass: 'status-warning' }
  if (z <= 2) return { label: 'Normal', colorClass: 'status-success' }
  return { label: 'Makrosefali', colorClass: 'status-warning' }
}

const statusGizi = computed(() => {
  const age = usiaBulan.value
  const bb = form.value.bb
  const tb = form.value.tb
  const lk = form.value.lk
  const imt = imtValue.value

  const zBBU = bb !== null ? calcZScore(bb, WHO.bb, WHO_AGES, age) : null
  const zTBU = tb !== null ? calcZScore(tb, WHO.tb, WHO_AGES, age) : null
  const zLKU = lk !== null && age <= 36 ? calcZScore(lk, WHO.lk, WHO_LK_AGES, age) : null
  const zIMTU = imt !== null ? calcZScore(imt, WHO.imt, WHO_AGES, age) : null

  const sBBU = bbUStatus(zBBU)
  const sTBU = tbUStatus(zTBU)
  const sLKU = lkUStatus(zLKU)
  const sIMTU = imtUStatus(zIMTU)

  return [
    {
      label: 'BB/U',
      z: zBBU,
      status: sBBU.label,
      colorClass: sBBU.colorClass,
      value: bb !== null ? `${bb} kg` : null,
    },
    {
      label: 'TB/U',
      z: zTBU,
      status: sTBU.label,
      colorClass: sTBU.colorClass,
      value: tb !== null ? `${tb} cm` : null,
    },
    {
      label: 'LK/U',
      z: zLKU,
      status: age > 36 ? 'Usia > 36 bln' : sLKU.label,
      colorClass: age > 36 ? 'status-neutral' : sLKU.colorClass,
      value: lk !== null ? `${lk} cm` : null,
    },
    {
      label: 'IMT/U',
      z: zIMTU,
      status: sIMTU.label,
      colorClass: sIMTU.colorClass,
      value: imt !== null ? `${imt.toFixed(2)} kg/m²` : null,
    },
  ]
})

// ── Chart builder ─────────────────────────────────────────────────────────────
function buildChart(ages, refData, patientAge, patientVal, yName, yUnit) {
  const gKey = genderPasien.value === 'P' ? 'P' : 'L'
  const zippedP3 = ages.map((a, i) => [a, refData[gKey].p3[i]])
  const zippedP50 = ages.map((a, i) => [a, refData[gKey].p50[i]])
  const zippedP97 = ages.map((a, i) => [a, refData[gKey].p97[i]])

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let out = `<b>Usia ${params[0].data[0]} bulan</b><br/>`
        params.forEach((p) => {
          out += `${p.marker}${p.seriesName}: <b>${p.data[1]} ${yUnit}</b><br/>`
        })
        return out
      },
    },
    legend: { top: 5, textStyle: { fontSize: 11 } },
    grid: { left: '8%', right: '4%', bottom: '10%', top: '15%' },
    xAxis: {
      type: 'value',
      name: 'Usia (bulan)',
      nameLocation: 'middle',
      nameGap: 25,
      min: 0,
      max: ages[ages.length - 1],
      splitLine: { lineStyle: { type: 'dashed', color: '#e0e0e0' } },
    },
    yAxis: {
      type: 'value',
      name: `${yName} (${yUnit})`,
      nameLocation: 'middle',
      nameGap: 45,
      splitLine: { lineStyle: { type: 'dashed', color: '#e0e0e0' } },
    },
    series: [
      {
        name: 'P97',
        type: 'line',
        data: zippedP97,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#dc3545', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#dc3545' },
        areaStyle: { color: 'rgba(220,53,69,0.05)', origin: 'start' },
      },
      {
        name: 'P50',
        type: 'line',
        data: zippedP50,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#198754', width: 2 },
        itemStyle: { color: '#198754' },
      },
      {
        name: 'P3',
        type: 'line',
        data: zippedP3,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#0d6efd', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#0d6efd' },
        areaStyle: { color: 'rgba(13,110,253,0.05)', origin: 'end' },
      },
      ...(patientVal !== null
        ? [
            {
              name: 'Pasien',
              type: 'scatter',
              data: [[patientAge, patientVal]],
              symbolSize: 14,
              itemStyle: { color: '#ff6f00', borderColor: '#fff', borderWidth: 2 },
              label: {
                show: true,
                formatter: `${patientVal}`,
                position: 'top',
                fontWeight: 'bold',
                color: '#ff6f00',
              },
              z: 10,
            },
          ]
        : []),
    ],
  }
}

const chartBBU = computed(() =>
  buildChart(WHO_AGES, WHO.bb, usiaBulan.value, form.value.bb, 'Berat Badan', 'kg'),
)

const chartTBU = computed(() =>
  buildChart(WHO_AGES, WHO.tb, usiaBulan.value, form.value.tb, 'Tinggi/Panjang Badan', 'cm'),
)

const chartLKU = computed(() =>
  buildChart(
    WHO_LK_AGES,
    WHO.lk,
    Math.min(usiaBulan.value, 36),
    form.value.lk,
    'Lingkar Kepala',
    'cm',
  ),
)

const chartIMTU = computed(() => {
  const imt = imtValue.value
  return buildChart(
    WHO_AGES,
    WHO.imt,
    usiaBulan.value,
    imt !== null ? parseFloat(imt.toFixed(2)) : null,
    'IMT',
    'kg/m²',
  )
})

// ── Draft auto-save ────────────────────────────────────────────────────────────
const DRAFT_KEY = computed(() => `anak_antro_draft_${props.datapasien?.NOPENDAFTARAN ?? 'tmp'}`)

function saveDraft() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  localStorage.setItem(DRAFT_KEY.value, JSON.stringify(form.value))
  hasDraft.value = true
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY.value)
  if (raw) {
    try {
      form.value = JSON.parse(raw)
      hasDraft.value = true
    } catch {
      //
    }
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY.value)
  hasDraft.value = false
}

watch(form, saveDraft, { deep: true })

watch(
  () => props.beratBadan,
  (val) => {
    if (val && !form.value.bb) form.value.bb = val
  },
  { immediate: true },
)

watch(
  () => props.tinggiBadan,
  (val) => {
    if (val && !form.value.tb) form.value.tb = val
  },
  { immediate: true },
)

function onMeasurementChange() {
  // reaktif — computed akan update otomatis
}

// ── API: load & simpan ─────────────────────────────────────────────────────────
async function loadData() {
  const url = configStore.apiBaseUrl
  const noregister = props.datapasien?.NOPENDAFTARAN
  if (!noregister) return
  try {
    const res = await axios.post(`${url}/index.php/api/polianak/get_antropometri`, {
      no_register: noregister,
    })
    if (res.data?.code === 200 && res.data.data) {
      const d = res.data.data
      form.value = {
        bb: d.BB ?? null,
        tb: d.TB ?? null,
        lk: d.LK ?? null,
        lila: d.LILA ?? null,
        lingkarDada: d.LINGKAR_DADA ?? null,
        lingkarPerut: d.LINGKAR_PERUT ?? null,
        catatan: d.CATATAN ?? '',
      }
      lastSaved.value = d.UPDATED_AT ?? null
      clearDraft()
    } else {
      // Coba muat dari kunjungan sebelumnya
      const resPrev = await axios.post(`${url}/index.php/api/polianak/get_antropometri_terakhir`, {
        nomr: props.datapasien?.NOMR,
      })
      if (resPrev.data?.code === 200 && resPrev.data.data) {
        const d = resPrev.data.data
        form.value = {
          bb: d.BB ?? null,
          tb: d.TB ?? null,
          lk: d.LK ?? null,
          lila: d.LILA ?? null,
          lingkarDada: d.LINGKAR_DADA ?? null,
          lingkarPerut: d.LINGKAR_PERUT ?? null,
          catatan: '',
        }
        isFromPrevVisit.value = true
        prevVisitDate.value = d.TGLREG ?? null
        hasDraft.value = true
      } else {
        loadDraft()
      }
    }
  } catch {
    loadDraft()
  }
}

async function simpanData() {
  if (!form.value.bb && !form.value.tb) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Isi minimal BB dan TB/PB',
      life: 3000,
    })
    return
  }
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      no_register: props.datapasien?.NOPENDAFTARAN,
      nomr: props.datapasien?.NOMR,
      id_client: id_client.value,
      user_name: user_name.value,
      bb: form.value.bb,
      tb: form.value.tb,
      lk: form.value.lk,
      lila: form.value.lila,
      lingkar_dada: form.value.lingkarDada,
      lingkar_perut: form.value.lingkarPerut,
      imt: imtValue.value !== null ? parseFloat(imtValue.value.toFixed(2)) : null,
      z_bbu: statusGizi.value[0]?.z !== null ? parseFloat(statusGizi.value[0].z.toFixed(2)) : null,
      z_tbu: statusGizi.value[1]?.z !== null ? parseFloat(statusGizi.value[1].z.toFixed(2)) : null,
      z_lku: statusGizi.value[2]?.z !== null ? parseFloat(statusGizi.value[2].z.toFixed(2)) : null,
      z_imtu: statusGizi.value[3]?.z !== null ? parseFloat(statusGizi.value[3].z.toFixed(2)) : null,
      status_gizi: statusGizi.value[0]?.status ?? null,
      catatan: form.value.catatan,
    }
    const res = await axios.post(`${url}/index.php/api/polianak/simpan_antropometri`, payload)
    if (res.data?.code === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Data antropometri tersimpan',
        life: 3000,
      })
      clearDraft()
      isFromPrevVisit.value = false
      const now = new Date()
      lastSaved.value = now.toLocaleString('id-ID')
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res.data?.message ?? 'Terjadi kesalahan',
        life: 4000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Tidak dapat terhubung ke server',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RIWAYAT & PERBANDINGAN
// ══════════════════════════════════════════════════════════════════════════════
const showRiwayat = ref(false)
const riwayatLoading = ref(false)
const riwayatList = ref([])
const selectedVisits = ref([])
const riwayatTab = ref('list')
const activeTren = ref('bbu')

const trenOptions = [
  { key: 'bbu', label: 'BB/U' },
  { key: 'tbu', label: 'TB/U' },
  { key: 'imtu', label: 'IMT/U' },
  { key: 'lku', label: 'LK/U' },
]

const visitColors = ['#2563eb', '#dc2626', '#16a34a', '#d97706']

async function bukaRiwayat() {
  showRiwayat.value = true
  if (riwayatList.value.length) return
  riwayatLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/polianak/get_riwayat`, {
      nomr: props.datapasien?.NOMR,
      id_client: id_client.value,
    })
    if (res.data?.code === 200) {
      riwayatList.value = res.data.data ?? []
    }
  } catch {
    //
  } finally {
    riwayatLoading.value = false
  }
}

function isSelected(row) {
  return selectedVisits.value.some((v) => v.TGLREG === row.TGLREG)
}

function toggleSelect(row) {
  const idx = selectedVisits.value.findIndex((v) => v.TGLREG === row.TGLREG)
  if (idx >= 0) {
    selectedVisits.value.splice(idx, 1)
  } else if (selectedVisits.value.length < 4) {
    selectedVisits.value.push(row)
  }
}

const selectedVisitsSorted = computed(() =>
  [...selectedVisits.value].sort((a, b) => new Date(a.TGLREG) - new Date(b.TGLREG)),
)

// ── Format helpers ─────────────────────────────────────────────────────────────
function formatTgl(tgl) {
  if (!tgl) return '—'
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusSeverity(s) {
  if (!s) return 'secondary'
  const v = s.toLowerCase()
  if (v.includes('buruk') || v.includes('obesitas') || v.includes('sangat')) return 'danger'
  if (v.includes('kurang') || v.includes('kurus') || v.includes('pendek') || v.includes('berisiko'))
    return 'warn'
  if (v.includes('baik') || v.includes('normal')) return 'success'
  return 'secondary'
}

function zClass(z) {
  if (z === null || z === undefined) return ''
  if (z < -2 || z > 2) return 'z-danger'
  if (z < -1 || z > 1) return 'z-warn'
  return 'z-ok'
}

function deltaLabel(curr, prev) {
  if (curr === null || prev === null) return ''
  const d = curr - prev
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(2)}`
}

function deltaClass(curr, prev, positiveIsGood = true) {
  if (curr === null || prev === null) return ''
  const d = curr - prev
  if (d === 0) return 'delta-neutral'
  const isGood = positiveIsGood ? d > 0 : d < 0
  return isGood ? 'delta-up' : 'delta-down'
}

// ── Metrics untuk tabel perbandingan ──────────────────────────────────────────
const compareMetrics = [
  { key: 'BB', label: 'Berat Badan', unit: 'kg', fmt: (v) => v?.toFixed(1), positiveIsGood: true },
  {
    key: 'TB',
    label: 'Tinggi/Panjang Badan',
    unit: 'cm',
    fmt: (v) => v?.toFixed(1),
    positiveIsGood: true,
  },
  {
    key: 'LK',
    label: 'Lingkar Kepala',
    unit: 'cm',
    fmt: (v) => v?.toFixed(1),
    positiveIsGood: true,
  },
  { key: 'LILA', label: 'LILA', unit: 'cm', fmt: (v) => v?.toFixed(1), positiveIsGood: true },
  {
    key: 'IMT',
    label: 'IMT',
    unit: 'kg/m²',
    fmt: (v) => v?.toFixed(2),
    positiveIsGood: null,
    divider: true,
  },
  {
    key: 'STATUS_GIZI',
    label: 'Status Gizi (BB/U)',
    unit: '',
    colorFn: (v) => `compare-status--${statusSeverity(v)}`,
  },
  {
    key: 'Z_BBU',
    label: 'Z-score BB/U',
    unit: 'SD',
    fmt: (v) => v?.toFixed(2),
    colorFn: (v) => zClass(v),
    positiveIsGood: null,
  },
  {
    key: 'Z_TBU',
    label: 'Z-score TB/U',
    unit: 'SD',
    fmt: (v) => v?.toFixed(2),
    colorFn: (v) => zClass(v),
    positiveIsGood: null,
  },
  {
    key: 'Z_IMTU',
    label: 'Z-score IMT/U',
    unit: 'SD',
    fmt: (v) => v?.toFixed(2),
    colorFn: (v) => zClass(v),
    positiveIsGood: null,
  },
  {
    key: 'Z_LKU',
    label: 'Z-score LK/U',
    unit: 'SD',
    fmt: (v) => v?.toFixed(2),
    colorFn: (v) => zClass(v),
    positiveIsGood: null,
  },
]

// ── Chart tren pertumbuhan ─────────────────────────────────────────────────────
const trenKeyMap = {
  bbu: { dataKey: 'BB', refData: null, ages: WHO_AGES, yName: 'Berat Badan', yUnit: 'kg' },
  tbu: { dataKey: 'TB', refData: null, ages: WHO_AGES, yName: 'Tinggi/Panjang Badan', yUnit: 'cm' },
  imtu: { dataKey: 'IMT', refData: null, ages: WHO_AGES, yName: 'IMT', yUnit: 'kg/m²' },
  lku: { dataKey: 'LK', refData: null, ages: WHO_LK_AGES, yName: 'Lingkar Kepala', yUnit: 'cm' },
}

function getPatientAgeAtVisit(tglreg) {
  if (!props.datapasien?.TGLLAHIR || !tglreg) return 0
  const lahir = new Date(props.datapasien.TGLLAHIR)
  const kunjungan = new Date(tglreg)
  return (
    (kunjungan.getFullYear() - lahir.getFullYear()) * 12 + (kunjungan.getMonth() - lahir.getMonth())
  )
}

const chartTren = computed(() => {
  const cfg = trenKeyMap[activeTren.value]
  const refMap = { bbu: WHO.bb, tbu: WHO.tb, imtu: WHO.imt, lku: WHO.lk }
  const ref = refMap[activeTren.value]
  const ages = cfg.ages
  const gKey = genderPasien.value === 'P' ? 'P' : 'L'

  const zippedP3 = ages.map((a, i) => [a, ref[gKey].p3[i]])
  const zippedP50 = ages.map((a, i) => [a, ref[gKey].p50[i]])
  const zippedP97 = ages.map((a, i) => [a, ref[gKey].p97[i]])

  // Semua titik historis pasien
  const pasienData = riwayatList.value
    .filter((r) => r[cfg.dataKey] !== null && r[cfg.dataKey] !== undefined)
    .map((r) => ({
      age: getPatientAgeAtVisit(r.TGLREG),
      val: r[cfg.dataKey],
      tgl: formatTgl(r.TGLREG),
    }))
    .sort((a, b) => a.age - b.age)

  const scatterData = pasienData.map((p) => ({
    value: [p.age, p.val],
    tgl: p.tgl,
  }))
  const lineData = pasienData.map((p) => [p.age, p.val])

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        if (params.seriesName === 'Pasien') {
          return `<b>${params.data.tgl}</b><br/>${cfg.yName}: <b>${params.data.value[1]} ${cfg.yUnit}</b><br/>Usia: ${params.data.value[0]} bln`
        }
        return `${params.marker}${params.seriesName}: <b>${params.data[1]} ${cfg.yUnit}</b>`
      },
    },
    legend: { top: 5, textStyle: { fontSize: 11 } },
    grid: { left: '8%', right: '4%', bottom: '10%', top: '15%' },
    xAxis: {
      type: 'value',
      name: 'Usia (bulan)',
      nameLocation: 'middle',
      nameGap: 25,
      min: 0,
      max: ages[ages.length - 1],
      splitLine: { lineStyle: { type: 'dashed', color: '#e0e0e0' } },
    },
    yAxis: {
      type: 'value',
      name: `${cfg.yName} (${cfg.yUnit})`,
      nameLocation: 'middle',
      nameGap: 45,
      splitLine: { lineStyle: { type: 'dashed', color: '#e0e0e0' } },
    },
    series: [
      {
        name: 'P97',
        type: 'line',
        data: zippedP97,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#dc3545', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#dc3545' },
      },
      {
        name: 'P50',
        type: 'line',
        data: zippedP50,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#198754', width: 2 },
        itemStyle: { color: '#198754' },
      },
      {
        name: 'P3',
        type: 'line',
        data: zippedP3,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#0d6efd', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#0d6efd' },
      },
      ...(lineData.length > 1
        ? [
            {
              name: 'Tren Pasien',
              type: 'line',
              data: lineData,
              smooth: false,
              symbol: 'none',
              lineStyle: { color: '#ff6f00', width: 2, type: 'solid' },
              itemStyle: { color: '#ff6f00' },
              z: 8,
            },
          ]
        : []),
      ...(scatterData.length
        ? [
            {
              name: 'Pasien',
              type: 'scatter',
              data: scatterData,
              symbolSize: 12,
              itemStyle: { color: '#ff6f00', borderColor: '#fff', borderWidth: 2 },
              label: {
                show: scatterData.length <= 6,
                formatter: (p) => p.data.value[1],
                position: 'top',
                fontWeight: 'bold',
                color: '#ff6f00',
                fontSize: 10,
              },
              z: 10,
            },
          ]
        : []),
    ],
  }
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.poli-anak-wrapper {
  padding: 0;
}

/* ── Banners ─────────────────────────────────── */
.prev-banner,
.draft-banner,
.saved-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.prev-banner {
  background: #e8f4fd;
  border: 1px solid #90caf9;
  color: #1565c0;
}
.draft-banner {
  background: #fff8e1;
  border: 1px solid #ffe082;
  color: #f57f17;
}
.saved-banner {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.prev-banner__icon,
.draft-banner__icon,
.saved-banner__icon {
  font-size: 1.4rem;
}
.prev-banner__body,
.draft-banner__body,
.saved-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prev-banner__title,
.draft-banner__title,
.saved-banner__title {
  font-weight: 600;
}
.prev-banner__sub,
.draft-banner__sub,
.saved-banner__sub {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* ── Header ──────────────────────────────────── */
.sec-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sec-hdr__icon {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  background: linear-gradient(135deg, #43a6c6 0%, #1565c0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
}
.sec-hdr__title {
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  color: #1a1a2e;
}
.sec-hdr__sub {
  font-size: 0.78rem;
  color: #64748b;
}

/* ── Info Pasien ─────────────────────────────── */
.info-pasien {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* ── Section Panel ───────────────────────────── */
.section-panel {
  border-radius: 8px;
}
.section-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
  display: flex;
  align-items: center;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: block;
}

.synced-hint {
  display: block;
  margin-top: 3px;
  font-size: 0.72rem;
  color: #0891b2;
  font-style: italic;
}

/* ── IMT Card ────────────────────────────────── */
.imt-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 4%;
  padding: 20px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}
.imt-card__label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.imt-card__value {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
}
.imt-card__unit {
  font-size: 0.8rem;
  color: #6c757d;
}
.imt-card__formula {
  font-size: 0.72rem;
  color: #9ca3af;
  font-style: italic;
}

/* ── Status Cards ────────────────────────────── */
.status-card {
  border-radius: 4px;
  padding: 14px 12px;
  text-align: center;
  border: 1px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}
.status-card__title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.75;
}
.status-card__zscore {
  font-size: 1rem;
  font-weight: 700;
  font-family: monospace;
}
.status-card__status {
  font-size: 0.82rem;
  font-weight: 600;
}
.status-card__value {
  font-size: 0.75rem;
  opacity: 0.7;
}

.status-success {
  background: #e8f5e9;
  border-color: #a5d6a7;
  color: #1b5e20;
}
.status-warning {
  background: #fff8e1;
  border-color: #ffe082;
  color: #e65100;
}
.status-danger {
  background: #ffebee;
  border-color: #ef9a9a;
  color: #b71c1c;
}
.status-info {
  background: #e3f2fd;
  border-color: #90caf9;
  color: #0d47a1;
}
.status-neutral {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #616161;
}

/* ── Chart Legend ────────────────────────────── */
.chart-legend {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  font-weight: 600;
  padding-left: 4px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-item::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 3px;
  border-radius: 2px;
}
.legend-item.p97::before {
  background: #dc3545;
}
.legend-item.p50::before {
  background: #198754;
}
.legend-item.p3::before {
  background: #0d6efd;
}
.legend-item.pasien::before {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff6f00;
}

/* ── Riwayat Dialog ──────────────────────────── */
.riwayat-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.riwayat-hint {
  font-size: 0.82rem;
  color: #64748b;
}

.tgl-cell {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}
.num-cell {
  font-family: monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Z-score coloring */
.z-ok {
  color: #15803d;
  font-weight: 700;
  font-family: monospace;
}
.z-warn {
  color: #b45309;
  font-weight: 700;
  font-family: monospace;
}
.z-danger {
  color: #b91c1c;
  font-weight: 700;
  font-family: monospace;
}

/* ── Tabel Perbandingan ──────────────────────── */
.compare-header {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}
.compare-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
}
.compare-row:hover {
  background: #f9fafb;
}
.compare-row--divider {
  border-top: 2px solid #e5e7eb;
  margin-top: 4px;
}

.compare-col {
  flex: 1;
  min-width: 120px;
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}
.compare-label-col {
  flex: 1.4;
  min-width: 150px;
  align-items: flex-start;
  background: #f8fafc;
}

.compare-metric-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
}
.compare-visit-date {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1a1a2e;
}
.compare-visit-label {
  font-size: 0.72rem;
  color: #64748b;
}
.compare-metric-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: #374151;
}
.compare-metric-unit {
  font-size: 0.72rem;
  color: #9ca3af;
}
.compare-value {
  font-size: 1rem;
  font-weight: 700;
  font-family: monospace;
}
.compare-status--success {
  background: #f0fdf4;
  color: #15803d;
}
.compare-status--warn {
  background: #fffbeb;
  color: #b45309;
}
.compare-status--danger {
  background: #fef2f2;
  color: #b91c1c;
}

/* Delta indicators */
.compare-delta {
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 4px;
  padding: 1px 5px;
}
.delta-up {
  color: #15803d;
  background: #f0fdf4;
}
.delta-down {
  color: #b91c1c;
  background: #fef2f2;
}
.delta-neutral {
  color: #6b7280;
  background: #f3f4f6;
}

/* ── Tren toolbar ────────────────────────────── */
.tren-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.tren-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
}
.tren-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* ── Empty state ─────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
</style>
