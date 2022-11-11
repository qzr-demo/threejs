<!--
 * @Date         : 2021-04-19 18:00:02
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-10 15:24:33
-->

<template>
  <div>
    <div id="container" />
  </div>
</template>

<script lang='ts' setup>
import ThreeJs from './script/initThree'

onMounted(() => {
  const Three = new ThreeJs()
})
</script>

<style scoped lang='scss'>
#container {
  width: 100vw;
  height: 100vh;
}
</style>
