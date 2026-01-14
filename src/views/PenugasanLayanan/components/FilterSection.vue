<template>
  <div class="card elevation-0 mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="m-0 d-flex align-items-center gap-2 filter-title">
          <i class="pi pi-filter"></i> Filter & Pencarian
        </h5>
        <div class="d-flex gap-2">
          <slot name="actions"></slot>
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            @click="$emit('refresh')"
            :loading="loading"
            outlined
            size="small"
          />
        </div>
      </div>

      <!-- Filter Row -->
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <label class="filter-label"><i class="pi pi-search"></i> Pencarian</label>
          <InputText
            :modelValue="filters.search"
            @update:modelValue="updateFilter('search', $event)"
            :placeholder="searchPlaceholder"
            class="w-100"
          />
        </div>
        <div class="col-md-2">
          <label class="filter-label"><i class="pi pi-tag"></i> Kategori</label>
          <Select
            :modelValue="filters.category"
            @update:modelValue="updateFilter('category', $event)"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="w-100"
            :showClear="true"
          />
        </div>
        <div class="col-md-2">
          <label class="filter-label"><i class="pi pi-exclamation-circle"></i> Prioritas</label>
          <Select
            :modelValue="filters.priority"
            @update:modelValue="updateFilter('priority', $event)"
            :options="priorityOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="w-100"
            :showClear="true"
          />
        </div>
        <div class="col-md-2">
          <label class="filter-label"><i class="pi pi-info-circle"></i> Status</label>
          <Select
            :modelValue="filters.status"
            @update:modelValue="updateFilter('status', $event)"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua"
            class="w-100"
            :showClear="true"
          />
        </div>
        <div class="col-md-3">
          <label class="filter-label"><i class="pi pi-calendar"></i> Rentang Tanggal</label>
          <DatePicker
            :modelValue="filters.dateRange"
            @update:modelValue="updateFilter('dateRange', $event)"
            selectionMode="range"
            dateFormat="dd M yy"
            placeholder="Pilih rentang tanggal"
            showIcon
            class="w-100"
            iconDisplay="input"
          />
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted filter-result-text">
          Menampilkan <b>{{ filteredCount }}</b> dari <b>{{ totalCount }}</b> laporan
        </div>
        <Button
          label="Reset Filter"
          icon="pi pi-filter-slash"
          @click="$emit('reset')"
          class="p-button-secondary p-button-sm p-button-text"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  filteredCount: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Cari judul laporan...'
  }
})

const emit = defineEmits(['update:filters', 'refresh', 'reset'])

const categoryOptions = [
  { label: 'IT', value: 'IT' },
  { label: 'Listrik', value: 'Listrik' },
  { label: 'Obat-obatan/BMHP', value: 'Obat-obatan/BMHP' },
  { label: 'Alat Kesehatan', value: 'Alat Kesehatan' },
  { label: 'Bangunan', value: 'Bangunan' },
  { label: 'Kebersihan', value: 'Kebersihan' }
]

const priorityOptions = [
  { label: 'Mendesak', value: 'urgent' },
  { label: 'Tinggi', value: 'high' },
  { label: 'Sedang', value: 'medium' },
  { label: 'Rendah', value: 'low' }
]

const statusOptions = [
  { label: 'Diajukan', value: 'submitted' },
  { label: 'Ditugaskan ke Bidang', value: 'assigned_to_dept' },
  { label: 'Sedang Dikerjakan', value: 'assigned_to_staff' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Ditunda', value: 'deferred' },
]

const updateFilter = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<style scoped>
.filter-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
}

.filter-label {
  font-weight: 600;
  font-size: 1rem;
  color: #334155;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.filter-label i {
  color: #4f8f7a;
  font-size: 1rem;
}

.filter-result-text {
  font-size: 1rem;
}
</style>
