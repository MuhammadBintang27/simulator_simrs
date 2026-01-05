<template>
  <Toast />
  <loading_overlay :is-loading="loading" message="Memuat...." />
  <section class="content light-theme">
    <ContentHeader title="Customer Management" icon="pi pi-users"></ContentHeader>

    <!-- Summary Cards Section -->
    <div class="summary-cards-container">
      <div class="summary-card total-customers">
        <div class="card-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="card-content">
          <h3>{{ totalCustomers }}</h3>
          <p>Total Customers</p>
        </div>
      </div>

      <div class="summary-card active-customers">
        <div class="card-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="card-content">
          <h3>{{ activeCustomers }}</h3>
          <p>Active Customers</p>
        </div>
      </div>

      <div class="summary-card customer-types">
        <div class="card-icon">
          <i class="pi pi-chart-pie"></i>
        </div>
        <div class="card-content">
          <h3>{{ customerTypes }}</h3>
          <p>Customer Types</p>
        </div>
      </div>

      <div class="summary-card avg-discount">
        <div class="card-icon">
          <i class="pi pi-percentage"></i>
        </div>
        <div class="card-content">
          <h3>{{ avgDiscount }}</h3>
          <p>Customer Baru</p>
        </div>
      </div>
    </div>

    <Panel class="main-panel">
      <template #icons>
        <Button
          icon="pi pi-refresh"
          severity="info"
          class="round-button2"
          @click="fetchData()"
          label="Refresh"
          text
        />
        <Button
          label="Add Customer"
          icon="pi pi-plus"
          severity="success"
          @click="inputNewCustomer()"
          class="primary round-button2"
        />
      </template>
      <template #header>
        <div class="panel-header">
          <IconField class="search-field">
            <InputIcon class="pi pi-search" />
            <InputText v-model="searchTerm" placeholder="Pencarian..." size="small" class="ml-0" />
          </IconField>
        </div>
      </template>

      <div v-if="fact.length == 0 && visbleForm == false" class="empty-state">
        <img
          height="200"
          width="200"
          src="https://img.freepik.com/free-vector/empty-box-concept-illustration_114360-29453.jpg?ga=GA1.1.225033534.1729173884&semt=ais_hybrid"
          alt="No data"
        />
        <p class="empty-text">No customers found</p>
        <Button
          label="Add First Customer"
          icon="pi pi-plus"
          @click="visbleForm = true"
          class="action-button primary"
        />
      </div>

      <DataTable
        v-if="fact.length > 0"
        :value="filteredResults"
        tableStyle="min-width: 50rem"
        scrollable
        hover
        stripedRows
        scrollHeight="450px"
        class="customer-table"
        paginator
        :rows="10"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      >
        <Column field="id" style="width: 80px" header="ID" sortable>
          <template #body="slotProps">
            <div class="id-badge">{{ slotProps.data.id }}</div>
          </template>
        </Column>
        <Column field="nik" header="NIK" sortable>
          <template #body="slotProps">
            <span class="nik-text">{{ slotProps.data.nik }}</span>
          </template>
        </Column>
        <Column field="nama" header="NAME" sortable>
          <template #body="slotProps">
            <div class="customer-name">
              <i class="pi pi-user customer-icon"></i>
              <span>{{ slotProps.data.nama }}</span>
            </div>
          </template>
        </Column>
        <Column field="alamat" header="ADDRESS" sortable>
          <template #body="slotProps">
            <span class="address-text">{{ slotProps.data.alamat }}</span>
          </template>
        </Column>
        <Column field="no_hp" header="PHONE">
          <template #body="slotProps">
            <div class="phone-number">
              <i class="pi pi-phone"></i>
              <span>{{ slotProps.data.no_hp }}</span>
            </div>
          </template>
        </Column>
        <Column field="jenis_kelamin" header="GENDER">
          <template #body="slotProps">
            <div class="gender-badge" :class="slotProps.data.jenis_kelamin?.toLowerCase()">
              {{ slotProps.data.jenis_kelamin }}
            </div>
          </template>
        </Column>
        <Column header="ACTIONS" style="width: 120px">
          <template #body="slotProps">
            <div class="action-buttons">
              <Button
                icon="pi pi-pencil"
                severity="info"
                size="small"
                text
                @click="editCustomer(slotProps.data)"
                v-tooltip="'Edit'"
              />

              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                text
                @click="confirmDelete(slotProps.data)"
                v-tooltip="'Delete'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Panel>

    <!-- Enhanced Form Dialog -->
    <Dialog
      v-model:visible="visbleForm"
      modal
      :teleportOptions="{ disabled: true }"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="customer-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <h3><i class="pi pi-user-plus"></i> Customer Form</h3>
        </div>
      </template>

      <FormCustomer :data="SelectedData" :mode="mode_action"></FormCustomer>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      :style="{ width: '450px' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      class="delete-dialog"
    >
      <template #header>
        <div class="dialog-header delete-header">
          <i class="pi pi-exclamation-triangle" style="color: #ef4444; margin-right: 8px"></i>
          <h3>Confirm Delete</h3>
        </div>
      </template>

      <div class="delete-content">
        <div class="delete-icon">
          <i class="pi pi-trash" style="font-size: 48px; color: #ef4444"></i>
        </div>
        <div class="delete-message">
          <p class="delete-title">Are you sure you want to delete this customer?</p>
          <div class="customer-info" v-if="customerToDelete">
            <p><strong>Name:</strong> {{ customerToDelete.nama }}</p>
            <p><strong>NIK:</strong> {{ customerToDelete.nik }}</p>
            <p><strong>Phone:</strong> {{ customerToDelete.no_hp }}</p>
          </div>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
      </div>

      <template #footer>
        <div class="delete-footer">
          <Button
            label="Cancel"
            severity="secondary"
            @click="deleteDialogVisible = false"
            class="cancel-button"
          />
          <Button
            label="Delete"
            severity="danger"
            @click="executeDelete()"
            :loading="loading"
            icon="pi pi-trash"
            class="delete-button"
          />
        </div>
      </template>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardCard from '@/components/Dashboard/DashboardCardComponent.vue'
