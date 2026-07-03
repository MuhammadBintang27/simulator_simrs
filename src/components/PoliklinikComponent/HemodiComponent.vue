<template>
  <Toast />

  <!-- I. PENGKAJIAN PRA-HEMODIALISA -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <div class="section-head-left">
          <span class="section-title">I</span>
          <span class="section-title">Pengkajian Pra-Hemodialisa</span>
        </div>
        <div class="section-head-right">
          <Button
            label="Riwayat HD"
            icon="pi pi-history"
            size="small"
            outlined
            severity="info"
            class="btn-riwayat round-button2"
            @click="showHistory = true"
          />
        </div>
      </div>
    </template>

    <!-- Baris 1: Identitas sesi HD -->
    <div class="d-flex align-items-end gap-3">
      <div class="field-wrap" style="width: 90px; flex-shrink: 0">
        <label class="field-label">HD Ke</label>
        <InputNumber v-model="form.hd_ke" class="w-100" :min="1" placeholder="ke-" />
      </div>
      <div class="field-wrap flex-grow-1">
        <label class="field-label">Mulai</label>
        <div class="p-inputgroup hd-datetime">
          <span class="p-inputgroup-addon hd-icon-addon"><i class="pi pi-calendar" /></span>
          <DatePicker v-model="form.tanggal" dateFormat="yy-mm-dd" placeholder="Tanggal" />
          <span class="p-inputgroup-addon hd-icon-mid"><i class="pi pi-clock" /></span>
          <DatePicker v-model="form.jam_mulai" timeOnly hourFormat="24" class="hd-picker-time" />
        </div>
      </div>
      <div class="field-wrap flex-grow-1">
        <label class="field-label">Selesai</label>
        <div class="p-inputgroup hd-datetime">
          <span class="p-inputgroup-addon hd-icon-addon"><i class="pi pi-calendar" /></span>
          <DatePicker
            v-model="form.tanggal_selesai"
            dateFormat="yy-mm-dd"
            placeholder="Tanggal"
            class="hd-picker-date"
          />
          <span class="p-inputgroup-addon hd-icon-mid"><i class="pi pi-clock" /></span>
          <DatePicker
            v-model="form.jam_selesai"
            timeOnly
            hourFormat="24"
            placeholder="00:00"
            class="hd-picker-time"
          />
        </div>
      </div>
    </div>

    <Divider />

    <!-- Baris 2: Berat badan -->
    <div class="field-grid" style="grid-template-columns: repeat(4, 1fr)">
      <div class="field-wrap">
        <label class="field-label">BB Pre (kg) <span class="required">*</span></label>
        <InputNumber
          v-model="form.bb_pre"
          :minFractionDigits="1"
          class="w-100"
          :class="{ 'p-invalid': errors.bb_pre }"
          @input="kalkulasi"
        />
        <small class="err-msg" v-if="errors.bb_pre">{{ errors.bb_pre }}</small>
      </div>
      <div class="field-wrap">
        <label class="field-label">BB Post Lalu (kg)</label>
        <InputNumber
          v-model="form.bb_post_lalu"
          :minFractionDigits="1"
          class="w-100"
          @input="kalkulasi"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">BB Kering (kg) <span class="required">*</span></label>
        <InputNumber
          v-model="form.bb_kering"
          :minFractionDigits="1"
          class="w-100"
          :class="{ 'p-invalid': errors.bb_kering }"
          @input="kalkulasi"
        />
        <small class="err-msg" v-if="errors.bb_kering">{{ errors.bb_kering }}</small>
      </div>
      <div class="field-wrap">
        <label class="field-label">Tinggi Badan (cm)</label>
        <InputNumber v-model="form.tinggi_badan" class="w-100" @input="kalkulasi" />
      </div>
    </div>

    <Divider />

    <!-- KALKULASI CARDS -->
    <div class="field-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 4px">
      <div class="calc-card" :class="calcUF.status">
        <div class="calc-label">UF Goal (L)</div>
        <div class="calc-val">{{ calcUF.value }}</div>
        <div class="calc-sub">{{ calcUF.sub }}</div>
      </div>
      <div class="calc-card" :class="calcIDWG.status">
        <div class="calc-label">IDWG (kg)</div>
        <div class="calc-val">{{ calcIDWG.value }}</div>
        <div class="calc-sub">BB Pre - BB Post Lalu</div>
      </div>
      <div class="calc-card" :class="calcIDWGPct.status">
        <div class="calc-label">IDWG (%)</div>
        <div class="calc-val">{{ calcIDWGPct.value }}</div>
        <div class="calc-sub">{{ calcIDWGPct.sub }}</div>
      </div>
      <div class="calc-card" :class="calcBMI.status">
        <div class="calc-label">IMT (BMI)</div>
        <div class="calc-val">{{ calcBMI.value }}</div>
        <div class="calc-sub">{{ calcBMI.sub }}</div>
      </div>
    </div>

    <Divider />

    <div class="field-grid" style="grid-template-columns: repeat(3, 1fr)">
      <div class="field-wrap">
        <label class="field-label">TD Pre (mmHg)</label>
        <InputText v-model="form.td_pre" class="w-100" placeholder="120/80" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Nadi Pre (x/mnt)</label>
        <InputNumber v-model="form.nadi_pre" class="w-100" placeholder="80" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Suhu Pre (°C)</label>
        <InputNumber
          v-model="form.suhu_pre"
          :minFractionDigits="1"
          class="w-100"
          placeholder="36.5"
        />
      </div>
    </div>

    <Divider />

    <div class="field-wrap">
      <label class="field-label" style="margin-bottom: 6px">Akses Vaskuler</label>
      <div class="radio-group">
        <div v-for="akses in aksesOptions" :key="akses" class="radio-opt">
          <RadioButton v-model="form.akses_vaskuler" :inputId="akses" :value="akses" />
          <label :for="akses" class="mb-0">{{ akses }}</label>
        </div>
      </div>
    </div>

    <div class="field-grid" style="grid-template-columns: 1fr 1fr; margin-top: 10px">
      <div class="field-wrap">
        <label class="field-label">Kondisi Akses</label>
        <Select
          v-model="form.kondisi_akses"
          :options="kondisiAksesOptions"
          placeholder="Pilih kondisi"
          class="w-100"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Keluhan / Kondisi Pre-HD</label>
        <InputText
          v-model="form.keluhan_pre"
          class="w-100"
          placeholder="Sesak, mual, pusing, dll"
        />
      </div>
    </div>
  </Panel>

  <!-- II. INSTRUKSI MEDIS -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <span class="section-title">II</span>
        <span class="section-title">Instruksi Medis (Program Dialisis)</span>
      </div>
    </template>

    <div class="field-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr 1fr">
      <div class="field-wrap">
        <label class="field-label">Durasi (Jam)</label>
        <Select
          v-model="form.durasi"
          :options="['3', '4', '4.5', '5']"
          placeholder="Pilih"
          class="w-100"
          @change="kalkulasi"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Dialisat</label>
        <div class="radio-group" style="margin-top: 6px">
          <div class="radio-opt">
            <RadioButton v-model="form.dialisat" inputId="bikarbonat" value="Bikarbonat" />
            <label for="bikarbonat" class="mb-0">Bikarbonat</label>
          </div>
          <div class="radio-opt">
            <RadioButton v-model="form.dialisat" inputId="asetat" value="Asetat" />
            <label for="asetat" class="mb-0">Asetat</label>
          </div>
        </div>
      </div>
      <div class="field-wrap">
        <label class="field-label">Qb (ml/mnt)</label>
        <InputNumber v-model="form.qb_instruksi" class="w-100" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Qd (ml/mnt)</label>
        <InputNumber v-model="form.qd_instruksi" class="w-100" />
      </div>
      <div class="field-wrap">
        <label class="field-label">UF Rate (ml/jam)</label>
        <InputText :value="calcUFRate" class="w-100 input-auto" readonly />
      </div>
    </div>

    <Divider />

    <div class="field-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr">
      <div class="field-wrap">
        <label class="field-label">Tipe Dialyzer</label>
        <InputText v-model="form.tipe_dialyzer" class="w-100" placeholder="Baru / Reuse ke-X" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Antikoagulan</label>
        <Select
          v-model="form.antikoagulan"
          :options="antikoagulanOptions"
          placeholder="Pilih"
          class="w-100"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Dosis Heparin (UI)</label>
        <InputNumber v-model="form.dosis_heparin" class="w-100" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Konduktivitas (mS/cm)</label>
        <InputNumber v-model="form.konduktivitas" :minFractionDigits="1" class="w-100" />
      </div>
    </div>

    <div style="margin-top: 10px">
      <label class="field-label" style="margin-bottom: 6px">Temperatur Dialisat (°C)</label>
      <div class="radio-group">
        <div v-for="t in ['35.5', '36.0', '36.5', '37.0']" :key="t" class="radio-opt">
          <RadioButton v-model="form.temp_dialisat" :inputId="'temp' + t" :value="t" />
          <label :for="'temp' + t" class="mb-0">{{ t }}°C</label>
        </div>
      </div>
    </div>
  </Panel>

  <!-- III. OBSERVASI INTRA-HD -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <span class="section-title">III</span>
        <span class="section-title">Observasi Intra-Hemodialisa</span>
      </div>
    </template>

    <div class="table-responsive">
      <table class="table table-bordered table-sm text-center">
        <thead class="bg-light">
          <tr>
            <th style="width: 60px">Waktu</th>
            <th>TD (mmHg)</th>
            <th>Nadi</th>
            <th>QB</th>
            <th>UF Rate</th>
            <th>TMP/VP/AP</th>
            <th>SpO2 (%)</th>
            <th>Suhu (°C)</th>
            <th>Keluhan / Tindakan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in form.observasi"
            :key="index"
            :class="{ 'row-pre': row.label === 'Pre', 'row-post': row.label === 'Post' }"
          >
            <td class="align-middle font-weight-bold text-sm">{{ row.label }}</td>
            <td><InputText v-model="row.td" class="tbl-input" /></td>
            <td><InputText v-model="row.nadi" class="tbl-input" /></td>
            <td><InputText v-model="row.qb" class="tbl-input" /></td>
            <td><InputText v-model="row.uf_rate" class="tbl-input" /></td>
            <td><InputText v-model="row.tmp_vp_ap" class="tbl-input" /></td>
            <td><InputText v-model="row.spo2" class="tbl-input" /></td>
            <td><InputText v-model="row.suhu" class="tbl-input" /></td>
            <td><InputText v-model="row.keluhan" class="tbl-input" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>

  <!-- IV. KOMPLIKASI INTRA-HD -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <span class="section-title">IV</span>
        <span class="section-title">Komplikasi Intra-Hemodialisa</span>
      </div>
    </template>

    <label class="field-label" style="margin-bottom: 8px; display: block">
      Tanda / gejala komplikasi yang muncul selama HD:
    </label>
    <div class="komplikasi-grid">
      <div
        v-for="k in komplikasiOptions"
        :key="k"
        class="komplikasi-opt"
        :class="{ checked: form.komplikasi.includes(k) }"
      >
        <Checkbox v-model="form.komplikasi" :inputId="'k-' + k" :value="k" />
        <label :for="'k-' + k" style="cursor: pointer; margin: 0; font-size: 12px">{{ k }}</label>
      </div>
    </div>
    <div style="margin-top: 10px">
      <label class="field-label">Tindakan yang Dilakukan</label>
      <InputText
        v-model="form.tindakan_komplikasi"
        class="w-100 p-inputtext-sm"
        style="margin-top: 4px"
        placeholder="Posisi Trendelenburg, turunkan QB, beri NaCl 0.9% 100ml, dsb"
      />
    </div>
  </Panel>

  <!-- V. KESEIMBANGAN CAIRAN -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <span class="section-title">V</span>
        <span class="section-title">Keseimbangan Cairan</span>
      </div>
    </template>

    <!-- Cairan Masuk -->
    <div class="fluid-section-label">
      <i class="pi pi-arrow-down" style="color: #2196f3; font-size: 13px"></i>
      <span style="color: #1565c0; font-weight: 600; font-size: 12px">CAIRAN MASUK</span>
    </div>
    <div class="field-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 6px">
      <div class="field-wrap">
        <label class="field-label">Infus / NaCl Priming (ml)</label>
        <InputNumber
          v-model="form.cairan_infus"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Obat IV / Flush (ml)</label>
        <InputNumber
          v-model="form.cairan_obat_iv"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Minum Selama HD (ml)</label>
        <InputNumber
          v-model="form.cairan_minum"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Lain-lain Masuk (ml)</label>
        <InputNumber
          v-model="form.cairan_masuk_lain"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
    </div>

    <!-- Total Masuk -->
    <div class="fluid-total-row">
      <span class="fluid-total-label">Total Cairan Masuk</span>
      <span class="fluid-total-val fluid-masuk">{{ calcTotalMasuk }} ml</span>
    </div>

    <Divider />

    <!-- Cairan Keluar -->
    <div class="fluid-section-label">
      <i class="pi pi-arrow-up" style="color: #f44336; font-size: 13px"></i>
      <span style="color: #b71c1c; font-weight: 600; font-size: 12px">CAIRAN KELUAR</span>
    </div>
    <div class="field-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 6px">
      <div class="field-wrap">
        <label class="field-label">UF Aktual / Mesin (ml)</label>
        <InputNumber
          v-model="form.uf_aktual"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Urine Selama HD (ml)</label>
        <InputNumber
          v-model="form.cairan_urine"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Perdarahan / Drainase (ml)</label>
        <InputNumber
          v-model="form.cairan_perdarahan"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Lain-lain Keluar (ml)</label>
        <InputNumber
          v-model="form.cairan_keluar_lain"
          class="w-100"
          placeholder="0"
          @input="kalkulasiCairan"
        />
      </div>
    </div>

    <!-- Total Keluar -->
    <div class="fluid-total-row">
      <span class="fluid-total-label">Total Cairan Keluar</span>
      <span class="fluid-total-val fluid-keluar">{{ calcTotalKeluar }} ml</span>
    </div>

    <Divider />

    <!-- Balance Cards -->
    <div class="field-grid" style="grid-template-columns: repeat(3, 1fr)">
      <div class="calc-card" :class="calcBalance.status">
        <div class="calc-label">Balance Cairan</div>
        <div class="calc-val">{{ calcBalance.value }}</div>
        <div class="calc-sub">{{ calcBalance.sub }}</div>
      </div>
      <div class="calc-card" :class="calcUFAchievement.status">
        <div class="calc-label">Pencapaian UF Aktual</div>
        <div class="calc-val">{{ calcUFAchievement.value }}</div>
        <div class="calc-sub">{{ calcUFAchievement.sub }}</div>
      </div>
      <div class="calc-card" :class="calcNetUF.status">
        <div class="calc-label">Selisih UF vs Target</div>
        <div class="calc-val">{{ calcNetUF.value }}</div>
        <div class="calc-sub">{{ calcNetUF.sub }}</div>
      </div>
    </div>
  </Panel>

  <!-- VI. EVALUASI PASCA-HD -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <span class="section-title">VI</span>
        <span class="section-title">Evaluasi Pasca-Hemodialisa</span>
      </div>
    </template>

    <div class="field-grid" style="grid-template-columns: repeat(4, 1fr)">
      <div class="field-wrap">
        <label class="field-label">BB Post (kg)</label>
        <InputNumber
          v-model="form.bb_post"
          :minFractionDigits="1"
          class="w-100"
          @input="kalkulasiPost"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">TD Post (mmHg)</label>
        <InputText v-model="form.td_post" class="w-100" placeholder="120/80" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Nadi Post (x/mnt)</label>
        <InputNumber v-model="form.nadi_post" class="w-100" />
      </div>
      <div class="field-wrap">
        <label class="field-label">Suhu Post (°C)</label>
        <InputNumber v-model="form.suhu_post" :minFractionDigits="1" class="w-100" />
      </div>
    </div>

    <Divider />

    <!-- KALKULASI POST -->
    <div class="field-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 4px">
      <div class="calc-card" :class="calcCairan.status">
        <div class="calc-label">Cairan Terbuang (L)</div>
        <div class="calc-val">{{ calcCairan.value }}</div>
        <div class="calc-sub">BB Pre - BB Post</div>
      </div>
      <div class="calc-card" :class="calcAdekuasi.status">
        <div class="calc-label">Adekuasi (estimasi)</div>
        <div class="calc-val">{{ calcAdekuasi.value }}</div>
        <div class="calc-sub">Target Kt/V &ge; 1.2</div>
      </div>
      <div class="calc-card" :class="calcHasilUF.status">
        <div class="calc-label">Pencapaian UF Goal</div>
        <div class="calc-val">{{ calcHasilUF.value }}</div>
        <div class="calc-sub">{{ calcHasilUF.sub }}</div>
      </div>
    </div>

    <Divider />

    <div class="field-grid" style="grid-template-columns: 1fr 1fr">
      <div class="field-wrap">
        <label class="field-label">Kondisi Umum Pasien Post-HD</label>
        <Select
          v-model="form.kondisi_post"
          :options="kondisiPostOptions"
          placeholder="Pilih kondisi"
          class="w-100"
        />
      </div>
      <div class="field-wrap">
        <label class="field-label">Masalah Keperawatan / Catatan</label>
        <InputText
          v-model="form.masalah_hd"
          class="w-100"
          placeholder="Kram, mual, hipotensi, dll"
        />
      </div>
    </div>
  </Panel>

  <!-- VII. TANDA TANGAN -->
  <Panel class="section-panel">
    <template #header>
      <div class="section-head-inner">
        <span class="section-title">VII</span>
        <span class="section-title">Verifikasi &amp; Tanda Tangan</span>
      </div>
    </template>

    <div class="field-grid" style="grid-template-columns: 1fr 1fr 1fr">
      <div class="ttd-col">
        <div class="field-label text-center mb-2">Perawat Pelaksana</div>
        <div class="ttd-box">
          <Button
            v-if="form.ttd_perawat == 0"
            @click="call_form_tte((mode = 14))"
            label="TTE"
            class="round-button2"
          />
          <QrcodeVue v-if="form.ttd_perawat == 1" :value="form?.nama_user" :size="50" level="H" />
        </div>
        <strong>{{ form.nama_user }}</strong>
      </div>
      <div class="ttd-col">
        <!-- Kepala Ruangan â€” reserved -->
      </div>
      <div class="ttd-col">
        <div class="field-label text-center mb-2">Dokter Penanggung Jawab</div>
        <div class="ttd-box">
          <Button
            v-if="form.auth == 0"
            @click="call_form_tte((mode = 13))"
            label="TTE"
            class="round-button2"
          />
          <QrcodeVue
            v-if="form.auth == 1"
            :value="props.datapasien?.NAMADOKTER"
            :size="50"
            level="H"
          />
        </div>
        <strong>{{ props.datapasien?.NAMADOKTER }}</strong>
      </div>
    </div>
  </Panel>

  <!-- ACTION BUTTONS -->
  <div class="action-row">
    <Button
      label="Reset Form"
      icon="pi pi-refresh"
      outlined
      severity="secondary"
      class="btn-reset"
      @click="resetForm"
    />

    <Button
      label="Simpan Data Hemodialisa"
      icon="pi pi-save"
      class="btn-save"
      :loading="loading"
      @click="saved_data"
    />
  </div>

  <ttdUser
    v-model:showFormOtorisasi="showTTE"
    :noregister="route.query.noreg"
    :mode="mode_tte"
    @otpVerified="handleOtpSuccess"
  />
  <HDHistoryDialog v-model:visible="showHistory" :datapasien="datapasien" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

