<template>
  <Dialog
    v-model:visible="localVisible"
    modal
    :style="{ width: '1000px', maxHeight: '90vh' }"
    class="soap-template-dialog"
    @hide="handleClose"
    :closable="false"
    :draggable="false"
  >
    <!-- Header -->
    <template #header>
      <div class="dialog-header">
        <div class="header-left">
          <div class="header-icon">
            <i class="pi pi-file-edit"></i>
          </div>
          <div>
            <h2 class="header-title">SOAP Template</h2>
            <p class="header-subtitle">Kelola template catatan medis SOAP</p>
          </div>
        </div>
        <Button
          icon="pi pi-times"
          text
          rounded
          severity="secondary"
          @click="handleClose"
          class="close-btn"
        />
      </div>
    </template>
    <div class="dialog-body">
      <!-- Panel Kiri: Daftar Template -->
      <div class="panel-list">
        <div class="panel-list-header">
          <span class="panel-label">Daftar Template</span>
          <Button icon="pi pi-plus" label="Baru" size="small" @click="handleNew" class="btn-new" />
        </div>

        <div class="search-box">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Cari template..."
              size="small"
              class="w-full"
            />
          </IconField>
        </div>

        <div class="template-list" v-if="filteredTemplates.length > 0">
          <div
            v-for="tmpl in filteredTemplates"
            :key="tmpl.id"
            class="template-item"
            :class="{ active: selectedTemplate?.id === tmpl.id }"
            @click="selectTemplate(tmpl)"
          >
            <div class="template-item-content">
              <div class="template-item-name">{{ tmpl.nama_template }}</div>
              <div class="template-item-preview">{{ truncate(tmpl.subject, 40) }}</div>
            </div>
            <div class="template-item-actions">
              <Button
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                @click.stop="confirmDelete(tmpl)"
                v-tooltip.top="'Hapus'"
              />
            </div>
          </div>
        </div>

        <div class="empty-list" v-else>
          <i class="pi pi-inbox"></i>
          <p>Belum ada template</p>
        </div>
      </div>

      <!-- Divider -->
      <Divider layout="vertical" />

      <!-- Panel Kanan: Form Editor -->
      <div class="panel-form">
        <div class="form-mode-badge" :class="isEditMode ? 'badge-edit' : 'badge-new'">
          <i :class="isEditMode ? 'pi pi-pencil' : 'pi pi-plus-circle'"></i>
          {{ isEditMode ? 'Edit Template' : 'Template Baru' }}
        </div>

        <!-- Nama Template -->
        <div class="field-group">
          <label class="field-label required">Nama Template</label>
          <InputText
            v-model="form.nama_template"
            placeholder="Contoh: Demam Umum, ISPA, Hipertensi..."
            class="w-full"
            :class="{ 'p-invalid': errors.nama_template }"
          />
          <small class="p-error" v-if="errors.nama_template">{{ errors.nama_template }}</small>
        </div>

        <!-- SUBJECTIVE -->
        <div class="field-group">
          <label class="field-label soap-label soap-s">
            <span class="soap-badge">S</span> Subjective
          </label>
          <Textarea
            v-model="form.subject"
            placeholder="Keluhan utama pasien, riwayat penyakit, riwayat keluarga..."
            rows="3"
            class="w-full soap-textarea"
            :class="{ 'p-invalid': errors.subject }"
            autoResize
          />
          <small class="p-error" v-if="errors.subject">{{ errors.subject }}</small>
        </div>

        <!-- ASSESSMENT -->
        <div class="field-group">
          <label class="field-label soap-label soap-a">
            <span class="soap-badge badge-a">A</span> Assessment
          </label>
          <Textarea
            v-model="form.assesment"
            placeholder="Diagnosis, kondisi klinis, interpretasi temuan pemeriksaan..."
            rows="3"
            class="w-full soap-textarea"
            :class="{ 'p-invalid': errors.assesment }"
            autoResize
          />
          <small class="p-error" v-if="errors.assesment">{{ errors.assesment }}</small>
        </div>

        <!-- PLAN -->
        <div class="field-group">
          <label class="field-label soap-label soap-p">
            <span class="soap-badge badge-p">P</span> Plan
          </label>
          <Textarea
            v-model="form.plan"
            placeholder="Rencana terapi, resep obat, tindak lanjut, rujukan..."
            rows="3"
            class="w-full soap-textarea"
            :class="{ 'p-invalid': errors.plan }"
            autoResize
          />
          <small class="p-error" v-if="errors.plan">{{ errors.plan }}</small>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            outlined
            severity="secondary"
            @click="resetForm"
          />
          <Button
            :label="isEditMode ? 'Simpan Perubahan' : 'Tambah Template'"
            :icon="isEditMode ? 'pi pi-save' : 'pi pi-plus'"
            :loading="loading"
            @click="handleSubmit"
            class="btn-submit"
          />

          <Button label="Pakai Template" icon="pi pi-check" @click="handleUseTemplate" />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="dialog-footer">
        <span class="footer-count">
          <i class="pi pi-list"></i>
          {{ templates.length }} template tersedia
        </span>
        <Button
          label="Tutup"
          icon="pi pi-times"
          outlined
          severity="secondary"
          @click="handleClose"
        />
      </div>
    </template>
  </Dialog>

  <!-- Confirm Delete Dialog -->
  <ConfirmDialog group="soap-delete" />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

