<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
  GripVertical,
  Gift,
  Store
} from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  authStore.logout()
  await router.push('/')
}

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
  table_number?: string;
  location?: string;
  table_id?: number | null;
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
const alertModal = ref({ show: false, title: '', message: '', type: 'info' as 'info' | 'success' | 'error' | 'warning', onConfirm: null as null | (() => void), onCancel: null as null | (() => void) })
const draggedItem = ref<MenuItem | null>(null)
const dragOverItem = ref<MenuItem | null>(null)
const isImageDragging = ref(false)
const imagePreview = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const menuItemForm = ref({
  name: '',
  description: '',
  price: 0,
  category: 'Foods',
  cuisine: 'International',
  image_url: '',
  station: '',
  spice_level: null as number | null,
  is_vegetarian: false,
  allergens: ''
})

const imageSrc = (url: string | null | undefined) => {
  if (!url) return '/src/assets/images/logo.png'
  if (typeof url === 'string' && url.startsWith && url.startsWith('http')) return url
  return `http://localhost:5001/assets/pictures/${url}`
}

const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  alertModal.value = { show: true, title, message, type, onConfirm: null, onCancel: null }
  setTimeout(() => { alertModal.value.show = false }, 4000)
}

const closeAlert = () => {
  alertModal.value.show = false
  alertModal.value.onConfirm = null
  alertModal.value.onCancel = null
}

const showConfirm = (title: string, message: string) => {
  return new Promise<boolean>((resolve) => {
    alertModal.value = {
      show: true,
      title,
      message,
      type: 'warning',
      onConfirm: () => {
        resolve(true)
        alertModal.value.show = false
        alertModal.value.onConfirm = null
        alertModal.value.onCancel = null
      },
      onCancel: () => {
        resolve(false)
        alertModal.value.show = false
        alertModal.value.onConfirm = null
        alertModal.value.onCancel = null
      }
    }
  })
}

const handleImageDrop = async (event: DragEvent) => {
  event.preventDefault()
  isImageDragging.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!file.type.startsWith('image/')) {
    showAlert(t('admin.alert_error'), t('admin.msg_image_type_invalid'), 'error')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string)?.split(',')[1]
        const filename = `${Date.now()}-${file.name}`
        
        const headers: any = { 'Content-Type': 'application/json' }
        if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
        
        console.log('Uploading image:', { filename, size: base64.length })
        
        const response = await fetch('http://localhost:5001/api/admin/upload-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({ filename, base64Data: base64 })
        })
        
        console.log('Upload response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          menuItemForm.value.image_url = data.image_url
          imagePreview.value = e.target?.result as string
          showAlert(t('admin.alert_success'), t('admin.msg_image_uploaded'), 'success')
        } else {
          const error = await response.text().catch(() => 'Unknown error')
          console.error('Upload error:', error)
          showAlert(t('admin.alert_error'), t('admin.msg_image_upload_failed'), 'error')
        }
      } catch (error) {
        console.error('Upload request failed:', error)
        showAlert(t('admin.alert_error'), t('admin.msg_image_upload_network'), 'error')
      }
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Image processing failed:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_image_process_failed'), 'error')
  }
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!file.type.startsWith('image/')) {
    showAlert(t('admin.alert_error'), t('admin.msg_image_type_invalid'), 'error')
    return
  }

  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string)?.split(',')[1]
        const filename = `${Date.now()}-${file.name}`
        
        const headers: any = { 'Content-Type': 'application/json' }
        if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
        
        console.log('Uploading image:', { filename, size: base64.length })
        
        const response = await fetch('http://localhost:5001/api/admin/upload-image', {
          method: 'POST',
          headers,
          body: JSON.stringify({ filename, base64Data: base64 })
        })
        
        console.log('Upload response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          menuItemForm.value.image_url = data.image_url
          imagePreview.value = e.target?.result as string
          showAlert(t('admin.alert_success'), t('admin.msg_image_uploaded'), 'success')
        } else {
          const error = await response.text().catch(() => 'Unknown error')
          console.error('Upload error:', error)
          showAlert(t('admin.alert_error'), t('admin.msg_image_upload_failed'), 'error')
        }
      } catch (error) {
        console.error('Upload request failed:', error)
        showAlert(t('admin.alert_error'), t('admin.msg_image_upload_network'), 'error')
      }
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Image processing failed:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_image_process_failed'), 'error')
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
    menuItemForm.value = {
      ...item,
      station: (item as any).station || '',
      spice_level: (item as any).spice_level ?? null,
      is_vegetarian: (item as any).is_vegetarian ?? false,
      allergens: (item as any).allergens || '',
    }
    imagePreview.value = imageSrc(item.image_url)
  } else {
    menuItemForm.value = { name: '', description: '', price: 0, category: 'Foods', cuisine: 'International', image_url: '', station: '', spice_level: null, is_vegetarian: false, allergens: '' }
  }
  isMenuModalOpen.value = true
}

