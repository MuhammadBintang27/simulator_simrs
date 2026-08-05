<template>
  <loading_overlay :is-loading="loading" message="Memuat data..." />

  <div class="content">
    <!-- Page Header -->
    <div class="card elevation-0">
      <div class="card-header d-flex align-items-center justify-content-between">
        <h4 class="m-0"><i class="pi pi-file-edit mr-2"></i> Template Teks Informed Consent</h4>
        <Button
          label="Tambah Template"
          icon="pi pi-plus"
          severity="success"
          size="small"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- Filter Card -->
    <div class="card elevation-0">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Cari Judul</label>
            <InputText
              v-model="filterKeyword"
              placeholder="Cari judul atau isi teks..."
              class="w-100"
              @input="applyFilter"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label fw-semibold">Jenis Consent</label>
            <Select
              v-model="filterJenis"
              :options="jenisOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Semua jenis"
              showClear
              class="w-100"
              @change="applyFilter"
            />
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Status</label>
            <Select
              v-model="filterStatus"
              :options="[
                { label: 'Aktif', value: 1 },
                { label: 'Non-Aktif', value: 0 },
              ]"
              optionLabel="label"
              optionValue="value"
              placeholder="Semua"
              showClear
              class="w-100"
              @change="applyFilter"
            />
          </div>
          <div class="col-md-3 d-flex gap-2">
            <Button label="Refresh" icon="pi pi-refresh" severity="secondary" @click="fetchData" />
            <Button
              label="Reset"
              icon="pi pi-filter-slash"
              severity="secondary"
              outlined
              @click="resetFilter"
            />
          </div>
        </div>
        <div class="mt-2 small text-muted">
          Menampilkan <b>{{ filteredList.length }}</b> dari <b>{{ listData.length }}</b> template
        </div>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card elevation-0">
      <div class="card-body p-0">
        <!-- Empty State -->
        <div v-if="!loading && filteredList.length === 0" class="empty-state">
          <i class="pi pi-file-edit empty-icon"></i>
          <h5 class="empty-title">Belum Ada Template</h5>
          <p class="empty-desc">
            Tambahkan template teks informed consent untuk digunakan pada formulir persetujuan
            pasien.
          </p>
          <Button
            label="Tambah Template Baru"
            icon="pi pi-plus"
            severity="success"
            @click="openDialog()"
          />
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover table-bordered mb-0">
            <thead class="thead-primary">
              <tr>
                <th style="width: 4%">#</th>
                <th style="width: 18%">Jenis Consent</th>
                <th>Judul</th>
                <th style="width: 30%">Preview Teks</th>
                <th style="width: 8%; text-align: center">Status</th>
                <th style="width: 10%; text-align: center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in filteredList" :key="item.id || idx">
                <td class="text-center align-middle">{{ idx + 1 }}</td>
                <td class="align-middle">
                  <span class="badge-jenis" :class="badgeClass(item.jenis)">
                    {{ labelJenis(item.jenis) }}
                  </span>
                </td>
                <td class="align-middle fw-semibold" style="font-size: 0.88rem">
                  {{ item.judul }}
                </td>
                <td class="align-middle">
                  <span class="preview-text">{{ truncate(item.isi_teks, 120) }}</span>
                </td>
                <td class="text-center align-middle">
                  <Tag
                    :severity="item.status == 1 ? 'success' : 'secondary'"
                    :value="item.status == 1 ? 'Aktif' : 'Non-Aktif'"
                    style="font-size: 0.7rem"
                  />
                </td>
                <td class="text-center align-middle">
                  <div class="d-flex justify-content-center gap-1">
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      severity="warning"
                      rounded
                      title="Edit"
                      @click="openDialog(item)"
                    />
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                      rounded
                      title="Hapus"
                      @click="confirmDelete(item)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Dialog Input / Edit ── -->
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '92vw', maxWidth: '1200px' }"
    :closable="!isSaving"
    :header="editMode ? 'Edit Template Informed Consent' : 'Tambah Template Informed Consent'"
  >
    <div class="ic-form">
      <!-- Jenis + Status -->
      <div class="row g-3">
        <div class="col-md-7">
          <label class="form-label fw-semibold">
            Jenis Consent <span class="text-danger">*</span>
          </label>
          <Select
            v-model="form.jenis"
            :options="jenisOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Pilih jenis consent..."
            class="w-100"
            :class="{ 'p-invalid': errors.jenis }"
          />
          <small v-if="errors.jenis" class="text-danger">{{ errors.jenis }}</small>
        </div>
        <div class="col-md-5">
          <label class="form-label fw-semibold">Status</label>
          <div class="d-flex align-items-center gap-3 mt-2">
            <ToggleSwitch v-model="form.statusBool" />
            <span :class="form.statusBool ? 'text-success fw-semibold' : 'text-secondary'">
              {{ form.statusBool ? 'Aktif' : 'Non-Aktif' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Judul -->
      <div class="mt-3">
        <label class="form-label fw-semibold">
          Judul Template <span class="text-danger">*</span>
        </label>
        <InputText
          v-model="form.judul"
          class="w-100"
          placeholder="Contoh: Persetujuan Tindakan Anestesi Umum"
          :class="{ 'p-invalid': errors.judul }"
        />
        <small v-if="errors.judul" class="text-danger">{{ errors.judul }}</small>
      </div>

      <!-- Isi Teks -->
      <div class="mt-3">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <label class="form-label fw-semibold mb-0">
            Isi Teks Persetujuan <span class="text-danger">*</span>
          </label>
          <span class="char-count">{{ plainTextLength }} karakter</span>
        </div>

        <!-- Variable chips -->
        <div class="var-palette">
          <span class="var-palette-label">
            <i class="pi pi-tag mr-1"></i>Sisipkan variabel data pasien:
          </span>
          <button
            v-for="v in variables"
            :key="v.token"
            type="button"
            class="var-chip"
            :title="`Sisipkan ${v.label} (tebal) di posisi kursor`"
            @mousedown.prevent="insertVariable(v.token)"
          >
            {{ v.label }}
          </button>
        </div>

        <div :class="{ 'editor-invalid': errors.isi_teks }">
          <!-- key berubah setiap dialog dibuka → Quill remount dengan konten baru -->
          <Editor
            :key="dialogKey"
            v-model="form.isi_teks"
            editorStyle="min-height: 420px; font-size: 0.9rem; font-family: 'Segoe UI', system-ui, sans-serif;"
            @load="onEditorLoad"
          >
            <template #toolbar>
              <span class="ql-formats">
                <select class="ql-header">
                  <option value="1">Judul</option>
                  <option value="2">Sub-judul</option>
                  <option selected>Normal</option>
                </select>
              </span>
              <span class="ql-formats">
                <button class="ql-bold" title="Tebal"></button>
                <button class="ql-italic" title="Miring"></button>
                <button class="ql-underline" title="Garis bawah"></button>
              </span>
              <span class="ql-formats">
                <button class="ql-list" value="ordered" title="Daftar bernomor"></button>
                <button class="ql-list" value="bullet" title="Daftar poin"></button>
              </span>
              <span class="ql-formats">
                <button class="ql-indent" value="-1" title="Kurangi indentasi"></button>
                <button class="ql-indent" value="+1" title="Tambah indentasi"></button>
              </span>
              <span class="ql-formats">
                <button class="ql-clean" title="Hapus format"></button>
              </span>
            </template>
          </Editor>
        </div>
        <small v-if="errors.isi_teks" class="text-danger">{{ errors.isi_teks }}</small>
        <div class="textarea-hint">
          <i class="pi pi-info-circle mr-1"></i>
          Klik variabel di atas untuk menyisipkan data pasien secara otomatis — akan tampil
          <strong>tebal</strong> saat dicetak.
        </div>
      </div>

      <!-- Preview dengan data contoh -->
      <div class="mt-3" v-if="plainTextLength > 0">
        <div class="preview-header">
          <i class="pi pi-eye mr-1"></i> Preview
          <span class="preview-badge">data contoh</span>
        </div>
        <div class="preview-body preview-html" v-html="previewHtml"></div>
      </div>
    </div>

    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <Button
          label="Batal"
          icon="pi pi-times"
          severity="secondary"
          outlined
          :disabled="isSaving"
          @click="dialogVisible = false"
        />
        <Button
          :label="editMode ? 'Simpan Perubahan' : 'Simpan Template'"
          icon="pi pi-save"
          severity="success"
          :loading="isSaving"
          @click="saveData"
        />
      </div>
    </template>
  </Dialog>

  <!-- Confirm Dialog -->
  <ConfirmDialog />
  <Toast />
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Editor from 'primevue/editor'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const toast = useToast()
const confirm = useConfirm()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

// ── Data ──────────────────────────────────────────────────────────────────────

const loading = ref(false)
const isSaving = ref(false)
const listData = ref([])

const jenisOptions = [
  { label: 'Anestesi / Pembiusan', value: 'anestesi' },
  { label: 'Tindakan Pembedahan / Operasi', value: 'tindakan_operasi' },
  { label: 'Rawat Inap (General Consent)', value: 'rawat_inap' },
  { label: 'Transfusi Darah', value: 'transfusi' },
  { label: 'Tindakan Invasif', value: 'invasif' },
  { label: 'Penolakan Tindakan', value: 'penolakan' },
  { label: 'Lain-lain', value: 'lainnya' },
]

// ── Filter ────────────────────────────────────────────────────────────────────

const filterKeyword = ref('')
const filterJenis = ref(null)
const filterStatus = ref(null)

const filteredList = computed(() => {
  let result = listData.value
  const kw = filterKeyword.value.trim().toLowerCase()
  if (kw) result = result.filter((d) => (d.judul + ' ' + d.isi_teks).toLowerCase().includes(kw))
  if (filterJenis.value != null) result = result.filter((d) => d.jenis === filterJenis.value)
  if (filterStatus.value != null)
    result = result.filter((d) => Number(d.status) === filterStatus.value)
  return result
})

const applyFilter = () => {} // computed reactive, no-op trigger
const resetFilter = () => {
  filterKeyword.value = ''
  filterJenis.value = null
  filterStatus.value = null
}

// ── Dialog Form ───────────────────────────────────────────────────────────────

const dialogVisible = ref(false)
const editMode = ref(false)
const editId = ref(null)

const form = reactive({
  jenis: '',
  judul: '',
  isi_teks: '',
  statusBool: true,
})

const errors = reactive({ jenis: '', judul: '', isi_teks: '' })

const clearErrors = () => {
  errors.jenis = ''
  errors.judul = ''
  errors.isi_teks = ''
}

const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, '').trim() : '')
const plainTextLength = computed(() => stripHtml(form.isi_teks).length)

