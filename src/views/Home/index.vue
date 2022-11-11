<!--
 * @Date         : 2021-10-20 17:47:27
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-10 15:25:14
-->

<template>
  <div id="box"
       ref="box" />
</template>

<script lang="ts" setup>
import THREE from './script/init'

const box = ref()

onMounted(() => {
  const Three = new THREE(box.value)
  console.log(Three)
})
</script>
