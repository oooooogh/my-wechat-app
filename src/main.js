import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import VIcon from './static/components/v-icon/index.vue'
import { installRequestInterceptor } from './utils/request'

Vue.component('v-icon', VIcon)

installRequestInterceptor()

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
