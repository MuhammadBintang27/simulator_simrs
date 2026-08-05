<template>
  <div class="content">
    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-left">
        <div class="hero-icon-wrap"><i class="fas fa-users-cog"></i></div>
        <div>
          <h1 class="hero-title">Manajemen User</h1>
          <p class="hero-desc">Kelola data pengguna sistem</p>
        </div>
      </div>
      <div class="hero-right">
        <div class="hero-stats">
          <div class="stat-card">
            <span class="stat-num">{{ users.length }}</span>
            <span class="stat-lbl">Total User</span>
          </div>
        </div>
        <div class="hero-actions">
          <Button
            label="Assign Menu"
            icon="pi pi-sitemap"
            size="small"
            class="btn-secondary"
            @click="router.push('/manajemen/assign-menu')"
          />
          <Button
            label="Tambah User"
            icon="pi pi-plus"
            size="small"
            class="btn-primary"
            @click="openAddDialog"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <span class="p-input-icon-left search-wrap">
          <i class="pi pi-search" />
          <InputText v-model="globalFilter" placeholder="Cari nama / NIP..." class="search-input" />
        </span>
      </div>

      <DataTable
        :value="filteredUsers"
        :loading="loading"
        paginator
        :rows="15"
        :rowsPerPageOptions="[10, 15, 25, 50]"
        stripedRows
        class="user-table"
        size="small"
      >
        <Column field="NAMA_USER" header="Nama User" sortable style="min-width: 160px" />
        <Column field="NIP" header="NIP / Username" sortable style="min-width: 130px" />
        <Column field="JABATAN" header="Jabatan" sortable style="min-width: 130px" />
        <Column field="PROFESI" header="Profesi" style="min-width: 110px" />
        <Column field="GROUP_USER" header="Group" style="min-width: 90px" />
        <Column field="DEPARTEMEN" header="Departemen" style="min-width: 120px" />
        <Column field="EMAIL" header="Email" style="min-width: 150px" />
        <Column field="IS_USER_IGD" header="IGD" style="min-width: 60px; text-align:center">
          <template #body="{ data }">
            <i v-if="data.IS_USER_IGD == 1" class="pi pi-check-circle" style="color:#22c55e" />
            <i v-else class="pi pi-minus-circle" style="color:#cbd5e1" />
          </template>
        </Column>
        <Column header="Aksi" style="min-width: 90px; text-align:center">
          <template #body="{ data }">
            <div class="action-btns">
              <Button
                icon="pi pi-pencil"
                size="small"
                text
                severity="info"
                @click="openEditDialog(data)"
              />
              <Button
                icon="pi pi-trash"
                size="small"
                text
                severity="danger"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="table-empty"><i class="pi pi-inbox" /> Tidak ada data user</div>
        </template>
      </DataTable>
    </div>

    <!-- Form Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEdit ? 'Edit User' : 'Tambah User Baru'"
      :modal="true"
      :closable="true"
      :style="{ width: '860px', maxWidth: '95vw' }"
      class="user-dialog"
    >
      <div class="form-grid">
        <!-- Identitas -->
        <div class="form-section">
          <div class="section-title"><i class="pi pi-id-card" /> Identitas</div>
          <div class="field">
            <label>Nama User <span class="required">*</span></label>
            <InputText v-model="form.NAMA_USER" class="w-full" placeholder="Nama lengkap" />
          </div>
          <div class="field">
            <label>NIP / Username <span class="required">*</span></label>
            <InputText v-model="form.NIP" class="w-full" placeholder="NIP atau username login" />
          </div>
          <div class="field">
            <label>NIK</label>
            <InputText v-model="form.NIK" class="w-full" placeholder="Nomor induk kependudukan" />
          </div>
          <div class="field">
            <label>Email</label>
            <InputText v-model="form.EMAIL" class="w-full" placeholder="email@rs.id" />
          </div>
          <div class="field" v-if="!isEdit">
            <label>Password <span class="required">*</span></label>
            <InputText v-model="form.PWD" type="password" class="w-full" placeholder="Password baru" />
          </div>
          <div class="field" v-else>
            <label>Password Baru <small>(kosongkan jika tidak diubah)</small></label>
            <InputText v-model="form.PWD" type="password" class="w-full" placeholder="Biarkan kosong jika tidak diubah" />
          </div>
        </div>

        <!-- Jabatan & Profesi -->
        <div class="form-section">
          <div class="section-title"><i class="pi pi-briefcase" /> Jabatan & Profesi</div>
          <div class="field">
            <label>Jenis Noinduk</label>
            <InputText v-model="form.JENIS_NOINDUK" class="w-full" />
          </div>
          <div class="field">
            <label>Noinduk</label>
            <InputText v-model="form.NOINDUK" class="w-full" />
          </div>
          <div class="field">
            <label>Kode Jabatan</label>
            <InputText v-model="form.KDJABATAN" class="w-full" />
          </div>
          <div class="field">
            <label>Jabatan</label>
            <InputText v-model="form.JABATAN" class="w-full" />
          </div>
          <div class="field">
            <label>Profesi</label>
            <InputText v-model="form.PROFESI" class="w-full" />
          </div>
          <div class="field">
            <label>Group User</label>
            <InputText v-model="form.GROUP_USER" class="w-full" />
          </div>
        </div>

        <!-- Unit & Lokasi -->
        <div class="form-section">
          <div class="section-title"><i class="pi pi-building" /> Unit & Lokasi</div>
          <div class="field">
            <label>Kode Unit</label>
            <InputText v-model="form.KDUNIT" class="w-full" />
          </div>
          <div class="field">
            <label>Departemen</label>
            <InputText v-model="form.DEPARTEMEN" class="w-full" />
          </div>
          <div class="field">
            <label>Jenis Rawat</label>
            <InputText v-model="form.JENISRAWAT" class="w-full" />
          </div>
          <div class="field">
            <label>Loket</label>
            <InputText v-model="form.LOKET" class="w-full" />
          </div>
          <div class="field">
            <label>Jenis Loket</label>
            <InputText v-model="form.JENIS_LOKET" class="w-full" />
          </div>
          <div class="field">
            <label>ID Lokasi</label>
            <InputText v-model="form.ID_LOKASI" class="w-full" />
          </div>
          <div class="field">
            <label>ID Lokasi Inv</label>
            <InputText v-model="form.ID_LOKASI_INV" class="w-full" />
          </div>
        </div>

        <!-- Roles & Akses -->
        <div class="form-section">
          <div class="section-title"><i class="pi pi-shield" /> Roles & Akses</div>
          <div class="field">
            <label>Roles</label>
            <InputText v-model="form.ROLES" class="w-full" />
          </div>
          <div class="field">
            <label>Roles Inv</label>
            <InputText v-model="form.ROLES_INV" class="w-full" />
          </div>
          <div class="field">
            <label>Ses Reg</label>
            <InputText v-model="form.SES_REG" class="w-full" />
          </div>
          <div class="field">
            <label>User ID Inv</label>
            <InputText v-model="form.USER_ID_INV" class="w-full" />
          </div>
          <div class="field">
            <label>FGL</label>
            <InputText v-model="form.FGL" class="w-full" />
          </div>
          <div class="field field-check">
            <Checkbox v-model="form.IS_USER_IGD" :binary="true" inputId="igd" />
            <label for="igd">Adalah User IGD</label>
          </div>
          <div class="field field-check">
            <Checkbox v-model="form.IS_DEFAULT_APOTEKER" :binary="true" inputId="apoteker" />
            <label for="apoteker">Default Apoteker</label>
          </div>
        </div>

        <!-- Dokter & BPJS -->
        <div class="form-section">
          <div class="section-title"><i class="pi pi-heart" /> Dokter & BPJS</div>
          <div class="field">
            <label>Kode Dokter</label>
            <InputText v-model="form.KD_DOKTER" class="w-full" />
          </div>
          <div class="field">
            <label>Kode Dokter BPJS</label>
            <InputText v-model="form.KD_DOKTER_BPJS" class="w-full" />
          </div>
          <div class="field">
            <label>Pratitioner ID</label>
            <InputText v-model="form.PRATITIONER_ID" class="w-full" />
          </div>
          <div class="field">
            <label>No. SIPA</label>
            <InputText v-model="form.NO_SIPA" class="w-full" />
          </div>
          <div class="field">
            <label>Pass TTE</label>
            <InputText v-model="form.PASS_TTE" class="w-full" />
          </div>
        </div>

        <!-- Eklaim & Payor -->
        <div class="form-section">
          <div class="section-title"><i class="pi pi-file-import" /> Eklaim & Payor</div>
          <div class="field">
            <label>Kode Tarif Eklaim</label>
            <InputText v-model="form.KODE_TARIF_EKLAIM" class="w-full" />
          </div>
          <div class="field">
            <label>Payor ID</label>
            <InputText v-model="form.PAYOR_ID" class="w-full" />
          </div>
          <div class="field">
            <label>Payor CD</label>
            <InputText v-model="form.PAYOR_CD" class="w-full" />
          </div>
          <div class="field">
            <label>COB CD</label>
            <InputText v-model="form.COB_CD" class="w-full" />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Batal" icon="pi pi-times" text severity="secondary" @click="closeDialog" />
        <Button
          :label="saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah User')"
          :icon="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          severity="success"
          :loading="saving"
          @click="submitForm"
        />
      </template>
    </Dialog>

    <!-- Delete Confirm Dialog -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Konfirmasi Hapus"
      :modal="true"
      :style="{ width: '420px' }"
    >
      <div class="delete-confirm">
        <i class="pi pi-exclamation-triangle" style="font-size:2rem;color:#f59e0b" />
        <p>Yakin ingin menghapus user <strong>{{ deleteTarget?.NAMA_USER }}</strong>?</p>
        <p class="delete-warn">Tindakan ini tidak dapat dibatalkan.</p>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text severity="secondary" @click="showDeleteDialog = false" />
        <Button
          :label="deleting ? 'Menghapus...' : 'Hapus'"
          icon="pi pi-trash"
          severity="danger"
          :loading="deleting"
          @click="deleteUser"
        />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const apiBase = computed(() => configStore.apiBaseUrl)

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const users = ref([])
const globalFilter = ref('')
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const isEdit = ref(false)
const deleteTarget = ref(null)

