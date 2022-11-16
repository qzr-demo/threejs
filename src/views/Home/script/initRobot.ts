/* eslint-disable no-use-before-define */
import * as THREE from 'three'
import Three from './init'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
const clock = new THREE.Clock()

class Robot {
  ctx: World
  robot: THREE.Group | null = null
  clips: THREE.AnimationClip[] | null = null
  mixer: THREE.AnimationMixer | null = null
  clipsIndex: number = -1

  activeAction: THREE.AnimationAction | null = null
  clip: THREE.AnimationClip | null = null

  keyStates: {
    KeyW: boolean
    KeyS: boolean
    KeyA: boolean
    KeyD: boolean
    Space: boolean
  } = {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      Space: false
    }

  constructor(ctx:World) {
    this.ctx = ctx
  }

  public async init() {
    await this.load()
    this.initAnimation()
    this.initEvent()
  }

  private async load() {
    await this.loadRobot()
  }

  private loadRobot() {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('/RobotExpressive.glb', gltf => {
        this.robot = gltf.scene
        this.clips = gltf.animations

        this.robot.castShadow = true
        this.robot.receiveShadow = true

        this.ctx.ctx.scene!.add(this.robot)
        this.changeAction(2)
        resolve(gltf)
      })
    })
  }

  private changeAction(index:number) {
    if (this.clipsIndex === index) return
    this.activeAction?.fadeOut(0.2)

    this.clipsIndex = index
    this.mixer = new THREE.AnimationMixer(this.robot!)
    this.activeAction = this.mixer.clipAction(this.clips![index])
    this.activeAction
      .reset()
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(0.2)
      .play()
  }

  private initAnimation() {
    // 位置
    const positionKF = new THREE.VectorKeyframeTrack(
      '.position',
      [0, 1, 2, 4, 5],
      [
        0, 0, 0,
        10, 0, 0,
        10, 0, 20,
        0, 0, 20,
        0, 0, 0
      ]
    )

    console.log(positionKF)
    console.log(this.clips![6])

    this.clip = new THREE.AnimationClip(
      'Action',
      5,
      [positionKF]
    )

    setTimeout(() => {
      this.enableAnimation()
    }, 1000)
  }

  private enableAnimation() {
    const clipActionMove = this.mixer?.clipAction(this.clip!)
    clipActionMove!
      .play()

    const clipActionRun = this.mixer!.clipAction(this.clips![6])
    clipActionRun
      .play()

    setTimeout(() => {
        this.mixer!.stopAllAction()
    }, 10000)
  }

  private initEvent() {
    document.addEventListener('keydown', (e) => {
      this.keyStates[e.code] = true
    })

    document.addEventListener('keyup', (e) => {
      this.keyStates[e.code] = false
    })
  }

}

export default class World {
  ctx:Three
  dirLight: THREE.DirectionalLight | null = null
  scene: GLTF | null = null

  robot: Robot = new Robot(this)

  constructor(ctx:Three) {
    this.ctx = ctx

    this.init()
  }

  private async init() {
    await this.loadScene()
    await this.robot.init()

    this.scene!.scene.position.y = 4.9

    this.initCamera()
    this.initControls()
    this.initDirLight()
    this.animate()

  }

  initCamera() {
    this.ctx.camera!.position.set(-5, 3, 10)
    this.ctx.camera!.lookAt(0, 0, 0)
  }

  private loadScene() {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('/scene/AA.glb', gltf => {
      // loader.load('/collision-world.glb', gltf => {
        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true

        this.ctx.scene!.add(gltf.scene)

        gltf.scene.traverse((item:any) => {
          if (item.isMesh) {
            item.castShadow = true
            item.receiveShadow = true
          }
        })

        this.scene = gltf
        resolve(gltf)
      })
    })
  }

  private animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) // 避免delta为0 最小取0.05

    this.robot!.mixer?.update(deltaTime)
    // 相机跟随
    const p = this.robot!.robot!.position
    this.ctx.controls?.target.copy(p)
    this.ctx.controls?.update()
    requestAnimationFrame(this.animate.bind(this))
  }

  private initControls() {
    // 跟随距离超出距离 自动跟随
    this.ctx.controls!.maxDistance = 20
    this.ctx.controls!.minDistance = 10
  }

  private initDirLight() { // 平行光 太阳光

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.dirLight.position.set(0, 25, 20)
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
