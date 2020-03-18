<template>
  <f7-page>
    <f7-navbar>
      <f7-nav-left back-link="返回" sliding />
      <f7-nav-title>设置</f7-nav-title>
      <f7-nav-right />
    </f7-navbar>

    <f7-list>
      <f7-list-item title="重置APP" @click="resetSys()">
        <f7-icon slot="media" f7="settings_power"></f7-icon>
      </f7-list-item>
      <f7-list-item title="绑定设备" @click="bindDevice()">
        <f7-icon slot="media" f7="link"></f7-icon>
      </f7-list-item>
      <f7-button fill large color="red" class="logout-button" @click="logout()">退出登录</f7-button>
    </f7-list>

    <f7-list>
      <f7-list-item title="设置背景" link="/setting/background/">
        <f7-icon slot="media" class="icon-setting-background"></f7-icon>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<style scoped>
  .logout-button {
    margin: 10px
  }
</style>

<script>
  // script must return component object
  export default {
    data() {
      return {}
    },
    methods: {
      bindDevice: function () {
        var self = this
        var platformInfo =
          "平台：" +
          self.$u.getPlatformType() +
          "；设备型号：" +
          device.model +
          "；生产厂商：" +
          device.manufacturer;
        lingFetch(self,
          "common.user",
          "bind_device",
          function (result) {
            self.$v.showToast(self, result.msg, false);
          }, {
            uuid: device.uuid || '-1',
            platform_info: platformInfo
          }
        );
      },
      resetSys: function () {
        var self = this;
        self.$v.customConfirmDialog(self,
          "您将会清空APP的所有数据，确认清空吗？",
          "警告！",
          ["确认清空"], [null, function () {
            storageProxy.getItem('saveLogin').then(function (saveLogin) {
              storageProxy.clear().then(function () {
                if (saveLogin) {
                  storageProxy.setItem('saveLogin', saveLogin)
                }
                self.logout()
              })
            })
          }]
        );
      },
      logout: function () {
        var self = this
        window.logout(self)
      }
    },
    on: {
      pageInit: function () {}
    }
  };
</script>