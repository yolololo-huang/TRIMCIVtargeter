<script setup lang="ts">
  import { gsap } from 'gsap'
  import { onMounted } from 'vue'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { TextPlugin } from 'gsap/TextPlugin'

  gsap.registerPlugin(ScrollTrigger, TextPlugin)

  onMounted(() => {
    gsap.to('.animated-h2-purple', {
      scrollTrigger: {
        trigger: '.animated-h3',
        start: 'top 50%',
        end: 'bottom 20%',
        toggleActions: 'play none none none',
      },
      duration: 2,
      text: 'Submit your result',
      color: '#8c07dd',
      ease: 'none',
    })
  })
</script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <div class="header-divider-container">
    <hr class="header-divider" />
  </div>
  <el-container class="form-container">
    <el-row class="form-container-row">
      <div class="intro">
        Providing the the gene name of the interested protein or searched by TRIM CIV member, the
        result would guide researchers identify potential targets or the protential TRIMCIV member.
        Aiming to facilitate resource-intensive experiments in exploring the TRIM family, this
        website is free and open to all users, including commercial users, with no login
        requirement.
      </div>

      <AppForm />
    </el-row>
  </el-container>
  <IconArrow />
  <el-main>
    <h2 class="index-titles">Overview</h2>

    <el-popover placement="bottom-start" :width="1024" trigger="hover">
      <template #reference>
        <img src="/tmp/workflow.png" alt="workflow" style="width: 100%" />
      </template>
      <template #default>
        <el-row :gutter="6">
          <el-col :span="6">
            <p>
              The reported TRIM-target pairs was manually curated and features were analyzed in
              struture and 28 cancer types to distingush with the else TRIM group.
            </p>
          </el-col>
          <el-col :span="8">
            <p>
              Leveraging expression data including proteomic and transcriptomic analyses, the logFC
              of targets and their correlation coefficient (R) with TRIM members highlight their
              associations in specific disease contexts. Docking scores reflect unique dimensions of
              TRIM-target interactions based on group-specific targeting domains.
            </p>
          </el-col>
          <el-col :span="10">
            <p>
              These features collectively position each TRIM-target pair within distinct cancer
              types. Reported TRIMCIV-target pairs are used as positive data, while pairs from other
              TRIM groups serve as true negatives, forming the foundation for MS-based and RNA-based
              predictive models for expression in protein level and RNA level respectively.
            </p>
          </el-col>
        </el-row>
      </template>
    </el-popover>

    <p>
      <strong>TRIMCIV's targets Predictor</strong> (<strong>
        <span style="color: #8c07dd">TRIM</span> </strong
      ><span style="color: #8c07dd; font-size: 70%">CIV</span>
      <span style="color: #1e90ff">Targeter</span>) is a web application designed to predict the
      potential target (generally including substrates and interactors) of TRIM family. The
      prediction utilizes the expression level of potential target from the pan-cancer data and the
      physical affinity features between TRIMCIV and targets. The prediction in TRIM family
      addresses current methodological limitations by providing true negative data and involving the
      dimensions of the protein-working background.
      <strong>Hover the above flowchart</strong>
      to see the details of processes from idea to model building. Visiting
      <router-link to="/resource">Data</router-link> and the following cars for more infomartion.
    </p>

    <IconArrow />
    <h2 class="index-titles">Reference Cards</h2>
    <AppReviewLayout />
    <IconArrow />
    <h2 class="index-titles">Contribute your finding</h2>
    <div class="gosubmit-box">
      <h2 class="animated-h2-purple" style="color: #8c07dd; margin-right: 10px"></h2>
      <router-link to="/submit"><IconGo /></router-link>
    </div>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style lang="scss" scoped>
  .header-divider-container {
    background-color: rgb(206, 206, 250);
    display: flex;
    justify-content: center;
  }

  .header-divider {
    width: 980px;
    border: 1px solid white;
    margin: 0; /* 可根据需要调整间距 */
  }
  .intro {
    color: rgb(94, 73, 95);
    margin-left: 10px;
    margin-top: 0px;
    font-size: 1.2rem;
    line-height: 1.5rem;
    margin-bottom: 1rem;
  }

  .form-container {
    padding: 20px;
    background-color: rgb(206, 206, 250);
  }

  .form-container-row {
    max-width: 1024px;
    margin: 0 auto;
    margin-bottom: 20px;
    align-items: center;
    justify-content: center;
  }

  .gosubmit-box {
    --el-box-shadow-dark: 0 0px 20px rgba(143, 118, 255, 0.459);
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    margin-top: 20px;
    box-shadow: var(--el-box-shadow-dark);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center; //vertical center也对齐
  }
</style>
