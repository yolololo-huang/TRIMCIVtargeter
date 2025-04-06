<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { fetchCorTables, fetchCorTRIMsData, fetchRecommendedGNsCor } from '@/services/api'
import Cascader_TRIMs from '@/assets/Cascader_TRIMs.json'
import Cascader_Dis_label from '@/assets/datasetInfo.json'

const selectedTables = ref<any[]>([])
const selectedTRIMs = ref<any[]>([])
const selectedGeneNames = ref<string[]>([])
const tableData = ref([])
const tableColumns = ref<string[]>([])
const RecommendedGNs = ref([])
const CascaderTRIMs = ref<any[]>([])
const CascaderOptions = ref<any[]>([])
const loading = ref(false)

const propsCas = { multiple: true }

interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
}

const generateCascaderOptions = (tables: string[]): CascaderOption[] => {
  const optionsMap: { [key: string]: CascaderOption } = {}

  const labelMap: { [key: string]: string } = {}
  const diseaseDetailMap: { [key: string]: string } = {}
  Cascader_Dis_label.forEach((item) => {
    labelMap[item.tableName] = `${item.abbre} (${item.disease})`
    diseaseDetailMap[item.tableName] = `${item.dataset} (${item.disease_detail})`
  })

  tables.forEach((tbNames) => {
    const parts = tbNames.split('_')
    const firstPart = parts[0]

    const lastPart = parts[parts.length - 1]
    const secondLevelValue = lastPart === 'tcga' ? 'TCGA' : 'MS'
    const secondLevelLabel = secondLevelValue === 'TCGA' ? 'RNAseq' : 'Mass spectrum'

    const firstLevelLabel = labelMap[tbNames] || 'fail pairs'

    if (!optionsMap[firstPart]) {
      optionsMap[firstPart] = {
        value: firstPart,
        label: firstLevelLabel,
        children: []
      }
    }

    const parentOption = optionsMap[firstPart]

    let secondLevelOption = parentOption.children?.find((child) => child.value === secondLevelValue)
    if (!secondLevelOption) {
      secondLevelOption = {
        value: secondLevelValue,
        label: secondLevelLabel,
        children: []
      }
      parentOption.children?.push(secondLevelOption)
    }

    secondLevelOption.children?.push({
      value: tbNames,
      label: diseaseDetailMap[tbNames] || tbNames
    })
  })
  return Object.values(optionsMap)
}
const getLeafCount = (node) => {
  if (!node.children) {
    return 0
  }
  let count = 0
  const stack = [...node.children]
  while (stack.length) {
    const current = stack.pop()
    if (current.children) {
      stack.push(...current.children)
    } else {
      count++
    }
  }
  return count
}
const fetchData = async () => {
  const cordbtableNames = await fetchCorTables()
  CascaderOptions.value = generateCascaderOptions(cordbtableNames)
  CascaderTRIMs.value = Cascader_TRIMs

  await handleSearch()
}

