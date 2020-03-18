<template>
  <f7-page name='catelog'>
    <f7-navbar>
      <f7-nav-left />
      <f7-nav-title>我的</f7-nav-title>
      <f7-nav-right />
    </f7-navbar>

    <f7-list media-list>
      <f7-list-item :title="userLoginInfo.userName" :subtitle="userLoginInfo.login" link="/user-info/">
        <img slot="media" :src="userLoginInfo.image_medium" width="44" />
      </f7-list-item>
    </f7-list>
    <f7-list>
      <f7-list-item link="/mine/setting/" title="设置">
        <f7-icon slot="media" material="settings"></f7-icon>
      </f7-list-item>
      <f7-list-item link="/mine/about/" title="关于">
        <f7-icon slot="media" material="info_outline"></f7-icon>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<style scoped>
  .big-text {
    font-size: 18px;
  }
</style>

<script>
  export default {
    data() {
      // var loginInfo = storage.getItem("loginInfo");
      return {
        userLoginInfo: {},
      };
    },
    methods: {},
    mounted() {
      const self = this;
      var userLoginInfo = storageProxy
        .getItem("userLoginInfo")
        .then(function (userLoginInfo) {
          self.userLoginInfo = userLoginInfo
        });
    }
  };
</script>