import ttdUser from '@/components/TtdDigitalComponent.vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Panel from 'primevue/panel'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import DatePicker from 'primevue/datepicker'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client, user_id } = storeToRefs(authStore)
const toast = useToast()
const confirm = useConfirm()

const loading = ref(false)
const errors = reactive({})
const showHistory = ref(false)
const showTTE = ref(false)

import { useRoute } from 'vue-router'
const route = useRoute()

const props = defineProps({
  datapasien: { type: Object, required: true, validator: (v) => v && typeof v === 'object' },
})

import HDHistoryDialog from '@/views/Poliklinik/HD/HemodiHistoryView.vue'
const handleOtpSuccess = (data) => {
  if (data?.verified == true) {
    Get_data_from_db(props.datapasien?.NOPENDAFTARAN, 2)
  }
}
const mode_tte = ref(0)
const call_form_tte = (mode) => {
  showTTE.value = true
  mode_tte.value = mode // 13 = dokter, 14 = perawat
}

// â”€â”€â”€ OPTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const aksesOptions = ['AV-Fistula', 'CDL', 'Femoral', 'Graft']
const kondisiAksesOptions = [
  'Baik / Paten',
  'Thrill lemah',
  'Kemerahan',
  'Bengkak / Hematoma',
  'Berdarah',
]
const antikoagulanOptions = ['Heparin Rutin', 'Heparin Minimal', 'Tanpa Heparin', 'Citrate']
const kondisiPostOptions = [
  'Baik, sadar penuh',
  'Lemas, masih sadar',
  'Pusing / hipotensi',
  'Dipindahkan ke IGD / HCU',
]
const komplikasiOptions = [
  'Hipotensi',
  'Kram Otot',
  'Mual / Muntah',
  'Pusing / Nyeri Kepala',
  'Reaksi Alergi',
  'Aritmia',
  'Nyeri Dada',
  'Demam / Menggigil',
  'Perdarahan Akses',
  'Blood Loss / Clotting',
  'Disequilibrium',
  'Tidak Ada',
]

