<template>
  <div class="toll">
        <div class="head">
            <div class="h-title">收费统计</div>
            <div class="date">
                <div class="begin picker" @click="beginDateCtl = true">{{day(beginDate).format('YYYY/M/D')}}</div>
                <div class="contact"></div>
                <div class="end picker" @click="endDateCtl = true">{{day(endDate).format('YYYY/M/D')}}</div>
                <div @click="requestData()"><f7-icon class="search" f7="search" ></f7-icon></div>
            </div>
        </div>
        <div class="type">
            <div
            :class="{'type-item': true, 'active': item.id == activeTypeId}"
            v-for="(item, index) in typeList"
            :key="index"
            @click="activeTypeId = item.id;requestData()"
            >{{item.label}}</div>
        </div>
        <div class="chart" id="tollChart" style="width: 100%;height: 379px;"></div>
        <div class="all-pop">
        <Popup v-model="beginDateCtl" position="bottom">
            <DatetimePicker
                v-model="displayBeginDate"
                type="date"
                title='选择时间'
                :formatter="formatter"
                @cancel='beginDateCtl = false;displayBeginDate = beginDate'
                @confirm='setBeginDate'
            />
        </Popup>
        <Popup v-model="endDateCtl" position="bottom">
            <DatetimePicker
                v-model="displayEndDate"
                type="date"
                title='选择时间'
                :formatter="formatter"
                @cancel='endDateCtl = false;displayEndDate = endDate'
                @confirm='setEndDate'
            />
        </Popup>
        </div>
    </div>

</template>

<script>
import { Picker, Popup, DatetimePicker, Toast } from 'vant';
import dayjs from 'dayjs';
import Vue from 'vue';

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

        tollData: {},

        typeList: [
            {label: '全部渠道', id: ''},
            {label: '现金', id: 'alipay'},
            {label: '支付宝', id: 'wechat'},
            {label: '微信支付', id: 'personal_bank_transfer'},
            {label: '银联支付', id: 'business_bank_transfer'},
        ],
        activeTypeId: ''
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
    setBeginDate(value) {
      const self = this;
      if(value > self.endDate) {
        self.$v.showToast(self, '开始时间不能大于结束时间')
        return
      }
      self.beginDate = value;
      self.beginDateCtl = false;
      console.log('beginDateCtl ----',dayjs(value).format('YYYY-MM'))
    },
    setEndDate(value) {
      const self = this;
      if(value < self.beginDate) {
        self.$v.showToast(self, '结束时间不能小于开始时间')
        return
      }
      self.endDate = value;
      self.endDateCtl = false;
      console.log('endDateCtl ----',dayjs(value).format('YYYY-MM'))
    },
    requestData() {
        // 获取数据 ----
        console.log('获取数据 ======')
        const self = this;
      let data = []
      lingFetch(
          self,
          "pms.dashboard",
          "charge",{
              start_date: dayjs(self.beginDate).format('YYYY-M-D'),
              end_date: dayjs(self.endDate).format('YYYY-M-D'),
              payment_way: self.activeTypeId,

          },
          function (result) {
          // success
              const _resData = result.data
              self.tollData = _resData
              self.renderChart()
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
    renderChart() {
      var chart = echarts.init(document.getElementById('tollChart'));
      const self = this;
      var sum = 0;
      var maxLen = 0;
      let data = self.tollData
      data.map(v=>{
          sum += v.value;
          if ((v.name).length > maxLen) {
              maxLen = (v.name).length
          }
      });
       var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: '14',
                    bottom: '22',
                    icon: 'circle',
                    formatter: function (name) {
                        var target = 0;
                        var str = ' ';
                        for (let i = 0; i < data.length; i++) {
                            if (data[i].name === name) {
                                target = data[i].value
                            }
                        }
                        for (var j = 0; j < maxLen - name.length; j++) {
                            str += '    '
                        }
                        return '{a|' + name + '}  ' + str + '{a|' + ((target / (sum ? sum : 1)) * 100).toFixed(2) + '%' + "}    {a|" + '¥' + target.toFixed(2) + '}'
                    },
                    textStyle: {
                        rich: {
                            a: {
                                fontSize: 14,
                                verticalAlign: 'top',
                                align: 'center',
                            },
                        }
                    }
                },
                series: [
                    {
                        name: '收费统计',
                        type: 'pie',
                        radius: ['40%', '60%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center',
                            formatter: '{b}\n{c}'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '10',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: data
                    }
                ]
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
  .toll{
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
            .search{
              color: #909090;
              margin-left: 60px;
            }
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
            .contact{
                background: url('../../img/contact.png') no-repeat center center;
                width: 19px;
                height: 16px;
                margin: 0 29px;
                background-size: 19px 16px;
            }
        }
    }
    .type{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        background: white;
        box-sizing: border-box;
        padding-left: 15px;
        padding-top: 6px;
        .type-item{
            box-sizing: border-box;
            padding: 7px 15px;
            font-size:14px;
            font-family:SourceHanSansCN-Normal,SourceHanSansCN;
            font-weight:400;
            color:rgba(102,102,102,1);
            position: relative;
            margin-right: 10px;
            background: #EBECF0;
            border-radius: 4px;
            margin-top: 15px;
            border: 1px solid #EBECF0;

            &.active{
                border: 1px solid #5584FF;
                color: #5584FF;
                &::after{
                    content: '✔';
                    color: white;
                    width:20px;
                    height:22px;
                    position: absolute;
                    right: -9px;
                    bottom: -5px;
                    line-height: 20px;
                }
                &::before{
                    content: '';
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 0 0 20px 20px;
                    border-color: transparent transparent #007bff transparent;
                }
            }
        }
    }
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
