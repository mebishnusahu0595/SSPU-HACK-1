import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      farmer: null,
      token: null,
      isAuthenticated: false,

      login: (farmer, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('farmer', JSON.stringify(farmer));
        set({ farmer, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('farmer');
        set({ farmer: null, token: null, isAuthenticated: false });
      },

      updateFarmer: (farmer) => {
        localStorage.setItem('farmer', JSON.stringify(farmer));
        set({ farmer });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
