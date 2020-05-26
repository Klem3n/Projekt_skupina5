import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import LiveCam from './components/LiveCam.vue'
import Home from './components/Home.vue'

Vue.config.productionTip = false

Vue.use(VueRouter)

const routes = [{
  path: '/',
  component: Home
}, {
  path: '/livecam',
  component: LiveCam
}]

const router = new VueRouter({
  // routes: routes
  mode: 'history',
  routes // ES6 Shortcut
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