const emptyForm = () => ({
  ID: null,
  JENIS_NOINDUK: '',
  NOINDUK: '',
  KDJABATAN: '',
  JABATAN: '',
  PROFESI: '',
  NIP: '',
  NAMA_USER: '',
  KD_DOKTER: '',
  KD_DOKTER_BPJS: '',
  GROUP_USER: '',
  PWD: '',
  SES_REG: '',
  ROLES: '',
  ROLES_INV: '',
  KDUNIT: '',
  DEPARTEMEN: '',
  JENISRAWAT: '',
  LOKET: '',
  JENIS_LOKET: '',
  USER_ID_INV: '',
  PASS_TTE: '',
  NIK: '',
  KODE_TARIF_EKLAIM: '',
  PAYOR_ID: '',
  PAYOR_CD: '',
  COB_CD: '',
  ID_LOKASI: '',
  ID_LOKASI_INV: '',
  EMAIL: '',
  FGL: '',
  IS_USER_IGD: false,
  PRATITIONER_ID: '',
  NO_SIPA: '',
  IS_DEFAULT_APOTEKER: false,
})

const form = ref(emptyForm())

const filteredUsers = computed(() => {
  const q = globalFilter.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (u) =>
      (u.NAMA_USER || '').toLowerCase().includes(q) ||
      (u.NIP || '').toLowerCase().includes(q) ||
      (u.JABATAN || '').toLowerCase().includes(q) ||
      (u.DEPARTEMEN || '').toLowerCase().includes(q),
  )
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/get_users_by_client`, {
      id_client: id_client.value,
    })
    if (res.data?.metadata?.code === 200) {
      users.value = res.data.response || []
    } else {
      users.value = []
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data user', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  form.value = emptyForm()
  showDialog.value = true
}

const openEditDialog = (data) => {
  isEdit.value = true
  form.value = {
    ...emptyForm(),
    ...data,
    PWD: '',
    IS_USER_IGD: data.IS_USER_IGD == 1,
    IS_DEFAULT_APOTEKER: data.IS_DEFAULT_APOTEKER == 1,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
}

const submitForm = async () => {
  if (!form.value.NAMA_USER?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Nama User wajib diisi', life: 3000 })
    return
  }
  if (!form.value.NIP?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'NIP wajib diisi', life: 3000 })
    return
  }
  if (!isEdit.value && !form.value.PWD?.trim()) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Password wajib diisi untuk user baru', life: 3000 })
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form.value,
      ID_CLIENT: id_client.value,
      IS_USER_IGD: form.value.IS_USER_IGD ? 1 : 0,
      IS_DEFAULT_APOTEKER: form.value.IS_DEFAULT_APOTEKER ? 1 : 0,
    }

    const endpoint = isEdit.value ? 'update_user' : 'save_user'
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/${endpoint}`, payload)

    if (res.data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: res.data.metadata.message, life: 3000 })
      showDialog.value = false
      await fetchUsers()
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Terjadi kesalahan', life: 4000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menyimpan data user', life: 3000 })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (data) => {
  deleteTarget.value = data
  showDeleteDialog.value = true
}

