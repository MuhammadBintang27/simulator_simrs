<template>
  <div class="card shadow-sm" :class="[`border-${color}`, extraClass]">
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <div>
          <h5 class="card-title text-muted">{{ title }}</h5>
          <div class="d-flex align-items-baseline mt-3">
            <h3 class="card-value mb-0" :class="`text-${color}`">{{ value }}</h3>
            <div v-if="trend" class="ms-2 d-flex align-items-center" :class="trendClass">
              <span class="trend-arrow" v-html="trendArrow"></span>
              <span class="ms-1">{{ trend }}</span>
            </div>
          </div>
          <p v-if="description" class="card-text text-muted mt-2">{{ description }}</p>
        </div>
        <div v-if="$slots.icon" class="icon-container" :class="`bg-${color} bg-opacity-10`">
          <slot name="icon"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  trend: {
    type: [String, Number],
    default: null,
  },
  trendDirection: {
    type: String,
    default: null,
    validator: (value) => ['up', 'down', null].includes(value),
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(
        value,
      ),
  },
  extraClass: {
    type: String,
    default: '',
  },
})

const trendClass = computed(() => {
  if (!props.trendDirection) return 'text-muted'
  return props.trendDirection === 'up' ? 'text-success' : 'text-danger'
})

const trendArrow = computed(() => {
  if (!props.trendDirection) return ''
  return props.trendDirection === 'up'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>'
})
</script>

<style scoped>
.card {
  border-top: none;
  border-right: none;
  border-bottom: none;
  border-left: 4px solid;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}

.card-value {
  font-weight: 700;
  font-size: 1.75rem;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
}

.trend-arrow {
  display: flex;
  align-items: center;
  transform: rotate(180deg);
}

.text-success .trend-arrow {
  transform: rotate(0deg);
}
</style>
