<template>
  <loading_overlay :is-loading="loadingSpinner" message="Silahkan menunggu..." />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <div class="content">
    <BannerTransaksiRanap v-if="datapasien" :datapasien="datapasien" />

    <div class="row align-items-start">
      <!-- ===== SIDEBAR KIRI — INFO PASIEN ===== -->
      <div class="col-md-2 side-sticky">
        <Panel>
          <template #header>
            <Button
              label="Kembali"
              icon="pi pi-arrow-left"
              class="btn-theme-outline"
              style="height: 30px"
              @click="goBack()"
            />
          </template>

          <img
            src="https://ws-simrs.net/ilustration/ilustrasi1.png"
            height="130"
            width="195"
            alt=""
          />
          <hr class="my-2" />

          <div class="patient-card">
            <div class="patient-name">
              <strong>{{ datapasien?.NAMAPASIEN || 'Memuat...' }}</strong>
              <i
                v-if="datapasien"
                :class="datapasien?.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
                :style="{
                  fontSize: '13px',
                  color: datapasien?.JENISKELAMIN === 'P' ? '#f472b6' : '#60a5fa',
                  marginLeft: '4px',
                }"
              />
            </div>

            <dl class="patient-details">
              <dt>Usia</dt>
              <dd>
                {{ datapasien?.USIA_PASIEN?.tahun ?? '-' }} Thn,
                {{ datapasien?.USIA_PASIEN?.bulan ?? '-' }} Bln
              </dd>
              <dt>No. MR</dt>
              <dd>{{ datapasien?.NOMR || '-' }}</dd>
              <dt>No. Register</dt>
              <dd>{{ datapasien?.NOPENDAFTARAN || '-' }}</dd>
              <dt>Ruangan</dt>
              <dd>
                <strong>{{ datapasien?.POLI || '-' }}</strong>
              </dd>
              <dt>DPJP</dt>
              <dd>{{ datapasien?.NAMADOKTER || '-' }}</dd>
              <dt>Tgl Masuk</dt>
              <dd>{{ datapasien?.MASUKPOLY || '-' }}</dd>
              <dt>Cara Bayar</dt>
              <dd>
                {{ datapasien?.CARABAYAR || '-' }}
                <span v-if="datapasien?.NOSEP" class="sep-chip-sm d-block mt-1">
                  {{ datapasien.NOSEP }}
                </span>
              </dd>
            </dl>
          </div>
        </Panel>
      </div>

      <!-- ===== KONTEN KANAN — TABEL CPPT ===== -->
      <div class="col-md-10">
        <Panel class="cppt-hero-section">
          <template #header>
            <span class="cppt-panel-title">
              <i class="fas fa-file-medical-alt mr-2"></i>
              CPPT / SOAP — Catatan Perkembangan Pasien Terintegrasi
            </span>
          </template>
          <template #icons>
            <Button
              label="+ SOAP / CPPT"
              icon="pi pi-plus"
              size="small"
              severity="info"
              class="round-button2 mr-1"
              @click="openForm(false, 0, 'CPPT')"
            />
            <Button
              label="+ SBAR"
              icon="pi pi-plus"
              size="small"
              class="round-button2"
              outlined
              @click="openForm(false, 0, 'SBAR')"
            />
          </template>

          <DataTable
            :value="fact"
            stripedRows
            showGridlines
            class="p-datatable-sm"
            scrollable
            scrollHeight="calc(100vh - 220px)"
            :rowClass="(row) => (row.id == deletingId ? 'row-deleting' : '')"
          >
            <!-- AUTH -->
            <Column header="AUTH" style="width: 80px; text-align: center">
              <template #body="{ data }">
                <span v-if="data.hasbeen_auth == 1">
                  <i class="pi pi-verified text-success" style="font-size: 1.2rem" />
                </span>
                <span v-else>
                  <Button
                    icon="pi pi-lock-open"
                    rounded
                    severity="warning"
                    size="small"
                    @click="openOtorisasi(data.id, 2)"
                  />
                </span>
                <div v-if="data.jenis_dok === 'SBAR'" class="mt-1">
                  <span class="badge-sbar">SBAR</span>
                </div>
              </template>
            </Column>

            <!-- No -->
            <Column header="No." style="width: 50px; text-align: center">
              <template #body="{ data, index }">{{ index + 1 }}</template>
            </Column>

            <!-- Waktu -->
            <Column header="Waktu" style="min-width: 120px">
              <template #body="{ data }">
                <strong>{{ data.waktu_display }}</strong>
              </template>
            </Column>

            <!-- SOAP -->
            <Column header="SOAP / SBAR" style="min-width: 300px">
              <template #body="{ data }">
                <!-- TTV -->
                <div v-if="hasTTV(data)" class="ttv-row mb-1">
                  <span v-if="+data.suhu" class="ttv-chip" :class="chipLevel('suhu', data.suhu)">
                    🌡 {{ data.suhu }}°C
                  </span>
                  <span
                    v-if="+data.sistole"
                    class="ttv-chip"
                    :class="chipLevelBP(data.sistole, data.diastole)"
                    >BP {{ data.sistole }}/{{ data.diastole }}</span
                  >
                  <span v-if="+data.nadi" class="ttv-chip" :class="chipLevel('nadi', data.nadi)">
                    ♥ {{ data.nadi }}x/m
                  </span>
                  <span v-if="+data.spo2" class="ttv-chip" :class="chipLevel('spo2', data.spo2)">
                    SpO₂ {{ data.spo2 }}%
                  </span>
                  <span
                    v-if="+data.pernafasan || +data.respirasi"
                    class="ttv-chip"
                    :class="chipLevel('rr', data.pernafasan || data.respirasi)"
                  >
                    RR {{ data.pernafasan || data.respirasi }}x/m
                  </span>
                  <span v-if="+data.gcs" class="ttv-chip" :class="chipLevel('gcs', data.gcs)">
                    GCS {{ data.gcs }}
                  </span>
                </div>
                <div>
                  <strong>{{ data.caption1 }}:</strong>
                  <span v-html="nl2br(data.subject)" class="soap-text" />
                </div>
                <div>
                  <strong>{{ data.caption2 }}:</strong>
                  <span v-html="nl2br(data.object_display || data.object)" class="soap-text" />

                  <span class="soap-text" >{{ data.object }}</span>
                </div>
                <div>
                  <strong>{{ data.caption3 }}:</strong>
                  <span v-html="nl2br(data.asessment)" class="soap-text" />
                </div>
                <div v-if="data.jenis_dok === 'CPPT'">
                  <strong>{{ data.caption4 }}:</strong>
                  <span v-html="nl2br(data.plan)" class="soap-text" />
                </div>
              </template>
            </Column>

            <!-- Instruksi / Verif -->
            <Column header="Instruksi / Verif" style="min-width: 180px">
              <template #body="{ data }">
                <div v-if="data.jenis_dok === 'SBAR'">
                  <strong>{{ data.caption4 }}:</strong>
                  <span v-html="nl2br(data.plan)" class="soap-text" />
                  <div v-if="data.verif == 0" class="mt-1">
                    <Button
                      label="Verif DPJP"
                      icon="pi pi-plus"
                      size="small"
                      text
                      @click="openOtorisasi(data.id, 21)"
                    />
                  </div>
                  <div v-else class="verif-info">
                    <i class="pi pi-verified text-success mr-1" />
                    <small>({{ data.profesi_verif }}) {{ data.verif_by_name }}</small>
                  </div>
                </div>
              </template>
            </Column>

            <!-- PPA -->
            <Column header="PPA" style="min-width: 130px">
              <template #body="{ data }">
                <small>({{ data.profesi }})<br />{{ data.verif_user_display }}</small>
              </template>
            </Column>

            <!-- Aksi -->
            <Column header="Aksi" style="width: 90px; text-align: center">
              <template #body="{ data }">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  @click="openForm(true, data.id, data.jenis_dok, data.waktu_display)"
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  @click="confirmDelete(data.id, data.waktu_display)"
                />
              </template>
            </Column>
          </DataTable>
        </Panel>

        <!-- ===== ANALISIS TREN TTV ===== -->
        <div v-if="ttvItems.length >= 2" class="ttv-trend-section mt-3">
          <div class="ttv-trend-header">
            <i class="pi pi-chart-line"></i> ANALISIS TREN TANDA-TANDA VITAL
          </div>

          <div v-if="ttvFlags.length > 0" class="ttv-flag-wrap">
            <div class="ttv-flag-title">
              <i class="pi pi-exclamation-triangle"></i> Peringatan Nilai Abnormal
            </div>
            <div class="ttv-flag-list">
              <span
                v-for="flag in ttvFlags"
                :key="flag.id + flag.param"
                class="ttv-flag-badge"
                :class="flag.level"
              >
                {{ flag.msg }} <span class="ttv-flag-time">({{ flag.waktu }})</span>
              </span>
            </div>
          </div>
          <div v-else class="ttv-flag-ok">
            <i class="pi pi-check-circle"></i> Semua nilai TTV dalam rentang normal
          </div>

          <div class="ttv-chart-wrap">
            <canvas ref="trendCanvas" style="height: 180px; width: 100%"></canvas>
          </div>

          <div v-if="shiftData.length > 0" class="ttv-shift-wrap">
            <div class="ttv-shift-title"><i class="pi pi-clock"></i> Rata-rata TTV per Shift</div>
            <table class="ttv-shift-table">
              <thead>
                <tr>
                  <th>Shift</th>
                  <th>Entri</th>
                  <th>Suhu</th>
                  <th>TD</th>
                  <th>Nadi</th>
                  <th>SpO₂</th>
                  <th>RR</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in shiftData"
                  :key="row.shift"
                  :class="'shift-' + row.shift.toLowerCase()"
                >
                  <td class="shift-name">{{ row.shift }}</td>
                  <td>{{ row.count }}</td>
                  <td :class="{ 'val-warn': row.suhuWarn }">{{ row.suhu }} °C</td>
                  <td :class="{ 'val-warn': row.tdWarn }">{{ row.td }}</td>
                  <td :class="{ 'val-warn': row.nadiWarn }">{{ row.nadi }} x/mnt</td>
                  <td :class="{ 'val-warn': row.spo2Warn }">{{ row.spo2 }} %</td>
                  <td :class="{ 'val-warn': row.rrWarn }">{{ row.rr }} x/mnt</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- /ttv-trend-section -->
      </div>
      <!-- /col-md-10 -->
    </div>
    <!-- /row -->
  </div>
  <!-- /content -->

  <!-- ===== DIALOG FORM SOAP/CPPT ===== -->
  <Dialog
    v-model:visible="showModal"
    :header="isUpdate ? 'Edit ' + form.jenis_dok : 'Pengisian ' + form.jenis_dok"
    :style="{ width: '750px' }"
    :breakpoints="{ '768px': '95vw', '480px': '100vw' }"
    :modal="true"
    :closable="true"
    :draggable="false"
  >
    <div class="form-soap">
      <!-- Tanggal & TTV -->
      <div class="form-section">
        <h6 class="section-title"><i class="fas fa-heartbeat mr-1"></i> Tanggal & Tanda Vital</h6>
        <div class="tgl-row mb-2">
          <label class="form-lbl">Tanggal / Jam</label>
          <div class="tgl-inputs">
            <input
              type="datetime-local"
              class="native-datetime"
              :value="tglsoapInput"
              @change="onTglChange"
            />
            <Button
              icon="pi pi-clock"
              label="Sekarang"
              size="small"
              severity="success"
              outlined
              @click="setNow"
            />
            <Button
              icon="pi pi-copy"
              label="SOAP Terakhir"
              size="small"
              severity="secondary"
              outlined
              :disabled="!fact.length || isUpdate"
              v-tooltip.top="'Salin isi SOAP terakhir ke form ini'"
              @click="ambilSoapTerakhir"
            />
          </div>
        </div>

        <div class="ttv-grid">
          <div class="ttv-item">
            <label class="form-lbl">Suhu</label>
            <InputNumber
              v-model="form.suhu"
              :minFractionDigits="1"
              suffix=" °C"
              :min="0"
              :max="50"
              class="w-100"
            />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">Sistole</label>
            <InputNumber v-model="form.sistole" suffix=" mmHg" :min="0" :max="300" class="w-100" />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">Diastole</label>
            <InputNumber v-model="form.diastole" suffix=" mmHg" :min="0" :max="300" class="w-100" />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">Nadi</label>
            <InputNumber v-model="form.nadi" suffix=" x/mnt" :min="0" :max="300" class="w-100" />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">Pernapasan</label>
            <InputNumber
              v-model="form.pernafasan"
              suffix=" x/mnt"
              :min="0"
              :max="100"
              class="w-100"
            />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">SPO₂</label>
            <InputNumber v-model="form.spo2" suffix=" %" :min="0" :max="100" class="w-100" />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">GCS</label>
            <InputNumber v-model="form.gcs" :min="0" :max="15" class="w-100" />
          </div>
          <div class="ttv-item">
            <label class="form-lbl">Alat Bantu Nafas</label>
            <Select
              v-model="form.alatbantu_nafasSelected"
              :options="['Ya', 'Tidak']"
              class="w-100"
            />
          </div>
        </div>
      </div>

      <Divider />

      <!-- SOAP Fields -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="fas fa-notes-medical mr-1"></i>
          {{ form.jenis_dok === 'CPPT' ? 'S · O · A · P' : 'S · B · A · R' }}
        </h6>

        <div class="mb-3">
          <label class="form-lbl">
            {{ form.jenis_dok === 'CPPT' ? 'S — Subjektif' : 'S — Situation' }}
            <small class="text-muted ml-1">{{
              form.jenis_dok === 'CPPT' ? '(Keluhan pasien)' : '(Kondisi saat ini)'
            }}</small>
          </label>
          <Textarea v-model="form.subject" :autoResize="true" rows="3" class="w-100" />
        </div>

        <div class="mb-3">
          <label class="form-lbl">
            {{ form.jenis_dok === 'CPPT' ? 'O — Objektif' : 'B — Background' }}
            <small class="text-muted ml-1">{{
              form.jenis_dok === 'CPPT' ? '(Pemeriksaan fisik)' : '(Riwayat / latar belakang)'
            }}</small>
          </label>
          <Textarea v-model="form.object" :autoResize="true" rows="3" class="w-100" />
        </div>

        <div class="mb-3">
          <label class="form-lbl">
            {{ form.jenis_dok === 'CPPT' ? 'A — Asesment' : 'A — Assessment' }}
            <small class="text-muted ml-1">(Diagnosa / penilaian)</small>
          </label>
          <Textarea v-model="form.asessment" :autoResize="true" rows="3" class="w-100" />
        </div>

        <div class="mb-3">
          <label class="form-lbl">
            {{ form.jenis_dok === 'CPPT' ? 'P — Plan' : 'R — Recommendation' }}
            <small class="text-muted ml-1">{{
              form.jenis_dok === 'CPPT' ? '(Tindak lanjut)' : '(Rekomendasi / instruksi)'
            }}</small>
          </label>
          <Textarea v-model="form.plan" :autoResize="true" rows="3" class="w-100" />
        </div>
      </div>
    </div>

    <template #footer>
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        text
        @click="showModal = false"
      />
      <Button
        :label="isUpdate ? 'Update' : 'Simpan'"
        icon="pi pi-check"
        :loading="saving"
        @click="simpan"
      />
    </template>
  </Dialog>

  <!-- ===== FORM OTORISASI TTD DIGITAL ===== -->
  <ttdUser
    v-model:showFormOtorisasi="showOtorisasi"
    :noregister="currentSoapId"
    :mode="modeOto"
    :record_id="currentSoapId"
    @otpVerified="handleOtpVerified"
  />

  <!-- ===== STICKY ACTION BAR ===== -->
  <div class="sticky-action-bar">
    <div class="sticky-bar-left">
      <span class="sticky-bar-info">
        <i class="pi pi-file-edit mr-1"></i>
        {{ fact.length }} Catatan CPPT
      </span>
    </div>
    <div class="sticky-bar-right">
      <Button
        label="+ SOAP / CPPT"
        icon="pi pi-plus"
        size="small"
        severity="info"
        class="round-button2"
        @click="openForm(false, 0, 'CPPT')"
      />
      <Button
        label="+ SBAR"
        icon="pi pi-plus"
        size="small"
        class="round-button2"
        outlined
        @click="openForm(false, 0, 'SBAR')"
      />
    </div>
  </div>

  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'
