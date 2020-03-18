<template>
  <f7-page name="interact-add">
    <f7-navbar title="发布互动" back-link="返回"></f7-navbar>
    <f7-list inline-labels no-hairlines-md>
      <f7-list-input type="textarea" placeholder="内容" resizable required :value="content" clear-button
        @input="content = $event.target.value"></f7-list-input>
      <li>
        <!-- <f7-row no-gap class="interact-image">
          <img width="100%" :src="photoUri" />
        </f7-row> -->
        <f7-row no-gap>
          <f7-col class="interact-image" v-if="photoUri">
            <img width="100%" :src="'data:image/jpeg;base64,' + photoUri" />
          </f7-col>
        </f7-row>
      </li>
      <f7-list-button class="btn-text-center" title="选择照片" @click="openFilePicker"></f7-list-button>
    </f7-list>
    <f7-block>
      <f7-button round fill @click="addInteract()">发布</f7-button>
    </f7-block>
  </f7-page>
</template>

<script>
  export default {
    data: function () {
      return {
        content: '',
        photoUri: '',
        photoBrowserObject: null,
        userLoginInfo: {},
      }
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
            $('.interact-image')[0].style.height = $('.interact-image')[0].clientWidth + 'px';
            self.photoBrowser();
          }
        })
      },
    },
    mounted() {
      const self = this;
      // storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
      //   self.userLoginInfo = userLoginInfo
      // });
    },
    methods: {
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
        }
        return options;
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
        $$('.interact-image').off('click');
        $$('.interact-image').on('click', function () {
          self.photoBrowserObject.params.photos = ['data:image/jpeg;base64,' + self.photoUri]
          self.photoBrowserObject.open();
        });
      },
      openFilePicker: function (selection) {
        const self = this;
        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = self.setOptions(srcType);

        var cameraSuccess = function (imageUri) {
          self.photoUri = imageUri
          // self.photoBrowser()
        }

        var cameraError = function (error) {
          self.$v.customConfirmDialog(self, '无法获取照片:' + error, '提示', ['确定'],
            function () {}, false, true)
        }
        navigator.camera.getPicture(cameraSuccess, cameraError, options);
      },
      addInteract: function () {
        const self = this;
        self.$v.showLoading(self, '正在获取用户数据')
        storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
          self.$v.hideLoading(self)
          var user_ids = []
          if (userLoginInfo.userId) {
            user_ids.push(userLoginInfo.userId)
          } else {
            self.$v.showToast(self, '无法获取当前用户信息，无法上传。')
            return;
          }
          if (userLoginInfo.partner_user_id) {
            user_ids.push(userLoginInfo.partner_user_id)
          }
          if (user_ids.length) {
            lingFetch(self, "common.user", "set_interact_info",
              function (result) {
                if (result.success) {
                  self.$store.dispatch("updateInteractInfo", result.data);
                  storageProxy.setItem("interactInfo", result.data)
                  self.$f7router.back();
                  self.$v.showToast(self, '发布成功')
                }
              }, {
                'content': self.content,
                'image': self.photoUri,
                'uuid': user_ids[0],
                'user_ids': user_ids,
              },
              function (result) {
                self.$v.showToast(self, result.msg)
              }, {
                toastText: "正在发布哦，稍等哈"
              }
            )
          }
        })
      }
    }
  };
</script>