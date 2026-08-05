<template>
  <!-- ══ INFO PASIEN — hanya tampil saat standalone (via URL) ══ -->
  <Card v-if="!isEmbedded" class="mb-3">
    <template #content>
      <div v-if="isLoading" class="text-center py-2">
        <i class="pi pi-spin pi-spinner mr-2" />Memuat data pasien...
      </div>
      <div v-else class="row align-items-center g-2">
        <div class="col-auto">
          <div
            style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            "
            :style="dataPasien?.JENISKELAMIN === 'P' ? 'background:#fce4ec' : 'background:#e3f2fd'"
          >
            <i
              class="pi pi-user"
              style="font-size: 1.4em"
              :style="dataPasien?.JENISKELAMIN === 'P' ? 'color:#c2185b' : 'color:#1565c0'"
            ></i>
          </div>
        </div>
        <div class="col-md-4">
          <div class="fw-bold" style="font-size: 1.05em">{{ dataPasien?.NAMAPASIEN || '—' }}</div>
          <div style="color: #666; font-size: 0.85rem">
            No. RM: <strong>{{ dataPasien?.NOMR || '—' }}</strong> &nbsp;|&nbsp; No. Reg:
            <code>{{ noregister }}</code>
          </div>
          <div class="d-flex gap-1 flex-wrap mt-1">
            <Tag
              :severity="dataPasien?.JENISKELAMIN === 'P' ? 'danger' : 'info'"
              :value="dataPasien?.JENISKELAMIN === 'P' ? 'Perempuan' : 'Laki-laki'"
            />
            <Tag
              severity="secondary"
              :value="`${dataPasien?.USIA_PASIEN?.tahun ?? '?'} Thn ${dataPasien?.USIA_PASIEN?.bulan ?? 0} Bln`"
            />
            <Tag
              :severity="skalaPasien === 'MORSE' ? 'info' : 'danger'"
              :value="skalaPasien === 'MORSE' ? 'Skala Morse' : 'Skala Humpty Dumpty'"
            />
          </div>
        </div>
        <div class="col-md-4" style="font-size: 0.85rem; color: #555">
          <div>
            <i class="pi pi-calendar mr-1"></i>Masuk:
            <strong>{{ dataPasien?.MASUKPOLY_DISPLAY || '—' }}</strong>
          </div>
          <div class="mt-1">
            <i class="pi pi-user-edit mr-1"></i>DPJP:
            <strong>{{ dataPasien?.NAMADOKTER || '—' }}</strong>
          </div>
          <div class="mt-1"><i class="pi pi-building mr-1"></i>{{ dataPasien?.POLI || '—' }}</div>
        </div>
        <div class="col-md-3" style="font-size: 0.85rem; color: #555">
          <div><i class="pi pi-credit-card mr-1"></i>{{ dataPasien?.CARABAYAR || '—' }}</div>
          <div v-if="dataPasien?.NOSEP" class="mt-1">
            <i class="pi pi-id-card mr-1"></i>SEP: <code>{{ dataPasien.NOSEP }}</code>
          </div>
          <div class="mt-1">
            <i class="pi pi-tag mr-1"></i
            >{{ dataPasien?.DX_CAPTION || dataPasien?.DIAGNOSA_AWAL || '—' }}
          </div>
        </div>
      </div>
    </template>
  </Card>

  <!-- ══ DIALOG FORM ASSESSMENT ══ -->
  <Dialog
    v-model:visible="showDialog"
    :header="dialogHeader"
    :modal="true"
    :style="{ width: '860px' }"
    :closable="!isSaving"
  >
    <!-- Info skala -->
    <div class="p-3 rounded mb-3" :style="skalaInfoStyle">
      <div style="font-weight: 700">
        <i :class="skalaPasien === 'MORSE' ? 'pi pi-user mr-1' : 'pi pi-star mr-1'"></i>
        {{
          skalaPasien === 'MORSE'
            ? 'Skala Morse — Dewasa / Remaja (≥ 14 tahun)'
            : 'Skala Humpty Dumpty — Anak-anak (< 14 tahun)'
        }}
      </div>
      <small style="color: #555">Skor total menentukan tingkat risiko jatuh pasien.</small>
    </div>

    <!-- MORSE -->
    <template v-if="skalaPasien === 'MORSE'">
      <DataTable :value="morseCriteria" showGridlines size="small" class="mb-3">
        <Column header="No" style="width: 40px; text-align: center">
          <template #body="s"
            ><span class="fw-bold">{{ s.index + 1 }}</span></template
          >
        </Column>
        <Column header="Parameter" style="min-width: 170px">
          <template #body="s">
            <span class="fw-bold">{{ s.data.label }}</span>
            <div v-if="s.data.note">
              <small class="text-muted">{{ s.data.note }}</small>
            </div>
          </template>
        </Column>
        <Column header="Pilihan" style="min-width: 280px">
          <template #body="s">
            <div class="d-flex flex-column gap-1">
              <div
                v-for="opt in s.data.options"
                :key="opt.value"
                class="d-flex align-items-center gap-2"
              >
                <RadioButton
                  :inputId="`morse_${s.data.field}_${opt.value}`"
                  :name="`morse_${s.data.field}`"
                  :value="opt.value"
                  v-model="formMorse[s.data.field]"
                />
                <label
                  :for="`morse_${s.data.field}_${opt.value}`"
                  style="cursor: pointer; margin: 0"
                  >{{ opt.label }}</label
                >
              </div>
            </div>
          </template>
        </Column>
        <Column header="Skor" style="width: 70px; text-align: center">
          <template #body="s">
            <Tag
              :value="String(formMorse[s.data.field] ?? 0)"
              :severity="formMorse[s.data.field] > 0 ? 'warn' : 'secondary'"
            />
          </template>
        </Column>
      </DataTable>
      <!-- Total Morse -->
      <div
        :style="morseResultStyle"
        class="p-3 rounded d-flex align-items-center justify-content-between mb-3"
      >
        <div>
          <div class="fw-bold"><i class="pi pi-chart-bar mr-2"></i>Total Skor Morse</div>
          <div style="font-size: 0.9em; margin-top: 2px">{{ morseInterpretasi.keterangan }}</div>
        </div>
        <div class="text-end">
          <div style="font-size: 2em; font-weight: 900; line-height: 1">{{ totalMorse }}</div>
          <Tag
            :severity="morseInterpretasi.severity"
            :value="morseInterpretasi.label"
            class="mt-1"
          />
        </div>
      </div>
    </template>

    <!-- HUMPTY DUMPTY -->
    <template v-else>
      <DataTable :value="humptyDumptyCriteria" showGridlines size="small" class="mb-3">
        <Column header="No" style="width: 40px; text-align: center">
          <template #body="s"
            ><span class="fw-bold">{{ s.index + 1 }}</span></template
          >
        </Column>
        <Column header="Parameter" style="min-width: 160px">
          <template #body="s"
            ><span class="fw-bold">{{ s.data.label }}</span></template
          >
        </Column>
        <Column header="Pilihan" style="min-width: 310px">
          <template #body="s">
            <div class="d-flex flex-column gap-1">
              <div
                v-for="opt in s.data.options"
                :key="opt.value"
                class="d-flex align-items-center gap-2"
              >
                <RadioButton
                  :inputId="`hd_${s.data.field}_${opt.value}`"
                  :name="`hd_${s.data.field}`"
                  :value="opt.value"
                  v-model="formHumpty[s.data.field]"
                />
                <label
                  :for="`hd_${s.data.field}_${opt.value}`"
                  style="cursor: pointer; margin: 0"
                  >{{ opt.label }}</label
                >
              </div>
            </div>
          </template>
        </Column>
        <Column header="Skor" style="width: 70px; text-align: center">
          <template #body="s">
            <Tag
              :value="String(formHumpty[s.data.field] ?? 1)"
              :severity="(formHumpty[s.data.field] ?? 1) > 1 ? 'warn' : 'secondary'"
            />
          </template>
        </Column>
      </DataTable>
      <!-- Total Humpty -->
      <div
        :style="humptyResultStyle"
        class="p-3 rounded d-flex align-items-center justify-content-between mb-3"
      >
        <div>
          <div class="fw-bold"><i class="pi pi-chart-bar mr-2"></i>Total Skor Humpty Dumpty</div>
          <div style="font-size: 0.9em; margin-top: 2px">{{ humptyInterpretasi.keterangan }}</div>
        </div>
        <div class="text-end">
          <div style="font-size: 2em; font-weight: 900; line-height: 1">{{ totalHumpty }}</div>
          <Tag
            :severity="humptyInterpretasi.severity"
            :value="humptyInterpretasi.label"
            class="mt-1"
          />
        </div>
      </div>
    </template>

    <!-- Catatan -->
    <div>
      <label class="fw-bold mb-1 d-block">Catatan / Tindakan Pencegahan</label>
      <Textarea
        v-model="form.catatan"
        rows="2"
        class="w-100"
        placeholder="Tuliskan tindakan pencegahan yang telah dilakukan..."
      />
    </div>

    <template #footer>
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        text
        @click="showDialog = false"
        :disabled="isSaving"
      />
      <Button
        label="Simpan Pengkajian"
        icon="pi pi-save"
        severity="success"
        @click="simpan"
        :loading="isSaving"
      />
    </template>
  </Dialog>

  <!-- ══ PANEL RIWAYAT (tampilan utama) ══ -->
  <Panel>
    <template #header>
      <div class="d-flex align-items-center justify-content-between w-100">
        <h6 style="color: darkcyan"><strong>PENGKAJIAN RESIKO JATUH</strong></h6>
        <div class="d-flex align-items-center gap-2">
          <Tag :value="'Total: ' + riwayat.length" severity="info" />
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            size="small"
            v-tooltip="'Muat ulang'"
            @click="fetchRiwayat()"
            :loading="isLoadingRiwayat"
          />
          <Button
            label="Pengkajian Baru"
            icon="pi pi-plus"
            severity="success"
            size="small"
            @click="bukaForm()"
            :disabled="isLoading || isLoadingRiwayat"
          />
        </div>
      </div>
    </template>
    <!-- ── Info Banner ── -->
    <div
      class="mb-3 px-3 py-2 rounded d-flex align-items-center gap-2"
      style="
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-left: 4px solid #0284c7;
        font-size: 0.82rem;
        color: #0c4a6e;
      "
    >
      <span>
        Skala dipilih otomatis berdasarkan usia pasien —
        <strong><i class="pi pi-user mr-1"></i>Morse</strong> untuk ≥ 14 tahun (skor ≥ 45 = Tinggi),
        <strong><i class="pi pi-star mr-1"></i>Humpty Dumpty</strong> untuk &lt; 14 tahun (skor ≥ 16
        = Tinggi).
        <span v-if="dataPasien">
          Pasien ini <strong>({{ dataPasien?.USIA_PASIEN?.tahun ?? '?' }} thn)</strong> →
          <strong>{{ skalaPasien === 'MORSE' ? 'Skala Morse' : 'Skala Humpty Dumpty' }}</strong
          >.
        </span>
      </span>
    </div>

    <div v-if="isLoadingRiwayat" class="text-center py-3">
      <i class="pi pi-spin pi-spinner mr-2" />Memuat riwayat...
    </div>
    <DataTable
      v-else
      :value="riwayat"
      size="small"
      stripedRows
      showGridlines
      :paginator="riwayat.length > 10"
      :rows="10"
    >
      <template #empty>
        <div class="text-center py-4" style="color: #aaa">
          <i class="pi pi-inbox" style="font-size: 2em; opacity: 0.4"></i>
          <div class="mt-2">Belum ada riwayat pengkajian.</div>
          <Button
            label="Mulai Pengkajian"
            icon="pi pi-plus"
            severity="success"
            class="mt-2"
            size="small"
            @click="bukaForm()"
          />
        </div>
      </template>
      <Column header="No" style="width: 44px; text-align: center">
        <template #body="s">
          <span
            style="
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #e3f2fd;
              color: #1565c0;
              font-weight: 700;
              font-size: 0.8em;
            "
            >{{ s.index + 1 }}</span
          >
        </template>
      </Column>
      <Column header="Waktu Kajian" style="min-width: 150px">
        <template #body="s">
          <div class="fw-bold" style="font-size: 0.85rem">
            {{ formatWaktu(s.data.waktu_kajian) }}
          </div>
          <small v-if="s.data.username" class="text-muted">{{ s.data.username }}</small>
        </template>
      </Column>
      <Column header="Skala" style="width: 150px">
        <template #body="s">
          <Tag
            :severity="s.data.skala === 'MORSE' ? 'info' : 'danger'"
            :value="s.data.skala === 'MORSE' ? 'Morse — Dewasa' : 'Humpty Dumpty — Anak'"
          />
        </template>
      </Column>
      <Column header="Skor" style="width: 70px; text-align: center">
        <template #body="s">
          <span style="font-size: 1.4em; font-weight: 800">{{ s.data.skor_total }}</span>
        </template>
      </Column>
      <Column header="Interpretasi" style="width: 150px; text-align: center">
        <template #body="s">
          <Tag :severity="getSeverity(s.data.interpretasi)" :value="s.data.interpretasi" />
        </template>
      </Column>
      <Column header="Catatan" style="min-width: 180px">
        <template #body="s">
          <span v-if="s.data.catatan" style="font-size: 0.85rem">
            <i class="pi pi-comment mr-1" style="color: #f57c00"></i>{{ s.data.catatan }}
          </span>
          <span v-else style="color: #ccc">—</span>
        </template>
      </Column>
      <Column header="Aksi" style="width: 110px; text-align: center">
        <template #body="s">
          <div class="d-flex gap-1 justify-content-center">
            <Button
              icon="pi pi-eye"
              size="small"
              severity="info"
              outlined
              v-tooltip="'Lihat Detail'"
              @click="lihatDetail(s.data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              outlined
              v-tooltip="'Hapus'"
              @click="hapus(s.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </Panel>

  <!-- ══ DIALOG DETAIL ══ -->
  <Dialog
    v-model:visible="showDetail"
    header="Detail Pengkajian"
    :modal="true"
    :style="{ width: '620px' }"
  >
    <template v-if="detailData">
      <div
        class="p-3 rounded mb-3"
        :style="
          detailData.skala === 'MORSE'
            ? 'background:#e3f2fd;border-left:4px solid #1976d2'
            : 'background:#fce4ec;border-left:4px solid #c2185b'
        "
      >
        <div class="fw-bold">
          {{ detailData.skala === 'MORSE' ? 'Skala Morse — Dewasa' : 'Skala Humpty Dumpty — Anak' }}
        </div>
        <small style="color: #555">
          {{ formatWaktu(detailData.waktu_kajian) }}
          <span v-if="detailData.username">
            &nbsp;|&nbsp; Dikaji oleh: <strong>{{ detailData.username }}</strong></span
          >
        </small>
      </div>

      <DataTable :value="detailData.detail_items" showGridlines size="small" class="mb-3">
        <Column field="parameter" header="Parameter" style="min-width: 180px" />
        <Column field="jawaban" header="Jawaban" style="min-width: 180px" />
        <Column header="Skor" style="width: 80px; text-align: center">
          <template #body="s">
            <Tag :value="String(s.data.skor)" :severity="s.data.skor > 0 ? 'warn' : 'secondary'" />
          </template>
        </Column>
      </DataTable>

      <div
        class="d-flex align-items-center justify-content-between p-3 rounded"
        style="background: #f5f5f5; border: 1px solid #ddd"
      >
        <span class="fw-bold">Total Skor</span>
        <div class="text-end">
          <span style="font-size: 1.5em; font-weight: 900; margin-right: 10px">{{
            detailData.skor_total
          }}</span>
          <Tag :severity="getSeverity(detailData.interpretasi)" :value="detailData.interpretasi" />
        </div>
      </div>

      <div
        v-if="detailData.catatan"
        class="mt-3 p-3 rounded"
        style="background: #fff8e1; border: 1px solid #ffe082"
      >
        <i class="pi pi-comment mr-1" style="color: #f57c00"></i>
        <strong>Catatan:</strong> {{ detailData.catatan }}
      </div>
    </template>
    <template #footer>
      <Button label="Tutup" icon="pi pi-times" text @click="showDetail = false" />
    </template>
  </Dialog>

  <ConfirmDialog group="resiko-jatuh" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const props = defineProps({
  noregisterProp: { type: String, default: '' },
  datasetProp: { type: Object, default: null },
})

