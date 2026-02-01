<template>
  <Card class="reports-table-card">
    <template #content>
      <DataTable
        :value="reports"
        :paginator="enablePagination"
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50, 100]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} hingga {last} dari {totalRecords} laporan"
        responsiveLayout="scroll"
        class="reports-datatable"
        :globalFilterFields="['problem_title', 'location', 'report_no']"
      >
        <!-- Nomor -->
        <!-- <Column 
          field="report_no" 
          header="No. Laporan" 
          :sortable="true" 
          style="width: 120px"
        >
          <template #body="slotProps">
            <div class="report-number-cell">
              {{ slotProps.data.report_no || `#${slotProps.data.report_id}` }}
            </div>
          </template>
        </Column> -->

        <!-- Judul -->
        <Column field="problem_title" header="Judul" :sortable="true" style="width: 350px">
          <template #body="slotProps">
            <div class="title-text">
              <div class="title-main">{{ slotProps.data.problem_title }}</div>
              <div class="title-description" v-if="slotProps.data.problem_description">
                {{ slotProps.data.problem_description }}
              </div>
            </div>
          </template>
        </Column>

        <!-- Lokasi -->
        <Column field="location" header="Lokasi" :sortable="true" style="width: 180px">
          <template #body="slotProps">
            <div class="location-cell">
              <i class="pi pi-map-marker"></i>
              {{ slotProps.data.location }}
            </div>
          </template>
        </Column>

        <!-- Tanggal -->
        <Column field="report_date" header="Tanggal" :sortable="true" style="width: 130px">
          <template #body="slotProps">
            <div class="date-cell">
              <div class="date-content">
                <div class="date-absolute">{{ formatDate(slotProps.data.report_date) }}</div>
                <div class="date-relative">
                  {{ formatRelativeDate(slotProps.data.report_date) }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <!-- Status -->
        <Column field="status" header="Status" :sortable="true" style="width: 160px">
          <template #body="slotProps">
            <StatusBadge
              :status="slotProps.data.status"
              :department-name="slotProps.data.bidang_name || 'Bidang'"
              :assigned-staff-names="slotProps.data.assigned_staff_names"
            />
          </template>
        </Column>

        <!-- Actions -->
        <Column
          header="Aksi"
          :sortable="false"
          style="width: 150px"
          :frozen="true"
          alignFrozen="right"
        >
          <template #body="slotProps">
            <div
              class="action-buttons"
              :class="{
                'single-button': !hasSecondaryButton(slotProps.data),
                'double-buttons': hasSecondaryButton(slotProps.data),
              }"
            >
              <!-- Detail Button - Always show -->
              <Button
                icon="pi pi-eye"
                severity="info"
                size="small"
                @click="$emit('view-detail', slotProps.data)"
                v-tooltip.top="'Lihat Detail'"
              />

              <!-- Edit Button - Conditional -->
              <Button
                v-if="showEdit && slotProps.data.status === 'submitted'"
                icon="pi pi-pencil"
                severity="warning"
                size="small"
                @click="$emit('edit', slotProps.data)"
                v-tooltip.top="'Edit Laporan'"
              />

              <!-- Assign to Department Button - Conditional -->
              <Button
                v-if="showAssignToDept && canAssign(slotProps.data)"
                icon="pi pi-send"
                severity="help"
                size="small"
                @click="$emit('assign-dept', slotProps.data)"
                v-tooltip.top="'Tugaskan ke Bidang'"
              />

              <!-- Assign to Staff Button - Conditional -->
              <Button
                v-if="showAssignToStaff && canAssignStaff(slotProps.data)"
                icon="pi pi-users"
                severity="success"
                size="small"
                @click="$emit('assign-staff', slotProps.data)"
                v-tooltip.top="'Tugaskan ke Staff'"
              />

              <!-- Completion Button - Conditional -->
              <Button
                v-if="showCompletion && canComplete(slotProps.data)"
                icon="pi pi-check-circle"
                severity="success"
                size="small"
                @click="$emit('complete', slotProps.data)"
                v-tooltip.top="'Selesaikan Tugas'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup>
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import StatusBadge from './StatusBadge.vue'

const props = defineProps({
  reports: {
    type: Array,
    required: true,
    default: () => [],
  },
  enablePagination: {
    type: Boolean,
    default: true,
  },
  showEdit: {
    type: Boolean,
    default: false,
  },
  showAssignToDept: {
    type: Boolean,
    default: false,
  },
  showAssignToStaff: {
    type: Boolean,
    default: false,
  },
  canAssign: {
    type: Function,
    default: () => false,
  },
  canAssignStaff: {
    type: Function,
    default: () => false,
  },
  showCompletion: {
    type: Boolean,
    default: false,
  },
  canComplete: {
    type: Function,
    default: () => false,
  },
})

