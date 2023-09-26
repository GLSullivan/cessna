import * as THREE from "three";

export const initLighting = (scene: THREE.Scene) => {
  
  // ================================================
  // Lighting
  // ================================================

  // Sun
  const sunLight = new THREE.DirectionalLight(0xffeecc, 3);
  sunLight.position.set(0, 25, 100);  // Position the light source
  scene.add(sunLight);

  // Ambient
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);

  // Hemisphere
  const skyColor        = 0xb1e1ff;
  const groundColor     = 0xb97a20;
  const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 0.6);
  scene.add(hemisphereLight);

};
