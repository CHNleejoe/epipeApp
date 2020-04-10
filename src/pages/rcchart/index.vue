<template>
  <f7-page name='RCChart' no-swipe class="rcchart">
    <f7-navbar title="租控图" back-link=""></f7-navbar>
    <div class="chart-head">
      <div class="inp" @click="openManagePicker"><input type="text" placeholder="管理区域" readonly="readonly" :value='checkedManageLabel'/></div>
      <div class="inp" @click="openBuildingPicker"><input type="text" placeholder="楼宇" readonly="readonly" :value='checkedBuildingLabel'/></div>
      <div class="inp" @click="openFloorPicker"><input type="text" placeholder="楼层" readonly="readonly" :value='checkedFloorLabel'/></div>
    </div>
  
    <f7-block class="area">
      <div :class="'chart-area ' + item.class" v-for="(item, index) in headList" :key="index">
        <div class="area-head">
          <i></i>
          <span>{{item.label}}</span>
        </div>
        <div class="area-num">{{rrchartAllCalcData['area_'+item.class]}}</div>
        <div class="area-line">
          <div class="line-inner" :style="'width:' + rrchartAllCalcData['area_'+item.class + '_per'] + '%;'"></div>
        </div>
      </div>
    </f7-block>
      
    <f7-block class="data-block">
      <div class="b-title">华瀚创新科技园</div>

      <div v-if="!isShowRoom">
        <div class="data-block" v-for="(outItem, outIndex) in Object.keys(rrchartData)" :key="outIndex">
          <div class="data-title">{{outItem}}</div>
          <div class="data-box">
            <div :class="{'detail-block':true,'empty':false,'rented':true}" @click="turnToHouseList(outItem,'true')">
              <p class="p-title">在租面积</p>
              <p>{{rrchartData[outItem].idle_area}}m²</p>
              <p>{{rrchartData[outItem].idle}}间</p>
            </div>

            <div :class="{'detail-block':true,'empty':true,'rented':false}" @click="turnToHouseList(outItem,'false')">
              <p class="p-title">空置面积</p>
              <p>{{rrchartData[outItem].lease_area}}m²</p>
              <p>{{rrchartData[outItem].lease}}间</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="data-block" v-for="(outItem, outIndex) in Object.keys(rrchartData)" :key="outIndex">
        <div class="data-title">{{outItem}}楼</div>
        <div class="data-box">
          <div
          v-for="(innerItem, innerIndex) in rrchartData[outItem]"
          :key="innerIndex"
          :class="{'detail-block':true,'empty':innerItem.room_state == 'lease','rented':innerItem.room_state == 'idle'}"
          @click="turnToHouseDetail(innerItem)"
          >
            <p class="p-title">{{innerItem.customer}}</p>
            <p>{{innerItem.name}}</p>
            <p v-if="innerItem.room_state == 'idle'">{{innerItem.end_date}}到期</p>
            <p v-else>{{innerItem.construction_area}}m²</p>
          </div>
        </div>
      </div>

    </f7-block>
    <Popup v-model="managePopupCrl" position="bottom">
      <Picker
        show-toolbar
        :loading='managePickerLoadingCrl'
        :columns="displayManageAreaPickerList"
        @cancel="managePopupCrl = false"
        @confirm="confirmManage"
      />
    </Popup>

    <Popup v-model="buildingPopupCrl" position="bottom">
      <Picker
        show-toolbar
        :loading='buildingPickerLoadingCrl'
        :columns="displayBuildingAreaPickerList"
        @cancel="buildingPopupCrl = false"
        @confirm="confirmBuilding"
      />
    </Popup>

    <Popup v-model="floorPopupCrl" position="bottom">
      <Picker
        show-toolbar
        :loading='floorPickerLoadingCrl'
        :columns="displayFloorAreaPickerList"
        @cancel="floorPopupCrl = false"
        @confirm="confirmFloor"
      />
    </Popup>
  </f7-page>
