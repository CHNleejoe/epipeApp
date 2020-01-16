<template>
    <f7-page>
        <f7-navbar title="我的">
            <a href="#" slot="left"> </a>
            <a href="#" slot="right"> </a>
        </f7-navbar>
        <!-- <f7-navbar title="主页" back-link="后退">
            
        <f7-nav-right>
            <f7-link icon-ios="f7:circle_grid_hex" icon-aurora="f7:circle_grid_hex" icon-md="f7:circle_grid_hex"></f7-link>
        </f7-nav-right>
        </f7-navbar> -->
        <div class="user-info" @click="turnToLogin">
            <div class="header-img">
                <img v-if="loginInfo" :src="loginInfo.avatar" alt="">
            </div>
            <div class="user-name" >{{loginInfo? loginInfo.name : '登录'}}</div>
            <!-- <div class="user-btn" @click="turnToUserSetter">编辑</div> -->
        </div>
        <f7-list>
            <f7-list-item link="/userSetter" title="账号与安全">
                <f7-icon slot="media" material="verified_user"></f7-icon>
            </f7-list-item>
            <f7-list-item link="#" title="版本升级">
                <f7-icon slot="media" material="play_for_work"></f7-icon>
            </f7-list-item>
            <f7-list-item link="/about/" title="关于物业APP">
                <f7-icon slot="media" material="help"></f7-icon>
            </f7-list-item>
            <f7-list-item title="清除缓存">
                <f7-icon slot="media" material="delete"></f7-icon>
            </f7-list-item>
        </f7-list>
        
    </f7-page>
</template>

<script>
import { mapState } from "vuex";
export default {
    data(){
        return{

        }
    },
    computed:{
        ...mapState(['loginInfo'])
    },
    methods:{
        turnToLogin() {
            const self = this
            const router = self.$f7router;
            if(storageProxy.getItem('userInfo')){
                router.navigate('/userSetter')
            }else router.navigate('/login')
        },
        turnToUserSetter(){
            const self = this
            const router = self.$f7router;
            router.navigate('/userSetter')
        }
    },
    mounted() {
        console.log('sadsasda')
    }
}
</script>

<style lang="less" scoped>
    .user-info{
        height: 180px;
        width: 100%;
        position: relative;
        box-sizing: border-box;
        background: skyblue;
        margin-top: 30px;
        .header-img{
            position: absolute;
            top: 50%;
            left: 20px;
            transform: translateY(-50%);
            height: 80px;
            width: 80px;
            background: gainsboro;
            border-radius: 50%;
            overflow: hidden;
            img{
                height: 100%;
                width: 100%;
            }
        }
        .user-name{
            position: absolute;
            transform: translateY(-50%);
            top: 40%;
            left: 110px;
            font-size: 20px;
            color: white;

        }
        .user-btn{
            position: absolute;
            transform: translateY(-50%);
            top: 40%;
            right: 110px;
            font-size: 20px;
            color: white;
        }
    }
</style>
