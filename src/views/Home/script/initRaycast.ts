import * as THREE from 'three'
import Three from './init'

const amount = 10
const count = Math.pow(amount, 3)
const white = new THREE.Color().setHex(0xffffff)
const color = new THREE.Color()

export default class Raycaster {
  ctx: Three
  meshes: THREE.InstancedMesh | null = null
  raycaster: THREE.Raycaster = new THREE.Raycaster()
  mouse: THREE.Vector2 = new THREE.Vector2()

  constructor(ctx:Three) {
    this.ctx = ctx

    this.initMeshes()
    this.initRaycast()
    this.initEvent()
  }

  private initMeshes() {  // 批量生成二十面体
    const geometry = new THREE.IcosahedronGeometry(0.5, 3) // 正二十面体
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    // 批量新建
    this.meshes = new THREE.InstancedMesh(geometry, material, count)

    let index = 0
    const offset = (amount - 1) / 2 + 20
    const matrix = new THREE.Matrix4()

    for (let i = 0; i < amount; i++) {
      for (let j = 0; j < amount; j++) {
        for (let k = 0; k < amount; k++) {
          matrix.setPosition(offset - i, offset - j, offset - k)
          this.meshes.setMatrixAt(index, matrix)
          this.meshes.setColorAt(index, white)

          index++
        }
      }
    }

    this.ctx.scene?.add(this.meshes)
  }

  private initRaycast() { // 模拟鼠标hover 给二十面球体赋颜色
    this.raycaster.setFromCamera(this.mouse!, this.ctx.camera!)

    requestAnimationFrame(() => {
      // 判断鼠标与目标的交集
      const intersection = this.raycaster.intersectObject(this.meshes!)
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId

        // 判断是否已经赋值颜色
        this.meshes?.getColorAt(instanceId!, color)
        if (color.equals(white)) {
          this.meshes?.setColorAt(instanceId!, color.setHex(Math.random() * 0xffffff))
          this.meshes!.instanceColor!.needsUpdate = true
        }
      }

      this.initRaycast()
    })
  }

  private initEvent() {
    // 设置鼠标
    window.addEventListener('mousemove', e => {
          this.mouse!.x = (e.clientX / window.innerWidth) * 2 - 1 // -1 ~ 1
          this.mouse!.y = -(e.clientY / window.innerHeight) * 2 + 1 // -1 ~ 1
    })
  }
}

