<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { gsap } from 'gsap'
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  CalendarDays, 
  Users, 
  Settings, 
  LogOut, 
  Bell,
  Plus,
  DollarSign,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShoppingBag,
  Eye,
  Trash2,
  Edit,
  GripVertical
} from 'lucide-vue-next'

const authStore = useAuthStore()

interface Order {
  id: number;
  total: number;
  status: string;
  customer_name?: string;
  customer_email?: string;
  created_at: string;
  payment_method?: string;
  items?: any[];
}

interface Reservation {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  email?: string;
  phone?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  cuisine: string;
  image_url: string;
  available: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  provider: string;
  created_at: string;
}

const reservations = ref<Reservation[]>([])
const orders = ref<Order[]>([])
const menuItems = ref<MenuItem[]>([])
const users = ref<User[]>([])
const isLoading = ref(true)
const activeTab = ref('dashboard')
const isDarkMode = ref(true)
const isMenuModalOpen = ref(false)
const isProfileModalOpen = ref(false)
const editingItem = ref<MenuItem | null>(null)
const alertModal = ref({ show: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' | 'warning' })
const draggedItem = ref<MenuItem | null>(null)
const dragOverItem = ref<MenuItem | null>(null)
const isImageDragging = ref(false)
const imagePreview = ref<string | null>(null)
const menuItemForm = ref({
  name: '',
  description: '',
  price: 0,
  category: 'Foods',
  cuisine: 'International',
  image_url: ''
})

const imageSrc = (url: string | null | undefined) => {
  if (!url) return '/src/assets/images/logo.png'
  if (typeof url === 'string' && url.startsWith && url.startsWith('http')) return url
  return `http://localhost:5001/assets/pictures/${url}`
}

const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  alertModal.value = { show: true, title, message, type }
  setTimeout(() => { alertModal.value.show = false }, 4000)
}

const closeAlert = () => { alertModal.value.show = false }

const handleImageDrop = async (event: DragEvent) => {
  event.preventDefault()
  isImageDragging.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!file.type.startsWith('image/')) {
    showAlert('Error', 'Please upload an image file', 'error')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string)?.split(',')[1]
      const filename = `${Date.now()}-${file.name}`
      
      const headers: any = { 'Content-Type': 'application/json' }
      if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
      
      const response = await fetch('http://localhost:5001/api/admin/upload-image', {
        method: 'POST',
        headers,
        body: JSON.stringify({ filename, base64Data: base64 })
      })
      
      if (response.ok) {
        const data = await response.json()
        menuItemForm.value.image_url = data.image_url
        imagePreview.value = e.target?.result as string
        showAlert('Success', 'Image uploaded successfully', 'success')
      } else {
        showAlert('Error', 'Failed to upload image', 'error')
      }
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Image upload failed:', error)
    showAlert('Error', 'Failed to process image', 'error')
  }
}

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || ''
})

const openMenuModal = (item: MenuItem | null = null) => {
  editingItem.value = item
  imagePreview.value = null
  if (item) {
    menuItemForm.value = { ...item }
    imagePreview.value = imageSrc(item.image_url)
  } else {
    menuItemForm.value = { name: '', description: '', price: 0, category: 'Foods', cuisine: 'International', image_url: '' }
  }
  isMenuModalOpen.value = true
}

const saveMenuItem = async () => {
  if (!menuItemForm.value.name || !menuItemForm.value.price) {
    showAlert('Validation Error', 'Dish name and price are required', 'warning')
    return
  }

  const method = editingItem.value ? 'PUT' : 'POST'
  const url = editingItem.value 
    ? `http://localhost:5001/api/admin/menu/${editingItem.value.id}` 
    : 'http://localhost:5001/api/admin/menu'

  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(menuItemForm.value)
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok) {
      isMenuModalOpen.value = false
      await fetchData()
      showAlert('Success', `Menu item ${editingItem.value ? 'updated' : 'created'} and saved to database!`, 'success')
    } else {
      showAlert('Error', data.message || `Failed to ${editingItem.value ? 'update' : 'create'} menu item`, 'error')
    }
  } catch (error) {
    console.error('Failed to save menu item:', error)
    showAlert('Error', 'Network error while saving menu item', 'error')
  }
}

