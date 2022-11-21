<!--
 * @Date         : 2022-11-21 15:46:32
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 16:32:03
-->

<template>
  <div id="videoBoxContainer" />

  <div class="video">
    <video src="/Beyond - 大地.mp4"
           controls />
  </div>
  <div class="video">
    <video src="/Beyond - 大地.mp4"
           controls />
  </div>
  <div class="video">
    <video src="/Beyond - 大地.mp4"
           controls />
  </div>
  <div class="video">
    <video src="/Beyond - 大地.mp4"
           controls />
  </div>
</template>

<script lang='ts' setup>
import VideoBox from './script'

onMounted(() => {
  const videoBox = new VideoBox()
})
</script>

<style scoped lang='scss'>

</style>
