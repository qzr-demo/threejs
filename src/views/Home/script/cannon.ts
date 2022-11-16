/* eslint-disable no-use-before-define */
import * as THREE from 'three'
import Three from './init'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Clock, Vector3 } from 'three'

import * as Cannon from 'cannon-es'

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
        resolve(gltf)
      })
    })
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
    this.trans.setPosition(deltaPosition)
    this.robot!.applyMatrix4(this.trans) // 进行位移

    // this.playerCollisions() // 位移后进行碰撞检查
    this.ctx.ctx.camera?.matrix.copy(this.trans)
  }
}

export default class World {
  ctx:Three
  dirLight: THREE.DirectionalLight | null = null
  scene: GLTF | null = null

  robot: Robot = new Robot(this)

  cannonWorld: Cannon.World = new Cannon.World()
  MeshBodyToUpdate: any[] = []

  constructor(ctx:Three) {
    this.ctx = ctx

    this.init()
  }

  private async init() {
    // await this.loadScene()
    // await this.robot.init()

    this.initCamera()
    this.initControls()
    this.initDirLight()
    this.animate()

    this.initCannon()
    this.createPlane()
    this.createSphere()
  }

  initCamera() {
    this.ctx.camera!.position.set(-5, 3, 10)
    this.ctx.camera!.lookAt(0, 0, 0)
  }

  private loadScene() {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
      loader.load('/scene/youPZ.glb', gltf => {
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

    this.cannonWorld.step(1.0 / 60.0)

    for (const object of this.MeshBodyToUpdate) {
      object.mesh.position.copy(object.body.position)
      object.mesh.quaternion.copy(object.body.quaternion)
    }

    // this.robot.handleControls(deltaTime)
    // this.robot.updatePlayer(deltaTime)

    // this.robot!.mixer?.update(deltaTime)
    // 相机跟随
    // const p = this.robot!.robot!.position
    // this.ctx.controls?.target.copy(p)
    // this.ctx.controls?.update()
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

  private initCannon() {
    this.cannonWorld.gravity.set(0, -9.8, 0)

    this.cannonWorld.broadphase = new Cannon.NaiveBroadphase()

    // 4.3 声明默认材质
    const cannonDefaultMaterial = new Cannon.Material()
    const cannonDefaultCantactMaterial = new Cannon.ContactMaterial(
      cannonDefaultMaterial,
      cannonDefaultMaterial,
      {
        friction: 0.5,
        restitution: 0.7,
      }
    )

    this.cannonWorld.addContactMaterial(cannonDefaultCantactMaterial)
  }

  private createPlane() {
    // 1 创建Cannon中的地板刚体
    // 1.0 创建地板刚体形状
    let cannonPlaneShape = new Cannon.Plane()
    // 1.1 创建地板刚体的材质，默认材质
    let cannonPlaneMaterial = new Cannon.Material()
    // 1.2 创建地板刚体的质量mass，质量为0的物体为静止的物体
    let cannonPlaneMass = 0
    // 1.3 创建地板刚体的位置position，坐标原点
    let cannonPlanePosition = new Cannon.Vec3(0, 0, 0)
    // 1.4 创建地板刚体的Body
    let cannonPlaneBody = new Cannon.Body({
      mass: cannonPlaneMass,
      position: cannonPlanePosition,
      shape: cannonPlaneShape,
      material: cannonPlaneMaterial,
    })
    // 1.5 旋转地板刚体Body，使其垂直与y轴
    // setFromAxisAngle方法第一个参数是旋转轴，第二个参数是角度
    cannonPlaneBody.quaternion.setFromAxisAngle(
      new Cannon.Vec3(1, 0, 0),
      -Math.PI / 2
    )
    // 1.6 将cannonPlaneBody添加到物理场景world中
    this.cannonWorld.addBody(cannonPlaneBody)

    // 2 创建Three中的地板网格
    // 2.0 创建Three中的地板网格形状
    let threePlaneGeometry = new THREE.PlaneGeometry(20, 20, 20)
    // 2.1 创建地板网格的材质
    let threePlaneMaterial = new THREE.MeshLambertMaterial({
      color: 0xa5a5a5,
      side: THREE.DoubleSide,
    })
    // 2.2 创建地板网格的mesh
    let threePlaneMesh = new THREE.Mesh(
      threePlaneGeometry,
      threePlaneMaterial
    )
    // 2.3 设置地板网格的旋转
    threePlaneMesh.rotation.x = -Math.PI / 2
    // 2.4 开启地表网格接收光照阴影
    threePlaneMesh.receiveShadow = true
    // 2.5 设置地板网格的位置，坐标原点
    threePlaneMesh.position.set(0, 0, 0)
    // 2.6 设置地板网格的大小缩放
    threePlaneMesh.scale.set(2, 2, 2)
    // 2.7 将threePlaneMesh添加到Three场景scene中
    this.ctx!.scene!.add(threePlaneMesh)
  }

  private createSphere() {
    // 1 创建Cannon中的球体刚体
    // 1.1 创建球体刚体形状，参数为球体的半径
    let cannonSphereShape = new Cannon.Sphere(1)
    // 1.2 创建球体刚体的材质，默认材质
    let cannonSphereMaterial = new Cannon.Material()
    // 1.3 创建球体刚体的质量mass，单位为kg
    let cannonSphereMass = 5
    // 1.4 创建球体刚体的位置position
    let cannonSpherePosition = new Cannon.Vec3(0, 10, 0)
    // 1.5 创建球体刚体的Body
    let cannonSphereBody = new Cannon.Body({
      mass: cannonSphereMass,
      shape: cannonSphereShape,
      position: cannonSpherePosition,
      material: cannonSphereMaterial,
    })
    // 1.6 将cannonSphereBody添加到物理场景world中
    this.cannonWorld.addBody(cannonSphereBody)

    // 2 创建Three中的球体网格
    // 2.1 创建球体网格的形状
    let threeSphereGeometry = new THREE.SphereGeometry(1, 32, 32)
    // 2.2 创建球体网格的材质
    let threeSphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFB6C1,
    })
    // 2.3 创建球体网格的Mesh
    let threeSphereMesh = new THREE.Mesh(
      threeSphereGeometry,
      threeSphereMaterial
    )
    // 2.4 设置球体网格投射光照阴影
    threeSphereMesh.castShadow = true
    // 2.5 将threeSphereMesh添加到Three场景的scene中
    this.ctx.scene!.add(threeSphereMesh)

    // 3 将cannonSphereBody和threeSphereMesh添加到MeshBodyToUpdate中
    this.MeshBodyToUpdate.push({
      body: cannonSphereBody,
      mesh: threeSphereMesh,
    })
  }
}
