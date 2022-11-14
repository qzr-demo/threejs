/* eslint-disable no-use-before-define */
import * as THREE from 'three'
import Three from './init'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Capsule } from 'three/examples/jsm/math/Capsule.js'
import { Clock, Vector3 } from 'three'

import { Octree } from 'three/examples/jsm/math/Octree.js'
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js'

const clock = new Clock()
class Player {
  geometry: Capsule // 外形
  velocity: Vector3 // 速度
  direction: Vector3 // 方向
  onFloor: boolean = false

  constructor() {
    this.geometry = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35)

    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
  }
}

class Spheres {
  ctx: Game
  list: any = []
  NUM_SPHERE: number = 100 // 数量
  SPHERE_RADIUS: number = 0.2 // 半径
  sphereGeoetry = new THREE.IcosahedronGeometry(this.SPHERE_RADIUS, 5)
  sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xbbbb44 })
  sphereIdx: number = 0

  vector1: THREE.Vector3 = new THREE.Vector3()
  vector2: THREE.Vector3 = new THREE.Vector3()
  vector3: THREE.Vector3 = new THREE.Vector3()



  constructor(ctx: Game) {
    this.ctx = ctx
    this.init()
  }

  private init() {
    for (let i = 0; i < this.NUM_SPHERE; i++) {
      const sphere = new THREE.Mesh(this.sphereGeoetry, this.sphereMaterial)
      sphere.castShadow = true
      sphere.receiveShadow = true
      this.ctx.ctx.scene?.add(sphere)

      this.list.push({
        mesh: sphere,
        collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), this.SPHERE_RADIUS),
        velocity: new THREE.Vector3()
      })
    }
  }

  public throwBall() {
    const { player, mouseTime } = this.ctx
    const sphere = this.list[this.sphereIdx]
    this.ctx.ctx.camera?.getWorldDirection(player.direction)
    sphere.collider.center.copy(player.geometry.end).addScaledVector(player.direction, player.geometry.radius * 1.5)

    const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001))
    sphere.velocity.copy(player.direction).multiplyScalar(impulse)
    sphere.velocity.addScaledVector(player.velocity, 2)

    this.sphereIdx = (this.sphereIdx + 1) % this.list.length
  }

  public updateSpheres(deltaTime) {
    // 检查球体碰撞体积
    this.list.forEach((sphere) => {
      sphere.collider.center.addScaledVector(sphere.velocity, deltaTime)
      const result = this.ctx.worldOctree.sphereIntersect(sphere.collider)

      if (result) {
        sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5)
        sphere.collider.center.add(result.normal.multiplyScalar(result.depth))
      } else {
        sphere.velocity.y -= this.ctx.GRAVITY * deltaTime
      }

      const damping = Math.exp(-1.5 * deltaTime) - 1
      sphere.velocity.addScaledVector(sphere.velocity, damping)

      this.playerSphereCollision(sphere)
    })

    this.spheresCollisions()
    for (const sphere of this.list) {
      sphere.mesh.position.copy(sphere.collider.center)
    }
  }

  private playerSphereCollision(sphere) { // 球和palyer的碰撞检查
    const { vector1, vector2, vector3 } = this
    const { playerCollider } = this.ctx
    const center = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5)

    const sphere_center = sphere.collider.center

    const r = playerCollider.radius + sphere.collider.radius
    const r2 = r * r

    // approximation: player = 3 spheres

    for (const point of [playerCollider.start, playerCollider.end, center]) {
      const d2 = point.distanceToSquared(sphere_center)

      if (d2 < r2) {
        const normal = vector1.subVectors(point, sphere_center).normalize()
        const v1 = vector2.copy(normal).multiplyScalar(normal.dot(this.ctx.player.velocity))
        const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity))

        this.ctx.player.velocity.add(v2).sub(v1)
        sphere.velocity.add(v1).sub(v2)

        const d = (r - Math.sqrt(d2)) / 2
        sphere_center.addScaledVector(normal, -d)
      }
    }
  }

  private spheresCollisions() { // 球和球间的碰撞检查

    const { list, vector1, vector2, vector3 } = this

    for (let i = 0, length = list.length; i < length; i++) {
      const s1 = list[i]

      for (let j = i + 1; j < length; j++) {

        const s2 = list[j]

        const d2 = s1.collider.center.distanceToSquared(s2.collider.center)
        const r = s1.collider.radius + s2.collider.radius
        const r2 = r * r

        if (d2 < r2) {

          const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize()
          const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity))
          const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity))

          s1.velocity.add(v2).sub(v1)
          s2.velocity.add(v1).sub(v2)

          const d = (r - Math.sqrt(d2)) / 2

          s1.collider.center.addScaledVector(normal, d)
          s2.collider.center.addScaledVector(normal, -d)

        }
      }
    }
  }
}

export default class Game {
  ctx: Three
  dirLight: THREE.DirectionalLight | null = null
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
  player: Player = new Player()
  GRAVITY: number = 30 // 重力
  SPEED: number = 30 // 移速

  mouseTime: number = 0

  worldOctree: Octree = new Octree()
  spheres: Spheres | null = null