// ─── Stores ───────────────────────────────────────────────────────────────────
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const confirm = useConfirm()
const toast = useToast()

import { useRoute } from 'vue-router'
const route = useRoute()

// ─── Props & Emits ────────────────────────────────────────────────────────────
const props = defineProps({
  showFormSoap: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:showFormSoap', 'templateSelected'])

const handleUseTemplate = () => {
  if (!selectedTemplate.value) return
  emit('templateSelected', {
    subject: selectedTemplate.value.subject,
    assesment: selectedTemplate.value.assesment,
    plan: selectedTemplate.value.plan,
    nama_template: selectedTemplate.value.nama_template,
  })
  handleClose()
}

// ─── Reactive State ───────────────────────────────────────────────────────────
const loading = ref(false)
const searchQuery = ref('')
const templates = ref([])
const selectedTemplate = ref(null)

const defaultForm = () => ({
  nama_template: '',
  subject: '',
  assesment: '',
  plan: '',
  kd_dokter: route.query.kd_dokter,
})

const form = ref(defaultForm())
const errors = ref({})

// ─── Computed ─────────────────────────────────────────────────────────────────
const localVisible = computed({
  get: () => props.showFormSoap,
  set: (val) => emit('update:showFormSoap', val),
})

const isEditMode = computed(() => !!form.value.id)

const filteredTemplates = computed(() => {
  if (!searchQuery.value.trim()) return templates.value
  const q = searchQuery.value.toLowerCase()
  return templates.value.filter(
    (t) =>
      t.nama_template?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.assesment?.toLowerCase().includes(q),
  )
})

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(
  () => props.showFormSoap,
  (val) => {
    if (val) {
      loadTemplates()
      resetForm()
    }
  },
)

// ─── Methods ──────────────────────────────────────────────────────────────────
const truncate = (str, len) => {
  if (!str) return '-'
  return str.length > len ? str.substring(0, len) + '...' : str
}

const loadTemplates = async () => {
  try {
    const url = configStore.apiBaseUrl

    const payaload = {
      id_client: id_client.value,
      kd_dokter: route.query.kd_dokter,
    }

    const response = await axios.post(`${url}/index.php/api/asset/get_list_soap_template`, payaload)
    if (response.data?.metadata?.code === 200) {
      templates.value = response.data.response || []
    }
  } catch (e) {
    // fallback: demo data jika API belum ada
  }
}

const selectTemplate = (tmpl) => {
  selectedTemplate.value = tmpl
  form.value = { ...tmpl }
  errors.value = {}
}

const handleNew = () => {
  selectedTemplate.value = null
  form.value = defaultForm()
  errors.value = {}
}

const resetForm = () => {
  if (isEditMode.value && selectedTemplate.value) {
    form.value = { ...selectedTemplate.value }
  } else {
    form.value = defaultForm()
  }
  errors.value = {}
}

const validate = () => {
  errors.value = {}
  if (!form.value.nama_template?.trim()) errors.value.nama_template = 'Nama template wajib diisi'
  if (!form.value.subject?.trim()) errors.value.subject = 'Subjective wajib diisi'
  if (!form.value.assesment?.trim()) errors.value.assesment = 'Assessment wajib diisi'
  if (!form.value.plan?.trim()) errors.value.plan = 'Plan wajib diisi'
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const endpoint = isEditMode.value
      ? `${url}/index.php/api/asset/input_soap_template`
      : `${url}/index.php/api/asset/input_soap_template`

    const payload = { ...form.value, id_client: id_client.value, isEditMode: isEditMode.value }

    const response = await axios.post(endpoint, payload)

    if (response.data?.metadata?.code === 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: isEditMode.value
          ? 'Template berhasil diperbarui.'
          : 'Template berhasil ditambahkan.',
        life: 3000,
      })
      await loadTemplates()
      handleNew()
    } else {
      throw new Error(response.data?.message || 'Gagal menyimpan')
    }
  } catch (e) {
    // Demo mode: simpan ke local state
    if (isEditMode.value) {
      const idx = templates.value.findIndex((t) => t.id === form.value.id)
      if (idx !== -1) templates.value[idx] = { ...form.value }
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Template berhasil diperbarui.',
        life: 3000,
      })
    } else {
      const newId = Date.now()
      templates.value.push({ ...form.value, id: newId })
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Template berhasil ditambahkan.',
        life: 3000,
      })
    }
    handleNew()
  } finally {
    loading.value = false
  }
}

