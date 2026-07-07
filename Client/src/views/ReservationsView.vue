<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  Users, CheckCircle2, AlertCircle, MapPin, QrCode, Download,
  ArrowLeft, ArrowRight, ChevronRight, Loader2, Check,
  Building2, Sun, Trees, Sofa, VenetianMask
} from 'lucide-vue-next'
import qrImage from '@/assets/images/qr.jpg'
import { jsPDF } from 'jspdf'

const { t } = useI18n()
const authStore = useAuthStore()

// ─── Multi-step state ───
const currentStep = ref(1)
const isSubmitting = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const paymentProcessing = ref(false)
const paidReservationId = ref<number | null>(null)

// ─── Step 1: Booking Details ───
const formData = ref({
  date: '',
  time: '',
  guests: 2,
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: '',
  specialRequests: '',
  bookingType: 'regular' as 'regular' | 'event',
  occasionNote: '',
})

// ─── Step 2: Location & Table ───
const LOCATIONS = [
  { id: 'Window', icon: 'Sun', label: 'reservations.loc_window', desc: 'reservations.loc_window_desc' },
  { id: 'Main Hall', icon: 'Building2', label: 'reservations.loc_main_hall', desc: 'reservations.loc_main_hall_desc' },
  { id: 'VIP Corner', icon: 'Sofa', label: 'reservations.loc_vip', desc: 'reservations.loc_vip_desc' },
  { id: 'Terrace', icon: 'Trees', label: 'reservations.loc_terrace', desc: 'reservations.loc_terrace_desc' },
  { id: 'Garden', icon: 'Trees', label: 'reservations.loc_garden', desc: 'reservations.loc_garden_desc' },
  { id: 'Private Room', icon: 'VenetianMask', label: 'reservations.loc_private', desc: 'reservations.loc_private_desc' },
]

// Map location IDs to their translation key suffix
const locationKeyMap: Record<string, string> = {
  'Window': 'window',
  'Main Hall': 'main_hall',
  'VIP Corner': 'vip',
  'Terrace': 'terrace',
  'Garden': 'garden',
  'Private Room': 'private',
}

const selectedLocation = ref<string | null>(null)
const availableTables = ref<any[]>([])
const selectedTableId = ref<number | null>(null)
const isTablesLoading = ref(false)

const filteredTables = computed(() => {
  if (!selectedLocation.value) return []
  return availableTables.value.filter(t => t.location === selectedLocation.value)
})

function getLocationLabel(locId: string): string {
  const key = locationKeyMap[locId]
  if (!key) return locId
  return t(`reservations.loc_${key}`)
}

async function fetchAvailableTables() {
  if (!formData.value.date || !formData.value.time) return
  isTablesLoading.value = true
  try {
    const resp = await fetch(
      `http://localhost:5001/api/tables/available?date=${formData.value.date}&time=${formData.value.time}&guests=${formData.value.guests}`
    )
    if (resp.ok) availableTables.value = await resp.json()
    else availableTables.value = []
  } catch {
    availableTables.value = []
  } finally {
    isTablesLoading.value = false
  }
}

watch(() => [formData.value.date, formData.value.time, formData.value.guests], () => {
  if (formData.value.date && formData.value.time) {
    fetchAvailableTables()
  }
})

function selectLocation(loc: string) {
  selectedLocation.value = loc
  selectedTableId.value = null
}

function selectTable(tableId: number) {
  selectedTableId.value = selectedTableId.value === tableId ? null : tableId
}

function getSelectedTableNumber(tableId: number | null): string {
  if (!tableId) return '-'
  const table = availableTables.value.find(t => t.id === tableId)
  return table?.table_number || '-'
}

