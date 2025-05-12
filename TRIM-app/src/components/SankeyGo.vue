<script setup lang="ts">
  import { SankeyChart } from '@/utils/sankeyGo.js'
  import { fetchGO } from '@/services/api'

  const showWarning = ref(false)
  const loading = ref(false)
  const GOunpairedTarget = ref('')
  const GOunpairedTRIM = ref('')
  const props = defineProps<{ symbol1: string; symbol2: string; symbol3: string }>()

  const prepareData = async (symbol1, symbol2, symbol3) => {
    const GOinCIVs = (await fetchGO(symbol1, symbol2)).result.filter((row) => row['VALUE'] === 1)
    let links: Array<{
      source: string | number
      target: string | number
      type: string
      value: number
      id: number
      go: string
    }> = []

    GOinCIVs.sort((a, b) => a['go'] - b['go'])

    GOinCIVs.map((row, i) => {
      if (symbol3 === 'TRIM') {
        links.push({
          source: row['TRIMname'],
          target: row['GO ID'],
          type: row['GO ID'],
          value: row['VALUE'],
          id: i,
          go: row['go'],
        })

        links.push({
          source: row['GO ID'],
          target: row['gene_name'],
          type: row['GO ID'],
          value: row['VALUE'],
          id: i,
          go: row['go'],
        })
      } else {
        links.push({
          source: row['gene_name'],
          target: row['GO ID'],
          type: row['GO ID'],
          value: row['VALUE'],
          id: i,
          go: row['go'],
        })

        links.push({
          source: row['GO ID'],
          target: row['TRIMname'],
          type: row['GO ID'],
          value: row['VALUE'],
          id: i,
          go: row['go'],
        })
      }
    })

    const nodes = Array.from(new Set(links.flatMap((l) => [l.source, l.target])), (name, id) => ({
      name,
      id: Number(id),
      go: links.find((l) => l.source === name || l.target === name)?.go || null, //mapping回去不久得了
    }))

    links.map((d) => {
      const sourceNode = nodes.find((e) => e.name === d.source)
      if (sourceNode) {
        d.source = sourceNode.id
      }
      const targetNode = nodes.find((e) => e.name === d.target)
      if (targetNode) {
        d.target = targetNode.id
      }
    })
    return { nodes, links, GOinCIVs }
  }

  //SankeyChart是一个类实例，应该调用其create方法生成图表
  const sankeygo = new SankeyChart({
    width: 280,
    height: document.getElementById('sankeygo_chart')?.clientHeight,
  })
  console.log('height', sankeygo)
  const drawChart = async () => {
    loading.value = true
    const data = await prepareData(props.symbol1, props.symbol2, props.symbol3)
    if (!data || data.nodes.length === 0 || data.links.length === 0) {
      showWarning.value = true
      return
    }
    const svgNode = sankeygo.create(data)
    const sankeygoChartElement = document.getElementById('sankeygo_chart')
    if (sankeygoChartElement && svgNode) {
      sankeygoChartElement.appendChild(svgNode)
    }

    if (props.symbol3 === 'TRIM') {
      const GOinCIVs = data.GOinCIVs || []
      const geneNames = [...new Set(GOinCIVs.map((item) => item.gene_name))]
      const symbol1List = props.symbol1.split(',')
      GOunpairedTarget.value = symbol1List.filter((gene) => !geneNames.includes(gene)).join(',')
    }
    if (props.symbol3 === 'GN') {
      const GOinCIVs = data.GOinCIVs || []
      const trimName = [...new Set(GOinCIVs.map((item) => item.TRIMname))]
      const symbol2List = props.symbol2.split(',')
      GOunpairedTRIM.value = [
        ...new Set(symbol2List.filter((trim) => !trimName.includes(trim))),
      ].join(',')
    }
  }

  onMounted(async () => {
    await drawChart()
    loading.value = false
  })
</script>

<template>
  <div>
    GO annotation is sourced from <a href="https://geneontology.org/">GeneOntology </a>(PANTHER
    v.17.0, Homo sapiens).
  </div>
  <div id="sankeygo_chart" v-if="!showWarning" v-loading="loading"></div>
  <div
    v-else
    style="display: flex; justify-content: center; align-items: center; width: 500px; height: 750px"
  >
    <IEpWarningFilled style="color: #1e8fff" /> No pairs between {{ symbol1 }} and TRIMCIV members
  </div>
  <div style="color: grey" v-show="symbol3 === 'TRIM' && GOunpairedTarget !== ''">
    Targets: {{ GOunpairedTarget }} has no GO pairs with {{ props.symbol2 }}.
  </div>
  <div style="color: grey" v-show="symbol3 === 'GN' && GOunpairedTRIM !== ''">
    Targets: {{ GOunpairedTRIM }} has no GO pairs with {{ props.symbol1 }}.
  </div>
</template>

<style scoped></style>
