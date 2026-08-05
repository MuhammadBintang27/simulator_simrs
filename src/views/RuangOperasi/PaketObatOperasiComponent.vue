<template>
  <TeraphyComponent v-if="datapasienMerged" :datapasien="datapasienMerged" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import TeraphyComponent from '@/components/PoliklinikComponent/TeraphyComponent.vue'

const props = defineProps({
  datapasien: {
    type: Object,
    default: null,
  },
})

const route = useRoute()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)

const datapasienFromApi = ref(null)

// Gabung data dari parent (form persiapan operasi) + data registrasi pasien dari history_versi4
// sehingga field seperti NOMR, KODECARABAYAR, NOPENDAFTARAN, NAMADOKTER tersedia di TeraphyComponent
const datapasienMerged = computed(() => {
  if (!datapasienFromApi.value && !props.datapasien) return null
  return {
    ...props.datapasien,
    ...datapasienFromApi.value,
  }
})

const fetchData = async () => {
  try {
    const param = {
      mod: 1,
      noregister: route.query.noreg,
      id_client: id_client.value,
    }
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, param)
    if (response.data.response && response.data.response.length > 0) {
      datapasienFromApi.value = response.data.response[0]
    }
  } catch (error) {
    console.error('Error fetching patient data:', error)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>
