<script lang="ts" setup>
  import { fetchSymbolOptions, fupdateCancerOptions, fetchRecommendedGNsUid } from '@/services/api'
  import type { FormInstance } from 'element-plus'
  import FormLoading from '@/components/icons/FormLoading.vue'
  import datasetinfo from '@/assets/datasetInfo.json'
  import emailjs from '@emailjs/browser'
  const router = useRouter()
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const loadingStep2 = ref(false)
  const loading_button = ref(false)
  const isFetchUniprotIdsActivated = ref(false)
  const warningSubmit = ref(false)
  const form = reactive({
    geneName: '',
    uniprotId: '',
    cancer: '',
  })

  const rules = {
    geneName: [{ required: true, message: 'Gene Name is required', trigger: 'blur' }],
    uniprotId: [{ required: true, message: 'Uniprot ID is required', trigger: 'blur' }],
    cancer: [{ required: true, message: 'Cancer is required', trigger: 'blur' }],
  }

  const RecommendedOptions = ref<Array<{ gene_name: string; uid: string }>>([])
  const RecommendedGNs = ref<string[]>([])
  const RecommendedGNuid = ref<Array<{ uid: string; label: string }>>([])
  const CancerList = ref<Array<{ abbre: string; disease: string; tableName: string }>>([])

  const cancerMap = new Map()
  const processCancerData = (responseData) => {
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
  const cancerListCache = new Map()
  const fetchCancerList = async () => {
    loading.value = true
    try {
      let responseData
      if (form.geneName) {
        if (cancerListCache.has(form.geneName)) {
          responseData = cancerListCache.get(form.geneName)
        } else {
          responseData = await fupdateCancerOptions(form.geneName, 'Target')
          cancerListCache.set(form.geneName, responseData)
        }
      }
      CancerList.value = processCancerData(responseData)
      console.log('Cancer List:', CancerList.value)
    } catch (error) {
      console.error('Error fetching CancerList:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchGeneNames = async (searchTerm) => {
    loading.value = true
    try {
      RecommendedOptions.value = await fetchSymbolOptions(searchTerm, 'Target')
      RecommendedGNs.value = [
        ...new Set(RecommendedOptions.value.map((option) => option.gene_name)),
      ]
    } catch (error) {
      console.error('Error fetching gene names:', error)
    } finally {
      loading.value = false
    }
  }

  // 监听 form.geneName 的变化
  watch(
    () => form.geneName,
    async (newGeneName) => {
      form.cancer = ''
      if (newGeneName) {
        const newGeneNameuid = RecommendedOptions.value
          .filter((option) => option.gene_name === newGeneName)
          .map((item) => item.uid)
        form.uniprotId = newGeneNameuid[0] || ''
      } else {
        RecommendedGNuid.value = []
        form.uniprotId = ''
      }
    }
  )

  const fetchUniprotIds = async () => {
    loading.value = true
    isFetchUniprotIdsActivated.value = true
    try {
      // IF NOT NONE
      const responseData = await fetchRecommendedGNsUid(form.geneName)
      responseData.forEach((item) => {
        if (item.entry_type === 'reviewed') {
          item.label = `${item.uid}(reviewed)`
        } else {
          item.label = item.uid
        }
      })
      RecommendedGNuid.value = responseData
    } catch (error) {
      console.error('Error fetching uniprot ids:', error)
    } finally {
      loading.value = false
    }
  }
  watch(
    () => form.uniprotId,
    (newUniprotId, oldUniprotId) => {
      const reviewedUid = RecommendedOptions.value
        .filter((option) => option.gene_name === form.geneName)
        .map((item) => item.uid)
      if (
        isFetchUniprotIdsActivated.value &&
        newUniprotId !== oldUniprotId &&
        form.uniprotId !== reviewedUid[0]
      ) {
        ElNotification({
          title: 'Warning',
          message:
            'Uniprot ID has been changed after fetching recommendations. Please ensure this is intentional.',
          type: 'warning',
          offset: 100,
        })
        isFetchUniprotIdsActivated.value = false
        warningSubmit.value = true
      }
    }
  )
  //是否在MySQL中，else left email to inform, emailJS
  const sendRequest = (email, form) => {
    const templateParams = {
      from_name: 'FormGN',
      user_email: email,
      user_name: 'Not name required',
      messages: form,
    }
    emailjs.init({
      publicKey: '1jduY049tSgeBvC_8',
    })
    emailjs.send('service_jdp892o', 'template_sk8ay3t', templateParams).then(
      (response) => {
        ElMessageBox.alert(
          'Sent successfully! Please wait for the results in your inbox.',
          'Success',
          {
            confirmButtonText: 'OK',
            type: 'success',
          }
        )
      },
      (error) => {
        console.log('FAILED...', error)
        ElMessage.error('Please fill in the required fields')
        return false
      }
    )
  }

  const onSubmit = () => {
    if (!formRef.value) return
    formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const formData = {
            ...form,
            cancer: Array.from(
              new Set(
                (Array.isArray(form.cancer) ? form.cancer : [form.cancer]).join(',').split(',')
              )
            ).join(','),
          }

          loading_button.value = false
          const reviewedUid = RecommendedOptions.value
            .filter((option) => option.gene_name === form.geneName)
            .map((item) => item.uid)

          if (warningSubmit.value && form.uniprotId !== reviewedUid[0]) {
            ElMessageBox.prompt(
              'The selected Uniprot ID has not been calculated yet. ' +
                'Processing may take several hours. We highly recommend selecting the Reviewed ID, ' +
                'which is more reliable. If you still wish to proceed with this Uniprot ID, please ' +
                'provide your email below so we can notify you of the results. Note that ' +
                'prediction may fail for some large PDBs.',
              'NOTICE',
              {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                inputPattern:
                  /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
                inputErrorMessage: 'Invalid Email',
                distinguishCancelAndClose: true,
              }
            )
              .then(({ value }) => {
                ElMessage({
                  type: 'success',
                  message: `Your email is: ${value}`,
                })
                sendRequest(value, JSON.stringify(form))
                // Clear form content
                form.geneName = ''
                form.uniprotId = ''
                form.cancer = ''
              })
              .catch(() => {
                ElMessage({
                  type: 'info',
                  message: 'Input canceled',
                })
              })
          } else {
            router.push({
              path: '/result',
              query: {
                geneName: formData.geneName,
                uniprotId: formData.uniprotId,
                cancer: formData.cancer,
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
    <el-form-item label="Step 1: Select the Gene Name" prop="geneName">
      <div>
        <el-select
          remote
          filterable
          clearable
          v-model="form.geneName"
          :remote-method="fetchGeneNames"
          :loading="loading"
          placeholder="Search Protein Name"
        >
          <template #loading>
            <FormLoading />
          </template>
          <el-option
            v-for="item in RecommendedGNs"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
        <el-popover placement="bottom-start" :width="250" trigger="hover">
          <template #reference>
            <p class="custom-hovertopop">
              <IEpQuestionFilled />The one coding your interested protein
            </p>
          </template>
          <template #default>
            <p class="custom-popover">
              The options provided are gene names (13,091) tagged with significant DEG and
              correlated with TRIMCIV in at least one dataset, and successfully docked with TRIMCIV.
              If your input is not recognized, it may indicate that the gene does not provide the
              necessary features for prediction. Ensure that the gene name you enter is one of the
              most
              <strong>common gene names coding for your protein of interest</strong> and check for
              potential errors.
            </p>
          </template>
        </el-popover>
      </div>
    </el-form-item>
    <el-form-item label="Step 2: Select the Uniprot ID" prop="uniprotId">
      <div v-loading="loadingStep2">
        <el-select
          remote
          filterable
          v-model="form.uniprotId"
          :remote-method="fetchUniprotIds"
          :loading="loading"
          :disabled="!form.geneName"
          placeholder="suggested reviewed ID"
        >
          <template #loading>
            <FormLoading />
          </template>
          <el-option
            v-for="item in RecommendedGNuid"
            :key="item.uid"
            :label="item.label"
            :value="item.uid"
          ></el-option>
        </el-select>
        <el-popover placement="bottom-start" :width="250" trigger="hover">
          <template #reference>
            <p class="custom-hovertopop">
              <IEpQuestionFilled />Default the reviewed PDB of the input Gene Name
            </p>
          </template>
          <template #default>
            <p class="custom-popover">
              The default PDB for the selected gene name is the top reviewed PDB (Swiss-Prot) from
              the Alphafold database. Using the default PDB is highly recommended. You can still
              switch to another Uniprot ID for the selected gene by clicked the above frame, but
              note that this requires additional prediction time.
            </p>
          </template>
        </el-popover>
      </div>
    </el-form-item>
    <el-form-item label="Step 3: Selected cancer(s)" prop="cancer">
      <div>
        <el-select
          remote
          multiple
          clearable
          filterable
          v-model="form.cancer"
          :remote-method="fetchCancerList"
          :loading="loading"
          placeholder="at least one cancer"
          :disabled="!form.geneName"
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
            <p class="custom-hovertopop"><IEpQuestionFilled /> Dataset options depend on Step1</p>
          </template>
          <template #default>
            <p class="custom-popover">
              Only datasets that include the selected gene name as differentially expressed gene
              (DEG) will be listed in the options.
            </p>
          </template>
        </el-popover>
      </div>
    </el-form-item>
  </el-form>
  <div style="text-align: right; margin-top: -10px">
    <FormLoading v-if="loading_button" />
    <!-- <el-button type="info" @click="autofill">Example</el-button> -->
    <el-button type="primary" @click="onSubmit">Predict</el-button>
  </div>
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
