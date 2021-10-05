import config from '../config.js';
import Vue from 'vue';
import Vuex from 'vuex';
import setData from "./setData.js"; 
Vue.use(Vuex);

/**
 * vuex状态
 */
let state = {
  config,
  
}


/**
 * 恢复上次缓存的数据
 */
let storage = uni.getStorageSync('vuex');
if(storage!=""){
  storage = JSON.parse(storage);
  let storageKeys = Object.keys(storage);
  Object.keys(state).map(key=>{
    if(storageKeys.indexOf(key)>-1){
      state[key] = storage[key]
    }
  })
}

export default new Vuex.Store({
  state,
  mutations: {
    setData,
  },
  actions: {}
});