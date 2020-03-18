import MainMenu from '../pages/main/menu.vue'
import HomePage from '../pages/main/home.vue';
import Develop from '../pages/main/develop.vue';
import Photos from '../pages/main/photos/photos.vue';
import PhotosAdd from '../pages/main/photos/photos-add.vue';
import InteractPage from '../pages/main/interact/interact.vue';
import InteractAdd from '../pages/main/interact/interact-add.vue';
import DesktopPage from '../pages/main/desktop.vue';
import EventManagement from '../pages/event-management/event-management.vue';
import EventEdit from '../pages/event-management/event-edit.vue';
import EventAdd from '../pages/event-management/event-add.vue';
import MinePage from '../pages/main/mine/mine.vue';
import Message from '../pages/main/message.vue';
import UserInfo from '../pages/main/mine/user-info.vue';
import TogetherDay from '../pages/main/mine/together-day.vue';
import Setting from '../pages/main/mine/setting.vue';
import SettingBackground from '../pages/main/mine/setting-background.vue';
import Login from '../pages/login.vue';
import NotFoundPage from '../pages/404.vue';

var routes = [{
    path: '/login',
    component: Login,
    options: {
      history: false,
      pushState: false,
    }
  },
  {
    path: '/menu/',
    component: MainMenu,
    options: {
      history: true,
      pushState: true
    },
    tabs: [{
      path: '/',
      id: 'home',
      component: HomePage
    }, {
      path: '/interact/',
      id: 'interact',
      component: InteractPage
    }, {
      path: '/desktop/',
      id: 'desktop',
      component: DesktopPage
    }, {
      path: '/mine/',
      id: 'mine',
      component: MinePage
    }],
  },
  {
    path: '/message/',
    id: 'message',
    component: Message
  },
  {
    path: '/user-info/',
    component: UserInfo
  },
  {
    path: '/together-day/',
    component: TogetherDay
  },
  {
    path: '/mine/setting/',
    component: Setting
  },
  {
    path: '/setting/background/',
    component: SettingBackground,
  },
  {
    path: '/event-management/',
    component: EventManagement,
    options: {
      history: true,
      pushState: true,
    }
  },
  {
    path: '/event-edit/:index',
    component: EventEdit,
    options: {
      history: true,
      pushState: true,
    }
  },
  {
    path: '/interact-add/',
    component: InteractAdd,
    options: {
      history: true,
      pushState: true,
    }
  },
  {
    path: '/event-add/',
    component: EventAdd,
    options: {
      history: true,
      pushState: true,
    }
  },
  {
    path: '/develop/',
    component: Develop,
  },
  {
    path: '/photos-management/',
    component: Photos,
  },
  {
    path: '/photos-add/',
    component: PhotosAdd,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;