const deleteUser = async () => {
  deleting.value = true
  try {
    const res = await axios.post(`${apiBase.value}/index.php/api/setting/delete_user`, {
      ID: deleteTarget.value.ID,
    })
    if (res.data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'User berhasil dihapus', life: 3000 })
      showDeleteDialog.value = false
      await fetchUsers()
    } else {
      toast.add({ severity: 'error', summary: 'Gagal', detail: res.data?.metadata?.message || 'Terjadi kesalahan', life: 4000 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal menghapus user', life: 3000 })
  } finally {
    deleting.value = false
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.content {
  padding: 1rem;
}

/* Hero */
.hero-section {
  background: linear-gradient(135deg, #0f4c75 0%, #1b6ca8 60%, #2980b9 100%);
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  box-shadow: 0 8px 24px rgba(15, 76, 117, 0.3);
}
.hero-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}
.hero-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.2rem;
}
.hero-desc {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
}
.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}
.hero-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  text-align: center;
  min-width: 90px;
}
.stat-num {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
}
.stat-lbl {
  font-size: 0.7rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.hero-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-secondary {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.35) !important;
  color: #fff !important;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.22) !important;
}
.btn-primary {
  background: rgba(255, 255, 255, 0.9) !important;
  border: none !important;
  color: #0f4c75 !important;
  font-weight: 600;
}
.btn-primary:hover {
  background: #fff !important;
}

/* Table */
.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-wrap .pi-search {
  position: absolute;
  left: 0.6rem;
  color: #94a3b8;
  z-index: 1;
}
.search-input {
  padding-left: 2rem !important;
  width: 240px;
}
.action-btns {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}
.table-empty {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.user-table :deep(.p-datatable-thead th) {
  background: #f8fafc;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

/* Form Dialog */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 0.25rem;
}
.form-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}
.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1b6ca8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.field {
  margin-bottom: 0.6rem;
}
.field label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.25rem;
}
.field label small {
  font-weight: 400;
  color: #94a3b8;
}
.field-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.field-check label {
  margin-bottom: 0;
  font-size: 0.82rem;
  cursor: pointer;
}
.required {
  color: #ef4444;
}
.w-full {
  width: 100%;
}

/* Delete confirm */
.delete-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}
.delete-warn {
  font-size: 0.82rem;
  color: #ef4444;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .hero-section {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-right {
    align-items: flex-start;
  }
}
</style>
