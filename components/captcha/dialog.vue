<template>
  <view>
    
    <view class="cu-modal" :class="show?'show':''" @click.stop="close()">
      <view @click.stop @touchmove.stop="'diyname'" class="cu-dialog captchaDialog bg-white text-left" style="border-radius: 40rpx">
        <view class="padding-xs margin-top text-center">
          <text class="text-grey text-df">人机验证</text>
        </view>
        <view class="margin-top-xs text-center">
          <text class="text-lg text-black">拖动滑块,使图片角度为正</text>
        </view>
        <view class="margin-top-lg flex justify-center">
          <view 
            class="captchaImage flex-center bg-white"
          >
            <u-image
              v-if="captchaSrc!=''"
              :src="captchaSrc"
              :style="{
                transform:  `rotate(${imageTransform}deg)`
              }"
              height="320rpx"
              width="320rpx"
            />
            <u-loading 
              v-if="pageLoading || captchaSrcLoading"
              size="80"
              class="captchaIcon"
            />
            <u-icon
              v-if="captchaError"
              name="close"
              size="120"
              class="captchaIcon"
              color="#fff"
            />
            
            <template v-if="isDrag">
              <!-- 辅助虚线 -->
              <view class="verticalArrow"></view>
              <view class="transverseArrow"></view>
            </template>
            
          </view>
        </view>
        <view class="capFoot margin-top-lg margin-bottom-sm padding-lr-sm">
          <view class="slider solid" id="slider">
            <view 
              class="sliderItem clickActive-gray"
              :class="captchaError?'shake':''"
              id="sliderItem"
              @touchstart="dragStart" 
              @touchmove.prevent="dragMove"
              @touchend="dragEnd"
              
              @mousedown="dragStart"
              @mousemove.prevent="dragMove"
              @mouseup="dragEnd"
              @dragstart="dragStart"
              @dragend="dragEnd"
              @dragover.stop
              @drop="dragMove"
              
              :style="{
                left: `${sliderItemLeft}px`,
                backgroundColor: captchaError?'red':(isDrag?'#0081ff':'#fff')
              }"
            >
              <u-loading 
                v-if="dragLoading || pageLoading || captchaSrcLoading"
                size="36"
              />
              <u-icon 
                v-else
                :name="dragIcon" 
                size="40" 
              />
            </view>
          </view>
        </view>
        <view class="text-center text-sm margin-bottom">
          <view class="text-xs text-gray">
            <text class="text-bold text-black padding-right-xs">犭申</text>
            <text>提供技术支持</text>
          </view>
        </view>
        <view class="captchaCloseView">
          <u-icon 
            @click="show=false"
            name="close" 
            size="40" 
            color="#fff"
          />
        </view>
      </view>
    </view>
    
  </view>