// ── Variabel sisipan ──────────────────────────────────────────────────────────

const variables = [
  { label: 'Nama Pasien', token: '{{NAMA_PASIEN}}' },
  { label: 'No. Rekam Medis', token: '{{NOMR}}' },
  { label: 'No. SEP', token: '{{NOSEP}}' },
  { label: 'No. Kartu BPJS', token: '{{NOJAMINAN}}' },
  { label: 'Nama Dokter', token: '{{DOKTER}}' },
  { label: 'Poli / Unit', token: '{{POLI}}' },
  { label: 'Tanggal Consent', token: '{{TANGGAL}}' },
]

const sampleData = {
  '{{NAMA_PASIEN}}': 'Ahmad Fauzi',
  '{{NOMR}}': 'RM-2024-001',
  '{{NOSEP}}': '0001234567890',
  '{{NOJAMINAN}}': '0000123456789',
  '{{DOKTER}}': 'dr. Budi Santoso, Sp.B',
  '{{POLI}}': 'Poli Bedah',
  '{{TANGGAL}}': '23 Juli 2026',
}

const previewHtml = computed(() => {
  let html = form.isi_teks
  Object.entries(sampleData).forEach(([token, val]) => {
    const escaped = token.replace(/[{}]/g, '\\$&')
    html = html.replace(new RegExp(escaped, 'g'), `<strong class="var-preview">${val}</strong>`)
  })
  return html
})