</template>
<script>
import { mapActions } from "vuex";
import { Picker, Popup } from 'vant';
import Vue from "Vue";
export default {
  data() {
    return {
      manageAreaPicker:{},
      buildingAreaPicker:{},
      floorAreaPicker:{},
      manageAreaVal:'',
      buildingAreaVal:'',
      floorAreaVal:'',

      manageAreaPickerList:[],
      buildingAreaPickerList:[],
      floorAreaPickerList:[],

      checkedManageLabel: '',
      checkedManageId: '',

      checkedManageIdParam: '',
      checkedBuildingLabel: '',
      checkedBuildingId: '',
      
      checkedBuildingIdParam: '',
      checkedFloorLabel: '',
      checkedFloorId: '',

      displayManageAreaPickerList:[],
      displayBuildingAreaPickerList:[],
      displayFloorAreaPickerList:[],

      hasManageAreaLoading: false,
      manageAreaChooseVal:'',
      buildingAreaChooseVal:'',

      rrchartData: [],
      rrchartAllCalcData: {},
      isShowRoom: false,

      test: '',




      managePopupCrl: false,
      managePickerLoadingCrl: false,
      buildingPopupCrl: false,
      buildingPickerLoadingCrl: false,
      floorPopupCrl: false,
      floorPickerLoadingCrl: false,

      headList:[
        {class:'total', label:'管理面积（m²）'},
        {class:'idle', label:'在租面积（m²）'},
        {class:'lease', label:'空置面积（m²）'},
        {class:'is_rent', label:'可出租面积（m²）'}
      ]
    }
  },
  // mounted() {
  //   const self = this;
  //   // console.log('item :', storageProxy.getItem("userInfo"));
  //   storageProxy.getItem("userInfo").then(result => {
  //     self.updateLoginInfo(JSON.parse(result))
  //   })
  // },
  components: {
    Picker,
    Popup
  },
  methods:{
    ...mapActions(['updateLoginInfo']),
    turnToHouseList(outItem, is_rent) {
      const self = this;
      const router = self.$f7.views.main.router;
      let searchQuery = {
        area_id: self.rrchartData[outItem].area_id || self.checkedManageId,
        building_id : self.rrchartData[outItem].building_id || self.checkedBuildingId,
        floor: self.checkedFloorId,
        is_rent
      }
      router.navigate('/house?searchQuery='+JSON.stringify(searchQuery))
    },
    turnToHouseDetail(item) {
      const self = this;
      const router = self.$f7.views.main.router;
      console.warn('item:',item)
      router.navigate('/houseDetail?houseId='+item.id)
    },

    openManagePicker(name) {
      const self = this;
      self.managePopupCrl = true;

      if(self.hasManageAreaLoading) {
        return
      }
      self.managePickerLoadingCrl = true
      lingFetch(
          self,
          "pms.rent_control",
          "search_area",{},
          function (result) {
          // success
            const _resData = result.data
            console.log('_res manage:', _resData)

            self.hasManageAreaLoading = true
            self.manageAreaPickerList = _resData

            let displayManageAreaPickerList = []
            self.manageAreaPickerList.map(item => {
              displayManageAreaPickerList.push(item.name)
            })
            self.displayManageAreaPickerList = displayManageAreaPickerList;

            self.managePickerLoadingCrl = false;

          },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
              self.managePickerLoadingCrl = false;
          },
          {
            hideLoading: true
          }
      );
    },
    confirmManage(value, index) {
      const self = this;

      if(self.checkedManageId != self.manageAreaPickerList[index].id) {
        self.checkedBuildingLabel = ''
        self.checkedBuildingId = ''
        self.checkedFloorLabel = ''
        self.checkedFloorId = ''
      } else if (self.checkedManageId == self.manageAreaPickerList[index].id) {
        self.managePopupCrl = false
        return
      }
      self.checkedManageLabel = value
      self.checkedManageId = self.manageAreaPickerList[index].id
      self.managePopupCrl = false
      self.searchRCChart()
    },

    openBuildingPicker(name) {
      const self = this;
      self.buildingPopupCrl = true;

      if(self.checkedManageId == '' || self.checkedManageIdParam == self.checkedManageId) {
        return
      }
      self.buildingPickerLoadingCrl = true
      lingFetch(
          self,
          "pms.rent_control",
          "search_building",{
            area_id:self.checkedManageId
          },
          function (result) {
          // success
            const _resData = result.data

            self.checkedManageIdParam = self.checkedManageId
            console.log('_res building:', _resData)

            self.buildingAreaPickerList = _resData

            let displayBuildingAreaPickerList = []
            self.buildingAreaPickerList.map(item => {
              displayBuildingAreaPickerList.push(item.name)
            })
            self.displayBuildingAreaPickerList = displayBuildingAreaPickerList;

            self.buildingPickerLoadingCrl = false;

          },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
              self.buildingPickerLoadingCrl = false;
          },
          {
            hideLoading: true
          }
      );
    },
    confirmBuilding(value, index) {
      const self = this;
      if(self.checkedBuildingId != self.buildingAreaPickerList[index].id) {
        self.checkedFloorLabel = ''
        self.checkedFloorId = ''
      } else if (self.checkedBuildingId == self.buildingAreaPickerList[index].id) {
        self.buildingPopupCrl = false
        return
      }
      self.checkedBuildingLabel = value
      self.checkedBuildingId = self.buildingAreaPickerList[index].id
      self.buildingPopupCrl = false
      self.searchRCChart()
    },

    openFloorPicker(name) {
      const self = this;
      self.floorPopupCrl = true;

      if(self.checkedBuildingId == '' || self.checkedBuildingIdParam == self.checkedBuildingId) {
        return
      }
      self.floorPickerLoadingCrl = true
      lingFetch(
          self,
          "pms.rent_control",
          "search_floor",{
            building_id:self.checkedBuildingId
          },
          function (result) {
          // success
            const _resData = result.data

            self.checkedBuildingIdParam = self.checkedBuildingId
            console.log('_res floor:', _resData)

            self.floorAreaPickerList = _resData

            let displayFloorAreaPickerList = []
            self.floorAreaPickerList.map(item => {
              displayFloorAreaPickerList.push(item.name)
            })
            self.displayFloorAreaPickerList = displayFloorAreaPickerList;

            self.floorPickerLoadingCrl = false;

          },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
              self.floorPickerLoadingCrl = false;
          },
          {
            hideLoading: true
          }
      );
    },
    confirmFloor(value, index) {
      const self = this;
      if (self.checkedFloorId == self.floorAreaPickerList[index].id) {
        self.floorPopupCrl = false
        return
      }
      self.checkedFloorLabel = value
      self.checkedFloorId = self.floorAreaPickerList[index].id
      self.floorPopupCrl = false
      self.searchRCChart()
    },
    searchRCChart(options) {
      const self = this;
      var params = {
        area_id: self.checkedManageId,
        building_id: self.checkedBuildingId,
        floor: self.checkedFloorId
      }
      self.isShowRoom = !(params.area_id == 0 || params.area_id == '' || params.building_id == 0 || params.building_id == '') 

      lingFetch(
        self,
        "pms.rent_control",
        "rent",params,
        function (result) {
        // success
          const _resData = result.data
          console.log('_res search ----- :', _resData)

          self.rrchartAllCalcData = _resData.area_sum
          self.headList.map(i => {
            self.rrchartAllCalcData['area_'+i.class+'_per'] = self.rrchartAllCalcData['area_'+i.class]/self.rrchartAllCalcData.area_total * 100
          })

          self.rrchartData = _resData.data
          if(self.isShowRoom) {
            let tmprrchartData = []
            self.rrchartData.map(item => {
              if(!tmprrchartData[item.floor]) {
                tmprrchartData[item.floor] = []
              }
              tmprrchartData[item.floor].push(item)
            })
            self.rrchartData = tmprrchartData
          }
        },
        function (result) {
        // error
            self.$v.showToast(self,result.msg)

        }
    );
    }
  },
  watch: {
    test(val) {
      console.log(val)
    }
  },
  mounted() {
    const self = this;
    self.searchRCChart()

  }
}
</script>

