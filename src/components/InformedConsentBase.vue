<template>
  <loading_overlay :is-loading="loading" message="Memuat data..." />

  <!-- Banner -->
  <div v-if="!signerOnly" class="ic-banner mb-3" :style="bannerStyle">
    <div class="ic-banner-icon"><i :class="bannerIcon"></i></div>
    <div class="ic-banner-content">
      <h4 class="ic-banner-title">{{ title }}</h4>
      <p class="ic-banner-desc">{{ desc }}</p>
    </div>
  </div>

  <div class="row g-3">
    <!-- ===== SLOT: Extra Fields (dokter, diagnosis, dll) ===== -->
    <div v-if="!signerOnly && $slots['extra-fields']" class="col-12">
      <div class="ic-card">
        <div class="ic-card-header info-header">
          <i class="pi pi-info-circle me-2 mr-2"></i>
          <span>INFORMASI PASIEN</span>
        </div>
        <div class="ic-card-body">
          <!-- Info pasien dari transaksi -->
          <div v-if="fact" class="patient-info-strip mb-3">
            <div class="pi-item pi-item--full">
              <span class="pi-label">Nama Pasien</span>
              <span class="pi-value pi-value--name">{{ fact.NAMAPASIEN }}</span>
            </div>
            <div class="pi-item">
              <span class="pi-label">No. Rekam Medis</span>
              <span class="pi-value mono">{{ fact.NOMR }}</span>
            </div>
            <div class="pi-item">
              <span class="pi-label">JK / Usia</span>
              <span class="pi-value">
                {{ fact.JENISKELAMIN === 'L' ? 'Laki-laki' : 'Perempuan' }},
                {{ fact.USIA_PASIEN?.tahun }} tahun
              </span>
            </div>
            <div class="pi-item">
              <span class="pi-label">Asal Poli / Unit</span>
              <span class="pi-value">{{ fact.POLI }}</span>
            </div>
            <div class="pi-item">
              <span class="pi-label">Masuk</span>
              <span class="pi-value">{{ fact.MASUKPOLY_DISPLAY }}</span>
            </div>
            <div class="pi-item">
              <span class="pi-label">Cara Bayar</span>
              <span class="pi-value">{{ fact.CARABAYAR }}</span>
            </div>
          </div>
          <slot name="extra-fields" :form="extraForm" :fact="fact" />
        </div>
      </div>
    </div>

    <!-- ===== ISI CONSENT ===== -->
    <div v-if="!signerOnly" class="col-12">
      <div class="ic-card">
        <div class="ic-card-header consent-header">
          <i class="pi pi-file-check me-2"></i>
          <span>SURAT PERSETUJUAN</span>
        </div>
        <div class="ic-card-body">
          <!-- Identitas penandatangan -->
          <p class="consent-intro">Yang bertanda tangan di bawah ini, saya:</p>
          <div class="signer-box mb-3">
            <div class="row g-2">
              <div class="col-md-5">
                <div class="field-group mb-0">
                  <label class="field-label">Nama Penandatangan</label>
                </div>
              </div>
              <div class="col-md-4">
                <div class="field-group mb-0">
                  <label class="field-label">Hubungan dengan Pasien </label>
                  <Select
                    v-model="baseForm.hubungan"
                    :options="hubunganOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Pilih hubungan..."
                    class="w-100"
                    style="width: 100%"
                  />
                </div>
              </div>
              <div class="col-md-3">
                <div class="field-group mb-0">
                  <label class="field-label">No. KTP / Identitas</label>
                  <InputText
                    v-model="baseForm.noKtp"
                    class="w-100"
                    placeholder="Nomor identitas..."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Teks consent dari slot -->
          <div class="consent-text-block">
            <slot name="consent-text" :form="extraForm" :baseForm="baseForm" />

            <!-- Checkboxes konfirmasi -->
            <div class="consent-checks mt-3">
              <div class="consent-check-item">
                <Checkbox v-model="conf.mengerti" inputId="c1" :binary="true" />
                <label for="c1"
                  >Saya telah mengerti dan memahami seluruh penjelasan yang diberikan</label
                >
              </div>
              <div class="consent-check-item">
                <Checkbox v-model="conf.bertanya" inputId="c2" :binary="true" />
                <label for="c2"
                  >Saya telah diberikan kesempatan untuk bertanya dan pertanyaan saya telah dijawab
                  dengan memuaskan</label
                >
              </div>
              <div class="consent-check-item">
                <Checkbox v-model="conf.setuju" inputId="c3" :binary="true" />
                <label for="c3"
                  ><strong>Saya menyetujui</strong> tindakan yang telah dijelaskan dengan segala
                  risikonya</label
                >
              </div>
            </div>

            <!-- Tempat & Waktu -->
            <p class="consent-closing">
              Persetujuan ini saya buat dengan sadar, tanpa paksaan, pada:
            </p>
            <div class="consent-date-row">
              <div class="field-group mb-0" style="flex: 1">
                <label class="field-label">Tempat</label>
                <InputText v-model="baseForm.tempat" class="w-100" placeholder="Kota..." />
              </div>
              <div class="field-group mb-0" style="flex: 1.5">
                <label class="field-label">Tanggal &amp; Waktu</label>
                <DatePicker
                  v-model="baseForm.tanggalConsent"
                  dateFormat="dd MM yy"
                  showTime
                  hourFormat="24"
                  showIcon
                  class="w-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== PENANDATANGAN DINAMIS ===== -->
    <div class="col-12">
      <div class="ic-card">
        <div class="ic-card-header ttd-header">
          <i class="pi pi-pen-to-square me-2"></i>
          <span>FOTO &amp; TANDA TANGAN</span>
          <small class="ms-auto">Klik area tanda tangan untuk layar penuh</small>
        </div>
        <div class="ic-card-body">
          <div class="signers-grid">
            <div
              v-for="(signer, idx) in signers"
              :key="signer.id"
              class="signer-card"
              :class="{ 'signer-card--signed': signer.is_auth }"
            >
              <!-- Fields: disembunyikan jika sudah terautentikasi -->
              <div class="signer-card-top" v-if="!signer.is_auth">
                <div class="signer-fields">
                  <div class="field-group mb-1">
                    <label class="field-label-sm">Hubungan dengan Pasien </label>
                    <Select
                      v-model="signer.hubungan"
                      :options="hubunganOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Pilih hubungan..."
                      class="w-100"
                      style="width: 100%"
                    />
                  </div>
                  <div class="field-group mb-0">
                    <label class="field-label-sm">Nama Lengkap</label>
                    <InputText
                      v-model="signer.nama"
                      class="w-100"
                      placeholder="Nama lengkap..."
                      size="small"
                    />
                  </div>
                </div>
                <Button
                  v-if="signers.length > 1"
                  icon="pi pi-times"
                  severity="danger"
                  text
                  size="small"
                  class="btn-remove-signer"
                  @click="removeSigner(idx)"
                  v-tooltip.top="'Hapus'"
                />
              </div>

              <!-- Badge terautentikasi: tampil jika is_auth -->
              <div v-if="signer.is_auth" class="signer-auth-banner">
                <div class="signer-auth-banner-left">
                  <i class="pi pi-verified signer-auth-icon"></i>
                  <div>
                    <p class="signer-auth-role">{{ signer.hubungan }}</p>
                    <p class="signer-auth-name">{{ signer.nama || signer.hubungan }}</p>
                  </div>
                </div>
                <div class="signer-auth-stamp">
                  <i class="pi pi-lock"></i>
                  <span>Terverifikasi</span>
                  <small v-if="signer.verif_times">{{ signer.verif_times }}</small>
                </div>
              </div>

              <!-- Foto -->
              <div class="photo-area">
                <div v-if="signer.photoData" class="photo-captured">
                  <img :src="signer.photoData" class="photo-img" alt="Foto" />
                  <!-- Tombol ambil ulang: hanya jika belum terautentikasi -->
                  <button
                    v-if="!signer.is_auth"
                    class="photo-retake-btn"
                    @click.stop="retakePhoto(idx)"
                    title="Ambil ulang foto"
                  >
                    <i class="pi pi-camera"></i>
                  </button>
                </div>
                <div v-else-if="!signer.is_auth" class="photo-empty" @click.stop="openCamera(idx)">
                  <i class="pi pi-camera"></i>
                  <span>Ambil Foto</span>
                </div>
                <div v-else class="photo-locked">
                  <i class="pi pi-user"></i>
                  <span>Tidak ada foto</span>
                </div>
              </div>

              <!-- Canvas / Signature preview -->
              <div
                class="canvas-preview-area"
                :class="{ 'has-signature': signer.signatureData, 'is-locked': signer.is_auth }"
                @click="!signer.is_auth && openFullscreenCanvas(idx)"
                :title="
                  signer.is_auth ? 'Tanda tangan telah terverifikasi' : 'Klik untuk tanda tangan'
                "
              >
                <img
                  v-if="signer.signatureData"
                  :src="signer.signatureData"
                  class="signature-preview-img"
                  alt="TTD"
                />
                <div v-else-if="!signer.is_auth" class="canvas-empty-hint">
                  <i class="pi pi-pen-to-square"></i>
                  <span>Klik untuk tanda tangan</span>
                </div>
                <div v-if="signer.signatureData" class="signed-badge">
                  <i class="pi pi-verified me-1"></i>Sudah ditandatangani
                </div>
              </div>

              <!-- Tombol ulangi: hanya jika belum terautentikasi -->
              <div class="signer-card-foot" v-if="signer.signatureData && !signer.is_auth">
                <Button
                  label="Ulangi"
                  icon="pi pi-refresh"
                  severity="warn"
                  text
                  size="small"
                  @click.stop="clearSignerSignature(idx)"
                />
              </div>
              <div class="signer-name-line">{{ signer.nama || signer.hubungan }}</div>
            </div>

            <!-- Add button: sembunyikan jika ada signer yang sudah terautentikasi -->
            <div class="add-signer-card" @click="addSigner" v-if="!signers.some((s) => s.is_auth)">
              <i class="pi pi-plus-circle"></i>
              <span>Tambah Penandatangan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Bar -->
  <div v-if="!signerOnly" class="ic-action-bar mt-3">
    <div class="ic-action-info">
      <i class="pi pi-info-circle me-2" style="color: #6c757d"></i>
      <span>Pastikan tanda tangan sudah dibubuhkan sebelum menyimpan.</span>
    </div>
    <div class="ic-action-buttons">
      <Button
        label="Cetak"
        icon="pi pi-print"
        severity="secondary"
        outlined
        class="me-2"
        @click="printForm"
      />
      <Button
        label="Simpan"
        icon="pi pi-save"
        class="btn-save-ic"
        :style="saveBtnStyle"
        :loading="loading"
        @click="simpanData"
      />
    </div>
  </div>

  <!-- ===== FULLSCREEN SIGNATURE OVERLAY ===== -->
  <Teleport to="body">
    <Transition name="fs-fade">
      <div v-if="fullscreenActive" class="fs-overlay">
        <div class="fs-header" :style="bannerStyle">
          <div class="fs-header-info">
            <i class="pi pi-pen-to-square me-2"></i>
            <span>Tanda Tangan — {{ activeSigner?.hubungan }}</span>
            <small v-if="activeSigner?.nama" class="ms-2 fs-subtitle">{{
              activeSigner.nama
            }}</small>
          </div>
          <div class="fs-header-actions">
            <Button
              label="Hapus"
              icon="pi pi-trash"
              severity="danger"
              outlined
              size="small"
              class="me-2"
              @click="clearFullscreenCanvas"
            />
            <Button
              label="Selesai"
              icon="pi pi-check"
              severity="success"
              size="small"
              @click="saveFullscreenSignature"
            />
          </div>
        </div>
        <div class="fs-canvas-wrap">
          <canvas
            ref="fullscreenCanvas"
            class="fs-canvas"
            @mousedown="fsDraw($event)"
            @mousemove="fsMove($event)"
            @mouseup="fsStop"
            @mouseleave="fsStop"
            @touchstart.prevent="fsTouchStart($event)"
            @touchmove.prevent="fsTouchMove($event)"
            @touchend="fsStop"
          ></canvas>
          <div v-if="!fsHasDrawing" class="fs-placeholder">
            <i class="pi pi-pen-to-square"></i>
            <span>Tanda tangan di sini menggunakan mouse atau touchpad</span>
          </div>
        </div>
        <div class="fs-footer">
          <span class="fs-hint"
            >Gunakan mouse atau touchpad · "Hapus" untuk ulang · "Selesai" jika sudah</span
          >
        </div>
      </div>
    </Transition>

    <!-- ===== CAMERA OVERLAY ===== -->
    <Transition name="fs-fade">
      <div v-if="cameraActive" class="camera-overlay">
        <div class="camera-header">
          <div class="camera-header-info">
            <i class="pi pi-camera me-2"></i>
            <span>Foto Penandatangan</span>
            <small v-if="activePhotoSigner" class="ms-2 fs-subtitle">
              — {{ activePhotoSigner.label
              }}{{ activePhotoSigner.nama ? ': ' + activePhotoSigner.nama : '' }}
            </small>
          </div>
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            outlined
            size="small"
            @click="closeCamera"
          />
        </div>
        <div class="camera-video-wrap">
          <video ref="videoRef" class="camera-video" autoplay playsinline></video>
          <canvas ref="captureCanvas" style="display: none"></canvas>
          <div v-if="cameraError" class="camera-error-msg">
            <i class="pi pi-exclamation-triangle me-2"></i>{{ cameraError }}
          </div>
        </div>
        <div class="camera-footer">
          <Button
            icon="pi pi-camera"
            label="Ambil Foto"
            severity="success"
            size="large"
            class="btn-capture"
            :disabled="!!cameraError"
            @click="capturePhoto"
          />
          <div class="camera-hint">
            Posisikan wajah penandatangan di tengah frame, lalu tekan "Ambil Foto"
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Toast />
</template>

