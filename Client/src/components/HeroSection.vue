<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ShieldCheck } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <p class="text-gold text-xs tracking-[0.3em] uppercase font-medium">
      {{ t('hero.established') }}
    </p>

    <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] font-normal">
      {{ t('hero.refined_dining') }}
    </h1>

    <p class="text-text-subtle text-base md:text-lg leading-relaxed max-w-md">
      {{ t('hero.desc') }}
    </p>

    <div class="flex items-center gap-3 pt-4">
      <ShieldCheck :size="20" class="text-gold" fill="currentColor" />
      <span class="text-gold text-xs tracking-[0.15em] uppercase font-medium">
        Secured with JWT & Firebase Architecture
      </span>
    </div>
  </div>
</template>
