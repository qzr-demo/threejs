import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import { OimoPhysics } from 'three/examples/jsm/physics/OimoPhysics'

const amount = 10
const count = Math.pow(amount, 3)
const white = new THREE.Color().setHex(0xffffff)
const color = new THREE.Color()

const position = new THREE.Vector3()

export default class Three {
  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: THREE.WebGLRenderer | null = null
  ambientLight: THREE.AmbientLight | null = null
  mesh: THREE.Mesh | null = null
  axesHelper: THREE.AxesHelper | null = null
  controls: OrbitControls | null = null
  planeFloor: THREE.Mesh | null = null
  cube: THREE.Mesh | null = null
  spotLight: THREE.SpotLight | null = null
  container: HTMLElement
  spotLightHelper: THREE.SpotLightHelper | null = null
  gui: GUI | null = null
  meshes: THREE.InstancedMesh | null = null
  raycaster: THREE.Raycaster = new THREE.Raycaster()
  mouse: THREE.Vector2 = new THREE.Vector2()

  hesLight: THREE.HemisphereLight = new THREE.HemisphereLight()
  dirLight: THREE.DirectionalLight = new THREE.DirectionalLight()

  boxes: THREE.InstancedMesh | null = null
  spheres: THREE.InstancedMesh | null = null

  physics: OimoPhysics | null = null

  torusKnot: THREE.Mesh | null = null

  constructor(container:HTMLElement) {
    this.container = container

    this.init()
  }

  private async init() {
    // 创建场景 容器概念
    this.scene = new THREE.Scene()

    this.initFloor()
    this.initCube()
    this.initCamera()
    this.initRenderer()
    this.initHemisphereLight()

    // 控制器 需在相机之后创建
    this.initControls()

    this.initAnimation()
    this.render()

    this.initSpotLight()
    this.initShadow()

    this.initEvent()

    this.initAxesHelper()
    this.initSpotLightHelper()

    this.initGUI()

    this.initMeshes()
    this.initRaycast()

    this.initDropMeshes()
    this.initAmbientLight()
    this.initDirLight()

    await this.initPhysics()
    this.resetDrop()

    this.initTorus()
  }

