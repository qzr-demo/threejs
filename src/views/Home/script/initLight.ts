import * as THREE from 'three'
import Three from './init'

export default function(this:Three) {
  // initAmbientLight.call(this)
  // initSpotLight.call(this)
  initHemisphereLight.call(this)
  // initShadow.call(this)
  // initSpotLightHelper.call(this)
}

function initAmbientLight(this:Three) {  // 背景光
  this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
  this.scene?.add(this.ambientLight)
}

function initHemisphereLight(this:Three) { // 环境光
  this.hesLight = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5)
  // this.hesLight.intensity = 0.3
  this.hesLight.position.set(2, 1, 1)
  this.scene?.add(this.hesLight)
}

