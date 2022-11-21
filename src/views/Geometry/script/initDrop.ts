/*
 * @Date         : 2022-11-11 08:54:04
 * @Description  : 生成循环掉落的正方体和球体
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-21 16:49:22
 */

import * as THREE from 'three'
import Three from './index'
import { OimoPhysics } from 'three/examples/jsm/physics/OimoPhysics'

const color = new THREE.Color()
const position = new THREE.Vector3()

export default class Drop {
  ctx: Three
  boxes: THREE.InstancedMesh | null = null
  spheres: THREE.InstancedMesh | null = null
  physics: OimoPhysics | null = null

  constructor(ctx:Three) {
    this.ctx = ctx

    this.init()
  }

  private async init() {
    this.initDropMeshes()
    await this.initPhysics()
    this.resetDrop()
  }

  private initDropMeshes() {  // 创建自由落体的球和方块
    const box = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial() // 反射能力较差材质 如木头

    this.boxes = new THREE.InstancedMesh(box, material, 100)

    this.spheres = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 3),
      material,
      100
    )

    const matrix = new THREE.Matrix4()
    for (let i = 0; i < this.boxes.count; i++) {
      matrix.setPosition(
        Math.random() - 0.5 + 20,  // x: -0.5 ~ 0.5
        Math.random() * 20 + 20,    //  y: 0 ~ 2
        Math.random() - 0.5 //  z: -0.5 ~ 0.5
      )
      this.boxes.setMatrixAt(i, matrix)
      this.boxes.setColorAt(i, color.setHex(Math.random() * 0xffffff))

      this.spheres.setMatrixAt(i, matrix)
      this.spheres.setColorAt(i, color.setHex(Math.random() * 0xffffff))
    }
    this.ctx.scene?.add(this.boxes)
    this.boxes.castShadow = true
    this.boxes.receiveShadow = true

    this.ctx.scene?.add(this.spheres)
    this.spheres.castShadow = true
    this.spheres.receiveShadow = true

    // 提高画质
    this.boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }

  private async initPhysics() { // 赋予物体物理属性 包括重力、碰撞等
    this.physics = await OimoPhysics()
    this.physics.addMesh(this.ctx.planeFloor)
    this.physics.addMesh(this.boxes, 1)
    this.physics.addMesh(this.spheres, 1)
  }

  private resetDrop() { // 重置掉落物体到原点
    let index = Math.floor(Math.random() * this.boxes!.count)
    position.set(20, Math.random() + 10 + 20, 0)

    this.physics.setMeshPosition(this.boxes, position, index)
    this.physics.setMeshPosition(this.spheres, position, index)

    requestAnimationFrame(() => {
      this.resetDrop()
    })
  }
}

