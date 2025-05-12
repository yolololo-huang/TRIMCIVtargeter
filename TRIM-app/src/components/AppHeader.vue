<script setup lang="ts"></script>

<template>
  <div class="header-container">
    <h1 class="title">
      <router-link to="/" class="header-link">
        <span style="color: #8c07dd">TRIM</span>
        <span style="color: #8c07dd; font-size: 75%">CIV</span>
        <span style="color: #1e90ff">Targeter</span>
      </router-link>
    </h1>
    <div class="nav-links">
      <router-link to="/" class="nav-link">
        <IEpHomeFilled />
        Home</router-link
      >
      <router-link to="/resource" class="nav-link">
        <IEpFiles />
        Data</router-link
      >
      <router-link to="/help" class="nav-link">
        <IEpQuestionFilled />
        help</router-link
      >
      <router-link to="/privacy" class="nav-link">
        <IEpLock />
        Privacy</router-link
      >
      <router-link to="/contact" class="nav-link">
        <IEpMessage />
        Contact
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .title {
    font-size: 2em;
    display: flex;
    align-items: center; /* 垂直居中 */
  }

  .header-link {
    text-decoration: none;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
  }

  .nav-links {
    display: flex;
    gap: 20px;
  }
</style>
