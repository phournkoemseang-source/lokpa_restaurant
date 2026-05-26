<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  Plus,
  MoreVertical,
  Clock,
  DollarSign,
  ChevronRight
} from 'lucide-vue-next'

const authStore = useAuthStore()

interface Order {
  id: number;
  total: number | string;
  status: string;
  customer_name?: string;
  customer_email?: string;
  created_at: string;
}

interface Reservation {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
}

const reservations = ref<Reservation[]>([])
const orders = ref<Order[]>([])
const menuItems = ref([])
const isLoading = ref(true)
const activeTab = ref('dashboard')

const stats = computed(() => {
  const totalRevenue = orders.value
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.total), 0)
    
  return [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', trend: '+12.5%' },
    { label: 'Active Reservations', value: reservations.value.filter(r => r.status === 'pending').length, icon: CalendarDays, color: 'text-gold', trend: '+3 today' },
    { label: 'Total Orders', value: orders.value.length, icon: UtensilsCrossed, color: 'text-blue-400', trend: '+18% this week' },
    { label: 'Staff Online', value: '8', icon: Users, color: 'text-purple-400', trend: 'Full strength' }
  ]
})

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` }
    const [resResp, orderResp, menuResp] = await Promise.all([
      fetch('http://localhost:5001/api/admin/reservations', { headers }),
      fetch('http://localhost:5001/api/admin/orders', { headers }),
      fetch('http://localhost:5001/api/menu')
    ])
    
    if (resResp.ok) reservations.value = await resResp.json()
    if (orderResp.ok) orders.value = await orderResp.json()
    if (menuResp.ok) menuItems.value = await menuResp.json()
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchDashboardData)

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20'
    case 'pending': return 'bg-gold/10 text-gold border-gold/20'
    case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#050505] text-white flex">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-white/5 bg-black/40 flex flex-col fixed h-full z-50">
      <div class="p-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
            <UtensilsCrossed class="text-black h-6 w-6" />
          </div>
          <div>
            <h1 class="font-serif text-xl font-bold tracking-tight text-white">NekMak</h1>
            <p class="text-[10px] uppercase tracking-widest text-gold font-black">Management</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-2">
        <button 
          v-for="item in [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'menu', label: 'Menu Editor', icon: UtensilsCrossed },
            { id: 'reservations', label: 'Bookings', icon: CalendarDays },
            { id: 'staff', label: 'Staff List', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings }
          ]" 
          :key="item.id"
          @click="activeTab = item.id"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
          :class="activeTab === item.id ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-white/60 hover:text-white hover:bg-white/5'"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </button>
      </nav>

      <div class="p-4 mt-auto">
        <button @click="authStore.logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut class="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64 p-8">
      <!-- Header -->
      <header class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-3xl font-serif font-bold text-white">Welcome back, Admin</h2>
          <p class="text-white/40 text-sm mt-1">Here's what's happening with NekMak today.</p>
        </div>

        <div class="flex items-center gap-6">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search data..." 
              class="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-6 text-sm outline-none focus:border-gold/50 transition-all w-64"
            />
          </div>
          <button class="relative p-2 text-white/60 hover:text-white transition-all">
            <Bell class="h-6 w-6" />
            <span class="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full border-2 border-[#050505]"></span>
          </button>
          <div class="flex items-center gap-3 pl-6 border-l border-white/10">
            <div class="text-right">
              <p class="text-sm font-bold">Administrator</p>
              <p class="text-[10px] text-gold uppercase tracking-widest font-black">NekMak Admin</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin&background=D4AF37&color=000" alt="Admin" />
            </div>
          </div>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div v-for="stat in stats" :key="stat.label" class="bg-white/5 border border-white/5 p-6 rounded-2xl hover:border-gold/30 transition-all group">
          <div class="flex items-start justify-between mb-4">
            <div :class="['p-3 rounded-xl bg-white/5', stat.color]">
              <component :is="stat.icon" class="h-6 w-6" />
            </div>
            <span class="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">{{ stat.trend }}</span>
          </div>
          <h3 class="text-white/40 text-xs uppercase tracking-widest font-bold">{{ stat.label }}</h3>
          <p class="text-3xl font-serif font-bold mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Dashboard Sections -->
      <div class="grid lg:grid-cols-[1.6fr_1fr] gap-8">
        <!-- Recent Orders -->
        <section class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          <div class="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 class="font-serif text-xl font-bold">Recent Activity</h3>
            <button class="text-gold text-xs font-bold hover:text-white transition-all">View All Orders</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
                  <th class="px-6 py-4">Order ID</th>
                  <th class="px-6 py-4">Customer</th>
                  <th class="px-6 py-4">Total</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="order in orders.slice(0, 5)" :key="order.id" class="group hover:bg-white/5 transition-all">
                  <td class="px-6 py-4 text-sm font-medium">#{{ order.id }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {{ order.customer_name?.[0] || 'G' }}
                      </div>
                      <div>
                        <p class="text-sm font-bold">{{ order.customer_name || 'Guest' }}</p>
                        <p class="text-[10px] text-white/30">{{ order.customer_email || 'No email' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm font-bold">${{ Number(order.total).toFixed(2) }}</td>
                  <td class="px-6 py-4">
                    <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border', getStatusColor(order.status)]">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button class="p-2 hover:bg-white/10 rounded-lg transition-all">
                      <MoreVertical class="h-4 w-4 text-white/40" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Recent Reservations -->
        <section class="bg-white/5 border border-white/5 rounded-2xl overflow-hidden h-fit">
          <div class="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 class="font-serif text-xl font-bold">Upcoming Bookings</h3>
            <button class="p-2 bg-gold/10 text-gold rounded-lg hover:bg-gold hover:text-black transition-all">
              <Plus class="h-4 w-4" />
            </button>
          </div>
          <div class="p-6 space-y-6">
            <div v-for="res in reservations.slice(0, 4)" :key="res.id" class="flex items-center justify-between group">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                  <span class="text-[10px] font-black text-gold leading-none uppercase">{{ new Date(res.date).toLocaleString('default', { month: 'short' }) }}</span>
                  <span class="text-lg font-bold leading-none mt-1">{{ new Date(res.date).getDate() }}</span>
                </div>
                <div>
                  <h4 class="text-sm font-bold">{{ res.name }}</h4>
                  <p class="text-xs text-white/40 flex items-center gap-2 mt-1">
                    <Clock class="h-3 w-3" /> {{ res.time.slice(0, 5) }} • {{ res.guests }} Guests
                  </p>
                </div>
              </div>
              <button class="p-2 rounded-lg bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
            <button class="w-full py-4 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-gold/50 transition-all">
              View Calendar
            </button>
          </div>
        </section>
      </div>
    </main>

    <!-- Overlay Loader -->
    <div v-if="isLoading" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gold font-serif italic text-lg animate-pulse">Synchronizing NekMak Intelligence...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Playfair Display', serif;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5);
}
</style>
