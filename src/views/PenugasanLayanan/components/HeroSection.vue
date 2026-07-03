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
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.hero-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon i {
  font-size: 1.75rem;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: white;
  line-height: 1.3;
}

.hero-description {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

.hero-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 100px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: all 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
}

.stat-card.loading {
  opacity: 0.6;
}

.stat-value {
  font-size: 1.625rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  min-width: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value .pi-spinner {
  font-size: 1rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.88;
  font-weight: 500;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 1.25rem;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .hero-title {
    font-size: 1.25rem;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.625rem;
  }

  .stat-card {
    min-width: unset;
  }

  .stat-value {
    font-size: 1.375rem;
  }
}
</style>
