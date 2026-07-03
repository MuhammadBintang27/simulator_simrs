<template>
  <div class="jk-root">
    <!-- ============================= TOPBAR ============================= -->
    <header class="jk-topbar">
      <div class="jk-topbar-brand">
        <div class="jk-topbar-logo">
          <i class="pi pi-comments" />
        </div>
        <div>
          <div class="jk-topbar-title">Jawab Konsultasi</div>
          <div class="jk-topbar-sub">Manajemen Konsultasi Antar Dokter</div>
        </div>
      </div>
      <div class="jk-topbar-stats">
        <div v-if="unreadCount > 0" class="jk-stat-pill danger">
          <i class="pi pi-bell" />
          <span>{{ unreadCount }} Perlu Dijawab</span>
        </div>
        <div v-if="unreadReplyCount > 0" class="jk-stat-pill success">
          <i class="pi pi-reply" />
          <span>{{ unreadReplyCount }} Ada Balasan</span>
        </div>
        <div class="jk-stat-pill">
          <i class="pi pi-list" />
          <span>{{ konsulListDb.length + konsulTerkirimDb.length }} Total</span>
        </div>
      </div>
    </header>

    <!-- ============================= BODY ============================= -->
    <div class="jk-body">
      <!-- ─────── SIDEBAR ─────── -->
      <aside class="jk-sidebar">
        <!-- Search -->
        <div class="jk-sb-search">
          <i class="pi pi-search" />
          <input v-model="searchQuery" placeholder="Cari dokter atau pasien..." />
        </div>

        <!-- Tabs -->
        <div class="jk-sb-tabs">
          <button
            :class="['jk-sb-tab', { active: activeTab === 'masuk' }]"
            @click="activeTab = 'masuk'"
          >
            <i class="pi pi-inbox" />
            Masuk
            <span v-if="unreadCount > 0" class="jk-sb-badge red">{{ unreadCount }}</span>
          </button>
          <button
            :class="['jk-sb-tab', { active: activeTab === 'selesai' }]"
            @click="activeTab = 'selesai'"
          >
            <i class="pi pi-check-circle" />
            Selesai
          </button>
          <button
            :class="['jk-sb-tab', { active: activeTab === 'terkirim' }]"
            @click="activeTab = 'terkirim'"
          >
            <i class="pi pi-send" />
            Terkirim
            <span v-if="unreadReplyCount > 0" class="jk-sb-badge green">{{
              unreadReplyCount
            }}</span>
          </button>
        </div>

        <!-- List -->
        <div class="jk-sb-list">
          <!-- Skeleton -->
          <template v-if="activeTab === 'terkirim' ? isLoadingTerkirim : isLoading">
            <div v-for="n in 4" :key="n" class="jk-ske-item">
              <div class="jk-ske-av" />
              <div class="jk-ske-lines">
                <div class="jk-ske-line" style="width: 70%" />
                <div class="jk-ske-line" style="width: 50%" />
                <div class="jk-ske-line" style="width: 85%" />
              </div>
            </div>
          </template>

          <!-- Empty -->
          <div v-else-if="!filteredKonsul.length" class="jk-sb-empty">
            <i :class="activeTab === 'terkirim' ? 'pi pi-send' : 'pi pi-inbox'" />
            <p>
              {{
                activeTab === 'terkirim'
                  ? 'Belum ada konsultasi yang dikirim'
                  : 'Tidak ada konsultasi'
              }}
            </p>
          </div>

          <!-- Items -->
          <div
            v-for="item in filteredKonsul"
            :key="item.id_konsul"
            :class="[
              'jk-sb-item',
              {
                active: selectedKonsul?.id_konsul === item.id_konsul,
                unread: item.is_read === '0' && activeTab === 'masuk',
                'has-reply': item.isSent && item.jumlahBalasan > 0,
              },
            ]"
            @click="selectKonsul(item)"
          >
            <div class="jk-sb-av" :style="{ background: item.avatarColor }">
              {{ item.initials }}
            </div>
            <div class="jk-sb-info">
              <div class="jk-sb-r1">
                <span
                  :class="[
                    'jk-sb-drname',
                    { bold: item.is_read === '0' || (item.isSent && item.balasanBaru > 0) },
                  ]"
                >
                  <i
                    v-if="item.isSent"
                    class="pi pi-arrow-right"
                    style="font-size: 9px; margin-right: 3px; color: #10b981"
                  />
                  {{ item.dokterPengirim }}
                </span>
                <span class="jk-sb-time">{{ item.waktu }}</span>
              </div>
              <div class="jk-sb-r2">
                <i
                  v-if="item.isUrgent"
                  class="pi pi-bolt"
                  style="color: #ef4444; font-size: 10px; margin-right: 3px"
                />
                <span :class="['jk-sb-dx', { bold: item.is_read === '0' }]">
                  {{ item.subject }}
                </span>
              </div>
              <div class="jk-sb-r3">
                <i class="pi pi-user" style="font-size: 9px; margin-right: 3px" />
                {{ item.pasien.nama }}
              </div>
              <!-- Badge balasan baru untuk tab Terkirim -->
              <div v-if="item.isSent && item.balasanBaru > 0" class="jk-sb-reply-new">
                <i class="pi pi-bell" style="font-size: 9px" />
                {{ item.balasanBaru }} balasan baru
              </div>
              <div v-else-if="item.isSent && item.jumlahBalasan > 0" class="jk-sb-reply-badge">
                <i class="pi pi-reply" style="font-size: 9px" />
                {{ item.jumlahBalasan }} balasan
              </div>
            </div>
            <div v-if="item.is_read === '0' && activeTab === 'masuk'" class="jk-sb-dot" />
          </div>
        </div>
      </aside>

      <!-- ─────── MAIN PANEL ─────── -->
      <main class="jk-main">
        <!-- Empty state -->
        <div v-if="!selectedKonsul" class="jk-empty">
          <div class="jk-empty-circle">
            <i :class="activeTab === 'terkirim' ? 'pi pi-send' : 'pi pi-comments'" />
          </div>
          <h4>
            {{
              activeTab === 'terkirim'
                ? 'Pilih konsultasi yang dikirim'
                : 'Pilih konsultasi untuk dijawab'
            }}
          </h4>
          <p>
            {{
              activeTab === 'terkirim'
                ? 'Lihat status dan balasan dari dokter konsultan'
                : 'Klik salah satu item di sidebar kiri untuk melihat detail dan memberikan jawaban'
            }}
          </p>
        </div>

        <template v-else>
          <!-- ── Patient Banner ── -->
          <div class="jk-patient-banner">
            <div class="jk-pb-left">
              <div class="jk-pb-av" :style="{ background: selectedKonsul.avatarColor }">
                {{ selectedKonsul.initials }}
              </div>
              <div class="jk-pb-meta">
                <div class="jk-pb-name">
                  {{ selectedKonsul.pasien.nama }}
                  <span v-if="selectedKonsul.isSent" class="jk-pb-sent-label">
                    <i class="pi pi-send" /> Terkirim
                  </span>
                </div>
                <div class="jk-pb-chips">
                  <span class="jk-c-info">
                    <i class="pi pi-id-card" /> {{ selectedKonsul.pasien.noRm }}
                  </span>
                  <span class="jk-c-info">
                    <i class="pi pi-file" /> {{ selectedKonsul.pasien.noregister }}
                  </span>
                  <span class="jk-c-info orange">
                    <i class="pi pi-heart" /> {{ selectedKonsul.pasien.diagnosa }}
                  </span>
                </div>
                <div class="jk-pb-flow">
                  <span class="jk-flow-from">
                    {{ selectedKonsul.isSent ? 'Saya' : selectedKonsul.dokterPengirim }}
                  </span>
                  <i class="pi pi-arrow-right" style="font-size: 9px; color: #adb5bd" />
                  <span class="jk-flow-to">{{ selectedKonsul.namaDokterTujuan }}</span>
                  <Tag
                    :value="selectedKonsul.status"
                    :severity="statusSeverity(selectedKonsul.status)"
                    style="font-size: 10px"
                  />
                  <Tag
                    v-if="selectedKonsul.isUrgent"
                    value="⚡ CITO"
                    severity="danger"
                    style="font-size: 10px"
                  />
                </div>
              </div>
            </div>
            <div class="jk-pb-actions">
              <Button
                v-if="!selectedKonsul.isSent"
                icon="pi pi-check"
                label="Tandai Selesai"
                severity="success"
                size="small"
                :disabled="selectedKonsul.selesai === '1'"
                @click="markAsSelesai(selectedKonsul)"
              />
              <Button
                icon="pi pi-print"
                label="Cetak"
                severity="secondary"
                size="small"
                @click="printRekamMedis"
              />
            </div>
          </div>

          <!-- ── SOAP Card ── -->
          <div v-if="selectedKonsul.soapLoaded" class="jk-soap">
            <div class="jk-soap-hd" @click="soapCollapsed = !soapCollapsed">
              <i class="pi pi-file-edit" />
              <span>Permintaan Konsultasi</span>
              <span v-if="selectedKonsul.waktu_jawab_target" class="jk-soap-target">
                <i class="pi pi-clock" /> {{ selectedKonsul.waktu_jawab_target }}
              </span>
              <span class="jk-soap-toggle">
                <i :class="soapCollapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" />
                {{ soapCollapsed ? 'Tampilkan detail' : 'Sembunyikan' }}
              </span>
            </div>
            <div v-show="!soapCollapsed" class="jk-soap-grid">
              <!-- S -->
              <div class="jk-soap-sec">
                <div class="jk-soap-ltr s">S</div>
                <div class="jk-soap-cnt">
                  <div class="jk-soap-lbl">Keluhan Utama</div>
                  <div class="jk-soap-val">{{ selectedKonsul.keluhan || '-' }}</div>
                  <div v-if="selectedKonsul.riwayat_penyakit" class="jk-soap-extra">
                    <b>Riwayat:</b> {{ selectedKonsul.riwayat_penyakit }}
                  </div>
                </div>
              </div>
              <!-- O -->
              <div class="jk-soap-sec">
                <div class="jk-soap-ltr o">O</div>
                <div class="jk-soap-cnt">
                  <div class="jk-soap-lbl">Tanda Vital &amp; Penunjang</div>
                  <div v-if="Object.keys(currentVital).length" class="jk-vitals">
                    <div v-if="currentVital.td" class="jk-vital">
                      <span class="jk-vlbl">TD</span>
                      <span class="jk-vval">{{ currentVital.td }}</span>
                    </div>
                    <div v-if="currentVital.nadi" class="jk-vital">
                      <span class="jk-vlbl">Nadi</span>
                      <span class="jk-vval">{{ currentVital.nadi }}</span>
                    </div>
                    <div v-if="currentVital.suhu" class="jk-vital">
                      <span class="jk-vlbl">Suhu</span>
                      <span class="jk-vval">{{ currentVital.suhu }}</span>
                    </div>
                    <div v-if="currentVital.rr" class="jk-vital">
                      <span class="jk-vlbl">RR</span>
                      <span class="jk-vval">{{ currentVital.rr }}</span>
                    </div>
                    <div v-if="currentVital.spo2" class="jk-vital">
                      <span class="jk-vlbl">SpO₂</span>
                      <span class="jk-vval">{{ currentVital.spo2 }}</span>
                    </div>
                    <div v-if="currentVital.gcs" class="jk-vital">
                      <span class="jk-vlbl">GCS</span>
                      <span class="jk-vval">{{ currentVital.gcs }}</span>
                    </div>
                  </div>
                  <div v-if="penunjangList.length" class="jk-penunjang">
                    <span v-for="p in penunjangList" :key="p" class="jk-ptag">{{ p }}</span>
                  </div>
                  <div
                    v-if="!Object.keys(currentVital).length && !penunjangList.length"
                    class="jk-soap-val"
                  >
                    -
                  </div>
                </div>
              </div>
              <!-- A -->
              <div class="jk-soap-sec">
                <div class="jk-soap-ltr a">A</div>
                <div class="jk-soap-cnt">
                  <div class="jk-soap-lbl">Diagnosis Kerja</div>
                  <div class="jk-soap-val">{{ selectedKonsul.pasien.diagnosa || '-' }}</div>
                </div>
              </div>
              <!-- P -->
              <div class="jk-soap-sec last">
                <div class="jk-soap-ltr p">P</div>
                <div class="jk-soap-cnt">
                  <div class="jk-soap-lbl">Pertanyaan ke Konsultan</div>
                  <div v-if="selectedKonsul.pertanyaan" class="jk-pertanyaan">
                    {{ selectedKonsul.pertanyaan }}
                  </div>
                  <div v-else class="jk-soap-val">-</div>
                  <div v-if="selectedKonsul.terapi_diberikan" class="jk-soap-extra">
                    <b>Terapi diberikan:</b> {{ selectedKonsul.terapi_diberikan }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Thread ── -->
          <div ref="threadContainer" class="jk-thread">
            <div v-if="isLoadingDetail" class="jk-thread-load">
              <i class="pi pi-spin pi-spinner" />
              <span>Memuat detail konsultasi...</span>
            </div>

            <div v-if="!isLoadingDetail && selectedKonsul.soapLoaded" class="jk-thread-divider">
              <span class="jk-thread-divider-line" />
              <span class="jk-thread-divider-label">
                <i class="pi pi-comments" />
                {{
                  displayMessages.length ? `${displayMessages.length} Balasan` : 'Belum ada balasan'
                }}
              </span>
              <span class="jk-thread-divider-line" />
            </div>

            <div
              v-if="!displayMessages.length && !isLoadingDetail && selectedKonsul.soapLoaded"
              class="jk-thread-empty"
            >
              <i class="pi pi-comment" style="font-size: 1.6rem; opacity: 0.3" />
              <span v-if="selectedKonsul.isSent">
                Dokter konsultan belum membalas. Anda akan melihat balasannya di sini.
              </span>
              <span v-else>
                Belum ada balasan. Klik <strong>"Tulis Jawaban"</strong> di bawah untuk menjawab.
              </span>
            </div>

            <div v-for="(msg, i) in displayMessages" :key="i" :class="['jk-msg', { me: msg.isMe }]">
              <div
                class="jk-msg-av"
                :style="{ background: msg.isMe ? '#3b82f6' : selectedKonsul.avatarColor }"
              >
                {{ msg.initials }}
              </div>
              <div class="jk-msg-body">
                <div class="jk-msg-hd">
                  <strong>{{ msg.sender }}</strong>
                  <span>{{ msg.time }}</span>
                </div>
                <div
                  :class="['jk-bubble', { me: msg.isMe }]"
                  v-html="msg.body.replace(/\n/g, '<br>')"
                />
                <div v-if="msg.isMe" class="jk-msg-tick">
                  <i
                    :class="msg.is_read_penerima === '1' ? 'pi pi-check-circle' : 'pi pi-check'"
                    :style="{ color: msg.is_read_penerima === '1' ? '#3b82f6' : '#adb5bd' }"
                  />
                  {{ msg.is_read_penerima === '1' ? 'Dibaca' : 'Terkirim' }}
                </div>
              </div>
            </div>
          </div>

          <!-- ── Reply Panel ── -->
          <div class="jk-reply">
            <!-- Selesai -->
            <div v-if="selectedKonsul.selesai === '1'" class="jk-reply-done">
              <i class="pi pi-lock-open" />
              Konsultasi ini telah diselesaikan
            </div>

            <!-- Trigger (collapsed) -->
            <div v-else-if="!showReplyPanel" class="jk-reply-trigger" @click="openReplyPanel">
              <i class="pi pi-reply" />
              <span>
                {{
                  selectedKonsul.isSent
                    ? 'Tulis pesan tindak lanjut ke konsultan...'
                    : 'Tulis jawaban konsultasi...'
                }}
              </span>
            </div>

            <!-- Form expanded -->
            <div v-else class="jk-reply-expanded">
              <div class="jk-reply-hd">
                <div class="jk-reply-hd-left">
                  <i class="pi pi-reply" />
                  <span>{{ selectedKonsul.isSent ? 'Pesan Tindak Lanjut' : 'Tulis Jawaban' }}</span>
                </div>
                <div class="jk-reply-hd-right">
                  <Select
                    v-if="!selectedKonsul.isSent"
                    v-model="replyStatus"
                    :options="statusOptions"
                    option-label="label"
                    option-value="value"
                    size="small"
                    style="min-width: 170px"
                  />
                  <button class="jk-btn-close" title="Tutup" @click="closeReplyPanel">
                    <i class="pi pi-times" />
                  </button>
                </div>
              </div>

              <div class="jk-reply-fields">
                <Textarea
                  v-if="!selectedKonsul.isSent"
                  v-model="replyTatalaksana"
                  placeholder="Rekomendasi / Tatalaksana (opsional)"
                  :rows="2"
                  class="w-full"
                  auto-resize
                />
                <Textarea
                  v-model="replyText"
                  :placeholder="
                    selectedKonsul.isSent
                      ? 'Tulis pertanyaan lanjutan atau keterangan tambahan...'
                      : 'Tulis jawaban konsultasi Anda secara lengkap...'
                  "
                  :rows="3"
                  class="w-full"
                  auto-resize
                />
              </div>

              <div class="jk-reply-foot">
                <div class="jk-snips">
                  <button
                    class="jk-snip"
                    @click="insertSnippet('Terima kasih atas konsultasinya. ')"
                  >
                    Sapaan
                  </button>
                  <button
                    class="jk-snip"
                    @click="insertSnippet('Kami sarankan untuk dilakukan pemeriksaan ')"
                  >
                    Saran Periksa
                  </button>
                  <button
                    class="jk-snip"
                    @click="
                      insertSnippet(
                        'Setuju dengan diagnosis dan tatalaksana yang telah dilakukan. ',
                      )
                    "
                  >
                    Setuju
                  </button>
                  <button
                    class="jk-snip"
                    @click="insertSnippet('Mohon dipertimbangkan untuk alih rawat ke ')"
                  >
                    Alih Rawat
                  </button>
                </div>
                <div class="jk-reply-submit">
                  <span class="jk-charcount">{{ replyText.length }} karakter</span>
                  <div v-if="!selectedKonsul.isSent" class="jk-ttd">
                    <Checkbox v-model="replyWithTtd" :binary="true" input-id="chkTtd2" />
                    <label for="chkTtd2">TTD Digital</label>
                  </div>
                  <Button
                    :label="selectedKonsul.isSent ? 'Kirim Pesan' : 'Kirim Jawaban'"
                    icon="pi pi-send"
                    size="small"
                    :disabled="!replyText.trim() || isSending"
                    :loading="isSending"
                    loading-icon="pi pi-spinner pi-spin"
                    @click="sendReply"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { kd_dokter, id_client, user_name } = storeToRefs(authStore)
const toast = useToast()

// ===== STATE =====
const isLoading = ref(false)
const isLoadingTerkirim = ref(false)
const isLoadingDetail = ref(false)
const isSending = ref(false)
const activeTab = ref('masuk')
const searchQuery = ref('')
const konsulListDb = ref([])
const konsulTerkirimDb = ref([])
const selectedKonsul = ref(null)
const showReplyPanel = ref(false)
const soapCollapsed = ref(false)
const threadContainer = ref(null)

const replyText = ref('')
const replyTatalaksana = ref('')
const replyStatus = ref('dibalas')
const replyWithTtd = ref(true)

const statusOptions = [
  { label: 'Dibalas', value: 'dibalas' },
  { label: 'Perlu Tindak Lanjut', value: 'perlu_tindak' },
  { label: 'Langsung Selesai', value: 'selesai' },
]

// ===== COMPUTED =====
const unreadCount = computed(
  () =>
    konsulListDb.value.filter((k) => k.is_read === '0' && k.selesai === '0' && k.tab === 'masuk')
      .length,
)

const unreadReplyCount = computed(
  () => konsulTerkirimDb.value.filter((k) => k.balasanBaru > 0).length,
)

const filteredKonsul = computed(() => {
  let list
  if (activeTab.value === 'terkirim') {
    list = konsulTerkirimDb.value
  } else {
    list = konsulListDb.value.filter((k) => k.tab === activeTab.value)
  }
  if (!searchQuery.value) return list
  const q = searchQuery.value.toLowerCase()
  return list.filter(
    (k) =>
      k.dokterPengirim.toLowerCase().includes(q) ||
      k.subject.toLowerCase().includes(q) ||
      k.pasien.nama.toLowerCase().includes(q),
  )
})

const currentVital = computed(() => {
  const str = selectedKonsul.value?.vital_signs
  if (!str) return {}
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
})

const penunjangList = computed(() => {
  const str = selectedKonsul.value?.penunjang || ''
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
})

const displayMessages = computed(() => {
  if (!selectedKonsul.value) return []
  const msgs = selectedKonsul.value.messages || []
  return selectedKonsul.value.soapLoaded ? msgs.slice(1) : msgs
})

// ===== HELPER =====
const extractSpesialis = (nama) => {
  if (!nama) return 'Umum'
  const m = nama.match(/Sp\.\w+/)
  return m ? m[0] : 'Umum'
}

const formatWaktu = (tanggal) => {
  if (!tanggal) return ''
  const now = new Date()
  const tgl = new Date(tanggal)
  const diffH = (now - tgl) / 3600000
  if (diffH < 24) return tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  if (diffH < 48) return 'Kemarin'
  return tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

const formatWaktuLengkap = (tanggal) => {
  if (!tanggal) return ''
  return new Date(tanggal).toLocaleString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getAvatarColor = (id) => {
  const colors = [
    '#dc3545',
    '#6f42c1',
    '#17a2b8',
    '#20c997',
    '#fd7e14',
    '#e83e8c',
    '#007bff',
    '#28a745',
    '#c0392b',
  ]
  return colors[parseInt(id) % colors.length]
}

const statusSeverity = (status) => {
  const map = {
    Baru: 'info',
    Dibaca: 'warn',
    Dibalas: 'success',
    Selesai: 'secondary',
    Menunggu: 'secondary',
  }
  return map[status] || 'info'
}

// ===== MAPPING =====
const toFlag = (val) => String(val ?? '0') === '1'

const mapKonsulItem = (item) => {
  const isRead = toFlag(item.is_read)
  const isUrgent = toFlag(item.is_urgent)
  const isSelesai = toFlag(item.selesai)
  const jumlahBalasan = parseInt(item.jumlah_balasan ?? 0)

  let status = 'Baru'
  if (isSelesai) status = 'Selesai'
  else if (jumlahBalasan > 0) status = 'Dibalas'
  else if (isRead) status = 'Dibaca'

  const initials = item.inisial_dokter_pengirim
    ? String(item.inisial_dokter_pengirim)
    : (item.nama_dokter_pengirim || '??').substring(0, 2).toUpperCase()

  return {
    id_konsul: item.id_konsul,
    noregister: item.noregister,
    dokter_pengirim: item.dokter_pengirim,
    dokter_tujuan: item.dokter_tujuan,
    tanggal_konsul: item.tanggal_konsul,
    is_read: isRead ? '1' : '0',
    is_read_penerima: String(item.is_read_penerima ?? '0'),
    selesai: isSelesai ? '1' : '0',
    id_client: item.id_client,
    isSent: false,
    balasanBaru: 0,

    dokterPengirim: item.nama_dokter_pengirim || '-',
    namaDokterTujuan: item.nama_dokter_tujuan || '-',
    spesialis: extractSpesialis(item.nama_dokter_pengirim),
    subject: item.diagnosa || '(tanpa diagnosa)',
    preview: (item.keluhan || '').substring(0, 80),
    waktu: formatWaktu(item.tanggal_konsul),
    isUrgent,
    jumlahBalasan,
    status,
    tab: isSelesai ? 'selesai' : 'masuk',
    initials,
    avatarColor: getAvatarColor(item.id_konsul),

    pasien: {
      nama: item.nama_pasien || '-',
      noRm: item.no_rm || '-',
      noregister: item.noregister || '-',
      diagnosa: item.diagnosa || '-',
    },

    keluhan: item.keluhan || '',
    riwayat_penyakit: '',
    vital_signs: '',
    penunjang: '',
    pertanyaan: '',
    terapi_diberikan: '',
    waktu_jawab_target: '',
    soapLoaded: false,

    messages: [
      {
        sender: item.nama_dokter_pengirim || '-',
        initials,
        isMe: false,
        isRead,
        is_read_penerima: String(item.is_read_penerima ?? '0'),
        time: formatWaktuLengkap(item.tanggal_konsul),
        body: item.keluhan || '(tidak ada isi pesan)',
      },
    ],
  }
}

// Mapping untuk konsultasi yang DIKIRIM (sebagai pengirim)
const mapKonsulTerkirimItem = (item) => {
  const isUrgent = toFlag(item.is_urgent)
  const isSelesai = toFlag(item.selesai)
  const jumlahBalasan = parseInt(item.jumlah_balasan ?? 0)
  const balasanBaru = parseInt(item.balasan_baru ?? 0)

  let status = 'Menunggu'
  if (isSelesai) status = 'Selesai'
  else if (jumlahBalasan > 0) status = 'Dibalas'

  // Avatar & initials = konsultan (penerima konsul)
  const initials = (item.nama_dokter_tujuan || '??').substring(0, 2).toUpperCase()

  return {
    id_konsul: item.id_konsul,
    noregister: item.noregister,
    dokter_pengirim: item.dokter_pengirim,
    dokter_tujuan: item.dokter_tujuan,
    tanggal_konsul: item.tanggal_konsul,
    is_read: '1',
    selesai: isSelesai ? '1' : '0',
    id_client: item.id_client,
    isSent: true,
    balasanBaru,

    // Sidebar menampilkan nama konsultan sebagai "pihak lain"
    dokterPengirim: item.nama_dokter_tujuan || '-',
    namaDokterTujuan: item.nama_dokter_tujuan || '-',
    dokterPengirimAsli: item.nama_dokter_pengirim || '-',
    spesialis: extractSpesialis(item.nama_dokter_tujuan),
    subject: item.diagnosa || '(tanpa diagnosa)',
    preview: (item.keluhan || '').substring(0, 80),
    waktu: formatWaktu(item.tanggal_konsul),
    isUrgent,
    jumlahBalasan,
    status,
    tab: 'terkirim',
    initials,
    avatarColor: getAvatarColor(item.id_konsul),

    pasien: {
      nama: item.nama_pasien || '-',
      noRm: item.no_rm || '-',
      noregister: item.noregister || '-',
      diagnosa: item.diagnosa || '-',
    },

    // Pesan awal = keluhan yang saya kirim (isMe: true)
    keluhan: item.keluhan || '',
    riwayat_penyakit: '',
    vital_signs: '',
    penunjang: '',
    pertanyaan: '',
    terapi_diberikan: '',
    waktu_jawab_target: '',
    soapLoaded: false,

    messages: [
      {
        sender: item.nama_dokter_pengirim || '-',
        initials: (item.nama_dokter_pengirim || '').substring(0, 2).toUpperCase(),
        isMe: true, // Saya yang mengirim konsul ini
        isRead: true,
        is_read_penerima: '1',
        time: formatWaktuLengkap(item.tanggal_konsul),
        body: item.keluhan || '(tidak ada isi pesan)',
      },
    ],
  }
}

// ===== FETCH =====
const getKonsultasiDokter = async () => {
  isLoading.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/get_data_konsul`,
      { id_client: id_client.value, kd_dokter: kd_dokter.value },
    )
    konsulListDb.value = (res.data.response || []).map(mapKonsulItem)
  } catch (e) {
    console.error('Error fetch konsultasi:', e)
  } finally {
    isLoading.value = false
  }
}

const getKonsulTerkirim = async () => {
  isLoadingTerkirim.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/get_konsul_terkirim`,
      { id_client: id_client.value, kd_dokter: kd_dokter.value },
    )
    konsulTerkirimDb.value = (res.data.response || []).map(mapKonsulTerkirimItem)
  } catch (e) {
    console.error('Error fetch konsul terkirim:', e)
  } finally {
    isLoadingTerkirim.value = false
  }
}

const getDetailKonsul = async (item) => {
  isLoadingDetail.value = true
  try {
    const res = await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/get_details_konsul`,
      { id_client: id_client.value, id_konsul: item.id_konsul, noregister: item.noregister },
    )
    const data = res.data.response
    const headerData = data?.[0] || {}
    const details = headerData.details || []

    if (selectedKonsul.value?.id_konsul === item.id_konsul) {
      selectedKonsul.value.riwayat_penyakit = headerData.riwayat_penyakit || ''
      selectedKonsul.value.vital_signs = headerData.vital_signs || ''
      selectedKonsul.value.penunjang = headerData.penunjang || ''
      selectedKonsul.value.pertanyaan = headerData.pertanyaan || ''
      selectedKonsul.value.terapi_diberikan = headerData.terapi_diberikan || ''
      selectedKonsul.value.waktu_jawab_target = headerData.waktu_jawab_target || ''
      selectedKonsul.value.soapLoaded = true

      selectedKonsul.value.messages = [selectedKonsul.value.messages[0]]
      details.forEach((d) => {
        const namaDokter = d.nama_dokter || ''
        selectedKonsul.value.messages.push({
          detail_id: d.detail_id,
          kode_dokter: d.kode_dokter,
          sender: namaDokter,
          initials: namaDokter.substring(0, 2).toUpperCase() || 'DR',
          // Bandingkan kode_dokter dengan user yang login agar isMe akurat
          // baik dari sisi konsultan maupun dari sisi pengirim
          isMe: d.kode_dokter === kd_dokter.value,
          isRead: toFlag(d.is_read),
          is_read_penerima: String(d.is_read_penerima ?? '0'),
          time: formatWaktuLengkap(d.created_at || item.tanggal_konsul),
          body: d.balasan || '',
        })
      })

      selectedKonsul.value.jumlahBalasan = details.length
      if (details.length > 0 && selectedKonsul.value.status === 'Dibaca') {
        selectedKonsul.value.status = 'Dibalas'
      }

      // Auto-collapse SOAP jika sudah ada balasan agar thread langsung terlihat
      soapCollapsed.value = details.length > 0
      scrollToBottom()

      // Reset badge balasan baru untuk item terkirim yang sudah dibuka
      if (item.isSent) {
        item.balasanBaru = 0
      }
    }
  } catch (e) {
    console.error('Error detail konsul:', e)
  } finally {
    isLoadingDetail.value = false
  }
}

// ===== ACTIONS =====
const selectKonsul = (item) => {
  selectedKonsul.value = null
  showReplyPanel.value = false
  soapCollapsed.value = false
  replyText.value = ''
  nextTick(() => {
    selectedKonsul.value = item
    if (!item.isSent) {
      item.is_read = '1'
      item.isRead = true
      item.messages?.forEach((m) => {
        m.isRead = true
      })
      markAsReadOnServer(item)
    }
    getDetailKonsul(item)
    nextTick(scrollToBottom)
  })
}

const openReplyPanel = () => {
  replyText.value = ''
  replyTatalaksana.value = ''
  replyStatus.value = 'dibalas'
  replyWithTtd.value = true
  showReplyPanel.value = true
}

const closeReplyPanel = () => {
  showReplyPanel.value = false
}

const insertSnippet = (text) => {
  replyText.value += text
}

const sendReply = async () => {
  if (!replyText.value.trim() || !selectedKonsul.value) return
  isSending.value = true

  const pesan = replyText.value
  const tatalaksana = replyTatalaksana.value
  const statusDipilih = selectedKonsul.value.isSent ? 'dibalas' : replyStatus.value
  const withTtd = replyWithTtd.value
  const myInitials = (user_name.value || 'DR').substring(0, 2).toUpperCase()

  const optimisticBody = tatalaksana
    ? `[Tatalaksana]\n${tatalaksana}\n\n[Jawaban]\n${pesan}`
    : pesan

  const optimisticMsg = {
    sender: user_name.value || 'dr. Anda',
    initials: myInitials,
    isMe: true,
    isRead: false,
    is_read_penerima: '0',
    time: formatWaktuLengkap(new Date().toISOString()),
    body: optimisticBody,
  }
  selectedKonsul.value.messages.push(optimisticMsg)
  nextTick(scrollToBottom)

  try {
    await postReplyToServer(selectedKonsul.value, pesan, tatalaksana, statusDipilih, withTtd)

    selectedKonsul.value.status = statusDipilih === 'selesai' ? 'Selesai' : 'Dibalas'
    selectedKonsul.value.preview = pesan.substring(0, 80)

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Pesan berhasil dikirim.',
      life: 3000,
    })
    closeReplyPanel()

    if (!selectedKonsul.value.isSent && statusDipilih === 'selesai') {
      selectedKonsul.value.tab = 'selesai'
      selectedKonsul.value.selesai = '1'
      selectedKonsul.value = null
    }
  } catch (_) {
    const idx = selectedKonsul.value.messages.indexOf(optimisticMsg)
    if (idx !== -1) selectedKonsul.value.messages.splice(idx, 1)
  } finally {
    isSending.value = false
    replyText.value = ''
    replyTatalaksana.value = ''
  }
}

const markAsSelesai = (item) => {
  item.status = 'Selesai'
  item.tab = 'selesai'
  item.selesai = '1'
  selectedKonsul.value = null
  postSelesaiToServer(item)
  toast.add({
    severity: 'success',
    summary: 'Selesai',
    detail: 'Konsultasi ditandai selesai.',
    life: 3000,
  })
}

const scrollToBottom = () => {
  if (threadContainer.value) threadContainer.value.scrollTop = threadContainer.value.scrollHeight
}

const printRekamMedis = () => {
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Fitur cetak sedang dalam pengembangan.',
    life: 3000,
  })
}

// ===== API =====
const markAsReadOnServer = async (konsul) => {
  try {
    await axios.post(`${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/konsultasi_read`, {
      id_client: id_client.value,
      id_konsul: konsul.id_konsul,
    })
  } catch (e) {
    console.error(e)
  }
}

const postReplyToServer = async (konsul, pesan, tatalaksana, statusDipilih, withTtd) => {
  try {
    await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/insert_balasan_konsul`,
      {
        id_client: id_client.value,
        id_konsul: konsul.id_konsul,
        noregister: konsul.noregister,
        kode_dokter: kd_dokter.value,
        nama_dokter: user_name.value,
        tatalaksana,
        balasan: pesan,
        is_me: '1',
        status: statusDipilih,
        with_ttd: withTtd ? '1' : '0',
      },
    )
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: 'Gagal mengirim pesan, periksa koneksi.',
      life: 4000,
    })
    throw e
  }
}

