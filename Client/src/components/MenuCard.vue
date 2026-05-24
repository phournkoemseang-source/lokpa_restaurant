<script setup lang="ts">
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
    category: string
    badge?: string
    rating?: number
  }
}>()

defineEmits<{
  (event: 'show-detail'): void
}>()

const cartStore = useCartStore()

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
  })
}
</script>

<template>
  <article class="menu-card group flex min-h-[620px] flex-col border border-gold/15 bg-card-dark/80 p-6 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/55">
    <button class="relative block w-full overflow-hidden text-left" @click="$emit('show-detail')">
      <img
        :src="getImageUrl()"
        :alt="item.name"
        class="h-72 w-full object-cover transition-transform duration-[1.1s] group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-base-dark/45 via-transparent to-transparent"></div>
      <span
        v-if="item.badge"
        class="absolute right-5 top-5 border border-gold/45 bg-base-dark/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm"
      >
        {{ item.badge }}
      </span>
    </button>

    <div class="flex flex-1 flex-col pt-8">
      <div class="flex items-start justify-between gap-5">
        <button class="min-w-0 text-left" @click="$emit('show-detail')">
          <h3 class="font-serif text-4xl leading-tight text-white transition-colors duration-300 group-hover:text-gold md:text-5xl">
            {{ item.name }}
          </h3>
        </button>
        <span class="whitespace-nowrap font-serif text-2xl text-gold">${{ item.price.toFixed(2) }}</span>
      </div>

      <div class="mt-5 flex items-center gap-2 text-gold">
        <Star class="h-5 w-5 fill-current" />
        <span class="text-sm">{{ (item.rating || 4.8).toFixed(1) }}</span>
      </div>

      <p class="mt-7 line-clamp-3 text-lg leading-8 text-white/68">
        {{ item.description }}
      </p>

      <button
        @click="addItem"
        class="mt-auto w-full bg-gold py-5 text-xs font-black uppercase tracking-[0.35em] text-base-dark transition-all duration-500 hover:bg-white active:scale-[0.98]"
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
