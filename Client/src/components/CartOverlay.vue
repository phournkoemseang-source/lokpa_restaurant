<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, ShoppingBag, Trash2, CreditCard, QrCode, Minus, Plus, ArrowLeft, CheckCircle, Loader2, Store, Heart } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import qrImage from '@/assets/images/qr.jpg'

const { t } = useI18n()
const cartStore = useCartStore()
const authStore = useAuthStore()
const checkoutStep = ref<'review' | 'payment' | 'success'>('review')
const paymentMethod = ref<'khqr' | 'credit'>('khqr')
const isSubmitting = ref(false)
const paymentError = ref('')
const paidOrderId = ref<number | null>(null)
const paidOrderSummary = ref('')
const orderType = ref<'dinein' | 'takeaway'>('dinein')
const selectedTableId = ref<number | null>(null)

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

const goToPayment = () => {
  paymentError.value = ''
  checkoutStep.value = 'payment'
}

const submitPayment = async () => {
  paymentError.value = ''

  if (!authStore.token) {
    paymentError.value = t('menu.login_to_rate')
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
        orderType: orderType.value,
        tableId: selectedTableId.value,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.message || 'Payment failed.')
    }

    const data = await response.json()
    paidOrderId.value = data.id
    paidOrderSummary.value = cartSummary.value
    cartStore.clearCart()
    checkoutStep.value = 'success'
  } catch (error) {
    paymentError.value = error instanceof Error ? error.message : 'Payment failed.'
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
      <div
        class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gold/20 bg-base-dark shadow-2xl">
        <!-- Header -->
        <div class="shrink-0 border-b border-gold/10 p-6">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <ShoppingBag class="h-6 w-6 text-gold" />
              <div>
                <h2 class="font-serif text-2xl text-white">LokPa Restaurant</h2>
                <p class="mt-1 text-xs text-text-subtle">{{ cartStore.items.length ? cartSummary : t('cart.select_your_dishes') }}</p>
              </div>
            </div>
            <button @click="cartStore.isCartOpen = false" class="p-2 transition-colors hover:bg-gold/10"
              :aria-label="t('cart.title')">
              <X class="h-6 w-6 text-text-subtle" />
            </button>
          </div>

          <router-link to="/menu"
            class="mt-5 flex h-12 w-full items-center justify-center gap-3 border border-gold/20 bg-card-dark/70 text-[10px] font-black uppercase tracking-[0.26em] text-gold transition-all hover:border-gold hover:bg-gold hover:text-base-dark"
            @click="cartStore.isCartOpen = false">
            <Plus class="h-4 w-4" />
            {{ t('cart.add_more_items') }}
          </router-link>
        </div>

        <!-- Success State -->
        <div v-if="checkoutStep === 'success'" class="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <CheckCircle class="h-16 w-16 text-gold" />
          <h3 class="mt-6 font-serif text-3xl text-white">{{ t('cart.payment_success') }}</h3>
          <p class="mt-3 max-w-xs text-sm leading-7 text-text-subtle">
            {{ t('cart.success_message') }}
          </p>
          <p class="mt-2 text-xs text-text-muted">{{ t('cart.order_sent_kitchen', { id: paidOrderId }) }}</p>
          <p class="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-gold">{{ paidOrderSummary }}</p>
          <button @click="cartStore.isCartOpen = false"
            class="mt-8 w-full bg-gold py-5 text-[10px] font-black uppercase tracking-[0.35em] text-base-dark transition-all hover:bg-white">
            {{ t('cart.done') }}
          </button>
        </div>

        <!-- Scrollable Content: Items + Order Type + Payment Form -->
        <div v-else class="flex-1 min-h-0 space-y-5 overflow-y-auto p-6">
          <!-- Empty State -->
          <div v-if="cartStore.items.length === 0"
            class="flex h-full flex-col items-center justify-center space-y-4 text-center">
            <ShoppingBag class="h-16 w-16 text-gold/20" />
            <p class="font-serif text-lg italic text-text-subtle">{{ t('cart.empty') }}</p>
            <router-link to="/menu"
              class="border border-gold/30 px-5 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-all hover:bg-gold hover:text-base-dark"
              @click="cartStore.isCartOpen = false">
              {{ t('cart.start_exploring') }}
            </router-link>
          </div>

          <!-- Cart Items -->
          <template v-if="cartStore.items.length > 0">
            <div v-for="item in cartStore.items" :key="item.id" class="group border border-gold/10 bg-card-dark/60 p-4">
              <div class="flex gap-4">
                <div class="h-20 w-20 shrink-0 overflow-hidden border border-gold/10">
                  <img :src="getImageUrl(item)" :alt="item.name" class="h-full w-full object-cover" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h4 class="truncate font-serif text-lg text-white">{{ item.name }}</h4>
                      <p class="mt-1 text-xs text-text-muted">{{ t('cart.quantity') }}</p>
                    </div>
                    <span class="whitespace-nowrap font-bold text-white">${{ (item.price * item.quantity).toFixed(2)
                      }}</span>
                  </div>

                  <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center border border-gold/20">
                      <button @click="cartStore.decreaseQuantity(item.id)"
                        class="flex h-10 w-10 items-center justify-center text-gold transition-colors hover:bg-gold hover:text-base-dark"
                        aria-label="Decrease quantity">
                        <Minus class="h-4 w-4" />
                      </button>
                      <span class="min-w-12 text-center text-sm font-black text-white">{{ item.quantity }}</span>
                      <button @click="cartStore.increaseQuantity(item.id)"
                        class="flex h-10 w-10 items-center justify-center text-gold transition-colors hover:bg-gold hover:text-base-dark"
                        aria-label="Increase quantity">
                        <Plus class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="flex items-center gap-3">                      <p class="text-sm text-gold">${{ item.price.toFixed(2) }} {{ t('cart.each') }}</p>
                        <button @click="cartStore.removeFromCart(item.id)"
                          class="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-red-400">
                          <Trash2 class="h-3 w-3" />
                          {{ t('cart.remove') }}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Type Selection - in scrollable area -->
            <div class="border-t border-gold/10 pt-6">
              <label class="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-gold">{{ t('cart.order_type') }}</label>
              <div class="grid grid-cols-2 gap-2">
                <button @click="orderType = 'dinein'"
                  :class="['flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl', orderType === 'dinein' ? 'bg-gold text-base-dark' : 'border border-gold/15 text-gold hover:border-gold/50']">
                  {{ t('cart.dine_in_label') }}
                </button>
                <button @click="orderType = 'takeaway'"
                  :class="['flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl', orderType === 'takeaway' ? 'bg-gold text-base-dark' : 'border border-gold/15 text-gold hover:border-gold/50']">
                  {{ t('cart.takeaway_label') }}
                </button>
              </div>
            </div>

            <!-- Payment Form - in scrollable area (only on payment step) -->
            <div v-if="checkoutStep === 'payment'" class="space-y-6 rounded-2xl border border-gold/10 bg-gold/5 p-6">
              <div class="flex items-center justify-between border-b border-gold/10 pb-4">
                <div class="flex items-center gap-3 text-gold">
                  <CreditCard class="w-5 h-5" />
                  <span class="text-[10px] font-black uppercase tracking-[0.2em]">{{ t('cart.secure_payment') }}</span>
                </div>
                <span class="text-[10px] text-text-muted uppercase font-bold tracking-widest">{{ t('cart.secure_payment') }}</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button @click="paymentMethod = 'khqr'" :class="[
                  'flex items-center justify-center gap-2 border py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                  paymentMethod === 'khqr' ? 'border-gold bg-gold text-base-dark' : 'border-gold/15 text-gold hover:border-gold/50'
                ]">
                  <QrCode class="w-4 h-4" />
                  KHQR
                </button>
                <button @click="paymentMethod = 'credit'" :class="[
                  'flex items-center justify-center gap-2 border py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                  paymentMethod === 'credit' ? 'border-gold bg-gold text-base-dark' : 'border-gold/15 text-gold hover:border-gold/50'
                ]">
                  <CreditCard class="w-4 h-4" />
                  Card
                </button>
              </div>

              <!-- KHQR with REAL image -->
              <div v-if="paymentMethod === 'khqr'" class="flex flex-col items-center gap-4">
                <div
                  class="bg-white p-4 rounded-2xl shadow-2xl shadow-gold/5 transform hover:scale-105 transition-transform duration-500">
                  <img :src="qrImage" alt="KHQR Payment for LokPa Restaurant" class="w-44 h-44 object-contain" />
                </div>
                <div class="text-center space-y-1">
                  <p class="text-white text-xs font-bold uppercase tracking-widest">LokPa Restaurant</p>
                  <p class="text-gold text-[10px] italic">{{ t('cart.scan_with_bakong') }}</p>
                </div>
              </div>

              <!-- Credit Card Form -->
              <form v-else class="space-y-4">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{{ t('cart.card_number') }}</label>
                  <input type="text" inputmode="numeric" placeholder="4242 4242 4242 4242"
                    class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{{ t('cart.expiry') }}</label>
                    <input type="text" placeholder="MM/YY"
                      class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold px-4 py-3 text-sm text-white outline-none" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{{ t('cart.cvc') }}</label>
                    <input type="text" inputmode="numeric" placeholder="123"
                      class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold px-4 py-3 text-sm text-white outline-none" />
                  </div>
                </div>
                <p class="text-text-muted text-[10px] leading-relaxed">
                  {{ t('cart.card_hint') }}</p>
              </form>
            </div>
          </template>
        </div>

        <!-- Footer: Total + Action Button (always visible at bottom) -->
        <div v-if="checkoutStep !== 'success' && cartStore.items.length > 0"
          class="shrink-0 border-t border-gold/10 bg-base-dark/95 p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-text-subtle uppercase tracking-widest text-xs font-bold">{{ t('cart.total_label') }}</span>
            <span class="text-3xl text-gold font-serif">${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>

          <!-- Back to Review button (when on payment step) -->
          <button v-if="checkoutStep === 'payment'" @click="checkoutStep = 'review'"
            class="mb-3 flex w-full items-center justify-center gap-2 border border-gold/20 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-gold transition-all hover:border-gold rounded-xl">
            <ArrowLeft class="h-4 w-4" />
            {{ t('cart.back_to_review') }}
          </button>

          <!-- Error Message -->
          <p v-if="paymentError"
            class="mb-3 border border-red-500/30 bg-red-950/30 p-3 text-center text-xs text-red-300 rounded-xl">
            {{ paymentError }}
          </p>

          <!-- Action Button (always visible) -->
          <button @click="checkoutStep === 'review' ? goToPayment() : submitPayment()" :disabled="isSubmitting"
            class="flex w-full items-center justify-center gap-3 rounded-xl bg-gold py-5 text-[10px] font-black uppercase tracking-[0.4em] text-base-dark shadow-xl shadow-gold/20 transition-all duration-700 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
            {{ checkoutStep === 'review' ? t('cart.go_to_payment') : t('cart.confirm_payment') }}
          </button>

          <div class="mt-4 flex items-center justify-center gap-2 text-center">
            <Store class="h-3 w-3 text-gold/60" />
            <p class="text-[10px] text-text-muted">{{ t('cart.restaurant_name') }} — {{ t('cart.modern_fusion_tag') }}</p>
            <Heart class="h-3 w-3 text-gold/60" />
          </div>
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
