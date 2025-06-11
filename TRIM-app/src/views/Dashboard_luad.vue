<script setup lang="ts"></script>

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
        <el-tabs type="card" class="demo-tabs" style="box-shadow: var(--el-box-shadow-dark)">
          <el-tab-pane label="Predicted by Gene Names">
            <LUADForm :type="'gene'" />
          </el-tab-pane>

          <el-tab-pane label="Predicted by TRIMCIV member">
            <LUADForm :type="'TRIM'" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-row>
  </el-container>
  <IconArrow />
  <el-main> LUAD_knn_k3 model </el-main>
</template>

<style lang="scss">
  .demo-tabs {
    --el-box-shadow-dark: 0 15px 20px rgba(143, 118, 255, 0.459);

    background-color: rgba(255, 255, 255, 0.319);
    border-radius: 4px;
  }

  .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }

  .el-tabs__item {
    color: rgba(94, 73, 95, 0.527);
    font-weight: bold;
  }
</style>
