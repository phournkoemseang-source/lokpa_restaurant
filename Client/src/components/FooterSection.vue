<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Facebook, Instagram, Send, Twitter } from 'lucide-vue-next'

const { t } = useI18n()

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://www.facebook.com/PhournKoemSeang'
  },
  {
    name: 'Telegram',
    icon: Send,
    url: 'https://t.me/Ph_koemseang'
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/seangkosciusko/'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    url: 'https://twitter.com/PhournKoemseang'
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
            {{ t('footer.brand_desc') }}
          </p>
          <!-- Social Icons & Names -->
          <div class="flex flex-wrap items-center gap-6">
            <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank"
              class="flex items-center gap-2 text-text-muted hover:text-gold transition-all duration-300 transform hover:-translate-y-1"
              :title="social.name">
              <component :is="social.icon" :size="18" />
              <span class="text-[10px] uppercase tracking-widest font-bold">{{ social.name }}</span>
            </a>
            <!-- Custom TikTok Icon -->
            <a href="https://www.tiktok.com/@koemseang" target="_blank"
              class="flex items-center gap-2 text-text-muted hover:text-gold transition-all duration-300 transform hover:-translate-y-1"
              title="TikTok">
              <svg :width="16" :height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
              <span class="text-[10px] uppercase tracking-widest font-bold">TikTok</span>
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div class="space-y-4">
          <h4 class="text-xs tracking-[0.2em] uppercase text-text-muted font-medium">{{ t('footer.quick_links') }}</h4>
          <ul class="space-y-3">
            <li><router-link to="/menu"
                class="text-white/80 text-sm hover:text-gold transition-colors">{{ t('footer.menu') }}</router-link></li>
            <li><router-link to="/reservations"
                class="text-white/80 text-sm hover:text-gold transition-colors">{{ t('footer.reservations') }}</router-link></li>
            <li><router-link to="/experience"
                class="text-white/80 text-sm hover:text-gold transition-colors">{{ t('footer.experience') }}</router-link></li>
          </ul>
        </div>

        <!-- Contact & Legal -->
        <div class="space-y-4">
          <h4 class="text-xs tracking-[0.2em] uppercase text-text-muted font-medium">{{ t('footer.contact') }}</h4>
          <p class="text-white/80 text-sm">{{ t('footer.location') }}</p>
          <p class="text-white/80 text-sm hover:text-gold transition-colors">phournkoemeang@gmail.com</p>
          <p class="text-text-muted text-xs pt-4" v-html="t('footer.copyright')">
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
