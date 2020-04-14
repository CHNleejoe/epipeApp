<template>
  <div class="contract">
        <div class="chart" id="vacantChart" style="width: 100%;height: 379px;"></div>
        <div class="list">
            <div class="list-title">
                <div style="width:25%">楼宇</div>
                <div style="width:30%">楼层</div>
                <div style="width:25%">房间代码</div>
                <div style="width:20%">客户</div>
            </div>
            <div
            class="list-item"
            v-for="(item, index) in contractData"
            :key="index"
            >
                <div style="width:25%">{{item.building}}</div>
                <div style="width:30%">{{item.floor}}</div>
                <div style="width:25%">{{item.code}}</div>
                <div style="width:20%">{{item.customer}}</div>
            </div>
        </div>
    </div>

</template>

<script>
import { Picker, Popup, DatetimePicker } from 'vant';
import dayjs from 'dayjs';

export default {
  // 传入子组件的参数写到props
  data(){
    return{
        beginDate: new Date(),
        displayBeginDate: new Date(),

        endDate:new Date(),
        displayEndDate: new Date(),

        beginDateCtl: false,
        endDateCtl: false,

        contractData: [],

        typeList: [
            {label: '全部渠道', id: ''},
            {label: '现金', id: 1},
            {label: '支付宝', id: 2},
            {label: '微信支付', id: 3},
            {label: '银联支付', id: 4},
        ],
        activeTypeId: ''
    }
  },
  components:{
    Picker,
    Popup,
    DatetimePicker
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
    setBeginDate(value) {
      const self = this;
      self.beginDate = value;
      self.beginDateCtl = false;
      console.log('beginDateCtl ----',dayjs(value).format('YYYY-MM'))
    },
    setEndDate(value) {
      const self = this;
      self.endDate = value;
      self.endDateCtl = false;
      console.log('endDateCtl ----',dayjs(value).format('YYYY-MM'))
    },
    requestData() {
        // 获取数据 ----
         // 获取数据 ----
      console.log('获取数据 ======')
      const self = this;
      let data = []
      lingFetch(
          self,
          "pms.dashboard",
          "vacant",{},
          function (result) {
          // success
              const data = result.data
              self.contractData = data

              var week = self.getFutureWeek();
              var n = 0;
              var seriesDataDict = {};
              for (var k = 0; k < week.length; k++) {
                  seriesDataDict[week[k]] = 0
              }
              for (var i = 0; i < data.length; i++) {
                  if (data[i].end_date) {
                      seriesDataDict[data[i].end_date] += 1
                  } else {
                      n++
                  }
              }
              var m = 0;
              // 前面过期的合同释放出来的空置房间数会叠加到后面
              for (var key in seriesDataDict) {
                  if (seriesDataDict[key] > 0) {
                      if (m > 0) {  // 本周最近一份后面的过期合同(释放出来的空置房间数)
                          m += seriesDataDict[key];
                          seriesDataDict[key] = n + m;
                      } else {  // 本周最近一份过期的合同(释放出来的空置房间数)
                          m += seriesDataDict[key];
                          seriesDataDict[key] += n;
                      }
                  } else {  // 没有合同(的空置房间数)
                      seriesDataDict[key] += n;
                      seriesDataDict[key] += m;
                  }
              }
              self.renderChart(Object.values(seriesDataDict))
          },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
          },{
              hideLoading: true
          }
      );
    },
    getFutureWeek: function () {
        var self = this;
        var today = new Date();
        var week = [];
        for (var i = 0; i < 7; i++) {
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            week.push(dayjs(today).format('YYYY-MM-DD'))
        }
        return week
    },
    day(d) {
      return dayjs(d)
    },
    renderChart(data) {
        var chart = echarts.init(document.getElementById('vacantChart'));
        const self = this;
        var option = {
                title: {
                    text: '单位：间',
                    subtext: '（未来一周）',
                    left: '14'
                },
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                        type: 'category',
                        data: self.getVacantHousingChartXAxis(),
                        axisTick: {
                            alignWithLabel: true
                        }
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: '空置房源',
                        type: 'bar',
                        barWidth: '60%',
                        data: data,
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    {offset: 0, color: '#77CCFF'},
                                    {offset: 0.5, color: '#79AAFF'},
                                    {offset: 1, color: '#7676FF'}
                                ])
                            }
                        }
                    }
                ]
            };

      chart.setOption(option);
    },
    getVacantHousingChartXAxis: function () {
        var self = this;
        var today = new Date();
        var Xdata = [];
        var num2week = {
            1: '周一',
            2: '周二',
            3: '周三',
            4: '周四',
            5: '周五',
            6: '周六',
            0: '周日',
        };
        for (var i = 0; i < 7; i++) {
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            Xdata.push(num2week[today.getDay()]);
        }
        return Xdata
    },
  },
  mounted() {
      console.log('mouted vue component----')
      const self = this;
      self.requestData()
  }
}
</script>

<style lang="less" scoped>
  .contract{
    height: calc(100vh - var(--f7-navbar-height) - var(--f7-safe-area-top) - 44px);
    overflow-y: scroll;
    .head{
        height: 44px;
        width: 100%;
        background: white;
        .h-title{
            height: 44px;
            box-sizing: border-box;
            width: 100%;
            padding-left: 23px;
            font-size:17px;
            font-family:PingFangSC-Medium,PingFang SC;
            font-weight:500;
            color:rgba(51,51,51,1);
            line-height: 44px;
            position: relative;
            &::after{
                content: '';
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                width:4px;
                height:18px;
                background:rgba(102,167,255,1);
                border-radius:4px;
            }
        }
    }
    .chart{
    background: white;
    padding: 0 15px;
        padding-top: 12px;
        box-sizing: border-box;
        
    }
    .list{
        width: 100%;
        background: white;
        margin-top: 0;
        .list-title{
            width: 100%;
            height:42px;
            background:rgba(235,236,240,1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            >div{
                width:56px;
                height:14px;
                font-size:14px;
                font-family:SourceHanSansCN-Medium,SourceHanSansCN;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:14px;
                text-align: left;
                text-indent: 10px;
            }
        }
        .list-item{
            width: 100%;
            height:42px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            >div{
                width:56px;
                height:14px;
                font-size:14px;
                font-family:SourceHanSansCN-Medium,SourceHanSansCN;
                font-weight:500;
                color:rgba(0,0,0,1);
                line-height:14px;
                text-align: left;
                text-indent: 10px;

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
