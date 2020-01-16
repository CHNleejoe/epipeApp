<template>
  <f7-page name="notice">
    <f7-navbar title="公告详情" back-link=""></f7-navbar>
    <f7-block-title>{{noticeInfo.title}}</f7-block-title>
    <f7-block-header>{{noticeInfo.release_date}}</f7-block-header>
    <f7-block strong v-html="noticeInfo.content">
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
        
    },
    mounted() {
        const self = this;
        const router = self.$f7route
        console.log('router.query.noticeInfo',router.query.noticeInfo)
        self.noticeInfo = JSON.parse(router.query.noticeInfo)
    }
}
</script>
<style lang="less" scoped>

</style>