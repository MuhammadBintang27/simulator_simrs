<template>
  <Panel header="ASESMEN RISIKO JATUH – MORSE FALL SCALE (DEWASA)">
    <div v-if="isLoading" class="text-center p-3">
      <i class="pi pi-spin pi-spinner" /> Memuat data...
    </div>

    <div v-else class="row g-3">
      <!-- ── TABEL PENILAIAN ── -->
      <div class="col-md-8">
        <table class="table table-bordered table-sm align-middle mb-0 rj-table">
          <thead class="table-secondary text-center">
            <tr>
              <th style="width: 3%">No</th>
              <th style="width: 35%">Parameter</th>
              <th>Pilihan</th>
              <th style="width: 10%">Nilai</th>
            </tr>
          </thead>
          <tbody>
            <!-- 1 -->
            <tr>
              <td class="text-center fw-bold">1</td>
              <td>
                Riwayat Jatuh
                <div><small class="text-muted">dalam 3 bulan terakhir</small></div>
              </td>
              <td>
                <Select
                  v-model="form.riwayatJatuh"
                  :options="riwayatJatuhOptions"
                  option-label="caption"
                  placeholder="Pilih..."
                  class="w-100"
                />
              </td>
              <td class="text-center">
                <Tag
                  :value="String(form.riwayatJatuh?.value ?? 0)"
                  :severity="form.riwayatJatuh?.value > 0 ? 'danger' : 'secondary'"
                />
              </td>
            </tr>
            <!-- 2 -->
            <tr>
              <td class="text-center fw-bold">2</td>
              <td>
                Diagnosis Sekunder
                <div><small class="text-muted">≥ 2 diagnosis medis</small></div>
              </td>
              <td>
                <Select
                  v-model="form.diagnosisSekunder"
                  :options="yaTidakOptions"
                  option-label="caption"
                  placeholder="Pilih..."
                  class="w-100"
                />
              </td>
              <td class="text-center">
                <Tag
                  :value="String(form.diagnosisSekunder?.value ?? 0)"
                  :severity="form.diagnosisSekunder?.value > 0 ? 'danger' : 'secondary'"
                />
              </td>
            </tr>
            <!-- 3 -->
            <tr>
              <td class="text-center fw-bold">3</td>
              <td>Alat Bantu Jalan</td>
              <td>
                <Select
                  v-model="form.alatBantuJalan"
                  :options="alatBantuJalanOptions"
                  option-label="caption"
                  placeholder="Pilih..."
                  class="w-100"
                />
              </td>
              <td class="text-center">
                <Tag
                  :value="String(form.alatBantuJalan?.value ?? 0)"
                  :severity="form.alatBantuJalan?.value > 0 ? 'danger' : 'secondary'"
                />
              </td>
            </tr>
            <!-- 4 -->
            <tr>
              <td class="text-center fw-bold">4</td>
              <td>
                Terpasang Infus
                <div><small class="text-muted">IV Line / Heparin Lock</small></div>
              </td>
              <td>
                <Select
                  v-model="form.terpasangInfus"
                  :options="yaTidakOptions"
                  option-label="caption"
                  placeholder="Pilih..."
                  class="w-100"
                />
              </td>
              <td class="text-center">
                <Tag
                  :value="String(form.terpasangInfus?.value ?? 0)"
                  :severity="form.terpasangInfus?.value > 0 ? 'danger' : 'secondary'"
                />
              </td>
            </tr>
            <!-- 5 -->
            <tr>
              <td class="text-center fw-bold">5</td>
              <td>Cara / Gaya Berjalan</td>
              <td>
                <Select
                  v-model="form.caraBerjalan"
                  :options="caraBerjalanOptions"
                  option-label="caption"
                  placeholder="Pilih..."
                  class="w-100"
                />
              </td>
              <td class="text-center">
                <Tag
                  :value="String(form.caraBerjalan?.value ?? 0)"
                  :severity="form.caraBerjalan?.value > 0 ? 'danger' : 'secondary'"
                />
              </td>
            </tr>
            <!-- 6 -->
            <tr>
              <td class="text-center fw-bold">6</td>
              <td>Status Mental</td>
              <td>
                <Select
                  v-model="form.statusMental"
                  :options="statusMentalOptions"
                  option-label="caption"
                  placeholder="Pilih..."
                  class="w-100"
                />
              </td>
              <td class="text-center">
                <Tag
                  :value="String(form.statusMental?.value ?? 0)"
                  :severity="form.statusMental?.value > 0 ? 'danger' : 'secondary'"
                />
              </td>
            </tr>
          </tbody>
          <tfoot class="table-light">
            <tr>
              <td colspan="3" class="text-end fw-bold pe-3">TOTAL SKOR</td>
              <td class="text-center">
                <Tag
                  :value="String(totalSkor)"
                  :severity="totalSkor <= 24 ? 'success' : totalSkor <= 50 ? 'warn' : 'danger'"
                  class="fw-bold"
                  style="font-size: 1rem; padding: 4px 12px"
                />
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Catatan -->
        <div class="mt-3">
          <label class="fw-bold mb-1 d-block">Catatan / Tindakan Pencegahan</label>
          <Textarea
            v-model="form.catatan"
            rows="3"
            class="w-100"
            placeholder="Tuliskan tindakan pencegahan yang telah dilakukan..."
          />
        </div>

        <!-- Tombol Simpan -->
        <div class="mt-3 d-flex justify-content-end">
          <Button
            label="Simpan"
            icon="pi pi-save"
            :loading="isSaving"
            severity="success"
            @click="simpan"
          />
        </div>
      </div>

      <!-- ── PANEL SKOR ── -->
      <div class="col-md-4 d-flex flex-column gap-3">
        <!-- Kotak skor utama -->
        <div :class="['skor-box', statusClass]">
          <div class="skor-label">TOTAL SKOR MORSE</div>
          <div class="skor-angka">{{ totalSkor }}</div>
          <div class="skor-kategori">{{ kategori }}</div>
          <Divider />
          <div class="skor-intervensi">{{ intervensi }}</div>
        </div>

        <!-- Legenda -->
        <table class="table table-sm table-bordered text-center mb-0" style="font-size: 0.82rem">
          <thead class="table-secondary">
            <tr>
              <th>Rentang Skor</th>
              <th>Tingkat Risiko</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0 – 24</td>
              <td><span class="badge bg-success">Rendah</span></td>
            </tr>
            <tr>
              <td>25 – 50</td>
              <td><span class="badge bg-warning text-dark">Sedang</span></td>
            </tr>
            <tr>
              <td>&gt; 50</td>
              <td><span class="badge bg-danger">Tinggi</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Panel>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'

