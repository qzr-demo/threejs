<!--
 * @Date         : 2022-11-21 15:06:59
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 15:17:08
-->

<template>
  <div id="container" />
</template>

<script lang='ts' setup>
import FpsGame from './script/FpsGame'

onMounted(() => {
  const fpsGame = new FpsGame()
})
</script>

<style scoped lang='scss'>

</style>
