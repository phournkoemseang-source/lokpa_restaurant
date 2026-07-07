<script setup lang="ts">
import { ShoppingBag, Menu, X, LogOut, Bell, User, Heart, Globe, MoreHorizontal } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const { t, locale } = useI18n()

const isMobileMenuOpen = ref(false)
const showLangMenu = ref(false)
const showToolsMenu = ref(false)
const unreadCount = ref(0)
const previousUnreadCount = ref(0)
let initialFetchDone = false
let toastTimeout: ReturnType<typeof setTimeout> | null = null

const fetchUnreadCount = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const response = await fetch('http://localhost:5001/api/notifications/unread-count', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const data = await response.json()
      const newCount = data.count

      // Detect new notification — only toast after initial load is complete
      if (initialFetchDone && newCount > previousUnreadCount.value) {
        fetchLatestNotificationAndToast()
      }

      previousUnreadCount.value = newCount
      unreadCount.value = newCount
      initialFetchDone = true
    }
  } catch (error) {
    console.error('Failed to fetch unread count:', error)
  }
}

const fetchLatestNotificationAndToast = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/notifications', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const notifs = await response.json()
      if (notifs.length > 0) {
        showNotificationToast(notifs[0])
      }
    }
  } catch (error) {
    console.error('Failed to fetch latest notification:', error)
  }
}

const navigateToNotification = async (notif: any) => {
  // Mark as read
  try {
    await fetch(`http://localhost:5001/api/notifications/${notif.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }

  // Navigate based on type
  const extractDishName = (message: string): string | null => {
    const match = message.match(/new dish: (.+?)\./)
    return match ? match[1].trim() : null
  }

  if (notif.title?.includes('New Menu Item')) {
    const dishName = extractDishName(notif.message || '')
    router.push(dishName ? `/menu?highlight=${encodeURIComponent(dishName)}` : '/menu')
  } else if (notif.type === 'order') {
    router.push('/orders')
  } else if (notif.type === 'reservation') {
    router.push('/reservations')
  } else {
    router.push('/profile?tab=notifications')
  }
}

const showNotificationToast = (notif: any) => {
  // Remove existing toast if any
  const existing = document.getElementById('notif-toast')
  if (existing) {
    if (toastTimeout) clearTimeout(toastTimeout)
    document.body.removeChild(existing)
  }

  const isMobile = window.innerWidth < 768

  const toast = document.createElement('div')
  toast.id = 'notif-toast'
  toast.style.cssText = `
    position: fixed;
    top: ${isMobile ? '76px' : '88px'};
    ${isMobile ? 'left: 12px; right: 12px;' : 'right: 24px;'}
    z-index: 9999;
    max-width: ${isMobile ? '100%' : '380px'};
    background: #1a1a1a;
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-radius: 16px;
    padding: ${isMobile ? '14px 16px' : '16px 20px'};
    cursor: pointer;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    transform: translateX(120%);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
  `

  // Truncate message
  const msg = notif.message?.length > 80 ? notif.message.slice(0, 80) + '…' : notif.message || ''

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="flex-shrink: 0; width: 32px; height: 32px; background: #D4AF37; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
        ${notif.type === 'reservation' ? '📅' : notif.type === 'order' ? '🛍️' : '🔔'}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <span style="font-weight: 700; font-size: 13px; color: #D4AF37; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${notif.title || 'Notification'}</span>                          <span style="font-size: 10px; color: rgba(255,255,255,0.3); font-weight: 800; white-space: nowrap;">{{ t('common.now') }}</span>
        </div>
        <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.4;">${msg}</p>
        <span style="display: inline-block; margin-top: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #D4AF37;">Click to view →</span>
      </div>
      <button id="toast-close" style="flex-shrink: 0; background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 18px; line-height: 1; padding: 0;">×</button>
    </div>
  `

  // Click to navigate
  toast.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.id === 'toast-close') return
    navigateToNotification(notif)
    document.body.removeChild(toast)
  })

  // Close button
  const closeBtn = toast.querySelector('#toast-close')
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      toast.style.transform = 'translateX(120%)'
      toast.style.opacity = '0'
      setTimeout(() => {
        if (toast.parentNode) document.body.removeChild(toast)
      }, 400)
    })
  }

  document.body.appendChild(toast)

  // Slide in on next frame
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)'
    toast.style.opacity = '1'
  })

  // Auto dismiss after 6 seconds
  toastTimeout = setTimeout(() => {
    toast.style.transform = 'translateX(120%)'
    toast.style.opacity = '0'
    setTimeout(() => {
      if (toast.parentNode) document.body.removeChild(toast)
    }, 400)
  }, 6000)
}

const switchLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  showLangMenu.value = false
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchUnreadCount()
    wishlistStore.fetchWishlist()
    setInterval(fetchUnreadCount, 30000)
  }
})

// Re-fetch when route changes (e.g., after marking notifications read)
watch(() => route.path, () => {
  if (authStore.isAuthenticated) {
    fetchUnreadCount()
  }
})

const navLinks = computed(() => {
  const links = [{ name: t('nav.home'), path: '/' }]
  if (authStore.isAuthenticated) {
    links.push(
      { name: t('nav.menu'), path: '/menu' },
      { name: t('nav.orders'), path: '/orders' },
      { name: t('nav.experience'), path: '/experience' },
      { name: t('nav.reservations'), path: '/reservations' },
      { name: t('nav.contact'), path: '/contact' }
    )
  }
  return links
})

// Only show Admin link to admin users
const adminLink = { name: t('nav.admin'), path: '/admin' }

function isActive(path: string) {
  return route.path === path
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeToolsMenu() {
  setTimeout(() => { showToolsMenu.value = false }, 200)
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
    <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between border border-gold/15 bg-base-dark/72 px-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:px-8">
      <router-link to="/" class="flex items-center gap-3 group">
        <img src="/src/assets/images/logo.png" alt="NekMak Logo" class="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
        <span class="font-serif text-gold text-xl italic font-bold tracking-wide hover:text-gold-light transition-colors">
          NekMak
        </span>
      </router-link>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-6">
        <ul class="flex items-center gap-6">
          <li v-for="link in navLinks" :key="link.path">
            <router-link
              :to="link.path"
              class="nav-link relative text-sm tracking-[0.15em] uppercase transition-colors duration-300"
              :class="isActive(link.path) ? 'text-gold' : 'text-white/80 hover:text-gold'"
            >
              {{ link.name }}
            </router-link>
          </li>
          <!-- Admin link only visible to admin users -->
          <li v-if="authStore.isAdmin">
            <router-link
              :to="adminLink.path"
              class="text-sm tracking-[0.15em] uppercase transition-colors duration-300"
              :class="isActive(adminLink.path) ? 'text-gold' : 'text-white/80 hover:text-gold'"
            >
              {{ t('nav.admin') }}
            </router-link>
          </li>
        </ul>
        
        <div class="flex items-center gap-2">
          <!-- Language Switcher -->
          <div class="relative">
            <button
              @click="showLangMenu = !showLangMenu"
              class="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors duration-300 px-2 py-1 border border-gold/20 rounded-lg text-[11px] font-bold uppercase tracking-wider"
            >
              <Globe :size="16" />
              {{ locale === 'kh' ? 'KH' : 'EN' }}
            </button>
            <div v-if="showLangMenu" class="absolute right-0 mt-2 w-28 bg-base-dark border border-gold/20 rounded-xl overflow-hidden shadow-2xl z-50">
              <button
                @click="switchLanguage('en')"
                class="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-gold/10 hover:text-gold transition-colors"
                :class="locale === 'en' ? 'text-gold bg-gold/10' : ''"
              >
                🇬🇧 English
              </button>
              <button
                @click="switchLanguage('kh')"
                class="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-gold/10 hover:text-gold transition-colors"
                :class="locale === 'kh' ? 'text-gold bg-gold/10' : ''"
              >
                🇰🇭 {{ t('nav.language') }}
              </button>
            </div>
          </div>

          <!-- Notifications Bell (standalone) -->
          <router-link
            to="/profile?tab=notifications"
            :class="['relative text-gold hover:text-gold-light transition-colors duration-300', { 'bell-ring': unreadCount > 0 }]"
            :aria-label="t('nav.notifications_label')"
          >
            <Bell :size="22" :stroke-width="1.5" />
            <span v-if="unreadCount > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-lg">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </router-link>

          <!-- Cart Bag (always visible) -->
          <button
            @click="cartStore.toggleCart()"
            class="relative text-gold hover:text-gold-light transition-colors duration-300"
            :aria-label="t('cart.title')"
          >
            <ShoppingBag :size="22" :stroke-width="1.5" />
            <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-white text-base-dark text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-gold">
              {{ cartStore.totalItems }}
            </span>
          </button>

          <!-- Tools Dropdown (grouped: Wishlist, Notifications, Profile, Logout) -->
          <div class="relative" v-if="authStore.isAuthenticated">
            <button
              @click="showToolsMenu = !showToolsMenu"
              @blur="closeToolsMenu()"
              class="flex items-center justify-center w-9 h-9 border border-gold/20 rounded-lg text-gold hover:text-gold-light hover:border-gold/50 transition-all duration-300"
              :aria-label="t('nav.my_profile')"
            >
              <MoreHorizontal :size="18" />
              <!-- Combined notification + wishlist badge -->
              <span v-if="(unreadCount > 0 || wishlistStore.count > 0) && !showToolsMenu" class="absolute -top-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
              </span>
            </button>
            
            <!-- Dropdown Menu -->
            <Transition name="dropdown">
              <div v-if="showToolsMenu" class="absolute right-0 mt-2 w-52 bg-base-dark border border-gold/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 z-50 backdrop-blur-xl">
                <div class="py-2">
                  <!-- Wishlist -->
                  <router-link
                    to="/wishlist"
                    @click="showToolsMenu = false"
                    class="flex items-center gap-4 px-5 py-3.5 text-sm text-white/80 hover:text-gold hover:bg-gold/10 transition-all"
                  >
                    <div class="relative">
                      <Heart :size="18" :stroke-width="1.5" />
                      <span v-if="wishlistStore.count > 0" class="absolute -top-2 -right-2 bg-gold text-base-dark text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {{ wishlistStore.count }}
                      </span>
                    </div>
                    <span class="flex-1">{{ t('nav.my_wishlist') }}</span>
                    <span v-if="wishlistStore.count > 0" class="text-[10px] font-black text-gold uppercase">{{ wishlistStore.count }}</span>
                  </router-link>

                  <!-- Profile -->
                  <router-link
                    to="/profile"
                    @click="showToolsMenu = false"
                    class="flex items-center gap-4 px-5 py-3.5 text-sm text-white/80 hover:text-gold hover:bg-gold/10 transition-all"
                  >
                    <User :size="18" :stroke-width="1.5" />
                    <span>{{ t('nav.my_profile') }}</span>
                  </router-link>

                  <!-- Orders -->
                  <router-link
                    to="/orders"
                    @click="showToolsMenu = false"
                    class="flex items-center gap-4 px-5 py-3.5 text-sm text-white/80 hover:text-gold hover:bg-gold/10 transition-all"
                  >
                    <ShoppingBag :size="18" :stroke-width="1.5" />
                    <span>{{ t('nav.my_orders') }}</span>
                  </router-link>

                  <!-- Divider -->
                  <div class="mx-5 my-2 h-px bg-gold/10"></div>

                  <!-- Logout -->
                  <button
                    @click="handleLogout"
                    class="flex w-full items-center gap-4 px-5 py-3.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut :size="18" :stroke-width="1.5" />
                    <span>{{ t('nav.logout') }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button
        @click="toggleMobileMenu"
        class="md:hidden text-gold hover:text-gold-light transition-colors duration-300"
        :aria-label="isMobileMenuOpen ? t('common.close') : t('common.open')"
      >
        <Menu v-if="!isMobileMenuOpen" :size="24" />
        <X v-else :size="24" />
      </button>
    </nav>

    <!-- Mobile Navigation -->
    <div
      v-show="isMobileMenuOpen"
      class="mx-auto mt-2 max-w-7xl border border-gold/15 bg-base-dark/95 backdrop-blur-xl md:hidden"
    >
      <ul class="flex flex-col py-4">
        <li v-for="link in navLinks" :key="link.path">
          <router-link
            :to="link.path"
            @click="isMobileMenuOpen = false"
            class="block px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors duration-300"
            :class="isActive(link.path) ? 'text-gold' : 'text-white/80 hover:text-gold'"
          >
            {{ link.name }}
          </router-link>
        </li>
        <li v-if="authStore.isAuthenticated">
          <router-link
            to="/orders"
            @click="isMobileMenuOpen = false"
            class="block px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors duration-300"
            :class="isActive('/orders') ? 'text-gold' : 'text-white/80 hover:text-gold'"
          >
            {{ t('nav.orders') }}
          </router-link>
        </li>
        <li v-if="authStore.isAuthenticated">
          <router-link
            to="/wishlist"
            @click="isMobileMenuOpen = false"
            class="block px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors duration-300"
            :class="isActive('/wishlist') ? 'text-gold' : 'text-white/80 hover:text-gold'"
          >
            {{ t('nav.wishlist') }}
          </router-link>
        </li>
        <!-- Admin link only visible to admin users -->
        <li v-if="authStore.isAdmin">
          <router-link
            :to="adminLink.path"
            @click="isMobileMenuOpen = false"
            class="block px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors duration-300"
            :class="isActive(adminLink.path) ? 'text-gold' : 'text-white/80 hover:text-gold'"
          >
            {{ t('nav.admin') }}
          </router-link>
        </li>
        <!-- Mobile Language Switcher -->
        <li class="border-t border-gold/10 mt-2 pt-2 px-6 py-3">
          <p class="text-[10px] uppercase tracking-widest text-text-muted mb-2">{{ t('nav.language') }}</p>
          <div class="flex gap-2">
            <button
              @click="switchLanguage('en'); isMobileMenuOpen = false"
              class="px-4 py-2 text-xs font-bold rounded-lg border transition-all"
              :class="locale === 'en' ? 'bg-gold text-base-dark border-gold' : 'border-gold/30 text-white/60 hover:text-gold'"
            >
              🇬🇧 EN
            </button>
            <button
              @click="switchLanguage('kh'); isMobileMenuOpen = false"
              class="px-4 py-2 text-xs font-bold rounded-lg border transition-all"
              :class="locale === 'kh' ? 'bg-gold text-base-dark border-gold' : 'border-gold/30 text-white/60 hover:text-gold'"
            >
              🇰🇭 KH
            </button>
          </div>
        </li>
        <li v-if="authStore.isAuthenticated">
          <button
            @click="handleLogout"
            class="block w-full text-left px-6 py-3 text-sm tracking-[0.15em] uppercase text-gold"
          >
            {{ t('nav.logout') }}
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: #D4AF37;
  box-shadow: 0 0 8px #D4AF37;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

.router-link-active.nav-link::after {
  width: 100%;
}

/* Dropdown Animation */
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}
.dropdown-leave-active {
  transition: all 0.15s ease-in;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* Bell Ring Animation */
.bell-ring {
  animation: bellPulse 2s ease-in-out infinite;
}

.bell-ring svg {
  animation: bellShake 2s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes bellPulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.3)); }
  50% { filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.7)); }
}

@keyframes bellShake {
  0%, 40%, 100% { transform: rotate(0deg); }
  5% { transform: rotate(15deg); }
  10% { transform: rotate(-12deg); }
  15% { transform: rotate(8deg); }
  20% { transform: rotate(-4deg); }
  25% { transform: rotate(0deg); }
}
</style>
