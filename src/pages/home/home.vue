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


</f7-page>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {

    }
  },
  computed:{
    ...mapState(['messageInfo'])
  },
  methods:{
    ...mapActions(['updateMessageInfo']),
    requestAllMessages(done = function() {}) {
      const self = this;
      lingFetch(
          self,
          "pms.announcement",
          "announcement",{},
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
      const router = self.$f7.views.main.router;
      router.navigate('/noticeDetail?noticeInfo='+JSON.stringify(item))
    }
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