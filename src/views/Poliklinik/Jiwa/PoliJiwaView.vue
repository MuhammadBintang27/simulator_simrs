<script setup>
import GenogramComponent from './GenogramComponent.vue'

defineProps({ datapasien: { type: Object, default: null } })
</script>

<template>
  <GenogramComponent :datapasien="datapasien" />
</template>
