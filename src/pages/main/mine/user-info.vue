<template>
    <f7-page name='userInfo' @page:init="onPageInit">
        <f7-navbar title="个人信息" back-link="返回"></f7-navbar>
        <f7-list>
            <f7-list-item title="头像" link="#" v-if="userLoginInfo.image_medium">
                <img slot="after" :src="userLoginInfo.image_medium" width="64" height="64" />
            </f7-list-item>
            <f7-list-item title="姓名" v-if="userLoginInfo.userName" :after="userLoginInfo.userName"></f7-list-item>
            <f7-list-item title="账号" v-if="userLoginInfo.login" :after="userLoginInfo.login"></f7-list-item>
            <f7-list-item title="另一半" v-if="userLoginInfo.partner_user_name" :after="userLoginInfo.partner_user_name">
            </f7-list-item>
        </f7-list>

        <f7-list media-list>
            <f7-list-item title="性别" v-if="userLoginInfo.sex" :after="userLoginInfo.sex"></f7-list-item>
            <f7-list-item title="生日" v-if="userLoginInfo.birth" :after="userLoginInfo.birth"></f7-list-item>
            <f7-list-item link="#" title="个性签名" v-if="userLoginInfo.signature" :subtitle="userLoginInfo.signature"
                @click="changeHeader"></f7-list-item>
        </f7-list>
    </f7-page>
</template>
<script>
    export default {
        data() {
            // var loginInfo = storage.getItem("loginInfo");
            return {
                userLoginInfo: {},
            };
        },
        methods: {
            onPageInit() {
                const self = this;
                storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
                    if (userLoginInfo.login == "MrsLing") {
                        userLoginInfo.header = "我爱凌嘉文，一辈子都不变！"
                    } else if (userLoginInfo.login == "MrLing") {
                        userLoginInfo.header = "我爱李艳，一辈子都不变！"
                    } else {
                        userLoginInfo.header = "没有个性！"
                    }
                    self.userLoginInfo = userLoginInfo
                });
            },
            changeHeader() {
                const self = this;
                self.$v.showToast(self, '想改？没门！')
            }
        },
    };
</script>