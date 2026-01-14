<template>
  <div class="staff-task-detail">
    <!-- Back Navigation -->
    <div class="back-nav">
      <Button icon="pi pi-arrow-left" label="Kembali" text @click="$router.back()" />
    </div>

    <!-- Loading -->
    <LoadingFormComponent v-if="loading" />

    <!-- Content -->
    <div v-else-if="task" class="task-container">
      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Left Column: Task Details & Progress Form -->
        <div class="left-column">
          <!-- Task Details Card -->
          <Card class="problem-card">
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
                      <span>{{ task.problem_title }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-file"></i>
                      <span>No. Laporan</span>
                    </div>
                    <div class="item-value">{{ task.report_no || '-' }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-align-left"></i>
                      <span>Deskripsi</span>
                    </div>
                    <div class="item-value">{{ task.problem_description || '-' }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-tag"></i>
                      <span>Kategori</span>
                    </div>
                    <div class="item-value">
                      <CategoryBadge :category="task.problem_category" />
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-building"></i>
                      <span>Bidang</span>
                    </div>
                    <div class="item-value">{{ task.bidang_name || task.bidang_id || '-' }}</div>
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
                      <PriorityBadge :priority="task.priority" />
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-check"></i>
                      <span>Status</span>
                    </div>
                    <div class="item-value">
                      <StatusBadge :status="task.status" :departmentName="task.bidang_name" />
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-map-marker"></i>
                      <span>Lokasi</span>
                    </div>
                    <div class="item-value">{{ task.location || '-' }}</div>
                  </div>

                  <div class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-calendar"></i>
                      <span>Tanggal Laporan</span>
                    </div>
                    <div class="item-value">{{ formatDateTime(task.report_date) }}</div>
                  </div>

                  <div v-if="assignedStaff" class="detail-item">
                    <div class="item-label">
                      <i class="pi pi-clock"></i>
                      <span>Ditugaskan Pada</span>
                    </div>
                    <div class="item-value">{{ formatDateTime(assignedStaff.assigned_at) }}</div>
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
                  v-for="(photo, idx) in evidencePhotos"
                  :key="`evidence-${idx}`"
                  class="photo-box"
                  @click="openPhotoViewer(photo.url)"
                >
                  <img :src="photo.url" :alt="`Foto Bukti ${idx + 1}`" />
                  <div class="photo-overlay">
                    <i class="pi pi-search-plus"></i>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Completion Photos -->
          <Card v-if="task.status === 'completed' && completionPhotos.length > 0">
            <template #title>
              <div class="card-title">
                <i class="pi pi-check-circle"></i>
                <span>Foto Bukti Penyelesaian ({{ completionPhotos.length }})</span>
              </div>
            </template>
            <template #content>
              <div class="photo-grid">
                <div
                  v-for="(photo, idx) in completionPhotos"
                  :key="`completion-${idx}`"
                  class="photo-box"
                  @click="openPhotoViewer(photo.url)"
                >
                  <img :src="photo.url" :alt="`Foto Penyelesaian ${idx + 1}`" />
                  <div class="photo-overlay">
                    <i class="pi pi-search-plus"></i>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Action Buttons -->
          <div v-if="!isTaskCompleted && canPerformActions" class="action-buttons-section">
            <div v-if="task.status === 'in_progress' || task.status === 'assigned_to_staff'" class="button-group">
              <Button
                label="Tunda Pekerjaan"
                icon="pi pi-pause"
                severity="warning"
                outlined
                class="action-button"
                @click="openActionDialog('defer')"
              />
              <Button
                label="Konfirmasi Selesai"
                icon="pi pi-check"
                severity="success"
                class="action-button"
                @click="showCompletionDialog = true"
              />
            </div>
            
            <div v-else-if="task.status === 'deferred'" class="button-group">
              <Button
                label="Lanjutkan Pekerjaan"
                icon="pi pi-play"
                severity="info"
                class="action-button"
                @click="openActionDialog('resume')"
              />
            </div>
          </div>

          <!-- Deferred State (only for users with action permission) -->
          <div v-else-if="task.status === 'deferred' && canPerformActions" class="deferred-state">
            <i class="pi pi-pause-circle"></i>
            <h4>Pekerjaan Ditunda</h4>
            <p>Pekerjaan ini sedang ditunda. Lanjutkan pekerjaan ketika siap.</p>
            <Button
              label="Lanjutkan Pekerjaan"
              icon="pi pi-play"
              severity="info"
              @click="openActionDialog('resume')"
            />
          </div>

          <!-- Completed State -->
          <div v-else-if="isTaskCompleted" style="padding: 1.5rem; background: #dcfce7; border-radius: 8px; color: #166534; margin-top: 2rem;">
            <i class="pi pi-check-circle"></i> Pekerjaan telah selesai
          </div>

          <!-- Not Assigned User (View Only Mode) -->
          <div v-else-if="!canPerformActions" style="padding: 1.5rem; background: #fef3c7; border-radius: 8px; color: #92400e; margin-top: 2rem; text-align: center;">
            <i class="pi pi-eye" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
            <strong>Mode Viewing</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Anda tidak ditugaskan untuk pekerjaan ini. Anda hanya dapat melihat detail.</p>
          </div>
        </div>

        <!-- Right Column: Status History Timeline -->
        <div class="right-column">
          <ActivityTimelineComponent 
            v-if="task.status_history?.length > 0"
            :statusHistory="task.status_history || []" 
            @submit-comment="handleSubmitComment"
          />
        </div>
      </div>

      <!-- Action Dialogs -->
      <!-- Defer/Resume Dialog -->
      <Dialog
        v-model:visible="showActionDialog"
        :header="actionType === 'defer' ? 'Menunda Pekerjaan' : 'Lanjutkan Pekerjaan'"
        :modal="true"
        :closable="true"
        :style="{ width: '600px' }"
      >
        <div class="action-dialog">
          <div class="form-section">
            <h6 class="section-title">
              <i :class="actionType === 'defer' ? 'pi pi-pause' : 'pi pi-play'"></i>
              {{ actionType === 'defer' ? 'Alasan Penundaan' : 'Info Pelanjutan' }}
            </h6>
            <div class="form-field">
              <label class="field-label">
                {{ actionType === 'defer' ? 'Catatan Penundaan' : 'Catatan Pelanjutan' }}
                <span class="required">*</span>
              </label>
              <textarea
                v-model="actionNotes"
                rows="5"
                :placeholder="actionType === 'defer' 
                  ? 'Jelaskan alasan mengapa pekerjaan ditunda (misal: menunggu spare part, keterbatasan peralatan, dll)...'
                  : 'Jelaskan status terbaru dan alasan pekerjaan dapat dilanjutkan (misal: spare part sudah tiba, masalah teratasi, dll)...'"
                class="action-textarea"
              />
              <small class="field-hint">Maksimal 500 karakter</small>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <Button
              label="Batal"
              @click="showActionDialog = false"
              severity="secondary"
              outlined
            />
            <Button
              :label="actionType === 'defer' ? 'Tunda Pekerjaan' : 'Lanjutkan Pekerjaan'"
              :icon="actionType === 'defer' ? 'pi pi-pause' : 'pi pi-play'"
              @click="handleAction"
              :loading="submittingAction"
              :severity="actionType === 'defer' ? 'warning' : 'info'"
            />
          </div>
        </template>
      </Dialog>

      <!-- Completion Dialog -->
      <Dialog
        v-model:visible="showCompletionDialog"
        header="Konfirmasi Penyelesaian"
        :modal="true"
        :closable="true"
        :style="{ width: '600px' }"
      >
        <div class="completion-dialog">
          <div class="form-section">
            <h6 class="section-title">
              <i class="pi pi-check"></i>
              Bukti Penyelesaian
            </h6>

            <!-- Photo Upload -->
            <div class="form-field">
              <label class="form-label">Foto Bukti Penyelesaian (Opsional)</label>
              
              <div v-if="!completionPhoto" class="upload-area">
                <FileUpload
                  name="photo"
                  :auto="false"
                  :multiple="false"
                  accept="image/*"
                  @select="handlePhotoUpload"
                  choose-label="Pilih Foto"
                  :show-upload-button="false"
                  :show-cancel-button="false"
                  custom-upload
                />
              </div>
              
              <!-- Selected Photo Preview -->
              <div v-if="completionPhoto" class="photo-selected">
                <div class="selected-file">
                  <i class="pi pi-image"></i>
                  <div class="file-info">
                    <div class="file-name">{{ completionPhoto.name }}</div>
                    <div class="file-size">{{ (completionPhoto.size / 1024).toFixed(2) }} KB</div>
                  </div>
                  <Button
                    icon="pi pi-times"
                    severity="danger"
                    text
                    rounded
                    @click="removeCompletionPhoto"
                  />
                </div>
              </div>
            </div>

            <!-- Completion Notes -->
            <div class="form-field">
              <label class="form-label">Catatan Penyelesaian (Opsional)</label>
              <textarea
                v-model="completionNotes"
                rows="4"
                placeholder="Tulis catatan penyelesaian pekerjaan..."
                class="completion-textarea"
              />
              <small class="field-hint">Maksimal 500 karakter</small>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <Button
              label="Batal"
              @click="showCompletionDialog = false"
              severity="secondary"
              outlined
            />
            <Button
              label="Konfirmasi Selesai"
              icon="pi pi-check"
              @click="handleCompletionSubmit"
              :loading="submittingCompletion"
              severity="success"
            />
          </div>
        </template>
      </Dialog>

      <!-- Photo Viewer -->
      <Dialog
        v-model:visible="showPhotoViewer"
        header="Foto Laporan"
        :modal="true"
        :style="{ width: '90vw', maxWidth: '900px' }"
      >
        <img
          v-if="selectedPhoto"
          :src="selectedPhoto"
          :alt="task.report_title"
          class="photo-fullscreen"
        />
      </Dialog>
    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <i class="pi pi-times-circle"></i>
      <h2>Tugas Tidak Ditemukan</h2>
      <p>Maaf, tugas yang Anda cari tidak ditemukan.</p>
      <Button
        label="Kembali ke Daftar Tugas"
        icon="pi pi-arrow-left"
        @click="$router.back()"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { usePenugasanLayananStore } from '@/stores/penugasanLayanan'
import { useAuthStore } from '@/stores/config'
import { useRole } from '@/composables/useRole'
import LoadingFormComponent from '@/components/LoadingFormCompnent.vue'
import ActivityTimelineComponent from './components/ActivityTimelineComponent.vue'
import CategoryBadge from './components/CategoryBadge.vue'
import StatusBadge from './components/StatusBadge.vue'
import PriorityBadge from './components/PriorityBadge.vue'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'

const router = useRouter()
const route = useRoute()
const store = usePenugasanLayananStore()
const authStore = useAuthStore()
const toast = useToast()
const { isRole } = useRole()

// Role checks using generic function
const isKabid = isRole(3) // KEPALA_BIDANG = 3

// Get userId and clientId
const currentUserId = computed(() => authStore.user_id || localStorage.getItem('user_id'))
const clientId = computed(() => authStore.id_client || store.id_client.value || localStorage.getItem('id_client') || 1)

const loading = ref(true)
const submittingCompletion = ref(false)
const submittingAction = ref(false)
const task = ref(null)
const completionPhoto = ref(null)
const completionNotes = ref('')
const actionNotes = ref('')
const showPhotoViewer = ref(false)
const showActionDialog = ref(false)
const showCompletionDialog = ref(false)
const selectedPhoto = ref(null)
const actionType = ref(null) // 'defer' or 'resume'

const reportId = computed(() => route.params.reportId)
const staffAssignmentId = computed(() => route.params.staffAssignmentId)

const assignedStaff = computed(() => {
  if (!task.value?.assigned_staff || task.value.assigned_staff.length === 0) return null
  return task.value.assigned_staff[0]
})

// Check if current user is one of the assigned staff
const isCurrentUserAssigned = computed(() => {
  if (!task.value?.assigned_staff || !currentUserId.value) return false
  return task.value.assigned_staff.some(
    staff => String(staff.staff_user_id).toLowerCase() === String(currentUserId.value).toLowerCase()
  )
})

// Check if Kabid can complete task (if kabid is one of the assigned staff)
const canKabidComplete = computed(() => {
  if (!isKabid.value || !task.value?.assigned_staff || !currentUserId.value) return false
  return task.value.assigned_staff.some(
    staff => String(staff.staff_user_id) === String(currentUserId.value)
  )
})

// Check if user can perform actions (assigned staff or kabid with permission)
const canPerformActions = computed(() => {
  return isCurrentUserAssigned.value || canKabidComplete.value
})

const isTaskCompleted = computed(() =>
  ['completed', 'cancelled'].includes(task.value?.status)
)

// Filter evidence photos from photos
const evidencePhotos = computed(() => {
  if (!task.value?.photos || !Array.isArray(task.value.photos)) {
    return []
  }
  return task.value.photos.filter(photo => photo.type === 'evidence')
})

// Filter completion photos from photos
const completionPhotos = computed(() => {
  if (!task.value?.photos || !Array.isArray(task.value.photos)) {
    return []
  }
  return task.value.photos.filter(photo => photo.type === 'completion')
})

// Category display
// Status display
const getStatusDisplay = (status) => {
  const displayMap = {
    assigned: 'Ditugaskan',
    assigned_to_staff: 'Sedang Dikerjakan',
    in_progress: 'Sedang Dikerjakan',
    completed: 'Selesai',
    deferred: 'Ditunda',
    cancelled: 'Dibatalkan'
  }
  return displayMap[status] || status
}

// Format date time utility
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load task detail
const loadTask = async () => {
  try {
    loading.value = true
    const response = await store.fetchReportDetail(reportId.value)
    task.value = response
  } catch (error) {
    task.value = null
  } finally {
    loading.value = false
  }
}

// Handle completion submit
const handleCompletionSubmit = async () => {
  try {
    submittingCompletion.value = true

    // Update task status with completion - pass notes and photo
    await store.updateTaskStatus(
      reportId.value, 
      'completed', 
      completionNotes.value || '',
      completionPhoto.value // Pass the photo file
    )

    // Update local task status
    if (task.value) {
      task.value.status = 'completed'
    }

    // Reset form
    completionPhoto.value = null
    completionNotes.value = ''
    showCompletionDialog.value = false

    // Show success
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Pekerjaan telah diselesaikan',
      life: 3000
    })

    // Redirect to task list after completion (completed tasks may not be fetchable anymore)
    setTimeout(() => {
      router.push('/penugasan-layanan')
    }, 2000)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.message || 'Gagal menyelesaikan pekerjaan',
      life: 3000
    })
  } finally {
    submittingCompletion.value = false
  }
}

