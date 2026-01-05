<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <Card class="max-w-full mx-auto">
      <template #title>
        <div class="text-center">Odontogram Profesional</div>
      </template>

      <template #content>
        <div class="flex flex-col lg:flex-row gap-8 justify-center items-start">
          <!-- Left Side - Teeth Display -->
          <div class="flex-1 overflow-x-auto">
            <div class="inline-block min-w-max">
              <!-- Upper Permanent Teeth -->
              <div class="mb-2">
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold mr-2 whitespace-nowrap">NON 18</span>
                  <ToothComponent
                    v-for="num in [...upperPermanent[0], ...upperPermanent[1]]"
                    :key="num"
                    :number="num"
                    position="top"
                    :selected="selectedTooth === num"
                    :condition="toothConditions[num]"
                    :symbol="toothSymbols[num]"
                    @click="selectTooth(num)"
                  />
                  <span class="text-xs font-bold ml-2 whitespace-nowrap">28 NON</span>
                </div>
              </div>

              <!-- Upper Deciduous Teeth -->
              <div class="mb-4">
                <div class="flex items-center gap-1">
                  <span class="invisible text-xs font-bold mr-2 whitespace-nowrap">------</span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <ToothComponent
                    v-for="num in [...upperDeciduous[0], ...upperDeciduous[1]]"
                    :key="num"
                    :number="num"
                    position="top"
                    is-deciduous
                    :selected="selectedTooth === num"
                    :condition="toothConditions[num]"
                    :symbol="toothSymbols[num]"
                    @click="selectTooth(num)"
                  />
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible text-xs font-bold ml-2 whitespace-nowrap">------</span>
                </div>
              </div>

              <!-- Horizontal line -->
              <div class="my-4 border-t-2 border-gray-800"></div>

              <!-- Lower Deciduous Teeth -->
              <div class="mb-2">
                <div class="flex items-center gap-1">
                  <span class="invisible text-xs font-bold mr-2 whitespace-nowrap">------</span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <ToothComponent
                    v-for="num in [...lowerDeciduous[0], ...lowerDeciduous[1]]"
                    :key="num"
                    :number="num"
                    position="bottom"
                    is-deciduous
                    :selected="selectedTooth === num"
                    :condition="toothConditions[num]"
                    :symbol="toothSymbols[num]"
                    @click="selectTooth(num)"
                  />
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible flex-shrink-0" style="width: 50px"></span>
                  <span class="invisible text-xs font-bold ml-2 whitespace-nowrap">------</span>
                </div>
              </div>

              <!-- Lower Permanent Teeth -->
              <div class="mb-6">
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold mr-2 whitespace-nowrap">UNE 48</span>
                  <ToothComponent
                    v-for="num in [...lowerPermanent[0], ...lowerPermanent[1]]"
                    :key="num"
                    :number="num"
                    position="bottom"
                    :selected="selectedTooth === num"
                    :condition="toothConditions[num]"
                    :symbol="toothSymbols[num]"
                    @click="selectTooth(num)"
                  />
                  <span class="text-xs font-bold ml-2 whitespace-nowrap">38 UNE</span>
                </div>
              </div>
            </div>

            <!-- Selected tooth indicator -->
            <Message v-if="selectedTooth" severity="warn" :closable="false" class="mb-4">
              <template #default>
                <div class="text-center">
                  <p class="font-semibold">Gigi terpilih: {{ selectedTooth }}</p>
                  <p class="text-sm">Klik simbol atau kondisi di samping untuk menandai gigi</p>
                </div>
              </template>
            </Message>
          </div>

          <!-- Right Side - Controls -->
          <div class="w-full lg:w-80 flex-shrink-0">
            <Card class="bg-gray-50">
              <template #content>
                <!-- Symbols -->
                <div class="mb-6">
                  <h3 class="font-bold text-base mb-3">Simbol:</h3>
                  <div class="grid grid-cols-2 gap-2">
                    <Button
                      v-for="symbol in symbols"
                      :key="symbol.code"
                      :disabled="!selectedTooth"
                      @click="handleSymbolSelect(symbol.code)"
                      class="flex-col h-auto py-2 text-center"
                      outlined
                      size="small"
                    >
                      <div class="text-xl font-bold mb-1">{{ symbol.code }}</div>
                      <div class="text-[10px]">{{ symbol.label }}</div>
                    </Button>
                  </div>
                </div>

                <Divider />

                <!-- Conditions -->
                <div class="mb-4">
                  <h3 class="font-bold text-base mb-3">Kondisi:</h3>
                  <div class="flex flex-col gap-2">
                    <Button
                      label="Gigi Penuh"
                      icon="pi pi-circle-fill"
                      :disabled="!selectedTooth"
                      @click="handleConditionSelect('full')"
                      severity="success"
                      size="small"
                    />
                    <Button
                      label="Gigi Bergaris"
                      icon="pi pi-bars"
                      :disabled="!selectedTooth"
                      @click="handleConditionSelect('stripe')"
                      severity="warning"
                      size="small"
                    />
                    <Button
                      label="Reset Gigi"
                      icon="pi pi-refresh"
                      :disabled="!selectedTooth"
                      @click="resetTooth"
                      severity="danger"
                      size="small"
                    />
                  </div>
                </div>

                <Divider />

                <!-- Instructions -->
                <div>
                  <h3 class="font-bold text-base mb-2">Petunjuk:</h3>
                  <ol class="text-xs space-y-1 list-decimal list-inside text-gray-700">
                    <li>Klik gigi yang ingin ditandai</li>
                    <li>Pilih simbol atau kondisi</li>
                    <li>Simbol muncul di atas/bawah gigi</li>
                    <li>Warna mengisi seluruh gigi</li>
                  </ol>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Message from 'primevue/message'

