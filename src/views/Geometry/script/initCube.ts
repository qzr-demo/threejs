/*
 * @Date         : 2022-11-11 09:26:00
 * @Description  : 创建一个旋转的方块
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 16:49:17
 */

import * as THREE from 'three'
import Three from './index'

export default class Cube {
  ctx: Three
  cube: THREE.Mesh | null = null
  constructor(ctx: Three) {
    this.ctx = ctx

    this.initAnimation()
    this.initCube()
    this.initShadow()
  }

  private initAnimation() {
    requestAnimationFrame(() => {
      this.cube!.rotation.y += 0.01
      this.initAnimation()
    })
  }

  private initCube() { // 创建物体
    // 创建几何对象
    const geometry = new THREE.BoxGeometry(30, 20, 30)

    // 材质 基本黄色
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

    // 创建物体 需要几何属性、材质属性  mesh:物体
    this.cube = new THREE.Mesh(geometry, material)
    this.cube.position.set(0, 30, 0)

    this.ctx.scene!.add(this.cube)
  }

  private initShadow() {
    this.cube!.castShadow = true  // 物体投影
  }
}

