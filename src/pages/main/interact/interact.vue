<template>
  <f7-page name="interact" :ptr-distance="60" class="page-interact" ptr @ptr:refresh="refreshInteract">
    <f7-navbar>
      <f7-nav-left />
      <f7-nav-title>互动</f7-nav-title>
      <f7-nav-right>
        <f7-link href="/interact-add/">
          <f7-icon ios="f7:plus" aurora="f7:plus" md="f7:plus"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <f7-card class="lingli-interact-card" v-for="(item, index) in interactInfo" :key="index">
      <f7-card-header class="no-border">
        <div class="lingli-interact-avatar"><img :src="host + item.userImageMedium" />
        </div>
        <div class="lingli-interact-name">{{item.userName}}</div>
        <div class="lingli-interact-date">{{item.timeTop}}</div>
      </f7-card-header>
      <f7-card-content :padding="false" v-if="item.image_medium">
        <img :src="host + item.image_medium" width="100%" class="image_content" :data-index="index" />
        <div class="card-content-padding">
          <p class="date">发布于{{item.timeBottom}}</p>
          <p>{{item.content}}</p>
          <div style="font-size: 13px;display: flex;align-items: center;"
            v-if="item.loveUsersInfo && item.loveUsersInfo.length">
            <span><i class="icon icon-interact-love"></i>{{loveInfoToString(item.loveUsersInfo)}}</span>
          </div>
        </div>
      </f7-card-content>
      <f7-card-content :padding="false" v-else="">
        <div class="card-content-padding">
          <p>{{item.content}}</p>
          <p class="date">发布于{{item.timeBottom}}</p>
          <div style="font-size: 13px;display: flex;align-items: center;"
            v-if="item.loveUsersInfo && item.loveUsersInfo.length">
            <span><i class="icon icon-interact-love"></i>{{loveInfoToString(item.loveUsersInfo)}}</span>
          </div>
        </div>
      </f7-card-content>
      <f7-card-footer class=" no-border">
        <f7-link>点赞</f7-link>
        <f7-link>评论</f7-link>
        <f7-link @click="deleteInteract" :data-id="item.id">删除</f7-link>
      </f7-card-footer>
    </f7-card>
    <div @click="scrollToTop"
      style="position: fixed;right: 0;display: none;bottom: calc(var(--f7-page-toolbar-bottom-offset, 0px) + var(--f7-safe-area-bottom) + var(--f7-page-content-extra-padding-bottom, 0px));"
      id="back-to-top">
      <f7-icon size="32px" f7="chevron_up_circle" style="color: teal"></f7-icon>
    </div>
  </f7-page>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  export default {
    computed: mapState([
      'interactInfo', 'loginUserInfo'
    ]),
    data: function () {
      return {
        host: envConfig.HOST,
        loveInfo: '',
      }
    },
    watch: {
      interactInfo: function () {
        const self = this;
        const $$ = self.Dom7;
        self.$nextTick(function () {
          /*现在数据已经渲染完毕*/
          self.updated();
        });
      }
    },
    methods: {
      loveInfoToString(info) {
        const self = this;
        var LoveInfoNames = []
        info.forEach(element => {
          LoveInfoNames.push(element.name)
        });
        return LoveInfoNames.join(', ')
      },
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
      refreshInteract(done) {
        const self = this;
        var user_ids = self.getUserInfo();
        lingFetch(self, "common.user", "get_interact_info",
          function (result) {
            self.$store.dispatch("updateInteractInfo", result.data);
            storageProxy.getItem("interactInfo").then(function (interactInfo) {
              if (!interactInfo) {
                interactInfo = {}
              }
              interactInfo[self.loginUserInfo.userId] = result.data
              storageProxy.setItem("interactInfo", interactInfo)
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
          }
        )
      },
      updated() {
        const self = this;
        const $$ = self.Dom7;
        if (self.interactInfo) {
          $$("#interact .page-content").off('scroll')
          $$("#interact .page-content").on('scroll', self.showTopBtn)
        }
        // $$("#interact .page-content").off('touchstart')
        // $$("#interact .page-content").on('touchstart', function (event) {
        //   if (self.scrollToptimer) {
        //     clearInterval(self.scrollToptimer);
        //   }
        // })
      },
      scrollToTop() {
        const self = this;
        const $$ = self.Dom7;
        self.scrollToptimer = setInterval(function () {
          var top = $$("#interact .page-content")[0].scrollTop
          if (top <= 0) {
            clearInterval(self.scrollToptimer);
            self.scrollToptimer = undefined;
          }
          if (top > 4) {
            var speed = top / 4;
          } else {
            var speed = 1;
          }
          $$("#interact .page-content")[0].scrollTop -= speed;
        }, 30);
      },
      showTopBtn(el) {
        const self = this;
        const $$ = self.Dom7;
        var topBtn = document.getElementById('back-to-top')
        let scrollTop = $$("#interact .page-content")[0].scrollTop
        let browserHeight = $$("#interact .page-content")[0].clientHeight;
        if (scrollTop > browserHeight) {
          topBtn.style.display = 'block';
        } else {
          topBtn.style.display = 'none';
        }
      },
      photoBrowser: function () {
        const self = this;
        const app = self.$f7;
        const $$ = self.Dom7;
        if (!self.photoBrowserObject) {
          self.photoBrowserObject = app.photoBrowser.create({
            photos: [],
            popupCloseLinkText: '关闭',
            type: 'standalone',
          });
        }
        $$('.image_content').off('click');
        $$('.image_content').on('click', function () {
          self.photoBrowserObject.params.photos = [self.host + self.interactInfo[$$(this).attr('data-index')]
            .image
          ]
          self.photoBrowserObject.open();
        });
      },
      deleteInteract: function (e) {
        const self = this;
        const $$ = self.Dom7;
        // console.log($$(e.target).attr('data-id'))
        self.$v.customConfirmDialog(self, '删除后无法恢复，确定要删除这条互动信息吗?', '提示', ['确定删除'], function () {
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
            lingFetch(self, "common.user", "delete_interact_info",
              function (result) {
                if (result.success) {
                  self.$store.dispatch("updateInteractInfo", result.data);
                  // self.$u.navigate(self, '/menu/interact/', {
                  // ignoreCache: true,
                  // clearPreviousHistory: true
                  // });
                }
              }, {
                'id': $$(e.target).attr('data-id'),
                'user_ids': user_ids,
                // 'uuid': self.
              },
              function (result) {
                self.$v.showToast(self, result.msg)
              }, {
                toastText: "正在删除互动记录"
              }
            )
          })
        }, false, false)
      },
    },
    mounted() {
      const self = this;
      const $$ = self.Dom7;
      self.photoBrowser();
      self.updated();
      // 点击停止向上滚动
      $$("#interact .page-content").on('touchstart', function (event) {
        if (self.scrollToptimer) {
          clearInterval(self.scrollToptimer);
          self.scrollToptimer = undefined;
        }
      })
    },
    beforeDestroy() {
      const self = this;
      clearInterval(self.scrollToptimer);
      self.scrollToptimer = undefined;
    }
  };
</script>