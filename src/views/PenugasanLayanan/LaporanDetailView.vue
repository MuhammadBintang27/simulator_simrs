<template>
  <div class="detail-page">
    <loading_overlay :is-loading="loading" message="Memuat data...." />

    <!-- Back Navigation -->
    <div class="back-nav">
      <Button icon="pi pi-arrow-left" label="Kembali" text @click="$router.back()" />
    </div>

    <div v-if="report" class="detail-content">
      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- Problem Details -->
          <Card class="problem-card">
            <template #title>
              <div class="card-title">
                <i class="pi pi-info-circle"></i>
                <span>Detail Laporan</span>
              </div>
            </template>

            <template #content>
              <div style="display: flex; gap: 2rem;">
            
                <!-- Left Column -->
                <div style="flex: 1;">
                  
                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-book"></i>
                      <span>Judul</span>
                    </div>
                    <div class="item-value">
                      <span>{{ report.problem_title }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-file"></i>
                      <span>No. Laporan</span>
                    </div>
                    <div class="item-value">{{ report.report_no || `#${report.report_id}` }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-align-left"></i>
                      <span>Keterangan</span>
                    </div>
                    <div class="item-value">{{ report.problem_description }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-tag"></i>
                      <span>Kategori</span>
                    </div>
                    <div class="item-value">
                      <CategoryBadge :category="report.problem_category" />
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-user"></i>
                      <span>Pelapor</span>
                    </div>
                    <div class="item-value">
                      <div class="reporter-info">
                        <div class="reporter-name">{{ report.reporter_name }}</div>
                        <div class="reporter-detail" v-if="report.reporter_phone">
                          <i class="pi pi-phone"></i>
                          <span>{{ report.reporter_phone }}</span>
                        </div>
                        <div class="reporter-detail" v-if="report.reporter_email">
                          <i class="pi pi-envelope"></i>
                          <span>{{ report.reporter_email }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column -->
                <div style="flex: 1;">
                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-arrow-up"></i>
                      <span>Prioritas</span>
                    </div>
                    <div class="item-value">
                      <PriorityBadge :priority="report.priority" />
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-check"></i>
                      <span>Status</span>
                    </div>
                    <div class="item-value">
                      <StatusBadge :status="report.status" :department-name="report.bidang_name || 'Bidang'" />
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-map-marker"></i>
                      <span>Lokasi</span>
                    </div>
                    <div class="item-value">{{ report.location }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-calendar"></i>
                      <span>Tanggal Laporan</span>
                    </div>
                    <div class="item-value">{{ formatDateTime(report.report_date) }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-clock"></i>
                      <span>Terakhir Update</span>
                    </div>
                    <div class="item-value">{{ formatDateTime(report.updated_at) }}</div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Evidence Photos -->
          <Card v-if="evidencePhotos.length > 0">
            <template #title>
              <div class="card-title">
                <i class="pi pi-images"></i>
                <span>Foto Bukti ({{ evidencePhotos.length }})</span>
              </div>
            </template>
            <template #content>
              <div class="photo-grid">
                <div
                  v-for="(photo, index) in evidencePhotos"
                  :key="`evidence-${index}`"
                  class="photo-box"
                  @click="viewEvidenceImage(index)"
                >
                  <img :src="photo.url" :alt="`Foto Bukti ${index + 1}`" />
                  <div class="photo-overlay">
                    <i class="pi pi-search-plus"></i>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Completion Photos -->
          <Card v-if="report.status === 'completed' && completionPhotos.length > 0">
            <template #title>
              <div class="card-title">
                <i class="pi pi-check-circle"></i>
                <span>Foto Bukti Penyelesaian ({{ completionPhotos.length }})</span>
              </div>
            </template>
            <template #content>
              <div class="photo-grid">
                <div
                  v-for="(photo, index) in completionPhotos"
                  :key="`completion-${index}`"
                  class="photo-box"
                  @click="viewCompletionImage(index)"
                >
                  <img :src="photo.url" :alt="`Foto Penyelesaian ${index + 1}`" />
                  <div class="photo-overlay">
                    <i class="pi pi-search-plus"></i>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Staff -->
          <Card v-if="report.assigned_staff && report.assigned_staff.length > 0">
            <template #title>
              <div class="card-title">
                <i class="pi pi-users"></i>
                <span>Staff Ditugaskan</span>
              </div>
            </template>
            <template #content>
              <div class="staff-list">
                <div v-for="staff in report.assigned_staff" :key="staff.staff_id" class="staff-box">
                  <div class="staff-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="staff-info">
                    <div class="staff-name">{{ staff.staff_name }}</div>
                    <div class="staff-detail">
                      <i class="pi pi-building"></i>
                      <span>{{ staff.bidang_name }}</span>
                    </div>
                    <div class="staff-detail" v-if="staff.assigned_at">
                      <i class="pi pi-calendar"></i>
                      <span>{{ formatDateTime(staff.assigned_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- History & Comments Timeline -->
          <ActivityTimelineComponent 
            v-if="report.status_history?.length > 0 || progressHistory.length > 0"
            :progressHistory="progressHistory" 
            :statusHistory="report.status_history || []" 
            @submit-comment="handleSubmitComment"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <Card v-else-if="!loading" class="empty-card">
      <template #content>
        <div class="empty-state">
          <i class="pi pi-inbox"></i>
          <h3>Laporan Tidak Ditemukan</h3>
          <p>Laporan yang Anda cari tidak ditemukan atau telah dihapus</p>
          <Button label="Kembali" icon="pi pi-arrow-left" @click="$router.back()" />
        </div>
      </template>
    </Card>

    <!-- Evidence Image Viewer -->
    <Dialog v-model:visible="showImage" modal :closable="true" class="image-viewer">
      <template #header>
        <span>Foto Bukti {{ currentImage + 1 }} dari {{ evidencePhotos.length }}</span>
      </template>
      <div class="image-container">
        <Button
          icon="pi pi-chevron-left"
          text
          @click="prevImage"
          :disabled="currentImage === 0"
          class="nav-btn prev"
        />
        <img v-if="evidencePhotos[currentImage]" :src="evidencePhotos[currentImage].url" class="viewer-image" />
        <Button
          icon="pi pi-chevron-right"
          text
          @click="nextImage"
          :disabled="currentImage === evidencePhotos.length - 1"
          class="nav-btn next"
        />
      </div>
    </Dialog>

    <!-- Completion Image Viewer -->
    <Dialog v-model:visible="showCompletionImage" modal :closable="true" class="image-viewer">
      <template #header>
        <span>Foto Penyelesaian {{ currentCompletionImage + 1 }} dari {{ completionPhotos.length }}</span>
      </template>
      <div class="image-container">
        <Button
          icon="pi pi-chevron-left"
          text
          @click="prevCompletionImage"
          :disabled="currentCompletionImage === 0"
          class="nav-btn prev"
        />
        <img v-if="completionPhotos[currentCompletionImage]" :src="completionPhotos[currentCompletionImage].url" class="viewer-image" />
        <Button
          icon="pi pi-chevron-right"
          text
          @click="nextCompletionImage"
          :disabled="currentCompletionImage === completionPhotos.length - 1"
          class="nav-btn next"
        />
      </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import { useToast } from 'primevue/usetoast'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'

import loading_overlay from '@/components/LoadingFormCompnent.vue'
import ActivityTimelineComponent from './components/ActivityTimelineComponent.vue'
import CategoryBadge from './components/CategoryBadge.vue'
import PriorityBadge from './components/PriorityBadge.vue'
import StatusBadge from './components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const store = usePenugasanLayananStore()
const toast = useToast()

const loading = ref(false)
const report = ref(null)
const progressHistory = ref([])
const showImage = ref(false)
const showCompletionImage = ref(false)
const currentImage = ref(0)
const currentCompletionImage = ref(0)

const formatDate = (date) => {
  if (!date) return '-'
  try {
    return format(parseISO(date), 'dd MMM yyyy', { locale: id })
  } catch {
    return date
  }
}

const formatDateTime = (date) => {
  if (!date) return '-'
  try {
    return format(parseISO(date), 'dd MMM yyyy HH:mm', { locale: id })
  } catch {
    return date
  }
}

const getStatusIcon = (status) => {
  return statusConfig[status]?.icon || 'pi pi-circle'
}

// Filter evidence photos from photos
const evidencePhotos = computed(() => {
  if (!report.value?.photos || !Array.isArray(report.value.photos)) {
    return []
  }
  return report.value.photos.filter(photo => photo.type === 'evidence')
})

// Filter completion photos from photos
const completionPhotos = computed(() => {
  if (!report.value?.photos || !Array.isArray(report.value.photos)) {
    return []
  }
  return report.value.photos.filter(photo => photo.type === 'completion')
})

const viewEvidenceImage = (index) => {
  currentImage.value = index
  showImage.value = true
}

const nextImage = () => {
  if (currentImage.value < evidencePhotos.value.length - 1) {
    currentImage.value++
  }
}

const prevImage = () => {
  if (currentImage.value > 0) {
    currentImage.value--
  }
}

const viewCompletionImage = (index) => {
  currentCompletionImage.value = index
  showCompletionImage.value = true
}

const nextCompletionImage = () => {
  if (currentCompletionImage.value < completionPhotos.value.length - 1) {
    currentCompletionImage.value++
  }
}

const prevCompletionImage = () => {
  if (currentCompletionImage.value > 0) {
    currentCompletionImage.value--
  }
}

const loadData = async () => {
  try {
    loading.value = true
    const reportId = route.params.id
    
    report.value = await store.fetchReportDetail(reportId)
    
    // Use status_history from report detail instead of separate work_progress call
    progressHistory.value = report.value?.status_history || []
  } catch (error) {
    // Error handled in catch block
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Gagal memuat data',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Handle comment submission
const handleSubmitComment = async (commentText) => {
  try {
    const reportId = route.params.id
    await store.addComment(reportId, commentText)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Komentar berhasil ditambahkan',
      life: 3000
    })
    // Reload to get updated history
    loadData()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.message || 'Gagal menambahkan komentar',
      life: 3000
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.detail-page {
  padding: 1.5rem;
  width: 100%;
}

/* Back Nav */
.back-nav {
  margin-bottom: 1.5rem;
}

/* Page Title */
.page-title {
  margin-bottom: 2rem;
}

.page-title h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Problem Card */
.problem-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

/* Card Title */
.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2c3e50;
  font-weight: 700;
}

/* Detail Items */
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.item-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  color: #7e8fa3;
  text-transform: capitalize;
}

.item-value {
  font-size: 0.95rem;
  color: #1a202c;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding-left: 1.5rem;
  font-weight: 500;
}

/* Reporter */
.reporter-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reporter-name {
  font-size: 1rem;
  color: #334155;
  line-height: 1.6;
}

.reporter-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #334155;
  line-height: 1.6;
}

/* Photos */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.photo-box {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.photo-box:hover {
  border-color: #cbd5e1;
}

.photo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-box:hover .photo-overlay {
  opacity: 1;
}

.photo-overlay i {
  font-size: 2rem;
  color: white;
}

/* Staff */
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.staff-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.staff-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
}

.staff-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.staff-name {
  font-weight: 700;
  font-size: 1rem;
  color: #2c3e50;
}

.staff-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

/* Timeline */
:deep(.p-timeline-event-marker) {
  border: none;
  padding: 0;
}

.timeline-marker {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1rem;
}

.timeline-box {
  background: transparent;
  padding: 1rem;
  border-radius: 8px;
  border-left: 1px solid #e2e8f0;
}

.timeline-user {
  font-weight: 600;
  color: #2c3e50;
  margin: 0.5rem 0 0.25rem 0;
}

.timeline-notes {
  color: #64748b;
  font-size: 0.9375rem;
  margin: 0.5rem 0;
}

.timeline-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

/* Empty State */
.empty-card {
  margin-top: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state i {
  font-size: 5rem;
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.75rem;
}

.empty-state p {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 2rem;
}

/* Image Viewer */
:deep(.image-viewer .p-dialog-content) {
  padding: 0;
  background: #000;
}

.image-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.viewer-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9) !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
}

.nav-btn.prev {
  left: 1rem;
}

.nav-btn.next {
  right: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding: 1rem;
  }

  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
