import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface WishlistItem {
  id: number
  user_id: number
  menu_item_id: number
  menu_item_name: string
  menu_item_price: number
  menu_item_image: string
  created_at: string
}

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])
  const wishlistIds = ref<Set<number>>(new Set())
  const isLoading = ref(false)

  const count = computed(() => items.value.length)

  async function fetchWishlist() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return

    isLoading.value = true
    try {
      const response = await fetch('http://localhost:5001/api/wishlist', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      if (response.ok) {
        const data: WishlistItem[] = await response.json()
        items.value = data
        wishlistIds.value = new Set(data.map(item => item.menu_item_id))
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function addToWishlist(item: { menu_item_id: number; menu_item_name: string; menu_item_price: number; menu_item_image?: string }) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return false

    try {
      const response = await fetch('http://localhost:5001/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`
        },
        body: JSON.stringify({
          menu_item_id: item.menu_item_id,
          menu_item_name: item.menu_item_name,
          menu_item_price: item.menu_item_price,
          menu_item_image: item.menu_item_image || '',
        })
      })
      if (response.ok) {
        await fetchWishlist()
        return true
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
    }
    return false
  }

  async function removeFromWishlist(menuItemId: number) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return false

    try {
      const response = await fetch(`http://localhost:5001/api/wishlist/${menuItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` }
      })
      if (response.ok) {
        items.value = items.value.filter(item => item.menu_item_id !== menuItemId)
        wishlistIds.value = new Set(items.value.map(item => item.menu_item_id))
        return true
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
    return false
  }

  function isInWishlist(menuItemId: number): boolean {
    return wishlistIds.value.has(menuItemId)
  }

  return {
    items,
    wishlistIds,
    isLoading,
    count,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }
})
