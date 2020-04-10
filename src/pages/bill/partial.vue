<template>
    <f7-page
    ptr
    @ptr:refresh="requestListDataByState"
    infinite
    :infinite-distance="20"
    :infinite-preloader="showPreloader"
    @infinite="loadMore"
    no-swipeback
    name='partialPage'
    class="meter-list"
    >
        <f7-navbar title="账单" back-link="">
            <div slot="right" class="opacity">0000</div>
        </f7-navbar>
        <f7-list
        media-list
        v-for="(month, key) in Object.keys(partialListData)"
        :key='key'
        class="list-content"
        >
            <f7-block-title>{{month}}月账单</f7-block-title>
            <f7-list-item
                @click="turnToDetailMeterPage(item)"
                v-for="(item, index) in partialListData[month]"
                :key='index'
                link="#"
                :title="item.customer_name"
                :after="item.date_group"
            >
                <div>费用月份：{{item.cost_date}}</div>
                <div>租赁房产信息：{{item.contracts}}</div>
                <div>收费项目：<span class="color-orange">{{parseDictionaryData('bill','bill_type',item.type)}}</span></div>
                <!-- <div>应付日期：{{item.instrument_name}}</div> -->
                <div>账单起始日期：{{item.start_date}}</div>
                <div>账单截止日期：{{item.end_date}}</div>
                <div>应付金额：{{item.total_amount}}</div>
            </f7-list-item>

        </f7-list>
        <div class="no-data" v-if="Object.keys(partialListData).length==0">
            <img src="../../img/no-data.png" alt="">
        </div>
    </f7-page>
</template>
<script>
import { mapState, mapActions } from "vuex";
import { request } from 'http';
export default {
    data(){
        return{
            partialPageIndex: 0, // 请求页码
            state: 'partial', // 状态数据
            partialListData: [], // 数据列表
            partialCount: 0, // 计数

            showPreloader: true, // show loading加载器
            partialAllowInfinite: true, 

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
        parseDictionaryData(typeOut, type, name) {
            const self = this
            return self.dictionaryData[typeOut][type][name]
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
                    self.partialListData = _resData.bill_list
                    self.partialCount = _resData.count
                    self.partialAllowInfinite = true;
                    self.showPreloader = false;
                    self.partialPageIndex = 0
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
        refreshPage(done){
            console.log('refreshPage :');
            this.requestListData(done)
        },
        loadMore() {
            const self = this;
            console.warn('loading more ----', self.partialAllowInfinite)
            if (!self.partialAllowInfinite) return;
            self.partialAllowInfinite = false;
            console.warn('loading more ---   1-')

            if (self.partialListData.length >= self.partialCount) {
                self.showPreloader = false;
                return;
            }
            console.warn('loading more ---     2-')

            lingFetch(
                self,
                "pms.bill",
                "bill_list",{
                    state: self.state,
                    offset: 10 * (++self.partialPageIndex)
                },
                function (result) {
                // success
                    const _resData = result.data
                    self.showPreloader = false;
                    if(Object.keys(_resData.bill_list).length == 0) {
                        console.warn('return ----------------------')
                        // self.partialAllowInfinite = false;
                        return
                    }
                    var listKeys = Object.keys(self.partialListData),
                        listKeysTmp = Object.keys(_resData.bill_list)
                    if(listKeys[listKeys.length - 1] === listKeysTmp[0]){
                        self.partialListData[listKeys[listKeys.length - 1]] = self.partialListData[listKeys[listKeys.length - 1]].concat(_resData.bill_list[listKeysTmp[0]])
                        delete(_resData.bill_list[listKeysTmp[0]])
                    }
                    self.partialListData = {
                        ...self.partialListData,
                        ..._resData.bill_list
                    }
                    // self.partialListData += _resData.bill_list
                    self.partialCount = _resData.count
                    // self.partialPageIndex ++
                    self.partialAllowInfinite = true;

                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                    self.showPreloader = false;
                    self.partialAllowInfinite = true;

                },{
                    hideLoading: true
                }
            );

        },
        turnToDetailMeterPage(dataItem) {
            const self = this;
            const router = self.$f7.views.main.router
            router.navigate('/billListDetail?billId='+dataItem.id)
        }
        
    },
    mounted() {
        const self = this;
        self.requestListDataByState()
    }
}
</script>

<style lang="less" scoped>
    .meter-list{
        .opacity{
            opacity: 0;
        }
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

