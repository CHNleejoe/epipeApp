<template>
    <f7-page name="userSetter">
        <f7-navbar title="账号与安全" back-link=""></f7-navbar>
        <f7-list v-if="loginInfo">
            <f7-list-item link="#" title="用户名" :after='loginInfo.name'>
            </f7-list-item>
            <f7-list-item link="#" title="手机号" :after='loginInfo.phone || phone'>
            </f7-list-item>
            <f7-list-item link="/modifyPassword" title="修改密码">
            </f7-list-item>
            <!-- <f7-list-item title="修改密码">
            </f7-list-item> -->
        </f7-list>
        <f7-list v-if="loginInfo">
            <f7-list-item link="#" title="退出登录" @click="loginOut">
            </f7-list-item>
        </f7-list>
        <f7-list v-else>
            <f7-list-item link="/login" title="登录账号">
            </f7-list-item>
        </f7-list>
    </f7-page>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
    data(){
        return{
            phone: 12312312,
            username: 'admin',
            password: '1'
        }
    },
    computed:{
        ...mapState(['loginInfo']),
        isLogin() {
            if(this.loginInfo) return true
            else return false

            storageProxy.getItem('userInfo').then(_e => {
                if(_e) return true
                else return false
            })
        }
    },
    methods: {
        ...mapActions(['updateLoginInfo']),
        loginOut() {
            const self = this
            const router = self.$f7router;
            this.updateLoginInfo(null)
            storageProxy.remove('userInfo')
            // router.back()

            lingFetch(
            self,
            "pms.user",
            "app_logout",{
            },
            function (result) {
            // success
              const _resData = result.data
              console.log('_result :', _result);
              router.back();
            },
            function (result) {
            // error
            console.log('err :', result);
            }
        );
            // storageProxy.getItem("userLoginInfo").then(function (userLoginInfo) {
            //     if (userLoginInfo && userLoginInfo.avatar) {
            //         self.avatar = userLoginInfo.avatar;
            //     }
            // });

        }
        
    },
    mounted() {
        console.log('123 :', 123);
    }
}
</script>

<style>

</style>