// Handle photo upload
const handlePhotoUpload = (event) => {
  const file = event.files[0]
  if (file) {
    completionPhoto.value = file
  }
}

// Remove completion photo
const removeCompletionPhoto = () => {
  completionPhoto.value = null
}

// Open unified action dialog
const openActionDialog = (type) => {
  actionType.value = type
  actionNotes.value = ''
  showActionDialog.value = true
}

// Unified action handler
const handleAction = async () => {
  if (!actionNotes.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: actionType.value === 'defer' 
        ? 'Silakan masukkan alasan penundaan'
        : 'Silakan masukkan catatan pelanjutan',
      life: 3000
    })
    return
  }

  try {
    submittingAction.value = true

    if (actionType.value === 'defer') {
      // Call defer API
      await store.deferTask(reportId.value, actionNotes.value, currentUserId.value, clientId.value)
      if (task.value) task.value.status = 'deferred'
      
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Pekerjaan berhasil ditunda',
        life: 3000
      })
    } else {
      // Call resume API
      await store.resumeTask(reportId.value, actionNotes.value, currentUserId.value, clientId.value)
      if (task.value) task.value.status = 'assigned_to_staff'
      
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Pekerjaan berhasil dilanjutkan',
        life: 3000
      })
    }

    // Reset form
    actionNotes.value = ''
    showActionDialog.value = false

    // Reload task to get updated status history
    setTimeout(() => {
      loadTask()
    }, 1000)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.message || 'Gagal memproses aksi',
      life: 3000
    })
  } finally {
    submittingAction.value = false
  }
}
const handleDeferTask = async () => {
  if (!deferNotes.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Silakan masukkan alasan penundaan',
      life: 3000
    })
    return
  }

  try {
    submittingDefer.value = true

    // Call defer API
    await store.deferTask(reportId.value, deferNotes.value, currentUserId.value, clientId.value)

    // Update local task status
    if (task.value) {
      task.value.status = 'deferred'
    }

    // Reset form
    deferNotes.value = ''
    showDeferDialog.value = false

    // Show success
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Pekerjaan berhasil ditunda',
      life: 3000
    })

    // Reload task to get updated status history
    setTimeout(() => {
      loadTask()
    }, 1000)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.message || 'Gagal menunda pekerjaan',
      life: 3000
    })
  } finally {
    submittingDefer.value = false
  }
}

