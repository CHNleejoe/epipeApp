<template>
  <f7-page name="event-management">
    <f7-navbar title="事件管理" back-link="返回">
      <f7-nav-right>
        <f7-link href="/event-add/">
          <f7-icon ios="f7:plus" aurora="f7:plus" md="f7:plus"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-list media-list>
      <f7-list-item v-for="(line, index) in timeList" :key="index" :link="'/event-edit/' + index" :title="line.date"
        after="♥" subtitle="" :text="line.event" swipeout @swipeout:deleted="onDeleted(line.id)">
        <f7-swipeout-actions right>
          <f7-swipeout-button delete confirm-text="确定删除这条记录吗?">删除</f7-swipeout-button>
        </f7-swipeout-actions>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  export default {
    computed: mapState([
      'timeList',
    ]),
    data: function () {
      return {}
    },
    methods: {
      onDeleted: function (id) {
        const self = this;
        console.log(id);
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
          lingFetch(self, "common.public", "delete_event",
            function (result) {
              if (result.success) {
                self.$v.showToast(self, '删除成功')
                self.$store.dispatch("updateTimeList", result.data);
                storageProxy.setItem("timelineInfo", result.data)
              }
            }, {
              'id': id,
              'user_ids': user_ids,
            },
            function (result) {
              // 失败的回调函数
              // alert(JSON.stringify(result))
            }, {
              hideLoading: true,
            }
          )
        })
      }
    }
  };
</script>