// Jika dipanggil sebagai component, gunakan prop; jika via URL, gunakan route params
const noregister = computed(() => props.noregisterProp || route.params.noregister || '')
const isEmbedded = computed(() => !!props.datasetProp || !!props.noregisterProp)

const fact = ref({})

// ── Kriteria Skala Morse ──────────────────────────────────
const morseCriteria = [
  {
    field: 'riwayat_jatuh',
    label: 'Riwayat Jatuh',
    note: 'Dalam 3 bulan terakhir',
    options: [
      { value: 0, label: 'Tidak (0)' },
      { value: 25, label: 'Ya (25)' },
    ],
  },
  {
    field: 'diagnosis_sekunder',
    label: 'Diagnosis Sekunder',
    note: '≥ 2 diagnosis medis',
    options: [
      { value: 0, label: 'Tidak (0)' },
      { value: 15, label: 'Ya (15)' },
    ],
  },
  {
    field: 'alat_bantu_jalan',
    label: 'Alat Bantu Jalan',
    options: [
      { value: 0, label: 'Tidak ada / Bedrest / Dibantu Perawat (0)' },
      { value: 15, label: 'Kruk / Tongkat / Walker (15)' },
      { value: 30, label: 'Berpegangan pada Furnitur / Dinding (30)' },
    ],
  },
  {
    field: 'terpasang_infus',
    label: 'Terpasang Infus',
    note: 'IV Line / Heparin Lock',
    options: [
      { value: 0, label: 'Tidak (0)' },
      { value: 20, label: 'Ya (20)' },
    ],
  },
  {
    field: 'cara_berjalan',
    label: 'Cara / Gaya Berjalan',
    options: [
      { value: 0, label: 'Normal / Bedrest / Immobilisasi (0)' },
      { value: 10, label: 'Lemah (10)' },
      { value: 20, label: 'Terganggu (20)' },
    ],
  },
  {
    field: 'status_mental',
    label: 'Status Mental',
    options: [
      { value: 0, label: 'Orientasi sesuai kemampuan diri (0)' },
      { value: 15, label: 'Sering lupa / Overestimasi kemampuan (15)' },
    ],
  },
]

