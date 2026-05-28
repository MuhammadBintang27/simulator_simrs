<template>
  <loading_overlay :is-loading="loading" message="Memuat data...." />
  <Toast />
  <ConfirmDialog group="fisio-confirm" />

  <!-- Dialog Preview -->
  <Dialog
    v-model:visible="showPreview"
    modal
    :header="`Detail Permintaan — ${selectedItem?.no_permintaan ?? ''}`"
    :style="{ width: '480px' }"
    :breakpoints="{ '600px': '95vw' }"
  >
    <div v-if="selectedItem" class="prev-wrap">
      <div class="prev-row">
        <span class="prev-lbl">Tanggal</span>
        <span class="prev-val">{{ selectedItem.tgl_permintaan }}</span>
      </div>
      <div class="prev-row">
        <span class="prev-lbl">No Permintaan</span>
        <code class="prev-code">{{ selectedItem.no_permintaan }}</code>
      </div>
      <div class="prev-row">
        <span class="prev-lbl">Status Kirim</span>
        <span
          class="rc-badge"
          :class="selectedItem.status_kirim == 1 ? 'badge-sent' : 'badge-pending'"
        >
          {{ selectedItem.status_kirim == 1 ? 'Terkirim' : 'Pending' }}
        </span>
      </div>
      <div class="prev-row">
        <span class="prev-lbl">Status Layanan</span>
        <span
          class="rc-badge"
          :class="selectedItem.status_layanan == 1 ? 'badge-done' : 'badge-waiting'"
        >
          {{ selectedItem.status_layanan == 1 ? 'Dilayani' : 'Menunggu' }}
        </span>
      </div>
      <Divider />
      <div class="prev-row" v-if="selectedItem.klinis">
        <span class="prev-lbl">Diagnosa / Klinis</span>
        <span class="prev-val">{{ selectedItem.klinis }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.keluhan">
        <span class="prev-lbl">Keluhan</span>
        <span class="prev-val">{{ selectedItem.keluhan }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.lokasi_keluhan">
        <span class="prev-lbl">Lokasi Keluhan</span>
        <span class="prev-val">{{ selectedItem.lokasi_keluhan }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.onset">
        <span class="prev-lbl">Onset</span>
        <span class="prev-val">{{ selectedItem.onset }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.skala_nyeri != null">
        <span class="prev-lbl">Skala Nyeri VAS</span>
        <Tag
          :value="`${selectedItem.skala_nyeri}/10`"
          :severity="
            selectedItem.skala_nyeri <= 3
              ? 'success'
              : selectedItem.skala_nyeri <= 6
                ? 'warn'
                : 'danger'
          "
        />
      </div>
      <div class="prev-row" v-if="selectedItem.prioritas">
        <span class="prev-lbl">Prioritas</span>
        <span class="prev-val">{{ selectedItem.prioritas }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.kondisi_mobilitas">
        <span class="prev-lbl">Kondisi Mobilitas</span>
        <span class="prev-val">{{ selectedItem.kondisi_mobilitas }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.riwayat_terapi">
        <span class="prev-lbl">Riwayat Terapi</span>
        <span class="prev-val">{{ selectedItem.riwayat_terapi }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.catatan">
        <span class="prev-lbl">Catatan</span>
        <span class="prev-val">{{ selectedItem.catatan }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.nama_dokter">
        <span class="prev-lbl">Dokter</span>
        <span class="prev-val">{{ selectedItem.nama_dokter }}</span>
      </div>
      <div class="prev-row" v-if="selectedItem.poli_asal">
        <span class="prev-lbl">Poli Asal</span>
        <span class="prev-val">{{ selectedItem.poli_asal }}</span>
      </div>
    </div>
  </Dialog>

  <Panel>
    <template #header>
      <h6 style="color: darkcyan">
        <strong><i class="fas fa-walking mr-2"></i>PERMINTAAN FISIOTERAPI</strong>
        <Button
          @click="getRiwayat"
          text
          class="round-button ml-2"
          icon="pi pi-refresh"
          v-tooltip.top="'Refresh riwayat'"
        />
      </h6>
    </template>

    <div class="row">
      <!-- Kiri: Riwayat -->
      <div class="col-md-2 riwayat-col">
        <div class="riwayat-header">
          <span class="riwayat-title"> <i class="pi pi-history"></i> Riwayat </span>
          <span class="riwayat-count" v-if="riwayatList.length">{{ riwayatList.length }}</span>
        </div>

        <ScrollPanel style="height: 480px">
          <!-- Empty -->
          <div v-if="riwayatList.length === 0" class="riwayat-empty">
            <i class="pi pi-inbox riwayat-empty-icon"></i>
            <span>Belum ada riwayat permintaan</span>
          </div>

          <!-- Cards -->
          <div
            v-for="(item, index) in riwayatList"
            :key="item.id"
            class="riwayat-card"
            :class="item.status_kirim == 1 ? 'rc-sent' : 'rc-pending'"
          >
            <!-- Status stripe -->
            <div
              class="rc-stripe"
              :class="item.status_kirim == 1 ? 'stripe-sent' : 'stripe-pending'"
            ></div>

            <div class="rc-body">
              <!-- Date + Status -->
              <div class="rc-top">
                <span class="rc-date">
                  <i class="pi pi-calendar-clock"></i>
                  {{ splitTgl(item.tgl_permintaan).tgl }}<br />
                  <small>{{ splitTgl(item.tgl_permintaan).jam }}</small>
                </span>
                <div class="rc-badges">
                  <span
                    class="rc-badge"
                    :class="item.status_kirim == 1 ? 'badge-sent' : 'badge-pending'"
                  >
                    {{ item.status_kirim == 1 ? 'Terkirim' : 'Pending' }}
                  </span>
                  <span
                    class="rc-badge"
                    :class="item.status_layanan == 1 ? 'badge-done' : 'badge-waiting'"
                  >
                    {{ item.status_layanan == 1 ? 'Dilayani' : 'Menunggu' }}
                  </span>
                </div>
              </div>

              <!-- No Permintaan -->
              <div class="rc-receipt">
                <i class="pi pi-hashtag"></i>
                <code>{{ item.no_permintaan }}</code>
              </div>

              <!-- Klinis -->
              <div v-if="item.klinis" class="rc-klinis">
                <span class="rc-field-lbl">Klinis</span>
                <span class="rc-field-val">{{ item.klinis }}</span>
              </div>

              <!-- Lokasi + Prioritas -->
              <div v-if="item.lokasi_keluhan || item.prioritas" class="rc-klinis">
                <span v-if="item.lokasi_keluhan" class="rc-field-val" style="font-size: 0.65rem">
                  <i class="pi pi-map-marker" style="font-size: 0.6rem"></i>
                  {{ item.lokasi_keluhan }}
                </span>
                <span
                  v-if="item.prioritas"
                  class="rc-field-val"
                  style="font-size: 0.65rem; color: #b45309"
                >
                  <i class="pi pi-flag" style="font-size: 0.6rem"></i>
                  {{ item.prioritas }}
                </span>
              </div>

              <!-- Actions -->
              <div class="rc-actions">
                <Button
                  icon="pi pi-eye"
                  text
                  size="small"
                  class="rc-btn rc-btn-preview"
                  v-tooltip.top="'Lihat detail'"
                  @click="openPreview(item)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  size="small"
                  class="rc-btn"
                  v-tooltip.top="'Batalkan permintaan'"
                  @click="confirmVoid(item.no_permintaan, index)"
                />
                <Button
                  v-if="item.status_kirim == 0"
                  icon="pi pi-send"
                  label="Kirim"
                  severity="success"
                  size="small"
                  outlined
                  class="rc-btn"
                  @click="kirimUlang(item.no_permintaan)"
                />
              </div>
            </div>
          </div>
        </ScrollPanel>
      </div>

      <!-- Kanan: Form -->
      <div class="col-md-10">
        <Panel>
          <template #header>
            <h6 style="color: darkcyan; margin: 0">
              <strong>RUJUK PASIEN KE UNIT FISIOTERAPI</strong>
            </h6>
          </template>

          <div class="fisio-form">
            <div class="fisio-info-strip">
              <i class="pi pi-info-circle"></i>
              <span
                >Pasien akan dikirim ke unit Fisioterapi. Petugas fisioterapi yang akan menentukan
                tindakan berdasarkan keluhan dan klinis yang dikirimkan.</span
              >
            </div>

            <div class="fisio-fields">
              <!-- Row 1: Klinis + Lokasi -->
              <div class="fisio-grid-2">
                <div class="fisio-field">
                  <label class="fisio-lbl">Diagnosa / Klinis <span class="req">*</span></label>
                  <InputText
                    v-model="form.klinis"
                    class="w-100"
                    placeholder="Diagnosa atau klinis pasien..."
                    :class="{ 'p-invalid': errors.klinis }"
                  />
                  <small v-if="errors.klinis" class="p-error">{{ errors.klinis }}</small>
                </div>
                <div class="fisio-field">
                  <label class="fisio-lbl">Lokasi Keluhan <span class="req">*</span></label>
                  <Select
                    v-model="form.lokasiKeluhan"
                    :options="lokasiOptions"
                    optionLabel="label"
                    filter
                    placeholder="Pilih area yang bermasalah..."
                    class="w-100"
                    showClear
                    :class="{ 'p-invalid': errors.lokasiKeluhan }"
                  />
                  <small v-if="errors.lokasiKeluhan" class="p-error">{{
                    errors.lokasiKeluhan
                  }}</small>
                </div>
              </div>

              <!-- Row 2: Keluhan -->
              <div class="fisio-field">
                <label class="fisio-lbl">Keluhan Pasien <span class="req">*</span></label>
                <Textarea
                  v-model="form.keluhan"
                  class="w-100"
                  rows="3"
                  placeholder="Tuliskan keluhan utama pasien secara lengkap (nyeri, keterbatasan gerak, riwayat trauma, dll)..."
                  :class="{ 'p-invalid': errors.keluhan }"
                />
                <small v-if="errors.keluhan" class="p-error">{{ errors.keluhan }}</small>
              </div>

              <!-- Row 3: Onset + Skala Nyeri + Prioritas -->
              <div class="fisio-grid-3">
                <div class="fisio-field">
                  <label class="fisio-lbl">Onset / Sejak Kapan</label>
                  <Select
                    v-model="form.onset"
                    :options="onsetOptions"
                    optionLabel="label"
                    placeholder="Pilih onset..."
                    class="w-100"
                    showClear
                  />
                </div>
                <div class="fisio-field">
                  <label class="fisio-lbl">
                    Skala Nyeri VAS
                    <Tag
                      v-if="form.skalaNyeri !== null"
                      :severity="
                        form.skalaNyeri <= 3 ? 'success' : form.skalaNyeri <= 6 ? 'warn' : 'danger'
                      "
                      :value="`${form.skalaNyeri}/10`"
                      style="font-size: 10px; margin-left: 6px"
                    />
                  </label>
                  <Slider
                    v-model="form.skalaNyeri"
                    :min="0"
                    :max="10"
                    :step="1"
                    class="w-100 mt-2"
                  />
                  <div class="vas-labels">
                    <span style="color: #16a34a; font-size: 10px">0 Tidak Nyeri</span>
                    <span style="color: #ca8a04; font-size: 10px">5</span>
                    <span style="color: #dc2626; font-size: 10px">10 Sangat Nyeri</span>
                  </div>
                </div>
                <div class="fisio-field">
                  <label class="fisio-lbl">Prioritas Penanganan</label>
                  <Select
                    v-model="form.prioritas"
                    :options="prioritasOptions"
                    optionLabel="label"
                    placeholder="Pilih prioritas..."
                    class="w-100"
                    showClear
                  />
                </div>
              </div>

              <!-- Row 4: Mobilitas + Riwayat Terapi -->
              <div class="fisio-grid-2">
                <div class="fisio-field">
                  <label class="fisio-lbl">Kondisi Mobilitas Pasien</label>
                  <Select
                    v-model="form.kondisiMobilitas"
                    :options="mobilityOptions"
                    optionLabel="label"
                    placeholder="Pilih kondisi mobilitas..."
                    class="w-100"
                    showClear
                  />
                </div>
                <div class="fisio-field">
                  <label class="fisio-lbl">Riwayat Terapi Sebelumnya</label>
                  <Select
                    v-model="form.riwayatTerapi"
                    :options="riwayatTerapiOptions"
                    optionLabel="label"
                    placeholder="Pilih riwayat..."
                    class="w-100"
                    showClear
                  />
                </div>
              </div>

              <!-- Row 5: Catatan -->
              <div class="fisio-field">
                <label class="fisio-lbl"
                  >Catatan Tambahan <span class="opt">(opsional)</span></label
                >
                <InputText
                  v-model="form.catatan"
                  class="w-100"
                  placeholder="Catatan khusus untuk petugas fisioterapi..."
                />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="fisio-footer">
              <div class="fisio-pasien-info">
                <i class="pi pi-user mr-1" style="color: #6b7280"></i>
                <span
                  ><strong>{{ props.datapasien?.NAMAPASIEN }}</strong> -
                  {{ props.datapasien?.NOMR }} - {{ props.datapasien?.POLI }}</span
                >
              </div>
              <Button
                label="Kirim ke Fisioterapi"
                icon="pi pi-send"
                severity="success"
                :loading="loading"
                @click="kirimKeFisioterapi"
              />
            </div>
          </template>
        </Panel>
      </div>
    </div>
  </Panel>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import ScrollPanel from 'primevue/scrollpanel'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Select from 'primevue/select'
import Slider from 'primevue/slider'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import axios from 'axios'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const route = useRoute()
const confirm = useConfirm()
const toast = useToast()

const props = defineProps({
  datapasien: { type: Object, required: true },
})

const loading = ref(false)
const riwayatList = ref([])
const showPreview = ref(false)
const selectedItem = ref(null)

const openPreview = (item) => {
  selectedItem.value = item
  showPreview.value = true
}

const form = reactive({
  klinis: '',
  keluhan: '',
  catatan: '',
  lokasiKeluhan: null,
  onset: null,
  skalaNyeri: 0,
  prioritas: null,
  kondisiMobilitas: null,
  riwayatTerapi: null,
})
const errors = reactive({ klinis: '', keluhan: '', lokasiKeluhan: '' })

const lokasiOptions = [
  { label: 'Leher / Cervical' },
  { label: 'Bahu (Shoulder)' },
  { label: 'Siku (Elbow)' },
  { label: 'Pergelangan Tangan / Jari' },
  { label: 'Punggung Atas (Thoracal)' },
  { label: 'Punggung Bawah / Lumbal' },
  { label: 'Pinggul / Panggul (Hip)' },
  { label: 'Lutut (Knee)' },
  { label: 'Pergelangan Kaki / Ankle' },
  { label: 'Kaki / Telapak Kaki' },
  { label: 'Seluruh Tubuh / Umum' },
  { label: 'Lainnya' },
]

const onsetOptions = [
  { label: '< 1 minggu (Akut)' },
  { label: '1–4 minggu (Sub-akut)' },
  { label: '1–3 bulan' },
  { label: '3–6 bulan' },
  { label: '> 6 bulan (Kronik)' },
  { label: '> 1 tahun' },
]

const prioritasOptions = [
  { label: 'Segera (Urgnt)', icon: 'pi pi-exclamation-circle', color: '#dc2626' },
  { label: 'Prioritas Tinggi', icon: 'pi pi-arrow-up', color: '#f59e0b' },
  { label: 'Rutin / Elektif', icon: 'pi pi-minus', color: '#3b82f6' },
]

const mobilityOptions = [
  { label: 'Mandiri penuh' },
  { label: 'Mandiri dengan alat bantu' },
  { label: 'Perlu bantuan sebagian' },
  { label: 'Ketergantungan penuh (Bed rest)' },
  { label: 'Post operasi / imobilisasi' },
]

const riwayatTerapiOptions = [
  { label: 'Belum pernah terapi' },
  { label: 'Pernah — fisioterapi' },
  { label: 'Pernah — obat-obatan saja' },
  { label: 'Pernah — kombinasi' },
  { label: 'Terapi berjalan (lanjutan)' },
]

const nowStr = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
const showSuccess = (msg) =>
  toast.add({ severity: 'success', summary: 'Berhasil', detail: msg, life: 3000 })
const showError = (msg) =>
  toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })

const validate = () => {
  errors.klinis = form.klinis.trim() ? '' : 'Diagnosa / klinis wajib diisi'
  errors.keluhan = form.keluhan.trim() ? '' : 'Keluhan pasien wajib diisi'
  errors.lokasiKeluhan = form.lokasiKeluhan ? '' : 'Lokasi keluhan wajib dipilih'
  return !errors.klinis && !errors.keluhan && !errors.lokasiKeluhan
}

const splitTgl = (str) => {
  if (!str) return { tgl: '-', jam: '-' }
  const [tgl, jam] = str.split(' ')
  return { tgl: tgl ?? '-', jam: jam ?? '-' }
}

const getRiwayat = async () => {
  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/riwayat_permintaan_fisio`,
      { noregister: route.query.noreg, id_client: id_client.value, mode: 2 },
    )
    riwayatList.value = res.data?.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const kirimKeFisioterapi = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const payload = {
      no_permintaan: null,
      id_client: id_client.value,
      noregister: route.query.noreg,
      norm: props.datapasien?.NOMR,
      kddokter: props.datapasien?.KDDOKTER,
      poli_asal: props.datapasien?.POLI,
      nama_dokter: props.datapasien?.NAMADOKTER,
      klinis: form.klinis.trim(),
      keluhan: form.keluhan.trim(),
      lokasi_keluhan: form.lokasiKeluhan?.label ?? null,
      onset: form.onset?.label ?? null,
      skala_nyeri: form.skalaNyeri,
      prioritas: form.prioritas?.label ?? null,
      kondisi_mobilitas: form.kondisiMobilitas?.label ?? null,
      riwayat_terapi: form.riwayatTerapi?.label ?? null,
      catatan: form.catatan.trim() || null,
      status_kirim: 1,
      tgl_permintaan: nowStr(),
      user_input: user_id.value,
    }

    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/insert_permintaan_fisio_trapi`,
      payload,
    )

    console.log('Response dari server:', res.data)

    if (res.data?.code == 200) {
      showSuccess('Pasien berhasil dikirim ke unit Fisioterapi')
      Object.assign(form, {
        klinis: '',
        keluhan: '',
        catatan: '',
        lokasiKeluhan: null,
        onset: null,
        skalaNyeri: 0,
        prioritas: null,
        kondisiMobilitas: null,
        riwayatTerapi: null,
      })
      await getRiwayat()
    } else {
      showError(res.data?.message ?? 'Gagal mengirim permintaan')
    }
  } catch (err) {
    console.error(err)
    showError('Terjadi kesalahan saat mengirim permintaan')
  } finally {
    loading.value = false
  }
}

const kirimUlang = async (rcpt) => {
  loading.value = true
  try {
    await axios.post(
      `${configStore.apiApotikUrl}/index.php/api/sales/kirim_resep/${id_client.value}`,
      { RECEIPT_NO: rcpt },
    )
    showSuccess('Permintaan berhasil dikirim')
    await getRiwayat()
  } catch (err) {
    showError('Gagal mengirim')
  } finally {
    loading.value = false
  }
}

const confirmVoid = (noPermintaan, idx) => {
  confirm.require({
    group: 'fisio-confirm',
    message: `Yakin ingin membatalkan permintaan ${noPermintaan}?`,
    header: 'Konfirmasi Batalkan',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Tidak',
    acceptLabel: 'Ya, Batalkan',
    acceptClass: 'p-button-danger round-button2',
    rejectClass: 'p-button-secondary p-button-outlined round-button2',
    accept: () => hapusPermintaan(noPermintaan, idx),
  })
}

const hapusPermintaan = async (noPermintaan, idx) => {
  loading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/penunjang/batal_permintaan_fisio`,
      {
        id_client: id_client.value,
        no_permintaan: noPermintaan,
        alasan_batal: null,
        user_batal: user_id.value,
      },
    )
    console.log('Response batal permintaan:', res.data)

    if (res.data?.code == 200) {
      riwayatList.value.splice(idx, 1)
      showSuccess(`Permintaan ${noPermintaan} berhasil dibatalkan`)
    } else {
      showError(res.data?.message || 'Gagal membatalkan permintaan')
    }
  } catch {
    showError('Terjadi kesalahan saat membatalkan permintaan')
  } finally {
    loading.value = false
  }
}

onMounted(() => getRiwayat())
</script>

<style scoped>
/* ── Grids ── */
.fisio-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem 1.25rem;
  align-items: start;
}
.fisio-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.85rem 1.25rem;
  align-items: start;
}
@media (max-width: 900px) {
  .fisio-grid-2,
  .fisio-grid-3 {
    grid-template-columns: 1fr;
  }
}

/* ── VAS Slider ── */
.vas-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
}

/* ── Riwayat Column ── */
.riwayat-col {
  padding-right: 8px;
}
.riwayat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 8px 2px;
  border-bottom: 2px solid darkcyan;
  margin-bottom: 8px;
}
.riwayat-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: darkcyan;
  display: flex;
  align-items: center;
  gap: 5px;
}
.riwayat-count {
  background: darkcyan;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  padding: 1px 7px;
  min-width: 20px;
  text-align: center;
}
/* ── Empty ── */
.riwayat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 2.5rem 0.5rem;
  color: #cbd5e1;
  text-align: center;
  font-size: 0.78rem;
}
.riwayat-empty-icon {
  font-size: 2rem;
  opacity: 0.35;
}
/* ── Card ── */
.riwayat-card {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
  transition: box-shadow 0.2s ease;
}
.riwayat-card:hover {
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.1);
}
.rc-sent {
  border-color: #bbf7d0;
}
.rc-pending {
  border-color: #fde68a;
}
.rc-stripe {
  width: 4px;
  flex-shrink: 0;
}
.stripe-sent {
  background: #22c55e;
}
.stripe-pending {
  background: #f59e0b;
}
.rc-body {
  flex: 1;
  padding: 8px 8px 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.rc-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
}
.rc-date {
  font-size: 0.68rem;
  color: #64748b;
  line-height: 1.3;
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
.rc-date .pi {
  margin-top: 1px;
  font-size: 0.65rem;
  color: #94a3b8;
}
.rc-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.badge-sent {
  background: #dcfce7;
  color: #15803d;
}
.badge-pending {
  background: #fef3c7;
  color: #b45309;
}
.badge-done {
  background: #dbeafe;
  color: #1d4ed8;
}
.badge-waiting {
  background: #f1f5f9;
  color: #64748b;
}
.rc-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}
.rc-receipt {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #94a3b8;
  overflow: hidden;
}
.rc-receipt code {
  font-size: 0.62rem;
  color: darkcyan;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rc-receipt .pi {
  font-size: 0.6rem;
  flex-shrink: 0;
}
.rc-klinis {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #f8fafc;
  border-radius: 4px;
  padding: 3px 6px;
}
.rc-field-lbl {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
.rc-field-val {
  font-size: 0.7rem;
  color: #334155;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rc-actions {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}
.rc-btn {
  font-size: 0.7rem !important;
  padding: 0.2rem 0.4rem !important;
}
.rc-btn-preview {
  color: darkcyan !important;
}
.fisio-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.fisio-info-strip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #e0f7f7;
  border: 1px solid #80cbc4;
  border-radius: 6px;
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  color: darkcyan;
  line-height: 1.5;
}
.fisio-fields {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.fisio-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fisio-lbl {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}
.req {
  color: #dc2626;
}
.opt {
  font-weight: 400;
  color: #9ca3af;
  font-size: 11px;
}
.fisio-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}
.fisio-pasien-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  color: #374151;
}
.btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.btn-danger {
  background-color: #dc2626;
  color: white;
}
.btn-xs {
  font-size: 10px;
  padding: 2px 6px;
}
.round-button2 {
  border-radius: 6px;
}
.mb-1 {
  margin-bottom: 0.25rem;
}
.mr-1 {
  margin-right: 0.25rem;
}
.mr-2 {
  margin-right: 0.5rem;
}
.ml-2 {
  margin-left: 0.5rem;
}
:deep(.p-inputtext),
:deep(.p-textarea) {
  font-size: 0.84rem;
}
/* ── Preview Dialog ── */
.prev-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.84rem;
}
.prev-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.prev-lbl {
  flex-shrink: 0;
  width: 140px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.prev-val {
  color: #1e293b;
  line-height: 1.4;
}
.prev-code {
  font-size: 0.78rem;
  color: darkcyan;
}
</style>