const defaultObservasi = () =>
  ['Pre', 'Jam 1', 'Jam 2', 'Jam 3', 'Jam 4', 'Jam 5', 'Post'].map((label) => ({
    label,
    td: '',
    nadi: '',
    qb: '',
    uf_rate: '',
    tmp_vp_ap: '',
    spo2: '',
    suhu: '',
    keluhan: '',
  }))

const form = reactive({
  // Pra-HD
  hd_ke: null,
  tanggal_hd: new Date(),
  jam_mulai: new Date(),
  tanggal_selesai: new Date(),
  jam_selesai: new Date(),
  bb_pre: null,
  bb_post_lalu: null,
  bb_kering: null,
  tinggi_badan: null,
  td_pre: '',
  nadi_pre: null,
  suhu_pre: null,
  akses_vaskuler: '',
  kondisi_akses: null,
  keluhan_pre: '',
  // Instruksi
  durasi: null,
  dialisat: 'Bikarbonat',
  qb_instruksi: null,
  qd_instruksi: null,
  tipe_dialyzer: '',
  antikoagulan: null,
  dosis_heparin: null,
  konduktivitas: null,
  temp_dialisat: '36.0',
  // Observasi
  observasi: defaultObservasi(),
  // Komplikasi
  komplikasi: [],
  tindakan_komplikasi: '',
  // â”€â”€ Keseimbangan Cairan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Cairan Masuk
  cairan_infus: null, // Infus / NaCl priming
  cairan_obat_iv: null, // Obat IV / Flush
  cairan_minum: null, // Minum selama HD
  cairan_masuk_lain: null, // Lain-lain masuk
  // Cairan Keluar
  uf_aktual: null, // UF aktual dari mesin
  cairan_urine: null, // Urine selama HD
  cairan_perdarahan: null, // Perdarahan / drainase
  cairan_keluar_lain: null, // Lain-lain keluar

  // Post-HD
  bb_post: null,
  td_post: '',
  nadi_post: null,
  suhu_post: null,
  kondisi_post: null,
  masalah_hd: '',
  // TTD
  auth: 0,
  ttd_perawat: 0,
  nama_user: '',
  ttd_karu: '',
  ttd_dokter: props.datapasien?.NAMADOKTER,
})
const calcUF = computed(() => {
  if (!form.bb_pre || !form.bb_kering) return { value: '—', status: '', sub: 'BB Pre - BB Kering' }
  const uf = parseFloat((form.bb_pre - form.bb_kering).toFixed(1))
  return {
    value: `${uf} L`,
    status: uf > 4 ? 'danger' : uf > 3 ? 'warn' : '',
    sub: uf > 3 ? 'Perhatikan volume!' : 'BB Pre - BB Kering',
  }
})

