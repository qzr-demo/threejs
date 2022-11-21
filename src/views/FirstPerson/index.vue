<!--
 * @Date         : 2022-11-21 16:53:59
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 16:59:34
-->

<template>
  <div id="firstPersonContainer" />
  <div v-if="globalStore.loading"
       id="loading">Loading...</div>
</template>

<script lang='ts' setup>
import Three from './script'
import { useGlobal } from '@/store/global'

const globalStore = useGlobal()

onMounted(() => {
  globalStore.loading = true

  const three = new Three()
})
</script>

<style scoped lang='scss'>

</style>
