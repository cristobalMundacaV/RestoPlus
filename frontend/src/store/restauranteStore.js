import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useRestauranteStore = create(
  persist(
    (set) => ({
      restaurante: null,
      restaurantes: [],

      setRestaurante: (restaurante) => set({ restaurante }),
      setRestaurantes: (restaurantes) => set({ restaurantes }),
    }),
    {
      name: 'restaurante-storage',
      partialize: (state) => ({
        restaurante: state.restaurante,
      }),
    }
  )
)

export default useRestauranteStore