// ── Kriteria Skala Humpty Dumpty ──────────────────────────
const humptyDumptyCriteria = [
  {
    field: 'usia',
    label: 'Usia',
    options: [
      { value: 4, label: 'Di bawah 3 tahun (4)' },
      { value: 3, label: '3 – 7 tahun (3)' },
      { value: 2, label: '7 – 13 tahun (2)' },
      { value: 1, label: '≥ 13 tahun (1)' },
    ],
  },
  {
    field: 'jenis_kelamin',
    label: 'Jenis Kelamin',
    options: [
      { value: 2, label: 'Laki-laki (2)' },
      { value: 1, label: 'Perempuan (1)' },
    ],
  },
  {
    field: 'diagnosis',
    label: 'Diagnosis',
    options: [
      { value: 4, label: 'Kelainan neurologis (4)' },
      { value: 3, label: 'Perubahan oksigenasi (3)' },
      { value: 2, label: 'Kelainan psikis / perilaku (2)' },
      { value: 1, label: 'Diagnosis lain-lain (1)' },
    ],
  },
  {
    field: 'gangguan_kognitif',
    label: 'Gangguan Kognitif',
    options: [
      { value: 3, label: 'Tidak sadar terhadap keterbatasan (3)' },
      { value: 2, label: 'Lupa terhadap keterbatasan (2)' },
      { value: 1, label: 'Mengetahui kemampuan diri (1)' },
    ],
  },
  {
    field: 'faktor_lingkungan',
    label: 'Faktor Lingkungan',
    options: [
      { value: 4, label: 'Riwayat jatuh dari tempat tidur (4)' },
      { value: 3, label: 'Pasien menggunakan alat bantu (3)' },
      { value: 2, label: 'Pasien berada di tempat tidur (2)' },
      { value: 1, label: 'Di luar area perawatan (1)' },
    ],
  },
  {
    field: 'respon_operasi',
    label: 'Respons Operasi / Obat Penenang / Anestesi',
    options: [
      { value: 3, label: 'Dalam 24 jam (3)' },
      { value: 2, label: 'Dalam 48 jam (2)' },
      { value: 1, label: 'Lebih dari 48 jam / Tidak (1)' },
    ],
  },
  {
    field: 'penggunaan_obat',
    label: 'Penggunaan Obat',
    options: [
      { value: 3, label: 'Multipel: sedatif, hipnotik, diuretik, narkotik, dll (3)' },
      { value: 2, label: 'Salah satu obat di atas (2)' },
      { value: 1, label: 'Tidak ada (1)' },
    ],
  },
]

