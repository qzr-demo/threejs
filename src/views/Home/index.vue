<!--
 * @Date         : 2021-10-20 17:47:27
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-18 17:45:46
-->

<template>
  <div id="box"
       ref="box" />

  <div v-if="globalStore.loading"
       id="loading">Loading...</div>
</template>

<script lang="ts" setup>
import THREE from './script/init'
import { useGlobal } from '@/store/global'

const box = ref()
const globalStore = useGlobal()

onMounted(() => {
  globalStore.loading = true

  const Three = new THREE(box.value)
  console.log(Three)
})
</script>

<style lang="scss" scoped>
#loading {
  width: 100vw;
  height: 100vh;
  position: fixed;
  background: black;
  top: 0;
  z-index: 99999;
  color: white;
  text-align: center;
  line-height: 100vh;
  font-size: 50px;
}
</style>