import { useConfigStore, useAuthStore } from '@/stores/config'

import FormCustomer from '@/components/Costmer/CostomerAddComponent.vue'

import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import axios from 'axios'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)
const toast = useToast()

// Reactive state
const loading = ref(false)

const visbleForm = ref(false)
const searchTerm = ref('')
const fact = ref([])

const mode_action = ref(0)

// Delete confirmation state
const deleteDialogVisible = ref(false)
const customerToDelete = ref(null)

// Form initialization
const form = ref({
  nama: null,
  nik: '',
  alamat: null,
  no_hp: null,
  diskon: null,
  jenisKelaminSelected: null,
  jenisCustomerSelected: null,
  pekerjaan: '',
  mode: 0,
  tempat_lahir: null,
  tanggal_lahir: null,
  id_client: id_client.value,
})

// Computed properties for summary cards
const totalCustomers = computed(() => fact.value.length)
const activeCustomers = computed(
  () => fact.value.filter((customer) => customer.status !== 'inactive').length,
)
const customerTypes = computed(() => {
  const types = new Set(fact.value.map((customer) => customer.jenis_customer).filter(Boolean))
  return types.size
})
const avgDiscount = computed(() => {
  const discounts = fact.value.map((customer) => customer.diskon || 0).filter((d) => d > 0)
  return discounts.length > 0
    ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
    : 0
})

const inputNewCustomer = () => {
  visbleForm.value = true
  mode_action.value = 2
}

// Functions
const resetForm = () => {
  form.value = {
    nama: null,
    nik: '',
    alamat: null,
    no_hp: null,
    diskon: null,
    jenisKelaminSelected: null,
    jenisCustomerSelected: null,
    pekerjaan: '',
    mode: 0,
    tempat_lahir: null,
    tanggal_lahir: new Date(),
    id_client: id_client.value,
  }
}

const closeForm = () => {
  visbleForm.value = false
  resetForm()
}

const showToast = (type, summary, detail = '') => {
  toast.add({
    severity: type,
    summary,
    detail,
    life: 3000,
  })
}

const SelectedData = ref(null)

const editCustomer = (customer) => {
  // Implement edit functionality
  SelectedData.value = customer
  visbleForm.value = true
  mode_action.value = 1 //edit
  console.log('Edit customer:', customer)
}

// Delete confirmation functions
const confirmDelete = (customer) => {
  customerToDelete.value = customer
  deleteDialogVisible.value = true
}

