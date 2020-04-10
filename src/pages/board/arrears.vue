<template>
  <div class="arrears">
    <div class="chart" id="chart" style="width: 100%;height: 379px;"></div>
    <div class="all-pop">
      <Popup v-model="dateCtl" position="bottom">
        <DatetimePicker
          v-model="displayDate"
          type="year-month"
          title='选择时间'
          :formatter="formatter"
          @cancel='dateCtl = false;displayDate = currentDate'
          @confirm='requestarrearsData'
        />
      </Popup>
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
      currentDate: new Date(),
      displayDate: new Date(),
      dateCtl: false,

      arrearsData: 1231231232
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
    requestarrearsData(value) {
      const self = this;
      self.currentDate = value;
      self.dateCtl = false;
      console.log('date ----',dayjs(value).format('YYYY-MM'))
    },
    day(d) {
      return dayjs(d)
    },
    count(arr) {
      let all = 0;
      arr.map(i => {
        all += i
      })
      return all
    },
    renderChart() {
        var chart = echarts.init(document.getElementById('chart'));
        const self = this;
        let xdata = [],
            ydata_arrears = [],
            ydata_income = [] 
        lingFetch(
          self,
          "pms.dashboard",
          "arrears",{},
          function (result) {
          // success
              const _resData = result.data
              let x = _resData.data
              Object.keys(x).map(_i => {
                xdata.push(_i)
                ydata_income.push(x[_i])
                ydata_arrears.push(_resData.total_amount - self.count(ydata_income))
              })

              var option = {
                color: ['#66A7FF', '#FC6075'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter: function (params) {
                        var res = params[0].name + '<br>';
                        for (var i = params.length - 1; i >= 0; i--) {
                            res += params[i].marker + params[i].seriesName + ' : ' + params[i].value.toFixed(2) + '<br/>'
                        }
                        return res
                    },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                legend: {
                    top: '2%',
                    data: ['欠费', '已收']
                },
                xAxis: [
                    {
                        type: 'category',
                        data: xdata,
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
                        name: '欠费',
                        type: 'bar',
                        stack: '总量',
                        barWidth: '60%',
                        label: {
                            position: 'insideRight'
                        },
                        data: ydata_arrears
                    },
                    {
                        name: '已收',
                        type: 'bar',
                        stack: '总量',
                        barWidth: '60%',
                        label: {
                            position: 'insideRight'
                        },
                        data: ydata_income
                    }
                ]
            };

            chart.setOption(option);
          },
          function (result) {
          // error
              self.$v.showToast(self,result.msg)
          },{
              hideLoading: true
          }
      );
        
    }
  },
  mounted() {
      console.log('mouted vue component----')
      const self = this;
      self.renderChart()
  }
}
</script>

<style lang="less" scoped>
  .arrears{
    height: calc(100vh - var(--f7-navbar-height) - var(--f7-safe-area-top) - 44px);
    overflow-y: scroll;
    .chart{
    background: white;
    padding: 0 15px;
        padding-top: 12px;
        box-sizing: border-box;
        
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