const saveMenuItem = async () => {
  if (!menuItemForm.value.name || !menuItemForm.value.price) {
    showAlert(t('admin.alert_validation'), t('admin.msg_validation_dish'), 'warning')
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

    if (response.ok) {
      isMenuModalOpen.value = false
      await fetchData()
      showAlert(t('admin.alert_success'), editingItem.value ? t('admin.msg_menu_updated') : t('admin.msg_menu_saved'), 'success')
      
      // Auto-prompt to notify users when a NEW item is added
      if (!editingItem.value) {
        const menuName = menuItemForm.value.name
        setTimeout(async () => {
          const confirmed = await showConfirm(t('admin.notify_customers'), t('admin.notify_confirm', { name: menuName }))
          if (confirmed) {
            notifyNewMenu(menuName)
          }
        }, 500)
      }
    } else {
      const errData = await response.json().catch(() => ({}))
      showAlert(t('admin.alert_error'), errData.message || t('admin.msg_menu_save_failed'), 'error')
    }
  } catch (error) {
    console.error('Failed to save menu item:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_menu_save_network'), 'error')
  }
}

const deleteMenuItem = async (id: number) => {
  const confirmed = await showConfirm(t('admin.delete_dish'), t('admin.delete_confirm'))
  if (!confirmed) return

  try {
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch(`http://localhost:5001/api/admin/menu/${id}`, {
      method: 'DELETE',
      headers
    })

    if (response.ok) {
      await fetchData()
      showAlert(t('admin.alert_success'), t('admin.msg_menu_deleted'), 'success')
    } else {
      const data = await response.json().catch(() => ({}))
      showAlert(t('admin.alert_error'), data.message || t('admin.msg_menu_delete_failed'), 'error')
    }
  } catch (error) {
    console.error('Failed to delete menu item:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_menu_delete_network'), 'error')
  }
}

const updateProfile = async () => {
  try {
    if (!authStore.token) { showAlert(t('admin.alert_error'), t('admin.msg_not_authenticated'), 'error'); return }
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
      showAlert(t('admin.alert_success'), t('admin.msg_profile_updated'), 'success')
    } else {
      const data = await response.json()
      showAlert(t('admin.alert_error'), data.message || t('admin.msg_update_failed'), 'error')
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_profile_update_failed'), 'error')
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
    { label: t('admin.total_revenue'), value: totalRevenue, prefix: '$', ref: revenueCounter, icon: DollarSign, color: 'text-green-400', trend: '+12.5%' },
    { label: t('admin.reservations_count'), value: reservations.value.length, prefix: '', ref: reservationCounter, icon: CalendarDays, color: 'text-gold', trend: '+3 today' },
    { label: t('admin.total_orders'), value: orders.value.length, prefix: '', ref: orderCounter, icon: UtensilsCrossed, color: 'text-blue-400', trend: '+18%' },
    { label: t('admin.menu_items'), value: menuItems.value.length, prefix: '', ref: customerCounter, icon: ShoppingBag, color: 'text-purple-400', trend: t('admin.active') }
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
      showAlert(t('admin.alert_warning'), t('admin.msg_auth_required'), 'warning')
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
    await fetchCoupons()
    await fetchTables()
    setTimeout(animateCounters, 100)
  } catch (error) {
    console.error('Failed to fetch data:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_data_load_failed'), 'error')
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
    if (!authStore.token) { showAlert(t('admin.alert_error'), t('admin.msg_not_authenticated'), 'error'); return }
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
      showAlert(t('admin.alert_success'), t('admin.msg_status_updated', { type, id, status: newStatus }), 'success')
    } else {
      const data = await response.json().catch(() => ({}))
      showAlert(t('admin.alert_error'), data.message || t('admin.msg_status_update_failed', { type }), 'error')
    }
  } catch (error) {
    console.error(`Failed to update ${type}:`, error)
    showAlert(t('admin.alert_error'), t('admin.msg_status_update_network', { type }), 'error')
  }
}

const toggleAvailability = async (id: number) => {
  try {
    if (!authStore.token) { showAlert(t('admin.alert_error'), t('admin.msg_not_authenticated'), 'error'); return }
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`

    const response = await fetch(`http://localhost:5001/api/admin/menu/${id}/toggle`, {
      method: 'PATCH',
      headers
    })
    if (response.ok) {
      const item = menuItems.value.find(i => i.id === id)
      if (item) item.available = !item.available
      showAlert(t('admin.alert_success'), item?.available ? t('admin.msg_dish_enabled') : t('admin.msg_dish_disabled'), 'success')
    } else {
      const data = await response.json().catch(() => ({}))
      showAlert(t('admin.alert_error'), data.message || t('admin.msg_toggle_failed'), 'error')
    }
  } catch (error) {
    console.error('Failed to toggle availability:', error)
    showAlert(t('admin.alert_error'), t('admin.msg_toggle_network'), 'error')
  }
}

// ===== Promotions Management =====
const coupons = ref<any[]>([])
const showCouponModal = ref(false)
const couponForm = ref({ code: '', discount_percent: 10, min_orders: 10, valid_until: '' })

const fetchCoupons = async () => {
  try {
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch('http://localhost:5001/api/admin/coupons', { headers })
    if (resp.ok) coupons.value = await resp.json()
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
  }
}

const createCoupon = async () => {
  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch('http://localhost:5001/api/admin/coupons', {
      method: 'POST',
      headers,
      body: JSON.stringify(couponForm.value)
    })
    if (resp.ok) {
      showCouponModal.value = false
      couponForm.value = { code: '', discount_percent: 10, min_orders: 10, valid_until: '' }
      await fetchCoupons()
      showAlert(t('admin.alert_success'), t('admin.msg_coupon_created'), 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_coupon_create_failed'), 'error')
    }
  } catch (error) {
    showAlert(t('admin.alert_error'), t('admin.msg_network_error'), 'error')
  }
}

