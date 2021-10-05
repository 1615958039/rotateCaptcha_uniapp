import Vue from 'vue'
import App from './App'
import store from "./store"
Vue.prototype.$store = store;

Vue.config.productionTip = false;
import uView from "./components/uview-ui/index";
Vue.use(uView);
App.mpType = 'app'

import uigo from "./libs/uigo.js";
Vue.prototype.uigo = uigo;

import ajax from './libs/ajax';
Vue.prototype.ajax = ajax;

import config from "./config";
Vue.prototype.config = config;

Vue.prototype.twSuccess = (msg=String,duration=2000,mask=false) => {
  return uni.showToast({
    title: msg,
    icon: "success",
    duration,
    position: "bottom",
    mask
  });
}

uni.px2upx = (px) => Math.ceil((750 / uni.upx2px(750)) * px);

Vue.prototype.$uni = uni; //把uni挂载到vue

Vue.prototype.tw = (title,duration=2000,icon="none") => uni.showToast({title,duration,icon});


const app = new Vue({
  ...App,
  store
})
app.$mount()