<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, ShoppingBag, Trash2, CreditCard, QrCode, Minus, Plus, ArrowLeft, CheckCircle, Loader2 } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const checkoutStep = ref<'review' | 'payment' | 'success'>('review')
const paymentMethod = ref<'khqr' | 'credit'>('khqr')
const isSubmitting = ref(false)
const paymentError = ref('')
const paidOrderId = ref<number | null>(null)
const paidOrderSummary = ref('')

const cartSummary = computed(() => {
  const itemCount = cartStore.totalItems
  const dishCount = cartStore.items.length
  const itemLabel = itemCount === 1 ? 'item' : 'items'
  const dishLabel = dishCount === 1 ? 'dish' : 'dishes'
  return `${itemCount} ${itemLabel} from ${dishCount} ${dishLabel}`
})

const getImageUrl = (item: { image_url: string; imageSrc?: string }) => {
  if (item.imageSrc) return item.imageSrc
  if (!item.image_url) return '/placeholder-food.jpg'
  return new URL(`../assets/pictures/${item.image_url}`, import.meta.url).href
}

const khqrSvg = computed(() => {
  const amount = cartStore.totalPrice.toFixed(2)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 280">
      <rect width="220" height="280" rx="16" fill="#fff"/>
      <rect width="220" height="48" rx="16" fill="#e11d2e"/>
      <text x="16" y="31" fill="#fff" font-family="Arial, sans-serif" font-size="20" font-weight="700">KHQR</text>
      <text x="16" y="76" fill="#111" font-family="Arial, sans-serif" font-size="13" font-weight="700">NekMak Restaurant</text>
      <text x="16" y="96" fill="#555" font-family="Arial, sans-serif" font-size="11">Amount USD ${amount}</text>
      <g transform="translate(38 116)" fill="#111">
        <rect width="28" height="28"/><rect x="6" y="6" width="16" height="16" fill="#fff"/><rect x="10" y="10" width="8" height="8"/>
        <rect x="116" width="28" height="28"/><rect x="122" y="6" width="16" height="16" fill="#fff"/><rect x="126" y="10" width="8" height="8"/>
        <rect y="116" width="28" height="28"/><rect x="6" y="122" width="16" height="16" fill="#fff"/><rect x="10" y="126" width="8" height="8"/>
        <path d="M42 0h10v10H42zM62 0h10v20H62zM84 0h10v10H84zM104 10h10v20h-10zM42 30h20v10H42zM74 28h10v10H74zM94 38h20v10H94zM32 50h10v20H32zM52 54h30v10H52zM92 58h10v20H92zM112 50h20v10h-20zM42 82h10v10H42zM62 74h20v20H62zM92 88h30v10H92zM132 72h12v28h-12zM36 104h34v10H36zM80 108h10v20H80zM100 112h12v12h-12zM122 112h22v10h-22zM42 130h10v14H42zM62 126h12v18H62zM92 132h20v12H92zM122 132h10v12h-10z"/>
      </g>
      <text x="110" y="250" fill="#444" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Scan with Bakong or any KHQR app</text>
    </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
})

const goToPayment = () => {
  paymentError.value = ''
  checkoutStep.value = 'payment'
}

