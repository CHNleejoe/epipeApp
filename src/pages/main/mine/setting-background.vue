<template>
  <f7-page name="setting-background">
    <f7-navbar>
      <f7-nav-left back-link="返回" sliding />
      <f7-nav-title>设置背景</f7-nav-title>
      <f7-nav-right>
        <f7-button @click="saveBackgroundSetting"
          style="font-size: var(--f7-navbar-title-font-size);font-weight: var(--f7-navbar-title-font-weight);">保存
        </f7-button>
      </f7-nav-right>
    </f7-navbar>
    <f7-list>
      <f7-list-item checkbox title="默认模式" name="timeline-model" value="default" :checked="timelineMode === 'default'"
        @change="changeToDefault"></f7-list-item>
      <f7-list-item checkbox title="气泡模式" name="timeline-model" value="babel" :checked="timelineMode === 'babel'"
        @change="changeToBabel"></f7-list-item>
    </f7-list>
    <!-- <template v-if="timelineMode === 'babel'">
      <template v-for="(item, index) in bgPhotoList" v-if="index % 2 == 0">
        <f7-row class="gap_with_2 margin-bottom-2" :key="index">
          <f7-col class="img-data-grid">
            <img class="image_preview" width="100%" src="https://cdn.framework7.io/placeholder/people-160x160-2.jpg"
              v-if="bgPhotoList[index]" />
          </f7-col>
          <f7-col class="img-data-grid">
            <img class="image_preview" width="100%" src="https://cdn.framework7.io/placeholder/people-160x160-2.jpg"
              v-if="bgPhotoList[index + 1]" />
          </f7-col>
        </f7-row>
      </template>
    </template> -->
  </f7-page>
</template>
<script>
  export default {
    mounted() {
      const self = this;
      var backgroundSetting = self.$store.getters.getBackgroundSetting;
      var loginUserInfo = self.$store.getters.getLoginUserInfo
      if (backgroundSetting && loginUserInfo && loginUserInfo.userId && backgroundSetting[loginUserInfo.userId] &&
        backgroundSetting[loginUserInfo.userId].type) {
        self.timelineMode = backgroundSetting[loginUserInfo.userId].type
      } else {
        self.timelineMode = 'default'
      }
    },
    data: function () {
      return {
        content: "",
        photoUri: "",
        photoBrowserObject: null,
        userLoginInfo: {},
        timelineMode: '',
        bgPhotoList: [{
            id: "1",
            index: "2"
          },
          {
            id: "1",
            index: "2"
          },
          {
            id: "1",
            index: "2"
          },
          {
            id: "1",
            index: "2"
          },
          {
            id: "1",
            index: "2"
          },
          {
            id: "1",
            index: "2"
          },
          {
            id: "1",
            index: "2"
          }
        ]
      };
    },
    watch: {
      photoUri: function () {
        const self = this;
        const $ = self.$f7.$;
        self.$nextTick(function () {
          /*现在数据已经渲染完毕*/
          // if (self.photoUri) {
          //   self.photoBrowser()
          // }
          if (self.photoUri) {
            $(".interact-image")[0].style.height =
              $(".interact-image")[0].clientWidth + "px";
            self.photoBrowser();
          }
        });
      }
    },
    methods: {
      changeToDefault: function (event) {
        const self = this;
        if (self.timelineMode == 'default') {
          event.target.checked = true
        }
        self.timelineMode = event.target.value
      },
      changeToBabel: function (event) {
        const self = this;
        if (self.timelineMode == 'babel') {
          event.target.checked = true
        }
        self.timelineMode = event.target.value
      },
      setOptions: function (srcType) {
        var options = {
          // Some common settings are 20, 50, and 100
          quality: 100,
          destinationType: Camera.DestinationType.DATA_URL,
          // In this app, dynamically set the picture source, Camera or photo gallery
          sourceType: srcType,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
          allowEdit: true,
          correctOrientation: true //Corrects Android orientation quirks
        };
        return options;
      },
      photoBrowser: function () {
        const self = this;
        const app = self.$f7;
        const $$ = self.Dom7;
        if (!self.photoBrowserObject) {
          self.photoBrowserObject = app.photoBrowser.create({
            photos: [],
            popupCloseLinkText: "关闭",
            type: "standalone"
          });
        }
        $$(".interact-image").off("click");
        $$(".interact-image").on("click", function () {
          self.photoBrowserObject.params.photos = [
            "data:image/jpeg;base64," + self.photoUri
          ];
          self.photoBrowserObject.open();
        });
      },
      openFilePicker: function (selection) {
        const self = this;
        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = self.setOptions(srcType);

        var cameraSuccess = function (imageUri) {
          self.photoUri = imageUri;
          // self.photoBrowser()
        };

        var cameraError = function (error) {
          self.$v.customConfirmDialog(
            self,
            "无法获取照片:" + error,
            "提示",
            ["确定"],
            function () {},
            false,
            true
          );
        };
        navigator.camera.getPicture(cameraSuccess, cameraError, options);
      },
      saveBackgroundSetting: function () {
        // 先保存到本地
        const self = this;
        storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
          var userName = undefined;
          var userId = undefined;
          if (userLoginInfo && userLoginInfo.userId && userLoginInfo.userName) {
            userId = userLoginInfo.userId;
            userName = userLoginInfo.userName;
          } else {
            self.$v.showToast(self, "无法获取当前用户信息，请重新登录再试");
            return;
          }
          storageProxy.getItem("backgroundSetting").then(function (backgroundSetting) {
            if (!backgroundSetting) {
              backgroundSetting = {}
            }
            backgroundSetting[userId] = {
              'type': self.timelineMode,
            };
            self.$store.dispatch("updateBackgroundSetting", backgroundSetting);
            storageProxy.setItem("backgroundSetting", backgroundSetting).then(function () {
              self.$v.showToast(self, "保存成功");
            });
          });
        });
      }
    }
  };
</script>