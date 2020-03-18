<template>
  <f7-page name="photos" style="background: white;" @page:afterin="onAfterIn">
    <f7-navbar title="添加照片" back-link="返回">
      <f7-nav-right>
        <f7-button @click="uploadPhotoMultiWithConfirm"
          style="font-size: var(--f7-navbar-title-font-size);font-weight: var(--f7-navbar-title-font-weight);">上传
        </f7-button>
      </f7-nav-right>
    </f7-navbar>
    <f7-block-title>
      <!-- <f7-list style="margin: 0;"> -->
      <f7-input type="datepicker" placeholder="点击选择事件时间"
        :calendar-params="{openIn: 'customModal', header: false, footer: false, dateFormat: 'yyyy年mm月dd日'}"
        :value="photoDate" readonly required @calendar:change="setDateValue" class="photoDatePicker"></f7-input>
      <!-- </f7-list> -->
    </f7-block-title>
    <f7-row no-gap>
      <f7-col class="img-form" width="100">
        <f7-list form style="margin: 0;">
          <f7-list-input outline label="名称" floating-label type="text" placeholder="为照片添加一个好听的名字" clear-button
            :value="photoName" @input="photoName = $event.target.value">
          </f7-list-input>
          <f7-list-input outline label="拍摄地点" floating-label type="text" placeholder="照片在哪儿拍的鸭" clear-button
            :value="photoAddress" @input="photoAddress = $event.target.value"></f7-list-input>
        </f7-list>
      </f7-col>
      <f7-col width="40" class="img-data" v-if="photoUri">
        <img width="100%" :src="photoUri" />
      </f7-col>
    </f7-row>
    <f7-row no-gap>
      <f7-col>
        <f7-button style="font-weight: normal;" large @click="openFilePicker">选择照片</f7-button>
      </f7-col>
      <f7-col>
        <f7-button style="font-weight: normal;" large @click="addPhotoToList">添加</f7-button>
      </f7-col>
    </f7-row>
    <f7-row no-gap>
      <f7-col>
        <f7-button style="font-weight: normal;" large @click="photoPickerMulti">批量添加照片</f7-button>
      </f7-col>
      <f7-col>
        <f7-button style="font-weight: normal;" large @click="saveChange">保存</f7-button>
      </f7-col>
    </f7-row>
    <hr
      style="color: var(--f7-list-border-color);transform-origin: 50% 100%;transform: scaleY(calc(1 / var(--f7-device-pixel-ratio)));" />
    <f7-block style=" padding: 0;">
      <f7-row class="gap_with_2 margin-botton-2">
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(0)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="0" v-if="photoList.length > 0" :src="photoList[0].photoUri" />
        </f7-col>
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(1)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="1" v-if="photoList.length > 1" :src="photoList[1].photoUri" />
        </f7-col>
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(2)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="2" v-if="photoList.length > 2" :src="photoList[2].photoUri" />
        </f7-col>
      </f7-row>
      <f7-row class="gap_with_2 margin-botton-2">
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(3)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="3" v-if="photoList.length > 3" :src="photoList[3].photoUri" />
        </f7-col>
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(4)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="4" v-if="photoList.length > 4" :src="photoList[4].photoUri" />
        </f7-col>
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(5)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="5" v-if="photoList.length > 5" :src="photoList[5].photoUri" />
        </f7-col>
      </f7-row>
      <f7-row class="gap_with_2 margin-botton-2">
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(6)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="6" v-if="photoList.length > 6" :src="photoList[6].photoUri" />
        </f7-col>
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(7)">
            <div class="chip-label">删除</div>
          </div>
          <img width='100%' data-index="7" v-if="photoList.length > 7" :src="photoList[7].photoUri" />
        </f7-col>
        <f7-col class="img-data-grid">
          <div class="chip color-red" style="position: absolute; display: none;" @click="deletePhoto(8)">
            <div class="chip-label">删除</div>
          </div><img width='100%' data-index="8" v-if="photoList.length > 8" :src="photoList[8].photoUri" />
        </f7-col>
      </f7-row>
    </f7-block>
  </f7-page>
