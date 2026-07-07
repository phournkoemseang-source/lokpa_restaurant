<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { ShoppingBag, DollarSign, TrendingUp, Calendar, ChevronDown, ChevronUp } from 'lucide-vue-next'

const { t } = useI18n()
const authStore = useAuthStore()

interface OrderItem {
  id: number
  order_id: number
  name: string
  price: number
  quantity: number
  image_url: string
}

interface Order {
  id: number
  total: number
  payment_method: string
  status: string
  created_at: string
  items?: OrderItem[]
}

interface OrderStats {
  totalOrders: number
  totalSpent: number
  averageOrder: number
  monthOrders: number
  monthSpent: number
}

const orders = ref<Order[]>([])
const stats = ref<OrderStats | null>(null)
const expandedOrder = ref<number | null>(null)
const isLoading = ref(true)

const fetchOrders = async () => {
  isLoading.value = true
  try {
    const headers = { Authorization: `Bearer ${authStore.token}` }
    const [ordersResp, statsResp] = await Promise.all([
      fetch('http://localhost:5001/api/user/orders', { headers }),
      fetch('http://localhost:5001/api/user/orders/stats', { headers }),
    ])

    if (ordersResp.ok) orders.value = await ordersResp.json()
    if (statsResp.ok) stats.value = await statsResp.json()
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleExpand = async (orderId: number) => {
  if (expandedOrder.value === orderId) {
    expandedOrder.value = null
    return
  }
  
  expandedOrder.value = orderId
  
  // Fetch order items if not loaded
  const order = orders.value.find(o => o.id === orderId)
  if (order && !order.items) {
    try {
      const headers = { Authorization: `Bearer ${authStore.token}` }
      const resp = await fetch(`http://localhost:5001/api/user/orders/${orderId}/items`, { headers })
      if (resp.ok) {
        const data = await resp.json()
        order.items = data.items
      }
    } catch (error) {
      console.error('Failed to fetch order items:', error)
    }
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid': return 'text-green-400 bg-green-400/10'
    case 'pending': return 'text-gold bg-gold/10'
    case 'cancelled':
    case 'rejected': return 'text-red-400 bg-red-400/10'
    default: return 'text-gray-400 bg-gray-400/10'
  }
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchOrders)
</script>

<template>
  <div class="min-h-screen bg-base-dark pt-32 pb-20 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-12 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.45em] text-gold mb-4">LokPa</p>
        <h1 class="font-serif text-5xl md:text-6xl text-white mb-4">{{ t('orders.title') }}</h1>
        <p class="text-text-subtle max-w-xl mx-auto text-sm">{{ t('orders.description') }}</p>
      </div>

      <!-- Stats Summary -->
      <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div class="border border-gold/15 bg-card-dark/70 p-6 rounded-2xl text-center">
          <ShoppingBag class="h-6 w-6 text-gold mx-auto mb-3" />
          <p class="text-3xl font-serif font-bold text-white">{{ stats.totalOrders }}</p>
          <p class="text-[10px] uppercase tracking-widest text-text-muted mt-1">{{ t('orders.total_orders') }}</p>
        </div>
        <div class="border border-gold/15 bg-card-dark/70 p-6 rounded-2xl text-center">
          <DollarSign class="h-6 w-6 text-gold mx-auto mb-3" />
          <p class="text-3xl font-serif font-bold text-gold">${{ stats.totalSpent.toFixed(2) }}</p>
          <p class="text-[10px] uppercase tracking-widest text-text-muted mt-1">{{ t('orders.total_spent') }}</p>
        </div>
        <div class="border border-gold/15 bg-card-dark/70 p-6 rounded-2xl text-center">
          <TrendingUp class="h-6 w-6 text-gold mx-auto mb-3" />
          <p class="text-3xl font-serif font-bold text-white">${{ stats.averageOrder.toFixed(2) }}</p>
          <p class="text-[10px] uppercase tracking-widest text-text-muted mt-1">{{ t('orders.average_order') }}</p>
        </div>
        <div class="border border-gold/15 bg-card-dark/70 p-6 rounded-2xl text-center">
          <Calendar class="h-6 w-6 text-gold mx-auto mb-3" />
          <p class="text-3xl font-serif font-bold text-white">{{ stats.monthOrders }}</p>
          <p class="text-[10px] uppercase tracking-widest text-text-muted mt-1">{{ t('orders.this_month') }}</p>
        </div>
      </div>

      <!-- Order List -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-20 border border-dashed border-gold/20 rounded-3xl">
        <ShoppingBag class="h-16 w-16 text-gold/30 mx-auto mb-6" />
        <p class="font-serif text-2xl text-white/60 mb-4">{{ t('orders.no_orders') }}</p>
        <router-link to="/menu" class="inline-flex items-center gap-2 bg-gold text-base-dark px-8 py-4 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gold-light transition-all">
          {{ t('menu.title') }}
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in orders" :key="order.id" class="border border-gold/10 bg-card-dark/70 rounded-2xl overflow-hidden transition-all hover:border-gold/30">
          <!-- Order Header -->
          <button @click="toggleExpand(order.id)" class="w-full p-6 flex items-center justify-between text-left">
            <div class="flex items-center gap-6">
              <div class="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                <ShoppingBag class="h-6 w-6 text-gold" />
              </div>
              <div>
                <p class="font-bold text-white text-lg">{{ t('orders.order_id') }} #{{ order.id }}</p>
                <p class="text-xs text-text-muted mt-1">{{ formatDate(order.created_at) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-6">
              <div class="text-right">
                <p class="font-serif text-xl text-gold">${{ Number(order.total).toFixed(2) }}</p>
                <span :class="['px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mt-1', getStatusColor(order.status)]">
                  {{ t(`orders.${order.status}`) }}
                </span>
              </div>
              <component :is="expandedOrder === order.id ? ChevronUp : ChevronDown" class="h-5 w-5 text-gold/60" />
            </div>
          </button>

          <!-- Expanded Order Details -->
          <div v-if="expandedOrder === order.id" class="border-t border-gold/10 px-6 pb-6 animate-fade-in">
            <div v-if="order.items && order.items.length > 0" class="space-y-3 pt-4">
              <p class="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">{{ t('orders.items') }}</p>
              <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between py-2 px-4 bg-white/5 rounded-xl">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-sm font-bold">
                    {{ item.quantity }}x
                  </div>
                  <span class="text-sm text-white/80">{{ item.name }}</span>
                </div>
                <span class="text-sm text-gold">${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-gold/10 mt-3">
                <span class="text-sm font-bold text-white">{{ t('orders.total') }}</span>
                <span class="font-serif text-xl text-gold">${{ Number(order.total).toFixed(2) }}</span>
              </div>
            </div>
            <div v-else class="py-4 text-center">
              <p class="text-sm text-text-muted">{{ t('orders.payment') }}: {{ order.payment_method }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
