<script setup lang="ts">
import { ChefHat, Loader2, Info, ShoppingBag, Search, ChevronRight, X } from 'lucide-vue-next'
import { ref, onMounted, computed } from 'vue'
import MenuCard from '@/components/MenuCard.vue'
import { useCartStore } from '@/stores/cart'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  cuisine: Cuisine
  image_url: string
  imageSrc: string
  available: boolean
}

type Cuisine = 'Asia Foods' | 'Europe Foods'

const imageModules = import.meta.glob('../assets/pictures/**/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const categoryOrder = ['Foods', 'Drinks', 'Fruites', 'Pizza&Buger', 'Sweets', 'Vegeterain', 'Wines']

const cuisineOptions: Array<{ name: Cuisine; description: string; heroCategory: string }> = [
  {
    name: 'Asia Foods',
    description: 'Cambodian and Asian-inspired plates with herbs, rice, seafood, fruit, and warm spices.',
    heroCategory: 'Foods',
  },
  {
    name: 'Europe Foods',
    description: 'European comfort and fine-dining choices: pizza, burgers, desserts, wines, and garden plates.',
    heroCategory: 'Pizza&Buger',
  },
]

const categoryCuisine: Record<string, Cuisine> = {
  // UI categories (photo folders)
  Foods: 'Asia Foods',
  Drinks: 'Asia Foods',
  Fruites: 'Asia Foods',
  Vegeterain: 'Europe Foods',
  'Pizza&Buger': 'Europe Foods',
  Sweets: 'Europe Foods',
  Wines: 'Europe Foods',

  // Server categories (current DB seed uses these)
  appetizer: 'Asia Foods',
  main: 'Asia Foods',
  dessert: 'Europe Foods',
  // fallback for unknown categories handled in normalizeCuisineCategory
}

const categoryCopy: Record<string, { title: string; description: string; basePrice: number }> = {
  Foods: {
    title: 'Khmer Fine Dining',
    description: 'A polished plate inspired by Cambodian comfort, bright herbs, and slow-built flavor.',
    basePrice: 24,
  },
  Drinks: {
    title: 'Signature Pour',
    description: 'A refreshing house beverage balanced for dinner, conversation, and slow evenings.',
    basePrice: 8,
  },
  Fruites: {
    title: 'Seasonal Fruit Plate',
    description: 'Ripe market fruit arranged with a clean finish and a bright tropical note.',
    basePrice: 10,
  },
  'Pizza&Buger': {
    title: 'Fire Table Classic',
    description: 'Golden crusts and generous fillings made for sharing at the center of the table.',
    basePrice: 18,
  },
  Sweets: {
    title: 'Palm Sugar Dessert',
    description: 'A soft, elegant sweet with coconut, fruit, and a delicate pastry-shop finish.',
    basePrice: 12,
  },
  Vegeterain: {
    title: 'Garden Composition',
    description: 'Vegetable-forward dining with clean textures, herbs, and a quietly rich sauce.',
    basePrice: 15,
  },
  Wines: {
    title: 'Cellar Selection',
    description: 'A curated bottle chosen to lift the food without overpowering the table.',
    basePrice: 22,
  },
}

const featuredNames = [
  'Signature Amok',
  'Mekong Ribeye',
  'Lime Carpaccio',
  'Emerald Prawns',
  'Anis-Glazed Duck',
  'Black Gold Linguine',
]

const menuItems = ref<MenuItem[]>([])
const isLoading = ref(true)
const error = ref('')
const activeCategory = ref('Foods')
const activeCuisine = ref<Cuisine>('Asia Foods')
const searchQuery = ref('')
const selectedItem = ref<MenuItem | null>(null)

const cartStore = useCartStore()

const categories = computed(() => {
  const cuisineCategories = categoryOrder.filter((category) => categoryCuisine[category] === activeCuisine.value)
  return ['All', ...cuisineCategories]
})

const cleanName = (path: string, category: string, index: number) => {
  if (category === 'Foods' && featuredNames[index]) return featuredNames[index]

  return path
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '')
    .replace(/\s*\(\d+\)/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b(unsplash|pexels|pixabay|jpg|jpeg|png|food|photo|photographer|stylist|1920)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || `${categoryCopy[category].title} ${index + 1}`
}

const localMenuItems = computed<MenuItem[]>(() => {
  let id = 1
  return Object.entries(imageModules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => {
      const category = path.split('/pictures/')[1]?.split('/')[0] || 'Foods'
      const categoryItems = Object.keys(imageModules)
        .filter((candidate) => candidate.includes(`/pictures/${category}/`))
        .sort()
      const index = categoryItems.indexOf(path)
      const copy = categoryCopy[category] || categoryCopy.Foods

      return {
        id: id++,
        name: cleanName(path, category, Math.max(index, 0)),
        description: copy.description,
        price: copy.basePrice + (Math.max(index, 0) % 4) * 2,
        category,
        cuisine: categoryCuisine[category] || 'Asia Foods',
        image_url: path.split('/pictures/')[1] || '',
        imageSrc: src,
        available: true,
      }
    })
})

const categoryTiles = computed(() => {
  return categoryOrder
    .filter((category) => categoryCuisine[category] === activeCuisine.value)
    .map((category) => {
    const firstItem = localMenuItems.value.find((item) => item.category === category)
    return {
      name: category,
      imageSrc: firstItem?.imageSrc || '',
      total: localMenuItems.value.filter((item) => item.category === category).length,
    }
  })
})

const cuisineTiles = computed(() => {
  return cuisineOptions.map((cuisine) => {
    const firstItem = localMenuItems.value.find((item) => item.category === cuisine.heroCategory)
    const total = localMenuItems.value.filter((item) => item.cuisine === cuisine.name).length
    return {
      ...cuisine,
      imageSrc: firstItem?.imageSrc || '',
      total,
    }
  })
})

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5001/api/menu')
    if (response.ok) {
      const serverItems = await response.json()
      if (serverItems.length > 0) {
        menuItems.value = serverItems.map((item: MenuItem, index: number) => ({
          ...item,
          id: item.id || index + 1,
          category: categoryOrder.includes(item.category) ? item.category : 'Foods',
          cuisine: categoryCuisine[item.category as any] || (categoryCuisine[categoryOrder.includes(item.category) ? item.category : 'Foods'] || 'Asia Foods'),
          imageSrc: item.image_url ? new URL(`../assets/pictures/${item.image_url}`, import.meta.url).href : localMenuItems.value[index]?.imageSrc,
        }))
      } else {
        menuItems.value = localMenuItems.value
      }
    } else {
      menuItems.value = localMenuItems.value
    }
  } catch (err) {
    menuItems.value = localMenuItems.value
    error.value = 'Showing the local photo menu while the server is offline.'
  } finally {
    isLoading.value = false
  }
})

