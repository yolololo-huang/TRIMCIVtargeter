<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchResOverview } from '@/services/api'
import { drawStackedBarGraph } from '@/utils/stackedGroup_bar'
import { drawRadialBarChart } from '@/utils/radial_bar'

const loading = ref(false)
const showRadialChart = ref(false)
const loading_radial = ref(false)
const selectedRadio = ref('Predict') // 默认选中Predict item
const checklistPredict = ref(['True']) // Predict item下默认勾选 'True'
const checklistGene = ref(['deg_cal']) // gene number下的checkbox初始为空
const router = useRouter()
const colors = {
  False: 'rgba(204, 204, 204, 0.5)',
  True: 'rgba(143, 118, 255, 0.5)', //purple
  nodeg_num: 'rgba(204, 204, 204, 0.5)',
  deg_cal: 'rgba(97, 174, 209,  0.5)', //blue
  deg_num: 'rgba(97, 174, 209,  0.5)'
}

const filteredKeys = ref<string[]>([])

// 缓存数据
const cachedDatasets = ref(null)
interface RadialDataItem {
  disease: string
  TRIMs_true_geneNum: any // 根据实际数据类型修改
}

const radial_data = ref<RadialDataItem[] | null>(null)

// 获取数据并更新缓存
const fetchAndCacheData = async () => {
  loading.value = true
  if (!cachedDatasets.value) {
    cachedDatasets.value = await fetchResOverview()
  }
  loading.value = false
}
const fetchAndCacheTRIMData = async () => {
  loading_radial.value = true
  if (!radial_data.value) {
    radial_data.value = await fetchResOverview('true')
  }
  loading_radial.value = false
}

const onRadialBarClick = (TRIM, disease) => {
  router.push({
    path: '/resultbyTRIM',
    query: {
      TRIMname: TRIM,
      cancer: disease
    }
  })
}

const onBarClick = async (disease) => {
  await fetchAndCacheTRIMData()
  const filteredData = radial_data.value
    ? radial_data.value
        .filter((item) => item.disease === disease)
        .map((item) => item.TRIMs_true_geneNum)
    : []

  const radialContainer = document.querySelector('#radial-container')
  if (radialContainer) radialContainer.innerHTML = ''

  if (filteredData.length > 0) {
    showRadialChart.value = true // Show radial chart
    drawRadialBarChart('#radial-container', filteredData[0], onRadialBarClick, disease)
  } else {
    showRadialChart.value = false // Show the sun animation
  }
}

// 更新图表的方法
const updateGraph = () => {
  if (!cachedDatasets.value) return
  // 清空之前的图表内容，避免重复绘制
  const container = document.querySelector('#graph-container')
  if (container) container.innerHTML = ''
  if (selectedRadio.value === 'Predict') {
    filteredKeys.value = checklistPredict.value
  } else if (selectedRadio.value === 'Gene') {
    filteredKeys.value = checklistGene.value
  }
  drawStackedBarGraph(
    '#graph-container',
    cachedDatasets.value,
    filteredKeys.value,
    colors,
    true,
    onBarClick
  )
}

// 页面挂载时初始化
onMounted(async () => {
  await fetchAndCacheData() // 只在首次加载时请求数据
  updateGraph()
})

// 监听`selectedRadio`变化
watch(
  selectedRadio,
  () => {
    updateGraph()
  },
  { immediate: true }
)

// 监听`checklistPredict`和`checklistGene`变化
watch(
  [checklistPredict, checklistGene],
  () => {
    updateGraph()
  },
  { immediate: true }
)
</script>

<template>
  <el-row>
    <el-col :span="18">
      <!-- Predict item -->
      <el-radio v-model="selectedRadio" label="Predict">Predict item</el-radio>
      <el-checkbox-group v-model="checklistPredict" :disabled="selectedRadio !== 'Predict'">
        <el-checkbox value="True">True item</el-checkbox>
        <el-checkbox value="False">False item</el-checkbox>
      </el-checkbox-group>

      <!-- Gene number -->
      <el-radio v-model="selectedRadio" label="Gene">gene number</el-radio>
      <el-checkbox-group v-model="checklistGene" :disabled="selectedRadio !== 'Gene'">
        <el-checkbox value="deg_cal">Calculated target</el-checkbox>
        <el-checkbox value="nodeg_num">Total gene number</el-checkbox>
      </el-checkbox-group>
    </el-col>
    <el-col :span="6">
      <AnimatedSun
        v-if="!showRadialChart"
        style="position: absolute; width: 250px; height: 250px"
      />
      <div
        id="radial-container"
        style="width: 250px; height: 250px; position: relative; margin-top: -40px"
        v-loading="loading_radial"
      ></div>
    </el-col>
  </el-row>
  <div
    id="graph-container"
    style="width: 100%; height: 200px; margin-top: -70px"
    v-loading="loading"
  ></div>
</template>
