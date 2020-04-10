<template>
    <f7-page :page-content="false" name='meterList'>
        <f7-toolbar bottom tabbar style="font-size: 16px;">
            <f7-link tab-link href="./" route-tab-id="unpaid">
                <span>未支付</span>
            </f7-link>
            <f7-link tab-link href="partial/" route-tab-id="partial">
                <span>部分支付</span>
            </f7-link>
            <f7-link tab-link href="paid/" route-tab-id="paid">
                <span>已支付</span>
            </f7-link>
        </f7-toolbar>
        <f7-tabs routable>
            <f7-tab class="page-content" id="unpaid"></f7-tab>
            <f7-tab class="page-content" id="partial"></f7-tab>
            <f7-tab class="page-content" id="paid"></f7-tab>
        </f7-tabs>
    </f7-page>
</template> 

<script>
import { mapState, mapActions } from "vuex";
import { request } from 'http';
export default {
    data(){
        return{
            unpaidPageIndex: 0, // 未支付请求页码
            partialPageIndex: 0, // 部分支付请求页码
            paidPageIndex: 0, // 已支付请求页码
            state: 'partial', // 状态数据
            unpaidListData: [], // 未支付数据列表
            partialListData: [], // 部分支付数据列表
            paidListData: [], // 已支付数据列表
            unpaidCount: 0, // 未支付计数
            partialCount: 0, // 部分支付计数
            paidCount: 0, // 已支付计数

            showPreloader: true, // show loading加载器
            unpaidAllowInfinite: true, 
            partialAllowInfinite: true, 
            paidAllowInfinite: true, 

        }
    },
    computed:{
        ...mapState(['loginInfo', 'dictionaryData']),
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
                "pms.bill",
                "home",{
                },
                function (result) {
                // success
                    const _resData = result.data
                    console.log('all_resData :', _resData);
                    self.unpaidListData = _resData.unpaid;
                    self.partialListData = _resData.partial;
                    self.paidListData = _resData.paid;
                    self.unpaidCount = _resData.unpaidCount;
                    self.partialCount = _resData.partialCount;
                    self.paidCount = _resData.paidCount;
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
                "pms.bill",
                "bill_list",{
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
            //     case 'unpaid':
            //     break;
            //     case 'partial':
            //     break;
            //     case 'paid':
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
                "pms.bill",
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
        },
        parseDictionaryDataByType(type, name) {
            const self = this;
            return self.dictionaryData[type][name]
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