<script setup>
import { ref, computed, reactive, nextTick, watch, onMounted, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import { RouterLink, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps({
  title: { type: String, default: 'Informed Consent' },
  desc: { type: String, default: '' },
  bannerColor: { type: Array, default: () => ['#1a3a5c', '#2563a8'] },
  bannerIcon: { type: String, default: 'pi pi-file-edit' },
  apiEndpoint: { type: String, required: true },
  extraForm: { type: Object, default: () => ({}) },
  // initial assets (from server) e.g. { signers: [ { hubungan, signature_url, photo_url } ] }
  initialAssets: { type: Object, default: null },
  // Konfirmasi dari parent (jika signerOnly, parent yang kelola checkboxnya)
  confirmations: { type: Object, default: null },
  // Tampilkan hanya bagian penandatangan (untuk digunakan di dalam A4 preview)
  signerOnly: { type: Boolean, default: false },
  defaultSigners: {
    type: Array,
    default: () => [
      { hubungan: 'Keluarga / Wali', nama: '' },
      { hubungan: 'Saksi', nama: '' },
    ],
  },
})

const emit = defineEmits(['before-save', 'patient-loaded', 'saved'])

// ─── Stores ───────────────────────────────────────────────────────────────────

const route = useRoute()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// ─── Computed styles ──────────────────────────────────────────────────────────

const bannerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.bannerColor[0]} 0%, ${props.bannerColor[1]} 100%)`,
}))
const saveBtnStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.bannerColor[0]}, ${props.bannerColor[1]})`,
  border: 'none',
  fontWeight: '600',
}))