const postSelesaiToServer = async (konsul) => {
  try {
    await axios.post(
      `${configStore.apiBaseUrl}/index.php/api/Konsultasi_dokter/konsultasi_selesai`,
      { id_client: id_client.value, id_konsul: konsul.id_konsul, noregister: konsul.noregister },
    )
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  getKonsultasiDokter()
  getKonsulTerkirim()
})
</script>

<style scoped>
/* ============================================================ ROOT */
.jk-root {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 130px);
  background: #f0f2f5;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.09);
}

/* ============================================================ TOPBAR */
.jk-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 20px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  flex-shrink: 0;
}

.jk-topbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.jk-topbar-logo {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.jk-topbar-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.jk-topbar-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1px;
}

.jk-topbar-stats {
  display: flex;
  gap: 8px;
}

.jk-stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.jk-stat-pill.danger {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.jk-stat-pill.success {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

/* ============================================================ BODY */
.jk-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ============================================================ SIDEBAR */
.jk-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e9ecef;
}

.jk-sb-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.jk-sb-search i {
  color: #adb5bd;
  font-size: 13px;
  flex-shrink: 0;
}

.jk-sb-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #212529;
  width: 100%;
}

.jk-sb-search input::placeholder {
  color: #adb5bd;
}

/* Tabs — 3 tabs */
.jk-sb-tabs {
  display: flex;
  border-bottom: 2px solid #e9ecef;
}

