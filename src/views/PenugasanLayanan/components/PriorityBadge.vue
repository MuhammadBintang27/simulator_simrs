<template>
  <span class="priority-badge">
    {{ priorityText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  priority: {
    type: String,
    default: null,
    validator: (value) => value === null || ['urgent', 'high', 'medium', 'low'].includes(value),
  },
})

const priorityConfig = {
  urgent: {
    text: 'Mendesak',
    icon: 'pi pi-exclamation-triangle',
  },
  high: {
    text: 'Tinggi',
    icon: 'pi pi-arrow-up',
  },
  medium: {
    text: 'Sedang',
    icon: 'pi pi-minus',
  },
  low: {
    text: 'Rendah',
    icon: 'pi pi-arrow-down',
  },
  pending: {
    text: 'Menunggu Penetapan',
    icon: 'pi pi-clock',
  },
}

const priorityText = computed(() => priorityConfig[props.priority || 'pending']?.text || props.priority)
const priorityIcon = computed(() => priorityConfig[props.priority || 'pending']?.icon || 'pi pi-info-circle')
</script>

<style scoped>
.priority-badge {
  font-size: 0.875rem;
  color: #334155;
}
</style>
