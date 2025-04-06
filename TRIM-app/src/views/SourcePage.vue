<script setup lang="ts">
import { downloadTableData } from '@/services/api'
import datasetInfo from '@/assets/datasetInfo.json'

const itemsPerPage = 9
const currentPage = ref(1)
const totalItems = datasetInfo.length

const selectedFilters = ref<string[]>([])

// 生成唯一的选项
const uniqueOptions = computed<string[]>(() => {
  const optionsSet = new Set<string>()
  datasetInfo.forEach((item) => {
    optionsSet.add(`${item.abbre} (${item.disease})`)
  })
  return Array.from(optionsSet)
})

const paginatedItems = computed(() => {
  const filteredItems = selectedFilters.value.length
    ? datasetInfo.filter((item) =>
        selectedFilters.value.includes(`${item.abbre} (${item.disease})`)
      )
    : datasetInfo

  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredItems.slice(start, end)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const currentItemsCount = computed(() => {
  return paginatedItems.value.length
})

const downloadData = async (tableName) => {
  try {
    const response = await downloadTableData(tableName)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${tableName}.tsv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading data:', error)
  }
}
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <el-main>
    <h2>Dataset Information</h2>
    <p>
      We provide a list of pre-computed prediction for targets of TRIMCIV members in 26 cancers
      including 9 proteomic datasets and 26 transcriptomic datasets and the corresponding QC supplementary data. The
      prediction in different dataset provided in the TSV format could be download below. TCGA and
      GTEX data is sourcing from UCSC database.
    </p>
    <ResOverview />
    <div style="margin-top: 50px; font-weight: bold">
      Filter diseases:
      <el-select
        v-model="selectedFilters"
        multiple
        clearable
        placeholder="Select Diseases"
        style="width: 100%; margin-bottom: 20px"
      >
        <el-option v-for="option in uniqueOptions" :key="option" :value="option" />
      </el-select>
    </div>
    <el-row :gutter="20">
      <el-col v-for="item in paginatedItems" :key="item.tableName" :span="8">
        <el-card class="dataset-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <h4 style="margin-right: 20px">{{ item.abbre }}</h4>
            <div>
              <el-button size="small" @click="() => downloadData(item.tableName)"
                >Download</el-button
              >
            </div>
          </div>
          <hr />
          <p>
            Disease:<strong> {{ item.disease }}</strong>
          </p>
          <p>
            Data Source: <strong>{{ item.dataset }}</strong>
          </p>
          <p>
            Primary Tissue: <strong> {{ item.primary_tissue }}</strong>
          </p>
          <p>
            Tumor Samples: <strong>{{ item.tumor }}</strong>
          </p>
          <p>
            Normal Samples:<strong>{{ item.normal }}</strong>
          </p>
        </el-card>
      </el-col>
    </el-row>
    <div class="pagination-info">
      <el-pagination
        background
        v-model:current-page="currentPage"
        :page-size="itemsPerPage"
        :total="totalItems"
        layout="prev"
        @current-change="handlePageChange"
      />
      <span style="margin: 10px">{{ currentItemsCount }} of {{ totalItems }}</span>
      <el-pagination
        background
        v-model:current-page="currentPage"
        :page-size="itemsPerPage"
        :total="totalItems"
        layout="next"
        @current-change="handlePageChange"
      />
    </div>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style scoped>
.dataset-card {
  margin-bottom: 20px;
  line-height: 1.2;
  font-size: small;
}
.pagination-info {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}
</style>
