<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowDown,
  ArrowUpRight,
  CalendarCheck,
  Clock,
  Facebook,
  Flame,
  Instagram,
  MapPin,
  Quote,
  Send,
  Star,
  Utensils,
  Wine,
  X,
  Youtube,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoginCard from '@/components/LoginCard.vue'

const authStore = useAuthStore()
const selectedGalleryImage = ref<string | null>(null)

const guestName = computed(() => authStore.user?.name?.split(' ')[0] || 'Guest')

const winterCollection = [
  {
    name: 'Kampot Pepper Beef',
    origin: 'Asia x Europe',
    description: 'Charred beef, Kampot pepper jus, potato silk, pickled green mango, and French herb butter.',
    price: '$36',
    badge: 'Chef',
    image: new URL('../assets/pictures/Foods/alex-munsell-Yr4n8O_3UPc-unsplash.jpg', import.meta.url).href,
  },
  {
    name: 'Truffle Obsidian',
    origin: 'Italian Craft',
    description: 'Fresh pasta, black truffle cream, parmesan snow, toasted garlic, and Cambodian basil oil.',
    price: '$29',
    badge: 'New',
    image: new URL('../assets/pictures/Vegeterain/davide-cantelli-jpkfc5_d-DI-unsplash.jpg', import.meta.url).href,
  },
  {
    name: 'Coconut Rose Entremet',
    origin: 'French Patisserie',
    description: 'Rose mousse, coconut sponge, palm sugar caramel, and a lacquered dark chocolate shell.',
    price: '$18',
    badge: 'Sweet',
    image: new URL('../assets/pictures/Sweets/cegoh-cupcakes-1133146_1920.jpg', import.meta.url).href,
  },
]

const fusionHighlights = [
  {
    title: 'Khmer Fire',
    text: 'Fish amok, young coconut, lemongrass, turmeric, and river herbs reworked with modern plating.',
    image: new URL('../assets/pictures/Foods/sharonang-fish-amok-921926_1920.jpg', import.meta.url).href,
  },
  {
    title: 'European Cellar',
    text: 'French sauces, Italian pasta technique, and curated wine service balanced for tropical evenings.',
    image: new URL('../assets/pictures/Wines/kevin-kelly-PPneSBqfCCU-unsplash.jpg', import.meta.url).href,
  },
  {
    title: 'Dessert Atelier',
    text: 'Parisian pastry textures with Cambodian palm sugar, coconut, citrus, and seasonal fruits.',
    image: new URL('../assets/pictures/Sweets/anna-tukhfatullina-food-photographer-stylist-Mzy-OjtCI70-unsplash.jpg', import.meta.url).href,
  },
]

const galleryImages = [
  new URL('../assets/pictures/Foods/kan_chansathya-khmer-food-3771719_1920.jpg', import.meta.url).href,
  new URL('../assets/pictures/Foods/pichara-g-I7PRofUoE-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/Drinks/clovis-wood-iUtcVxqxkPk-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/Pizza&Buger/matteophotopro2020-pizza-5275191_1920.jpg', import.meta.url).href,
  new URL('../assets/pictures/Vegeterain/luisa-brimble-vIm26fn_QKg-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/Wines/jeff-siepman-hK9hIPgF3QU-unsplash.jpg', import.meta.url).href,
]

