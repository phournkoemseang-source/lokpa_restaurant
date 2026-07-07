<script setup lang="ts">
import { computed, ref } from 'vue'
import {
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
  Wine,
  X,
  Youtube,
} from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import CinematicHero from '@/components/CinematicHero.vue'
import LoginCard from '@/components/LoginCard.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const selectedGalleryImage = ref<string | null>(null)

const lokpaServiceTiles = computed(() => [
  {
    title: t('home.service_1_title'),
    text: t('home.service_1_text'),
    image: new URL('../assets/pictures/EroupFoods/Wines/no-revisions-Y1UkHcx9VpM-unsplash.jpg', import.meta.url).href,
  },
  {
    title: t('home.service_2_title'),
    text: t('home.service_2_text'),
    image: new URL('../assets/pictures/EroupFoods/Drinks/clovis-wood-iUtcVxqxkPk-unsplash.jpg', import.meta.url).href,
  },
  {
    title: t('home.service_3_title'),
    text: t('home.service_3_text'),
    image: new URL('../assets/pictures/AsiaFoods/Foods/kan_chansathya-khmer-food-3771719_1920.jpg', import.meta.url).href,
  },
])

const fusionHighlights = computed(() => [
  {
    title: t('home.fusion_1_title'),
    text: t('home.fusion_1_text'),
    image: new URL('../assets/pictures/AsiaFoods/Foods/sharonang-fish-amok-921926_1920.jpg', import.meta.url).href,
  },
  {
    title: t('home.fusion_2_title'),
    text: t('home.fusion_2_text'),
    image: new URL('../assets/pictures/EroupFoods/Wines/kevin-kelly-PPneSBqfCCU-unsplash.jpg', import.meta.url).href,
  },
  {
    title: t('home.fusion_3_title'),
    text: t('home.fusion_3_text'),
    image: new URL('../assets/pictures/EroupFoods/Sweets/anna-tukhfatullina-food-photographer-stylist-Mzy-OjtCI70-unsplash.jpg', import.meta.url).href,
  },
])

const galleryImages = [
  new URL('../assets/pictures/AsiaFoods/Foods/kan_chansathya-khmer-food-3771719_1920.jpg', import.meta.url).href,
  new URL('../assets/pictures/AsiaFoods/Foods/pichara-g-I7PRofUoE-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/EroupFoods/Drinks/clovis-wood-iUtcVxqxkPk-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/EroupFoods/Pizza/matteophotopro2020-pizza-5275191_1920.jpg', import.meta.url).href,
  new URL('../assets/pictures/EroupFoods/Vegeterain/luisa-brimble-vIm26fn_QKg-unsplash.jpg', import.meta.url).href,
  new URL('../assets/pictures/EroupFoods/Wines/jeff-siepman-hK9hIPgF3QU-unsplash.jpg', import.meta.url).href,
]

const testimonials = computed(() => [
  {
    quote: t('home.testimonial_1_quote'),
    name: t('home.testimonial_1_name'),
    role: t('home.testimonial_1_role'),
  },
  {
    quote: t('home.testimonial_2_quote'),
    name: t('home.testimonial_2_name'),
    role: t('home.testimonial_2_role'),
  },
  {
    quote: t('home.testimonial_3_quote'),
    name: t('home.testimonial_3_name'),
    role: t('home.testimonial_3_role'),
  },
])

