<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  item: {
    id: number
    name: string
    description: string
    price: number
    image_url: string
    imageSrc?: string
    menuItemId?: number
    category: string
    cuisine?: string
    badge?: string
    rating?: number | null
    ratingCount?: number
  }
}>()

defineEmits<{
  (event: 'show-detail'): void
}>()

const cartStore = useCartStore()

const ratingLabel = computed(() => {
  if (!props.item.rating || !props.item.ratingCount) return 'No ratings yet'
  return `${props.item.rating.toFixed(1)} (${props.item.ratingCount})`
})

const getImageUrl = () => {
  if (props.item.imageSrc) return props.item.imageSrc
  if (!props.item.image_url) return '/placeholder-food.jpg'
  return new URL(`../assets/pictures/${props.item.image_url}`, import.meta.url).href
}

const addItem = () => {
  cartStore.addToCart({
    id: props.item.id,
    name: props.item.name,
    price: props.item.price,
    image_url: props.item.image_url,
    imageSrc: props.item.imageSrc,
    menuItemId: props.item.menuItemId,
  })
}
</script>

<template>
  <article class="menu-card group relative flex h-[560px] flex-col border border-gold/15 bg-card-dark/80 p-5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/55 hover:shadow-gold/10">
    <button class="relative block w-full overflow-hidden text-left" @click="$emit('show-detail')">
      <img
        :src="getImageUrl()"
        :alt="item.name"
        class="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-base-dark/45 via-transparent to-transparent"></div>
      <span
        v-if="item.badge"
        class="absolute right-5 top-5 border border-gold/45 bg-base-dark/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm"
      >
        {{ item.badge }}
      </span>
    </button>

    <div class="flex flex-1 flex-col pt-6">
      <div class="flex items-start justify-between gap-5">
        <button class="min-w-0 text-left" @click="$emit('show-detail')">
          <h3 class="font-serif text-3xl leading-tight text-white transition-colors duration-300 group-hover:text-gold">
            {{ item.name }}
          </h3>
        </button>
        <span class="whitespace-nowrap font-serif text-2xl text-gold">${{ item.price.toFixed(2) }}</span>
      </div>

      <div class="mt-4 flex items-center gap-2" :class="item.rating && item.ratingCount ? 'text-gold' : 'text-text-muted'">
        <Star class="h-5 w-5" :class="item.rating && item.ratingCount ? 'fill-current' : ''" />
        <span class="text-sm">{{ ratingLabel }}</span>
      </div>

      <p class="mt-5 line-clamp-3 text-sm leading-7 text-white/68">
        {{ item.description }}
      </p>

      <button
        @click="addItem"
        class="mt-auto w-full bg-gold py-4 text-xs font-black uppercase tracking-[0.3em] text-base-dark transition-all duration-500 hover:bg-white active:scale-[0.98]"
      >
        Add To Cart
      </button>
    </div>
  </article>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

.menu-card {
  content-visibility: auto;
  contain-intrinsic-size: 1px 560px;
  background-image:
    radial-gradient(circle at 15% 0%, rgba(212, 175, 55, 0.08), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent 45%);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
