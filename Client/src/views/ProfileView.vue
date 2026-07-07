<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Calendar, Bell, Settings, LogOut, ShoppingBag, Gift, Star, ExternalLink } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()
const route = useRoute()
const activeTab = ref(route.query.tab === 'notifications' ? 'notifications' : 'profile')

// React to tab query param changes on the same route (e.g. NavBar bell click while already on /profile)
watch(() => route.query.tab, (tab) => {
  if (tab === 'notifications') activeTab.value = 'notifications'
})
const reservations = ref<any[]>([])
const orders = ref<any[]>([])
const notifications = ref<any[]>([])
const isLoading = ref(true)

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || ''
})

const coupons = ref<any[]>([])
const loyaltyProgress = ref<any>(null)

const fetchPromotions = async () => {
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` }
    const [couponResp, progressResp] = await Promise.all([
      fetch('http://localhost:5001/api/coupons/mine', { headers }),
      fetch('http://localhost:5001/api/coupons/progress', { headers })
    ])
    if (couponResp.ok) coupons.value = await couponResp.json()
    if (progressResp.ok) loyaltyProgress.value = await progressResp.json()
  } catch (error) {
    console.error('Failed to fetch promotions:', error)
  }
}

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
    
    await fetchPromotions()
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
      showToast('Profile updated successfully', 'success')
    } else {
      showToast('Failed to update profile', 'error')
    }
  } catch (error) {
    console.error('Profile update error:', error)
  }
}

const router = useRouter()

// Extract dish name from menu notification message
const extractDishName = (message: string): string | null => {
  const match = message.match(/new dish: (.+?)\./)
  return match ? match[1].trim() : null
}

const handleNotificationClick = async (notif: any) => {
  // Mark as read
  try {
    const response = await fetch(`http://localhost:5001/api/notifications/${notif.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.ok) {
      notif.is_read = 1
    }
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }

  // Navigate based on notification type
  if (notif.title?.includes('New Menu Item')) {
    const dishName = extractDishName(notif.message || '')
    if (dishName) {
      router.push(`/menu?highlight=${encodeURIComponent(dishName)}`)
    } else {
      router.push('/menu')
    }
  } else if (notif.type === 'order') {
    router.push('/orders')
  } else if (notif.type === 'reservation') {
    router.push('/reservations')
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

// Simple styled toast notification
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.className = `fixed bottom-6 right-6 z-[300] px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  }`
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 2500)
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
            <Settings :size="20" /> {{ t('profile.settings') }}
          </button>
          
          <button 
            @click="activeTab = 'history'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'history' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <Calendar :size="20" /> {{ t('profile.history') }}
          </button>

          <button 
            @click="activeTab = 'orders'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'orders' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <ShoppingBag :size="20" /> {{ t('profile.orders') }}
          </button>
          
          <button 
            @click="activeTab = 'notifications'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'notifications' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <Bell :size="20" /> {{ t('profile.notifications') }}
            <span v-if="notifications.filter(n => !n.is_read).length > 0" class="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {{ notifications.filter(n => !n.is_read).length }}
            </span>
          </button>

          <button 
            @click="activeTab = 'promotions'"
            :class="['w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all', activeTab === 'promotions' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:bg-white/5 hover:text-white']"
          >
            <Gift :size="20" /> {{ t('profile.promotions') }}
          </button>

          <button 
            @click="authStore.logout()"
            class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-10"
          >
            <LogOut :size="20" /> {{ t('profile.sign_out') }}
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
              <h3 class="font-serif text-3xl font-bold mb-8">{{ t('profile.title') }}</h3>
              <form @submit.prevent="updateProfile" class="space-y-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest text-white/40">{{ t('profile.name') }}</label>
                  <input v-model="profileForm.name" required type="text" class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-gold transition-all" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest text-white/40">{{ t('profile.email') }}</label>
                  <input v-model="profileForm.email" required type="email" class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-gold transition-all" />
                </div>
                <button type="submit" class="bg-gold text-black px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20">
                  {{ t('profile.action_update') }}
                </button>
              </form>
            </div>

            <!-- Booking History -->
            <div v-if="activeTab === 'history'" class="animate-fade-in">
              <h3 class="font-serif text-3xl font-bold mb-8">{{ t('profile.reservation_legacy') }}</h3>
              <div v-if="reservations.length === 0" class="text-center py-20 opacity-40">
                <Calendar :size="48" class="mx-auto mb-4 opacity-20" />
                <p>{{ t('profile.no_reservations') }}</p>
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
                      <p v-if="res.table_number" class="text-xs text-gold/70 mt-1 flex items-center gap-1">
                        <span class="text-[10px]">Table {{ res.table_number }} · {{ res.location || 'Main Hall' }}</span>
                      </p>
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
              <h3 class="font-serif text-3xl font-bold mb-8">{{ t('profile.orders') }}</h3>
              <div v-if="orders.length === 0" class="text-center py-20 opacity-40">
                <ShoppingBag :size="48" class="mx-auto mb-4 opacity-20" />
                <p>{{ t('profile.no_orders') }}</p>
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

            <!-- Promotions & Rewards -->
            <div v-if="activeTab === 'promotions'" class="animate-fade-in">
              <h3 class="font-serif text-3xl font-bold mb-8">{{ t('profile.loyalty') }}</h3>
              
              <!-- How it works -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div class="border border-gold/10 bg-white/5 p-6 rounded-2xl text-center">
                  <ShoppingBag class="h-8 w-8 text-gold mx-auto mb-3" />
                  <h4 class="font-bold text-sm mb-2">{{ t('profile.order_and_book') }}</h4>
                  <p class="text-xs text-white/50">{{ t('profile.order_and_book_desc') }}</p>
                </div>
                <div class="border border-gold/10 bg-white/5 p-6 rounded-2xl text-center">
                  <Star class="h-8 w-8 text-gold mx-auto mb-3" />
                  <h4 class="font-bold text-sm mb-2">{{ t('profile.earn_rewards') }}</h4>
                  <p class="text-xs text-white/50">{{ t('profile.earn_rewards_desc') }}</p>
                </div>
                <div class="border border-gold/10 bg-white/5 p-6 rounded-2xl text-center">
                  <Gift class="h-8 w-8 text-gold mx-auto mb-3" />
                  <h4 class="font-bold text-sm mb-2">{{ t('profile.enjoy_discounts') }}</h4>
                  <p class="text-xs text-white/50">{{ t('profile.enjoy_discounts_desc') }}</p>
                </div>
              </div>

              <!-- Progress Bar -->
              <div v-if="loyaltyProgress" class="border border-gold/10 bg-white/5 p-6 rounded-2xl mb-8">
                <div class="flex justify-between items-center mb-3">
                  <p class="text-sm font-bold">{{ t('profile.your_progress') }}</p>
                  <p class="text-xs text-gold font-bold">{{ loyaltyProgress.totalActivity }} / {{ loyaltyProgress.threshold }}</p>
                </div>
                <div class="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-1000"
                    :style="{ width: loyaltyProgress.progressPercent + '%' }"
                  ></div>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p class="text-[10px] uppercase tracking-widest text-white/40">{{ t('profile.progress_orders') }}</p>
                    <p class="font-bold text-lg">{{ loyaltyProgress.orderCount }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] uppercase tracking-widest text-white/40">{{ t('profile.progress_bookings') }}</p>
                    <p class="font-bold text-lg">{{ loyaltyProgress.bookingCount }}</p>
                  </div>
                </div>
                <p v-if="loyaltyProgress.remainingForReward > 0" class="text-xs text-gold mt-3">
                  {{ loyaltyProgress.remainingForReward }} more activities until your next reward!
                </p>
                <p v-else class="text-xs text-green-400 mt-3">
                  🎉 You've reached the threshold! Check your coupons below.
                </p>
              </div>

              <!-- Available Coupons -->
              <div>
                <h4 class="font-bold text-lg mb-4 flex items-center gap-2">
                  <Gift class="h-5 w-5 text-gold" /> 
                  {{ t('profile.available_coupons') }}
                </h4>
                
                <div v-if="coupons.length === 0" class="text-center py-10 opacity-40">
                  <Gift :size="48" class="mx-auto mb-4 opacity-20" />
                  <p class="text-sm">{{ t('profile.no_coupons') }}</p>
                </div>
                
                <div v-else class="space-y-4">
                  <div v-for="coupon in coupons" :key="coupon.id" 
                    class="border border-gold/20 bg-gradient-to-r from-gold/5 to-gold/10 p-6 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <span class="text-xs font-black uppercase tracking-widest text-gold">{{ coupon.code }}</span>
                      <p class="font-serif text-3xl text-white mt-2">{{ coupon.discount_percent }}% OFF</p>
                      <p v-if="coupon.valid_until" class="text-xs text-white/50 mt-1">
                        Valid until {{ new Date(coupon.valid_until).toLocaleDateString() }}
                      </p>
                    </div>
                    <div class="text-right">
                      <span class="inline-block px-4 py-2 bg-gold/20 text-gold rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {{ coupon.is_used ? t('profile.used') : t('profile.active') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div v-if="activeTab === 'notifications'" class="animate-fade-in">
              <div class="flex items-center justify-between mb-8">
                <h3 class="font-serif text-3xl font-bold">{{ t('profile.intelligence_feed') }}</h3>
              </div>
              
              <div v-if="notifications.length === 0" class="text-center py-20 opacity-40">
                <Bell :size="48" class="mx-auto mb-4 opacity-20" />
                <p>{{ t('profile.no_notifications') }}</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="notif in notifications" 
                  :key="notif.id" 
                  @click="handleNotificationClick(notif)"
                  :class="['p-6 rounded-3xl border transition-all cursor-pointer group', notif.is_read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-gold/5 border-gold/20']"
                >
                  <div class="flex gap-4">
                    <div :class="['p-3 rounded-2xl h-fit', notif.is_read ? 'bg-white/10 text-white/40' : 'bg-gold text-black']">
                      <component :is="notif.type === 'reservation' ? Calendar : (notif.type === 'order' ? ShoppingBag : Bell)" :size="20" />
                    </div>
                    <div class="flex-1">
                      <div class="flex justify-between items-start">
                        <h4 class="font-bold group-hover:text-gold transition-colors flex items-center gap-2">
                          {{ notif.title }}
                          <ExternalLink v-if="notif.title?.includes('New Menu Item') || notif.type === 'order' || notif.type === 'reservation'" :size="14" class="text-gold opacity-60" />
                        </h4>
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
