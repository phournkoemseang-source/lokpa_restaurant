<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Utensils, ArrowUpRight } from 'lucide-vue-next'

gsap.registerPlugin(ScrollTrigger)

const heroRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const bgRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!heroRef.value) return

  // Parallax effect on background
  gsap.to(bgRef.value, {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: heroRef.value,
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  })

  // Logo Reveal Animation
  const logoChars = logoRef.value?.querySelectorAll('.char')
  if (logoChars) {
    gsap.from(logoChars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger: 0.05,
      duration: 1.5,
      ease: "power4.out",
      delay: 0.5
    })
  }

  // Content Reveal
  gsap.from(contentRef.value?.children || [], {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 1.2,
    ease: "power3.out",
    delay: 1.2
  })

  // Flare Animation
  gsap.to('.flare', {
    rotate: 360,
    duration: 20,
    repeat: -1,
    ease: "none"
  })

  gsap.to('.flare', {
    scale: 1.2,
    opacity: 0.6,
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  })
})

const splitText = (text: string) => {
  return text.split('').map(char => char === ' ' ? '\u00A0' : char)
}
</script>

<template>
  <section ref="heroRef" class="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
    <!-- Background Image with Parallax -->
    <div ref="bgRef" class="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2074&auto=format&fit=crop" 
        alt="Premium Restaurant Ambience" 
        class="h-[120%] w-full object-cover opacity-60 scale-110"
      />
      <!-- Overlays -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/40"></div>
    </div>

    <!-- Cinematic Effects -->
    <div class="absolute inset-0 z-1 pointer-events-none">
      <!-- Smoke Effects -->
      <div class="smoke smoke-1"></div>
      <div class="smoke smoke-2"></div>
      <div class="smoke smoke-3"></div>
      
      <!-- Light Flare -->
      <div class="flare absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[120px] mix-blend-screen"></div>
    </div>

    <!-- Main Content -->
    <div ref="contentRef" class="relative z-10 container mx-auto px-6 text-center">
      <div class="mb-6 flex justify-center">
        <div class="h-px w-12 bg-gold/50 self-center"></div>
        <span class="mx-4 text-[10px] font-black uppercase tracking-[0.5em] text-gold">The Art of the Sear</span>
        <div class="h-px w-12 bg-gold/50 self-center"></div>
      </div>

      <h1 ref="logoRef" class="font-serif text-6xl md:text-8xl lg:text-9xl leading-none text-white perspective-1000">
        <span v-for="(char, i) in splitText('Prime & Flame')" :key="i" class="char inline-block">
          {{ char }}
        </span>
      </h1>

      <p class="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-white/70 font-light leading-relaxed italic">
        "Where fire meets heritage, and every cut tells a story of perfection."
      </p>

      <div class="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
        <router-link
          to="/menu"
          class="group relative overflow-hidden bg-gold px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-black transition-all hover:bg-white"
        >
          <span class="relative z-10 flex items-center gap-3">
            Explore Menu
            <Utensils class="h-4 w-4" />
          </span>
          <div class="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0"></div>
        </router-link>

        <router-link
          to="/reservations"
          class="group relative border border-white/20 px-10 py-4 text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all hover:border-gold hover:text-gold"
        >
          <span class="relative z-10 flex items-center gap-3">
            Reserve Table
            <ArrowUpRight class="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </span>
        </router-link>
      </div>
    </div>

    <!-- Scroll Indicator -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 text-gold/60">
      <span class="text-[9px] uppercase tracking-[0.4em] rotate-180 [writing-mode:vertical-lr]">Scroll</span>
      <div class="h-12 w-px bg-gradient-to-b from-gold/60 to-transparent">
        <div class="scroll-dot w-1 h-1 bg-gold rounded-full"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

.perspective-1000 {
  perspective: 1000px;
}

/* Smoke Animation */
.smoke {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  filter: blur(50px);
  opacity: 0;
  animation: smoke-move 15s infinite linear;
}

.smoke-1 { top: -20%; left: -10%; animation-delay: 0s; }
.smoke-2 { top: 10%; left: 20%; animation-delay: 5s; }
.smoke-3 { top: -10%; left: -30%; animation-delay: 10s; }

@keyframes smoke-move {
  0% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 0.3; }
  80% { opacity: 0.3; }
  100% { transform: translate(10%, -10%) scale(1.5); opacity: 0; }
}

/* Scroll Dot Animation */
.scroll-dot {
  animation: scroll-ping 2s infinite;
}

@keyframes scroll-ping {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(40px); opacity: 0; }
}

.char {
  display: inline-block;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
</style>
