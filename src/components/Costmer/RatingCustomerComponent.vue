<!-- CustomerReviewDialog.vue -->
<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :closable="true"
    header="Evaluasi Pelanggan"
    :style="{ width: '95%', maxWidth: '700px' }"
    :draggable="false"
    :closeOnEscape="true"
    class="customer-review-dialog"
  >
    <div class="review-card">
      <!-- Intro Section -->
      <div class="intro-section">
        <p class="intro-text">
          Biar rental makin aman & nyaman 🚗✨, yuk bantu kasih rating buat penyewa kamu 👍
          Penilaian ini bisa saling dibagi ke sesama pengusaha rental, jadi kita bisa saling jaga
          bareng 🤝 Isi aja sesuai pengalaman kamu ya! 😊
        </p>
      </div>
      <!-- {{ customerData }} -->
      <!-- User profile section -->
      <Panel>
        <div class="profile-section">
          <div class="avatar-container">
            <Avatar
              :image="customerData.avatar || ''"
              icon="pi pi-user"
              size="large"
              class="customer-avatar"
            />
          </div>
          <div class="customer-info">
            <h5>{{ customerData.customer || 'Customer Name' }}</h5>
            <div class="rating-container">
              <star-rating
                v-model:rating="rating"
                :increment="0.5"
                :max-rating="5"
                inactive-color="#9E9E9E"
                active-color="#FFD700"
                :star-size="28"
                @rating-selected="onRatingSelected"
              />
              <span class="rating-value">{{ rating }} / 5</span>
            </div>
          </div>
        </div>
      </Panel>

      <!-- Comment section -->
      <div class="comment-container mt-3">
        <label for="comment" class="comment-label">Berikan komentar Anda</label>

        <!-- Quick comment buttons -->
        <div class="quick-comments">
          <Button
            v-for="(template, index) in commentTemplates"
            :key="index"
            class="p-button-sm p-button-outlined quick-comment-button round-button"
            @click="appendTemplate(template)"
          >
            {{ template }}
          </Button>
        </div>

        <textarea
          id="comment"
          v-model="comment"
          placeholder="Bagikan pengalaman Anda dengan pelanggan ini..."
          class="comment-textarea"
          rows="5"
        />
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="dialog-footer">
        <Button
          label="Batalkan"
          icon="pi pi-times"
          class="round-button2 p-button-outlined"
          @click="closeDialog"
        />
        <Button
          label="Kirim Evaluasi"
          icon="pi pi-check"
          class="round-button2 ml-2"
          :loading="submitting"
          @click="submitReview"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import Avatar from 'primevue/avatar'
import StarRating from 'vue-star-rating'
import axios from 'axios'

import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

// Define props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  customerData: {
    type: Object,
    default: () => ({
      id: null,
      customer: '',
      avatar: '',
    }),
  },
})

// Define emits
const emit = defineEmits(['update:modelValue', 'submit-review'])

// Reactive state
const visible = ref(props.modelValue)
const rating = ref(0)
const comment = ref('')
const submitting = ref(false)
const ratingExists = ref(false)

// Comment templates
const commentTemplates = [
  'Pelanggan sangat kooperatif.',
  'Tidak ada kendala selama proses sewa.',
  'Sangat direkomendasikan!',
  'Tepat waktu dan bertanggung jawab.',
]

// Store references
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// Computed properties
const formData = computed(() => ({
  trans_id: props.customerData.no_transaksi || null,
  nik: props.customerData.id_customer || null,
  rating: rating.value,
  coment: comment.value,
  id_client: id_client.value,
}))

const requestParams = computed(() => ({
  nik: props.customerData.id_customer || null,
  trans_id: props.customerData.no_transaksi || null,
  id_client: id_client.value,
  mode: 1,
}))

// Functions
const appendTemplate = (template) => {
  comment.value += (comment.value ? ' ' : '') + template
}

const onRatingSelected = (newRating) => {
  rating.value = newRating
  console.log(`Rating updated to: ${newRating}`)
}

const resetForm = () => {
  rating.value = 0
  comment.value = ''
  ratingExists.value = false
}

const closeDialog = () => {
  visible.value = false
}

const fetchRatingData = async () => {
  if (!props.customerData.id_customer || !props.customerData.no_transaksi) {
    console.warn('Missing customer or transaction data for rating fetch')
    return
  }

  try {
    const url = configStore.apiBaseUrl

    const response = await axios.post(`${url}/v1/getdata_rating`, requestParams.value)

    if (response.data && response.data.code === 200 && response.data.data) {
      const ratingData = response.data.data

      if (ratingData) {
        rating.value = ratingData.rating || 0
        comment.value = ratingData.coment || ''
        ratingExists.value = true
      } else {
        console.log('No existing rating found')
        resetForm()
      }
    }
  } catch (error) {
    console.error('Error fetching rating data:', error)
    if (error.response) {
      console.error('Server error:', error.response.data)
    }
  }
}

const submitReview = async () => {
  if (!rating.value) {
    console.warn('Cannot submit review without rating')
    // You might want to add user feedback here
    return
  }

  try {
    submitting.value = true
    const url = configStore.apiBaseUrl

    console.log('Submitting review data:', formData.value)
    const response = await axios.post(`${url}/v1/createOrUpdateRating`, formData.value)

    if (response.data && response.data.code === 200) {
      console.log('Review submitted successfully:', response.data)
      emit('submit-review', { success: true, data: formData.value })
      closeDialog()
    } else {
      console.warn('Unexpected API response:', response.data)
    }
  } catch (error) {
    console.error('Error submitting review:', error)
    if (error.response) {
      console.error('Server error:', error.response.data)
    }
    emit('submit-review', { success: false, error })
  } finally {
    submitting.value = false
  }
}

// Lifecycle and watchers
onMounted(() => {
  if (visible.value) {
    fetchRatingData()
  }
})

watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      fetchRatingData()
    }
  },
)

watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// Expose additional state for v-model binding if needed
defineExpose({
  visible,
  rating,
  comment,
})
</script>

<style scoped>
.customer-review-dialog :deep(.p-dialog-header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 1.5rem;
}

.quick-comments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quick-comment-button {
  font-size: 0.85rem;
  padding: 0.3rem 0.75rem;
}

.customer-review-dialog :deep(.p-dialog-content) {
  padding: 0;
}

.review-card {
  padding: 1.5rem;
}

.intro-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
}

.intro-icon {
  color: #ffd700;
  font-size: 1.5rem;
  margin-right: 1rem;
  margin-top: 3px;
}

.intro-text {
  margin: 0;
  line-height: 1.6;
  color: #555;
  font-size: 15px;
}

.profile-section {
  display: flex;
  align-items: center;
}

.avatar-container {
  margin-right: 1.5rem;
}

.customer-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background-color: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.customer-info h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
  color: #333;
  font-weight: 600;
}

.rating-container {
  display: flex;
  align-items: center;
}

.rating-value {
  margin-left: 15px;
  color: #666;
  font-weight: 500;
}

.comment-label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 500;
  color: #333;
}

.comment-textarea {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2);
  background-color: #fff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;

  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .intro-section {
    flex-direction: column;
  }

  .intro-icon {
    margin-bottom: 1rem;
  }

  .profile-section {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .rating-container {
    justify-content: center;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
