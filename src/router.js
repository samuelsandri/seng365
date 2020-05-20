import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/components/Login";
import SignUp from "@/components/SignUp";
import Home from "@/components/Home";

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/signup',
    component: SignUp
  },
  {
    path: '/home',
    component: Home
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