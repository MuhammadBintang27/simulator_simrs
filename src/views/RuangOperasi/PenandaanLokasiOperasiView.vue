<template>
  <Panel>
    <div class="site-marking">
      <!-- Base image -->
      <div class="image-container">
        <img
          ref="bgImage"
          :src="site_marking"
          alt="Body"
          class="background-image"
          @load="onImageLoad"
        />

        <!-- Canvas overlay -->
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

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Mengecek data...</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls mt-2">
        <Button
          @click="setDrawMode"
          icon="pi pi-pen"
          class="round-button2"
          :outlined="!isDrawing"
          :severity="isDrawing ? 'info' : 'secondary'"
          :disabled="showUploadedImage || isLoading"
        >
          Draw
        </Button>
        <Button
          @click="setEraseMode"
          severity="danger"
          class="round-button2"
          :outlined="!isErasing"
          :disabled="showUploadedImage || isLoading"
        >
          Hapus
        </Button>
        <Button
          @click="saveAsImage"
          severity="success"
          class="round-button2"
          :loading="isSaving"
          :disabled="isSaving || showUploadedImage || isLoading"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
        <Button
          @click="clearCanvas"
          severity="warn"
          class="round-button2"
          :disabled="showUploadedImage || isLoading"
        >
          Clear All
        </Button>
        <Button
          v-if="showUploadedImage"
          @click="resetForm"
          severity="info"
          class="round-button2"
          icon="pi pi-refresh"
        >
          Ulang
        </Button>
      </div>

      <!-- Debug info -->
      <div class="debug-info mt-2">
        <small>
          Canvas: {{ canvasReady ? '✓' : '✗' }} | Drawing: {{ isDrawing ? 'ON' : 'OFF' }} | Erasing:
          {{ isErasing ? 'ON' : 'OFF' }} | Image: {{ imageLoaded ? '✓' : '✗' }}
        </small>
      </div>

      <!-- Status message -->
      <div v-if="statusMessage" :class="['status-message', statusType]" class="mt-2">
        {{ statusMessage }}
      </div>

      <!-- Uploaded Image Display -->
      <div v-if="showUploadedImage && uploadedImageUrl" class="uploaded-image-container mt-3">
        <h4 class="uploaded-title">📸 Gambar Marking Tersimpan</h4>
        <p class="uploaded-subtitle">
          Gambar yang ditampilkan di atas adalah hasil marking yang sudah disimpan
        </p>
        <div class="image-info mt-2">
          <small> <strong>URL:</strong> {{ uploadedImageUrl }} </small>
        </div>
      </div>
    </div>
    <Toast />
  </Panel>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'
import site_marking from '@/assets/site_marking.png'

// Store & Router
const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

// Refs
const canvas = ref(null)
const ctx = ref(null)
const bgImage = ref(null)
const markedImage = ref(null) // ✅ Ref untuk gambar marking yang sudah ada
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

// Toast functions
const showSuccess = (message = 'Operation successful') => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: message,
    life: 3000,
  })
}

const showError = (message = 'An error occurred') => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 5000,
  })
}

// Helper function
const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type
  console.log(`[${type}] ${message}`)
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// Canvas coordinate calculation
const getCanvasCoordinates = (e) => {
  if (!canvas.value) return { x: 0, y: 0 }

  const rect = canvas.value.getBoundingClientRect()
  const touchOrMouse = e.touches?.[0] || e

  const x = touchOrMouse.clientX - rect.left
  const y = touchOrMouse.clientY - rect.top

  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height

  return {
    x: x * scaleX,
    y: y * scaleY,
  }
}