import DatePicker from 'primevue/datepicker'
import BannerTransaksiRanap from '@/components/RawatInap/BannerTransaksiRanapComponent.vue'
import ttdUser from '@/components/TtdDigitalComponent.vue'

const props = defineProps({
  noregisterProp: { type: String, default: '' },
})

const router = useRouter()
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const noregister = props.noregisterProp || route.params?.noregister || ''

// ── state ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const loadingSpinner = ref(false)
const saving = ref(false)

const fact = ref([])
const deletingId = ref(null)
const datapasien = ref(null)
const trendCanvas = ref(null)
let chartInstance = null

// ── TTV Trend ──────────────────────────────────────────────────────────────
const ttvItems = computed(() => [...fact.value.filter(hasTTV)].reverse())

const NORMAL = {
  suhu: { min: 36.0, max: 37.5, critMin: 35.0, critMax: 39.0 },
  sistole: { min: 90, max: 140, critMin: 80, critMax: 180 },
  diastole: { min: 60, max: 90, critMin: 50, critMax: 120 },
  nadi: { min: 60, max: 100, critMin: 40, critMax: 130 },
  spo2: { min: 95, max: 100, critMin: 90 },
  rr: { min: 12, max: 20, critMin: 8, critMax: 30 },
  gcs: { min: 14, max: 15, critMin: 8 },
}

