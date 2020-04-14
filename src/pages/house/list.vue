<template>
    <f7-page
    ptr
    @ptr:refresh="requestListData"
    infinite
    :infinite-distance="20"
    :infinite-preloader="showPreloader"
    @infinite="loadMore"
    no-swipeback
    name='paidPage'
    class="meter-list"
    >
        <f7-panel right resizable >
            <f7-view>
                <f7-page class="tessssss">
                    <f7-block-title>筛选区域</f7-block-title>
                    <f7-list accordion-list>
                        <f7-list-item accordion-item title="管理区域">
                            <f7-accordion-content>
                                <f7-list>
                                    <f7-list-item
                                    class="area-item"
                                    radio
                                    name="area-radio"
                                    :value='item.area_id'
                                    :checked="area_id === item.area_id"
                                    @change="area_id = $event.target.value"
                                    :title="item.area_name"
                                    v-for='(item, index) in areaList'
                                    :key="index"></f7-list-item>
                                </f7-list>
                            </f7-accordion-content>
                        </f7-list-item>
                        <f7-list-item accordion-item title="楼宇">
                            <f7-accordion-content>
                                <f7-list>
                                    <f7-list-item
                                    class="area-item"
                                    radio
                                    name="building-radio"
                                    :value='item.building_id'
                                    :checked="building_id === item.building_id"
                                    @change="building_id = $event.target.value;layer = item.layer"
                                    :title="item.building_name"
                                    v-for='(item, index) in buildingList'
                                    :key="index"></f7-list-item>
                                </f7-list>
                            </f7-accordion-content>
                        </f7-list-item>
                        <f7-list-item accordion-item title="楼层">
                            <f7-accordion-content>
                                <f7-list>
                                    <f7-list-item
                                    class="area-item"
                                    radio
                                    name="floor-radio"
                                    :value='item.floor_id'
                                    :checked="floor === item.floor_id"
                                    @change="floor = $event.target.value"
                                    :title="item.floor_name"
                                    v-for='(item, index) in floorLayer'
                                    :key="index"></f7-list-item>
                                </f7-list>
                            </f7-accordion-content>
                        </f7-list-item>
                    </f7-list>
                    <f7-block-title>房间状态</f7-block-title>
                    <f7-list class="status-radio">
                        <f7-list-item
                        radio
                        title="全部"
                        name="demo-radio"
                        :checked="is_rent == ''"
                        @change="is_rent = ''"
                        ></f7-list-item>
                        <f7-list-item
                        radio
                        title="出租"
                        name="demo-radio"
                        :checked="is_rent == 'true'"
                        @change="is_rent = 'true'"
                        ></f7-list-item>
                        <f7-list-item
                        radio
                        title="空置"
                        name="demo-radio"
                        :checked="is_rent == 'false'"
                        @change="is_rent = 'false'"
                        ></f7-list-item>
                    </f7-list>
                    
                </f7-page>
                <f7-list class='search-btns'>
                    <f7-list-button class="search-btn-item" title="搜索" color="green" @click="searchHouse"></f7-list-button>
                    <f7-list-button class="search-btn-item" title="取消" color="orange" panel-close></f7-list-button>
                </f7-list>
            </f7-view>
        </f7-panel>
        <f7-navbar title="房间列表" back-link="">
            <!-- <f7-button raised panel-open="right" style="margin:none;padding:none;outline:0;" slot="right">筛选</f7-button> -->
            <a slot="right" @click="$f7.panel.open()">筛选</a>
        </f7-navbar>
        <!-- <f7-block class="row">
            <f7-col>
            </f7-col>
        </f7-block> -->
        <f7-list
        media-list
        class="list-content"
        >   
            
            <f7-list-item
                @click="turnToDetailHousePage(item)"
                v-for="(item, index) in listData"
                :key='index'
                link="#"
                :title="item.name"
                :after="item.is_rent?'已租':'空置'"
            >
                <div>所在地址：{{item.area_name}}-{{item.building_name}}-{{item.floor}}楼</div>
                <div>房间状态：<span class="color-orange">{{parseDictionaryData('room','room_state',item.room_state)}}</span></div>
                <div>建筑面积：{{item.construction_area}}</div>
                <div v-if="item.is_rent">租户：{{item.customer_id}}</div>
                <div v-if="item.is_rent">合同编号：{{item.contract}}</div>
            </f7-list-item>

        </f7-list>
        <div class="no-data" v-if="Object.keys(listData).length==0">
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
            pageIndex: 0, // 已提交请求页码
            state: 'paid', // 状态数据
            listData: [], // 已提交数据列表
            listCount: 0, // 已提交计数

            showPreloader: true, // show loading加载器
            allowInfinite: true, 

            is_rent: '', // 是否空置

            allBuidlingData: [], // 全部区域数据
            areaList: [], // 区域数据
            buildingList: [], // 楼宇数据
            floorLayer: [], // 楼层数
            layer:'',

            area_id: '',// 选中的区域id
            building_id: '',// 选中的楼宇id
            floor: '',// 选中的楼层id
        }
    },
    watch: {
        area_id(value) {
            const self = this;
            if(value == '') {
                self.buildingList = []
                return
            }
            var buildingList = [{
                building_id:'',
                building_name:'全部',
                layer: ''
            }]
            self.allBuidlingData.map(item => {
                if(item.area_id == value) buildingList.push({
                    building_id:item.building_id,
                    building_name:item.building_name,
                    layer: item.layer
                })
            })
            console.log('buildingList:',buildingList, value)

            self.buildingList = buildingList
            self.building_id = ''
        },
        building_id(value) {
            const self = this;
            if(value == '') {
                self.floorLayer = []
                return
            }
            var floorLayer = [{
                    floor_id:'',
                    floor_name:'全部'
                }]
            for(let i = 1; i <= self.layer; i++){
                floorLayer.push({
                    floor_id:i,
                    floor_name:i + '楼'
                })
            }

            self.floorLayer = floorLayer
            self.floor = ''
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
        searchHouse() {
            
            const self = this;

            console.warn('checked Area id: ', self.area_id)
            console.warn('checked Building id: ', self.building_id)
            console.warn('checked Floor id: ', self.floor)
            console.warn('checked is_rent: ', self.is_rent)
            
            self.requestListData()

            self.$f7.panel.close()
            
        },
        // 请求房间列表
        requestListData(done = function() {}) {
            const self = this
            const router = self.$f7router;
            lingFetch(
                self,
                "pms.rent_control",
                "room_list",{
                    area_id: self.area_id,
                    building_id : self.building_id,
                    floor: self.floor,
                    is_rent: self.is_rent,
                    offset: 0,
                    limit:10
                },
                function (result) {
                // success
                    const _resData = result.data
                    console.warn('requestListData', _resData)
                    self.listData = _resData.room_list
                    self.listCount = _resData.total_count
                    self.allowInfinite = true;
                    self.showPreloader = false;
                    self.pageIndex = 0
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
        // 请求获取全部楼宇 区域 楼层信息
        requestAllBuildingData(done) {
            const self = this
            const router = self.$f7route;
            lingFetch(
                self,
                "pms.rent_control",
                "all_building",{},
                function (result) {
                // success
                    const _resData = result.data
                    console.warn('all_building data:', _resData)
                    self.allBuidlingData = _resData
                    var areaList = [{
                            area_id:'',
                            area_name:'全部'
                        }]
                    _resData.map(item => {
                        if(!areaList.find(area => {
                            return area.area_id == item.area_id
                        })) areaList.push({
                            area_id:item.area_id,
                            area_name:item.area_name
                        })
                    })
                    console.warn('areaList:',areaList)
                    self.areaList = areaList
                    if(router.query.searchQuery){
                        let searchQuery = JSON.parse(router.query.searchQuery)

                        self.area_id = searchQuery.area_id
                        self.building_id = searchQuery.building_id
                        self.floor = searchQuery.floor
                        self.is_rent = searchQuery.is_rent
                    }
                    if(typeof(done) == 'Function') {
                        done();
                    }
                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)

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
        loadMore() {
            const self = this;
            console.warn('loading more ----', self.allowInfinite)
            if (!self.allowInfinite) return;
            self.allowInfinite = false;
            console.warn('loading more ---   1-')

            if (self.listData.length >= self.listCount) {
                self.showPreloader = false;
                return;
            }
            console.warn('loading more ---     2-')

            lingFetch(
                self,
                "pms.rent_control",
                "room_list",{
                    area_id: self.area_id,
                    building_id : self.building_id,
                    floor: self.floor,
                    is_rent: self.is_rent,
                    limit:10,
                    offset: 10 * (++self.pageIndex)
                },
                function (result) {
                // success
                    const _resData = result.data
                    self.showPreloader = false;
                    if(_resData.room_list.length == 0) {
                        return
                    }
                    _resData.room_list.map(_ => {
                        self.listData.push(_)
                    })
                    
                    self.listCount = _resData.total_count
                    self.allowInfinite = true;

                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                    self.showPreloader = false;
                    self.allowInfinite = true;

                },{
                    hideLoading: true
                }
            );

        },
        turnToDetailHousePage(item) {
            const self = this;
            const router = self.$f7.views.main.router
            router.navigate('/houseDetail?houseId='+item.id)
        }
        
    },
    mounted() {
        const self = this;
        const router = self.$f7route
        
        
        self.requestAllBuildingData()
        self.requestListData()
    }
}
</script>

<style lang="less" scoped>
    .meter-list{
        .opacity{
            opacity: 0;
        }
        .list-content{
            margin-top: 0 !important;
        }
        .block-title{
            color: var(--f7-theme-color);
            margin-left: calc(var(--f7-block-padding-horizontal) + var(--f7-safe-area-left)) !important;
            margin-top: 10px !important;
        }
        .meter-tab{
        }
    }
    .area-item{
        color: #aaa;
    }
    .status-radio{
        margin-bottom: 140px;
    }

    .search-btns{
        position: absolute;
        width: 100%;
        bottom: 0;
        margin: 0;
        .search-btn-item{
            /deep/ .list-button{
                text-align: center;
            }
        }
    }
</style>

