import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from 'three';

export const initControls = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  return controls;
};