// Handle resume task
const handleResumeTask = async () => {
  if (!resumeNotes.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Peringatan',
      detail: 'Silakan masukkan catatan pelanjutan',
      life: 3000
    })
    return
  }

  try {
    submittingResume.value = true

    // Call resume API
    await store.resumeTask(reportId.value, resumeNotes.value, currentUserId.value, clientId.value)

    // Update local task status
    if (task.value) {
      task.value.status = 'assigned_to_staff'
    }

    // Reset form
    resumeNotes.value = ''
    showResumeDialog.value = false

    // Show success
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Pekerjaan berhasil dilanjutkan',
      life: 3000
    })

    // Reload task to get updated status history
    setTimeout(() => {
      loadTask()
    }, 1000)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.message || 'Gagal melanjutkan pekerjaan',
      life: 3000
    })
  } finally {
    submittingResume.value = false
  }
}

// Photo viewer
const openPhotoViewer = (photoPath) => {
  selectedPhoto.value = photoPath
  showPhotoViewer.value = true
}

// Handle comment submission
const handleSubmitComment = async (commentText) => {
  try {
    await store.addComment(reportId.value, commentText)
    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Komentar berhasil ditambahkan',
      life: 3000
    })
    loadTask()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: error.message || 'Gagal menambahkan komentar',
      life: 3000
    })
  }
}

