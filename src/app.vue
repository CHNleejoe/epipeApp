<template>
  <f7-app :params="f7params">

    <!-- Views/Tabs container -->
    <f7-view url="/login/" main class="safe-areas"></f7-view>
  </f7-app>
</template>
<script>
  import cordovaApp from './js/cordova-app.js';
  import routes from './js/routes.js';

  export default {
    data() {
      return {
        // Framework7 Parameters
        f7params: {
          id: 'io.framework7.myapp', // App bundle ID
          name: 'cordova_ling', // App name
          theme: 'auto', // Automatic theme detection
          // App root data
          calendar: {
            monthNames: [
              "一月",
              "二月",
              "三月",
              "四月",
              "五月",
              "六月",
              "七月",
              "八月",
              "九月",
              "十月",
              "十一月",
              "十二月"
            ],
            monthNamesShort: [
              "一月",
              "二月",
              "三月",
              "四月",
              "五月",
              "六月",
              "七月",
              "八月",
              "九月",
              "十月",
              "十一月",
              "十二月"
            ],
            dayNames: [
              "星期日",
              "星期一",
              "星期二",
              "星期三",
              "星期四",
              "星期五",
              "星期六"
            ],
            dayNamesShort: ["日", "一", "二", "三", "四", "五", "六"],
            closeOnSelect: true,
            dateFormat: "yyyy-mm-dd"
          },
          picker: {
            rotateEffect: true,
            toolbarCloseText: "确认"
          },
          panel: {
            swipe: "left"
          },
          dialog: {
            buttonOk: "确认",
            buttonCancel: "取消"
          },
          // App routes
          routes: routes,


          // Input settings
          input: {
            scrollIntoViewOnFocus: true,
            scrollIntoViewCentered: true,
            // scrollIntoViewOnFocus: this.$device.cordova && !this.$device.electron,
            // scrollIntoViewCentered: this.$device.cordova && !this.$device.electron,
          },
          // Cordova Statusbar settings
          statusbar: {
            iosOverlaysWebView: true,
            androidOverlaysWebView: true,
          },
        },
      }
    },
    methods: {},
    mounted() {
      this.$f7ready((f7) => {
        // Init cordova APIs (see cordova-app.js)
        if (f7.device.cordova) {
          cordovaApp.init(f7);
        }
        // Call F7 APIs here
      });
    },
    watch: {
      $route(to, from) {
        console.log('123')
      }
    }
  }
</script>