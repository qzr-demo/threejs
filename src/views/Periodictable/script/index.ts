import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import table from './table'


class ThreeBase {
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
    document.getElementById('container')?.appendChild(this.renderer.domElement)
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.z = 3000
  }

  private initScene() {
    this.scene = new THREE.Scene()
  }

  private initControls() {
    this.controls = new TrackballControls(this.camera!, this.renderer!.domElement)
    this.controls.minDistance = 500
    this.controls.maxDistance = 6000
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

    TWEEN.update()
  }
}

export default class Periodictable extends ThreeBase {
  objects: any = []
  targets: any = {
    table: [],
    sphere: [],
    helix: [],
    grid: []
  }

  constructor() {
    super()

    this.createDom()
    this.create3D()

    this.transTable()
  }

  private createDom() {
    for (let i = 0; i < table.length; i += 5) {
      const element = document.createElement('div')
      element.className = 'element'
      element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')'

      const number = document.createElement('div')
      number.className = 'number'
      number.textContent = String((i / 5) + 1)
      element.appendChild(number)

      const symbol = document.createElement('div')
      symbol.className = 'symbol'
      symbol.textContent = String(table[i])
      element.appendChild(symbol)

      const details = document.createElement('div')
      details.className = 'details'
      details.innerHTML = table[i + 1] + '<br>' + table[i + 2]
      element.appendChild(details)

      const objectCSS = new CSS3DObject(element)
      objectCSS.position.x = Math.random() * 4000 - 2000
      objectCSS.position.y = Math.random() * 4000 - 2000
      objectCSS.position.z = Math.random() * 4000 - 2000

      this.scene!.add(objectCSS)
      this.objects.push(objectCSS)
    }
  }

  private create3D() {
    this.createTable()
    this.createSphere()
    this.createHelix()
    this.createGrid()
  }

  private createTable() {
    for (let i = 0; i < table.length; i += 5) {
      // table
      const object = new THREE.Object3D()
      object.position.x = (Number(table[i + 3]) * 180) - 1330
      object.position.y = -(Number(table[i + 4]) * 180) + 990
      this.targets.table.push(object)
    }
  }

  private createSphere() {
    const vector = new THREE.Vector3()
    for (let i = 0, l = this.objects.length; i < l; i++) {
      const phi = Math.acos(-1 + (2 * i) / l)
      const theta = Math.sqrt(l * Math.PI) * phi
      const object = new THREE.Object3D()

      object.position.setFromSphericalCoords(800, phi, theta)
      vector.copy(object.position).multiplyScalar(2)
      object.lookAt(vector)
      this.targets.sphere.push(object)
    }
  }

  private createHelix() {
    const vector = new THREE.Vector3()

    for (let i = 0, l = this.objects.length; i < l; i++) {
      const theta = i * 0.175 + Math.PI
      const y = -(i * 8) + 450
      const object = new THREE.Object3D()

      object.position.setFromCylindricalCoords(900, theta, y)

      vector.x = object.position.x * 2
      vector.y = object.position.y
      vector.z = object.position.z * 2

      object.lookAt(vector)

      this.targets.helix.push(object)
    }
  }

  private createGrid() {
    for (let i = 0; i < this.objects.length; i++) {
      const object = new THREE.Object3D()

      object.position.x = ((i % 5) * 400) - 800
      object.position.y = (-(Math.floor(i / 5) % 5) * 400) + 800
      object.position.z = (Math.floor(i / 25)) * 1000 - 2000

      this.targets.grid.push(object)
    }
  }

  private transform(targets, duration) {
    TWEEN.removeAll()

    for (let i = 0; i < this.objects.length; i++) {

      const object = this.objects[i]
      const target = targets[i]

      new TWEEN.Tween(object.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()

      new TWEEN.Tween(object.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()

    }
  }

  public transTable() {
    this.transform(this.targets.table, 2000)
  }

  public transSphere() {
    this.transform(this.targets.sphere, 2000)
  }

  public transHelix() {
    this.transform(this.targets.helix, 2000)
  }

  public transGrid() {
    this.transform(this.targets.grid, 2000)
  }
}