const submitPayment = async () => {
  paymentError.value = ''

  if (!authStore.token) {
    paymentError.value = 'Please login before payment.'
    return
  }

  isSubmitting.value = true
  try {
    const response = await fetch('http://localhost:5001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        items: cartStore.items,
        total: cartStore.totalPrice,
        paymentMethod: paymentMethod.value,
        status: 'paid',
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Payment could not be completed.')
    }

    const data = await response.json()
    paidOrderId.value = data.id
    paidOrderSummary.value = cartSummary.value
    cartStore.clearCart()
    checkoutStep.value = 'success'
  } catch (error) {
    paymentError.value = error instanceof Error ? error.message : 'Payment could not be completed.'
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => cartStore.isCartOpen,
  (isOpen) => {
    if (isOpen && checkoutStep.value !== 'success') {
      checkoutStep.value = 'review'
      paymentError.value = ''
    }

    if (!isOpen && checkoutStep.value === 'success') {
      checkoutStep.value = 'review'
      paidOrderId.value = null
      paidOrderSummary.value = ''
    }
  }
)
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="cartStore.isCartOpen" class="fixed inset-0 z-[100] overflow-hidden">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cartStore.isCartOpen = false"></div>

      <!-- Cart Panel -->
      <div class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gold/20 bg-base-dark shadow-2xl">
        <!-- Header -->
        <div class="border-b border-gold/10 p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <ShoppingBag class="h-6 w-6 text-gold" />
              <div>
                <h2 class="font-serif text-2xl text-white">Order</h2>
                <p class="mt-1 text-xs text-text-subtle">{{ cartStore.items.length ? cartSummary : 'Choose your NekMak dishes' }}</p>
              </div>
            </div>
            <button @click="cartStore.isCartOpen = false" class="p-2 transition-colors hover:bg-gold/10" aria-label="Close cart">
              <X class="h-6 w-6 text-text-subtle" />
            </button>
          </div>

          <router-link
            to="/menu"
            class="mt-5 flex h-12 w-full items-center justify-center gap-3 border border-gold/20 bg-card-dark/70 text-[10px] font-black uppercase tracking-[0.26em] text-gold transition-all hover:border-gold hover:bg-gold hover:text-base-dark"
            @click="cartStore.isCartOpen = false"
          >
            <Plus class="h-4 w-4" />
            Add More Food
          </router-link>
        </div>

        <div v-if="checkoutStep === 'success'" class="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <CheckCircle class="h-16 w-16 text-gold" />
          <h3 class="mt-6 font-serif text-3xl text-white">Payment Received</h3>
          <p class="mt-3 max-w-xs text-sm leading-7 text-text-subtle">
            Order #{{ paidOrderId }} was sent to the admin dashboard as a paid order notification.
          </p>
          <p class="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-gold">{{ paidOrderSummary }}</p>
          <button
            @click="cartStore.isCartOpen = false"
            class="mt-8 w-full bg-gold py-5 text-[10px] font-black uppercase tracking-[0.35em] text-base-dark transition-all hover:bg-white"
          >
            Done
          </button>
        </div>

        <!-- Items List -->
        <div v-else class="flex-1 space-y-5 overflow-y-auto p-6">
          <div v-if="cartStore.items.length === 0" class="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <ShoppingBag class="h-16 w-16 text-gold/20" />
            <p class="font-serif text-lg italic text-text-subtle">Your cart is empty</p>
            <router-link
              to="/menu"
              class="border border-gold/30 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-base-dark"
              @click="cartStore.isCartOpen = false"
            >
              Start Exploring
            </router-link>
          </div>

          <div v-for="item in cartStore.items" :key="item.id" class="group border border-gold/10 bg-card-dark/60 p-4">
            <div class="flex gap-4">
              <div class="h-20 w-20 shrink-0 overflow-hidden border border-gold/10">
                <img :src="getImageUrl(item)" :alt="item.name" class="h-full w-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h4 class="truncate font-serif text-lg text-white">{{ item.name }}</h4>
                    <p class="mt-1 text-xs text-text-muted">Same menu items combine as quantity.</p>
                  </div>
                  <span class="whitespace-nowrap font-bold text-white">${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>

                <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center border border-gold/20">
                    <button @click="cartStore.decreaseQuantity(item.id)" class="flex h-10 w-10 items-center justify-center text-gold transition-colors hover:bg-gold hover:text-base-dark" aria-label="Decrease quantity">
                      <Minus class="h-4 w-4" />
                    </button>
                    <span class="min-w-12 text-center text-sm font-black text-white">{{ item.quantity }}</span>
                    <button @click="cartStore.increaseQuantity(item.id)" class="flex h-10 w-10 items-center justify-center text-gold transition-colors hover:bg-gold hover:text-base-dark" aria-label="Increase quantity">
                      <Plus class="h-4 w-4" />
                    </button>
                  </div>

                  <div class="flex items-center gap-3">
                    <p class="text-sm text-gold">${{ item.price.toFixed(2) }} each</p>
                    <button 
                      @click="cartStore.removeFromCart(item.id)"
                      class="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-red-400"
                    >
                      <Trash2 class="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer / Checkout -->
        <div v-if="checkoutStep !== 'success' && cartStore.items.length > 0" class="space-y-4 border-t border-gold/10 bg-base-dark/80 p-6">
          <div class="flex justify-between items-end mb-4">
            <span class="text-text-subtle uppercase tracking-widest text-xs">Total Amount</span>
            <span class="text-3xl text-gold font-serif">${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>

          <!-- Payment Info -->
          <div v-if="checkoutStep === 'payment'" class="space-y-6 rounded-2xl border border-gold/10 bg-gold/5 p-6">
            <div class="flex items-center justify-between border-b border-gold/10 pb-4">
              <div class="flex items-center gap-3 text-gold">
                <CreditCard class="w-5 h-5" />
                <span class="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout</span>
              </div>
              <span class="text-[10px] text-text-muted uppercase font-bold tracking-widest">{{ paymentMethod === 'khqr' ? 'via KHQR' : 'via Credit Card' }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button
                @click="paymentMethod = 'khqr'"
                :class="[
                  'flex items-center justify-center gap-2 border py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                  paymentMethod === 'khqr' ? 'border-gold bg-gold text-base-dark' : 'border-gold/15 text-gold hover:border-gold/50'
                ]"
              >
                <QrCode class="w-4 h-4" />
                KHQR
              </button>
              <button
                @click="paymentMethod = 'credit'"
                :class="[
                  'flex items-center justify-center gap-2 border py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                  paymentMethod === 'credit' ? 'border-gold bg-gold text-base-dark' : 'border-gold/15 text-gold hover:border-gold/50'
                ]"
              >
                <CreditCard class="w-4 h-4" />
                Card
              </button>
            </div>
            
            <div v-if="paymentMethod === 'khqr'" class="flex flex-col items-center gap-4">
                <div class="bg-white p-4 rounded-2xl shadow-2xl shadow-gold/5 transform hover:scale-105 transition-transform duration-500">
                    <img :src="khqrSvg" alt="KHQR Payment for NekMak Restaurant" class="w-44 h-56 object-contain" />
                </div>
                <div class="text-center space-y-1">
                    <p class="text-white text-xs font-bold uppercase tracking-widest">NekMak Restaurant</p>
                    <p class="text-gold text-[10px] italic">Scan with Bakong or any KHQR App</p>
                </div>
            </div>

            <form v-else class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Card Number</label>
                <input type="text" inputmode="numeric" placeholder="4242 4242 4242 4242" class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Expiry</label>
                  <input type="text" placeholder="MM/YY" class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">CVC</label>
                  <input type="text" inputmode="numeric" placeholder="123" class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold px-4 py-3 text-sm text-white outline-none" />
                </div>
              </div>
              <p class="text-text-muted text-[10px] leading-relaxed">Credit card UI is ready for your payment gateway integration.</p>
            </form>
          </div>

          <button
            v-if="checkoutStep === 'payment'"
            @click="checkoutStep = 'review'"
            class="flex w-full items-center justify-center gap-2 border border-gold/20 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-gold transition-all hover:border-gold"
          >
            <ArrowLeft class="h-4 w-4" />
            Back To Order
          </button>

          <p v-if="paymentError" class="border border-red-500/30 bg-red-950/30 p-3 text-center text-xs text-red-300">
            {{ paymentError }}
          </p>

          <button 
            @click="checkoutStep === 'review' ? goToPayment() : submitPayment()"
            :disabled="isSubmitting"
            class="flex w-full items-center justify-center gap-3 rounded-xl bg-gold py-5 text-[10px] font-black uppercase tracking-[0.4em] text-base-dark shadow-xl shadow-gold/10 transition-all duration-700 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
            {{ checkoutStep === 'review' ? 'Get To Payment' : 'Payment Complete' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
