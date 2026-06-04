<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    maximizable
    :style="{ width: '95vw', maxWidth: '1200px' }"
    :breakpoints="{ '768px': '99vw' }"
    :draggable="false"
    class="riwayat-obgyn-dialog"
    @hide="onHide"
  >
    <!-- ── Header ── -->
    <template #header>
      <div class="dlg-header">
        <div class="dlg-header-top">
          <div class="dlg-header-left">
            <div class="dlg-header-icon"><i class="pi pi-history" /></div>
            <div>
              <div class="dlg-header-title">Riwayat Kunjungan OBGYN</div>
              <div class="dlg-header-sub">Histori pemeriksaan Obstetri &amp; Ginekologi</div>
            </div>
          </div>
          <div class="dlg-header-stats">
            <div class="stat-chip">
              <span class="stat-val">{{ kunjunganList.length }}</span>
              <span class="stat-lbl">Total Kunjungan</span>
            </div>
            <div class="stat-chip info" v-if="jumlahObstetri > 0">
              <span class="stat-val">{{ jumlahObstetri }}</span>
              <span class="stat-lbl">Obstetri</span>
            </div>
            <div class="stat-chip help" v-if="jumlahGinekologi > 0">
              <span class="stat-val">{{ jumlahGinekologi }}</span>
              <span class="stat-lbl">Ginekologi</span>
            </div>
          </div>
        </div>

        <div class="dlg-patient-bar">
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-user" /> Nama</span>
            <span class="patient-info-val">{{ datapasien?.NAMAPASIEN || '—' }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-id-card" /> No. RM</span>
            <span class="patient-info-val">{{ datapasien?.NOMR || '—' }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-file" /> No. Pendaftaran</span>
            <span class="patient-info-val">{{ datapasien?.NOPENDAFTARAN || '—' }}</span>
          </div>
          <div class="patient-divider" />
          <div class="patient-info-item">
            <span class="patient-info-lbl"><i class="pi pi-user-edit" /> Dokter</span>
            <span class="patient-info-val">{{
              datapasien?.NAMADOKTER || datapasien?.KDDOKTER || '—'
            }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Body ── -->
    <div class="dlg-body">
      <DataTable
        :value="kunjunganList"
        dataKey="id"
        v-model:expandedRows="expandedRows"
        @row-expand="onRowExpand"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        stripedRows
        class="riwayat-table"
        responsiveLayout="scroll"
        emptyMessage="Belum ada riwayat kunjungan OBGYN untuk pasien ini"
        sortField="tanggal_periksa"
        :sortOrder="-1"
      >
        <Column expander style="width: 3rem" />

        <!-- No -->
        <Column header="#" style="width: 45px; text-align: center">
          <template #body="{ index }">
            <span class="row-no">{{ index + 1 }}</span>
          </template>
        </Column>

        <!-- Tanggal -->
        <Column
          field="tanggal_periksa"
          header="Tanggal Kunjungan"
          sortable
          style="min-width: 140px"
        >
          <template #body="{ data }">
            <div class="cell-date">
              <i class="pi pi-calendar" />
              {{ formatTanggal(data.tanggal_periksa) }}
            </div>
          </template>
        </Column>

        <!-- Kategori -->
        <Column field="kategori" header="Kategori" style="min-width: 130px">
          <template #body="{ data }">
            <Tag
              :value="data.kategori"
              :severity="data.kategori === 'OBSTETRI' ? 'info' : 'help'"
            />
          </template>
        </Column>

        <!-- No Register -->
        <Column field="no_register" header="No. Kunjungan" style="min-width: 140px">
          <template #body="{ data }">
            <span class="cell-mono">{{ data.no_register }}</span>
          </template>
        </Column>

        <!-- Dicatat Oleh -->
        <Column field="created_by" header="Dicatat Oleh" style="min-width: 130px">
          <template #body="{ data }">
            <span class="cell-user">
              <i class="pi pi-user-edit" />
              {{ data.created_by || '—' }}
            </span>
          </template>
        </Column>

        <!-- ── Expanded Row Detail ── -->
        <template #expansion="{ data }">
          <div class="expansion-body">
            <!-- Loading detail -->
            <div v-if="detailLoading[data.id]" class="expansion-loading">
              <i class="pi pi-spin pi-spinner" />
              <span>Memuat detail kunjungan…</span>
            </div>

            <!-- ══ OBSTETRI ══ -->
            <div v-else-if="data.kategori === 'OBSTETRI' && detailData[data.id]">
              <div class="detail-section-title">
                <Tag value="OBSTETRI" severity="info" /> Detail Pemeriksaan
              </div>

              <!-- GPA & Data Kehamilan -->
              <div class="detail-grid">
                <div class="detail-group">
                  <div class="detail-group-label">Status GPA</div>
                  <div class="gpa-badge-sm">
                    G{{ detailData[data.id].obstetri?.gravida ?? 0 }} P{{
                      detailData[data.id].obstetri?.para ?? 0
                    }}
                    A{{ detailData[data.id].obstetri?.abortus ?? 0 }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">HPHT</div>
                  <div class="detail-val">
                    {{ formatTanggal(detailData[data.id].obstetri?.hpht) || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">HPL</div>
                  <div class="detail-val">
                    {{ formatTanggal(detailData[data.id].obstetri?.hpl) || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Usia Kehamilan</div>
                  <div class="detail-val">
                    <span v-if="detailData[data.id].obstetri?.hpht">
                      {{ hitungUK(detailData[data.id].obstetri.hpht, data.tanggal_periksa) }} minggu
                    </span>
                    <span v-else>—</span>
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">TFU</div>
                  <div class="detail-val">
                    {{
                      detailData[data.id].obstetri?.tfu != null
                        ? detailData[data.id].obstetri.tfu + ' cm'
                        : '—'
                    }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">DJJ</div>
                  <div class="detail-val">
                    <span v-if="detailData[data.id].obstetri?.djj">
                      <Tag
                        :value="detailData[data.id].obstetri.djj + ' bpm'"
                        :severity="
                          detailData[data.id].obstetri.djj >= 110 &&
                          detailData[data.id].obstetri.djj <= 160
                            ? 'success'
                            : 'danger'
                        "
                      />
                    </span>
                    <span v-else>—</span>
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Leopold II / III / IV</div>
                  <div class="detail-val">
                    {{ detailData[data.id].obstetri?.leopold2 || '—' }} /
                    {{ detailData[data.id].obstetri?.leopold3 || '—' }} /
                    {{ detailData[data.id].obstetri?.leopold4 || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Kontraksi</div>
                  <div class="detail-val">{{ detailData[data.id].obstetri?.kontraksi || '—' }}</div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Gerakan Janin</div>
                  <div class="detail-val">
                    {{ detailData[data.id].obstetri?.gerakan_janin || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Protein Urin</div>
                  <div class="detail-val">
                    {{ detailData[data.id].obstetri?.protein_urin || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Edema</div>
                  <div class="detail-val">{{ detailData[data.id].obstetri?.edema || '—' }}</div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Air Ketuban</div>
                  <div class="detail-val">
                    {{ detailData[data.id].obstetri?.air_ketuban || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">ANC Ke- / Tempat</div>
                  <div class="detail-val">
                    {{
                      detailData[data.id].obstetri?.kunjungan_anc != null
                        ? 'Ke-' + detailData[data.id].obstetri.kunjungan_anc
                        : '—'
                    }}
                    <span v-if="detailData[data.id].obstetri?.tempat_anc">
                      · {{ detailData[data.id].obstetri.tempat_anc }}</span
                    >
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Status TT</div>
                  <div class="detail-val">{{ detailData[data.id].obstetri?.status_tt || '—' }}</div>
                </div>
              </div>

              <!-- Suplemen -->
              <div v-if="detailData[data.id].suplemen?.length" class="detail-tags-row">
                <span class="detail-tags-label">Suplemen:</span>
                <Tag
                  v-for="s in detailData[data.id].suplemen"
                  :key="s"
                  :value="s"
                  severity="success"
                  class="tag-sm"
                />
              </div>

              <!-- Keluhan & Riwayat -->
              <div
                class="detail-notes-grid"
                v-if="
                  detailData[data.id].obstetri?.keluhan_kehamilan ||
                  detailData[data.id].obstetri?.riwayat_kehamilan ||
                  detailData[data.id].obstetri?.temuan_usg
                "
              >
                <div
                  v-if="detailData[data.id].obstetri?.keluhan_kehamilan"
                  class="detail-note-item"
                >
                  <div class="detail-group-label">Keluhan Kehamilan</div>
                  <div class="detail-note-val">
                    {{ detailData[data.id].obstetri.keluhan_kehamilan }}
                  </div>
                </div>
                <div
                  v-if="detailData[data.id].obstetri?.riwayat_kehamilan"
                  class="detail-note-item"
                >
                  <div class="detail-group-label">Riwayat Kehamilan</div>
                  <div class="detail-note-val">
                    {{ detailData[data.id].obstetri.riwayat_kehamilan }}
                  </div>
                </div>
                <div v-if="detailData[data.id].obstetri?.temuan_usg" class="detail-note-item">
                  <div class="detail-group-label">Temuan USG</div>
                  <div class="detail-note-val">{{ detailData[data.id].obstetri.temuan_usg }}</div>
                </div>
              </div>

              <!-- Riwayat Persalinan -->
              <div
                v-if="detailData[data.id].riwayat_persalinan?.length"
                class="detail-riwayat-block"
              >
                <div class="detail-sub-title">Riwayat Persalinan</div>
                <table class="inner-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tahun</th>
                      <th>UK (mgg)</th>
                      <th>Jenis Persalinan</th>
                      <th>Penolong</th>
                      <th>BB Lahir</th>
                      <th>Kondisi Bayi</th>
                      <th>Komplikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rp in detailData[data.id].riwayat_persalinan" :key="rp.urutan">
                      <td>{{ rp.urutan }}</td>
                      <td>{{ rp.tahun || '—' }}</td>
                      <td>{{ rp.usia_kehamilan || '—' }}</td>
                      <td>{{ rp.jenis_persalinan || '—' }}</td>
                      <td>{{ rp.penolong || '—' }}</td>
                      <td>{{ rp.bb_lahir ? rp.bb_lahir + ' g' : '—' }}</td>
                      <td>
                        <Tag
                          v-if="rp.kondisi_bayi"
                          :value="rp.kondisi_bayi"
                          :severity="rp.kondisi_bayi === 'Hidup' ? 'success' : 'danger'"
                        />
                        <span v-else>—</span>
                      </td>
                      <td>{{ rp.komplikasi || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ══ GINEKOLOGI ══ -->
            <div v-else-if="data.kategori === 'GINEKOLOGI' && detailData[data.id]">
              <div class="detail-section-title">
                <Tag value="GINEKOLOGI" severity="help" /> Detail Pemeriksaan
              </div>

              <!-- Siklus & KB -->
              <div class="detail-grid">
                <div class="detail-group">
                  <div class="detail-group-label">HPHT</div>
                  <div class="detail-val">
                    {{ formatTanggal(detailData[data.id].ginekologi?.hpht) || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Siklus Haid</div>
                  <div class="detail-val">
                    {{
                      detailData[data.id].ginekologi?.siklus_haid != null
                        ? detailData[data.id].ginekologi.siklus_haid + ' hari'
                        : '—'
                    }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Lama Haid</div>
                  <div class="detail-val">
                    {{
                      detailData[data.id].ginekologi?.lama_haid != null
                        ? detailData[data.id].ginekologi.lama_haid + ' hari'
                        : '—'
                    }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Volume Darah</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.volume_darah || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Dismenore</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.dismenore || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Status Haid</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.status_haid || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">KB</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.pakai_kb || '—' }}
                    <span v-if="detailData[data.id].ginekologi?.jenis_kb">
                      · {{ detailData[data.id].ginekologi.jenis_kb }}</span
                    >
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Kondisi Serviks</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.kondisi_serviks || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Sekret Vagina</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.sekret_vagina || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Perdarahan</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.perdarahan || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Pap Smear</div>
                  <div class="detail-val">
                    {{ formatTanggal(detailData[data.id].ginekologi?.pap_smear) || '—' }}
                    <span v-if="detailData[data.id].ginekologi?.hasil_pap_smear">
                      · {{ detailData[data.id].ginekologi.hasil_pap_smear }}</span
                    >
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Ukuran Uterus</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.ukuran_uterus || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Adneksa Kanan / Kiri</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.adneksa_kanan || '—' }} /
                    {{ detailData[data.id].ginekologi?.adneksa_kiri || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">NGS</div>
                  <div class="detail-val">
                    <Tag
                      v-if="detailData[data.id].ginekologi?.ngs"
                      :value="detailData[data.id].ginekologi.ngs"
                      :severity="
                        detailData[data.id].ginekologi.ngs === 'Positif' ? 'danger' : 'success'
                      "
                    />
                    <span v-else>—</span>
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Vaksin HPV</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.vaksin_hpv || '—' }}
                  </div>
                </div>
                <div class="detail-group">
                  <div class="detail-group-label">Rencana Hamil</div>
                  <div class="detail-val">
                    {{ detailData[data.id].ginekologi?.rencana_hamil || '—' }}
                  </div>
                </div>
              </div>

              <!-- Riwayat Penyakit Ginekologi -->
              <div v-if="detailData[data.id].riwayat_penyakit_gine?.length" class="detail-tags-row">
                <span class="detail-tags-label">Riwayat Penyakit:</span>
                <Tag
                  v-for="p in detailData[data.id].riwayat_penyakit_gine"
                  :key="p"
                  :value="p"
                  severity="warn"
                  class="tag-sm"
                />
              </div>

              <!-- Catatan -->
              <div
                class="detail-notes-grid"
                v-if="
                  detailData[data.id].ginekologi?.keluhan_gine ||
                  detailData[data.id].ginekologi?.catatan_bimanual ||
                  detailData[data.id].ginekologi?.riwayat_operasi ||
                  detailData[data.id].ginekologi?.catatan_spekulum
                "
              >
                <div v-if="detailData[data.id].ginekologi?.keluhan_gine" class="detail-note-item">
                  <div class="detail-group-label">Keluhan Utama</div>
                  <div class="detail-note-val">
                    {{ detailData[data.id].ginekologi.keluhan_gine }}
                  </div>
                </div>
                <div
                  v-if="detailData[data.id].ginekologi?.catatan_spekulum"
                  class="detail-note-item"
                >
                  <div class="detail-group-label">Catatan Spekulum</div>
                  <div class="detail-note-val">
                    {{ detailData[data.id].ginekologi.catatan_spekulum }}
                  </div>
                </div>
                <div
                  v-if="detailData[data.id].ginekologi?.catatan_bimanual"
                  class="detail-note-item"
                >
                  <div class="detail-group-label">Catatan Bimanual</div>
                  <div class="detail-note-val">
                    {{ detailData[data.id].ginekologi.catatan_bimanual }}
                  </div>
                </div>
                <div
                  v-if="detailData[data.id].ginekologi?.riwayat_operasi"
                  class="detail-note-item"
                >
                  <div class="detail-group-label">Riwayat Operasi</div>
                  <div class="detail-note-val">
                    {{ detailData[data.id].ginekologi.riwayat_operasi }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tidak ada detail -->
            <div v-else class="expansion-empty">
              <i class="pi pi-info-circle" />
              <span>Detail tidak tersedia untuk kunjungan ini</span>
            </div>
          </div>
        </template>
      </DataTable>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useConfigStore, useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
  datapasien: { type: Object, required: true },
})

const emit = defineEmits(['update:visible'])

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const internalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const loading = ref(false)
const kunjunganList = ref([])
const expandedRows = ref({})
const detailData = ref({}) // { [id_pemeriksaan]: response_detail }
const detailLoading = ref({}) // { [id_pemeriksaan]: boolean }

const jumlahObstetri = computed(
  () => kunjunganList.value.filter((k) => k.kategori === 'OBSTETRI').length,
)
const jumlahGinekologi = computed(
  () => kunjunganList.value.filter((k) => k.kategori === 'GINEKOLOGI').length,
)

const formatTanggal = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

const hitungUK = (hpht, tglPeriksa) => {
  if (!hpht || !tglPeriksa) return null
  const diff = new Date(tglPeriksa) - new Date(hpht)
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
}

const fetchList = async () => {
  const nomr = props.datapasien?.NOMR
  if (!nomr) return
  loading.value = true
  kunjunganList.value = []
  expandedRows.value = {}
  detailData.value = {}
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/obgyn/get_riwayat_kunjungan`, {
      nomr,
      id_client: id_client.value,
    })
    if (res.data?.code === 200 && Array.isArray(res.data?.response)) {
      kunjunganList.value = res.data.response
    }
  } catch (e) {
    console.error('fetchList error:', e)
  } finally {
    loading.value = false
  }
}

const onRowExpand = async ({ data }) => {
  const id = data.id
  if (detailData.value[id]) return // sudah di-cache

  detailLoading.value[id] = true
  try {
    const url = configStore.apiBaseUrl
    const res = await axios.post(`${url}/index.php/api/obgyn/get_pemeriksaan`, {
      no_register: data.no_register,
      id_client: id_client.value,
    })
    if (res.data?.code === 200 && res.data?.response) {
      detailData.value[id] = res.data.response
    }
  } catch (e) {
    console.error('onRowExpand error:', e)
  } finally {
    detailLoading.value[id] = false
  }
}

const onHide = () => {
  expandedRows.value = {}
}

watch(
  () => props.visible,
  (val) => {
    if (val) fetchList()
  },
)
</script>

<style scoped>
/* ── Dialog header ── */
.dlg-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.dlg-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.dlg-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dlg-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: darkcyan;
  flex-shrink: 0;
}

.dlg-header-title {
  font-size: 15px;
  font-weight: 700;
  color: darkcyan;
}

.dlg-header-sub {
  font-size: 11px;
  color: #6b7280;
}

.dlg-header-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  min-width: 60px;
}

.stat-chip.info {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.stat-chip.help {
  background: #faf5ff;
  border-color: #ddd6fe;
}

.stat-val {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-lbl {
  font-size: 10px;
  color: #6b7280;
  white-space: nowrap;
}

/* Patient bar */
.dlg-patient-bar {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.patient-info-item {
  display: flex;
  flex-direction: column;
  padding: 0 12px;
}

.patient-info-lbl {
  font-size: 10px;
  color: #94a3b8;
  white-space: nowrap;
}

.patient-info-val {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

.patient-divider {
  width: 1px;
  height: 28px;
  background: #e2e8f0;
  flex-shrink: 0;
}

/* ── Body ── */
.dlg-body {
  padding: 0;
}

/* ── Table cells ── */
.row-no {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
}

.cell-date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #374151;
}

.cell-date .pi {
  font-size: 11px;
  color: #9ca3af;
}

.cell-mono {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #374151;
}

.cell-user {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6b7280;
}

.cell-user .pi {
  font-size: 11px;
}

/* ── Expansion ── */
.expansion-body {
  padding: 16px 20px;
  background: #f8fafc;
  border-top: 2px solid #e2e8f0;
}

.expansion-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  padding: 12px 0;
}

.expansion-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #9ca3af;
  padding: 12px 0;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

/* Detail grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px 16px;
  margin-bottom: 12px;
}

.detail-group {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 7px 10px;
}

.detail-group-label {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 3px;
}

.detail-val {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

/* GPA badge kecil */
.gpa-badge-sm {
  display: inline-block;
  padding: 2px 10px;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 700;
  color: #1d4ed8;
  letter-spacing: 1px;
}

/* Tags row */
.detail-tags-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-tags-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.tag-sm :deep(.p-tag) {
  font-size: 11px;
  padding: 2px 6px;
}

/* Notes grid */
.detail-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.detail-note-item {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 10px;
}

.detail-note-val {
  font-size: 12px;
  color: #374151;
  white-space: pre-wrap;
  line-height: 1.4;
}

/* Sub title (Riwayat Persalinan) */
.detail-riwayat-block {
  margin-top: 4px;
}

.detail-sub-title {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  padding: 4px 0;
  border-bottom: 1px dashed #cbd5e1;
}

/* Inner table (riwayat persalinan) */
.inner-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.inner-table th {
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 5px 8px;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

.inner-table td {
  padding: 5px 8px;
  border: 1px solid #e2e8f0;
  color: #374151;
  vertical-align: middle;
}

.inner-table tr:nth-child(even) td {
  background: #f8fafc;
}
</style>
