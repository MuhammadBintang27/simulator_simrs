<template>
  <!-- Banner -->
  <div class="marking-banner mb-3">
    <div class="marking-banner-icon">
      <i class="pi pi-map-marker"></i>
    </div>
    <div class="marking-banner-content">
      <h4 class="marking-banner-title">Penandaan Lokasi Operasi</h4>
      <p class="marking-banner-desc">
        Tandai lokasi operasi pada gambar tubuh pasien menggunakan alat gambar. Simpan hasil marking
        untuk dokumentasi keselamatan operasi.
      </p>
    </div>
    <div v-if="showUploadedImage" class="marking-banner-status">
      <i class="pi pi-check-circle me-1"></i> Marking Tersimpan
    </div>
  </div>

  <div class="marking-card">
    <!-- Toolbar -->
    <div class="marking-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-title"> <i class="pi pi-pencil me-1"></i> Alat Gambar </span>
      </div>
      <div class="toolbar-tools">
        <button
          class="tool-btn"
          :class="{ 'tool-active-draw': isDrawing && !isErasing }"
          :disabled="showUploadedImage || isLoading"
          @click="setDrawMode"
          title="Mode Gambar"
        >
          <i class="pi pi-pen-to-square"></i>
          <span>Gambar</span>
        </button>
        <button
          class="tool-btn tool-erase"
          :class="{ 'tool-active-erase': isErasing }"
          :disabled="showUploadedImage || isLoading"
          @click="setEraseMode"
          title="Mode Hapus"
        >
          <i class="pi pi-eraser"></i>
          <span>Hapus</span>
        </button>
        <div class="toolbar-divider"></div>
        <button
          class="tool-btn tool-clear"
          :disabled="showUploadedImage || isLoading"
          @click="clearCanvas"
          title="Bersihkan Semua"
        >
          <i class="pi pi-trash"></i>
          <span>Bersihkan</span>
        </button>
        <button
          v-if="showUploadedImage"
          class="tool-btn tool-reset"
          @click="resetForm"
          title="Ulang Marking"
        >
          <i class="pi pi-refresh"></i>
          <span>Ulang</span>
        </button>
      </div>
      <div class="toolbar-right">
        <button
          class="tool-btn-save"
          :disabled="isSaving || showUploadedImage || isLoading"
          @click="saveAsImage"
        >
          <i class="pi pi-save me-1"></i>
          {{ isSaving ? 'Menyimpan...' : 'Simpan Marking' }}
        </button>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="canvas-wrapper">
      <div class="site-marking">
        <div class="image-container">
          <img
            ref="bgImage"
            :src="site_marking"
            alt="Body"
            class="background-image"
            @load="onImageLoad"
          />
          <canvas
            ref="canvas"
            class="canvas-overlay"
            @mousedown="startDrawing"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @mousemove="draw"
            @touchstart="handleTouch"
            @touchend="stopDrawing"
            @touchmove="handleTouchMove"
          ></canvas>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Mengecek data...</p>
          </div>
        </div>
      </div>

      <!-- Status Indicator Bar -->
      <div class="status-bar">
        <div class="status-indicator">
          <span class="status-dot" :class="canvasReady ? 'dot-ok' : 'dot-off'"></span>
          <span>Canvas</span>
        </div>
        <div class="status-indicator">
          <span class="status-dot" :class="imageLoaded ? 'dot-ok' : 'dot-off'"></span>
          <span>Gambar</span>
        </div>
        <div class="status-indicator">
          <span
            class="status-dot"
            :class="isDrawing && !isErasing ? 'dot-draw' : isErasing ? 'dot-erase' : 'dot-off'"
          ></span>
          <span>{{ isErasing ? 'Mode Hapus' : isDrawing ? 'Mode Gambar' : 'Standby' }}</span>
        </div>

        <Transition name="status-fade">
          <span v-if="statusMessage" :class="['status-msg', statusType]">
            <i
              :class="
                statusType === 'error'
                  ? 'pi pi-times-circle'
                  : statusType === 'success'
                    ? 'pi pi-check-circle'
                    : 'pi pi-info-circle'
              "
            ></i>
            {{ statusMessage }}
          </span>
        </Transition>
      </div>
    </div>

    <!-- Saved Image Info -->
    <Transition name="saved-fade">
      <div v-if="showUploadedImage && uploadedImageUrl" class="saved-info-bar">
        <div class="saved-info-icon">
          <i class="pi pi-image"></i>
        </div>
        <div class="saved-info-content">
          <span class="saved-info-title">Marking Tersimpan</span>
          <span class="saved-info-url">{{ uploadedImageUrl }}</span>
        </div>
        <div class="saved-info-badge"><i class="pi pi-verified me-1"></i> Aktif</div>
      </div>
    </Transition>
  </div>

  <Toast />
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import site_marking from '@/assets/site_marking.png'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const canvas = ref(null)
const ctx = ref(null)
const bgImage = ref(null)
const markedImage = ref(null)
const isDrawing = ref(false)
const isErasing = ref(false)
const isSaving = ref(false)
const isLoading = ref(false)
const statusMessage = ref('')
const statusType = ref('info')
const canvasReady = ref(false)
const imageLoaded = ref(false)
const hasMarked = ref(false)
const uploadedImageUrl = ref(null)
const showUploadedImage = ref(false)
let drawing = false
let lastX = 0
let lastY = 0

