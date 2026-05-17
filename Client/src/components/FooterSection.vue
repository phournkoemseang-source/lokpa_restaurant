<script setup lang="ts">
import { Facebook, Instagram, Youtube, Send } from 'lucide-vue-next'

const socialLinks = [
  { 
    name: 'Facebook', 
    icon: Facebook, 
    url: 'https://www.facebook.com/search/top?q=Phourn%20KoemSeang' 
  },
  { 
    name: 'Telegram', 
    icon: Send, 
    url: 'https://t.me/Ph_koemseang' 
  },
  { 
    name: 'Instagram', 
    icon: Instagram, 
    url: 'https://www.instagram.com/seang_kosciusko/' 
  },
  { 
    name: 'YouTube', 
    icon: Youtube, 
    url: 'https://www.youtube.com/@PhournKoemseang' 
  }
]
</script>

<template>
  <footer class="border-t border-border-card/50 bg-base-darker mt-24">
    <div class="container mx-auto px-6 lg:px-16 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <!-- Brand -->
        <div class="space-y-6">
          <h3 class="font-serif text-gold text-3xl italic">LokPa</h3>
          <p class="text-text-subtle text-sm leading-relaxed max-w-xs">
            Redefining modern fusion through architectural culinary experiences in the heart of Cambodia.
          </p>
          <!-- Social Icons & Names -->
          <div class="flex flex-wrap items-center gap-6">
            <a v-for="social in socialLinks" 
               :key="social.name" 
               :href="social.url" 
               target="_blank"
               class="flex items-center gap-2 text-text-muted hover:text-gold transition-all duration-300 transform hover:-translate-y-1"
               :title="social.name"
            >
              <component :is="social.icon" :size="18" />
              <span class="text-[10px] uppercase tracking-widest font-bold">{{ social.name }}</span>
            </a>
            <!-- Custom TikTok Icon -->
            <a href="https://www.tiktok.com/@koemseang" 
               target="_blank"
               class="flex items-center gap-2 text-text-muted hover:text-gold transition-all duration-300 transform hover:-translate-y-1"
               title="TikTok"
            >
              <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
              <span class="text-[10px] uppercase tracking-widest font-bold">TikTok</span>
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div class="space-y-4">
          <h4 class="text-xs tracking-[0.2em] uppercase text-text-muted font-medium">Quick Links</h4>
          <ul class="space-y-3">
            <li><router-link to="/menu" class="text-white/80 text-sm hover:text-gold transition-colors">The Menu</router-link></li>
            <li><router-link to="/reservations" class="text-white/80 text-sm hover:text-gold transition-colors">Reservations</router-link></li>
            <li><router-link to="/experience" class="text-white/80 text-sm hover:text-gold transition-colors">The Experience</router-link></li>
          </ul>
        </div>

        <!-- Contact & Legal -->
        <div class="space-y-4">
          <h4 class="text-xs tracking-[0.2em] uppercase text-text-muted font-medium">Connect</h4>
          <p class="text-white/80 text-sm">Phnom Penh, Cambodia</p>
          <p class="text-white/80 text-sm hover:text-gold transition-colors">contact@lokpa.com</p>
          <p class="text-text-muted text-xs pt-4">
            &copy; 2026 LokPa Restaurant. <br/>
            Designed for Phourn KoemSeang.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
