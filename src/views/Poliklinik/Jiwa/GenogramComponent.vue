<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import { useConfigStore, useAuthStore } from '@/stores/config'
import AnggotaFields from './AnggotaFieldsComponent.vue'

const props = defineProps({ datapasien: { type: Object, default: null } })

const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const apiUrl = computed(() => configStore.apiBaseUrl)
const { id_client } = storeToRefs(authStore)

const loading = ref(false)
const saving = ref(false)
const lastSaved = ref(null)
const isFromPrevVisit = ref(false)
const prevNoRegister = ref(null)

// ─── Konstan SVG ─────────────────────────────────────────────────
const R = 22
const HS = 76
const HC = 58
const YG1 = 88
const YG2 = 215
const YG3 = 342
const YG4 = 465
const SVG_CX = 520

// ─── Daftar Diagnosis ICD-10 ──────────────────────────────────────
const DX_LIST = [
  { code: 'F10', label: 'F10 – Gg. Penggunaan Alkohol' },
  { code: 'F11', label: 'F11 – Gg. Penggunaan Opioid' },
  { code: 'F14', label: 'F14 – Gg. Penggunaan Stimulan' },
  { code: 'F19', label: 'F19 – Gg. Penggunaan Zat Lainnya' },
  { code: 'F20', label: 'F20 – Skizofrenia' },
  { code: 'F21', label: 'F21 – Gg. Skizotipal' },
  { code: 'F22', label: 'F22 – Gg. Waham Menetap' },
  { code: 'F25', label: 'F25 – Gg. Skizoafektif' },
  { code: 'F31', label: 'F31 – Gg. Bipolar' },
  { code: 'F32', label: 'F32 – Episode Depresi' },
  { code: 'F33', label: 'F33 – Depresi Berulang' },
  { code: 'F40', label: 'F40 – Gg. Fobia' },
  { code: 'F41', label: 'F41 – Gg. Ansietas' },
  { code: 'F42', label: 'F42 – OCD' },
  { code: 'F43', label: 'F43 – Stres / PTSD' },
  { code: 'F50', label: 'F50 – Gg. Makan' },
  { code: 'F60', label: 'F60 – Gg. Kepribadian' },
  { code: 'F70', label: 'F70 – Disabilitas Intelektual' },
  { code: 'F84', label: 'F84 – Autisme / ASD' },
  { code: 'F90', label: 'F90 – ADHD' },
  { code: 'F91', label: 'F91 – Gg. Perilaku' },
  { code: 'F03', label: 'F03 – Demensia' },
  { code: 'G30', label: 'G30 – Alzheimer' },
]

const GENDER_OPTS = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
]

// ─── Data Model ──────────────────────────────────────────────────
function mkAnggota(gender = 'L', ada = false) {
  return { ada, nama: '', gender, usia: null, meninggal: false, diagnosa: [] }
}

const data = reactive({
  g1: {
    kakek_pat: mkAnggota('L'),
    nenek_pat: mkAnggota('P'),
    kakek_mat: mkAnggota('L'),
    nenek_mat: mkAnggota('P'),
  },
  g2: {
    ayah: mkAnggota('L', true),
    ibu: mkAnggota('P', true),
    saudara_ayah: [],
    saudara_ibu: [],
  },
  g3: {
    pasien: mkAnggota('L', true),
    saudara: [],
  },
  g4: { anak: [] },
})

const addSaudaraAyah = () => data.g2.saudara_ayah.push(mkAnggota('L', true))
const rmSaudaraAyah = (i) => data.g2.saudara_ayah.splice(i, 1)
const addSaudaraIbu = () => data.g2.saudara_ibu.push(mkAnggota('P', true))
const rmSaudaraIbu = (i) => data.g2.saudara_ibu.splice(i, 1)
const addSaudara = () => data.g3.saudara.push(mkAnggota('L', true))
const rmSaudara = (i) => data.g3.saudara.splice(i, 1)
const addAnak = () => data.g4.anak.push(mkAnggota('L', true))
const rmAnak = (i) => data.g4.anak.splice(i, 1)