// ── Quill instance ────────────────────────────────────────────────────────────

const quillInstance = ref(null)
const dialogKey = ref(0)

const onEditorLoad = ({ instance }) => {
  quillInstance.value = instance

  // Quill v2 bug: normalizedToRange() crash "Cannot read properties of null
  // (reading 'offset')" saat scroll.find() tidak bisa menemukan node (orphaned
  // DOM dari remount, atau selectionchange ke node eksternal).
  // Patch instance ini — caller sudah handle return value [null, null].
  const sel = instance.selection
  const _origNTR = sel.normalizedToRange.bind(sel)
  sel.normalizedToRange = (nativeRange) => {
    try {
      return _origNTR(nativeRange)
    } catch {
      return [null, null]
    }
  }

  // Safety net: paste konten awal jika PrimeVue melewatkan modelValue
  if (form.isi_teks) {
    try {
      instance.clipboard.dangerouslyPasteHTML(0, form.isi_teks)
    } catch (e) {}
  }
}

const insertVariable = (token) => {
  const tag = `<strong>${token}</strong>`
  const isEmpty = !form.isi_teks || /^<p>(\s|<br\s*\/?>)*<\/p>$/i.test(form.isi_teks.trim())

  let newHtml
  if (isEmpty) {
    newHtml = `<p>${tag}</p>`
  } else {
    // Sisipkan sebelum tag penutup blok terakhir (</p>, </li>, </h1>, dll)
    const pos = form.isi_teks.lastIndexOf('</')
    newHtml =
      pos !== -1
        ? form.isi_teks.slice(0, pos) + tag + form.isi_teks.slice(pos)
        : form.isi_teks + tag
  }

  form.isi_teks = newHtml

  // PrimeVue watcher skip setContents saat hasFocus()=true. Push langsung ke Quill.
  // Aman karena normalizedToRange sudah di-patch di atas.
  if (quillInstance.value) {
    try {
      quillInstance.value.setContents(quillInstance.value.clipboard.convert({ html: newHtml }))
    } catch (e) {}
  }
}

