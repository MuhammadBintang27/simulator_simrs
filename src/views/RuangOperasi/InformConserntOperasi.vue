<template>
  <loading_overlay :is-loading="loading" message="Memuat data..." />

  <!-- Banner -->
  <div class="ic-banner mb-3">
    <div class="ic-banner-icon"><i class="pi pi-file-edit"></i></div>
    <div class="ic-banner-content">
      <h4 class="ic-banner-title">Informed Consent Tindakan Anestesi</h4>
      <p class="ic-banner-desc">
        Formulir persetujuan tindakan pembiusan / anestesi yang wajib ditandatangani oleh pasien
        atau keluarga/wali yang bertanggung jawab sebelum tindakan dilakukan.
      </p>
    </div>
  </div>

  <div class="row g-3">
    <!-- ===== ISI CONSENT ===== -->
    <div class="col-12">
      <div class="ic-card">
        <div class="ic-card-header consent-header">
          <i class="pi pi-file-check me-2"></i>
          <span>SURAT PERSETUJUAN TINDAKAN ANESTESI</span>
        </div>
        <div class="ic-card-body">
          <!-- Penandatangan -->
          <p class="consent-intro ml-1">Yang bertanda tangan di bawah ini, saya:</p>

          <div class="signer-box mb-3">
            <div class="row g-2">
              <div class="col-md-5">
                <div class="field-group mb-0">
                  <label class="field-label">Nama Penandatangan Utama</label>
                  <InputText
                    v-model="form.namaPenandatangan"
                    class="w-100"
                    placeholder="Nama lengkap..."
                  />
                </div>
              </div>
              <div class="col-md-4">
                <div class="field-group mb-0">
                  <label class="field-label">Hubungan dengan Pasien</label>
                  <Select
                    v-model="form.hubungan"
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
                  <InputText v-model="form.noKtp" class="w-100" placeholder="Nomor identitas..." />
                </div>
              </div>
            </div>
          </div>

          <!-- Teks Consent -->
          <div class="consent-text-block">
            <p>
              Menyatakan dengan sesungguhnya bahwa saya telah mendapatkan penjelasan yang jelas dan
              lengkap dari <strong>{{ form.dokterAnestesi || 'Dokter Anestesi' }}</strong>
              mengenai tindakan anestesi yang akan dilakukan, meliputi:
            </p>
            <ol class="consent-list">
              <li>Diagnosis penyakit yang memerlukan tindakan pembedahan dan pembiusan</li>
              <li>Jenis tindakan anestesi yang akan dilakukan beserta tujuannya</li>
              <li>Tata cara pelaksanaan tindakan anestesi</li>
              <li>
                Risiko dan komplikasi yang mungkin terjadi selama atau setelah tindakan:
                <ul class="risk-list">
                  <li>Reaksi alergi terhadap obat anestesi</li>
                  <li>Gangguan jalan napas (airway complications)</li>
                  <li>Penurunan tekanan darah (hipotensi)</li>
                  <li>Mual, muntah, sakit kepala pasca anestesi</li>
                  <li>Dalam kondisi tertentu, risiko yang mengancam jiwa</li>
                </ul>
              </li>
              <li>Alternatif tindakan anestesi yang tersedia</li>
              <li>Prognosis dan perkiraan pemulihan pasca anestesi</li>
            </ol>

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
                  ><strong>Saya menyetujui</strong> dilakukannya tindakan anestesi dengan segala
                  risikonya yang telah dijelaskan</label
                >
              </div>
            </div>

            <!-- Tempat & Tanggal -->
            <p class="consent-closing">
              Persetujuan ini saya buat dengan sadar, tanpa paksaan dari pihak manapun, pada:
            </p>
            <div class="consent-date-row">
              <div class="field-group mb-0" style="flex: 1">
                <label class="field-label">Tempat</label>
                <InputText v-model="form.tempat" class="w-100" placeholder="Kota..." />
              </div>
              <div class="field-group mb-0" style="flex: 1.5">
                <label class="field-label">Tanggal &amp; Waktu Persetujuan</label>
                <DatePicker
                  v-model="form.tanggalConsent"
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
          <span>TANDA TANGAN</span>
          <small class="ms-auto">Klik pada area tanda tangan untuk membuka layar penuh</small>
        </div>
        <div class="ic-card-body">
          <!-- Grid penandatangan -->
          <div class="signers-grid">
            <div v-for="(signer, idx) in signers" :key="signer.id" class="signer-card">
              <!-- Header signer card -->
              <div class="signer-card-top">
                <div class="signer-fields">
                  <div class="field-group mb-1">
                    <label class="field-label-sm">Label / Peran</label>
                    <InputText
                      v-model="signer.label"
                      class="w-100"
                      placeholder="Contoh: Keluarga Pasien..."
                      size="small"
                    />
                  </div>
                  <div class="field-group mb-0">
                    <label class="field-label-sm">Nama</label>
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
                  v-tooltip.top="'Hapus penandatangan'"
                />
              </div>

              <!-- Photo Area -->
              <div class="photo-area">
                <div v-if="signer.photoData" class="photo-captured">
                  <img :src="signer.photoData" class="photo-img" alt="Foto penandatangan" />
                  <button
                    class="photo-retake-btn"
                    @click.stop="retakePhoto(idx)"
                    title="Ambil ulang foto"
                  >
                    <i class="pi pi-camera"></i>
                  </button>
                </div>
                <div v-else class="photo-empty" @click.stop="openCamera(idx)">
                  <i class="pi pi-camera"></i>
                  <span>Ambil Foto</span>
                </div>
              </div>

              <!-- Canvas area — klik untuk fullscreen -->
              <div
                class="canvas-preview-area"
                :class="{ 'has-signature': signer.signatureData }"
                @click="openFullscreenCanvas(idx)"
                title="Klik untuk tanda tangan"
              >
                <img
                  v-if="signer.signatureData"
                  :src="signer.signatureData"
                  class="signature-preview-img"
                  alt="Tanda tangan"
                />
                <div v-else class="canvas-empty-hint">
                  <i class="pi pi-pen-to-square"></i>
                  <span>Klik untuk tanda tangan</span>
                </div>

                <!-- Overlay badge jika sudah ada TTD -->
                <div v-if="signer.signatureData" class="signed-badge">
                  <i class="pi pi-verified me-1"></i>Sudah ditandatangani
                </div>
              </div>

              <!-- Hapus TTD -->
              <div class="signer-card-foot" v-if="signer.signatureData">
                <Button
                  label="Ulangi Tanda Tangan"
                  icon="pi pi-refresh"
                  severity="warn"
                  text
                  size="small"
                  @click.stop="clearSignerSignature(idx)"
                />
              </div>
              <div class="signer-name-line">{{ signer.nama || signer.label }}</div>
            </div>

            <!-- Add signer button -->
            <div class="add-signer-card" @click="addSigner">
              <i class="pi pi-plus-circle"></i>
              <span>Tambah Penandatangan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Action Bar -->
  <div class="ic-action-bar mt-3">
    <div class="ic-action-info">
      <i class="pi pi-info-circle me-2" style="color: #6c757d"></i>
      <span
        >Pastikan semua konfirmasi dicentang dan tanda tangan sudah dibubuhkan sebelum
        menyimpan.</span
      >
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
        label="Simpan Consent"
        icon="pi pi-save"
        class="btn-save-ic"
        :loading="loading"
        @click="simpanData"
      />
    </div>
  </div>

  <!-- ===== FULLSCREEN CANVAS OVERLAY ===== -->
  <Teleport to="body">
    <Transition name="fs-fade">
      <div v-if="fullscreenActive" class="fs-overlay">
        <div class="fs-header">
          <div class="fs-header-info">
            <i class="pi pi-pen-to-square me-2"></i>
            <span>Tanda Tangan — {{ activeSigner?.label }}</span>
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
            >Gunakan mouse atau touchpad · Tekan "Hapus" untuk mengulang · Tekan "Selesai" jika
            sudah</span
          >
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ===== CAMERA OVERLAY ===== -->
  <Teleport to="body">
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
          <div class="camera-header-actions">
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              outlined
              size="small"
              @click="closeCamera"
            />
          </div>
        </div>

        <div class="camera-video-wrap">
          <video ref="videoRef" class="camera-video" autoplay playsinline></video>
          <canvas ref="captureCanvas" class="camera-capture-canvas" style="display: none"></canvas>
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
import { ref, computed, nextTick, watch } from 'vue'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const route = useRoute()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const loading = ref(false)

