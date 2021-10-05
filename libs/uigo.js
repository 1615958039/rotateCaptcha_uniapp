/**
 * 封装路由跳转
 * obj => {type,path,data}
 *    type:string -> ['xcx','goto','goback','noback']
 *    path:string -> ['./','/newPage/**'] 相对路径或绝对路径 //TODO: 写个算法支持 `../`和`./`混用
 *    data:object -> 跳转附带的get参数(无需传入`?`)
 **/
export default function uigo(
  obj,
  second=0, //定时多少秒后执行
){
  if(obj=="goback" || obj=="back" || obj.type=="goback"){
    setTimeout(()=>{
      uni.navigateBack()
    },second)
    return true;
  }

  if(typeof(obj)!="object")throw "uigo.js => 请传入一个对象 uigo(Object)";
  
  
  
  if(!obj.path){
    throw "uigo.js => obj.path未定义";
  }
  
  if(obj.path.substring(0,2)=="./"){  //平级跳转
    let temp = "";
    let url = getCurrentPages()[0]['route'].split("/");
    url.forEach((item,index) => {
      if(index!=(url.length-1)){
        temp = temp + item + "/"
      }
    })
    obj.path = obj.path.replace(/\.\//g,temp)
  }
  
  if(typeof(obj.data)!="undefined" && typeof(obj.data)!="object")throw "uigo.js => obj.data必须为空或一个对象";
  else if(typeof(obj.data)=="object"){ //解析成url参数
    let temp = ""
    for (const val in obj.data) {
      if (obj.data.hasOwnProperty(val)) {
        let item = obj.data[val];
        if(typeof item=="object")item = JSON.stringify(item);
        
        if(temp=="") temp = "?" + val + "=" + item;
        else temp = temp + "&" + val + "=" + item;
      }
    }
    obj.path = obj.path + temp
  }
  switch (obj.type) {
    case 'goto':
    case 'go':
    case undefined:
      setTimeout(()=>{
        uni.navigateTo({
          url: obj.path
        })
      },second)
      break;
    case 'goback':
    case 'back':
      setTimeout(()=>{
        uni.navigateBack()
      },second)
      break;
    case 'noback':
    case 'notback':
    case 'unback':
      setTimeout(()=>{
        uni.redirectTo({
          url: obj.path
        })
      },second)
      break;
    default:
      throw "uigo.js => 未定义的type -> "+obj.type
  }

}