// ─── Base form ────────────────────────────────────────────────────────────────

const loading = ref(false)
const fact = ref(null)

const baseForm = reactive({
  noregister: route.params.noreg || route.query.noreg || '',
  kodeboking: route.params.kodebooking || route.query.kodebooking || '',
  id_client: id_client.value,
  namaPenandatangan: '',
  hubungan: 'Orang Tua',
  noKtp: '',
  tempat: '',
  tanggalConsent: new Date(),
})

const conf = reactive({ mengerti: false, bertanya: false, setuju: false })

// Opsi hubungan untuk PENANDATANGAN UTAMA (keluarga)
const hubunganOptions = [
  { label: 'Pasien Sendiri', value: 'Pasien Sendiri' },
  { label: 'Suami / Istri', value: 'Suami/Istri' },
  { label: 'Orang Tua', value: 'Orang Tua' },
  { label: 'Anak', value: 'Anak' },
  { label: 'Saudara Kandung', value: 'Saudara Kandung' },
  { label: 'Wali yang Ditunjuk', value: 'Wali' },
]

// ─── Dynamic signers ──────────────────────────────────────────────────────────

let signerIdCounter = props.defaultSigners.length + 1
const signers = ref(
  props.defaultSigners.map((s, i) => ({
    id: i + 1,
    hubungan: s.hubungan || 'Keluarga / Wali',
    nama: s.nama || '',
    signatureData: '',
    photoData: '',
  })),
)