const configStore = useConfigStore()
useAuthStore()
const toast = useToast()

const props = defineProps({
  dataset: { type: Object, default: () => ({}) },
  noregister: { type: String, default: '' },
})

// ── Options ──────────────────────────────────────────────
const riwayatJatuhOptions = [
  { caption: 'Tidak', value: 0 },
  { caption: 'Ya', value: 25 },
]

const yaTidakOptions = [
  { caption: 'Tidak', value: 0 },
  { caption: 'Ya', value: 15 },
]

const alatBantuJalanOptions = [
  { caption: 'Tidak ada / Bedrest / Dibantu Perawat', value: 0 },
  { caption: 'Kruk / Tongkat / Walker', value: 15 },
  { caption: 'Berpegangan pada Furnitur / Dinding', value: 30 },
]

const caraBerjalanOptions = [
  { caption: 'Normal / Bedrest / Immobilisasi', value: 0 },
  { caption: 'Lemah', value: 10 },
  { caption: 'Terganggu', value: 20 },
]

const statusMentalOptions = [
  { caption: 'Orientasi sesuai kemampuan diri', value: 0 },
  { caption: 'Sering lupa keterbatasan / overestimasi kemampuan', value: 15 },
]

// ── State ─────────────────────────────────────────────────
const isLoading = ref(false)
const isSaving = ref(false)

const form = ref({
  riwayatJatuh: riwayatJatuhOptions[0],
  diagnosisSekunder: yaTidakOptions[0],
  alatBantuJalan: alatBantuJalanOptions[0],
  terpasangInfus: yaTidakOptions[0],
  caraBerjalan: caraBerjalanOptions[0],
  statusMental: statusMentalOptions[0],
  catatan: '',
  total_skor: 0,
})

// ── Computed ──────────────────────────────────────────────
const totalSkor = computed(() => {
  return (
    (form.value.riwayatJatuh?.value ?? 0) +
    (form.value.diagnosisSekunder?.value ?? 0) +
    (form.value.alatBantuJalan?.value ?? 0) +
    (form.value.terpasangInfus?.value ?? 0) +
    (form.value.caraBerjalan?.value ?? 0) +
    (form.value.statusMental?.value ?? 0)
  )
})

const kategori = computed(() => {
  if (totalSkor.value <= 24) return 'RISIKO RENDAH'
  if (totalSkor.value <= 50) return 'RISIKO SEDANG'
  return 'RISIKO TINGGI'
})

