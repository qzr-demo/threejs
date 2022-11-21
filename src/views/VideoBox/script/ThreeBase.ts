import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

export default class ThreeBase {
  container: HTMLElement = document.querySelector('#videoBoxContainer')!

  scene: THREE.Scene | null = null
  camera: THREE.PerspectiveCamera | null = null
  renderer: CSS3DRenderer | null = null
  controls: TrackballControls | null = null

  constructor() {
    this.init()
  }

  private init() {
    this.initRenderer()
    this.initCamera()
    this.initScene()
    this.initControls()
    this.onWindowResize()

    this.animate()
  }

  private initRenderer() {
    this.renderer = new CSS3DRenderer()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.container.appendChild(this.renderer.domElement)
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.set(500, 350, 750)
  }

  private initScene() {
    this.scene = new THREE.Scene()
  }

  private initControls() {
    this.controls = new TrackballControls(this.camera!, this.renderer!.domElement)
    this.controls.rotateSpeed = 4
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
}
