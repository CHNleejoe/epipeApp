<template>
  <f7-page name="together-day" @page:beforein="onBeforeIn" @page:beforeout="onBeforeOut">
    <f7-navbar title="在一起" back-link="返回"></f7-navbar>
    <f7-list inline-labels no-hairlines-md>
      <f7-list-input type="datepicker" placeholder="点击选择在一起时间"
        :calendar-params="{openIn: 'customModal', header: false, footer: false, dateFormat: 'yyyy年mm月dd日'}"
        :value="date" readonly required @calendar:change="setDateValue"></f7-list-input>
    </f7-list>
    <f7-block>
      <f7-button round fill @click="changeTogetherDay()">确认</f7-button>
    </f7-block>
  </f7-page>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  export default {
    computed: mapState([
      'loginUserInfo', 'backgroundSetting'
    ]),
    data: function () {
      return {
        date: [new Date()],
        event: ''
      }
    },
    mounted() {
      const self = this;
      var userId = self.loginUserInfo.userId
      storageProxy.getItem("togetherDay").then(function (togetherDay) {
        if (togetherDay && userId && togetherDay[userId] && togetherDay[userId].date) {
          self.date = [self.stringToDate(togetherDay[userId].date)]
        }
      })
    },
    methods: {
      onBeforeIn() {
        StatusBar.styleDefault();
      },
      onBeforeOut() {
        const self = this;
        const $$ = self.Dom7;
        if (self.loginUserInfo && self.loginUserInfo.userId && self.backgroundSetting[self.loginUserInfo.userId].type ==
          'babel') {
          StatusBar.styleLightContent();
        } else {
          StatusBar.styleDefault();
        }
      },
      stringToDate: function (dateStr, separator) {
        if (!separator) {
          separator = "-";
        }
        var dateArr = dateStr.split(separator);
        var year = parseInt(dateArr[0]);
        var month;
        if (dateArr[1].indexOf("0") == 0) {
          month = parseInt(dateArr[1].substring(1));
        } else {
          month = parseInt(dateArr[1]);
        }
        var day = parseInt(dateArr[2]);
        var date = new Date(year, month - 1, day);
        return date;
      },
      setDateValue: function (value) {
        const self = this;
        self.date = value
      },
      changeTogetherDay: function () {
        const self = this;
        var date = self.date[0].Format('yyyy-MM-dd');
        var userId = self.loginUserInfo.userId
        storageProxy.getItem("togetherDay").then(function (togetherDay) {
          if (!togetherDay) {
            togetherDay = {}
          }
          togetherDay[userId] = {
            'date': date,
          };
          storageProxy.setItem("togetherDay", togetherDay).then(function () {
            self.$v.showToast(self, "保存成功");
            self.$u.back(self)
          });
        });
      }
    }
  };
</script>