const issueToQualified = async (couponId: number) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch('http://localhost:5001/api/admin/coupons/issue-to-qualified', {
      method: 'POST',
      headers,
      body: JSON.stringify({ coupon_id: couponId })
    })
    if (resp.ok) {
      const data = await resp.json()
      showAlert(t('admin.alert_success'), data.message, 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_coupons_issue_failed'), 'error')
    }
  } catch (error) {
    showAlert(t('admin.alert_error'), t('admin.msg_network_error'), 'error')
  }
}

// Notify users about new menu item
const notifyNewMenu = async (menuName: string, menuId?: number) => {
  const confirmed = await showConfirm('Notify Customers', `Notify all users about the new dish: "${menuName}"?`)
  if (!confirmed) return
  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch('http://localhost:5001/api/admin/notify-new-menu', {
      method: 'POST',
      headers,
      body: JSON.stringify({ menu_item_name: menuName, menu_item_id: menuId })
    })
    if (resp.ok) {
      const respData = await resp.json()
      showAlert(t('admin.alert_success'), respData.message || t('admin.msg_notification_sent_detail'), 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_notification_failed'), 'error')
    }
  } catch (error) {
    showAlert(t('admin.alert_error'), t('admin.msg_notification_network'), 'error')
  }
}

const pendingReservationsCount = computed(() => 
  reservations.value.filter(r => r.status.toLowerCase() === 'pending').length
)

const pendingOrdersCount = computed(() => 
  orders.value.filter(o => o.status.toLowerCase() === 'pending').length
)

// ===== Table Management =====
const tables = ref<any[]>([])
const showTableModal = ref(false)
const editingTable = ref<any>(null)
const tableForm = ref({ table_number: 1, capacity: 4, location: 'Main Hall' })

const fetchTables = async () => {
  try {
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch('http://localhost:5001/api/admin/tables', { headers })
    if (resp.ok) tables.value = await resp.json()
  } catch (error) {
    console.error('Failed to fetch tables:', error)
  }
}

const openTableModal = (table: any = null) => {
  editingTable.value = table
  if (table) {
    tableForm.value = {
      table_number: table.table_number,
      capacity: table.capacity,
      location: table.location || 'Main Hall',
    }
  } else {
    tableForm.value = { table_number: 1, capacity: 4, location: 'Main Hall' }
  }
  showTableModal.value = true
}

const saveTable = async () => {
  const isEditing = editingTable.value !== null
  const url = isEditing
    ? `http://localhost:5001/api/admin/tables/${editingTable.value.id}`
    : 'http://localhost:5001/api/admin/tables'

  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      headers,
      body: JSON.stringify(tableForm.value)
    })
    if (resp.ok) {
      showTableModal.value = false
      editingTable.value = null
      tableForm.value = { table_number: 1, capacity: 4, location: 'Main Hall' }
      await fetchTables()
      showAlert(t('admin.alert_success'), isEditing ? t('admin.msg_table_updated') : t('admin.msg_table_saved'), 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_table_save_failed'), 'error')
    }
  } catch (error) {
    showAlert(t('admin.alert_error'), t('admin.msg_network_error'), 'error')
  }
}

const activeTableResId = ref<number | null>(null)
const activeTableCardId = ref<number | null>(null)

const tablesByLocation = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const t of tables.value) {
    const loc = t.location || 'Main Hall'
    if (!groups[loc]) groups[loc] = []
    groups[loc].push(t)
  }
  return groups
})

const tableReservationMap = computed(() => {
  const map: Record<number, any> = {}
  const today = new Date().toISOString().split('T')[0]
  for (const r of reservations.value) {
    if (!r.table_id || r.status === 'cancelled' || r.status === 'rejected') continue
    if (r.date < today) continue
    const tableId = r.table_id
    if (!map[tableId]) {
      map[tableId] = {
        guestName: r.name,
        time: r.time?.slice(0, 5),
        date: r.date,
        guests: r.guests,
        status: r.status,
      }
    }
  }
  return map
})

const todayBookingsByRoom = computed(() => {
  const counts: Record<string, number> = {}
  const today = new Date().toISOString().split('T')[0]
  for (const r of reservations.value) {
    if (!r.table_id || r.status === 'cancelled' || r.status === 'rejected') continue
    if (r.date !== today) continue
    // Find which room this table belongs to
    const table = tables.value.find(t => t.id === r.table_id)
    if (!table) continue
    const room = table.location || 'Main Hall'
    counts[room] = (counts[room] || 0) + 1
  }
  return counts
})

