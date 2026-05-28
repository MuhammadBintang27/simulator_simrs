<template>
  <Toast />
  <ConfirmDialog />
  <loading_overlay :is-loading="loading" message="Memuat data...." />

  <Dialog
    v-model:visible="showDialog"
    modal
    header="List Rujukan dari Server BPJS"
    :style="dialogStyle"
    :breakpoints="{ '1200px': '95vw', '768px': '100vw' }"
  >
    <!-- Header info pasien -->
    <div class="rbs-header">
      <span class="text-muted" v-if="datapasien">
        <span class="rbs-label">Pasien:</span>
        <strong>{{ datapasien.NAMAPASIEN }}</strong>
        <span class="rbs-sep">&nbsp;|&nbsp;</span>
        <span class="rbs-label">No. Kartu:</span>
        <strong>{{ datapasien.NOJAMINAN }}</strong>
      </span>
      <Button
        label="Muat Ulang"
        icon="pi pi-refresh"
        size="small"
        outlined
        severity="secondary"
        :loading="loading"
        @click="fetchRujukan"
      />
    </div>

    <!-- Desktop: DataTable -->
    <DataTable
      v-if="!isMobile"
      :value="listRujukan"
      :paginator="listRujukan.length > 10"
      :rows="10"
      responsiveLayout="scroll"
      stripedRows
      size="small"
      emptyMessage="Tidak ada data rujukan."
    >
      <Column header="No." style="width: 50px; text-align: center">
        <template #body="slotProps">{{ slotProps.index + 1 }}</template>
      </Column>
      <Column field="noRujukan" header="No. Rujukan" style="min-width: 190px" />
      <Column field="tglRujukan" header="Tgl. Rujukan" style="width: 120px" />
      <Column field="noKartu" header="No. Kartu" style="min-width: 150px" />
      <Column field="nama" header="Nama Pasien" style="min-width: 180px">
        <template #body="slotProps">
          <span class="text-uppercase">{{ slotProps.data.nama }}</span>
        </template>
      </Column>
      <Column field="noSep" header="No. SEP" style="min-width: 180px" />
      <Column field="namaPpkDirujuk" header="RS Tujuan" style="min-width: 200px">
        <template #body="slotProps">
          <span class="text-uppercase">{{ slotProps.data.namaPpkDirujuk }}</span>
        </template>
      </Column>
      <Column header="Aksi" style="width: 80px; text-align: center">
        <template #body="slotProps">
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            text
            rounded
            :loading="deletingRow === slotProps.data.noRujukan"
            @click="confirmHapus(slotProps.data)"
            v-tooltip.top="'Hapus Rujukan'"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Mobile: Card list -->
    <div v-else class="rbs-card-list">
      <div v-if="listRujukan.length === 0 && !loading" class="rbs-empty">
        Tidak ada data rujukan.
      </div>

      <div v-for="(item, index) in listRujukan" :key="item.noRujukan" class="rbs-card">
        <div class="rbs-card-head">
          <span class="rbs-card-no">{{ index + 1 }}</span>
          <span class="rbs-card-norujukan">{{ item.noRujukan }}</span>
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            text
            rounded
            :loading="deletingRow === item.noRujukan"
            @click="confirmHapus(item)"
          />
        </div>
        <div class="rbs-card-body">
          <div class="rbs-row">
            <span class="rbs-key">Tanggal</span>
            <span class="rbs-val">{{ item.tglRujukan }}</span>
          </div>
          <div class="rbs-row">
            <span class="rbs-key">No. Kartu</span>
            <span class="rbs-val">{{ item.noKartu }}</span>
          </div>
          <div class="rbs-row">
            <span class="rbs-key">Nama</span>
            <span class="rbs-val text-uppercase">{{ item.nama }}</span>
          </div>
          <div class="rbs-row">
            <span class="rbs-key">No. SEP</span>
            <span class="rbs-val">{{ item.noSep }}</span>
          </div>
          <div class="rbs-row">
            <span class="rbs-key">RS Tujuan</span>
            <span class="rbs-val text-uppercase">{{ item.namaPpkDirujuk }}</span>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  datapasien: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'hapus'])

const showDialog = ref(false)
const loading = ref(false)
const deletingRow = ref(null)
const listRujukan = ref([])
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)
const dialogStyle = computed(() =>
  isMobile.value ? { width: '100vw', margin: '0' } : { width: '1100px' },
)

const onResize = () => {
  windowWidth.value = window.innerWidth
}
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

watch(
  () => props.visible,
  (val) => {
    showDialog.value = val
    if (val) fetchRujukan()
  },
)

watch(showDialog, (val) => {
  if (!val) emit('update:visible', false)
})

async function fetchRujukan() {
  try {
    loading.value = true
    listRujukan.value = []

    const payload = {
      id_client: id_client.value,
      noKartu: props.datapasien?.NOJAMINAN || '',
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/bpjs_api/get_rujukan_server_bpjs`,
      payload,
    )

    const data = response.data
    if (data?.metaData?.code === '200' && data?.response?.list) {
      const noKartuPasien = props.datapasien?.NOJAMINAN || ''
      listRujukan.value = data.response.list.filter((item) => item.noKartu === noKartuPasien)
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Info',
        detail: data?.metaData?.message || 'Tidak ada data rujukan.',
        life: 3000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal memuat data rujukan dari server BPJS.',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

function confirmHapus(row) {
  confirm.require({
    message: `Hapus rujukan atas nama ${row.nama} (${row.noRujukan})?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Hapus',
    rejectLabel: 'Batal',
    acceptClass: 'p-button-danger',
    accept: () => hapusRujukan(row),
  })
}

async function hapusRujukan(row) {
  try {
    deletingRow.value = row.noRujukan

    const payload = {
      id_client: id_client.value,
      noRujukan: row.noRujukan,
      user: user_id.value || 'unknown',
    }

    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/bpjs_api/hapusRujukan`, payload)

    const data = response.data
    if (data?.metaData?.code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Rujukan ${row.noRujukan} berhasil dihapus.`,
        life: 3000,
      })
      listRujukan.value = listRujukan.value.filter((r) => r.noRujukan !== row.noRujukan)
      emit('hapus', row)
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: data?.metaData?.message || 'Gagal menghapus rujukan.',
        life: 3000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Terjadi kesalahan saat menghapus rujukan.',
      life: 3000,
    })
  } finally {
    deletingRow.value = null
  }
}
</script>

<style scoped>
/* Header info pasien */
.rbs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.rbs-sep {
  color: #adb5bd;
}

.rbs-label {
  color: #6c757d;
  margin-right: 4px;
}

/* Mobile card list */
.rbs-card-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rbs-empty {
  text-align: center;
  color: #6c757d;
  padding: 2rem 0;
  font-size: 0.9rem;
}

.rbs-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.rbs-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.rbs-card-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #0d6efd;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.rbs-card-norujukan {
  flex: 1;
  font-size: 0.8rem;
  font-weight: 600;
  color: #212529;
  word-break: break-all;
}

.rbs-card-body {
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rbs-row {
  display: flex;
  gap: 0.5rem;
  font-size: 0.82rem;
  line-height: 1.5;
}

.rbs-key {
  color: #6c757d;
  min-width: 80px;
  flex-shrink: 0;
}

.rbs-val {
  color: #212529;
  font-weight: 500;
  word-break: break-word;
}
</style>
