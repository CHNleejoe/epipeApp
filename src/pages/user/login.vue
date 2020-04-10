<template>
  <f7-page no-toolbar no-navbar no-swipeback login-screen>
    <f7-login-screen-title>物业管理系统</f7-login-screen-title>
    <f7-list form id="loginForm" target="frameFile">
      <f7-list-input
      floating-label
      outline
        label="用户名"
        type="text"
        placeholder="请输入您的用户名"
        :value="username"
        @input="username = $event.target.value"
      ></f7-list-input>
      <f7-list-input
      floating-label
      outline
        label="密码"
        type="password"
        placeholder="请输入您的密码"
        :value="password"
        @input="password = $event.target.value"
      ></f7-list-input>
      <iframe name='frameFile' style="display: none;"></iframe>
    </f7-list>
    <f7-list>
      <f7-list-button @click="loginIn">登录</f7-list-button>
      <f7-block-footer>登录物业管理系统，并获取您的个人信息。</f7-block-footer>
    </f7-list>
  </f7-page>
</template>

<script>
import { mapState, mapActions } from "vuex";

  export default {
    data() {
      return {
        username: '',
        password: '',
      };
    },
    mounted() {
      const self = this;
      document.getElementById('loginForm').onsubmit = function(e){
        self.loginIn();
        document.activeElement.blur();
      }
    },
    methods: {
      ...mapActions(['updateLoginInfo']),
      loginIn() {
            // "pms.public",
        const self = this;
        const app = self.$f7;
        const router = self.$f7router;
        lingFetch(
            self,
            "pms.public",
            "app_login",{
                username: self.username,
                password: self.password
            },
            function (result) {
            // success
              const _resData = result.data
              self.updateLoginInfo(_resData)
              storageProxy.setItem("userInfo", JSON.stringify(_resData))
              self.$u.back(self);
            },
            function (result) {
            // error
                self.$v.showToast(self,result.msg)

            }
        );
      },
      
    },
  };
</script>