const calcIDWG = computed(() => {
  if (!form.bb_pre || !form.bb_post_lalu) return { value: '0', status: '' }
  const idwg = parseFloat((form.bb_pre - form.bb_post_lalu).toFixed(1))
  return { value: `${idwg} kg`, status: idwg > 4 ? 'warn' : '' }
})

const calcIDWGPct = computed(() => {
  if (!form.bb_pre || !form.bb_post_lalu || !form.bb_kering)
    return { value: '0', status: '', sub: 'Terhadap BB kering' }
  const idwg = form.bb_pre - form.bb_post_lalu
  const pct = parseFloat(((idwg / form.bb_kering) * 100).toFixed(1))
  return {
    value: `${pct}%`,
    status: pct > 5 ? 'danger' : pct > 3.5 ? 'warn' : '',
    sub: pct > 5 ? 'IDWG tinggi!' : pct > 3.5 ? 'Perlu perhatian' : 'Terhadap BB kering',
  }
})

const calcBMI = computed(() => {
  if (!form.bb_pre || !form.tinggi_badan) return { value: '0', status: '', sub: 'BB / TB' }
  const tbm = form.tinggi_badan / 100
  const bmi = parseFloat((form.bb_pre / (tbm * tbm)).toFixed(1))
  return {
    value: bmi.toString(),
    status: bmi < 18.5 || bmi > 30 ? 'warn' : '',
    sub: bmi < 18.5 ? 'Underweight' : bmi > 30 ? 'Obesitas' : 'Normal range',
  }
})

