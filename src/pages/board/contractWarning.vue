<template>
  <div class="contract">
    <div class="head">
        <div class="h-title">合同到期预警</div>
        <div class="date">
            <div class="picker" @click="dateCtl = true">{{dateDuring}}</div>
            <div class="num">{{day(beginDate).format('YYYY年M月D日')}}~{{day(endDate).format('YYYY年M月D日')}}</div>
        </div>
    </div>
    <div class="chart" id="contractChart" style="width: 100%;height: 379px;"></div>
    <div class="list">
      <div class="list-title">
          <div style="width:25%">合同编号</div>
          <div style="width:30%">合同名称</div>
          <div style="width:25%">租户</div>
          <div style="width:20%">到期时间</div>
      </div>
      <div
      class="list-item"
      v-for="(item, index) in contractData"
      :key="index"
      >
        <div style="width:25%">{{item.code}}</div>
        <div style="width:30%">{{item.name}}</div>
        <div style="width:25%">{{item.customer}}</div>
        <div style="width:20%">{{item.end_date2}}</div>
      </div>
    </div>
    <div class="all-pop">
      <Popup v-model="dateCtl" position="bottom">
            <Picker
                show-toolbar
                title="选择时间段"
                :columns="columns"
                @cancel='dateCtl = false'
                @confirm='setDateDuring'
            />
        </Popup>
    </div>
  </div>

</template>

<script>
import { Picker, Popup } from 'vant';
import dayjs from 'dayjs';

export default {
  // 传入子组件的参数写到props
  data(){
    return{
        beginDate: dayjs(new Date()).format('YYYY-MM-DD'),

        endDate:dayjs(new Date()).add(1, 'month').format('YYYY-MM-DD'),

        tag: false,

        dateCtl: false,
        dateDuring: '未来一个月',
        columns: ['未来一个月', '未来三个月', '未来六个月', '未来一年'],
        selectIndex: 1,
        contractData: {},
    }
  },
  components:{
    Popup,
    Picker
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
    setDateDuring(value, index) {
      const self = this;
      self.beginDate = dayjs(new Date()).format('YYYY-MM-DD');
      self.dateDuring = value
      self.selectIndex = index + 1

      switch(index) {
        case 0:{
          self.endDate = dayjs(new Date()).add(1, 'month').format('YYYY-MM-DD')
          self.tag = false
          break
        }
        case 1:{
          self.endDate = dayjs(new Date()).add(3, 'month').format('YYYY-MM-DD')
          self.tag = true
          break
        }
        case 2:{
          self.endDate = dayjs(new Date()).add(6, 'month').format('YYYY-MM-DD')
          self.tag = true
          break
        }
        case 3:{
          self.endDate = dayjs(new Date()).add(1, 'year').format('YYYY-MM-DD')
          self.tag = true
          break
        }
      }
      self.dateCtl = false;
      self.requestData()
    },
    requestData() {
        // 获取数据 ----
        console.log('获取数据 ======')
        const self = this;
      let data = []

      var Xdata = self.getContractWarningXAxis(self.selectIndex);
      var seriesData = {};
      for (var k = 0; k < Xdata.length; k++) {
          seriesData[Xdata[k]] = 0
      }
      lingFetch(
          self,
          "pms.dashboard",
          "contract_warning",{
            start_date: self.beginDate,
            end_date: self.endDate,
            tag: self.tag
          },
          function (result) {
          // success
              const data = result.data
              self.contractData = data
              for (var i = 0; i < data.length; i++) {
                  seriesData[data[i].end_date] += 1
              }
              self.renderChart(Xdata, Object.values(seriesData))
              },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
          },{
              hideLoading: true
          }
      );
    },
    day(d) {
      return dayjs(d)
    },
    // 获取合同到期预警X坐标
    getContractWarningXAxis: function(val) {
        var self = this;
        var Xdata = [];
        var startDate = new Date();
        if (val === '1') {
            var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + parseInt(val), startDate.getDate());
            for (; startDate <= endDate;) {
                Xdata.push(startDate.getFullYear() + '-' + self.getFormatMonth(startDate.getMonth()) + '-' + self.getFormatDay(startDate.getDate()));
                startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
            }
        } else {
            for (var i = 0; i <= parseInt(val); i++) {
                Xdata.push(startDate.getFullYear() + '-' + self.getFormatMonth(startDate.getMonth()));
                startDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1)
            }
        }
        return Xdata
    },
    // 获取格式化月
    getFormatMonth: function(month) {
        return (month + 1) < 10 ? ('0' + (month + 1)) : (month + 1)
    },

    // 获取格式化日
    getFormatDay: function(day) {
        return day < 10 ? ('0' + day) : day
    },

    // 获取合同到期预警查询日期
    getContractWarningQuery: function(val) {
        var self = this;
        var endDate = new Date(self.year, self.month + parseInt(val), self.today);
        return {
            startDate: self.getCurrentDate(),
            endDate: endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate(),
            tag: val === '1'
        }
    },
    renderChart(xdata, seriesData) {
        var chart = echarts.init(document.getElementById('contractChart'));

        var option = {
                color: ['#3398DB'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    data: xdata,
                    axisTick: {
                        alignWithLabel: true
                    }
                }],
                yAxis: [{
                    type: 'value',
                    minInterval: 1
                }],
                series: [{
                    name: '合同到期数',
                    type: 'bar',
                    barWidth: '60%',
                    data: seriesData,
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {offset: 0, color: '#77CCFF'},
                                {offset: 0.5, color: '#79AAFF'},
                                {offset: 1, color: '#7676FF'}
                            ])
                        }
                    }
                }]
            };

      chart.setOption(option);
    }
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
        height: 88px;
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
        .date{
            display: flex;
            justify-content: flex-start;
            align-items: center;
            box-sizing: border-box;
            padding-left: 15px;
            border-bottom: 1px solid #F9F9FB;
            height: 44px;
            .picker{
                width:73px;
                height:20px;
                font-size:14px;
                font-family:PingFangSC-Regular,PingFang SC;
                font-weight:400;
                color:rgba(128,128,128,1);
                line-height:20px;
                padding-right: 14px;
                position: relative;
                &::after{
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    border-style: solid;
                    border-width: 4px 4px 0 4px;
                    border-color: #808080 transparent transparent transparent;
                }
            }
            .num{
              margin-left: 20px;
              font-size:14px;
              font-family:PingFangSC-Regular,PingFang SC;
              font-weight:400;
              color:rgba(128,128,128,1);
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
                // text-indent: 10px;
                overflow:hidden; //超出的文本隐藏
                text-overflow:ellipsis; //溢出用省略号显示
                white-space:nowrap; //溢出不换行
                padding-right: 1px;
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
