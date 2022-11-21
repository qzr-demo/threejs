<!--
 * @Date         : 2021-10-20 17:47:27
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 16:58:46
-->

<template>
  <div id="box"
       ref="box" />

  <!-- <div v-if="globalStore.loading"
       id="loading">Loading...</div> -->
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

</style>