const ttvFlags = computed(() => {
  const flags = []
  ttvItems.value.forEach((item) => {
    const waktu = item.waktu_display || ''
    const checks = [
      { key: 'suhu', val: Number(item.suhu), label: 'Suhu', unit: '°C' },
      { key: 'sistole', val: Number(item.sistole), label: 'Sistole', unit: ' mmHg' },
      { key: 'nadi', val: Number(item.nadi), label: 'Nadi', unit: 'x/mnt' },
      { key: 'spo2', val: Number(item.spo2), label: 'SpO₂', unit: '%' },
      {
        key: 'rr',
        val: Number(item.pernafasan || item.respirasi || 0),
        label: 'RR',
        unit: 'x/mnt',
      },
      { key: 'gcs', val: Number(item.gcs), label: 'GCS', unit: '' },
    ]
    checks.forEach(({ key, val, label, unit }) => {
      if (!val) return
      const n = NORMAL[key]
      if (!n) return
      let level = null,
        msg = ''
      if (n.critMin && val < n.critMin) {
        level = 'flag-danger'
        msg = `${label} KRITIS rendah: ${val}${unit}`
      } else if (val < n.min) {
        level = 'flag-warning'
        msg = `${label} rendah: ${val}${unit}`
      } else if (n.critMax && val > n.critMax) {
        level = 'flag-danger'
        msg = `${label} KRITIS tinggi: ${val}${unit}`
      } else if (n.max && val > n.max) {
        level = 'flag-warning'
        msg = `${label} tinggi: ${val}${unit}`
      }
      if (level) flags.push({ id: item.id, waktu, level, msg, param: key })
    })
  })
  return flags
})