  private initCube() { // 创建物体
    // 创建几何对象
    const geometry = new THREE.BoxGeometry(30, 20, 30)

    // 材质 基本黄色
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })

    // 创建物体 需要几何属性、材质属性  mesh:物体
    this.cube = new THREE.Mesh(geometry, material)
    this.cube.position.set(0, 30, 0)

    this.scene!.add(this.cube)
  }

  private initFloor() { // 生成地板
    // const geometryPlane = new THREE.PlaneGeometry(2000, 2000)
    const geometryPlane = new THREE.BoxGeometry(300, 1, 300)  // 有碰撞体积
    const materialPlane = new THREE.MeshPhongMaterial({ color: 0x808080 })
    // const materialPlane = new THREE.ShadowMaterial({ color: 0x111111 }) // 只接受影子的材质 影子的颜色
    this.planeFloor = new THREE.Mesh(geometryPlane, materialPlane)
    // this.planeFloor.rotation.x = -Math.PI / 2
    this.planeFloor.position.set(0, -10, 0)
    this.scene?.add(this.planeFloor)
  }

  private initAnimation() {
    requestAnimationFrame(() => {
      this.cube!.rotation.y += 0.01
      this.initAnimation()
    })
  }

  private initCamera() {  // 创建相机
    // 创建透视相机（透视指模拟人眼 近大远小）
    // 参数一 透视视角 与焦距有关
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    // 参数三四 轴向视距 看到的最近和最远的距离
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    // 设定相机原点
    this.camera.position.set(0, 120, 200)
    this.camera.lookAt(0, 0, 0)


  }

  private initRenderer() {  // 创建渲染器
    this.renderer = new THREE.WebGLRenderer()

    // 优化边缘细节
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // 颜色偏明亮
    this.renderer.outputEncoding = THREE.sRGBEncoding

    // 渲染场景的大小
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)  // canvas挂载
  }

  private render() {  // 进行渲染
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)

      // 下一帧渲染调用 类似nextTick
      // 调用速度与浏览器保持一致 一般每秒60帧
      // 三者都是是异步 api，setTimeout 和 setInterval属于宏任务; requestAnimationFrame属于“渲染任务”（调用GUI 引擎），执行优先级在宏任务前，微任务之后。
      requestAnimationFrame(this.render.bind(this))
    }
  }

  private initAxesHelper() { // 坐标轴
    // x:红色 y:绿色 z:蓝色
    this.axesHelper = new THREE.AxesHelper(200)
    this.scene?.add(this.axesHelper)
  }

  private initControls() {  // 控制器 控制器控制camera
    this.controls = new OrbitControls(this.camera!, this.renderer?.domElement)
  }

  private initAmbientLight() {  // 背景光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    this.scene?.add(this.ambientLight)
  }

  private initSpotLight() { // 投影光 点光源
    this.spotLight = new THREE.SpotLight(0xffffff, 1)
    this.spotLight.position.set(-50, 80, 0)
    this.spotLight.angle = Math.PI / 6
    this.spotLight.penumbra = 0.2
    this.scene?.add(this.spotLight)
  }

  private initHemisphereLight() { // 环境光
    this.hesLight.intensity = 0.3
    this.scene?.add(this.hesLight)
  }

  private initDirLight() {  // 平行光 太阳光
    this.dirLight.position.set(5, 5, -5)
    this.scene?.add(this.dirLight)
  }

  private initShadow() { // 配置投影
    this.cube!.castShadow = true  // 物体投影
    this.planeFloor!.receiveShadow = true // 接受投影物体
    this.spotLight!.castShadow = true // 光线
    this.hesLight.castShadow = true
    this.dirLight.castShadow = true
    this.renderer!.shadowMap.enabled = true // 渲染
  }

  private initEvent() {
    window.addEventListener('resize', () => {
      this.camera!.aspect = window.innerWidth / window.innerHeight
      this.camera!.updateProjectionMatrix()
      this.renderer?.setSize(window.innerWidth, window.innerHeight)
    })

    // 设置鼠标
    window.addEventListener('mousemove', e => {
      this.mouse!.x = (e.clientX / window.innerWidth) * 2 - 1 // -1 ~ 1
      this.mouse!.y = -(e.clientY / window.innerHeight) * 2 + 1 // -1 ~ 1
    })
  }

  private initSpotLightHelper() { // 投影光辅助线
    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight!)
    this.scene?.add(this.spotLightHelper)
  }

  private initGUI() { // 配置调试器
    this.gui = new GUI()

    const SpotLightFolder = this.gui.addFolder('Spot Light')
    SpotLightFolder.addColor(this.spotLight, 'color')
    SpotLightFolder.add(this.spotLight, 'angle', 0, Math.PI / 2)
    SpotLightFolder.add(this.spotLight, 'penumbra', 0, 1)

    const CameraFolder = this.gui.addFolder('Camera')
    CameraFolder.add(this.camera?.position, 'x', -1000, 1000, 1)
    CameraFolder.add(this.camera?.position, 'y', -1000, 1000, 1)
    CameraFolder.add(this.camera?.position, 'z', -1000, 1000, 1)
    CameraFolder.close()

    this.gui.close()
  }

  private initMeshes() {  // 批量生成球体
    const geometry = new THREE.IcosahedronGeometry(0.5, 3) // 正二十面体
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    // 批量新建
    this.meshes = new THREE.InstancedMesh(geometry, material, count)

    let index = 0
    const offset = (amount - 1) / 2 + 20
    const matrix = new THREE.Matrix4()

    for (let i = 0; i < amount; i++) {
      for (let j = 0; j < amount; j++) {
        for (let k = 0; k < amount; k++) {
          matrix.setPosition(offset - i, offset - j, offset - k)
          this.meshes.setMatrixAt(index, matrix)
          this.meshes.setColorAt(index, white)

          index++
        }
      }
    }

    this.scene?.add(this.meshes)
  }

  private initRaycast() { // 模拟鼠标hover 给二十面球体赋颜色
    this.raycaster.setFromCamera(this.mouse!, this.camera!)

    requestAnimationFrame(() => {
      // 判断鼠标与目标的交集
      const intersection = this.raycaster.intersectObject(this.meshes!)
      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId

        // 判断是否已经赋值颜色
        this.meshes?.getColorAt(instanceId!, color)
        if (color.equals(white)) {
          this.meshes?.setColorAt(instanceId!, color.setHex(Math.random() * 0xffffff))
          this.meshes!.instanceColor!.needsUpdate = true
        }
      }

      this.initRaycast()
    })
  }

  private initDropMeshes() {  // 创建自由落体的球和方块
    const box = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial() // 反射能力较差材质 如木头

    this.boxes = new THREE.InstancedMesh(box, material, 100)

    this.spheres = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 3),
      material,
      100
    )

    const matrix = new THREE.Matrix4()
    for (let i = 0; i < this.boxes.count; i++) {
      matrix.setPosition(
        Math.random() - 0.5,  // x: -0.5 ~ 0.5
        Math.random() * 20,    //  y: 0 ~ 2
        Math.random() - 0.5 //  z: -0.5 ~ 0.5
      )
      this.boxes.setMatrixAt(i, matrix)
      this.boxes.setColorAt(i, color.setHex(Math.random() * 0xffffff))

      this.spheres.setMatrixAt(i, matrix)
      this.spheres.setColorAt(i, color.setHex(Math.random() * 0xffffff))
    }
    this.scene?.add(this.boxes)
    this.boxes.castShadow = true
    this.boxes.receiveShadow = true

    this.scene?.add(this.spheres)
    this.spheres.castShadow = true
    this.spheres.receiveShadow = true

    // 提高画质
    this.boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  }

  private async initPhysics() { // 赋予物体物理属性 包括重力、碰撞等
    this.physics = await OimoPhysics()
    this.physics.addMesh(this.planeFloor)
    this.physics.addMesh(this.boxes, 1)
    this.physics.addMesh(this.spheres, 1)
  }

  private resetDrop() { // 重置掉落物体到原点
    let index = Math.floor(Math.random() * this.boxes!.count)
    position.set(0, Math.random() + 10, 0)

    this.physics.setMeshPosition(this.boxes, position, index)
    this.physics.setMeshPosition(this.spheres, position, index)

    requestAnimationFrame(() => {
      this.resetDrop()
    })
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
    this.scene?.add(this.torusKnot)

    this.torusKnot.castShadow = true
  }
}
