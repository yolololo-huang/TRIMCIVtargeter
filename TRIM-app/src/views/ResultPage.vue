<script setup lang="ts">
import { fetchResult } from '@/services/api'
import columnsData from '@/assets/columns.json'
import SankeyGO from '@/components/SankeyGo.vue'
import { RadarZR } from '@/utils/radarZR.js'
import { RadarR } from '@/utils/radarR.js'

const showGocard = ref(true)
const showZcard = ref(true)
const showRcard = ref(true)
const toggleGoCard = () => {
  showGocard.value = !showGocard.value
}
const toggleZCard = () => {
  showZcard.value = !showZcard.value
}
const toggleRCard = () => {
  showRcard.value = !showRcard.value
}

const columns_info = columnsData.columns_info
const route = useRoute()
const { geneName, uniprotId, cancer } = route.query
interface ResultRow {
  gene_name: string
  logFC: number
  R: number
  TRIM: string
  zrank_score: number
  ZRscore: number
  predicted_CIV: boolean
  predicted_proba: number
  source: string
  MF: string
  BP: string
  CC: string
  [key: string]: any // Add this line to allow any additional properties
}

const resultData = ref<ResultRow[]>([])
const drawData = ref<ResultRow[]>([])
const drawValue = ref(true)
const trimName = ref<string>('')
const defaultColumns = [
  'gene_name',
  'logFC',
  'R',
  'TRIM',
  'zrank_score',
  'predicted_CIV',
  'predicted_proba',
  'ZRscore',
  'MF'
]
const selectedColumns = ref<string[]>([...defaultColumns])

const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
//默认值，根据selectedFilter更新filterdata
const selectedFilters = ref<{}>({
  gene_name: [geneName]
})

const uniqueValues = ref<{}>({})
const loadingOptions = ref(false)

const defaultFilters = () => {
  selectedFilters.value = {
    ...selectedFilters.value,
    TRIM: Array.from(new Set(resultData.value.map((row) => row.TRIM))),
    predicted_CIV: Array.from(new Set(resultData.value.map((row) => row.predicted_CIV))),
    source: Array.from(new Set(resultData.value.map((row) => row.source))),
    dataset: Array.from(new Set(resultData.value.map((row) => row.dataset))),
    disease: Array.from(new Set(resultData.value.map((row) => row.disease)))
  }
  selectedFilters.value = {
    ...selectedFilters.value,
    MF: ['pairs', 'no pair'],
    BP: ['pairs', 'no pair'],
    CC: ['pairs', 'no pair']
  }

  const zrankScores = resultData.value.map((row) => row.zrank_score)
  const predictedProbas = resultData.value
    .map((row) => Number(row.predicted_proba))
    .filter((val) => !isNaN(val))
  const logFCs = resultData.value.map((row) => Number(row.logFC)).filter((val) => !isNaN(val))
  const Rs = resultData.value.map((row) => Number(row.R)).filter((val) => !isNaN(val))
  const ZRscores = resultData.value.map((row) => row.ZRscore)

  selectedFilters.value = {
    ...selectedFilters.value,
    zrank_score: [Math.min(...zrankScores), Math.max(...zrankScores)],
    predicted_proba: [Math.min(...predictedProbas), Math.max(...predictedProbas)], // 有null
    logFC: [Math.min(...logFCs), Math.max(...logFCs)],
    R: [Math.min(...Rs), Math.max(...Rs)],
    ZRscore: [Math.min(...ZRscores), Math.max(...ZRscores)]
  }

  uniqueValues.value = {
    ...uniqueValues.value,
    zrank_score: {
      min: Math.min(...zrankScores),
      max: Math.max(...zrankScores),
      marks: {
        [Math.min(...zrankScores)]: Math.min(...zrankScores).toString(),
        [Math.max(...zrankScores)]: Math.max(...zrankScores).toString()
      },
      step: 1
    },
    logFC: {
      min: Math.min(...logFCs),
      max: Math.max(...logFCs),
      marks: {
        [Math.min(...logFCs)]: Math.min(...logFCs).toString(),
        0: '0',
        [Math.max(...logFCs)]: Math.max(...logFCs).toString()
      },
      step: 0.1
    },
    R: {
      min: -1,
      max: 1,
      marks: {
        '-1': '-1',
        '0': '0',
        '1': '1'
      },
      step: 0.1
    },
    ZRscore: {
      min: 0,
      max: 100,
      marks: {
        '0': '0',
        '50': '50',
        '100': '100'
      },
      step: 1
    },
    predicted_proba: {
      min: 0,
      max: 1,
      marks: {
        '0': '0',
        '0.5': '0.5',
        '1': '1'
      },
      step: 0.1
    }
  }
}