// Tooth Component
const ToothComponent = {
  props: {
    number: Number,
    position: String,
    isDeciduous: Boolean,
    selected: Boolean,
    condition: Object,
    symbol: String,
  },
  emits: ['click'],
  setup(props, { emit }) {
    const getFillColor = () => {
      if (props.condition?.fill === 'full') return '#4CAF50'
      if (props.condition?.fill === 'stripe') return 'url(#stripe-pattern)'
      return 'white'
    }

    const size = props.isDeciduous ? 40 : 50

    return {
      getFillColor,
      size,
      handleClick: () => emit('click'),
    }
  },
  template: `
    <div class="flex flex-col items-center relative cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" @click="handleClick" :style="{width: size + 'px'}">
      <!-- Label atas untuk gigi atas -->
      <div v-if="position === 'top'" class="text-[10px] font-bold mb-0.5">{{ number }}</div>
      
      <!-- Symbol di atas gigi -->
      <div v-if="symbol && position === 'top'" class="absolute -top-7 text-lg font-bold">{{ symbol }}</div>

      <svg 
        :width="size" 
        :height="size" 
        viewBox="0 0 60 60"
        :class="['transition-all', selected ? 'ring-2 ring-yellow-400 rounded' : '']"
        :style="{ filter: selected ? 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))' : 'none' }"
      >
        <defs>
          <pattern id="stripe-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="white"/>
            <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#FF9800" stroke-width="2"/>
          </pattern>
        </defs>

        <!-- Main tooth shape -->
        <rect 
          x="5" y="5" 
          width="50" height="50" 
          :fill="getFillColor()"
          stroke="#333" 
          stroke-width="2"
        />

        <!-- Top surface -->
        <polygon
          points="5,5 15,15 45,15 55,5"
          :fill="condition?.top || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Right surface -->
        <polygon
          points="55,5 45,15 45,45 55,55"
          :fill="condition?.right || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Bottom surface -->
        <polygon
          points="5,55 15,45 45,45 55,55"
          :fill="condition?.bottom || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Left surface -->
        <polygon
          points="5,5 15,15 15,45 5,55"
          :fill="condition?.left || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Center -->
        <rect
          x="15" y="15" 
          width="30" height="30"
          :fill="condition?.center || 'white'"
          stroke="#666"
          stroke-width="1"
        />

        <!-- Draw X if marked -->
        <g v-if="symbol === 'X'">
          <line x1="10" y1="10" x2="50" y2="50" stroke="#000" stroke-width="3"/>
          <line x1="50" y1="10" x2="10" y2="50" stroke="#000" stroke-width="3"/>
        </g>

        <!-- Draw / if marked -->
        <line v-if="symbol === '/'" x1="50" y1="10" x2="10" y2="50" stroke="#000" stroke-width="3"/>

        <!-- Draw ■ if marked -->
        <rect v-if="symbol === '■'" x="20" y="20" width="20" height="20" fill="#000"/>
        
        <!-- Draw ▲ if marked -->
        <polygon v-if="symbol === '▲'" points="30,20 40,40 20,40" fill="#000"/>
        
        <!-- Draw ▼ if marked -->
        <polygon v-if="symbol === '▼'" points="30,40 20,20 40,20" fill="#000"/>
        
        <!-- Draw □ if marked -->
        <rect v-if="symbol === '□'" x="20" y="20" width="20" height="20" fill="none" stroke="#000" stroke-width="3"/>
        
        <!-- Draw # if marked -->
        <g v-if="symbol === '#'">
          <line x1="20" y1="25" x2="40" y2="25" stroke="#000" stroke-width="2"/>
          <line x1="20" y1="35" x2="40" y2="35" stroke="#000" stroke-width="2"/>
          <line x1="25" y1="20" x2="25" y2="40" stroke="#000" stroke-width="2"/>
          <line x1="35" y1="20" x2="35" y2="40" stroke="#000" stroke-width="2"/>
        </g>
      </svg>

      <!-- Symbol di bawah gigi -->
      <div v-if="symbol && position === 'bottom'" class="absolute -bottom-7 text-lg font-bold">{{ symbol }}</div>

      <!-- Label bawah untuk gigi bawah -->
      <div v-if="position === 'bottom'" class="text-[10px] font-bold mt-0.5">{{ number }}</div>
    </div>
  `,
}

