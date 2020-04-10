<template>
  <f7-page :page-content="false" >
    <f7-toolbar bottom tabbar class=" menu-tab-font" labels style="font-size: 14px;">
      <f7-link tab-link href="./" route-tab-id="home">
        <f7-icon f7='chat_bubble_text'></f7-icon>
        <span>消息</span>
      </f7-link>
      <f7-link tab-link href="desktop/" route-tab-id="desktop">
        <f7-icon f7='table_fill'></f7-icon>

        <span>工作台</span>
      </f7-link>
      <f7-link tab-link href="mine/" route-tab-id="mine">
        <f7-icon material='person'></f7-icon>
        <span>我的</span>
      </f7-link>
    </f7-toolbar>
    <f7-tabs routable>
      <f7-tab class="page-content" id="home"></f7-tab>
      <f7-tab class="page-content" id="desktop"></f7-tab>
      <f7-tab class="page-content" id="mine"></f7-tab>
    </f7-tabs>
  </f7-page>
</template>
<script>
import { mapActions, mapState } from "vuex";

export default {
  mounted() {
    const self = this;
    console.log('router1 :', self.$f7router);
    // console.log('item :', storageProxy.getItem("userInfo"));
    storageProxy.getItem("userInfo").then(result => {
      self.updateLoginInfo(JSON.parse(result))
      self.requestAllMessages()
      self.requestAllDictionaryData()
    })
    // window.WkWebView.allowsBackForwardNavigationGestures(true)
    window.WkWebView.allowsBackForwardNavigationGestures(false)
  },
  computed: {
    ...mapState(['messageInfo', 'dictionaryData'])
  },
  methods:{
    ...mapActions(['updateLoginInfo', 'updateMessageInfo', 'updateDictionaryData']),
    requestAllMessages() {
      const self = this;
      if(self.messageInfo) {
        return
      }
      lingFetch(
          self,
          "pms.message",
          "message",{},
          function (result) {
              // success
              const _resData = result.data
              console.log('_result :', _resData);
              self.updateMessageInfo(_resData)
          },
          function (result) {
              // error
              self.$v.showToast(self,result.msg)
          },{
              hideLoading: true
          }
      );
    },
    requestAllDictionaryData() {
      const self = this;
      if(self.dictionaryData) {
        return
      }
      lingFetch(
          self,
          "pms.public",
          "state_map",{},
          function (result) {
              // success
              const _resData = result.data
              console.log('requestAllDictionaryData result :', _resData);
              self.updateDictionaryData(_resData)
          },
          function (result) {
              // error
              self.$v.showToast(self,result.msg)
          },{
              hideLoading: true
          }
      );
    }
  }
}
</script>

<style>

</style>