const radarZR = (data) => {
  const svgNode = RadarZR(data, { width: 350, height: 350 })
  const radarChartElement = document.getElementById('radar_zr')
  if (radarChartElement) {
    radarChartElement.appendChild(svgNode)
  }
}
const radarR = (data) => {
  const svgNode = RadarR(data, { width: 350, height: 350 })
  const radarChartElement = document.getElementById('radar_r')
  if (radarChartElement) {
    radarChartElement.appendChild(svgNode)
  }
}

const downloadResultData = () => {
  try {
    const headers = Object.keys(resultData.value[0])
    const tsvHeaders = headers.join('\t')
    const tsvRows = resultData.value.map((row) => Object.values(row).join('\t')).join('\n')
    const tsvContent = `${tsvHeaders}\n${tsvRows}`
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = geneName + '_' + cancer + '.tsv'
    link.click()
  } catch (error) {
    console.error('Error downloading result data:', error)
  }
}

const formatValue = (value: any): string => {
  if (typeof value === 'number') {
    return value.toFixed(4)
  }
  return value
}

const cellStyle = (data) => {
  if (data.row.reported) {
    return {
      color: '#000',
      background: '#cce6ff'
    }
  }
  if (data.row.predicted_CIV === '0') {
    return {
      color: 'rgba(204, 204, 204, 0.5)'
    }
  }
}
const resetFilters = () => {
  defaultFilters()
  selectedColumns.value = [...defaultColumns]
}

const isMatch = (key, filterValue, rowValue) => {
  if (key === 'BP' || key === 'CC' || key === 'MF') {
    if (filterValue.includes('pairs') && filterValue.includes('no pair')) {
      return true // 保留所有值
    } else if (filterValue.includes('pairs')) {
      return rowValue !== undefined && rowValue !== null // 保留非空值
    } else if (filterValue.includes('no pair')) {
      return rowValue === undefined || rowValue === null // 保留空值
    }
  } else if (typeof filterValue[0] === 'number') {
    // 如果筛选条件是范围，空值直接保留，不参与筛选
    return (
      rowValue === undefined ||
      rowValue === null ||
      (rowValue >= filterValue[0] && rowValue <= filterValue[1])
    )
  } else {
    // 如果筛选条件是数组，空值直接保留
    return (
      rowValue === undefined ||
      rowValue === null ||
      filterValue.length === 0 ||
      filterValue.includes(rowValue)
    )
  }
}

// 不能用foreach
const filteredData = computed(() => {
  return resultData.value.filter((row) => {
    // 使用 every 确保所有 key 都匹配
    return Object.keys(selectedFilters.value).every((key) => {
      if (!isMatch(key, selectedFilters.value[key], row[key])) {
        return false // 如果某个 key 不匹配，提前返回 false
      }
      return true // 当前 key 匹配
    })
  })
})

const fetchSelectedOptions = async (columnkey: string) => {
  loadingOptions.value = true
  //对于el-selected
  const selectColumnValues = Array.from(new Set(resultData.value.map((row) => row[columnkey])))
  uniqueValues.value[columnkey] = selectColumnValues
  loadingOptions.value = false
}

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
}

const scaledZRscore = (response) => {
  // Normalize zrank_score for row.predicted_CIV === '1' and === null
  const zrankScores = response.result
    .filter((row) => row.predicted_CIV === '1' || row.predicted_CIV === null)
    .map((row) => Math.abs(row.zrank_score))
  const zrankMin = Math.min(...zrankScores)
  const zrankMax = Math.max(...zrankScores)

  // Define the scaling factor
  const maxZRscore = 3 / Math.sqrt(5) // Approx 1.34164
  const scalingFactor = 100 / maxZRscore // Approx 74.535
  return response.result.map((row) => {
    if (row.predicted_CIV === '1' || row.predicted_CIV === null) {
      const zrankNorm = (Math.abs(row.zrank_score) - zrankMin) / (zrankMax - zrankMin)
      const x = row.R // x_i = R 没有normalize。
      const y = zrankNorm // y_i = norm(zrank_score)
      // Projection calculations
      const x_p = (x + 2 * y) / 5
      const y_p = (x + 2 * y) / 10

      // Compute ZRscore and scale
      const zrscore = Math.sqrt(x_p ** 2 + y_p ** 2) //d
      row.ZRscore = zrscore * scalingFactor // Scale to [0, 100]
    } else {
      row.ZRscore = null // Handle non-applicable rows
    }
    return row
  })
}

