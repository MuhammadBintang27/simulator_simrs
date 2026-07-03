<template>
  <div class="spri-wrap">
    <div v-if="loading" class="rme-loading-row">
      <span class="rme-loading-dot"></span>
      Memuat data SPRI...
    </div>

    <div v-else-if="!spriData" class="rme-empty-note">
      <i class="pi pi-info-circle"></i> Data SPRI tidak tersedia.
    </div>

    <div v-else class="spri-doc">
      <!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
      <div class="spri-hdr">
        <div class="spri-hdr-logo">
          <img src="https://ws-simrs.net/logo/bpjs.jpg" />
        </div>
        <div class="spri-hdr-center">
          <div class="spri-title">SURAT RENCANA RAWAT INAP</div>
          <div class="spri-rs-name">{{ company }}</div>
        </div>
        <div class="spri-hdr-right">
          <div class="spri-spri-no">{{ spriData.SPRI }}</div>
          <svg
            class="spri-barcode-bars"
            :viewBox="`0 0 ${barcodePattern.total} 36`"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <rect
              v-for="(bar, i) in barcodePattern.bars"
              :key="i"
              :x="bar.x"
              y="0"
              :width="bar.w"
              height="25"
              fill="#111"
            />
          </svg>
        </div>
      </div>

      <div class="spri-divider"></div>

      <!-- ══ BODY ════════════════════════════════════════════════════════════ -->
      <div class="spri-body">
        <!-- Kolom kiri -->
        <div class="spri-col-l">
          <p class="spri-intro">Mohon Pemeriksaan dan Penanganan Lebih Lanjut</p>
          <table class="spri-tbl">
            <colgroup>
              <col style="width: 108px" />
              <col style="width: 14px" />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td class="sl">No Kartu</td>
                <td class="ss">:</td>
                <td class="sv mono">{{ spriData.NO_KARTU }}</td>
              </tr>
              <tr>
                <td class="sl">Nama Peserta</td>
                <td class="ss">:</td>
                <td class="sv bold">{{ spriData.NAMA }}</td>
              </tr>
              <tr>
                <td class="sl">Tgl Lahir</td>
                <td class="ss">:</td>
                <td class="sv">{{ spriData.TGLLAHIR }}&emsp;( {{ spriData.USIA }} )</td>
              </tr>
              <tr>
                <td class="sl">Jenis Kelamin</td>
                <td class="ss">:</td>
                <td class="sv">{{ spriData.JENISKELAMIN }}</td>
              </tr>
              <tr>
                <td class="sl">Dianosa</td>
                <td class="ss">:</td>
                <td class="sv">{{ spriData.DIAGNOSA || '' }}</td>
              </tr>
              <tr>
                <td class="sl">Rencana Inap</td>
                <td class="ss">:</td>
                <td class="sv">{{ spriData.TANGGAL }}</td>
              </tr>
            </tbody>
          </table>
          <p class="spri-closing">Demikian Atas bantuannya, diucapkan banyak terima kasih</p>
        </div>

        <!-- Kolom kanan -->
        <div class="spri-col-r">
          <div class="spri-rm-wrap">
            <span class="spri-rm-lbl">RM</span>
            <span class="spri-rm-val">{{ spriData.NORM }}</span>
          </div>
        </div>
      </div>

      <!-- ══ FOOTER ══════════════════════════════════════════════════════════ -->
      <div class="spri-footer">
        <div class="spri-foot-r">
          <div class="spri-dpjp-lbl">Mengetahui DPJP</div>
          <div class="spri-qr-wrap">
            <QrcodeVue :value="spriData.SPRI || ''" :size="30" level="M" render-as="svg" />
          </div>
          <div class="spri-dokter">{{ spriData.NAMADOKTER || '—' }}</div>
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
const { id_client, company } = storeToRefs(authStore)

const reportSectionData = inject('reportSectionData', () => {})

const loading = ref(false)
const spriData = ref(null)

// ── Barcode visual generator ───────────────────────────────────────────────
const barcodePattern = computed(() => {
  const str = spriData.value?.SPRI || ''
  const bars = []
  let x = 2
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    const w1 = 1 + (code % 3)
    const gap1 = 1 + ((code >> 2) % 2)
    const w2 = 1 + ((code >> 4) % 2)
    const gap2 = 1 + ((code >> 6) % 2)
    bars.push({ x, w: w1 })
    x += w1 + gap1
    bars.push({ x, w: w2 })
    x += w2 + gap2
  }
  return { bars, total: x + 2 }
})