const shiftData = computed(() => {
  const shifts = { Pagi: [], Sore: [], Malam: [] }
  ttvItems.value.forEach((item) => {
    const m = (item.waktu_display || '').match(/(\d{1,2}):(\d{2})/)
    const hour = m ? parseInt(m[1]) : -1
    const shift = hour >= 7 && hour < 14 ? 'Pagi' : hour >= 14 && hour < 21 ? 'Sore' : 'Malam'
    shifts[shift].push(item)
  })
  const avg = (arr, ...keys) => {
    const vals = arr.flatMap((x) => keys.map((k) => Number(x[k]))).filter((v) => v > 0)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-'
  }
  return Object.entries(shifts)
    .filter(([, items]) => items.length > 0)
    .map(([shift, items]) => {
      const suhu = avg(items, 'suhu')
      const sys = avg(items, 'sistole')
      const dia = avg(items, 'diastole')
      const nadi = avg(items, 'nadi')
      const spo2 = avg(items, 'spo2')
      const rr = avg(items, 'pernafasan', 'respirasi')
      return {
        shift,
        count: items.length,
        suhu,
        suhuWarn: suhu !== '-' && (Number(suhu) < 36.0 || Number(suhu) > 37.5),
        td: sys !== '-' ? `${sys}/${dia}` : '-',
        tdWarn: sys !== '-' && (Number(sys) < 90 || Number(sys) > 140),
        nadi,
        nadiWarn: nadi !== '-' && (Number(nadi) < 60 || Number(nadi) > 100),
        spo2,
        spo2Warn: spo2 !== '-' && Number(spo2) < 95,
        rr,
        rrWarn: rr !== '-' && (Number(rr) < 12 || Number(rr) > 20),
      }
    })
})