const normalizeCuisineCategory = (item: Pick<MenuItem, 'category' | 'cuisine'>) => {
  const normalizedCategory = item.category
  const cuisineFromCategory = categoryCuisine[normalizedCategory] || 'Asia Foods'

  const normalizedCuisine: Cuisine = (item.cuisine === 'Asia Foods' || item.cuisine === 'Europe Foods')
    ? item.cuisine
    : cuisineFromCategory

  return { category: normalizedCategory, cuisine: normalizedCuisine }
}

const matchingItems = computed(() => {
  let items = menuItems.value.map((item) => {
    const normalized = normalizeCuisineCategory(item)
    return { ...item, cuisine: normalized.cuisine, category: normalized.category }
  })

  items = items.filter((item) => item.cuisine === activeCuisine.value)

  if (activeCategory.value !== 'All') {
    items = items.filter((item) => item.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }

  return items
})

const featuredItems = computed(() => matchingItems.value.slice(0, 3))
const detailItems = computed(() => activeCategory.value === 'All' ? matchingItems.value : matchingItems.value)

const selectCategory = (category: string) => {
  activeCategory.value = category
  searchQuery.value = ''
}

const selectCuisine = (cuisine: Cuisine) => {
  activeCuisine.value = cuisine
  activeCategory.value = 'All'
  searchQuery.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <section class="relative min-h-[76vh] flex items-center justify-center overflow-hidden">
      <img
        src="@/assets/pictures/Foods/sharonang-fish-amok-921926_1920.jpg"
        alt="LokPa signature menu"
        class="absolute inset-0 w-full h-full object-cover opacity-55 scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark/90 via-base-dark/45 to-base-dark"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-transparent to-base-dark/50"></div>

      <div class="relative z-10 text-center space-y-8 px-6 max-w-4xl">
        <div class="flex items-center justify-center gap-4 mb-4">
          <div class="h-px w-12 bg-gold/50"></div>
          <span class="text-gold tracking-[0.5em] uppercase text-xs font-bold">LokPa Gastronomy</span>
          <div class="h-px w-12 bg-gold/50"></div>
        </div>
        <h1 class="font-serif text-7xl md:text-9xl text-white tracking-tighter leading-none">The Menu</h1>
        <p class="text-text-subtle text-lg md:text-xl font-serif italic max-w-2xl mx-auto leading-relaxed">
          Choose Asia Foods or Europe Foods, then save favorite dishes to your cart before ordering.
        </p>

        <div class="pt-8">
          <button @click="selectCuisine('Asia Foods')" class="group flex items-center gap-3 mx-auto text-gold uppercase tracking-[0.3em] text-[10px] font-bold hover:text-white transition-colors">
            Explore Asia Foods
            <ChevronRight class="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>

    <div class="sticky top-16 z-40 bg-base-dark/95 border-b border-gold/10 backdrop-blur-md">
      <div class="container mx-auto px-6 lg:px-16 py-5 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="cuisine in cuisineTiles"
            :key="cuisine.name"
            @click="selectCuisine(cuisine.name)"
            :class="[
              'relative min-h-36 overflow-hidden border text-left transition-all duration-500 group',
              activeCuisine === cuisine.name ? 'border-gold shadow-2xl shadow-gold/10' : 'border-gold/10 hover:border-gold/40'
            ]"
          >
            <img :src="cuisine.imageSrc" :alt="cuisine.name" class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-base-dark/75 to-base-dark/20"></div>
            <div class="relative z-10 p-6 max-w-xl">
              <p class="text-gold uppercase tracking-[0.3em] text-[10px] font-black">{{ cuisine.total }} items</p>
              <h2 class="font-serif text-4xl text-white mt-2">{{ cuisine.name }}</h2>
              <p class="text-white/65 text-sm mt-3 leading-relaxed">{{ cuisine.description }}</p>
            </div>
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <button
            v-for="tile in categoryTiles"
            :key="tile.name"
            @click="selectCategory(tile.name)"
            :class="[
              'relative h-20 overflow-hidden border transition-all duration-500 text-left group',
              activeCategory === tile.name ? 'border-gold shadow-xl shadow-gold/10' : 'border-gold/10 hover:border-gold/40'
            ]"
          >
            <img :src="tile.imageSrc" :alt="tile.name" class="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-base-dark/55"></div>
            <span class="relative z-10 block px-3 pt-4 text-gold uppercase tracking-[0.2em] text-[9px] font-black">{{ tile.name }}</span>
            <span class="relative z-10 block px-3 text-white/70 text-[10px]">{{ tile.total }} plates</span>
          </button>
        </div>

        <div class="flex flex-col md:flex-row justify-between items-center gap-5">
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="selectCategory(cat)"
              :class="[
                'px-5 py-2 rounded-full transition-all duration-500 uppercase tracking-widest text-[9px] font-black',
                activeCategory === cat ? 'bg-gold text-base-dark shadow-xl shadow-gold/20' : 'text-text-muted hover:text-gold'
              ]"
            >
              {{ cat }}
            </button>
          </div>

          <div class="relative w-full md:w-80 group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/30 group-focus-within:text-gold transition-colors" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search the menu..."
              class="w-full bg-transparent border-b border-gold/20 py-2 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-all placeholder:text-text-muted italic"
            />
          </div>
        </div>
      </div>
    </div>

    <section class="container mx-auto px-6 lg:px-16 py-20">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-40">
        <Loader2 class="w-12 h-12 text-gold animate-spin mb-6" />
        <p class="text-gold tracking-[0.3em] uppercase text-xs font-bold">Curating Excellence...</p>
      </div>

      <div v-else>
        <p v-if="error" class="mb-8 text-center text-gold/80 text-xs uppercase tracking-[0.2em]">{{ error }}</p>

        <div class="mb-12 flex items-end justify-between gap-6">
          <div>
            <div class="flex items-center gap-3 text-gold uppercase tracking-[0.3em] text-[10px] font-black">
              <ChefHat class="w-4 h-4" />
              Exactly three featured cards
            </div>
            <h2 class="font-serif text-4xl md:text-5xl mt-3">{{ activeCategory === 'All' ? activeCuisine : activeCategory }}</h2>
          </div>
          <p class="hidden md:block text-text-muted text-sm max-w-sm text-right">
            Choose a category above to browse every matching photo below while the main cards stay focused.
          </p>
        </div>

        <div v-if="featuredItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <MenuCard
            v-for="item in featuredItems"
            :key="item.id"
            :item="item"
            @show-detail="selectedItem = item"
          />
        </div>

        <div v-else class="text-center py-32 space-y-8">
          <div class="w-24 h-24 border border-dashed border-gold/20 rounded-full flex items-center justify-center mx-auto">
            <Info class="w-8 h-8 text-gold/20" />
          </div>
          <div class="space-y-4">
            <p class="font-serif text-4xl text-white">Seasonal Refresh</p>
            <p class="text-text-muted italic max-w-md mx-auto">Try a different category or clear your search.</p>
            <button @click="selectCategory('Foods')" class="text-gold uppercase tracking-widest text-xs font-bold hover:underline">Return to Foods</button>
          </div>
        </div>

        <div v-if="detailItems.length > 0" class="mt-20 border-t border-gold/10 pt-12">
          <div class="flex items-center justify-between gap-6 mb-8">
            <div>
              <p class="text-gold uppercase tracking-[0.3em] text-[10px] font-black">Full Category Detail</p>
              <h3 class="font-serif text-3xl text-white mt-2">{{ activeCategory === 'All' ? `${activeCuisine} Menu` : `${activeCategory} Menu` }}</h3>
            </div>
            <span class="text-text-muted text-xs uppercase tracking-widest">{{ detailItems.length }} items</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <button
              v-for="item in detailItems"
              :key="`detail-${item.id}`"
              @click="selectedItem = item"
              class="group text-left border border-gold/10 bg-card-dark/40 hover:border-gold/50 transition-all overflow-hidden"
            >
              <div class="aspect-square overflow-hidden">
                <img :src="item.imageSrc" :alt="item.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              </div>
              <div class="p-3 min-h-24">
                <p class="text-white text-sm font-serif leading-tight line-clamp-2">{{ item.name }}</p>
                <p class="text-gold text-xs mt-2">${{ item.price.toFixed(2) }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <Transition name="fade">
      <div v-if="selectedItem" class="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" @click.self="selectedItem = null">
        <div class="bg-base-dark border border-gold/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <button @click="selectedItem = null" class="float-right m-4 p-2 text-gold hover:text-white">
            <X class="w-6 h-6" />
          </button>
          <div class="grid grid-cols-1 md:grid-cols-2">
            <img :src="selectedItem.imageSrc" :alt="selectedItem.name" class="w-full h-full min-h-[360px] object-cover" />
            <div class="p-8 md:p-10 space-y-6">
              <p class="text-gold uppercase tracking-[0.3em] text-[10px] font-black">{{ selectedItem.cuisine }} / {{ selectedItem.category }}</p>
              <h3 class="font-serif text-4xl md:text-5xl text-white">{{ selectedItem.name }}</h3>
              <p class="text-text-subtle leading-relaxed">{{ selectedItem.description }}</p>
              <div class="text-gold font-serif text-4xl">${{ selectedItem.price.toFixed(2) }}</div>
              <button
                @click="cartStore.addToCart({ id: selectedItem.id, name: selectedItem.name, price: selectedItem.price, image_url: selectedItem.image_url, imageSrc: selectedItem.imageSrc })"
                class="w-full bg-gold text-base-dark py-4 font-black uppercase tracking-[0.3em] text-xs hover:bg-white transition-colors"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div class="fixed bottom-8 right-8 z-[90] flex flex-col gap-4">
      <button
        @click="cartStore.toggleCart()"
        class="bg-gold text-base-dark p-5 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group relative"
        aria-label="Open saved cart"
      >
        <ShoppingBag class="w-6 h-6" />
        <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-white text-base-dark text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-gold animate-bounce">
          {{ cartStore.totalItems }}
        </span>
      </button>
    </div>
  </div>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
