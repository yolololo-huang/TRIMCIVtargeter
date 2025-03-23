<script setup lang="ts">
import { Runtime, Inspector } from '@observablehq/runtime'
import define1 from '@/utils/05775bc344fcf638@146'
import { Loading } from '@element-plus/icons-vue'

onMounted(() => {
  const runtime = new Runtime()
  runtime.module(define1, (name: string) => {
    if (name === 'chart') {
      return new Inspector(document.querySelector('#observablehq-tree-of-life'))
    }
  })
})
</script>

<template>
  <el-card class="TRIMReview">
    <template #header>
      <div class="card-header">
        <span>Protein Sequence Relationship<IEpInfoFilled /></span>
      </div>
      <div class="card-header-intro">Phylogenetic tree of TRIMs' amino acid sequences.</div>
    </template>
    <div class="card-intro-footer" style="text-align: right; margin-bottom: -20px !important">
      *click the group legend to highlight group members
    </div>
    <el-row>
      <el-col :span="16"> <div id="observablehq-tree-of-life" class="tree-of-life"></div></el-col>
      <el-col
        :span="8"
        style="display: flex; justify-content: center; align-items: center; margin-top: 20px"
      >
        <div>
          <div>Construction methods:</div>
          <div>· alignment: ClustalW-2.1</div>
          <div>· model building:</div>
          <div>trimal-1.4.1; iqtree-2.2.2.6</div>
        </div>
      </el-col>
    </el-row>

    <template #footer>
      <h3>seq alignment viewer</h3>
      <div class="card-intro-footer" style="text-align: left; margin-bottom: 0px !important">
        *drag or scroll the highlighed-frame on the mini-map to go through or zoom the alignment
      </div>
      <TRIMfeatures />
    </template>
  </el-card>
</template>

<style scoped>
.tree-of-life {
  width: 100%; /* 使SVG宽度适应父容器 */
  height: 550px; /* 设置SVG的高度 */
  margin: 0 auto; /* 居中显示 */
}
.tooltip {
  position: absolute;
  background-color: rgb(255, 255, 255);
  border: 1px solid black;
  padding: 5px;
  display: none;
  pointer-events: none;
  font-size: 12px;
}
</style>
