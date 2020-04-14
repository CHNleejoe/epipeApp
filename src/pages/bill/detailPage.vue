<template>
<f7-page
    name="meterList"
    class="meter-detail"
>
    <f7-navbar title="账单详情" back-link=""></f7-navbar>
    <f7-list class="list-content">
        <f7-list-item title="租户">{{detailInfo.customer_name}}</f7-list-item>
        <f7-list-item title="费用月份">{{detailInfo.cost_date}}</f7-list-item>
        <f7-list-item title="租赁房产信息">{{detailInfo.contracts}}</f7-list-item>
        <f7-list-item title="收费项目">{{parseDictionaryData('bill','bill_type',detailInfo.type)}}</f7-list-item>
        <f7-list-item title="账单状态"><span class="color-orange">{{parseDictionaryData('bill','bill_state',detailInfo.state)}}</span></f7-list-item>
        <f7-list-item title="账单起始日期">{{detailInfo.start_date}}</f7-list-item>
        <f7-list-item title="账单截止日期">{{detailInfo.end_date}}</f7-list-item>
        <f7-list-item title="应付金额">{{detailInfo.total_amount}}</f7-list-item>
        <f7-list-item title="税金">{{detailInfo.taxed_amount}}</f7-list-item>
        <f7-list-item title="已缴费金额">{{detailInfo.paid_amount}}</f7-list-item>
        <f7-list-item title="剩余未缴费金额"><span class="color-orange">{{detailInfo.unpaid_amount}}</span></f7-list-item>
    </f7-list>
    <f7-list v-if="detailInfo.state != 'paid'">
        <f7-list-button v-if="payAccess" class="meter-btn" title="缴费" color="green" @click="toPayTheBill"></f7-list-button>
        <f7-list-button class="meter-btn" title="返回" color="orange" @click="back"></f7-list-button>
    </f7-list>
    <f7-photo-browser
        :photos="QRcode"
        type="popup"
        ref="popup"
    ></f7-photo-browser>
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
            payAccess: false,
            QRcode: []
        }
    },
    computed:{
        ...mapState(['dictionaryData'])
    },
    methods:{
        parseDictionaryData(typeOut, type, name) {
            const self = this
            return self.dictionaryData[typeOut][type][name]
        },
        requestDetail(){
            const self = this;
            const router = self.$f7route
            console.log('router :',router);
            lingFetch(
                self,
                "pms.bill",
                "bill_info",{
                    id: router.query.billId
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
        toPayTheBill() {
            const self = this;
            // const router = self.$f7router
            // const route = self.$f7route
            var fileTransfer = new FileTransfer();

            fileTransfer.download(envConfig.HOST + '/web/image?model=hh.pms.account.bill.payment.qrcode&id=4&field=qrcode_medium', cordova.file.cacheDirectory+'4610b912c.jpeg', function (entry){
                alert(JSON.stringify(entry))
                console.log(entry)
                self.QRcode = [entry.nativeURL]
                self.$refs.popup.open()
            })
            return
            lingFetch(
                self,
                "pms.bill",
                "bill_info",{
                    id: router.query.billId
                },
                function (result) {
                    // success
                    const _resData = result.data
                    self.$v.showToast(self,'请保存二维码，进入微信进行支付，并好做好相关备注')

                    self.QRcode = [envConfig.HOST + _resData.QRcode]

                },
                function (result) {
                    // error
                    self.$v.showToast(self,result.msg)

                }
            );
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
        self.dictionaryData?self.payAccess = self.dictionaryData.menus.payment.items.pay:''
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