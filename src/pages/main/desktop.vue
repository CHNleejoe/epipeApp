<template>
  <f7-page name="desktop">
    <f7-navbar>
      <f7-nav-left />
      <f7-nav-title>工作台</f7-nav-title>
      <f7-nav-right />
    </f7-navbar>
    <f7-block-title>常用</f7-block-title>
    <div class="desktop-tabs">
      <template v-for="(value, index) in often">
        <a class="desktop-tabs-item" :key="value.href || index" :href="value.href">
          <i :class="'icon ' + value.icon"></i>
          <span>{{value.name}}</span>
        </a>
      </template>
    </div>
    <div class="big-gap-line" />
  </f7-page>
</template>

<style lang="scss" scoped>
  .block-title {
    margin-top: 16px;
  }

  .navbar.no-shadow:before {
    display: none !important;
  }

  .desktop-tabs-item i {
    border-radius: 5px;
  }
</style>


<script>
  import {
    mapState
  } from "vuex";
  // 可显示菜单缓存在全局变量中，如果变量被回收则重新拉取

  var often = [{
      icon: "icon-event-management",
      name: "事件管理",
      href: "/event-management/"
    },
    {
      icon: "icon-photo-management",
      name: "照片",
      href: "/photos-management/"
    },
    {
      icon: "icon-file-disk",
      name: "文件网盘",
      href: "/often/file-disk/"
    },
    // {
    //   icon: "icon-data-board",
    //   name: "数据看板",
    //   href: "/often/data-board/"
    // }
  ];

  export default {
    data() {
      return {
        often,
      };
    },
    methods: {
    },
    // mounted() {
    //   StatusBar.styleLightContent();
    // }
  };
</script>