const openDialog = (item = null) => {
  clearErrors()
  quillInstance.value = null
  dialogKey.value++
  if (item) {
    editMode.value = true
    editId.value = item.id
    form.jenis = item.jenis || ''
    form.judul = item.judul || ''
    form.isi_teks = item.isi_teks || ''
    form.statusBool = Number(item.status) === 1
  } else {
    editMode.value = false
    editId.value = null
    form.jenis = ''
    form.judul = ''
    form.isi_teks = ''
    form.statusBool = true
  }
  dialogVisible.value = true
}

const validate = () => {
  clearErrors()
  let ok = true
  if (!form.jenis) {
    errors.jenis = 'Jenis consent wajib dipilih.'
    ok = false
  }
  if (!form.judul.trim()) {
    errors.judul = 'Judul wajib diisi.'
    ok = false
  }
  if (!stripHtml(form.isi_teks)) {
    errors.isi_teks = 'Isi teks wajib diisi.'
    ok = false
  }
  return ok
}

// ── API ───────────────────────────────────────────────────────────────────────

const fetchData = async () => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.get(
      `${url}/index.php/api/inform_consent/get_template_teks/${id_client.value}`,
    )

    console.log('fetchData response:', res.data) // Debugging line
    const body = res.data

    if (Array.isArray(body)) listData.value = body
    else if (Array.isArray(body?.data)) listData.value = body.data
    else if (Array.isArray(body?.response)) listData.value = body.response
    else listData.value = []
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data template.',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  if (!validate()) return
  isSaving.value = true
  try {
    const url = configStore.apiBaseUrl
    const payload = {
      id: editId.value || null,
      jenis: form.jenis,
      judul: form.judul.trim(),
      isi_teks: form.isi_teks.trim(),
      status: form.statusBool ? 1 : 0,
      user_id: authStore.user_id,
      id_client: id_client.value,
    }
    const res = await axios.post(`${url}/index.php/api/inform_consent/save_template_teks`, payload)
    const code = res.data?.code
    if (code === 200 || code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: editMode.value
          ? 'Template berhasil diperbarui.'
          : 'Template baru berhasil disimpan.',
        life: 3000,
      })
      dialogVisible.value = false
      fetchData()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res.data?.message || 'Terjadi kesalahan saat menyimpan.',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (item) => {
  confirm.require({
    message: `Hapus template "${item.judul}"? Tindakan ini tidak dapat dibatalkan.`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Batal',
    acceptLabel: 'Hapus',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => deleteData(item),
  })
}