const assignTable = async (reservation: any, tableId: number | null) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch(`http://localhost:5001/api/admin/reservations/${reservation.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ table_id: tableId })
    })
    if (resp.ok) {
      const data = await resp.json()
      if (data.reservation) {
        // Update the reservation in the local array with new table info
        const idx = reservations.value.findIndex(r => r.id === reservation.id)
        if (idx !== -1) {
          reservations.value[idx] = data.reservation
        }
      }
      activeTableResId.value = null
      showAlert(t('admin.alert_success'), tableId ? t('admin.msg_table_assigned', { id: reservation.id }) : t('admin.msg_table_unassigned'), 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_table_assign_failed'), 'error')
    }
  } catch (error) {
    showAlert(t('admin.alert_error'), t('admin.msg_network_error'), 'error')
  }
}

const deleteTable = async (table: any) => {
  const confirmed = await showConfirm(t('admin.delete_table'), t('admin.confirm_delete_table', { number: table.table_number }))
  if (!confirmed) return

  try {
    const headers: any = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch(`http://localhost:5001/api/admin/tables/${table.id}`, {
      method: 'DELETE',
      headers
    })
    if (resp.ok) {
      await fetchTables()
      showAlert(t('admin.alert_success'), t('admin.msg_table_deleted', { number: table.table_number }), 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_table_delete_failed'), 'error')
    }
  } catch (error) {      showAlert(t('admin.alert_error'), t('admin.msg_network_error'), 'error')
    }
  }

