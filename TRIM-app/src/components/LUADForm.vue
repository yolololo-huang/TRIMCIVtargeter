<script lang="ts" setup>
  import type { FormInstance } from 'element-plus'
  import { LUADfetchSymbolOptions } from '@/services/luadapi'
  const router = useRouter()
  const props = defineProps<{ type: String }>()
  const loading = ref(false)
  const loading_button = ref(false)
  const formRef = ref<FormInstance>()
  const form = reactive({ symbol: '', type: '' })
  const rules = {
    Symbol: [{ required: true, message: 'TRIM Name is required', trigger: 'blur' }],
  }
  const SymbolsCache = new Map()
  const RecommendedOptions = ref<{ value: string; label: string }[]>([])
  const fetchSymbols = async (searchTerm) => {
    loading.value = true
    try {
      let options
      if (SymbolsCache.has(searchTerm)) {
        options = SymbolsCache.get(searchTerm)
      } else {
        options = await LUADfetchSymbolOptions(searchTerm, props.type)
        SymbolsCache.set(searchTerm, options)
      }

      // Assign the options to RecommendedOptions.value
      RecommendedOptions.value = options.map((option) => ({
        label: option,
        value: option,
      }))
    } catch (error) {
      console.error('Error fetching TRIM options:', error)
    } finally {
      loading.value = false
    }
  }
  const onSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          loading_button.value = false
          if (props.type === 'gene') {
            router.push({
              path: '/luad_result',
              query: {
                geneName: form.symbol,
              },
            })
          } else {
            router.push({
              path: '/luad_resultbyTRIM',
              query: {
                TRIMname: form.symbol,
              },
            })
          }
        } catch (error) {
          console.error('Error submitting form:', error)
        }
      } else {
        console.log('error submit!')
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
    <el-form-item>
      <el-select
        clearable
        remote
        :remote-method="fetchSymbols"
        filterable
        v-model="form.symbol"
        :loading="loading"
        placeholder="Search TRIMCIV member"
      >
        <template #loading>
          <FormLoading />
        </template>
        <el-option
          v-for="item in RecommendedOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
    <FormLoading v-if="loading_button" />
    <el-button type="primary" @click="onSubmit">Predict</el-button>
  </el-form>
</template>

<style lang="scss">
  .demo-form-inline .el-input {
    --el-input-width: 220px;
  }

  .demo-form-inline .el-select {
    --el-select-width: 220px;
  }

  .demo-form-inline .el-form-item__label {
    font-size: 15px;
    // font-weight: bold;
    color: rgb(94, 73, 95);
  }

  .el-button {
    margin-right: 40px;
    width: 220px; /* Increase the width */
  }
</style>
