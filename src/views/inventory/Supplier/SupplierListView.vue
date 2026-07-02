<template>
  <div class="content">
    <loading_overlay :is-loading="loading" message="Memuat..." />
    <Toast />
    <ConfirmDialog />

    <!-- ══ HERO HEADER ══ -->
    <div class="supplier-header mb-2">
      <div class="supplier-header-left">
        <div class="supplier-header-icon">
          <i class="fas fa-truck"></i>
        </div>
        <div>
          <div class="supplier-header-title">Data Master Supplier</div>
          <div class="supplier-header-sub">Kelola data supplier perusahaan Anda</div>
        </div>
      </div>
      <div class="supplier-header-right">
        <Button
          label="Tambah Supplier"
          icon="pi pi-plus"
          class="round-button2 btn-primary-supplier"
          @click="navigateToForm()"
        />
      </div>
    </div>

    <!-- ══ PENCARIAN & FILTER ══ -->
    <Panel class="mb-2">
      <template #header>
        <span style="font-size: 12px; color: #475569; font-weight: 600">
          <h6 style="color: darkcyan; margin: 0">
            <i class="pi pi-search me-1 mr-1"></i>
            <strong>PENCARIAN & FILTER</strong>
          </h6>
        </span>
      </template>
      <div class="row align-items-end">
        <div class="col-md-9">
          <label>Cari Supplier</label>
          <InputText
            v-model="filters.search"
            placeholder="Masukkan nama supplier..."
            class="w-100"
            style="font-size: 14px"
            @input="onSearchChange"
            :disabled="loading"
          />
        </div>
        <div class="col-md-3 mt-3 mt-md-0 d-flex align-items-end">
          <Button
            label="Refresh"
            icon="pi pi-refresh"
            severity="info"
            :loading="loading"
            @click="fetchSuppliers()"
          />
        </div>
      </div>
    </Panel>

    <!-- ══ EMPTY STATE ══ -->
    <div v-if="suppliers.length === 0 && !loading" class="supplier-empty-state">
      <div class="empty-icon"><i class="fas fa-inbox"></i></div>
      <p class="empty-title">Belum ada data supplier</p>
      <small>Klik tombol "Tambah Supplier" untuk menambahkan data supplier baru</small>
    </div>

    <!-- ══ DATA TABLE ══ -->
    <div v-if="suppliers.length > 0 || loading" class="row">
      <div class="col-md-12">
        <Panel>
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <i class="pi pi-list me-1 mr-1"></i>
              <strong>DAFTAR SUPPLIER ({{ totalSuppliers }})</strong>
            </h6>
          </template>

          <DataTable
            :value="suppliers"
            :loading="loading"
            :lazy="true"
            :paginator="true"
            :rows="filters.pageSize"
            :totalRecords="totalSuppliers"
            @page="onPageChange"
            @sort="onSortChange"
            :sortField="filters.sortField"
            :sortOrder="filters.sortOrder === 'ASC' ? 1 : -1"
            responsiveLayout="scroll"
            styleClass="p-datatable-striped"
            rowsPerPageOptions="[10, 25, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Data {first} sampai {last} dari {totalRecords} supplier"
          >
            <Column field="NAMASUPLIER" header="Nama Supplier" sortable>
              <template #body="{ data }">
                <strong style="color: #1e293b">{{ data.NAMASUPLIER }}</strong>
              </template>
            </Column>

            <Column field="KOTA" header="Kota" sortable />

            <Column field="ALAMAT" header="Alamat">
              <template #body="{ data }">
                <span :title="data.ALAMAT" style="font-size: 12px">
                  {{ data.ALAMAT ? data.ALAMAT.substring(0, 40) + '...' : '-' }}
                </span>
              </template>
            </Column>

            <Column field="NOHP" header="No. HP" style="width: 120px">
              <template #body="{ data }">
                <span style="font-family: monospace; font-size: 12px">{{ data.NOHP }}</span>
              </template>
            </Column>

            <Column header="Aksi" style="width: 120px">
              <template #body="{ data }">
                <div class="action-buttons">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-info p-button-sm"
                    @click="viewSupplier(data)"
                    v-tooltip="'Lihat Detail'"
                  />
                  <Button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-warning p-button-sm"
                    @click="navigateToForm(data.IDSUPLIER)"
                    v-tooltip="'Edit'"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-sm"
                    @click="deleteSupplier(data.IDSUPLIER, data.NAMASUPLIER)"
                    v-tooltip="'Hapus'"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="p-4 text-center" style="color: #94a3b8">
                <i class="pi pi-inbox me-2" style="font-size: 1.5rem"></i>
                <p>Tidak ada data supplier</p>
              </div>
            </template>

            <template #loading>
              <div class="p-4 text-center">
                <i class="pi pi-spin pi-spinner me-2"></i> Memuat data...
              </div>
            </template>
          </DataTable>
        </Panel>
      </div>
    </div>

    <!-- ══ DETAIL DIALOG ══ -->
    <Dialog v-model:visible="showDetailDialog" header="Detail Supplier" :modal="true" :style="{ width: '45vw' }">
      <div v-if="selectedSupplier" class="supplier-detail-card">
        <dl class="supplier-details">
          <dt><i class="pi pi-user me-1"></i> Nama Supplier</dt>
          <dd>{{ selectedSupplier.NAMASUPLIER }}</dd>

          <dt><i class="pi pi-map-marker me-1"></i> Kota</dt>
          <dd>{{ selectedSupplier.KOTA }}</dd>

          <dt><i class="pi pi-home me-1"></i> Alamat</dt>
          <dd>{{ selectedSupplier.ALAMAT }}</dd>

          <dt><i class="pi pi-phone me-1"></i> No. HP</dt>
          <dd><span style="font-family: monospace">{{ selectedSupplier.NOHP }}</span></dd>

          <dt><i class="pi pi-note me-1"></i> Catatan</dt>
          <dd>{{ selectedSupplier.CATATAN || '-' }}</dd>
        </dl>
      </div>
      <template #footer>
        <Button
          label="Tutup"
          icon="pi pi-times"
          severity="secondary"
          outlined
          class="round-button2"
          @click="showDetailDialog = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { useConfigStore, useAuthStore } from '@/stores/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Panel from 'primevue/panel'