const calcUFRate = computed(() => {
  if (!form.bb_pre || !form.bb_kering || !form.durasi) return ''
  const ufGoal = form.bb_pre - form.bb_kering
  const rate = Math.round((ufGoal * 1000) / parseFloat(form.durasi))
  return `${rate} ml/jam`
})

// â”€â”€â”€ KALKULASI KESEIMBANGAN CAIRAN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const calcTotalMasuk = computed(() => {
  return (
    (form.cairan_infus || 0) +
    (form.cairan_obat_iv || 0) +
    (form.cairan_minum || 0) +
    (form.cairan_masuk_lain || 0)
  )
})

const calcTotalKeluar = computed(() => {
  return (
    (form.uf_aktual || 0) +
    (form.cairan_urine || 0) +
    (form.cairan_perdarahan || 0) +
    (form.cairan_keluar_lain || 0)
  )
})

const calcBalance = computed(() => {
  const masuk = calcTotalMasuk.value
  const keluar = calcTotalKeluar.value
  if (masuk === 0 && keluar === 0)
    return { value: '0', status: '', sub: 'Total Masuk - Total Keluar' }
  const bal = masuk - keluar
  const sign = bal > 0 ? '+' : ''
  return {
    value: `${sign}${bal} ml`,
    status: bal > 500 ? 'danger' : bal > 200 ? 'warn' : bal < -200 ? 'warn' : '',
    sub: bal > 200 ? 'Retensi cairan' : bal < -200 ? 'Defisit cairan' : 'Seimbang',
  }
})

