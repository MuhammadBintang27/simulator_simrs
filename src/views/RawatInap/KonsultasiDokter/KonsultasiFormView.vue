<template>
  <KonsultasiForm
    :noregister="route.query.noregister || ''"
    :no_rm="route.query.no_rm || ''"
    :nama_pasien="route.query.nama_pasien || ''"
    @submitted="onSubmitted"
    @close="handleClose"
  />
</template>

<script setup>
import { useRoute } from 'vue-router'
import KonsultasiForm from './KonsultasiForm.vue'

const route = useRoute()

// Setelah form berhasil dikirim, tutup tab ini
const onSubmitted = () => {
  setTimeout(() => window.close(), 1800)
}

// Tombol back di breadcrumb → tutup tab
const handleClose = () => {
  window.close()
}
</script>
