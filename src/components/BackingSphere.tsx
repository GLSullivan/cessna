import * as THREE from "three";
import { useEffect } from "react";

const BackingSphere = (scene: THREE.Scene) => {
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const skyTexture = textureLoader.load(`${process.env.PUBLIC_URL}/media/images/backing1@2x.jpg`);
    
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
    
    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);

    scene.add(skySphere)
  }, []);

  return null;
};

export default BackingSphere;
