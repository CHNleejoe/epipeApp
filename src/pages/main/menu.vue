<template>
  <f7-page :page-content="false" @page:beforein="onBeforeIn" @page:afterin="onAfterIn" @page:beforeout="onBeforeOut"
    @page:init="onPageInit">
    <f7-toolbar bottom tabbar class=" menu-tab-font" labels style="font-size: 14px;">
      <f7-link tab-link href="./" route-tab-id="home" @page:afterin="onAfterIn">
        <i class="icon icon-message"></i>
        <span>事件</span>
      </f7-link>
      <f7-link tab-link href="interact/" route-tab-id="interact">
        <i class="icon icon-contact"></i>
        <span>互动</span>
      </f7-link>
      <f7-link href="/message/">
        <f7-icon ios="f7:chat_bubble_text" aurora="f7:chat_bubble_text" md="f7:chat_bubble_text"
          style="width: 20px;display: flex;height: 24px;font-size: 24px;color: rgba(0,0,0, 0.8);justify-content: center;align-items: center;">
        </f7-icon>
        <span>聊天</span>
      </f7-link>
      <f7-link tab-link href="desktop/" route-tab-id="desktop">
        <i class="icon icon-desktop"></i>
        <span>功能</span>
      </f7-link>
      <f7-link tab-link href="mine/" route-tab-id="mine">
        <i class="icon icon-mine"></i>
        <span>我的</span>
      </f7-link>
    </f7-toolbar>
    <f7-tabs routable>
      <f7-tab class="page-content" id="home"></f7-tab>
      <f7-tab class="page-content" id="interact"></f7-tab>
      <f7-tab class="page-content" id="desktop"></f7-tab>
      <f7-tab class="page-content" id="mine"></f7-tab>
    </f7-tabs>
  </f7-page>