const drawRadarCharts = () => {
  // Clear previous charts
  const radarZRChartElement = document.getElementById('radar_zr')
  if (radarZRChartElement) {
    radarZRChartElement.innerHTML = ''
  }
  const radarRChartElement = document.getElementById('radar_r')
  if (radarRChartElement) {
    radarRChartElement.innerHTML = ''
  }

  const radar_zr = drawData.value.map((item) => ({
    name: item.gene_name,
    key: item.TRIM,
    value: item.zrank_score
  }))
  const radar_r = drawData.value.map((item) => ({
    gene_name: item.gene_name,
    name: item.dataset,
    key: item.TRIM,
    value: item.R
  }))
  radarZR(radar_zr)
  radarR(radar_r)
}
watch(drawValue, (newValue) => {
  if (newValue === true) {
    drawData.value = resultData.value.filter(
      (item) =>
        item.gene_name &&
        item.TRIM &&
        item.zrank_score !== undefined &&
        item.R !== undefined &&
        item.predicted_CIV !== false &&
        item.group === 'CIV'
    )
    trimName.value = resultData.value
      .filter((item) => item.predicted_CIV !== false && item.group === 'CIV')
      .map((item) => item.TRIM)
      .join(',')
  } else {
    drawData.value = resultData.value.filter(
      (item) =>
        item.gene_name &&
        item.TRIM &&
        item.zrank_score !== undefined &&
        item.R !== undefined &&
        item.predicted_CIV !== false
    )
    trimName.value = resultData.value.map((item) => item.TRIM).join(',')
  }

  drawRadarCharts()
})
const getCircleClass = (key) => {
  switch (key) {
    case 'MF':
      return 'circle-background mf-circle'
    case 'BP':
      return 'circle-background bp-circle'
    case 'CC':
      return 'circle-background cc-circle'
    default:
      return 'circle-background'
  }
}
const getUniprotLink = (key, row) => {
  if (key === 'gene_name') {
    return `https://www.uniprot.org/uniprotkb/${row.target_uid}/entry`
  } else if (key === 'TRIM') {
    return `https://www.uniprot.org/uniprotkb/${row.TRIM_uid}/entry`
  }
  return '#'
}
onMounted(async () => {
  try {
    loading.value = true
    const response = await fetchResult({ geneName, uniprotId, cancer })
    resultData.value = scaledZRscore(response)
      .map((row) => {
        if (row.predicted_CIV === '1') {
          row.predicted_CIV = true
        } else if (row.predicted_CIV === '0') {
          row.predicted_CIV = false
        } else if (row.predicted_CIV === null) {
          row.predicted_CIV = row.reported
        }
        return row
      })
      .sort((a, b) => {
        const order = [null, true, false]
        return order.indexOf(a.predicted_CIV) - order.indexOf(b.predicted_CIV)
      })
    defaultFilters()
    drawData.value = resultData.value.filter(
      (item) =>
        item.gene_name &&
        item.TRIM &&
        item.zrank_score !== undefined &&
        item.R !== undefined &&
        item.predicted_CIV !== false &&
        item.group === 'CIV'
    )
    trimName.value = resultData.value
      .filter((item) => item.predicted_CIV !== false && item.group === 'CIV')
      .map((item) => item.TRIM)
      .join(',')

    drawRadarCharts()
    const figures = document.querySelectorAll('figure')
    // 遍历每个 <figure> 元素并设置样式
    figures.forEach((figure) => {
      figure.style.display = 'flex'
      figure.style.flexDirection = 'column'
      figure.style.justifyContent = 'center'
      figure.style.alignItems = 'center'
      figure.style.margin = '0' // 可选：移除默认的外边距

      // 可选：确保图片不会超出容器宽度
      const img = figure.querySelector('img')
      if (img) {
        img.style.maxWidth = '100%'
      }
    })
  } catch (error) {
    console.error('Error fetching result data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <div class="result-layout">
    <h2 style="text-align: center">
      Possible TRIMCIV members targeting {{ geneName }} ({{ uniprotId }}) in
      {{
        cancer
          ? Array.from(new Set((cancer as string).split(',').map((part) => part.split('_')[0])))
              .map((uniquePart) => uniquePart.toUpperCase())
              .join(', ')
          : ''
      }}
    </h2>
    <el-row>
      <el-col :span="5">
        <el-card style="margin-right: 20px; margin-top: 30px; padding: 10px; margin-left: 20px">
          <div style="font-size: large; font-weight: bold; margin: 10px">
            Filter menu for Result Table
          </div>
          <div style="display: flex">
            <el-button @click="resetFilters">Reset</el-button>
            <el-button @click="selectedColumns = Object.keys(resultData[0])">Select All</el-button>
          </div>
          <div style="margin: 0; padding: 20px">
            <div
              v-for="columnkey in [
                'gene_name',
                'TRIM',
                'predicted_CIV',
                'source',
                'dataset',
                'disease'
              ]"
              :key="columnkey"
            >
              <el-checkbox-group v-model="selectedColumns">
                <el-checkbox :key="columnkey" :label="columnkey">
                  {{ columns_info.find((column) => column.key === columnkey)?.label || columnkey }}
                </el-checkbox>
              </el-checkbox-group>
              <el-select
                multiple
                filterable
                :disabled="!selectedColumns.includes(columnkey) || columnkey === 'gene_name'"
                :loading="loadingOptions"
                @visible-change="() => fetchSelectedOptions(columnkey)"
                v-model="selectedFilters[columnkey]"
              >
                <el-option
                  v-for="name in uniqueValues[columnkey]"
                  :key="name"
                  :label="name"
                  :value="name"
                ></el-option>
              </el-select>
            </div>

            <div v-for="columnkey in ['MF', 'BP', 'CC']" :key="columnkey">
              <el-checkbox-group v-model="selectedColumns">
                <el-checkbox :label="columnkey"></el-checkbox>
              </el-checkbox-group>
              <el-checkbox-group
                v-model="selectedFilters[columnkey]"
                :disabled="!selectedColumns.includes(columnkey)"
                style="margin-left: 40px"
              >
                <el-checkbox :label="'pairs'">Pairs</el-checkbox>
                <el-checkbox :label="'no pair'">No Pair</el-checkbox>
              </el-checkbox-group>
            </div>

            <div
              v-for="columnkey in ['logFC', 'R', 'predicted_proba', 'zrank_score', 'ZRscore']"
              :key="columnkey"
            >
              <el-checkbox-group v-model="selectedColumns">
                <el-checkbox :key="columnkey" :label="columnkey">
                  {{ columns_info.find((column) => column.key === columnkey)?.label || columnkey }}
                </el-checkbox>
              </el-checkbox-group>

              <el-slider
                :step="uniqueValues[columnkey]?.step"
                :disabled="!selectedColumns.includes(columnkey)"
                v-model="selectedFilters[columnkey]"
                :min="uniqueValues[columnkey]?.min"
                :max="uniqueValues[columnkey]?.max"
                :marks="uniqueValues[columnkey]?.marks"
                range
                style="margin-bottom: 20px"
              ></el-slider>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="showGocard ? 14 : 17">
        <div class="radar-switch">
          <p style="font-weight: bold; margin-right: 10px">Adjusting graph :</p>
          <el-switch
            size="large"
            v-model="drawValue"
            active-text="TRIMCIV Predicted as True"
            inactive-text="All TRIM in result"
          />
        </div>
        <el-row>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header" style="padding: 10px" @click="toggleRCard">
                  <template v-if="showRcard">
                    <IEpCaretBottom />
                  </template>
                  <template v-else>
                    <IEpCaretRight />
                  </template>
                  <span>Correlation in datasets</span>
                </div>
              </template>
              <div class="card-pics" v-show="showRcard">
                Expression correlation effecients between {{ geneName }} and TRIMCIV members in
                different datasets. Visit <router-link to="/resource">Data</router-link> for
                datasets information
                <div
                  id="radar_r"
                  v-loading="loading"
                  style="
                    display: flex;
                    justify-content: center;
                    margin-top: 0px;
                    margin-bottom: 10px;
                  "
                ></div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header" style="padding: 10px" @click="toggleZCard">
                  <template v-if="showZcard">
                    <IEpCaretBottom />
                  </template>
                  <template v-else><IEpCaretRight /></template><span>Physical Affinity</span>
                </div>
              </template>
              <div class="card-pics" v-show="showZcard">
                The affinity degree between {{ geneName }} and TRIMCIV members was measured by
                <a href="https://zlab.wenglab.org/zdock/index.shtml">Zdock-Zrank</a>,The smaller
                score the stronger affinity.
                <div
                  id="radar_zr"
                  v-loading="loading"
                  style="
                    display: flex;
                    justify-content: center;
                    margin-top: 0px;
                    margin-bottom: 10px;
                  "
                ></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <h2>Result table for potential TRIM pairs</h2>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: -20px;
          "
        >
          <p>
            <span style="background-color: #cce6ff; border: 1px solid black"
              >The blue background items</span
            >
            represent the reported TRIM-target pairs. Click the <ColumnDrawer /> for column
            information
          </p>
          <div class="download-icon" @click="downloadResultData"><IEpDownload  />Download TSV</div>
        </div>
        <el-table
          :cell-style="cellStyle"
          :header-cell-style="{
            background: 'rgb(206, 206, 250)',
            color: '#000000',
            borderBottom: '2px solid #000000'
          }"
          :data="paginatedData"
          class="custom-table"
          :loading="loading"
          element-loading-text="Loading...take a break"
        >
          <el-table-column
            sortable
            v-for="key in selectedColumns"
            :key="key"
            :prop="key"
            :label="columns_info.find((column) => column.key === key)?.label || key"
            :min-width="110"
          >
            <template #default="{ row, column }">
              <div>
                <template v-if="key === 'predicted_proba'">
                  {{
                    row[key] !== null && row[key] !== undefined
                      ? (row[key] * 100).toFixed(2) + '%'
                      : ''
                  }}
                </template>
                <template v-else-if="['MF', 'BP', 'CC'].includes(key)">
                  <div v-if="row[key]">
                    <a
                      v-for="(item, index) in row[key].split(',')"
                      :key="index"
                      :href="`https://www.ebi.ac.uk/QuickGO/term/${item.trim()}`"
                      target="_blank"
                      :class="getCircleClass(key)"
                    >
                      {{ item }}
                    </a>
                  </div>
                </template>
                <template v-else-if="['gene_name', 'TRIM'].includes(key)">
                  <div v-if="row[key]">
                    <a
                      :href="getUniprotLink(key, row)"
                      target="_blank"
                      :class="getCircleClass(key)"
                    >
                      {{ row[key] }}
                    </a>
                  </div>
                </template>
                <template v-else>
                  {{ formatValue(row[column.property]) }}
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
          style="justify-content: center; margin-top: 10px"
        />
      </el-col>
      <el-col :span="showGocard ? 5 : 2">
        <el-card class="custom-card">
          <template #header>
            <div class="card-header" style="padding: 10px" @click="toggleGoCard">
              <template v-if="showGocard">
                <IEpCaretBottom />
              </template>
              <template v-else> <IEpCaretRight /> </template><span>GO pair</span>
            </div>
          </template>
          <div class="card-pics" v-show="showGocard">
            <div>GO pairs between {{ geneName }} and TRIMCIV members.</div>
            <SankeyGO
              v-if="trimName && trimName.length > 0"
              :symbol1="geneName as string"
              :symbol2="trimName"
              :symbol3="'GN'"
              :key="trimName.length"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>

  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style scoped>
.custom-card {
  margin-top: 35px;
  margin-left: 20px;
  margin-right: 20px;
}

.el-card {
  --el-card-padding: 0px;
}
.el-card:hover {
  box-shadow: 0 0px 20px rgba(143, 118, 255, 0.459);
  transition: box-shadow 0.3s ease-in-out;
}

.card-header {
  cursor: pointer;
}
</style>