const executeDelete = async () => {
  if (!customerToDelete.value || loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    // Create delete request payload
    const deletePayload = {
      id: customerToDelete.value.id,
      id_client: id_client.value,
      mode: 3, // Assuming mode 3 is for delete operation
    }

    console.log(deletePayload)

    const response = await axios.post(`${url}/v1/deleteCustomer`, deletePayload)

    if (response.data.code === 200) {
      // Remove customer from local array
      const index = fact.value.findIndex((customer) => customer.id === customerToDelete.value.id)
      if (index !== -1) {
        fact.value.splice(index, 1)
      }

      showToast(
        'success',
        'Customer deleted successfully',
        `${customerToDelete.value.nama} has been removed`,
      )
      deleteDialogVisible.value = false
      customerToDelete.value = null
    } else {
      showToast('error', 'Delete failed', response.data.message || 'Failed to delete customer')
    }
  } catch (error) {
    console.error('Delete failed:', error)
    showToast(
      'error',
      'Delete failed',
      error.message || 'An error occurred while deleting customer',
    )
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredResults = computed(() => {
  if (!searchTerm.value) return fact.value

  const term = searchTerm.value.toLowerCase()
  return fact.value.filter(
    (item) =>
      (item.nama && item.nama.toLowerCase().includes(term)) ||
      (item.nik && item.nik.toString().includes(term)) ||
      (item.no_hp && item.no_hp.toString().includes(term)),
  )
})

// API calls
const fetchData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    form.value.mode = 1

    const response = await axios.post(`${url}/getCusomer`, form.value)
    fact.value = response.data.response || []
  } catch (error) {
    console.error('Error fetching data:', error)
    showToast('error', 'Data retrieval failed', error.message)
  } finally {
    loading.value = false
  }
}

const SimpanData = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    form.value.id_client = id_client.value

    const response = await axios.post(`${url}/insertCustomer`, form.value)

    if (response.data.code === 200) {
      visbleForm.value = false
      resetForm()
      showToast('success', 'Customer successfully added')
      fetchData() // Refresh the data
    } else {
      showToast('warn', 'Failed', response.data.message)
    }
  } catch (error) {
    console.error('Process failed:', error)
    showToast('error', 'Failed', error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Light Theme Base */
.light-theme {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  padding: 20px;
}

/* Summary Cards */
.summary-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 5px;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border-radius: 5px;
  padding: 24px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
}

.summary-card.total-customers::before {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.summary-card.active-customers::before {
  background: linear-gradient(90deg, #10b981, #059669);
}

.summary-card.customer-types::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.summary-card.avg-discount::before {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.total-customers .card-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.active-customers .card-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.customer-types .card-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.avg-discount .card-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.card-content h3 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.card-content p {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
  font-weight: 500;
}

/* Main Panel */
.main-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 4px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.search-input {
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Action Buttons */
.action-button {
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
}

.action-button.primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.action-button.secondary {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
}

.action-button.secondary:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  color: #64748b;
  font-size: 16px;
  margin: 16px 0 24px;
}

/* Table Styles */
.customer-table {
  background: white;
  border-radius: 5px;
  overflow: hidden;
}

.id-badge {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
}

.customer-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.customer-icon {
  color: #3b82f6;
}

.phone-number {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}

.gender-badge {
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.gender-badge.pria {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
}

.gender-badge.wanita {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  color: #be185d;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Dialog Styles */
.customer-dialog {
  border-radius: 5px;
  overflow: hidden;
}

.dialog-header h3 {
  margin: 0;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-container {
  padding: 0;
}

.form-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: none;
  box-shadow: none;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input,
.form-select {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.info-message {
  margin-top: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 1px solid #93c5fd;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

/* Delete Dialog Styles */
.delete-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.delete-header {
  display: flex;
  align-items: center;
  color: #ef4444;
}

.delete-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.delete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.delete-icon {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-message {
  max-width: 400px;
}

.delete-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.customer-info {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: left;
}

.customer-info p {
  margin: 4px 0;
  color: #475569;
}

.customer-info strong {
  color: #1e293b;
}

.delete-warning {
  color: #ef4444;
  font-weight: 500;
  margin-top: 12px;
  font-size: 14px;
}

.delete-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

.cancel-button {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  transform: translateY(-1px);
}

.delete-button {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .summary-cards-container {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .delete-content {
    padding: 10px 0;
  }

  .delete-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }

  .delete-footer {
    flex-direction: column;
    gap: 8px;
  }

  .cancel-button,
  .delete-button {
    width: 100%;
  }
}
</style>
