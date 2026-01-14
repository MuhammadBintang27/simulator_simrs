<template>
  <div class="hero-section">
    <div class="hero-content">
      <div class="hero-icon">
        <i :class="icon"></i>
      </div>
      <div class="hero-text">
        <h1 class="hero-title">{{ title }}</h1>
        <p class="hero-description">{{ description }}</p>
      </div>
    </div>
    <div class="hero-stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-card" :class="{ loading: loading }">
        <div class="stat-value">
          <span v-if="!loading">{{ stat.value }}</span>
          <i v-else class="pi pi-spin pi-spinner"></i>
        </div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'pi pi-file'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stats: {
    type: Array,
    required: true
    // Expected format: [{ label: 'Total', value: 10 }, ...]
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #4f8f7a 0%, #3f7663 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hero-content {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon i {
  font-size: 2.5rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.hero-description {
  font-size: 1rem;
  opacity: 0.95;
  margin: 0;
  line-height: 1.6;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.stat-card.loading {
  opacity: 0.7;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value .pi-spinner {
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 1.5rem;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 1.75rem;
  }
}
</style>
