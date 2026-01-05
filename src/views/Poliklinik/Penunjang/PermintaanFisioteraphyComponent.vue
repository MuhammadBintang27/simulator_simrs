<template>
  <Panel>
    <template #header>
      <h6 style="color: darkcyan">
        <strong>FISIOTERAPHI</strong> <Button text class="round-button" icon="pi pi-refresh" />
      </h6>
    </template>
    <div class="row">
      <ScrollPanel class="col-md-2" style="height: 500px; padding-right: 4px">
        <Button label="Teset"></Button>
      </ScrollPanel>

      <div class="col-md-10">
        <Panel>
          <template #header> </template>
          <label for="klinis" class="input-label">Klinis:</label>
          <InputText
            id="klinis"
            v-model="klinis"
            size="small"
            placeholder="Masukkan diagnosa klinis"
            class="input-control"
            style="width: 100%"
          />

          <div class="group-form mt-4">
            <label for="klinis" class="input-label">Keterangan</label>
            <Textarea
              class="custom-textarea"
              placeholder="Rencana tindakan"
              style="width: 100%"
              :rows="5"
            ></Textarea>
          </div>

          <template #footer>
            <label for="klinis" class="input-label">Klinis:</label>
          </template>
        </Panel>
      </div>
    </div>
  </Panel>
</template>

<script setup>
import ScrollPanel from 'primevue/scrollpanel'
import { ref, onMounted, registerRuntimeCompiler } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useAuthStore } from '@/stores/config'
const authStore = useAuthStore()
import { storeToRefs } from 'pinia'
const { id_client } = storeToRefs(authStore)

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const klinis = ref(null)

const loading = ref(false)

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}

const fact = ref([])

const fetchData = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.get(`${url}/get_data`) // ✅ Cleaner syntax

    fact.value = [...response.data.response]
    loading.value = false
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {})
</script>
