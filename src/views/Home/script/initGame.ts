import * as THREE from 'three'
import Three from './init'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Capsule } from 'three/examples/jsm/math/Capsule.js'

export default class Game {
  ctx:Three
  dirLight: THREE.DirectionalLight | null = null

  constructor(ctx:Three) {
    this.ctx = ctx

    this.loadModel()
    this.initControls()
    this.initScene()
    this.initDirLight()
  }

  private loadModel() {
    const loader = new GLTFLoader()
    loader.load('/collision-world.glb', gltf => {
      this.ctx.scene?.add(gltf.scene)

      // 遍历场景下的所有child
      gltf.scene.traverse(child => {
        console.log(child)
        // 如果是mesh就开启阴影
        if ((child as any).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    })
  }

  private initControls() {
    this.ctx.camera!.position.set(0, 0, 0)
  }

  private initScene() {
    // 起雾
    this.ctx.scene!.fog = new THREE.Fog(0x88ccee, 0, 50)
  }

  private initDirLight() {  // 平行光 太阳光
    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.dirLight.position.set(-5, 25, -1)
    this.dirLight.castShadow = true
    this.dirLight.shadow.camera.near = 0.01
    this.dirLight.shadow.camera.far = 500
    this.dirLight.shadow.camera.right = 30
    this.dirLight.shadow.camera.left = -30
    this.dirLight.shadow.camera.top = 30
    this.dirLight.shadow.camera.bottom = -30
    this.dirLight.shadow.mapSize.width = 1024
    this.dirLight.shadow.mapSize.height = 1024
    this.dirLight.shadow.radius = 4
    this.dirLight.shadow.bias = -0.00006
    this.ctx.scene?.add(this.dirLight)
  }

}
