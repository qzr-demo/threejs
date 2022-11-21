/* eslint-disable no-use-before-define */
import * as THREE from 'three'
import Three from './index'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { Clock, Vector3, TextureLoader, EquirectangularReflectionMapping } from 'three'

import { Octree } from 'three/examples/jsm/math/Octree.js'
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js'
import { Capsule } from 'three/examples/jsm/math/Capsule.js'

import Convert, {
  setBodyMorphTargetDictionary,
  setTeethMorphTargetDictionary,
  bodyMeshName,
  Tooth_downMeshName,
}  from '@/views/Other/script/convert'
import cryptoModule from '@/views/Other/script/metacrypto.js'

import { useGlobal } from '@/store/global'

const clock = new THREE.Clock()

class Robot {
  ctx: World

  robot: THREE.Group | null = null
  clips: THREE.AnimationClip[] | null = null
  mixer: THREE.AnimationMixer | null = null

  constructor(ctx:World) {
    this.ctx = ctx
  }

  public async init() {
    await this.load()

    this.mixer = new THREE.AnimationMixer(this.robot!)
    setTimeout(() => {
      this.initAnimation()
    }, 1000)
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
        this.robot.position.copy(new Vector3(0, 0, -3))
        // this.robot.position.copy(new Vector3(-18, 0, -20))

        this.robot.scale.copy(new Vector3(0.2, 0.2, 0.2))
        this.ctx.ctx.scene!.add(this.robot)

        resolve(gltf)
      })
    })
  }

  private initAnimation() {
    this.doMove()
    const clipActionRun = this.mixer!.clipAction(this.clips![6])

    const clipActionWalk = this.mixer!.clipAction(this.clips![10])
    clipActionWalk
      .play()

    // setTimeout(() => {
    //     this.mixer!.stopAllAction()
    // }, 10000)
  }

  private doMove() {
    const positionKf = new THREE.VectorKeyframeTrack(
      '.position',
      [0, 1, 2, 3, 4],
      [
        0, 0, 3,
        0, 0, 5,
        0, 0, 5,
        0, 0, 3,
        0, 0, 3
      ]
    )

    const xAxis = new THREE.Vector3(0, 1, 0)
    const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0)
    const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)

    const quaternionKf = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      [0, 1, 2, 3, 4],
      [
        qInitial.x, qInitial.y, qInitial.z, qInitial.w,
        qInitial.x, qInitial.y, qInitial.z, qInitial.w,
        qFinal.x, qFinal.y, qFinal.z, qFinal.w,
        qFinal.x, qFinal.y, qFinal.z, qFinal.w,
        qInitial.x, qInitial.y, qInitial.z, qInitial.w,
      ]
    )

    const clip = new THREE.AnimationClip(
      'Action',
      5,
      [positionKf, quaternionKf]
    )

    const clipActionMove = this.mixer?.clipAction(clip)
    clipActionMove!
      .play()
  }
}

class Player {
  ctx: World

  geometry: Capsule = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35) // 外形
  // geometry: Capsule = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 2, 0), 1.5) // 外形
  velocity: Vector3 = new THREE.Vector3() // 速度
  direction: Vector3 = new THREE.Vector3() // 方向
  onFloor: boolean = false

  GRAVITY: number = 30 // 重力
  SPEED: number = 10 // 移速

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
    this.init()
  }

  private init() {
    this.initEvent()
  }

  private initEvent() {
    document.addEventListener('mousedown', (e) => {
      document.body.requestPointerLock()
    })

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body) {
        this.ctx.ctx.camera!.rotation.y -= e.movementX / 500 // x轴移动 视角绕y轴旋转
        this.ctx.ctx.camera!.rotation.x -= e.movementY / 500
      }
    })

    document.addEventListener('keydown', (e) => {
      this.keyStates[e.code] = true
    })

    document.addEventListener('keyup', (e) => {
      this.keyStates[e.code] = false
    })
  }

  public handleControls(deltaTime: number) {
    const speedDelta = deltaTime * this.SPEED // 每个时间点速度的改变值

    if (this.keyStates['KeyW']) {
      this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta))
    }
    if (this.keyStates['KeyS']) {
      this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta))
    }
    if (this.keyStates['KeyA']) {
      this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta))
    }
    if (this.keyStates['KeyD']) {
      this.velocity.add(this.getSideVector().multiplyScalar(speedDelta))
    }
    if (this.keyStates['Space'] && this.onFloor) {
      this.velocity.y = 15
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
      damping *= 0.5 // 空中阻力变小十倍
    }

    this.velocity.addScaledVector(this.velocity, damping) // 计算人物速度
    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime) // 计算位移

    this.geometry.translate(deltaPosition)

    this.playerCollisions() // 位移后进行碰撞检查
    this.ctx.ctx.camera?.position.copy(this.geometry.end)
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

  public teleportPlayerIfOob() { // 判断player跳出模型范围 重置人物到原点
    const { geometry } = this
    if (this.ctx.ctx.camera!.position.y <= -25) {
      geometry.start.set(0, 0.35, 0)
      geometry.end.set(0, 1, 0)
      geometry.radius = 0.35
      this.ctx.ctx.camera!.position.copy(geometry.end)
      this.ctx.ctx.camera!.rotation.set(0, 0, 0)
    }
  }
}