// ─── SVG Layout ──────────────────────────────────────────────────
const layout = computed(() => {
  const nodes = []
  const lines = []

  const g3List = [...data.g3.saudara, { ...data.g3.pasien, isPasien: true }]
  const n3 = g3List.length
  const g3StartX = SVG_CX - ((n3 - 1) * HS) / 2
  const g3Pos = g3List.map((m, i) => ({ ...m, x: g3StartX + i * HS, y: YG3 }))
  const g3cx = (g3Pos[0].x + g3Pos[n3 - 1].x) / 2

  const ayahX = g3cx - HC / 2
  const ibuX = g3cx + HC / 2
  const nSa = data.g2.saudara_ayah.length
  const g2Pat = [
    ...data.g2.saudara_ayah.map((m, i) => ({ ...m, x: ayahX - (nSa - i) * HS, y: YG2 })),
    { ...data.g2.ayah, x: ayahX, y: YG2, isAyah: true },
  ]
  const g2Mat = [
    { ...data.g2.ibu, x: ibuX, y: YG2, isIbu: true },
    ...data.g2.saudara_ibu.map((m, i) => ({ ...m, x: ibuX + (i + 1) * HS, y: YG2 })),
  ]

  const g2PatCX = (g2Pat[0].x + g2Pat[g2Pat.length - 1].x) / 2
  const g2MatCX = (g2Mat[0].x + g2Mat[g2Mat.length - 1].x) / 2
  const g1KkPat = { ...data.g1.kakek_pat, x: g2PatCX - HC / 2, y: YG1 }
  const g1NnPat = { ...data.g1.nenek_pat, x: g2PatCX + HC / 2, y: YG1 }
  const g1KkMat = { ...data.g1.kakek_mat, x: g2MatCX - HC / 2, y: YG1 }
  const g1NnMat = { ...data.g1.nenek_mat, x: g2MatCX + HC / 2, y: YG1 }

  const pasienNode = g3Pos[n3 - 1]
  const n4 = data.g4.anak.length
  const g4StartX = pasienNode.x - ((n4 - 1) * HS) / 2
  const g4Pos = data.g4.anak.map((m, i) => ({ ...m, x: g4StartX + i * HS, y: YG4 }))

  const couple = (a, b) =>
    lines.push({ type: 'couple', x1: a.x + R, y1: a.y, x2: b.x - R, y2: b.y })

  const sibship = (pA, pB, children) => {
    if (!children.length) return
    const dx = (pA.x + pB.x) / 2
    const barY = children[0].y - R - 22
    lines.push({ type: 'drop', x1: dx, y1: pA.y + R, x2: dx, y2: barY })
    if (children.length > 1)
      lines.push({
        type: 'bar',
        x1: children[0].x,
        y1: barY,
        x2: children[children.length - 1].x,
        y2: barY,
      })
    children.forEach((c) => lines.push({ type: 'drop', x1: c.x, y1: barY, x2: c.x, y2: c.y - R }))
  }

  const singleDrop = (parent, children) => {
    if (!children.length) return
    const barY = children[0].y - R - 22
    lines.push({ type: 'drop', x1: parent.x, y1: parent.y + R, x2: parent.x, y2: barY })
    if (children.length > 1)
      lines.push({
        type: 'bar',
        x1: children[0].x,
        y1: barY,
        x2: children[children.length - 1].x,
        y2: barY,
      })
    children.forEach((c) => lines.push({ type: 'drop', x1: c.x, y1: barY, x2: c.x, y2: c.y - R }))
  }

  if (g1KkPat.ada && g1NnPat.ada) {
    couple(g1KkPat, g1NnPat)
    sibship(g1KkPat, g1NnPat, g2Pat)
  } else if (g1KkPat.ada) singleDrop(g1KkPat, g2Pat)
  else if (g1NnPat.ada) singleDrop(g1NnPat, g2Pat)

  if (g1KkMat.ada && g1NnMat.ada) {
    couple(g1KkMat, g1NnMat)
    sibship(g1KkMat, g1NnMat, g2Mat)
  } else if (g1KkMat.ada) singleDrop(g1KkMat, g2Mat)
  else if (g1NnMat.ada) singleDrop(g1NnMat, g2Mat)

  const ayahNode = g2Pat[g2Pat.length - 1]
  const ibuNode = g2Mat[0]
  couple(ayahNode, ibuNode)
  sibship(ayahNode, ibuNode, g3Pos)

  if (n4 > 0) singleDrop(pasienNode, g4Pos)

  if (g1KkPat.ada) nodes.push({ ...g1KkPat, key: 'kk_pat', label: 'Kakek (Pat)' })
  if (g1NnPat.ada) nodes.push({ ...g1NnPat, key: 'nn_pat', label: 'Nenek (Pat)' })
  if (g1KkMat.ada) nodes.push({ ...g1KkMat, key: 'kk_mat', label: 'Kakek (Mat)' })
  if (g1NnMat.ada) nodes.push({ ...g1NnMat, key: 'nn_mat', label: 'Nenek (Mat)' })

  g2Pat.forEach((n, i) =>
    nodes.push({
      ...n,
      key: n.isAyah ? 'ayah' : `sa_${i}`,
      label: n.isAyah ? n.nama || 'Ayah' : n.nama || `Sdr Ayah ${i + 1}`,
    }),
  )
  g2Mat.forEach((n, i) =>
    nodes.push({
      ...n,
      key: n.isIbu ? 'ibu' : `si_${i - 1}`,
      label: n.isIbu ? n.nama || 'Ibu' : n.nama || `Sdr Ibu ${i}`,
    }),
  )
  g3Pos.forEach((n, i) =>
    nodes.push({
      ...n,
      key: n.isPasien ? 'pasien' : `sk_${i}`,
      label: n.isPasien ? n.nama || 'Pasien' : n.nama || `Sdr ${i + 1}`,
    }),
  )
  g4Pos.forEach((n, i) => nodes.push({ ...n, key: `anak_${i}`, label: n.nama || `Anak ${i + 1}` }))

  const xs = nodes.map((n) => n.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const offX = minX < 60 ? 60 - minX : 0
  const canvasW = Math.max(maxX + offX + 80, 1000)
  const canvasH = n4 > 0 ? 540 : 420

  return { nodes, lines, width: canvasW, height: canvasH, offsetX: offX }
})

// ─── Format waktu ────────────────────────────────────────────────
const formatWaktu = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return iso
  }
}

