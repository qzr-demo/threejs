import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import Stats from 'three/examples/jsm/libs/stats.module.js'

export default class ThreeBase {
  container: HTMLElement = document.querySelector('#container')!

  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: THREE.WebGLRenderer | null = null
  controls: OrbitControls | null = null

  gui: GUI | null = null
  axesHelper: THREE.AxesHelper | null = null
  stats: Stats | null = null

  constructor() {
    this.init()
  }

  private init() {
    this.initRenderer()
    this.initCamera()
    this.initScene()
    this.initControls()

    this.onWindowResize()
    this.initStats()
    this.animate()
  }

  private initRenderer() {  // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true })

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

  protected initStats() { // 左上角的帧数显示模块
    this.stats = Stats()
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.top = '0px'
    this.container.appendChild(this.stats.domElement)
  }

  protected initCamera() {  // 创建相机
    // 创建透视相机（透视指模拟人眼 近大远小）
    // 参数一 透视视角 与焦距有关
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    // 参数三四 轴向视距 看到的最近和最远的距离
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  }

  private initScene() {
    this.scene = new THREE.Scene()
  }

  protected initAxesHelper() { // 坐标轴
    // x:红色 y:绿色 z:蓝色
    this.axesHelper = new THREE.AxesHelper(200)
    this.scene?.add(this.axesHelper)
  }

  protected initControls() {  // 控制器 控制器控制camera
    this.controls = new OrbitControls(this.camera!, this.renderer?.domElement)
  }

  private onWindowResize() {
    window.addEventListener('resize', () => {
      this.camera!.aspect = window.innerWidth / window.innerHeight
      this.camera!.updateProjectionMatrix()
      this.renderer!.setSize(window.innerWidth, window.innerHeight)
    })
  }

  protected animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.controls?.update()
    this.renderer?.render(this.scene!, this.camera!)
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
