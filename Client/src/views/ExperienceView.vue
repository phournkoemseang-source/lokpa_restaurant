<script setup lang="ts">
import { Star, Utensils, Music, Users } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <!-- Hero Section -->
    <section class="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-[url('@/assets/Images/The%20Experience%20_%20Nekmak%20Modern%20Fusion.png')] bg-cover bg-center opacity-40"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark/60 via-transparent to-base-dark"></div>
      
      <div class="relative z-10 text-center space-y-6 max-w-4xl px-6">
        <h1 class="font-serif text-5xl md:text-7xl text-gold italic">The Experience</h1>
        <p class="text-xl md:text-2xl text-text-subtle font-light tracking-wide">
          A symphony of flavor, atmosphere, and meticulous service.
        </p>
      </div>
    </section>

    <!-- Content Sections -->
    <section class="container mx-auto px-6 lg:px-16 py-24 space-y-32">
      <!-- Culinary Artistry -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-8">
          <Utensils class="w-12 h-12 text-gold" />
          <h2 class="font-serif text-4xl text-white">Culinary Artistry</h2>
          <p class="text-text-subtle leading-relaxed text-lg">
            Our kitchen is a laboratory of modern fusion, where traditional techniques meet avant-garde innovation. Every plate is a canvas, and every ingredient is chosen for its peak seasonal quality and ethical origin.
          </p>
          <ul class="space-y-4 text-gold/80 italic">
            <li>• Sustainably sourced local ingredients</li>
            <li>• Fusion of Eastern and Western traditions</li>
            <li>• Award-winning culinary team</li>
          </ul>
        </div>
        <div class="aspect-video bg-card-dark border border-border-card overflow-hidden rounded-sm group">
          <div class="w-full h-full bg-[url('@/assets/Images/Main%20-%20Menu%20Grid.png')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
        </div>
      </div>

      <!-- Atmosphere -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
        <div class="lg:order-2 space-y-8">
          <Music class="w-12 h-12 text-gold" />
          <h2 class="font-serif text-4xl text-white">Ambiance & Sound</h2>
          <p class="text-text-subtle leading-relaxed text-lg">
            The Nekmak experience extends beyond the palate. Our space is designed with minimalist elegance, featuring custom acoustics and a curated soundtrack that evolves from the soft morning light to the intimate evening glow.
          </p>
          <p class="text-text-subtle leading-relaxed">
            From the velvet textures of our seating to the precisely calibrated lighting, every detail is engineered to heighten your sensory perception.
          </p>
        </div>
        <div class="lg:order-1 aspect-video bg-card-dark border border-border-card overflow-hidden rounded-sm group">
          <div class="w-full h-full bg-[url('@/assets/Images/Home%20_%20Nekmak%20Modern%20Fusion%20(v2).png')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
        </div>
      </div>

      <!-- Private Dining -->
      <div class="text-center max-w-3xl mx-auto space-y-12 py-16 border-y border-border-card/30">
        <Users class="w-12 h-12 text-gold mx-auto" />
        <h2 class="font-serif text-4xl text-white">Private Celebrations</h2>
        <p class="text-text-subtle text-lg italic">
          "For those moments that require absolute discretion and unparalleled luxury, our private suites offer a sanctuary for the world's most discerning guests."
        </p>
        <router-link to="/reservations" class="inline-block px-12 py-4 bg-gold text-base-dark font-bold uppercase tracking-widest hover:bg-gold-light transition-colors duration-300">
          Inquire Privately
        </router-link>
      </div>
    </section>
  </div>
</template>
