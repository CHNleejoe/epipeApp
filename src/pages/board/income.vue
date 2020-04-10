<template>
  <div class="income">
    <div class="head">
      <div class="date" @click="dateCtl=true">{{day(currentDate).format('YYYY年MM月')}}</div>
      <div class="income-num">收入：{{incomeData}}</div>
    </div>
    <div class="detail">
      <div class="line"></div>
      <div class="every chart" id="baseLine" style="width: 100%;height: 250px;">
      </div>
      <div class="kinds chart" id="basePie" style="width: 100%;height: 250px;">
      </div>
      <div class="top10">
        <div class="top-title">TOP10</div>
        <div
        class="top-item"
        v-for="(item, index) in top10Data"
        :key="index"
        >
          <div
          :class="'t-img top' + (index + 1)"
          >{{index + 1}}</div>
          <div class="t-content">
            <div class="tc-title">{{item.building}}{{item.room}}收款</div>
            <div class="tc-time">{{item.date}}</div>
          </div>
          <div class="t-num">¥{{item.paid_amount}}</div>
        </div>
      </div>
    </div>
    <div class="all-pop">
      <Popup v-model="dateCtl" position="bottom">
        <DatetimePicker
          v-model="displayDate"
          type="year-month"
          title='选择时间'
          :formatter="formatter"
          @cancel='dateCtl = false;displayDate = currentDate'
          @confirm='requestIncomeData'
        />
      </Popup>
    </div>
  </div>

</template>

<script>
import { Picker, Popup, DatetimePicker, Toast} from 'vant';
import dayjs from 'dayjs';