// ─── Step 3: Payment ───
async function proceedToPayment() {
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
      body: JSON.stringify({
        ...formData.value,
        tableId: selectedTableId.value,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      paidReservationId.value = data.id
      currentStep.value = 3
    } else {
      const data = await response.json().catch(() => ({}))
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

async function confirmPayment() {
  if (!paidReservationId.value) return
  paymentProcessing.value = true
  try {
    await fetch(`http://localhost:5001/api/reservations/${paidReservationId.value}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
    })
  } catch {
    // Demo mode — proceed to success regardless
  } finally {
    paymentProcessing.value = false
    currentStep.value = 4
    fetchReservationForReceipt()
  }
}

// ─── Step 4: PDF Receipt ───
const reservationForReceipt = ref<any>(null)

async function fetchReservationForReceipt() {
  if (!paidReservationId.value) return
  try {
    const resp = await fetch('http://localhost:5001/api/user/reservations', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (resp.ok) {
      const reservations = await resp.json()
      reservationForReceipt.value = reservations.find((r: any) => r.id === paidReservationId.value)
    }
  } catch { }
}

function generateReceiptPDF() {
  const res = reservationForReceipt.value || {
    id: paidReservationId.value,
    date: formData.value.date,
    time: formData.value.time,
    guests: formData.value.guests,
    name: formData.value.name,
    email: formData.value.email,
    phone: formData.value.phone,
    special_requests: formData.value.specialRequests,
    table_number: getSelectedTableNumber(selectedTableId.value),
    location: selectedLocation.value || 'Main Hall',
    booking_type: formData.value.bookingType,
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  })

  const pageW = doc.internal.pageSize.getWidth()
  const gold: [number, number, number] = [212, 175, 55]
  const dark: [number, number, number] = [20, 20, 20]
  const gray: [number, number, number] = [100, 100, 100]

  // Background
  doc.setFillColor(245, 245, 240)
  doc.rect(0, 0, pageW, 210, 'F')

  // Top gold bar
  doc.setFillColor(gold[0], gold[1], gold[2])
  doc.rect(0, 0, pageW, 6, 'F')

  // Restaurant name
  doc.setTextColor(dark[0], dark[1], dark[2])
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('LokPa', pageW / 2, 22, { align: 'center' })

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text('Modern Fusion Dining · Phnom Penh', pageW / 2, 28, { align: 'center' })

  // Divider
  doc.setDrawColor(gold[0], gold[1], gold[2])
  doc.setLineWidth(0.3)
  doc.line(10, 33, pageW - 10, 33)

  // Receipt title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text('BOOKING CONFIRMATION', pageW / 2, 40, { align: 'center' })

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text(`Receipt #BK-${res.id} · ${new Date().toLocaleDateString()}`, pageW / 2, 46, { align: 'center' })

  // Divider
  doc.line(10, 50, pageW - 10, 50)

  // Details
  const leftX = 14
  const rightX = pageW / 2 + 4
  let y = 58
  const lineH = 7

  const detailRows = [
    { label: 'Guest', value: res.name },
    { label: 'Email', value: res.email },
    { label: 'Phone', value: res.phone || '-' },
    { label: 'Date', value: res.date },
    { label: 'Time', value: res.time?.slice(0, 5) || '-' },
    { label: 'Guests', value: `${res.guests} persons` },
    { label: 'Table', value: res.table_number ? `#${res.table_number}` : 'To be assigned' },
    { label: 'Location', value: res.location || 'Main Hall' },
  ]

  doc.setFontSize(7)
  for (const row of detailRows) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(gray[0], gray[1], gray[2])
    doc.text(row.label, leftX, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(dark[0], dark[1], dark[2])
    doc.text(String(row.value), rightX, y)
    y += lineH
  }

  // Special requests
  if (res.special_requests) {
    y += 2
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(gray[0], gray[1], gray[2])
    doc.setFontSize(7)
    doc.text('Special Requests:', leftX, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(dark[0], dark[1], dark[2])
    doc.setFontSize(6)
    const lines = doc.splitTextToSize(res.special_requests, pageW - 28)
    doc.text(lines, leftX, y)
    y += lines.length * 4 + 2
  }

  // Bottom gold bar
  doc.setFillColor(gold[0], gold[1], gold[2])
  doc.rect(0, 195, pageW, 6, 'F')

  // Footer
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(gray[0], gray[1], gray[2])
  doc.text('Street 240, Phnom Penh · +855 (0) 23 999 888', pageW / 2, 192, { align: 'center' })

  doc.save(`LokPa_Receipt_BK${res.id}.pdf`)
}

// ─── Navigation ───
function goToStep(step: number) {
  if (step === 2 && (!formData.value.date || !formData.value.time)) {
    status.value = 'error'
    errorMessage.value = t('reservations.fill_date_time_error')
    return
  }
  status.value = 'idle'
  errorMessage.value = ''
  if (step === 2) fetchAvailableTables()
  currentStep.value = step
}

function resetAll() {
  currentStep.value = 1
  status.value = 'idle'
  errorMessage.value = ''
  paidReservationId.value = null
  selectedLocation.value = null
  selectedTableId.value = null
  reservationForReceipt.value = null
  formData.value = {
    date: '',
    time: '',
    guests: 2,
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    phone: '',
    specialRequests: '',
    bookingType: 'regular',
    occasionNote: '',
  }
}

onMounted(() => {
  fetchAvailableTables()
})

// ─── Icon helper ───
const locationIcons: Record<string, any> = {
  Sun, Building2, Sofa, Trees, VenetianMask
}
</script>

<template>
  <div class="min-h-screen bg-base-dark text-white">
    <!-- Hero Banner (compact) -->
    <section class="relative min-h-[50vh] overflow-hidden">
      <img
        src="@/assets/pictures/EroupFoods/Wines/jeff-siepman-hK9hIPgF3QU-unsplash.jpg"
        alt="LokPa premium restaurant reservation banner"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.58),rgba(10,10,10,0.42)_38%,#0A0A0A_96%),linear-gradient(90deg,rgba(10,10,10,0.78),rgba(10,10,10,0.18)_52%,rgba(10,10,10,0.74))]"></div>

      <div class="relative z-10 mx-auto flex min-h-[50vh] max-w-7xl flex-col justify-center px-6 pb-16 pt-32 text-center lg:px-16">
        <p class="text-[10px] font-black uppercase tracking-[0.45em] text-gold">LokPa Restaurant</p>
        <h1 class="mx-auto mt-6 max-w-4xl font-serif text-5xl leading-tight text-white md:text-7xl">
          {{ t('reservations.title') }}
          <span class="block text-gold-light">{{ t('reservations.subtitle') }}</span>
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
          {{ t('reservations.hero_description') }}
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <section class="container mx-auto -mt-20 px-4 pb-24 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <!-- Step Progress -->
        <div class="mb-10 flex items-center justify-center gap-0">
          <div v-for="step in 4" :key="step" class="flex items-center">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full text-xs font-black transition-all duration-500',
                currentStep === step
                  ? 'bg-gold text-base-dark shadow-xl shadow-gold/30 scale-110'
                  : currentStep > step
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-card-dark/60 text-white/30 border border-gold/10'
              ]"
            >
              <Check v-if="currentStep > step" class="h-4 w-4" />
              <span v-else>{{ step }}</span>
            </div>
            <div
              v-if="step < 4"
              :class="[
                'h-px w-12 md:w-20 transition-all duration-500',
                currentStep > step ? 'bg-green-500/50' : 'bg-gold/10'
              ]"
            ></div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="status === 'error'" class="mb-6 flex items-center gap-3 rounded-sm border border-red-500/30 bg-red-900/20 p-4">
          <AlertCircle class="h-5 w-5 shrink-0 text-red-500" />
          <p class="text-sm text-red-200">{{ errorMessage }}</p>
        </div>

        <!-- Step 1: Booking Details -->
        <div v-if="currentStep === 1" class="animate-fade-in">
          <div class="border border-gold/20 bg-card-dark/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-md md:p-10">
            <div class="mb-8 text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('reservations.form_title') }}</p>
              <h2 class="mt-2 font-serif text-3xl text-white">{{ t('reservations.subtitle') }}</h2>
              <p class="mx-auto mt-2 max-w-xl text-sm leading-7 text-text-subtle">{{ t('reservations.description') }}</p>
            </div>

            <!-- Booking Type -->
            <div class="mb-8 grid grid-cols-2 gap-3">
              <button type="button" @click="formData.bookingType = 'regular'"
                :class="['rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all', formData.bookingType === 'regular' ? 'bg-gold text-base-dark shadow-xl shadow-gold/20' : 'border border-gold/15 text-gold hover:border-gold/50']">
                {{ t('reservations.booking_type_regular') }}
              </button>
              <button type="button" @click="formData.bookingType = 'event'"
                :class="['rounded-2xl py-4 text-xs font-black uppercase tracking-widest transition-all', formData.bookingType === 'event' ? 'bg-gold text-base-dark shadow-xl shadow-gold/20' : 'border border-gold/15 text-gold hover:border-gold/50']">
                {{ t('reservations.booking_type_event') }}
              </button>
            </div>

            <div v-if="formData.bookingType === 'event'" class="mb-8 animate-fade-in rounded-2xl border border-gold/20 bg-gold/5 p-6">
              <label class="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.event_info') }}</label>
              <textarea v-model="formData.occasionNote" rows="2"
                :placeholder="t('reservations.event_placeholder')"
                class="w-full resize-none border-b border-border-card bg-card-dark px-0 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none">
              </textarea>
            </div>

            <!-- Date, Time, Guests -->
            <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.date') }}</label>
                <input v-model="formData.date" type="date"
                  class="w-full border-b border-border-card bg-card-dark px-0 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none" required />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.time') }}</label>
                <select v-model="formData.time"
                  class="w-full border-b border-border-card bg-card-dark px-0 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none" required>
                  <option value="" disabled class="bg-base-dark">{{ t('reservations.time_placeholder') }}</option>
                  <option value="18:00" class="bg-base-dark">18:00 (Sunset)</option>
                  <option value="19:00" class="bg-base-dark">19:00</option>
                  <option value="20:00" class="bg-base-dark">20:00</option>
                  <option value="21:00" class="bg-base-dark">21:00 (Late Night)</option>
                  <option value="22:00" class="bg-base-dark">22:00</option>
                  <option value="23:00" class="bg-base-dark">23:00</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.guests') }}</label>
                <div class="relative">
                  <Users class="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <input v-model.number="formData.guests" type="number" min="1" max="12"
                    class="w-full border-b border-border-card bg-card-dark px-7 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none" required />
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.name') }}</label>
                <input v-model="formData.name" type="text"
                  class="w-full border-b border-border-card bg-card-dark px-0 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none" required />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.phone') }}</label>
                <input v-model="formData.phone" type="tel" :placeholder="t('reservations.phone_placeholder')"
                  class="w-full border-b border-border-card bg-card-dark px-0 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none" required />
              </div>
            </div>

            <div class="mb-8 space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{{ t('reservations.special_requests') }}</label>
              <textarea v-model="formData.specialRequests" rows="2"
                :placeholder="t('reservations.special_requests_placeholder')"
                class="w-full resize-none border-b border-border-card bg-card-dark px-0 py-3 text-sm text-white transition-colors focus:border-gold focus:outline-none">
              </textarea>
            </div>

            <!-- Action -->
            <button @click="goToStep(2)"
              class="flex w-full items-center justify-center gap-3 bg-gold py-5 text-xs font-black uppercase tracking-[0.3em] text-base-dark transition-all duration-500 hover:bg-gold-light hover:shadow-2xl hover:shadow-gold/20">
              {{ t('reservations.choose_table') }}
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Step 2: Location & Table Selection -->
        <div v-if="currentStep === 2" class="animate-fade-in">
          <div class="border border-gold/20 bg-card-dark/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-md md:p-10">
            <div class="mb-8 text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('reservations.step_2_title') }}</p>
              <h2 class="mt-2 font-serif text-3xl text-white">{{ t('reservations.select_location') }}</h2>
              <p class="mx-auto mt-2 max-w-xl text-sm leading-7 text-text-subtle">{{ t('reservations.select_table_hint') }}</p>
            </div>

            <!-- Location Grid -->
            <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              <button
                v-for="loc in LOCATIONS"
                :key="loc.id"
                @click="selectLocation(loc.id)"
                :class="[
                  'rounded-2xl border p-5 text-center transition-all duration-300',
                  selectedLocation === loc.id
                    ? 'border-gold bg-gold/10 shadow-xl shadow-gold/10'
                    : 'border-gold/10 bg-gold/5 hover:border-gold/40 hover:bg-gold/8'
                ]"
              >
                <component :is="locationIcons[loc.icon] || Building2" class="mx-auto h-6 w-6" :class="selectedLocation === loc.id ? 'text-gold' : 'text-gold/60'" />
                <p class="mt-3 text-xs font-bold uppercase tracking-widest" :class="selectedLocation === loc.id ? 'text-gold' : 'text-white/80'">
                  {{ t(loc.label) }}
                </p>
                <p class="mt-1 text-[10px] leading-relaxed text-text-muted">{{ t(loc.desc) }}</p>
              </button>
            </div>

            <!-- Available Tables in Selected Location -->
            <div v-if="selectedLocation" class="animate-fade-in">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="text-sm font-bold uppercase tracking-widest text-gold">
                  {{ t('reservations.available_tables_in', { location: getLocationLabel(selectedLocation) }) }}
                </h3>
                <span class="text-xs text-text-muted">{{ filteredTables.length }} {{ t('reservations.available') }}</span>
              </div>

              <div v-if="isTablesLoading" class="flex justify-center py-10">
                <Loader2 class="h-8 w-8 animate-spin text-gold" />
              </div>

              <div v-else-if="filteredTables.length === 0" class="rounded-2xl border border-dashed border-gold/20 py-12 text-center">
                <MapPin class="mx-auto h-10 w-10 text-gold/30" />
                <p class="mt-4 text-sm text-text-muted">{{ t('reservations.no_tables_location') }}</p>
                <p class="mt-1 text-xs text-text-subtle">{{ t('reservations.try_other_location') }}</p>
              </div>

              <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-4">
                <button
                  v-for="table in filteredTables"
                  :key="table.id"
                  @click="selectTable(table.id)"
                  :class="[
                    'rounded-2xl border p-5 text-center transition-all duration-300',
                    selectedTableId === table.id
                      ? 'border-gold bg-gold text-base-dark shadow-xl shadow-gold/20 scale-105'
                      : 'border-gold/10 hover:border-gold/40 bg-gold/3'
                  ]"
                >
                  <div class="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="selectedTableId === table.id ? 'bg-base-dark/20' : 'bg-gold/10'">
                    <span class="text-sm font-black" :class="selectedTableId === table.id ? 'text-base-dark' : 'text-gold'">
                      {{ table.table_number }}
                    </span>
                  </div>
                  <p class="text-xs font-bold" :class="selectedTableId === table.id ? 'text-base-dark' : 'text-white'">
                    {{ table.capacity }} {{ t('reservations.seats') }}
                  </p>
                  <p class="mt-1 text-[10px]" :class="selectedTableId === table.id ? 'text-base-dark/70' : 'text-text-muted'">
                    {{ table.location }}
                  </p>
                </button>
              </div>

              <div v-if="selectedTableId" class="mt-6 animate-fade-in rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-center">
                <CheckCircle2 class="mx-auto h-8 w-8 text-green-400" />
                <p class="mt-2 text-sm font-bold text-green-400">
                  {{ t('reservations.table_selected', { number: getSelectedTableNumber(selectedTableId) }) }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex items-center justify-between gap-4">
              <button @click="currentStep = 1"
                class="flex items-center gap-2 border border-gold/20 px-6 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-gold transition-all hover:border-gold">
                <ArrowLeft class="h-4 w-4" />
                {{ t('reservations.back') }}
              </button>
              <button @click="proceedToPayment" :disabled="!selectedTableId || isSubmitting"
                class="flex items-center gap-3 bg-gold px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-base-dark transition-all duration-500 hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50">
                <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
                <template v-else>
                  {{ t('reservations.proceed_payment') }}
                  <ArrowRight class="h-4 w-4" />
                </template>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Payment (KHQR) -->
        <div v-if="currentStep === 3" class="animate-fade-in">
          <div class="border border-gold/20 bg-card-dark/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-md md:p-10">
            <div class="mb-8 text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.35em] text-gold">{{ t('reservations.payment_title') }}</p>
              <h2 class="mt-2 font-serif text-3xl text-white">{{ t('reservations.payment_subtitle') }}</h2>
              <p class="mx-auto mt-2 max-w-xl text-sm leading-7 text-text-subtle">{{ t('reservations.payment_desc') }}</p>
            </div>

            <!-- Booking Summary -->
            <div class="mb-8 rounded-2xl border border-gold/10 bg-gold/5 p-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">{{ t('reservations.date') }}</p>
                  <p class="mt-1 font-bold text-white">{{ formData.date }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">{{ t('reservations.time') }}</p>
                  <p class="mt-1 font-bold text-white">{{ formData.time }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">{{ t('reservations.guests') }}</p>
                  <p class="mt-1 font-bold text-white">{{ formData.guests }} {{ t('reservations.persons') }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">{{ t('reservations.table_label') }}</p>
                  <p class="mt-1 font-bold text-gold">
                    #{{ getSelectedTableNumber(selectedTableId) }}
                    · {{ getLocationLabel(selectedLocation || 'Main Hall') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- KHQR Code -->
            <div class="flex flex-col items-center gap-6">
              <div class="transform rounded-2xl bg-white p-6 shadow-2xl shadow-gold/5 transition-transform duration-500 hover:scale-105">
                <img :src="qrImage" alt="KHQR Payment for LokPa Restaurant" class="h-52 w-52 object-contain" />
              </div>
              <div class="text-center">
                <p class="text-sm font-bold uppercase tracking-widest text-white">LokPa Restaurant</p>
                <p class="mt-1 text-[10px] italic text-gold">{{ t('cart.scan_with_bakong') }}</p>
              </div>
            </div>

            <!-- Confirm Payment Button -->
            <div class="mt-8 space-y-4">
              <p v-if="paymentProcessing" class="text-center text-xs text-text-subtle">
                <Loader2 class="mr-2 inline h-4 w-4 animate-spin text-gold" />
                {{ t('reservations.processing_payment') }}
              </p>
              <button @click="confirmPayment" :disabled="paymentProcessing"
                class="flex w-full items-center justify-center gap-3 rounded-xl bg-gold py-5 text-xs font-black uppercase tracking-[0.4em] text-base-dark shadow-xl shadow-gold/20 transition-all duration-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                <QrCode class="h-5 w-5" />
                {{ t('reservations.confirm_payment') }}
              </button>
              <button @click="currentStep = 2"
                class="flex w-full items-center justify-center gap-2 border border-gold/20 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-gold transition-all hover:border-gold">
                <ArrowLeft class="h-4 w-4" />
                {{ t('reservations.back') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Success + PDF Receipt -->
        <div v-if="currentStep === 4" class="animate-fade-in">
          <div class="border border-green-500/20 bg-card-dark/95 p-7 shadow-2xl shadow-black/50 backdrop-blur-md md:p-10">
            <div class="text-center">
              <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 class="h-12 w-12 text-green-400" />
              </div>
              <h2 class="mt-6 font-serif text-4xl text-white">{{ t('reservations.payment_success_title') }}</h2>
              <p class="mx-auto mt-3 max-w-md text-sm leading-7 text-text-subtle">
                {{ t('reservations.payment_success_desc') }}
              </p>

              <!-- Reservation ID -->
              <div class="mt-6 inline-block rounded-xl border border-gold/20 bg-gold/5 px-6 py-3">
                <p class="text-[10px] font-black uppercase tracking-widest text-text-muted">{{ t('reservations.ref_number') }}</p>
                <p class="mt-1 font-serif text-2xl text-gold">#BK-{{ paidReservationId }}</p>
              </div>

              <!-- Booking Summary -->
              <div class="mx-auto mt-8 max-w-sm rounded-2xl border border-gold/10 bg-gold/5 p-6 text-left">
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{ t('reservations.date') }}</span>
                    <span class="font-bold text-white">{{ formData.date }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{ t('reservations.time') }}</span>
                    <span class="font-bold text-white">{{ formData.time }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{ t('reservations.guests') }}</span>
                    <span class="font-bold text-white">{{ formData.guests }} {{ t('reservations.persons') }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">{{ t('reservations.table_label') }}</span>
                    <span class="font-bold text-gold">#{{ getSelectedTableNumber(selectedTableId) }} · {{ getLocationLabel(selectedLocation || 'Main Hall') }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-10 space-y-4">
                <button @click="generateReceiptPDF"
                  class="flex w-full items-center justify-center gap-3 rounded-xl bg-gold py-5 text-xs font-black uppercase tracking-[0.35em] text-base-dark shadow-xl shadow-gold/20 transition-all duration-500 hover:bg-gold-light hover:shadow-2xl hover:shadow-gold/30">
                  <Download class="h-5 w-5" />
                  {{ t('reservations.download_receipt') }}
                </button>
                <div class="flex gap-3">
                  <button @click="resetAll"
                    class="flex flex-1 items-center justify-center gap-2 border border-gold/20 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-gold transition-all hover:border-gold">
                    {{ t('reservations.new_booking') }}
                  </button>
                  <router-link to="/menu"
                    class="flex flex-1 items-center justify-center gap-2 border border-gold/20 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-gold transition-all hover:border-gold">
                    {{ t('menu.title') }}
                    <ChevronRight class="h-4 w-4" />
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

input[type="date"]::-webkit-calendar-picker-indicator,
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(0.7) sepia(1) saturate(3) hue-rotate(5deg);
  cursor: pointer;
}

select option {
  background: #0A0A0A;
  color: white;
}
</style>
