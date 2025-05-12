<script lang="ts" setup>
  import { ref, onMounted } from 'vue'

  const isLoading = ref(true)

  const cardData = ref([
    {
      imageUrl: './tmp/familyReview.png',
      title: 'TRIM Family Review',
      linkpage: '/trim-review',
      intro: 'TRIM family protein review page',
    },
    {
      imageUrl: './tmp/pancancerCover.png',
      title: 'Pancancer Landscape',
      linkpage: '/trim-cancer',
      intro: 'TRIM DEG corrrelation in Pancancer',
    },
    {
      imageUrl: './tmp/pairsNetwork.png',
      title: 'TRIM-Targets database',
      linkpage: '/trim-ref',
      intro: 'Substrates and interactors of TRIM family from the curated publications.',
    },
  ])

  onMounted(() => {
    isLoading.value = false
  })
</script>

<template>
  <div class="card-container">
    <el-space direction="horizontal" :size="50" alignment="center">
      <el-skeleton
        v-for="(item, index) in cardData"
        :key="index"
        style="width: 240px"
        :loading="isLoading"
        animated
      >
        <template #default>
          <el-card
            :body-style="{ padding: '14px', marginBottom: '0px' }"
            style="width: 300px; height: 400px; margin-top: 20px; padding: 0px"
          >
            <el-image
              :src="item.imageUrl"
              @click="() => $router.push(item.linkpage)"
              class="clickable-image"
            />
            <div style="padding: 14px">
              <router-link :key="index" :to="item.linkpage" style="font-size: 1.25rem">
                {{ item.title }}</router-link
              >
              <div class="bottom card-header">
                <div class="time">{{ item.intro }}</div>
              </div>
            </div>
          </el-card>
        </template>
      </el-skeleton>
    </el-space>
  </div>
</template>

<style>
  .card-container {
    display: flex;
    justify-content: center;
    align-items: center;
    /* height: 100vh; */
  }

  .el-image {
    width: 100%;
    height: 250px;
    display: block;
    margin: 0 auto;
  }

  .el-card:hover {
    box-shadow: 0 0px 20px rgba(143, 118, 255, 0.459);
    transition: box-shadow 0.3s ease-in-out;
  }

  .clickable-image {
    cursor: pointer;
  }
</style>
