<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { Runtime, Inspector } from '@observablehq/runtime'
  import define from '@/utils/e13fa1b2457d4203@702'

  const dashboard = ref<HTMLElement | null>(null)

  onMounted(() => {
    if (dashboard.value) {
      const runtime = new Runtime()
      const main = runtime.module(define, (name) => {
        if (name === 'viewof dashboard') {
          return new Inspector(dashboard.value!)
        }
      })
    }
  })
</script>

<template>
  <div ref="dashboard"></div>
  <div class="card-intro-footer" style="text-align: left; margin-bottom: 0px !important">
    The Overflowing Unaligned-fragment of CMYA5(TRIM76) was removed
  </div>
</template>
<style scoped></style>
