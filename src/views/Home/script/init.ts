import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { OimoPhysics } from 'three/examples/jsm/physics/OimoPhysics'
import Torus from './initTorus'
import initLight from './initLight'
import Robot from './initRobot'
import Game from './initGame'
import Drop from './initDrop'
import Cube from './initCube'
import RaycasterMesh from './initRaycast'

export default class Three {
  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: THREE.WebGLRenderer | null = null
  ambientLight: THREE.AmbientLight | null = null
  mesh: THREE.Mesh | null = null
  axesHelper: THREE.AxesHelper | null = null
  controls: OrbitControls | null = null
  planeFloor: THREE.Mesh | null = null


  container: HTMLElement

  gui: GUI = new GUI()



  hesLight: THREE.HemisphereLight | null = null



  constructor(container:HTMLElement) {
    this.container = container

    this.init()

  }

  protected async init() {
    // 创建场景 容器概念
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x88ccee)


    this.initCamera()
    this.initRenderer()
    this.render()

    this.initEvent()

    this.initFloor()

    initLight.call(this)

    // 控制器 需在相机之后创建
    this.initControls()
    // this.initGUI()
    this.initAxesHelper()



    const torus = new Torus(this)
    // const raycast = new RaycasterMesh(this)
    // const cube = new Cube(this)
    // const dorp = new Drop(this)
    // const robot = new Robot(this)
    // const game = new Game(this)
  }

  protected initFloor() { // 生成地板
    // const geometryPlane = new THREE.PlaneGeometry(2000, 2000)
    const geometryPlane = new THREE.BoxGeometry(300, 1, 300)  // 有碰撞体积
    const materialPlane = new THREE.MeshPhongMaterial({ color: 0x808080 })
    // const materialPlane = new THREE.ShadowMaterial({ color: 0x111111 }) // 只接受影子的材质 影子的颜色
    this.planeFloor = new THREE.Mesh(geometryPlane, materialPlane)
    // this.planeFloor.rotation.x = -Math.PI / 2
    this.planeFloor.position.set(0, -10, 0)
    this.scene?.add(this.planeFloor)
  }

  protected initCamera() {  // 创建相机
    // 创建透视相机（透视指模拟人眼 近大远小）
    // 参数一 透视视角 与焦距有关
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    // 参数三四 轴向视距 看到的最近和最远的距离
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    // 设定相机原点
    this.camera.position.set(-5, 3, 10)
    this.camera.lookAt(0, 0, 0)


  }

  protected initRenderer() {  // 创建渲染器
    this.renderer = new THREE.WebGLRenderer()

    // 优化边缘细节
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // 颜色偏明亮
    this.renderer.outputEncoding = THREE.sRGBEncoding

    // 渲染场景的大小
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.renderer.shadowMap.enabled = true // 渲染阴影
    this.renderer.shadowMap.type = THREE.VSMShadowMap

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping

    this.container.appendChild(this.renderer.domElement)  // canvas挂载
  }

  protected render() {  // 进行渲染
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)

      this.controls?.update()

      // 下一帧渲染调用 类似nextTick
      // 调用速度与浏览器保持一致 一般每秒60帧
      // 三者都是是异步 api，setTimeout 和 setInterval属于宏任务; requestAnimationFrame属于“渲染任务”（调用GUI 引擎），执行优先级在宏任务前，微任务之后。
      requestAnimationFrame(this.render.bind(this))
    }
  }

  protected initAxesHelper() { // 坐标轴
    // x:红色 y:绿色 z:蓝色
    this.axesHelper = new THREE.AxesHelper(200)
    this.scene?.add(this.axesHelper)
  }

  protected initControls() {  // 控制器 控制器控制camera
    this.controls = new OrbitControls(this.camera!, this.renderer?.domElement)
  }

  protected initEvent() {
    // 自适应缩放浏览器
    window.addEventListener('resize', () => {
      this.camera!.aspect = window.innerWidth / window.innerHeight
      this.camera!.updateProjectionMatrix()
      this.renderer?.setSize(window.innerWidth, window.innerHeight)
    })
  }

  protected initGUI() { // 配置调试器
    this.gui = new GUI()

    const CameraFolder = this.gui.addFolder('Camera')
    CameraFolder.add(this.camera?.position, 'x', -1000, 1000, 1)
    CameraFolder.add(this.camera?.position, 'y', -1000, 1000, 1)
    CameraFolder.add(this.camera?.position, 'z', -1000, 1000, 1)
    CameraFolder.close()

    this.gui.close()
  }
}
