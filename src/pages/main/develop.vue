<template>
  <f7-page name="develop-edit">
    <f7-navbar title="开发工具" back-link="返回"></f7-navbar>
    <f7-list inline-labels no-hairlines-md>
        <f7-list-input
            type="text"
            placeholder="envConfig.HOST"
            :value="host"
            clear-button
            @input="host = $event.target.value"
        ></f7-list-input>
    </f7-list>
    <f7-block>
      <f7-button round fill @click="setHost()">确认</f7-button>
    </f7-block>
  </f7-page>
</template>

<script>
  export default {
    data: function () {
      return {
          host: ''
      }
    },
    methods: {
        setHost: function () {
            var self = this;
            window.envConfig.HOST = self.host
            window.envConfig.GATEWAY = self.host + '/api/gateway'
            self.$v.showToast(self, '设置成功!HOST为' + window.envConfig.HOST + ";GATEWAY现在为" + 
            window.envConfig.GATEWAY);
        },
    }
  };
</script>
  
