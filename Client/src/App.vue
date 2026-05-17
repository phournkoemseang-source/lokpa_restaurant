<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import CartOverlay from './components/CartOverlay.vue'
</script>

<template>
  <div class="min-h-screen bg-base-dark">
    <NavBar />
    <RouterView />
    <FooterSection />
    <CartOverlay />
  </div>
</template>
