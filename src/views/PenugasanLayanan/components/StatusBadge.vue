<template>
  <span class="status-text">{{ statusText }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) =>
      [
        'submitted',
        'reviewed',
        'assigned_to_dept',
        'assigned_to_staff',
        'completed',
        'deferred',
        'rejected',
      ].includes(value),
  },
  departmentName: {
    type: String,
    default: 'Bidang'
  },
  assignedStaffNames: {
    type: String,
    default: ''
  },
})

const statusConfig = {
  submitted: {
    text: 'Diajukan',
    icon: 'pi pi-send',
  },
  reviewed: {
    text: 'Direview',
    icon: 'pi pi-eye',
  },
  assigned_to_dept: {
    text: 'Ditugaskan ke ',
    icon: 'pi pi-sitemap',
  },
  assigned_to_staff: {
    text: 'Sedang Dikerjakan',
    icon: 'pi pi-spin pi-spinner',
  },
  completed: {
    text: 'Selesai',
    icon: 'pi pi-check-circle',
  },
  deferred: {
    text: 'Ditunda',
    icon: 'pi pi-pause',
  },
  rejected: {
    text: 'Ditolak',
    icon: 'pi pi-times-circle',
  },
}

const statusText = computed(() => {
  if (props.status === 'assigned_to_dept') {
    return statusConfig[props.status]?.text + props.departmentName
  }
  if (props.status === 'assigned_to_staff' && props.assignedStaffNames) {
    return statusConfig[props.status]?.text + ' oleh ' + props.assignedStaffNames
  }
  return statusConfig[props.status]?.text || props.status
})
const statusIcon = computed(() => statusConfig[props.status]?.icon || 'pi pi-info-circle')
</script>

<style scoped>
.status-text {
  font-size: 0.875rem;
  color: #334155;
}
</style>
