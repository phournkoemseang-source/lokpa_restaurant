<script setup lang="ts">
import { Heart, Star } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  item: {
    id: number
    name: string
    description: string
    price: number
    image_url: string
    imageSrc?: string
    category: string
  }
}>()

defineEmits<{
  (event: 'show-detail'): void
}>()

const cartStore = useCartStore()
const authStore = useAuthStore()
const isFavorite = ref(false)
const rating = ref(0)
const comment = ref('')
const status = ref('')

const storageKey = () => `lokpa-menu-feedback-${props.item.id}`

const getImageUrl = () => {
  if (props.item.imageSrc) return props.item.imageSrc
  if (!props.item.image_url) return '/placeholder-food.jpg'
  return new URL(`../assets/pictures/${props.item.image_url}`, import.meta.url).href
}

const loadFeedback = () => {
  const saved = localStorage.getItem(storageKey())
  if (!saved) return

  try {
    const feedback = JSON.parse(saved)
    isFavorite.value = Boolean(feedback.isFavorite)
    rating.value = Number(feedback.rating) || 0
    comment.value = feedback.comment || ''
  } catch {
    localStorage.removeItem(storageKey())
  }
}

const persistFeedback = async () => {
  const feedback = {
    isFavorite: isFavorite.value,
    rating: rating.value,
    comment: comment.value,
  }

  localStorage.setItem(storageKey(), JSON.stringify(feedback))
  status.value = 'Saved'

  if (!authStore.token || (!rating.value && !comment.value && !isFavorite.value)) return

  try {
    await fetch('http://localhost:5001/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        menuItemId: props.item.id,
        rating: rating.value || 1,
        comment: comment.value,
        isFavorite: isFavorite.value,
      }),
    })
  } catch {
    status.value = 'Saved on this device'
  }
}

const setRating = (newRating: number) => {
  rating.value = newRating
  persistFeedback()
}

const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  persistFeedback()
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

onMounted(loadFeedback)
watch(() => props.item.id, loadFeedback)
</script>

<template>
  <article class="group bg-card-dark/70 border border-gold/15 hover:border-gold/50 transition-all duration-500 overflow-hidden shadow-2xl">
    <button class="relative block w-full aspect-[1.18] overflow-hidden text-left" @click="$emit('show-detail')">
      <img
        :src="getImageUrl()"
        :alt="item.name"
        class="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-base-dark/50 via-transparent to-transparent"></div>
      <span class="absolute top-4 right-4 bg-gold/90 text-base-dark text-[10px] font-black uppercase tracking-[0.22em] px-4 py-2">
        {{ item.category }}
      </span>
    </button>

    <div class="p-6 md:p-8 space-y-6">
      <div class="flex items-start justify-between gap-4">
        <button class="text-left min-w-0" @click="$emit('show-detail')">
          <h3 class="font-serif text-3xl md:text-4xl text-white leading-tight group-hover:text-gold transition-colors">
            {{ item.name }}
          </h3>
        </button>
        <span class="font-serif text-2xl md:text-3xl text-gold whitespace-nowrap">${{ item.price.toFixed(2) }}</span>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-1" aria-label="Rate this dish">
          <button v-for="n in 5" :key="n" @click="setRating(n)" class="p-1 hover:scale-110 transition-transform" :aria-label="`Rate ${n} star`">
            <Star class="w-5 h-5" :class="n <= rating ? 'text-gold fill-current' : 'text-white/35'" />
          </button>
        </div>

        <button
          @click="toggleFavorite"
          class="p-2 border border-white/10 hover:border-gold/50 transition-colors"
          :aria-label="isFavorite ? 'Remove favorite' : 'Add favorite'"
        >
          <Heart class="w-5 h-5" :class="isFavorite ? 'text-gold fill-current' : 'text-white/60'" />
        </button>
      </div>

      <p class="text-text-subtle text-sm leading-relaxed line-clamp-2">
        {{ item.description }}
      </p>

      <textarea
        v-model="comment"
        @blur="persistFeedback"
        rows="2"
        placeholder="Leave your note..."
        class="w-full bg-base-dark/70 border border-gold/10 focus:border-gold/60 px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none resize-none"
      ></textarea>
      <p v-if="status" class="text-[10px] text-gold/80 uppercase tracking-[0.2em]">{{ status }}</p>

      <button
        @click="addItem"
        class="w-full bg-gold text-base-dark py-4 font-black uppercase tracking-[0.35em] text-xs hover:bg-white transition-all duration-500 active:scale-[0.98]"
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