const hubunganOptions = [
  { label: 'Pasien Sendiri', value: 'Pasien Sendiri' },
  { label: 'Suami / Istri', value: 'Suami/Istri' },
  { label: 'Orang Tua', value: 'Orang Tua' },
  { label: 'Anak', value: 'Anak' },
  { label: 'Saudara Kandung', value: 'Saudara Kandung' },
  { label: 'Wali yang Ditunjuk', value: 'Wali' },
]

const form = ref({
  noregister: route.query.noreg || '',
  kodeboking: route.query.kodebooking || '',
  id_client: id_client.value,
  namaPenandatangan: '',
  hubungan: 'Orang Tua',
  noKtp: '',
  dokterAnestesi: '',
  tempat: '',
  tanggalConsent: new Date(),
})

const conf = ref({ mengerti: false, bertanya: false, setuju: false })

// ===== DYNAMIC SIGNERS =====
let signerIdCounter = 3
const signers = ref([
  { id: 1, label: 'Keluarga / Wali Pasien', nama: '', signatureData: '' },
  { id: 2, label: 'Saksi', nama: '', signatureData: '' },
])

const addSigner = () => {
  signers.value.push({
    id: signerIdCounter++,
    label: 'Penandatangan',
    nama: '',
    signatureData: '',
    photoData: '',
  })
}

