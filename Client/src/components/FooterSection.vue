<script setup lang="ts">
const navigationLinks = ['Facebook', 'Instagram', 'Newsletter']
const legalLinks = ['Privacy', 'Contact']
</script>

<template>
  <footer class="border-t border-border-card/50 bg-base-darker mt-24">
    <div class="container mx-auto px-6 lg:px-16 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Brand -->
        <div class="space-y-4">
          <h3 class="font-serif text-gold text-3xl italic">Nekmak</h3>
          <p class="text-text-subtle text-sm leading-relaxed max-w-xs">
            Redefining modern fusion through architectural culinary experiences in the heart of Cambodia.
          </p>
        </div>

        <!-- Navigation -->
        <div class="space-y-4">
          <h4 class="text-xs tracking-[0.2em] uppercase text-text-muted font-medium">Navigation</h4>
          <ul class="space-y-3">
            <li v-for="link in navigationLinks" :key="link">
              <a href="#" class="text-white/80 text-sm hover:text-gold transition-colors duration-300">
                {{ link }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="space-y-4">
          <h4 class="text-xs tracking-[0.2em] uppercase text-text-muted font-medium">Legal</h4>
          <ul class="space-y-3">
            <li v-for="link in legalLinks" :key="link">
              <a href="#" class="text-white/80 text-sm hover:text-gold transition-colors duration-300">
                {{ link }}
              </a>
            </li>
          </ul>
          <p class="text-text-muted text-xs pt-4">
            &copy; 2024 Nekmak Modern Fusion. Cambodia.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