export default {
  // 传入子组件的参数写到props
  data(){
    return{
      currentDate: new Date(),
      displayDate: new Date(),
      dateCtl: false,

      incomeData: 0,
      top10Data: []
    }
  },
  components:{
    Picker,
    Popup,
    DatetimePicker,
    Toast
  },
  methods:{
    formatter(type, val) {
      if (type === 'year') {
        return `${val}年`;
      } else if (type === 'month') {
        return `${val}月`
      }
      return val;
    },
    requestIncomeData(value) { // 请求每日收入
      const self = this;

      self.currentDate = value;
      self.dateCtl = false;


      console.log('date ----',dayjs(self.currentDate).format('YYYY-MM'))
      self.renderLineChart()
      self.renderPieChart()
      self.requestIncomeTop()
      
    },
    day(d) {
      return dayjs(d)
    },
    renderLineChart() {
      const self = this;
      var myChart = echarts.init(document.getElementById('baseLine'));
      // console.log('renderLineChart', document.getElementById('baseLine'))
      let xdata = [],
          ydata = [];
      lingFetch(
          self,
          "pms.dashboard",
          "daily_income",{
              query_date: dayjs(self.currentDate).format('YYYY-MM')
          },
          function (result) {
          // success
              self.incomeData = 0
              const _resData = result.data
              _resData.map(_i => {
                xdata.push(_i.receive_date)
                ydata.push(_i.value)
                self.incomeData += _i.value
              })

              var option = {
                  title: {
                      text: '每日收入',
                      left: 'left'
                  },
                  tooltip: {
                      trigger: 'axis'
                  },
                  xAxis: {
                      type: 'category',
                      boundaryGap: false,
                      data: xdata
                  },
                  yAxis: {
                      type: 'value'
                  },
                  itemStyle: {
                    color: '#66A7FF'
                  },
                  series: [{
                      data: ydata,
                      type: 'line',
                      areaStyle: {
                        color: '#E9ECFF'
                      },
                      lineStyle: {
                          color: '#7B88E1'
                      }
                  }]
              };
              myChart.setOption(option);
          },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
          },{
              hideLoading: true
          }
      );

      
    },
    renderPieChart() {
      var pieChart = echarts.init(document.getElementById('basePie'));
      const self = this;
      let data = []
      lingFetch(
          self,
          "pms.dashboard",
          "income_classification",{
              query_date: dayjs(self.currentDate).format('YYYY-MM')
          },
          function (result) {
          // success
              const _resData = result.data
              _resData.map(_i => {
                data.push({
                  value: _i.paid_amount,
                  name: _i.charge_item
                })
              })
              var option = {
                  title: {
                      text: '收入分类',
                      left: 'left'
                  },
                  tooltip: {
                      trigger: 'item',
                      formatter: '{a} <br/>{b} : {d}%'
                  },
                  series: [
                      {
                          name: '收入分类',
                          type: 'pie',
                          radius: '55%',
                          center: ['50%', '60%'],
                          label: {
                              show: true,
                              formatter: '{b} \n {d}',
                              color: '#808080'
                          },
                          data: data,
                          labelLine:{
                              lineStyle: {
                                  color: '#808080'
                              }
                          },
                          
                          emphasis: {
                              itemStyle: {
                                  shadowBlur: 10,
                                  shadowOffsetX: 0,
                                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                              }
                          }
                      }
                  ]
              };
              pieChart.setOption(option);

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
    requestIncomeTop() {
      const self = this;
      lingFetch(
          self,
          "pms.dashboard",
          "collection_room_top10",{
              query_date: dayjs(self.currentDate).format('YYYY-MM')
          },
          function (result) {
          // success
              const _resData = result.data
              self.top10Data = _resData
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
    }
  },
  mounted() {
      console.log('income vue component----')
      const self = this;
      self.renderLineChart()
      self.renderPieChart()
      self.requestIncomeTop()
  }
}
</script>

<style lang="less" scoped>
  .income{
    height: calc(100vh - var(--f7-navbar-height) - var(--f7-safe-area-top) - 44px);
    overflow-y: scroll;
  }
  .head {
    height: 92px;
    width: 100%;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .date{
      width:118px;
      height:28px;
      background:rgba(235,236,240,1);
      border-radius:14px;
      font-size:16px;
      font-family:PingFangSC-Medium,PingFang SC;
      font-weight:500;
      color:rgba(51,51,51,1);
      line-height:22px;
      padding-right: 9px;
      box-sizing: border-box;
      line-height: 28px;
      text-align: center;
      position: relative;
      &:hover{
        &::after{
        transform: rotate(180deg);
        top: 45%;
      }
      }
      &::after{
        content: '';
        transition: all 0.3s;
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 4px 4px 0 4px;
        border-color: #808080 transparent transparent transparent;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    .income-num{
      font-size:16px;
      font-family:PingFangSC-Regular,PingFang SC;
      font-weight:400;
      color:rgba(51,51,51,1);
      line-height:22px;
      margin-top: 10px;
    }
  }
  .detail{
    position: relative;
    box-sizing: border-box;
    width: 92%;
    margin: 21px 15px;
    background: white;
    border-radius: 3px;
    .line{
      position: absolute;
      width:103%;
      height:10px;
      background:rgba(232,232,232,1);
      border-radius:6px;
      top: -6px;
      left: 50%;
      transform:translateX(-50%);
      z-index: -1;
    }
    .chart{
      border-bottom: 4px dashed #E3E1E4;
      box-sizing: border-box;
      padding-left: 12px;
      padding-top: 20px;
    }
    .top10{
      width: 100%;
      box-sizing: border-box;
      padding-left: 12px;
      overflow: hidden;
      .top-title{
        padding-top: 20px;
        width:49px;
        height:22px;
        font-size:16px;
        font-family:PingFangSC-Semibold,PingFang SC;
        font-weight:600;
        color:rgba(51,51,51,1);
        line-height:22px;
      }
      .top-item{
        height: 79px;

        width: 100%;
        box-sizing: border-box;
        border-bottom: 2px solid #EBECF0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        &:last-child{
          margin-bottom: 20px;
        }
        .t-img{
          width:20px;
          height:20px;
          line-height: 20px;
          text-align: center;
          color: white;
          background:linear-gradient(180deg,rgba(191,191,191,1) 0%,rgba(166,166,166,1) 100%);
          border-radius: 50%;
          &.top1{
            background:linear-gradient(180deg,rgba(255,228,0,1) 0%,rgba(254,196,0,1) 100%);
          }
          &.top2{
            background:linear-gradient(360deg,rgba(102,166,255,1) 0%,rgba(137,247,254,1) 100%);
          }
          &.top3{
            background:linear-gradient(180deg,rgba(118,177,255,1) 0%,rgba(118,118,255,1) 100%);
          }
        }
        .tc-title{
          font-size:16px;
          font-family:PingFangSC-Regular,PingFang SC;
          font-weight:400;
          color:rgba(51,51,51,1);
          line-height:18px;
        }
        .tc-time{
          font-size:12px;
          font-family:PingFangSC-Regular,PingFang SC;
          font-weight:400;
          color:rgba(153,153,153,1);
          line-height:14px;
          margin-top: 13px;
        }
        .t-num{
          font-size:18px;
          font-family:PingFangSC-Semibold,PingFang SC;
          font-weight:600;
          color:rgba(68,68,68,1);
          line-height:50px;
          padding-right: 4%;
          height: 25px;
        }
      }
    }
  }
  .all-pop{
    /deep/ .van-picker__toolbar{

      .van-picker__title{
        width: 200px;
      }
      >button{
        width: auto;
      }
    } 
  }
</style>
