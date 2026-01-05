<template>
  <div class="content">
    <Panel severity="warn">
      <div>
        <div class="panel-content">
          <div class="icon-container">
            <i class="pi pi-user text-primary"></i>
          </div>
          <div class="text-container">
            <h3 class="panel-title">Pengaturan Profil Pengguna</h3>
            <p class="panel-description">
              Dengan menggabungkan role dan permissions, kita bisa menciptakan sistem kontrol yang
              fleksibel.
            </p>
          </div>
        </div>
      </div>
      <div class="mt-20">
        <div class="back-button mt-4" @click="goBack">
          <a href="javascript:window.history.back();">
            <i class="pi pi-arrow-left"></i>
            <span> Kembali</span></a
          >
        </div>
      </div>
    </Panel>

    <Panel style="margin-top: 10px">
      <div class="card">
        <DataTable
          :value="fact"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          tableStyle="min-width: 50rem"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
          stripedRows
          filterDisplay="menu"
        >
          <template #header>
            <div class="flex justify-content-between">
              <Button icon="pi pi-refresh" class="round-button2" @click="get_user" />
              <Button
                icon="pi pi-plus"
                class="round-button2 ml-1 p-button-info"
                @click="add_user_visible = true"
              />
            </div>
          </template>
          <Column field="user_id" header="ID" sortable></Column>
          <Column field="nama_user" header="Nama User" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <Avatar :label="getInitials(data.nama_user)" shape="circle" size="small" />
                <span>{{ data.nama_user }}</span>
              </div>
            </template>
          </Column>
          <Column field="email" header="Email" sortable></Column>
          <Column field="stts" header="Status" sortable style="max-width: 12rem">
            <template #body="{ data }">
              <Select
                v-model="data.stts"
                :options="statusOptions"
                @change="updateUserStatus(data)"
                class="w-full"
              ></Select>
            </template>
          </Column>
          <Column header="Actions" style="min-width: 6rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" outlined rounded @click="editUser(data)" />
                <Button
                  icon="pi pi-refresh"
                  outlined
                  rounded
                  label="Reset password"
                  severity="danger"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <Dialog v-model:visible="deleteDialog" header="Confirm" :style="{ width: '450px' }">
          <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span>Are you sure you want to delete this user?</span>
          </div>
          <template #footer>
            <Button label="No" icon="pi pi-times" outlined @click="deleteDialog = false" />
            <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteUser" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="add_user_visible"
          modal
          header="Tambah User"
          :style="{ width: '50rem' }"
        >
          <template #header> </template>

          <div class="p-grid">
            <!-- Your name -->
            <div class="p-col-12 p-md-6 form-field">
              <label for="name">Nama User</label>
              <InputText
                id="name"
                v-model="form.nama_user"
                placeholder="Nama User"
                class="p-inputtext w-full"
              />
            </div>

            <!-- Badan usaha -->
            <div class="p-col-12 p-md-6 form-field">
              <label for="country">Email</label>
              <InputText
                id="name"
                placeholder="Email"
                v-model="form.email"
                class="p-inputtext w-full"
              />
            </div>
          </div>
          <template #footer>
            <Button
              label="Cancel"
              text
              severity="secondary"
              @click="add_user_visible = false"
              autofocus
            />
            <Button label="Save" severity="secondary" @click="createUser" autofocus />
          </template>
        </Dialog>
      </div>
    </Panel>
  </div>

  <Dialog v-model:visible="info_user_visible" header="Informasi user" :style="{ width: '450px' }">
    <div class="confirmation-content">
      <!-- <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" /> -->
      <!-- {{ data_responsuser }} -->
      <div class="p-grid">
        <div class="p-col-12 p-md-6 form-field">
          <label for="country">User Name</label>
          <h4 for="country">{{ data_responsuser.user_id }}</h4>
        </div>
        <div class="p-col-12 p-md-6 form-field">
          <label for="country">Password</label>
          <h4 for="country">{{ data_responsuser.password }}</h4>
        </div>
      </div>
    </div>
    <template #footer>
      <Button
        label="No"
        icon="pi pi-check"
        class="round-button2"
        @click="info_user_visible = false"
      />
    </template>
  </Dialog>

  <Toast />
</template>
<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useToast } from 'primevue/usetoast'

// Store setup
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

// State

const add_user_visible = ref(false)
const loading = ref(false)
const fact = ref([])
const deleteDialog = ref(false)
const userToDelete = ref(null)
const statusOptions = ['Aktif', 'Non Aktif']

const info_user_visible = ref(false)

// Methods
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const get_user = async () => {
  loading.value = true
  try {
    const param = {
      mode: 1,
      id_client: id_client.value,
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/utilitas/get_user`, param)

    if (response.data.code == 200) {
      fact.value = response.data.response.map((user) => ({
        ...user,
        stts: user.stts || 'Non Aktif',
      }))
      toast.add({ severity: 'success', summary: 'Success', detail: 'User data loaded', life: 3000 })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user data',
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error loading data', life: 3000 })
  } finally {
    loading.value = false
  }
}

const updateUserStatus = async (user) => {
  try {
    // Implement the API call to update user status
    const url = configStore.apiBaseUrl
    const param = {
      user_id: user.user_id,
      status: user.stts,
      id_client: id_client.value,
    }

    const response = await axios.post(`${url}/utilitas/deleteUser`, param)
    if (response.data.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${user.nama_user}'s status updated`,
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Error updating user status:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update user status',
      life: 3000,
    })
  }
}

const form = reactive({
  nama_user: '',
  id_client: id_client.value,
  email: '',
})

const data_responsuser = ref(null)

const createUser = async () => {
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/utilitas/createUser`, form)

    if (response.data.code == 200) {
      add_user_visible.value = false
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: response.data.errors,
        life: 3000,
      })

      info_user_visible.value = true

      data_responsuser.value = response.data.data
      get_user()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load user data',
        life: 3000,
      })
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 })
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  // Implement edit user functionality
  toast.add({
    severity: 'info',
    summary: 'Edit User',
    detail: `Editing ${user.nama_user}`,
    life: 3000,
  })
}

const confirmDelete = (user) => {
  userToDelete.value = user
  deleteDialog.value = true
}

const deleteUser = async () => {
  try {
    // Implement delete API call here

    // For now, just remove from local array
    fact.value = fact.value.filter((user) => user.id_user !== userToDelete.value.id_user)

    toast.add({
      severity: 'success',
      summary: 'User Deleted',
      detail: `${userToDelete.value.nama_user} has been deleted`,
      life: 3000,
    })

    deleteDialog.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 })
  }
}

onMounted(() => {
  get_user()
})
</script>

<style>
.p-col-12 {
  flex: 0 0 100%;
  padding: 0 0.5rem;
}

.p-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
}
.company-profile-panel {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.company-profile-panel:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.panel-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  background-color: #e7f4ff;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-container {
  flex: 1;
}

.panel-title {
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.panel-description {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

.text-primary {
  color: #2196f3;
  font-size: 1.5rem;
}

@media screen and (min-width: 768px) {
  .p-md-6 {
    flex: 0 0 50%;
  }
}
</style>
