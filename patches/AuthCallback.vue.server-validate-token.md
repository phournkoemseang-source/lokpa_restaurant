# Patch: validate token on server in AuthCallback

## File
`Client/src/views/AuthCallback.vue`

## Replace the entire `<script setup ...>` block with:

```ts
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  try {
    if (!token) throw new Error('No token in callback URL')

    // Validate the token on the server (signature + expiry)
    const response = await fetch('http://localhost:5001/api/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error('Invalid or expired token')

    const user = await response.json()

    // Store the verified auth data
    authStore.setAuth({
      token,
      user,
    })

    router.push({ name: 'home' })
  } catch {
    // Clear stale auth state and redirect immediately
    authStore.logout()
    router.push({ name: 'home' })
  }
})
</script>
```

## Keep your existing `<template>`
The spinner template can remain unchanged.

## Why this fixes the issue
Your current `AuthCallback.vue` decodes JWT payload client-side without verification. If the token is missing/expired/malformed, you can get stuck on the callback page spinner and feel like login is taking too long.

By calling `/api/profile`, you ensure the token is valid (server-side jwt.verify) before navigation.