// Map server-provided initial assets (URLs) into `signers` so existing signatures/photos are shown
watch(
  () => props.initialAssets,
  (val) => {
    if (!val || !val.signers || !Array.isArray(val.signers)) return
    const assets = val.signers

    signers.value = assets.map((a, i) => {
      const existing = signers.value.find((s) => s.hubungan === a.hubungan) || {}

      return {
        id: i + 1,
        hubungan: a.hubungan || existing.hubungan || 'Keluarga / Wali',
        nama: existing.nama_lengkap || a.nama_lengkap || '',
        signatureData: a.signature_url || '',
        photoData: a.photo_url || '',
        verif_name: a.verif_name || '',
        is_auth: a.is_auth || false,
        verif_times: a.verif_times || 0,
      }
    })
  },
  { immediate: true },
)

const addSigner = () =>
  signers.value.push({
    id: signerIdCounter++,
    hubungan: 'Keluarga / Wali',
    nama: '',
    signatureData: '',
    photoData: '',
  })

const removeSigner = (idx) => signers.value.splice(idx, 1)
const clearSignerSignature = (idx) => {
  signers.value[idx].signatureData = ''
}

// ─── Fullscreen Signature Canvas ──────────────────────────────────────────────

const fullscreenActive = ref(false)
const fullscreenCanvas = ref(null)
const activeSignerIndex = ref(null)
const fsHasDrawing = ref(false)
const activeSigner = computed(() =>
  activeSignerIndex.value !== null ? signers.value[activeSignerIndex.value] : null,
)

