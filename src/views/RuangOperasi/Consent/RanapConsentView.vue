<template>
  <div class="doc-viewer">
    <!-- ===== TOOLBAR ===== -->
    <div class="doc-toolbar">
      <div class="toolbar-brand">
        <i class="pi pi-file-edit me-2"></i>
        <span>Informed Consent Rawat Inap</span>
      </div>
      <div class="toolbar-actions">
        <Button
          label="Cetak"
          icon="pi pi-print"
          severity="secondary"
          outlined
          size="small"
          @click="window.print()"
        />
      </div>
    </div>

    <!-- ===== PROGRESS STEPPER ===== -->
    <div v-if="!isAllSigned" class="consent-stepper">
      <!-- Step 1 -->
      <div class="cs-step" :class="{ 'cs-done': step1Complete, 'cs-active': !step1Complete }">
        <div class="cs-bubble">
          <i v-if="step1Complete" class="pi pi-check" />
          <span v-else>1</span>
        </div>
        <div class="cs-info">
          <div class="cs-title">Tanda Tangan &amp; Foto</div>
          <div class="cs-sub">{{ step1Complete ? 'Selesai' : 'Menunggu' }}</div>
        </div>
      </div>
      <div class="cs-line" :class="{ 'cs-line--done': step1Complete }"></div>
      <!-- Step 2 -->
      <div
        class="cs-step"
        :class="{
          'cs-done': step2Complete,
          'cs-active': step1Complete && !step2Complete,
          'cs-locked': !step1Complete,
        }"
      >
        <div class="cs-bubble">
          <i v-if="step2Complete" class="pi pi-check" />
          <i v-else-if="!step1Complete" class="pi pi-lock" />
          <span v-else>2</span>
        </div>
        <div class="cs-info">
          <div class="cs-title">Konfirmasi Persetujuan</div>
          <div class="cs-sub">
            {{ step2Complete ? 'Selesai' : !step1Complete ? 'Terkunci' : 'Belum diisi' }}
          </div>
        </div>
      </div>
      <div class="cs-line" :class="{ 'cs-line--done': step2Complete }"></div>
      <!-- Step 3 -->
      <div
        class="cs-step"
        :class="{
          'cs-done': isVerified,
          'cs-active': canSave && !isVerified,
          'cs-locked': !canSave,
        }"
      >
        <div class="cs-bubble">
          <i v-if="isVerified" class="pi pi-check" />
          <i v-else-if="!canSave" class="pi pi-lock" />
          <span v-else>3</span>
        </div>
        <div class="cs-info">
          <div class="cs-title">Verifikasi TTE</div>
          <div class="cs-sub">
            {{ isVerified ? 'Terverifikasi' : !canSave ? 'Terkunci' : 'Siap diverifikasi' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ===== A4 PAPER ===== -->
    <div class="a4-paper">
      <!-- KOP SURAT -->
      <div class="doc-kop">
        <div class="doc-kop-logo">
          <img :src="LINK_LOGO" alt="Logo Rumah Sakit" style="max-width: 60px; max-height: 60px" />
        </div>
        <div class="doc-kop-info">
          <div class="doc-kop-rs">{{ company }}</div>
          <div class="doc-kop-alamat">{{ ALAMAT }}</div>
        </div>
      </div>
      <div class="doc-kop-line"></div>

      <!-- JUDUL -->
      <div class="doc-title-block">
        <h2 class="doc-title">FORMULIR PERSETUJUAN RAWAT INAP</h2>
        <h3 class="doc-subtitle">GENERAL CONSENT</h3>
      </div>

      <!-- IDENTITAS PASIEN -->
      <div class="doc-patient-box" v-if="patientData">
        <div class="doc-patient-row">
          <div class="doc-patient-field">
            <span class="dpf-label">Nama Pasien</span>
            <span class="dpf-value dpf-name">{{ patientData.NAMAPASIEN }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">No. Rekam Medis</span>
            <span class="dpf-value dpf-mono">{{ patientData.NOMR }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Jenis Kelamin / Usia</span>
            <span class="dpf-value">
              {{ patientData.JENISKELAMIN === 'L' ? 'Laki-laki' : 'Perempuan' }},
              {{ patientData.USIA_PASIEN?.tahun }} tahun
            </span>
          </div>
        </div>
        <div class="doc-patient-row">
          <div class="doc-patient-field">
            <span class="dpf-label">Dokter Penanggung Jawab</span>
            <span class="dpf-value">{{ extraForm.dpjp || '-' }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Diagnosis / Keluhan</span>
            <span class="dpf-value">{{ extraForm.diagnosa || '-' }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Cara Pembayaran</span>
            <span class="dpf-value">{{ extraForm.caraBayar || '-' }}</span>
          </div>
        </div>
        <div class="doc-patient-row">
          <div class="doc-patient-field">
            <span class="dpf-label">Tanggal Masuk</span>
            <span class="dpf-value">
              {{
                extraForm.tanggalMasuk
                  ? new Date(extraForm.tanggalMasuk).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'
              }}
            </span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">Asal Poli / Unit</span>
            <span class="dpf-value">{{ patientData.POLI }}</span>
          </div>
          <div class="doc-patient-field">
            <span class="dpf-label">No. SEP</span>
            <span class="dpf-value dpf-mono">{{ patientData.NOSEP || '-' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="doc-patient-loading">
        <i class="pi pi-spin pi-spinner me-2"></i> Memuat data pasien...
      </div>

      <div class="doc-section-line"></div>

      <!-- TEKS PERSETUJUAN -->
      <div class="doc-body">
        <p class="doc-body-intro">
          Yang bertanda tangan di bawah ini, menyatakan dengan sesungguhnya bahwa telah mendapatkan
          penjelasan yang jelas dan lengkap dari
          <strong>{{ extraForm.dpjp || 'Dokter Penanggung Jawab' }}</strong>
          mengenai rencana perawatan rawat inap sehubungan dengan kondisi:
          <strong>{{ extraForm.diagnosa || '...' }}</strong
          >.
        </p>
        <div v-if="consentHtml" class="doc-consent-html" v-html="consentHtml"></div>
        <template v-else>
          <p class="doc-body-sub">Penjelasan yang telah diterima meliputi:</p>
          <ol class="doc-list">
            <li>Diagnosis awal dan alasan medis dilakukannya rawat inap</li>
            <li>Rencana pengobatan, perawatan, dan prosedur yang akan dilakukan</li>
            <li>Hak dan kewajiban pasien selama menjalani perawatan di rumah sakit</li>
            <li>Peraturan dan tata tertib rumah sakit yang wajib ditaati</li>
            <li>Hak untuk menolak tindakan medis dan konsekuensinya</li>
            <li>Perkiraan biaya perawatan sesuai jenis layanan dan cara pembayaran</li>
            <li>Prosedur pengaduan apabila ada ketidakpuasan terhadap pelayanan</li>
          </ol>
        </template>
        <div class="doc-statement">
          <p>
            Pernyataan ini dibuat dengan sadar, tanpa paksaan dari pihak manapun, sebagai bukti
            persetujuan untuk menjalani perawatan medis di rumah sakit ini.
          </p>
        </div>
      </div>

      <div class="doc-section-line"></div>

      <!-- TEMPAT & TANGGAL -->
      <div class="doc-date-row">
        <div class="doc-place-field">
          <span>Dibuat di, </span>
          <strong class="ml-2"> {{ ALAMAT }}</strong>
        </div>
        <div>
          <span
            >Tanggal:&nbsp;<strong>{{ tanggalDisplay }}</strong></span
          >
        </div>
      </div>

      <!-- TANDA TANGAN DI A4 (preview) -->
      <div class="a4-sig-section">
        <div class="a4-sig-inner">
          <div class="a4-sig-cards">
            <div class="a4-sig-row">
              <div v-for="signer in viewSignersWithAuth" :key="signer.id" class="a4-sig-box">
                <div class="a4-sig-photo">
                  <img v-if="signer.photoData" :src="signer.photoData" class="a4-sig-photo-img" />
                  <div v-else class="a4-sig-photo-empty">
                    <i class="pi pi-user" style="font-size: 1.5rem; opacity: 0.3"></i>
                  </div>
                </div>
                <div class="a4-sig-canvas-wrap" :class="{ 'has-signature': signer.signatureData }">
                  <img
                    v-if="signer.signatureData"
                    :src="signer.signatureData"
                    class="a4-sig-canvas-img"
                  />
                  <div v-else class="a4-sig-canvas-empty"></div>
                </div>
                <div class="a4-sig-line-name"></div>
                <div class="a4-sig-name">{{ signer.nama || '( ' + signer.hubungan + ' )' }}</div>
                <div class="a4-sig-role">{{ signer.hubungan }}</div>
              </div>
            </div>
          </div>

          <div class="a4-qr-block">
            <div class="a4-qr-title">Verifikasi TTE</div>
            <div v-if="isVerified" class="a4-qr-code">
              <QrcodeVue :value="qrCodeData" :size="120" level="H" render-as="svg" />
            </div>
            <div v-if="isVerified" class="a4-qr-info">
              <div class="a4-qr-label">
                <i class="pi pi-verified me-1" style="color: #16a34a"></i>Petugas Rumah Sakit
              </div>
              <div class="a4-qr-user">{{ verifName }}</div>
              <div class="a4-qr-time">{{ verifTime }}</div>
            </div>
            <div v-if="!isVerified" class="a4-qr-pending">
              <i class="pi pi-clock me-1"></i>Menunggu verifikasi
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- /A4 Paper -->

    <!-- ===== CONSENT DONE BANNER ===== -->
    <div v-if="isAllSigned" class="consent-done-banner">
      <div class="consent-done-icon"><i class="pi pi-verified"></i></div>
      <div class="consent-done-text">
        <p class="consent-done-title">General Consent Telah Selesai</p>
        <p class="consent-done-sub">
          Semua penandatangan telah menandatangani formulir ini. Dokumen tidak dapat diubah.
        </p>
      </div>
    </div>

    <!-- ===== VIEW-ONLY SIGNATURE (jika sudah selesai) ===== -->
    <div v-if="isAllSigned" class="signature-section-wrapper">
      <div class="sig-section-label sig-section-label--done">
        <i class="pi pi-verified me-2"></i>FOTO &amp; TANDA TANGAN PENANDATANGAN
        <span class="sig-section-hint">Dokumen telah ditandatangani — hanya tampilan</span>
      </div>
      <InformedConsentBase
        ref="baseRef"
        :signer-only="true"
        apiEndpoint="/index.php/api/triaseigd/upload_consent_assets"
        :extraForm="extraForm"
        :confirmations="conf"
        :defaultSigners="defaultSigners"
        :initialAssets="consentAssets"
        @patient-loaded="handlePatientLoaded"
        @saved="onConsentSaved"
      />
    </div>

    <!-- ════════════════════════════════════════════════════════
         STEP PANELS (hanya tampil jika belum selesai)
    ════════════════════════════════════════════════════════ -->
    <template v-if="!isAllSigned">
      <!-- ══════ STEP 1: FOTO & TANDA TANGAN ══════ -->
      <div class="step-panel">
        <div class="step-panel-hdr" :class="{ 'hdr-done': step1Complete }">
          <div class="step-num-badge" :class="{ 'badge-done': step1Complete }">
            <i v-if="step1Complete" class="pi pi-check" /><span v-else>1</span>
          </div>
          <div class="step-hdr-text">
            <span class="step-hdr-title">FOTO &amp; TANDA TANGAN PENANDATANGAN</span>
            <span class="step-hdr-hint">
              {{
                step1Complete
                  ? 'Semua penandatangan telah selesai'
                  : 'Klik area tanda tangan → layar penuh · Klik kamera → ambil foto'
              }}
            </span>
          </div>
        </div>

        <!-- Mini tracker kelengkapan per penandatangan -->
        <div v-if="viewSigners.length > 0" class="signer-tracker">
          <div class="signer-tracker-title">Kelengkapan Penandatangan:</div>
          <div class="signer-tracker-list">
            <div
              v-for="s in viewSigners"
              :key="s.id || s.hubungan"
              class="signer-track-item"
              :class="{ 'track-item-done': s.photoData && s.signatureData }"
            >
              <div class="signer-track-head">
                <i
                  :class="
                    s.photoData && s.signatureData
                      ? 'pi pi-check-circle track-icon-done'
                      : 'pi pi-circle track-icon-pending'
                  "
                ></i>
                <span class="signer-track-name">{{ s.nama || s.hubungan }}</span>
              </div>
              <div class="signer-track-checks">
                <span class="track-check" :class="s.photoData ? 'track-done' : 'track-pending'">
                  <i :class="s.photoData ? 'pi pi-check-circle' : 'pi pi-camera'"></i> Foto
                </span>
                <span class="track-check" :class="s.signatureData ? 'track-done' : 'track-pending'">
                  <i :class="s.signatureData ? 'pi pi-check-circle' : 'pi pi-pencil'"></i> TTD
                </span>
              </div>
            </div>
          </div>
          <div v-if="step1Complete" class="signer-tracker-complete">
            <i class="pi pi-verified me-1"></i>Semua penandatangan telah melengkapi foto &amp; tanda
            tangan
          </div>
        </div>

        <InformedConsentBase
          ref="baseRef"
          :signer-only="true"
          apiEndpoint="/index.php/api/triaseigd/upload_consent_assets"
          :extraForm="extraForm"
          :confirmations="conf"
          :defaultSigners="defaultSigners"
          :initialAssets="consentAssets"
          @patient-loaded="handlePatientLoaded"
          @saved="onConsentSaved"
        />
      </div>

      <!-- ══════ STEP 2: KONFIRMASI PERSETUJUAN ══════ -->
      <div class="step-panel" :class="{ 'step-panel--locked': !step1Complete }">
        <div
          class="step-panel-hdr"
          :class="{ 'hdr-done': step2Complete, 'hdr-locked': !step1Complete }"
        >
          <div
            class="step-num-badge"
            :class="{ 'badge-done': step2Complete, 'badge-locked': !step1Complete }"
          >
            <i v-if="step2Complete" class="pi pi-check" />
            <i v-else-if="!step1Complete" class="pi pi-lock" />
            <span v-else>2</span>
          </div>
          <div class="step-hdr-text">
            <span class="step-hdr-title">KONFIRMASI PERSETUJUAN</span>
            <span class="step-hdr-hint" v-if="!step1Complete"
              >Selesaikan Langkah 1 terlebih dahulu</span
            >
            <span class="step-hdr-hint" v-else-if="!step2Complete"
              >Centang semua pernyataan di bawah ini untuk melanjutkan</span
            >
            <span class="step-hdr-hint" v-else>Semua pernyataan telah disetujui</span>
          </div>
        </div>

        <!-- GATE: step 1 belum selesai -->
        <div v-if="!step1Complete" class="step-gate">
          <div class="gate-icon-wrap"><i class="pi pi-lock gate-lock-icon"></i></div>
          <div class="gate-content">
            <div class="gate-title">Langkah 1 Belum Selesai</div>
            <div class="gate-msg">
              Pastikan semua penandatangan telah membubuhkan <strong>foto</strong> dan
              <strong>tanda tangan</strong> sebelum dapat melanjutkan ke konfirmasi persetujuan.
            </div>
            <div class="gate-progress" v-if="viewSigners.length > 0">
              <div v-for="s in viewSigners" :key="s.id || s.hubungan" class="gate-signer-row">
                <span class="gate-signer-name">{{ s.nama || s.hubungan }}</span>
                <span class="gate-check-pill" :class="{ 'pill-ok': s.photoData }">
                  <i :class="s.photoData ? 'pi pi-check-circle' : 'pi pi-circle'"></i> Foto
                </span>
                <span class="gate-check-pill" :class="{ 'pill-ok': s.signatureData }">
                  <i :class="s.signatureData ? 'pi pi-check-circle' : 'pi pi-circle'"></i> TTD
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- CHECKLIST -->
        <div v-else ref="confirmSectionRef" class="confirm-body">
          <div
            class="confirm-item"
            :class="{ 'confirm-item--checked': conf.mengerti }"
            @click="conf.mengerti = !conf.mengerti"
          >
            <Checkbox v-model="conf.mengerti" :binary="true" inputId="cf1" @click.stop />
            <label for="cf1">
              Saya telah <strong>mengerti dan memahami</strong> seluruh penjelasan yang diberikan
              mengenai rencana perawatan rawat inap
            </label>
          </div>
          <div
            class="confirm-item"
            :class="{ 'confirm-item--checked': conf.bertanya }"
            @click="conf.bertanya = !conf.bertanya"
          >
            <Checkbox v-model="conf.bertanya" :binary="true" inputId="cf2" @click.stop />
            <label for="cf2">
              Saya telah diberikan <strong>kesempatan untuk bertanya</strong> dan seluruh pertanyaan
              saya telah dijawab dengan memuaskan
            </label>
          </div>
          <div
            class="confirm-item"
            :class="{ 'confirm-item--checked': conf.setuju }"
            @click="conf.setuju = !conf.setuju"
          >
            <Checkbox v-model="conf.setuju" :binary="true" inputId="cf3" @click.stop />
            <label for="cf3">
              Saya <strong>menyetujui</strong> untuk menjalani perawatan rawat inap di rumah sakit
              ini dengan segala prosedur yang telah dijelaskan
            </label>
          </div>
          <div class="confirm-status" :class="allConfirmed ? 'status-ok' : 'status-pending'">
            <i :class="allConfirmed ? 'pi pi-verified' : 'pi pi-info-circle'" class="me-1"></i>
            {{
              allConfirmed
                ? 'Semua konfirmasi telah disetujui — lanjutkan ke Langkah 3'
                : `Harap centang semua pernyataan di atas (${Object.values(conf).filter(Boolean).length}/3 disetujui)`
            }}
          </div>
        </div>
      </div>

      <!-- ══════ STEP 3: SIMPAN & VERIFIKASI TTE ══════ -->
      <div class="step-panel" :class="{ 'step-panel--locked': !canSave }">
        <div class="step-panel-hdr" :class="{ 'hdr-done': isVerified, 'hdr-locked': !canSave }">
          <div
            class="step-num-badge"
            :class="{ 'badge-done': isVerified, 'badge-locked': !canSave }"
          >
            <i v-if="isVerified" class="pi pi-check" />
            <i v-else-if="!canSave" class="pi pi-lock" />
            <span v-else>3</span>
          </div>
          <div class="step-hdr-text">
            <span class="step-hdr-title">SIMPAN &amp; VERIFIKASI TTE PETUGAS</span>
            <span class="step-hdr-hint" v-if="!canSave"
              >Selesaikan Langkah 1 dan 2 terlebih dahulu</span
            >
            <span class="step-hdr-hint" v-else-if="isVerified" style="color: #16a34a"
              >Consent telah tersimpan dan diverifikasi petugas</span
            >
            <span class="step-hdr-hint" v-else>Simpan consent lalu lakukan verifikasi TTE</span>
          </div>
        </div>

        <!-- GATE: langkah sebelumnya belum selesai -->
        <div v-if="!canSave" class="step-gate">
          <div class="gate-icon-wrap"><i class="pi pi-lock gate-lock-icon"></i></div>
          <div class="gate-content">
            <div class="gate-title">Langkah 1 &amp; 2 Belum Selesai</div>
            <div class="gate-msg">
              Lengkapi semua langkah sebelumnya untuk dapat menyimpan dan memverifikasi informed
              consent.
            </div>
            <ul class="gate-checklist">
              <li :class="step1Complete ? 'gc-done' : 'gc-pending'">
                <i :class="step1Complete ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                Langkah 1 — Tanda tangan &amp; foto semua penandatangan
              </li>
              <li :class="step2Complete ? 'gc-done' : 'gc-pending'">
                <i :class="step2Complete ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
                Langkah 2 — Konfirmasi persetujuan ({{
                  Object.values(conf).filter(Boolean).length
                }}/3 disetujui)
              </li>
            </ul>
          </div>
        </div>

        <!-- AKTIF: langkah 1 & 2 selesai -->
        <div v-else class="step3-body">
          <!-- Sub-step A: Simpan -->
          <div class="step3-sub">
            <div class="step3-sub-num" :class="{ 'sub-done': savedThisSession }">
              <i v-if="savedThisSession" class="pi pi-check" /><span v-else>A</span>
            </div>
            <div class="step3-sub-content">
              <div class="step3-sub-title">Simpan Formulir Persetujuan</div>
              <div v-if="!savedThisSession" class="step3-sub-hint">
                Tekan tombol di bawah untuk menyimpan data tanda tangan dan foto ke server.
              </div>
              <div v-if="!savedThisSession" class="step3-save-row">
                <Button
                  label="Simpan Informed Consent"
                  icon="pi pi-save"
                  severity="success"
                  :loading="saving"
                  @click="baseRef?.simpanData()"
                />
              </div>
              <div v-else class="step3-saved-badge">
                <i class="pi pi-check-circle me-2"></i>Formulir berhasil disimpan
              </div>
            </div>
          </div>

          <!-- Sub-step B: TTE -->
          <div class="step3-sub" :class="{ 'step3-sub--locked': !savedThisSession }">
            <div
              class="step3-sub-num"
              :class="{ 'sub-done': isVerified, 'sub-locked': !savedThisSession }"
            >
              <i v-if="isVerified" class="pi pi-check" />
              <i v-else-if="!savedThisSession" class="pi pi-lock" />
              <span v-else>B</span>
            </div>
            <div class="step3-sub-content">
              <div class="step3-sub-title">Verifikasi TTE oleh Petugas</div>
              <div v-if="!savedThisSession" class="step3-sub-hint" style="color: #94a3b8">
                Simpan formulir terlebih dahulu untuk mengaktifkan verifikasi TTE.
              </div>
              <template v-else>
                <div v-if="!isVerified" class="tte-awaiting">
                  <i class="pi pi-shield tte-shield-icon"></i>
                  <div>
                    <p class="tte-awaiting-title">Menunggu Verifikasi TTE Petugas</p>
                    <p class="tte-awaiting-hint">
                      Petugas rumah sakit perlu melakukan tanda tangan elektronik untuk
                      menyelesaikan proses persetujuan.
                    </p>
                    <Button
                      label="TTE Petugas"
                      icon="pi pi-sign-in"
                      severity="info"
                      @click="showTteDialog = true"
                    />
                  </div>
                </div>
                <div v-else class="tte-verified">
                  <div class="tte-verified-icon"><i class="pi pi-verified"></i></div>
                  <div>
                    <p class="tte-verified-label">Terverifikasi oleh Petugas</p>
                    <p class="tte-verified-name">{{ verifName }}</p>
                    <p class="tte-verified-time">{{ verifTime }}</p>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- /STEP PANELS -->

    <!-- TTE Dialog -->
    <ttdUser
      v-model:showFormOtorisasi="showTteDialog"
      :noregister="route.params.noreg || route.query.noreg"
      :mode="tteMode"
      link_ttd="ttd_petugas_general_consent"
      @otpVerified="handleTTEVerified"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import InformedConsentBase from '@/components/InformedConsentBase.vue'
import ttdUser from '@/components/TtdDigitalComponent.vue'
import QrcodeVue from 'qrcode.vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'

const configStore = useConfigStore()
const authStore = useAuthStore()
const route = useRoute()
const { id_client, company, LINK_LOGO, ALAMAT } = storeToRefs(authStore)

// ─── State ────────────────────────────────────────────────────────────────────

const consentHtml = ref('')
const consentAssets = ref(null)
const baseRef = ref(null)
const confirmSectionRef = ref(null)
const patientData = ref(null)
const saving = ref(false)
const conf = reactive({ mengerti: false, bertanya: false, setuju: false })
const allConfirmed = computed(() => conf.mengerti && conf.bertanya && conf.setuju)

const showTteDialog = ref(false)
const tte = reactive({ signed: false, username: '', nama: '', timestamp: '' })
const tteMode = ref(8)
const savedThisSession = ref(false)

// ─── Auth dari server ─────────────────────────────────────────────────────────

const serverAuth = computed(() => {
  const s = (consentAssets.value?.signers || []).find((a) => a.is_auth === '1' || a.is_auth === 1)
  return s ?? null
})

const isVerified = computed(() => tte.signed || !!serverAuth.value)

const isAllSigned = computed(() => {
  const list = consentAssets.value?.signers || []
  return list.length > 0 && list.every((s) => s.is_auth === '1' || s.is_auth === 1)
})

const verifName = computed(() => tte.nama || serverAuth.value?.verif_name || '')
const verifTime = computed(() => tte.timestamp || serverAuth.value?.verif_times || '')

const qrCodeData = computed(() =>
  JSON.stringify({
    dokumen: 'Consent Rawat Inap',
    noregister: route.params.noreg || route.query.noreg || '',
    petugas: {
      nama: verifName.value,
      nip: tte.username || serverAuth.value?.verif_by || '',
      waktu: verifTime.value,
    },
    is_auth: isVerified.value,
  }),
)

// ─── Step gates ───────────────────────────────────────────────────────────────

const viewSigners = computed(() => baseRef.value?.signers || [])

const step1Complete = computed(() => {
  if (isAllSigned.value) return true
  const signers = viewSigners.value
  if (signers.length === 0) return false
  return signers.every((s) => s.signatureData && s.photoData)
})

const step2Complete = computed(() => allConfirmed.value)
const canSave = computed(() => step1Complete.value && step2Complete.value)

// ─── Signers dengan data auth ─────────────────────────────────────────────────

const viewSignersWithAuth = computed(() => {
  const assets = consentAssets.value?.signers || []
  return viewSigners.value.map((s) => {
    const asset = assets.find((a) => a.hubungan === s.hubungan) || {}
    return {
      ...s,
      verif_name: asset.verif_name || null,
      is_auth: asset.is_auth === '1' || asset.is_auth === 1,
      verif_times: asset.verif_times || null,
    }
  })
})

// ─── Tanggal display ─────────────────────────────────────────────────────────

const tanggalDisplay = computed(() => {
  const d = extraForm.tanggalMasuk
  if (!d) return '________________________________'
  return new Date(d).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// ─── Form ─────────────────────────────────────────────────────────────────────

const extraForm = reactive({
  dpjp: '',
  diagnosa: '',
  caraBayar: '',
  tanggalMasuk: new Date(),
  tempat: '',
})

const defaultSigners = [{ hubungan: 'Pasien Sendiri', nama: '' }]

// ─── Event Handlers ───────────────────────────────────────────────────────────

const onConsentSaved = () => {
  savedThisSession.value = true
}

const handlePatientLoaded = (d) => {
  patientData.value = d
  const diagnosaTeks = d.DX_CAPTION
    ? String(d.DIAGNOSA_AWAL || '') + ' - ' + d.DX_CAPTION
    : d.DIAGNOSA_AWAL || ''
  extraForm.dpjp = d.NAMADOKTER || ''
  extraForm.diagnosa = diagnosaTeks
  extraForm.caraBayar = d.CARABAYAR || ''
  extraForm.tanggalMasuk = d.MASUKPOLY ? new Date(d.MASUKPOLY) : new Date()
}

const handleTTEVerified = ({ username, verified }) => {
  if (!verified) return
  tte.signed = true
  tte.username = username
  tte.nama = username
  tte.timestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ─── Fetch Data ───────────────────────────────────────────────────────────────

const fetchConsentText = async () => {
  try {
    const { data } = await axios.post(
      configStore.apiBaseUrl + '/index.php/api/resumepulang/get_consent_pasien/',
      { id_client: id_client.value },
    )
    if (data.metadata?.code === '200' && data.response?.length > 0) {
      const found =
        data.response.find(
          (r) =>
            (r.jenis_consent || '').toUpperCase().includes('GENERAL') ||
            (r.jenis_consent || '').toUpperCase().includes('RAWAT'),
        ) || data.response[0]
      consentHtml.value = found?.display || ''
    }
  } catch (err) {
    console.error('[RanapConsent] fetchConsentText error:', err)
  }
}

const fetchConsentAssets = async () => {
  try {
    const noregister = route.params.noreg
    const { data } = await axios.post(
      configStore.apiBaseUrl + '/index.php/api/triaseigd/get_consent_assets/',
      { id_client: id_client.value, noregister: noregister },
    )
    if (data.metadata?.code === '200') {
      consentAssets.value = data.response
    }
  } catch (err) {
    console.error('[RanapConsent] fetchConsentAssets error:', err)
  }
}

onMounted(() => {
  fetchConsentText()
  fetchConsentAssets()
})
</script>

<style scoped>
/* ====== Document Viewer ====== */
.doc-viewer {
  min-height: 100vh;
  background: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 3rem;
}

/* ====== Toolbar ====== */
.doc-toolbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  background: #1e293b;
  color: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  gap: 1rem;
}
.toolbar-brand {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 700;
}
.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

/* ====== Progress Stepper ====== */
.consent-stepper {
  width: 210mm;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 0 0 10px 10px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  gap: 0;
}
.cs-step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
}
.cs-bubble {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: all 0.3s;
  background: #e2e8f0;
  color: #94a3b8;
}
.cs-step.cs-active .cs-bubble {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}
.cs-step.cs-done .cs-bubble {
  background: #16a34a;
  color: #fff;
}
.cs-step.cs-locked .cs-bubble {
  background: #f1f5f9;
  color: #cbd5e1;
}
.cs-info {
  flex: 1;
}
.cs-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
  line-height: 1.2;
}
.cs-step.cs-active .cs-title {
  color: #1d4ed8;
}
.cs-step.cs-done .cs-title {
  color: #15803d;
}
.cs-step.cs-locked .cs-title {
  color: #94a3b8;
}
.cs-sub {
  font-size: 0.68rem;
  color: #94a3b8;
  margin-top: 1px;
}
.cs-step.cs-active .cs-sub {
  color: #3b82f6;
}
.cs-step.cs-done .cs-sub {
  color: #22c55e;
}
.cs-line {
  height: 3px;
  flex: 0 0 32px;
  background: #e2e8f0;
  border-radius: 2px;
  transition: background 0.3s;
}
.cs-line--done {
  background: #16a34a;
}

/* ====== A4 Paper ====== */
.a4-paper {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.18),
    0 1px 4px rgba(0, 0, 0, 0.1);
  margin: 1.5rem auto 0;
  padding: 18mm 20mm 20mm;
  font-family: 'Times New Roman', Times, serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #111;
  position: relative;
}

/* ====== Kop Surat ====== */
.doc-kop {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.doc-kop-logo {
  flex-shrink: 0;
}
.doc-kop-rs {
  font-size: 16pt;
  font-weight: 900;
  text-transform: uppercase;
  color: #1e3a8a;
}
.doc-kop-alamat {
  font-size: 9pt;
  color: #555;
}
.doc-kop-line {
  border-top: 3px double #1e3a8a;
  margin-bottom: 0.75rem;
}

/* ====== Judul ====== */
.doc-title-block {
  text-align: center;
  margin-bottom: 0.85rem;
}
.doc-title {
  font-size: 13pt;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0 0 0.1rem;
  letter-spacing: 0.03em;
}
.doc-subtitle {
  font-size: 11pt;
  font-weight: 700;
  margin: 0;
  text-decoration: underline;
}

/* ====== Identitas Pasien ====== */
.doc-patient-box {
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  background: #fafafa;
}
.doc-patient-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
}
.doc-patient-field {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
}
.dpf-label {
  font-size: 7.5pt;
  font-weight: 700;
  text-transform: uppercase;
  color: #555;
  letter-spacing: 0.04em;
}
.dpf-value {
  font-size: 10pt;
  font-weight: 600;
  color: #111;
  border-bottom: 1px dotted #bbb;
  padding-bottom: 1px;
}
.dpf-name {
  font-size: 12pt;
  font-weight: 900;
}
.dpf-mono {
  font-family: 'Courier New', monospace;
  font-size: 10pt;
}
.doc-patient-loading {
  font-size: 9pt;
  color: #888;
  padding: 0.5rem 0;
  text-align: center;
}

/* ====== Section Line ====== */
.doc-section-line {
  border-top: 1px solid #bbb;
  margin: 0.75rem 0;
}

/* ====== Body ====== */
.doc-body {
  font-size: 10.5pt;
  line-height: 1.65;
  text-align: justify;
}
.doc-body-intro {
  margin-bottom: 0.6rem;
}
.doc-body-sub {
  font-weight: 700;
  margin-bottom: 0.35rem;
}
.doc-list {
  padding-left: 1.5rem;
  margin: 0 0 0.75rem;
}
.doc-list li {
  margin-bottom: 0.2rem;
}
.doc-statement {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-left: 3px solid #1e3a8a;
  background: #f0f4ff;
  font-style: italic;
  font-size: 10pt;
}
.doc-consent-html {
  font-size: 10.5pt;
  line-height: 1.65;
  text-align: justify;
}
.doc-consent-html h4 {
  font-size: 11pt;
  font-weight: 700;
  margin: 0.6rem 0 0.2rem;
}
.doc-consent-html p {
  margin-bottom: 0.4rem;
}

/* ====== Tanggal ====== */
.doc-date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10pt;
  margin: 0.5rem 0 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.doc-place-field {
  display: flex;
  align-items: center;
}

/* ====== Signature Boxes di A4 ====== */
.a4-sig-section {
  margin-top: 0.5rem;
}
.a4-sig-inner {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 1rem 0.5rem 0.5rem;
}
.a4-sig-cards {
  flex: 1 1 0;
}
.a4-qr-block {
  flex: 0 0 170px;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  padding: 0.85rem;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.a4-qr-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e40af;
  text-align: center;
}
.a4-qr-code {
  width: 140px;
  height: 140px;
}
.a4-qr-info {
  text-align: center;
  font-size: 0.72rem;
  color: #334155;
}
.a4-qr-label {
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.a4-qr-user,
.a4-qr-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
.a4-qr-pending {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  margin-top: 0.5rem;
}
.a4-sig-row {
  display: flex;
  gap: 0.5rem;
  justify-content: space-around;
}
.a4-sig-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 120px;
}
.a4-sig-photo {
  width: 80px;
  height: 80px;
  border: 1px solid #aaa;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  margin-bottom: 4px;
}
.a4-sig-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.a4-sig-photo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
}
.a4-sig-canvas-wrap {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: flex-end;
  margin-bottom: 2px;
  transition: height 0.2s ease;
}
.a4-sig-canvas-wrap.has-signature {
  height: 100px;
}
.a4-sig-canvas-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.a4-sig-canvas-empty {
  width: 100%;
  height: 2px;
  background: #444;
  align-self: flex-end;
}
.a4-sig-line-name {
  width: 100%;
  border-top: 2px solid #444;
  margin-bottom: 2px;
}
.a4-sig-name {
  font-size: 9pt;
  text-align: center;
  font-weight: 700;
  word-break: break-word;
}
.a4-sig-role {
  font-size: 10pt;
  text-align: center;
  color: #555;
}

/* ====== Consent Done Banner ====== */
.consent-done-banner {
  width: 210mm;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1.5px solid #86efac;
  border-left: 5px solid #16a34a;
  border-radius: 0 8px 8px 0;
  margin: 1rem auto 0;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.1);
}
.consent-done-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}
.consent-done-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #14532d;
  margin: 0 0 0.15rem;
}
.consent-done-sub {
  font-size: 0.78rem;
  color: #15803d;
  margin: 0;
  line-height: 1.4;
}

/* ====== View-only Signature Wrapper ====== */
.signature-section-wrapper {
  width: 210mm;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  margin: 1rem auto 2rem;
  border-radius: 4px;
  overflow: hidden;
}
.sig-section-label {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.sig-section-hint {
  font-size: 0.72rem;
  font-weight: 400;
  opacity: 0.7;
}
.sig-section-label--done {
  background: linear-gradient(135deg, #14532d 0%, #16a34a 100%);
}

/* ====== Step Panels ====== */
.step-panel {
  width: 210mm;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 1rem auto 0;
  overflow: hidden;
  transition: opacity 0.2s;
}
.step-panel--locked {
  opacity: 0.85;
}

/* Panel Header */
.step-panel-hdr {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: #1e293b;
  color: #f1f5f9;
}
.step-panel-hdr.hdr-done {
  background: linear-gradient(135deg, #14532d 0%, #16a34a 100%);
}
.step-panel-hdr.hdr-locked {
  background: #64748b;
}

.step-num-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}
.step-num-badge.badge-done {
  background: #fff;
  color: #16a34a;
}
.step-num-badge.badge-locked {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
}

.step-hdr-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.step-hdr-title {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.step-hdr-hint {
  font-size: 0.7rem;
  opacity: 0.75;
  font-weight: 400;
}

/* ====== Signer Tracker (Step 1) ====== */
.signer-tracker {
  padding: 0.75rem 1rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.signer-tracker-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
}
.signer-tracker-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}
.signer-track-item {
  flex: 1;
  min-width: 160px;
  padding: 0.5rem 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  transition: all 0.2s;
}
.signer-track-item.track-item-done {
  border-color: #bbf7d0;
  background: #f0fdf4;
}
.signer-track-head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
}
.track-icon-done {
  color: #16a34a;
  font-size: 0.9rem;
}
.track-icon-pending {
  color: #cbd5e1;
  font-size: 0.9rem;
}
.signer-track-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #374151;
}
.signer-track-checks {
  display: flex;
  gap: 0.4rem;
}
.track-check {
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: 600;
}
.track-done {
  background: #dcfce7;
  color: #15803d;
}
.track-pending {
  background: #f1f5f9;
  color: #94a3b8;
}
.signer-tracker-complete {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.6rem;
  background: #f0fdf4;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #16a34a;
  margin-bottom: 0.5rem;
}

/* ====== Gate Overlay ====== */
.step-gate {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.gate-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.gate-lock-icon {
  font-size: 1.2rem;
  color: #94a3b8;
}
.gate-content {
  flex: 1;
}
.gate-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.3rem;
}
.gate-msg {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

/* Gate progress (signers) */
.gate-progress {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.gate-signer-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}
.gate-signer-name {
  flex: 1;
  font-weight: 600;
  color: #374151;
}
.gate-check-pill {
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}
.gate-check-pill.pill-ok {
  background: #dcfce7;
  color: #15803d;
}

/* Gate checklist (step 3) */
.gate-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.gate-checklist li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
}
.gc-done {
  background: #f0fdf4;
  color: #15803d;
}
.gc-pending {
  background: #fef3c7;
  color: #92400e;
}

/* ====== Confirm Body (Step 2 aktif) ====== */
.confirm-body {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.confirm-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.83rem;
  color: #374151;
}
.confirm-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}
.confirm-item--checked {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.confirm-item label {
  cursor: pointer;
  flex: 1;
  line-height: 1.4;
}
.confirm-status {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 0.25rem;
}
.status-ok {
  background: #dcfce7;
  color: #15803d;
}
.status-pending {
  background: #fef3c7;
  color: #92400e;
}

/* ====== Step 3 Body ====== */
.step3-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.step3-sub {
  display: flex;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px dashed #e2e8f0;
  align-items: flex-start;
}
.step3-sub:last-child {
  border-bottom: none;
}
.step3-sub--locked {
  opacity: 0.6;
  pointer-events: none;
}

.step3-sub-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}
.step3-sub-num.sub-done {
  background: #16a34a;
}
.step3-sub-num.sub-locked {
  background: #cbd5e1;
}

.step3-sub-content {
  flex: 1;
}
.step3-sub-title {
  font-size: 0.83rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.3rem;
}
.step3-sub-hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.6rem;
}

.step3-save-row {
  margin-top: 0.5rem;
}

.step3-saved-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  background: #dcfce7;
  color: #15803d;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 700;
  margin-top: 0.25rem;
}