// ─── API ──────────────────────────────────────────────────────────
async function loadData() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  loading.value = true
  try {
    const { data: res } = await axios.post(`${apiUrl.value}/index.php/api/poli_jiwa/get_genogram`, {
      no_register: props.datapasien.NOPENDAFTARAN,
      nomr: props.datapasien.NOMR,
      id_client: id_client.value,
    })
    if (res?.success && res.genogram) {
      const g = res.genogram
      if (g.g1) {
        ;['kakek_pat', 'nenek_pat', 'kakek_mat', 'nenek_mat'].forEach((k) => {
          if (g.g1[k]) Object.assign(data.g1[k], g.g1[k])
        })
      }
      if (g.g2) {
        if (g.g2.ayah) Object.assign(data.g2.ayah, g.g2.ayah)
        if (g.g2.ibu) Object.assign(data.g2.ibu, g.g2.ibu)
        if (g.g2.saudara_ayah) data.g2.saudara_ayah.splice(0, Infinity, ...g.g2.saudara_ayah)
        if (g.g2.saudara_ibu) data.g2.saudara_ibu.splice(0, Infinity, ...g.g2.saudara_ibu)
      }
      if (g.g3) {
        if (g.g3.pasien) Object.assign(data.g3.pasien, g.g3.pasien)
        if (g.g3.saudara) data.g3.saudara.splice(0, Infinity, ...g.g3.saudara)
      }
      if (g.g4?.anak) data.g4.anak.splice(0, Infinity, ...g.g4.anak)
      if (res.updated_at) lastSaved.value = res.updated_at
      if (res.is_from_previous) isFromPrevVisit.value = true
      if (res.prev_no_register) prevNoRegister.value = res.prev_no_register
    }
  } catch {
    /* silent */
  } finally {
    loading.value = false
  }
}