// Lifecycle
onMounted(() => {
  loadTask()
})
</script>

<style scoped>
/* Dialog Header Styling */
:deep(.p-dialog .p-dialog-header) {
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 100%);
  color: white;
  padding: 1.25rem 1.5rem;
  border-radius: 8px 8px 0 0;
}

:deep(.p-dialog .p-dialog-title) {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

:deep(.p-dialog .p-dialog-header-icons button) {
  color: white !important;
}

:deep(.p-dialog .p-dialog-header-icons button:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.p-dialog .p-dialog-content) {
  padding: 1.5rem;
  background: white;
}

.staff-task-detail {
  padding: 1.5rem;
  width: 100%;
}

.back-nav {
  margin-bottom: 1.5rem;
}

.back-nav :deep(.p-button) {
  color: #4f8f7a !important;
  font-weight: 600;
}

.back-nav :deep(.p-button:hover) {
  background: rgba(79, 143, 122, 0.1) !important;
}

.task-container {
  max-width: 1400px;
  margin: 0 auto;
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

/* Header */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.header-content {
  flex: 1;
}

.status-badge-wrapper {
  display: flex;
  align-items: center;
}

.status-large {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Cards */
.detail-card,
.progress-card,
.timeline-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-height: 200px;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f0f9f7 0%, #f5f8fa 100%);
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #fafafa;
  min-height: 300px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item strong {
  color: #334155;
  font-size: 0.9375rem;
}

.detail-item p {
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  word-wrap: break-word;
}

/* Action Buttons Section */
.action-buttons-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  flex: 1;
  min-height: 48px;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button :deep(.p-button-icon) {
  font-size: 1.1rem;
}

/* Deferred State */
.deferred-state {
  padding: 2rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  color: #92400e;
  text-align: center;
  margin-top: 2rem;
  border: 1px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
}

.deferred-state i {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
  color: #d97706;
}

.deferred-state h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.deferred-state p {
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.deferred-state :deep(.p-button) {
  background: #f59e0b;
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  transition: all 0.3s ease;
}

.deferred-state :deep(.p-button:hover) {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Defer/Resume Dialog */
.action-dialog {
  padding: 0;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #4f8f7a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #4f8f7a;
}

.section-title i {
  font-size: 1.25rem;
}

.form-field {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: block;
}

.required {
  color: #e74c3c;
}

.action-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
}

.action-textarea:focus {
  border-color: #4f8f7a;
  box-shadow: 0 0 0 3px rgba(79, 143, 122, 0.1);
  outline: none;
}

.action-textarea::placeholder {
  color: #cbd5e1;
}

.field-hint {
  display: block;
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.8125rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.dialog-footer :deep(.p-button) {
  min-width: 120px;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.dialog-footer :deep(.p-button-secondary) {
  border-color: #cbd5e1 !important;
  color: #64748b !important;
}

.dialog-footer :deep(.p-button-secondary):hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.dialog-footer :deep(.p-button-warning) {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  color: white;
}

.dialog-footer :deep(.p-button-warning):hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.dialog-footer :deep(.p-button-info) {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: white;
}

.dialog-footer :deep(.p-button-info):hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.photo-preview {
  margin-top: 0.5rem;
}

.task-photo {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid #e2e8f0;
  object-fit: cover;
}

.task-photo:hover {
  transform: scale(1.02);
}

.photo-fullscreen {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* Completion Dialog */
.completion-dialog {
  padding: 0;
}

.form-label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
  display: block;
}

.upload-area {
  padding: 2rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #4f8f7a;
  background: #f0f9f7;
}

.photo-selected {
  margin-top: 1rem;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #4f8f7a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selected-file i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.completion-textarea {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;
}

.completion-textarea:focus {
  border-color: #4f8f7a;
  box-shadow: 0 0 0 3px rgba(79, 143, 122, 0.1);
  outline: none;
}

.completion-textarea::placeholder {
  color: #cbd5e1;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

.full-width {
  width: 100%;
}

/* Timeline */
.timeline-card {
  height: fit-content;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.error-state i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
  display: block;
}

.error-state h2 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  font-size: 1.5rem;
}

.error-state p {
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .staff-task-detail {
    padding: 1rem;
  }

  .task-header {
    flex-direction: column;
    gap: 1rem;
  }

  .task-title {
    font-size: 1.5rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
