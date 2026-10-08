import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'
import VIcon from './static/components/v-icon/index.vue'

Vue.component('v-icon', VIcon)

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