// State
const selectedTooth = ref(null)
const toothConditions = ref({})
const toothSymbols = ref({})

// Tooth numbers
const upperPermanent = [
  [18, 17, 16, 15, 14, 13, 12, 11],
  [21, 22, 23, 24, 25, 26, 27, 28],
]

const upperDeciduous = [
  [55, 54, 53, 52, 51],
  [61, 62, 63, 64, 65],
]

const lowerDeciduous = [
  [85, 84, 83, 82, 81],
  [71, 72, 73, 74, 75],
]

const lowerPermanent = [
  [48, 47, 46, 45, 44, 43, 42, 41],
  [31, 32, 33, 34, 35, 36, 37, 38],
]

// Symbols
const symbols = [
  { code: 'X', label: 'Hilang' },
  { code: '/', label: 'Dicabut' },
  { code: '■', label: 'Tambal' },
  { code: '▲', label: 'Akan Cabut' },
  { code: '▼', label: 'Turun' },
  { code: '□', label: 'Mahkota' },
  { code: '#', label: 'Rusak' },
  { code: 'PRD', label: 'Protesa' },
  { code: 'UNE', label: 'Unerupted' },
]

// Methods
const selectTooth = (number) => {
  selectedTooth.value = number
}

const handleSymbolSelect = (symbolCode) => {
  if (selectedTooth.value) {
    toothSymbols.value[selectedTooth.value] = symbolCode
  }
}

const handleConditionSelect = (fillType) => {
  if (selectedTooth.value) {
    toothConditions.value[selectedTooth.value] = {
      ...toothConditions.value[selectedTooth.value],
      fill: fillType,
    }
  }
}

const resetTooth = () => {
  if (selectedTooth.value) {
    delete toothConditions.value[selectedTooth.value]
    delete toothSymbols.value[selectedTooth.value]
  }
}
</script>

<style scoped>
/* Custom styles */
</style>
