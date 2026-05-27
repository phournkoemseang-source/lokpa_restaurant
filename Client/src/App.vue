<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import CartOverlay from './components/CartOverlay.vue'

const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <div class="min-h-screen bg-base-dark">
    <template v-if="!isAdminPage">
      <NavBar />
    </template>
    
    <RouterView />
    
    <template v-if="!isAdminPage">
      <FooterSection />
      <CartOverlay />
    </template>
  </div>
</template>

<style>
/* Custom Scrollbar for Luxury Feel */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0A0A0A;
}

::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #F1D592;
}
</style>
