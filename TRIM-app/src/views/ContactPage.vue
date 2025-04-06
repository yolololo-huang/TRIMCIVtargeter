<script setup lang="ts">
import emailjs from '@emailjs/browser'

const form = ref({
  name: '',
  email: '',
  message: ''
})

const sendEmail = async () => {
  try {
    const templateParams = {
      form_name: 'Contact page',
      user_name: form.value.name,
      user_email: form.value.email,
      message: form.value.message
    }

    // Send the user's email
    await emailjs.send('service_jdp892o', 'template_sk8ay3t', templateParams, '1jduY049tSgeBvC_8')

    // Send the auto-reply email
    const autoReplyParams = {
      to_name: form.value.name,
      to_email: form.value.email,
      form_name: 'Contact page',
      message: 'Thank you for contacting us. We will process your feedback shortly.'
    }
    await emailjs.send('service_jdp892o', 'template_yoxcvqt', autoReplyParams, '1jduY049tSgeBvC_8')

    ElMessageBox.alert('Submit success! Thank you for your feedback.', 'Success', {
      confirmButtonText: 'OK',
      type: 'success'
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    ElMessage.error('Failed to send your message. Please try again later.')
  }
}
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <el-main>
    <!-- <p><IEpAvatar />Yisha Huang</p>
      <p>Email: <a href="mailto:yolololohuang@outlook.com">yolololohuang@outlook.com</a></p>
      <hr />
      <p><IEpAvatar />Wanting Liu</p>
      <p>Email: <a href="mailto:wtliu@jnu.edu.cn">wtliu@jnu.edu.cn</a></p> -->
    <el-row>
      <el-col :span="2">
        <h3 style="text-align: center">
          <IEpSchool style="color: #1e90ff; font-size: 24px" />
        </h3>
      </el-col>
      <el-col :span="22">
        <p style="display: flex">
          MOE Key Laboratory of Tumor Molecular Biology and Key Laboratory of Functional Protein;
          Research of Guangdong Higher Education Institutes; Institute of Life and Health
          Engineering; College of Life Science and Technology, Jinan University; Guangzhou, 510632
          China
        </p>
      </el-col>
    </el-row>

    <h2 style="text-align: center">Contact Us</h2>
    <div class="purple-box">
      <el-form
        :model="form"
        @submit.prevent="sendEmail"
        label-position="right"
        label-width="auto"
        status-icon
        style="width: 600px"
      >
        <el-form-item label="Email">
          <el-input v-model="form.email" type="email" required></el-input>
        </el-form-item>

        <el-form-item label="Name">
          <el-input v-model="form.name" required></el-input>
        </el-form-item>

        <el-form-item label="Feedback">
          <el-input v-model="form.message" type="textarea" required :rows="4"></el-input>
        </el-form-item>

        <el-form-item style="text-align: center">
          <el-button type="primary" native-type="submit">Send Feedback</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style scoped></style>
