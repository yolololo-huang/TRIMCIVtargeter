<script setup lang="ts">
import { setupHeatmap } from '@/utils/echartsSetup'
import { TRIMorder } from '@/assets/TRIMorder'
import { getTMscore } from '@/services/api'

const selectedChart = ref('chart_TRIMCtm')
const chart_TRIMtm = ref(null)
const chart_TRIMCtm = ref(null)

const TRIMs_TMSCORE = ref([])
const TRIMs_C_TMSCORE = ref([])

const fetchData = async () => {
  try {
    const data = await getTMscore()

    // 处理 TRIMs_TMSCORE 数据
    TRIMs_TMSCORE.value = data.map((item) => {
      const { rmsd_c, tmscore_c, ...rest } = item
      return rest
    })

    // 处理 TRIMs_C_TMSCORE 数据
    TRIMs_C_TMSCORE.value = data
      .filter((item) => item.rmsd_c !== null && item.tmscore_c !== null)
      .map((item) => {
        const { rmsd_c, tmscore_c, ...rest } = item
        return {
          ...rest,
          rmsd: rmsd_c,
          tmscore: tmscore_c
        }
      })
    drawChart()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
const drawChart = () => {
  if (selectedChart.value === 'chart_TRIMtm') {
    nextTick(() => {
      setupHeatmap(chart_TRIMtm.value, TRIMs_TMSCORE.value, TRIMorder)
    })
  } else if (selectedChart.value === 'chart_TRIMCtm') {
    nextTick(() => {
      setupHeatmap(chart_TRIMCtm.value, TRIMs_C_TMSCORE.value, TRIMorder)
    })
  }
}

watch(selectedChart, drawChart)

onMounted(() => {
  fetchData()
})
</script>

<template>
  <el-card class="TRIMReview">
    <template #header>
      <div class="card-header">
        <span>Structure Similarity Landscape</span>
      </div>
      <div class="card-header-intro">
        PDB Structure similarity measured by TMscore. The C terminal TRIM was splited after the N-C
        split position. TRIM pairs with a TMscore >0.5 are mostly in the same fold.
      </div>
    </template>
    <el-radio-group v-model="selectedChart">
      <el-radio :label="'chart_TRIMCtm'">C terminal TRIM similarity</el-radio>
      <el-radio :label="'chart_TRIMtm'">Entire TRIM similarity</el-radio>
    </el-radio-group>
    <div class="card-intro-footer" style="text-align: right; margin-top: -20px !important">
      *drag the colorbar handle to adjust the heatmap
    </div>
    <div
      v-show="selectedChart === 'chart_TRIMtm'"
      ref="chart_TRIMtm"
      class="heatmap"
      style="width: auto; height: 800px"
    ></div>
    <div
      v-show="selectedChart === 'chart_TRIMCtm'"
      ref="chart_TRIMCtm"
      class="heatmap"
      style="width: auto; height: 800px"
    ></div>
    <div class="card-intro-footer">
      *handle the slider or scroll to zoom in and out, drag to pan;
    </div>
    <!-- <template #footer
      >list2:TRIM* substrate/interactor disease/cancer and reference and link</template
    > -->
  </el-card>
</template>

<style lang="scss" scoped>
.heatmap {
  margin: 0px;
}
</style>
