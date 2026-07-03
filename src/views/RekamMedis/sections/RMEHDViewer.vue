<template>
  <div class="hd-wrap">
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span>
      Memuat data hemodialisa...
    </div>

    <div v-else-if="!data" class="rme-empty-note">
      ℹ️ Tidak ada data hemodialisa untuk kunjungan ini.
    </div>

    <div v-else class="hd-doc">
      <!-- ══ JUDUL ══════════════════════════════════════════════════════════ -->
      <div class="hd-main-title">
        <span>LAPORAN HEMODIALISA</span>
        <span class="hd-title-meta">HD ke-{{ data.hd_ke || '-' }}</span>
      </div>

      <!-- ══ I. PRA-HEMODIALISA ════════════════════════════════════════════ -->
      <div class="rme-section-title">I &nbsp; Pengkajian Pra-Hemodialisa</div>

      <div class="hd-info-row">
        <table class="rme-tbl-info">
          <colgroup>
            <col style="width: 110px" />
            <col style="width: 10px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="rme-td-lbl">Tanggal Mulai</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                {{ data.tanggal || '-' }} &nbsp; {{ data.jam_mulai || '' }}
              </td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Tanggal Selesai</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                {{ data.tanggal_selesai || '-' }} &nbsp; {{ data.jam_selesai || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BB & Vital Pre -->
      <div class="hd-grid-4" style="margin-top: 10px">
        <div class="hd-val-box">
          <div class="hd-vb-label">BB Pre (kg)</div>
          <div class="hd-vb-val">{{ fmt1(data.bb_pre) }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">BB Post Lalu (kg)</div>
          <div class="hd-vb-val">{{ fmt1(data.bb_post_lalu) }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">BB Kering (kg)</div>
          <div class="hd-vb-val">{{ fmt1(data.bb_kering) }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Tinggi Badan (cm)</div>
          <div class="hd-vb-val">{{ data.tinggi_badan || '-' }}</div>
        </div>
      </div>

      <!-- Kalk Cards -->
      <div class="hd-grid-4" style="margin-top: 8px">
        <div class="hd-calc-card" :class="calcUF.status">
          <div class="hd-cc-label">UF Goal (L)</div>
          <div class="hd-cc-val">{{ calcUF.value }}</div>
          <div class="hd-cc-sub">BB Pre − BB Kering</div>
        </div>
        <div class="hd-calc-card" :class="calcIDWG.status">
          <div class="hd-cc-label">IDWG (kg)</div>
          <div class="hd-cc-val">{{ calcIDWG.value }}</div>
          <div class="hd-cc-sub">BB Pre − BB Post Lalu</div>
        </div>
        <div class="hd-calc-card" :class="calcIDWGPct.status">
          <div class="hd-cc-label">IDWG (%)</div>
          <div class="hd-cc-val">{{ calcIDWGPct.value }}</div>
          <div class="hd-cc-sub">{{ calcIDWGPct.sub }}</div>
        </div>
        <div class="hd-calc-card" :class="calcBMI.status">
          <div class="hd-cc-label">IMT (BMI)</div>
          <div class="hd-cc-val">{{ calcBMI.value }}</div>
          <div class="hd-cc-sub">{{ calcBMI.sub }}</div>
        </div>
      </div>

      <div class="hd-grid-3" style="margin-top: 8px">
        <div class="hd-val-box">
          <div class="hd-vb-label">TD Pre (mmHg)</div>
          <div class="hd-vb-val">{{ data.td_pre || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Nadi Pre (x/mnt)</div>
          <div class="hd-vb-val">{{ data.nadi_pre || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Suhu Pre (°C)</div>
          <div class="hd-vb-val">{{ fmt1(data.suhu_pre) }}</div>
        </div>
      </div>

      <div class="hd-info-row" style="margin-top: 8px">
        <table class="rme-tbl-info">
          <colgroup>
            <col style="width: 110px" />
            <col style="width: 10px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="rme-td-lbl">Akses Vaskuler</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ data.akses_vaskuler || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Kondisi Akses</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ data.kondisi_akses || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Keluhan Pre-HD</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ data.keluhan_pre || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══ II. INSTRUKSI MEDIS ════════════════════════════════════════════ -->
      <div class="rme-section-title" style="margin-top: 14px">
        II &nbsp; Instruksi Medis (Program Dialisis)
      </div>

      <div class="hd-grid-5" style="margin-top: 8px">
        <div class="hd-val-box">
          <div class="hd-vb-label">Durasi (Jam)</div>
          <div class="hd-vb-val">{{ data.durasi || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Dialisat</div>
          <div class="hd-vb-val">{{ data.dialisat || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Qb (ml/mnt)</div>
          <div class="hd-vb-val">{{ data.qb_instruksi || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Qd (ml/mnt)</div>
          <div class="hd-vb-val">{{ data.qd_instruksi || '-' }}</div>
        </div>
        <div class="hd-val-box hd-vb-highlight">
          <div class="hd-vb-label">UF Rate (ml/jam)</div>
          <div class="hd-vb-val">{{ calcUFRate || '-' }}</div>
        </div>
      </div>

      <div class="hd-grid-4" style="margin-top: 8px">
        <div class="hd-val-box">
          <div class="hd-vb-label">Tipe Dialyzer</div>
          <div class="hd-vb-val">{{ data.tipe_dialyzer || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Antikoagulan</div>
          <div class="hd-vb-val">{{ data.antikoagulan || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Dosis Heparin (UI)</div>
          <div class="hd-vb-val">{{ data.dosis_heparin || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Konduktivitas (mS/cm)</div>
          <div class="hd-vb-val">{{ fmt1(data.konduktivitas) }}</div>
        </div>
      </div>

      <div class="hd-info-row" style="margin-top: 8px">
        <table class="rme-tbl-info">
          <colgroup>
            <col style="width: 160px" />
            <col style="width: 10px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="rme-td-lbl">Temperatur Dialisat</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">
                {{ data.temp_dialisat ? data.temp_dialisat + ' °C' : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══ III. OBSERVASI INTRA-HD ═══════════════════════════════════════ -->
      <div class="rme-section-title" style="margin-top: 14px">
        III &nbsp; Observasi Intra-Hemodialisa
      </div>

      <table class="rme-tbl-data" style="margin-top: 8px; text-align: center">
        <thead>
          <tr>
            <th style="width: 60px">Waktu</th>
            <th>TD (mmHg)</th>
            <th>Nadi</th>
            <th>QB</th>
            <th>UF Rate</th>
            <th>TMP/VP/AP</th>
            <th>SpO2 (%)</th>
            <th>Suhu (°C)</th>
            <th style="text-align: left; min-width: 100px">Keluhan / Tindakan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in observasiRows"
            :key="i"
            :class="{ 'hd-row-pre': row.label === 'Pre', 'hd-row-post': row.label === 'Post' }"
          >
            <td class="hd-label-cell">{{ row.label }}</td>
            <td>{{ row.td || '' }}</td>
            <td>{{ row.nadi || '' }}</td>
            <td>{{ row.qb || '' }}</td>
            <td>{{ row.uf_rate || '' }}</td>
            <td>{{ row.tmp_vp_ap || '' }}</td>
            <td>{{ row.spo2 || '' }}</td>
            <td>{{ row.suhu || '' }}</td>
            <td style="text-align: left">{{ row.keluhan || '' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- ══ IV. KOMPLIKASI ════════════════════════════════════════════════ -->
      <div class="rme-section-title" style="margin-top: 14px">
        IV &nbsp; Komplikasi Intra-Hemodialisa
      </div>

      <div style="margin-top: 8px; margin-bottom: 6px">
        <span v-if="!komplikasiList.length" class="rme-empty-note" style="padding: 4px 0">—</span>
        <template v-else>
          <span
            v-for="k in komplikasiList"
            :key="k"
            class="hd-komplikasi-chip"
            :class="k === 'Tidak Ada' ? 'chip-ok' : 'chip-warn'"
            >{{ k }}</span
          >
        </template>
      </div>

      <div class="hd-info-row">
        <table class="rme-tbl-info">
          <colgroup>
            <col style="width: 140px" />
            <col style="width: 10px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="rme-td-lbl">Tindakan Komplikasi</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ data.tindakan_komplikasi || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══ V. KESEIMBANGAN CAIRAN ════════════════════════════════════════ -->
      <div class="rme-section-title" style="margin-top: 14px">V &nbsp; Keseimbangan Cairan</div>

      <div class="hd-fluid-wrapper" style="margin-top: 8px">
        <!-- Masuk -->
        <div class="hd-fluid-header hd-masuk">
          <span>▼ CAIRAN MASUK</span>
        </div>
        <div class="hd-grid-4">
          <div class="hd-val-box">
            <div class="hd-vb-label">Infus / NaCl Priming</div>
            <div class="hd-vb-val">{{ data.cairan_infus ?? '-' }} ml</div>
          </div>
          <div class="hd-val-box">
            <div class="hd-vb-label">Obat IV / Flush</div>
            <div class="hd-vb-val">{{ data.cairan_obat_iv ?? '-' }} ml</div>
          </div>
          <div class="hd-val-box">
            <div class="hd-vb-label">Minum Selama HD</div>
            <div class="hd-vb-val">{{ data.cairan_minum ?? '-' }} ml</div>
          </div>
          <div class="hd-val-box">
            <div class="hd-vb-label">Lain-lain Masuk</div>
            <div class="hd-vb-val">{{ data.cairan_masuk_lain ?? '-' }} ml</div>
          </div>
        </div>
        <div class="hd-fluid-total hd-total-masuk">
          Total Cairan Masuk &nbsp;=&nbsp; <strong>{{ calcTotalMasuk }} ml</strong>
        </div>

        <!-- Keluar -->
        <div class="hd-fluid-header hd-keluar" style="margin-top: 10px">
          <span>▲ CAIRAN KELUAR</span>
        </div>
        <div class="hd-grid-4">
          <div class="hd-val-box">
            <div class="hd-vb-label">UF Aktual / Mesin</div>
            <div class="hd-vb-val">{{ data.uf_aktual ?? '-' }} ml</div>
          </div>
          <div class="hd-val-box">
            <div class="hd-vb-label">Urine Selama HD</div>
            <div class="hd-vb-val">{{ data.cairan_urine ?? '-' }} ml</div>
          </div>
          <div class="hd-val-box">
            <div class="hd-vb-label">Perdarahan / Drainase</div>
            <div class="hd-vb-val">{{ data.cairan_perdarahan ?? '-' }} ml</div>
          </div>
          <div class="hd-val-box">
            <div class="hd-vb-label">Lain-lain Keluar</div>
            <div class="hd-vb-val">{{ data.cairan_keluar_lain ?? '-' }} ml</div>
          </div>
        </div>
        <div class="hd-fluid-total hd-total-keluar">
          Total Cairan Keluar &nbsp;=&nbsp; <strong>{{ calcTotalKeluar }} ml</strong>
        </div>
      </div>

      <!-- Balance Cards -->
      <div class="hd-grid-3" style="margin-top: 8px">
        <div class="hd-calc-card" :class="calcBalance.status">
          <div class="hd-cc-label">Balance Cairan</div>
          <div class="hd-cc-val">{{ calcBalance.value }}</div>
          <div class="hd-cc-sub">{{ calcBalance.sub }}</div>
        </div>
        <div class="hd-calc-card" :class="calcUFAchievement.status">
          <div class="hd-cc-label">Pencapaian UF Aktual</div>
          <div class="hd-cc-val">{{ calcUFAchievement.value }}</div>
          <div class="hd-cc-sub">{{ calcUFAchievement.sub }}</div>
        </div>
        <div class="hd-calc-card" :class="calcNetUF.status">
          <div class="hd-cc-label">Selisih UF vs Target</div>
          <div class="hd-cc-val">{{ calcNetUF.value }}</div>
          <div class="hd-cc-sub">{{ calcNetUF.sub }}</div>
        </div>
      </div>

      <!-- ══ VI. EVALUASI PASCA-HD ══════════════════════════════════════════ -->
      <div class="rme-section-title" style="margin-top: 14px">
        VI &nbsp; Evaluasi Pasca-Hemodialisa
      </div>

      <div class="hd-grid-4" style="margin-top: 8px">
        <div class="hd-val-box">
          <div class="hd-vb-label">BB Post (kg)</div>
          <div class="hd-vb-val">{{ fmt1(data.bb_post) }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">TD Post (mmHg)</div>
          <div class="hd-vb-val">{{ data.td_post || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Nadi Post (x/mnt)</div>
          <div class="hd-vb-val">{{ data.nadi_post || '-' }}</div>
        </div>
        <div class="hd-val-box">
          <div class="hd-vb-label">Suhu Post (°C)</div>
          <div class="hd-vb-val">{{ fmt1(data.suhu_post) }}</div>
        </div>
      </div>

      <!-- Kalk Post -->
      <div class="hd-grid-3" style="margin-top: 8px">
        <div class="hd-calc-card" :class="calcCairan.status">
          <div class="hd-cc-label">Cairan Terbuang (L)</div>
          <div class="hd-cc-val">{{ calcCairan.value }}</div>
          <div class="hd-cc-sub">BB Pre − BB Post</div>
        </div>
        <div class="hd-calc-card" :class="calcAdekuasi.status">
          <div class="hd-cc-label">Adekuasi (estimasi)</div>
          <div class="hd-cc-val">{{ calcAdekuasi.value }}</div>
          <div class="hd-cc-sub">Target Kt/V ≥ 1.2</div>
        </div>
        <div class="hd-calc-card" :class="calcHasilUF.status">
          <div class="hd-cc-label">Pencapaian UF Goal</div>
          <div class="hd-cc-val">{{ calcHasilUF.value }}</div>
          <div class="hd-cc-sub">{{ calcHasilUF.sub }}</div>
        </div>
      </div>

      <div class="hd-info-row" style="margin-top: 8px">
        <table class="rme-tbl-info">
          <colgroup>
            <col style="width: 170px" />
            <col style="width: 10px" />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td class="rme-td-lbl">Kondisi Umum Post-HD</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ data.kondisi_post || '-' }}</td>
            </tr>
            <tr>
              <td class="rme-td-lbl">Masalah / Catatan</td>
              <td class="rme-td-sep">:</td>
              <td class="rme-td-val">{{ data.masalah_hd || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══ VII. TANDA TANGAN ══════════════════════════════════════════════ -->
      <div class="rme-section-title" style="margin-top: 14px">
        VII &nbsp; Verifikasi &amp; Tanda Tangan
      </div>

      <div class="hd-ttd-row" style="margin-top: 12px">
        <div class="hd-ttd-col">
          <div class="hd-ttd-label">Perawat Pelaksana</div>
          <div class="hd-ttd-box">
            <QrcodeVue
              v-if="data.ttd_perawat == 1"
              :value="data.nama_user || '-'"
              :size="40"
              level="H"
              render-as="svg"
            />
            <span v-else class="hd-ttd-empty">Belum TTE</span>
          </div>
          <div class="hd-ttd-name">{{ data.nama_user || '-' }}</div>
        </div>
        <div class="hd-ttd-col">
          <!-- reserved -->
        </div>
        <div class="hd-ttd-col">
          <div class="hd-ttd-label">Dokter Penanggung Jawab</div>
          <div class="hd-ttd-box">
            <QrcodeVue
              v-if="data.auth == 1"
              :value="data.ttd_dokter || dataPasien?.NAMADOKTER || '-'"
              :size="40"
              level="H"
              render-as="svg"
            />
            <span v-else class="hd-ttd-empty">Belum TTE</span>
          </div>
          <div class="hd-ttd-name">{{ data.ttd_dokter || dataPasien?.NAMADOKTER || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  noreg: { type: String, default: '' },
  dataPasien: { type: Object, default: () => ({}) },
})

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(false)
const data = ref(null)

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt1 = (v) => (v != null && v !== '' ? Number(v).toFixed(1) : '-')

const n = (v) => Number(v) || 0

// ── Observasi rows dengan fallback default label ──────────────────────────
const defaultLabels = ['Pre', 'Jam 1', 'Jam 2', 'Jam 3', 'Jam 4', 'Jam 5', 'Post']
const emptyRow = (label) => ({
  label,
  td: '',
  nadi: '',
  qb: '',
  uf_rate: '',
  tmp_vp_ap: '',
  spo2: '',
  suhu: '',
  keluhan: '',
})

const observasiRows = computed(() => {
  const apiObs = data.value?.observasi ?? []
  return defaultLabels.map((label) => {
    const match = apiObs.find((r) => r.label === label)
    return match ? { ...emptyRow(label), ...match } : emptyRow(label)
  })
})

const komplikasiList = computed(() => {
  const k = data.value?.komplikasi
  if (!k) return []
  if (Array.isArray(k)) return k
  try {
    return JSON.parse(k)
  } catch {
    return []
  }
})

// ── Calculated values (sama dengan HemodiComponent) ──────────────────────
const calcUF = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_kering = n(data.value?.bb_kering)
  if (!bb_pre || !bb_kering) return { value: '—', status: '', sub: 'BB Pre − BB Kering' }
  const uf = parseFloat((bb_pre - bb_kering).toFixed(1))
  return {
    value: `${uf} L`,
    status: uf > 4 ? 'danger' : uf > 3 ? 'warn' : '',
    sub: uf > 3 ? 'Perhatikan volume!' : 'BB Pre − BB Kering',
  }
})

const calcIDWG = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_post_lalu = n(data.value?.bb_post_lalu)
  if (!bb_pre || !bb_post_lalu) return { value: '—', status: '' }
  const idwg = parseFloat((bb_pre - bb_post_lalu).toFixed(1))
  return { value: `${idwg} kg`, status: idwg > 4 ? 'warn' : '' }
})

const calcIDWGPct = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_post_lalu = n(data.value?.bb_post_lalu),
    bb_kering = n(data.value?.bb_kering)
  if (!bb_pre || !bb_post_lalu || !bb_kering)
    return { value: '—', status: '', sub: 'Terhadap BB kering' }
  const idwg = bb_pre - bb_post_lalu
  const pct = parseFloat(((idwg / bb_kering) * 100).toFixed(1))
  return {
    value: `${pct}%`,
    status: pct > 5 ? 'danger' : pct > 3.5 ? 'warn' : '',
    sub: pct > 5 ? 'IDWG tinggi!' : pct > 3.5 ? 'Perlu perhatian' : 'Terhadap BB kering',
  }
})

const calcBMI = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    tb = n(data.value?.tinggi_badan)
  if (!bb_pre || !tb) return { value: '—', status: '', sub: 'BB / TB²' }
  const tbm = tb / 100
  const bmi = parseFloat((bb_pre / (tbm * tbm)).toFixed(1))
  return {
    value: bmi.toString(),
    status: bmi < 18.5 || bmi > 30 ? 'warn' : '',
    sub: bmi < 18.5 ? 'Underweight' : bmi > 30 ? 'Obesitas' : 'Normal range',
  }
})

const calcUFRate = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_kering = n(data.value?.bb_kering)
  const durasi = parseFloat(data.value?.durasi)
  if (!bb_pre || !bb_kering || !durasi) return ''
  const rate = Math.round(((bb_pre - bb_kering) * 1000) / durasi)
  return `${rate} ml/jam`
})

const calcTotalMasuk = computed(
  () =>
    n(data.value?.cairan_infus) +
    n(data.value?.cairan_obat_iv) +
    n(data.value?.cairan_minum) +
    n(data.value?.cairan_masuk_lain),
)

const calcTotalKeluar = computed(
  () =>
    n(data.value?.uf_aktual) +
    n(data.value?.cairan_urine) +
    n(data.value?.cairan_perdarahan) +
    n(data.value?.cairan_keluar_lain),
)

const calcBalance = computed(() => {
  const masuk = calcTotalMasuk.value,
    keluar = calcTotalKeluar.value
  if (masuk === 0 && keluar === 0)
    return { value: '0', status: '', sub: 'Total Masuk − Total Keluar' }
  const bal = masuk - keluar
  const sign = bal > 0 ? '+' : ''
  return {
    value: `${sign}${bal} ml`,
    status: bal > 500 ? 'danger' : Math.abs(bal) > 200 ? 'warn' : '',
    sub: bal > 200 ? 'Retensi cairan' : bal < -200 ? 'Defisit cairan' : 'Seimbang',
  }
})

const calcUFAchievement = computed(() => {
  const uf = n(data.value?.uf_aktual)
  if (!uf) return { value: '—', status: '', sub: 'UF Aktual dari mesin' }
  const bb_pre = n(data.value?.bb_pre),
    bb_kering = n(data.value?.bb_kering)
  const ufGoalMl = bb_pre && bb_kering ? (bb_pre - bb_kering) * 1000 : null
  if (!ufGoalMl) return { value: `${uf} ml`, status: '', sub: 'UF Aktual (no target)' }
  const pct = Math.round((uf / ufGoalMl) * 100)
  return {
    value: `${pct}%`,
    status: pct < 60 ? 'danger' : pct < 80 ? 'warn' : '',
    sub: `${uf} ml dari target ${ufGoalMl.toFixed(0)} ml`,
  }
})

const calcNetUF = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_kering = n(data.value?.bb_kering),
    uf = n(data.value?.uf_aktual)
  if (!bb_pre || !bb_kering || !uf) return { value: '—', status: '', sub: 'UF Aktual − UF Goal' }
  const ufGoalMl = (bb_pre - bb_kering) * 1000
  const diff = uf - ufGoalMl
  const sign = diff > 0 ? '+' : ''
  return {
    value: `${sign}${diff.toFixed(0)} ml`,
    status: Math.abs(diff) > 300 ? 'warn' : '',
    sub: diff > 0 ? 'Melebihi target' : diff < 0 ? 'Di bawah target' : 'Tepat target',
  }
})

const calcCairan = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_post = n(data.value?.bb_post)
  if (!bb_pre || !bb_post) return { value: '—', status: '' }
  const cairan = parseFloat((bb_pre - bb_post).toFixed(2))
  return { value: `${cairan} L`, status: cairan < 0 ? 'warn' : '' }
})

const calcAdekuasi = computed(() => {
  const qb = n(data.value?.qb_instruksi),
    durasi = parseFloat(data.value?.durasi),
    bb_kering = n(data.value?.bb_kering)
  if (!qb || !durasi || !bb_kering) return { value: '—', status: '' }
  const ktv = parseFloat(((0.162 * qb * durasi * 60) / (bb_kering * 1000)).toFixed(2))
  return { value: `Kt/V ${ktv}`, status: ktv < 1.2 ? 'danger' : ktv < 1.4 ? 'warn' : '' }
})

const calcHasilUF = computed(() => {
  const bb_pre = n(data.value?.bb_pre),
    bb_post = n(data.value?.bb_post),
    bb_kering = n(data.value?.bb_kering)
  if (!bb_pre || !bb_post || !bb_kering) return { value: '—', status: '', sub: 'vs Target UF' }
  const cairan = bb_pre - bb_post
  const ufGoal = bb_pre - bb_kering
  if (ufGoal <= 0) return { value: '—', status: '', sub: 'vs Target UF' }
  const pct = Math.round((cairan / ufGoal) * 100)
  return {
    value: `${pct}%`,
    status: pct < 60 ? 'danger' : pct < 80 ? 'warn' : '',
    sub: `${cairan.toFixed(2)} L dari target ${ufGoal.toFixed(1)} L`,
  }
})

// ── Fetch ─────────────────────────────────────────────────────────────────
const noregForApi = computed(() => {
  return props.dataPasien?.NOPENDAFTARAN || props.noreg
})

const fetchData = async () => {
  const noreg = noregForApi.value
  if (!noreg || !id_client.value || !configStore.apiBaseUrl) return
  if (!props.dataPasien || Object.keys(props.dataPasien).length === 0) return

  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_data_hd/${noreg}/${id_client.value}/2`,
    )
    if (res.data?.code == 200 && res.data?.data) {
      data.value = res.data.data
      reportSectionData('hemodialisa', true)
    } else {
      data.value = null
      reportSectionData('hemodialisa', false)
    }
  } catch {
    data.value = null
    reportSectionData('hemodialisa', false)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.noreg, props.dataPasien],
  ([, dp]) => {
    if (dp && Object.keys(dp).length > 0) fetchData()
  },
  { immediate: true, deep: false },
)
</script>

<style scoped>
.hd-wrap {
  font-size: 12px;
  color: #1a1a2e;
}

/* ── Judul ── */
.hd-main-title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #162d4e;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 2px solid #162d4e;
}
.hd-title-meta {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  letter-spacing: 0;
}

/* ── Info row ── */
.hd-info-row {
  margin-top: 4px;
}

/* ── Grids ── */
.hd-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.hd-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.hd-grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

/* ── Val Box ── */
.hd-val-box {
  border: 1px solid #dde8f4;
  border-radius: 4px;
  padding: 5px 8px;
  background: #f7fafd;
}
.hd-val-box.hd-vb-highlight {
  background: #e8f4ff;
  border-color: #90caf9;
}
.hd-vb-label {
  font-size: 10px;
  color: #6c757d;
  margin-bottom: 2px;
}
.hd-vb-val {
  font-size: 13px;
  font-weight: 700;
  color: #162d4e;
}

/* ── Calc Card ── */
.hd-calc-card {
  background: #eaf3de;
  border: 0.5px solid #c0dd97;
  border-radius: 6px;
  padding: 7px 10px;
}
.hd-calc-card.warn {
  background: #faeeda;
  border-color: #fac775;
}
.hd-calc-card.danger {
  background: #fcebeb;
  border-color: #f7c1c1;
}
.hd-cc-label {
  font-size: 10px;
  font-weight: 600;
  color: #3b6d11;
}
.hd-calc-card.warn .hd-cc-label {
  color: #854f0b;
}
.hd-calc-card.danger .hd-cc-label {
  color: #a32d2d;
}
.hd-cc-val {
  font-size: 17px;
  font-weight: 700;
  color: #27500a;
  line-height: 1.2;
}
.hd-calc-card.warn .hd-cc-val {
  color: #633806;
}
.hd-calc-card.danger .hd-cc-val {
  color: #791f1f;
}
.hd-cc-sub {
  font-size: 10px;
  color: #639922;
}
.hd-calc-card.warn .hd-cc-sub {
  color: #ba7517;
}
.hd-calc-card.danger .hd-cc-sub {
  color: #993535;
}

/* ── Observasi table rows ── */
.hd-row-pre td {
  background: #edf4fd !important;
}
.hd-row-post td {
  background: #eaf3de !important;
}
.hd-label-cell {
  font-weight: 700;
  text-align: center;
}

/* ── Komplikasi chips ── */
.hd-komplikasi-chip {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin: 2px 3px;
}
.chip-warn {
  background: #fde8e8;
  color: #c62828;
  border: 1px solid #ef9a9a;
}
.chip-ok {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

/* ── Keseimbangan Cairan ── */
.hd-fluid-wrapper {
  padding: 0;
}
.hd-fluid-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}
.hd-masuk {
  background: #e3f2fd;
  color: #1565c0;
}
.hd-keluar {
  background: #fce4ec;
  color: #b71c1c;
}
.hd-fluid-total {
  font-size: 12px;
  text-align: right;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 4px;
}
.hd-total-masuk {
  background: #e3f2fd;
  color: #1565c0;
}
.hd-total-keluar {
  background: #fce4ec;
  color: #b71c1c;
}

/* ── Tanda tangan ── */
.hd-ttd-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  text-align: center;
}
.hd-ttd-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.hd-ttd-label {
  font-size: 11px;
  color: #555;
}
.hd-ttd-box {
  width: 70px;
  height: 60px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hd-ttd-empty {
  font-size: 10px;
  color: #aaa;
  font-style: italic;
}
.hd-ttd-name {
  font-size: 11px;
  font-weight: 700;
  color: #162d4e;
}
</style>