// ── State ─────────────────────────────────────────────────
const isLoading = ref(false)
const isSaving = ref(false)
const isLoadingRiwayat = ref(false)
const riwayat = ref([])
const showDialog = ref(false)
const showDetail = ref(false)
const detailData = ref(null)

const formMorse = ref({
  riwayat_jatuh: 0,
  diagnosis_sekunder: 0,
  alat_bantu_jalan: 0,
  terpasang_infus: 0,
  cara_berjalan: 0,
  status_mental: 0,
})

const formHumpty = ref({
  usia: 4,
  jenis_kelamin: 2,
  diagnosis: 4,
  gangguan_kognitif: 3,
  faktor_lingkungan: 4,
  respon_operasi: 3,
  penggunaan_obat: 3,
})

const form = ref({ catatan: '' })

// Gunakan dataset dari prop (embedded) atau dari fetchData (standalone)
const dataPasien = computed(() => props.datasetProp || fact.value)

// ── Skala otomatis berdasarkan usia ───────────────────────
const skalaPasien = computed(() => {
  const tahun = Number(dataPasien.value?.USIA_PASIEN?.tahun ?? 99)
  return tahun < 14 ? 'HUMPTY_DUMPTY' : 'MORSE'
})

// ── Header & Style ────────────────────────────────────────
const panelHeader = computed(() =>
  skalaPasien.value === 'MORSE'
    ? 'ASESMEN RISIKO JATUH – MORSE FALL SCALE (DEWASA)'
    : 'ASESMEN RISIKO JATUH – HUMPTY DUMPTY SCALE (ANAK)',
)