const deleteMenuItem = async (id: number) => {
  const confirmed = await new Promise(resolve => {
    const temp = alertModal.value
    alertModal.value = { 
      show: true, 
      title: 'Delete Dish', 
      message: 'Are you sure? This action cannot be undone.', 
      type: 'warning' 
    }
  })

  try {
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch(`http://localhost:5001/api/admin/menu/${id}`, {
      method: 'DELETE',
      headers
    })

    if (response.ok) {
      await fetchData()
      showAlert('Success', 'Menu item deleted successfully', 'success')
    } else {
      const data = await response.json().catch(() => ({}))
      showAlert('Error', data.message || 'Failed to delete menu item', 'error')
    }
  } catch (error) {
    console.error('Failed to delete menu item:', error)
    showAlert('Error', 'Network error while deleting menu item', 'error')
  }
}

const updateProfile = async () => {
  try {
    if (!authStore.token) { showAlert('Error', 'Not authenticated', 'error'); return }
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch('http://localhost:5001/api/profile', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(profileForm.value)
    })

    if (response.ok) {
      authStore.user.name = profileForm.value.name
      authStore.user.email = profileForm.value.email
      localStorage.setItem('user', JSON.stringify(authStore.user))
      isProfileModalOpen.value = false
      showAlert('Success', 'Profile updated successfully', 'success')
    } else {
      const data = await response.json()
      showAlert('Error', data.message || 'Update failed', 'error')
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    showAlert('Error', 'Failed to update profile', 'error')
  }
}
const notifications = ref<any[]>([])

const fetchNotifications = async () => {
  try {
    if (!authStore.token) return
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch('http://localhost:5001/api/notifications', { headers })
    if (response.ok) {
      const data = await response.json()
      notifications.value = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        msg: n.message,
        time: new Date(n.created_at).toLocaleTimeString(),
        icon: n.type === 'reservation' ? CalendarDays : Bell,
        color: 'text-gold'
      }))
    } else if (response.status !== 401) {
      console.warn('Failed to fetch notifications:', response.status)
    }
  } catch (error) {
    console.error('Failed to fetch admin notifications:', error)
  }
}

// Counter Refs
const revenueCounter = ref(0)
const reservationCounter = ref(0)
const orderCounter = ref(0)
const customerCounter = ref(0)

const stats = computed(() => {
  const totalRevenue = orders.value
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.total), 0)
    
  return [
    { label: 'Total Revenue', value: totalRevenue, prefix: '$', ref: revenueCounter, icon: DollarSign, color: 'text-green-400', trend: '+12.5%' },
    { label: 'Reservations', value: reservations.value.length, prefix: '', ref: reservationCounter, icon: CalendarDays, color: 'text-gold', trend: '+3 today' },
    { label: 'Total Orders', value: orders.value.length, prefix: '', ref: orderCounter, icon: UtensilsCrossed, color: 'text-blue-400', trend: '+18%' },
    { label: 'Menu Items', value: menuItems.value.length, prefix: '', ref: customerCounter, icon: ShoppingBag, color: 'text-purple-400', trend: 'Active' }
  ]
})

const animateCounters = () => {
  stats.value.forEach(stat => {
    gsap.to(stat.ref, {
      value: stat.value,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        stat.ref.value = Math.floor(stat.ref.value)
      }
    })
  })
}