async function simpan() {
  if (!props.datapasien?.NOPENDAFTARAN) return
  saving.value = true
  try {
    const { data: res } = await axios.post(
      `${apiUrl.value}/index.php/api/poli_jiwa/save_genogram`,
      {
        no_register: props.datapasien.NOPENDAFTARAN,
        nomr: props.datapasien.NOMR,
        id_client: id_client.value,
        genogram: JSON.stringify({
          g1: data.g1,
          g2: {
            ayah: data.g2.ayah,
            ibu: data.g2.ibu,
            saudara_ayah: data.g2.saudara_ayah,
            saudara_ibu: data.g2.saudara_ibu,
          },
          g3: { pasien: data.g3.pasien, saudara: data.g3.saudara },
          g4: { anak: data.g4.anak },
        }),
      },
    )
    if (res?.success) {
      lastSaved.value = res.updated_at || new Date().toISOString()
      isFromPrevVisit.value = false
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: 'Genogram berhasil disimpan',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: res?.message || 'Respons tidak dikenali',
        life: 3000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Tidak dapat menyimpan genogram',
      life: 3000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (props.datapasien) {
    data.g3.pasien.nama = props.datapasien.NAMALENGKAP || ''
    data.g3.pasien.gender = props.datapasien.JENISKELAMIN === 'P' ? 'P' : 'L'
    data.g3.pasien.ada = true
  }
  loadData()
})
</script>

<template>
  <div class="jiwa-wrapper">
    <!-- ══ Banner: Data dari kunjungan sebelumnya ════════════════ -->
    <div v-if="isFromPrevVisit" class="prev-banner">
      <div class="prev-banner__icon"><i class="pi pi-history"></i></div>
      <div class="prev-banner__body">
        <span class="prev-banner__title">Data Kunjungan Sebelumnya</span>
        <span class="prev-banner__sub">
          Genogram ditampilkan dari kunjungan sebelumnya
          <strong v-if="prevNoRegister">(No. Reg: {{ prevNoRegister }})</strong>. Simpan untuk
          mencatat perubahan pada kunjungan ini.
        </span>
      </div>
    </div>

    <!-- ══ Banner: Data telah disimpan ══════════════════════════ -->
    <div v-if="lastSaved && !isFromPrevVisit" class="saved-banner">
      <div class="saved-banner__icon"><i class="pi pi-check-circle"></i></div>
      <div class="saved-banner__body">
        <span class="saved-banner__title">Data telah disimpan</span>
        <span class="saved-banner__sub">
          Tersimpan pada <strong>{{ formatWaktu(lastSaved) }}</strong>
        </span>
      </div>
    </div>

    <!-- ══ Loading ═══════════════════════════════════════════════ -->
    <div v-if="loading" class="jiwa-loading">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Memuat data genogram…</span>
    </div>

    <template v-else>
      <!-- ══ Panel 1: Visualisasi Genogram ════════════════════════ -->
      <Panel>
        <template #header>
          <h6 style="color: darkcyan"><strong>GENOGRAM KELUARGA</strong></h6>
        </template>
        <template #icons>
          <Button
            label="Simpan Genogram"
            icon="pi pi-save"
            :loading="saving"
            @click="simpan"
            severity="secondary"
            size="small"
          />
        </template>

        <!-- Legenda -->
        <div class="geno-legend">
          <span class="lg-item">
            <svg width="18" height="18">
              <rect
                x="1"
                y="1"
                width="16"
                height="16"
                fill="white"
                stroke="#444"
                stroke-width="2"
              />
            </svg>
            Laki-laki
          </span>
          <span class="lg-item">
            <svg width="18" height="18">
              <circle cx="9" cy="9" r="8" fill="white" stroke="#444" stroke-width="2" />
            </svg>
            Perempuan
          </span>
          <span class="lg-item">
            <svg width="18" height="18">
              <rect
                x="1"
                y="1"
                width="16"
                height="16"
                fill="#fca5a5"
                stroke="#444"
                stroke-width="2"
              />
            </svg>
            Ada diagnosa
          </span>
          <span class="lg-item">
            <svg width="24" height="18">
              <circle cx="12" cy="9" r="6" fill="white" stroke="#4f46e5" stroke-width="2.5" />
              <circle cx="12" cy="9" r="9" fill="none" stroke="#4f46e5" stroke-width="1.2" />
            </svg>
            Proband (Pasien)
          </span>
          <span class="lg-item">
            <svg width="18" height="18">
              <rect
                x="1"
                y="1"
                width="16"
                height="16"
                fill="white"
                stroke="#444"
                stroke-width="2"
              />
              <line x1="3" y1="15" x2="15" y2="3" stroke="#666" stroke-width="2" />
            </svg>
            Meninggal
          </span>
          <span class="lg-item lg-item--note">— Pasangan &nbsp;│ Keturunan</span>
        </div>

        <div class="field-divider" />

        <!-- SVG -->
        <div style="overflow-x: auto">
          <svg
            :width="layout.width"
            :height="layout.height"
            style="font-family: sans-serif; display: block"
          >
            <g :transform="`translate(${layout.offsetX}, 0)`">
              <!-- Label generasi -->
              <text
                v-if="
                  data.g1.kakek_pat.ada ||
                  data.g1.nenek_pat.ada ||
                  data.g1.kakek_mat.ada ||
                  data.g1.nenek_mat.ada
                "
                x="14"
                :y="YG1"
                dy="5"
                class="gen-label"
              >
                G-I
              </text>
              <text x="14" :y="YG2" dy="5" class="gen-label">G-II</text>
              <text x="14" :y="YG3" dy="5" class="gen-label">G-III</text>
              <text v-if="data.g4.anak.length" x="14" :y="YG4" dy="5" class="gen-label">G-IV</text>

              <!-- Garis koneksi -->
              <line
                v-for="(l, i) in layout.lines"
                :key="`l_${i}`"
                :x1="l.x1"
                :y1="l.y1"
                :x2="l.x2"
                :y2="l.y2"
                :stroke="l.type === 'couple' ? '#475569' : '#94a3b8'"
                :stroke-width="l.type === 'couple' ? 2.5 : 1.5"
              />

              <!-- Node -->
              <g v-for="n in layout.nodes" :key="n.key">
                <!-- Double ring proband -->
                <template v-if="n.isPasien">
                  <rect
                    v-if="n.gender === 'L'"
                    :x="n.x - R - 5"
                    :y="n.y - R - 5"
                    :width="(R + 5) * 2"
                    :height="(R + 5) * 2"
                    fill="none"
                    stroke="#4f46e5"
                    stroke-width="1.5"
                  />
                  <circle
                    v-else
                    :cx="n.x"
                    :cy="n.y"
                    :r="R + 5"
                    fill="none"
                    stroke="#4f46e5"
                    stroke-width="1.5"
                  />
                </template>

                <!-- Shape -->
                <rect
                  v-if="n.gender === 'L'"
                  :x="n.x - R"
                  :y="n.y - R"
                  :width="R * 2"
                  :height="R * 2"
                  :fill="n.diagnosa?.length ? '#fca5a5' : '#f8fafc'"
                  :stroke="n.isPasien ? '#4f46e5' : '#475569'"
                  :stroke-width="n.isPasien ? 2.5 : 2"
                />
                <circle
                  v-else
                  :cx="n.x"
                  :cy="n.y"
                  :r="R"
                  :fill="n.diagnosa?.length ? '#fca5a5' : '#f8fafc'"
                  :stroke="n.isPasien ? '#4f46e5' : '#475569'"
                  :stroke-width="n.isPasien ? 2.5 : 2"
                />

                <!-- Diagonal meninggal -->
                <line
                  v-if="n.meninggal"
                  :x1="n.x - R + 3"
                  :y1="n.y + R - 3"
                  :x2="n.x + R - 3"
                  :y2="n.y - R + 3"
                  stroke="#64748b"
                  stroke-width="2"
                />

                <!-- Kode dx dalam shape -->
                <text
                  v-if="n.diagnosa?.length"
                  :x="n.x"
                  :y="n.y + 4"
                  text-anchor="middle"
                  style="font-size: 8px; fill: #7f1d1d; font-weight: 700; pointer-events: none"
                >
                  {{ n.diagnosa.slice(0, 2).join(', ') }}{{ n.diagnosa.length > 2 ? '…' : '' }}
                </text>

                <!-- Label nama -->
                <text
                  :x="n.x"
                  :y="n.y + R + 14"
                  text-anchor="middle"
                  style="font-size: 10px; fill: #334155"
                >
                  {{ n.label?.length > 11 ? n.label.slice(0, 10) + '…' : n.label }}
                </text>
                <!-- Usia -->
                <text
                  v-if="n.usia"
                  :x="n.x"
                  :y="n.y + R + 25"
                  text-anchor="middle"
                  style="font-size: 9px; fill: #94a3b8"
                >
                  {{ n.usia }} th
                </text>
              </g>
            </g>
          </svg>
        </div>
      </Panel>

      <!-- ══ Panel 2: Generasi I ═══════════════════════════════════ -->
      <Panel>
        <template #header>
          <h6 style="color: darkcyan"><strong>GENERASI I — KAKEK &amp; NENEK</strong></h6>
        </template>

        <div class="row g-4">
          <!-- Paternal -->
          <div class="col-md-6">
            <div class="fl-label">Sisi Paternal <span class="fl-hint">Pihak Ayah</span></div>

            <div class="member-card">
              <div class="member-card__head">
                <Checkbox v-model="data.g1.kakek_pat.ada" :binary="true" inputId="ada_kk_pat" />
                <label for="ada_kk_pat" class="member-card__title">Kakek Paternal</label>
                <span class="member-card__badge male">♂</span>
              </div>
              <template v-if="data.g1.kakek_pat.ada">
                <div class="field-divider" />
                <AnggotaFields
                  v-model="data.g1.kakek_pat"
                  :dx-list="DX_LIST"
                  :gender-opts="GENDER_OPTS"
                  uid="kk_pat"
                />
              </template>
            </div>

            <div class="member-card mt-2">
              <div class="member-card__head">
                <Checkbox v-model="data.g1.nenek_pat.ada" :binary="true" inputId="ada_nn_pat" />
                <label for="ada_nn_pat" class="member-card__title">Nenek Paternal</label>
                <span class="member-card__badge female">♀</span>
              </div>
              <template v-if="data.g1.nenek_pat.ada">
                <div class="field-divider" />
                <AnggotaFields
                  v-model="data.g1.nenek_pat"
                  :dx-list="DX_LIST"
                  :gender-opts="GENDER_OPTS"
                  uid="nn_pat"
                />
              </template>
            </div>
          </div>

          <!-- Maternal -->
          <div class="col-md-6">
            <div class="fl-label">Sisi Maternal <span class="fl-hint">Pihak Ibu</span></div>

            <div class="member-card">
              <div class="member-card__head">
                <Checkbox v-model="data.g1.kakek_mat.ada" :binary="true" inputId="ada_kk_mat" />
                <label for="ada_kk_mat" class="member-card__title">Kakek Maternal</label>
                <span class="member-card__badge male">♂</span>
              </div>
              <template v-if="data.g1.kakek_mat.ada">
                <div class="field-divider" />
                <AnggotaFields
                  v-model="data.g1.kakek_mat"
                  :dx-list="DX_LIST"
                  :gender-opts="GENDER_OPTS"
                  uid="kk_mat"
                />
              </template>
            </div>

            <div class="member-card mt-2">
              <div class="member-card__head">
                <Checkbox v-model="data.g1.nenek_mat.ada" :binary="true" inputId="ada_nn_mat" />
                <label for="ada_nn_mat" class="member-card__title">Nenek Maternal</label>
                <span class="member-card__badge female">♀</span>
              </div>
              <template v-if="data.g1.nenek_mat.ada">
                <div class="field-divider" />
                <AnggotaFields
                  v-model="data.g1.nenek_mat"
                  :dx-list="DX_LIST"
                  :gender-opts="GENDER_OPTS"
                  uid="nn_mat"
                />
              </template>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ══ Panel 3: Generasi II ══════════════════════════════════ -->
      <Panel>
        <template #header>
          <h6 style="color: darkcyan"><strong>GENERASI II — ORANG TUA &amp; SAUDARA</strong></h6>
        </template>

        <div class="row g-4">
          <!-- Ayah -->
          <div class="col-md-6">
            <div class="fl-label">Ayah <span class="fl-hint">Pihak Paternal</span></div>
            <div class="member-card member-card--active">
              <div class="member-card__head">
                <span class="member-card__title">Ayah</span>
                <span class="member-card__badge male">♂</span>
              </div>
              <div class="field-divider" />
              <AnggotaFields
                v-model="data.g2.ayah"
                :dx-list="DX_LIST"
                :gender-opts="GENDER_OPTS"
                uid="ayah"
              />
            </div>
          </div>

          <!-- Ibu -->
          <div class="col-md-6">
            <div class="fl-label">Ibu <span class="fl-hint">Pihak Maternal</span></div>
            <div class="member-card member-card--active">
              <div class="member-card__head">
                <span class="member-card__title">Ibu</span>
                <span class="member-card__badge female">♀</span>
              </div>
              <div class="field-divider" />
              <AnggotaFields
                v-model="data.g2.ibu"
                :dx-list="DX_LIST"
                :gender-opts="GENDER_OPTS"
                uid="ibu"
              />
            </div>
          </div>
        </div>

        <div class="field-divider" style="margin-top: 20px" />

        <!-- Saudara Ayah -->
        <div class="fl-label mt-2">
          Saudara Kandung Ayah
          <span class="fl-hint">Paman / Bibi dari pihak Ayah</span>
        </div>
        <div class="table-responsive">
          <table class="pro-table">
            <thead>
              <tr>
                <th style="width: 36px">#</th>
                <th style="width: 160px">Nama</th>
                <th style="width: 120px">JK</th>
                <th style="width: 90px">Usia (th)</th>
                <th style="width: 110px">Meninggal</th>
                <th>Diagnosa Jiwa</th>
                <th style="width: 44px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sa, i) in data.g2.saudara_ayah" :key="`sa_${i}`">
                <td class="text-center fw-bold text-muted">{{ i + 1 }}</td>
                <td>
                  <InputText
                    v-model="sa.nama"
                    placeholder="—"
                    style="width: 100%"
                    class="riwayat-input"
                  />
                </td>
                <td>
                  <Select
                    v-model="sa.gender"
                    :options="GENDER_OPTS"
                    option-label="label"
                    option-value="value"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <InputNumber
                    v-model="sa.usia"
                    :min="0"
                    :max="120"
                    placeholder="—"
                    class="riwayat-input"
                    fluid
                  />
                </td>
                <td class="text-center">
                  <Checkbox v-model="sa.meninggal" :binary="true" :inputId="`sa_mg_${i}`" />
                </td>
                <td>
                  <MultiSelect
                    v-model="sa.diagnosa"
                    :options="DX_LIST"
                    option-label="label"
                    option-value="code"
                    placeholder="— Tidak ada —"
                    display="chip"
                    style="width: 100%"
                    filter
                  />
                </td>
                <td class="text-center">
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    @click="rmSaudaraAyah(i)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!data.g2.saudara_ayah.length" class="empty-state">
          <i class="pi pi-inbox empty-state__icon"></i>
          <div class="empty-state__text">Belum ada saudara kandung Ayah</div>
        </div>
        <Button
          icon="pi pi-plus"
          label="Tambah Saudara Ayah"
          size="small"
          class="btn-add mt-2"
          @click="addSaudaraAyah"
        />

        <div class="field-divider" style="margin-top: 20px" />

        <!-- Saudara Ibu -->
        <div class="fl-label">
          Saudara Kandung Ibu
          <span class="fl-hint">Paman / Bibi dari pihak Ibu</span>
        </div>
        <div class="table-responsive">
          <table class="pro-table">
            <thead>
              <tr>
                <th style="width: 36px">#</th>
                <th style="width: 160px">Nama</th>
                <th style="width: 120px">JK</th>
                <th style="width: 90px">Usia (th)</th>
                <th style="width: 110px">Meninggal</th>
                <th>Diagnosa Jiwa</th>
                <th style="width: 44px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(si, i) in data.g2.saudara_ibu" :key="`si_${i}`">
                <td class="text-center fw-bold text-muted">{{ i + 1 }}</td>
                <td>
                  <InputText
                    v-model="si.nama"
                    placeholder="—"
                    style="width: 100%"
                    class="riwayat-input"
                  />
                </td>
                <td>
                  <Select
                    v-model="si.gender"
                    :options="GENDER_OPTS"
                    option-label="label"
                    option-value="value"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <InputNumber
                    v-model="si.usia"
                    :min="0"
                    :max="120"
                    placeholder="—"
                    class="riwayat-input"
                    fluid
                  />
                </td>
                <td class="text-center">
                  <Checkbox v-model="si.meninggal" :binary="true" :inputId="`si_mg_${i}`" />
                </td>
                <td>
                  <MultiSelect
                    v-model="si.diagnosa"
                    :options="DX_LIST"
                    option-label="label"
                    option-value="code"
                    placeholder="— Tidak ada —"
                    display="chip"
                    style="width: 100%"
                    filter
                  />
                </td>
                <td class="text-center">
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    @click="rmSaudaraIbu(i)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!data.g2.saudara_ibu.length" class="empty-state">
          <i class="pi pi-inbox empty-state__icon"></i>
          <div class="empty-state__text">Belum ada saudara kandung Ibu</div>
        </div>
        <Button
          icon="pi pi-plus"
          label="Tambah Saudara Ibu"
          size="small"
          class="btn-add mt-2"
          @click="addSaudaraIbu"
        />
      </Panel>

      <!-- ══ Panel 4: Generasi III ═════════════════════════════════ -->
      <Panel>
        <template #header>
          <h6 style="color: darkcyan">
            <strong>GENERASI III — PASIEN &amp; SAUDARA KANDUNG</strong>
          </h6>
        </template>

        <!-- Pasien -->
        <div class="fl-label">
          Pasien (Proband)
          <span class="fl-hint">Data nama & jenis kelamin otomatis dari sistem</span>
        </div>
        <div class="member-card member-card--proband">
          <div class="member-card__head">
            <i class="pi pi-star-fill" style="color: #4f46e5; font-size: 13px"></i>
            <span class="member-card__title" style="color: #4338ca">
              {{ data.g3.pasien.nama || datapasien?.NAMALENGKAP || 'Pasien' }}
            </span>
            <span
              :class="['member-card__badge', data.g3.pasien.gender === 'P' ? 'female' : 'male']"
            >
              {{ data.g3.pasien.gender === 'P' ? '♀' : '♂' }}
            </span>
          </div>
          <div class="field-divider" />
          <AnggotaFields
            v-model="data.g3.pasien"
            :dx-list="DX_LIST"
            :gender-opts="GENDER_OPTS"
            uid="pasien"
            hide-name
          />
        </div>

        <div class="field-divider" style="margin-top: 20px" />

        <!-- Saudara Kandung -->
        <div class="fl-label">
          Saudara Kandung Pasien
          <span class="fl-hint">Saudara satu ayah dan ibu</span>
        </div>
        <div class="table-responsive">
          <table class="pro-table">
            <thead>
              <tr>
                <th style="width: 36px">#</th>
                <th style="width: 160px">Nama</th>
                <th style="width: 120px">Jenis Kelamin</th>
                <th style="width: 90px">Usia (th)</th>
                <th style="width: 110px">Meninggal</th>
                <th>Diagnosa Jiwa</th>
                <th style="width: 44px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sk, i) in data.g3.saudara" :key="`sk_${i}`">
                <td class="text-center fw-bold text-muted">{{ i + 1 }}</td>
                <td>
                  <InputText
                    v-model="sk.nama"
                    placeholder="—"
                    style="width: 100%"
                    class="riwayat-input"
                  />
                </td>
                <td>
                  <Select
                    v-model="sk.gender"
                    :options="GENDER_OPTS"
                    option-label="label"
                    option-value="value"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <InputNumber
                    v-model="sk.usia"
                    :min="0"
                    :max="120"
                    placeholder="—"
                    class="riwayat-input"
                    fluid
                  />
                </td>
                <td class="text-center">
                  <Checkbox v-model="sk.meninggal" :binary="true" :inputId="`sk_mg_${i}`" />
                </td>
                <td>
                  <MultiSelect
                    v-model="sk.diagnosa"
                    :options="DX_LIST"
                    option-label="label"
                    option-value="code"
                    placeholder="— Tidak ada —"
                    display="chip"
                    style="width: 100%"
                    filter
                  />
                </td>
                <td class="text-center">
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    @click="rmSaudara(i)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!data.g3.saudara.length" class="empty-state">
          <i class="pi pi-inbox empty-state__icon"></i>
          <div class="empty-state__text">Belum ada saudara kandung</div>
          <div class="empty-state__sub">Klik <strong>Tambah</strong> untuk menambahkan</div>
        </div>
        <Button
          icon="pi pi-plus"
          label="Tambah Saudara Kandung"
          size="small"
          class="btn-add mt-2"
          @click="addSaudara"
        />
      </Panel>

      <!-- ══ Panel 5: Generasi IV (collapsed) ══════════════════════ -->
      <Panel toggleable :collapsed="true">
        <template #header>
          <h6 style="color: darkcyan"><strong>GENERASI IV — ANAK PASIEN</strong></h6>
        </template>
        <template #icons>
          <Tag
            v-if="data.g4.anak.length"
            :value="`${data.g4.anak.length} anak`"
            severity="secondary"
          />
        </template>

        <div class="table-responsive">
          <table class="pro-table">
            <thead>
              <tr>
                <th style="width: 36px">#</th>
                <th style="width: 160px">Nama</th>
                <th style="width: 120px">Jenis Kelamin</th>
                <th style="width: 90px">Usia (th)</th>
                <th style="width: 110px">Meninggal</th>
                <th>Diagnosa Jiwa</th>
                <th style="width: 44px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ak, i) in data.g4.anak" :key="`ak_${i}`">
                <td class="text-center fw-bold text-muted">{{ i + 1 }}</td>
                <td>
                  <InputText
                    v-model="ak.nama"
                    placeholder="—"
                    style="width: 100%"
                    class="riwayat-input"
                  />
                </td>
                <td>
                  <Select
                    v-model="ak.gender"
                    :options="GENDER_OPTS"
                    option-label="label"
                    option-value="value"
                    style="width: 100%"
                    class="riwayat-select"
                  />
                </td>
                <td>
                  <InputNumber
                    v-model="ak.usia"
                    :min="0"
                    :max="120"
                    placeholder="—"
                    class="riwayat-input"
                    fluid
                  />
                </td>
                <td class="text-center">
                  <Checkbox v-model="ak.meninggal" :binary="true" :inputId="`ak_mg_${i}`" />
                </td>
                <td>
                  <MultiSelect
                    v-model="ak.diagnosa"
                    :options="DX_LIST"
                    option-label="label"
                    option-value="code"
                    placeholder="— Tidak ada —"
                    display="chip"
                    style="width: 100%"
                    filter
                  />
                </td>
                <td class="text-center">
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    text
                    @click="rmAnak(i)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!data.g4.anak.length" class="empty-state">
          <i class="pi pi-inbox empty-state__icon"></i>
          <div class="empty-state__text">Belum ada data anak</div>
        </div>
        <Button
          icon="pi pi-plus"
          label="Tambah Anak"
          size="small"
          class="btn-add mt-2"
          @click="addAnak"
        />
      </Panel>
    </template>
  </div>
</template>

<style scoped>
/* ══ Base ══════════════════════════════════════════════════════════ */
.jiwa-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ══ Loading ═══════════════════════════════════════════════════════ */
.jiwa-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px;
  color: #94a3b8;
  font-size: 14px;
}

