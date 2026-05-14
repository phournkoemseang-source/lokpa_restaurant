<script setup lang="ts">
import { Settings, Users, Calendar, BarChart3, Loader2 } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const reservations = ref([])
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5001/api/admin/reservations', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch reservations')
    reservations.value = await response.json()
  } catch (err) {
    error.value = 'Failed to load dashboard data.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

const pendingCount = ref(0) // Logic to count pending can be added
</script>

<template>
  <div class="min-h-screen bg-base-dark">
    <section class="container mx-auto px-6 lg:px-16 py-24">
      <div class="text-center space-y-4 mb-16">
        <Settings class="w-12 h-12 text-gold mx-auto" />
        <h1 class="font-serif text-4xl md:text-5xl text-white">Admin Dashboard</h1>
        <p class="text-text-subtle">
          Manage reservations, menu, and restaurant operations
        </p>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <Loader2 class="w-10 h-10 text-gold animate-spin" />
      </div>

      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <div v-else class="space-y-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Reservations Card -->
          <div class="bg-card-dark/50 border border-border-card rounded-sm p-6 hover:border-gold/50 transition-colors">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-gold/10 rounded-sm">
                <Calendar class="w-6 h-6 text-gold" />
              </div>
              <h3 class="font-serif text-xl text-white">Reservations</h3>
            </div>
            <p class="text-text-subtle text-sm">
              Total Reservations: {{ reservations.length }}
            </p>
          </div>

          <!-- Menu Management Card -->
          <div class="bg-card-dark/50 border border-border-card rounded-sm p-6 hover:border-gold/50 transition-colors cursor-pointer">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-gold/10 rounded-sm">
                <BarChart3 class="w-6 h-6 text-gold" />
              </div>
              <h3 class="font-serif text-xl text-white">Menu Management</h3>
            </div>
            <p class="text-text-subtle text-sm">
              Update menu items, prices, and availability.
            </p>
          </div>

          <!-- Staff Management Card -->
          <div class="bg-card-dark/50 border border-border-card rounded-sm p-6 hover:border-gold/50 transition-colors cursor-pointer">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-3 bg-gold/10 rounded-sm">
                <Users class="w-6 h-6 text-gold" />
              </div>
              <h3 class="font-serif text-xl text-white">Staff</h3>
            </div>
            <p class="text-text-subtle text-sm">
              Manage staff schedules and access permissions.
            </p>
          </div>
        </div>

        <!-- Recent Reservations Table -->
        <div class="bg-card-dark/30 border border-border-card rounded-sm overflow-hidden">
          <div class="p-6 border-b border-border-card bg-card-dark/50">
            <h3 class="font-serif text-xl text-white">Recent Reservations</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="text-gold uppercase tracking-widest text-[10px] border-b border-border-card bg-base-dark/50">
                  <th class="px-6 py-4">Guest</th>
                  <th class="px-6 py-4">Date & Time</th>
                  <th class="px-6 py-4">Guests</th>
                  <th class="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-card/50">
                <tr v-for="res in reservations.slice(0, 10)" :key="res.id" class="text-white/80 hover:bg-white/5 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-medium text-white">{{ res.name }}</div>
                    <div class="text-xs text-text-muted">{{ res.email }}</div>
                  </td>
                  <td class="px-6 py-4">
                    {{ new Date(res.date).toLocaleDateString() }} at {{ res.time.slice(0, 5) }}
                  </td>
                  <td class="px-6 py-4">{{ res.guests }}</td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2 py-1 rounded-full text-[10px] uppercase tracking-tighter"
                      :class="{
                        'bg-gold/20 text-gold': res.status === 'pending',
                        'bg-green-500/20 text-green-500': res.status === 'confirmed',
                        'bg-red-500/20 text-red-500': res.status === 'cancelled'
                      }"
                    >
                      {{ res.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="reservations.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-text-muted italic">
                    No reservations found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>