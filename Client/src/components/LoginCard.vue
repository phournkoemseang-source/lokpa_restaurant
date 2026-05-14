<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  isLoading.value = true
  error.value = ''

  const endpoint = isLoginMode.value ? '/api/login' : '/api/register'
  const payload = isLoginMode.value 
    ? { email: email.value, password: password.value }
    : { name: name.value, email: email.value, password: password.value }

  try {
    const response = await fetch(`http://localhost:5001${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (response.ok) {
      authStore.setAuth(data)
      router.push({ name: 'home' })
    } else {
      error.value = data.message || 'Authentication failed'
    }
  } catch (err) {
    error.value = 'Connection error. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function handleGoogleLogin() {
  window.location.href = 'http://localhost:5001/api/auth/google'
}

function handleAppleLogin() {
  window.location.href = 'http://localhost:5001/api/auth/apple'
}
</script>

<template>
  <div class="w-full max-w-md bg-card-dark/80 backdrop-blur-md border border-border-card rounded-sm p-8 md:p-10 space-y-6 animate-slide-up">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h2 class="font-serif text-2xl md:text-3xl text-white">
        {{ isLoginMode ? 'Welcome Back' : 'Join the Fusion' }}
      </h2>
      <p class="text-text-subtle text-sm">
        {{ isLoginMode ? 'Sign in to your account' : 'Create your restaurant account' }}
      </p>
    </div>

    <!-- Mode Toggle -->
    <div class="flex border-b border-border-card">
      <button 
        @click="isLoginMode = true"
        class="flex-1 py-2 text-xs tracking-[0.15em] uppercase font-medium transition-colors"
        :class="isLoginMode ? 'text-gold border-b-2 border-gold' : 'text-text-muted hover:text-white'"
      >
        Login
      </button>
      <button 
        @click="isLoginMode = false"
        class="flex-1 py-2 text-xs tracking-[0.15em] uppercase font-medium transition-colors"
        :class="!isLoginMode ? 'text-gold border-b-2 border-gold' : 'text-text-muted hover:text-white'"
      >
        Sign Up
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-900/50 border border-red-500/50 rounded-sm p-3">
      <p class="text-red-300 text-sm text-center">{{ error }}</p>
    </div>

    <!-- Social Logins (Prioritized as requested) -->
    <div class="space-y-3">
      <!-- Google Login -->
      <button
        @click="handleGoogleLogin"
        class="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 px-4 rounded-sm border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:shadow-lg"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span class="text-sm tracking-wide">Continue with Google</span>
      </button>

      <!-- Apple Login -->
      <button
        @click="handleAppleLogin"
        class="w-full flex items-center justify-center gap-3 bg-black text-white font-medium py-3 px-4 rounded-sm border border-gray-700 hover:bg-gray-900 transition-all duration-300 hover:shadow-lg"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.152 6.896c-.948 0-1.688-.77-1.688-1.688 0-.917.74-1.688 1.688-1.688.948 0 1.688.771 1.688 1.688 0 .917-.74 1.688-1.688 1.688zm6.304 0c-.948 0-1.688-.77-1.688-1.688 0-.917.74-1.688 1.688-1.688.948 0 1.688.771 1.688 1.688 0 .917-.74 1.688-1.688 1.688zm-12.608 0c-.948 0-1.688-.77-1.688-1.688 0-.917.74-1.688 1.688-1.688.948 0 1.688.771 1.688 1.688 0 .917-.74 1.688-1.688 1.688z"/>
        </svg>
        <span class="text-sm tracking-wide">Continue with Apple</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="flex items-center gap-4">
      <div class="flex-1 h-px bg-border-card"></div>
      <span class="text-text-muted text-xs tracking-[0.15em] uppercase">Or</span>
      <div class="flex-1 h-px bg-border-card"></div>
    </div>

    <!-- Email/Password Form -->
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div v-if="!isLoginMode" class="space-y-2">
        <label for="name" class="text-xs tracking-[0.15em] uppercase text-text-subtle font-medium">
          Full Name
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Alexander Chen"
          class="w-full bg-transparent border border-border-card rounded-sm px-4 py-3 text-sm text-white placeholder-text-muted focus:border-gold focus:outline-none transition-colors duration-300"
          :required="!isLoginMode"
        />
      </div>

      <div class="space-y-2">
        <label for="email" class="text-xs tracking-[0.15em] uppercase text-text-subtle font-medium">
          Email Address
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="alexander@exclusive.com"
          class="w-full bg-transparent border border-border-card rounded-sm px-4 py-3 text-sm text-white placeholder-text-muted focus:border-gold focus:outline-none transition-colors duration-300"
          required
        />
      </div>

      <div class="space-y-2">
        <label for="password" class="text-xs tracking-[0.15em] uppercase text-text-subtle font-medium">
          Password
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          class="w-full bg-transparent border border-border-card rounded-sm px-4 py-3 text-sm text-white placeholder-text-muted focus:border-gold focus:outline-none transition-colors duration-300"
          required
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full bg-gold hover:bg-gold-light text-base-dark font-semibold py-3 px-4 rounded-sm tracking-[0.15em] uppercase text-sm transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 disabled:opacity-60"
      >
        {{ isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account') }}
      </button>
    </form>

    <!-- Security notice -->
    <p class="text-center text-text-muted text-[10px] tracking-[0.15em] uppercase pt-2">
      Session encrypted via RSA-signed JSON Web Tokens
    </p>
  </div>
</template>
