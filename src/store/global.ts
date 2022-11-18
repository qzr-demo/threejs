import { defineStore } from 'pinia'

interface GlobalState {
  env: any
  host: string
  loading: boolean
}

export const useGlobal = defineStore({
  id: 'GLOBAL',
  state(): GlobalState {
    return {
      env: import.meta.env,
      host: import.meta.env.VITE_HOST,
      loading: true
    }
  },
  getters: {
  },
  actions: {

  },
  persist: {
    enabled: true
  }
})
