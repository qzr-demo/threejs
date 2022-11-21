import * as THREE from 'three'
import ThreeBase from './ThreeBase'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

let index = 0

export default class VideoBox extends ThreeBase {
  constructor() {
    super()
    this.create()
  }

  private create() {
    const group = new THREE.Group()
    group.add(this.Element('SJOz3qjfQXU', 0, 0, 240, 0))
    group.add(this.Element('Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2))
    group.add(this.Element('IrydklNpcFI', 0, 0, -240, Math.PI))
    group.add(this.Element('9ubytEsCaS0', -240, 0, 0, -Math.PI / 2))
    this.scene!.add(group)
  }

  private Element(id, x, y, z, ry) {
    const div = document.createElement('div')
    div.style.width = '480px'
    div.style.height = '360px'
    div.style.backgroundColor = '#000'

    // const video = document.createElement('video')
    // video.style.width = '480px'
    // video.style.height = '360px'
    // video.style.border = '0px'
    // video.src = '/Beyond - 大地.mp4'
    // video.controls = true
    // div.appendChild(video)

    // const iframe = document.createElement('iframe')
    // iframe.style.width = '480px'
    // iframe.style.height = '360px'
    // iframe.style.border = '0px'
    // iframe.src = ['https://www.youtube.com/embed/', id, '?rel=0'].join('')
    // div.appendChild(iframe)

    const object = new CSS3DObject(document.querySelectorAll('.video')![index] as any)
    object.position.set(x, y, z)
    object.rotation.y = ry

    index++
    return object
  }
}
