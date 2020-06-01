import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import LiveCam from './components/LiveCam.vue'
import Home from './components/Home.vue'
import * as VueGoogleMaps from "vue2-google-maps"
import GoogleMap from './components/GoogleMap.vue'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyDoJ2D6FSbod7hzBYywCaFBuOKjnBdesec",
    libraries: "places"
  }
})

const routes = [{
  path: '/',
  component: Home
}, {
  path: '/livecam',
  component: LiveCam
}, {
  path: '/maps',
  component: GoogleMap
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
