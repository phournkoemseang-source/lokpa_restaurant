<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  if (token) {
    // Decode token to get user info (basic decode, not verification)
    try {
      // Base64URL decode
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      // Add padding if needed
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
      const payload = JSON.parse(atob(padded))
      authStore.setAuth({
        token,
        user: {
          id: payload.id,
          email: payload.email,
          name: payload.name || 'User',
          role: payload.role
        }
      })
      if (payload.role === 'admin') {
        router.push({ name: 'admin' })
      } else {
        router.push({ name: 'home' })
      }
    } catch (e) {
      router.push({ name: 'home' })
    }
  } else {
    router.push({ name: 'home' })
  }
})
</script>

<template>
  <div class="min-h-screen bg-base-dark flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-white">Processing authentication...</p>
    </div>
  </div>
</template>