/* ══ Banners ═══════════════════════════════════════════════════════ */
.prev-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
}
.prev-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef3c7;
  color: #d97706;
  font-size: 15px;
  flex-shrink: 0;
}
.prev-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prev-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
}
.prev-banner__sub {
  font-size: 12px;
  color: #78350f;
  line-height: 1.4;
}

.saved-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
  border-radius: 8px;
}
.saved-banner__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #16a34a;
  font-size: 14px;
  flex-shrink: 0;
}
.saved-banner__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.saved-banner__title {
  font-size: 13px;
  font-weight: 700;
  color: #14532d;
}
.saved-banner__sub {
  font-size: 12px;
  color: #166534;
  line-height: 1.4;
}

/* ══ Field labels & divider ════════════════════════════════════════ */
.fl-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.fl-hint {
  font-size: 10px;
  font-weight: 400;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
}
.field-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 14px 0;
}

/* ══ Member cards ══════════════════════════════════════════════════ */
.member-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  background: #f8fafc;
}
.member-card--active {
  background: #f0f9ff;
  border-color: #bae6fd;
}
.member-card--proband {
  background: #eef2ff;
  border-color: #c7d2fe;
  border-left: 3px solid #4f46e5;
}
.member-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: default;
}
.member-card__title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
  cursor: pointer;
}
.member-card__badge {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}
.member-card__badge.male {
  color: #2563eb;
}
.member-card__badge.female {
  color: #db2777;
}