const router = useRouter()
const toast = useToast()
const configStore = useConfigStore()
const authStore = useAuthStore()

// State
const suppliers = ref([])
const loading = ref(false)
const totalSuppliers = ref(0)
const showDetailDialog = ref(false)
const selectedSupplier = ref(null)

const filters = ref({
  search: '',
  pageSize: 10,
  currentPage: 1,
  sortField: 'NAMASUPLIER',
  sortOrder: 'ASC',
})

let searchTimeout = null

const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 5000 })

const onSearchChange = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.currentPage = 1
    fetchSuppliers()
  }, 500)
}

const onPageChange = (event) => {
  filters.value.currentPage = event.page + 1
  fetchSuppliers()
}

const onSortChange = (event) => {
  filters.value.sortField = event.sortField
  filters.value.sortOrder = event.sortOrder === 1 ? 'ASC' : 'DESC'
  filters.value.currentPage = 1
  fetchSuppliers()
}

const fetchSuppliers = async () => {
  loading.value = true
  try {
    const clientId = authStore.id_client
    const params = {
      clientId,
      search: filters.value.search,
      page: filters.value.currentPage,
      limit: filters.value.pageSize,
      sortField: filters.value.sortField,
      sortOrder: filters.value.sortOrder,
    }

    const response = await axios.get(
      `${configStore.apiApotikUrl}/index.php/api/inventory/supplier_list`,
      { params }
    )

    if (response.data) {
      // Backend returns: { metadata: {...pagination...}, response: [...data...] }
      suppliers.value = response.data.response || []
      if (response.data.metadata && response.data.metadata.pagination) {
        totalSuppliers.value = response.data.metadata.pagination.total || 0
      }
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    showError('Gagal mengambil data supplier')
  } finally {
    loading.value = false
  }
}

const viewSupplier = (supplier) => {
  selectedSupplier.value = supplier
  showDetailDialog.value = true
}

const navigateToForm = (id = null) => { 
  if (id) {
    router.push(`/supplier/form/${id}`)
  } else {
    router.push('/supplier/form')
  }
}

const deleteSupplier = async (id, name) => {
  if (!confirm(`Apakah Anda yakin ingin menghapus supplier "${name}"?`)) {
    return
  }

  loading.value = true
  try {
    const clientId = authStore.id_client
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/inventory/supplier_delete/${id}`,
      {},
      { params: { clientId } }
    )
    showSuccess('Supplier berhasil dihapus')
    fetchSuppliers()
  } catch (error) {
    console.error('Error deleting supplier:', error)
    showError('Gagal menghapus supplier')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSuppliers()
})
</script>

<style scoped>
/* ── Hero Header ── */
.supplier-header {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
  border-radius: 4px;
  padding: 0.85rem 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.supplier-header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1;
}
.supplier-header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.supplier-header-title {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.2;
}
.supplier-header-sub {
  font-size: 0.72rem;
  opacity: 0.85;
  margin-top: 2px;
}
.supplier-header-right {
  display: flex;
  gap: 0.5rem;
}

/* ── Primary Supplier Button ── */
.btn-primary-supplier {
  background: #c62828 !important;
  border-color: #c62828 !important;
  color: white !important;
}
.btn-primary-supplier:hover {
  background: #b71c1c !important;
  border-color: #b71c1c !important;
}

/* ── Empty State ── */
.supplier-empty-state {
  text-align: center;
  padding: 56px 20px;
  background: #fff;
  border: 1px dashed #b2dfdb;
  border-radius: 4px;
}
.empty-icon {
  font-size: 3.5rem;
  color: #b2dfdb;
  margin-bottom: 12px;
}
.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 6px;
}
.supplier-empty-state small {
  font-size: 12px;
  color: #94a3b8;
}

/* ── Panel label ── */
label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 6px;
  display: block;
}

/* ── Detail Card (dl/dt/dd) ── */
.supplier-detail-card {
  padding: 0.5rem 0;
}
.supplier-details {
  margin: 0;
}
.supplier-details dt {
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  margin-top: 0.75rem;
}
.supplier-details dd {
  margin: 0 0 0 0;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 1rem;
}

/* ── Action Buttons ── */
.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .supplier-header {
    flex-direction: column;
    text-align: center;
  }
  .supplier-header-left {
    width: 100%;
    justify-content: center;
  }
  .supplier-header-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