const socialLinks = [
  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/PhournKoemSeang' },
  { name: 'Telegram', icon: Send, url: 'https://t.me/Ph_koemseang' },
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/seangkosciusko/' },
  { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/@PhournKoemseang' },
]
</script>

<template>
  <div class="home-page min-h-screen bg-base-dark text-white selection:bg-gold/30">
    <section v-if="authStore.isAuthenticated">
      <CinematicHero />
    </section>

    <section v-else id="login"
      class="login-scene relative flex min-h-screen items-center justify-center overflow-hidden bg-base-dark px-5 py-24">
      <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
          alt="Premium bar background" class="h-full w-full object-cover opacity-40" />
        <div class="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black"></div>
      </div>

      <div class="login-grid absolute inset-0 opacity-20"></div>
      <div
        class="login-glow absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20">
      </div>
      <div class="login-ring absolute -right-28 top-24 h-72 w-72 rounded-full border border-gold/15"></div>
      <div class="login-ring delay absolute -bottom-24 -left-20 h-80 w-80 rounded-full border border-gold/10"></div>

      <div class="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div class="hidden lg:block">
          <p class="text-[10px] font-black uppercase tracking-[0.45em] text-gold">NekMak Restaurant</p>
          <h1 class="mt-7 font-serif text-6xl leading-[0.96] text-white">
            {{ t('home.title').split('.')[0] }}.
            <span class="block text-gold-light">{{ t('home.title').split('.')[1] }}.</span>
            <span class="block">{{ t('home.title').split('.')[2] }}.</span>
          </h1>
          <p class="mt-7 max-w-md text-sm leading-7 text-white/62">
            {{ t('home.subtitle') }}
          </p>
          <div class="mt-8 grid max-w-md grid-cols-3 gap-3">
            <div class="border border-gold/15 bg-black/40 p-4">
              <p class="font-serif text-2xl text-gold">KH</p>
              <p class="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Fusion</p>
            </div>
            <div class="border border-gold/15 bg-black/40 p-4">
              <p class="font-serif text-2xl text-gold">371</p>
              <p class="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Street</p>
            </div>
            <div class="border border-gold/15 bg-black/40 p-4">
              <p class="font-serif text-2xl text-gold">VIP</p>
              <p class="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Dining</p>
            </div>
          </div>
        </div>

        <div
          class="login-card-wrap mx-auto flex w-full max-w-md items-center justify-center border border-gold/20 bg-black/60 p-5 shadow-2xl shadow-gold/10 backdrop-blur-xl md:p-8">
          <LoginCard />
        </div>
      </div>
    </section>

    <section v-if="authStore.isAuthenticated" class="relative overflow-hidden py-24">
      <div class="ambient-line absolute left-0 top-1/2 h-px w-full bg-gold/10"></div>
      <div class="container relative mx-auto px-6 lg:px-16">
        <div class="section-reveal mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('home.service_title') }}</p>
            <h2 class="mt-4 font-serif text-4xl leading-tight md:text-6xl">{{ t('home.service_title') }}</h2>
          </div>
          <p class="max-w-xl text-sm leading-7 text-white/62">
            {{ t('home.service_desc') }}
          </p>
        </div>

        <div class="section-reveal grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div class="relative min-h-[520px] overflow-hidden border border-white/10 bg-card-dark">
            <img src="@/assets/pictures/chefs/sebastian-coman-photography-cQbOSRpElxw-unsplash.jpg"
              alt="NekMak chef preparing a modern Khmer and European fusion plate"
              class="absolute inset-0 h-full w-full object-cover opacity-75" />
            <div
              class="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.92),rgba(10,10,10,0.45)_55%,rgba(10,10,10,0.18)),linear-gradient(180deg,rgba(10,10,10,0.12),rgba(10,10,10,0.92))]">
            </div>

            <div
              class="absolute left-6 top-6 border border-gold/25 bg-base-dark/72 px-5 py-4 backdrop-blur-md md:left-10 md:top-10">
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Street 240</p>
              <p class="mt-2 font-serif text-2xl text-white">NekMak Restaurant</p>
            </div>

            <div class="absolute bottom-0 left-0 right-0 grid gap-4 p-6 md:grid-cols-[0.82fr_1fr] md:p-10">
              <div class="border border-white/10 bg-base-dark/82 p-6 backdrop-blur-md">
                <p class="text-[10px] font-black uppercase tracking-[0.28em] text-gold">Modern Khmer x Europe</p>
                <h3 class="mt-4 font-serif text-4xl leading-tight">Refined dining, calm service</h3>
                <p class="mt-4 text-sm leading-7 text-white/64">
                  Cambodian herbs, Kampot pepper, French sauces, Italian craft, and premium wine pairing in the heart of
                  Phnom Penh.
                </p>
              </div>
              <div class="grid grid-cols-3 gap-3 self-end">
                <div class="border border-gold/15 bg-base-dark/78 p-4 backdrop-blur-md">
                  <p class="font-serif text-2xl text-gold">6 AM</p>
                  <p class="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Open</p>
                </div>
                <div class="border border-gold/15 bg-base-dark/78 p-4 backdrop-blur-md">
                  <p class="font-serif text-2xl text-gold">240</p>
                  <p class="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Street</p>
                </div>
                <div class="border border-gold/15 bg-base-dark/78 p-4 backdrop-blur-md">
                  <p class="font-serif text-2xl text-gold">KH</p>
                  <p class="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/45">Fusion</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-6">
            <article v-for="tile in lokpaServiceTiles" :key="tile.title"
              class="service-tile group relative min-h-40 overflow-hidden border border-white/10 bg-card-dark">
              <img :src="tile.image" :alt="tile.title"
                class="absolute inset-0 h-full w-full object-cover opacity-48 transition-transform duration-700 group-hover:scale-110"
                loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-r from-base-dark via-base-dark/70 to-transparent"></div>
              <div class="relative z-10 flex min-h-40 flex-col justify-end p-6">
                <h3 class="font-serif text-3xl">{{ tile.title }}</h3>
                <p class="mt-2 max-w-sm text-sm leading-6 text-white/62">{{ tile.text }}</p>
              </div>
              <router-link :to="authStore.isAuthenticated ? '/menu' : { path: '/', hash: '#login' }"
                class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-gold/30 bg-base-dark/70 text-gold transition-all group-hover:bg-gold group-hover:text-base-dark"
                :aria-label="`Explore ${tile.title}`">
                <ArrowUpRight class="h-4 w-4" />
              </router-link>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section v-if="authStore.isAuthenticated"
      class="section-reveal container mx-auto grid gap-6 px-6 py-16 lg:grid-cols-3 lg:px-16">
      <article v-for="highlight in fusionHighlights" :key="highlight.title"
        class="highlight-card group relative min-h-[420px] overflow-hidden border border-white/10 bg-card-dark">
        <img :src="highlight.image" :alt="highlight.title"
          class="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-110" />
        <div class="absolute inset-0 bg-gradient-to-t from-base-dark via-base-dark/60 to-transparent"></div>
        <div class="absolute inset-x-0 bottom-0 p-7">
          <Flame class="mb-5 h-7 w-7 text-gold" />
          <h3 class="font-serif text-4xl">{{ highlight.title }}</h3>
          <p class="mt-4 text-sm leading-7 text-white/68">{{ highlight.text }}</p>
        </div>
      </article>
    </section>

    <section v-if="authStore.isAuthenticated" class="section-reveal overflow-hidden bg-card-dark/25 py-24">
      <div class="container mx-auto px-6 lg:px-16">
        <div class="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>              <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Modern Khmer & European</p>
            <h2 class="mt-4 font-serif text-4xl md:text-6xl">{{ t('home.fusion_title') }}</h2>
          </div>
          <router-link :to="authStore.isAuthenticated ? '/menu' : { path: '/', hash: '#login' }"
            class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-gold">
            {{ t('home.browse_all_dishes') }}
            <ArrowUpRight class="h-4 w-4" />
          </router-link>
        </div>

        <div class="gallery-grid grid grid-cols-2 gap-4 md:grid-cols-4">
          <button v-for="(image, index) in galleryImages" :key="image" @click="selectedGalleryImage = image"
            :class="['group relative overflow-hidden border border-white/10 bg-base-dark', index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : '']">
            <img :src="image" alt="NekMak menu showcase"
              class="h-full min-h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy" />
            <div class="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            </div>
            <ArrowUpRight
              class="absolute right-5 top-5 h-5 w-5 text-gold opacity-0 transition-all duration-300 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </section>

    <section v-if="authStore.isAuthenticated"
      class="section-reveal container mx-auto grid gap-8 px-6 py-24 lg:grid-cols-[1.35fr_0.85fr] lg:px-16">
      <div class="relative min-h-[470px] overflow-hidden border border-white/10 bg-card-dark">
        <img src="@/assets/pictures/EroupFoods/Wines/no-revisions-Y1UkHcx9VpM-unsplash.jpg"
          alt="NekMak dining sanctuary" class="absolute inset-0 h-full w-full object-cover opacity-58" />
        <div class="absolute inset-0 bg-gradient-to-r from-base-dark/84 via-base-dark/45 to-transparent"></div>
        <div class="relative z-10 flex min-h-[470px] max-w-xl flex-col justify-center p-8 md:p-14">
          <Wine class="mb-6 h-9 w-9 text-gold" />
          <h2 class="font-serif text-5xl">{{ t('home.sanctuary_title') }}</h2>
          <p class="mt-5 text-sm leading-7 text-white/68">
            {{ t('home.sanctuary_desc') }}
          </p>
        </div>
      </div>

      <div class="border border-white/10 bg-card-dark p-8 md:p-10">
        <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('home.reserve_your_evening') }}</p>
        <h2 class="mt-4 font-serif text-4xl">{{ t('home.book_title') }}</h2>

        <div class="mt-8 space-y-5">
          <div class="border-b border-gold/35 pb-4">
            <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">{{ t('home.location_info') }}</p>
            <p class="mt-2 text-white/85">{{ t('home.location_info') }}</p>
          </div>
          <div class="border-b border-gold/35 pb-4">
            <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">{{ t('home.hours_info') }}</p>
            <p class="mt-2 text-white/85">{{ t('home.hours_info') }}</p>
          </div>
          <div class="border-b border-gold/35 pb-4">
            <p class="text-[10px] uppercase tracking-[0.24em] text-white/45">{{ t('home.contact_info') }}</p>
            <p class="mt-2 text-white/85">{{ t('home.contact_info') }}</p>
          </div>
        </div>

        <router-link :to="authStore.isAuthenticated ? '/reservations' : { path: '/', hash: '#login' }"
          class="cta-button pulse-button mt-9 inline-flex h-12 w-full items-center justify-center gap-3 bg-gold px-7 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark">
          {{ t('home.book_now') }}
          <CalendarCheck class="h-4 w-4" />
        </router-link>
      </div>
    </section>

    <section v-if="authStore.isAuthenticated" class="section-reveal container mx-auto px-6 pb-24 lg:px-16">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article v-for="testimonial in testimonials" :key="testimonial.name"
          class="testimonial-card border border-gold/10 bg-card-dark/60 p-8">
          <Quote class="mb-8 h-8 w-8 text-gold" />
          <p class="min-h-28 text-lg leading-relaxed text-white/72">"{{ testimonial.quote }}"</p>
          <div class="mt-8 border-t border-white/10 pt-5">
            <p class="font-serif text-2xl text-white">{{ testimonial.name }}</p>
            <p class="mt-1 text-[10px] uppercase tracking-[0.24em] text-gold">{{ testimonial.role }}</p>
          </div>
        </article>
      </div>
    </section>

    <section v-if="authStore.isAuthenticated" class="border-y border-white/5 bg-card-dark/30 py-20">
      <div class="container mx-auto grid gap-12 px-6 md:grid-cols-3 lg:px-16">
        <div>
          <h2 class="font-serif text-4xl text-gold">NekMak Restaurant</h2>
          <p class="mt-4 max-w-sm text-sm leading-7 text-white/55">
            {{ t('home.service_desc') }}
          </p>
        </div>

        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-gold">{{ t('home.practical_info') }}</p>
          <div class="mt-5 space-y-3 text-sm text-white/72">
            <p class="flex items-center gap-3">
              <MapPin class="h-4 w-4 text-gold" /> {{ t('home.location_info') }}
            </p>
            <p class="flex items-center gap-3">
              <Clock class="h-4 w-4 text-gold" /> {{ t('home.hours_info') }}
            </p>
            <p class="flex items-center gap-3">
              <Star class="h-4 w-4 text-gold" /> {{ t('home.recommend_reservation') }}
            </p>
          </div>
        </div>

        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-gold">{{ t('home.follow_us') }}</p>
          <div class="mt-5 flex flex-wrap gap-4">
            <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" rel="noreferrer"
              class="group flex h-12 w-12 items-center justify-center border border-gold/20 text-gold transition-all duration-300 hover:-translate-y-1 hover:bg-gold hover:text-base-dark"
              :aria-label="social.name">
              <component :is="social.icon" class="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <Transition v-if="authStore.isAuthenticated" name="lightbox">
      <div v-if="selectedGalleryImage"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md"
        @click.self="selectedGalleryImage = null">
        <button class="absolute right-6 top-6 text-gold transition-colors hover:text-white"
          @click="selectedGalleryImage = null" :aria-label="t('common.close')">
          <X class="h-8 w-8" />
        </button>
        <img :src="selectedGalleryImage" alt="NekMak gallery image"
          class="max-h-[86vh] max-w-[92vw] border border-gold/20 object-contain shadow-2xl shadow-black" />
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

