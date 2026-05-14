<script setup lang="ts">
import { ShoppingCart, Menu, X, LogOut } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

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
  <header class="sticky top-0 z-50 bg-base-dark/90 backdrop-blur-sm border-b border-border-card/30">
    <nav class="container mx-auto px-6 lg:px-16 flex items-center justify-between h-16">
      <router-link to="/" class="font-serif text-gold text-xl italic font-bold tracking-wide hover:text-gold-light transition-colors">
        Nekmak Modern Fusion
      </router-link>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-8">
        <ul class="flex items-center gap-8">
          <li v-for="link in navLinks" :key="link.path">
            <router-link
              :to="link.path"
              class="text-sm tracking-[0.15em] uppercase transition-colors duration-300"
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
        
        <!-- Show logout button when authenticated -->
        <button
          v-if="authStore.isAuthenticated"
          @click="handleLogout"
          aria-label="Logout"
          class="text-gold hover:text-gold-light transition-colors duration-300"
        >
          <LogOut :size="22" :stroke-width="1.5" />
        </button>
        <button
          v-else
          aria-label="Shopping cart"
          class="text-gold hover:text-gold-light transition-colors duration-300"
        >
          <ShoppingCart :size="22" :stroke-width="1.5" />
        </button>
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
      class="md:hidden bg-base-dark/95 backdrop-blur-sm border-t border-border-card/30"
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
