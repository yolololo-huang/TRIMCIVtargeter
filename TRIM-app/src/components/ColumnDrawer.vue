<script setup lang="ts">
  import columnsData from '@/assets/columns.json'

  const drawer = ref(false)
  const columns_info = columnsData.columns_info

  const ZRscore_column = {
    key: 'ZRscore',
    label: 'ZRscore',
    info: `The ZRscore is a projection-based scoring approach, where each data point is projected onto a reference line \(2y=x\) in a normalized \(x-y\) coordinate system. The projected point's distance from the origin is used as the score. The method is akin to Principal Component Analysis (PCA) but applied to a single reference line rather than finding orthogonal axes of variance. For each data point, the ZRscore is calculated as follows: Normalize \(zrank\_score\) to \([0,1]\). Let \((x=R, y=norm(zrank\_score))\). Compute the projection point \((x_p, y_p)\) on the line \(2y=x\). Compute \(t* = (x_i + 2y_i) / 5\). Find \(x_p = t*\) and \(y_p = t* / 2\). Compute \(ZRscore_i = \sqrt{x_p^2 + y_p^2}\) or directly use \(ZRscore_i = (x_i + 2y_i) / \sqrt{5}\). Use \(ZRscore_i\) as the final score for ranking.`,
  }

  // onMounted(() => {
  //   MathJax.typesetPromise()
  // })
</script>

<template>
  <el-button type="primary" class="about-column" @click="drawer = true">About columns</el-button>

  <el-drawer v-model="drawer" title="Columns Information" direction="rtl" :with-header="false">
    <div style="display: flex; justify-content: center; align-items: center">
      <span style="margin-right: 40px; font-size: large; font-weight: bold">
        Column information
      </span>
    </div>

    <div v-for="column in columns_info" :key="column.key" class="custom-checkbox">
      <div style="margin-bottom: 20px">
        <div style="font-weight: bold">{{ column.label }}</div>
        <!-- Render ZRscore_column.info with MathJax -->
        <div v-html="column.key === 'ZRscore' ? ZRscore_column.info : column.info"></div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
  .about-column {
    width: 150px;
    background-color: #1e8fffb6;
    color: rgb(70, 0, 136);
    cursor: pointer;
    margin: 0;
    font-size: 18px;
    font-weight: bold;
  }
</style>