<style lang="less" scoped>
.rcchart{
  background: #F9F9F9;
}
  /deep/ .van-picker{
    button{
      width: auto;
      color: var(--f7-theme-color);
    }
  }
  .chart-head{
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    background: white;
        margin: 0;

    &.flex{
      /deep/ ul{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
        padding: 0 20px;

        .inp{
          .smart-select{
            width: 100%;
          }
          &::before{
            // content: none;
          }
          .item-content{
            padding: 0;
          }
          .item-inner{
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0;
            width: 60%;
            text-overflow: ellipsis;
            &::before{
              content: none;
            }
          }
        }
      }
      
    }
    .inp{
      height: 43px;
      font-weight:400;
      text-align: center;
      flex: 1;
      position: relative;
      display: flex;
      justify-content: center;
      input{
        height: 100%;
        width: 60%;
        line-height: 43px;
        font-size: 14px;
        text-align: center;
        font-family:PingFangSC-Regular,PingFang SC;
        text-overflow: ellipsis;
      }
      &::before{
        content: '';
          border-top: 4px solid #808080;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          height: 0;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 10px;
          width: 0;
          z-index: 7;
      }
    }
  }
  .area{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 15px;
    background: white;
    box-shadow:0px 3px 10px 0px rgba(223,221,221,1);
    margin: 0;
    margin-top: 20px;
    

    .chart-area{
      width: 50%;
      height: 85px;
      box-sizing: border-box;
      margin-bottom: 12px;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: flex-start;
      &.total{
        i{
          background:linear-gradient(318deg,rgba(102,166,255,1) 0%,rgba(137,247,254,1) 100%);
          &::after{
            content: '';
            position: absolute;
            height: 100%;
            width: 100%;
          }
        }
        .line-inner{
          background: #66A7FF;
        }
      }
      &.idle{
        i{
          background:linear-gradient(140deg,rgba(131,243,174,1) 0%,rgba(29,207,137,1) 100%);
          &::after{
            content: '';
            position: absolute;
            height: 100%;
            width: 100%;
          }
        }
        .line-inner{
          background:#1FD08A;
        }
      }
      &.lease{
        i{
          background:linear-gradient(138deg,rgba(255,153,68,1) 0%,rgba(252,96,118,1) 100%);
          &::after{
            content: '';
            position: absolute;
            height: 100%;
            width: 100%;
          }
        }
        .line-inner{
          background:#FC6075;
        }
      }
      &.is_rent{
        i{
          background:linear-gradient(320deg,rgba(118,118,255,1) 0%,rgba(119,167,255,1) 100%);
          &::after{
            content: '';
            position: absolute;
            height: 100%;
            width: 100%;
          }
        }
        .line-inner{
          background:rgba(118,120,255,1);
        }
      }
      .area-head{

        display: flex;
        justify-content: flex-start;
        align-items: center;
        i{
          height: 24px;
          width: 24px;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
          z-index: 2;
          margin-right: 4px;
          &::after{
            background:url('../../img/building.png') no-repeat center center;
            background-size: 80% 80%;
          }
        }
        span{
          font-size:12px;
          font-family:PingFang-SC-Medium,PingFang-SC;
          color: #666666;
        }
      }
      .area-num{
        font-size:18px;
        font-family:PingFangSC-Semibold,PingFang SC;
        font-weight:600;
      }
      .area-line{
        width: 100%;
        height: 8px;
        background:rgba(233,237,245,1);
        border-radius:4px;
        position: relative;
        .line-inner{
          height: 100%;
          width: 60%;
          border-radius:4px;
          transition: all .5s;
        }
      }
    }
  }
  .data-block{
    margin-top: 20px;
    background: #F9F9F9;
    padding: 0;
    .b-title{
      width:100%;
      height:43px;
      background:rgba(255,255,255,1);
      line-height: 43px;
      padding-left: 23px;
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      font-size:17px;
      font-family:PingFangSC-Medium,PingFang SC;
      font-weight:500;
      color:rgba(51,51,51,1);
      border-bottom: 1px solid #E8E8E8;

      &::before{
        content: '';
        position: absolute;
        width:4px;
        height:18px;
        background:rgba(102,167,255,1);
        border-radius:4px;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    .data-block{
      box-sizing: border-box;
      padding: 20px 15px 0;
      width: 100%;
      margin: 0;
      .data-title{
        width:100%;
        height:21px;
        font-size:15px;
        font-family:PingFangSC-Semibold,PingFang SC;
        font-weight:600;
        color:rgba(102,102,102,1);
        line-height:21px;
        margin-bottom: 2px;
      }
      .data-box{
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .detail-block{
          width: 48%;
          height:76px;
          border-radius:4px;
          color: white;
          margin-bottom: 16px;
          box-sizing: border-box;
          padding: 0 13px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          p{
            margin: 1px 0;
            padding: 0;
            font-size: 14px;
            font-family:PingFangSC-Medium,PingFang SC;
            .p-title{
              font-size: 16px;
              font-weight: bold;
            }
          }
          &.empty{
            background: #FC6075;
          }
          &.rented{
            background: #1FD08A;
          }
        }
      }
    }
  }

</style>