</template>
<script>
  import {
    mapState
  } from 'vuex'
  export default {
    computed: mapState([
      'loginUserInfo', 'backgroundSetting', 'imConnection', 'imConnected', 'messagesData'
    ]),
    data() {
      return {
        notificationIcon: require('../../img/icon.png'),
      }
    },
    methods: {
      onMessage(msg) {
        const self = this;
        // 解析出<message>的from、type属性，以及body子元素
        var from = msg.getAttribute('from');
        var type = msg.getAttribute('type');
        var elems = msg.getElementsByTagName('body');
        if (type == "chat" && elems.length > 0) {
          var body = elems[0];
          var text = Strophe.getText(body)
          console.log('收到消息：' + text)
          console.log(self.notificationIcon.toString())
          cordova.plugins.notification.local.schedule({
            id: ++self.id,
            smallIcon: "http://pic.51yuansu.com/pic3/cover/01/18/96/59051eca0ce28_610.jpg",
            // icon: self.notificationIcon,
            title: self.loginUserInfo.partner_user_name,
            text: text,
            // foreground: true
          });
          // TODO 这里存储会丢失消息，因为存储是异步的，同时收到多条消息会出问题
          // self.$store.dispatch("updateMessagesData", imUserHistory[self.loginUserInfo.userId]);
          self.$store.commit('UPDATE_MESSAGES_DATA', [...self.messagesData, {
            type: 'received',
            text: text,
            name: self.loginUserInfo.partner_user_name,
            avatar: self.loginUserInfo.partner_image_medium,
          }])
          storageProxy.getItem("imUserHistory").then(function (imUserHistory) {
            if (!imUserHistory) {
              imUserHistory = {}
            }
            if (!imUserHistory[self.loginUserInfo.userId]) {
              imUserHistory[self.loginUserInfo.userId] = [];
            }
            imUserHistory[self.loginUserInfo.userId] = self.messagesData
            storageProxy.setItem("imUserHistory", imUserHistory);
          });
        }
        return true;
      },
      onConnect(status) {
        const self = this;
        if (status == Strophe.Status.CONNFAIL) {
          console.log("连接失败！");
          self.flag = false;
        } else if (status == Strophe.Status.AUTHFAIL) {
          console.log("登录失败！");
          self.flag = false;
        } else if (status == Strophe.Status.DISCONNECTED) {
          console.log("连接断开！");
          self.$store.commit('UPDATE_IM_CONNECTED', false)
          self.flag = false;
          // 重连
          self.imConnection.connect(self.loginUserInfo.userName + '@im.misterling.cn/lovequest', '123123', self
            .onConnect);
        } else if (status == Strophe.Status.CONNECTED) {
          console.log("连接成功，可以开始聊天了！");
          self.$store.commit('UPDATE_IM_CONNECTED', true)
          // 当接收到<message>节，调用onMessage回调函数
          self.imConnection.addHandler(self.onMessage, null, 'message', 'chat', null, null);

          // 首先要发送一个<presence>给服务器（initial presence）
          self.imConnection.send($pres().tree());
        } else if (status == Strophe.Status.CONNTIMEOUT) {
          console.log('连接超时!')
          self.flag = false;
          // 重连
          self.$store.commit('UPDATE_IM_CONNECTED', false)
          self.imConnection.connect(self.loginUserInfo.userName + '@im.misterling.cn/lovequest', '123123', self
            .onConnect);
        } else if (status == Strophe.Status.ATTACHED) {
          self.$store.commit('UPDATE_IM_CONNECTED', true)
          console.log('读入缓存成功')
          // 当接收到<message>节，调用onMessage回调函数
          self.imConnection.addHandler(self.onMessage, null, 'message', 'chat', null, null);

          // 首先要发送一个<presence>给服务器（initial presence）
          self.imConnection.send($pres().tree());
        }
      },
      onPageInit() {
        const self = this;
        self.id = 1;
        // self.getData();
        // 连接聊天服务器
        // self.imConnection = new Strophe.Connection("https://im.app.misterling.cn");
        if (!self.imConnection) {
          self.$store.commit('UPDATE_IM_CONNECTION', new Strophe.Connection("https://im.app.misterling.cn"))
        }
        // 判断连接
        storageProxy.getItem("imUserInfo").then(function (imUserInfo) {
          if (!imUserInfo || !imUserInfo[self.loginUserInfo.userId]) {
            // 没有缓存，直接连接
            console.log('没有缓存')
            self.imConnection.connect(self.loginUserInfo.userName + '@im.misterling.cn/lovequest', '123123', self
              .onConnect);
          } else {
            console.log('有缓存')
            const rid = imUserInfo[self.loginUserInfo.userId].rid;
            const sid = imUserInfo[self.loginUserInfo.userId].sid;
            const jid = imUserInfo[self.loginUserInfo.userId].jid;
            self.imConnection.attach(jid, sid, rid, self.onConnect)
          }
        })
        var xmlInput = function (data) {
          // console.log('input: \n')
          // console.log(data)
        }
        self.flag = false;
        var xmlOutput = function (data) {
          // console.log('output: \n')
          // console.log(data);
          if (self.flag) return;
          var rid = data.getAttribute('rid');
          var sid = data.getAttribute('sid');
          var jid = self.loginUserInfo.userId + '@im.misterling.cn/lovequest';
          if (rid && sid) {
            self.flag = true;
            storageProxy.getItem("imUserInfo").then(function (imUserInfo) {
              if (!imUserInfo) {
                imUserInfo = {}
              }
              imUserInfo[self.loginUserInfo.userId] = {
                'rid': rid,
                'sid': sid,
                'jid': jid,
              }
              console.log('imUserInfo')
              storageProxy.setItem("imUserInfo", imUserInfo);
            });
          }
        }
        // self.imConnection.xmlInput = xmlInput;
        self.imConnection.xmlOutput = xmlOutput;
      },
      setBackground() {
        const self = this;
        const $$ = self.Dom7;
        console.log('setBackground')
        if (self.backgroundSetting[self.loginUserInfo.userId].type == 'babel') {
          // $$("div[data-name='home'] .page-content").addClass('background-default')
          // $$(".timeline-item-inner").addClass('babel-default')
        }
      },
      clickBackBtn: function () {
        const self = this;
        self.$u.backToExit(self, 1200)
      },
      onAfterIn() {
        navigator.splashscreen.hide();
      },
      onBeforeIn: function () {
        const self = this;
        // 绑定退出事件
        self.$u.unregisterEvent("backbutton");
        self.$u.registerEvent("backbutton", self.clickBackBtn);
        // });
        // self.checkUpdate(self);
      },
      getData() {
        const self = this;
        // 获取用户信息
        var user_ids = []
        if (self.loginUserInfo.userId) {
          user_ids.push(self.loginUserInfo.userId)
        } else {
          self.$v.showToast(self, '无法获取当前用户信息，请重新登录')
          self.$f7router.back();
          return;
        }
        if (self.loginUserInfo.partner_user_id) {
          user_ids.push(self.loginUserInfo.partner_user_id)
        }
        // 判断本地缓存中是否存在数据，如果存在，从本地缓存中获取
        // 1、时间线数据
        storageProxy.getItem("timelineInfo").then(function (timelineInfo) {
          if (timelineInfo) {
            self.$store.dispatch("updateTimeList", timelineInfo);
            return
          } else {
            // 不存在，从网络请求中获取
            console.log('getTimelineInfoFromNetwork')
            // 获取时间线数据
            lingFetch(self, "common.public", "get_event",
              function (result) {
                self.$store.dispatch("updateTimeList", result.data);
                storageProxy.setItem("timelineInfo", result.data)
              }, {
                user_ids: user_ids
              },
              function (result) {
                // 失败的回调函数
                // alert(JSON.stringify(result))
              }, {
                hideLoading: true,
              }
            )
          }
        })
        storageProxy.getItem("interactInfo").then(function (interactInfo) {
          if (interactInfo) {
            self.$store.dispatch("updateInteractInfo", interactInfo);
            return
          } else {
            // 不存在，从网络请求中获取
            console.log('getTimelineInfoFromNetwork')
            // 获取互动数据
            lingFetch(self, "common.user", "get_interact_info",
              function (result) {
                // console.log(result)
                self.$store.dispatch("updateInteractInfo", result.data);
                storageProxy.setItem("interactInfo", result.data)
              }, {
                user_ids: user_ids
              },
              function (result) {
                // 失败的回调函数
                // alert(JSON.stringify(result))
              }, {
                hideLoading: true,
              }
            )
          }
        })
      },
      onBeforeOut: function () {
        const self = this;
        self.$u.unregisterEvent("backbutton");
      },
    }
  }
</script>