const toggleTableAvailability = async (table: any) => {
  try {
    const headers: any = { 'Content-Type': 'application/json' }
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    const resp = await fetch(`http://localhost:5001/api/admin/tables/${table.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ is_available: !table.is_available })
    })
    if (resp.ok) {
      table.is_available = !table.is_available
      showAlert(t('admin.alert_success'), table.is_available ? t('admin.msg_table_toggled_available', { number: table.table_number }) : t('admin.msg_table_toggled_occupied', { number: table.table_number }), 'success')
    } else {
      showAlert(t('admin.alert_error'), t('admin.msg_table_toggle_failed'), 'error')
    }
  } catch (error) {
    showAlert(t('admin.alert_error'), t('admin.msg_network_error'), 'error')
  }
}

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
          <img src="/src/assets/images/logo.png" alt="LokPa Logo" class="h-12 w-12 object-contain" />
          <div>              <h1 class="font-serif text-2xl font-bold tracking-tight">LokPa</h1>
            <p :class="['text-[10px] uppercase tracking-[0.2em] font-black', isDarkMode ? 'text-gold' : 'text-gray-400']">{{ t('admin.subtitle') }}</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 px-4 space-y-2 mt-6">
        <button 
          v-for="item in [
            { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard },
            { id: 'reservations', label: t('admin.reservations'), icon: CalendarDays, badge: pendingReservationsCount },
            { id: 'orders', label: t('admin.orders'), icon: DollarSign, badge: pendingOrdersCount },
            { id: 'menu', label: t('admin.menu'), icon: UtensilsCrossed },
            { id: 'promotions', label: t('admin.promotions'), icon: Gift },
            { id: 'tables', label: t('admin.tables'), icon: Store },
            { id: 'staff', label: t('admin.staff'), icon: Users }
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
        <button @click="handleLogout" class="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut class="h-5 w-5" />
          {{ t('admin.sign_out_hub') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-72 p-10">
      <!-- Header -->
      <header class="flex items-center justify-between mb-12">
        <div>
          <h2 class="text-4xl font-serif font-bold capitalize">{{ activeTab.replace('-', ' ') }} {{ t('admin.control') }}</h2>
          <p :class="[isDarkMode ? 'text-white/40' : 'text-gray-500', 'text-sm mt-2 font-medium']">{{ t('admin.subtitle') }}</p>
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
              <h4 class="text-xs font-black uppercase tracking-widest mb-6">{{ t('admin.recent_feed') }}</h4>
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
              <p class="text-sm font-black">{{ t('admin.admin_user') }}</p>
              <p class="text-[10px] text-gold uppercase tracking-[0.2em] font-black">{{ t('admin.super_control') }}</p>
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
              <h3 class="font-serif text-2xl font-bold">{{ t('admin.recent_feed') }}</h3>
              <button class="text-gold text-xs font-black uppercase tracking-widest">{{ t('admin.global_export') }}</button>
            </div>
            <div class="space-y-4">
              <div v-for="order in orders.slice(0, 5)" :key="order.id" :class="['p-6 rounded-3xl flex items-center justify-between transition-all', isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50']">
                <div class="flex items-center gap-6">
                  <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm', isDarkMode ? 'bg-white/10' : 'bg-gray-100']">
                    #{{ order.id }}
                  </div>
                  <div>
                    <p class="text-base font-bold">{{ order.customer_name || t('admin.anonymous_client') }}</p>
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
            <h3 class="font-serif text-2xl font-bold mb-8">{{ t('admin.system_notifications') }}</h3>
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
                  <th class="px-6 py-5">{{ t('admin.col_date_time') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_guest_info') }}</th>
                  <th class="px-6 py-5 text-center">{{ t('admin.col_size') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_table') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_status') }}</th>
                  <th class="px-6 py-5 text-right">{{ t('admin.col_actions') }}</th>
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
                  <td class="px-6 py-6 relative">
                    <button @click="activeTableResId = activeTableResId === res.id ? null : res.id" 
                      :class="['flex items-center gap-2 w-full text-left transition-all rounded-xl p-2 -ml-2', activeTableResId === res.id ? 'bg-gold/10' : 'hover:bg-white/5']">
                      <div v-if="res.table_number" class="flex items-center gap-2 flex-1">
                        <Store :class="['h-4 w-4', isDarkMode ? 'text-gold' : 'text-gray-400']" />
                        <div>
                          <p class="text-sm font-bold">Table {{ res.table_number }}</p>
                          <p class="text-[10px] opacity-40 capitalize">{{ res.location || 'Main Hall' }}</p>
                        </div>
                      </div>
                      <span v-else class="text-xs opacity-30 italic flex-1">{{ t('admin.not_assigned') }}</span>
                      <Edit class="h-3 w-3 opacity-30 group-hover:opacity-100" />
                    </button>
                    
                    <!-- Table Assignment Dropdown -->
                    <div v-if="activeTableResId === res.id" 
                      class="absolute left-4 top-full mt-1 w-64 z-50 rounded-2xl border shadow-2xl p-2 max-h-64 overflow-y-auto"
                      :class="isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200'">
                      <div class="space-y-1">
                        <button @click="assignTable(res, null)" 
                          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm', !res.table_id ? 'bg-gold/20 text-gold font-bold' : 'hover:bg-white/5']">
                          <XCircle class="h-4 w-4 opacity-40" />
                          {{ t('admin.unassign_table') }}
                        </button>
                        <div class="border-t border-white/5 my-1"></div>
                        <button v-for="t in tables" :key="t.id"
                          @click="assignTable(res, t.id)"
                          :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all text-sm', 
                            res.table_id === t.id ? 'bg-gold/20 text-gold font-bold' : 'hover:bg-white/5']">
                          <Store :class="['h-4 w-4 shrink-0', t.is_available ? 'text-green-400' : 'text-red-400']" />
                          <div class="flex-1 min-w-0">
                            <div class="flex justify-between">
                              <span class="font-medium">Table {{ t.table_number }}</span>
                              <span class="text-[10px] opacity-40">{{ t.capacity }} seats</span>
                            </div>
                            <p class="text-[10px] opacity-30 capitalize truncate">{{ t.location || 'Main Hall' }}</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </td>
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
                  <th class="px-6 py-5">{{ t('admin.col_order_id') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_client') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_amount') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_method') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_status') }}</th>
                  <th class="px-6 py-5 text-right">{{ t('admin.col_actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="order in orders" :key="order.id" class="group hover:bg-white/5">
                  <td class="px-6 py-6 font-black text-sm">#{{ order.id }}</td>
                  <td class="px-6 py-6">
                    <p class="text-base font-bold">{{ order.customer_name || t('admin.guest') }}</p>
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
                      <button @click="updateStatus('order', order.id, 'paid')" :title="t('admin.accept_order')" class="p-3 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-sm">
                        <CheckCircle2 class="h-5 w-5" />
                      </button>
                      <button @click="updateStatus('order', order.id, 'rejected')" :title="t('admin.reject_order')" class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
          <p class="text-sm font-bold opacity-40">{{ t('admin.managing_menu', { count: menuItems.length }) }}</p>
          <div class="flex gap-3">
            <button @click="openMenuModal()" class="bg-gold text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all flex items-center gap-3">
              <Plus class="h-4 w-4" /> {{ t('admin.add_dish') }}
            </button>
          </div>
        </div>

        <!-- Quick Notify Button (appears right after adding a new item - hidden by default) -->
        <div v-if="menuItems.length > 0" class="flex justify-end">
          <button 
            @click="notifyNewMenu(menuItems[0].name, menuItems[0].id)" 
            class="border border-gold/30 text-gold px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all flex items-center gap-2"
          >
            <Bell class="h-4 w-4" />
            {{ t('admin.notify_new_menu') }}
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="item in menuItems" :key="item.id" 
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
                <p class="text-xs font-black text-gold uppercase">{{ t('admin.drop_here') }}</p>
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
                  <button @click="openMenuModal(item)" :title="t('admin.edit')" class="p-2.5 rounded-xl hover:bg-gold hover:text-black transition-all shadow-sm hover:shadow-gold/20">
                    <Edit class="h-4 w-4" />
                  </button>
                  <button @click="deleteMenuItem(item.id)" :title="t('admin.delete')" class="p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/20">
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Promotions Feature -->
      <div v-else-if="activeTab === 'promotions'" class="space-y-8">
        <div class="flex justify-between items-center">
          <p class="text-sm font-bold opacity-40">{{ t('admin.managing_coupons') }}</p>
          <button @click="showCouponModal = true" class="bg-gold text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all flex items-center gap-3">
            <Plus class="h-4 w-4" /> {{ t('admin.create_coupon') }}
          </button>
        </div>

        <section :class="['border rounded-[2.5rem] p-8', isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm']">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr :class="['text-xs uppercase tracking-[0.2em] font-black border-b', isDarkMode ? 'text-white/30 border-white/10' : 'text-gray-400 border-gray-200']">
                  <th class="px-6 py-5">{{ t('admin.col_code') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_discount') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_min_orders') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_valid_until') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_status') }}</th>
                  <th class="px-6 py-5 text-right">{{ t('admin.col_actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="coupon in coupons" :key="coupon.id" class="group hover:bg-white/5">
                  <td class="px-6 py-6">
                    <span class="font-mono font-bold text-gold">{{ coupon.code }}</span>
                  </td>
                  <td class="px-6 py-6 font-serif text-xl font-bold">{{ coupon.discount_percent }}%</td>
                  <td class="px-6 py-6">{{ coupon.min_orders }} {{ t('orders.items') }}</td>
                  <td class="px-6 py-6 text-sm">{{ coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : '-' }}</td>
                  <td class="px-6 py-6">
                    <span :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border', coupon.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20']">
                      {{ coupon.is_active ? t('admin.active') : t('admin.disabled') }}
                    </span>
                  </td>
                  <td class="px-6 py-6 text-right">
                    <button @click="issueToQualified(coupon.id)" class="p-3 rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-black transition-all text-[10px] font-black uppercase tracking-widest" :title="t('admin.issue_to_qualified')">
                      {{ t('admin.issue') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Coupon Modal -->
        <div v-if="showCouponModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showCouponModal = false"></div>
          <div :class="['relative w-full max-w-md rounded-[2.5rem] p-10 border shadow-2xl', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
            <h3 class="font-serif text-3xl mb-8">{{ t('admin.create_coupon') }}</h3>
            <form @submit.prevent="createCoupon" class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.coupon_code') }}</label>
                <input v-model="couponForm.code" required type="text" placeholder="LOYAL10" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.discount_percent') }}</label>
                  <input v-model.number="couponForm.discount_percent" required type="number" min="1" max="100" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.min_orders') }}</label>
                  <input v-model.number="couponForm.min_orders" type="number" min="1" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.valid_until') }}</label>
                <input v-model="couponForm.valid_until" type="date" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
              </div>
              <div class="flex gap-4 pt-4">
                <button type="button" @click="showCouponModal = false" class="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">{{ t('admin.cancel') }}</button>
                <button type="submit" class="flex-1 py-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20">{{ t('admin.create_coupon') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Tables Management -->
      <div v-else-if="activeTab === 'tables'" class="space-y-8">
        <div class="flex justify-between items-center">
          <p class="text-sm font-bold opacity-40">{{ t('admin.manage_tables') }}</p>
          <button @click="openTableModal()" class="bg-gold text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:scale-105 transition-all flex items-center gap-3">
            <Plus class="h-4 w-4" /> {{ t('admin.add_table') }}
          </button>
        </div>

        <!-- Floor Plan View -->
        <div v-if="tables.length === 0" class="text-center py-20 opacity-40">
          <Store class="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p class="font-serif text-2xl">{{ t('admin.no_tables') }}</p>
          <p class="text-sm mt-2">{{ t('admin.add_table_hint') }}</p>
        </div>

        <div v-else class="space-y-10">
          <div v-for="(group, room) in tablesByLocation" :key="room" class="space-y-4">
            <!-- Room Header -->
            <div class="flex items-center gap-3">
              <div :class="['p-2.5 rounded-xl', isDarkMode ? 'bg-white/5' : 'bg-gray-100']">
                <Store class="h-5 w-5" :class="isDarkMode ? 'text-gold' : 'text-gray-400'" />
              </div>
              <div>
                <div class="flex items-center gap-3">
                  <h3 class="font-serif text-2xl font-bold">{{ room }}</h3>
                  <span v-if="todayBookingsByRoom[room]" 
                    class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gold/15 text-gold border border-gold/20">
                    {{ todayBookingsByRoom[room] }} booked today
                  </span>
                </div>
                <p class="text-[10px] opacity-40 uppercase tracking-widest font-black mt-1">{{ group.length }} {{ t('admin.col_table') }}{{ group.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>

            <!-- Room Area / Floor Plan Grid -->
            <div @click="activeTableCardId = null" :class="['relative rounded-[2.5rem] border p-8', isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50/50 border-gray-200']">
              <!-- Room floor background pattern -->
              <div class="absolute inset-0 rounded-[2.5rem] opacity-[0.03]" 
                style="background-image: repeating-linear-gradient(45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px);">
              </div>
              
              <div class="relative grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-5">
                <div v-for="table in group" :key="table.id" class="group/card">
                  <!-- Table Card -->
                  <div 
                    @click.stop="activeTableCardId = activeTableCardId === table.id ? null : table.id"
                    :class="[
                      'relative rounded-2xl border-2 p-5 text-center cursor-pointer transition-all duration-300',
                      activeTableCardId === table.id 
                        ? 'border-gold shadow-xl shadow-gold/20 scale-105 z-10' 
                        : table.is_available 
                          ? (isDarkMode ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/10' : 'border-green-400/40 bg-green-50 hover:border-green-400')
                          : (isDarkMode ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/60' : 'border-red-400/40 bg-red-50 hover:border-red-400')
                    ]">
                    
                    <!-- Status Dot -->
                    <div :class="['absolute top-3 right-3 w-3 h-3 rounded-full border-2', 
                      table.is_available ? 'bg-green-400 border-green-500/30' : 'bg-red-400 border-red-500/30',
                      table.is_available ? 'animate-pulse' : ''
                    ]"></div>
                    
                    <!-- Table Shape Visual -->
                    <div class="mb-3 mx-auto">
                      <div :class="['w-14 h-14 rounded-xl flex items-center justify-center mx-auto border-2 transition-all',
                        table.capacity <= 2 ? 'rounded-full' : table.capacity <= 4 ? 'rounded-xl' : 'rounded-2xl',
                        table.is_available ? 'border-green-400/30 bg-green-500/10' : 'border-red-400/30 bg-red-500/10',
                        activeTableCardId === table.id ? 'border-gold bg-gold/10' : ''
                      ]">
                        <span :class="['font-black text-lg', activeTableCardId === table.id ? 'text-gold' : (table.is_available ? 'text-green-400' : 'text-red-400')]">
                          {{ table.table_number }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Table Info -->
                    <p :class="['font-bold text-sm', table.is_available ? (isDarkMode ? 'text-white/80' : 'text-gray-800') : (isDarkMode ? 'text-white/60' : 'text-gray-600')]">
                      Table {{ table.table_number }}
                    </p>
                    <p class="text-[10px] opacity-50 mt-1 flex items-center justify-center gap-1">
                      <Users class="h-3 w-3" />
                      {{ table.capacity }} {{ t('reservations.guests') }}
                    </p>
                    
                    <!-- Availability Label -->
                    <span :class="['inline-block mt-2 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest',
                      table.is_available 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    ]">
                      {{ table.is_available ? t('admin.table_available') : t('admin.table_occupied') }}
                    </span>
                    
                    <!-- Upcoming Reservation Badge -->
                    <div v-if="tableReservationMap[table.id]" class="mt-2.5 pt-2.5 border-t" :class="isDarkMode ? 'border-white/5' : 'border-gray-200'">
                      <div class="bg-gold/10 rounded-xl px-2.5 py-2 text-left">
                        <p class="text-[9px] font-black uppercase tracking-widest text-gold truncate flex items-center gap-1">
                          <CalendarDays class="h-3 w-3 shrink-0" />
                          {{ tableReservationMap[table.id].time }}
                        </p>
                        <p class="text-[10px] font-bold mt-0.5 truncate">{{ tableReservationMap[table.id].guestName }}</p>
                        <p class="text-[8px] opacity-50">{{ tableReservationMap[table.id].guests }} {{ t('profile.guests') }}</p>
                      </div>
                    </div>
                    
                    <!-- Hover Actions (visible on card hover or when card is active) -->
                    <div :class="['absolute bottom-0 left-0 right-0 p-2 flex justify-center gap-1.5 transition-all duration-200 rounded-b-2xl',
                      activeTableCardId === table.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0',
                      isDarkMode ? 'bg-black/60 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                    ]">
                      <button @click.stop="openTableModal(table)" :class="['p-2 rounded-lg transition-all', isDarkMode ? 'hover:bg-gold/20 text-gold' : 'hover:bg-gold/10 text-gold']" :title="t('admin.edit')">
                        <Edit class="h-3.5 w-3.5" />
                      </button>
                      <button @click.stop="toggleTableAvailability(table)" :class="['p-2 rounded-lg transition-all', table.is_available ? (isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-500/10 text-red-500') : (isDarkMode ? 'hover:bg-green-500/20 text-green-400' : 'hover:bg-green-500/10 text-green-500')]" :title="table.is_available ? t('admin.mark_occupied') : t('admin.mark_available')">
                        <CheckCircle2 class="h-3.5 w-3.5" />
                      </button>
                      <button @click.stop="deleteTable(table)" class="p-2 rounded-lg transition-all hover:bg-red-500/20 text-red-400" :title="t('admin.delete')">
                        <Trash2 class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Modal -->
        <div v-if="showTableModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showTableModal = false"></div>
          <div :class="['relative w-full max-w-md rounded-[2.5rem] p-10 border shadow-2xl', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
            <h3 class="font-serif text-3xl mb-8">{{ editingTable ? t('admin.edit_table') : t('admin.add_table_title') }}</h3>
            <form @submit.prevent="saveTable" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.table_number') }}</label>
                  <input v-model.number="tableForm.table_number" required type="number" min="1" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
                </div>
                <div class="space-y-2">
                  <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.capacity') }}</label>
                  <input v-model.number="tableForm.capacity" required type="number" min="1" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.location') }}</label>
                <select v-model="tableForm.location" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200']">
                  <option value="Main Hall">{{ t('admin.main_hall') }}</option>
                  <option value="VIP Room">{{ t('admin.vip_room') }}</option>
                  <option value="Terrace">{{ t('admin.terrace') }}</option>
                  <option value="Garden">{{ t('admin.garden') }}</option>
                  <option value="Private Room">{{ t('admin.private_room') }}</option>
                </select>
              </div>
              <div class="flex gap-4 pt-4">
                <button type="button" @click="showTableModal = false" class="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">{{ t('admin.cancel') }}</button>
                <button type="submit" class="flex-1 py-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20">{{ editingTable ? t('admin.save_changes') : t('admin.add_table') }}</button>
              </div>
            </form>
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
                  <th class="px-6 py-5">{{ t('admin.col_user_identity') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_role') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_auth_provider') }}</th>
                  <th class="px-6 py-5">{{ t('admin.col_joined_date') }}</th>
                  <th class="px-6 py-5 text-right">{{ t('admin.col_actions') }}</th>
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
          <h3 class="font-serif text-3xl">{{ t('admin.initializing') }}</h3>
          <p class="text-text-muted italic">{{ t('admin.syncing', { tab: activeTab }) }}</p>
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
            <button v-if="!alertModal.onConfirm" @click="closeAlert" class="p-1.5 hover:bg-white/10 rounded-lg transition-colors -mt-1">
              <XCircle class="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          </div>
          <div v-if="alertModal.onConfirm" class="mt-4 flex gap-3 justify-end">
            <button @click="alertModal.onCancel ? alertModal.onCancel() : closeAlert()" class="py-2 px-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold">{{ t('admin.cancel') }}</button>
            <button @click="alertModal.onConfirm ? alertModal.onConfirm() : null" class="py-2 px-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-sm font-black">{{ t('common.confirm') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Overlay Loader -->
    <div v-if="isLoading" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div class="text-center">
        <div class="w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-gold/20"></div>
        <p class="text-gold font-serif italic text-xl animate-pulse tracking-widest uppercase">{{ t('admin.loading_text') }}</p>
      </div>
    </div>
    <!-- Menu Modal -->
    <div v-if="isMenuModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="isMenuModalOpen = false"></div>
      <div :class="['relative w-full max-w-xl rounded-[2.5rem] p-10 border shadow-2xl max-h-[90vh] overflow-y-auto', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
        <h3 class="font-serif text-3xl mb-8">{{ editingItem ? t('admin.refine_dish') : t('admin.new_signature_dish') }}</h3>
        <form @submit.prevent="saveMenuItem" class="space-y-6 pb-8">
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.dish_name') }}</label>
              <input v-model="menuItemForm.name" required type="text" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.price_usd') }}</label>
              <input v-model="menuItemForm.price" required type="number" step="0.01" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.category') }}</label>
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
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.cuisine') }}</label>
              <select v-model="menuItemForm.cuisine" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200']">
                <option>Asia Foods</option>
                <option>Europe Foods</option>
              </select>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.dish_image') }}</label>
            <div 
              @drop="handleImageDrop"
              @dragover.prevent="isImageDragging = true"
              @dragleave="isImageDragging = false"
              @click="imageInput?.click()"
              :class="['w-full p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer', isImageDragging ? (isDarkMode ? 'border-gold bg-gold/10' : 'border-gold bg-gold/5') : (isDarkMode ? 'border-white/20 bg-white/5 hover:border-white/40' : 'border-gray-300 bg-gray-50 hover:border-gray-400')]">
              <div class="text-center">
                <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3', isDarkMode ? 'bg-white/10' : 'bg-gray-200']">
                  <svg class="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
                <p class="text-sm font-semibold">{{ t('admin.drag_drop_hint') }}</p>
                <p class="text-xs opacity-40 mt-1">{{ t('admin.browse_hint') }}</p>
              </div>
              <input type="file" accept="image/*" @change="handleImageUpload" class="hidden" ref="imageInput" />
            </div>
            <div v-if="imagePreview" class="relative mt-4">
              <img :src="imagePreview" :alt="menuItemForm.name" class="w-full h-40 object-cover rounded-2xl" />
              <button type="button" @click="imagePreview = null; menuItemForm.image_url = ''" class="absolute top-2 right-2 p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                <XCircle class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.kitchen_station') }}</label>
              <select v-model="menuItemForm.station" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200']">
                <option value="">{{ t('admin.auto_station') }}</option>
                <option value="wok">{{ t('admin.wok_station') }}</option>
                <option value="grill">{{ t('admin.grill_station') }}</option>
                <option value="bar">{{ t('admin.bar_station') }}</option>
                <option value="dessert">{{ t('admin.dessert_station') }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.spice_level') }}</label>
              <select v-model.number="menuItemForm.spice_level" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200']">
                <option :value="null">{{ t('admin.not_spicy') }}</option>
                <option :value="1">{{ t('admin.mild') }}</option>
                <option :value="2">{{ t('admin.medium') }}</option>
                <option :value="3">{{ t('admin.spicy') }}</option>
                <option :value="4">{{ t('admin.very_spicy') }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.dietary') }}</label>
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" v-model="menuItemForm.is_vegetarian" class="w-5 h-5 accent-gold" />
                <span class="text-sm">{{ t('admin.vegetarian') }}</span>
              </label>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.allergens') }}</label>
              <input v-model="menuItemForm.allergens" type="text" :placeholder="t('admin.allergens_placeholder')" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.description') }}</label>
            <textarea v-model="menuItemForm.description" rows="3" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']"></textarea>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="isMenuModalOpen = false" class="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">{{ t('admin.cancel') }}</button>
            <button type="submit" class="flex-1 py-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20">{{ t('admin.save') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Profile Modal -->
    <div v-if="isProfileModalOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="isProfileModalOpen = false"></div>
      <div :class="['relative w-full max-w-md rounded-[2.5rem] p-10 border shadow-2xl', isDarkMode ? 'bg-black border-white/10' : 'bg-white border-gray-200']">
        <h3 class="font-serif text-3xl mb-8">{{ t('admin.admin_identity') }}</h3>
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.full_name') }}</label>
            <input v-model="profileForm.name" required type="text" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest opacity-40">{{ t('admin.email') }}</label>
            <input v-model="profileForm.email" required type="email" :class="['w-full p-4 rounded-xl border outline-none focus:border-gold transition-all', isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200']" />
          </div>
          <div class="flex gap-4 pt-4">
            <button type="button" @click="isProfileModalOpen = false" class="flex-1 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest">{{ t('admin.discard') }}</button>
            <button type="submit" class="flex-1 py-4 rounded-2xl bg-gold text-black hover:scale-105 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-gold/20">{{ t('admin.update_identity') }}</button>
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
