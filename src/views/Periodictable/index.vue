<!--
 * @Date         : 2022-11-21 09:44:53
 * @Description  :
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 14:40:15
-->

<template>
  <div class="periodictable-container">
    <div id="container" />
    <div id="menu">
      <button id="table"
              @click="transTable">Table</button>
      <button id="sphere"
              @click="transSphere">sphere</button>
      <button id="helix"
              @click="transHelix">helix</button>
      <button id="grid"
              @click="transGrid">grid</button>
    </div>
  </div>
</template>

<script lang='ts' setup>
import Periodictable from './script'
const periodictable = ref<Periodictable>()

onMounted(() => {
  periodictable.value = new Periodictable()
})

function transTable() {
  periodictable.value?.transTable()
}
function transSphere() {
  periodictable.value?.transSphere()
}
function transHelix() {
  periodictable.value?.transHelix()
}
function transGrid() {
  periodictable.value?.transGrid()
}

</script>

<style lang='scss'>
.periodictable-container {
  margin: 0;
  background-color: #000;
  color: #fff;
  font-family: Monospace;
  font-size: 13px;
  line-height: 24px;
  overscroll-behavior: none;
  width: 100vw;
  height: 100vh;

  #menu {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
  }

  .element:hover {
    box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.75);
    border: 1px solid rgba(127, 255, 255, 0.75);
  }

  .element {
    width: 120px;
    height: 160px;
    box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
    border: 1px solid rgba(127, 255, 255, 0.25);
    font-family: Helvetica, sans-serif;
    text-align: center;
    line-height: normal;
    cursor: default;

    .number {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 12px;
      color: rgba(127, 255, 255, 0.75);
    }

    .symbol {
      position: absolute;
      top: 40px;
      left: 0px;
      right: 0px;
      font-size: 60px;
      font-weight: bold;
      color: rgba(255, 255, 255, 0.75);
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.95);
    }

    .details {
      position: absolute;
      bottom: 15px;
      left: 0px;
      right: 0px;
      font-size: 12px;
      color: rgba(127, 255, 255, 0.75);
    }

  }

  button {
    color: rgba(127, 255, 255, 0.75);
    background: transparent;
    outline: 1px solid rgba(127, 255, 255, 0.75);
    border: 0px;
    padding: 5px 10px;
    cursor: pointer;
  }

  button:hover {
    background-color: rgba(0, 255, 255, 0.5);
  }

  button:active {
    color: #000000;
    background-color: rgba(0, 255, 255, 0.75);
  }

  button {
    cursor: pointer;
    text-transform: uppercase;
  }

}
</style>
