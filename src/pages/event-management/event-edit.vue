<template>
  <f7-page name="event-edit">
    <f7-navbar title="事件编辑" back-link="返回"></f7-navbar>
    <f7-list inline-labels no-hairlines-md>
      <f7-list-input type="datepicker" placeholder="点击选择事件时间"
        :calendar-params="{openIn: 'customModal', header: false, footer: true, toolbarCloseText: '确定', dateFormat: 'yyyy年mm月dd日'}"
        :value="date" readonly required @calendar:change="setDateValue"></f7-list-input>
      <f7-list-input type="textarea" placeholder="事件内容" resizable required :value="event" clear-button
        @input="event = $event.target.value"></f7-list-input>
    </f7-list>
    <f7-block>
      <f7-button round fill @click="updateEvent()">确认</f7-button>
    </f7-block>
  </f7-page>
</template>

<script>
  export default {
    data: function () {
      var timeListIndex = this.$f7route.params.index
      var timeList = this.$store.getters.getTimeList
      return {
        date: [new Date(timeList[timeListIndex].date_with_year)],
        event: timeList[timeListIndex].event
      }
    },
    methods: {
      setDateValue: function (value) {
        var self = this;
        self.date = value
      },
      updateEvent: function () {
        const self = this;
        console.log(self.date)
        var date = self.date[0].getFullYear() + '-' + (self.date[0].getMonth() + 1) + '-' + self.date[0].getDate();
        var event = self.event;
        storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
          var user_ids = []
          if (userLoginInfo.userId) {
            user_ids.push(userLoginInfo.userId)
          } else {
            self.$v.showToast(self, '无法获取当前用户信息')
            return;
          }
          if (userLoginInfo.partner_user_id) {
            user_ids.push(userLoginInfo.partner_user_id)
          }
          lingFetch(self, "common.public", "update_event",
            function (result) {
              if (result.success) {
                self.$store.dispatch("updateTimeList", result.data);
                storageProxy.setItem("timelineInfo", result.data)
                self.$f7router.back();
              }
            }, {
              'id': self.$store.getters.getTimeList[self.$f7route.params.index].id,
              'date': date,
              'event': self.event,
              'user_ids': user_ids,
            }
          )
        })
      }
    }
  };
</script>