</template>
<script>
  import {
    isDate
  } from 'util';
  export default {
    data: function () {
      return {
        photoDate: [(new Date()).Format("yyyy-M-d")],
        photoName: '',
        photoAddress: '',
        photoBrowserObject: null,
        photoList: [],
        photoUri: '',
        dialog: '',
        user_ids: [],
        editPhotoIndex: -1,
      };
    },
    watch: {
      photoUri: function () {
        const self = this;
        const $ = self.$f7.$;
        self.$nextTick(function () {
          /*现在数据已经渲染完毕*/
          if (self.photoUri) {
            self.photoBrowser()
          }
          if (!self.photoUri) {
            $('.img-form')[0].classList.add('col-100')
            $('.img-form')[0].classList.remove('col-60')
          } else if (!self.inArray($('.img-form')[0].classList, 'col-60')) {
            $('.img-data')[0].style.height = $('.img-form')[0].clientHeight + 'px'
            $('.img-form')[0].classList.remove('col-100')
            $('.img-form')[0].classList.add('col-60')
          }
        })
      },
      photoList: function () {
        const self = this;
        const $ = self.$f7.$;
        const $$ = self.Dom7;
        self.$nextTick(function () {
          /*现在数据已经渲染完毕*/
          $('.img-data-grid').forEach(element => {
            element.style.height = element.clientWidth + 'px'
          });
          $$('.img-data-grid .chip').css('display', 'none')
          // 添加点击事件
          $$('.img-data-grid').off('click');
          $$('.img-data-grid').on('click', function () {
            if (this.children.length != 1) {
              var index = parseInt(this.lastElementChild.getAttribute('data-index'))
              const temp = self.photoList[index];
              // 显示删除按钮
              if (this.firstElementChild.style.display == 'none') {
                // 先去除其他的删除按钮
                $$('.img-data-grid .chip').css('display', 'none')
                // 设置当前按钮
                this.firstElementChild.style.display = 'inline-flex'
                // 设置input框的值
                self.photoName = temp.photoName
                self.photoAddress = temp.photoAddress
                self.photoUri = temp.photoUri
                self.editPhotoIndex = index
              } else {
                this.firstElementChild.style.display = 'none'
                self.photoName = ''
                self.photoAddress = ''
                self.photoUri = ''
                self.editPhotoIndex = -1
              }
            }
          });
        })
      },
    },
    methods: {
      onAfterIn: function () {
        const self = this;
        const $ = self.$f7.$;
        // console.log('dsfasd')
        // self.photoBrowser()
        storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
          var user_ids = []
          if (userLoginInfo.userId) {
            user_ids.push(userLoginInfo.userId)
          } else {
            self.$v.showToast(self, '无法获取当前用户信息，无法上传')
            self.$f7router.back();
            return;
          }
          if (userLoginInfo.partner_user_id) {
            user_ids.push(userLoginInfo.partner_user_id)
          }
          self.user_ids = user_ids
          console.log(user_ids)
        })
        // $('.img-data-grid').forEach(element => {
        //   // console.log(element)
        //   element.style.height = element.clientWidth + 'px'
        // });
      },
      saveChange: function () {
        const self = this;
        if (self.editPhotoIndex == -1) {
          self.$v.showToast(self, '当前没有正在编辑的照片', false);
          return;
        }
        self.photoList.splice(self.editPhotoIndex, 1, {
          photoName: self.photoName,
          photoAddress: self.photoAddress,
          photoUri: self.photoUri,
        })
        self.$v.showToast(self, '保存成功', false);
      },
      photoPickerMulti: function () {
        const self = this;
        if (self.photoList.length >= 9) {
          self.$v.showToast(self, '一次最多添加9张照片', false);
          return;
        }
        // var imgs = document.getElementById('testImage');
        var args = {
          'selectMode': 100, //101=picker image and video , 100=image , 102=video
          'maxSelectCount': 9 - self.photoList.length, //default 40 (Optional)
          'maxSelectSize': 188743680, //188743680=180M (Optional) 
        };
        var getThumbnail = function (medias) {
          for (var i = 0; i < medias.length; i++) {
            medias[i].thumbnailQuality = 100;
            // loadingUI(); //show loading ui
            self.photoList.push({
              'photoName': '',
              'photoAddress': '',
              'photoUri': medias[i].path
            })
          }
        }
        MediaPicker.getMedias(args, function (medias) {
          //medias [{mediaType: "image", path:'/storage/emulated/0/DCIM/Camera/2017.jpg', uri:"android retrun uri,ios retrun URL" size: 21993}]
          getThumbnail(medias);
        }, function (e) {
          self.$v.showToast(self, '添加出错:' + e, false);
        })
      },
      deletePhoto: function (index) {
        const self = this;
        const $ = self.$f7.$;
        self.photoName = ''
        self.photoAddress = ''
        self.photoUri = ''
        self.editPhotoIndex = -1
        self.photoList.splice(index, 1)
        // console.log($('.img-data-grid')[index].firstElementChild.style.display)
        // $('.img-data-grid').forEach(element => {
        //   element.firstElementChild.style.display = 'none'
        // })
        $('.img-data-grid')[index].firstElementChild.style.display = 'none'
      },
      photoBrowser: function () {
        const self = this;
        const app = self.$f7;
        const $$ = self.Dom7;
        if (!self.photoBrowserObject) {
          self.photoBrowserObject = app.photoBrowser.create({
            photos: [self.photoUri],
            popupCloseLinkText: '关闭',
            type: 'standalone',
          });
        }
        $$('.img-data').off('click');
        $$('.img-data').on('click', function () {
          self.photoBrowserObject.params.photos = [self.photoUri]
          self.photoBrowserObject.open();
        });
      },
      inArray: function (arr, item) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] == item) {
            return true;
          }
        }
        return false;
      },
      setDateValue: function (value) {
        var self = this;
        self.photoDate = value
      },
      addPhotoToList: function () {
        const self = this;
        if (!self.photoUri) {
          self.$v.showToast(self, '请先选择一张照片', false);
          return;
        }
        if (self.photoName === '') {
          self.$v.showToast(self, '照片还没有名字哦', false);
          return;
        }
        if (!self.photoAddress) {
          self.$v.showToast(self, '照片是在哪儿拍的鸭', false);
          return;
        }
        if (self.photoList.length >= 9) {
          self.$v.showToast(self, '一次最多添加9张照片', false);
          return;
        }
        self.photoList.push({
          'photoName': self.photoName,
          'photoAddress': self.photoAddress,
          'photoUri': self.photoUri,
        })
        self.photoName = ''
        self.photoAddress = ''
        self.photoUri = ''
        self.editPhotoIndex = -1
      },
      setOptions: function (srcType) {
        var options = {
          // Some common settings are 20, 50, and 100
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          // In this app, dynamically set the picture source, Camera or photo gallery
          sourceType: srcType,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
          allowEdit: true,
          correctOrientation: true //Corrects Android orientation quirks
        }
        return options;
      },
      createNewFileEntry: function (imgUri) {
        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

          // JPEG file
          dirEntry.getFile("tempFile.jpeg", {
            create: true,
            exclusive: false
          }, function (fileEntry) {

            // Do something with it, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.fullPath, "File copied to");

          }, onErrorCreateFile);

        }, onErrorResolveUrl);
      },
      openFilePicker: function (selection) {
        const self = this;
        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = self.setOptions(srcType);
        var func = self.createNewFileEntry;

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
      uploadPhotoMultiWithConfirm: function () {
        const self = this;
        // 没有照片不允许上传
        if (self.photoList.length == 0) {
          self.$v.showToast(self, '没有可上传的照片！', false);
          return;
        }
        var emptyName = []
        var emptyAddress = []
        self.photoList.forEach((element, index) => {
          if (!element.photoName) {
            emptyName.push(index + 1);
          }
          if (!element.photoAddress) {
            emptyAddress.push(index + 1);
          }
        });
        // 不能上传
        if (emptyName.length || emptyAddress.length) {
          var confirmString = '无法上传照片：\n'
          if (emptyName.length) {
            confirmString += '第' + emptyName.join(',') + '张照片没有名字\n'
          }
          if (emptyAddress.length) {
            confirmString += '第' + emptyAddress.join(',') + '张照片没有地址'
          }
          self.$v.customConfirmDialog(self, confirmString, '警告', ['确定'],
            function () {}, false, true)
        } else {
          // 提示用户是否上传
          var confirmString = '是否要上传' + self.photoList.length + '张照片？'
          self.$v.customConfirmDialog(self, confirmString, '提示', ['上传'],
            function () {
              if (self.user_ids.length >= 1) {
                self.uploadPhotoMulti()
              } else {
                self.$v.showToast(self, '无法获取当前用户信息，无法上传')
              }
            }, false, false)
        }
      },

      uploadPhotoMulti: function () {
        const self = this;
        var index = 0;
        var success = function (r) {
          index += 1;
          if (index == self.photoList.length) {
            self.dialog.close();
            self.$v.customConfirmDialog(self, '共上传' + index + '张照片', '上传成功', ['确定'],
              function () {}, false, true)
          } else {
            self.uploadPhoto(index + 1, self.photoList[index].photoName, self.photoList[index].photoAddress,
              self
              .photoList[index].photoUri, success)
            self.dialog.setTitle('正在上传第' + (index + 1) + '/' + self.photoList.length + '张照片')
            self.dialog.setProgress(0);
            self.dialog.setText('已上传0%：0/0');
          }
        }
        self.uploadPhoto(index + 1, self.photoList[index].photoName, self.photoList[index].photoAddress, self
          .photoList[index].photoUri, success)
        self.dialog = self.$f7.dialog.progress('正在上传第' + (index + 1) + '/' + self.photoList.length + '张照片', 0)
      },
      uploadPhoto: function (index, photoName, photoAddress, photoUri, success) {
        const self = this;
        var fail = function (error) {
          self.dialog.close();
          alert("An error has occurred: Code = " + error.code);
          console.log("upload error source " + error.source);
          console.log("upload error target " + error.target);
        }

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = photoUri.substr(photoUri.lastIndexOf('/') + 1);
        options.chunkedMode = false;
        // options.mimeType = "image/jpeg";

        var params = {};
        params.photoDate = self.$u.getTimeWithZone(self.photoDate[0], 8).Format('yyyy-MM-dd');
        params.photoName = photoName;
        params.photoAddress = photoAddress;
        params.photoUserId = self.user_ids[0];

        options.params = params;
        var ft = new FileTransfer();
        ft.onprogress = function (progressEvent) {
          if (progressEvent.lengthComputable) {
            var pecentage = parseInt(progressEvent.loaded / progressEvent.total * 100)
            self.dialog.setProgress(pecentage);
            self.dialog.setText('已上传' + pecentage + '%：' + self.$u.sizeChange(progressEvent
              .loaded) + '/' + self.$u.sizeChange(progressEvent.total));
          }
        };
        ft.upload(photoUri, encodeURI(envConfig.HOST + '/photo_update'), success, fail,
          options);
        // self.dialog = self.$f7.dialog.progress('正在上传第' + index + '/' + self.photoList.length + '张照片', 0)
      },
    }
  };
</script>