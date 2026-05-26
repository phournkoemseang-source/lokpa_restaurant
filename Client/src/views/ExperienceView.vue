<script setup lang="ts">
import {
  ArrowUpRight,
  CalendarCheck,
  ChefHat,
  Clock,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  Wine,
} from 'lucide-vue-next'

const experienceCards = [
  {
    title: 'Signature Dishes',
    text: 'Khmer foundations meet European technique: fish amok, Kampot pepper beef, fresh pasta, French sauces, and seasonal desserts plated with calm precision.',
    image: new URL('../assets/pictures/AsiaFoods/Foods/sharonang-fish-amok-921926_1920.jpg', import.meta.url).href,
    icon: Utensils,
    link: '/menu',
    action: 'View menu',
  },
  {
    title: 'Chef Events',
    text: 'NekMak hosts intimate chef-table evenings for guests who want to watch plating, hear the story of each ingredient, and enjoy a slower dining rhythm.',
    image: new URL('../assets/pictures/chefs/john-fornander-jJIb2e7Jkcs-unsplash.jpg', import.meta.url).href,
    icon: ChefHat,
    link: '/reservations',
    action: 'Book event',
  },
  {
    title: 'Wine Pairing',
    text: 'Premium wines are selected to balance Cambodian herbs, coconut, citrus, Kampot pepper, grilled seafood, and rich European sauces.',
    image: new URL('../assets/pictures/EroupFoods/Wines/kevin-kelly-PPneSBqfCCU-unsplash.jpg', import.meta.url).href,
    icon: Wine,
    link: '/reservations',
    action: 'Reserve pairing',
  },
]

const trustPoints = [
  {
    title: 'Real Phnom Penh Hospitality',
    text: 'NekMak is built for warm service, clear reservations, and a polished dinner experience on Street 240, Phnom Penh.',
    icon: HeartHandshake,
  },
  {
    title: 'Focused Food Identity',
    text: 'The menu stays true to modern Khmer and European fusion instead of trying to be everything at once.',
    icon: ShieldCheck,
  },
  {
    title: 'Made For Special Evenings',
    text: 'Private dining, birthday dinners, business hosting, wine pairing, and chef-table events all have a natural home here.',
    icon: Sparkles,
  },
]

