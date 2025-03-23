<script setup lang="ts">
import { nextTick } from 'vue'
import * as d3 from 'd3'
import ForceGraph from '@/utils/network.js'
import { getRepoInfo } from '@/services/api'

const networkRef = ref(null)
const tableRef = ref(null)
// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(10)
// 排序相关状态
const sortProp = ref('')
const sortOrder = ref('')
// Group 选择关状态
const selectedGroups = ref<string[]>([])
// TRIM 选择相关状态
const selectedTRIMs = ref<string[]>([])
interface TRIMItem {
  TRIM_paper: string
  GN2: string
  value: number
  group: string
  SI: string
  Reference: string[]
  Link: string[]
}

const TRIMs_reported = ref<TRIMItem[]>([])
const fetchData = async () => {
  try {
    const data = await getRepoInfo()
    TRIMs_reported.value = data.map((item) => ({
      ...item,
      Reference: JSON.parse(item.Reference),
      Link: JSON.parse(item.Link)
    }))
    // const tmp = TRIMs_reported.value.map((item) => ({
    //   source: item.TRIM_paper,
    //   target: item.GN2,
    //   value: item.value // 假设有一个 value 字段
    // }))

    // const siSummary = data.reduce((acc, item) => {
    //   acc[item.SI] = (acc[item.SI] || 0) + 1
    //   return acc
    // }, {})

    // const uniqueGN2Count = new Set(data.map((item) => item.GN2)).size

    updateNetwork()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
// 计算筛选后的数据
const filteredData = computed(() => {
  let data = TRIMs_reported.value
  if (selectedGroups.value.length > 0) {
    data = data.filter((item) => selectedGroups.value.includes(item.group))
  }
  if (selectedTRIMs.value.length > 0) {
    data = data.filter((item) => selectedTRIMs.value.includes(item.TRIM_paper))
  }
  return data
})

// 计算排序后的数据
const sortedData = computed(() => {
  if (!sortProp.value) {
    return filteredData.value
  }
  return [...filteredData.value].sort((a, b) => {
    const order = sortOrder.value === 'ascending' ? 1 : -1
    if (a[sortProp.value] < b[sortProp.value]) {
      return -1 * order
    } else if (a[sortProp.value] > b[sortProp.value]) {
      return 1 * order
    } else {
      return 0
    }
  })
})

// 计算当前页的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

// 计算总页数
const totalItems = computed(() => {
  return filteredData.value.length
})

// 处理排序事件
const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop
  sortOrder.value = order
}

// 获取所有的 Group 选项
const groupOptions = computed(() => {
  return [...new Set(TRIMs_reported.value.map((item) => item.group))]
})

// 获取所有的 TRIM 选项
const trimOptions = computed(() => {
  return [...new Set(TRIMs_reported.value.map((item) => item.TRIM_paper))]
})

// 自动选择 Group 和 TRIM
watch(selectedTRIMs, (newTRIMs, oldTRIMs) => {
  const addedTRIMs = newTRIMs.filter((trim) => !oldTRIMs.includes(trim))
  const removedTRIMs = oldTRIMs.filter((trim) => !newTRIMs.includes(trim))
  // 自动添加 Group
  addedTRIMs.forEach((trim) => {
    const group = TRIMs_reported.value.find((item) => item.TRIM_paper === trim)?.group
    if (group && !selectedGroups.value.includes(group)) {
      selectedGroups.value.push(group)
    }
  })

  // 自动移除 Group
  removedTRIMs.forEach((trim) => {
    const group = TRIMs_reported.value.find((item) => item.TRIM_paper === trim)?.group
    if (
      group &&
      !TRIMs_reported.value.some(
        (item) => item.group === group && newTRIMs.includes(item.TRIM_paper)
      )
    ) {
      selectedGroups.value = selectedGroups.value.filter((g) => g !== group)
    }
  })
})

watch(selectedGroups, (newGroups, oldGroups) => {
  const addedGroups = newGroups.filter((group) => !oldGroups.includes(group))
  const removedGroups = oldGroups.filter((group) => !newGroups.includes(group))

  // 自动添加 TRIM
  addedGroups.forEach((group) => {
    const trims = TRIMs_reported.value
      .filter((item) => item.group === group)
      .map((item) => item.TRIM_paper)
    trims.forEach((trim) => {
      if (!selectedTRIMs.value.includes(trim)) {
        selectedTRIMs.value.push(trim)
      }
    })
  })

  // 自动移除 TRIM
  removedGroups.forEach((group) => {
    const trims = TRIMs_reported.value
      .filter((item) => item.group === group)
      .map((item) => item.TRIM_paper)
    selectedTRIMs.value = selectedTRIMs.value.filter((trim) => !trims.includes(trim))
  })
})

// 监听 selectedGroups 和 selectedTRIMs 的变化并重置当前页
watch([selectedGroups, selectedTRIMs], () => {
  fetchData()
  currentPage.value = 1
})

// 重置选择
const resetSelections = () => {
  selectedGroups.value = []
  selectedTRIMs.value = []
}

const updateNetwork = async () => {
  const element = networkRef.value
  // Prepare links
  const links = TRIMs_reported.value
    .map((item) => {
      if (item.TRIM_paper !== 'null' && item.GN2 !== 'null' && item.value !== null) {
        return {
          source: item.TRIM_paper,
          target: item.GN2,
          value: item.value
        }
      }
      return null
    })
    .filter((link) => link !== null)
    .filter(
      (v, i, a) => a.findIndex((t) => t?.source === v?.source && t?.target === v?.target) === i
    ) // Unique links
  // Prepare nodes
  const uniqueTRIMs = [...new Set(TRIMs_reported.value.map((item) => item.TRIM_paper))]
  const uniqueTargets = [...new Set(TRIMs_reported.value.map((item) => item.GN2))]
  const uniqueIds = [...new Set([...uniqueTRIMs, ...uniqueTargets])]

  const color = [
    'rgba(255, 151, 151, 0.8)',
    'rgba(255, 188, 160, 0.6)',
    'rgba(164, 127, 228, 0.8)',
    'rgba(121, 222, 151, 0.8)',
    'rgba(223, 223, 114, 0.8)',
    'rgba(204, 255, 255, 0.8)',
    'rgba(255, 130, 173, 0.8)',
    'rgba(158, 185, 243, 0.8)',
    'rgba(95, 195, 197, 0.8)',
    'rgba(223, 179, 245, 0.8)',
    'rgba(248, 156, 116, 0.8)',
    'rgba(246, 207, 113, 0.8)',
    'rgba(179, 136, 255, 0.6)',
    'rgba(92, 150, 255, 0.6)'
  ]

  const nodes = uniqueIds
    .map((id) => {
      const trimItem = TRIMs_reported.value.find((item) => item.TRIM_paper === id)
      const targetItem = TRIMs_reported.value.find((item) => item.GN2 === id)

      let group, colorIndex
      if (trimItem) {
        group = trimItem.group
      } else if (targetItem) {
        group = targetItem.SI
      }

      if (group === 'substrate') {
        colorIndex = color.length - 1
      } else if (group === 'interactor') {
        colorIndex = color.length - 2
      } else {
        colorIndex = uniqueTRIMs.indexOf(id) % 12
      }

      if (group !== 'null' && colorIndex !== 'null') {
        return {
          id,
          group,
          color: color[colorIndex]
        }
      }
      return null
    })
    .filter((node) => node !== null)

  const data = { nodes, links }

  if (!data) {
    console.error('Failed to load network data.')
    return
  }

  let filteredNodes = data.nodes
  let filteredLinks = data.links

  if (selectedTRIMs.value.length > 0) {
    const filteredNodes_TRIM = filteredNodes.filter(
      (node) =>
        // selectedTRIMs.value.includes(node?.id)
        node?.id && selectedTRIMs.value.includes(node.id)
    )
    const filteredNodeIds = new Set(filteredNodes_TRIM.map((d) => d?.id))

    filteredLinks = filteredLinks.filter((l) => filteredNodeIds.has(l?.source))
    const filteredNodesIds_target = new Set(filteredLinks.map((l) => l?.target))
    const filteredNodes_target = filteredNodes.filter((d) => filteredNodesIds_target.has(d?.id))
    filteredNodes = [...filteredNodes_TRIM, ...filteredNodes_target]
  }

  if (!element) {
    console.error('Network element is not available.')
    return
  }
  const width = (element as HTMLElement).clientWidth
  const height = 450
  const order = [
    'CI',
    'CII',
    'CIII',
    'CIV',
    'CV',
    'CVI',
    'CVII',
    'CVIII',
    'CIX',
    'CX',
    'CXI',
    'UC',
    'substrate',
    'interactor'
  ]

  // 清空现有的 SVG 内容
  d3.select(element).selectAll('*').remove()

  // Create group legend
  const groupLegend = d3
    .select(element)
    .append('svg')
    .attr('class', 'grouplegend')
    .attr('width', width)
    .attr('height', 40)

  const uniqueGroups = Array.from(new Set(data.nodes.map((d) => d?.group))).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  const legend = groupLegend
    .selectAll('g')
    .data(uniqueGroups)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${i * 60}, 5)`)

  legend
    .append('circle')
    .attr('cx', 10)
    .attr('cy', 25)
    .attr('r', 8)
    .attr('fill', (d) => {
      const node = data.nodes.find((node) => node?.group === d)
      return node ? node.color : 'gray'
    })
    .attr('stroke', (d) => (selectedGroups.value.includes(d) ? 'black' : 'none'))
    .attr('stroke-width', (d) => (selectedGroups.value.includes(d) ? 2 : 0))
  legend
    .append('text')
    .attr('x', 10)
    .attr('y', 10)
    .attr('text-anchor', 'middle')
    .attr('font-size', '13px')
    .text((d) => d)

  const svg = d3.select(element).append('svg').attr('width', width).attr('height', height)

  let plot = ForceGraph(
    { nodes: filteredNodes, links: filteredLinks },
    {
      nodeId: (d) => d.id,
      nodeGroup: (d) => d.group,
      nodeGroups: [...new Set(filteredNodes.map((d) => d?.group))], // Example for nodeGroups
      nodeTitle: (d) => `${d.id}\n${d.group}`,
      linkStrokeWidth: Math.sqrt(filteredLinks[0]?.value || 1), // Ensure a default value
      width: width,
      height: height,
      onNodeClick: handleNodeClick,
      nodeStrength: -30, // Example default value
      linkStrength: 0.1, // Example default value
      invalidation: null // Example default value
    }
  )

  const svgNode = svg.node()
  if (svgNode && plot instanceof Node) {
    svgNode.appendChild(plot) // Use appendChild instead of append
  } else {
    console.error('SVG node is not available or plot is not a Node.')
  }
}

// 处理节点点击事件
const handleNodeClick = (nodeId) => {
  const matchingIndices = sortedData.value
    .map((item, index) => (item.TRIM_paper === nodeId || item.GN2 === nodeId ? index : -1))
    .filter((index) => index !== -1)

  if (matchingIndices.length > 0) {
    const pageIndex = Math.floor(matchingIndices[0] / pageSize.value) + 1
    currentPage.value = pageIndex

    nextTick(() => {
      if (!tableRef.value) {
        console.error('Table reference is not available.')
        return
      }

      matchingIndices.forEach((index) => {
        if (!tableRef.value) {
          console.error('Table reference is not available.')
          return
        }
        const row = (tableRef.value as any)?.$el?.querySelector(
          `.el-table__row:nth-child(${(index % pageSize.value) + 1})`
        )

        if (row) {
          row.style.transition = 'background-color 0.5s ease'
          row.style.background = '#1e8fff65' // 添加背景颜色

          row.scrollIntoView({ behavior: 'smooth', block: 'start' }) // 添加滚动到可视区域
          let isHighlighted = true
          const interval = setInterval(() => {
            row.style.backgroundColor = isHighlighted ? '#1e8fff65' : ''
            isHighlighted = !isHighlighted
          }, 500) // 每0.5秒切换一次背景颜色

          // 3秒后移除闪烁效果和背景颜色
          setTimeout(() => {
            clearInterval(interval)
            row.style.backgroundColor = '' // 移除背景颜色
          }, 3000) // 3秒后移除
        }
      })
    })
  }
}
onMounted(() => {
  fetchData()
  updateNetwork()
})
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <el-main>
    <h2>TRIM Targeting Landscape</h2>

    <div class="grid-content" ref="networkRef" />

    <div>
      <h2>
        Manually Curated Library of targets
        <el-button @click="resetSelections" type="primary" style="margin-left: 20px">
          Reset to All
        </el-button>
      </h2>
      <!-- 重置按钮 -->
    </div>

    <!-- Group 选择表单 -->
    <div>TRIM subfamily filter:</div>
    <el-select
      v-model="selectedGroups"
      multiple
      placeholder="Select Groups"
      style="width: auto; min-width: 300px; margin-bottom: 20px"
    >
      <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
    </el-select>

    <!-- TRIM 选择表单 -->
    <div>
      <div>TRIM member filter:</div>
      <el-select
        v-model="selectedTRIMs"
        multiple
        placeholder="Select TRIMs"
        style="width: auto; min-width: 300px; margin-bottom: 20px"
      >
        <el-option v-for="trim in trimOptions" :key="trim" :label="trim" :value="trim" />
      </el-select>
    </div>
    <!-- TRIM 标签 -->
    <!-- <div style="margin-bottom: 20px">
      <el-tag
        v-model="selectedTRIMs"
        v-for="trim in selectedTRIMs"
        :key="trim"
        closable
        @close="selectedTRIMs.splice(selectedTRIMs.indexOf(trim), 1)"
      >
        {{ trim }}
      </el-tag>
    </div> -->

    <el-table
      :data="paginatedData"
      style="width: 100%"
      ref="tableRef"
      @sort-change="handleSortChange"
    >
      <el-table-column column-key="group" prop="group" label="Group" width="100" sortable />
      <el-table-column
        column-key="TRIM_paper"
        prop="TRIM_paper"
        label="TRIM"
        width="auto"
        sortable
      />
      <el-table-column prop="bg" label="Tumorgenesis-related" sortable width="210" />
      <el-table-column prop="SI" label="Tag" sortable width="100" />
      <el-table-column prop="GN2" label="Gene name" sortable width="150" />

      <el-table-column prop="Reference" label="Reference">
        <template #default="{ row }">
          <div v-for="(reference, index) in row.Reference" :key="index" class="reference-cell">
            <template v-if="row.Reference.length > 1"> [{{ index + 1 }}] </template>
            <a :href="row.Link[index]" target="_blank">{{ reference }}</a>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalItems"
      layout="total, prev, pager, next, jumper"
      :page-sizes="[10, 20, 30, 40]"
    />
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 20px;
}

.el-col {
  border-radius: 4px;
  padding: 10px;
}

.grid-content {
  width: auto;
  height: 500px;
  border-radius: 4px;
  min-height: 36px;
  background-color: rgba(244, 241, 255, 0.74);
  border: 3px solid #3d2be2a8;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.reference-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
