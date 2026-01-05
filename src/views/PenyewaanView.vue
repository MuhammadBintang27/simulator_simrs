<template>
  <loading_overlay :is-loading="loading" message="Memuat album...." />
  <ContentHeader title="Penyewaan Unit" icon="pi pi-user"></ContentHeader>
  <Panel class="mb-2 ml-10 mr-10 appointment-list">
    <div class="flex justify-center">
      <Stepper :value="steps" linear class="basis-[50rem]">
        <StepList>
          <Step value="1"> <strong> Pilih Unit</strong></Step>
          <Step value="2"> <strong> Customer</strong></Step>
          <Step value="3"><strong>Checkout</strong></Step>
        </StepList>
      </Stepper>
    </div>
  </Panel>

  <Panel class="appointment-list">
    <template #icons>
      <div v-if="steps == '1'">
        <Button
          icon="pi pi-refresh"
          severity="info"
          @click="fetchData()"
          label="Refresh"
          class="round-button2 btn-sm mr-2"
        />
        <ButtonGroup>
          <Button
            label="Kendaraan Ready"
            severity="success"
            class="round-button2 btn-sm mr-1"
            icon="pi pi-sign-in"
          />
          <Button
            label="Kendaraan Keluar"
            severity="danger"
            class="round-button2 btn-sm mr-1"
            icon="pi pi-sign-out"
          />
        </ButtonGroup>
      </div>
    </template>

    <template #header>
      <Button class="p-button-danger round-button2" v-if="steps == '2'" @click="backStep">
        <i class="pi pi-arrow-left" style="color: white"></i
      ></Button>

      <div class="flex items-center gap-2">
        <span class="font-bold"
          ><strong> {{ tittlePage }}</strong></span
        >
      </div>
    </template>

    <Tabs value="0" v-if="steps == '1'">
      <TabList>
        <Tab value="0">MOBIL</Tab>
        <Tab value="1">MOTOR</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText placeholder="Search" size="small" class="mb-2" />
          </IconField>
          <div class="appointment-list" v-if="steps == '1'">
            <div
              @click="proses_step1(appointment)"
              v-for="(appointment, index) in fact"
              :key="index"
              class="appointment-card hover-card clickable"
              :class="getStatusClass(appointment.final_trans)"
            >
              <!-- Left Status Bar -->
              <div class="status-bar"></div>

              <!-- Appointment Content -->
              <div class="appointment-content">
                <!-- Left Column: Title and Status -->
                <div class="appointment-info">
                  <h3 class="appointment-title">{{ appointment.desc }}</h3>
                  <span
                    class="appointment-status"
                    :class="getStatusTextClass(appointment.type_transamisi)"
                  >
                    {{ appointment.type_transamisi }}
                    {{ getStatusText(appointment.type_transamisi) }}
                  </span>
                </div>

                <!-- Right Column: Person Info -->
                <div class="person-info">
                  <div class="person-avatar">
                    <img :src="setCoverImage(appointment.reff_pic.original)" />
                  </div>
                  <div class="person-details">
                    <div class="person-name">{{ appointment.personName }}</div>
                    <div class="person-phone">
                      <i class="pi pi-phone text-primary"></i>
                      <span style="font-weight: bold">{{ appointment.no_pol }}</span>
                    </div>
                  </div>
                </div>

                <!-- Middle Column: Date and Time -->
                <div class="appointment-schedule">
                  <div class="schedule-date">
                    <i class="pi pi-calendar text-primary"></i>
                    <span>{{ appointment.tahun_pembuatan }}</span>

                    <i class="pi pi-users text-success ml-3"></i>
                    <span>{{ appointment.kapasitas }}</span>
                  </div>
                  <div class="schedule-time">
                    <i class="pi pi-wrench text-primary"></i>
                    <span>{{ appointment.type_transamisi }} </span>
                  </div>
                </div>

                <!-- Middle Column: Date and Time -->
                <div class="appointment-schedule">
                  <div class="schedule-date">
                    <i class="pi pi-bolt text-primary"></i>
                    <span>{{ appointment.bahan_bakar }}</span>
                  </div>
                  <div class="schedule-time">
                    <i class="pi pi-clock text-primary"></i>
                    <span>{{ formatCurrency(appointment.harga) }} </span>
                  </div>
                </div>

                <!-- Action Arrow -->
                <div class="action-arrow">
                  <!-- <Button class="p-button-danger round-button2" @click="proses_step1(appointment)">
                    <i class="pi pi-arrow-right" style="color: white"></i
                  >
                </Button> -->
                  <CountdownTimer :target-date="convertToIsoDate(appointment.tanggal_end_real)" />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel value="1">
          <p class="m-0">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
            sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
          </p>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <div class="appointment-list" v-if="steps == '2'">
      <StepTwoSales :value="dataSelected"></StepTwoSales>
    </div>
    <div class="appointment-list" v-if="steps == '3'">
      <StepThree></StepThree>
    </div>
    <!-- <PengembalianKendaraan v-model:showDialog="isDialogVisible" :itemsales="dataSelected" /> -->
  </Panel>
  <Toast />
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue'
import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

