// stores/index.js (or wherever your stores are)
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', {
  state: () => {
    const isProd = true // 'production' // import.meta.env.MODE === 'development'

    return {
      mode: isProd ? 'production' : 'development',

      apiBaseUrl:
        isProd == true ? 'https://ws-simrs.link/ws_sim_v2' : 'https://ws-simrs.link/ws_sim_v2',

      apiApotikUrl:
        isProd == false
          ? 'https://ws-simrs.link/ws_posindo_v2.1'
          : 'https://ws-simrs.link/ws_posindo_v2.1',

      simrs: isProd == true ? 'https://ws-simrs.link/ws_sim_v2' : 'https://ws-simrs.link/ws_sim_v2',

      laravel: isProd == true ? 'https://simrs-link.site/api' : 'https://simrs-link.site/api',
    }
  },

  getters: {
    getApiUrl: (state) => state.apiBaseUrl,
    getApotikApi: (state) => state.apiApotikUrl,
    getSimrsApi: (state) => state.simrs,
    getMode: (state) => state.mode,
  },
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    id_client: localStorage.getItem('id_client') || null,
    user_name: localStorage.getItem('user_name') || null,
    user_id: localStorage.getItem('user_id') || null,
    company: localStorage.getItem('NAMA_RS') || null,
    ALAMAT: localStorage.getItem('ALAMAT') || null,
    LINK_LOGO: localStorage.getItem('LINK_LOGO') || null,
    id_lokasi: localStorage.getItem('id_lokasi') || null,
    use_tte_bsre: localStorage.getItem('use_tte_bsre') || null,
  }),

  actions: {
    setIdClient(id, name, user_id, company, ALAMAT, LINK_LOGO, id_lokasi, use_tte_bsre) {
      this.id_client = id

      this.user_name = name
      this.user_id = user_id
      this.company = company
      this.ALAMAT = ALAMAT
      this.LINK_LOGO = LINK_LOGO
      this.id_lokasi = id_lokasi
      this.use_tte_bsre = use_tte_bsre

      localStorage.setItem('id_client', id)
      localStorage.setItem('user_name', name)
      localStorage.setItem('user_id', user_id)
      localStorage.setItem('NAMA_RS', company)
      localStorage.setItem('ALAMAT', ALAMAT)
      localStorage.setItem('LINK_LOGO', LINK_LOGO)
      localStorage.setItem('id_lokasi', id_lokasi)
      localStorage.setItem('use_tte_bsre', use_tte_bsre)
    },
    clearAuthData() {
      this.id_client = null
      this.user_name = null
      this.user_id = null
      this.company = null
      this.ALAMAT = null
      this.LINK_LOGO = null
      this.id_lokasi = null
      this.use_tte_bsre = 0

      localStorage.removeItem('id_client')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_id')
      localStorage.removeItem('NAMA_RS')
      localStorage.removeItem('ALAMAT')
      localStorage.removeItem('LINK_LOGO')
      localStorage.removeItem('loggedIn')
      localStorage.removeItem('id_lokasi')
      localStorage.removeItem('use_tte_bsre')
    },
  },
})

export const useGlobalStore = defineStore('global', () => {
  const step = ref('1')

  const setStep = (newValue) => {
    step.value = newValue
  }

  return {
    step,
    setStep,
  }
})
