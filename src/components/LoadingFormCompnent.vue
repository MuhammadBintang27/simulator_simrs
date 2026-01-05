<!-- LoadingOverlay.vue -->
<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loader-container">
      <div class="loader"></div>
      <!-- <p v-if="message" class="loading-message">{{ message }}</p> -->
    </div>
  </div>

  <!-- <div v-if="isLoading" class="loading-overlay">
    <div class="loader-container">
      
      <img src="@/assets/loading2.gif" alt="Loading..." class="loading-image" />
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div> -->
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: 'Loading...',
  },
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-container {
  /* background-color: white; */
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
}

.loading-message {
  margin-top: 10px;
  color: #333;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
