<script setup lang="ts">
const locale = {
  DEGLanscape: 'DEGs Landscape',
  CorLanscape: 'Correlation Landscape',
  DataSource: 'Data sources'
}
const activeAnchor = ref('')

const handleAnchorClick = (id: string) => {
  activeAnchor.value = id

  const element = document.getElementById(id)
  if (element) {
    const topOffset = 120 // 偏移量，例如向上偏移 100px
    const elementPosition = element.offsetTop
    const offsetPosition = elementPosition - topOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <el-affix>
    <el-header>
      <AppHeader />
    </el-header>
    <el-anchor
      direction="horizontal"
      style="padding-left: 35px; padding-top: 10px"
      class="header-container"
    >
      <el-anchor-link @click="handleAnchorClick('DEGLanscape')" title="1">
        <IEpArrowRight />{{ locale['DEGLanscape'] }}
      </el-anchor-link>
      <el-anchor-link @click="handleAnchorClick('CorLanscape')" title="2">
        <IEpArrowRight />{{ locale['CorLanscape'] }}
      </el-anchor-link>
      <el-anchor-link @click="handleAnchorClick('DataSource')" title="3">
        <IEpArrowRight />{{ locale['DataSource'] }}
      </el-anchor-link>
    </el-anchor>
  </el-affix>
  <el-main>
    <section id="DEGLanscape">
      <DegPlot />
    </section>
    <hr />
    <section id="CorLanscape">
      <TRIMcorTab />
    </section>
    <hr />
    <section id="DataSource">
      <h1>Data sources</h1>
      For the source of datasets, visit <router-link to="/resource">Data</router-link>
    </section>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style lang="scss" scoped>
.section {
  scroll-margin-top: 200px; /* 偏移量，例如向上偏移 100px */
}
</style>
