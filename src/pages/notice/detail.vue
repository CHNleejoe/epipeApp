<template>
  <f7-page name="notice">
    <f7-navbar title="公告详情" back-link=""></f7-navbar>
    <f7-block-title>{{noticeInfo.title}}</f7-block-title>
    <f7-block-header>{{noticeInfo.release_date}}</f7-block-header>
    <f7-block strong v-html="noticeInfo.content">
    </f7-block>
    <f7-block strong v-if="noticeInfo.attachment_ids&&noticeInfo.attachment_ids.length!=0">
      <p class="detail-p" v-for="(item, index) in noticeInfo.attachment_ids" :key="index" @click="previewAnyFile(item)">{{item.name}}</p>
    </f7-block>
  </f7-page>
</template>
<script>
export default{
    data() {
        return{
            noticeInfo: ''
        }
    },
    methods: {
        requestData(done = function() {}) {
            const self = this
            const router = self.$f7route;
            lingFetch(
                self,
                "pms.message",
                "message_details",{
                    message_id: JSON.parse(router.query.noticeInfo).id
                },
                function (result) {
                // success
                    const _resData = result.data
                    self.noticeInfo = JSON.parse(router.query.noticeInfo)
                    self.noticeInfo.content = _resData.content
                    self.noticeInfo.attachment_ids = _resData.attachment_ids

                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                },{
                    hideLoading: true
                }
            );
        },
        previewAnyFile(fileItem) {
            alert(JSON.stringify(window.envConfig.HOST + fileItem.url))

          PreviewAnyFile.preview(window.envConfig.HOST + fileItem.url,
            function(win){ 
                if (win == "SUCCESS") {
                    console.log('success') 
                }else{
                    console.log('error')    
                }
                // then dismiss the loader
            }, 
              function(err){
                  console.log('err',err)   
                    // then dismiss the loader  
            });
        }
    },
    mounted() {
        const self = this;
        const router = self.$f7route
        self.noticeInfo = JSON.parse(router.query.noticeInfo)
        self.requestData()
    }
}
</script>
<style lang="less" scoped>
  .detail-p{
    color: cornflowerblue;
    font-size:10px;
    font-family:SourceHanSansCN-Regular,SourceHanSansCN;
    font-weight:400;
    line-height:15px;
  }
</style>