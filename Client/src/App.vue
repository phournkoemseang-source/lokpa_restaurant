<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterSection from './components/FooterSection.vue'
import CartOverlay from './components/CartOverlay.vue'
import { gsap } from 'gsap'

const cursorRef = ref<HTMLElement | null>(null)
const cursorFollowerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const cursor = cursorRef.value
  const follower = cursorFollowerRef.value

  if (cursor && follower) {
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      })
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: "power2.out"
      })
    })

    // Hover effects
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        gsap.to(cursor, { scale: 1.5, backgroundColor: '#D4AF37', duration: 0.3 })
        gsap.to(follower, { scale: 2, opacity: 0.1, duration: 0.3 })
      })
      el.addEventListener('mouseleave', () => {
        gsap.to(cursor, { scale: 1, backgroundColor: 'white', duration: 0.3 })
        gsap.to(follower, { scale: 1, opacity: 0.3, duration: 0.3 })
      })
    })
  }
})
</script>

<template>
  <div class="min-h-screen bg-base-dark cursor-none">
    <div ref="cursorRef" class="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"></div>
    <div ref="cursorFollowerRef" class="pointer-events-none fixed left-0 top-0 z-[9998] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 opacity-30 mix-blend-difference"></div>
    
    <NavBar />
    <RouterView />
    <FooterSection />
    <CartOverlay />
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

.cursor-none {
  cursor: none !important;
}

/* Ensure interactive elements don't show default cursor */
a, button, [role="button"] {
  cursor: none !important;
}
</style>