const showSuccess = (message = 'Operation successful') => {
  toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 })
}

const showError = (message = 'An error occurred') => {
  toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 })
}

const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type
  console.log(`[${type}] ${message}`)
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

const getCanvasCoordinates = (e) => {
  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  const touchOrMouse = e.touches?.[0] || e
  const x = touchOrMouse.clientX - rect.left
  const y = touchOrMouse.clientY - rect.top
  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height
  return { x: x * scaleX, y: y * scaleY }
}

const startDrawing = (e) => {
  if (!canvas.value || !ctx.value || !canvasReady.value) return
  e.preventDefault()
  drawing = true
  const coords = getCanvasCoordinates(e)
  lastX = coords.x
  lastY = coords.y
  ctx.value.beginPath()
  ctx.value.moveTo(coords.x, coords.y)
  if (isErasing.value) {
    ctx.value.save()
    ctx.value.globalCompositeOperation = 'destination-out'
    ctx.value.lineWidth = 20
    ctx.value.lineCap = 'round'
    ctx.value.lineJoin = 'round'
  } else {
    ctx.value.globalCompositeOperation = 'source-over'
    ctx.value.lineWidth = 3
    ctx.value.strokeStyle = 'red'
    ctx.value.lineCap = 'round'
    ctx.value.lineJoin = 'round'
  }
}

const draw = (e) => {
  if (!drawing || !ctx.value || !canvasReady.value) return
  hasMarked.value = true
  e.preventDefault()
  const coords = getCanvasCoordinates(e)
  ctx.value.lineTo(coords.x, coords.y)
  ctx.value.stroke()
  lastX = coords.x
  lastY = coords.y
}

const stopDrawing = () => {
  if (drawing && ctx.value) {
    drawing = false
    ctx.value.closePath()
    if (isErasing.value) ctx.value.restore()
  }
}

const handleTouch = (e) => {
  e.preventDefault()
  startDrawing(e)
}

const handleTouchMove = (e) => {
  e.preventDefault()
  draw(e)
}

const setDrawMode = () => {
  if (!canvasReady.value) {
    showStatus('Canvas belum siap', 'error')
    return
  }
  isDrawing.value = true
  isErasing.value = false
  if (canvas.value) {
    canvas.value.style.cursor = 'crosshair'
    canvas.value.style.pointerEvents = 'auto'
  }
  showStatus('Mode gambar aktif', 'info')
}

const setEraseMode = () => {
  if (!canvasReady.value) {
    showStatus('Canvas belum siap', 'error')
    return
  }
  isDrawing.value = false
  isErasing.value = true
  if (canvas.value) {
    canvas.value.style.cursor = 'cell'
    canvas.value.style.pointerEvents = 'auto'
  }
  showStatus('Mode hapus aktif', 'info')
}

