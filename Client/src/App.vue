<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div class="min-h-screen bg-base-dark">
    <NavBar />
    <router-view />
    <FooterSection />
  </div>
</template>
