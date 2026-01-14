<template>
  <span class="category-badge">
    {{ categoryText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: {
    type: String,
    required: true,
    validator: (value) => ['IT', 'Listrik', 'Obat-obatan/BMHP', 'alat kesehatan', 'bangunan', 'kebersihan'].includes(value),
  },
})

const categoryConfig = {
  'IT': {
    text: 'IT',
    icon: 'pi pi-server',
  },
  'Listrik': {
    text: 'Listrik',
    icon: 'pi pi-bolt',
  },
  'Obat-obatan/BMHP': {
    text: 'Obat-obatan/BMHP',
    icon: 'pi pi-file-word',
  },
  'alat kesehatan': {
    text: 'Alat Kesehatan',
    icon: 'pi pi-heart',
  },
  'bangunan': {
    text: 'Bangunan',
    icon: 'pi pi-home',
  },
  'kebersihan': {
    text: 'Kebersihan',
    icon: 'pi pi-trash',
  },
}

const categoryText = computed(() => categoryConfig[props.category]?.text || props.category)
const categoryIcon = computed(() => categoryConfig[props.category]?.icon || 'pi pi-tag')
</script>

<style scoped>
.category-badge {
  font-size: 0.875rem;
  color: #334155;
}

/* Bangunan - Soft orange */
.category-bangunan {
  background: #fed7aa;
  color: #92400e;
}

/* Kebersihan - Soft green */
.category-kebersihan {
  background: #dcfce7;
  color: #166534;
}
</style>