const clearCanvas = () => {
  if (ctx.value && canvas.value) {
    hasMarked.value = false
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    showStatus('Canvas dibersihkan', 'info')
  }
}

const resetForm = () => {
  uploadedImageUrl.value = null
  showUploadedImage.value = false
  markedImage.value = null
  hasMarked.value = false
  if (bgImage.value) bgImage.value.src = site_marking
  clearCanvas()
  showStatus('Form direset, siap untuk marking baru', 'info')
}

const setupCanvas = () => {
  if (!canvas.value || !bgImage.value) {
    canvasReady.value = false
    return
  }
  const img = bgImage.value
  const c = canvas.value
  if (img.naturalWidth === 0 || img.naturalHeight === 0) {
    setTimeout(setupCanvas, 500)
    return
  }
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  ctx.value = c.getContext('2d', { willReadFrequently: true })
  if (!ctx.value) {
    canvasReady.value = false
    return
  }
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.globalCompositeOperation = 'source-over'
  ctx.value.lineWidth = 3
  ctx.value.strokeStyle = 'red'
  c.style.position = 'absolute'
  c.style.top = '0'
  c.style.left = '0'
  c.style.width = '100%'
  c.style.height = 'auto'
  c.style.display = 'block'
  c.style.cursor = 'crosshair'
  c.style.pointerEvents = 'auto'
  c.style.touchAction = 'none'
  c.style.zIndex = '10'
  isDrawing.value = true
  isErasing.value = false
  canvasReady.value = true
}

const onImageLoad = async () => {
  imageLoaded.value = true
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 150))
  setupCanvas()
}

const fetchExistingImage = async () => {
  try {
    isLoading.value = true
    const params = {
      noregister: route.query.noreg,
      kodeboking: route.query.kodebooking,
      id_client: id_client.value,
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/get_site_marking`, params)
    if (response.data.metadata.code === 200) {
      const imageUrl = response.data.data?.filename
      if (imageUrl) {
        uploadedImageUrl.value = imageUrl
        markedImage.value = imageUrl
        showUploadedImage.value = true
        if (bgImage.value) bgImage.value.src = imageUrl
        return
      }
    }
    showStatus('Siap untuk marking baru', 'info')
  } catch (error) {
    console.error('Error fetching image:', error)
    showStatus('Siap untuk marking baru', 'info')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (!bgImage.value || !canvas.value) return
  await fetchExistingImage()
  if (bgImage.value.complete) {
    imageLoaded.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))
    setupCanvas()
  }
  const handleResize = () => {
    if (canvasReady.value) setTimeout(() => setupCanvas(), 150)
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
})

const saveAsImage = async () => {
  if (!canvas.value || !bgImage.value) {
    showError('Canvas atau image tidak tersedia')
    return
  }
  isSaving.value = true
  showStatus('Memproses gambar...', 'info')
  try {
    if (!hasMarked.value) {
      showError('Harap tandai gambar terlebih dahulu sebelum menyimpan')
      isSaving.value = false
      return
    }
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) throw new Error('Tidak dapat membuat canvas context')
    tempCanvas.width = canvas.value.width
    tempCanvas.height = canvas.value.height
    tempCtx.drawImage(bgImage.value, 0, 0, tempCanvas.width, tempCanvas.height)
    tempCtx.drawImage(canvas.value, 0, 0)
    const blob = await new Promise((resolve, reject) => {
      tempCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Gagal membuat blob'))
        },
        'image/png',
        0.95,
      )
    })
    const formData = new FormData()
    formData.append('file', blob, `site_marking_${new Date().getTime()}.png`)
    formData.append('timestamp', new Date().toISOString())
    formData.append('type', 'site_marking')
    formData.append(
      'data',
      JSON.stringify({
        noregister: route.query.noreg,
        kodeboking: route.query.kodebooking,
        id_client: id_client.value,
      }),
    )
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/penunjang/save_site_marking`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    if (response.data.metadata.code != '200') {
      showError(response.data.metadata.message)
    } else {
      showSuccess('Marking berhasil disimpan')
      await fetchExistingImage()
    }
  } catch (error) {
    console.error('Error:', error)
    showError(error.message || 'Terjadi kesalahan saat menyimpan')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
/* ====== Banner ====== */
.marking-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #0f2942 0%, #1a56a8 100%);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  color: #fff;
}
.marking-banner-icon {
  flex-shrink: 0;
  font-size: 2rem;
  opacity: 0.9;
}
.marking-banner-title {
  margin: 0 0 0.2rem;
  font-size: 1.05rem;
  font-weight: 700;
}
.marking-banner-desc {
  margin: 0;
  font-size: 0.78rem;
  opacity: 0.85;
  line-height: 1.4;
}
.marking-banner-status {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ====== Main Card ====== */
.marking-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

/* ====== Toolbar ====== */
.marking-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
}
.toolbar-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
}
.toolbar-tools {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: 1;
}
.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 0.2rem;
}
.toolbar-right {
  margin-left: auto;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.tool-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #9ca3af;
}
.tool-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.tool-btn.tool-active-draw {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}
.tool-btn.tool-erase:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}
.tool-btn.tool-erase.tool-active-erase {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}
.tool-btn.tool-clear:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #d97706;
  color: #92400e;
}
.tool-btn.tool-reset:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}
.tool-btn-save {
  display: flex;
  align-items: center;
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #14532d, #16a34a);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.tool-btn-save:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.tool-btn-save:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

/* ====== Canvas ====== */
.canvas-wrapper {
  padding: 1rem;
}
.site-marking {
  position: relative;
  display: inline-block;
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}
.image-container {
  position: relative;
  display: block;
  width: 100%;
}
.background-image {
  display: block;
  width: 100%;
  height: auto;
}
.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  touch-action: none;
  display: block;
  pointer-events: auto;
  z-index: 10;
  max-width: 100%;
  height: auto;
}