  playerCollider:Capsule = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35)

  constructor(ctx: Three) {
    this.ctx = ctx

    this.loadModel()

    this.initControls()
    this.initScene()
    this.initDirLight()

    this.spheres = new Spheres(this)
    this.initEvent()

    this.ctx.initHemisphereLight()
  }

  private loadModel() {
    const loader = new GLTFLoader()
    loader.load('/collision-world.glb', (gltf) => {
      this.ctx.scene?.add(gltf.scene)

      // 遍历场景下的所有child
      gltf.scene.traverse((child) => {
        // 如果是mesh就开启阴影
        if ((child as any).isMesh) {
          child.castShadow = true
          child.receiveShadow = true

          if ((child as any).material.map) {
            (child as any).material.map.anisotropy = 4  // 提高模型纹理 一般为1，2，4，8
          }
        }
      })

      this.worldOctree.fromGraphNode(gltf.scene)
      const helper = new OctreeHelper(this.worldOctree, 0x666666)
      this.ctx.scene?.add(helper)

      this.animate()
    })
  }

  private initControls() {
    this.ctx.camera!.position.set(0, 0, 0)
    this.ctx.camera!.rotation.order = 'YXZ'
  }

  private initScene() {
    // 起雾
    this.ctx.scene!.fog = new THREE.Fog(0x88ccee, 0, 50)
  }

  private initDirLight() {
    // 平行光 太阳光
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

  private initEvent() {
    document.addEventListener('mousedown', (e) => {
      document.body.requestPointerLock()
      this.mouseTime = performance.now()
    })

    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body) {
        this.ctx.camera!.rotation.y -= e.movementX / 500 // x轴移动 视角绕y轴旋转
        this.ctx.camera!.rotation.x -= e.movementY / 500
      }
    })

    document.addEventListener('mouseup', () => {
      if (document.pointerLockElement !== null) {
        this.spheres!.throwBall()
      }
    })

    document.addEventListener('keydown', (e) => {
      this.keyStates[e.code] = true
    })

    document.addEventListener('keyup', (e) => {
      this.keyStates[e.code] = false
    })
  }

  private handleControls(deltaTime: number) {
    const speedDelta = deltaTime * (this.player.onFloor ? 25 : this.SPEED) // 每个时间点速度的改变值

    if (this.keyStates['KeyW']) {
      this.player.velocity.add(this.getForwardVector().multiplyScalar(speedDelta))
    }
    if (this.keyStates['KeyS']) {
      this.player.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta))
    }
    if (this.keyStates['KeyA']) {
      this.player.velocity.add(this.getSideVector().multiplyScalar(-speedDelta))
    }
    if (this.keyStates['KeyD']) {
      this.player.velocity.add(this.getSideVector().multiplyScalar(speedDelta))
    }
    if (this.keyStates['Space'] && this.player.onFloor) {
      this.player.velocity.y = 15
    }
  }

  private getForwardVector() {
    this.ctx.camera?.getWorldDirection(this.player.direction) // player的方向绑定camera的方向
    this.player.direction.y = 0 // wasd不改变y方向
    this.player.direction.normalize()
    return this.player.direction
  }

  private getSideVector() {
    this.ctx.camera?.getWorldDirection(this.player.direction) // player的方向绑定camera的方向
    this.player.direction.y = 0 // wasd不改变y方向
    this.player.direction.normalize()
    this.player.direction.cross(this.ctx.camera!.up) // 从前后计算左右的方向
    return this.player.direction
  }

  private updatePlayer(deltaTime: number) {
    // 通过速度的变化更新位移 并设置camera的位置
    let damping = Math.exp(-4 * deltaTime) - 1 // 阻力 让人物停止
    if (!this.player.onFloor) {
      this.player.velocity.y -= this.GRAVITY * deltaTime // 空中自由运动
      damping *= 0.1 // 空中阻力变小十倍
    }

    this.player.velocity.addScaledVector(this.player.velocity, damping) // 计算人物速度
    const deltaPosition = this.player.velocity.clone().multiplyScalar(deltaTime) // 计算位移
    this.player.geometry.translate(deltaPosition) // 进行位移

    this.playerCollisions() // 位移后进行碰撞检查
    this.ctx.camera?.position.copy(this.player.geometry.end)
  }

  private animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) // 避免delta为0 最小取0.05
    this.handleControls(deltaTime)
    this.updatePlayer(deltaTime)

    this.spheres!.updateSpheres(deltaTime)

    this.teleportPlayerIfOob()
    requestAnimationFrame(this.animate.bind(this))
  }

  private playerCollisions() {
    // 检查碰撞
    // 无碰撞返回false 有碰撞返回碰撞点坐标
    const result = this.worldOctree.capsuleIntersect(this.player.geometry)
    if (result) {
      this.player.onFloor = result.normal.y > 0 // y轴无碰撞 则不再地板上
      if (!this.player.onFloor) {
        this.player.velocity.addScaledVector(result.normal, -result.normal.dot(this.player.velocity))
      }
      this.player.geometry.translate(result.normal.multiplyScalar(result.depth))
    } else {
      this.player.onFloor = false
    }
  }

  private teleportPlayerIfOob() { // 判断player跳出模型范围 重置人物到原点
    const { playerCollider } = this
    if (this.ctx.camera!.position.y <= -25) {
      playerCollider.start.set(0, 0.35, 0)
      playerCollider.end.set(0, 1, 0)
      playerCollider.radius = 0.35
      this.ctx.camera!.position.copy(playerCollider.end)
      this.ctx.camera!.rotation.set(0, 0, 0)
    }
  }
}
