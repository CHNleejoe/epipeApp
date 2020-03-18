<template>
  <f7-page ptr :ptr-distance="100" @ptr:refresh="refreshTimeline" name="home" class="page-home background-default"
    v-if="loginUserInfo && loginUserInfo.userId && backgroundSetting[loginUserInfo.userId].type == 'babel'">
    <div class="timeline-title">
      <div class="timeline-title-img">
        <img :src="loginUserInfo.image_medium" />
      </div>
      <div class="timeline-title-content" @touchstart="gtouchstart" @touchmove="gtouchmove" @touchend="gtouchend">
        <div>我们已在一起</div>
        <div>{{togetherDays}}天</div>
      </div>
      <div class="timeline-title-img">
        <img :src="loginUserInfo.partner_image_medium" />
      </div>
    </div>
    <ling-loding v-if="isLoading" loadingText="拼命加载中..." />
    <div class="home-timeline timeline timeline-babel ptr-ignore" style="display: none;">
      <!-- Timeline item -->
      <div class="timeline-item" v-for="(line, index) in timeList" :key="index" :id='line.togo'>
        <div class="timeline-item-date timeline-item-inner timeline-time babel-default"><small>{{line.date}}</small>
        </div>
        <div class="timeline-item-divider"></div>
        <div class="timeline-item-content timeline-item-inner timeline-content babel-default">{{line.event}}</div>
      </div>
    </div>
    <div @touchmove="scrollToMove" style="position: fixed;right: 0;display: none;z-index: 100000" id="scroll-to-move">
      <f7-icon size="32px" f7="chevron_left_circle" style="color: teal"></f7-icon>
    </div>
  </f7-page>
  <f7-page ptr :ptr-distance="100" @ptr:refresh="refreshTimeline" name="home" class="page-home"
    style="background: #eee;" v-else="">
    <div class="timeline-title">
      <div class="timeline-title-img">
        <img :src="loginUserInfo.image_medium" />
      </div>
      <div @touchstart="gtouchstart" @touchmove="gtouchmove" @touchend="gtouchend"
        class="timeline-title-content timeline-title-content-black">
        <div>我们已在一起</div>
        <div>{{togetherDays}}天</div>
      </div>
      <div class="timeline-title-img">
        <img :src="loginUserInfo.partner_image_medium" />
      </div>
    </div>
    <ling-loding v-if="isLoading" loadingText="拼命加载中..." />
    <div class="home-timeline timeline timeline-sides ptr-ignore" style="display: none;padding-top: 20px;">
      <div class="timeline-item" v-for="(line, index) in timeList" :key="index" :id='line.togo'>
        <div class="timeline-item-date timeline-time"><small>{{line.date}}</small></div>
        <div class="timeline-item-divider"></div>
        <div class="timeline-item-content timeline-content">{{line.event}}</div>
      </div>
    </div>
    <div @touchmove="scrollToMove" style="position: fixed;right: 0;display: none;z-index: 100000" id="scroll-to-move">
      <f7-icon size="32px" f7="chevron_left_circle" style="color: teal"></f7-icon>
    </div>
  </f7-page>