.jk-sb-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 9px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #868e96;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.15s;
}

.jk-sb-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.jk-sb-tab:hover:not(.active) {
  background: #f8f9fa;
  color: #495057;
}

.jk-sb-badge {
  font-size: 9px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 5px;
  color: #fff;
}

.jk-sb-badge.red {
  background: #ef4444;
}
.jk-sb-badge.green {
  background: #10b981;
}

/* List */
.jk-sb-list {
  flex: 1;
  overflow-y: auto;
}

.jk-sb-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
}

.jk-sb-item:hover {
  background: #f8f9fa;
}
.jk-sb-item.unread {
  background: #fffbeb;
}
.jk-sb-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}
.jk-sb-item.has-reply {
  background: #f0fdf4;
}
.jk-sb-item.has-reply.active {
  background: #dcfce7;
  border-left-color: #10b981;
}

.jk-sb-av {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.jk-sb-info {
  flex: 1;
  min-width: 0;
}

.jk-sb-r1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.jk-sb-drname {
  font-size: 13px;
  font-weight: 500;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.jk-sb-drname.bold {
  font-weight: 700;
}

.jk-sb-time {
  font-size: 10px;
  color: #adb5bd;
  flex-shrink: 0;
}

.jk-sb-r2 {
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.jk-sb-dx {
  font-size: 11.5px;
  color: #343a40;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.jk-sb-dx.bold {
  font-weight: 600;
}

.jk-sb-r3 {
  font-size: 10.5px;
  color: #868e96;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.jk-sb-reply-new {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 20px;
  padding: 1px 7px;
  margin-top: 4px;
}

.jk-sb-reply-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 1px 7px;
  margin-top: 4px;
}

.jk-sb-dot {
  width: 7px;
  height: 7px;
  background: #3b82f6;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

/* Skeleton */
.jk-ske-item {
  display: flex;
  gap: 10px;
  padding: 13px 14px;
  border-bottom: 1px solid #f1f3f5;
}

.jk-ske-av {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  flex-shrink: 0;
}

.jk-ske-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
  justify-content: center;
}

.jk-ske-line {
  height: 9px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f1f3f5 25%, #e9ecef 50%, #f1f3f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.jk-sb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #adb5bd;
  gap: 8px;
  font-size: 13px;
  text-align: center;
}

.jk-sb-empty i {
  font-size: 2rem;
  opacity: 0.3;
}

/* ============================================================ MAIN */
.jk-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
  min-width: 0;
}

.jk-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: 40px;
  color: #adb5bd;
}

