<template>
  <div class="content">
    <Toast />
    <ConfirmDialog />

    <!-- Loading -->
    <div v-if="loading" class="ftd-state-wrap">
      <div class="ftd-state-box">
        <i class="pi pi-spin pi-spinner ftd-state-icon"></i>
        <p class="ftd-state-label">Memuat data tindakan...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="ftd-state-wrap">
      <div class="ftd-state-box">
        <i class="pi pi-exclamation-circle ftd-state-icon ftd-state-error"></i>
        <p class="ftd-state-label">{{ error }}</p>
        <Button label="Coba Lagi" icon="pi pi-refresh" size="small" @click="fetchData" />
      </div>
    </div>

    <!-- Content -->
    <div v-else class="ftd-page">
      <!-- Patient Banner -->
      <div v-if="patientInfo" class="ftd-patient-banner">
        <div class="ftd-patient-avatar">
          <i :class="patientInfo.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'" />
        </div>
        <div class="ftd-patient-details">
          <div class="ftd-patient-name">{{ patientInfo.NAMA }}</div>
          <div class="ftd-patient-chips">
            <span class="ftd-chip"><i class="pi pi-id-card"></i> {{ patientInfo.NOMR }}</span>
            <span class="ftd-chip"><i class="pi pi-hashtag"></i> {{ patientInfo.NOREGISTER }}</span>
            <span class="ftd-chip"
              ><i class="pi pi-building"></i> {{ patientInfo.POLI_RUANG }}</span
            >
            <span class="ftd-chip"><i class="pi pi-calendar"></i> {{ patientInfo.TANGGAL }}</span>
            <Tag
              :value="patientInfo.JENISRAWAT"
              :severity="patientInfo.JENISRAWAT === 'RAWAT INAP' ? 'warn' : 'info'"
              style="font-size: 11px"
            />
          </div>
          <div class="ftd-patient-dpjp">
            <i class="pi pi-user-plus"></i>
            DPJP: <strong>{{ patientInfo.DPJP }}</strong>
          </div>
        </div>
      </div>

      <!-- Section Header -->
      <div class="ftd-section-header">
        <div class="ftd-section-title">
          <i class="pi pi-list-check"></i>
          Daftar Tindakan &amp; Prosedur
          <Tag
            v-if="tindakanList.length"
            :value="String(tindakanList.length)"
            severity="secondary"
            class="ms-1"
          />
        </div>
        <Button
          icon="pi pi-refresh"
          text
          rounded
          size="small"
          severity="secondary"
          :loading="loading"
          v-tooltip.left="'Muat ulang'"
          @click="fetchData"
        />
      </div>

      <!-- Empty State -->
      <div v-if="tindakanList.length === 0" class="ftd-empty">
        <i class="pi pi-inbox ftd-empty-icon"></i>
        <p class="ftd-empty-title">Belum ada tindakan tercatat</p>
        <small class="ftd-empty-sub"
          >Data tindakan akan muncul setelah diinputkan oleh petugas</small
        >
      </div>

      <!-- Tindakan Cards -->
      <div v-else class="ftd-list">
        <div
          v-for="item in tindakanList"
          :key="item.RECEIPT_NO"
          class="ftd-card"
          :class="{ 'ftd-card--signed': item.AUTH == '1', 'ftd-card--expanded': item._expanded }"
        >
          <!-- Card head (always visible, acts as toggle) -->
          <div class="ftd-card-head" @click="item._expanded = !item._expanded">
            <div class="ftd-card-title-row">
              <span class="ftd-card-name">{{ item.TINDAKAN }}</span>
              <div class="ftd-card-badges">
                <Tag
                  v-if="item.KATEGORI"
                  :value="item.KATEGORI"
                  severity="success"
                  style="font-size: 10px"
                />
                <Tag v-if="item.AUTH == '1'" severity="info" style="font-size: 10px">
                  <template #default>
                    <i class="pi pi-verified me-1" style="font-size: 10px"></i>Ditandatangani
                  </template>
                </Tag>
                <i
                  class="pi ftd-expand-icon"
                  :class="item._expanded ? 'pi-chevron-up' : 'pi-chevron-down'"
                />
              </div>
            </div>
            <div class="ftd-card-meta-row">
              <span class="ftd-meta-item"><i class="pi pi-calendar"></i> {{ item.TANGGAL }}</span>
              <span v-if="item.AUTH == '1'" class="ftd-meta-signed">
                <i class="pi pi-user-plus"></i>
                oleh <strong>{{ item.AUTH_BY }}</strong>
              </span>
              <!-- Compact remark preview -->
              <span v-if="!item._expanded && item._remark" class="ftd-remark-preview">
                <i class="pi pi-file-edit"></i> {{ item._remark }}
              </span>
            </div>
          </div>

          <!-- Expanded: Keterangan + Actions -->
          <Transition name="ftd-expand">
            <div v-if="item._expanded" class="ftd-card-collapsible">
              <div class="ftd-card-body">
                <label class="ftd-label">
                  <i class="pi pi-file-edit"></i>
                  Keterangan / Hasil Temuan
                </label>
                <Textarea
                  v-model="item._remark"
                  :placeholder="
                    item.AUTH == '1'
                      ? 'Tindakan ini telah ditandatangani dan dikunci.'
                      : 'Tuliskan keterangan atau hasil temuan dari tindakan ini...'
                  "
                  :rows="4"
                  :autoResize="true"
                  class="w-100 ftd-textarea"
                  :disabled="item.AUTH == '1' || item._saving"
                  @click.stop
                />
              </div>
              <div class="ftd-card-actions" @click.stop>
                <Button
                  icon="pi pi-check"
                  label="Simpan Keterangan"
                  size="small"
                  severity="success"
                  outlined
                  :disabled="item.AUTH == '1' || !item._remark?.trim() || item._saving"
                  :loading="item._saving"
                  @click="saveRemark(item)"
                />
                <Button
                  size="small"
                  severity="info"
                  :disabled="item.AUTH == '1'"
                  @click="openSign(item)"
                >
                  <template #default>
                    <i class="pi pi-pen-to-square me-1" style="font-size: 12px"></i>
                    {{ item.AUTH == '1' ? 'Sudah Ditandatangani' : 'Tanda Tangan Elektronik' }}
                  </template>
                </Button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <ttdUser
      v-model:showFormOtorisasi="showDialog"
      :noregister="activeReceiptNo"
      :mode="8"
      @otpVerified="handleOtpSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import ttdUser from '@/components/TtdDigitalComponent.vue'

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const toast = useToast()
const { id_client } = storeToRefs(authStore)

