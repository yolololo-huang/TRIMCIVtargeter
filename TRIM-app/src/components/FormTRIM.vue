<script setup lang="ts">
  import type { FormInstance } from 'element-plus'
  import datasetinfo from '@/assets/datasetInfo.json'
  import { fetchSymbolOptions } from '@/services/api'

  const loading = ref(false)
  const loadingStep2 = ref(false)
  const loading_button = ref(false)
  const router = useRouter()

  const formRef = ref<FormInstance>()
  const form = reactive({
    TRIMname: '',
    uniprotId: '',
    cancer: '',
  })

  const rules = {
    TRIMname: [{ required: true, message: 'TRIM Name is required', trigger: 'blur' }],
    uniprotId: [{ required: true, message: 'Uniprot ID is required', trigger: 'blur' }],
    cancer: [{ required: true, message: 'Cancer is required', trigger: 'blur' }],
  }

  interface CancerItem {
    abbre: string
    disease: string
    tableName: string
  }

  const CancerList = ref<CancerItem[]>([])
  const RecommendedTRIMs = ref([])

  const processCancerData = (responseData) => {
    const cancerMap = new Map()
    datasetinfo
      .filter((item) => responseData.includes(item.tableName))
      .forEach((item) => {
        const key = `${item.abbre} (${item.disease})`
        if (!cancerMap.has(key)) {
          cancerMap.set(key, {
            abbre: item.abbre,
            disease: item.disease,
            tableName: item.tableName,
          })
        } else {
          const existingItem = cancerMap.get(key)
          existingItem.tableName += `,${item.tableName}`
        }
      })
    return Array.from(cancerMap.values())
  }
  const trimCache = new Map()

  const fetchTRIM = async (searchTerm) => {
    loading.value = true
    try {
      let options
      if (trimCache.has(searchTerm)) {
        options = trimCache.get(searchTerm)
      } else {
        options = await fetchSymbolOptions(searchTerm, 'TRIM')

        trimCache.set(searchTerm, options)
      }
      RecommendedTRIMs.value = options.map((option) => option.gene_name)
    } catch (error) {
      console.error('Error fetching TRIM options:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchCancerList = () => {
    loading.value = true
    try {
      if (form.TRIMname) {
        const cachedOptions = Array.from(trimCache.values()).flat()
        const selectedTRIM = cachedOptions.find((option) => option.gene_name === form.TRIMname)

        if (selectedTRIM) {
          const datasets = selectedTRIM.dataset.split(';').map((item) => item.toLowerCase())
          CancerList.value = processCancerData(datasets)
        } else {
          console.error('No matching TRIM found in cache for', form.TRIMname)
        }
      } else {
        console.error('form.TRIMname is not defined')
      }
    } catch (error) {
      console.error('Error fetching cancer list:', error)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => form.TRIMname,
    async (newTRIMname) => {
      form.cancer = ''
      if (newTRIMname) {
        const newTRIMnameuid = Array.from(trimCache.values())
          .flat()
          .find((option) => option.gene_name === form.TRIMname)

        form.uniprotId = newTRIMnameuid.uid
      } else {
        form.uniprotId = ''
      }
    }
  )

  const onSubmit = () => {
    formRef.value?.validate(async (valid) => {
      if (valid) {
        try {
          const formData = {
            ...form,
            cancer: Array.from(
              new Set(
                (Array.isArray(form.cancer) ? form.cancer : [form.cancer]).join(',').split(',')
              )
            ).join(','), // 将数组转换为逗号分隔的字符串
          }
          loading_button.value = false

          ElMessage({
            type: 'success',
            message: 'Form submitted successfully',
          })

          router.push({
            path: '/resultbyTRIM',
            query: {
              TRIMname: formData.TRIMname,
              uniprotId: formData.uniprotId,
              cancer: formData.cancer,
            },
          })
        } catch (error) {
          console.error('Error submitting form:', error)
          ElMessage({
            type: 'error',
            message: 'Failed to submit form',
          })
          loading_button.value = false
        }
      }
    })
  }
</script>

<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="form"
    :rules="rules"
    label-position="top"
    class="demo-form-inline"
  >
    <el-form-item label="Step 1: Select a TRIMCIV memeber" prop="TRIMname">
      <div>
        <el-select
          clearable
          remote
          :remote-method="fetchTRIM"
          filterable
          v-model="form.TRIMname"
          :loading="loading"
          placeholder="Search TRIMCIV member"
        >
          <template #loading>
            <FormLoading />
          </template>
          <el-option
            v-for="item in RecommendedTRIMs"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
        <el-popover placement="bottom-start" :width="250" trigger="hover">
          <template #reference>
            <p class="custom-hovertopop"><IEpQuestionFilled />17 TRIMCIV members optional</p>
          </template>
          <template #default>
            <p class="custom-popover">
              Note that only 17 TRIMCIV members are available for selection, as they are expressed
              at the protein level across pan-cancer datasets. This restriction ensures balanced and
              confident predictions from the two models.
            </p>
          </template>
        </el-popover>
      </div>
    </el-form-item>
    <el-form-item label="Step 2: Uniprot ID of the input TRIM" prop="uniprotId">
      <div v-loading="loadingStep2">
        <el-select
          clearable
          remote
          filterable
          v-model="form.uniprotId"
          :loading="loading"
          :disabled="!form.TRIMname"
          placeholder="C-domain of TRIM PDB"
        >
        </el-select>
        <el-popover placement="bottom-start" :width="250" trigger="hover">
          <template #reference>
            <p class="custom-hovertopop"><IEpQuestionFilled />Default reviewed PDB</p>
          </template>
          <template #default>
            <p class="custom-popover">
              The default PDB of selected TRIM member.
              <router-link :to="{ path: '/trim-review', hash: '#TRIMheatmap' }"
                >C-domains</router-link
              >
              was extract out and widely docked with qualified proteins.
            </p>
          </template>
        </el-popover>
      </div>
    </el-form-item>
    <el-form-item label="Step 3: Selected disease(s)" prop="cancer">
      <div>
        <el-select
          remote
          multiple
          clearable
          filterable
          :remote-method="fetchCancerList"
          v-model="form.cancer"
          :loading="loading"
          placeholder="at least one cancer"
          :disabled="!form.TRIMname"
        >
          <template #loading>
            <FormLoading />
          </template>
          <el-option
            v-for="item in CancerList"
            :key="item.tableName"
            :label="`${item.abbre} (${item.disease})`"
            :value="item.tableName"
          ></el-option>
        </el-select>
        <el-popover placement="bottom-start" :width="250" trigger="hover">
          <template #reference>
            <p class="custom-hovertopop"><IEpQuestionFilled />Dataset options depend on Step1</p>
          </template>
          <template #default>
            <p class="custom-popover">
              Only datasets that include the selected TRIMCIV member will be listed in the options.
            </p>
          </template>
        </el-popover>
      </div>
    </el-form-item>
  </el-form>
  <div style="text-align: right; margin-top: -10px">
    <FormLoading v-if="loading_button" />
    <el-button type="primary" @click="onSubmit">Predict</el-button>
  </div>
</template>

<style scoped></style>
