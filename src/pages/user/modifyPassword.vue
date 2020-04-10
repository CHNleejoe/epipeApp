<template>
    <f7-page name="modifyPassword" class="modify-password">
        <f7-navbar title="修改密码" back-link=""></f7-navbar>
        <f7-list>
            <f7-block-header name='title'>修改密码后，下次登录可以使用新密码登录</f7-block-header>
            <p></p>
             <f7-list-input
                label="旧密码"
                type="password"
                placeholder="请输入旧密码"
                clear-button
                minlength='6'
                maxlength='16'
                :value="oldPassword"
                @input="oldPassword = $event.target.value"
            ></f7-list-input>
            <f7-list-input
                label="新密码"
                type="password"
                placeholder="请输入新密码"
                clear-button
                minlength='6'
                maxlength='16'
                :value="newPassword"
                @input="newPassword = $event.target.value"
            ></f7-list-input>
            <f7-list-input
                label="确认密码"
                type="password"
                placeholder="请确认密码"
                clear-button
                minlength='6'
                maxlength='16'
                :value="repeatNewPassword"
                @input="repeatNewPassword = $event.target.value"
            ></f7-list-input>
        </f7-list>
        <f7-list inset>
            <f7-list-button title="提交" @click="modifyPassword"></f7-list-button>
        </f7-list>
    </f7-page>
</template>

<script>
import { mapActions } from "vuex";
export default {
    data(){
        return{
            phone: 12312312,
            oldPassword:'',
            newPassword:'',
            repeatNewPassword:'',
        }
    },
    methods:{
        ...mapActions(['updateLoginInfo']),
        modifyPassword() {
            const self = this;
            const router = self.$f7router;

            if(self.newPassword !== self.repeatNewPassword){
                self.$v.showToast("新密码与确认密码不同，请重新输入")
                self.newPassword = ''
                self.repeatNewPassword = ''
                return
            }
            console.log(self.$f7.request.json)
            var success = function(result){
                console.log(result)
            }

            var error = function() {

            }
            var url = envConfig.HOST + '/web/session/change_password'
            var data = {
                    old_password: self.oldPassword,
                    new_password: self.newPassword,
                    confirm_password: self.repeatNewPassword
                };
            lingFetch(
                self,
                "pms.user",
                "change_password",{
                    old_password: self.oldPassword,
                    new_password: self.newPassword,
                    confirm_password: self.repeatNewPassword
                },
                function (result) {
                // success
                    self.updateLoginInfo(null)
                    storageProxy.remove('userInfo')
                    self.$v.showToast(self,'密码修改成功，请重新登录')
                    router.back();
                },
                function (result) {
                // error
                    self.$v.showToast(self,result.msg)
                },
                {
                    // dataType: 'json',
                    // GATEWAY: '/web/session/change_password'
                }
            )
        },
    }
}
</script>

<style lang="less" scoped>
.modify-password{
    /deep/.list-button{
        text-align: center;
        background: rgb(141, 179, 146);
        color: white;
    }
}
</style>
