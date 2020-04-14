<template>
<f7-page
    name="meterList"
    class="meter-detail"
>
    <f7-navbar title="任务详情" back-link=""></f7-navbar>
    <f7-list class="list-content">
        <f7-list-item title="租户">{{detailInfo.customer_name}}</f7-list-item>
        <f7-list-item title="房间">{{detailInfo.room_name}}</f7-list-item>
        <f7-list-item title="仪表名称">{{detailInfo.instrument_name}}</f7-list-item>
        <f7-list-item title="仪表类型">{{detailInfo.instrument_type_id}}</f7-list-item>
        <f7-list-item title="上次抄表日期">{{detailInfo.last_reading_date}}</f7-list-item>
        <f7-list-item title="上期读数">{{detailInfo.last_reading}}</f7-list-item>
        <f7-list-input
            label="本期读数"
            type="number"
            placeholder="请填入读数"
            clear-button
            v-if="detailInfo.state == '待抄表'"
            :value="meterReading"
            @input="meterReading = $event.target.value"
        >
        </f7-list-input>
        <f7-list-item v-else title="本期读数">{{detailInfo.new_reading}}</f7-list-item>

         <f7-list-input
            label="抄表日期"
            type="date"
            :defaultValue="String(readingDate)"
            placeholder="请选择"
            v-if="detailInfo.state == '待抄表'"
            :value="readingDate"
            @input="readingDate = $event.target.value"
        >
        </f7-list-input>
        <f7-list-item v-else title="抄表日期">{{detailInfo.reading_date}}</f7-list-item>

        <f7-list-item
            title="拍照"
            subtitle="拍照"
            text="Text"
            >
            <div class="img-inner" >
                <div  v-if="imageUri == ''" @click="openCameraToPhoto">
                    <f7-icon style="font-size:40px;" f7="camera"></f7-icon>
                </div>
                <img @click="$refs.photoPopup.open()" v-else id="imageFile" :src="imageUri" alt="">
                <f7-photo-browser
                    :photos="[imageUri]"
                    type="popup"
                    ref="photoPopup"
                    popup-close-link-text='关闭'
                ></f7-photo-browser>
            </div>
        </f7-list-item>
        
    </f7-list>
    <f7-list v-if="detailInfo.state == '待抄表'">
        <f7-list-button v-if="submitAccess" class="meter-btn" title="保存" color="green" @click="saveReading"></f7-list-button>
        <f7-list-button class="meter-btn" title="返回" color="orange" @click="back"></f7-list-button>
    </f7-list>

</f7-page>
</template>

<script>
import { mapState } from "vuex";

export default {
    data() {
        return {
            meterReading: '',
            readingDate: new Date(),
            detailInfo: {},
            imageUri: '',
            submitAccess: false
        }
    },
    computed:{
        ...mapState(['dictionaryData'])
    },
    methods:{
        requestDetail(){
            const self = this;
            const router = self.$f7route
            console.log('router :',router);
            lingFetch(
                self,
                "pms.reading_task",
                "task_info",{
                    id: router.query.meterTaskId
                },
                function (result) {
                    // success
                    const _resData = result.data
                    console.log('_result :', _resData);
                    self.detailInfo = _resData
                    if(_resData.image) self.imageUri = `data:image/png;base64,`+_resData.image

                },
                function (result) {
                    // error
                    self.$v.showToast(self,result.msg)

                }
            );
        },
        saveReading() {
            const self = this;
            const router = self.$f7router
            const route = self.$f7route
            if(self.meterReading == '' || Number(self.meterReading) <= Number(self.detailInfo.last_reading)) {
                self.$v.showToast(self,'请正确填入本期读数')
                return
            } else if(self.readingDate == '') {
                self.$v.showToast(self,'请选择抄表日期')
                return
            } else if(self.imgUri == '') {
                self.$v.showToast(self,'请上传抄表照片')
                return
            }
            // 上传图片
            self.uploadImage()
    
        },
        uploadImage: function() {
            const self = this;
            const route  = self.$f7route
            const router = self.$f7router
            self.$v.showLoading(self,'正在上传图片。。。')
            var success = function (r) {
                console.log("图片上传成功");
                self.$v.hideLoading(self)
                lingFetch(
                self,
                "pms.reading_task",
                "task_submit",{
                    id: route.query.meterTaskId,
                    state: 'unconfirmed',
                    reading: self.meterReading
                },
                function (result) {
                    // success
                    console.log('_result :', _resData);
                    const _resData = result.data
                    self.$v.showToast(self,'上传读数成功')
                    self.$u.back(self);
                },
                function (result) {
                    // error
                    self.$v.showToast(self,result.msg)

                }
            );
            }
        
            var fail = function (error) {
                // alert(JSON.stringify(error));
                self.$v.showToast(self,'图片上传失败，请稍后重试')
                self.$v.hideLoading(self)
            }
        
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = self.imageUri.substr(self.imageUri.lastIndexOf('/') + 1);
            options.chunkedMode = false;
            // options.mimeType = "text/plain";
            var params = {
                task_id: route.query.meterTaskId
            };
        
            options.params = params;
        
            var ft = new FileTransfer();
            ft.upload(self.imageUri, encodeURI(envConfig.HOST + '/pms/readingTask/photo_upload'), success, fail, options);
        },

        openCameraToPhoto(){
            const self = this;
            if(self.imageUri != '') return
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
        getFileEntry: function(imgUri) {
            window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

                // Do something with the FileEntry object, like write to it, upload it, etc.
                // writeFile(fileEntry, imgUri);
                console.log("got file: " + fileEntry.fullPath);
                // displayFileData(fileEntry.nativeURL, "Native URL");

            }, function () {
            // If don't get the FileEntry (which may happen when testing
            // on some emulators), copy to a new FileEntry.
                createNewFileEntry(imgUri);
            });
        },
        createNewFileEntry: function(imgUri) {
            window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

                // JPEG file
                dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

                    // Do something with it, like write to it, upload it, etc.
                    // writeFile(fileEntry, imgUri);
                    console.log("got file: " + fileEntry.fullPath);
                    // displayFileData(fileEntry.fullPath, "File copied to");

                }, onErrorCreateFile);

            }, onErrorResolveUrl);
        },
        openCamera() {
            const self = this;
            console.warn(12131231231)
            var srcType = Camera.PictureSourceType.CAMERA;
            var options = self.setOptions(srcType);
            // var func = createNewFileEntry;

            navigator.camera.getPicture(function cameraSuccess(imageUri) {
                self.imageUri = imageUri
                self.displayImage(imageUri);

            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");

            }, options);
        },
        displayImage(imgUri) {
            const self = this;
            var elem = document.getElementById('imageFile');
            self.imgUri = imgUri;
            // elem.src = imgUri;
        },
        back() {
            const self = this;
            const router = self.$f7router
            router.back()
        }
    },
    mounted() {
        const self = this;
        self.requestDetail();
        self.dictionaryData?self.submitAccess = self.dictionaryData.menus.reading_task.items.submit:''

    }

}
</script>

<style lang="less" scoped>
    .meter-detail{
        .list-content{
            margin: 0 !important;
        }
        .img-inner{
            flex: 1;
            height: 200px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            box-sizing: border-box;
            padding-left: 20px;
            img{
                height: 100%;
                width: auto;
                // margin-right: 30px;
            }
            i{
                margin-right: 30px;
            }
        }
        .meter-btn /deep/ a{
            text-align: center !important;

        }
    }
</style>