const buildChart = () => {
  if (!trendCanvas.value || ttvItems.value.length < 2) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  const items = ttvItems.value
  const labels = items.map((x) => {
    const m = (x.waktu_display || '').match(/(\d{1,2}\/\d{1,2})\s+(\d{1,2}:\d{2})/)
    return m ? `${m[1]} ${m[2]}` : (x.waktu_display || '').slice(0, 14)
  })
  const ds = (label, getter, color, yAxisID = 'y') => ({
    label,
    data: items.map((x) => {
      const v = Number(getter(x))
      return v > 0 ? v : null
    }),
    borderColor: color,
    backgroundColor: color + '18',
    borderWidth: 2,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0.35,
    spanGaps: true,
    yAxisID,
  })
  chartInstance = new Chart(trendCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        ds('Sistole', (x) => x.sistole, '#e53935'),
        ds('Diastole', (x) => x.diastole, '#fb8c00'),
        ds('Nadi', (x) => x.nadi, '#8e24aa'),
        ds('RR', (x) => x.pernafasan || x.respirasi || 0, '#43a047'),
        ds('GCS', (x) => x.gcs, '#00838f'),
        ds('SpO₂', (x) => x.spo2, '#1e88e5', 'y1'),
        ds('Suhu', (x) => x.suhu, '#f4511e', 'y1'),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10, padding: 6 } },
        tooltip: { bodyFont: { size: 10 }, titleFont: { size: 10 } },
      },
      scales: {
        x: { ticks: { font: { size: 9 }, maxRotation: 30 }, grid: { color: '#f0f0f0' } },
        y: {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 220,
          title: { display: true, text: 'mmHg / bpm', font: { size: 9 } },
          ticks: { font: { size: 9 } },
          grid: { color: '#efefef' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          min: 34,
          max: 100,
          title: { display: true, text: 'SpO₂(%) / Suhu(°C)', font: { size: 9 } },
          ticks: { font: { size: 9 } },
          grid: { drawOnChartArea: false },
        },
      },
    },
  })
}

const showModal = ref(false)
const showOtorisasi = ref(false)
const isUpdate = ref(false)
const currentSoapId = ref(0)
const modeOto = ref(1)

const form = ref({
  tglsoap: new Date(),
  subject: '',
  object: '',
  asessment: '',
  plan: '',
  suhu: 0,
  sistole: 0,
  diastole: 0,
  nadi: 0,
  gcs: 0,
  spo2: 0,
  pernafasan: 0,
  jenis_dok: 'CPPT',
  alatbantu_nafasSelected: 'Tidak',
})

// ── helpers ─────────────────────────────────────────────────────────────────
const goBack = () => window.close()

const baseUrl = () => configStore.apiBaseUrl

const nl2br = (text) => (text ? String(text).replace(/\n/g, '<br>') : '')

const hasTTV = (item) =>
  [item.suhu, item.sistole, item.nadi, item.spo2, item.pernafasan, item.respirasi, item.gcs].some(
    (v) => Number(v) > 0,
  )

const chipLevel = (key, val) => {
  const v = Number(val)
  if (!v) return ''
  const n = NORMAL[key]
  if (!n) return ''
  if ((n.critMin && v < n.critMin) || (n.critMax && v > n.critMax)) return 'chip-danger'
  if (v < n.min || (n.max && v > n.max)) return 'chip-warn'
  return ''
}

