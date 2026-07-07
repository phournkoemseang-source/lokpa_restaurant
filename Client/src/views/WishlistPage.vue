<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { useI18n } from 'vue-i18n'
import { Heart, ShoppingBag, Trash2 } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const imageSrc = (url: string | null | undefined) => {
  if (!url) return ''
  if (url && url.startsWith('http')) return url
  return `http://localhost:5001/assets/pictures/${url}`
}

const addToCartFromWishlist = (item: any) => {
  cartStore.addToCart({
    id: item.menu_item_id,
    name: item.menu_item_name,
    price: Number(item.menu_item_price),
    image_url: item.menu_item_image || '',
  })
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlist()
  }
})
</script>

<template>
  <div class="min-h-screen bg-base-dark pt-32 pb-20 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-12 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Heart class="h-8 w-8 text-gold fill-current" />
        </div>
        <h1 class="font-serif text-5xl md:text-6xl text-white mb-4">{{ t('wishlist.title') }}</h1>
        <p class="text-text-subtle max-w-xl mx-auto text-sm">{{ wishlistStore.count }} {{ t('menu.items') }}</p>
      </div>

      <!-- Wishlist Items -->
      <div v-if="wishlistStore.isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="wishlistStore.items.length === 0" class="text-center py-20 border border-dashed border-gold/20 rounded-3xl">
        <Heart class="h-16 w-16 text-gold/30 mx-auto mb-6" />
        <p class="font-serif text-2xl text-white/60 mb-4">{{ t('wishlist.empty') }}</p>
        <router-link to="/menu" class="inline-flex items-center gap-2 bg-gold text-base-dark px-8 py-4 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all">
          {{ t('wishlist.browse_menu') }}
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in wishlistStore.items" :key="item.id" class="border border-gold/10 bg-card-dark/70 rounded-2xl overflow-hidden group hover:border-gold/30 transition-all">
          <div class="relative h-48 overflow-hidden">
            <img :src="imageSrc(item.menu_item_image)" :alt="item.menu_item_name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-base-dark/80 to-transparent"></div>
            <button
              @click="wishlistStore.removeFromWishlist(item.menu_item_id)"
              class="absolute top-3 right-3 p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
              :title="t('wishlist.removed')"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <h3 class="font-serif text-xl font-bold text-white group-hover:text-gold transition-colors">{{ item.menu_item_name }}</h3>
            <div class="flex items-center justify-between">
              <span class="font-serif text-2xl text-gold">${{ Number(item.menu_item_price).toFixed(2) }}</span>
              <button
                @click="addToCartFromWishlist(item)"
                class="flex items-center gap-2 bg-gold text-base-dark px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all"
              >
                <ShoppingBag class="h-4 w-4" />
                {{ t('menu.add_to_cart') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