const fetchData = async () => {
  isLoading.value = true
  try {
    if (!authStore.token) {
      console.warn('Admin token missing; aborting admin data fetch')
      showAlert('Warning', 'Admin authentication required to load dashboard', 'warning')
      isLoading.value = false
      return
    }
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const [resResp, orderResp, menuResp, userResp] = await Promise.all([
      fetch('http://localhost:5001/api/admin/reservations', { headers }),
      fetch('http://localhost:5001/api/admin/orders', { headers }),
      fetch('http://localhost:5001/api/admin/menu', { headers }),
      fetch('http://localhost:5001/api/admin/users', { headers })
    ])
    
    if (resResp.ok) reservations.value = await resResp.json()
    if (orderResp.ok) orders.value = await orderResp.json()
    if (menuResp.ok) menuItems.value = await menuResp.json()
    if (userResp.ok) users.value = await userResp.json()
    
    await fetchNotifications()
    setTimeout(animateCounters, 100)
  } catch (error) {
    console.error('Failed to fetch data:', error)
    showAlert('Error', 'Failed to load dashboard data', 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  setInterval(fetchNotifications, 30000)
})

const updateStatus = async (type: 'order' | 'reservation', id: number, newStatus: string) => {
  try {
    if (!authStore.token) { showAlert('Error', 'Not authenticated', 'error'); return }
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch(`http://localhost:5001/api/admin/${type}s/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: newStatus })
    })

    if (response.ok) {
      if (type === 'order') {
        const order = orders.value.find(o => o.id === id)
        if (order) order.status = newStatus
      } else {
        const res = reservations.value.find(r => r.id === id)
        if (res) res.status = newStatus
      }
      fetchNotifications()
      showAlert('Success', `${type} #${id} marked as ${newStatus}`, 'success')
    } else {
      const data = await response.json().catch(() => ({}))
      showAlert('Error', data.message || `Failed to update ${type}`, 'error')
    }
  } catch (error) {
    console.error(`Failed to update ${type}:`, error)
    showAlert('Error', `Network error updating ${type}`, 'error')
  }
}

const toggleAvailability = async (id: number) => {
  try {
    if (!authStore.token) { showAlert('Error', 'Not authenticated', 'error'); return }
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch(`http://localhost:5001/api/admin/menu/${id}/toggle`, {
      method: 'PATCH',
      headers
    })
    if (response.ok) {
      const item = menuItems.value.find(i => i.id === id)
      if (item) item.available = !item.available
      showAlert('Success', `Dish ${item?.available ? 'enabled' : 'disabled'}`, 'success')
    } else {
      const data = await response.json().catch(() => ({}))
      showAlert('Error', data.message || 'Failed to toggle availability', 'error')
    }
  } catch (error) {
    console.error('Failed to toggle availability:', error)
    showAlert('Error', 'Network error toggling availability', 'error')
  }
}

const pendingReservationsCount = computed(() => 
  reservations.value.filter(r => r.status.toLowerCase() === 'pending').length
)

const pendingOrdersCount = computed(() => 
  orders.value.filter(o => o.status.toLowerCase() === 'pending').length
)

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'confirmed': return 'bg-green-500/10 text-green-400 border-green-500/20'
    case 'pending': return 'bg-gold/10 text-gold border-gold/20'
    case 'cancelled':
    case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}
</script>

