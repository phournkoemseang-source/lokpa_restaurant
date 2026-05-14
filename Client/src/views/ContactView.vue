<script setup lang="ts">
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <!-- Header -->
    <section class="relative h-[50vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-[url('@/assets/Images/Contact%20&%20Location%20_%20NekMak%20Luxe%20Dining.png')] bg-cover bg-center opacity-40"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark/60 via-transparent to-base-dark"></div>
      
      <div class="relative z-10 text-center space-y-4">
        <h1 class="font-serif text-5xl md:text-6xl text-gold">Contact & Location</h1>
        <div class="w-24 h-px bg-gold mx-auto"></div>
      </div>
    </section>

    <section class="container mx-auto px-6 lg:px-16 py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <!-- Contact Info -->
        <div class="space-y-16">
          <div class="space-y-8">
            <h2 class="font-serif text-3xl text-white">Find Us</h2>
            <div class="space-y-6">
              <div class="flex gap-4">
                <MapPin class="w-6 h-6 text-gold shrink-0" />
                <p class="text-text-subtle text-lg">
                  123 Luxe Boulevard, Suite 500<br />
                  Modern District, NY 10001
                </p>
              </div>
              <div class="flex gap-4">
                <Phone class="w-6 h-6 text-gold shrink-0" />
                <p class="text-text-subtle text-lg">+1 (212) 555-Luxury</p>
              </div>
              <div class="flex gap-4">
                <Mail class="w-6 h-6 text-gold shrink-0" />
                <p class="text-text-subtle text-lg">concierge@nekmak.com</p>
              </div>
            </div>
          </div>

          <div class="space-y-8">
            <h2 class="font-serif text-3xl text-white">Hours of Service</h2>
            <div class="grid grid-cols-2 gap-8">
              <div class="space-y-2">
                <h4 class="text-gold text-xs tracking-widest uppercase">Dinner</h4>
                <p class="text-text-subtle">Tue — Sat<br />18:00 — 23:00</p>
              </div>
              <div class="space-y-2">
                <h4 class="text-gold text-xs tracking-widest uppercase">Bar</h4>
                <p class="text-text-subtle">Tue — Sun<br />17:00 — 01:00</p>
              </div>
            </div>
            <p class="text-text-muted text-sm italic">Closed on Mondays for culinary research.</p>
          </div>

          <div class="space-y-8">
            <h2 class="font-serif text-3xl text-white">Social Presence</h2>
            <div class="flex gap-6">
              <a href="#" class="p-3 border border-border-card text-gold hover:bg-gold hover:text-base-dark transition-all duration-300">
                <Instagram class="w-6 h-6" />
              </a>
              <a href="#" class="p-3 border border-border-card text-gold hover:bg-gold hover:text-base-dark transition-all duration-300">
                <Facebook class="w-6 h-6" />
              </a>
              <a href="#" class="p-3 border border-border-card text-gold hover:bg-gold hover:text-base-dark transition-all duration-300">
                <Twitter class="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <!-- Map Placeholder -->
        <div class="space-y-8">
          <h2 class="font-serif text-3xl text-white">Location Map</h2>
          <div class="aspect-square w-full bg-card-dark border border-border-card relative group overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center space-y-4">
                <MapPin class="w-12 h-12 text-gold mx-auto animate-bounce" />
                <p class="text-gold tracking-[0.2em] uppercase text-sm">Interactive Map</p>
              </div>
            </div>
            <!-- Mock Map Background -->
            <div class="w-full h-full bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-73.9857,40.7484,14,0/800x800?access_token=dummy')] bg-cover opacity-30"></div>
          </div>
          <p class="text-text-subtle text-center text-sm">Valet parking available at the main entrance.</p>
        </div>
      </div>
    </section>
  </div>
</template>