const deleteData = async (item) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/inform_consent/delete_template_teks`, {
      id: item.id,
      user_id: authStore.user_id,
      id_client: id_client.value,
    })
    const code = res.data?.code
    if (code === 200 || code === '200') {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Template berhasil dihapus.',
        life: 3000,
      })
      fetchData()
    } else {
      toast.add({
        severity: 'error',
        summary: 'Gagal',
        detail: res.data?.message || 'Gagal menghapus template.',
        life: 5000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Koneksi ke server gagal.',
      life: 5000,
    })
  } finally {
    loading.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const truncate = (html, len) => {
  const text = stripHtml(html)
  if (!text) return '—'
  return text.length > len ? text.slice(0, len) + '…' : text
}

const labelJenis = (val) => jenisOptions.find((o) => o.value === val)?.label || val || '—'

const badgeClassMap = {
  anestesi: 'badge-anestesi',
  tindakan_operasi: 'badge-operasi',
  rawat_inap: 'badge-ranap',
  transfusi: 'badge-transfusi',
  invasif: 'badge-invasif',
  penolakan: 'badge-penolakan',
  lainnya: 'badge-lainnya',
}

const badgeClass = (val) => badgeClassMap[val] || 'badge-lainnya'

// ── Init ──────────────────────────────────────────────────────────────────────

fetchData()
</script>

<style scoped>
/* ── Table Header ── */
.thead-primary th {
  background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  border-color: rgba(255, 255, 255, 0.15) !important;
  padding: 0.6rem 0.85rem;
  white-space: nowrap;
}

/* ── Preview text in table ── */
.preview-text {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Jenis badges ── */
.badge-jenis {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.badge-anestesi {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-operasi {
  background: #dcfce7;
  color: #15803d;
}
.badge-ranap {
  background: #fef3c7;
  color: #92400e;
}
.badge-transfusi {
  background: #ffe4e6;
  color: #9f1239;
}
.badge-invasif {
  background: #f3e8ff;
  color: #6b21a8;
}
.badge-penolakan {
  background: #fee2e2;
  color: #b91c1c;
}
.badge-lainnya {
  background: #f1f5f9;
  color: #475569;
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}
.empty-icon {
  font-size: 3.5rem;
  opacity: 0.15;
  display: block;
  margin-bottom: 1rem;
}
.empty-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.4rem;
}
.empty-desc {
  font-size: 0.88rem;
  max-width: 420px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

/* ── Dialog Form ── */
.ic-form {
  padding: 0.25rem 0;
}
.char-count {
  font-size: 0.75rem;
  color: #94a3b8;
}
.textarea-hint {
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* ── Variable palette ── */
.var-palette {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0.55rem 0.75rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
}
.var-palette-label {
  font-size: 0.73rem;
  font-weight: 600;
  color: #1d4ed8;
  white-space: nowrap;
  margin-right: 4px;
}
.var-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
  line-height: 1.6;
}
.var-chip:hover {
  background: #1e40af;
  transform: translateY(-1px);
}
.var-chip:active {
  transform: translateY(0);
}

/* palette ada → editor radius atas hilang */
.var-palette + div :deep(.ql-toolbar) {
  border-radius: 0;
}

/* ── Preview badge ── */
.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.preview-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  padding: 1px 7px;
}

/* token dalam preview */
.preview-html :deep(.var-preview) {
  color: #1d4ed8;
  background: #dbeafe;
  border-radius: 3px;
  padding: 0 3px;
  font-weight: 700;
}

/* Editor border invalid */
.editor-invalid :deep(.ql-toolbar),
.editor-invalid :deep(.ql-container) {
  border-color: #ef4444 !important;
}

/* Editor toolbar tweaks */
:deep(.ql-toolbar) {
  border-radius: 6px 6px 0 0;
  border-color: #d1d5db;
  background: #f9fafb;
}
:deep(.ql-container) {
  border-radius: 0 0 6px 6px;
  border-color: #d1d5db;
}
:deep(.ql-editor) {
  line-height: 1.75;
}
:deep(.ql-editor ol),
:deep(.ql-editor ul) {
  padding-left: 1.5rem;
}

/* ── Preview ── */
.preview-header {
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.45rem 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
}
.preview-body {
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 6px 6px;
  background: #fff;
  max-height: 240px;
  overflow-y: auto;
}
.preview-html {
  font-size: 0.83rem;
  color: #374151;
  line-height: 1.75;
}
.preview-html :deep(p) {
  margin-bottom: 0.4rem;
}
.preview-html :deep(ol),
.preview-html :deep(ul) {
  padding-left: 1.4rem;
  margin-bottom: 0.4rem;
}
.preview-html :deep(li) {
  margin-bottom: 0.2rem;
}
.preview-html :deep(strong) {
  font-weight: 700;
}
.preview-html :deep(em) {
  font-style: italic;
}
.preview-html :deep(u) {
  text-decoration: underline;
}
.preview-html :deep(h1) {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
.preview-html :deep(h2) {
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
</style>
