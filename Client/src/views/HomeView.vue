<script setup lang="ts">
import { ChevronRight, Play, Award, GlassWater, Utensils, Clock, MapPin, Star, Facebook, Instagram, Youtube, Send } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoginCard from '@/components/LoginCard.vue'

const authStore = useAuthStore()

const signatureDishes = [
  {
    name: 'Khmer Amok Fusion',
    description: 'Traditional fish amok with a modern truffle twist. A symphony of flavors from the heart of Cambodia.',
    price: '$32',
    image: '/src/assets/pictures/Foods/sharonang-fish-amok-921926_1920.jpg'
  },
  {
    name: 'Wagyu Lok Lak',
    description: 'Premium Wagyu beef prepared with authentic Kampot pepper and a glaze that melts on the tongue.',
    price: '$45',
    image: '/src/assets/pictures/Foods/alex-munsell-auIbTAcSH6E-unsplash.jpg'
  },
  {
    name: 'Silk Road Dessert',
    description: 'Hand-crafted sweets inspired by ancient trade routes, using only the finest palm sugar and coconut.',
    price: '$18',
    image: '/src/assets/pictures/Sweets/kanhaiskan-cambodian-cake-5887085_1920.jpg'
  }
]

const socialLinks = [
  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/search/top?q=Phourn%20KoemSeang' },
  { name: 'Telegram', icon: Send, url: 'https://t.me/Ph_koemseang' },
  { name: 'TikTok', icon: null, url: 'https://www.tiktok.com/@koemseang' },
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/seang_kosciusko/' },
  { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/@PhournKoemseang' }
]
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white selection:bg-gold/30">
    <!-- Hero Section / Banner Background -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Image Layer -->
      <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-[url('@/assets/images/Home%20_%20Nekmak%20Modern%20Fusion%20(v2).png')] bg-cover bg-center scale-105 animate-slow-zoom"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-base-dark/70 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-base-dark via-transparent to-transparent"></div>
      </div>

      <div class="container mx-auto px-6 lg:px-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-20">
        <!-- Hero Content -->
        <div class="space-y-8 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] tracking-[0.3em] uppercase font-bold animate-fade-in">
            <Award :size="14" />
            <span>Nekmak Modern Fusion • Est. 2026</span>
          </div>
          
          <h1 class="font-serif text-6xl md:text-8xl lg:text-[110px] leading-[0.85] text-white animate-slide-up">
            Luxe <br />
            <span class="italic text-gold">Dining</span>
          </h1>
          
          <p class="text-lg md:text-xl text-text-subtle font-light leading-relaxed max-w-lg animate-slide-up-delay-1">
            Indulge in an extraordinary culinary journey where heritage meets innovation. Every plate tells a story of passion and precision.
          </p>

          <div class="flex flex-wrap gap-6 items-center pt-4 animate-slide-up-delay-2">
            <router-link 
              v-if="authStore.isAuthenticated"
              to="/menu" 
              class="group relative px-10 py-4 bg-gold text-base-dark font-bold uppercase tracking-widest text-sm transition-all duration-500 overflow-hidden"
            >
              <span class="relative z-10 flex items-center gap-2">
                Explore The Menu
                <ChevronRight :size="18" class="group-hover:translate-x-1 transition-transform" />
              </span>
              <div class="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </router-link>
            
            <router-link to="/experience" class="flex items-center gap-3 text-white hover:text-gold transition-colors duration-300 group">
              <div class="p-3 rounded-full border border-white/20 group-hover:border-gold transition-colors">
                <Play :size="16" fill="currentColor" />
              </div>
              <span class="text-sm font-bold uppercase tracking-widest">The Experience</span>
            </router-link>
          </div>

          <!-- Quick Info -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 animate-fade-in border-t border-white/10 max-w-xl">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-gold">
                <Clock :size="14" />
                <span class="text-[10px] uppercase tracking-wider font-bold">Hours</span>
              </div>
              <p class="text-xs text-text-subtle">18:00 - 23:00 Daily</p>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-gold">
                <MapPin :size="14" />
                <span class="text-[10px] uppercase tracking-wider font-bold">Location</span>
              </div>
              <p class="text-xs text-text-subtle">Phnom Penh, KH</p>
            </div>
            <div class="hidden md:block space-y-1">
              <div class="flex items-center gap-2 text-gold">
                <Star :size="14" />
                <span class="text-[10px] uppercase tracking-wider font-bold">Rating</span>
              </div>
              <p class="text-xs text-text-subtle">4.9/5 Service</p>
            </div>
          </div>
        </div>

        <!-- Login Section (Only if not authenticated) -->
        <div v-if="!authStore.isAuthenticated" class="lg:justify-self-end w-full max-w-md animate-fade-in-right">
          <LoginCard />
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50 animate-bounce">
        <span class="text-[10px] tracking-[0.3em] uppercase vertical-text">Scroll To Discover</span>
        <div class="w-px h-12 bg-gold/50"></div>
      </div>
    </section>

    <!-- Social Media Section -->
    <section class="py-24 bg-card-dark/30 border-y border-white/5">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="text-center mb-16 space-y-4">
          <h2 class="font-serif text-3xl md:text-5xl italic text-gold">Follow Our Journey</h2>
          <p class="text-text-subtle text-sm tracking-[0.2em] uppercase font-light">Stay connected for exclusive updates and culinary insights</p>
        </div>
        
        <div class="flex flex-wrap justify-center gap-8 md:gap-16">
          <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" class="group flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2">
            <div class="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center bg-base-dark group-hover:bg-gold group-hover:border-gold transition-all duration-500">
              <component v-if="social.icon" :is="social.icon" class="w-6 h-6 text-gold group-hover:text-base-dark transition-colors" />
              <!-- Custom TikTok Icon -->
              <svg v-else-if="social.name === 'TikTok'" class="w-6 h-6 text-gold group-hover:text-base-dark transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </div>
            <span class="text-[10px] font-bold tracking-[0.3em] uppercase text-text-muted group-hover:text-gold transition-colors">{{ social.name }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Culinary Highlights Section -->
    <section class="py-32 bg-base-dark relative overflow-hidden">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div class="space-y-4 max-w-2xl">
            <h2 class="font-serif text-4xl md:text-6xl">Culinary <span class="text-gold italic">Artistry</span></h2>
            <p class="text-text-subtle text-lg font-light leading-relaxed">
              Our menu is a curated selection of fusion masterpieces, blending the bold flavors of Southeast Asia with contemporary French techniques.
            </p>
          </div>
          <router-link to="/menu" class="text-gold uppercase tracking-[0.2em] text-xs font-bold border-b border-gold/30 pb-2 hover:border-gold transition-all">
            View Full Menu
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div v-for="(dish, index) in signatureDishes" :key="index" 
               class="group relative space-y-6 animate-slide-up" :style="{ animationDelay: `${index * 200}ms` }">
            <div class="relative aspect-[4/5] overflow-hidden bg-card-dark">
              <img :src="dish.image" :alt="dish.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div class="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
              <div class="absolute top-4 right-4 bg-base-dark/80 backdrop-blur-md px-4 py-2 text-gold font-serif italic text-lg border border-gold/20">
                {{ dish.price }}
              </div>
            </div>
            <div class="space-y-2">
              <h3 class="font-serif text-2xl group-hover:text-gold transition-colors">{{ dish.name }}</h3>
              <p class="text-text-subtle text-sm leading-relaxed">{{ dish.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Showcase -->
    <section class="py-32 bg-card-dark/30 border-y border-white/5">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div class="relative">
            <div class="aspect-square bg-base-dark overflow-hidden border border-gold/20">
              <img src="/src/assets/images/The%20Experience%20_%20Nekmak%20Modern%20Fusion.png" alt="Dining Room" class="w-full h-full object-cover opacity-80" />
            </div>
            <div class="absolute -bottom-10 -right-10 w-2/3 aspect-video bg-base-dark overflow-hidden border border-gold/20 hidden md:block">
              <img src="/src/assets/pictures/Drinks/clovis-wood-iUtcVxqxkPk-unsplash.jpg" alt="Artisanal Cocktails" class="w-full h-full object-cover opacity-80" />
            </div>
          </div>
          
          <div class="space-y-8">
            <div class="inline-block text-gold text-xs font-bold tracking-[0.3em] uppercase">The Atmosphere</div>
            <h2 class="font-serif text-4xl md:text-5xl leading-tight">Beyond Just <br/><span class="text-gold italic">A Meal</span></h2>
            <p class="text-text-subtle text-lg font-light leading-relaxed">
              We believe that dining is an immersive art form. From the ambient lighting to the custom-curated soundtrack, every detail at Nekmak is designed to transport you to a world of refined elegance.
            </p>
            
            <div class="grid grid-cols-2 gap-8 pt-4">
              <div class="space-y-3">
                <Utensils class="text-gold w-6 h-6" />
                <h4 class="font-bold uppercase tracking-widest text-[10px]">Private Dining</h4>
                <p class="text-xs text-text-muted leading-relaxed">Exclusive suites for intimate gatherings.</p>
              </div>
              <div class="space-y-3">
                <GlassWater class="text-gold w-6 h-6" />
                <h4 class="font-bold uppercase tracking-widest text-[10px]">Wine Cellar</h4>
                <p class="text-xs text-text-muted leading-relaxed">Over 500 labels from prestigious vineyards.</p>
              </div>
            </div>
            
            <div class="pt-8">
              <router-link to="/reservations" class="inline-flex items-center gap-4 text-white hover:text-gold transition-all group">
                <span class="uppercase tracking-[0.2em] text-sm font-bold">Reserve Your Table</span>
                <div class="w-12 h-px bg-gold/50 group-hover:w-20 transition-all duration-500"></div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-slow-zoom {
  animation: slow-zoom 30s infinite alternate ease-in-out;
}

@keyframes slow-zoom {
  from { transform: scale(1); }
  to { transform: scale(1.15); }
}

.animate-fade-in-right {
  animation: fade-in-right 1.2s cubic-bezier(0.2, 0, 0.2, 1);
}

@keyframes fade-in-right {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

.vertical-text {
  writing-mode: vertical-rl;
}

.animate-fade-in {
  animation: fade-in 1.5s ease-out forwards;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 1s cubic-bezier(0.2, 0, 0.2, 1) forwards;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up-delay-1 {
  opacity: 0;
  animation: slide-up 1s cubic-bezier(0.2, 0, 0.2, 1) 0.2s forwards;
}

.animate-slide-up-delay-2 {
  opacity: 0;
  animation: slide-up 1s cubic-bezier(0.2, 0, 0.2, 1) 0.4s forwards;
}
</style>
