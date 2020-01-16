<template>
  <f7-block class="ling-preload">
    <f7-row class="ling-preload-img">
      <f7-preloader v-if="loadSize" :size=loadSize></f7-preloader>
      <f7-preloader v-else="" size='40'></f7-preloader>
    </f7-row>
    <f7-row class="ling-preload-text" v-if="loadingText">{{loadingText}}</f7-row>
    <f7-row class="ling-preload-text" v-else="">数据加载中...</f7-row>
  </f7-block>
</template>

<style scoped>
  .ling-preload {
    display: flex;
    overflow: hidden;
    justify-content: center;
    height: 100%;
    flex-direction: column;
  }

  .ling-preload-img {
    align-content: center;
    justify-content: center;
  }

  .ling-preload-text {
    align-content: center;
    justify-content: center;
  }
</style>
<script>
  export default {
    props: {
      loadSize: String,
      loadingText: String
    }
  }
</script>