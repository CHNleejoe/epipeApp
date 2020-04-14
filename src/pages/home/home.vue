<template>
<f7-page
  ptr
  @ptr:refresh="requestAllMessages"
>
    <f7-navbar title="消息">
      <a href="#" slot="left"> </a>
      <a href="#" slot="right"> </a>
    </f7-navbar>
    <f7-list media-list class="message-list">
      <f7-list-item
        v-for="(item, index) in messageInfo"
        :key="index"
        :title="item.title"
        :after='item.release_date'
        link='#'
        @click="turnToDetail(item)"
        >
        <div slot="inner" class="message-p" v-html="item.content"></div>
        <img slot="media" src="../../img/placeholder.png" width="44" />
      </f7-list-item>
    </f7-list>
    <div class="no-data" v-if="!messageInfo||Object.keys(messageInfo).length==0">
        <img src="../../img/no-data.png" alt="">
    </div>

</f7-page>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      messageDetailAccess: false
    }
  },
  computed:{
    ...mapState(['messageInfo', 'dictionaryData'])
  },
  methods:{
    ...mapActions(['updateMessageInfo']),
    requestAllMessages(done = function() {}) {
      const self = this;
      lingFetch(
          self,
          "pms.message",
          "message",{},
          function (result) {
              // success
              const _resData = result.data
              self.updateMessageInfo(_resData)
              done();
          },
          function (result) {
              // error
              self.$v.showToast(self,result.msg)
              done();
          }
      );
    },
    turnToDetail(item) {
      const self = this;
      const router = self.$f7router;
      if(self.messageDetailAccess) router.navigate('/noticeDetail?noticeInfo='+JSON.stringify(item))
      else self.$v.showToast(self, '对不起，您无权限查看详情')
    }
  },
  mounted() {
    const self = this;
    self.dictionaryData?self.messageDetailAccess = self.dictionaryData.menus.message.items.customer_message:''

  }
}
</script>

<style lang="less" scoped>
  .message-list{
    margin-top: 0;
    /deep/ .message-p{
    p{
      margin: 0 !important;
      text-overflow: ellipsis;
      font-size: 14px;
      color: #808080;
      overflow: hidden;
      white-space: nowrap;
    }
  }
  }
</style>