let fsCtx = null
let fsPainting = false

const openFullscreenCanvas = async (idx) => {
  activeSignerIndex.value = idx
  fullscreenActive.value = true
  fsHasDrawing.value = false
  fsPainting = false
  await nextTick()
  await nextTick()
  const canvas = fullscreenCanvas.value
  if (!canvas) return
  canvas.width = canvas.parentElement.offsetWidth || window.innerWidth * 0.9
  canvas.height = canvas.parentElement.offsetHeight || window.innerHeight * 0.72
  fsCtx = canvas.getContext('2d')
  Object.assign(fsCtx, {
    strokeStyle: '#1a3a5c',
    lineWidth: 2.5,
    lineCap: 'round',
    lineJoin: 'round',
  })
  fsCtx.clearRect(0, 0, canvas.width, canvas.height)
  if (signers.value[idx].signatureData) {
    const imgSrc = signers.value[idx].signatureData
    const img = new Image()
    const drawImg = (src) => {
      img.onload = () => fsCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = src
    }
    if (imgSrc.startsWith('data:')) {
      drawImg(imgSrc)
    } else {
      // URL server → fetch as blob agar canvas tidak tainted
      fetch(imgSrc)
        .then((r) => r.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob)
          img.onload = () => {
            fsCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(objectUrl)
          }
          img.src = objectUrl
        })
        .catch(() => {})
    }
    fsHasDrawing.value = true
  }
}

const getFsPos = (e) => {
  const c = fullscreenCanvas.value,
    r = c.getBoundingClientRect()
  return {
    x: (e.clientX - r.left) * (c.width / r.width),
    y: (e.clientY - r.top) * (c.height / r.height),
  }
}

const fsDraw = (e) => {
  if (!fsCtx) return
  fsPainting = true
  const { x, y } = getFsPos(e)
  fsCtx.beginPath()
  fsCtx.moveTo(x, y)
}
const fsMove = (e) => {
  if (!fsPainting || !fsCtx) return
  const { x, y } = getFsPos(e)
  fsCtx.lineTo(x, y)
  fsCtx.stroke()
  fsHasDrawing.value = true
}
const fsStop = () => {
  if (fsCtx) fsCtx.beginPath()
  fsPainting = false
}

const fsTouchStart = (e) => {
  if (!fsCtx) return
  fsPainting = true
  const c = fullscreenCanvas.value,
    r = c.getBoundingClientRect(),
    t = e.touches[0]
  fsCtx.beginPath()
  fsCtx.moveTo(
    (t.clientX - r.left) * (c.width / r.width),
    (t.clientY - r.top) * (c.height / r.height),
  )
}
const fsTouchMove = (e) => {
  if (!fsPainting || !fsCtx) return
  const c = fullscreenCanvas.value,
    r = c.getBoundingClientRect(),
    t = e.touches[0]
  fsCtx.lineTo(
    (t.clientX - r.left) * (c.width / r.width),
    (t.clientY - r.top) * (c.height / r.height),
  )
  fsCtx.stroke()
  fsHasDrawing.value = true
}

const clearFullscreenCanvas = () => {
  if (!fsCtx || !fullscreenCanvas.value) return
  fsCtx.clearRect(0, 0, fullscreenCanvas.value.width, fullscreenCanvas.value.height)
  fsHasDrawing.value = false
  fsPainting = false
}

const saveFullscreenSignature = () => {
  if (fullscreenCanvas.value && activeSignerIndex.value !== null && fsHasDrawing.value)
    signers.value[activeSignerIndex.value].signatureData =
      fullscreenCanvas.value.toDataURL('image/png')
  fullscreenActive.value = false
  activeSignerIndex.value = null
}

// ─── Camera ───────────────────────────────────────────────────────────────────

const cameraActive = ref(false)
const activePhotoCameraIndex = ref(null)
const videoRef = ref(null)
const captureCanvas = ref(null)
const cameraStream = ref(null)
const cameraError = ref('')