const noreg = ref(route.params.noregister ?? '')
const loading = ref(false)
const error = ref(null)
const tindakanList = ref([])
const showDialog = ref(false)
const activeReceiptNo = ref('')

const patientInfo = computed(() => tindakanList.value[0] ?? null)

const fetchData = async () => {
  if (!noreg.value) return
  loading.value = true
  error.value = null
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/get_laporan_tindakan`,
      { mode: '1', noregister: noreg.value, id_client: id_client.value },
      { headers: { 'Content-Type': 'application/json' } },
    )
    if (res.data?.metadata?.code == '200') {
      tindakanList.value = (res.data.response || []).map((item) => ({
        ...item,
        _remark: item.REMARK_ITEM === '-' ? '' : item.REMARK_ITEM || '',
        _saving: false,
        _expanded: false,
      }))
    } else {
      tindakanList.value = []
    }
  } catch {
    error.value = 'Gagal memuat data tindakan. Periksa koneksi dan coba lagi.'
  } finally {
    loading.value = false
  }
}

const saveRemark = async (item) => {
  if (!item._remark?.trim()) return
  item._saving = true
  try {
    const res = await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/updateItemTindakan`,
      {
        id_client: id_client.value,
        no_receipt: item.RECEIPT_NO,
        noregister: noreg.value,
        remark_item: item._remark,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )
    if (res.data?.metadata?.code == '200') {
      item.REMARK_ITEM = item._remark
      toast.add({
        severity: 'success',
        summary: 'Tersimpan',
        detail: 'Keterangan berhasil disimpan',
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res.data?.metadata?.message || 'Gagal menyimpan keterangan',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal menyimpan keterangan',
      life: 5000,
    })
  } finally {
    item._saving = false
  }
}

const openSign = (item) => {
  activeReceiptNo.value = item.RECEIPT_NO
  showDialog.value = true
}

const handleOtpSuccess = (data) => {
  if (data?.verified) fetchData()
}

onMounted(fetchData)
</script>

<style scoped>
/* ── State screens ────────────────────────────── */
.ftd-state-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
}
.ftd-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.ftd-state-icon {
  font-size: 2.4rem;
  color: var(--p-primary-color);
}
.ftd-state-error {
  color: var(--p-red-500);
}
.ftd-state-label {
  margin: 0;
  font-size: 14px;
  color: var(--p-text-muted-color);
}

