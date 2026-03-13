import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      resumeAiAnalyzing: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      setResumeAiAnalyzing: (val) => set({ resumeAiAnalyzing: val }),

      setUser: (user, token) => {
        if (token) {
          localStorage.setItem('token', token)
        }
        set({ user, token, isAuthenticated: true })
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        }))
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false, resumeAiAnalyzing: false })
      },
    }),
    {
      name: 'campusconnect-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true)
      },
    }
  )
)

export default useUserStore
