import * as THREE from "three";

export const initScene = (
  renderer: THREE.WebGLRenderer,
  camera  : THREE.PerspectiveCamera,
  scene   : THREE.Scene
) => {
    // ================================================
    // Initial Config
    // ================================================

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("scene-holder")?.appendChild(renderer.domElement);

    // Set camera position
  camera.position.z = -7;
  camera.position.y = 3;
  camera.position.x = 3;

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
  
};
