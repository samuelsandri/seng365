import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/components/Login";
import SignUp from "@/components/SignUp";
import Profile from "./components/Profile";
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";
import {apiUser} from "./api";
import store from './store/index.js';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    component: Login,
    name: 'Login'
  },
  {
    path: '/signup',
    component: SignUp,
    name: 'Sign Up'
  },
  {
    path: '/profile',
    component: Profile,
    name: 'Profile'
  },
  {
    path: '/petitions',
    component: Petitions,
    name: 'Petitions'
  },
  {
    path: '/petitions/:petitionId',
    component: Petition,
    name: 'Petition'
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

router.beforeEach((to, from, next) => {
  let toOpenPage = to.path === '/Signup' || to.path === '/Login' || to.path === '/signup' || to.path === '/login';
  let toAnyUserPage = to.path === '/Petitions' || to.path === '/petitions' || to.name === 'Petition';
  let reload = from.path === '/' && !toOpenPage;
  if ((localStorage.getItem('sessionId') === null || localStorage.getItem('sessionId') === 'null') &&
      !toOpenPage && !toAnyUserPage) {
    next('/Login');
  } else if (localStorage.getItem('sessionId') !== null && localStorage.getItem('sessionId') !== 'null' && toOpenPage) {
    reloadUser();
    next('/Profile');
  } else if (reload && localStorage.getItem('sessionId') !== null && localStorage.getItem('sessionId') !== 'null') {
    reloadUser();
    next();
  } else if (to.path === '/') {
    next('/Login');
  } else {
    next();
  }
});

function reloadUser() {
  let userId = localStorage.getItem('userId');
  store._actions.setUserId[0]({userId: parseInt(userId)});
  store._actions.userLogin[0]();
  getLoggedInUser();
  apiUser.refreshInstance();
}

function getLoggedInUser() {
  apiUser.getUser(localStorage.getItem("userId"))
      .then(response => {
        store._actions.createUser[0](response.data);
      });
}

export default router;