const calcUFAchievement = computed(() => {
  if (!form.uf_aktual) return { value: '0', status: '', sub: 'UF Aktual dari mesin' }
  const ufGoalMl = form.bb_pre && form.bb_kering ? (form.bb_pre - form.bb_kering) * 1000 : null
  if (!ufGoalMl) return { value: `${form.uf_aktual} ml`, status: '', sub: 'UF Aktual (no target)' }
  const pct = Math.round((form.uf_aktual / ufGoalMl) * 100)
  return {
    value: `${pct}%`,
    status: pct < 60 ? 'danger' : pct < 80 ? 'warn' : '',
    sub: `${form.uf_aktual} ml dari target ${ufGoalMl.toFixed(0)} ml`,
  }
})

const calcNetUF = computed(() => {
  if (!form.bb_pre || !form.bb_kering || !form.uf_aktual)
    return { value: '0', status: '', sub: 'UF Aktual - UF Goal' }
  const ufGoalMl = (form.bb_pre - form.bb_kering) * 1000
  const diff = form.uf_aktual - ufGoalMl
  const sign = diff > 0 ? '+' : ''
  return {
    value: `${sign}${diff.toFixed(0)} ml`,
    status: Math.abs(diff) > 300 ? 'warn' : '',
    sub: diff > 0 ? 'Melebihi target' : diff < 0 ? 'Di bawah target' : 'Tepat target',
  }
})

const calcCairan = computed(() => {
  if (!form.bb_pre || !form.bb_post) return { value: '0', status: '' }
  const cairan = parseFloat((form.bb_pre - form.bb_post).toFixed(2))
  return { value: `${cairan} L`, status: cairan < 0 ? 'warn' : '' }
})

const calcAdekuasi = computed(() => {
  if (!form.qb_instruksi || !form.durasi || !form.bb_kering) return { value: '0', status: '' }
  const ktv = parseFloat(
    ((0.162 * form.qb_instruksi * parseFloat(form.durasi) * 60) / (form.bb_kering * 1000)).toFixed(
      2,
    ),
  )
  return {
    value: `Kt/V ${ktv}`,
    status: ktv < 1.2 ? 'danger' : ktv < 1.4 ? 'warn' : '',
  }
})

const calcHasilUF = computed(() => {
  if (!form.bb_pre || !form.bb_post || !form.bb_kering)
    return { value: '0', status: '', sub: 'vs Target UF' }
  const cairan = form.bb_pre - form.bb_post
  const ufGoal = form.bb_pre - form.bb_kering
  if (ufGoal <= 0) return { value: '0', status: '', sub: 'vs Target UF' }
  const pct = Math.round((cairan / ufGoal) * 100)
  return {
    value: `${pct}%`,
    status: pct < 60 ? 'danger' : pct < 80 ? 'warn' : '',
    sub: `${cairan.toFixed(2)} L dari target ${ufGoal.toFixed(1)} L`,
  }
})

// Trigger dummy untuk @input compatibility
const kalkulasi = () => {}
const kalkulasiPost = () => {}
const kalkulasiCairan = () => {}

