<script setup lang="ts">
import { computed, ref } from 'vue'
import { X, ShoppingBag, Trash2, CreditCard, QrCode, Minus, Plus } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const paymentMethod = ref<'khqr' | 'credit'>('khqr')

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
      <text x="16" y="76" fill="#111" font-family="Arial, sans-serif" font-size="13" font-weight="700">LokPa Restaurant</text>
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
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="cartStore.isCartOpen" class="fixed inset-0 z-[100] overflow-hidden">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cartStore.isCartOpen = false"></div>

      <!-- Cart Panel -->
      <div class="absolute inset-y-0 right-0 max-w-md w-full bg-base-dark border-l border-gold/20 shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-gold/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ShoppingBag class="w-6 h-6 text-gold" />
            <h2 class="font-serif text-2xl text-white">Your Selection</h2>
          </div>
          <button @click="cartStore.isCartOpen = false" class="p-2 hover:bg-gold/10 rounded-full transition-colors">
            <X class="w-6 h-6 text-text-subtle" />
          </button>
        </div>

        <!-- Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div v-if="cartStore.items.length === 0" class="h-full flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingBag class="w-16 h-16 text-gold/20" />
            <p class="text-text-subtle font-serif italic text-lg">Your cart is empty</p>
            <button @click="$emit('close')" class="text-gold uppercase tracking-widest text-xs font-bold hover:underline">
              Start Exploring
            </button>
          </div>

          <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4 group">
            <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-gold/10">
              <img :src="getImageUrl(item)" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0 py-1">
              <h4 class="text-white font-serif text-lg truncate">{{ item.name }}</h4>
              <p class="text-gold text-sm">${{ item.price }} x {{ item.quantity }}</p>
              <div class="mt-3 flex items-center gap-3">
                <div class="flex items-center border border-gold/15">
                  <button @click="cartStore.decreaseQuantity(item.id)" class="p-2 text-gold hover:bg-gold hover:text-base-dark transition-colors" aria-label="Decrease quantity">
                    <Minus class="w-3 h-3" />
                  </button>
                  <span class="min-w-9 text-center text-xs font-bold text-white">{{ item.quantity }}</span>
                  <button @click="cartStore.increaseQuantity(item.id)" class="p-2 text-gold hover:bg-gold hover:text-base-dark transition-colors" aria-label="Increase quantity">
                    <Plus class="w-3 h-3" />
                  </button>
                </div>
                <button 
                  @click="cartStore.removeFromCart(item.id)"
                  class="text-text-muted hover:text-red-400 transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 class="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-white font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer / Checkout -->
        <div v-if="cartStore.items.length > 0" class="p-6 bg-base-dark/80 border-t border-gold/10 space-y-4">
          <div class="flex justify-between items-end mb-4">
            <span class="text-text-subtle uppercase tracking-widest text-xs">Total Amount</span>
            <span class="text-3xl text-gold font-serif">${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>

          <!-- Payment Info -->
          <div class="p-6 bg-gold/5 border border-gold/10 rounded-2xl space-y-6">
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
                    <img :src="khqrSvg" alt="KHQR Payment for LokPa Restaurant" class="w-44 h-56 object-contain" />
                </div>
                <div class="text-center space-y-1">
                    <p class="text-white text-xs font-bold uppercase tracking-widest">LokPa Restaurant</p>
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
            @click="cartStore.clearCart()"
            class="w-full bg-gold text-base-dark py-5 rounded-xl font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all duration-700 active:scale-95 shadow-xl shadow-gold/10"
          >
            Finalize Order
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