const chipLevelBP = (sys, dia) => {
  const s = Number(sys),
    d = Number(dia)
  if (!s && !d) return ''
  if (s > 180 || d > 120 || s < 80 || d < 50) return 'chip-danger'
  if (s > 140 || d > 90 || s < 90 || d < 60) return 'chip-warn'
  return ''
}

// "dd/MM/yyyy HH:mm" → "yyyy-MM-ddTHH:mm"
const waktuDisplayToDatetimeLocal = (str) => {
  const m = str?.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/)
  if (m)
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T${m[4].padStart(2, '0')}:${m[5]}`
  return ''
}

// Date → "yyyy-MM-ddTHH:mm"
const toDatetimeLocalStr = (d) => {
  const dt = d instanceof Date ? d : new Date(d || Date.now())
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const tglsoapInput = ref(toDatetimeLocalStr(new Date()))

const onTglChange = (e) => {
  tglsoapInput.value = e.target.value || toDatetimeLocalStr(new Date())
}

const setNow = () => {
  tglsoapInput.value = toDatetimeLocalStr(new Date())
}

const ambilSoapTerakhir = async () => {
  if (!fact.value.length) {
    toast.add({ severity: 'warn', summary: 'Perhatian', detail: 'Data SOAP belum ada', life: 3000 })
    return
  }
  const maxId = Math.max(...fact.value.map((item) => parseInt(item.id)))
  await fetchSingle(maxId)
  tglsoapInput.value = toDatetimeLocalStr(new Date())
  toast.add({
    severity: 'info',
    summary: 'Disalin',
    detail: 'Isi SOAP terakhir berhasil disalin',
    life: 2500,
  })
}

const clearForm = () => {
  tglsoapInput.value = toDatetimeLocalStr(new Date())
  form.value = {
    tglsoap: new Date(),
    subject: '',
    object: '',
    asessment: '',
    plan: '',
    suhu: 0,
    sistole: 0,
    diastole: 0,
    nadi: 0,
    gcs: 0,
    spo2: 0,
    pernafasan: 0,
    jenis_dok: 'CPPT',
    alatbantu_nafasSelected: 'Tidak',
  }
}

// ── fetch list ──────────────────────────────────────────────────────────────
const fetchData = async () => {
  fact.value = []
  loading.value = true
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/Triaseigd/get_soap`, {
      mode: 4,
      noregister,
      id_client: id_client.value,
    })
    fact.value = (res.data?.response || []).filter((x) => x.deleted != 1)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data CPPT', life: 4000 })
  } finally {
    loading.value = false
  }
}

