// Import Vue
import Vue from 'vue';

// Import Framework7
import Framework7 from './framework7-custom.js';

// Import Framework7-Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js';

// Import Vuex Storage
import store from '../vuex/storage.js'

// Import Framework7 Styles
import '../css/framework7-custom.less';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.less';
import '../css/icons.scss';

// Import App Component
import App from '../app.vue';
import Loading from '../components/loading.vue'
// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);


import VueLazyLoad from 'vue-lazyload'

// 加载即可
// import Mui from './static/lib/mui.js'
import Init from './init.js'
import EnvConfig from './config.js'
import Net from './net.js'
import Strophe from './strophe.min.js'
import ChatBase from './chat-base.js'
import $u from './util.js'
import $v from './view.js'
import jq from './jquery.js'
window.JQEach = jq.each
Vue.prototype.$u = $u
Vue.prototype.$v = $v

// Vue.use(VueLazyLoad, {
//   error: require('../img/errror.jpg'), //报错需要的图片
//   loading: require('../img/hearts.svg') // 替换需要的图片
// })

Vue.component('ling-loding', Loading)

// Init App
window.$$vm = new Vue({
  el: '#app',
  store,
  render: (h) => h(App),

  // Register App Component
  components: {
    app: App
  },
});