const testimonials = [
  {
    quote: 'LokPa feels like Phnom Penh at night: warm, polished, generous, and full of flavor.',
    name: 'Sophea R.',
    role: 'Chef Table Guest',
  },
  {
    quote: 'The menu moves beautifully from Khmer aromatics to European technique without losing its soul.',
    name: 'Matteo L.',
    role: 'Wine Pairing Guest',
  },
  {
    quote: 'A calm luxury experience with precise service and food that still feels deeply Cambodian.',
    name: 'Malis V.',
    role: 'Private Dining Guest',
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
        src="@/assets/pictures/Foods/alex-munsell-auIbTAcSH6E-unsplash.jpg"
        alt="LokPa modern Asian and European fusion dish"
        class="hero-image absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.6),rgba(10,10,10,0.24)_34%,rgba(10,10,10,0.96)_92%),radial-gradient(circle_at_70%_28%,rgba(212,175,55,0.22),transparent_28%)]"></div>
      <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-base-dark to-transparent"></div>

      <div class="relative z-10 flex min-h-screen items-center justify-center px-6 pb-20 pt-32 text-center">
        <div class="mx-auto max-w-4xl">
          <p class="reveal text-[10px] font-black uppercase tracking-[0.45em] text-gold">
            Modern Khmer x European Dining
          </p>

          <h1 class="reveal delay-1 mt-7 font-serif text-5xl leading-[0.98] md:text-7xl lg:text-8xl">
            Elevated Culinary
            <span class="block">Precision</span>
          </h1>

          <p class="reveal delay-2 mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            Welcome{{ authStore.isAuthenticated ? `, ${guestName}` : '' }} to LokPa Restaurant, a Phnom Penh dining room where Cambodian herbs, Kampot pepper, French sauces, Italian craft, and warm hospitality meet in one refined experience.
          </p>

          <div class="reveal delay-3 mt-8 flex flex-wrap items-center justify-center gap-4">
            <router-link
              :to="authStore.isAuthenticated ? '/menu' : { path: '/', hash: '#login' }"
              class="cta-button inline-flex h-12 items-center gap-3 bg-gold px-7 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark"
            >
              View Menu
              <Utensils class="h-4 w-4" />
            </router-link>
            <router-link
              :to="authStore.isAuthenticated ? '/reservations' : { path: '/', hash: '#login' }"
              class="inline-flex h-12 items-center gap-3 border border-gold/45 px-7 text-[10px] font-black uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold hover:text-base-dark"
            >
              Reserve Table
              <ArrowUpRight class="h-4 w-4" />
            </router-link>
          </div>
        </div>
      </div>

      <div class="absolute bottom-12 left-1/2 z-10 hidden -translate-x-1/2 text-gold md:block">
        <ArrowDown class="scroll-cue h-5 w-5" />
      </div>

      <div v-if="!authStore.isAuthenticated" id="login" class="absolute inset-x-0 bottom-12 z-20 mx-auto max-w-md scroll-mt-28 px-6">
        <LoginCard />
      </div>
    </section>

    <section class="relative overflow-hidden py-24">
      <div class="ambient-line absolute left-0 top-1/2 h-px w-full bg-gold/10"></div>
      <div class="container relative mx-auto grid gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-16">
        <div class="section-reveal space-y-5">
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">New this season</p>
          <h2 class="font-serif text-4xl leading-tight md:text-6xl">The Winter Collection</h2>
        </div>
        <p class="section-reveal max-w-xl text-sm leading-7 text-white/62 md:justify-self-end">
          LokPa serves real modern fusion in Phnom Penh: Khmer foundations, European discipline, premium wines, private reservations, and attentive service for guests who want dinner to feel special.
        </p>
      </div>

      <div class="container mx-auto mt-12 grid gap-6 px-6 md:grid-cols-3 lg:px-16">
        <article
          v-for="dish in winterCollection"
          :key="dish.name"
          class="dish-card section-reveal group overflow-hidden border border-white/8 bg-card-dark"
        >
          <div class="relative h-80 overflow-hidden">
            <img :src="dish.image" :alt="dish.name" class="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" />
            <span class="absolute right-4 top-4 bg-gold px-3 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-base-dark">
              {{ dish.badge }}
            </span>
          </div>
          <div class="p-6">
            <div class="mb-3 flex items-center justify-between gap-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">{{ dish.origin }}</p>
              <p class="font-serif text-2xl text-gold">{{ dish.price }}</p>
            </div>
            <h3 class="font-serif text-3xl">{{ dish.name }}</h3>
            <p class="mt-4 text-sm leading-7 text-white/58">{{ dish.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-reveal container mx-auto grid gap-6 px-6 py-16 lg:grid-cols-3 lg:px-16">
      <article
        v-for="highlight in fusionHighlights"
        :key="highlight.title"
        class="highlight-card group relative min-h-[420px] overflow-hidden border border-white/10 bg-card-dark"
      >
        <img :src="highlight.image" :alt="highlight.title" class="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-base-dark via-base-dark/60 to-transparent"></div>
        <div class="absolute inset-x-0 bottom-0 p-7">
          <Flame class="mb-5 h-7 w-7 text-gold" />
          <h3 class="font-serif text-4xl">{{ highlight.title }}</h3>
          <p class="mt-4 text-sm leading-7 text-white/68">{{ highlight.text }}</p>
        </div>
      </article>
    </section>

    <section class="section-reveal overflow-hidden bg-card-dark/25 py-24">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Asian and European frames</p>
            <h2 class="mt-4 font-serif text-4xl md:text-6xl">A Menu Built For Contrast</h2>
          </div>
          <router-link :to="authStore.isAuthenticated ? '/menu' : { path: '/', hash: '#login' }" class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-gold">
            Explore all dishes
            <ArrowUpRight class="h-4 w-4" />
          </router-link>
        </div>

        <div class="gallery-grid grid grid-cols-2 gap-4 md:grid-cols-4">
          <button
            v-for="(image, index) in galleryImages"
            :key="image"
            @click="selectedGalleryImage = image"
            :class="['group relative overflow-hidden border border-white/10 bg-base-dark', index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : '']"
          >
            <img :src="image" alt="LokPa Asian and European menu detail" class="h-full min-h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            <div class="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <ArrowUpRight class="absolute right-5 top-5 h-5 w-5 text-gold opacity-0 transition-all duration-300 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </section>

    <section class="section-reveal container mx-auto grid gap-8 px-6 py-24 lg:grid-cols-[1.35fr_0.85fr] lg:px-16">
      <div class="relative min-h-[470px] overflow-hidden border border-white/10 bg-card-dark">
        <img src="@/assets/pictures/Wines/no-revisions-Y1UkHcx9VpM-unsplash.jpg" alt="LokPa dining sanctuary" class="absolute inset-0 h-full w-full object-cover opacity-58" />
        <div class="absolute inset-0 bg-gradient-to-r from-base-dark/84 via-base-dark/45 to-transparent"></div>
        <div class="relative z-10 flex min-h-[470px] max-w-xl flex-col justify-center p-8 md:p-14">
          <Wine class="mb-6 h-9 w-9 text-gold" />
          <h2 class="font-serif text-5xl">The Sanctuary</h2>
          <p class="mt-5 text-sm leading-7 text-white/68">
            Private dining, wine pairing, birthday dinners, business hosting, and intimate celebrations on Street 240, Phnom Penh.
          </p>
        </div>
      </div>

      <div class="border border-white/10 bg-card-dark p-8 md:p-10">
        <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Book your table</p>
        <h2 class="mt-4 font-serif text-4xl">Secure Your Evening</h2>

        <div class="mt-8 space-y-5">
          <div class="border-b border-gold/35 pb-4">
            <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">Location</p>
            <p class="mt-2 text-white/85">Street 240, Phnom Penh</p>
          </div>
          <div class="border-b border-gold/35 pb-4">
            <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">Hours</p>
            <p class="mt-2 text-white/85">Monday - Sunday, 6:00 AM - 12:00 PM</p>
          </div>
          <div class="border-b border-gold/35 pb-4">
            <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">Contact</p>
            <p class="mt-2 text-white/85">+855 (0) 23 999 888</p>
          </div>
        </div>

        <router-link
          :to="authStore.isAuthenticated ? '/reservations' : { path: '/', hash: '#login' }"
          class="cta-button mt-9 inline-flex h-12 w-full items-center justify-center gap-3 bg-gold px-7 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark"
        >
          Make Reservation
          <CalendarCheck class="h-4 w-4" />
        </router-link>
      </div>
    </section>

    <section class="section-reveal container mx-auto px-6 pb-24 lg:px-16">
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

    <section class="border-y border-white/5 bg-card-dark/30 py-20">
      <div class="container mx-auto grid gap-12 px-6 md:grid-cols-3 lg:px-16">
        <div>
          <h2 class="font-serif text-4xl text-gold">LokPa Restaurant</h2>
          <p class="mt-4 max-w-sm text-sm leading-7 text-white/55">
            Modern Khmer and European fusion dining in the heart of Phnom Penh. Exclusive, reserved, sensory.
          </p>
        </div>

        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Real Information</p>
          <div class="mt-5 space-y-3 text-sm text-white/72">
            <p class="flex items-center gap-3"><MapPin class="h-4 w-4 text-gold" /> Street 240, Phnom Penh, Cambodia</p>
            <p class="flex items-center gap-3"><Clock class="h-4 w-4 text-gold" /> Daily, 6:00 AM - 12:00 PM</p>
            <p class="flex items-center gap-3"><Star class="h-4 w-4 text-gold" /> Reservations recommended</p>
          </div>
        </div>

        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Follow LokPa</p>
          <div class="mt-5 flex flex-wrap gap-4">
            <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" rel="noreferrer" class="group flex h-12 w-12 items-center justify-center border border-gold/20 text-gold transition-all duration-300 hover:-translate-y-1 hover:bg-gold hover:text-base-dark" :aria-label="social.name">
              <component :is="social.icon" class="h-5 w-5" />
            </a>
          </div>
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
  animation: hero-drift 30s ease-in-out infinite alternate;
  filter: saturate(0.95) contrast(1.1);
  transform-origin: center;
}

.reveal {
  opacity: 0;
  animation: reveal-up 0.95s cubic-bezier(0.2, 0, 0.2, 1) forwards;
}

.delay-1 { animation-delay: 0.12s; }
.delay-2 { animation-delay: 0.24s; }
.delay-3 { animation-delay: 0.36s; }

.scroll-cue {
  animation: soft-bounce 1.8s ease-in-out infinite;
}

.ambient-line {
  animation: gold-scan 7s ease-in-out infinite;
  transform-origin: left;
}

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

.section-reveal {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 8% cover 32%;
}

.dish-card,
.highlight-card,
.testimonial-card {
  transition: transform 0.35s ease, border-color 0.35s ease, background-color 0.35s ease;
}

.dish-card:hover,
.highlight-card:hover,
.testimonial-card:hover {
  transform: translateY(-8px);
  border-color: rgba(212, 175, 55, 0.46);
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
  from { transform: scale(1.05) translate3d(0, 0, 0); }
  to { transform: scale(1.15) translate3d(-2%, -1.5%, 0); }
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(42px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes soft-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50% { transform: translateY(12px); opacity: 1; }
}

@keyframes gold-scan {
  0%, 100% { transform: scaleX(0.08); opacity: 0.18; }
  50% { transform: scaleX(1); opacity: 0.42; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-image,
  .reveal,
  .section-reveal,
  .scroll-cue,
  .ambient-line {
    animation: none;
    opacity: 1;
  }

  .cta-button,
  .dish-card,
  .highlight-card,
  .testimonial-card {
    transition: none;
  }
}
</style>
