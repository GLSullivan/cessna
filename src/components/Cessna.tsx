import React, { useEffect, useRef }           from "react";

import * as THREE                             from "three";
import TWEEN                                  from "@tweenjs/tween.js";

import { GLTFLoader }                         from "three/examples/jsm/loaders/GLTFLoader";

import { initScene }                          from "./three-utils/initScene";
import { initLighting }                       from "./three-utils/initLighting";
import { initControls }                       from "./three-utils/initControls";

const Cessna: React.FC = () => {

  let prop          : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let airplane      : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let leftFlap      : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let rightFlap     : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let elevatorLeft  : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let elevatorRight : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let aileronLeft   : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let aileronRight  : THREE.Object3D<THREE.Object3DEventMap> | undefined;
  let rudder        : THREE.Object3D<THREE.Object3DEventMap> | undefined;

  const speedRef             = useRef(0.5);
  const bobIntensityRef      = useRef(10);
  const flapAngleRef         = useRef(0);
  const elevatorAngleRef     = useRef(0);
  const aileronLeftAngleRef  = useRef(0);
  const aileronRightAngleRef = useRef(0);
  const rudderAngleRef       = useRef(0);
    
  const currentElevatorTween         = useRef<any | null>(null);
  const currentRudderTween           = useRef<any | null>(null);
  const currentLeftAileronTween      = useRef<any | null>(null);
  const currentRightAileronTween     = useRef<any | null>(null);
  const currentBobTween              = useRef<any | null>(null);
  const currentTween                 = useRef<any | null>(null);
  const currentFlapTween             = useRef<any | null>(null);
  const currentHorizontalOffsetTween = useRef<any | null>(null);

  const materialMap: { [key: string]: THREE.ShaderMaterial } = {};

  let bobTime:number   = 0;
  let lightTime:number = 0;

    // ================================================
    // Interactions
    // ================================================

  const handleFlapRotation = (newAngle: number) => {
    if (currentFlapTween.current) {
      currentFlapTween.current.stop();
    }

    const angleObj = { value: flapAngleRef.current };

    const tween = new TWEEN.Tween(angleObj)
      .to({ value: newAngle }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        flapAngleRef.current = angleObj.value;
        if (leftFlap && rightFlap) {
          leftFlap.rotation.x  = THREE.MathUtils.degToRad(flapAngleRef.current);
          rightFlap.rotation.x = THREE.MathUtils.degToRad(flapAngleRef.current);
        }
      })
      .start();

    currentFlapTween.current = tween;
  };

  const handleSpeedChange = (newSpeed: number) => {
    if (currentTween.current) {
      currentTween.current.stop();
    }

    const speedObj = { value: speedRef.current };

    const tween = new TWEEN.Tween(speedObj)
      .to({ value: newSpeed }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        speedRef.current = speedObj.value;
      })
      .start();

    currentTween.current = tween;
  };

  const handleBobIntensityChange = (newIntensity: number) => {
    if (currentBobTween.current) {
      currentBobTween.current.stop();
    }

    const bobObj = { value: bobIntensityRef.current };

    const tween = new TWEEN.Tween(bobObj)
      .to({ value: newIntensity }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        bobIntensityRef.current = bobObj.value;
      })
      .start();

    currentBobTween.current = tween;
  };

  const handleElevatorRotation = (newAngle: number) => {
    if (currentElevatorTween.current) {
      currentElevatorTween.current.stop();
    }

    const angleObj = { value: elevatorAngleRef.current };

    const tween = new TWEEN.Tween(angleObj)
      .to({ value: newAngle }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        elevatorAngleRef.current = angleObj.value;
        if (elevatorLeft && elevatorRight) {
          elevatorLeft.rotation.x = THREE.MathUtils.degToRad(
            elevatorAngleRef.current
          );
          elevatorRight.rotation.x = THREE.MathUtils.degToRad(
            elevatorAngleRef.current
          );
        }
      })
      .start();

    currentElevatorTween.current = tween;
  };

  const handleAileronRotation = (newAngle: number) => {
    if (currentLeftAileronTween.current) {
      currentLeftAileronTween.current.stop();
    }

    if (currentRightAileronTween.current) {
      currentRightAileronTween.current.stop();
    }

    if (currentHorizontalOffsetTween.current) {
      currentHorizontalOffsetTween.current.stop();
    }

    const angleRightObj = { value: aileronRightAngleRef.current };
    const angleLeftObj  = { value: aileronLeftAngleRef.current };

    const localAxis = new THREE.Vector3(1, 0, 0);  // Local x-axis

    const tweenLeft = new TWEEN.Tween(angleLeftObj)
      .to({ value: newAngle }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        const oldAngle                    = aileronLeftAngleRef.current;
              aileronLeftAngleRef.current = angleLeftObj.value;
        if (aileronLeft) {
          const deltaAngle = angleLeftObj.value - oldAngle;
          aileronLeft.rotateOnAxis(
            localAxis,
            THREE.MathUtils.degToRad(deltaAngle * -1)
          );
        }
      })
      .start();

    const tweenRight = new TWEEN.Tween(angleRightObj)
      .to({ value: newAngle }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        const oldAngle                     = aileronRightAngleRef.current;
              aileronRightAngleRef.current = angleRightObj.value;
        if (aileronRight) {
          const deltaAngle = angleRightObj.value - oldAngle;
          aileronRight.rotateOnAxis(
            localAxis,
            THREE.MathUtils.degToRad(deltaAngle)
          );
        }
      })
      .start();

    currentRightAileronTween.current = tweenRight;
    currentLeftAileronTween.current  = tweenLeft;
  };

  const handleRudderRotation = (newAngle: number) => {
    if (currentRudderTween.current) {
      currentRudderTween.current.stop();
    }

    const angleObj = { value: rudderAngleRef.current };

    const tween = new TWEEN.Tween(angleObj)
      .to({ value: newAngle }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        rudderAngleRef.current = angleObj.value;
        if (rudder) {
          rudder.rotation.y = THREE.MathUtils.degToRad(rudderAngleRef.current);
        }
      })
      .start();

    currentRudderTween.current = tween;
  };

    // ================================================
    // Inputs
    // ================================================

  const pressedKeys = new Set<string>();

  const handleKeyPress = (event: KeyboardEvent) => {
    pressedKeys.add(event.code);

    let elevatorRotation = 0;
    let aileronRotation  = 0;
    let rudderRotation   = 0;

    if (pressedKeys.has("ArrowUp")) {
      elevatorRotation = -32;
    }
    if (pressedKeys.has("ArrowDown")) {
      elevatorRotation = 25;
    }
    if (pressedKeys.has("ArrowLeft")) {
      aileronRotation = -20;
    }
    if (pressedKeys.has("ArrowRight")) {
      aileronRotation = 20;
    }
    if (pressedKeys.has("BracketLeft")) {
      rudderRotation = -25;
    }
    if (pressedKeys.has("BracketRight")) {
      rudderRotation = 25;
    }

    handleElevatorRotation(elevatorRotation);
    handleAileronRotation(aileronRotation);
    handleRudderRotation(rudderRotation);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    pressedKeys.delete(event.code);

    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      handleElevatorRotation(0);
    }
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      handleAileronRotation(0);
    }
    if (event.code === "BracketLeft" || event.code === "BracketRight") {
      handleRudderRotation(0);
    }
  };

  // ================================================
  // Materials
  // ================================================

  const pulsingMaterial = (initialColor: THREE.Color) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        lightTime: { value: 0 },
        baseColor: { value: new THREE.Color(initialColor) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
      uniform float lightTime;
      uniform vec3 baseColor;
      void main() {
        float intensity = sin(lightTime) * 0.5 + 0.5;
        intensity = intensity * 2.0;
        intensity = clamp(intensity, 0.0, 1.0); 
        gl_FragColor = vec4(baseColor * intensity, 1.0);
      }
      `
    });
  };

  // ================================================
  // Basic Setup
  // ================================================

  useEffect(() => {
    const scene  = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    initScene(renderer, camera, scene);
    initLighting(scene);
    initControls(camera, renderer);
    // initModels(scene);

      // ================================================
      // Loading the Backing Image
      // ================================================

    const textureLoader = new THREE.TextureLoader();
    const skyTexture = textureLoader.load(`${process.env.PUBLIC_URL}/media/images/backing1@2x.jpg`);
    
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
    
    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);
    
      // ================================================
      // Loading the Reflection Map
      // ================================================

    let cubeTexture: THREE.CubeTexture;
    const loader = new THREE.CubeTextureLoader();
    loader.load(
      [
        `${process.env.PUBLIC_URL}/media/images/px.png`,
        `${process.env.PUBLIC_URL}/media/images/nx.png`,
        `${process.env.PUBLIC_URL}/media/images/py.png`,
        `${process.env.PUBLIC_URL}/media/images/ny.png`,
        `${process.env.PUBLIC_URL}/media/images/pz.png`,
        `${process.env.PUBLIC_URL}/media/images/nz.png`,
      ],
      function (texture) {
        cubeTexture = texture;
      }
    );

      // ================================================
      // Loading the Cessna
      // ================================================

    const planeLoader = new GLTFLoader();
    planeLoader.load(
      `${process.env.PUBLIC_URL}/media/models/Cessna172_v002.glb`,
      (gltf) => {
        airplane = gltf.scene;

        prop          = airplane.getObjectByName("Prop");
        leftFlap      = airplane.getObjectByName("FlapsLeft");
        rightFlap     = airplane.getObjectByName("FlapsRight");
        elevatorLeft  = airplane.getObjectByName("ElevatorLeft");
        elevatorRight = airplane.getObjectByName("ElevatorRight");
        aileronLeft   = airplane.getObjectByName("AileronLeft");
        aileronRight  = airplane.getObjectByName("AileronRight");
        rudder        = airplane.getObjectByName("Rudder");

        airplane.position.set(0, 0, 0);

        if (airplane) {
          airplane.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh && child.material) {
              child.material.envMap = cubeTexture;
              child.material.needsUpdate = true;
        
              if (child.material.name === "Beacon" || child.material.name === "NavRed" || child.material.name === "NavGreen") {
                const shaderMat = pulsingMaterial(child.material.color);
                shaderMat.name = child.material.name;  // Preserve the name
                child.material = shaderMat;
                materialMap[shaderMat.name] = shaderMat;  // Use the preserved name
              }
            }
          });
        }
        

        scene.add(airplane);
      }
    );

      // ================================================
      // Animation Loop
      // ================================================
        const controls = initControls(camera, renderer);

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();

      controls.update();

      bobTime += 0.01;
      lightTime += 0.1;

      Object.keys(materialMap).forEach((key) => {
        materialMap[key].uniforms.lightTime.value += 0.1; // Or however you're updating lightTime
      });

      if (airplane) {
        const damping = 0.01;

        const targetRollAngle  = aileronRightAngleRef.current;
        const currentRollAngle = (airplane.rotation.z * 180) / Math.PI;
        const newRollAngle     = currentRollAngle + (targetRollAngle - currentRollAngle) * damping;
        airplane.rotation.z = THREE.MathUtils.degToRad(newRollAngle);

        const targetPitchAngle  = elevatorAngleRef.current * -1.5;
        const currentPitchAngle = (airplane.rotation.x * 180) / Math.PI;
        const newPitchAngle     = currentPitchAngle + (targetPitchAngle - currentPitchAngle) * damping;
        airplane.rotation.x = THREE.MathUtils.degToRad(newPitchAngle);

        const targetYawAngle  = rudderAngleRef.current * -1;
        const currentYawAngle = (airplane.rotation.y * 180) / Math.PI;
        const newYawAngle     = currentYawAngle + (targetYawAngle - currentYawAngle) * damping;
        airplane.rotation.y = THREE.MathUtils.degToRad(newYawAngle);

        airplane.position.y = Math.sin(bobTime) * 0.1 * bobIntensityRef.current - newPitchAngle * 0.1;
        airplane.position.x = Math.cos(bobTime) * 0.1 * bobIntensityRef.current - newRollAngle * 0.5;

        camera.lookAt(airplane.position);
      }

      if (prop) {
        prop.rotation.z += speedRef.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <>
      <div className="controls">
        <div>
          <h1>Engine Speed</h1>
          <div>
            <button onClick={() => handleSpeedChange(0.5)}>Full</button>
            <button onClick={() => handleSpeedChange(0.25)}>Half</button>
            <button onClick={() => handleSpeedChange(0)}>Idle</button>
          </div>
        </div>
        <div>
          <h1>Turbulence</h1>
          <div>
            <button onClick={() => handleBobIntensityChange(0)}>None</button>
            <button onClick={() => handleBobIntensityChange(10)}>Some</button>
            <button onClick={() => handleBobIntensityChange(100)}>
              Oh no!
            </button>
          </div>
        </div>
        <div>
          <h1>Flaps</h1>
          <div>
            <button onClick={() => handleFlapRotation(0)}>0°</button>
            <button onClick={() => handleFlapRotation(-10)}>10°</button>
            <button onClick={() => handleFlapRotation(-20)}>20°</button>
            <button onClick={() => handleFlapRotation(-30)}>30°</button>
          </div>
        </div>
      </div>

      <div className="instructions">
        <div>      
          <span>
            <i className="fa-solid fa-fw fa-caret-left" />
          </span>
          <span>
            <i className="fa-solid fa-fw fa-caret-right" />
          </span>
          : Ailerons
        </div>
        <div>
          <span>
            <i className="fa-solid fa-fw fa-caret-down" />
          </span>
          <span>
            <i className="fa-solid fa-fw fa-caret-up" />
          </span>
          : Elevator
        </div>
        <div>
          <span>
            <i className="fa-solid fa-fw fa-bracket-square" />
          </span>
          <span>
            <i className="fa-solid fa-fw fa-bracket-square-right" />
          </span>
          : Rudder
        </div>
      </div>

      <div id="scene-holder">{/* Three.js scene will be appended here */}</div>
    </>
  );
};

export default Cessna;
