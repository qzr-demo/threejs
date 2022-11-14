import * as THREE from 'three'
import Three from './init'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const clock = new THREE.Clock()

export default class Robot {
  ctx:Three
  upVector = new THREE.Vector3(0, 1, 0)
  step = 0.1
  robot: THREE.Group | null = null
  man: THREE.Group | null = null
  tempVector = new THREE.Vector3()
  clips: THREE.AnimationClip[] | null = null
  mixer: THREE.AnimationMixer | null = null
  clipsIndex: number = -1
  keys: string[] = []
  activeAction: THREE.AnimationAction | null = null

  clip: THREE.AnimationClip | null = null

  constructor(ctx:Three) {
    this.ctx = ctx

    this.ctx.camera!.position.set(-5, 3, 10)
    this.ctx.camera!.lookAt(0, 0, 0)

    this.load()
    this.move()
    this.ctx.initHemisphereLight()
    this.ctx.initAmbientLight()



  }

  private load() {
    const loader = new GLTFLoader()
    loader.load('/RobotExpressive.glb', gltf => {
      console.log(gltf)
      this.robot = gltf.scene
      this.clips = gltf.animations

      this.ctx.scene!.add(this.robot)

      this.changeAction(2)
      this.render()
      this.initControls()

      this.initAnimation()

      setTimeout(() => {
        this.enableAnimation()
      }, 1000)
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

  private move() {
    window.addEventListener('keydown', e => {
      if (e.key.match(/^(w|a|s|d)$/i)) {
        !this.keys.includes(e.key) && this.keys.push(e.key)
        if (this.keys.length !== 0) {
          this.changeAction(6)
        }
      }
    })

    window.addEventListener('keyup', e => {
      this.keys.splice(this.keys.indexOf(e.key), 1)
      if (this.keys.length === 0) {
        this.changeAction(2)
      }
    })
  }

  private animate() {
    const { robot, keys } = this
    if (robot) {
      const p = robot.position
      if (keys.length) {
        if (keys.includes('w')) {
          robot.translateZ(this.step)
        }
        if (keys.includes('s')) {
          robot.translateZ(-this.step)
        }
        if (keys.includes('a')) {
          robot.rotateY(THREE.MathUtils.degToRad(1))
        }
        if (keys.includes('d')) {
          robot.rotateY(-THREE.MathUtils.degToRad(1))
        }
        // 相机跟随
        this.ctx.controls?.target.copy(p)
        this.ctx.controls?.update()
      }

    }

  }

  private render() {
    requestAnimationFrame(() => {
      const delata = clock.getDelta()
      this.render()
      this.animate()
      this.mixer?.update(delata)
    })
  }

  private initControls() {
    // 跟随距离超出距离 自动跟随
    this.ctx.controls!.maxDistance = 20
    this.ctx.controls!.minDistance = 10
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
}