</template>
<script>
let pmsSuccess = null;  //验证成功事件
let pmsError = null;    //弹窗关闭事件
export default {
  data() {
    return {
      
      show: false, //控制弹窗是否展示
      captchaSrc: "", //验证码图片 base64
      
      isDrag: false, //是否拖动中
      dragStartTime: 0, //拖动开始时间
      dragUseTime: 0, //拖动用时
      mouseTrackList: [], //鼠标轨迹列表
      
      sliderItemInitX: 0, //滑动按钮初始X坐标
      sliderItemLeftMax: 0, //滑块允许距离左边最大长度
      sliderItemLeft: 0,
      
      captchaSrcLoading: false, //请求图片验证码中
      pageLoading: false, //页面加载中，验证码图片加载中
      dragLoading: false, //拖动按钮loading状态
      captchaError: false, //是否验证失败
      
      
    }
  },
  computed: {
    /**
     * 图片旋转角度
     */
    imageTransform(){
      let that = this;
      if(that.sliderItemLeft==0)return 0;
      return Math.ceil((360 / that.sliderItemLeftMax) * that.sliderItemLeft * 100) / 100;
    },
    /**
     * 拖动条上的图标
     */
    dragIcon(){
      let that = this;
      let white = '/static/icon/drag_white.png';
      let black = '/static/icon/drag_black.png';
      if(that.captchaError)return white;
      if(that.isDrag)return white;
      return black;
    }
  },
  methods: {
    /**
     * 外部调用
     */
    init(){
      let that = this;
      return new Promise((yes,err)=>{
        pmsSuccess = yes;
        pmsError = err;
        
        that.captchaSrc = false;
        that.captchaError = false;
        that.isDrag = false;
        that.captchaSrcLoading = false;
        that.pageLoading = false;
        that.dragLoading = false;
        
        that.show = true;
        if(that.sliderItemLeftMax==0){
          that.pageLoading = true;
          setTimeout(()=>{
            that.$nextTick(()=>{
              that.$u.getRect('#slider').then(res => {
                let sliderWidth = res.width;
                that.$u.getRect('#sliderItem').then(res => {
                  that.sliderItemInitX = res.left;
                  that.sliderItemLeftMax = sliderWidth - res.width;
                  that.pageLoading = false;
                  that.getCaptchaSrc()
                }).catch((err)=>{
                  console.log("获取节点信息失败 2 -> ",err);
                })
              }).catch((err)=>{
                console.log("获取节点信息失败 1 -> ",err);
              })
            })
          },500)
        }else{
          that.getCaptchaSrc()
        }
        
      })
    },
    /**
     * 手动关闭弹窗
     */
    close(){
      this.show = false;
      pmsError(); //执行关闭回调事件
    },
    /**
     * 拖动开始事件
     */
    dragStart(e){
      let that = this;
      if(that.dragLoading)return false;
      if(that.pageLoading)return false;
      if(that.captchaSrcLoading)return false;
      that.mouseTrackList = []; //初始化轨迹列表
      that.dragStartTime = new Date().getTime(); //记录开始时间
      that.isDrag = true;
      that.addMouseTrack(e);
    },
    /**
     * 手指移动事件
     */
    dragMove(e){
      let that = this;
      if(that.dragLoading)return false;
      if(that.pageLoading)return false;
      if(that.captchaSrcLoading)return false;
      if(!that.isDrag)return false;
      let maringLeft = (e.clientX?e.clientX:e.changedTouches[0].clientX) - that.sliderItemInitX - 30;
      if(maringLeft<0)maringLeft = 0;
      if(maringLeft>that.sliderItemLeftMax)maringLeft = that.sliderItemLeftMax;
      that.sliderItemLeft = maringLeft;
      that.addMouseTrack(e);
    },
    /**
     * 拖动结束事件
     */
    dragEnd(e){
      let that = this;
      if(that.dragLoading)return false;
      if(that.pageLoading)return false;
      if(that.captchaSrcLoading)return false;
      that.addMouseTrack(e);
      that.isDrag = false;
      that.dragLoading = true; //开启loading准备ajax
      that.dragUseTime = new Date().getTime() - that.dragStartTime; //计算拖动时间
      that.checkCaptcha();
    },
    /**
     * 加载验证码
     */
    getCaptchaSrc(){
      let that = this;
      that.captchaSrcLoading = true;
      that.sliderItemLeft = 0;
      that.captchaSrc = '';
      
      that.ajax({
        url: "/public/captcha/getCaptcha.json",
        end(){
          that.captchaSrcLoading = false;
        }
      }).then(res=>{
        if(res.src){
          that.dragLoading = false;
          that.captchaSrc = `data:image/png;base64,${res.src}`
        }
      }).catch(err=>{
        that.tw(err.message);
        setTimeout(()=>{ // 防止闪烁，延迟一秒
          that.close(); //关闭验证码
        },1000)
      })
    },
    
    /**
     * 添加滑动数据进鼠标轨迹列表
     */
    addMouseTrack(){
      let that = this;
      let lastTime = that.mouseTrackList==''?that.dragStartTime:that.mouseTrackList[that.mouseTrackList.length-1].t;
      let now = new Date().getTime();
      if(lastTime + 200 <= now){
        that.mouseTrackList.push({
          r: Math.ceil(that.imageTransform / 360 * 10000) / 100, //当前角度
          t: now, //当前时间戳
        })
      }
    },
    /**
     * 提交效验
     */
    checkCaptcha(){
      let that = this;
      that.ajax({
        url: "/public/captcha/checkCaptcha.json",
        datas: {
          rotationAngle: that.imageTransform, //旋转角度
          mouseTrackList: JSON.stringify(that.mouseTrackList), //滑动轨迹
          dragUseTime: that.dragUseTime, //拖动用时
          dragStartTime: that.dragStartTime, //拖动开始时间
          
          /**
           * 以下为混淆参数，无用
           */
          keyA: Math.ceil(new Date().getTime() * Math.random() * 123456),
          keyO: Math.ceil(new Date().getTime() * Math.random() * 678951),
          keyD: Math.ceil(new Date().getTime() * Math.random() * 781545),
          hash: Math.ceil(new Date().getTime() * Math.random() * 456789),
          md5Key: Math.ceil(new Date().getTime() * Math.random() * 7891),
          
        }
      }).then(res=>{ //代码效验成功
        
        that.show = false;
        pmsSuccess();//回调
        
      }).catch(err=>{
        that.dragLoading = false;
        that.captchaError = true;
        setTimeout(()=>{
          that.captchaError = false;
          if(err.getNewCaptcha)that.getCaptchaSrc();
          else{
            that.captchaSrcLoading = false;
            that.sliderItemLeft = 0;
          }
        },1000)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.captchaImage{
  height: 320rpx;
  width: 320rpx;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  .captchaIcon{
    position: absolute;
  }
  .verticalArrow{
    position: absolute;
    height: 320rpx;
    border-left: 1px dashed #fff;
    margin-left: 1px;
    width: 1px;
  }
  .transverseArrow{
    position: absolute;
    height: 1px;
    width: 320rpx;
    border-top: 1px dashed #fff;
    margin-top: 1px;
    overflow: visible;
  }
}
.capFoot{
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  
  .slider{
    width: 580rpx;
    height: 90rpx;
    background-color: #f5f5f5;
    border-radius: 900rpx;
    overflow: hidden;
    position: relative;
    
    .sliderItem{
      height: 88rpx;
      width: 110rpx;
      border-radius: 900rpx;
      background-color: white;
      position: absolute;
      left: 0;
      top: 1rpx;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-box-shadow: 0 21px 52px 0 rgba(82,82,82,.2);
      box-shadow: 0 21px 52px 0 rgba(82,82,82,.2);
    }
  }
}
.shake{
  animation: shake 800ms ease-in-out;
}
@keyframes shake { /* 水平抖动，核心代码 */
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(+2px, 0, 0); }
  30%, 70% { transform: translate3d(-3px, 0, 0); }
  40%, 60% { transform: translate3d(+3px, 0, 0); }
  50% { transform: translate3d(-3px, 0, 0); }
}
.captchaDialog{
  position: relative;
  overflow: visible;
}
.captchaCloseView{
  position: absolute;
  bottom: -150rpx;
  width: 100%;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>