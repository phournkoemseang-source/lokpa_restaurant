import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export interface Coupon {
  id: number
  user_id: number
  coupon_id: number
  is_used: boolean
  earned_at: string
  used_at: string | null
  code: string
  discount_percent: number
  valid_until: string | null
}

export interface LoyaltyProgress {
  orderCount: number
  bookingCount: number
  totalActivity: number
  threshold: number
  progressPercent: number
  remainingForReward: number
}

export const usePromotionsStore = defineStore('promotions', () => {
  const coupons = ref<Coupon[]>([])
  const progress = ref<LoyaltyProgress | null>(null)
  const isLoading = ref(false)

  async function fetchMyCoupons() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    isLoading.value = true
    try {
      const response = await fetch('http://localhost:5001/api/coupons/mine', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      if (response.ok) {
        coupons.value = await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProgress() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    try {
      const response = await fetch('http://localhost:5001/api/coupons/progress', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      if (response.ok) {
        progress.value = await response.json()
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }

  return {
    coupons,
    progress,
    isLoading,
    fetchMyCoupons,
    fetchProgress,
  }
})
