<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isLoginMode = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  isLoading.value = true
  error.value = ''

  if (!isLoginMode.value && password.value !== confirmPassword.value) {
    error.value = t('login.password_mismatch')
    isLoading.value = false
    return
  }

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
      if (data.user.role === 'admin') {
        router.push({ name: 'admin' })
      } else {
        router.push({ name: 'home' })
      }
    } else {
      error.value = data.message || t('login.auth_failed')
    }
  } catch (err) {
    error.value = t('login.connection_error')
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
  <div class="login-panel w-full max-w-md space-y-6 text-white">
    <div class="space-y-2 text-center">
      <p class="font-serif text-4xl font-bold text-gold">LokPa</p>
      <h2 class="text-xl font-semibold text-white">
        {{ isLoginMode ? t('login.title') : t('login.signup_title') }}
      </h2>
      <p class="text-xs text-white/50">
        {{ isLoginMode ? t('login.welcome_back') : t('login.signup_prompt') }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-2 border border-gold/15 bg-black/60 p-1">
      <button @click="isLoginMode = true" class="h-10 text-xs font-bold uppercase tracking-[0.16em] transition-all"
        :class="isLoginMode ? 'bg-gold text-base-dark shadow-lg shadow-gold/15' : 'text-white/50 hover:text-gold'">
        {{ t('login.tab_login') }}
      </button>
      <button @click="isLoginMode = false" class="h-10 text-xs font-bold uppercase tracking-[0.16em] transition-all"
        :class="!isLoginMode ? 'bg-gold text-base-dark shadow-lg shadow-gold/15' : 'text-white/50 hover:text-gold'">
        {{ t('login.tab_signup') }}
      </button>
    </div>

    <div v-if="error" class="border border-red-500/30 bg-red-950/35 p-3">
      <p class="text-center text-sm text-red-200">{{ error }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-if="!isLoginMode" class="space-y-2">
        <label for="name" class="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          {{ t('login.full_name') }}
        </label>
        <input id="name" v-model="name" type="text" placeholder="Sokha Chan"
          class="login-input h-12 w-full border border-gold/15 bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-gold focus:bg-black"
          :required="!isLoginMode" />
      </div>

      <div class="space-y-2">
        <label for="email" class="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          {{ t('login.email') }}
        </label>
        <input id="email" v-model="email" type="email" placeholder="customer@lokpa.com"
          class="login-input h-12 w-full border border-gold/15 bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-gold focus:bg-black"
          required />
      </div>

      <div class="space-y-2">
        <label for="password" class="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          {{ t('login.password') }}
        </label>
        <input id="password" v-model="password" type="password" placeholder="••••••••"
          class="login-input h-12 w-full border border-gold/15 bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-gold focus:bg-black"
          required />
      </div>

      <div v-if="!isLoginMode" class="space-y-2">
        <label for="confirm-password" class="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
          {{ t('login.confirm_password') }}
        </label>
        <input id="confirm-password" v-model="confirmPassword" type="password" placeholder="••••••••"
          class="login-input h-12 w-full border border-gold/15 bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-gold focus:bg-black"
          :required="!isLoginMode" />
      </div>

      <button type="submit" :disabled="isLoading"
        class="h-12 w-full bg-gold px-4 text-sm font-black uppercase tracking-[0.16em] text-base-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-gold/25 disabled:opacity-60">
        {{ isLoading ? t('login.processing') : (isLoginMode ? t('login.login_btn') : t('login.signup_btn')) }}
      </button>
    </form>

    <div class="flex items-center gap-4">
      <div class="h-px flex-1 bg-gold/20"></div>
      <span class="text-[10px] uppercase tracking-[0.16em] text-white/35">{{ t('login.or_continue_with') }}</span>
      <div class="h-px flex-1 bg-gold/20"></div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <button @click="handleGoogleLogin"
        class="flex h-11 items-center justify-center gap-3 border border-gold/15 bg-black/60 px-4 text-sm font-medium text-white transition-all duration-300 hover:border-gold hover:text-gold">
        <svg class="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span>Google</span>
      </button>

      <button @click="handleAppleLogin"
        class="flex h-11 items-center justify-center gap-3 border border-gold/15 bg-black/60 px-4 text-sm font-medium text-white transition-all duration-300 hover:border-gold hover:text-gold">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12.152 6.896c-.948 0-1.688-.77-1.688-1.688 0-.917.74-1.688 1.688-1.688.948 0 1.688.771 1.688 1.688 0 .917-.74 1.688-1.688 1.688zm6.304 0c-.948 0-1.688-.77-1.688-1.688 0-.917.74-1.688 1.688-1.688.948 0 1.688.771 1.688 1.688 0 .917-.74 1.688-1.688 1.688zm-12.608 0c-.948 0-1.688-.77-1.688-1.688 0-.917.74-1.688 1.688-1.688.948 0 1.688.771 1.688 1.688 0 .917-.74 1.688-1.688 1.688z" />
        </svg>
        <span>Apple</span>
      </button>
    </div>      <p class="text-center text-xs text-white/45">
        {{ isLoginMode ? t('login.no_account') : t('login.have_account') }}
        <button type="button" @click="isLoginMode = !isLoginMode"
          class="font-semibold text-gold underline-offset-4 hover:underline">
          {{ isLoginMode ? t('login.create_account') : t('login.tab_login') }}
        </button>
      </p>
  </div>
</template>

<style scoped>
.login-panel {
  animation: login-panel-in 0.8s cubic-bezier(0.2, 0, 0.2, 1) both;
}

.login-input:focus {
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
}

@keyframes login-panel-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-panel {
    animation: none;
  }
}
</style>
