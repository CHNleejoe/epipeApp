<template>
  <f7-page class="desktop">
      <f7-navbar title="工作台">
          <a href="#" slot="left"> </a>
          <a href="#" slot="right"> </a>
      </f7-navbar>

  <!-- <f7-navbar title="主页" back-link="后退">
    <f7-nav-right>
      <f7-link icon-ios="f7:circle_grid_hex" icon-aurora="f7:circle_grid_hex" icon-md="f7:circle_grid_hex"></f7-link>
    </f7-nav-right>
  </f7-navbar> -->
    <f7-swiper class="banner">
      <f7-swiper-slide v-for="(item, index) in 3" :key='index' class="banner-item">
        <img src="../../img/banner.png" alt="" class="banner-img">
      </f7-swiper-slide>
    </f7-swiper>
    <div class="work">
      <div class="work-item" v-for="(item, index) in workList" :key='index' @click="turnToNextPage(item)">
        <f7-icon :ios="item.icon" :md="item.icon"></f7-icon>
        <span>{{item.label}}</span>
      </div>
    </div>
    <img id="imageFile" src="" alt="">

  </f7-page>
</template>

<script>
export default {
  data(){
    return{
      workList:[
        {id: 1,label:'公告',herf:'#',icon:'material:home'},
        {id: 2,label:'报事保修',herf:'#',icon:'material:home'},
        {id: 3,label:'抄表',herf:'/meterListTmp/',icon:'material:slow_motion_video'},
        {id: 4,label:'账单',herf:'#',icon:'material:home'},
        {id: 5,label:'租控图',herf:'/rcchart',icon:'f7:chart_bar_square'},
        {id: 6,label:'报表',herf:'#',icon:'material:home'},
      ]
    }
  },
  methods:{
    turnToNextPage(pageItem) {
      const self = this;
      const router = self.$f7router;
      // self.test()
      console.log('router :', router);
      self.$u.navigate(self, pageItem.herf, {
        // ignoreCache: true,
        // clearPreviousHistory: true
      })
    },
    test(){
      const self = this;
      console.log('123123 :', 123123);
      self.openCamera();
    },
    setOptions(srcType) {
      var options = {
          // Some common settings are 20, 50, and 100
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          // In this app, dynamically set the picture source, Camera or photo gallery
          sourceType: srcType,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
          allowEdit: true,
          correctOrientation: true
      }
      return options;
    },
    openCamera(selection) {
        const self = this;
        var srcType = Camera.PictureSourceType.CAMERA;
        var options = self.setOptions(srcType);
        // var func = createNewFileEntry;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            self.displayImage(imageUri);
            alert(imageUri)
            // You may choose to copy the picture, save it somewhere, or upload.
            // func(imageUri);

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");

        }, options);
    },
    displayImage(imgUri) {

      var elem = document.getElementById('imageFile');
      elem.src = imgUri;
    },
    openFilePicker(selection) {

      var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
      var options = self.setOptions(srcType);
      // var func = createNewFileEntry;

      if (selection == "picker-thmb") {
          // To downscale a selected image,
          // Camera.EncodingType (e.g., JPEG) must match the selected image type.
          options.targetHeight = 100;
          options.targetWidth = 100;
      }

      navigator.camera.getPicture(function cameraSuccess(imageUri) {

          // Do something with image

      }, function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");

      }, options);
    },
    getFileEntry(imgUri) {
      window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

          // Do something with the FileEntry object, like write to it, upload it, etc.
          // writeFile(fileEntry, imgUri);
          console.log("got file: " + fileEntry.fullPath);
          // displayFileData(fileEntry.nativeURL, "Native URL");

      }, function () {
        // If don't get the FileEntry (which may happen when testing
        // on some emulators), copy to a new FileEntry.
          // createNewFileEntry(imgUri);
      });
    } 
  },
}
</script>

<style lang="less" scoped>
  .desktop{
    .banner{
      .banner-item{
        background: rgb(227, 204, 154);
        height: 280px;
        .banner-img{
          height: 100%;
          width: 100%;
        }
      }
    }
    .work{
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      width: 80%;
      position: relative;
      left: 50%;
      transform: translateX(-50%);
      .work-item{
        width: 44%;
        box-sizing: border-box;
        height: 80px;
        padding: 0 20px;
        display: flex;
        border-radius: 3px;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin-top: 10px;
        margin: 10px 3px 0 3px;
        background: rgb(250, 250, 250);
        // transition: all 1s;
        &:hover{
          animation: opaKy .2s;
        }
        // float: left;
        @keyframes opaKy {
          0%{
            background: rgba(240,240,240,.9);
            opacity: 0.9;
          }
          20%{
            background: rgba(240,240,240,.6);
            opacity: 0.8;
          }
          70%{
            background: rgba(240,240,240,.8);
            opacity: 0.8;
          }
          100%{
            background: rgba(240,240,240,1);
            opacity: .8;
          }
        }
      }
    }
  }

</style>