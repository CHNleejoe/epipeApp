<template>
  <f7-page name="event-add">
    <f7-navbar title="事件添加" back-link="返回"></f7-navbar>
    <f7-list inline-labels no-hairlines-md>
      <f7-list-input type="datepicker" placeholder="点击选择事件时间"
        :calendar-params="{openIn: 'customModal', header: false, footer: false, dateFormat: 'yyyy年mm月dd日'}"
        :value="date" readonly required @calendar:change="setDateValue"></f7-list-input>
      <f7-list-input type="textarea" placeholder="事件内容" resizable required :value="event" clear-button
        @input="event = $event.target.value"></f7-list-input>
    </f7-list>
    <f7-block>
      <f7-button round fill @click="addEvent()">确认</f7-button>
    </f7-block>
  </f7-page>
</template>

<script>
  export default {
    data: function () {
      return {
        date: [new Date()],
        event: ''
      }
    },
    methods: {
      setDateValue: function (value) {
        var self = this;
        self.date = value
      },
      addEvent: function () {
        const self = this;
        var date = self.date[0].Format('yyyy-MM-dd');
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
          lingFetch(self, "common.public", "add_event",
            function (result) {
              if (result.success) {
                self.$store.dispatch("updateTimeList", result.data);
                storageProxy.setItem("timelineInfo", result.data)
                self.$f7router.back();
              }
            }, {
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