</template>
<script>
  import {
    mapState
  } from 'vuex'
  export default {
    computed: mapState([
      'timeList', 'backgroundSetting', 'loginUserInfo'
    ]),
    watch: {
      timeList: function () {
        const self = this;
        const $$ = self.Dom7;
        self.$nextTick(function () {
          /*现在数据已经渲染完毕*/
          if (self.timeList) {
            self.updated();
          }
        });
      }
    },
    data: function () {
      return {
        togetherDays: 0,
        isLoading: true,
      }
    },
    methods: {
      getUserInfo() {
        const self = this;
        // 获取用户信息
        var user_ids = []
        if (self.loginUserInfo.userId) {
          user_ids.push(self.loginUserInfo.userId)
        } else {
          self.$v.showToast(self, '无法获取当前用户信息，请重新登录')
          // self.$f7router.back();
          return;
        }
        if (self.loginUserInfo.partner_user_id) {
          user_ids.push(self.loginUserInfo.partner_user_id)
        }
        return user_ids
      },
      refreshTimeline(done) {
        const self = this;
        var user_ids = self.getUserInfo();
        lingFetch(self, "common.public", "get_event",
          function (result) {
            self.$store.dispatch("updateTimeList", result.data);
            storageProxy.getItem("timelineInfo").then(function (timelineInfo) {
              if (!timelineInfo) {
                timelineInfo = {}
              }
              timelineInfo[self.loginUserInfo.userId] = result.data
              storageProxy.setItem("timelineInfo", timelineInfo)
            })
            self.$v.showToast(self, '数据更新成功')
            done();
          }, {
            user_ids: user_ids
          },
          function (result) {
            // 失败的回调函数
            // alert(JSON.stringify(result))
            self.$v.showToast(self, '数据更新失败')
            done();
          }, {
            hideLoading: true,
            // async: false,
          }
        )
      },
      changeTogetherDay() {
        const self = this;
        self.$u.navigate(self, '/together-day/', {})
      },
      updated() {
        const self = this;
        const $$ = self.Dom7;

        // if (self.backgroundSetting[self.loginUserInfo.userId].type == 'babel') {
        // $$("div[data-name='home'] .page-content").addClass('background-default')
        // $$(".timeline-item-inner").addClass('babel-default')
        // }
        $$(".home-timeline").off('scroll')
        $$(".home-timeline").on('scroll', self.showMoveBtn)

        self.computedTogetherDays()

        // self.showMoveBtn()
        $$(".home-timeline")[0].style.display = ''

        self.isLoading = false
      },
      scrollToMove(event) {
        // 阻止默认方法
        event.preventDefault();
        const self = this;
        const $$ = self.Dom7;
        // 可滚动总长度，滚动总长度减去一个页面的长度
        var scrollEndHeight = $$(".home-timeline")[0].scrollHeight - $$(".home-timeline")[0].clientHeight
        // 按钮当前所处位置
        var btnNowY = event.touches[0].clientY - $$(".timeline-title")[0].clientHeight
        // 按钮显示总长度，安卓端需要减去32
        var btnTotalY = $$(".home-timeline")[0].clientHeight - 32
        // 需要滚动到的位置
        var scrollTo = btnNowY * scrollEndHeight / btnTotalY
        if (btnNowY >= btnTotalY || btnNowY <= 0) {
          // if (btnNowY <= 0) {
          //   document.getElementById('scroll-to-move').style.display = 'none';
          // }
          // 超出位置不做任何操作
          return
        }
        // 移动页面
        $$(".home-timeline")[0].scrollTop = scrollTo
      },
      showMoveBtn() {
        const self = this;
        const $$ = self.Dom7;
        // 移动按钮
        var moveBtn = document.getElementById('scroll-to-move')
        // 当前滚动高度
        var scrollTop = $$(".home-timeline")[0].scrollTop
        // 页面高度
        var clientHeight = $$(".home-timeline")[0].clientHeight;
        if (scrollTop > clientHeight) {
          // 当前滚动高度 > 页面高度 显示按钮
          moveBtn.style.display = 'block';
        }
        // 时间线标题的长度
        var timelineTilteHeight = $$(".timeline-title")[0].clientHeight
        // 可滚动总高度，滚动总长度减去一个页面的长度
        var scrollEndHeight = $$(".home-timeline")[0].scrollHeight - $$(".home-timeline")[0].clientHeight
        // 按钮显示总高度，安卓端需要减去32
        var btnTotalY = $$(".home-timeline")[0].clientHeight - 32
        // 按钮应处位置
        var btnNow = scrollTop * btnTotalY / scrollEndHeight
        // 重设按钮位置
        moveBtn.style.top = btnNow + timelineTilteHeight + 'px'

        // 到达顶端按钮消失
        if (scrollTop === 0) {
          moveBtn.style.display = 'none';
        }
        // 超越底部按钮消失
        // if (scrollTop > scrollEndHeight) {
        //   moveBtn.style.display = 'none';
        // }
      },
      getDays: function (date1, date2) {
        var date1Str = date1.split("-"); //将日期字符串分隔为数组,数组元素分别为年.月.日
        //根据年 . 月 . 日的值创建Date对象
        var date1Obj = new Date(date1Str[0], (date1Str[1] - 1), date1Str[2]);
        var date2Str = date2.split("-");
        var date2Obj = new Date(date2Str[0], (date2Str[1] - 1), date2Str[2]);
        var t1 = date1Obj.getTime();
        var t2 = date2Obj.getTime();
        var dateTime = 1000 * 60 * 60 * 24; //每一天的毫秒数
        var minusDays = Math.floor(((t2 - t1) / dateTime)); //计算出两个日期的天数差
        var days = Math.abs(minusDays); //取绝对值
        return days;
      },
      computedTogetherDays() {
        const self = this;
        var userId = self.loginUserInfo.userId
        storageProxy.getItem("togetherDay").then(function (togetherDay) {
          if (togetherDay && userId && togetherDay[userId] && togetherDay[userId].date) {
            self.togetherDays = self.getDays(togetherDay[userId].date, new Date().Format('yyyy-MM-dd'))
          }
        })
      },
      //开始按 
      gtouchstart(e) {
        console.log('touchstart')
        const self = this;
        self.timeOutEvent = setTimeout(self.longPress, 500); //这里设置定时器，定义长按500毫秒触发长按事件，时间可以自己改，个人感觉500毫秒非常合适 
        return false;
      },
      //手释放，如果在500毫秒内就释放，则取消长按事件，此时可以执行onclick应该执行的事件 
      gtouchend() {
        const self = this;
        console.log('touchend')
        clearTimeout(self.timeOutEvent); //清除定时器 
        if (self.timeOutEvent != 0) {
          //这里写要执行的内容（尤如onclick事件） 
          self.changeTogetherDay()
        }
        return false;
      },
      //如果手指有移动，则取消所有事件，此时说明用户只是要移动而不是长按 
      gtouchmove() {
        const self = this;
        console.log('touchmove')
        clearTimeout(self.timeOutEvent); //清除定时器 
        self.timeOutEvent = 0;
      },
      //真正长按后应该执行的内容 
      longPress() {
        const self = this;
        const $$ = self.Dom7;
        // e.preventDefault();
        self.timeOutEvent = 0;
        //执行长按要执行的内容，如弹出菜单 
        // $$(".home-timeline")[0].scrollTop = $('#togo').offsetTop
        // console.log($$(".home-timeline"))
        // console.log($$('#togo').offset())
        // console.log($$(".home-timeline").animate)
        // console.log($$('#togo').offset().top)
        window.Dom7 = $$
        $$(".home-timeline").scrollTo(0, $$('#togo')[0].offsetTop, 750);
        // window.location.hash = "";
        // window.location.hash = "#togo";
        // alert("长按事件触发发");
      },
    },

    mounted() {
      const self = this;
      const $$ = self.Dom7;
      console.log('mounted')
      if (self.loginUserInfo && self.loginUserInfo.userId && self.backgroundSetting[self.loginUserInfo.userId].type ==
        'babel') {
        StatusBar.styleLightContent();
      } else {
        StatusBar.styleDefault();
      }
      self.updated();
    },
    beforeDestroy() {
      StatusBar.styleDefault();
    }
  };
</script>