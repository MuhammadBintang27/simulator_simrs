<template>
  <div class="rme-section">
    <div class="rme-section-title">🧠 SIRIRAJ STROKE SCORE</div>

    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span> Memuat data Siriraj Score...
    </div>

    <div v-else-if="!hasData" class="rme-empty-note">
      <i class="pi pi-minus-circle"></i> Tidak ada data Siriraj Score untuk kunjungan ini.
    </div>

    <div v-else>
      <!-- Tabel Parameter -->
      <table class="rme-tbl-data">
        <thead>
          <tr>
            <th style="width: 35%">Parameter</th>
            <th>Nilai</th>
            <th style="width: 12%; text-align: center">Skor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Derajat Kesadaran</td>
            <td>{{ consciousnessLabel }}</td>
            <td class="text-center">{{ data.kesadaran }}</td>
          </tr>
          <tr>
            <td>
              Muntah Proyektil
              <small class="siriraj-note">dalam 2 jam setelah onset</small>
            </td>
            <td>{{ data.muntah == 1 ? 'Ya' : 'Tidak' }}</td>
            <td class="text-center">{{ data.muntah }}</td>
          </tr>
          <tr>
            <td>
              Sakit Kepala Hebat
              <small class="siriraj-note">dalam 2 jam setelah onset</small>
            </td>
            <td>{{ data.sakit_kepala == 1 ? 'Ya' : 'Tidak' }}</td>
            <td class="text-center">{{ data.sakit_kepala }}</td>
          </tr>
          <tr>
            <td>Tekanan Darah Diastolik</td>
            <td>{{ data.tekanan_darah_diastolik }} mmHg</td>
            <td class="text-center">{{ data.tekanan_darah_diastolik }}</td>
          </tr>
          <tr>
            <td>
              Penanda Ateroma
              <small class="siriraj-note">DM, Angina, atau Klaudikasio</small>
            </td>
            <td>{{ data.ateroma == 1 ? 'Satu atau Lebih' : 'Tidak Ada' }}</td>
            <td class="text-center">{{ data.ateroma }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="siriraj-total-row">
            <td colspan="2" style="text-align: right; font-weight: 700">Total Skor Siriraj</td>
            <td class="text-center" style="font-weight: 800; font-size: 16px">{{ computedSSS }}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Interpretasi -->
      <div class="siriraj-interpretation" :class="interpretationClass">
        <span class="siriraj-interp-label">Interpretasi :</span>
        <span class="siriraj-interp-text">{{ interpretationText }}</span>
      </div>

      <!-- Formula -->
      <div class="siriraj-formula-box">
        <span class="siriraj-formula-label">Formula :</span>
        (2.5 × Kesadaran) + (2 × Muntah) + (2 × Sakit Kepala) + (0.1 × Diastolik) − (3 × Ateroma) −
        12
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import axios from 'axios'

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

const hasData = computed(() => !!data.value)

const consciousnessLabel = computed(() => {
  const map = { 0: 'Sadar Penuh', 1: 'Somnolen', 2: 'Semi-koma / Koma' }
  return map[Number(data.value?.kesadaran)] ?? '-'
})

const computedSSS = computed(() => {
  if (!data.value) return '-'
  const score =
    2.5 * Number(data.value.kesadaran) +
    2 * Number(data.value.muntah) +
    2 * Number(data.value.sakit_kepala) +
    0.1 * Number(data.value.tekanan_darah_diastolik) -
    3 * Number(data.value.ateroma) -
    12
  return score.toFixed(1)
})

const interpretationText = computed(() => {
  const s = parseFloat(computedSSS.value)
  if (isNaN(s)) return '-'
  if (s > 1) return 'Stroke Hemoragik (Pendarahan)'
  if (s < -1) return 'Stroke Iskemik (Penyumbatan)'
  return 'Hasil Meragukan — Segera CT-Scan'
})

const interpretationClass = computed(() => {
  const s = parseFloat(computedSSS.value)
  if (isNaN(s)) return ''
  if (s > 1) return 'siriraj-hemoragik'
  if (s < -1) return 'siriraj-iskemik'
  return 'siriraj-meragukan'
})

const fetchData = async () => {
  if (!props.noreg || !id_client.value || !configStore.apiBaseUrl) return
  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/get_siriraj/${props.noreg}/${id_client.value}`,
    )

    const list = res.data?.response ?? []
    data.value = Array.isArray(list) && list.length > 0 ? list[0] : null
  } catch (e) {
    console.error('Siriraj fetch error:', e)
    data.value = null
  } finally {
    loading.value = false
    reportSectionData('siriraj', !!data.value)
  }
}

watch(
  [() => props.noreg, id_client],
  ([noreg, idClient]) => {
    if (noreg && idClient) fetchData()
  },
  { immediate: true },
)
</script>

<style scoped>
.siriraj-note {
  display: block;
  font-size: 10px;
  color: #999;
  margin-top: 1px;
}

.siriraj-total-row td {
  background: #37474f !important;
  color: #fff !important;
  padding: 7px 10px;
}

.siriraj-interpretation {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  border-left: 4px solid #bdbdbd;
  background: #fafafa;
  border-radius: 2px;
  font-size: 12px;
}
.siriraj-hemoragik {
  border-left-color: #c62828;
  background: #fff5f5;
}
.siriraj-iskemik {
  border-left-color: #1565c0;
  background: #f0f6ff;
}
.siriraj-meragukan {
  border-left-color: #e65100;
  background: #fff8f0;
}

.siriraj-interp-label {
  font-weight: 700;
  color: #37474f;
  white-space: nowrap;
}
.siriraj-interp-text {
  color: #1a1a2e;
  font-weight: 600;
}

.siriraj-formula-box {
  margin-top: 6px;
  padding: 5px 10px;
  font-size: 10.5px;
  color: #78909c;
  border-top: 1px dashed #e0e0e0;
}
.siriraj-formula-label {
  font-weight: 700;
  color: #546e7a;
  margin-right: 4px;
}
</style>
