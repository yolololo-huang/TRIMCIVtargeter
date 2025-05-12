<script setup lang="ts">
  import type { CSSProperties } from 'vue'
  import {
    fetchDegTables,
    fetchDegPlotData,
    fetchDegTabData,
    fetchRecommendedGNsDeg,
  } from '@/services/api'
  import { scatterPlot } from '@/utils/degscatterplot.js'
  import Cascader_TRIMs from '@/assets/Cascader_TRIMs.json'
  import Cascader_Dis_label from '@/assets/datasetInfo.json'
  import * as d3 from 'd3'

  const scatterplotRef = ref(null)
  const selectedDatasetX = ref('')
  const selectedDatasetY = ref('')
  const tableData = ref<Array<Record<string, any>>>([])
  const tableColumns = ref<string[]>([])
  const geneNames = ref<string[]>([])
  const selectedGeneNames = ref<string[]>([])
  const RecommendedGNs = ref()
  const allData = ref<any[]>([])
  const cascaderOptions = ref<any[]>([])
  const selectedDatasets = ref<string[]>([])
  const loading = ref(false)

  const defaultDatasetX = 'luad_pmid32649874'
  const defaultDatasetY = 'luad_pmid32649877'

  const props = {
    expandTrigger: 'hover' as const,
  }
  const propsCas = { multiple: true }

  const handleNullValues = (data) => {
    return data.map((item) => {
      Object.keys(item).forEach((key) => {
        if (item[key] === null) {
          item[key] = ''
        }
      })
      return item
    })
  }

  const formatScatterPlotData = (data) => {
    const resultMap = new Map()

    data.forEach((item) => {
      const key = item.gene_name
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          gene_name: key,
          ID_x: '',
          logFC_x: '',
          adj_P_Val_x: '',
          dataset_x: '',
          ID_y: '',
          logFC_y: '',
          adj_P_Val_y: '',
          dataset_y: '',
        })
      }

      const entry = resultMap.get(key)

      if (item.dataset === selectedDatasetX.value) {
        entry.ID_x = item.ID || ''
        entry.logFC_x = item.logFC || ''
        entry.adj_P_Val_x = item.adj_P_Val || ''
        entry.dataset_x = item.dataset
      } else if (item.dataset === selectedDatasetY.value) {
        entry.ID_y = item.ID || ''
        entry.logFC_y = item.logFC || ''
        entry.adj_P_Val_y = item.adj_P_Val || ''
        entry.dataset_y = item.dataset
      }
    })

    return Array.from(resultMap.values())
  }

  const formdegTabData = (data) => {
    const resultMap = new Map()

    data.forEach((item) => {
      const key = item.gene_name
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          gene_name: key,
          [`ID_${item.dataset}`]: '',
          [`logFC_${item.dataset}`]: null,
          [`adj_P_Val_${item.dataset}`]: null,
        })
      }

      const entry = resultMap.get(key)
      entry[`ID_${item.dataset}`] = item.ID || ''
      entry[`logFC_${item.dataset}`] = item.logFC || null
      entry[`adj_P_Val_${item.dataset}`] = item.adj_P_Val || null
    })

    return Array.from(resultMap.values())
  }

  const handleChange = async (axis: 'X' | 'Y', value: any) => {
    if (axis === 'X') {
      selectedDatasetX.value = value[value.length - 1]
    } else if (axis === 'Y') {
      selectedDatasetY.value = value[value.length - 1]
    }

    await fetchData() // 重新获取数据
    updateScatterPlot(allData.value) // 更新绘图
  }
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
    console.log('Cascader_Dis_label', Cascader_Dis_label)
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
          children: [],
        }
      }

      const parentOption = optionsMap[firstPart]

      let secondLevelOption = parentOption.children?.find(
        (child) => child.value === secondLevelValue
      )
      if (!secondLevelOption) {
        secondLevelOption = {
          value: secondLevelValue,
          label: secondLevelLabel,
          children: [],
        }
        parentOption.children?.push(secondLevelOption)
      }

      secondLevelOption.children?.push({
        value: tbNames,
        label: diseaseDetailMap[tbNames] || tbNames,
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
    const degTables = await fetchDegTables() //表格名
    cascaderOptions.value = generateCascaderOptions(degTables)
    if (!selectedDatasetX.value) selectedDatasetX.value = defaultDatasetX
    if (!selectedDatasetY.value) selectedDatasetY.value = defaultDatasetY

    const scatterPlotData = await fetchDegPlotData(selectedDatasetX.value, selectedDatasetY.value)
    scatterPlotData.columns = Object.keys(scatterPlotData[0])
    allData.value = formatScatterPlotData(scatterPlotData)

    const tableDataResponse = await fetchDegTabData('', '')
    tableData.value = formdegTabData(handleNullValues(tableDataResponse))
    tableColumns.value = Object.keys(tableData.value[0]).filter(
      (col) => col === 'gene_name' || col.split('_')[0] === 'logFC'
    )

    geneNames.value = allData.value.map((d) => d['gene_name'])
  }

  const drawScatterPlot = (element, scatterPlotData) => {
    const width = 600
    const height = 500
    const svg = d3.select(element).select('svg').empty()
      ? d3.select(element).append('svg').attr('width', width).attr('height', height)
      : d3.select(element).select('svg')

    const plot = scatterPlot()
      .width(width)
      .height(height)
      .data(scatterPlotData)
      .xValue((d) => d['logFC_x'])
      .yValue((d) => d['logFC_y'])
      .margin({
        top: 20,
        right: 20,
        bottom: 40,
        left: 50,
      })
      .radius(5)
      .onClick((d, isSelected) => {
        if (isSelected) {
          selectedGeneNames.value = [...selectedGeneNames.value, d]
        }
      })

    svg.call(plot)
  }

  const initScatterPlot = (element, scatterPlotData) => {
    drawScatterPlot(element, scatterPlotData)
  }

  const updateScatterPlot = (scatterPlotData) => {
    const element = scatterplotRef.value
    if (!element) return
    drawScatterPlot(element, scatterPlotData)
  }

  const handleSearch = async (query) => {
    try {
      const selectedDatasetsVal = selectedDatasets.value.map((array) => array[array.length - 1])
      const data = await fetchDegTabData(selectedDatasetsVal.join(','), query)
      tableData.value = handleNullValues(formdegTabData(data))
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  watch([selectedGeneNames, selectedDatasets], async ([newGeneNames, newDatasets]) => {
    if (newGeneNames.length > 0 || newDatasets.length > 0) {
      const newDatasetsValue = newDatasets.map((array) => array[array.length - 1])
      const data = await fetchDegTabData(newDatasetsValue.join(','), newGeneNames.join(','))
      tableData.value = handleNullValues(formdegTabData(data))
      tableColumns.value = Object.keys(tableData.value[0]).filter(
        (col) => col === 'gene_name' || col.split('_')[0] === 'logFC'
      )
    } else {
      await fetchData()
    }
  })

  const filterTrimRows = async () => {
    const trims = Cascader_TRIMs.flatMap((array) => array.children.map((child) => child.value))
    try {
      const selectedDatasetsVal = selectedDatasets.value.map((array) => array[array.length - 1])
      const data = await fetchDegTabData(selectedDatasetsVal.join(','), trims.join(','))
      tableData.value = handleNullValues(formdegTabData(data))
      selectedGeneNames.value = trims
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getCellStyle = ({
    row,
    column,
  }: {
    row: Record<string, any>
    column: { property: string }
  }): CSSProperties => {
    const colName = column.property
    if (colName.split('_')[0] === 'logFC') {
      const dataset = colName.split('_').slice(1).join('_')
      const adjPValCol = `adj_P_Val_${dataset}`
      const logFC = parseFloat(row[colName])
      const adjPVal = parseFloat(row[adjPValCol])

      if (isNaN(logFC) || isNaN(adjPVal)) {
        return { backgroundColor: '' }
      }

      let backgroundColor = ''
      let color = 'black'
      if (adjPVal < 0.01) {
        if (logFC >= 1) {
          backgroundColor = 'rgba(233,55,55,0.8)'
        } else if (logFC <= -1) {
          backgroundColor = 'rgba(88,141,255,0.8)'
        }
      } else {
        color = 'rgba(174, 174, 174, 0.32)'
      }

      return { backgroundColor, color }
    }
    return {}
  }

  const getInnerDivStyle = ({ column }: { column: { property: string } }): CSSProperties => {
    const colName = column.property
    if (colName.split('_')[0] === 'logFC') {
      return {
        padding: '3px',
        borderRadius: '5px',
        textAlign: 'center' as 'center', // Ensure type compatibility
        height: '20px',
        display: 'flex',
        alignItems: 'center',
      }
    } else {
      return {
        color: 'black',
        textAlign: 'center' as 'center', // Ensure type compatibility
        height: '20px',
        display: 'flex',
        alignItems: 'center',
      }
    }
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
      RecommendedGNs.value = await fetchRecommendedGNsDeg(query)
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
    initScatterPlot(scatterplotRef.value, allData.value)

    watch([selectedDatasetX, selectedDatasetY], async () => {
      await fetchData()
      updateScatterPlot(allData.value)
    })
  })
</script>

<template>
  <div class="landscape">
    <el-row>
      <el-col :span="9">
        <h1>Gene logFC Landscape</h1>
        <div>Two dimensional logFC of all genes from selected studies below</div>
        <div>
          X:
          <el-cascader
            v-model="selectedDatasetX"
            :options="cascaderOptions"
            :props="props"
            @change="(value) => handleChange('X', value)"
            placeholder="Select X Column"
            class="xymenu"
            style="width: 320px"
          >
          </el-cascader>
        </div>
        <div>
          Y:
          <el-cascader
            v-model="selectedDatasetY"
            :options="cascaderOptions"
            :props="props"
            @change="(value) => handleChange('Y', value)"
            placeholder="Select Y Column"
            style="width: 320px"
            class="xymenu"
          >
          </el-cascader>
        </div>
        <div>
          Zoom by mouse; click the gene point and show the gene(s) logFC from different datasets in
          the table below
        </div>
        <div>legend</div>
        <div>
          <svg width="20" height="20">
            <circle cx="10" cy="10" r="5" fill="rgba(64, 64, 64, 0.4)"></circle>
          </svg>
          <span>FC &gt;2 and adjusted p.value &lt; 0.01 in both selected datasets </span>
        </div>
        <div>
          <svg width="20" height="20">
            <circle cx="10" cy="10" r="5" fill="rgba(64, 64, 64, 0.1)"></circle>
          </svg>
          <span>FC &gt;2 and adjusted p.value &lt; 0.01 in one of selected datasets</span>
        </div>
        <div>
          <svg width="20" height="20">
            <circle cx="10" cy="10" r="5" fill="rgba(211, 211, 211, 0.01)"></circle>
          </svg>
          <span>adjusted p.value > 0.01 in both selected datasets </span>
        </div>
        <!-- <div>
          <svg width="20" height="20">
            <circle cx="10" cy="10" r="5" fill="rgba(144, 25, 255, 0.8)"></circle>
          </svg>
          <span>TRIM family members </span>
        </div> -->
      </el-col>
      <el-col :span="15"><div ref="scatterplotRef" class="degScatterplot"></div></el-col>
    </el-row>
  </div>

  <div class="search-container">
    <el-col :span="12" style="margin-right: 8px">
      <div>Select GeneName(s):</div>
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
        style="flex-grow: 1"
      >
        <!-- flex-grow: 1 相当于auto-->
        <el-option
          v-for="item in RecommendedGNs"
          :key="item"
          :label="item"
          :value="item"
        ></el-option>
      </el-select>
    </el-col>
    <el-col :span="12">
      <div>Interested Cancer(s)</div>
      <el-cascader
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        clearable
        :props="propsCas"
        v-model="selectedDatasets"
        :options="cascaderOptions"
        placeholder="In Study/Dataset(Optional)"
        style="width: 320px"
      >
        <template #default="{ node, data }">
          <span>{{ data.label }}</span>
          <span v-if="!node.isLeaf"> ({{ getLeafCount(data) }}) </span>
        </template>
      </el-cascader>

      <el-button
        @click="filterTrimRows"
        style="
          margin-left: 10px;
          background-color: rgba(144, 25, 255, 0.8);
          border-color: purple;
          color: white;
          width: 50px;
        "
      >
        TRIM
      </el-button>
    </el-col>
  </div>
  <div style="display: flex">
    <div style="padding: 10px">
      <svg width="210" height="20">
        <rect width="200" height="20" rx="5" fill="rgba(233,55,55,0.8)"></rect>
        <text x="100" y="15" fill="black" text-anchor="middle">logFC&gt;1, adj.p.val&lt;0.01</text>
      </svg>
      <svg width="210" height="20">
        <rect width="200" height="20" rx="5" fill="rgba(88,141,255,0.8)"></rect>
        <text x="100" y="15" fill="black" text-anchor="middle">logFC&lt;-1, adj.p.val&lt;0.01</text>
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
      :label="col.split('_')[0] === 'logFC' ? col.split('_').slice(1).join('_').toUpperCase() : col"
      :width="col === 'gene_name' ? '140px' : '140px'"
      sortable
    >
      <template #default="{ row, column }">
        <div :style="[getCellStyle({ row, column }), getInnerDivStyle({ column })]">
          {{ formatValue(row[column.property]) }}
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<style lang="scss" scoped>
  .degScatterplot {
    width: 500px;
    height: 500px;
  }

  .search-container {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  .xymenu {
    width: 400px;
    margin: 4px;
  }
</style>