const activePhotoSigner = computed(() =>
  activePhotoCameraIndex.value !== null ? signers.value[activePhotoCameraIndex.value] : null,
)

const openCamera = async (idx) => {
  activePhotoCameraIndex.value = idx
  cameraError.value = ''
  cameraActive.value = true
  await nextTick()
  await nextTick()
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    cameraStream.value = stream
    if (videoRef.value) videoRef.value.srcObject = stream
  } catch (err) {
    cameraError.value =
      err.name === 'NotAllowedError'
        ? 'Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.'
        : err.name === 'NotFoundError'
          ? 'Kamera tidak ditemukan pada perangkat ini.'
          : `Gagal membuka kamera: ${err.message}`
  }
}

const capturePhoto = () => {
  const video = videoRef.value,
    canvas = captureCanvas.value
  if (!video || !canvas) return
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Kamera belum siap, coba lagi.',
      life: 3000,
    })
    return
  }
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(video, 0, 0, w, h)
  if (activePhotoCameraIndex.value !== null)
    signers.value[activePhotoCameraIndex.value].photoData = canvas.toDataURL('image/jpeg', 0.85)
  closeCamera()
}

const retakePhoto = (idx) => {
  signers.value[idx].photoData = ''
  openCamera(idx)
}

const closeCamera = () => {
  cameraStream.value?.getTracks().forEach((t) => t.stop())
  cameraStream.value = null
  if (videoRef.value) videoRef.value.srcObject = null
  cameraActive.value = false
  activePhotoCameraIndex.value = null
  cameraError.value = ''
}

// ─── Save ─────────────────────────────────────────────────────────────────────

