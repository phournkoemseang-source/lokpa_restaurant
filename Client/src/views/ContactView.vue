<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const inquiry = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  subject: '',
  message: '',
})

const newsletterEmail = ref('')
const isSubmitting = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const newsletterStatus = ref<'idle' | 'success'>('idle')

const canSubmit = computed(() =>
  inquiry.value.name.trim() &&
  inquiry.value.email.trim() &&
  inquiry.value.subject.trim() &&
  inquiry.value.message.trim()
)

async function handleSubmit() {
  status.value = 'idle'

  if (!canSubmit.value) {
    status.value = 'error'
    return
  }

  isSubmitting.value = true

  await new Promise((resolve) => window.setTimeout(resolve, 650))

  status.value = 'success'
  isSubmitting.value = false
  inquiry.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    subject: '',
    message: '',
  }
}

function handleNewsletter() {
  if (!newsletterEmail.value.trim()) return

  newsletterStatus.value = 'success'
  newsletterEmail.value = ''
}
</script>

<template>
  <main class="min-h-screen bg-base-dark text-white">
    <section class="relative overflow-hidden border-b border-border-card/50 pt-36 lg:pt-44">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(212,175,55,0.08),transparent_26%),linear-gradient(180deg,rgba(20,20,20,0.35),#0A0A0A_78%)]"></div>

      <div class="container relative z-10 mx-auto px-6 pb-20 lg:px-16 lg:pb-28">
        <div class="grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div class="max-w-3xl space-y-7">
            <p class="text-[10px] font-bold uppercase tracking-[0.45em] text-gold">LokPa Luxe Dining</p>
            <h1 class="font-serif text-5xl leading-none text-white md:text-7xl lg:text-8xl">
              Get in Touch
            </h1>
          </div>

          <p class="max-w-md text-base leading-8 text-text-subtle md:text-lg">
            Refining the art of Khmer hospitality with a modern architectural pulse. We are here to assist your elite journey.
          </p>
        </div>
      </div>
    </section>

    <section class="container mx-auto grid gap-12 px-6 py-16 lg:grid-cols-[0.86fr_1.5fr] lg:px-16 lg:py-24">
      <aside class="h-fit border border-border-card bg-card-dark/45 p-7 lg:p-9">
        <div class="space-y-8">
          <div class="border-b border-border-card pb-8">
            <p class="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">Address</p>
            <h2 class="font-serif text-3xl leading-tight text-white">
              Street 240, Phnom Penh, Kingdom of Cambodia.
            </h2>
          </div>

          <div class="border-b border-border-card pb-7">
            <p class="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">Phone</p>
            <a href="tel:+85523999888" class="flex items-center gap-3 text-white/90 transition-colors hover:text-gold">
              <Phone class="h-4 w-4 text-gold" />
              +855 (0) 23 999 888
            </a>
          </div>

          <div class="border-b border-border-card pb-7">
            <p class="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">Email</p>
            <a href="mailto:reservations@lokpa.com" class="flex items-center gap-3 text-white/90 transition-colors hover:text-gold">
              <Mail class="h-4 w-4 text-gold" />
              reservations@lokpa.com
            </a>
          </div>

          <div>
            <p class="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-gold">Hours</p>
            <p class="leading-7 text-white/90">
              Monday - Sunday<br />
              6:00 AM - 12:00 PM
            </p>
          </div>
        </div>
      </aside>

      <div class="lg:pt-1">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div class="grid gap-8 md:grid-cols-2">
            <label class="block space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-[0.35em] text-white">Name</span>
              <input
                v-model="inquiry.name"
                type="text"
                placeholder="Your Full Name"
                class="w-full border-0 border-b border-gold/60 bg-transparent px-0 py-4 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-gold"
              />
            </label>

            <label class="block space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-[0.35em] text-white">Email</span>
              <input
                v-model="inquiry.email"
                type="email"
                placeholder="email@example.com"
                class="w-full border-0 border-b border-gold/60 bg-transparent px-0 py-4 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-gold"
              />
            </label>
          </div>

          <label class="block space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-[0.35em] text-white">Subject</span>
            <input
              v-model="inquiry.subject"
              type="text"
              placeholder="Nature of your inquiry"
              class="w-full border-0 border-b border-gold/60 bg-transparent px-0 py-4 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-gold"
            />
          </label>

          <label class="block space-y-3">
            <span class="text-[10px] font-bold uppercase tracking-[0.35em] text-white">Message</span>
            <textarea
              v-model="inquiry.message"
              rows="4"
              placeholder="How may we assist you?"
              class="w-full resize-none border-0 border-b border-gold/60 bg-transparent px-0 py-4 text-sm text-white outline-none transition-colors placeholder:text-text-muted focus:border-gold"
            ></textarea>
          </label>

          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex h-12 w-full items-center justify-center gap-2 bg-gold px-8 text-[10px] font-black uppercase tracking-[0.25em] text-base-dark transition-all hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Send class="h-4 w-4" />
              {{ isSubmitting ? 'Sending...' : 'Send Inquiry' }}
            </button>

            <p v-if="status === 'success'" class="flex items-center gap-2 text-sm text-green-300">
              <CheckCircle2 class="h-4 w-4" />
              Your inquiry has been received.
            </p>

            <p v-if="status === 'error'" class="flex items-center gap-2 text-sm text-red-300">
              <AlertCircle class="h-4 w-4" />
              Please complete every field.
            </p>
          </div>
        </form>

        <h2 class="mt-9 font-serif text-4xl text-white lg:text-5xl">Send an Inquiry</h2>
      </div>
    </section>

    <section class="relative min-h-[520px] overflow-hidden">
      <img
        src="@/assets/pictures/Wines/matthieu-joannon-6ciLddToTgM-unsplash.jpg"
        alt="LokPa evening ambience"
        class="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark via-base-dark/35 to-base-dark"></div>

      <div class="relative z-10 flex min-h-[520px] items-center justify-center px-6 py-24">
        <div class="border border-gold/25 bg-base-dark/55 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-sm">
          <MapPin class="mx-auto mb-5 h-9 w-9 text-gold" />
          <h2 class="font-serif text-3xl text-gold">LokPa Luxe</h2>
          <p class="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-white/80">Street 240, Phnom Penh</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Street+240+Phnom+Penh+Cambodia"
            target="_blank"
            rel="noreferrer"
            class="mt-7 inline-flex items-center gap-2 border border-gold/45 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-gold transition-all hover:bg-gold hover:text-base-dark"
          >
            Get Directions
            <ArrowUpRight class="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>

    <section class="container mx-auto grid gap-14 px-6 py-20 lg:grid-cols-2 lg:px-16 lg:py-24">
      <div>
        <h2 class="font-serif text-3xl text-white">Follow the Legacy</h2>
        <div class="mt-6 flex flex-wrap gap-7">
          <a href="#" class="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-gold">
            <Instagram class="h-4 w-4 text-gold" />
            Instagram
          </a>
          <a href="#" class="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-gold">
            <Facebook class="h-4 w-4 text-gold" />
            Facebook
          </a>
        </div>
      </div>

      <form @submit.prevent="handleNewsletter" class="space-y-5">
        <p class="text-[10px] font-bold uppercase tracking-[0.35em] text-gold">Join the Inner Circle</p>
        <div class="flex flex-col gap-4 border-b border-gold/55 pb-3 sm:flex-row sm:items-center">
          <input
            v-model="newsletterEmail"
            type="email"
            placeholder="Your Email Address"
            class="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-text-muted"
          />
          <button
            type="submit"
            class="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-gold transition-colors hover:text-gold-light"
          >
            Subscribe
            <Send class="h-4 w-4" />
          </button>
        </div>
        <p v-if="newsletterStatus === 'success'" class="text-sm text-green-300">Thank you for subscribing.</p>
      </form>
    </section>
  </main>
</template>