defineEmits(['view-detail', 'edit', 'assign-dept', 'assign-staff', 'complete'])

const formatDate = (date) => {
  if (!date) return '-'
  try {
    return format(parseISO(date), 'dd MMM yyyy', { locale: id })
  } catch {
    return date
  }
}

const formatRelativeDate = (date) => {
  if (!date) return '-'
  try {
    return formatDistanceToNow(parseISO(date), { locale: id, addSuffix: true })
  } catch {
    return '-'
  }
}

const hasSecondaryButton = (data) => {
  // Check if there's a secondary button besides the detail button
  const hasEdit = props.showEdit && data.status === 'submitted'
  const hasAssignDept = props.showAssignToDept && props.canAssign(data)
  const hasAssignStaff = props.showAssignToStaff && props.canAssignStaff(data)

  return hasEdit || hasAssignDept || hasAssignStaff
}
</script>

<style scoped>
/* Card Styling */
.reports-table-card {
  margin-top: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.reports-table-card :deep(.p-card-body) {
  padding: 0;
}

.reports-table-card :deep(.p-card-content) {
  padding: 0;
}

/* DataTable Styling */
.reports-datatable :deep(.p-datatable) {
  border: none;
  background: white;
}

.reports-datatable :deep(.p-datatable-wrapper) {
  border-radius: 0;
}

.reports-datatable :deep(.p-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}

.reports-datatable :deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background: #f8fafc !important;
}

.reports-datatable :deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.875rem 1rem;
  color: #334155;
  font-size: 0.9rem;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
}

/* Cell Styling */
.report-number-cell {
  font-weight: 600;
  font-size: 0.9rem;
}

.title-text {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  line-height: 1.4;
}

.title-main {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-description {
  font-weight: 400;
  font-size: 0.9rem;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.location-cell {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.location-cell i {
  font-size: 0.75rem;
}

.date-cell {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0;
}

.date-cell i {
  font-size: 0.75rem;
  color: #94a3b8;
  flex-shrink: 0;
}

.date-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.date-absolute {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

.date-relative {
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons.single-button {
  justify-content: center;
}

.action-buttons.double-buttons {
  justify-content: center;
}

.action-buttons :deep(.p-button) {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-buttons :deep(.p-button .p-button-icon) {
  font-size: 0.875rem;
}

.action-buttons :deep(.p-button-info) {
  background: #3b82f6;
  border-color: #3b82f6;
}

.action-buttons :deep(.p-button-info:hover) {
  background: #2563eb;
  border-color: #2563eb;
}

.action-buttons :deep(.p-button-warning) {
  background: #f59e0b;
  border-color: #f59e0b;
}

.action-buttons :deep(.p-button-warning:hover) {
  background: #d97706;
  border-color: #d97706;
}

.action-buttons :deep(.p-button-help) {
  background: #8b5cf6;
  border-color: #8b5cf6;
}

.action-buttons :deep(.p-button-help:hover) {
  background: #7c3aed;
  border-color: #7c3aed;
}

.action-buttons :deep(.p-button-success) {
  background: #10b981;
  border-color: #10b981;
}

.action-buttons :deep(.p-button-success:hover) {
  background: #059669;
  border-color: #059669;
}

/* Responsive untuk kolom aksi */
@media (max-width: 1024px) {
  .action-buttons {
    gap: 0.375rem;
  }

  .action-buttons :deep(.p-button) {
    width: 32px;
    height: 32px;
  }

  .action-buttons :deep(.p-button .p-button-icon) {
    font-size: 0.8rem;
  }
}

/* Pagination */
.reports-datatable :deep(.p-paginator) {
  border-top: 1px solid #e2e8f0;
  padding: 0.875rem 1rem;
  background: #fafbfc;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.reports-datatable :deep(.p-paginator .p-paginator-current) {
  color: #64748b;
  font-size: 0.85rem;
  order: -1;
  width: 100%;
  text-align: center;
  margin-bottom: 0.5rem;
}

.reports-datatable :deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
}

.reports-datatable :deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background: #4a8f5e;
  border-color: #4a8f5e;
  color: white;
}

/* Frozen Column */
.reports-datatable :deep(.p-datatable-frozen-column) {
  background: inherit !important;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}
</style>
