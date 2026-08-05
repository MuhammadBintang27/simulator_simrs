<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  dxList:     { type: Array,   default: () => [] },
  genderOpts: { type: Array,   default: () => [] },
  hideName:   { type: Boolean, default: false },
  uid:        { type: String,  default: () => Math.random().toString(36).slice(2, 8) },
})
const emit = defineEmits(['update:modelValue'])

const set = (field, val) => emit('update:modelValue', { ...props.modelValue, [field]: val })

const nama      = computed({ get: () => props.modelValue.nama,      set: v => set('nama', v) })
const gender    = computed({ get: () => props.modelValue.gender,    set: v => set('gender', v) })
const usia      = computed({ get: () => props.modelValue.usia,      set: v => set('usia', v) })
const meninggal = computed({ get: () => props.modelValue.meninggal, set: v => set('meninggal', v) })
const diagnosa  = computed({ get: () => props.modelValue.diagnosa,  set: v => set('diagnosa', v) })
</script>

<template>
  <div class="row g-3">

    <!-- Nama -->
    <div v-if="!hideName" class="col-md-4">
      <div class="fl-label">Nama <span class="fl-hint">opsional</span></div>
      <InputText v-model="nama" placeholder="—" style="width:100%" />
    </div>

    <!-- Kelamin -->
    <div :class="hideName ? 'col-md-5' : 'col-md-3'">
      <div class="fl-label">Kelamin</div>
      <Select v-model="gender" :options="genderOpts" option-label="label" option-value="value"
        style="width:100%" />
    </div>

    <!-- Usia -->
    <div :class="hideName ? 'col-md-3' : 'col-md-2'">
      <div class="fl-label">Usia <span class="fl-hint">th</span></div>
      <InputNumber v-model="usia" :min="0" :max="120" placeholder="—" fluid />
    </div>

    <!-- Meninggal — spacer label agar sejajar dengan field lain -->
    <div :class="hideName ? 'col-md-4' : 'col-md-3'" class="d-flex flex-column">
      <div class="fl-label-spacer"></div>
      <div class="meninggal-wrap">
        <Checkbox v-model="meninggal" :binary="true" :inputId="`mg_${uid}`" />
        <label :for="`mg_${uid}`" class="meninggal-label">Meninggal</label>
      </div>
    </div>

    <!-- Diagnosa -->
    <div class="col-md-12">
      <div class="fl-label">
        Diagnosa Jiwa <span class="fl-hint">ICD-10 — bisa lebih dari satu</span>
      </div>
      <MultiSelect v-model="diagnosa" :options="dxList" option-label="label" option-value="code"
        placeholder="— Tidak ada diagnosa —" display="chip" style="width:100%"
        filter filter-placeholder="Cari diagnosa..." />
    </div>

  </div>
</template>

<style scoped>
.fl-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  white-space: nowrap;
}
.fl-hint {
  font-size: 10px;
  font-weight: 400;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
}

/* Spacer setinggi fl-label + margin-bottom agar Meninggal sejajar dengan input */
.fl-label-spacer {
  height: 29px; /* 11px font + 12px line-height + 6px margin-bottom */
}

.meninggal-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px; /* sama tinggi dengan input field */
}
.meninggal-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
</style>
