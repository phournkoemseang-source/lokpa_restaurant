import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string
  imageSrc?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isCartOpen = ref(false)

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))

  function addToCart(item: Omit<CartItem, 'quantity'>) {
    const existingItem = items.value.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ ...item, quantity: 1 })
    }
    isCartOpen.value = true // Automatically open cart when item added
  }

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value
  }

  function removeFromCart(id: number) {
    const index = items.value.findIndex(i => i.id === id)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function decreaseQuantity(id: number) {
    const item = items.value.find(i => i.id === id)
    if (!item) return

    if (item.quantity > 1) {
      item.quantity--
    } else {
      removeFromCart(id)
    }
  }

  function increaseQuantity(id: number) {
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.quantity++
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    isCartOpen,
    totalItems,
    totalPrice,
    addToCart,
    toggleCart,
    removeFromCart,
    decreaseQuantity,
    increaseQuantity,
    clearCart
  }
})
