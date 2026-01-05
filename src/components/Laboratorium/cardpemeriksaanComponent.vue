<template>
  <div class="lab-card" :class="{ selected: modelValue === barcode }" @click="selectCard">
    <!-- Status icon -->

    <div class="content">
      <div class="header-row">
        <h4 class="doctor-name">({{ barcode }}) - {{ jenis }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  barcode: {
    type: String,
    required: true,
  },
  waktu: {
    type: String,
    required: true,
  },
  rawat: String,
  jenis: {
    type: String,
    required: true,
  },
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const selectCard = () => {
  emit('update:modelValue', props.barcode)
}
</script>

<style scoped>
.lab-card {
  display: flex;
  border-left: 5px solid orange;
  background: #fffcf5;
  padding: 12px 14px;
  margin-bottom: 2px;
  cursor: pointer;
  transition: 0.25s ease;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.12);
}

.lab-card:hover {
  background: #e8faff;
  transform: translateY(-2px);
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.15);
}

.lab-card.selected {
  background: #dff7ff;
  border-left-color: #007aa4;
  transform: scale(1.01);
  box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.22);
}

.status-icon {
  color: #08a000;
  margin-right: 10px;
  font-size: 20px;
  margin-top: 3px;
}

.content {
  flex: 1;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doctor-name {
  margin: 0;
  font-size: 15px;
  font-weight: bold;
  color: #004c7a;
}

.info p {
  margin: 1px 0;
  font-size: 13px;
  color: #333;
}

.jenis {
  font-weight: bold;
  color: #004c7a;
}

.action-icon {
  font-size: 18px;
  color: #666;
  cursor: pointer;
  transition: 0.2s ease;
}

.action-icon:hover {
  color: #000;
}

.ml-2 {
  margin-left: 8px;
}
</style>