.jk-empty-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.4rem;
  opacity: 0.35;
}

.jk-empty h4 {
  font-size: 17px;
  font-weight: 700;
  color: #495057;
  margin: 0;
}

.jk-empty p {
  font-size: 13px;
  max-width: 300px;
  margin: 0;
  line-height: 1.65;
}

/* ============================================================ PATIENT BANNER */
.jk-patient-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;
  gap: 12px;
}

.jk-pb-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.jk-pb-av {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.jk-pb-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.jk-pb-sent-label {
  font-size: 10px;
  font-weight: 600;
  color: #065f46;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 20px;
  padding: 2px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.jk-pb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.jk-c-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 9px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  color: #495057;
  white-space: nowrap;
}

.jk-c-info.orange {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #c2410c;
}

.jk-pb-flow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.jk-flow-from {
  font-size: 12px;
  color: #495057;
}
.jk-flow-to {
  font-size: 12px;
  font-weight: 600;
  color: #1d4ed8;
}

.jk-pb-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ============================================================ SOAP CARD */
.jk-soap {
  margin: 10px 12px 0;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.jk-soap-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  user-select: none;
}

.jk-soap-target {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.jk-soap-toggle {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background 0.15s;
}

.jk-soap-hd:hover .jk-soap-toggle {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.jk-soap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.jk-soap-sec {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #e9ecef;
}

.jk-soap-sec:nth-child(odd) {
  border-right: 1px solid #e9ecef;
}
.jk-soap-sec:nth-last-child(-n + 2) {
  border-bottom: none;
}

.jk-soap-ltr {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.jk-soap-ltr.s {
  background: #3b82f6;
}
.jk-soap-ltr.o {
  background: #06b6d4;
}
.jk-soap-ltr.a {
  background: #8b5cf6;
}
.jk-soap-ltr.p {
  background: #10b981;
}

.jk-soap-cnt {
  flex: 1;
  min-width: 0;
}

.jk-soap-lbl {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #adb5bd;
  margin-bottom: 4px;
}

.jk-soap-val {
  font-size: 12.5px;
  color: #343a40;
  line-height: 1.55;
}
.jk-soap-extra {
  font-size: 11.5px;
  color: #495057;
  margin-top: 4px;
}

.jk-vitals {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 6px;
}

.jk-vital {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 3px 8px;
  min-width: 46px;
  text-align: center;
}

.jk-vlbl {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: #adb5bd;
}
.jk-vval {
  font-size: 12px;
  font-weight: 600;
  color: #212529;
}

.jk-penunjang {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.jk-ptag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.jk-pertanyaan {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 0 6px 6px 0;
  padding: 7px 11px;
  font-size: 12.5px;
  color: #1e3a5f;
  line-height: 1.6;
}

/* ============================================================ THREAD */
.jk-thread {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.jk-thread-load {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #3b82f6;
  font-size: 13px;
}

.jk-thread-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 4px;
  flex-shrink: 0;
}

.jk-thread-divider-line {
  flex: 1;
  height: 1px;
  background: #e9ecef;
}

.jk-thread-divider-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #adb5bd;
  white-space: nowrap;
  padding: 3px 10px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 20px;
}

.jk-thread-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 32px;
  color: #adb5bd;
  font-size: 13px;
  text-align: center;
}

.jk-thread-empty strong {
  color: #3b82f6;
}

.jk-msg {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.jk-msg.me {
  flex-direction: row-reverse;
}

.jk-msg-av {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.jk-msg-body {
  max-width: 68%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.jk-msg.me .jk-msg-body {
  align-items: flex-end;
}

.jk-msg-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #868e96;
}

.jk-msg-hd strong {
  font-size: 12px;
  font-weight: 600;
  color: #343a40;
}

.jk-bubble {
  font-size: 13px;
  line-height: 1.7;
  padding: 10px 14px;
  border-radius: 4px 14px 14px 14px;
  background: #fff;
  border: 1px solid #e9ecef;
  color: #212529;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

.jk-bubble.me {
  background: #dbeafe;
  border-color: #bfdbfe;
  border-radius: 14px 4px 14px 14px;
  color: #1e3a5f;
}

.jk-msg-tick {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #adb5bd;
}

/* ============================================================ REPLY PANEL */
.jk-reply {
  flex-shrink: 0;
  border-top: 1px solid #e9ecef;
  background: #fff;
}

.jk-reply-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 12px;
  padding: 12px 16px;
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.jk-reply-trigger:hover {
  border-color: #93c5fd;
  color: #3b82f6;
  background: #f0f9ff;
}

.jk-reply-done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #10b981;
  font-size: 13px;
  font-weight: 600;
}

.jk-reply-expanded {
  display: flex;
  flex-direction: column;
}

.jk-reply-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 14px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.jk-reply-hd-left {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #343a40;
}

.jk-reply-hd-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.jk-btn-close {
  width: 28px;
  height: 28px;
  border: none;
  background: #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  font-size: 11px;
  transition: background 0.15s;
}

.jk-btn-close:hover {
  background: #dee2e6;
}

.jk-reply-fields {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jk-reply-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 14px 12px;
  gap: 10px;
  flex-wrap: wrap;
}

.jk-snips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.jk-snip {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  color: #495057;
  cursor: pointer;
  transition: all 0.15s;
}

.jk-snip:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.jk-reply-submit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.jk-charcount {
  font-size: 11px;
  color: #adb5bd;
  white-space: nowrap;
}

.jk-ttd {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #495057;
  white-space: nowrap;
}

/* ============================================================ ANIMATION */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 900px) {
  .jk-soap-grid {
    grid-template-columns: 1fr;
  }
  .jk-soap-sec:nth-child(odd) {
    border-right: none;
  }
  .jk-soap-sec:nth-last-child(-n + 2) {
    border-bottom: 1px solid #e9ecef;
  }
  .jk-soap-sec:last-child {
    border-bottom: none;
  }
}
</style>