const dialogHeader = computed(() =>
  skalaPasien.value === 'MORSE'
    ? 'Pengkajian Risiko Jatuh — Skala Morse (Dewasa)'
    : 'Pengkajian Risiko Jatuh — Skala Humpty Dumpty (Anak)',
)

const skalaInfoStyle = computed(() =>
  skalaPasien.value === 'MORSE'
    ? 'background:#e3f2fd;border-left:4px solid #1976d2;color:#1565c0'
    : 'background:#fce4ec;border-left:4px solid #c2185b;color:#ad1457',
)

// ── Computed Morse ────────────────────────────────────────
const totalMorse = computed(() => {
  const m = formMorse.value
  return (
    (m.riwayat_jatuh ?? 0) +
    (m.diagnosis_sekunder ?? 0) +
    (m.alat_bantu_jalan ?? 0) +
    (m.terpasang_infus ?? 0) +
    (m.cara_berjalan ?? 0) +
    (m.status_mental ?? 0)
  )
})

const morseInterpretasi = computed(() => {
  const s = totalMorse.value
  if (s >= 45)
    return {
      label: 'Risiko Tinggi',
      severity: 'danger',
      keterangan: 'Lakukan intervensi pencegahan jatuh intensif',
      bg: '#ffebee',
      border: '#ef9a9a',
      color: '#b71c1c',
    }
  if (s >= 25)
    return {
      label: 'Risiko Sedang',
      severity: 'warn',
      keterangan: 'Lakukan intervensi pencegahan jatuh standar',
      bg: '#fff8e1',
      border: '#ffe082',
      color: '#e65100',
    }
  return {
    label: 'Risiko Rendah',
    severity: 'success',
    keterangan: 'Tetap lakukan orientasi lingkungan',
    bg: '#e8f5e9',
    border: '#a5d6a7',
    color: '#2e7d32',
  }
})

