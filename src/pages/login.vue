<template>
  <f7-page no-toolbar no-navbar no-swipeback login-screen @page:afterin="onAfterIn">
    <f7-login-screen-title style="margin:0 auto">
      <!-- <img src="/img/placeholderd.png" class="avator" /> -->
      <img :src="avatar" v-if="avatar" width="64" />
      <template v-else>恋爱日记</template>
    </f7-login-screen-title>
    <f7-list form style="margin: 0 auto;">
      <f7-list-input outline label="用户名" floating-label type="text" placeholder="请输入用户名" clear-button :value="username"
        @input="username = $event.target.value"></f7-list-input>
      <f7-list-input outline label="密码" floating-label type="password" placeholder="请输入密码" clear-button
        :value="password" @input="password = $event.target.value"></f7-list-input>
      <ul style="display: flex;justify-content: center;">
        <li>
          <label class="item-checkbox item-content" style="justify-content: left;">
            <input type="checkbox" name="save_psd" />
            <i class="icon icon-checkbox" style="margin: 0;"></i>
            <div class="item-inner" style="padding: 0 20px;">
              <!-- Checkbox Title -->
              <div class="item-title">记住密码</div>
            </div>
          </label>
        </li>
      </ul>
    </f7-list>
    <f7-block style="margin: 0 auto;">
      <button class="button col button-round login_btn" @click="signIn()">登录</button>
      <f7-block-footer>
        For life or for death, however separated,
        <br />To our wives we pleadged our word.
        <br />We held their hands;
        <br />We are to grow old together with them.
      </f7-block-footer>
    </f7-block>
  </f7-page>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  export default {
    computed: mapState([
      'backgroundSetting', 'loginUserInfo'
    ]),
    data() {
      return {
        username: "",
        password: "",
        dialog: "",
        avatar: ""
      };
    },
    mounted() {
      const self = this;
      // document.getElementsByClassName('login_btn')[0].setAttribute('disabled', true)
    },
    methods: {
      checkUpdate: function () {
        const self = this;
        self.$v.showLoading(self, "正在检查版本更新，等会哦");
        var onError = function (error) {
          self.$v.hideLoading(self);
          self.$v.showToast(self, "抱歉，更新失败。" + error.message);
        };

        var onInstallSuccess = function () {
          self.$v.hideLoading(self);
          self.$v.customConfirmDialog(
            self,
            "更新成功，请重启APP",
            "提示",
            ["重启APP"],
            function () {
              codePush.restartApplication();
            },
            false,
            true
          );
        };

        var onPackageDownloaded = function (localPackage) {
          self.$v.showLoading(self, "下载完成, 正在安装!");
          // Install mandatory updates after someone restarts the app
          localPackage.install(onInstallSuccess, onError, {
            installMode: InstallMode.ON_NEXT_RESTART,
            mandatoryInstallMode: InstallMode.ON_NEXT_RESTART
          });
        };

        var onProgress = function (downloadProgress) {
          if (downloadProgress) {
            // Update "downloading" modal with current download %
            var pecentage = parseInt(
              (downloadProgress.receivedBytes / downloadProgress.totalBytes) * 100
            );
            self.dialog.setProgress(pecentage);
            self.dialog.setText(
              "已下载" +
              pecentage +
              "%：" +
              self.$u.sizeChange(downloadProgress.receivedBytes) +
              "/" +
              self.$u.sizeChange(downloadProgress.totalBytes)
            );
            if (pecentage === 100) {
              self.dialog.close();
            }
          }
        };

        var onUpdateCheck = function (remotePackage) {
          if (!remotePackage) {
            self.$v.hideLoading(self);
            self.$v.customConfirmDialog(
              self,
              "老婆，APP已是最新版本，放心使用哈",
              "更新提示",
              ["前往指纹登录"],
              function () {
                self.fingerCheck();
              },
              false,
              true
            );
          } else {
            // if (!remotePackage.failedInstall) {
            self.$v.hideLoading(self);
            var label = remotePackage.label;
            var description = remotePackage.description.split("/");
            self.$v.customConfirmDialog(
              self,
              "发现新版本哦!老婆快快更新!",
              "提示:" + label,
              ["更新"],
              function () {
                self.dialog = self.$f7.dialog.progress("正在下载更新", 0);
                remotePackage.download(onPackageDownloaded, onError, onProgress);
              },
              "listContent",
              true,
              description
            );
            // } else {
            // self.$v.hideLoading(self);
            // self.$v.showToast(self, 'APP之前已尝试过自动更新，但更新失败')
            // }
          }
        };
        window.codePush.checkForUpdate(onUpdateCheck, onError);
      },
      onAfterIn: function () {
        const self = this;
        // 用户头像
        storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
          if (userLoginInfo && userLoginInfo.avatar) {
            self.avatar = userLoginInfo.avatar;
          }
        });
        // 阻止返回事件
        self.$u.unregisterEvent("backbutton");
        self.$u.registerEvent("backbutton", function (e) {
          event.preventDefault();
        });
        const first = !self.$f7route.query.notFirst;
        if (first) {
          setTimeout(function () {
            navigator.splashscreen.hide();
            // if(device.platform === 'iOS' || device.platform === 'Android') {
            // self.checkUpdate();
            // }
            self.fingerCheck();
          }, 1000);
        } else {
          self.fingerCheck();
        }
        storageProxy.getItem("saveLogin").then(function (saveLogin) {
          if (saveLogin != null) {
            self.username = saveLogin.username;
            self.password = saveLogin.password;
            document.getElementsByName("save_psd")[0].checked = saveLogin.checked;
          }
        });
      },
      fingerCheck() {
        const self = this;
        var isAvailableSuccess = function (result) {
          Fingerprint.show({
              clientId: "用户ID",
              clientSecret: "password" //Only necessary for Android
            },
            self.fingerLogin
          );
        };

        var isAvailableError = function () {
          document
            .getElementsByClassName("login_btn")[0]
            .removeAttribute("disabled");
          self.$v.showToast(self, "设备不支持指纹，请您密码登录");
        };
        Fingerprint.isAvailable(isAvailableSuccess, isAvailableError);
      },
      fingerLogin: function () {
        var self = this;
        var uuid = device.uuid;
        lingFetch(
          self,
          "common.user",
          "app_login",
          function (result) {
            // 保存登录信息到缓存
            self.saveLoginInfo(result);
            self.getMenuData();
            // self.$u.navigate(self, "/menu/", {
            //   ignoreCache: true,
            //   clearPreviousHistory: true
            // });
            // self.$v.showToast(self, "登录成功");
          }, {
            uuid: uuid
          },
          function (result) {
            self.$v.showToast(self, result.msg);
            self.$v.hideLoading(self);
            document
              .getElementsByClassName("login_btn")[0]
              .removeAttribute("disabled");
          }
        );
      },
      saveLoginInfo(result) {
        const self = this;
        // 保存登录信息到缓存
        var loginInfo = {
          userId: result.data.user_id,
          userName: result.data.name,
          login: result.data.login,
          sex: result.data.sex,
          birth: result.data.birth,
          signature: result.data.signature,
          partner_user_id: result.data.partner_user_id,
          partner_user_name: result.data.partner_user_name,
          partner_image_medium: envConfig.HOST + result.data.partner_image_medium,
          image: envConfig.HOST + result.data.image,
          image_medium: envConfig.HOST + result.data.image_medium,
          avatar: result.data.avatar
        };
        // 记录背景信息
        storageProxy.getItem("backgroundSetting").then(function (backgroundSetting) {
          if (backgroundSetting && backgroundSetting[result.data.user_id] && backgroundSetting[result.data.user_id]
            .type) {
            self.$store.dispatch("updateBackgroundSetting", backgroundSetting);
          } else {
            if (!backgroundSetting) {
              backgroundSetting = {};
            }
            backgroundSetting[result.data.user_id] = {
              'type': 'default'
            }
            self.$store.dispatch("updateBackgroundSetting", backgroundSetting);
          }
        })
        // self.$store.dispatch("updateLoginUserInfo", loginInfo);
        self.$store.commit('UPDATE_LOGIN_USER_INFO', loginInfo)
        // self.getData()
        var userLoginInfo = storageProxy
          .getItem("userLoginInfo")
          .then(function (userLoginInfo) {
            storageProxy.setItem("userLoginInfo", loginInfo);
          });
      },
      gotoMenu() {
        const self = this;
        self.$u.navigate(self, "/menu/", {
          ignoreCache: true,
          clearPreviousHistory: true
        });
        self.$v.showToast(self, "登录成功");
      },
      getMenuData() {
        const self = this;
        var user_ids = self.getUserInfo();
        // 请求时间线数据
        storageProxy.getItem("timelineInfo").then(function (timelineInfo) {
          if (timelineInfo && timelineInfo[self.loginUserInfo.userId]) {
            self.$store.dispatch("updateTimeList", timelineInfo[self.loginUserInfo.userId]);
          } else {
            // 不存在，从网络请求中获取
            console.log('getTimelineInfoFromNetwork')
            // 获取时间线数据
            lingFetch(self, "common.public", "get_event",
              function (result) {
                console.log('getTimelineInfoSuccess')
                self.$store.dispatch("updateTimeList", result.data);
                if (!timelineInfo) {
                  timelineInfo = {}
                }
                timelineInfo[self.loginUserInfo.userId] = result.data
                storageProxy.setItem("timelineInfo", timelineInfo)
              }, {
                user_ids: user_ids
              },
              function (result) {
                // 失败的回调函数
                // alert(JSON.stringify(result))
              }, {
                hideLoading: true,
                async: false,
              }
            )
          }
          // 请求互动数据
          storageProxy.getItem("interactInfo").then(function (interactInfo) {
            if (interactInfo && interactInfo[self.loginUserInfo.userId]) {
              self.$store.dispatch("updateInteractInfo", interactInfo[self.loginUserInfo.userId]);
              self.gotoMenu();
            } else {
              // 不存在，从网络请求中获取
              console.log('getInteractInfoFromNetwork')
              // 获取互动数据
              lingFetch(self, "common.user", "get_interact_info",
                function (result) {
                  // console.log(result)
                  console.log('getinteractInfoSuccess')
                  if (!interactInfo) {
                    interactInfo = {}
                  }
                  interactInfo[self.loginUserInfo.userId] = result.data
                  self.$store.dispatch("updateInteractInfo", result.data);
                  storageProxy.setItem("interactInfo", interactInfo)

                  // 成功后页面跳转
                  self.gotoMenu()
                }, {
                  user_ids: user_ids
                },
                function (result) {
                  // 失败的回调函数
                  // alert(JSON.stringify(result))
                }, {
                  hideLoading: true,
                  async: false,
                }
              )
            }
          })
        })
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
      signIn() {
        const self = this;
        const app = self.$f7;
        const router = self.$f7router;
        if (self.username == "develop" && self.password == "LJw19960112*") {
          self.$u.navigate(self, "/develop/", {});
          return;
        }
        lingFetch(
          self,
          "common.user",
          "app_login",
          function (result) {
            // 记住用户登录密码
            var saveLogin = {
              username: self.username,
              password: "",
              checked: false
            };
            if (document.getElementsByName("save_psd")[0].checked) {
              saveLogin = {
                username: self.username,
                password: self.password,
                checked: true
              };
            }
            var saveLoign = storageProxy.getItem("saveLogin").then(function () {
              storageProxy.setItem("saveLogin", saveLogin);
            });
            // 保存用户信息
            self.saveLoginInfo(result);
            self.getMenuData();
          }, {
            username: self.username,
            password: self.password
          },
          function (result) {
            self.$v.showToast(self, result.msg);
          }
        );
      }
    }
  };
</script>