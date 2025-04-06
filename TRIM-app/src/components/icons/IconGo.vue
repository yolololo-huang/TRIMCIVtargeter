<script setup lang="ts">
import { onMounted } from 'vue'
import { gsap } from 'gsap'

onMounted(() => {
  const animation = gsap.fromTo(
    '.gosubmit-icon',
    { opacity: 1, x: '0%' },
    {
      duration: 1,
      opacity: 1,
      x: '50%',
      ease: 'power1.inOut',
      repeat: -1,
      yoyo: true
    }
  )

  const icon = document.querySelector('.gosubmit-icon')
  icon?.addEventListener('mouseenter', () => {
    gsap.to('.gosubmit-icon', { duration: 0.5, opacity: 1 })
    animation.pause()
  })
  icon?.addEventListener('mouseleave', () => {
    gsap.to('.gosubmit-icon', { duration: 0.5, opacity: 1 })
    animation.resume()
  })
})
</script>

<template>
  <div class="gosubmit-icon">
    <svg
      width="50"
      height="50"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="47.5" stroke="#1E90FF" stroke-width="5" />
      <path
        d="M18 46C15.7909 46 14 47.7909 14 50C14 52.2091 15.7909 54 18 54V46ZM86.8284 52.8284C88.3905 51.2663 88.3905 48.7337 86.8284 47.1716L61.3726 21.7157C59.8105 20.1536 57.2778 20.1536 55.7157 21.7157C54.1536 23.2778 54.1536 25.8105 55.7157 27.3726L78.3431 50L55.7157 72.6274C54.1536 74.1895 54.1536 76.7222 55.7157 78.2843C57.2778 79.8464 59.8105 79.8464 61.3726 78.2843L86.8284 52.8284ZM18 54L84 54V46L18 46V54Z"
        fill="#1E90FF"
      />
    </svg>
  </div>
</template>

<style scoped>
.gosubmit-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}
</style>
