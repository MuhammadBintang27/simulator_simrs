<template>
  <Toast />
  <ProgressBar v-if="loading" mode="indeterminate" style="height: 3px" />

  <div class="content">
    <!-- ── Header Pasien ── -->
    <div class="hp-header" v-if="pasien">
      <div class="hp-header-left">
        <div class="hp-avatar">
          <i
            :class="pasien.JENISKELAMIN === 'P' ? 'fa fa-venus' : 'fa fa-mars'"
            :style="{ color: pasien.JENISKELAMIN === 'P' ? '#a855f7' : '#3b82f6' }"
          ></i>
        </div>
        <div class="hp-pasien-info">
          <div class="hp-nama">{{ pasien.NAMAPASIEN }}</div>
          <div class="hp-meta">
            <span><i class="pi pi-folder-open"></i> {{ pasien.NOMR }}</span>
            <span class="hp-dot">·</span>
            <span>{{ pasien.TGLLAHIR }} ({{ pasien.USIA_PASIEN?.tahun }} thn)</span>
            <span class="hp-dot">·</span>
            <span>{{ pasien.JENISKELAMIN === 'P' ? 'Perempuan' : 'Laki-laki' }}</span>
          </div>
          <div class="hp-meta mt-1">
            <span><i class="fas fa-shield-alt"></i> {{ pasien.NOJAMINAN || '-' }}</span>
            <span class="hp-dot">·</span>
            <span class="hp-carabayar">{{ pasien.CARABAYAR }}</span>
            <span v-if="pasien.NOSEP" class="hp-dot">·</span>
            <span v-if="pasien.NOSEP" class="hp-nosep">SEP: {{ pasien.NOSEP }}</span>
          </div>
        </div>
      </div>
      <div class="hp-header-right">
        <div class="hp-badge-ranap">
          <i class="pi pi-building"></i>
          Rujuk Rawat Inap
        </div>
        <div class="hp-noreg">
          No. Reg: <strong>{{ route.query.noreg }}</strong>
        </div>
      </div>
    </div>

    <!-- ── Skeleton saat loading ── -->
    <div v-if="loading && !pasien" class="hp-skeleton">
      <Skeleton width="60%" height="1.2rem" class="mb-2" />
      <Skeleton width="40%" height="1rem" />
    </div>

    <!-- ── Form Rujuk Rawat Inap ── -->
    <div class="hp-form-wrap" v-if="pasien">
      <RujukPasienKeRanap />
    </div>
  </div>
  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import ProgressBar from 'primevue/progressbar'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/config'
import RujukPasienKeRanap from '@/views/Poliklinik/TindakLanjutPasien/RujukPasienKeRanap.vue'

const configStore = useConfigStore()
const authStore = useAuthStore()
const { id_client } = storeToRefs(authStore)
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const pasien = ref(null)

const fetchPasien = async () => {
  try {
    loading.value = true
    const url = configStore.apiBaseUrl
    const response = await axios.post(`${url}/index.php/api/transaksi_pasien/history_versi4`, {
      mod: 1,
      noregister: route.query.noreg,
      id_client: id_client.value,
    })
    if (response.data.response?.length > 0) {
      pasien.value = response.data.response[0]
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Perhatian',
        detail: 'Data pasien tidak ditemukan',
        life: 4000,
      })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pasien',
      life: 4000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPasien()
})
</script>

<style scoped>
.content {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Header Pasien ── */
.hp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  padding: 14px 18px;
  gap: 12px;
  flex-wrap: wrap;
}
.hp-header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.hp-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.hp-pasien-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.hp-nama {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}
.hp-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  flex-wrap: wrap;
}
.hp-meta i {
  font-size: 11px;
}
.hp-dot {
  opacity: 0.4;
}
.hp-carabayar {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.hp-nosep {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.hp-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.hp-badge-ranap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
}
.hp-noreg {
  font-size: 11px;
  color: #94a3b8;
}

.hp-skeleton {
  padding: 14px 18px;
}
.mb-2 {
  margin-bottom: 8px;
}
.mt-1 {
  margin-top: 4px;
}
.hp-form-wrap {
  min-height: 200px;
}

@media (max-width: 640px) {
  .hp-header {
    flex-direction: column;
  }
  .hp-header-right {
    align-items: flex-start;
  }
}
</style>
