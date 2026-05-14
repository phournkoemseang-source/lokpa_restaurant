<script setup lang="ts">
import { ChevronRight, Play, Award, GlassWater } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoginCard from '@/components/LoginCard.vue'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white selection:bg-gold/30">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Video/Image Layer -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[url('@/assets/Images/Home%20_%20Nekmak%20Modern%20Fusion%20(v2).png')] bg-cover bg-center scale-105 animate-slow-zoom"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-base-dark/60 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-base-dark via-transparent to-transparent"></div>
      </div>

      <div class="container mx-auto px-6 lg:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-20">
        <!-- Hero Content -->
        <div class="space-y-8 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] tracking-[0.2em] uppercase font-bold animate-fade-in">
            <Award :size="14" />
            <span>Michelin Starred Excellence</span>
          </div>
          
          <h1 class="font-serif text-6xl md:text-8xl lg:text-[100px] leading-[0.9] text-white animate-slide-up">
            Nekmak <br />
            <span class="italic text-gold">Luxe Dining</span>
          </h1>
          
          <p class="text-lg md:text-xl text-text-subtle font-light leading-relaxed max-w-lg animate-slide-up-delay-1">
            Where modern innovation meets timeless tradition. Experience a symphony of flavors curated for the discerning palate.
          </p>

          <div v-if="authStore.isAuthenticated" class="flex flex-wrap gap-6 items-center pt-4 animate-slide-up-delay-2">
            <router-link 
              to="/menu" 
              class="group relative px-10 py-4 bg-gold text-base-dark font-bold uppercase tracking-widest text-sm transition-all duration-500 overflow-hidden"
            >
              <span class="relative z-10 flex items-center gap-2">
                Discover Menu
                <ChevronRight :size="18" class="group-hover:translate-x-1 transition-transform" />
              </span>
              <div class="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </router-link>
            
            <router-link to="/experience" class="flex items-center gap-3 text-white hover:text-gold transition-colors duration-300 group">
              <div class="p-3 rounded-full border border-white/20 group-hover:border-gold transition-colors">
                <Play :size="16" fill="currentColor" />
              </div>
              <span class="text-sm font-bold uppercase tracking-widest">Our Story</span>
            </router-link>
          </div>
        </div>

        <!-- Login Section (Only if not authenticated) -->
        <div v-if="!authStore.isAuthenticated" class="lg:justify-self-end w-full max-w-md animate-fade-in-right">
          <LoginCard />
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 animate-bounce">
        <span class="text-[10px] tracking-[0.3em] uppercase vertical-text">Explore</span>
        <div class="w-px h-12 bg-gold/50"></div>
      </div>
    </section>

    <!-- Feature Section -->
    <section class="py-32 bg-base-dark border-t border-border-card/20">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div class="space-y-6 group">
            <div class="w-16 h-16 flex items-center justify-center bg-card-dark border border-border-card group-hover:border-gold transition-colors duration-500">
              <Award class="w-8 h-8 text-gold" />
            </div>
            <h3 class="font-serif text-2xl">Culinary Excellence</h3>
            <p class="text-text-subtle leading-relaxed">Each dish is a masterpiece, crafted with precision by our team of world-renowned chefs using seasonal ingredients.</p>
          </div>
          
          <div class="space-y-6 group">
            <div class="w-16 h-16 flex items-center justify-center bg-card-dark border border-border-card group-hover:border-gold transition-colors duration-500">
              <GlassWater class="w-8 h-8 text-gold" />
            </div>
            <h3 class="font-serif text-2xl">Artisanal Drinks</h3>
            <p class="text-text-subtle leading-relaxed">Our mixologists craft unique cocktail pairings that complement the subtle nuances of our fusion cuisine.</p>
          </div>

          <div class="space-y-6 group">
            <div class="w-16 h-16 flex items-center justify-center bg-card-dark border border-border-card group-hover:border-gold transition-colors duration-500">
              <Star class="w-8 h-8 text-gold" />
            </div>
            <h3 class="font-serif text-2xl">Private Experience</h3>
            <p class="text-text-subtle leading-relaxed">Exclusive dining suites designed for intimate celebrations and corporate gatherings of the highest caliber.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-slow-zoom {
  animation: slow-zoom 20s infinite alternate linear;
}

@keyframes slow-zoom {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

.animate-fade-in-right {
  animation: fade-in-right 1s ease-out;
}

@keyframes fade-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.vertical-text {
  writing-mode: vertical-rl;
}
</style>
