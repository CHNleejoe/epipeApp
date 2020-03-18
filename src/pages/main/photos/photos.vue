<template>
  <f7-page name="photos" style="background: white;" @page:afterin="onAfterIn" @page:beforeout="onBeforeOut">
    <f7-navbar title="回忆" back-link="返回">
      <f7-nav-right>
        <f7-link href="/photos-add/">
          <f7-icon ios="f7:plus" aurora="f7:plus" md="f7:plus"></f7-icon>
        </f7-link>
      </f7-nav-right>
    </f7-navbar>
    <ling-loding v-if="isLoading" loadingText="照片信息正在加载..." />
    <template v-if="!isLoading">
      <template v-for="(line, index) in photoList">
        <f7-block-title :key="index">{{line[0]}}</f7-block-title>
        <f7-block style="padding: 0;">
          <f7-row class="gap_with_2 margin-bottom-2" v-for="(value, vi) in line[1]" :key="vi">
            <f7-col class="img-data-grid" v-for="item in value" :key="item.id">
              <div class="image_preview_bg" width="100%" v-if="item.id">
                <img :data-index="item.index" class="image_preview" :data-id="item.id" :src='defaultImg' />
              </div>
            </f7-col>
          </f7-row>
        </f7-block>
      </template>
    </template>
  </f7-page>
</template>
<script>
  export default {
    data: function () {
      return {
        isLoading: true,
        photoList: [],
        photoListBig: [],
        photoBrowserObject: null,
        host: envConfig.HOST,
        defaultImg: require('../../../img/hearts.svg'),
      };
    },
    watch: {
      photoList: function () {
        const self = this;
        const $ = self.$f7.$;
        self.$nextTick(function () {
          /*现在数据已经渲染完毕*/
          $('.img-data-grid').forEach(element => {
            element.style.height = $('.img-data-grid')[0].clientWidth + 'px'
          });
          self.photoBrowser();
        })
      },
    },
    methods: {
      download(fileEntry, uri, readBinaryData, successCb, errorCb) {

        var fileTransfer = new FileTransfer();
        var fileURL = fileEntry.toURL();

        fileTransfer.download(
          uri,
          fileURL,
          function (entry) {
            successCb(entry);
          },
          function (error) {
            // 错误直接用原来的
            errorCb(error)
            // alert("download error target " + error.target);
            // alert("upload error code" + error.code);
          },
          null, // or, pass false
          {
            //headers: {
            //    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            //}
          }
        );
      },
      downloadImageUrl(url, filename, successCb, errorCb) {
        const self = this;
        var onErrorCreateFile = function () {}
        var onErrorLoadFs = function () {}
        // var filename = "photo_" + elemId + '.jpeg'
        //下载图片
        window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
          // 获取文件
          fs.root.getFile(filename, {
            create: false,
            exclusive: false
          }, function (fileEntry) {
            console.log('文件已存在')
            successCb(fileEntry);
          }, function () {
            // 文件不存在
            console.log('文件不存在，创建')
            fs.root.getFile(filename, {
              create: true,
              exclusive: false
            }, function (fileEntry) {
              self.download(fileEntry, url, false, successCb, errorCb);
            }, onErrorCreateFile);
          }, onErrorLoadFs)
        })
      },
      onAfterIn: function () {
        const self = this;
        const $ = self.$f7.$;
        self.getPhotosUrl();
      },
      onBeforeOut: function () {
        const self = this;
        console.log('onBeforeOut')
      },
      photoBrowser: function () {
        const self = this;
        const app = self.$f7;
        const $$ = self.Dom7;
        if (!self.photoBrowserObject) {
          self.photoBrowserObject = app.photoBrowser.create({
            photos: self.photoListBig,
            popupCloseLinkText: '关闭',
            type: 'standalone',
            navbarOfText: '/',
            on: {
              lazyImageReady: function (slideEl, imageEl) {
                console.log('lazyImageReady');
                // console.log($$(slideEl).data('swiper-slide-index'));
                var url = $$(imageEl).attr('src')
                // console.log($$('img[data-index="' + $$(slideEl).data('swiper-slide-index') + '"]'))
                var photoId = $$('img[data-index="' + $$(slideEl).data('swiper-slide-index') + '"]').data('id');
                self.downloadImageUrl(url, md5("photo_" + photoId + '_big') + '.jpeg', function () {
                  console.log('大图' + photoId + '下载成功')
                }, function () {
                  console.log('大图' + photoId + '下载失败')
                });
              },
            }
          });
        }
        $$('.image_preview').off('click');
        $$('.image_preview').on('click', function () {
          self.photoBrowserObject.params.photos = self.photoListBig
          self.photoBrowserObject.activeIndex = parseInt(this.getAttribute('data-index'));
          self.photoBrowserObject.open();
        });
      },
      getPhotosUrl: function () {
        const self = this;
        const $$ = self.Dom7;
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
          lingFetch(
            self,
            "common.user",
            "get_photos_url",
            function (result) {
              self.isLoading = false
              self.photoList = result.data.app_photo_list
              result.data.app_photo_list_big.forEach((element, index) => {
                var uri = envConfig.HOST + "/web/image?model=app.photo.management&id=" + element.id +
                  "&field=image_small"
                self.downloadImageUrl(uri, md5("photo_" + element.id) + '.jpeg', function (
                  fileEntry) {
                  var imgId = $$('img[data-id="' + element.id + '"]')
                  imgId.attr('src', fileEntry.toURL());
                  imgId.css('width', '100%');
                }, function (error) {
                  var imgId = $$('img[data-id="' + element.id + '"]')
                  imgId.attr('src', uri);
                  imgId.css('width', '100%');
                  console.log("download error source " + error.source);
                })
              });
              result.data.app_photo_list_big.forEach((item, index) => {
                var onErrorCreateFile = function () {}
                var onErrorLoadFs = function () {}
                var filename = md5("photo_" + item.id + '_big') + '.jpeg'
                //下载图片
                window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
                  // 获取文件
                  fs.root.getFile(filename, {
                    create: false,
                    exclusive: false
                  }, function (fileEntry) {
                    console.log('大图文件已存在')
                    self.photoListBig[index] = {
                      'url': fileEntry.toURL(),
                      'caption': item.name,
                    }
                  }, function () {
                    // 文件不存在
                    console.log('大图文件不存在')
                    self.photoListBig[index] = {
                      'url': envConfig.HOST + "/web/image?model=app.photo.management&id=" +
                        item
                        .id +
                        "&field=image",
                      'caption': item.name,
                    };
                  }, onErrorLoadFs)
                })
              })
              // self.photoListBig = result.data.app_photo_list_big.map((item, index) => {
              //   return {
              //     'url': envConfig.HOST + "/web/image?model=app.photo.management&id=" + item.id +
              //       "&field=image",
              //     'caption': item.name,
              //   };
              // })
            }, {
              'user_ids': user_ids,
            },
            function (result) {
              self.isLoading = false
              self.$v.showToast(self, result.msg)
            }, {
              hideLoading: true,
            }
          )
        })
      }
    }
  };
</script>