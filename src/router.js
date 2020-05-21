import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/components/Login";
import SignUp from "@/components/SignUp";
import Home from "@/components/Home";
import Profile from "./components/Profile";
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";

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
    path: '/petitions/:id',
    component: Petition,
    name: 'Petition'
  }
];


const router = new VueRouter({
  routes,
  mode: 'history'
});

router.beforeEach((to, from, next) => {
  if (localStorage.getItem('sessionId') === null && (to.path !== '/signup' || to.path !== '/login')) {
    next('/login');
  } else if (localStorage.getItem('sessionId') !== null && (to.path === '/signup' || to.path === '/login')) {
    next('/home');
  } else if (to.path === '/') {
    next('/home');
  } else {
    next();
  }
});

export default router;