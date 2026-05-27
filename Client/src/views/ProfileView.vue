<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { User, Calendar, Bell, Settings, LogOut, CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-vue-next'

const authStore = useAuthStore()
const activeTab = ref('profile')
const reservations = ref<any[]>([])
const orders = ref<any[]>([])
const notifications = ref<any[]>([])
const isLoading = ref(true)

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || ''
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` }
    const [resResp, orderResp, notifResp] = await Promise.all([
      fetch('http://localhost:5001/api/user/reservations', { headers }),
      fetch('http://localhost:5001/api/user/orders', { headers }),
      fetch('http://localhost:5001/api/notifications', { headers })
    ])

    if (resResp.ok) reservations.value = await resResp.json()
    if (orderResp.ok) orders.value = await orderResp.json()
    if (notifResp.ok) notifications.value = await notifResp.json()
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
  } finally {
    isLoading.value = false
  }
}

const updateProfile = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify(profileForm.value)
    })

    if (response.ok) {
      authStore.user.name = profileForm.value.name
      authStore.user.email = profileForm.value.email
      localStorage.setItem('user', JSON.stringify(authStore.user))
      alert('Profile updated successfully')
    } else {
      alert('Failed to update profile')
    }
  } catch (error) {
    console.error('Profile update error:', error)
  }
}

const markAsRead = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:5001/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      const notif = notifications.value.find(n => n.id === id)
      if (notif) notif.is_read = 1
    }
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'confirmed': return 'text-green-400 bg-green-400/10'
    case 'rejected': return 'text-red-400 bg-red-400/10'
    case 'cancelled': return 'text-gray-400 bg-gray-400/10'
    default: return 'text-gold bg-gold/10'
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-base-dark pt-32 pb-20 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar -->
        <aside class="w-full md:w-64 space-y-2">
          <div class="p-6 bg-card-dark rounded-3xl border border-white/5 mb-6 text-center">
            <div class="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-black">
              {{ authStore.user?.name?.[0] || 'U' }}
            </div>
            <h2 class="font-serif text-xl font-bold">{{ authStore.user?.name }}</h2>
            <p class="text-[10px] uppercase tracking-widest text-gold font-black mt-1">{{ authStore.user?.role }} Account</p>
          </div>

          <button 
            @click="activeTab = 'profile'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'profile' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <Settings :size="20" /> Profile Settings
          </button>
          
          <button 
            @click="activeTab = 'history'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'history' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <Calendar :size="20" /> Booking History
          </button>

          <button 
            @click="activeTab = 'orders'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'orders' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <ShoppingBag :size="20" /> Order History
          </button>
          
          <button 
            @click="activeTab = 'notifications'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'notifications' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <Bell :size="20" /> Notifications
            <span v-if="notifications.filter(n => !n.is_read).length > 0" class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {{ notifications.filter(n => !n.is_read).length }}
            </span>
          </button>

          <button 
            @click="authStore.logout()"
            class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-10"
          >
            <LogOut :size="20" /> Sign Out
          </button>
        </aside>

        <!-- Content Area -->
        <main class="flex-1 bg-card-dark rounded-[2.5rem] border border-white/5 p-8 md:p-12 overflow-hidden">
          <div v-if="isLoading" class="flex items-center justify-center h-64">
            <div class="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else>
            <!-- Profile Settings -->
            <div v-if="activeTab === 'profile'" class="animate-fade-in">
              <h3 class="font-serif text-3xl font-bold mb-8">Profile Identity</h3>
              <form @submit.prevent="updateProfile" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                  <input v-model="profileForm.name" required type="text" class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-gold transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest text-white/40">Email Address</label>
                  <input v-model="profileForm.email" required type="email" class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-gold transition-all" />
                </div>
                <button type="submit" class="bg-gold text-black px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20">
                  Update Identity
                </button>
              </form>
            </div>

            <!-- Booking History -->
            <div v-if="activeTab === 'history'" class="animate-fade-in">
              <h3 class="font-serif text-3xl font-bold mb-8">Reservation Legacy</h3>
              <div v-if="reservations.length === 0" class="text-center py-20 opacity-40">
                <Calendar :size="48" class="mx-auto mb-4 opacity-20" />
                <p>No reservations found in your history.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="res in reservations" :key="res.id" class="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-6">
                    <div class="text-center min-w-[60px]">
                      <p class="text-[10px] uppercase font-black text-gold">{{ new Date(res.date).toLocaleString('default', { month: 'short' }) }}</p>
                      <p class="text-2xl font-bold">{{ new Date(res.date).getDate() }}</p>
                    </div>
                    <div>
                      <p class="font-bold">{{ res.time.slice(0, 5) }} • {{ res.guests }} Guests</p>
                      <p class="text-xs opacity-40 mt-1">Ref: #BK-{{ res.id }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest', getStatusColor(res.status)]">
                      {{ res.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order History -->
            <div v-if="activeTab === 'orders'" class="animate-fade-in">
              <h3 class="font-serif text-3xl font-bold mb-8">Order History</h3>
              <div v-if="orders.length === 0" class="text-center py-20 opacity-40">
                <ShoppingBag :size="48" class="mx-auto mb-4 opacity-20" />
                <p>No orders found in your history.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="order in orders" :key="order.id" class="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div class="flex items-center gap-6">
                    <div class="text-center min-w-[60px]">
                      <p class="text-[10px] uppercase font-black text-gold">{{ new Date(order.created_at).toLocaleString('default', { month: 'short' }) }}</p>
                      <p class="text-2xl font-bold">{{ new Date(order.created_at).getDate() }}</p>
                    </div>
                    <div>
                      <p class="font-bold">Order #{{ order.id }}</p>
                      <p class="text-xs opacity-40 mt-1">${{ Number(order.total).toFixed(2) }} via {{ order.payment_method }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest', getStatusColor(order.status)]">
                      {{ order.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div v-if="activeTab === 'notifications'" class="animate-fade-in">
              <div class="flex items-center justify-between mb-8">
                <h3 class="font-serif text-3xl font-bold">Intelligence Feed</h3>
              </div>
              
              <div v-if="notifications.length === 0" class="text-center py-20 opacity-40">
                <Bell :size="48" class="mx-auto mb-4 opacity-20" />
                <p>No notifications at this time.</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="notif in notifications" 
                  :key="notif.id" 
                  @click="markAsRead(notif.id)"
                  :class="['p-6 rounded-3xl border transition-all cursor-pointer group', notif.is_read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-gold/5 border-gold/20']"
                >
                  <div class="flex gap-4">
                    <div :class="['p-3 rounded-2xl h-fit', notif.is_read ? 'bg-white/10 text-white/40' : 'bg-gold text-black']">
                      <component :is="notif.type === 'reservation' ? Calendar : (notif.type === 'order' ? ShoppingBag : Bell)" :size="20" />
                    </div>
                    <div class="flex-1">
                      <div class="flex justify-between items-start">
                        <h4 class="font-bold group-hover:text-gold transition-colors">{{ notif.title }}</h4>
                        <span class="text-[10px] opacity-40 font-black">{{ new Date(notif.created_at).toLocaleDateString() }}</span>
                      </div>
                      <p class="text-sm opacity-60 mt-1">{{ notif.message }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