const eventTimeline = [
  'Welcome drink and table introduction',
  'Chef explanation of Khmer and European flavors',
  'Signature course service with wine pairing option',
  'Dessert atelier and final tea or coffee',
]
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white selection:bg-gold/30">
    <section class="relative min-h-screen overflow-hidden">
      <img
        src="@/assets/pictures/chefs/sebastian-coman-photography-cQbOSRpElxw-unsplash.jpg"
        alt="NekMak chef finishing a refined plate"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.9),rgba(8,8,8,0.5)_48%,rgba(8,8,8,0.18)),linear-gradient(180deg,rgba(8,8,8,0.2),rgba(8,8,8,0.95)_92%)]"></div>

      <div class="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32 lg:px-16">
        <div class="max-w-3xl">
          <p class="text-[10px] font-black uppercase tracking-[0.45em] text-gold">NekMak Restaurant experience</p>
          <h1 class="mt-8 font-serif text-5xl leading-[0.98] md:text-7xl lg:text-8xl">
            Where Taste Meets
            <span class="block text-gold-light">Elegance</span>
          </h1>
          <p class="mt-7 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            NekMak Restaurant brings modern Khmer and European fusion to Phnom Penh with chef-led plating, premium wines, private reservations, and attentive service designed for memorable evenings.
          </p>

          <div class="mt-9 flex flex-wrap gap-4">
            <router-link
              to="/reservations"
              class="inline-flex h-12 items-center gap-3 bg-gold px-7 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark transition-all hover:bg-white"
            >
              Reserve Experience
              <CalendarCheck class="h-4 w-4" />
            </router-link>
            <router-link
              to="/menu"
              class="inline-flex h-12 items-center gap-3 border border-gold/45 px-7 text-[10px] font-black uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold hover:text-base-dark"
            >
              Explore Dishes
              <ArrowUpRight class="h-4 w-4" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-white/5 bg-card-dark/30 py-16">
      <div class="container mx-auto grid gap-6 px-6 md:grid-cols-3 lg:px-16">
        <div class="border border-gold/15 bg-base-dark/60 p-6">
          <MapPin class="h-6 w-6 text-gold" />
          <p class="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Location</p>
          <p class="mt-2 font-serif text-2xl">Street 240, Phnom Penh</p>
        </div>
        <div class="border border-gold/15 bg-base-dark/60 p-6">
          <Clock class="h-6 w-6 text-gold" />
          <p class="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Hours</p>
          <p class="mt-2 font-serif text-2xl">Daily, 6:00 AM - 12:00 PM</p>
        </div>
        <div class="border border-gold/15 bg-base-dark/60 p-6">
          <Star class="h-6 w-6 text-gold" />
          <p class="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Best For</p>
          <p class="mt-2 font-serif text-2xl">Private dining and chef events</p>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-24 lg:px-16">
      <div class="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Why choose NekMak</p>
          <h2 class="mt-5 font-serif text-4xl leading-tight md:text-6xl">A Restaurant Built For Meaningful Dinner</h2>
        </div>
        <p class="max-w-2xl text-sm leading-7 text-white/62 lg:justify-self-end">
          Choose NekMak when you want more than food on a table. The experience is planned around taste, pacing, trust, and atmosphere: clear service, real Cambodian flavor, European discipline, and a dining room that feels private without feeling cold.
        </p>
      </div>

      <div class="mt-14 grid gap-7 md:grid-cols-3">
        <article
          v-for="card in experienceCards"
          :key="card.title"
          class="group border border-white/10 bg-card-dark/70"
        >
          <div class="relative h-72 overflow-hidden">
            <img :src="card.image" :alt="card.title" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-base-dark/80 to-transparent"></div>
            <component :is="card.icon" class="absolute left-6 top-6 h-8 w-8 text-gold" />
          </div>
          <div class="p-7">
            <h3 class="font-serif text-3xl">{{ card.title }}</h3>
            <p class="mt-4 min-h-28 text-sm leading-7 text-white/62">{{ card.text }}</p>
            <router-link :to="card.link" class="mt-7 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gold">
              {{ card.action }}
              <ArrowUpRight class="h-4 w-4" />
            </router-link>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-card-dark/25 py-24">
      <div class="container mx-auto grid gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-16">
        <div class="relative min-h-[520px] overflow-hidden border border-white/10">
          <img
            src="@/assets/pictures/EroupFoods/Foods/alex-munsell-auIbTAcSH6E-unsplash.jpg"
            alt="NekMak signature plated dish"
            class="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.88),rgba(8,8,8,0.35)),linear-gradient(180deg,transparent,rgba(8,8,8,0.94))]"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <p class="text-[10px] font-black uppercase tracking-[0.32em] text-gold">Chef philosophy</p>
            <h2 class="mt-4 max-w-xl font-serif text-4xl leading-tight md:text-5xl">Respect the ingredient. Finish with elegance.</h2>
            <p class="mt-5 max-w-2xl text-sm leading-7 text-white/66">
              NekMak plates with restraint: fresh herbs, clean sauces, careful heat, balanced acidity, and a sense of occasion that still feels generous.
            </p>
          </div>
        </div>

        <div class="border border-white/10 bg-base-dark p-8 md:p-10">
          <ChefHat class="h-10 w-10 text-gold" />
          <h2 class="mt-6 font-serif text-4xl">Chef Event Flow</h2>
          <p class="mt-5 text-sm leading-7 text-white/62">
            A chef event at NekMak is ideal for small groups, birthdays, business guests, and couples who want the story behind the plate.
          </p>

          <div class="mt-9 space-y-5">
            <div v-for="(item, index) in eventTimeline" :key="item" class="flex gap-5 border-b border-gold/15 pb-5">
              <span class="font-serif text-3xl text-gold">{{ String(index + 1).padStart(2, '0') }}</span>
              <p class="pt-2 text-sm leading-6 text-white/72">{{ item }}</p>
            </div>
          </div>

          <router-link
            to="/reservations"
            class="mt-9 inline-flex h-12 w-full items-center justify-center gap-3 bg-gold px-7 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark transition-all hover:bg-white"
          >
            Plan Chef Event
            <CalendarCheck class="h-4 w-4" />
          </router-link>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-24 lg:px-16">
      <div class="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Why believe NekMak</p>
          <h2 class="mt-4 font-serif text-4xl md:text-6xl">Trust Comes From Details</h2>
        </div>
        <router-link to="/contact" class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gold">
          Contact NekMak
          <ArrowUpRight class="h-4 w-4" />
        </router-link>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <article v-for="point in trustPoints" :key="point.title" class="border border-gold/12 bg-card-dark/55 p-8">
          <component :is="point.icon" class="h-9 w-9 text-gold" />
          <h3 class="mt-7 font-serif text-3xl">{{ point.title }}</h3>
          <p class="mt-4 text-sm leading-7 text-white/62">{{ point.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>