/* ── Page layout ──────────────────────────────── */
.ftd-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0 24px;
}

/* ── Patient banner ───────────────────────────── */
.ftd-patient-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--p-primary-50) 0%, var(--p-primary-100) 100%);
  border: 1px solid var(--p-primary-200);
  border-radius: var(--p-border-radius-lg, 10px);
}
.ftd-patient-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--p-surface-0);
  border: 2px solid var(--p-primary-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--p-primary-color);
}
.ftd-patient-details {
  flex: 1;
  min-width: 0;
}
.ftd-patient-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--p-primary-900);
  margin-bottom: 6px;
}
.ftd-patient-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}
.ftd-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--p-primary-700);
  background: var(--p-surface-0);
  border: 1px solid var(--p-primary-200);
  border-radius: 99px;
  padding: 2px 8px;
}
.ftd-chip .pi {
  font-size: 10px;
}
.ftd-patient-dpjp {
  font-size: 12px;
  color: var(--p-text-color);
  display: flex;
  align-items: center;
  gap: 5px;
}
.ftd-patient-dpjp .pi {
  font-size: 12px;
  color: var(--p-text-muted-color);
}

/* ── Section header ───────────────────────────── */
.ftd-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ftd-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--p-text-color);
}
.ftd-section-title .pi {
  color: var(--p-primary-color);
}

/* ── Empty state ──────────────────────────────── */
.ftd-empty {
  text-align: center;
  padding: 56px 16px;
}
.ftd-empty-icon {
  font-size: 2.8rem;
  display: block;
  margin-bottom: 14px;
  color: var(--p-surface-300);
}
.ftd-empty-title {
  margin: 0 0 4px;
  font-size: 15px;
  color: var(--p-text-muted-color);
  font-weight: 500;
}
.ftd-empty-sub {
  font-size: 12px;
  color: var(--p-surface-400);
}

/* ── Card list ────────────────────────────────── */
.ftd-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ftd-card {
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-lg, 10px);
  background: var(--p-content-background);
  overflow: hidden;
  transition:
    box-shadow 0.15s,
    border-color 0.15s;
}
.ftd-card:hover {
  box-shadow: 0 2px 10px color-mix(in srgb, var(--p-primary-color) 10%, transparent);
}
.ftd-card--signed {
  border-color: var(--p-primary-200);
  background: var(--p-primary-50);
}
.ftd-card--expanded {
  border-color: var(--p-primary-300);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--p-primary-color) 12%, transparent);
}

/* ── Card head (toggle) ───────────────────────── */
.ftd-card-head {
  padding: 10px 14px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid transparent;
  transition: background 0.12s;
}
.ftd-card-head:hover {
  background: var(--p-surface-50);
}
.ftd-card--expanded .ftd-card-head {
  border-bottom-color: var(--p-content-border-color);
}

.ftd-card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ftd-card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--p-text-color);
  flex: 1;
}
.ftd-card-badges {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.ftd-expand-icon {
  font-size: 11px;
  color: var(--p-text-muted-color);
  transition: transform 0.2s;
}

.ftd-card-meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.ftd-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--p-text-muted-color);
}
.ftd-meta-item .pi {
  font-size: 10px;
}
.ftd-meta-signed {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--p-primary-600);
}
.ftd-meta-signed .pi {
  font-size: 10px;
}
.ftd-remark-preview {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--p-text-muted-color);
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}
.ftd-remark-preview .pi {
  font-size: 10px;
  flex-shrink: 0;
}

/* ── Collapsible body ─────────────────────────── */
.ftd-card-collapsible {
  overflow: hidden;
}
.ftd-card-body {
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ftd-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--p-text-muted-color);
  display: flex;
  align-items: center;
  gap: 4px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.ftd-label .pi {
  font-size: 11px;
}
.ftd-textarea {
  font-size: 13px;
  resize: vertical;
}
.ftd-card-actions {
  padding: 10px 16px 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid var(--p-content-border-color);
  background: var(--p-surface-50);
}

/* ── Expand animation ─────────────────────────── */
.ftd-expand-enter-active {
  animation: ftd-expand-down 0.22s ease;
}
.ftd-expand-leave-active {
  animation: ftd-expand-down 0.18s ease reverse;
}
@keyframes ftd-expand-down {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}
</style>
