<script setup lang="ts">
import { ShoppingBag, Menu, X, LogOut, Bell, User } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const isMobileMenuOpen = ref(false)
const notifications = ref<any[]>([])
const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) return
  try {
    const response = await fetch('http://localhost:5001/api/notifications', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      notifications.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    fetchNotifications()
    // Poll for notifications every minute
    setInterval(fetchNotifications, 60000)
  }
})

const navLinks = computed(() => {
  const links = [{ name: 'Home', path: '/' }]
  if (authStore.isAuthenticated) {
    links.push(
      { name: 'Menu', path: '/menu' },
      { name: 'Experience', path: '/experience' },
      { name: 'Reservations', path: '/reservations' },
      { name: 'Contact', path: '/contact' }
    )
  }
  return links
})

// Only show Admin link to admin users
const adminLink = { name: 'Admin', path: '/admin' }

function isActive(path: string) {
  return route.path === path
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
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
      <div class="hidden md:flex items-center gap-8">
        <ul class="flex items-center gap-8">
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
              {{ adminLink.name }}
            </router-link>
          </li>
        </ul>
        
        <!-- Show logout/cart button -->
        <div class="flex items-center gap-6">
          <!-- Notification Bell -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/profile"
            class="relative text-gold hover:text-gold-light transition-colors duration-300"
            aria-label="Notifications"
          >
            <Bell :size="22" :stroke-width="1.5" />
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white animate-pulse">
              {{ unreadCount }}
            </span>
          </router-link>

          <!-- Profile Link -->
          <router-link
            v-if="authStore.isAuthenticated"
            to="/profile"
            class="text-gold hover:text-gold-light transition-colors duration-300"
            aria-label="Profile"
          >
            <User :size="22" :stroke-width="1.5" />
          </router-link>

          <button
            @click="cartStore.toggleCart()"
            class="relative text-gold hover:text-gold-light transition-colors duration-300"
            aria-label="Shopping cart"
          >
            <ShoppingBag :size="22" :stroke-width="1.5" />
            <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-white text-base-dark text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-gold">
              {{ cartStore.totalItems }}
            </span>
          </button>

          <button
            v-if="authStore.isAuthenticated"
            @click="handleLogout"
            aria-label="Logout"
            class="text-gold hover:text-gold-light transition-colors duration-300"
          >
            <LogOut :size="22" :stroke-width="1.5" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <button
        @click="toggleMobileMenu"
        class="md:hidden text-gold hover:text-gold-light transition-colors duration-300"
        :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
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
        <!-- Admin link only visible to admin users -->
        <li v-if="authStore.isAdmin">
          <router-link
            :to="adminLink.path"
            @click="isMobileMenuOpen = false"
            class="block px-6 py-3 text-sm tracking-[0.15em] uppercase transition-colors duration-300"
            :class="isActive(adminLink.path) ? 'text-gold' : 'text-white/80 hover:text-gold'"
          >
            {{ adminLink.name }}
          </router-link>
        </li>
        <li v-if="authStore.isAuthenticated">
          <button
            @click="handleLogout"
            class="block w-full text-left px-6 py-3 text-sm tracking-[0.15em] uppercase text-gold"
          >
            Logout
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
</style>
