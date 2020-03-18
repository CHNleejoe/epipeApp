<template>
  <f7-page @page:init="onPageInit">
    <f7-navbar title="消息" back-link="返回"></f7-navbar>
    <f7-messagebar :placeholder="placeholder" ref="messagebar" :attachments-visible="attachmentsVisible"
      :sheet-visible="sheetVisible" @input="inputTyping">
      <f7-link icon-ios="f7:camera_fill" icon-aurora="f7:camera_fill" icon-md="material:camera_alt" slot="inner-start"
        @click="sheetVisible = !sheetVisible"></f7-link>
      <f7-link icon-ios="f7:arrow_up_fill" icon-aurora="f7:arrow_up_fill" icon-md="material:send" slot="inner-end"
        @click="sendMessage"></f7-link>
      <f7-messagebar-attachments>
        <f7-messagebar-attachment v-for="(image, index) in attachments" :key="index" :image="image"
          @attachment:delete="deleteAttachment(image)"></f7-messagebar-attachment>
      </f7-messagebar-attachments>
      <f7-messagebar-sheet>
        <f7-messagebar-sheet-image v-for="(image, index) in images" :key="index" :image="image"
          :checked="attachments.indexOf(image) >= 0" @change="handleAttachment"></f7-messagebar-sheet-image>
      </f7-messagebar-sheet>
    </f7-messagebar>

    <f7-messages ref="messages">
      <f7-messages-title><b>Sunday, Feb 9,</b> 12:58</f7-messages-title>
      <f7-message v-for="(message, index) in messagesData" :key="index" :type="message.type" :image="message.image"
        :name="message.name" :avatar="message.avatar" :first="isFirstMessage(message, index)"
        :last="isLastMessage(message, index)" :tail="isTailMessage(message, index)">
        <span slot="text" v-if="message.text" v-html="message.text"></span>
      </f7-message>
      <f7-message v-if="typingMessage" type="received" :typing="true" :first="true" :last="true" :tail="true"
        :header="`${typingMessage.name}正在输入`" :avatar="typingMessage.avatar"></f7-message>
    </f7-messages>
  </f7-page>
