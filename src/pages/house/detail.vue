<template>
<f7-page
    name="meterList"
    class="meter-detail"
>
    <f7-navbar title="房间详情" back-link=""></f7-navbar>
    <f7-list class="list-content">
        <f7-list-item title="房间名称">{{detailInfo.name}}</f7-list-item>
        <f7-list-item v-if="detailInfo.is_rent" title="租户"><span class="color-orange">{{detailInfo.customer_id}}</span></f7-list-item>
        <f7-list-item title="房间编号">{{detailInfo.code}}</f7-list-item>
        <f7-list-item title="所在区域">{{detailInfo.area_name}}</f7-list-item>
        <f7-list-item title="所在楼宇">{{detailInfo.building_name}}</f7-list-item>
        <f7-list-item title="所在楼层">{{detailInfo.floor}}</f7-list-item>
        <f7-list-item title="房间类型">{{parseDictionaryData('room','room_type',detailInfo.room_type)}}</f7-list-item>
        <!-- <f7-list-item v-if="false" title="房间状态"><span class="color-orange">{{parseDictionaryData('room','room_state',detailInfo.room_state)}}</span></f7-list-item> -->
        <f7-list-item title="房间状态">{{parseDictionaryData('room','room_state',detailInfo.room_state)}}</f7-list-item>
        <f7-list-item title="能否出租"><span class="color-orange">{{detailInfo.is_rent?'否':'能'}}</span></f7-list-item>
        <f7-list-item title="建筑面积">{{detailInfo.construction_area}}</f7-list-item>
        <f7-list-item title="使用面积">{{detailInfo.used_area}}</f7-list-item>
        <f7-list-item v-if="detailInfo.is_rent" title="合同"><span class="color-orange">{{detailInfo.contract}}</span></f7-list-item>
    </f7-list>
    <!-- <f7-list v-if="detailInfo.state != 'paid'">
        <f7-list-button class="meter-btn" title="缴费" color="green" @click="toPayTheBill"></f7-list-button>
        <f7-list-button class="meter-btn" title="返回" color="orange" @click="back"></f7-list-button>
    </f7-list> -->

</f7-page>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
    data() {
        return {
            meterReading: '',
            readingDate: new Date(),
            detailInfo: {},
            imageUri: '',
        }
    },
    computed: {
        ...mapState(['loginInfo', 'dictionaryData']),
    },
    methods:{
        parseDictionaryData(typeOut, type, name) {
            const self = this
            console.warn(self.dictionaryData, type, name)
            return self.dictionaryData[typeOut][type][name]
        },
        requestDetail(){
            const self = this;
            const router = self.$f7route
            console.log('router :',router);
            lingFetch(
                self,
                "pms.rent_control",
                "room_info",{
                    room_id: router.query.houseId
                },
                function (result) {
                    // success
                    const _resData = result.data
                    console.log('_result :', _resData);
                    self.detailInfo = _resData

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
        toPayTheBill() {
            const self = this;
            const router = self.$f7router
            const route = self.$f7route
            self.$v.showToast(self,'跳转到微信（功能暂时未做完）')
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