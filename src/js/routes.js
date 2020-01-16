import HomePage from '../pages/home.vue';
import AboutPage from '../pages/about.vue';
import FormPage from '../pages/form.vue';

import LeftPage1 from '../pages/left-page-1.vue';
import LeftPage2 from '../pages/left-page-2.vue';
import DynamicRoutePage from '../pages/dynamic-route.vue';
import RequestAndLoad from '../pages/request-and-load.vue';
import NotFoundPage from '../pages/404.vue';

import MainMenu from '../pages/home/menu.vue';
import home from '../pages/home/home.vue';
import desktop from '../pages/home/desktop.vue';
import mine from '../pages/home/mine.vue';
// notice
import noticeDetailPage from '../pages/notice/detail.vue';

// user
import userSetterPage from '../pages/user/userSetter.vue';
import modifyPasswordPage from '../pages/user/modifyPassword.vue';
import loginPage from '../pages/user/login.vue';

//checkmeter
import checkMeterListPage from '../pages/checkmeter/list.vue';
import checkMeterListDetailPage from '../pages/checkmeter/detailPage.vue';
import _checkMeterListPage from '../pages/checkmeter/list_tmp.vue';
import _unreadcheckMeterListPage from '../pages/checkmeter/unread.vue';
import _unconfcheckMeterListPage from '../pages/checkmeter/unconfirmed.vue';
import _submcheckMeterListPage from '../pages/checkmeter/submitted.vue';
// rcchart
import rcchartPage from '../pages/rcchart/index.vue';


var routes = [{
        path: '/menu/',
        component: MainMenu,
        options: {
            history: true,
            pushState: false
        },
        tabs: [{
            path: '/',
            id: 'home',
            component: home
        }, {
            path: '/desktop/',
            id: 'desktop',
            component: desktop
        }, {
            path: '/mine/',
            id: 'mine',
            component: mine
        }],
    },


    {
        path: '/meterListTmp/',
        component: _checkMeterListPage,
        options: {
            history: true,
            pushState: false
        },
        tabs: [{
            path: '/',
            id: 'unread',
            component: _unreadcheckMeterListPage
        }, {
            path: '/submitted/',
            id: 'submitted',
            component: _submcheckMeterListPage
        }, {
            path: '/unconfirmed/',
            id: 'unconfirmed',
            component: _unconfcheckMeterListPage
        }],
    },

    {
        path: '/home',
        component: home,
    },
    {
        path: '/test/',
        component: HomePage,
    },
    {
        path: '/about/',
        component: AboutPage,
    },
    {
        path: '/form/',
        component: FormPage,
    },

    {
        path: '/left-page-1/',
        component: LeftPage1,
    },
    {
        path: '/left-page-2/',
        component: LeftPage2,
    },
    // 公告模块 notice
    {
        path: '/noticeDetail',
        component: noticeDetailPage,
    },
    // 用户信息模块 user
    {
        path: '/userSetter',
        component: userSetterPage,
    },
    {
        path: '/modifyPassword',
        component: modifyPasswordPage,
    },
    {
        path: '/login',
        component: loginPage,
    },
    // 抄表模块 checkmeter
    {
        path: '/checkMeterList',
        component: checkMeterListPage,
    },
    {
        path: '/checkMeterListDetail',
        component: checkMeterListDetailPage,
    },
    // 租控图 rcchart   
    {
        path: '/rcchart',
        component: rcchartPage,
    },

    //////////////////////////////////////
    {
        path: '/dynamic-route/blog/:blogId/post/:postId/',
        component: DynamicRoutePage,
    },
    {
        path: '/request-and-load/user/:userId/',
        async: function(routeTo, routeFrom, resolve, reject) {
            // Router instance
            var router = this;

            // App instance
            var app = router.app;

            // Show Preloader
            app.preloader.show();

            // User ID from request
            var userId = routeTo.params.userId;

            // Simulate Ajax Request
            setTimeout(function() {
                // We got user data from request
                var user = {
                    firstName: 'Vladimir',
                    lastName: 'Kharlampidi',
                    about: 'Hello, i am creator of Framework7! Hope you like it!',
                    links: [{
                            title: 'Framework7 Website',
                            url: 'http://framework7.io',
                        },
                        {
                            title: 'Framework7 Forum',
                            url: 'http://forum.framework7.io',
                        },
                    ]
                };
                // Hide Preloader
                app.preloader.hide();

                // Resolve route to load page
                resolve({
                    component: RequestAndLoad,
                }, {
                    context: {
                        user: user,
                    }
                });
            }, 1000);
        },
    },
    {
        path: '(.*)',
        component: NotFoundPage,
    },
];

export default routes;