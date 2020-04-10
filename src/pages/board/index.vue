<template>
    <f7-page :page-content="false" name='board'>
        <f7-navbar title="看板" back-link="">
        </f7-navbar>
        <Tabs
        v-model="active"
        style="margin-top:calc(var(--f7-navbar-height) + var(--f7-safe-area-top));"
        :ellipsis='false'
        color='#66A7FF'
        title-inactive-color='#969799'
        >
            <Tab title="收入统计">
                <incomePage/>
            </Tab>
            <Tab title="本月欠费统计">
                <arrearsPage/>
            </Tab>
            <Tab title="收费统计">
                <tollPage/>
            </Tab>
            <Tab title="空置房源">
                <vacantListingPage/>
            </Tab>
            <Tab title="合同到期预警">
                <contractWarningPage/>
            </Tab>
        </Tabs>
    </f7-page>
</template> 
<script>
import { mapActions } from "vuex";
import { Picker, Popup, Tab, Tabs } from 'vant';
import incomePage from './income.vue';
import arrearsPage from './arrears.vue';
import tollPage from './toll.vue';
import vacantListingPage from './vacantListing.vue';
import contractWarningPage from './contractWarning.vue';

import Vue from "Vue";
export default {
  data() {
    return {
        active:''
    }
  },
  components: {
    Picker,
    Popup,
    Tab,
    Tabs,
    incomePage,
    arrearsPage,
    tollPage,
    vacantListingPage,
    contractWarningPage
  },
  methods:{
    ...mapActions(['updateLoginInfo']),
  },
  watch: {
  
  },
  mounted() {
    const self = this;

  }
}
</script>

<style lang="less" scoped>
    /deep/ .van-tab--complete{
    margin: 0 10px;
    }
</style>