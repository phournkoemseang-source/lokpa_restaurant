<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowUpRight,
  Award,
  CalendarCheck,
  ChefHat,
  Clock,
  Facebook,
  Instagram,
  MapPin,
  Quote,
  Send,
  Sparkles,
  Star,
  Utensils,
  X,
  Youtube,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoginCard from '@/components/LoginCard.vue'

const authStore = useAuthStore()
const selectedGalleryImage = ref<string | null>(null)

const signatureDishes = [
  {
    name: 'Signature Amok',
    category: 'Chef Tasting',
    description: 'River fish custard, kaffir lime, young coconut cream, and a warm Kampot pepper finish.',
    price: '$32',
    image: new URL('../assets/pictures/Foods/sharonang-fish-amok-921926_1920.jpg', import.meta.url).href,
  },
  {
    name: 'Golden Prawn Garden',
    category: 'Seafood',
    description: 'Charred prawns over herbs, citrus oil, toasted aromatics, and a bright tamarind glaze.',
    price: '$38',
    image: new URL('../assets/pictures/Foods/casey-lee-awj7sRviVXo-unsplash.jpg', import.meta.url).href,
  },
  {
    name: 'Velvet Berry Finale',
    category: 'Dessert',
    description: 'A delicate dessert service with berries, cream, soft pastry, and palm-sugar warmth.',
    price: '$18',
    image: new URL('../assets/pictures/Sweets/pexels-blueberries-1867398_1920.jpg', import.meta.url).href,
  },
]

const galleryImages = [
  new URL('../assets/pictures/Foods/kan_chansathya-khmer-food-3771719_1920.jpg', import.meta.url).href,
  new URL('../assets/pictures/Drinks/clovis-wood-iUtcVxqxkPk-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/Wines/kevin-kelly-PPneSBqfCCU-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/Foods/pichara-g-I7PRofUoE-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/Sweets/kanhaiskan-cambodian-cake-5887085_1920.jpg', import.meta.url).href,
  new URL('../assets/pictures/Vegeterain/davide-cantelli-jpkfc5_d-DI-unsplash.jpg', import.meta.url).href,
]

const testimonials = [
  {
    quote: 'A rare Phnom Penh dinner where every course felt cinematic, precise, and deeply personal.',
    name: 'Sophea R.',
    role: 'Private Dining Guest',
  },
  {
    quote: 'The service moved like choreography. Quiet, warm, confident, and beautifully timed.',
    name: 'Daniel K.',
    role: 'Wine Pairing Guest',
  },
  {
    quote: 'Modern Khmer flavors with a luxury mood. The chef table is absolutely worth booking.',
    name: 'Malis V.',
    role: 'Chef Table Guest',
  },
]

