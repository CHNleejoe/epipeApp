<template>
  <f7-page :page-content="false" name='meterList'>
    <f7-toolbar bottom tabbar style="font-size: 16px;">
      <f7-link tab-link href="./" route-tab-id="unread">
        <span>待抄表</span>
      </f7-link>
      <f7-link tab-link href="unconfirmed/" route-tab-id="unconfirmed">
        <span>待确认</span>
      </f7-link>
      <f7-link tab-link href="submitted/" route-tab-id="submitted">
        <span>已确认</span>
      </f7-link>
    </f7-toolbar>
    <f7-tabs routable>
      <f7-tab class="page-content" id="unread"></f7-tab>
      <f7-tab class="page-content" id="unconfirmed"></f7-tab>
      <f7-tab class="page-content" id="submitted"></f7-tab>
    </f7-tabs>
  </f7-page>
</template> 

<script>
import { mapState, mapActions } from "vuex";
import { request } from 'http';
export default {
    data(){
        return{
            unreadPageIndex: 0, // 未抄表请求页码
            unconfirmedPageIndex: 0, // 未确认请求页码
            submittedPageIndex: 0, // 已提交请求页码
            state: 'unread', // 状态数据
            unreadListData: [], // 未抄表数据列表
            unconfirmedListData: [], // 未确认数据列表
            submittedListData: [], // 已提交数据列表
            unreadCount: 0, // 未抄表计数
            unconfirmedCount: 0, // 未确认计数
            submittedCount: 0, // 已提交计数

            showPreloader: true, // show loading加载器
            unreadAllowInfinite: true, 
            unconfirmedAllowInfinite: true, 
            submittedAllowInfinite: true, 

        }
    },
    computed:{
        ...mapState(['loginInfo']),
        isLogin() {
            if(this.loginInfo) return true
            else return false

            storageProxy.getItem('userInfo').then(_e => {
                if(_e) return true
                else return false
            })
        }
    },
    watch:{
        state(val) {
            console.log('state :', val);
            const self = this;
            console.log('state :', self.state, self.count(self[val+'ListData']));

            if (self.count(self[val+'ListData']) >= self[val+'Count']) {
                self.showPreloader = false;
            } else {
                self.showPreloader = true;
            }
        }
    },
    methods: {
        ...mapActions(['updateLoginInfo']),
        requestAllListData(done = function() {}) {
            const self = this
            const router = self.$f7router;
            lingFetch(
                self,
                "pms.reading_task",
                "task_home",{
                },
                function (result) {
                // success
                    const _resData = result.data
                    console.log('_resData :', _resData);
                    self.unreadListData = _resData.unread;
                    self.unconfirmedListData = _resData.unconfirmed;
                    self.submittedListData = _resData.submitted;
                    self.unreadCount = _resData.unreadCount;
                    self.unconfirmedCount = _resData.unconfirmedCount;
                    self.submittedCount = _resData.submittedCount;
                    // self.listData = _resData.task_list
                    // self.count = _resData.count
                    done();
                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                    done();

                },{
                    hideLoading: true
                }
            );
        },
        count(list) {
            var keys = Object.keys(list),
                count = 0
            keys.map(item => [
                count += list[item].length
            ])
            return count
        },
        requestListDataByState(done = function() {}) {
            const self = this
            const router = self.$f7router;
            lingFetch(
                self,
                "pms.reading_task",
                "task_list",{
                    state: self.state,
                    offset: 0
                },
                function (result) {
                // success
                    const _resData = result.data
                    self[self.state+'ListData'] = _resData.task_list
                    self[self.state+'Count'] = _resData.count
                    self[self.state+'AllowInfinite'] = true;
                    self.showPreloader = true;
                    self[self.state+'PageIndex'] = 0
                    done();
                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                    done();

                }
            );
        },
        requestListDataByTabChange(type) {
            const self = this;
            self.state = type;
            self.pageIndex = 0;
            // switch(type) {
            //     case 'unread':
            //     break;
            //     case 'unconfirmed':
            //     break;
            //     case 'submitted':
            //     break;
            // }
            self.requestListData()

        },
        refreshPage(done){
            console.log('refreshPage :');
            this.requestListData(done)
        },
        loadMore() {
            const self = this;
            console.warn('loading more ----', self[self.state+'AllowInfinite'])
            if (!self[self.state+'AllowInfinite']) return;
            self[self.state+'AllowInfinite'] = false;
            console.warn('loading more ---   1-')

            if (self[self.state+'ListData'].length >= self[self.state+'Count']) {
                self.showPreloader = false;
                return;
            }
            console.warn('loading more ---     2-')

            lingFetch(
                self,
                "pms.reading_task",
                "task_list",{
                    state: self.state,
                    offset: 10 * (++self[self.state+'PageIndex'])
                },
                function (result) {
                // success
                    const _resData = result.data
                    self.showPreloader = false;
                    if(Object.keys(_resData.task_list).length == 0) {
                        console.warn('return ----------------------')
                        // self[self.state+'AllowInfinite'] = false;
                        return
                    }
                    var listKeys = Object.keys(self[self.state+'ListData']),
                        listKeysTmp = Object.keys(_resData.task_list)
                    if(listKeys[listKeys.length - 1] === listKeysTmp[0]){
                        self[self.state+'ListData'][listKeys[listKeys.length - 1]] = self[self.state+'ListData'][listKeys[listKeys.length - 1]].concat(_resData.task_list[listKeysTmp[0]])
                        delete(_resData.task_list[listKeysTmp[0]])
                    }
                    self[self.state+'ListData'] = {
                        ...self[self.state+'ListData'],
                        ..._resData.task_list
                    }
                    // self[self.state+'ListData'] += _resData.task_list
                    self[self.state+'Count'] = _resData.count
                    // self[self.state+'PageIndex'] ++
                    self[self.state+'AllowInfinite'] = true;

                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                    self.showPreloader = false;
                    self[self.state+'AllowInfinite'] = true;

                }
            );

        },
        turnToDetailMeterPage(dataItem) {
            const self = this;
            const router = self.$f7.views.main.router
            router.navigate('/checkMeterListDetail?meterTaskId='+dataItem.id)
        }
        
    },
    mounted() {
        const self = this;
        // self.requestAllListData()
    }
}
</script>

<style lang="less" scoped>
    .meter-list{
        .list-content{
        }
        .block-title{
            color: var(--f7-theme-color);
            margin-left: calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left)) !important;
            margin-top: 10px !important;
        }
        .meter-tab{
        }
    }
</style>