import { useRouter } from 'vue-router'
const router = useRouter()

// import PengembalianKendaraan from '@/components/sales/PengembalianComponent.vue'

const tittlePage = ref(null)

import { useAuthStore } from '@/stores/config' // Adjust path based on your project structure
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore) // Makes it reactive

const convertToIsoDate = (dateTimeString) => {
  if (dateTimeString != null) {
    const isoDate = new Date(dateTimeString).toISOString()
    return isoDate
  } else {
    return ''
  }
}

const configStore = useConfigStore() // ✅ Define configStore properly

const loading = ref(false)
const fact = ref([])

const steps = ref('1')

const dataSelected = ref(null)

const form = ref({
  mode: null,
  id_client: id_client,
})

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl

    form.value.mode = 2
    const rawForm = toRaw(form)

    const response = await axios.post(`${url}/get_data`, rawForm.value) // ✅ Cleaner syntax

    console.log(response.data)

    fact.value = [...response.data.response]
    console.log(fact.value)
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const proses_step1 = async (data) => {
  if (data.final_trans == -1) {
    dataSelected.value = data
    tittlePage.value = 'PILIH CUSTOMER'
    steps.value = '2'
  }
  if (data.final_trans == 0) {
    dataSelected.value = data
    // ShowPengembalian.value = true
    // isDialogVisible.value = true
    // With params

    router.push({
      path: `/pengembalian/${data.no_transaksi}`,
    })
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const backStep = () => {
  steps.value--
}

const getStatusClass = (status) => {
  return {
    'status-approved': status === -1,
    // 'status-pending': status === 0,
    'status-new': status === 'new',
    'status-refused': status === 0,
  }
}

const getStatusTextClass = (status) => {
  return {
    'text-teal': status === 'ready',
    'text-orange': status === 'pending',
    'text-blue': status === 'new',
    'text-pink': status === 'refused',
  }
}

const setCoverImage = (data) => {
  if (data.length === 0) {
    return 'https://rentalyuk.com/app/files/car/no_img.png'
  } else {
    const cover = data.find((item) => item.is_cover === 1)

    return cover ? cover.url : data[0].url
  }
}

onMounted(() => {
  fetchData()
  tittlePage.value = 'PENYEWAAN UNIT'
})

const getStatusText = (status) => {
  switch (status) {
    case 'ready':
      return 'Ready'
    case 'pending':
      return 'Need approve'
    case 'new':
      return 'New'
    case 'refused':
      return 'Refused'
    default:
      return ''
  }
}
</script>

<style scoped>
.appointment-list {
  max-width: 1300px;
  margin: 0 auto;
}

.appointment-card {
  display: flex;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
  position: relative;
}

.status-bar {
  width: 6px;
  min-height: 100%;
}

.status-approved .status-bar {
  background-color: #20c997;
}

.status-pending .status-bar {
  background-color: #fd7e14;
}

.status-new .status-bar {
  background-color: #007bff;
}

.status-refused .status-bar {
  background-color: #e83e8c;
}

.appointment-content {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.appointment-info {
  flex: 1;
  padding: 0 20px;
}

.appointment-title {
  font-size: 18px;
  color: #444;
  margin: 0 0 6px 0;
  font-weight: 500;
}

.appointment-status {
  font-size: 14px;
  font-weight: 500;
}

.text-teal {
  color: #20c997;
}

.text-orange {
  color: #fd7e14;
}

.text-blue {
  color: #007bff;
}

.text-pink {
  color: #e83e8c;
}

.appointment-schedule {
  flex: 1;
  padding: 0 20px;
}

.schedule-date,
.schedule-time {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  color: #666;
}

.schedule-date i,
.schedule-time i {
  margin-right: 8px;
  color: #007bff;
  font-size: 16px;
}

.person-info {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.person-avatar {
  margin-right: 15px;
}

.person-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.person-name {
  font-size: 16px;
  font-weight: 500;
  color: #444;
  margin-bottom: 5px;
}

.person-phone {
  display: flex;
  align-items: center;
  color: #666;
}

.person-phone i {
  margin-right: 8px;
  color: #007bff;
  font-size: 16px;
}

.action-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.clickable {
  cursor: pointer;
}

.action-arrow i {
  font-size: 15px;
  color: #007bff;
}

.hover-card {
  /* transition: all 0.1s ease; */
  border: 1px solid transparent; /* Default transparent border */
}

.hover-card:hover {
  background-color: #f3f4f6; /* Light gray background */

  /* box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);   */
  border-color: #007bff; /* Blue border on hover */
}

@media (max-width: 768px) {
  .appointment-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .appointment-info,
  .appointment-schedule,
  .person-info {
    width: 100%;
    padding: 5px 10px;
  }

  .action-arrow {
    position: absolute;
    right: 1px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