<template>
  <div :class="['min-h-screen flex transition-colors duration-500', isDarkMode ? 'bg-[#050505] text-white' : 'bg-gray-50 text-gray-900']">
    <!-- Sidebar -->
    <aside :class="['w-72 border-r flex flex-col fixed h-full z-50 transition-colors duration-500', isDarkMode ? 'border-white/5 bg-black/40' : 'border-gray-200 bg-white']">
      <div class="p-8">
        <div class="flex items-center gap-4">
          <img src="/src/assets/images/logo.png" alt="NekMak Logo" class="h-12 w-12 object-contain" />
          <div>
            <h1 class="font-serif text-2xl font-bold tracking-tight">NekMak</h1>
            <p :class="['text-[10px] uppercase tracking-[0.2em] font-black', isDarkMode ? 'text-gold' : 'text-gray-400']">Intelligence Hub</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-6">
        <button 
          v-for="item in [
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'reservations', label: 'Bookings', icon: CalendarDays, badge: pendingReservationsCount },
            { id: 'orders', label: 'Revenue/Orders', icon: DollarSign, badge: pendingOrdersCount },
            { id: 'menu', label: 'Menu Editor', icon: UtensilsCrossed },
            { id: 'staff', label: 'Staff Hub', icon: Users }
          ]" 
          :key="item.id"
          @click="activeTab = item.id"
          class="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all"
          :class="activeTab === item.id 
            ? (isDarkMode ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-black text-white shadow-xl shadow-black/20') 
            : (isDarkMode ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-100')"
        >
          <div class="flex items-center gap-4">
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </div>
          <span v-if="item.badge && item.badge > 0" class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
            {{ item.badge }}
          </span>
        </button>
      </nav>

      <div class="p-6 mt-auto">
        <button @click="authStore.logout()" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut class="h-5 w-5" />
          Sign Out Hub
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-72 p-10">
      <!-- Header -->
      <header class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-4xl font-serif font-bold capitalize">{{ activeTab.replace('-', ' ') }} Control</h2>
          <p :class="[isDarkMode ? 'text-white/40' : 'text-gray-500', 'text-sm mt-2 font-medium']">Operational status for Phourn KoemSeang's NekMak.</p>
        </div>

        <div class="flex items-center gap-6">
          <button @click="isDarkMode = !isDarkMode" :class="['p-3 rounded-2xl border transition-all', isDarkMode ? 'border-white/10 bg-white/5 text-gold' : 'border-gray-200 bg-white']">
            <Sun v-if="isDarkMode" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>
          
          <div class="relative group">
            <button :class="['p-3 rounded-2xl border transition-all', isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white']">
              <Bell class="h-5 w-5" />
              <span class="absolute top-3 right-3 w-2.5 h-2.5 bg-gold rounded-full border-2" :style="{ borderColor: isDarkMode ? '#050505' : '#fff' }"></span>
            </button>
            
            <!-- Quick Notifications Dropdown -->
            <div :class="['absolute right-0 mt-4 w-80 rounded-3xl border shadow-2xl p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
              <h4 class="text-xs font-black uppercase tracking-widest mb-6">Recent Intelligence</h4>
              <div class="space-y-6">
                <div v-for="notif in notifications.slice(0, 3)" :key="notif.id" class="flex gap-4">
                  <div :class="['p-2 rounded-xl bg-opacity-10 h-fit', notif.color, isDarkMode ? 'bg-white' : 'bg-black']">
                    <component :is="notif.icon" class="h-4 w-4" />
                  </div>
                  <div>
                    <p class="text-sm font-bold">{{ notif.title }}</p>
                    <p class="text-xs opacity-50 mt-1">{{ notif.msg }}</p>
                    <p class="text-[10px] text-gold mt-2 font-black">{{ notif.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div :class="['flex items-center gap-4 pl-8 border-l', isDarkMode ? 'border-white/10' : 'border-gray-200']">
            <div class="text-right">
              <p class="text-sm font-black">Phourn Admin</p>
              <p class="text-[10px] text-gold uppercase tracking-[0.2em] font-black">Super Control</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=Phourn&background=D4AF37&color=000" @click="isProfileModalOpen = true" class="w-12 h-12 rounded-2xl border-2 border-gold/40 p-1 cursor-pointer hover:scale-105 transition-transform" alt="Admin" />
          </div>
        </div>
      </header>

      <!-- Dashboard Overview -->
      <div v-if="activeTab === 'dashboard'" class="space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" 
            :class="['border p-8 rounded-[2rem] transition-all group relative overflow-hidden', isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30' : 'bg-white border-gray-100 shadow-sm']">
            <div class="flex items-start justify-between mb-6 relative z-10">
              <div :class="['p-4 rounded-2xl bg-opacity-10', stat.color, isDarkMode ? 'bg-white' : 'bg-black']">
                <component :is="stat.icon" class="h-6 w-6" />
              </div>
              <span :class="['text-xs font-black px-3 py-1.5 rounded-xl', isDarkMode ? 'text-green-400 bg-green-500/10' : 'text-green-600 bg-green-50']">{{ stat.trend }}</span>
            </div>
            <h3 :class="[isDarkMode ? 'text-white/30' : 'text-gray-400', 'text-sm font-bold uppercase tracking-widest relative z-10']">{{ stat.label }}</h3>
            <p class="text-5xl font-serif font-bold mt-2 relative z-10">
              {{ stat.prefix }}<span class="counter-val">{{ stat.ref.value.toLocaleString() }}</span>
            </p>
          </div>
        </div>

        <div class="grid lg:grid-cols-[1.6fr_1fr] gap-10">
          <section :class="['border rounded-[2.5rem] p-8', isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm']">
            <div class="flex items-center justify-between mb-8">
              <h3 class="font-serif text-2xl font-bold">Recent Intelligence Feed</h3>
              <button class="text-gold text-xs font-black uppercase tracking-widest">Global Export</button>
            </div>
            <div class="space-y-4">
              <div v-for="order in orders.slice(0, 5)" :key="order.id" :class="['p-6 rounded-3xl flex items-center justify-between transition-all', isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50']">
                <div class="flex items-center gap-6">
                  <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm', isDarkMode ? 'bg-white/10' : 'bg-gray-100']">
                    #{{ order.id }}
                  </div>
                  <div>
                    <p class="text-base font-bold">{{ order.customer_name || 'Anonymous Client' }}</p>
                    <p class="text-xs opacity-40 mt-1">{{ new Date(order.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-serif font-bold text-gold">${{ Number(order.total).toFixed(2) }}</p>
                  <span :class="['text-[10px] font-black uppercase tracking-widest', getStatusColor(order.status).split(' ')[1]]">{{ order.status }}</span>
                </div>
              </div>
            </div>
          </section>

          <section :class="['border rounded-[2.5rem] p-8 h-fit', isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm']">
            <h3 class="font-serif text-2xl font-bold mb-8">System Notifications</h3>
            <div class="space-y-8">
              <div v-for="notif in notifications" :key="notif.id" class="flex gap-5 group">
                <div :class="['p-3 rounded-2xl bg-opacity-10 h-fit transition-transform group-hover:scale-110', notif.color, isDarkMode ? 'bg-white' : 'bg-black']">
                  <component :is="notif.icon" class="h-5 w-5" />
                </div>
                <div>
                  <div class="flex justify-between items-start">
                    <h4 class="text-base font-bold">{{ notif.title }}</h4>
                    <span class="text-[10px] text-gold font-black uppercase">{{ notif.time }}</span>
                  </div>
                  <p class="text-sm opacity-50 mt-1 leading-relaxed">{{ notif.msg }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Reservations Feature -->
      <div v-else-if="activeTab === 'reservations'" class="space-y-8">
        <section :class="['border rounded-[2.5rem] p-8', isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm']">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr :class="['text-xs uppercase tracking-[0.2em] font-black border-b', isDarkMode ? 'text-white/30 border-white/10' : 'text-gray-400 border-gray-200']">
                  <th class="px-6 py-5">Date/Time</th>
                  <th class="px-6 py-5">Guest Information</th>
                  <th class="px-6 py-5 text-center">Size</th>
                  <th class="px-6 py-5">Status</th>
                  <th class="px-6 py-5 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="res in reservations" :key="res.id" class="group hover:bg-white/5">
                  <td class="px-6 py-6">
                    <div class="flex items-center gap-4">
                      <div :class="['w-12 h-14 rounded-2xl border flex flex-col items-center justify-center', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100']">
                        <span class="text-[10px] font-black text-gold uppercase">{{ new Date(res.date).toLocaleString('default', { month: 'short' }) }}</span>
                        <span class="text-xl font-bold mt-1">{{ new Date(res.date).getDate() }}</span>
                      </div>
                      <p class="text-sm font-bold text-gold">{{ res.time.slice(0, 5) }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-6">
                    <p class="text-base font-bold">{{ res.name }}</p>
                    <p class="text-xs opacity-40 mt-1">{{ res.email }}</p>
                  </td>
                  <td class="px-6 py-6 text-center font-serif text-xl font-bold">{{ res.guests }}</td>
                  <td class="px-6 py-6">
                    <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border', getStatusColor(res.status)]">
                      {{ res.status }}
                    </span>
                  </td>
                  <td class="px-6 py-6 text-right">
                    <div class="flex justify-end gap-3 transition-opacity">
                      <button @click="updateStatus('reservation', res.id, 'confirmed')" class="p-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-sm hover:shadow-green-500/20">
                        <CheckCircle2 class="h-5 w-5" />
                      </button>
                      <button @click="updateStatus('reservation', res.id, 'rejected')" class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/20">
                        <XCircle class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Orders Feature -->
      <div v-else-if="activeTab === 'orders'" class="space-y-8">
        <section :class="['border rounded-[2.5rem] p-8', isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm']">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr :class="['text-xs uppercase tracking-[0.2em] font-black border-b', isDarkMode ? 'text-white/30 border-white/10' : 'text-gray-400 border-gray-200']">
                  <th class="px-6 py-5">Order ID</th>
                  <th class="px-6 py-5">Client Intelligence</th>
                  <th class="px-6 py-5">Amount</th>
                  <th class="px-6 py-5">Method</th>
                  <th class="px-6 py-5">Status</th>
                  <th class="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="order in orders" :key="order.id" class="group hover:bg-white/5">
                  <td class="px-6 py-6 font-black text-sm">#{{ order.id }}</td>
                  <td class="px-6 py-6">
                    <p class="text-base font-bold">{{ order.customer_name || 'Guest' }}</p>
                    <p class="text-xs opacity-40 mt-1">{{ order.customer_email }}</p>
                  </td>
                  <td class="px-6 py-6 font-serif text-xl font-bold text-gold">${{ Number(order.total).toFixed(2) }}</td>
                  <td class="px-6 py-6">
                    <span class="text-[10px] font-black uppercase tracking-widest opacity-60">{{ order.payment_method || 'KHQR' }}</span>
                  </td>
                  <td class="px-6 py-6">
                    <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border', getStatusColor(order.status)]">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-6 py-6 text-right">
                    <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="updateStatus('order', order.id, 'paid')" title="Accept Order" class="p-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-sm">
                        <CheckCircle2 class="h-5 w-5" />
                      </button>
                      <button @click="updateStatus('order', order.id, 'rejected')" title="Reject Order" class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                        <XCircle class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Menu Editor Feature -->
      <div v-else-if="activeTab === 'menu'" class="space-y-10">
        <div class="flex justify-between items-center">
          <p class="text-sm font-bold opacity-40">Managing {{ menuItems.length }} signature items • <span class="text-gold">Drag to reorder</span></p>
          <button @click="openMenuModal()" class="bg-gold text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all flex items-center gap-3">
            <Plus class="h-4 w-4" /> Add New Dish
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(item, idx) in menuItems" :key="item.id" 
            draggable
            @dragstart="draggedItem = item"
            @dragover.prevent="dragOverItem = item"
            @dragleave="dragOverItem = null"
            @drop.prevent="() => { if(draggedItem && dragOverItem) { const di = menuItems.indexOf(draggedItem); const oi = menuItems.indexOf(dragOverItem); [menuItems[di], menuItems[oi]] = [menuItems[oi], menuItems[di]]; draggedItem = null; dragOverItem = null } }"
            :class="['border rounded-[2.5rem] overflow-hidden group transition-all cursor-move relative', 
              draggedItem?.id === item.id ? 'opacity-50 scale-95' : 
              dragOverItem?.id === item.id ? 'ring-2 ring-gold scale-105' : 
              isDarkMode ? 'bg-white/5 border-white/5 hover:border-gold/30' : 'bg-white border-gray-100 shadow-sm']">
            
            <!-- Drag Handle Indicator -->
            <div v-if="dragOverItem?.id === item.id" class="absolute inset-0 flex items-center justify-center bg-gold/10 rounded-[2.5rem] z-10 backdrop-blur-sm">
              <div class="text-center">
                <GripVertical class="h-8 w-8 text-gold mx-auto mb-2 animate-bounce" />
                <p class="text-xs font-black text-gold uppercase">Drop here</p>
              </div>
            </div>

            <div class="relative h-56 overflow-hidden">
              <img :src="imageSrc(item.image_url)" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              <div class="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical class="h-5 w-5 text-gold drop-shadow-lg" />
              </div>
              <div class="absolute top-5 right-5 flex gap-2">
                <button @click="toggleAvailability(item.id)" :class="['p-3 rounded-2xl backdrop-blur-md transition-all', item.available ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20']">
                  <Eye v-if="item.available" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4 opacity-50" />
                </button>
              </div>
            </div>
            <div class="p-8 space-y-4">
              <div class="flex justify-between items-start">
                <h4 class="font-serif text-xl font-bold">{{ item.name }}</h4>
                <span class="font-serif text-xl text-gold">${{ Number(item.price).toFixed(2) }}</span>
              </div>
              <p class="text-xs opacity-40 leading-relaxed line-clamp-2">{{ item.description }}</p>
              <div class="flex items-center justify-between pt-4 border-t border-white/5">
                <span class="text-[10px] font-black uppercase tracking-widest opacity-60">{{ item.category }} • {{ item.cuisine }}</span>
                <div class="flex gap-2">
                  <button @click="openMenuModal(item)" title="Edit dish" class="p-2.5 rounded-xl hover:bg-gold hover:text-black transition-all shadow-sm hover:shadow-gold/20">
                    <Edit class="h-4 w-4" />
                  </button>
                  <button @click="deleteMenuItem(item.id)" title="Delete dish" class="p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/20">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff Feature -->
      <div v-else-if="activeTab === 'staff'" class="space-y-8">
        <section :class="['border rounded-[2.5rem] p-8', isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm']">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr :class="['text-xs uppercase tracking-[0.2em] font-black border-b', isDarkMode ? 'text-white/30 border-white/10' : 'text-gray-400 border-gray-200']">
                  <th class="px-6 py-5">User Identity</th>
                  <th class="px-6 py-5">Role</th>
                  <th class="px-6 py-5">Auth Provider</th>
                  <th class="px-6 py-5">Joined Date</th>
                  <th class="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="user in users" :key="user.id" class="group hover:bg-white/5">
                  <td class="px-6 py-6">
                    <div class="flex items-center gap-4">
                      <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-black text-xs', isDarkMode ? 'bg-white/10' : 'bg-gray-100']">
                        {{ user.name?.[0] || 'U' }}
                      </div>
                      <div>
                        <p class="text-base font-bold">{{ user.name }}</p>
                        <p class="text-xs opacity-40 mt-1">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-6">
                    <span :class="['px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border', user.role === 'admin' ? 'bg-gold/10 text-gold border-gold/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20']">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-6 text-sm opacity-60 uppercase tracking-widest font-bold">{{ user.provider }}</td>
                  <td class="px-6 py-6 text-sm opacity-60">{{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}</td>
                  <td class="px-6 py-6 text-right">
                    <button class="p-2.5 rounded-xl hover:bg-white/10 transition-all">
                      <Edit class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Other features placeholder -->
      <div v-else class="flex items-center justify-center min-h-[50vh]">
        <div class="text-center space-y-6">
          <div :class="['w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center', isDarkMode ? 'bg-white/5' : 'bg-gray-100']">
            <Settings class="h-10 w-10 opacity-20" />
          </div>
          <h3 class="font-serif text-3xl">Module Initializing</h3>
          <p class="text-text-muted italic">Detailed {{ activeTab }} management interface is being synchronized.</p>
        </div>
      </div>
    </main>

    <!-- Modern Alert Modal -->
    <Teleport to="body">
      <div v-if="alertModal.show" class="fixed inset-0 z-[300] flex items-end justify-center p-4 pointer-events-none">
        <div class="pointer-events-auto mb-8 w-full max-w-md animate-in slide-in-from-bottom-4 duration-300"
          :class="[
            'rounded-[1.5rem] p-6 border backdrop-blur-xl shadow-2xl',
            alertModal.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
            alertModal.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
            alertModal.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-blue-500/10 border-blue-500/30'
          ]">
          <div class="flex items-start gap-4">
            <div :class="[
              'p-2.5 rounded-lg mt-0.5',
              alertModal.type === 'success' ? 'bg-green-500/20 text-green-400' :
              alertModal.type === 'error' ? 'bg-red-500/20 text-red-400' :
              alertModal.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            ]">
              <CheckCircle2 v-if="alertModal.type === 'success'" class="h-5 w-5" />
              <XCircle v-else-if="alertModal.type === 'error'" class="h-5 w-5" />
              <AlertCircle v-else-if="alertModal.type === 'warning'" class="h-5 w-5" />
              <Bell v-else class="h-5 w-5" />
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-sm mb-1">{{ alertModal.title }}</h4>
              <p class="text-xs opacity-75 leading-relaxed">{{ alertModal.message }}</p>
            </div>
            <button @click="closeAlert" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors -mt-1">
              <XCircle class="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Overlay Loader -->
    <div v-if="isLoading" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div class="text-center">
        <div class="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-gold/20"></div>
        <p class="text-gold font-serif italic text-xl animate-pulse tracking-widest uppercase">Initializing Intelligence...</p>
      </div>
    </div>
    <!-- Menu Modal -->
    <div v-if="isMenuModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="isMenuModalOpen = false"></div>
      <div :class="['relative w-full max-w-xl rounded-[2.5rem] p-10 border shadow-2xl', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
        <h3 class="font-serif text-3xl mb-8">{{ editingItem ? 'Refine Dish' : 'New Signature Dish' }}</h3>
        <form @submit.prevent="saveMenuItem" class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Dish Name</label>
              <input v-model="menuItemForm.name" required type="text" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Price (USD)</label>
              <input v-model="menuItemForm.price" required type="number" step="0.01" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Category</label>
              <select v-model="menuItemForm.category" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200']">
                <option>Foods</option>
                <option>Drinks</option>
                <option>Wines</option>
                <option>Sweets</option>
                <option>Pizza&Buger</option>
                <option>Vegeterain</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Cuisine</label>
              <input v-model="menuItemForm.cuisine" placeholder="e.g., Cambodian, French" type="text" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Image URL / Path</label>
            <input v-model="menuItemForm.image_url" placeholder="e.g., Foods/dish.jpg" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Description</label>
            <textarea v-model="menuItemForm.description" rows="3" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']"></textarea>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="isMenuModalOpen = false" class="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">Cancel</button>
            <button type="submit" class="flex-1 py-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20">Save Intelligence</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Profile Modal -->
    <div v-if="isProfileModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="isProfileModalOpen = false"></div>
      <div :class="['relative w-full max-w-md rounded-[2.5rem] p-10 border shadow-2xl', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
        <h3 class="font-serif text-3xl mb-8">Admin Identity</h3>
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Full Name</label>
            <input v-model="profileForm.name" required type="text" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">Intelligence Email</label>
            <input v-model="profileForm.email" required type="email" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="isProfileModalOpen = false" class="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">Discard</button>
            <button type="submit" class="flex-1 py-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20">Update Identity</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

.font-serif {
  font-family: 'Playfair Display', serif;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
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

.counter-val {
  display: inline-block;
}

/* Page Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