const morseResultStyle = computed(() => {
  const i = morseInterpretasi.value
  return `background:${i.bg};border:1.5px solid ${i.border};color:${i.color}`
})

const morseStatusClass = computed(() => {
  const s = totalMorse.value
  if (s >= 45) return 'bg-danger'
  if (s >= 25) return 'bg-warning'
  return 'bg-success'
})

// ── Computed Humpty Dumpty ────────────────────────────────
const totalHumpty = computed(() => {
  const h = formHumpty.value
  return (
    (h.usia ?? 1) +
    (h.jenis_kelamin ?? 1) +
    (h.diagnosis ?? 1) +
    (h.gangguan_kognitif ?? 1) +
    (h.faktor_lingkungan ?? 1) +
    (h.respon_operasi ?? 1) +
    (h.penggunaan_obat ?? 1)
  )
})

const humptyInterpretasi = computed(() => {
  const s = totalHumpty.value
  if (s >= 16)
    return {
      label: 'Risiko Tinggi',
      severity: 'danger',
      keterangan: 'Lakukan intervensi pencegahan jatuh intensif',
      bg: '#ffebee',
      border: '#ef9a9a',
      color: '#b71c1c',
    }
  if (s >= 12)
    return {
      label: 'Risiko Sedang',
      severity: 'warn',
      keterangan: 'Lakukan intervensi pencegahan standar',
      bg: '#fff8e1',
      border: '#ffe082',
      color: '#e65100',
    }
  return {
    label: 'Risiko Rendah',
    severity: 'success',
    keterangan: 'Tetap lakukan orientasi lingkungan',
    bg: '#e8f5e9',
    border: '#a5d6a7',
    color: '#2e7d32',
  }
})

const humptyResultStyle = computed(() => {
  const i = humptyInterpretasi.value
  return `background:${i.bg};border:1.5px solid ${i.border};color:${i.color}`
})

const humptyStatusClass = computed(() => {
  const s = totalHumpty.value
  if (s >= 16) return 'bg-danger'
  if (s >= 12) return 'bg-warning'
  return 'bg-success'
})

// ── Helper: set Humpty Dumpty usia otomatis dari data pasien ──
function setHumptyUsiaOtomatis() {
  const tahun = Number(dataPasien.value?.USIA_PASIEN?.tahun ?? 0)
  if (tahun < 3) formHumpty.value.usia = 4
  else if (tahun < 7) formHumpty.value.usia = 3
  else if (tahun < 13) formHumpty.value.usia = 2
  else formHumpty.value.usia = 1

  const jk = dataPasien.value?.JENISKELAMIN === 'L' ? 2 : 1
  formHumpty.value.jenis_kelamin = jk
}

// ── Lihat detail riwayat ──────────────────────────────────
function lihatDetail(row) {
  detailData.value = row
  showDetail.value = true
}

// ── Buka form baru (reset lalu tampilkan dialog) ──────────
function bukaForm() {
  form.value.catatan = ''
  formMorse.value = {
    riwayat_jatuh: 0,
    diagnosis_sekunder: 0,
    alat_bantu_jalan: 0,
    terpasang_infus: 0,
    cara_berjalan: 0,
    status_mental: 0,
  }
  setHumptyUsiaOtomatis()
  showDialog.value = true
}

// ── Fetch data pasien ─────────────────────────────────────
async function fetchData() {
  try {
    isLoading.value = true
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, {
      mod: 1,
      noregister: noregister.value,
      id_client: id_client.value,
    })

    if (res.data.response && res.data.response.length > 0) {
      fact.value = res.data.response[0]
    }

    setHumptyUsiaOtomatis()
  } catch (err) {
    console.error('fetchData:', err)
  } finally {
    isLoading.value = false
  }
}

// ── GET: ambil riwayat pengkajian ─────────────────────────
// Backend: GET /index.php/api/penunjang/get_resiko_jatuh/{noregister}/{id_client}
// Response: { code, message, response: [] }
async function fetchRiwayat() {
  if (!noregister.value) return
  isLoadingRiwayat.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(
      `${url}/index.php/api/penunjang/get_resiko_jatuh/${noregister.value}/${id_client.value}`,
      '',
    )
    if (res.data?.code === 200 && Array.isArray(res.data.response)) {
      riwayat.value = res.data.response
    } else {
      riwayat.value = []
    }
  } catch (err) {
    console.error('fetchRiwayat:', err)
  } finally {
    isLoadingRiwayat.value = false
  }
}