const simpanData = async () => {
  const unsigned = signers.value.filter((s) => !s.signatureData)
  if (unsigned.length) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: `${unsigned.length} penandatangan belum membubuhkan tanda tangan`,
      life: 3000,
    })
    return
  }

  try {
    loading.value = true
    toast.add({ severity: 'info', summary: 'Proses', detail: 'Menyimpan data...', life: 2000 })

    // Kirim satu request: base64 + nama langsung ke apiEndpoint
    // Backend yang handle upload file + soft-delete lama + insert baru sekaligus
    const signerPayload = signers.value
      .filter((s) => s.signatureData)
      .map((s) => ({
        label: s.hubungan,
        nama: s.nama || '',
        // Backend PHP membaca 'signatureData' dan 'photoData' (base64 data URL)
        signatureData:
          typeof s.signatureData === 'string' && s.signatureData.startsWith('data:')
            ? s.signatureData
            : null,
        photoData:
          typeof s.photoData === 'string' && s.photoData.startsWith('data:') ? s.photoData : null,
        // URL lama jika tidak ada base64 baru (re-save tanpa re-sign)
        signature_url:
          typeof s.signatureData === 'string' && !s.signatureData.startsWith('data:')
            ? s.signatureData
            : null,
        photo_url:
          typeof s.photoData === 'string' &&
          s.photoData.length > 0 &&
          !s.photoData.startsWith('data:')
            ? s.photoData
            : null,
      }))

    const payload = {
      id_client: id_client.value,
      noregister: route.params.noreg || route.query.noreg || baseForm.noregister,
      ...baseForm,
      ...props.extraForm,
      confirmations: props.confirmations ? { ...props.confirmations } : { ...conf },
      signers: signerPayload,
    }

    emit('before-save', { baseForm, extraForm: props.extraForm, conf, signers: signerPayload })

    const { data } = await axios.post(`${configStore.apiBaseUrl}${props.apiEndpoint}`, payload)

    const code = data?.code || data?.metadata?.code

    if (code === 200 || code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Informed consent berhasil disimpan',
        life: 3000,
      })
      emit('saved', data?.response ?? data)
    } else
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: data?.message || data?.metadata?.message || 'Gagal menyimpan',
        life: 3000,
      })
  } catch (err) {
    console.error('[simpanData]', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Terjadi kesalahan saat menyimpan',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

// ─── Fetch Data Pasien (dari noregister) ──────────────────────────────────────

const fetchData = async () => {
  const noreg = route.params.noreg || route.query.noreg
  if (!noreg) return
  try {
    loading.value = true
    const { data } = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/transaksi_pasien/history_versi4`,
      { mod: 1, noregister: noreg, id_client: id_client.value },
    )
    if (data.response?.length > 0) {
      fact.value = data.response[0]
      // Update noregister / nomr di baseForm
      baseForm.noregister = fact.value.NOPENDAFTARAN || noreg
      // Emit ke view agar tiap consent bisa mapping field-nya sendiri
      emit('patient-loaded', fact.value)
    }
  } catch (err) {
    console.error('[InformedConsentBase] fetchData error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

const printForm = () => window.print()

// ─── Body scroll lock ─────────────────────────────────────────────────────────

watch([fullscreenActive, cameraActive], ([fs, cam]) => {
  document.body.style.overflow = fs || cam ? 'hidden' : ''
})
onUnmounted(() => closeCamera())

defineExpose({ simpanData, printForm, signers })
</script>

<style scoped>
/* ====== Banner ====== */
.ic-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-radius: 4px;
  padding: 1rem 1.5rem;
  color: #fff;
}
.ic-banner-icon {
  flex-shrink: 0;
  font-size: 2rem;
  opacity: 0.85;
}
.ic-banner-title {
  margin: 0 0 0.2rem;
  font-size: 1.05rem;
  font-weight: 700;
}
.ic-banner-desc {
  margin: 0;
  font-size: 0.78rem;
  opacity: 0.85;
  line-height: 1.4;
}

/* ====== Cards ====== */
.ic-card {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  background: #fff;
  border: 1px solid #e9ecef;
}
.ic-card-header {
  display: flex;
  align-items: center;
  padding: 0.7rem 1.1rem;
  font-weight: 700;
  font-size: 0.88rem;
  color: #fff;
  letter-spacing: 0.04em;
  background: linear-gradient(135deg, #1a3a5c, #2563a8);
}
.ic-card-header small {
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.88;
}
.info-header {
  background: linear-gradient(135deg, #78350f, #d97706);
}
.consent-header {
  background: linear-gradient(135deg, #14532d, #16a34a);
}
.ttd-header {
  background: linear-gradient(135deg, #4a1259, #7c3aed);
}
.ic-card-body {
  padding: 1rem 1.1rem;
}

/* ====== Fields ====== */
.field-group {
  margin-bottom: 0.85rem;
}
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.3rem;
}
.field-label-sm {
  display: block;
  font-size: 0.73rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.2rem;
}

/* ====== Consent ====== */
.consent-intro {
  font-size: 0.88rem;
  color: #374151;
  margin-bottom: 0.75rem;
}
.signer-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}
.consent-text-block {
  font-size: 0.84rem;
  color: #374151;
  line-height: 1.7;
}
.consent-text-block p {
  margin-bottom: 0.5rem;
}
.consent-checks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.consent-check-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
}
.consent-check-item label {
  cursor: pointer;
  flex: 1;
  line-height: 1.4;
}
.consent-closing {
  margin: 1rem 0 0.4rem;
  font-size: 0.82rem;
  font-style: italic;
  color: #6b7280;
}
.consent-date-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* ====== Signers ====== */
.signers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}
.signer-card {
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s;
}
.signer-card:hover {
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.12);
}
.signer-card--signed {
  border-color: #86efac;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15);
}
.signer-card--signed:hover {
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.25);
}
.signer-card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  padding: 0.65rem 0.75rem 0.5rem;
  background: #faf5ff;
  border-bottom: 1px solid #f3e8ff;
}
.signer-auth-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-bottom: 1px solid #86efac;
}
.signer-auth-banner-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.signer-auth-icon {
  color: #16a34a;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.signer-auth-role {
  font-size: 0.65rem;
  font-weight: 600;
  color: #15803d;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}
.signer-auth-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #14532d;
  margin: 0;
}
.signer-auth-stamp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #16a34a;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  flex-shrink: 0;
}
.signer-auth-stamp small {
  font-size: 0.58rem;
  font-weight: 400;
  color: #15803d;
}
.signer-fields {
  flex: 1;
}
.btn-remove-signer {
  flex-shrink: 0;
  margin-top: 4px;
}

/* Photo */
.photo-area {
  flex-shrink: 0;
}
.photo-captured {
  position: relative;
  width: 100%;
  height: 120px;
  background: #0f172a;
  overflow: hidden;
}
.photo-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}
.photo-retake-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: background 0.15s;
}
.photo-retake-btn:hover {
  background: rgba(124, 58, 237, 0.85);
}
.photo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  height: 80px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f8fafc;
  border-bottom: 1px dashed #e2e8f0;
  transition:
    background 0.15s,
    color 0.15s;
}
.photo-empty:hover {
  background: #eff6ff;
  color: #3b82f6;
}
.photo-empty .pi {
  font-size: 1.4rem;
}
.photo-locked {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  height: 60px;
  color: #d1d5db;
  font-size: 0.72rem;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}
.photo-locked .pi {
  font-size: 1.2rem;
}

/* Canvas preview */
.canvas-preview-area {
  flex: 1;
  min-height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  transition: background 0.15s;
  overflow: hidden;
}
.canvas-preview-area:hover {
  background: #eff6ff;
}
.canvas-preview-area.is-locked {
  cursor: default;
  background: #f9fafb;
}
.canvas-preview-area.is-locked:hover {
  background: #f9fafb;
}
.canvas-preview-area.has-signature {
  background: #fff;
  min-height: 195px;
}
.signature-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}
.canvas-empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: #cbd5e1;
  font-size: 0.78rem;
  text-align: center;
  padding: 1rem;
  pointer-events: none;
  user-select: none;
}
.canvas-empty-hint .pi {
  font-size: 1.6rem;
}
.signed-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: #dcfce7;
  color: #15803d;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 0.65rem;
  font-weight: 700;
}
.signer-card-foot {
  padding: 0.35rem 0.75rem;
  border-bottom: 1px solid #f3e8ff;
  background: #faf5ff;
}
.signer-name-line {
  text-align: center;
  font-size: 0.72rem;
  color: #6b7280;
  padding: 0.4rem 0.75rem;
  font-style: italic;
}

.add-signer-card {
  min-height: 130px;
  border: 2px dashed #ddd6fe;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #7c3aed;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: #faf5ff;
}
.add-signer-card:hover {
  background: #f5f3ff;
  border-color: #7c3aed;
}
.add-signer-card .pi {
  font-size: 1.5rem;
}

/* ====== Action Bar ====== */
.ic-action-bar {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 0.8rem 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.ic-action-info {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
}
.ic-action-buttons {
  display: flex;
  align-items: center;
}

/* ====== Fullscreen Canvas ====== */
.fs-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.fs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  color: #fff;
  flex-shrink: 0;
  gap: 1rem;
}
.fs-header-info {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.95rem;
}
.fs-subtitle {
  font-weight: 400;
  opacity: 0.85;
  font-size: 0.82rem;
}
.fs-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.fs-canvas-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: crosshair;
  border-bottom: 2px dashed #ddd6fe;
}
.fs-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}
.fs-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #e2d9f3;
  font-size: 1.1rem;
  pointer-events: none;
  user-select: none;
}
.fs-placeholder .pi {
  font-size: 3.5rem;
}
.fs-footer {
  flex-shrink: 0;
  text-align: center;
  padding: 0.6rem;
  background: #f9fafb;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ====== Camera ====== */
.camera-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: #0f172a;
  display: flex;
  flex-direction: column;
}
.camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
  flex-shrink: 0;
  gap: 1rem;
}
.camera-header-info {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.95rem;
}
.camera-video-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.camera-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  display: block;
}
.camera-error-msg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.9);
  color: #f87171;
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem;
}
.camera-footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.04);
}
.btn-capture {
  min-width: 180px;
  height: 52px;
  font-size: 1rem !important;
  font-weight: 700 !important;
}
.camera-hint {
  font-size: 0.72rem;
  color: #64748b;
  text-align: center;
}

/* ====== Transition ====== */
.fs-fade-enter-active,
.fs-fade-leave-active {
  transition: opacity 0.2s ease;
}
.fs-fade-enter-from,
.fs-fade-leave-to {
  opacity: 0;
}

/* ====== Responsive ====== */
@media (max-width: 768px) {
  .ic-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .ic-action-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .consent-date-row {
    flex-direction: column;
  }
  .signers-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 480px) {
  .signers-grid {
    grid-template-columns: 1fr;
  }
}

/* ====== Print ====== */
@media print {
  .ic-action-bar,
  .fs-overlay,
  .camera-overlay {
    display: none;
  }
  .ic-banner {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* ====== Patient Info Strip (base) ====== */
.patient-info-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.35rem 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-left: 4px solid #2563a8;
  border-radius: 8px;
  padding: 0.65rem 1rem;
}
.pi-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.pi-item--full {
  grid-column: 1/-1;
}
.pi-label {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1d4ed8;
  opacity: 0.75;
}
.pi-value {
  font-size: 0.8rem;
  color: #1e293b;
  font-weight: 500;
}
.pi-value--name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e3a8a;
}
.pi-value.mono {
  font-family: monospace;
  font-size: 0.75rem;
  color: #2563a8;
}
</style>