</template>
<script>
  import {
    mapState
  } from 'vuex'
  export default {
    data() {
      return {
        attachments: [],
        sheetVisible: false,
        typingMessage: null,
        // XMPP服务器BOSH地址
        BOSH_SERVICE: 'https://im.app.misterling.cn',
        // 当前登录的JID
        jid: "",
        images: [
          'https://cdn.framework7.io/placeholder/cats-300x300-1.jpg',
          'https://cdn.framework7.io/placeholder/cats-200x300-2.jpg',
          'https://cdn.framework7.io/placeholder/cats-400x300-3.jpg',
          'https://cdn.framework7.io/placeholder/cats-300x150-4.jpg',
          'https://cdn.framework7.io/placeholder/cats-150x300-5.jpg',
          'https://cdn.framework7.io/placeholder/cats-300x300-6.jpg',
          'https://cdn.framework7.io/placeholder/cats-300x300-7.jpg',
          'https://cdn.framework7.io/placeholder/cats-200x300-8.jpg',
          'https://cdn.framework7.io/placeholder/cats-400x300-9.jpg',
          'https://cdn.framework7.io/placeholder/cats-300x150-10.jpg',
        ],
        isTyping: false,
        typingCount: 0,
      };
    },
    computed: mapState({
      attachmentsVisible() {
        const self = this;
        return self.attachments.length > 0;
      },
      placeholder() {
        const self = this;
        return self.attachments.length > 0 ? '添加描述或直接发送' : '请输入消息';
      },
      imConnected: 'imConnected',
      imConnection: 'imConnection',
      loginUserInfo: 'loginUserInfo',
      messagesData: 'messagesData',
    }),
    mounted() {
      const self = this;
      self.$f7ready(() => {
        self.messagebar = self.$refs.messagebar.f7Messagebar;
        self.messages = self.$refs.messages.f7Messages;
      });
      // 修改主题颜色
      StatusBar.styleDefault();
      // 监听输入事件
      const $$ = self.Dom7;
      $$('textarea').on('input propertychange', self.inputTyping)
      // navigator.splashscreen.hide();
      // 通过BOSH连接XMPP服务器
      var xmlInput = function (data) {
        // console.log('input: \n')
        // console.log(data)
        // 判断正在输入， 获取信息
        Strophe.forEachChild(data, 'message', function (msChild) {
          var from = msChild.getAttribute('from');
          var type = msChild.getAttribute('type');
          var elems = msChild.getElementsByTagName('body');
          if (type == "chat" && elems.length > 0) {
            var body = elems[0];
            var text = Strophe.getText(body)
            // self.messagesData.push({
            //     name: self.loginUserInfo.partner_user_name,
            //     type: 'received',
            //     text: text,
            //     avatar: self.loginUserInfo.partner_image_medium,
            // });
          }
          Strophe.forEachChild(msChild, "composing", function (composing) {
            // console.log("对方正在输入")
            self.typingMessage = {
              name: self.loginUserInfo.partner_user_name,
              avatar: self.loginUserInfo.partner_image_medium,
            };
          })
          Strophe.forEachChild(msChild, "paused", function (composing) {
            // console.log("对方已经停止输入")
            self.typingMessage = null;
          })
        })
      }

      var xmlOutput = function (data) {
        // console.log('output: \n')
        // console.log(data.getAttribute('rid'));
        // Strophe.forEachChild(data, null, function (child) {
        // console.log(child.getAttribute('type'))
        // })
        // console.log(data)
      }
      self.jid = self.loginUserInfo.userName + "@im.misterling.cn/lovequest"
      self.imConnection.xmlInput = xmlInput;
      // self.imConnection.xmlOutput = xmlOutput;
    },
    methods: {
      onPageInit() {
        const self = this;
        // fixKeyBorardCovered();
        // 页面初始化时读取聊天记录
        storageProxy.getItem("imUserHistory").then(function (imUserHistory) {
          if (!imUserHistory) {
            imUserHistory = {}
          }
          if (!imUserHistory[self.loginUserInfo.userId]) {
            imUserHistory[self.loginUserInfo.userId] = [];
          }
          self.$store.dispatch("updateMessagesData", imUserHistory[self.loginUserInfo.userId]);
        });
      },
      inputTyping(event) {
        const self = this;
        // 正在输入，停止输入
        self.typingCount += 1;
        if (!self.isTyping) {
          ImChat.changeStatus(CHAT_STATUS.COMPOSING, self.imConnection, self.jid, self.loginUserInfo.partner_user_name +
            '@im.misterling.cn/lovequest');
          self.isTyping = true;
        }
        clearTimeout(self.timeToPaused);
        (function (typingCountTmp) {
          self.timeToPaused = setTimeout(function () {
            if (typingCountTmp === self.typingCount) {
              // console.log('两秒未输入')
              ImChat.changeStatus(CHAT_STATUS.PAUSED, self.imConnection, self.jid, self.loginUserInfo
                .partner_user_name + '@im.misterling.cn/lovequest');
              self.isTyping = false;
              self.typingCount = 0;
            }
          }, 2000)
        })(self.typingCount);
      },
      isFirstMessage(message, index) {
        const self = this;
        const previousMessage = self.messagesData[index - 1];
        if (message.isTitle) return false;
        if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !==
          message.name)
          return true;
        return false;
      },
      isLastMessage(message, index) {
        const self = this;
        const nextMessage = self.messagesData[index + 1];
        if (message.isTitle) return false;
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name)
          return true;
        return false;
      },
      isTailMessage(message, index) {
        const self = this;
        const nextMessage = self.messagesData[index + 1];
        if (message.isTitle) return false;
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name)
          return true;
        return false;
      },
      deleteAttachment(image) {
        const self = this;
        const index = self.attachments.indexOf(image);
        self.attachments.splice(index, 1)[0]; // eslint-disable-line
      },
      handleAttachment(e) {
        const self = this;
        const index = self.$$(e.target).parents('label.checkbox').index();
        const image = self.images[index];
        if (e.target.checked) {
          // Add to attachments
          self.attachments.unshift(image);
        } else {
          // Remove from attachments
          self.attachments.splice(self.attachments.indexOf(image), 1);
        }
      },
      sendMessage() {
        const self = this;
        const text = self.messagebar.getValue().replace(/\n/g, '<br>').trim();
        const messagesToSend = [];
        // setTimeout(function () {
        //   cordova.plugins.notification.local.schedule({
        //     title: 'My first notification',
        //     text: 'Thats pretty easy...',
        //     // foreground: true
        //   });
        // }, 5000)
        self.attachments.forEach((attachment) => {
          messagesToSend.push({
            image: attachment,
          });
        });
        if (text.trim().length) {
          messagesToSend.push({
            'avatar': self.loginUserInfo.image_medium,
            "text": text,
          });
        }
        if (messagesToSend.length === 0) {
          return;
        }

        // Reset attachments
        self.attachments = [];
        // Hide sheet
        self.sheetVisible = false;
        // Clear area
        self.messagebar.clear();
        // Focus area
        if (text.length) self.messagebar.focus();
        // Send message
        if (self.imConnected) {
          // 创建一个<message>元素并发送
          var msg = $msg({
            to: self.loginUserInfo.partner_user_name + '@im.misterling.cn/lovequest',
            from: self.jid,
            type: 'chat'
          }).c("body", null, text);
          self.imConnection.send(msg.tree());
          // self.messagesData.push(...messagesToSend);
          storageProxy.getItem("imUserHistory").then(function (imUserHistory) {
            if (!imUserHistory) {
              imUserHistory = {}
            }
            if (!imUserHistory[self.loginUserInfo.userId]) {
              imUserHistory[self.loginUserInfo.userId] = [];
            }
            imUserHistory[self.loginUserInfo.userId].push(...messagesToSend)
            storageProxy.setItem("imUserHistory", imUserHistory);
            self.$store.dispatch("updateMessagesData", imUserHistory[self.loginUserInfo.userId]);
          });
          // self.connection.disconnect();
        } else {
          alert("聊天服务器正在连接，请稍后再试！");
        }
      },
    },
  };
</script>