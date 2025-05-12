<script setup lang="ts">
  import { fetchResbyTRIM } from '@/services/api'
  import columnsData from '@/assets/columns.json'
  import SankeyGO from '@/components/SankeyGo.vue'
  import { RadarZR } from '@/utils/radarZR'
  import { RadarR } from '@/utils/radarR'

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

  const sortProp = ref<string>('')
  const sortOrder = ref<'ascending' | 'descending'>('ascending')

  const columns_info = columnsData.columns_info
  const route = useRoute()
  const { TRIMname, uniprotId, cancer } = route.query
  interface ResultRow {
    gene_name: string
    logFC: number
    R: number
    TRIM: string
    zrank_score: number
    ZRscore: number
    prediction: number
    probability: number
    source: string
    MF: string
    BP: string
    CC: string
    [key: string]: any // Add this line to allow any additional properties
  }
  const resultData = ref<ResultRow[]>([])
  const drawData = ref<ResultRow[]>([])
  const topTargets = ref<string>('')
  const defaultColumns = [
    'gene_name',
    'logFC',
    'R',
    'TRIM',
    'zrank_score',
    'prediction',
    'ZRscore',
    'probability',
    'MF',
  ]
  const selectedColumns = ref<string[]>([...defaultColumns])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)
  const selectedFilters = ref<{}>({})

  const uniqueValues = ref<{}>({})
  const loadingOptions = ref(false)

  const defaultFilters = () => {
    selectedFilters.value = {
      ...selectedFilters.value,
      TRIM: Array.from(new Set(resultData.value.map((row) => row.TRIM))),
      prediction: Array.from(new Set(resultData.value.map((row) => row.prediction))),
      source: Array.from(new Set(resultData.value.map((row) => row.source))),
      dataset: Array.from(new Set(resultData.value.map((row) => row.dataset))),
      disease: Array.from(new Set(resultData.value.map((row) => row.disease))),
    }
    selectedFilters.value = {
      ...selectedFilters.value,
      MF: ['pairs', 'no pair'],
      BP: ['pairs', 'no pair'],
      CC: ['pairs', 'no pair'],
    }

    const zrankScores = resultData.value.map((row) => row.zrank_score)
    const predictedProbas = resultData.value
      .map((row) => Number(row.probability))
      .filter((val) => !isNaN(val))
    const logFCs = resultData.value.map((row) => Number(row.logFC)).filter((val) => !isNaN(val))
    const Rs = resultData.value.map((row) => Number(row.R)).filter((val) => !isNaN(val))
    const ZRscores = resultData.value.map((row) => row.ZRscore)

    selectedFilters.value = {
      ...selectedFilters.value,
      zrank_score: [Math.min(...zrankScores), Math.max(...zrankScores)],
      probability: [Math.min(...predictedProbas), Math.max(...predictedProbas)], // 有null
      logFC: [Math.min(...logFCs), Math.max(...logFCs)],
      R: [Math.min(...Rs), Math.max(...Rs)],
      ZRscore: [Math.min(...ZRscores), Math.max(...ZRscores)],
    }

    uniqueValues.value = {
      ...uniqueValues.value,
      zrank_score: {
        min: Math.min(...zrankScores),
        max: Math.max(...zrankScores),
        marks: {
          [Math.min(...zrankScores)]: Math.min(...zrankScores).toString(),
          [Math.max(...zrankScores)]: Math.max(...zrankScores).toString(),
        },
        step: 1,
      },
      logFC: {
        min: Math.min(...logFCs),
        max: Math.max(...logFCs),
        marks: {
          [Math.min(...logFCs)]: Math.min(...logFCs).toString(),
          0: '0',
          [Math.max(...logFCs)]: Math.max(...logFCs).toString(),
        },
        step: 0.1,
      },
      R: {
        min: -1,
        max: 1,
        marks: {
          '-1': '-1',
          '0': '0',
          '1': '1',
        },
        step: 0.1,
      },
      ZRscore: {
        min: 0,
        max: 100,
        marks: {
          '0': '0',
          '50': '50',
          '100': '100',
        },
        step: 1,
      },
      probability: {
        min: 0,
        max: 1,
        marks: {
          '0': '0',
          '0.5': '0.5',
          '1': '1',
        },
        step: 0.1,
      },
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
      console.log('start downloading')
      const headers = Object.keys(resultData.value[0])
      const tsvHeaders = headers.join('\t')
      const tsvRows = resultData.value.map((row) => Object.values(row).join('\t')).join('\n')
      const tsvContent = `${tsvHeaders}\n${tsvRows}`
      const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = TRIMname + '_' + cancer + '.tsv'
      link.click()
    } catch (error) {
      console.error('Error downloading result data:', error)
    }
  }
  const formatValue = (value: any): string => {
    if (value === 'None' || value === null) {
      return '' // Replace 'None', null, or undefined with empty string
    }
    if (typeof value === 'number') {
      return value.toFixed(4)
    }
    return value.toString() // Ensure we return a string for all other cases
  }

  const cellStyle = (data) => {
    if (data.row.reported !== 'None') {
      return {
        color: '#000',
        background: '#cce6ff',
      }
    }
    if (data.row.prediction === 0) {
      return {
        color: 'rgba(204, 204, 204, 0.5)',
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
        return rowValue !== 'None'
      } else if (filterValue.includes('no pair')) {
        return rowValue === 'None'
      }
    } else if (typeof filterValue[0] === 'number') {
      // 如果筛选条件是范围，空值直接保留，不参与筛选
      return rowValue === 'None' || (rowValue >= filterValue[0] && rowValue <= filterValue[1])
    } else {
      // 如果筛选条件是数组，空值直接保留
      return rowValue === 'None' || filterValue.length === 0 || filterValue.includes(rowValue)
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
    return sortedData.value.slice(start, end)
  })

  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1 //reset to first page
  }

  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
  }

  const sortedData = computed(() => {
    if (!sortProp.value) return filteredData.value

    return [...filteredData.value].sort((a, b) => {
      const aValue = a[sortProp.value]
      const bValue = b[sortProp.value]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder.value === 'ascending' ? aValue - bValue : bValue - aValue
      }

      // For string comparison
      const strA = String(aValue || '').toLowerCase()
      const strB = String(bValue || '').toLowerCase()

      return sortOrder.value === 'ascending' ? strA.localeCompare(strB) : strB.localeCompare(strA)
    })
  })
  const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
    sortProp.value = prop
    sortOrder.value = order as 'ascending' | 'descending'
    currentPage.value = 1 // Reset to first page when sorting changes
  }
  const scaledZRscore = (response) => {
    // Normalize zrank_score for row.prediction === '1' and === null
    const zrankScores = response.result
      .filter((row) => row.prediction === 1)
      .map((row) => Math.abs(row.zrank_score))
    const zrankMin = Math.min(...zrankScores)
    const zrankMax = Math.max(...zrankScores)

    // Define the scaling factor
    const maxZRscore = 3 / Math.sqrt(5) // Approx 1.34164
    const scalingFactor = 100 / maxZRscore // Approx 74.535
    return response.result.map((row) => {
      if (row.prediction === 1) {
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
  watch(filteredData, (newFilteredData) => {
    const uniqueGN = [
      ...new Set(
        newFilteredData
          .filter((item) => item.zrank_score !== 0 && item.prediction !== null && item.VALUE === 1)
          .sort((a, b) => b.ZRscore - a.ZRscore)
          .map((item) => item.gene_name)
      ),
    ].slice(0, Math.min(20, newFilteredData.length))

    // Update topTargets reactively
    const newTopTargets = uniqueGN.join(',')
    if (topTargets.value !== newTopTargets) {
      topTargets.value = newTopTargets
    }

    drawData.value = resultData.value.filter((item) => uniqueGN.includes(item.gene_name))

    // Prepare radar data and redraw
    updateRadarCharts(drawData.value)
  })

  const updateRadarCharts = (data) => {
    const radar_zr = data
      .filter(
        (item) =>
          item.gene_name && item.TRIM && item.zrank_score !== undefined && item.R !== undefined
      )
      .map((item) => ({
        name: item.TRIM,
        key: item.gene_name,
        value: item.zrank_score,
      }))
      .reduce((acc, current) => {
        const existing = acc.find((item) => item.name === current.name && item.key === current.key)
        return existing ? acc : acc.concat([current])
      }, [])

    const radar_r = data
      .filter(
        (item) =>
          item.gene_name && item.TRIM && item.zrank_score !== undefined && item.R !== undefined
      )
      .map((item) => ({
        gene_name: item.TRIM,
        name: item.dataset,
        key: item.gene_name,
        value: item.R,
      }))

    // Clear and redraw radar charts
    const radarZRElement = document.getElementById('radar_zr')
    if (radarZRElement) radarZRElement.innerHTML = ''
    const radarRElement = document.getElementById('radar_r')
    if (radarRElement) radarRElement.innerHTML = ''

    radarZR(radar_zr)
    radarR(radar_r)
  }
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
      const response = await fetchResbyTRIM({ TRIMname, uniprotId, cancer })
      resultData.value = scaledZRscore(response)
        .map((row) => {
          if (row.reported !== 'None') {
            row.prediction = row.reported
          } else if (row.prediction === 0) {
            row.prediction = false
          } else if (row.prediction === 1) {
            row.prediction = true
          }
          return row
        })
        .sort((a, b) => {
          const order = ['None', true, false]
          return order.indexOf(a.prediction) - order.indexOf(b.prediction)
        })
      defaultFilters()

      const figures = document.querySelectorAll('figure')

      // 遍历每个 <figure> 元素并设置样式
      figures.forEach((figure) => {
        figure.style.display = 'flex'
        figure.style.flexDirection = 'column'
        figure.style.justifyContent = 'center'
        figure.style.alignItems = 'center'
        figure.style.margin = '0' // 可选：移除默认的外边距

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
      Possible targets of {{ TRIMname }} in
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
        <el-card style="margin-right: 20px; padding: 10px; margin-left: 20px">
          <div style="font-size: large; font-weight: bold; margin: 10px">Data filter menu</div>
          <div style="display: flex">
            <el-button @click="resetFilters">Reset</el-button>
            <el-button @click="selectedColumns = Object.keys(resultData[0])">Select All</el-button>
          </div>
          <div style="margin: 0; padding: 20px">
            <div
              v-for="columnkey in [
                'gene_name',
                'TRIM',
                'prediction',
                'source',
                'dataset',
                'disease',
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
                :disabled="!selectedColumns.includes(columnkey) || columnkey === 'TRIM'"
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
              v-for="columnkey in ['logFC', 'R', 'probability', 'zrank_score', 'ZRscore']"
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
                Expression correlation effecients between {{ TRIMname }} and top predicted-targtes
                in different datasets. Visit <router-link to="/resource">Data</router-link> for
                datasets information.
                <div
                  id="radar_r"
                  v-loading="loading"
                  style="
                    display: flex;
                    justify-content: center;
                    margin-top: -10px;
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
                  <template v-else>
                    <IEpCaretRight />
                  </template>
                  <span>Physical Affinity</span>
                </div>
              </template>
              <div class="card-pics" v-show="showZcard">
                The affinity degree between {{ TRIMname }} and top predicted-targtes was measured by
                <a href="https://zlab.wenglab.org/zdock/index.shtml">Zdock-Zrank</a>, The smaller
                score the stronger affinity.
                <div
                  id="radar_zr"
                  v-loading="loading"
                  style="
                    display: flex;
                    justify-content: center;
                    margin-top: -10px;
                    margin-bottom: 10px;
                  "
                ></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <h2>Result tabel for potential target pairs</h2>
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
          <div class="download-icon" @click="downloadResultData"><IEpDownload />Download TSV</div>
        </div>
        <el-table
          :cell-style="cellStyle"
          :data="paginatedData"
          class="custom-table"
          :loading="loading"
          :header-cell-style="{
            background: 'rgb(206, 206, 250)',
            color: '#000000',
            borderBottom: '2px solid #000000',
          }"
          element-loading-text="Loading...take a break"
          @sort-change="handleSortChange"
        >
          <el-table-column
            sortable="custom"
            v-for="key in selectedColumns"
            :key="key"
            :prop="key"
            :label="columns_info.find((column) => column.key === key)?.label || key"
            :min-width="110"
          >
            <template #default="{ row, column }">
              <div>
                <template v-if="key === 'probability'">
                  {{ row['reported'] === 'None' ? (row[key] * 100).toFixed(2) + '%' : '' }}
                </template>
                <template v-else-if="['MF', 'BP', 'CC'].includes(key) && row[key] !== 'None'">
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
              <template v-else>
                <IEpCaretRight />
              </template>
              <span>GO pair</span>
            </div>
          </template>
          <div class="card-pics" v-show="showGocard">
            <div>GO pairs between {{ TRIMname }} and top 20 possible targets</div>
            <SankeyGO
              v-if="topTargets && topTargets.length > 0"
              :symbol1="topTargets"
              :symbol2="TRIMname as string"
              :symbol3="'TRIM'"
              :key="topTargets.length"
              style="display: flex; justify-content: center; align-items: center; margin-top: 15px"
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
