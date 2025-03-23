<script setup lang="ts">
const locale = {
  TRIMtree: 'Protein Sequence Relationship',
  TRIMheatmap: 'Structure Similarity Landscape',
  TRIMinfo: 'Classification Review'
}

const scrollTo = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <el-affix>
    <el-header>
      <AppHeader />
    </el-header>
    <el-anchor
      :offset="150"
      direction="horizontal"
      style="padding-left: 35px; padding-top: 10px"
      class="header-container"
    >
      <el-anchor-link @click="scrollTo('TRIMtree')" title="=1">
        <IEpArrowRight />{{ locale['TRIMtree'] }}
      </el-anchor-link>
      <el-anchor-link @click="scrollTo('TRIMinfo')" title="2">
        <IEpArrowRight />{{ locale['TRIMinfo'] }}
      </el-anchor-link>
      <el-anchor-link @click="scrollTo('TRIMheatmap')" title="3">
        <IEpArrowRight />{{ locale['TRIMheatmap'] }}
      </el-anchor-link>
    </el-anchor>
  </el-affix>
  <el-main>
    <el-row class="TRIMfamily">
      <!-- <el-col :span="5">
        <h1>TRIM Family</h1>
        <div class="brief-info">
          <div style="width: 500px">
            <IEpCaretRight style="color: #8c07dd" /><strong>Family:</strong> Tripartite Motif
            family; RBCC family
          </div>
          <div style="width: 300px">
            <strong><IEpCaretRight style="color: #8c07dd" />Organism:</strong> Homo sapiens
          </div>
          <div style="width: 300px">
            <IEpCaretRight style="color: #8c07dd" /><strong>Brief:</strong> TRIM proteins, with more
            than 70 present in humans, are defined as a subfamily of the RING-type E3 ubiquitin
            ligase family. They display a common domain architecture in both the N-terminal and
            C-terminal regions. <strong>Click the member to see the structure</strong>.
          </div>
          <div style="width: 500px">
            <IEpCaretRight style="color: #8c07dd" /><strong>More reviews:</strong><br />
            <router-link to="/trim-cancer">Pancancer Lanscape<IconExternalLink /></router-link
            ><br />
            <router-link to="/trim-ref">Reported targets<IconExternalLink /></router-link>
          </div>
        </div>
      </el-col> -->
      <el-col :span="19"><PDBviewer2 /></el-col>
    </el-row>

    <section id="TRIMtree" class="section">
      <TRIMtree />
    </section>
    <section id="TRIMinfo" class="section">
      <TRIMs_infoTab />
    </section>
    <section id="TRIMheatmap" class="section">
      <TRIMheatmap />
    </section>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style lang="scss" scoped>
.TRIMfamily {
  width: 1000px;
  height: auto;
  margin: 0 auto;
}

.brief-info {
  line-height: 2;
}
.section {
  scroll-margin-top: 120px; /* 偏移量，例如向上偏移 100px */
}
</style>
