/* eslint-disable no-use-before-define */
import * as THREE from 'three'
import Three from './init'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Clock, Vector3 } from 'three'

import { Octree } from 'three/examples/jsm/math/Octree.js'
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js'
import { Capsule } from 'three/examples/jsm/math/Capsule.js'

const clock = new THREE.Clock()

class Robot {
  ctx: World
  robot: THREE.Group | null = null
  clips: THREE.AnimationClip[] | null = null
  mixer: THREE.AnimationMixer | null = null
  clipsIndex: number = -1

  activeAction: THREE.AnimationAction | null = null
  clip: THREE.AnimationClip | null = null

  velocity: Vector3 = new THREE.Vector3() // 速度
  direction: Vector3 = new THREE.Vector3() // 方向
  GRAVITY: number = 30 // 重力
  SPEED: number = 30 // 移速

  trans = new THREE.Matrix4()

  onFloor: boolean = true

  geometry = new Capsule(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 1.5)

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
    // this.initAnimation()
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
    // document.addEventListener('mousedown', (e) => {
    //   document.body.requestPointerLock()
    // })

    // document.addEventListener('mousemove', (e) => {
    //   if (document.pointerLockElement === document.body) {
    //     this.ctx.ctx.camera!.rotation.y -= e.movementX / 500 // x轴移动 视角绕y轴旋转
    //     this.ctx.ctx.camera!.rotation.x -= e.movementY / 500
    //   }
    // })

    document.addEventListener('keydown', (e) => {
      this.keyStates[e.code] = true
    })

    document.addEventListener('keyup', (e) => {
      this.keyStates[e.code] = false
    })
  }

  public handleControls(deltaTime: number) {
    const speedDelta = deltaTime * (this.onFloor ? 25 : this.SPEED) // 每个时间点速度的改变值
    const rotateAngle = Math.PI / 2

    if (this.keyStates['KeyW']) {
      this.mixer!.clipAction(this.clips![10]).play()
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta))
    } else {
      this.mixer!.stopAllAction()
    }
    if (this.keyStates['KeyS']) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta))
      this.robot!.lookAt(this.ctx.ctx.camera!.position.clone().setY(0).setZ(0))
      // this.robot!.rotateOnWorldAxis(this.direction, rotateAngle)
      // this.ctx.ctx.camera?.getWorldDirection()
    }
    if (this.keyStates['KeyA']) {
      this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta))
    }
    if (this.keyStates['KeyD']) {
      this.velocity.add(this.getSideVector().multiplyScalar(speedDelta))
    }
    if (this.keyStates['Space'] && this.onFloor) {
      this.mixer!.clipAction(this.clips![3]).setLoop(THREE.LoopPingPong, 1).play().reset()
      this.velocity.y = 20
    }
  }

  private getForwardVector() {
    this.ctx.ctx.camera?.getWorldDirection(this.direction) // player的方向绑定camera的方向
    this.direction.y = 0 // wasd不改变y方向
    this.direction.normalize()
    return this.direction
  }

  private getSideVector() {
    this.ctx.ctx.camera?.getWorldDirection(this.direction) // player的方向绑定camera的方向
    this.direction.y = 0 // wasd不改变y方向
    this.direction.normalize()
    this.direction.cross(this.ctx.ctx.camera!.up) // 从前后计算左右的方向
    return this.direction
  }

  public updatePlayer(deltaTime: number) {
    // 通过速度的变化更新位移 并设置camera的位置
    let damping = Math.exp(-4 * deltaTime) - 1 // 阻力 让人物停止
    if (!this.onFloor) {
      this.velocity.y -= this.GRAVITY * deltaTime // 空中自由运动
      damping *= 0.1 // 空中阻力变小十倍
    }

    this.velocity.addScaledVector(this.velocity, damping) // 计算人物速度
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime) // 计算位移

    this.geometry.translate(deltaPosition)
    // this.trans.setPosition(deltaPosition)
    // this.robot!.applyMatrix4(this.trans) // 进行位移

    this.playerCollisions() // 位移后进行碰撞检查
    this.ctx.ctx.camera?.matrix.copy(this.trans)
  }

  private playerCollisions() {
    // 检查碰撞
    // 无碰撞返回false 有碰撞返回碰撞点坐标
    const result = this.ctx.sceneOctree.capsuleIntersect(this.geometry)
    if (result) {
      this.onFloor = result.normal.y > 0 // y轴无碰撞 则不再地板上
      if (!this.onFloor) {
        this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity))
      }
      this.geometry.translate(result.normal.multiplyScalar(result.depth))
    } else {
      this.onFloor = false
    }
  }
}

export default class World {
  ctx:Three
  dirLight: THREE.DirectionalLight | null = null
  scene: GLTF | null = null

  robot: Robot = new Robot(this)
  sceneOctree: Octree = new Octree()

  constructor(ctx:Three) {
    this.ctx = ctx

    this.init()
  }

  private async init() {
    await this.loadScene()
    await this.robot.init()

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
      // loader.load('/scene/youPZ.glb', gltf => {
      // loader.load('/scene/wuPZ.glb', gltf => {
      loader.load('/scene/youPZ/youPZ.gltf', gltf => {
      // loader.load('/collision-world.glb', gltf => {
        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true

        this.ctx.scene!.add(gltf.scene)

        let group = new THREE.Group()
        console.log(gltf)
        gltf.scene.traverse((item:any) => {
          if (item.isMesh) {
            item.castShadow = true
            item.receiveShadow = true
          }

          if (item.name === 'PZ') {
            console.log(item)
            group.add(item.clone())
            // item.visible = false
          }
        })

        this.sceneOctree.fromGraphNode(group)
        const helper = new OctreeHelper(this.sceneOctree, 0x666666)
        this.ctx.scene?.add(helper)

        this.scene = gltf
        resolve(gltf)
      })
    })
  }

  private animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) // 避免delta为0 最小取0.05

    this.robot.handleControls(deltaTime)
    this.robot.updatePlayer(deltaTime)

    this.robot.robot!.position.copy(this.robot.geometry.start.clone()).add(new Vector3(0, -1.5, 0))
    // this.robot.robot!.position.setY(0)

    // this.robot.robot!.position.copy(this.robot.geometry.start)
    // this.robot.robot!.quaternion.copy(this.robot.geometry.end)

    this.robot!.mixer?.update(deltaTime)
    // 相机跟随
    const p = this.robot!.robot!.position
    this.ctx.controls?.target.copy(p)
    this.ctx.controls?.update()
    requestAnimationFrame(this.animate.bind(this))
  }

  private initControls() {
    // this.ctx.camera!.position.set(0, 0, 0)
    // this.ctx.camera!.rotation.order = 'YXZ'

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