/* ══ Table ═════════════════════════════════════════════════════════ */
.pro-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.pro-table th {
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 8px 10px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}
.pro-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.pro-table tbody tr:hover td {
  background: #f8fafc;
}
.riwayat-input {
  font-size: 13px !important;
}
.riwayat-select {
  font-size: 13px !important;
}

/* ══ Empty state ═══════════════════════════════════════════════════ */
.empty-state {
  text-align: center;
  padding: 24px 16px;
  color: #94a3b8;
}
.empty-state__icon {
  font-size: 28px;
  margin-bottom: 8px;
  display: block;
}
.empty-state__text {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}
.empty-state__sub {
  font-size: 12px;
  margin-top: 4px;
}

/* ══ Add button ════════════════════════════════════════════════════ */
.btn-add {
  background: #f0fdf4 !important;
  border: 1px dashed #86efac !important;
  color: #15803d !important;
}
.btn-add:hover {
  background: #dcfce7 !important;
}

/* ══ SVG helpers ═══════════════════════════════════════════════════ */
.gen-label {
  font-size: 10px;
  fill: #cbd5e1;
  font-style: italic;
}

/* ══ Genogram legend ═══════════════════════════════════════════════ */
.geno-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #475569;
}
.lg-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.lg-item--note {
  color: #94a3b8;
  font-size: 11px;
}
</style>
