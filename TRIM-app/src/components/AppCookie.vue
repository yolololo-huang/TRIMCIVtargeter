<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { checkCookiesAccepted, acceptCookies } from '@/services/api'

  const showCookieBanner = ref(false)

  const checkCookies = async () => {
    try {
      const response = await checkCookiesAccepted()
      if (!response.cookiesAccepted) {
        showCookieBanner.value = true
      }
    } catch (error) {
      console.error('Error checking cookies:', error)
    }
  }

  const acceptCookiesHandler = async () => {
    try {
      await acceptCookies()
      showCookieBanner.value = false
    } catch (error) {
      console.error('Error accepting cookies:', error)
    }
  }

  onMounted(() => {
    checkCookies()
  })
</script>

<template>
  <div v-if="showCookieBanner" class="cookie-banner">
    <p>
      We use cookies to improve your experience. By using this web server, you consent to
      <router-link to="/privacy" style="color: #1e90ff">cookie policy</router-link>. we never
      collect any personal data.
    </p>
    <button @click="acceptCookiesHandler">Got it!</button>
  </div>
</template>

<style scoped>
  .cookie-banner {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    text-align: center;
    padding: 10px;
  }

  .cookie-banner button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    margin-left: 10px;
  }
</style>