// ── fetch single for edit ───────────────────────────────────────────────────
const fetchSingle = async (id) => {
  loadingSpinner.value = true
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/Triaseigd/get_soap`, {
      mode: 2,
      noregister,
      id_client: id_client.value,
      id,
    })
    const d = res.data?.response?.[0]
    if (d) {
      const dt = d.tglsoap ? new Date(d.tglsoap) : null
      form.value.tglsoap = dt || new Date()
      if (dt && !isNaN(dt)) tglsoapInput.value = toDatetimeLocalStr(dt)
      form.value.subject = d.subject || ''
      form.value.object = d.object || ''
      form.value.asessment = d.asessment || ''
      form.value.plan = d.plan || ''
      form.value.suhu = Number(d.suhu) || 0
      form.value.sistole = Number(d.sistole) || 0
      form.value.diastole = Number(d.diastole) || 0
      form.value.nadi = Number(d.nadi) || 0
      form.value.gcs = Number(d.gcs) || 0
      form.value.spo2 = Number(d.spo2) || 0
      form.value.pernafasan = Number(d.pernafasan || d.respirasi) || 0
      form.value.alatbantu_nafasSelected = d.alatbantu_nafas || 'Tidak'
    }
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 4000 })
  } finally {
    loadingSpinner.value = false
  }
}

// ── fetch patient ────────────────────────────────────────────────────────────
const fetchPasien = async () => {
  try {
    const res = await axios.post(`${baseUrl()}/index.php/api/transaksi_pasien/history_versi4`, {
      mod: 1,
      noregister,
      id_client: id_client.value,
    })
    datapasien.value = res.data?.response?.[0] || null
  } catch (e) {
    console.error('fetchPasien:', e)
  }
}

// ── open form dialog ─────────────────────────────────────────────────────────
const openForm = async (isEdit, id, jenisDok, waktuDisplay = '') => {
  isUpdate.value = isEdit
  currentSoapId.value = id
  if (isEdit) {
    form.value.jenis_dok = jenisDok
    tglsoapInput.value = waktuDisplay
      ? waktuDisplayToDatetimeLocal(waktuDisplay)
      : toDatetimeLocalStr(new Date())
    await fetchSingle(id)
  } else {
    clearForm()
    form.value.jenis_dok = jenisDok
  }
  showModal.value = true
}

// ── format datetime lokal (YYYY-MM-DD HH:mm:ss) ─────────────────────────────
const toLocalDatetime = (d) => {
  const dt = d instanceof Date ? d : new Date(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

// ── simpan ────────────────────────────────────────────────────────────────────
const simpan = async () => {
  saving.value = true
  try {
    const payload = {
      mode: isUpdate.value ? 2 : 1,
      noregister,
      id_client: id_client.value,
      user_id: user_id.value,
      id: currentSoapId.value,
      lokasi: 'RANAP',
      jenis_dok: form.value.jenis_dok,
      tglsoap: toLocalDatetime(tglsoapInput.value ? new Date(tglsoapInput.value) : new Date()),
      subject: form.value.subject,
      object: form.value.object,
      asessment: form.value.asessment,
      plan: form.value.plan,
      suhu: form.value.suhu,
      sistole: form.value.sistole,
      diastole: form.value.diastole,
      nadi: form.value.nadi,
      gcs: form.value.gcs,
      spo2: form.value.spo2,
      pernafasan: form.value.pernafasan,
      alatbantu_nafasSelected: form.value.alatbantu_nafasSelected,
    }
    const res = await axios.post(`${baseUrl()}/index.php/api/Triaseigd/inputsoap`, payload)
    if (res.data?.metadata?.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: res.data.metadata.message,
        life: 3000,
      })
      showModal.value = false
      await fetchData()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data?.metadata?.message || 'Gagal menyimpan',
        life: 4000,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menyimpan: ' + e.message,
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

// ── delete ────────────────────────────────────────────────────────────────────
const confirmDelete = (id, waktu) => {
  confirm.require({
    message: `Hapus catatan CPPT tanggal ${waktu}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-secondary p-button-text',
    accept: async () => {
      loadingSpinner.value = true
      try {
        const res = await axios.post(`${baseUrl()}/index.php/api/Triaseigd/hapus_soap`, {
          mode: 1,
          noregister,
          id_client: id_client.value,
          id,
          user_id: user_id.value,
        })

        console.log('delete response:', res.data)
        const code = res.data?.metadata?.code
        if (code == 200) {
          deletingId.value = id
          await new Promise((r) => setTimeout(r, 420))
          fact.value = fact.value.filter((x) => x.id != id)
          deletingId.value = null
          toast.add({
            severity: 'success',
            summary: 'Dihapus',
            detail: res.data.metadata.message || 'Catatan berhasil dihapus',
            life: 3000,
          })
        } else {
          toast.add({
            severity: 'warn',
            summary: 'Perhatian',
            detail: res.data?.metadata?.message || 'Gagal menghapus',
            life: 4000,
          })
        }
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus', life: 4000 })
      } finally {
        loadingSpinner.value = false
      }
    },
  })
}

// ── otorisasi ─────────────────────────────────────────────────────────────────
const openOtorisasi = (id, mode) => {
  currentSoapId.value = id
  modeOto.value = mode
  showOtorisasi.value = true
}

const handleOtpVerified = () => {
  fetchData()
}

watch(fact, async () => {
  await nextTick()
  buildChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

// ── mount ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  fetchPasien()
  await fetchData()
  await nextTick()
  buildChart()
})
</script>

<style scoped>
/* ===== SIDEBAR ===== */
.side-sticky {
  position: static;
  align-self: flex-start;
}

