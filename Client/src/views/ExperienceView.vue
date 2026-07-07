<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { t } = useI18n()

const experienceCards = computed(() => [
  {
    title: t('experience.card_1_title'),
    text: t('experience.card_1_text'),
    image: new URL('../assets/pictures/AsiaFoods/Foods/sharonang-fish-amok-921926_1920.jpg', import.meta.url).href,
    icon: Utensils,
    link: '/menu',
    action: t('experience.card_1_action'),
  },
  {
    title: t('experience.card_2_title'),
    text: t('experience.card_2_text'),
    image: new URL('../assets/pictures/chefs/john-fornander-jJIb2e7Jkcs-unsplash.jpg', import.meta.url).href,
    icon: ChefHat,
    link: '/reservations',
    action: t('experience.card_2_action'),
  },
  {
    title: t('experience.card_3_title'),
    text: t('experience.card_3_text'),
    image: new URL('../assets/pictures/EroupFoods/Wines/kevin-kelly-PPneSBqfCCU-unsplash.jpg', import.meta.url).href,
    icon: Wine,
    link: '/reservations',
    action: t('experience.card_3_action'),
  },
])

const trustPoints = computed(() => [
  {
    title: t('experience.trust_1_title'),
    text: t('experience.trust_1_text'),
    icon: HeartHandshake,
  },
  {
    title: t('experience.trust_2_title'),
    text: t('experience.trust_2_text'),
    icon: ShieldCheck,
  },
  {
    title: t('experience.trust_3_title'),
    text: t('experience.trust_3_text'),
    icon: Sparkles,
  },
])

const eventTimeline = computed(() => [
  t('experience.step_1'),
  t('experience.step_2'),
  t('experience.step_3'),
  t('experience.step_4'),
])
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
          <p class="text-[10px] font-black uppercase tracking-[0.45em] text-gold">{{ t('experience.hero_tagline') }}</p>
          <h1 class="mt-8 font-serif text-5xl leading-[0.98] md:text-7xl lg:text-8xl">
            {{ t('experience.hero_heading') }}
            <span class="block text-gold-light">{{ t('experience.hero_heading_highlight') }}</span>
          </h1>
          <p class="mt-7 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            {{ t('experience.hero_desc') }}
          </p>

          <div class="mt-9 flex flex-wrap gap-4">
            <router-link
              to="/reservations"
              class="inline-flex h-12 items-center gap-3 bg-gold px-7 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark transition-all hover:bg-white"
            >
              {{ t('experience.book_experience') }}
              <CalendarCheck class="h-4 w-4" />
            </router-link>
            <router-link
              to="/menu"
              class="inline-flex h-12 items-center gap-3 border border-gold/45 px-7 text-[10px] font-black uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold hover:text-base-dark"
            >
              {{ t('experience.browse_dishes') }}
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
          <p class="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">{{ t('experience.location') }}</p>
          <p class="mt-2 font-serif text-2xl">Street 240, Phnom Penh</p>
        </div>
        <div class="border border-gold/15 bg-base-dark/60 p-6">
          <Clock class="h-6 w-6 text-gold" />
          <p class="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">{{ t('experience.open_hours') }}</p>
          <p class="mt-2 font-serif text-2xl">Every day, 06:00 - 12:00</p>
        </div>
        <div class="border border-gold/15 bg-base-dark/60 p-6">
          <Star class="h-6 w-6 text-gold" />
          <p class="mt-5 text-[10px] font-black uppercase tracking-[0.3em] text-white/45">{{ t('experience.for_label') }}</p>
          <p class="mt-2 font-serif text-2xl">{{ t('experience.private_dinners') }}</p>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-24 lg:px-16">
      <div class="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('experience.why_nekmak') }}</p>
          <h2 class="mt-5 font-serif text-4xl leading-tight md:text-6xl">{{ t('experience.why_heading') }}</h2>
        </div>
        <p class="max-w-2xl text-sm leading-7 text-white/62 lg:justify-self-end">
          {{ t('experience.why_desc') }}
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
            <p class="text-[10px] font-black uppercase tracking-[0.32em] text-gold">{{ t('experience.chef_philosophy') }}</p>
            <h2 class="mt-4 max-w-xl font-serif text-4xl leading-tight md:text-5xl">{{ t('experience.chef_philosophy_heading') }}</h2>
            <p class="mt-5 max-w-2xl text-sm leading-7 text-white/66">
              {{ t('experience.chef_philosophy_desc') }}
            </p>
          </div>
        </div>

        <div class="border border-white/10 bg-base-dark p-8 md:p-10">
          <ChefHat class="h-10 w-10 text-gold" />
          <h2 class="mt-6 font-serif text-4xl">{{ t('experience.chef_table_flow') }}</h2>
          <p class="mt-5 text-sm leading-7 text-white/62">
            {{ t('experience.chef_table_desc') }}
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
            {{ t('experience.organize_event') }}
            <CalendarCheck class="h-4 w-4" />
          </router-link>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-24 lg:px-16">
      <div class="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('experience.trust_title') }}</p>
          <h2 class="mt-4 font-serif text-4xl md:text-6xl">{{ t('experience.trust_title') }}</h2>
        </div>
        <router-link to="/contact" class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gold">
          {{ t('experience.contact_link') }}
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
