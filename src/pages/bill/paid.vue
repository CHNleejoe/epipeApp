<template>
    <f7-page
    ptr
    @ptr:refresh="requestListDataByState"
    infinite
    :infinite-distance="20"
    :infinite-preloader="showPreloader"
    @infinite="loadMore"
    no-swipeback
    name='paidPage'
    class="meter-list"
    >
        <f7-navbar title="账单" back-link="">
            <div slot="right" class="opacity">0000</div>
        </f7-navbar>
        
        <f7-list
        media-list
        v-for="(month, key) in Object.keys(paidListData)"
        :key='key'
        class="list-content"
        >
            <f7-block-title>{{month}}月账单</f7-block-title>
            <f7-list-item
                @click="turnToDetailMeterPage(item)"
                v-for="(item, index) in paidListData[month]"
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
        <div class="no-data" v-if="Object.keys(paidListData).length==0">
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
            paidPageIndex: 0, // 已提交请求页码
            state: 'paid', // 状态数据
            paidListData: [], // 已提交数据列表
            paidCount: 0, // 已提交计数

            showPreloader: true, // show loading加载器
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
        parseDictionaryData(typeOut, type, name) {
            const self = this
            console.warn(self.dictionaryData, type, name)
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
                    self.paidListData = _resData.bill_list
                    self.paidCount = _resData.count
                    self.paidAllowInfinite = true;
                    self.showPreloader = false;
                    self.paidPageIndex = 0
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
        requestListDataByTabChange(type) {
            const self = this;
            self.state = type;
            self.pageIndex = 0;
            // switch(type) {
            //     case 'unread':
            //     break;
            //     case 'unconfirmed':
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
            console.warn('loading more ----', self.paidAllowInfinite)
            if (!self.paidAllowInfinite) return;
            self.paidAllowInfinite = false;
            console.warn('loading more ---   1-')

            if (self.paidListData.length >= self.paidCount) {
                self.showPreloader = false;
                return;
            }
            console.warn('loading more ---     2-')

            lingFetch(
                self,
                "pms.bill",
                "bill_list",{
                    state: self.state,
                    offset: 10 * (++self.paidPageIndex)
                },
                function (result) {
                // success
                    const _resData = result.data
                    self.showPreloader = false;
                    if(Object.keys(_resData.bill_list).length == 0) {
                        console.warn('return ----------------------')
                        // self.paidAllowInfinite = false;
                        return
                    }
                    var listKeys = Object.keys(self.paidListData),
                        listKeysTmp = Object.keys(_resData.bill_list)
                    if(listKeys[listKeys.length - 1] === listKeysTmp[0]){
                        self.paidListData[listKeys[listKeys.length - 1]] = self.paidListData[listKeys[listKeys.length - 1]].concat(_resData.bill_list[listKeysTmp[0]])
                        delete(_resData.bill_list[listKeysTmp[0]])
                    }
                    self.paidListData = {
                        ...self.paidListData,
                        ..._resData.bill_list
                    }
                    // self.paidListData += _resData.bill_list
                    self.paidCount = _resData.count
                    // self.paidPageIndex ++
                    self.paidAllowInfinite = true;

                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                    self.showPreloader = false;
                    self.paidAllowInfinite = true;

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

