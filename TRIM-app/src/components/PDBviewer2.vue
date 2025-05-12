<script setup lang="ts">
  import { onMounted, watch, ref } from 'vue'
  import { Viewer } from 'molstar/build/viewer/molstar'

  // 导入Mol* Viewer的CSS文件
  import 'molstar/build/viewer/molstar.css'
  import * as d3 from 'd3'
  import { createChordDiagram } from '@/utils/chord_diagram.js'

  // 创建一个引用，用于绑定到DOM元素
  const chordDiagram = ref(null)
  const clickedTitle = ref('')
  const clickedEntry = ref('')

  const dialogVisible = ref(false)

  let viewer: Viewer

  onMounted(async () => {
    d3.csv('./data/chord_names.csv')
      .then((cities) => {
        d3.json('./data/chord_matrix.json')
          .then((matrix) => {
            if (Array.isArray(matrix) && matrix.every(Array.isArray)) {
              createChordDiagram(cities, matrix, clickedTitle, clickedEntry)
            } else {
              console.error('Matrix data is not a valid 2D array:', matrix)
            }
          })
          .catch((error) => {
            console.error('Error loading matrix data:', error)
          })
      })
      .catch((error) => {
        console.error('Error loading cities data:', error)
      })
  })

  watch(clickedEntry, async (newEntry) => {
    if (newEntry) {
      dialogVisible.value = true
      await nextTick() // 等待下一次 DOM 更新循环
      const container = document.getElementById('molstar-container') as HTMLElement
      if (container) {
        viewer = await Viewer.create(container, {
          layoutShowSequence: true,
          layoutIsExpanded: false, //不然就满屏。。
          layoutShowControls: true,
          // viewportShowControls: false,
          layoutShowRemoteState: false,
          layoutShowLog: false,
          layoutShowLeftPanel: false,
          viewportShowExpand: false,
          viewportShowSelectionMode: false,
          viewportShowAnimation: false,
        })
        try {
          await viewer.loadAlphaFoldDb(newEntry)
        } catch (error) {
          console.error('Error loading structure for entry:', newEntry, error)
        }
      } else {
        console.error('Molstar container element not found')
      }
    }
  })
</script>

<template>
  <div ref="chordDiagram" id="chord-diagram"></div>
  <!-- <div id="molstar-container" style="position: relative; width: auto; height: 500px"></div> -->
  <el-dialog v-model="dialogVisible" title="Struture viewer" width="800">
    <div style="width: 500px">The clicked TRIM is {{ clickedTitle }} ({{ clickedEntry }})</div>
    <div id="molstar-container" style="position: relative; width: auto; height: 500px"></div>
  </el-dialog>
</template>

<style lang="scss" scoped>
  // .molstar-container {
  //   margin-top: 20px;
  // }
</style>