.patient-card {
  padding: 0;
}
.patient-name {
  font-size: var(--p-content-font-size, 0.8125rem);
  color: var(--p-surface-900, #1e293b);
  margin-bottom: 6px;
  line-height: 1.4;
}
.patient-details {
  margin: 0;
}
.patient-details dt {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-surface-400, #94a3b8);
  margin-top: 6px;
}
.patient-details dd {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--p-surface-900, #1e293b);
  line-height: 1.4;
}
.sep-chip-sm {
  display: inline-block;
  font-size: 0.625rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  padding: 1px 6px;
}

.btn-theme-outline {
  background: transparent !important;
  border: 1px solid darkcyan !important;
  color: darkcyan !important;
  font-size: 0.75rem;
  transition:
    background 0.15s,
    color 0.15s;
}
.btn-theme-outline:hover {
  background: rgba(0, 139, 139, 0.08) !important;
}

/* ===== HERO PANEL (main CPPT panel, like FormPoliKlinik hero-section) ===== */

:deep(.cppt-hero-section > .p-panel-header) {
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 14px;
}
:deep(.cppt-hero-section > .p-panel-content) {
  padding: 0;
  background: #fff;
}
.cppt-panel-title {
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* ===== ROUND BUTTON (like FormPoliKlinik .round-button2) ===== */
.round-button2 {
  font-size: 0.75rem !important;
  padding: 0.3rem 0.75rem !important;
  border-radius: 20px !important;
}

/* ===== STICKY ACTION BAR ===== */
.sticky-action-bar {
  position: fixed;
  bottom: 0;
  left: 250px;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-top: 2px solid #e2e8f0;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  transition: left 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.sticky-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.sticky-bar-info {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
.sticky-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ===== TABEL ===== */
.ttv-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.ttv-chip {
  background: #dde8f4;
  color: #1a3a5f;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 0.7875rem;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  transition:
    background 0.15s,
    color 0.15s;
}
.ttv-chip.chip-warn {
  background: #fef3c7;
  color: #92400e;
  border-color: #f59e0b;
}
.ttv-chip.chip-danger {
  background: #fde8e8;
  color: #b91c1c;
  border-color: #f87171;
}
.soap-text {
  font-size: 0.9rem;
  color: var(--p-surface-700, #333);
  display: block;
  margin-left: 4px;
  margin-bottom: 2px;
}
.badge-sbar {
  background: var(--p-surface-500, #6c757d);
  color: #fff;
  font-size: 0.625rem;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}
.verif-info {
  font-size: 0.6875rem;
  color: #2a6a40;
  margin-top: 4px;
}

/* ===== FORM DIALOG ===== */
.form-soap {
  padding: 4px 0;
}
.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a3a5f;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--p-surface-200, #dde8f4);
}
.form-lbl {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-surface-600, #3a5070);
  display: block;
  margin-bottom: 4px;
}
.native-datetime {
  width: 100%;
  height: 36px;
  padding: 4px 10px;
  font-size: 0.8125rem;
  border: 1px solid var(--p-surface-300, #cbd5e1);
  border-radius: 6px;
  color: var(--p-surface-900, #1e293b);
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.native-datetime:focus {
  border-color: var(--p-primary-500, #4f8f7a);
  box-shadow: 0 0 0 2px rgba(79, 143, 122, 0.18);
}

.tgl-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tgl-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tgl-inputs .native-datetime {
  flex: 1;
  min-width: 180px;
}

.ttv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 14px;
}
.ttv-item {
  display: flex;
  flex-direction: column;
}

@media (max-width: 600px) {
  .ttv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .tgl-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  .tgl-inputs .native-datetime {
    min-width: unset;
  }
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.3rem 0.6rem;
  font-size: var(--p-content-font-size, 0.75rem);
  vertical-align: top;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  padding: 0.5rem 0.6rem;
  background: #e6edf7;
  color: #162d4e;
  font-size: 0.6875rem;
  font-weight: 700;
}
:deep(.p-datatable .p-datatable-thead > tr > th),
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  font-family: var(--p-font-family, inherit);
}

.content {
  padding-bottom: 70px;
}

/* ===== TTV TREND SECTION ===== */
.ttv-trend-section {
  background: #fff;
  border: 1px solid #dde8f4;
  border-radius: 8px;
  padding: 12px 16px;
}
.ttv-trend-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a3a5f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid #dde8f4;
}
.ttv-flag-wrap {
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 10px;
}
.ttv-flag-title {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #b45309;
  margin-bottom: 6px;
}
.ttv-flag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ttv-flag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  border-radius: 4px;
  padding: 2px 8px;
}
.ttv-flag-badge.flag-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}
.ttv-flag-badge.flag-danger {
  background: #fde8e8;
  color: #b91c1c;
  border: 1px solid #f87171;
}
.ttv-flag-time {
  font-weight: 400;
  opacity: 0.75;
}
.ttv-flag-ok {
  font-size: 0.6875rem;
  color: #166534;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 6px 12px;
  margin-bottom: 10px;
}
.ttv-chart-wrap {
  position: relative;
  height: 180px;
  margin-bottom: 12px;
}
.ttv-shift-wrap {
  margin-top: 8px;
}
.ttv-shift-title {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #1a3a5f;
  margin-bottom: 6px;
}
.ttv-shift-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.6875rem;
}
.ttv-shift-table th {
  background: #e6edf7;
  color: #162d4e;
  font-weight: 700;
  padding: 5px 8px;
  text-align: center;
  border: 1px solid #c5d5e8;
}
.ttv-shift-table td {
  padding: 4px 8px;
  text-align: center;
  border: 1px solid #dde8f4;
}
.ttv-shift-table .shift-name {
  font-weight: 700;
  text-align: left;
}
.ttv-shift-table tr.shift-pagi {
  background: #fffbf0;
}
.ttv-shift-table tr.shift-sore {
  background: #f0f7ff;
}
.ttv-shift-table tr.shift-malam {
  background: #f5f0ff;
}
.val-warn {
  color: #b91c1c;
  font-weight: 700;
  background: #fef2f2;
}

:deep(.row-deleting) {
  animation: rowFadeOut 0.4s ease forwards;
  pointer-events: none;
}
@keyframes rowFadeOut {
  0% {
    opacity: 1;
    transform: translateX(0);
    background: #fde8e8;
  }
  60% {
    opacity: 0.4;
    transform: translateX(16px);
    background: #fca5a5;
  }
  100% {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>

<style>
body.sb-collapsed .sticky-action-bar {
  left: 64px;
}
@media (max-width: 768px) {
  .sticky-action-bar {
    left: 0 !important;
  }
}
</style>