// Drawing functions
const startDrawing = (e) => {
  if (!canvas.value || !ctx.value || !canvasReady.value) {
    console.warn('Canvas not ready for drawing')
    return
  }

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

const stopDrawing = (e) => {
  if (drawing && ctx.value) {
    drawing = false
    ctx.value.closePath()

    if (isErasing.value) {
      ctx.value.restore()
    }
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

// Mode functions
const setDrawMode = () => {
  if (!canvasReady.value) {
    showStatus('Canvas belum siap', 'error')
    return
  }

  isDrawing.value = true
  isErasing.value = false

  if (canvas.value) {
    canvas.value.style.cursor =
      'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%222%22 fill=%22red%22/%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%228%22 fill=%22none%22 stroke=%22red%22 stroke-width=%221%22/%3E%3C/svg%3E") 16 16, crosshair'
    canvas.value.style.pointerEvents = 'auto'
  }
  showStatus('Drawing mode activated', 'info')
}

const setEraseMode = () => {
  if (!canvasReady.value) {
    showStatus('Canvas belum siap', 'error')
    return
  }

  isDrawing.value = false
  isErasing.value = true

  if (canvas.value) {
    canvas.value.style.cursor =
      'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 32 32%22%3E%3Crect x=%228%22 y=%228%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22gray%22 stroke-width=%222%22/%3E%3C/svg%3E") 16 16, cell'
    canvas.value.style.pointerEvents = 'auto'
  }

  showStatus('Erase mode activated', 'info')
}

const clearCanvas = () => {
  if (ctx.value && canvas.value) {
    hasMarked.value = false
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    showStatus('Canvas cleared', 'info')
  }
}

const resetForm = () => {
  uploadedImageUrl.value = null
  showUploadedImage.value = false
  markedImage.value = null
  hasMarked.value = false

  // Update bgImage ke gambar asli
  if (bgImage.value) {
    bgImage.value.src = site_marking
  }

  clearCanvas()
  showStatus('Form direset, siap untuk marking baru', 'info')
}

// Setup Canvas
const setupCanvas = () => {
  if (!canvas.value || !bgImage.value) {
    console.error('Canvas atau image belum ter-load')
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

// ✅ Fetch existing image dari database
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
      const imageUrl = response.data.data[0].filename

      if (imageUrl) {
        uploadedImageUrl.value = imageUrl
        markedImage.value = imageUrl // ✅ Simpan URL gambar marking
        showUploadedImage.value = true

        // ✅ Update bgImage untuk menampilkan gambar marking yang sudah ada
        if (bgImage.value) {
          bgImage.value.src = imageUrl
        }

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

  if (!bgImage.value || !canvas.value) {
    return
  }

  await fetchExistingImage()

  if (bgImage.value.complete) {
    imageLoaded.value = true
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))
    setupCanvas()
  } else {
    console.log('⏳ Image loading, waiting for onload event...')
  }

  const handleResize = () => {
    if (canvasReady.value) {
      setTimeout(() => {
        setupCanvas()
      }, 150)
    }
  }

  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
})

// Upload function
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

    if (!tempCtx) {
      throw new Error('Tidak dapat membuat canvas context')
    }

    tempCanvas.width = canvas.value.width
    tempCanvas.height = canvas.value.height

    tempCtx.drawImage(bgImage.value, 0, 0, tempCanvas.width, tempCanvas.height)
    tempCtx.drawImage(canvas.value, 0, 0)

    const blob = await new Promise((resolve, reject) => {
      tempCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Gagal membuat blob'))
          }
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
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    if (response.data.metadata.code != '200') {
      showError(response.data.metadata.message)
    } else {
      showSuccess('Gambar berhasil disimpan')

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
.site-marking {
  position: relative;
  display: inline-block;
  width: 100%;
}

.image-container {
  position: relative;
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

.background-image {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
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

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
}

.round-button2 {
  border-radius: 20px;
}

.debug-info {
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.status-message {
  padding: 12px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  margin-top: 12px;
  animation: slideIn 0.3s ease-in-out;
}

.status-message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 6px;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner i {
  font-size: 36px;
  color: #2196f3;
  margin-bottom: 12px;
}

.loading-spinner p {
  color: #666;
  font-weight: 500;
}

.uploaded-image-container {
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 16px;
  background-color: #f1f8f4;
  animation: slideIn 0.3s ease-in-out;
}

.uploaded-title {
  margin: 0 0 8px 0;
  color: #2e7d32;
  font-size: 16px;
  font-weight: 600;
}

.uploaded-subtitle {
  margin: 0 0 12px 0;
  color: #558b2f;
  font-size: 14px;
}

.image-info {
  background-color: #ffffff;
  padding: 10px;
  border-radius: 4px;
  border-left: 3px solid #4caf50;
}

.image-info small {
  color: #555;
  word-break: break-all;
}
</style>
