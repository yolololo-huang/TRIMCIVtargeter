<script setup lang="ts">
  import { gsap } from 'gsap'
  import { onMounted } from 'vue'

  onMounted(() => {
    gsap.fromTo(
      '.scroll-down svg',
      { opacity: 0, y: 30 },
      {
        duration: 1,
        opacity: 1,
        y: 10,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
      }
    )
  })
</script>

<template>
  <div class="scroll-down">
    <svg width="48" height="22" viewBox="0 0 24 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="0.320092"
        y1="0.615889"
        x2="12.3201"
        y2="10.6159"
        stroke="#8c07dd"
        stroke-width="2"
      />
      <line
        x1="11.6799"
        y1="10.6159"
        x2="23.6799"
        y2="0.615889"
        stroke="#8c07dd"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<style scoped>
  .scroll-down {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
  }

  .scroll-down svg {
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(15);
    }
    40% {
      transform: translateY(30px);
    }
    60% {
      transform: translateY(25px);
    }
  }
</style>
