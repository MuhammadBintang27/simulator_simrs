<template>
  <div class="content">
    <Toast />

    <Toolbar class="mb-2">
      <template #start>
        <div style="display: flex; align-items: center; gap: 10px">
          <Button icon="pi pi-arrow-left" text rounded severity="secondary" @click="router.push('/sales/pos')" />
          <div>
            <div style="font-weight: 800; font-size: 15px">Pengaturan Kasir</div>
            <div style="font-size: 11.5px; color: var(--p-text-muted-color)">Sales Langsung — Apotik</div>
          </div>
        </div>
      </template>
    </Toolbar>

    <div class="card elevation-0 setting-card">
      <div class="card-body">
        <div v-if="loading" class="state-box-sm">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Memuat pengaturan...</span>
        </div>
        <template v-else>
          <div class="setting-section-title">Diskon</div>

          <div class="setting-row">
            <div class="setting-row-text">
              <div class="setting-row-label">Izinkan Diskon per Item</div>
              <div class="setting-row-desc">
                Kasir boleh kasih diskon di masing-masing barang saat belanja (persen atau rupiah per satuan).
                Kalau dimatikan, checkout akan ditolak kalau ada item yang dikirim dengan diskon.
              </div>
            </div>
            <ToggleSwitch v-model="izinkanDiskonItem" :disabled="saving" />
          </div>

          <div class="setting-row">
            <div class="setting-row-text">
              <div class="setting-row-label">Izinkan Diskon per Struk (Potongan Bill)</div>
              <div class="setting-row-desc">
                Kasir boleh kasih potongan flat rupiah untuk keseluruhan struk. Kalau dimatikan, checkout akan
                ditolak kalau potongan struk diisi.
              </div>
            </div>
            <ToggleSwitch v-model="izinkanDiskonBill" :disabled="saving" />
          </div>

          <div class="setting-section-title" style="margin-top: 24px">Shift</div>

          <div class="setting-row">
            <div class="setting-row-text">
              <div class="setting-row-label">Pakai Shift Kasir</div>
              <div class="setting-row-desc">
                Kalau aktif, kasir wajib buka shift dulu sebelum bisa transaksi, dan tutup shift untuk rekap closing.
                Kalau dimatikan, kasir bisa langsung jualan tanpa buka/tutup shift.
              </div>
            </div>
            <ToggleSwitch v-model="pakaiShift" :disabled="saving" />
          </div>

          <div class="setting-actions">
            <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="saveSetting" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { useToast } from 'primevue/usetoast'
import Toolbar from 'primevue/toolbar'
import ToggleSwitch from 'primevue/toggleswitch'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const toast = useToast()

const apiUrl = computed(() => `${configStore.apiApotikUrl}/index.php/api/SalesLangsung`)

const loading = ref(true)
const saving = ref(false)
const izinkanDiskonItem = ref(true)
const izinkanDiskonBill = ref(true)
const pakaiShift = ref(true)

const fetchSetting = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${apiUrl.value}/pos_setting`, {
      params: { clientId: id_client.value },
    })
    const res = data?.response || {}
    izinkanDiskonItem.value = String(res.IZINKAN_DISKON_ITEM ?? 1) === '1'
    izinkanDiskonBill.value = String(res.IZINKAN_DISKON_BILL ?? 1) === '1'
    pakaiShift.value = String(res.PAKAI_SHIFT ?? 1) === '1'
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat pengaturan', life: 4000 })
  } finally {
    loading.value = false
  }
}

const saveSetting = async () => {
  saving.value = true
  try {
    const { data } = await axios.post(`${apiUrl.value}/pos_setting`, {
      IDCLIENT: Number(id_client.value),
      IZINKAN_DISKON_ITEM: izinkanDiskonItem.value ? 1 : 0,
      IZINKAN_DISKON_BILL: izinkanDiskonBill.value ? 1 : 0,
      PAKAI_SHIFT: pakaiShift.value ? 1 : 0,
    })
    if (data?.metadata?.code === 200) {
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengaturan disimpan', life: 3000 })
    } else {
      toast.add({ severity: 'warn', summary: 'Ditolak', detail: data?.metadata?.message || 'Gagal menyimpan pengaturan', life: 4000 })
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.response?.data?.metadata?.message || 'Gagal menyimpan pengaturan',
      life: 4000,
    })
  } finally {
    saving.value = false
  }
}

onMounted(fetchSetting)
</script>

<style scoped>
.setting-card {
  max-width: 640px;
}

.state-box-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 10px;
  color: var(--p-text-muted-color);
  font-size: 13px;
}

.setting-section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  margin-bottom: 12px;
}

.setting-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid var(--p-content-border-color, #eee);
}

.setting-row:last-of-type {
  border-bottom: none;
}

.setting-row-text {
  flex: 1;
}

.setting-row-label {
  font-weight: 700;
  font-size: 13.5px;
  margin-bottom: 4px;
}

.setting-row-desc {
  font-size: 11.5px;
  color: var(--p-text-muted-color);
  line-height: 1.5;
}

.setting-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