// ── Fetch ─────────────────────────────────────────────────────────────────
const fetchData = async () => {
  console.log('data SPRI', props.dataPasien)

  const noSpri = props.dataPasien?.KONTROL_SPRI
  const idClientVal = id_client.value

  if (!noSpri || !idClientVal || !configStore.apiBaseUrl) return

  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/sprigetdata`,
      {
        NO_SPRI_KONTROL_ULANG: noSpri,
        mode: 'history1',
        ID_CLIENT: idClientVal,
      },
    )

    const list = res.data?.response ?? res.data ?? []
    spriData.value = Array.isArray(list) && list.length > 0 ? list[0] : null
  } catch (e) {
    console.error('SPRI fetch error:', e)
    spriData.value = null
  } finally {
    loading.value = false
    reportSectionData('spri-ranap', !!spriData.value)
  }
}

watch(
  [() => props.dataPasien, id_client],
  ([dataPasien]) => {
    const noSpri = dataPasien?.KONTROL_SPRI
    if (noSpri && id_client.value && configStore.apiBaseUrl) fetchData()
  },
  { immediate: true, deep: false },
)
</script>

<style scoped>
.spri-wrap {
  width: 100%;
}

/* ══ Dokumen ═════════════════════════════════════════════════════════════ */
.spri-doc {
  width: 100%;
  font-size: 12px;
  color: #111;
  line-height: 1;
  font-family: Arial, sans-serif;
}

/* ══ HEADER ══════════════════════════════════════════════════════════════ */
.spri-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 8px;
  width: 100%;
  box-sizing: border-box;
}

.spri-hdr-logo {
  flex: 0 0 auto;
}
.spri-hdr-logo img {
  height: 52px;
  width: auto;
  max-width: 160px;
  object-fit: contain;
  display: block;
}

.spri-hdr-center {
  flex: 1 1 0%;
  min-width: 0;
  text-align: center;
}
.spri-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.spri-rs-name {
  font-size: 12px;
  color: #333;
  margin-top: 2px;
}

.spri-hdr-right {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.spri-spri-no {
  font-size: 11.5px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
  color: #111;
}
.spri-barcode-bars {
  width: 220px;
  height: 36px;
  display: block;
}

/* ══ Divider ═════════════════════════════════════════════════════════════ */
.spri-divider {
  border: none;
  border-top: 1px solid #aab8c4;
  margin: 0;
}

/* ══ BODY ════════════════════════════════════════════════════════════════ */
.spri-body {
  display: flex;
  gap: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 16px 10px;
  align-items: flex-start;
}

.spri-col-l {
  flex: 1 1 0%;
  min-width: 0;
}
.spri-col-r {
  flex: 0 0 160px;
  width: 160px;
  padding-left: 16px;
  padding-top: 24px;
}

.spri-intro {
  font-size: 11.5px;
  margin: 0 0 8px 4px;
  color: #222;
}

.spri-tbl {
  border-collapse: collapse;
  width: auto;
  min-width: 320px;
}

.sl {
  color: #222;
  font-size: 11.5px;
  white-space: nowrap;
  vertical-align: top;
  padding: 3px 0;
}
.ss {
  color: #555;
  vertical-align: top;
  padding: 3px 6px;
}
.sv {
  color: #111;
  font-size: 11.5px;
  vertical-align: top;
  padding: 3px 0;
}
.bold {
  font-weight: 700;
}
.mono {
  font-family: 'Courier New', monospace;
}

.spri-closing {
  font-size: 11.5px;
  margin: 14px 0 0 4px;
  color: #222;
}

.spri-rm-wrap {
  display: flex;
  gap: 12px;
  align-items: baseline;
  font-size: 12px;
}
.spri-rm-lbl {
  color: #555;
}
.spri-rm-val {
  font-size: 13px;
  font-weight: 700;
  color: #111;
}

/* ══ FOOTER ══════════════════════════════════════════════════════════════ */
.spri-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 8px;
}
.spri-foot-r {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.spri-dpjp-lbl {
  font-size: 11.5px;
  color: #222;
}
.spri-qr-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.spri-dokter {
  font-size: 12px;
  font-weight: 700;
  color: #111;
  text-align: center;
}
</style>
