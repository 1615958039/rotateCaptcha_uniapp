<template>
  <view>
    
    <u-navbar
      :is-back="false"
      title="旋转验证码示例"
      :background="{
        backgroundImage: 'linear-gradient(45deg,#0081ff,#1cbbb4)'
      }"
      title-color="#fff"
    />
    
    
    <view class="flex flex-direction align-center">
      
      <button
        class="margin-top cu-btn bg-green"
        @click="showCaptcha"
      >展示验证码弹窗</button>
      
      <button
        class="margin-top cu-btn bg-gray"
        @click="cleanLog"
      >清空验证记录</button>
      
    </view>
    
    <view class="margin-top-lg text-grey padding">
      
      <view class="margin-top-xs">
      	vueCli版本预览： <a href="./vuecli.html">./vuecli.html</a>
      </view>
			
			<view class="margin-top-xs">
				旋转验证码开源地址： <a href="https://github.com/1615958039/rotateCaptcha">https://github.com/1615958039/rotateCaptcha</a>
			</view>
      
    </view>
    
    
    <captchaDialog ref="captchaDialog" />
    
  </view>
</template>
<script>
import captchaDialog from '../components/captcha/dialog.vue'
export default {
  components: {
    captchaDialog,
  },
  methods: {
    /**
     * 测试按钮，开启验证码
     */
    showCaptcha(){
      this.$refs.captchaDialog.init().then(()=>{
        // 验证通过回调
        uni.showToast({
          title: '验证成功！',
          icon: "success",
          duration: 2000,
        });
        
      }).catch(()=>{
        // 验证码加载出错或用户手动关闭验证码
        uni.showToast({
          title: '验证码已关闭',
          duration: 2000,
        });
        
      });
    },
    /**
     * 清空验证记录
     */
    cleanLog(){
      let that = this;
      that.ajax({
        url: "/demo/resetTryNum.json",
        showLoading: "清空中..."
      }).then(res=>{
        that.tw("清空成功！您可重新获取验证码");
      });
    },
  },
}
</script>
<style lang="scss">

</style>