// Populasi form dari record riwayat
function loadFormFromRecord(d) {
  form.value.catatan = d.catatan ?? ''
  const params = d.parameter_json
    ? typeof d.parameter_json === 'string'
      ? JSON.parse(d.parameter_json)
      : d.parameter_json
    : null
  if (!params) return
  if (d.skala === 'HUMPTY_DUMPTY') {
    formHumpty.value.usia = params.usia ?? formHumpty.value.usia
    formHumpty.value.jenis_kelamin = params.jenis_kelamin ?? formHumpty.value.jenis_kelamin
    formHumpty.value.diagnosis = params.diagnosis ?? formHumpty.value.diagnosis
    formHumpty.value.gangguan_kognitif =
      params.gangguan_kognitif ?? formHumpty.value.gangguan_kognitif
    formHumpty.value.faktor_lingkungan =
      params.faktor_lingkungan ?? formHumpty.value.faktor_lingkungan
    formHumpty.value.respon_operasi = params.respon_operasi ?? formHumpty.value.respon_operasi
    formHumpty.value.penggunaan_obat = params.penggunaan_obat ?? formHumpty.value.penggunaan_obat
  } else {
    formMorse.value.riwayat_jatuh = params.riwayat_jatuh ?? 0
    formMorse.value.diagnosis_sekunder = params.diagnosis_sekunder ?? 0
    formMorse.value.alat_bantu_jalan = params.alat_bantu_jalan ?? 0
    formMorse.value.terpasang_infus = params.terpasang_infus ?? 0
    formMorse.value.cara_berjalan = params.cara_berjalan ?? 0
    formMorse.value.status_mental = params.status_mental ?? 0
  }
}

// ── SIMPAN: insert record baru ────────────────────────────
// Backend: POST /index.php/api/penunjang/save_resiko_jatuh
// Payload: { noregister, id_client, skala, skor_total, interpretasi, catatan, detail_items, parameter_json }
async function simpan() {
  isSaving.value = true
  try {
    const url = configStore.apiBaseUrl
    const isMorse = skalaPasien.value === 'MORSE'
    const skor = isMorse ? totalMorse.value : totalHumpty.value
    const interpretasi = isMorse ? morseInterpretasi.value.label : humptyInterpretasi.value.label
    const paramObj = isMorse ? { ...formMorse.value } : { ...formHumpty.value }

    const payload = {
      noregister: noregister.value,
      id_client: id_client.value,
      skala: skalaPasien.value,
      skor_total: skor,
      interpretasi,
      catatan: form.value.catatan ?? '',
      detail_items: isMorse ? buildDetailMorse() : buildDetailHumpty(),
      parameter_json: JSON.stringify(paramObj),
    }

    const res = await axios.post(`${url}/index.php/api/penunjang/save_resiko_jatuh`, payload)
    if (res.data?.code === 200) {
      showDialog.value = false
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: res.data.message ?? 'Pengkajian tersimpan',
        life: 3000,
      })
      await fetchRiwayat()
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res.data?.message ?? 'Gagal menyimpan',
        life: 3000,
      })
    }
  } catch (err) {
    console.error('simpan:', err)
    toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 })
  } finally {
    isSaving.value = false
  }
}

