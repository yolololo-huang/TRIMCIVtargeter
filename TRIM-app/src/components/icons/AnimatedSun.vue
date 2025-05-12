<script setup lang="ts">
  import { gsap } from 'gsap'

  const size = 100 // Size of the sun
  const sun = ref<SVGSVGElement | null>(null)
  const rays = ref<SVGGElement | null>(null)

  onMounted(async () => {
    if (rays.value) {
      gsap.to(rays.value, {
        rotate: 360,
        repeat: -1,
        duration: 20,
        ease: 'linear',
        transformOrigin: '50% 50%',
      })
    }
  })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    ref="sun"
  >
    <!-- Center Circle with Text -->
    <circle
      cx="50"
      cy="50"
      r="20"
      fill="rgba(143, 118, 255, 0.5)"
      stroke="rgba(143, 118, 255, 0.5)"
      stroke-width="2"
    />
    <text x="50%" y="50%" text-anchor="middle" fill="black" dy=".3em" font-size="5">
      Click the Bar
    </text>
    <!-- Sun Rays as Rounded Rectangles -->
    <g ref="rays">
      <rect
        v-for="i in 12"
        :key="i"
        x="48"
        y="10"
        width="4"
        height="15"
        fill="#1e8fff65"
        stroke="#1e8fff65"
        rx="2"
        ry="2"
        :transform="'rotate(' + i * 30 + ' 50 50)'"
      />
    </g>
  </svg>
</template>

<style scoped></style>
