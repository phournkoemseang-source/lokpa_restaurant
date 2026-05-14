<script setup lang="ts">
import { Calendar, Users, MessageSquare, CheckCircle2, AlertCircle, Phone } from 'lucide-vue-next'
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
    <section class="relative h-[45vh] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-[url('@/assets/Images/Reservations%20_%20Nekmak%20Modern%20Fusion.png')] bg-cover bg-center opacity-40 scale-105"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-base-dark/80 via-transparent to-base-dark"></div>
      
      <div class="relative z-10 text-center space-y-4 px-6">
        <h1 class="font-serif text-5xl md:text-7xl text-gold italic">Reservations</h1>
        <p class="text-gold tracking-[0.4em] uppercase text-[10px] font-bold">Secure Your Table at the Fusion</p>
      </div>
    </section>

    <section class="container mx-auto px-6 lg:px-16 py-24">
      <div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        <!-- Booking Form -->
        <div class="lg:col-span-2 space-y-10">
          <div class="space-y-2">
            <h2 class="font-serif text-3xl text-white">Booking Details</h2>
            <p class="text-text-subtle text-sm">Please provide your preferred date and requirements.</p>
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
        <div class="space-y-12">
          <div class="p-8 bg-card-dark border border-border-card space-y-6">
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
              <span class="text-xl font-serif">+1 (212) 555-LUXE</span>
            </div>
            <p class="text-text-muted text-xs">Our concierge is available 24/7 for bespoke arrangements.</p>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
