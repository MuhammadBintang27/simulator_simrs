<template>
  <Panel>
    <template #header>
      <h5><strong>FORMULIR ANASTESI</strong></h5>
    </template>
    <!-- Table Monitoring -->
    <div class="table-responsive">
      <table class="table table-bordered table-sm excel-table">
        <thead>
          <tr>
            <th class="align-middle" style="min-width: 120px">Kondisi \ Waktu</th>
            <!-- 3 Jam -->
            <th colspan="12" class="text-center">1 Jam Pertama</th>
            <th colspan="12" class="text-center">1 Jam Kedua</th>
            <th colspan="12" class="text-center">1 Jam Ketiga</th>
          </tr>
          <tr>
            <th></th>
            <template v-for="hour in 3" :key="`hour-${hour}`">
              <th v-for="minute in 12" :key="`${hour}-${minute}`" class="text-center">
                {{ (minute - 1) * 5 }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <!-- Kondisi Pasien -->
          <tr v-for="kondisi in masterData" :key="kondisi.id">
            <td class="text-start fw-bold"><i :class="kondisi.icon"></i> {{ kondisi.name }}</td>
            <!-- :placeholder="getPlaceholder(kondisi.type)" -->
            <td
              v-for="timeSlot in timeSlots"
              :key="`${kondisi.id}-${timeSlot.id}`"
              style="border-left: 3px solid red"
            >
              <!-- Checkbox untuk time fields -->
              <input
                v-if="kondisi.type === 'time'"
                type="checkbox"
                :checked="
                  kondisi.values[timeSlot.id] === 'true' || kondisi.values[timeSlot.id] === true
                "
                @change="updateCheckboxValue(kondisi.id, timeSlot.id, $event.target.checked)"
                @focus="setActiveCell(kondisi.id, timeSlot.id)"
                @blur="clearActiveCell"
                @keydown="handleKeyNavigation($event, kondisi.id, timeSlot.id)"
                :ref="(el) => setCellRef(el, kondisi.id, timeSlot.id)"
                class="cell-checkbox"
                tabindex="0"
              />
              <!-- Input text untuk fields lainnya -->
              <InputText
                v-else
                v-model="kondisi.values[timeSlot.id]"
                class="cell-input p-inputtext-sm"
                placeholder=""
                @input="updateValue(kondisi.id, timeSlot.id, $event.target.value)"
                @focus="setActiveCell(kondisi.id, timeSlot.id)"
                @blur="clearActiveCell"
                @keydown="handleKeyNavigation($event, kondisi.id, timeSlot.id)"
                :ref="(el) => setCellRef(el, kondisi.id, timeSlot.id)"
                tabindex="0"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Debug Panel (Optional - untuk melihat data JSON) -->
    <div class="mt-3" v-if="showDebug">
      <h5>Data JSON:</h5>
      <pre class="bg-light p-3 rounded">{{ JSON.stringify(getFormattedData(), null, 2) }}</pre>
    </div>

    <!-- Toggle Debug Button -->
    <div class="mt-2">
      <button @click="showDebug = !showDebug" class="btn btn-sm btn-outline-info">
        {{ showDebug ? 'Hide' : 'Show' }} JSON Data
      </button>
      <button @click="exportData" class="btn btn-sm btn-outline-success ms-2">Export JSON</button>
      <button @click="clearData" class="btn btn-sm btn-outline-warning ms-2">Clear All Data</button>
    </div>
  </Panel>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import InputText from 'primevue/inputtext'

// Master Data - Struktur kondisi dengan metadata
const masterData = reactive([
  {
    id: 'im',
    name: 'i.m',
    type: 'medication',
    unit: 'ml',
    values: {},
    icon: 'fa-solid fa-arraw-down',
  }, // icon font awesome },
  {
    id: 'iv',
    name: 'i.v',
    type: 'medication',
    unit: 'ml',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  { id: 'nadi', name: 'Nadi', type: 'vital', unit: 'bpm', values: {}, icon: 'fa-solid fa-circle' },
  { id: 'suhu', name: 'Suhu', type: 'vital', unit: '°C', values: {}, icon: 'fa-solid fa-syringe' },
  {
    id: 'sistolik',
    name: 'Sistolik',
    type: 'pressure',
    unit: 'mmHg',
    values: {},
    icon: 'fa-solid fa-circle',
  },
  {
    id: 'diastolik',
    name: 'Diastolik',
    type: 'pressure',
    unit: 'mmHg',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'resp_spontan',
    name: 'Resp. Spontan',
    type: 'respiratory',
    unit: '/min',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'resp_kontrol',
    name: 'Resp. Kontrol',
    type: 'respiratory',
    unit: '/min',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'anestesi',
    name: 'Anestesi',
    type: 'procedure',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'operasi',
    name: 'Operasi',
    type: 'procedure',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'intubasi',
    name: 'Intubasi',
    type: 'airway',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'ekstubasi',
    name: 'Ekstubasi',
    type: 'airway',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'kateter_epidural',
    name: 'Kateter Epidural',
    type: 'procedure',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'mulai_anestesi',
    name: 'Mulai Anestesi',
    type: 'time',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'selesai_anestesi',
    name: 'Selesai Anestesi',
    type: 'time',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
  {
    id: 'mulai_operasi',
    name: 'Mulai Operasi',
    type: 'time',
    unit: '',
    values: {},
    icon: 'fa-solid fa-syringe',
  },
])

// Detail Data - Struktur waktu (36 time slots untuk 3 jam)
const timeSlots = reactive(
  Array.from({ length: 36 }, (_, index) => {
    const hour = Math.floor(index / 12) + 1
    const minute = (index % 12) * 5
    return {
      id: `h${hour}_m${minute}`,
      hour: hour,
      minute: minute,
      label: `Jam ${hour} - ${minute} menit`,
    }
  }),
)

// State untuk debug panel
const showDebug = ref(false)

// State untuk active cell dan navigation
const activeCell = ref({ kondisiId: null, timeSlotId: null })
const cellRefs = reactive({})

// Inisialisasi values untuk setiap kondisi dan time slot
masterData.forEach((kondisi) => {
  timeSlots.forEach((timeSlot) => {
    kondisi.values[timeSlot.id] = kondisi.type === 'time' ? false : ''
  })
})

// Set cell reference untuk navigasi keyboard
const setCellRef = (el, kondisiId, timeSlotId) => {
  if (el) {
    const key = `${kondisiId}-${timeSlotId}`
    cellRefs[key] = el.$el || el // Handle PrimeVue component or native element
  }
}

// Set active cell
const setActiveCell = (kondisiId, timeSlotId) => {
  activeCell.value = { kondisiId, timeSlotId }
}

// Clear active cell
const clearActiveCell = () => {
  // Delay untuk mencegah flicker saat pindah antar cell
  setTimeout(() => {
    if (
      !document.activeElement?.classList.contains('cell-input') &&
      !document.activeElement?.classList.contains('cell-checkbox')
    ) {
      activeCell.value = { kondisiId: null, timeSlotId: null }
    }
  }, 50)
}

// Handle keyboard navigation
const handleKeyNavigation = async (event, kondisiId, timeSlotId) => {
  const currentKondisiIndex = masterData.findIndex((k) => k.id === kondisiId)
  const currentTimeIndex = timeSlots.findIndex((t) => t.id === timeSlotId)

  let nextKondisiIndex = currentKondisiIndex
  let nextTimeIndex = currentTimeIndex
  let shouldPreventDefault = false

  switch (event.key) {
    case 'ArrowUp':
      nextKondisiIndex = Math.max(0, currentKondisiIndex - 1)
      shouldPreventDefault = true
      break
    case 'ArrowDown':
      nextKondisiIndex = Math.min(masterData.length - 1, currentKondisiIndex + 1)
      shouldPreventDefault = true
      break
    case 'ArrowLeft':
      nextTimeIndex = Math.max(0, currentTimeIndex - 1)
      shouldPreventDefault = true
      break
    case 'ArrowRight':
      nextTimeIndex = Math.min(timeSlots.length - 1, currentTimeIndex + 1)
      shouldPreventDefault = true
      break
    case 'Tab':
      // Tab akan menggunakan navigasi natural browser
      return
    case 'Enter':
      // Enter pindah ke baris berikutnya
      nextKondisiIndex = Math.min(masterData.length - 1, currentKondisiIndex + 1)
      shouldPreventDefault = true
      break
    case 'Escape':
      event.target.blur()
      shouldPreventDefault = true
      break
    case ' ':
    case 'Space':
      // Untuk checkbox, space akan toggle
      const kondisi = masterData.find((k) => k.id === kondisiId)
      if (kondisi && kondisi.type === 'time') {
        event.preventDefault()
        const currentValue = kondisi.values[timeSlotId]
        updateCheckboxValue(kondisiId, timeSlotId, !currentValue)
      }
      break
  }

  if (shouldPreventDefault) {
    event.preventDefault()

    const nextKondisiId = masterData[nextKondisiIndex]?.id
    const nextTimeSlotId = timeSlots[nextTimeIndex]?.id

    if (nextKondisiId && nextTimeSlotId) {
      await nextTick()
      const nextCellKey = `${nextKondisiId}-${nextTimeSlotId}`
      const nextCell = cellRefs[nextCellKey]

      if (nextCell) {
        // Focus untuk PrimeVue InputText atau native checkbox
        if (nextCell.$el) {
          const input = nextCell.$el.querySelector('input') || nextCell.$el
          input.focus()
        } else {
          nextCell.focus()
        }
        setActiveCell(nextKondisiId, nextTimeSlotId)
      }
    }
  }
}

// Focus ke cell tertentu (helper function)
const focusCell = async (kondisiId, timeSlotId) => {
  await nextTick()
  const cellKey = `${kondisiId}-${timeSlotId}`
  const cell = cellRefs[cellKey]

  if (cell) {
    if (cell.$el) {
      const input = cell.$el.querySelector('input') || cell.$el
      input.focus()
    } else {
      cell.focus()
    }
    setActiveCell(kondisiId, timeSlotId)
  }
}

// Helper function untuk placeholder berdasarkan tipe
const getPlaceholder = (type) => {
  const placeholders = {
    vital: '80',
    pressure: '120',
    respiratory: '20',
    medication: '10',
    procedure: '✓',
    airway: '✓',
    time: '✓',
  }
  return placeholders[type] || ''
}

// Update value dengan validation
const updateValue = (kondisiId, timeSlotId, value) => {
  const kondisi = masterData.find((k) => k.id === kondisiId)
  if (kondisi) {
    kondisi.values[timeSlotId] = value

    // Optional: Add validation logic here
    console.log(`Updated ${kondisi.name} at ${timeSlotId}: ${value}`)
  }
}

// Update checkbox value
const updateCheckboxValue = (kondisiId, timeSlotId, checked) => {
  const kondisi = masterData.find((k) => k.id === kondisiId)
  if (kondisi) {
    kondisi.values[timeSlotId] = checked

    console.log(`Updated ${kondisi.name} checkbox at ${timeSlotId}: ${checked}`)
  }
}

// Get formatted data untuk export
const getFormattedData = () => {
  return {
    metadata: {
      created_at: new Date().toISOString(),
      total_kondisi: masterData.length,
      total_timeSlots: timeSlots.length,
      duration_hours: 3,
    },
    master: masterData.map((kondisi) => ({
      id: kondisi.id,
      name: kondisi.name,
      type: kondisi.type,
      unit: kondisi.unit,
    })),
    detail: masterData
      .map((kondisi) => ({
        kondisi_id: kondisi.id,
        kondisi_name: kondisi.name,
        measurements: Object.entries(kondisi.values)
          .filter(([_, value]) => {
            // Untuk checkbox (time type), filter yang true
            if (kondisi.type === 'time') {
              return value === true || value === 'true'
            }
            // Untuk text input, filter yang tidak kosong
            return value !== ''
          })
          .map(([timeId, value]) => {
            const timeSlot = timeSlots.find((t) => t.id === timeId)
            return {
              time_id: timeId,
              hour: timeSlot?.hour,
              minute: timeSlot?.minute,
              value: kondisi.type === 'time' ? (value ? 'checked' : 'unchecked') : value,
              timestamp: timeSlot?.label,
            }
          }),
      }))
      .filter((detail) => detail.measurements.length > 0),
  }
}

// Export data sebagai JSON
const exportData = () => {
  const data = getFormattedData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Clear semua data
const clearData = () => {
  if (confirm('Apakah Anda yakin ingin menghapus semua data?')) {
    masterData.forEach((kondisi) => {
      Object.keys(kondisi.values).forEach((key) => {
        kondisi.values[key] = kondisi.type === 'time' ? false : ''
      })
    })
  }
}

// Load data dari JSON (untuk import)
const loadData = (jsonData) => {
  try {
    if (jsonData.detail) {
      jsonData.detail.forEach((detail) => {
        const kondisi = masterData.find((k) => k.id === detail.kondisi_id)
        if (kondisi) {
          detail.measurements.forEach((measurement) => {
            if (kondisi.type === 'time') {
              kondisi.values[measurement.time_id] = measurement.value === 'checked'
            } else {
              kondisi.values[measurement.time_id] = measurement.value
            }
          })
        }
      })
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// Computed property untuk summary data
const summary = computed(() => {
  const totalEntries = masterData.reduce((total, kondisi) => {
    if (kondisi.type === 'time') {
      return total + Object.values(kondisi.values).filter((v) => v === true).length
    } else {
      return total + Object.values(kondisi.values).filter((v) => v !== '').length
    }
  }, 0)

  return {
    totalEntries,
    completionPercentage: Math.round((totalEntries / (masterData.length * timeSlots.length)) * 100),
  }
})

// Expose untuk parent component
defineExpose({
  masterData,
  timeSlots,
  getFormattedData,
  loadData,
  clearData,
  exportData,
  summary,
  focusCell,
  activeCell,
})
</script>

<style scoped>
.excel-table {
  border-collapse: collapse;
}

.excel-table th,
.excel-table td {
  border: 1px solid #dee2e6 !important;
  padding: 0 !important;
  text-align: center;
  vertical-align: middle;
}

.cell-input {
  border: none;
  width: 40px;
  height: 38px;
  text-align: center;
  background: transparent;
  font-size: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.cell-input:focus {
  outline: none;
  box-shadow: none;
  border: 2px solid #007bff;
  background: #f8f9fa;
}

.cell-checkbox {
  width: 15px;
  height: 20px;
  cursor: pointer;
  transform: scale(1.2);
  accent-color: #38a3a5;
  transition: all 0.2s ease;
}

.cell-checkbox:focus {
  outline: 2px solid #38a3a5;
  outline-offset: 2px;
  transform: scale(1.3);
}

.cell-checkbox:hover {
  transform: scale(1.4);
  accent-color: #0056b3;
}

.table-responsive {
  overflow-x: auto;
  max-height: 70vh;
}

/* Styling untuk header table */
.excel-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Styling untuk kolom pertama (kondisi) */
.excel-table tbody td:first-child {
  background-color: #f8f9fa;
  position: sticky;
  left: 0;
  z-index: 5;
  min-width: 120px;
  font-weight: 500;
  padding: 8px !important;
}

/* Row hover effects - Soft highlight */
.excel-table tbody tr {
  transition: all 0.15s ease;
}

.excel-table tbody tr:hover {
  background-color: rgba(255, 243, 205, 0.3) !important;
}

.excel-table tbody tr:hover td {
  background-color: rgba(255, 243, 205, 0.3) !important;
}

.excel-table tbody tr:hover td:first-child {
  background-color: rgba(255, 234, 167, 0.5) !important;
  font-weight: 500;
}

/* Column hover effects - Soft highlight */
.excel-table td:hover {
  background-color: rgba(0, 123, 255, 0.1) !important;
}

/* Cell input hover - Strong highlight for cursor focus */
.cell-input:hover {
  background-color: #ffffff !important;
  border: 2px solid #007bff !important;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
  transform: scale(1.02);
  z-index: 20;
  position: relative;
}

.cell-input:focus {
  outline: none;
  box-shadow: 0 0 12px rgba(0, 123, 255, 0.5) !important;
  border: 2px solid #007bff !important;
  background: #f8f9fa !important;
  transform: scale(1.05);
  z-index: 30;
  position: relative;
}

/* Color coding berdasarkan tipe kondisi */
.excel-table tbody tr:nth-child(1) td:first-child,
.excel-table tbody tr:nth-child(2) td:first-child {
  background-color: #e3f2fd; /* medication - biru muda */
}

.excel-table tbody tr:nth-child(3) td:first-child,
.excel-table tbody tr:nth-child(4) td:first-child {
  background-color: #f3e5f5; /* vital - ungu muda */
}

.excel-table tbody tr:nth-child(5) td:first-child,
.excel-table tbody tr:nth-child(6) td:first-child {
  background-color: #ffebee; /* pressure - merah muda */
}

.excel-table tbody tr:nth-child(7) td:first-child,
.excel-table tbody tr:nth-child(8) td:first-child {
  background-color: #e8f5e8; /* respiratory - hijau muda */
}

.excel-table tbody tr:nth-child(9) td:first-child,
.excel-table tbody tr:nth-child(10) td:first-child,
.excel-table tbody tr:nth-child(13) td:first-child {
  background-color: #fff8e1; /* procedure - kuning muda */
}

.excel-table tbody tr:nth-child(11) td:first-child,
.excel-table tbody tr:nth-child(12) td:first-child {
  background-color: #fce4ec; /* airway - pink muda */
}

.excel-table tbody tr:nth-child(14) td:first-child,
.excel-table tbody tr:nth-child(15) td:first-child,
.excel-table tbody tr:nth-child(16) td:first-child {
  background-color: #f1f8e9; /* time - hijau sangat muda */
}

pre {
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