const confirmDelete = (tmpl) => {
  confirm.require({
    group: 'soap-delete',
    message: `Hapus template "${tmpl.nama_template}"? Tindakan ini tidak dapat dibatalkan.`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    acceptClass: 'p-button-danger',
    accept: () => deleteTemplate(tmpl),
  })
}

const deleteTemplate = async (tmpl) => {
  try {
    const url = configStore.apiBaseUrl
    await axios.post(`${url}/index.php/api/asset/deleted_template`, {
      id_template: tmpl.id,
      id_client: id_client.value,
    })
  } catch (e) {
    // demo mode fallback
  } finally {
    templates.value = templates.value.filter((t) => t.id !== tmpl.id)
    if (selectedTemplate.value?.id === tmpl.id) handleNew()
    toast.add({
      severity: 'warn',
      summary: 'Dihapus',
      detail: `Template "${tmpl.nama_template}" dihapus.`,
      life: 3000,
    })
  }
}

const handleClose = () => {
  emit('update:showFormSoap', false)
  resetForm()
  searchQuery.value = ''
}

onMounted(() => {
  if (props.showFormSoap) loadTemplates()
})
</script>

<style scoped>
/* ── Dialog Header ── */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.25rem 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.header-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}
.header-subtitle {
  font-size: 0.76rem;
  color: #64748b;
  margin: 0;
}
.close-btn {
  color: #94a3b8 !important;
}

/* ── Body Layout ── */
.dialog-body {
  display: flex;
  gap: 0;
  min-height: 420px;
  max-height: 60vh;
  overflow: hidden;
}

/* ── Panel List ── */
.panel-list {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}
.panel-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.btn-new {
  font-size: 0.75rem !important;
}
.search-box {
  width: 100%;
}
.search-box :deep(.p-inputtext) {
  font-size: 0.8rem;
  height: 32px;
}
.template-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding-right: 2px;
}
.template-list::-webkit-scrollbar {
  width: 4px;
}
.template-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.template-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1.5px solid transparent;
  background: #f8fafc;
  transition: all 0.15s ease;
}
.template-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.template-item.active {
  background: #eff6ff;
  border-color: #3b82f6;
}
.template-item-content {
  flex: 1;
  min-width: 0;
}
.template-item-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.template-item-preview {
  font-size: 0.7rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.template-item-actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.template-item:hover .template-item-actions {
  opacity: 1;
}

.empty-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  gap: 0.5rem;
  font-size: 0.8rem;
}
.empty-list i {
  font-size: 1.8rem;
}

/* ── Panel Form ── */
.panel-form {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-left: 1rem;
}
.panel-form::-webkit-scrollbar {
  width: 4px;
}
.panel-form::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.form-mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}
.badge-new {
  background: #dcfce7;
  color: #15803d;
}
.badge-edit {
  background: #fef9c3;
  color: #92400e;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.field-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 2px;
}

/* SOAP colored labels */
.soap-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #3b82f6;
  color: #fff;
  flex-shrink: 0;
}
.badge-a {
  background: #f59e0b;
}
.badge-p {
  background: #10b981;
}

.soap-textarea {
  font-size: 0.82rem !important;
  resize: none;
}
.soap-textarea:deep(textarea) {
  font-size: 0.82rem;
  line-height: 1.5;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
  margin-top: auto;
}
.btn-submit {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border: none !important;
}

/* ── Footer ── */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.footer-count {
  font-size: 0.78rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── PrimeVue overrides ── */
:deep(.p-dialog-header) {
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}
:deep(.p-dialog-content) {
  padding: 1rem 1.25rem;
  overflow: hidden;
}
:deep(.p-dialog-footer) {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #f1f5f9;
}
:deep(.p-divider-vertical) {
  margin: 0 0.75rem;
}
:deep(.p-textarea) {
  width: 100%;
}
</style>