const handleSearch = async () => {
  const tables = selectedTables.value
    .map((item) => (Array.isArray(item) ? item[item.length - 1] : item))
    .join(',')
  const TRIMs = selectedTRIMs.value
    .map((item) => (Array.isArray(item) ? item[item.length - 1] : item))
    .join(',')

  const geneNames = selectedGeneNames.value.length > 0 ? selectedGeneNames.value.join(',') : ''

  try {
    let data = await fetchCorTRIMsData(tables, TRIMs, geneNames)

    if (geneNames) {
      data = data.filter((item) => selectedGeneNames.value.includes(item.gene_name))
    }

    tableData.value = data
    if (data.length > 0) {
      const columns = Object.keys(data[0]).filter(
        (col) => col === 'gene_name' || col === 'datasetName' || col.split('_')[1] === 'r'
      )
      tableColumns.value = ['datasetName', ...columns.filter((col) => col !== 'datasetName')]
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

watch([selectedTables, selectedTRIMs, selectedGeneNames], handleSearch)

const getCellStyle = ({
  row,
  column
}: {
  row: Record<string, any>
  column: { property: string }
}): CSSProperties => {
  const colName = column.property
  if (colName.split('_')[1] === 'r') {
    const corrR = parseFloat(row[colName])
    const TRIM_p = `${colName.split('_')[0]}_p`
    const pValue = parseFloat(row[TRIM_p])
    let backgroundColor = ''
    let color = 'black'
    if (!isNaN(corrR) && !isNaN(pValue)) {
      if (pValue < 0.5) {
        if (corrR > 0.1) {
          backgroundColor = 'rgba(233,55,55,0.8)'
        } else if (corrR < -0.1) {
          backgroundColor = 'rgba(88,141,255,0.8)'
        }
      } else {
        color = 'rgba(174, 174, 174, 0.32)'
      }
    }
    return { backgroundColor, color }
  }
  return {}
}

const getInnerDivStyle = ({ column }: { column: { property: string } }): CSSProperties => {
  const colName = column.property
  if (colName.split('_')[1] === 'r') {
    return {
      padding: '3px',
      borderRadius: '5px',
      textAlign: 'center' as 'center', // Ensure type compatibility
      height: '20px',
      display: 'flex',
      alignItems: 'center'
    }
  } else {
    return {
      color: 'black',
      textAlign: 'center' as 'center', // Ensure type compatibility
      height: '20px',
      display: 'flex',
      alignItems: 'center'
    }
  }
}

const getColumnLabel = (col: string): string => {
  if (col.includes('_')) {
    return col.split('_')[0]
  }
  return col
}

const formatValue = (value: any): string => {
  if (typeof value === 'number') {
    return value.toFixed(7)
  }
  return value
}

const fetchGeneNames = async (query) => {
  loading.value = true
  try {
    RecommendedGNs.value = await fetchRecommendedGNsCor(query)
  } catch (error) {
    console.error('Error fetching gene names:', error)
  } finally {
    loading.value = false
  }
}
const downloadResultData = () => {
  const tsvContent = tableData.value.map((row) => Object.values(row).join('\t')).join('\n')
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'resultData.tsv'
  link.click()
}
onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <h1>TRIM-DEGs Correlation Landscape</h1>
  <div style="margin: 10px 0">
    Select cancer(s)/dataset(s):
    <el-cascader
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="3"
      clearable
      :props="propsCas"
      v-model="selectedTables"
      :options="CascaderOptions"
      @change="handleSearch"
      placeholder="Select disease and dataset"
      style="width: 320px"
    >
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ getLeafCount(data) }}) </span>
      </template>
    </el-cascader>
  </div>
  <div style="margin: 10px 0">
    Select TRIM(s):
    <el-cascader
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="3"
      clearable
      :props="propsCas"
      v-model="selectedTRIMs"
      :options="CascaderTRIMs"
      @change="handleSearch"
      placeholder="Select interested TRIMs"
      style="width: 320px"
    >
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
      </template>
    </el-cascader>
    Select GeneName(s):
    <el-select
      v-model="selectedGeneNames"
      multiple
      clearable
      filterable
      remote
      reserve-keyword
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="5"
      placeholder="Search interested Gene Name(s)"
      :remote-method="fetchGeneNames"
      :loading="loading"
      @change="handleSearch"
      style="width: 320px"
    >
      <el-option v-for="item in RecommendedGNs" :key="item" :label="item" :value="item"></el-option>
    </el-select>
  </div>
  <div style="display: flex">
    <div style="padding: 10px">
      <svg width="210" height="20">
        <rect width="200" height="20" rx="5" fill="rgba(233,55,55,0.8)"></rect>
        <text x="100" y="15" fill="black" text-anchor="middle">
          R &gt; 0.1, adj.p.val &lt; 0.01
        </text>
      </svg>
      <svg width="210" height="20">
        <rect width="200" height="20" rx="5" fill="rgba(88,141,255,0.8)"></rect>
        <text x="100" y="15" fill="black" text-anchor="middle">
          R &lt; 0.1, adj.p.val &lt; 0.01
        </text>
      </svg>
      <svg width="130" height="20">
        <rect width="120" height="20" rx="5" fill="white" stroke="gray" stroke-width="1"></rect>
        <text
          x="60"
          y="15"
          fill="rgba(174, 174, 174, 0.32)"
          text-anchor="middle"
          font-weight="bold"
        >
          adj.p.val>0.01
        </text>
      </svg>
      <svg width="200" height="20">
        <rect width="200" height="20" rx="5" fill="white" stroke="black" stroke-width="1"></rect>
        <text x="100" y="15" fill="rgba(8, 8, 8)" text-anchor="middle" font-size="10px">
          Empty Means the gene is NOT in Dataset
        </text>
      </svg>
    </div>
    <div class="download-icon"><IEpDownload @click="downloadResultData" />Download TSV</div>
  </div>
  <el-table :data="tableData" max-height="1000">
    <el-table-column
      v-for="col in tableColumns"
      :key="col"
      :prop="col"
      :label="getColumnLabel(col)"
      :width="col === 'datasetName' ? '150px' : '110px'"
      sortable
    >
      <template #default="{ row, column }">
        <div :style="[getInnerDivStyle({ column }), getCellStyle({ row, column })]">
          {{
            col === 'datasetName'
              ? row[column.property].toUpperCase()
              : formatValue(row[column.property])
          }}
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
.search-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
