import needStorageKey from "./needStorageKey"
/**
 * 写入数据
 */
export default function setData(state=Object, option = ['key','value'] || {'key':'value'}) {
  if(typeof option == "function"){
    option(state)
  }else if (option.length == 2) { //传入数组 [key,value]
    state[option[0]] = option[1]
  } else if (Object.keys(option).length > 0) { //传入对象 {key:value}
    Object.keys(option).map(key => {
      state[key] = option[key]
    })
  } else {
    console.warn("未知参数", option)
  }
  
  /**
   * 把需要缓存的key写入缓存
   */
  let storage = {};
  Object.keys(state).map(key=>{
    if(needStorageKey.indexOf(key)>-1){
      storage[key] = state[key]
    }
  })
  uni.setStorageSync('vuex',JSON.stringify(storage))
  
  
}