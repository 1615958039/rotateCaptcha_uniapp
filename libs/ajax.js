/**
 * ajax请求封装
 */
import config from "../config"
import md5Libs from "../components/uview-ui/libs/function/md5";
async function ajax({
  url = String, // 接口路径,get请求需在结尾加上?
  datas = Object, // post提交的数据
  timeout = config.httpTimeOut,
  showLoading = false, // 展示loading
  showError = false, // 直接弹出错误提示
  filePath = null, // 上传的文件地址,此参数填后为上传文件
  end = Function, // 全局结束事件,同等complete事件
}) {
  return new Promise((yes, err) => {
    let requestConfig = arguments[0]; //记录参数
    if (showLoading) {
      uni.showLoading({
        title: typeof (showLoading) == 'boolean' ? '加载中...' : showLoading,
        mask: true,
      });
    }
    let request = {
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      url: "",
      data: datas,
      method: datas ? 'POST' : 'GET',
      timeout,
      sslVerify: false, // app 端效验ssl是否有效
      dataType: "json",
      /**
       * 响应成功事件
       */
      success: async (res) => {
        if (typeof res.data != "object") {
          try {
            res.data = JSON.parse(res.data)
          } catch (error) {
            if (showError) tw('服务器响应错误！请重试')
            err("服务器响应错误", res)
          }
        }
        
        switch (res.data.code) {
          case -2: //登录已失效
            // TODO: 清空登录状态，跳转到登录页
            break;
          case -1:
            /**
             * 同步请求一遍token
             */
            await ajax({
              url: "/public/getToken.json",
              showLoading: "初始化中..."
            }).then(tokenRes => {
              if (tokenRes.token) { //有token写入缓存
                uni.setStorageSync('token', tokenRes.token)
              }
              ajax(requestConfig).then(yes).catch(err); //重新执行失败的请求
            }).catch(error => {
              console.log("getToken失败", error);
              err("app初始化失败!")
            })
            break;
          case 0: //正常报错
            if (showError) tw(res.data.message ? res.data.message : '服务器响应错误！请重试')
            err(res.data)
            break;
          case 1: //响应成功
            yes(res.data)
            break;
          default:
            if (showError) tw(res.data.message ? res.data.message : '服务器响应错误！请重试')
            err(res.data)
        }


      },
      /**
       * 响应失败事件
       */
      fail(res) {
        if (showError) tw('服务器响应错误！请重试')
        err(res.data, res)
      },
      /**
       * 请求结束事件
       */
      complete() {
        if (showLoading) { // 延迟关闭loading弹窗,体验感更好
          setTimeout(() => {
            uni.hideLoading();
          }, 500)
        }
        if (typeof end == "function") end();
      }
    };
    if (typeof url != "string") throw "请传入正确的url参数(String)";

    if (url.indexOf('http') != 0) { //拼接url
      request.url = config.apiUrl + url
    }
    let token = uni.getStorageSync('token');
    if (token) {
      request.header.Token = token;
    }

    /**
     * url = api + "?"
     * 自动判断 ‘?’是否在结尾，如果是的话把datas拼接入url
     */
    try {
      if (
        ((url.indexOf("?") + 1) == url.length)
        && (datas != undefined && datas != "")
      ) {
        let i = 0
        for (let key in datas) {
          request.url += ((i++ == 0) ? "" : "&") + key + "=" + datas[key]
        }
        delete request.data;
        request.method = 'GET';
      }
    } catch (error) {
      throw "拼接url出错"
    }

    /**
     * 数据签名
     */
    request.header.Sign = md5Libs.md5(objToUrlCode(ksort({
      ...(typeof request.data == 'object' ? request.data : {}),
      ...getUrlObj(request.url),
      appKey: config.appKey
    })));

    if (filePath) { //上传文件

      request.filePath = filePath;
      request.name = "file";
      delete request.header["Content-Type"]; //删除contentType否则PHP接收不到文件
      request.formData = request.data;
      delete request.data;
      
      uni.uploadFile(request);

    } else { //ajax请求
      uni.request(request);
    }
  })
}
export default ajax;

/**
 * 弹窗提示
 */
function tw(msg = String) {
  return uni.showToast({
    title: msg,
    icon: "none",
    duration: 2000,
    position: "bottom",
    mask: false
  });
}
/**
 * 对象按字母正序排列返回
 */
function ksort(o) {
  let sorted = {};
  Object.keys(o).sort().map(key => {
    sorted[key] = o[key];
  });
  return sorted;
}
/**
 * 解析url内的键值对
 */
function getUrlObj(url) {
  var u = url.split("?");
  if (typeof (u[1]) == "string") {
    u = u[1].split("&");
    var get = {};
    for (var i in u) {
      var j = u[i].split("=");
      get[j[0]] = j[1];
    }
    return get;
  } else {
    return {};
  }
}

/**
 * 对象转成url编码格式
 */
function objToUrlCode(obj) {
  let str = '';
  Object.keys(obj).map(key => {
    str = str + `&${key}=${obj[key]}`
  })
  return str;
}
