import * as THREE from 'three'
import { Color } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import cryptoModule from './metacrypto.js'
import Convert, {
  setBodyMorphTargetDictionary,
  setTeethMorphTargetDictionary,
  bodyMeshName,
  Tooth_downMeshName,
}  from './convert'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'

const clock = new THREE.Clock()

export default class ThreeJs {
  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: THREE.WebGLRenderer | null = null
  ambientLight: THREE.AmbientLight | null = null
  mesh: THREE.Mesh | null = null
  ctl: any
  mixer: any
  model: any

  constructor() {
    this.init()
  }

  async init() {
    // 第一步新建一个场景
    this.scene = new THREE.Scene()
    this.setCamera()
    this.setRenderer()
    this.setLight()
    this.setCube()
    await this.loadModel()
    this.animate()
    this.control()
    await this.test()
    this.setGui()
  }

  // 新建透视相机
  setCamera(): void {
    // 第二参数就是 长度和宽度比 默认采用浏览器  返回以像素为单位的窗口的内部宽度和高度
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.z = 5
  }

  // 设置渲染器
  setRenderer(): void {
    this.renderer = new THREE.WebGLRenderer()
    // 设置画布的大小
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // 这里 其实就是canvas 画布  renderer.domElement
    document.getElementById('container')!.appendChild(this.renderer.domElement)


  }

  // 设置环境光
  setLight(): void {
    if (this.scene) {
      this.ambientLight = new THREE.AmbientLight(0xffffff) // 环境光
      this.scene.add(this.ambientLight)
      this.scene.background = new Color(0xa0a0a0)
    }
  }

  // 创建网格模型
  setCube(): void {
    if (this.scene) {
      const geometry = new THREE.BoxGeometry() // 创建一个立方体几何对象Geometry
      const material = new THREE.MeshBasicMaterial({ color: 0xff3200 }) // 材质对象Material
      // const texture = new THREE.TextureLoader().load(
      //   '/assets/imgs/dalishi.jpg'
      // ) // 首先，获取到纹理
      // const material = new THREE.MeshBasicMaterial({ map: texture }) // 然后创建一个phong材质来处理着色，并传递给纹理映射
      this.mesh = new THREE.Mesh(geometry, material) // 网格模型对象Mesh
      // this.scene.add(this.mesh) // 网格模型添加到场景中
      this.render()
    }
  }

  // 渲染
  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // 动画
  animate(): void {
    if (this.mesh) {
      requestAnimationFrame(this.animate.bind(this))
      this.mesh.rotation.x += 0.01
      this.mesh.rotation.y += 0.01
      this.render()
    }

    let delta = clock.getDelta()
    this.mixer.update(delta)
  }

  control() {
    this.ctl = new OrbitControls((this.camera as any), this.renderer!.domElement)
  }

  loadModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      loader.load('/character.glb', gltf => {
        const model = gltf.scene
        this.model = model
        setModelInfo(model)
        console.log('model', model)
        this.scene!.add(model)
        this.render()
        this.mixer = new THREE.AnimationMixer(this.scene as any)
        resolve(model)
      })
    })
  }

  loadAction(clip) {
    const action = this.mixer.clipAction(clip)
    action.play()
  }

  async test() {
    const res = await fetch('/Talking_BGY_F0/Talking_BGY_F0')
    const reader = new FileReader()
    reader.readAsArrayBuffer(await res.blob())
    reader.onload = async (file) => {
      console.log('thisss', file.target!.result)
      const fileBuffer = new Uint8Array(file.target!.result as any)
      console.log('thissssss', fileBuffer)

      let s = await largeUint8ArrayToString(fileBuffer)
      if (s[0] !== '{') {
        const arraybuffer = await cryptoModule.decryptData(fileBuffer)
        s = await largeUint8ArrayToString(arraybuffer)
      }
      const json = JSON.parse(s)
      console.log('json', json)
      const clip = Convert(json)
      console.log('clip', clip)
      this.loadAction(clip)
    }
  }

  setGui() {
    const gui = new GUI()
    const humanGui = gui.addFolder('Meta Human')
    humanGui.add(this.model!.position, 'x', -10, 10, 0.01)
    humanGui.add(this.model!.position, 'y', -10, 10, 0.01)
    humanGui.add(this.model!.position, 'z', -10, 10, 0.01)
    humanGui.onChange((e) => {
      const value = e.object as any
      if (e.property === 'x') {
        this.model!.position.x = value.x
      } else if (e.property === 'y') {
        this.model!.position.y = value.y
      } else if (e.property === 'z') {
        this.model!.position.z = value.z
      }
    })

    const cameraGui = gui.addFolder('Camera ')
    cameraGui.add(this.camera!.position, 'x', -100, 100, 0.01)
    cameraGui.add(this.camera!.position, 'y', -100, 100, 0.01)
    cameraGui.add(this.camera!.position, 'z', -100, 100, 0.01)
    cameraGui.add(this.camera!, 'near', 0, 10000, 0.1)
    cameraGui.add(this.camera!, 'far', 0, 100000, 0.1)
    cameraGui.add(this.camera!, 'fov', 0, 180, 0.1)
    cameraGui.add(this.camera!, 'aspect', 0, 2, 0.1).onChange(() => {
      this.camera!.updateMatrix()
      this.camera!.updateProjectionMatrix()
    })
    cameraGui.onChange(() => {
      this.camera!.updateMatrix()
      this.camera!.updateProjectionMatrix()
    })

    const cameraRotationGui = gui.addFolder('Camera Rotation Euler')
    cameraRotationGui.add(this.camera!.rotation, 'x', -Math.PI, Math.PI, 0.01)
    cameraRotationGui.add(this.camera!.rotation, 'y', -Math.PI, Math.PI, 0.01)
    cameraRotationGui.add(this.camera!.rotation, 'z', -Math.PI, Math.PI, 0.01)
    cameraRotationGui.onChange(() => {
      this.camera!.updateMatrix()
      this.camera!.updateMatrixWorld()
    })
    // const lookAtGui = gui.addFolder('Camera lookAt')
    // lookAtGui.add(lookTarget, 'x', -10, 10, 0.01)
    // lookAtGui.add(lookTarget, 'y', -10, 10, 0.01)
    // lookAtGui.add(lookTarget, 'z', -10, 10, 0.01)
    // lookAtGui.onChange(() => {
    //   this.camera!.lookAt(lookTarget.x, lookTarget.y, lookTarget.z)
    // })
  }
}

function largeUint8ArrayToString(uint8arr): Promise<string> {
  return new Promise((resolve) => {
    const blob = new Blob([uint8arr])
    const reader = new FileReader()
    reader.onload = function (e) {
      resolve(e.target!.result as string)
    }
    reader.readAsText(blob)
  })
}

// 设置Model信息
function setModelInfo(model) {
  let body = model.getObjectByName('body').children[0] as THREE.Mesh
  if (!body.morphTargetDictionary) {
    body = body.parent!.children[1] as THREE.Mesh
  }
  console.log('ccccccccc', body)
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
