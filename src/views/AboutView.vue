<template>
  <Toast />
  <loading_overlay :is-loading="loading" message="Memuat album...." />
  <section class="content bg-col">
    <ContentHeader title="About" icon="pi pi-spin pi-cog"></ContentHeader>
    <p>API Base URL: {{ $configStore.apiBaseUrl }}</p>
    <Panel toggleable>
      <template #header>
        <div class="flex items-center gap-2">
          <span class="font-bold">Amy Elsner</span>
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <Button icon="pi pi-user" rounded text></Button>
            <Button icon="pi pi-bookmark" severity="secondary" rounded text></Button>
          </div>
          <span class="text-surface-500 dark:text-surface-400">Updated 2 hours ago</span>
        </div>
      </template>
      <template #icons>
        <Button icon="pi pi-cog" severity="secondary" rounded text />
        <Menu ref="menu" id="config_menu" popup />
      </template>
      <p class="m-0">
        <DataTable
          :value="fact"
          tableStyle="min-width: 50rem"
          scrollable
          hover
          scrollHeight="400px"
          class="rowClass"
          paginator
          :rows="5"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} products"
        >
          <Column field="id" header="Code" sortable></Column>
          <Column field="no_pol" header="no_pol" sortable>
            <template #body="slotProps">
              <!-- <Button :label="slotProps.data.title" severity="info" class="round-button" /> -->
              <Tag :value="slotProps.data.no_pol" style="font-size: 10px" severity="success" />
            </template>
          </Column>
          <Column field="desc" header="description" sortable></Column>
          <Column field="tahun_pembuatan" header="tahun_pembuatan" sortable></Column>
        </DataTable>
      </p>
    </Panel>

    <Panel header="Header">
      <template #header>
        <div class="flex items-center gap-2">
          <Avatar
            image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            shape="circle"
          />
          <span class="font-bold">Amy Elsner</span>
        </div>
      </template>

      <div>
        <h2>Albums</h2>
        <ul>
          <li v-for="album in fact" :key="album.id">{{ album.description }} {{ album.price }}</li>
        </ul>
      </div>
      <div class="flex flex-col items-center gap-4">
        <div class="flex flex-wrap gap-4 justify-center">
          <Button label="Primary" class="round-button" />
          <Button
            label="Secondary"
            severity="secondary"
            @click="fetchData"
            class="round-button"
            style="border-radius: 30px"
          />
          <Button label="Success" severity="success" @click="showSuccess" class="round-button" />
          <Button label="Info" severity="info" class="round-button" />
          <Button label="Warn" severity="warn" class="round-button" />
          <Button label="Help" severity="help" class="round-button" />
          <Button label="Danger" severity="danger" class="round-button" />
          <Button label="Contrast" severity="contrast" class="round-button" />
        </div>
      </div>

      <label for="integeronly" class="font-bold block mb-2"> Integer Only </label>
      <InputNumber v-model="value1" inputId="integeronly" fluid />

      <label for="withoutgrouping" class="font-bold block mb-2"> Without Grouping </label>
      <InputNumber v-model="value2" inputId="withoutgrouping" :useGrouping="false" fluid />

      <label for="minmaxfraction" class="font-bold block mb-2"> Min-Max Fraction Digits </label>
      <InputNumber
        v-model="value3"
        inputId="minmaxfraction"
        :minFractionDigits="2"
        :maxFractionDigits="5"
        fluid
      />

      <div class="flex-auto">
        <label for="minmax" class="font-bold block mb-2"> Min-Max Boundaries </label>
        <InputNumber v-model="value4" inputId="minmax" :min="0" :max="100" fluid />
      </div>

      <DatePicker v-model="dates" selectionMode="multiple" :manualInput="false" />
    </Panel>

    <Button label="Show" @click="visible = true" class="round-button" />

    <Dialog
      v-model:visible="visible"
      modal
      header="Header"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <p class="mb-8">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p class="mb-8">
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
        laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
        architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
        aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
        dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
        exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
        consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
        molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
      </p>
      <p class="mb-8">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
        voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
        cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id
        est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam
        libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod
        maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
        Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut
        et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a
        sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis
        doloribus asperiores repellat.
      </p>
      <p class="mb-8">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
        cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p class="mb-8">
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
        laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
        architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
        aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
        voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
        dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
        exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
        consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
        molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
      </p>
      <p>
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
        voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
        cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id
        est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam
        libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod
        maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
        Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut
        et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a
        sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis
        doloribus asperiores repellat.
      </p>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useConfigStore } from '@/stores/config' // Import the Pinia store
import axios from 'axios'

const configStore = useConfigStore() // ✅ Define configStore properly

import { useToast } from 'primevue/usetoast'
const toast = useToast()

const loading = ref(false)

const visible = ref(false)

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Success Message',
    detail: 'Message Content',
    life: 3000,
  })
}

const value1 = ref(42723)
const value2 = ref(58151)
const value3 = ref(2351.35)
const value4 = ref(50)

const dates = ref()

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

onMounted(() => {
  fetchData()
})
</script>
<style>
.custom-row-hover:hover {
  background-color: #f5f5f5 !important; /* Light gray hover effect */
  transition: background-color 0.2s ease-in-out;
}
</style>