const statusClass = computed(() => {
  if (totalSkor.value <= 24) return 'bg-success'
  if (totalSkor.value <= 50) return 'bg-warning'
  return 'bg-danger'
})

const intervensi = computed(() => {
  if (totalSkor.value <= 24) return 'Lakukan intervensi pencegahan jatuh standar'
  if (totalSkor.value <= 50) return 'Lakukan intervensi pencegahan jatuh sedang'
  return 'Lakukan intervensi pencegahan jatuh tinggi'
})

// ── API ───────────────────────────────────────────────────
async function getData() {
  if (!props.noregister) return
  isLoading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/KajianAwal/get_resiko_jatuh`, {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
    })
    if (res.data?.data) {
      const d = res.data.data
      form.value.riwayatJatuh =
        riwayatJatuhOptions.find((o) => o.value === d.riwayat_jatuh) ?? riwayatJatuhOptions[0]
      form.value.diagnosisSekunder =
        yaTidakOptions.find((o) => o.value === d.diagnosis_sekunder) ?? yaTidakOptions[0]
      form.value.alatBantuJalan =
        alatBantuJalanOptions.find((o) => o.value === d.alat_bantu_jalan) ??
        alatBantuJalanOptions[0]
      form.value.terpasangInfus =
        yaTidakOptions.find((o) => o.value === d.terpasang_infus) ?? yaTidakOptions[0]
      form.value.caraBerjalan =
        caraBerjalanOptions.find((o) => o.value === d.cara_berjalan) ?? caraBerjalanOptions[0]
      form.value.statusMental =
        statusMentalOptions.find((o) => o.value === d.status_mental) ?? statusMentalOptions[0]
      form.value.catatan = d.catatan ?? ''
    }
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

async function simpan() {
  isSaving.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      noregister: props.noregister,
      norm: props.dataset?.NOMR,
      riwayat_jatuh: form.value.riwayatJatuh?.value ?? 0,
      diagnosis_sekunder: form.value.diagnosisSekunder?.value ?? 0,
      alat_bantu_jalan: form.value.alatBantuJalan?.value ?? 0,
      terpasang_infus: form.value.terpasangInfus?.value ?? 0,
      cara_berjalan: form.value.caraBerjalan?.value ?? 0,
      status_mental: form.value.statusMental?.value ?? 0,
      catatan: form.value.catatan,
      total_skor: totalSkor.value,
      kategori: kategori.value,
    }
    await axios.post(`${url}/index.php/api/KajianAwal/save_resiko_jatuh`, payload)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Data risiko jatuh tersimpan',
      life: 3000,
    })
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Terjadi kesalahan saat menyimpan',
      life: 3000,
    })
  } finally {
    isSaving.value = false
  }
}

// ── Expose ────────────────────────────────────────────────
function getValue() {
  return {
    riwayat_jatuh: form.value.riwayatJatuh?.value ?? 0,
    diagnosis_sekunder: form.value.diagnosisSekunder?.value ?? 0,
    alat_bantu_jalan: form.value.alatBantuJalan?.value ?? 0,
    terpasang_infus: form.value.terpasangInfus?.value ?? 0,
    cara_berjalan: form.value.caraBerjalan?.value ?? 0,
    status_mental: form.value.statusMental?.value ?? 0,
    catatan: form.value.catatan,
    total_skor: totalSkor.value,
    kategori: kategori.value,
  }
}

function setValue(data) {
  if (!data) return
  form.value.riwayatJatuh =
    riwayatJatuhOptions.find((o) => o.value === data.riwayat_jatuh) ?? riwayatJatuhOptions[0]
  form.value.diagnosisSekunder =
    yaTidakOptions.find((o) => o.value === data.diagnosis_sekunder) ?? yaTidakOptions[0]
  form.value.alatBantuJalan =
    alatBantuJalanOptions.find((o) => o.value === data.alat_bantu_jalan) ?? alatBantuJalanOptions[0]
  form.value.terpasangInfus =
    yaTidakOptions.find((o) => o.value === data.terpasang_infus) ?? yaTidakOptions[0]
  form.value.caraBerjalan =
    caraBerjalanOptions.find((o) => o.value === data.cara_berjalan) ?? caraBerjalanOptions[0]
  form.value.statusMental =
    statusMentalOptions.find((o) => o.value === data.status_mental) ?? statusMentalOptions[0]
  form.value.catatan = data.catatan ?? ''
}

defineExpose({ getValue, setValue })

onMounted(() => {
  getData()
})
</script>

<style scoped>
.rj-table td,
.rj-table th {
  vertical-align: middle;
}

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
