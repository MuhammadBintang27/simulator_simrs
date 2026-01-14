<template>
  <Card class="activity-card">
    <template #title>
      <div class="card-header">
        <i class="pi pi-history"></i>
        Riwayat & Komentar
      </div>
    </template>

    <template #content>
      <!-- Activity List -->
      <div class="activity-list" ref="activityList">
        <div v-if="reversedHistory && reversedHistory.length > 0">
          <!-- Activity Item -->
          <div 
            v-for="(item, index) in reversedHistory" 
            :key="item.history_id || index" 
            class="activity-item"
          >
            <div class="avatar">
              <i class="pi pi-user"></i>
            </div>
            <div class="content">
              <div class="header">
                <strong>{{ item.changed_by_name || 'Anonim' }}</strong>
                <span class="action">
                  {{ getActionLabel(item) }}
                </span>
              </div>
              <div v-if="item.notes && !isActionInLabel(item)" class="comment-bubble">
                {{ item.notes }}
              </div>
              <div class="time">{{ formatDate(item.changed_at) }}</div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>Belum ada riwayat atau komentar</p>
        </div>
      </div>

      <!-- Comment Form -->
      <div class="comment-form">
        <div class="form-row">
          <div class="avatar">
            <i class="pi pi-user"></i>
          </div>
          <Textarea 
            v-model="commentText" 
            rows="2" 
            placeholder="Tulis komentar..."
            class="comment-input"
            @keydown.ctrl.enter="submitComment"
          />
        </div>
        <div class="form-actions">
          <Button 
            label="Kirim" 
            icon="pi pi-send" 
            @click="submitComment"
            :disabled="!commentText.trim()"
            size="small"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import StatusBadge from './StatusBadge.vue'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

const props = defineProps({
  statusHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['submit-comment'])

const commentText = ref('')
const activityList = ref(null)

// Reverse array so newest items appear at the bottom
const reversedHistory = computed(() => {
  return [...(props.statusHistory || [])].reverse()
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = parseISO(dateString)
    return format(date, 'dd MMM yyyy, HH:mm', { locale: id })
  } catch (error) {
    return dateString
  }
}

const submitComment = () => {
  if (commentText.value.trim()) {
    emit('submit-comment', commentText.value.trim())
    commentText.value = ''
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (activityList.value) {
      activityList.value.scrollTop = activityList.value.scrollHeight
    }
  })
}

// Get action label based on action_type and status
const getActionLabel = (item) => {
  // Check action_type first (highest priority)
  if (item.action_type === 'comment') return 'menambahkan komentar'
  if (item.action_type === 'assignment') return 'melakukan penugasan'
  if (item.action_type === 'reassignment') return 'melakukan penugasan ulang'
  if (item.action_type === 'completion') return 'menyelesaikan tugas'
  if (item.action_type === 'deferral') return 'menunda pekerjaan'
  if (item.action_type === 'rejection') return 'menolak tugas'
  
  // Check status_change with new_status for resume
  if (item.action_type === 'assigned_to_staff' && item.new_status === 'assigned_to_staff' && item.previous_status === 'deferred') {
    return 'melanjutkan pekerjaan'
  }
  
  // Fallback: check new_status for defer/resume
  if (item.new_status === 'deferred') return 'menunda pekerjaan'
  if (item.new_status === 'assigned_to_staff' && item.previous_status === 'deferred') return 'melanjutkan pekerjaan'
  
  // Default
  return 'mengubah status'
}

// Check if action is included in label (not in notes)
// Return false so notes always display
const isActionInLabel = (item) => {
  return false
}

// Auto scroll when new items added
watch(() => props.statusHistory?.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.card-header i {
  color: #3b82f6;
  font-size: 1.25rem;
}

/* Activity List */
.activity-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Activity Item */
.activity-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* Avatar */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar i {
  color: #4f46e5;
  font-size: 1rem;
}

/* Content */
.content {
  flex: 1;
  min-width: 0;
}

.content.full-width {
  margin-left: 0;
}

.header {
  margin-bottom: 0.5rem;
}

.header strong {
  color: #1e293b;
  font-size: 0.9375rem;
  font-weight: 600;
}

.header .action {
  color: #64748b;
  font-size: 0.875rem;
  margin-left: 0.25rem;
}

.notes {
  background: #f8fafc;
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #475569;
  margin: 0.5rem 0;
  border-left: 3px solid #cbd5e1;
}

/* Comment Activity */
.comment-bubble {
  background: #f1f5f9;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  color: #1e293b;
  line-height: 1.5;
  margin: 0.5rem 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Time */
.time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #94a3b8;
}

.empty-state i {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  display: block;
}

.empty-state p {
  font-size: 0.9375rem;
  margin: 0;
}

/* Comment Form */
.comment-form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.comment-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.875rem;
  padding: 0.625rem 1rem;
}

.comment-input:hover {
  border-color: #cbd5e1;
}

.comment-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .avatar {
    width: 32px;
    height: 32px;
  }

  .avatar i {
    font-size: 0.875rem;
  }

  .activity-list {
    max-height: 400px;
  }
}
</style>