class Man {
  ctx: World

  man: THREE.Group | null = null
  clips: THREE.AnimationClip[] | null = null
  mixer: THREE.AnimationMixer | null = null

  constructor(ctx:World) {
    this.ctx = ctx

    this.init()
  }

  private async init() {
    await this.loadRobot()

    await this.loadAction()
  }

  private loadRobot() {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('/character.glb', gltf => {
        this.man = gltf.scene
        this.clips = gltf.animations

        this.setModelInfo(gltf.scene)

        this.man.castShadow = true
        this.man.receiveShadow = true
        // this.man.position.copy(new Vector3(-10, 0, -20))
        this.man.position.copy(new Vector3(0, 0, -5))

        this.mixer = new THREE.AnimationMixer(this.man as any)

        // this.man.scale.copy(new Vector3(3, 3, 3))
        this.ctx.ctx.scene!.add(this.man)

        resolve(gltf)
      })
    })
  }

  // 设置Model信息
  private setModelInfo(model) {
    let body = model.getObjectByName('body').children[0] as THREE.Mesh
    if (!body.morphTargetDictionary) {
      body = body.parent!.children[1] as THREE.Mesh
    }
    setBodyMorphTargetDictionary(body.name, body.morphTargetDictionary)
    let teeth = model.getObjectByName('tooth_down') as THREE.Mesh
    if (!teeth.morphTargetDictionary) {
      teeth = teeth.children[0] as THREE.Mesh
    }
    setTeethMorphTargetDictionary(teeth.name, teeth.morphTargetDictionary)
    teeth.updateMorphTargets()
    body.updateMorphTargets()
    return model
  }

  private async loadAction() {
    const res = await fetch('/Talking_BGY_F0/Talking_BGY_F0')
    const reader = new FileReader()
    reader.readAsArrayBuffer(await res.blob())
    reader.onload = async (file) => {
      const fileBuffer = new Uint8Array(file.target!.result as any)

      let s = await this.largeUint8ArrayToString(fileBuffer)
      if (s[0] !== '{') {
        const arraybuffer = await cryptoModule.decryptData(fileBuffer)
        s = await this.largeUint8ArrayToString(arraybuffer)
      }
      const json = JSON.parse(s)
      const clip = Convert(json)

      const action = this.mixer!.clipAction(clip)
      action.play()
    }
  }

  private largeUint8ArrayToString(uint8arr): Promise<string> {
    return new Promise((resolve) => {
      const blob = new Blob([uint8arr])
      const reader = new FileReader()
      reader.onload = function (e) {
        resolve(e.target!.result as string)
      }
      reader.readAsText(blob)
    })
  }
}

export default class World {
  ctx:Three
  dirLight: THREE.DirectionalLight | null = null
  scene: GLTF | null = null

  man: Man = new Man(this)
  robot: Robot = new Robot(this)
  player: Player = new Player(this)
  sceneOctree: Octree = new Octree()

  constructor(ctx:Three) {
    this.ctx = ctx

    this.init()
  }

  private async init() {
    const globalStore = useGlobal()

    await this.loadGalleryScene()
    // await this.loadScene()
    await this.robot.init()

    this.initControls()
    // this.initDirLight()
    this.animate()

    this.defaultLight()

    globalStore.loading = false
    console.log('loaded')
  }

  private loadScene() {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
      // loader.load('/scene/youPZ.glb', gltf => {
      // loader.load('/scene/wuPZ.glb', gltf => {
      // loader.load('/collision-world.glb', gltf => {
      loader.load('/scene/youPZ/youPZ.gltf', gltf => {
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

    this.player.handleControls(deltaTime)
    this.player.updatePlayer(deltaTime)
    this.player.teleportPlayerIfOob()

    this.robot!.mixer?.update(deltaTime)
    this.man!.mixer?.update(deltaTime)

    requestAnimationFrame(this.animate.bind(this))
  }

  private initControls() {
    this.ctx.camera!.position.set(0, 0, 0)
    this.ctx.camera!.rotation.order = 'YXZ'
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

  private loadGalleryScene() {
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    loader.setDRACOLoader(dracoLoader)
    return new Promise((resolve, reject) => {
      loader.load('/gallery.glb', gltf => {

        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true

        this.ctx.scene!.add(gltf.scene)

        gltf.scene.traverse((item:any) => {
          if (item.isMesh) {
            item.castShadow = true
            item.receiveShadow = true
          }
        })

        this.sceneOctree.fromGraphNode(gltf.scene.children[gltf.scene.children.length - 1])
        // const helper = new OctreeHelper(this.sceneOctree, 0x666666)
        // this.ctx.scene?.add(helper)

        this.scene = gltf
        resolve(gltf)
      })
    })
  }

  // 默认灯光
  private defaultLight() {
    // const light = new HemisphereLight(0xffffff, 0xcccccc, 1)
    const env = new TextureLoader().load('/Sky_Mirrored_02.jpg')
    env.mapping = EquirectangularReflectionMapping
    this.ctx.scene!.environment = env
    // this.scene.add(light)
  }
}
