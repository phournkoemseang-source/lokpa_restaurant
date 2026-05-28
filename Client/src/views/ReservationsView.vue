<script setup lang="ts">
import { Users, CheckCircle2, AlertCircle, Phone, CalendarCheck, Clock, Sparkles } from 'lucide-vue-next'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const formData = ref({
  date: '',
  time: '',
  guests: 2,
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: '',
  specialRequests: '',
})

const isSubmitting = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')

async function handleSubmit() {
  isSubmitting.value = true
  status.value = 'idle'
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:5001/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(formData.value),
    })

    if (response.ok) {
      status.value = 'success'
      // Reset form
      formData.value = {
        date: '',
        time: '',
        guests: 2,
        name: authStore.user?.name || '',
        email: authStore.user?.email || '',
        phone: '',
        specialRequests: '',
      }
    } else {
      const data = await response.json()
      status.value = 'error'
      errorMessage.value = data.message || 'Failed to create reservation'
    }
  } catch (err) {
    status.value = 'error'
    errorMessage.value = 'Connection error. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <!-- Hero Banner -->
    <section class="relative min-h-[78vh] overflow-hidden">
      <img
        src="@/assets/pictures/EroupFoods/Wines/jeff-siepman-hK9hIPgF3QU-unsplash.jpg"
        alt="NekMak premium restaurant reservation banner"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.58),rgba(10,10,10,0.42)_38%,#0A0A0A_96%),linear-gradient(90deg,rgba(10,10,10,0.78),rgba(10,10,10,0.18)_52%,rgba(10,10,10,0.74))]"></div>

      <div class="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-6 pb-24 pt-32 text-center lg:px-16">
        <p class="text-[10px] font-black uppercase tracking-[0.45em] text-gold">NekMak Restaurant</p>
        <h1 class="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-tight text-white md:text-7xl">
          Online Reservation
          <span class="block text-gold-light">Book a Table</span>
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
          Reserve your table for modern Khmer and European fusion dining in Phnom Penh. Our team prepares a calm, premium evening for private dinners, celebrations, and chef-led experiences.
        </p>

        <div class="mx-auto mt-12 grid w-full max-w-5xl gap-5 md:grid-cols-3">
          <div class="border border-gold/20 bg-base-dark/72 p-6 text-left shadow-2xl shadow-black/30 backdrop-blur-md">
            <CalendarCheck class="h-7 w-7 text-gold" />
            <p class="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-gold">Simple Booking</p>
            <p class="mt-2 text-sm leading-6 text-white/65">Choose date, time, guests, and special requests in one clean form.</p>
          </div>
          <div class="border border-gold/20 bg-base-dark/72 p-6 text-left shadow-2xl shadow-black/30 backdrop-blur-md">
            <Sparkles class="h-7 w-7 text-gold" />
            <p class="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-gold">Premium Dining</p>
            <p class="mt-2 text-sm leading-6 text-white/65">Ideal for birthdays, business hosting, wine pairing, and chef events.</p>
          </div>
          <div class="border border-gold/20 bg-base-dark/72 p-6 text-left shadow-2xl shadow-black/30 backdrop-blur-md">
            <Clock class="h-7 w-7 text-gold" />
            <p class="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-gold">Daily Service</p>
            <p class="mt-2 text-sm leading-6 text-white/65">Open Monday - Sunday, 6:00 AM - 12:00 PM.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto px-6 py-24 lg:px-16">
      <div class="mx-auto -mt-36 grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.65fr]">
        
        <!-- Booking Form -->
        <div class="space-y-10 border border-gold/20 bg-card-dark/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-md md:p-10">
          <div class="space-y-3 text-center">
            <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">Reservation form</p>
            <h2 class="font-serif text-4xl text-white">Book A Table</h2>
            <p class="mx-auto max-w-xl text-sm leading-7 text-text-subtle">Please provide your preferred date and requirements. NekMak will prepare your table for a polished dining experience.</p>
          </div>

          <!-- Success Message -->
          <div v-if="status === 'success'" class="bg-green-900/20 border border-green-500/30 rounded-sm p-10 text-center space-y-6 animate-scale-in">
            <CheckCircle2 class="w-16 h-16 text-green-500 mx-auto" />
            <div class="space-y-2">
              <h2 class="font-serif text-2xl text-white">Request Received</h2>
              <p class="text-text-subtle">A confirmation email has been sent to your inbox. We look forward to hosting you.</p>
            </div>
            <button @click="status = 'idle'" class="px-8 py-3 border border-gold text-gold text-xs tracking-widest uppercase hover:bg-gold hover:text-base-dark transition-all duration-300">
              New Booking
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="status === 'error'" class="bg-red-900/20 border border-red-500/30 rounded-sm p-4 mb-6 flex items-center gap-3">
            <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
            <p class="text-red-200 text-sm">{{ errorMessage }}</p>
          </div>

          <form v-if="status !== 'success'" @submit.prevent="handleSubmit" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-2">
                <label class="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">Date</label>
                <input
                  v-model="formData.date"
                  type="date"
                  class="w-full bg-card-dark border-b border-border-card focus:border-gold px-0 py-3 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">Time</label>
                <select
                  v-model="formData.time"
                  class="w-full bg-card-dark border-b border-border-card focus:border-gold px-0 py-3 text-sm text-white focus:outline-none transition-colors"
                  required
                >
                  <option value="" disabled class="bg-base-dark">Select Seating</option>
                  <option value="18:00" class="bg-base-dark">18:00 (Sunset)</option>
                  <option value="19:00" class="bg-base-dark">19:00</option>
                  <option value="20:00" class="bg-base-dark">20:00</option>
                  <option value="21:00" class="bg-base-dark">21:00 (Late Night)</option>
                  <option value="22:00" class="bg-base-dark">22:00</option>
                  <option value="23:00" class="bg-base-dark">23:00</option>
                  <option value="24:00" class="bg-base-dark">24:00</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">Guests</label>
              <div class="relative">
                <Users class="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input
                  v-model.number="formData.guests"
                  type="number"
                  min="1"
                  max="12"
                  class="w-full bg-card-dark border-b border-border-card focus:border-gold pl-8 py-3 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-2">
                    <label class="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">Contact Name</label>
                    <input
                      v-model="formData.name"
                      type="text"
                      class="w-full bg-card-dark border-b border-border-card focus:border-gold px-0 py-3 text-sm text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">Phone Number</label>
                    <input
                      v-model="formData.phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      class="w-full bg-card-dark border-b border-border-card focus:border-gold px-0 py-3 text-sm text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
            </div>

            <div class="space-y-2">
              <label class="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">Special Requests</label>
              <textarea
                v-model="formData.specialRequests"
                rows="2"
                placeholder="Allergies, anniversaries, or specific seating..."
                class="w-full bg-card-dark border-b border-border-card focus:border-gold px-0 py-3 text-sm text-white focus:outline-none transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-gold hover:bg-gold-light text-base-dark font-bold py-4 px-4 tracking-[0.3em] uppercase text-xs transition-all duration-500 hover:shadow-2xl hover:shadow-gold/20 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Verifying Availability...' : 'Confirm Table Request' }}
            </button>
          </form>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-8">
          <div class="border border-border-card bg-card-dark/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
            <h3 class="font-serif text-2xl text-white">Dining Policy</h3>
            <ul class="space-y-4 text-xs tracking-widest leading-relaxed text-text-subtle">
              <li>• SMART ELEGANT DRESS CODE</li>
              <li>• 15-MINUTE GRACE PERIOD</li>
              <li>• ADULTS ONLY AFTER 20:00</li>
              <li>• VALET PARKING INCLUDED</li>
            </ul>
          </div>

          <div class="space-y-4">
            <h4 class="text-gold text-[10px] tracking-widest uppercase font-bold">Need Assistance?</h4>
            <div class="flex items-center gap-3">
              <Phone class="w-5 h-5 text-gold" />
              <span class="text-xl font-serif">+855 (0) 23 999 888</span>
            </div>
            <p class="text-text-muted text-xs">Our concierge is available 24/7 for bespoke arrangements.</p>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