/* ====== TTE Section ====== */
.tte-awaiting {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  margin-top: 0.25rem;
}
.tte-shield-icon {
  font-size: 1.6rem;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 2px;
}
.tte-awaiting-title {
  font-size: 0.83rem;
  font-weight: 700;
  color: #92400e;
  margin: 0 0 0.2rem;
}
.tte-awaiting-hint {
  font-size: 0.75rem;
  color: #78350f;
  margin: 0 0 0.6rem;
  line-height: 1.4;
}

.tte-verified {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  margin-top: 0.25rem;
}
.tte-verified-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}
.tte-verified-label {
  font-size: 0.68rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.04em;
  margin: 0;
}
.tte-verified-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: #14532d;
  margin: 0.1rem 0;
}
.tte-verified-time {
  font-size: 0.72rem;
  color: #166534;
  margin: 0;
}

/* ====== Print ====== */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }
  html,
  body {
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    overflow: visible !important;
  }
  .main-sidebar,
  .main-header,
  .content-header,
  .main-footer,
  .doc-toolbar,
  .consent-stepper,
  .step-panel,
  .signature-section-wrapper,
  .p-dialog,
  .p-dialog-mask,
  .p-toast,
  .p-overlay {
    display: none !important;
  }
  .content-wrapper,
  .wrapper,
  #app {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    width: 100% !important;
    float: none !important;
  }
  .doc-viewer {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }
  .a4-paper {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    min-height: auto !important;
    font-size: 10pt !important;
    page-break-inside: avoid;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .a4-sig-canvas-img,
  .a4-sig-photo-img {
    display: block !important;
  }
}

@page {
  size: A4;
  margin: 0;
}
</style>