// ── HAPUS: soft delete berdasarkan id_kajian ──────────────
// Backend: POST /index.php/api/penunjang/hapus_resiko_jatuh
// Payload: { id_kajian, noregister, id_client }
function hapus(row) {
  confirm.require({
    group: 'resiko-jatuh',
    message: `Apakah Anda yakin ingin menghapus pengkajian tanggal ${formatWaktu(row.waktu_kajian)}?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Batal',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Hapus',
      severity: 'danger',
      icon: 'pi pi-trash',
    },
    accept: async () => {
      try {
        const url = configStore.apiBaseUrl
        const res = await axios.post(`${url}/index.php/api/penunjang/hapus_resiko_jatuh`, {
          id_kajian: row.id_kajian,
          noregister: noregister.value,
          id_client: id_client.value,
        })
        if (res.data?.code === 200) {
          toast.add({
            severity: 'info',
            summary: 'Dihapus',
            detail: res.data.message ?? 'Pengkajian dihapus',
            life: 3000,
          })
          await fetchRiwayat()
        } else {
          toast.add({
            severity: 'warn',
            summary: 'Gagal',
            detail: res.data?.message ?? 'Gagal menghapus',
            life: 3000,
          })
        }
      } catch (err) {
        console.error('hapus:', err)
        toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 })
      }
    },
  })
}

// ── Builder detail_items ──────────────────────────────────
function buildDetailMorse() {
  const m = formMorse.value
  const alatLabel =
    m.alat_bantu_jalan === 30
      ? 'Berpegangan Furnitur/Dinding'
      : m.alat_bantu_jalan === 15
        ? 'Kruk/Tongkat/Walker'
        : 'Tidak ada/Bedrest/Dibantu Perawat'
  const gayaLabel =
    m.cara_berjalan === 20
      ? 'Terganggu'
      : m.cara_berjalan === 10
        ? 'Lemah'
        : 'Normal/Bedrest/Immobilisasi'
  return [
    {
      parameter: 'Riwayat Jatuh',
      jawaban: m.riwayat_jatuh === 25 ? 'Ya' : 'Tidak',
      skor: m.riwayat_jatuh,
    },
    {
      parameter: 'Diagnosis Sekunder',
      jawaban: m.diagnosis_sekunder === 15 ? 'Ya' : 'Tidak',
      skor: m.diagnosis_sekunder,
    },
    { parameter: 'Alat Bantu Jalan', jawaban: alatLabel, skor: m.alat_bantu_jalan },
    {
      parameter: 'Terpasang Infus',
      jawaban: m.terpasang_infus === 20 ? 'Ya' : 'Tidak',
      skor: m.terpasang_infus,
    },
    { parameter: 'Cara Berjalan', jawaban: gayaLabel, skor: m.cara_berjalan },
    {
      parameter: 'Status Mental',
      jawaban: m.status_mental === 15 ? 'Sering lupa/Overestimasi' : 'Orientasi normal',
      skor: m.status_mental,
    },
  ]
}

function buildDetailHumpty() {
  const h = formHumpty.value
  const usiaCap = { 4: 'Di bawah 3 tahun', 3: '3–7 tahun', 2: '7–13 tahun', 1: '≥13 tahun' }
  const diagCap = {
    4: 'Kelainan neurologis',
    3: 'Perubahan oksigenasi',
    2: 'Kelainan psikis/perilaku',
    1: 'Lain-lain',
  }
  const kogCap = {
    3: 'Tidak sadar keterbatasan',
    2: 'Lupa keterbatasan',
    1: 'Mengetahui kemampuan',
  }
  const lingCap = {
    4: 'Riwayat jatuh dari tempat tidur',
    3: 'Menggunakan alat bantu',
    2: 'Di tempat tidur',
    1: 'Di luar area perawatan',
  }
  const respCap = { 3: 'Dalam 24 jam', 2: 'Dalam 48 jam', 1: '>48 jam/Tidak' }
  const obatCap = { 3: 'Multipel obat', 2: 'Salah satu obat', 1: 'Tidak ada' }
  return [
    { parameter: 'Usia', jawaban: usiaCap[h.usia] ?? h.usia, skor: h.usia },
    {
      parameter: 'Jenis Kelamin',
      jawaban: h.jenis_kelamin === 2 ? 'Laki-laki' : 'Perempuan',
      skor: h.jenis_kelamin,
    },
    { parameter: 'Diagnosis', jawaban: diagCap[h.diagnosis] ?? h.diagnosis, skor: h.diagnosis },
    {
      parameter: 'Gangguan Kognitif',
      jawaban: kogCap[h.gangguan_kognitif] ?? h.gangguan_kognitif,
      skor: h.gangguan_kognitif,
    },
    {
      parameter: 'Faktor Lingkungan',
      jawaban: lingCap[h.faktor_lingkungan] ?? h.faktor_lingkungan,
      skor: h.faktor_lingkungan,
    },
    {
      parameter: 'Respons Operasi',
      jawaban: respCap[h.respon_operasi] ?? h.respon_operasi,
      skor: h.respon_operasi,
    },
    {
      parameter: 'Penggunaan Obat',
      jawaban: obatCap[h.penggunaan_obat] ?? h.penggunaan_obat,
      skor: h.penggunaan_obat,
    },
  ]
}

// ── Helper display ────────────────────────────────────────
function formatWaktu(val) {
  if (!val) return '—'
  const d = new Date(val.replace(' ', 'T'))
  if (isNaN(d)) return val
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getSeverity(val) {
  if (!val) return 'secondary'
  const v = val.toUpperCase()
  if (v.includes('TINGGI')) return 'danger'
  if (v.includes('SEDANG')) return 'warn'
  if (v.includes('RENDAH')) return 'success'
  return 'secondary'
}

onMounted(async () => {
  if (!isEmbedded.value) {
    await fetchData()
  } else {
    setHumptyUsiaOtomatis()
  }
  await fetchRiwayat()
})
</script>

<style scoped>
.skor-box {
  border-radius: 10px;
  padding: 20px 16px;
  color: white;
  text-align: center;
}
.skor-label {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  opacity: 0.9;
}
.skor-angka {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.1;
  margin: 4px 0;
}
.skor-kategori {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.skor-intervensi {
  font-size: 0.78rem;
  opacity: 0.9;
  line-height: 1.4;
}
</style>