const saved_data = async () => {
  try {
    loading.value = true
    const payload = {
      ...form,
      tanggal: formatDateOnlyForAPI(form.tanggal),
      jam_mulai: formatTimeForAPI(form.jam_mulai),
      tanggal_selesai: formatDateOnlyForAPI(form.tanggal_selesai),
      jam_selesai: formatTimeForAPI(form.jam_selesai),
      client_id: id_client.value,
      created_by: user_id.value,
      dokter_id: props.datapasien?.KDDOKTER,
      nama_pasien: props.datapasien?.NAMAPASIEN,
      noregister: props.datapasien?.NOPENDAFTARAN,
      no_rm: props.datapasien?.NOMR,
      // Kirim summary cairan juga
      total_cairan_masuk: calcTotalMasuk.value,
      total_cairan_keluar: calcTotalKeluar.value,
      balance_cairan: calcTotalMasuk.value - calcTotalKeluar.value,
      cairan_terbuang:
        form.bb_pre && form.bb_post ? parseFloat((form.bb_pre - form.bb_post).toFixed(2)) : null,
      adekuasi:
        form.qb_instruksi && form.durasi && form.bb_kering
          ? parseFloat(
              (
                (0.162 * form.qb_instruksi * parseFloat(form.durasi) * 60) /
                (form.bb_kering * 1000)
              ).toFixed(2),
            )
          : null,
      uf_goal:
        form.bb_pre && form.bb_kering
          ? parseFloat((form.bb_pre - form.bb_kering).toFixed(1))
          : null,
      idwg_kg:
        form.bb_pre && form.bb_post_lalu
          ? parseFloat((form.bb_pre - form.bb_post_lalu).toFixed(1))
          : null,
      idwg_persen:
        form.bb_pre && form.bb_post_lalu && form.bb_kering
          ? parseFloat((((form.bb_pre - form.bb_post_lalu) / form.bb_kering) * 100).toFixed(1))
          : null,
      imt:
        form.bb_pre && form.tinggi_badan
          ? parseFloat((form.bb_pre / Math.pow(form.tinggi_badan / 100, 2)).toFixed(1))
          : null,
    }
    console.log('[HD] payload:', payload)
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/penunjang/simpan_data_hd`, payload)
    console.log('[HD] response:', response.data)
    if (response.data.code == 200) {
      toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: response.data.message,
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: `Perhatian (code: ${response.data.code})`,
        detail: response.data.message ?? JSON.stringify(response.data),
        life: 6000,
      })
    }
  } catch (error) {
    const msg = error?.response?.data?.message ?? error?.message ?? 'Gagal menyimpan data'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 6000 })
    console.error('[HD] error:', error?.response?.data ?? error)
  } finally {
    loading.value = false
  }
}

const Get_data_from_db = async (noregister, mode) => {
  loading.value = true
  try {
    const url = configStore.apiBaseUrl
    const response = await axios.post(
      `${url}/index.php/api/penunjang/get_data_hd/${noregister}/${id_client.value}/${mode}`,
    )
    if (response.data.code == 200) {
      const apiData = response.data.data
      Object.assign(form, apiData)
      const templateObs = defaultObservasi()
      const apiObs = apiData.observasi ?? []
      form.observasi = templateObs.map((def) => {
        const match = apiObs.find((r) => r.label === def.label)
        return match ? { ...def, ...match } : def
      })
      form.komplikasi = apiData.komplikasi || []
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 5000 })
    console.error(error)
  } finally {
    loading.value = false
  }
}

// â”€â”€â”€ RESET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const resetForm = () => {
  confirm.require({
    message: 'Reset semua data form? Tindakan ini tidak dapat dibatalkan.',
    header: 'Konfirmasi Reset',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Ya, Reset',
    rejectLabel: 'Batal',
    acceptSeverity: 'danger',
    accept: () => {
      Object.assign(form, {
        bb_pre: null,
        bb_post_lalu: null,
        bb_kering: null,
        tinggi_badan: null,
        td_pre: '',
        nadi_pre: null,
        suhu_pre: null,
        akses_vaskuler: '',
        kondisi_akses: null,
        keluhan_pre: '',
        durasi: null,
        dialisat: 'Bikarbonat',
        qb_instruksi: null,
        qd_instruksi: null,
        tipe_dialyzer: '',
        antikoagulan: null,
        dosis_heparin: null,
        konduktivitas: null,
        temp_dialisat: '36.0',
        observasi: defaultObservasi(),
        komplikasi: [],
        tindakan_komplikasi: '',
        // Reset keseimbangan cairan
        cairan_infus: null,
        cairan_obat_iv: null,
        cairan_minum: null,
        cairan_masuk_lain: null,
        uf_aktual: null,
        cairan_urine: null,
        cairan_perdarahan: null,
        cairan_keluar_lain: null,
        // Reset post
        bb_post: null,
        td_post: '',
        nadi_post: null,
        suhu_post: null,
        kondisi_post: null,
        masalah_hd: '',
        auth: 0,
        ttd_perawat: 0,
        ttd_karu: '',
        ttd_dokter: '',
      })
      Object.keys(errors).forEach((k) => delete errors[k])
      toast.add({ severity: 'info', summary: 'Reset', detail: 'Form berhasil direset', life: 2000 })
    },
  })
}

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const formatDateOnlyForAPI = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const formatTimeForAPI = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  await Get_data_from_db(props.datapasien?.NOPENDAFTARAN, 2)
})
</script>

<style scoped>
/* â”€â”€ Section Panel â”€â”€ */
.section-panel {
  border-radius: 0 !important;
  border-top: none !important;
  margin-bottom: 0 !important;
}
:deep(.section-panel .p-panel-header) {
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}
:deep(.section-panel .p-panel-content) {
  padding: 14px 16px;
}
.section-head-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}
.section-head-left,
.section-head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e6f1fb;
  color: #0c447c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.section-title {
  font-size: 15px;
  text-transform: uppercase; /* Fixed this line */
  font-weight: 600;
  color: darkcyan;
}

/* â”€â”€ Fields â”€â”€ */
.field-grid {
  display: grid;
  gap: 10px;
}
.field-wrap {
  display: flex;
  flex-direction: column;
}
.field-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}
.required {
  color: #dc3545;
}
/* ── Baris 1 HD datetime ── */
.hd-datetime {
  height: 38px;
}
.hd-icon-addon {
  min-width: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.85rem;
}
.hd-icon-mid {
  min-width: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.85rem;
  border-left: 1px solid var(--p-inputgroup-addon-border-color, #ced4da);
}
.hd-picker-date :deep(input) {
  width: 100%;
  min-width: 110px;
}
.hd-picker-time :deep(input) {
  width: 72px;
  text-align: center;
}
.err-msg {
  font-size: 11px;
  color: #dc3545;
  margin-top: 3px;
}

/* â”€â”€ Calc Cards â”€â”€ */
.calc-card {
  background: #eaf3de;
  border: 0.5px solid #c0dd97;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.calc-card.warn {
  background: #faeeda;
  border-color: #fac775;
}
.calc-card.danger {
  background: #fcebeb;
  border-color: #f7c1c1;
}
.calc-label {
  font-size: 11px;
  font-weight: 600;
  color: #3b6d11;
}
.calc-card.warn .calc-label {
  color: #854f0b;
}
.calc-card.danger .calc-label {
  color: #a32d2d;
}
.calc-val {
  font-size: 20px;
  font-weight: 600;
  color: #27500a;
}
.calc-card.warn .calc-val {
  color: #633806;
}
.calc-card.danger .calc-val {
  color: #791f1f;
}
.calc-sub {
  font-size: 11px;
  color: #639922;
}
.calc-card.warn .calc-sub {
  color: #ba7517;
}
.calc-card.danger .calc-sub {
  color: #993535;
}

/* â”€â”€ Keseimbangan Cairan â”€â”€ */
.fluid-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f8f9fa;
}
.fluid-total-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 6px 10px;
  background: #f1f3f5;
  border-radius: 6px;
  margin-top: 4px;
}
.fluid-total-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
}
.fluid-total-val {
  font-size: 15px;
  font-weight: 700;
  min-width: 90px;
  text-align: right;
}
.fluid-masuk {
  color: #1565c0;
}
.fluid-keluar {
  color: #b71c1c;
}

/* â”€â”€ Radio & Checkbox â”€â”€ */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
}
.radio-opt {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #495057;
}

/* â”€â”€ Komplikasi â”€â”€ */
.komplikasi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.komplikasi-opt {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 0.5px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.komplikasi-opt.checked {
  background: #e6f1fb;
  border-color: #85b7eb;
}

/* â”€â”€ Table â”€â”€ */
.table td,
.table th {
  padding: 0.3rem 0.4rem !important;
  vertical-align: middle;
}
.tbl-input {
  width: 100%;
  min-width: 60px;
  text-align: center;
}
:deep(.tbl-input.p-inputtext) {
  padding: 0.25rem 0.4rem;
  border: none;
  background: transparent;
  text-align: center;
}
:deep(.tbl-input.p-inputtext:focus) {
  background: #fff;
  border: 1px solid #378add;
  border-radius: 4px;
}
.row-pre td {
  background: #edf4fd;
}
.row-post td {
  background: #eaf3de;
}

/* â”€â”€ Input auto (read-only computed) â”€â”€ */
.input-auto {
  background: #f0f7ff !important;
  color: #185fa5 !important;
  font-weight: 600;
}

/* â”€â”€ Tanda Tangan â”€â”€ */
.ttd-col {
  text-align: center;
}
.ttd-box {
  height: 60px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 8px;
}

/* â”€â”€ Action Buttons â”€â”€ */
.action-row {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 10px;
  margin-top: 12px;
}
.btn-save {
  width: 100%;
  justify-content: center;
}
.btn-reset {
  width: 100%;
  justify-content: center;
}

/* â”€â”€ PrimeVue overrides â”€â”€ */
:deep(.p-inputtext-sm) {
  padding: 0.35rem 0.5rem;
  font-size: 13px;
}
:deep(.p-inputnumber) {
  width: 100%;
}
:deep(.p-inputnumber .p-inputtext) {
  width: 100%;
  font-size: 13px;
}
:deep(.p-select) {
  width: 100%;
  font-size: 13px;
}
:deep(.p-datepicker) {
  width: 100%;
}
</style>
