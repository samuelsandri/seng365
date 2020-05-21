import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/components/Login";
import SignUp from "@/components/SignUp";
import Home from "@/components/Home";
import Profile from "./components/Profile";
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";
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
    path: '/home',
    component: Home,
    name: 'Home'
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
  let toOpenPage = to.path === '/Signup' || to.path === '/Login' || to.path === '/Home';
  if (!store.getters.isLoggedIn && !toOpenPage) {
    next('/Login');
  } else if (store.getters.isLoggedIn && (to.path === '/Signup' || to.path === '/Login')) {
    next('/Home');
  } else if (to.path === '/') {
    next('/Home');
  } else {
    next();
  }
});

export default router;