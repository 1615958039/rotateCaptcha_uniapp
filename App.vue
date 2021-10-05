<script>
export default {
  onLaunch() {
    let that = this;
    try {
      if (window) window.$vue = that; //把vue对象挂载到window对象，方便在浏览器console调试
    } catch (error) {}
  }
};
</script>

<style lang="scss">
@import "./static/css/main.css";
@import "./static/css/icon.css";
@import "./static/css/animation.css";
@import "./components/uview-ui/index.scss";

.uni-body {
  background-color: $u-bg-color;
}
.bg {
  background-color: $u-bg-color;
  min-height: 100vh;
  position: relative;
  width: 750rpx;
  max-width: 750rpx;
  overflow-x: hidden;
}
.bg-white {
  background-color: #fff;
}
.flex-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.text-line-1 {
  lines: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-line-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  lines: 2;
}

</style>