const socialLinks = [
  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/search/top?q=Phourn%20KoemSeang' },
  { name: 'Telegram', icon: Send, url: 'https://t.me/Ph_koemseang' },
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/seang_kosciusko/' },
  { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/@PhournKoemseang' },
]
</script>

<template>
  <div class="home-page min-h-screen bg-base-dark text-white selection:bg-gold/30">
    <section class="hero-scene relative min-h-screen overflow-hidden">
      <img
        src="@/assets/pictures/Foods/pichara-g-I7PRofUoE-unsplash.jpg"
        alt="Chef-led fine dining preparation at LokPa"
        class="hero-image absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_68%_30%,rgba(212,175,55,0.18),transparent_28%),linear-gradient(90deg,rgba(10,10,10,0.94),rgba(10,10,10,0.58)_48%,rgba(10,10,10,0.18))]"></div>
      <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-base-dark to-transparent"></div>

      <div class="relative z-10 container mx-auto px-6 lg:px-16 min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center pt-28 pb-20">
        <div class="max-w-4xl space-y-9">
          <div class="reveal inline-flex items-center gap-3 border border-gold/30 bg-black/30 px-4 py-2 text-gold backdrop-blur-md">
            <ChefHat class="h-4 w-4" />
            <span class="text-[10px] font-black uppercase tracking-[0.35em]">Chef-Led Modern Khmer Tasting</span>
          </div>

          <div class="space-y-6">
            <h1 class="reveal delay-1 font-serif text-6xl leading-[0.92] md:text-8xl lg:text-[118px]">
              Elysium
              <span class="block italic text-gold">Restaurant</span>
            </h1>
            <p class="reveal delay-2 max-w-2xl text-lg leading-relaxed text-white/72 md:text-xl">
              A luxurious dining room guided by the chef's table: close-up flame, polished Cambodian flavor, warm gold lighting, and plates finished with quiet precision.
            </p>
          </div>

          <div class="reveal delay-3 flex flex-wrap items-center gap-4">
            <router-link
              :to="authStore.isAuthenticated ? '/reservations' : { path: '/', hash: '#login' }"
              class="cta-button group inline-flex items-center gap-3 bg-gold px-8 py-4 text-xs font-black uppercase tracking-[0.28em] text-base-dark"
            >
              Reserve a Table
              <CalendarCheck class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </router-link>
            <router-link :to="authStore.isAuthenticated ? '/menu' : { path: '/', hash: '#login' }" class="group inline-flex items-center gap-3 border border-white/15 px-8 py-4 text-xs font-black uppercase tracking-[0.28em] text-white/85 transition-all duration-300 hover:border-gold hover:text-gold">
              Explore Menu
              <ArrowUpRight class="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </router-link>
          </div>

          <div class="reveal delay-4 grid max-w-2xl grid-cols-3 gap-5 border-t border-white/10 pt-8">
            <div>
              <Clock class="mb-3 h-5 w-5 text-gold" />
              <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">Dinner</p>
              <p class="mt-1 text-sm text-white/80">18:00 - 23:00</p>
            </div>
            <div>
              <MapPin class="mb-3 h-5 w-5 text-gold" />
              <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">Location</p>
              <p class="mt-1 text-sm text-white/80">Phnom Penh</p>
            </div>
            <div>
              <Star class="mb-3 h-5 w-5 fill-current text-gold" />
              <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">Rating</p>
              <p class="mt-1 text-sm text-white/80">4.9 Service</p>
            </div>
          </div>
        </div>

        <div v-if="authStore.isAuthenticated" class="relative hidden min-h-[620px] lg:block">
          <div class="chef-panel absolute right-0 top-8 w-[74%] overflow-hidden border border-gold/25 bg-black/30 p-4 backdrop-blur-md">
            <img src="@/assets/pictures/Foods/sharonang-fish-amok-921926_1920.jpg" alt="Chef signature dish" class="h-[420px] w-full object-cover" />
            <div class="space-y-3 p-6">
              <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Chef's Signature</p>
              <h2 class="font-serif text-4xl">The Flame & Herb Ritual</h2>
              <p class="text-sm leading-relaxed text-white/62">
                Every evening begins at the chef counter, where local herbs, river fish, and warm coconut aromatics are composed into a polished tasting menu.
              </p>
            </div>
          </div>

          <div class="floating-note absolute bottom-16 left-0 max-w-xs border border-white/10 bg-base-dark/80 p-6 backdrop-blur-xl">
            <Sparkles class="mb-4 h-6 w-6 text-gold" />
            <p class="font-serif text-2xl">Cinematic plating, real ingredients, soft motion.</p>
          </div>
        </div>

        <div v-if="!authStore.isAuthenticated" id="login" class="reveal delay-4 scroll-mt-28 lg:justify-self-end">
          <LoginCard />
        </div>
      </div>
    </section>

    <section class="relative overflow-hidden border-y border-white/5 bg-card-dark/30 py-24">
      <div class="parallax-strip absolute inset-0 opacity-25"></div>
      <div class="relative container mx-auto grid grid-cols-1 gap-8 px-6 lg:grid-cols-4 lg:px-16">
        <div class="motion-stat">
          <p class="font-serif text-5xl text-gold">12</p>
          <p class="mt-2 text-xs uppercase tracking-[0.28em] text-white/50">Seasonal Courses</p>
        </div>
        <div class="motion-stat">
          <p class="font-serif text-5xl text-gold">500+</p>
          <p class="mt-2 text-xs uppercase tracking-[0.28em] text-white/50">Cellar Labels</p>
        </div>
        <div class="motion-stat">
          <p class="font-serif text-5xl text-gold">3</p>
          <p class="mt-2 text-xs uppercase tracking-[0.28em] text-white/50">Private Rooms</p>
        </div>
        <div class="motion-stat">
          <p class="font-serif text-5xl text-gold">60fps</p>
          <p class="mt-2 text-xs uppercase tracking-[0.28em] text-white/50">Smooth UI Feel</p>
        </div>
      </div>
    </section>

    <section class="section-reveal container mx-auto px-6 py-28 lg:px-16">
      <div class="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div class="max-w-3xl space-y-5">
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Exquisite Menu</p>
          <h2 class="font-serif text-5xl md:text-7xl">Plates With Presence</h2>
          <p class="text-lg leading-relaxed text-white/58">
            Hover each card to reveal tasting details, quiet motion, and the kind of close-up food photography that makes the page feel alive.
          </p>
        </div>
        <router-link :to="authStore.isAuthenticated ? '/menu' : { path: '/', hash: '#login' }" class="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.28em] text-gold">
          View Full Menu
          <ArrowUpRight class="h-4 w-4" />
        </router-link>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <article v-for="dish in signatureDishes" :key="dish.name" class="menu-tile group relative min-h-[540px] overflow-hidden border border-gold/15 bg-card-dark">
          <img :src="dish.image" :alt="dish.name" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-base-dark via-base-dark/36 to-transparent"></div>
          <div class="absolute inset-x-0 bottom-0 translate-y-10 p-7 transition-transform duration-500 group-hover:translate-y-0">
            <div class="mb-5 flex items-center justify-between">
              <span class="bg-gold px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-base-dark">{{ dish.category }}</span>
              <span class="font-serif text-3xl text-gold">{{ dish.price }}</span>
            </div>
            <h3 class="font-serif text-4xl leading-tight">{{ dish.name }}</h3>
            <p class="mt-4 max-h-0 overflow-hidden text-sm leading-relaxed text-white/68 transition-all duration-500 group-hover:max-h-28">
              {{ dish.description }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-reveal overflow-hidden bg-card-dark/25 py-28">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="mb-14 max-w-2xl space-y-5">
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Gallery Lightbox</p>
          <h2 class="font-serif text-5xl md:text-7xl">A Dining Film In Frames</h2>
        </div>

        <div class="gallery-grid grid grid-cols-2 gap-4 md:grid-cols-4">
          <button
            v-for="(image, index) in galleryImages"
            :key="image"
            @click="selectedGalleryImage = image"
            :class="['group relative overflow-hidden border border-white/10 bg-base-dark', index === 0 || index === 3 ? 'md:col-span-2 md:row-span-2' : '']"
          >
            <img :src="image" alt="LokPa gallery detail" class="h-full min-h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            <div class="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <ArrowUpRight class="absolute right-5 top-5 h-5 w-5 text-gold opacity-0 transition-all duration-300 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </section>

    <section class="section-reveal relative overflow-hidden py-28">
      <img src="@/assets/pictures/Wines/jeff-siepman-hK9hIPgF3QU-unsplash.jpg" alt="Wine pairing" class="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-base-dark/90 to-base-dark/50"></div>
      <div class="relative container mx-auto grid grid-cols-1 gap-14 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
        <div class="space-y-6">
          <Award class="h-10 w-10 text-gold" />
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Chef's Special</p>
          <h2 class="font-serif text-5xl md:text-7xl">The Golden Hour Tasting</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <div v-for="item in ['Flame seared river fish', 'Kampot pepper jus', 'Coconut blossom dessert']" :key="item" class="special-card border border-white/10 bg-black/30 p-7 backdrop-blur-md">
            <Utensils class="mb-8 h-6 w-6 text-gold" />
            <h3 class="font-serif text-2xl">{{ item }}</h3>
            <p class="mt-4 text-sm leading-relaxed text-white/55">A quiet luxury course designed for slow conversation and warm evening light.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-reveal container mx-auto px-6 py-28 lg:px-16">
      <div class="mb-14 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Testimonials</p>
        <h2 class="mt-5 font-serif text-5xl md:text-7xl">Guests Remember The Feeling</h2>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article v-for="testimonial in testimonials" :key="testimonial.name" class="testimonial-card border border-gold/10 bg-card-dark/60 p-8">
          <Quote class="mb-8 h-8 w-8 text-gold" />
          <p class="min-h-28 text-lg leading-relaxed text-white/72">"{{ testimonial.quote }}"</p>
          <div class="mt-8 border-t border-white/10 pt-5">
            <p class="font-serif text-2xl text-white">{{ testimonial.name }}</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.24em] text-gold">{{ testimonial.role }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-reveal container mx-auto px-6 pb-28 lg:px-16">
      <div class="relative overflow-hidden border border-gold/20 bg-gold p-10 text-base-dark md:p-16">
        <div class="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div class="max-w-2xl">
            <p class="text-[10px] font-black uppercase tracking-[0.35em]">Private Chef Table</p>
            <h2 class="mt-4 font-serif text-5xl md:text-7xl">Let the chef cook for your evening.</h2>
          </div>
          <router-link :to="authStore.isAuthenticated ? '/reservations' : { path: '/', hash: '#login' }" class="inline-flex items-center justify-center gap-3 bg-base-dark px-8 py-4 text-xs font-black uppercase tracking-[0.28em] text-gold transition-transform duration-300 hover:-translate-y-1">
            Reserve a Table
            <CalendarCheck class="h-5 w-5" />
          </router-link>
        </div>
      </div>
    </section>

    <section class="border-y border-white/5 bg-card-dark/30 py-20">
      <div class="container mx-auto flex flex-col items-center justify-between gap-10 px-6 text-center md:flex-row md:text-left lg:px-16">
        <div>
          <h2 class="font-serif text-4xl text-gold">LokPa Restaurant</h2>
          <p class="mt-3 max-w-xl text-sm leading-relaxed text-white/55">A sleek dark-mode fine dining website experience with real photography, warm gold accents, and fluid micro-interactions.</p>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" class="group flex h-12 w-12 items-center justify-center border border-gold/20 text-gold transition-all duration-300 hover:-translate-y-1 hover:bg-gold hover:text-base-dark" :aria-label="social.name">
            <component :is="social.icon" class="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>

    <Transition name="lightbox">
      <div v-if="selectedGalleryImage" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md" @click.self="selectedGalleryImage = null">
        <button class="absolute right-6 top-6 text-gold transition-colors hover:text-white" @click="selectedGalleryImage = null" aria-label="Close gallery image">
          <X class="h-8 w-8" />
        </button>
        <img :src="selectedGalleryImage" alt="Selected LokPa gallery image" class="max-h-[86vh] max-w-[92vw] border border-gold/20 object-contain shadow-2xl shadow-black" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.home-page {
  scroll-behavior: smooth;
}

.font-serif {
  font-family: 'Playfair Display', serif;
}

.hero-image {
  animation: hero-drift 28s ease-in-out infinite alternate;
  transform-origin: center;
}

.reveal {
  opacity: 0;
  animation: reveal-up 0.9s cubic-bezier(0.2, 0, 0.2, 1) forwards;
}

.delay-1 { animation-delay: 0.12s; }
.delay-2 { animation-delay: 0.24s; }
.delay-3 { animation-delay: 0.36s; }
.delay-4 { animation-delay: 0.48s; }

.cta-button {
  position: relative;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(212, 175, 55, 0.22);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: translateX(-120%);
  transition: transform 0.7s ease;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 70px rgba(212, 175, 55, 0.32);
}

.cta-button:hover::after {
  transform: translateX(120%);
}

.chef-panel {
  animation: float-panel 7s ease-in-out infinite;
}

.floating-note {
  animation: float-panel 8s ease-in-out infinite reverse;
}

.parallax-strip {
  background-image: url('@/assets/pictures/Foods/sharonang-fish-amok-921926_1920.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.section-reveal {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 8% cover 32%;
}

.motion-stat,
.special-card,
.testimonial-card,
.menu-tile {
  transition: transform 0.35s ease, border-color 0.35s ease, background-color 0.35s ease;
}

.motion-stat:hover,
.special-card:hover,
.testimonial-card:hover {
  transform: translateY(-8px);
  border-color: rgba(212, 175, 55, 0.48);
}

.gallery-grid button {
  min-height: 14rem;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@keyframes hero-drift {
  from { transform: scale(1.04) translate3d(0, 0, 0); }
  to { transform: scale(1.14) translate3d(-2%, -1%, 0); }
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(42px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float-panel {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-18px); }
}

@media (prefers-reduced-motion: reduce) {
  .hero-image,
  .chef-panel,
  .floating-note,
  .section-reveal,
  .reveal {
    animation: none;
    opacity: 1;
  }

  .cta-button,
  .menu-tile,
  .special-card,
  .testimonial-card,
  .motion-stat {
    transition: none;
  }
}
</style>