.delay-1 {
  animation-delay: 0.12s;
}

.delay-2 {
  animation-delay: 0.24s;
}

.delay-3 {
  animation-delay: 0.36s;
}

.scroll-cue {
  animation: soft-bounce 1.8s ease-in-out infinite;
}

.ambient-line {
  animation: gold-scan 7s ease-in-out infinite;
  transform-origin: left;
}

.login-grid {
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.07) 1px, transparent 1px);
  background-size: 64px 64px;
  animation: login-grid-drift 18s linear infinite;
}

.login-glow {
  box-shadow:
    0 0 120px rgba(212, 175, 55, 0.14),
    inset 0 0 90px rgba(212, 175, 55, 0.08);
  animation: login-pulse 5s ease-in-out infinite;
}

.login-ring {
  animation: login-float 8s ease-in-out infinite;
}

.login-ring.delay {
  animation-delay: -3s;
}

.login-card-wrap {
  animation: reveal-up 0.9s cubic-bezier(0.2, 0, 0.2, 1) both;
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

.pulse-button {
  animation: pulse-glow 2.5s infinite;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
  }

  70% {
    box-shadow: 0 0 0 20px rgba(212, 175, 55, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
  }
}

@keyframes hero-drift {
  from {
    transform: scale(1.05) translate3d(0, 0, 0);
  }

  to {
    transform: scale(1.15) translate3d(-2%, -1.5%, 0);
  }
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(42px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes soft-bounce {

  0%,
  100% {
    transform: translateY(0);
    opacity: 0.55;
  }

  50% {
    transform: translateY(12px);
    opacity: 1;
  }
}

@keyframes gold-scan {

  0%,
  100% {
    transform: scaleX(0.08);
    opacity: 0.18;
  }

  50% {
    transform: scaleX(1);
    opacity: 0.42;
  }
}

@keyframes login-grid-drift {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 64px 64px;
  }
}

@keyframes login-pulse {

  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.94);
    opacity: 0.55;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.04);
    opacity: 1;
  }
}

@keyframes login-float {

  0%,
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 0.55;
  }

  50% {
    transform: translate3d(0, -18px, 0);
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {

  .hero-image,
  .reveal,
  .section-reveal,
  .scroll-cue,
  .ambient-line,
  .login-grid,
  .login-glow,
  .login-ring,
  .login-card-wrap {
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
