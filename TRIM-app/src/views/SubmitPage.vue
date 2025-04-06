<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormItemRule, FormInstance } from 'element-plus'
import { submitNew } from '@/services/api'
import emailjs from '@emailjs/browser'

const formRef = ref<FormInstance | null>(null)
const form = ref({
  TRIM: '',
  target: '',
  target_uid: '',
  disease: '',
  evidence: '',
  level: '',
  citation: '',
  messages: '',
  name: '',
  email: ''
})

// Use a ref for dynamic rules
const formRules = ref<Record<string, FormItemRule[]>>({
  TRIM: [{ required: true, message: 'Please input the TRIM member', trigger: 'blur' }],
  target: [{ required: true, message: 'Please input the target name', trigger: 'blur' }],
  target_uid: [{ required: true, message: 'Please input the Uniprot ID', trigger: 'blur' }],
  disease: [{ required: true, message: 'Please input the disease', trigger: 'blur' }],
  evidence: [{ required: true, message: 'Please select the evidence', trigger: 'change' }],
  level: [{ required: true, message: 'Please select the target level ', trigger: 'change' }],
  citation: [
    {
      required: form.value.evidence === 'TRUE',
      message: 'Please input the citation of the published paper',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: 'Please input your email', trigger: 'blur' },
    { type: 'email', message: 'Please input a valid email address', trigger: ['blur', 'change'] }
  ]
})

watch(
  () => form.value.evidence,
  (newVal) => {
    if (newVal === 'TRUE') {
      formRules.value.citation[0].required = true
    } else {
      formRules.value.citation[0].required = false
    }
  }
)

const onSubmit = () => {
  formRef.value?.validate(async (valid) => {
    try {
      if (valid) {
        const response = await submitNew(form.value)
        const templateParams = {
          from_name: 'SubmitPage',
          messages: form.value.messages,
          user_name: form.value.name,
          user_email: form.value.email
        }
        emailjs.init({
          publicKey: '1jduY049tSgeBvC_8'
        })

        emailjs.send('service_jdp892o', 'template_sk8ay3t', templateParams).then(
          (response) => {
            ElMessageBox.alert('Submit success! Thank you for your contribution.', 'Success', {
              confirmButtonText: 'OK',
              type: 'success'
            })
          },
          (error) => {
            ElMessage.error('Submission failed. Please try again.')
          }
        )
      } else {
        ElMessage.error('Please fill in the required fields')
        return
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  })
}

const onReset = () => {
  formRef.value?.resetFields()
}
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <el-main>
    <h2 class="index-titles">Submit your result</h2>
    <div class="purple-box">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        style="max-width: 600px"
        label-position="right"
        size="large"
        label-width="auto"
        status-icon
        class="submit-form"
      >
        <h4>Your Research</h4>
        <el-form-item label="TRIM member" prop="TRIM">
          <el-input v-model="form.TRIM" placeholder="The investigated TRIM member" />
        </el-form-item>
        <el-alert type="info" show-icon :closable="false" class="submit-alert">
          <p style="line-height: 1.5; text-align: left">
            Please leave the Protein Name and the Uniprot ID of the target you found it's the
            substrate or interactor of TRIM member
          </p>
        </el-alert>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Target name" prop="target">
              <el-input v-model="form.target" placeholder="Protein name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Uniprot ID" prop="target_uid">
              <el-input v-model="form.target_uid" placeholder="Uniprot ID of the target" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Target level" prop="level">
          <el-radio-group v-model="form.level">
            <el-radio label="substrate">Substrate</el-radio>
            <el-radio label="interactor">Interactor</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-alert type="info" show-icon :closable="false" class="submit-alert">
          <p style="line-height: 1.5; text-align: left">
            Please leave the Full Name of the Disease to provide more information instead of its
            abbreviation
          </p>
        </el-alert>
        <el-form-item label="Disease" prop="disease">
          <el-input v-model="form.disease" placeholder="The investigated disease" />
        </el-form-item>
        <el-form-item label="Evidence" prop="evidence">
          <el-radio-group v-model="form.evidence">
            <el-radio label="TRUE">Published Paper</el-radio>
            <el-radio label="FALSE">Under Published</el-radio>
          </el-radio-group>
          <el-input
            v-if="form.evidence === 'TRUE'"
            v-model="form.citation"
            placeholder="citation of the published paper"
          />
        </el-form-item>
        <el-form-item label="Messages">
          <el-input
            v-model="form.messages"
            type="textarea"
            placeholder="other message you want to leave"
            :rows="4"
          />
        </el-form-item>
        <h4>Contact Information</h4>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" placeholder="Leave us the Email to contact you" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="form.name" placeholder="What should we call you?" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">Submit</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style scoped>
.el-form-item:last-child {
  display: flex;
  justify-content: space-between;
}
</style>
