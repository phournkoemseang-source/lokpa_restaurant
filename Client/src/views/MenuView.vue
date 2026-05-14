<script setup lang="ts">
import { ChefHat, Loader2, Info } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  category: 'appetizer' | 'main' | 'dessert' | 'drink'
  available: boolean
}

const menuItems = ref<MenuItem[]>([])
const isLoading = ref(true)
const error = ref('')

const categories = {
  appetizer: 'Appetizers',
  main: 'Main Courses',
  dessert: 'Desserts',
  drink: 'Drinks'
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5001/api/menu')
    if (!response.ok) throw new Error('Failed to fetch menu')
    menuItems.value = await response.json()
  } catch (err) {
    error.value = 'Could not load the menu. Please try again later.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

const getItemsByCategory = (category: string) => {
  return menuItems.value.filter(item => item.category === category)
}
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <!-- Hero Banner -->
    <section class="relative h-[40vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-[url('@/assets/Images/The%20Menu%20_%20Nekmak%20Modern%20Fusion%20(Interactive).png')] bg-cover bg-center opacity-30 grayscale scale-110"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark/80 via-transparent to-base-dark"></div>
      
      <div class="relative z-10 text-center space-y-4">
        <ChefHat class="w-12 h-12 text-gold mx-auto mb-4" />
        <h1 class="font-serif text-5xl md:text-6xl text-white">The Menu</h1>
        <p class="text-gold tracking-[0.3em] uppercase text-xs font-bold">Modern Fusion Gastronomy</p>
      </div>
    </section>

    <section class="container mx-auto px-6 lg:px-16 py-24">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <Loader2 class="w-10 h-10 text-gold animate-spin mb-4" />
        <p class="text-text-subtle tracking-widest uppercase text-xs">Curating Selections...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 border border-red-500/20 bg-red-500/5">
        <p class="text-red-400 font-serif text-xl">{{ error }}</p>
      </div>

      <!-- Menu Grid -->
      <div v-else class="space-y-32">
        <div 
          v-for="(label, key) in categories" 
          :key="key"
          class="space-y-12"
        >
          <!-- Category Header -->
          <div class="flex items-center gap-8">
            <h2 class="font-serif text-4xl text-white shrink-0">{{ label }}</h2>
            <div class="h-px bg-gold/30 flex-1"></div>
          </div>

          <!-- Items Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
            <div 
              v-for="item in getItemsByCategory(key)" 
              :key="item.id" 
              class="group cursor-default"
            >
              <div class="flex justify-between items-end mb-2 pb-2 border-b border-border-card/30 group-hover:border-gold/50 transition-colors">
                <h4 class="font-serif text-xl text-white group-hover:text-gold transition-colors">{{ item.name }}</h4>
                <span class="text-gold font-serif text-lg">${{ item.price }}</span>
              </div>
              <p class="text-text-subtle text-sm leading-relaxed italic">{{ item.description }}</p>
            </div>

            <!-- Empty State for Category -->
            <div v-if="getItemsByCategory(key).length === 0" class="col-span-full py-12 text-center border border-dashed border-border-card rounded-sm">
              <Info class="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p class="text-text-muted text-sm tracking-widest uppercase">Seasonal updates in progress</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Background Image Reference (Visual hint of the grid) -->
      <div class="mt-32 relative aspect-[21/9] overflow-hidden rounded-sm border border-border-card">
        <div class="absolute inset-0 bg-[url('@/assets/Images/Main%20-%20Menu%20Grid.png')] bg-cover bg-center opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"></div>
        <div class="absolute inset-0 flex items-center justify-center bg-base-dark/40">
            <span class="font-serif text-3xl italic text-white tracking-widest opacity-80">Our Vision</span>
        </div>
      </div>
    </section>
  </div>
</template>
