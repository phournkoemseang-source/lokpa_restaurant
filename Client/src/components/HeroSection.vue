<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <p class="text-gold text-xs tracking-[0.3em] uppercase font-medium">
      Established 2024
    </p>

    <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] font-normal">
      Sensory<br />Indulgence.
    </h1>

    <p class="text-text-subtle text-base md:text-lg leading-relaxed max-w-md">
      Access your private portal to manage reservations,
      explore curated menus, and experience the elite
      precision of LokPa.
    </p>

    <div class="flex items-center gap-3 pt-4">
      <ShieldCheck :size="20" class="text-gold" fill="currentColor" />
      <span class="text-gold text-xs tracking-[0.15em] uppercase font-medium">
        Secured with JWT & Firebase Architecture
      </span>
    </div>
  </div>
</template>
