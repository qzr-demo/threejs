/*
 * @Date         : 2022-11-11 09:36:32
 * @Description  : 生成环形节 显示阴影控制器
 * @Autor        : Qzr(z5021996@vip.qq.com)
 * @LastEditors  : Qzr(z5021996@vip.qq.com)
 * @LastEditTime : 2022-11-11 18:20:22
 */

import * as THREE from 'three'
import { Clock } from 'three'
import Three from './init'
import { ShadowMapViewer } from 'three/examples/jsm/utils/ShadowMapViewer.js'

const clock = new Clock()

export default class Torus {
  ctx: Three
  spotLightShadowMapViewer:ShadowMapViewer | null = null
  torusKnot: THREE.Mesh | null = null
  spotLight: THREE.SpotLight | null = null
  spotLightHelper: THREE.SpotLightHelper | null = null

  constructor(ctx: Three) {
    this.ctx = ctx
    this.initTorus()
    this.initSpotLight()
    this.initSpotLightHelper()
    this.initCameraHelper()
    this.initShadowMapViewer()
    this.animate()
    this.initGUI()

    this.initShadow()
  }

  private initTorus() { // 创建环形节
    let geometry = new THREE.TorusKnotGeometry(25, 8, 75, 20)
    let material = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 150, // 闪闪发亮
      specular: 0x222222  // 反光 颜色
    })

    this.torusKnot = new THREE.Mesh(geometry, material)
    this.torusKnot.scale.multiplyScalar(1 / 18) // 放大系数
    this.torusKnot.position.x = -20
    this.torusKnot.position.y = 3
    this.ctx.scene?.add(this.torusKnot)

  }

  private animate() {
    requestAnimationFrame(() => {
      const delta = clock.getDelta()
      this.torusKnot!.rotation.x += 0.25 * delta
      this.torusKnot!.rotation.y += 2 * delta
      this.torusKnot!.rotation.z += Number(delta)
      this.spotLightShadowMapViewer!.render(this.ctx.renderer!)
      this.animate()
    })
  }

  private initCameraHelper() {
    // 限定生成影子的范围
    this.spotLight!.shadow.camera.near = 8
    this.spotLight!.shadow.camera.far = 100
    this.spotLight!.shadow.mapSize.width = 1024
    this.spotLight!.shadow.mapSize.height = 1024

    this.ctx.scene?.add(new THREE.CameraHelper(this.spotLight!.shadow.camera))
  }

  private initShadowMapViewer() {
    this.spotLightShadowMapViewer = new ShadowMapViewer(this.spotLight!)

    const size = window.innerWidth * 0.15

    this.spotLightShadowMapViewer.position.x = 10
    this.spotLightShadowMapViewer.position.y = 10
    this.spotLightShadowMapViewer.size.width = size
    this.spotLightShadowMapViewer.size.height = size
    this.spotLightShadowMapViewer.update()
  }

  private initGUI() { // 配置调试器
    const SpotLightFolder = this.ctx.gui.addFolder('Spot Light')
    SpotLightFolder.addColor(this.spotLight, 'color')
    SpotLightFolder.add(this.spotLight, 'angle', 0, Math.PI / 2)
    SpotLightFolder.add(this.spotLight, 'penumbra', 0, 1)
    SpotLightFolder.close()
  }

  private initSpotLight() { // 投影光 点光源
    this.spotLight = new THREE.SpotLight(0xffffff, 1)
    this.spotLight.position.set(-50, 80, 0)
    this.spotLight.angle = Math.PI / 6
    this.spotLight.penumbra = 0.2
    this.ctx.scene?.add(this.spotLight)

  }


  private initSpotLightHelper() { // 投影光辅助线
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight!)
    this.ctx.scene?.add(this.spotLightHelper)
  }

  private initShadow() {
    this.spotLight!.castShadow = true
    this.torusKnot!.castShadow = true
    this.ctx.planeFloor!.receiveShadow = true // 接受投影物体
  }
}

