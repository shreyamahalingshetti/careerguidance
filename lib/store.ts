// Zustand store for client state management - Career Guidance System
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Career {
  id: string
  title: string
  description: string
  category: string
  salaryRange: string | null
  education: string | null
  skills: string
  growth: string | null
  createdAt: string
  updatedAt?: string
}

export interface Recommendation {
  id: string
  userId: string
  careerId: string | null
  title: string
  description: string
  type: 'CAREER' | 'SKILL' | 'EDUCATION' | 'RESOURCE'
  priority: number
  isRead: boolean
  createdAt: string
}

interface CareerStore {
  careers: Career[]
  setCareers: (careers: Career[]) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export const useCareerStore = create<CareerStore>()(
  persist(
    (set) => ({
      careers: [],
      setCareers: (careers) => set({ careers }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      categoryFilter: '',
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      currentPage: 1,
      setCurrentPage: (page) => set({ currentPage: page }),
    }),
    {
      name: 'career-store',
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        categoryFilter: state.categoryFilter,
        currentPage: state.currentPage,
      }),
    }
  )
)