const removeSigner = (idx) => {
  signers.value.splice(idx, 1)
}

const clearSignerSignature = (idx) => {
  signers.value[idx].signatureData = ''
}

// ===== FULLSCREEN CANVAS =====
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
  fsCtx.strokeStyle = '#1a3a5c'
  fsCtx.lineWidth = 2.5
  fsCtx.lineCap = 'round'
  fsCtx.lineJoin = 'round'
  fsCtx.clearRect(0, 0, canvas.width, canvas.height)

  // If signer already has a signature, draw it
  if (signers.value[idx].signatureData) {
    const img = new Image()
    img.onload = () => fsCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
    img.src = signers.value[idx].signatureData
    fsHasDrawing.value = true
  }
}

const getFsPos = (e) => {
  const canvas = fullscreenCanvas.value
  const rect = canvas.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
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
  const canvas = fullscreenCanvas.value
  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width)
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height)
  fsCtx.beginPath()
  fsCtx.moveTo(x, y)
}

const fsTouchMove = (e) => {
  if (!fsPainting || !fsCtx) return
  const canvas = fullscreenCanvas.value
  const rect = canvas.getBoundingClientRect()
  const touch = e.touches[0]
  const x = (touch.clientX - rect.left) * (canvas.width / rect.width)
  const y = (touch.clientY - rect.top) * (canvas.height / rect.height)
  fsCtx.lineTo(x, y)
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
  if (!fullscreenCanvas.value || activeSignerIndex.value === null) {
    fullscreenActive.value = false
    return
  }
  if (fsHasDrawing.value) {
    signers.value[activeSignerIndex.value].signatureData =
      fullscreenCanvas.value.toDataURL('image/png')
  }
  fullscreenActive.value = false
  activeSignerIndex.value = null
}

// ===== CAMERA =====
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
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
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
  const video = videoRef.value
  const canvas = captureCanvas.value
  if (!video || !canvas) return

  canvas.width = video.videoWidth || 640
  canvas.height = video.videoHeight || 480
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  if (activePhotoCameraIndex.value !== null) {
    signers.value[activePhotoCameraIndex.value].photoData = canvas.toDataURL('image/jpeg', 0.85)
  }
  closeCamera()
}