/* ====== Status Bar ====== */
.status-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
}
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  color: #6b7280;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-ok {
  background: #16a34a;
}
.dot-off {
  background: #d1d5db;
}
.dot-draw {
  background: #3b82f6;
}
.dot-erase {
  background: #ef4444;
}

.status-msg {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.72rem;
  font-weight: 500;
  margin-left: auto;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}
.status-msg.info {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-msg.success {
  background: #dcfce7;
  color: #15803d;
}
.status-msg.error {
  background: #fee2e2;
  color: #dc2626;
}

/* ====== Saved Info ====== */
.saved-info-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 1rem 1rem;
  padding: 0.65rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  border-left: 4px solid #16a34a;
}
.saved-info-icon {
  width: 36px;
  height: 36px;
  background: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}
.saved-info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.saved-info-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #14532d;
}
.saved-info-url {
  font-size: 0.7rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.saved-info-badge {
  flex-shrink: 0;
  background: #16a34a;
  color: #fff;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
}

/* ====== Loading ====== */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
.loading-spinner {
  text-align: center;
}
.loading-spinner i {
  font-size: 2rem;
  color: #1d4ed8;
  display: block;
  margin-bottom: 0.5rem;
}
.loading-spinner p {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0;
}

/* ====== Transitions ====== */
.status-fade-enter-active,
.status-fade-leave-active {
  transition: all 0.25s ease;
}
.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.saved-fade-enter-active,
.saved-fade-leave-active {
  transition: all 0.35s ease;
}
.saved-fade-enter-from,
.saved-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ====== Responsive ====== */
@media (max-width: 576px) {
  .marking-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-right {
    margin-left: 0;
    width: 100%;
  }
  .tool-btn-save {
    width: 100%;
    justify-content: center;
  }
  .marking-banner {
    flex-direction: column;
  }
  .marking-banner-status {
    align-self: flex-start;
  }
}
</style>