const retakePhoto = (idx) => {
  signers.value[idx].photoData = ''
  openCamera(idx)
}

const closeCamera = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((t) => t.stop())
    cameraStream.value = null
  }
  if (videoRef.value) videoRef.value.srcObject = null
  cameraActive.value = false
  activePhotoCameraIndex.value = null
  cameraError.value = ''
}

// ===== SAVE =====
const simpanData = async () => {
  if (!form.value.namaPenandatangan) {
    toast.add({
      severity: 'warn',
      summary: 'Perhatian',
      detail: 'Nama penandatangan utama harus diisi',
      life: 3000,
    })
    return
  }
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
    const payload = {
      ...form.value,
      confirmations: conf.value,
      signers: signers.value.map((s) => ({
        label: s.label,
        nama: s.nama,
        signatureData: s.signatureData,
      })),
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/triaseigd/simpan_inform_consent_anestesi`,
      payload,
    )
    if (response.data?.code === 200 || response.data?.metadata?.code === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Inform consent berhasil disimpan',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: response.data?.message || 'Gagal menyimpan',
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan saat menyimpan',
      life: 3000,
    })
    console.error(error)
  } finally {
    loading.value = false
  }
}

const printForm = () => window.print()

// Prevent body scroll when overlays active
watch([fullscreenActive, cameraActive], ([fs, cam]) => {
  document.body.style.overflow = fs || cam ? 'hidden' : ''
})

// Stop camera if component is destroyed
import { onUnmounted } from 'vue'
onUnmounted(() => {
  closeCamera()
})
</script>

<style scoped>
/* ====== Banner ====== */
.ic-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
  border-radius: 34px;
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
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
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
.consent-list {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}
.consent-list li {
  margin-bottom: 0.3rem;
}
.risk-list {
  padding-left: 1rem;
  margin-top: 0.3rem;
}
.risk-list li {
  font-size: 0.79rem;
  color: #dc2626;
  margin-bottom: 0.15rem;
}
.consent-checks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
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

/* ====== Signers Grid ====== */
.signers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.signer-card {
  border: 1px solid #e9ecef;
  border-radius: 4px;
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

.signer-card-top {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
  padding: 0.65rem 0.75rem 0.5rem;
  background: #faf5ff;
  border-bottom: 1px solid #f3e8ff;
}
.signer-fields {
  flex: 1;
}
.btn-remove-signer {
  flex-shrink: 0;
  margin-top: 4px;
}

/* Canvas Preview Area */
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
.canvas-preview-area.has-signature {
  background: #fff;
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
  border-top: 1px solid #f3e8ff;
  font-style: italic;
}

/* Add Signer Card */
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
.btn-save-ic {
  background: linear-gradient(135deg, #1a3a5c, #2563a8) !important;
  border: none !important;
  font-weight: 600;
}

/* ====== Fullscreen Overlay ====== */
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
  background: linear-gradient(135deg, #4a1259, #7c3aed);
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

/* Transition */
.fs-fade-enter-active,
.fs-fade-leave-active {
  transition: opacity 0.2s ease;
}
.fs-fade-enter-from,
.fs-fade-leave-to {
  opacity: 0;
}

/* ====== PrimeVue overrides ====== */
:deep(.p-datepicker),
:deep(.p-inputtext),
:deep(.p-select) {
  font-size: 0.83rem;
}
:deep(.p-datepicker) {
  width: 100%;
}

/* ====== Photo Area ====== */
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
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
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

/* ====== Camera Overlay ====== */
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
  color: #fff;
  flex-shrink: 0;
  gap: 1rem;
}
.camera-header-info {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: #f1f5f9;
}
.camera-header-actions {
  flex-shrink: 0;
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
  letter-spacing: 0.03em;
}
.camera-hint {
  font-size: 0.72rem;
  color: #64748b;
  text-align: center;
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
  .ic-action-bar {
    display: none;
  }
  .fs-overlay {
    display: none;
  }
  .ic-banner {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
