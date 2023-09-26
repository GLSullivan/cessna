import React, { useEffect, useRef, useState } from "react";

import * as THREE                             from "three";
import TWEEN                                  from "@tweenjs/tween.js";

import { GLTFLoader }                         from "three/examples/jsm/loaders/GLTFLoader";

import { initLighting }                       from "./three-utils/initLighting";
import { initControls }                       from "./three-utils/initControls";
import { initScene }                          from "./three-utils/initScene";

import { EffectComposer }                     from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass }                        from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass }                         from 'three/examples/jsm/postprocessing/RenderPass';

import { objectInfoMap }                      from './../data/objectInfoMap'

const Cessna: React.FC = () => {

  const airplaneRef                                 = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
                
  const propRef                                     = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const leftFlapRef                                 = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const rightFlapRef                                = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const elevatorLeftRef                             = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const elevatorRightRef                            = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const aileronLeftRef                              = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const aileronRightRef                             = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const rudderRef                                   = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
  const strutRef                                    = useRef<THREE.Object3D<THREE.Object3DEventMap> | undefined>(undefined);
                
  const speedRef                                    = useRef(0.5);
  const bobIntensityRef                             = useRef(10);
  const flapAngleRef                                = useRef(0);
  const elevatorAngleRef                            = useRef(0);
  const aileronLeftAngleRef                         = useRef(0);
  const aileronRightAngleRef                        = useRef(0);
  const rudderAngleRef                              = useRef(0);
  const bobTimeRef                                  = useRef(0);
  const flapRefs                                    = useRef<{ leftFlapRef?: THREE.Object3D<THREE.Object3DEventMap>, 
                                                          rightFlapRef?: THREE.Object3D<THREE.Object3DEventMap> }>({});
                                                  
  const [activeFlapButton, setActiveFlapButton]     = useState<number>(0);
  const [activeSpeedButton, setActiveSpeedButton]   = useState<number>(.25);
  const [activeBobButton, setActiveBobButton]       = useState<number>(10);
    
  const currentElevatorTween                        = useRef<any | null>(null);
  const currentRudderTween                          = useRef<any | null>(null);
  const currentLeftAileronTween                     = useRef<any | null>(null);
  const currentRightAileronTween                    = useRef<any | null>(null);
  const currentBobTween                             = useRef<any | null>(null);
  const currentTween                                = useRef<any | null>(null);
  const currentFlapTween                            = useRef<any | null>(null);
  const currentHorizontalOffsetTween                = useRef<any | null>(null);
                  
  const outlinePassRef                              = useRef<OutlinePass | null>(null);

  const [popupInfo, setPopupInfo]                   = useState<{ headline: string, paragraph: string, image?: string } | null>(null);
  const [pressedVirtualKeys, setPressedVirtualKeys] = useState<Set<string>>(new Set());

  const materialMap: { [key: string]: THREE.ShaderMaterial } = {};


  // ================================================
  // Interactions
  // ================================================
  
  // ================================================
  // Flaps Control
  // ================================================

  const handleFlapRotation = (newAngle: number) => {
    setActiveFlapButton(newAngle);

    if (currentFlapTween.current) {
      currentFlapTween.current.stop();
    }

    const angleObj = { value: flapAngleRef.current };

    const tween = new TWEEN.Tween(angleObj)
      .to({ value: newAngle }, 2000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        flapAngleRef.current = angleObj.value;

        if (flapRefs.current.leftFlapRef && flapRefs.current.rightFlapRef) {
          flapRefs.current.leftFlapRef.rotation.x = THREE.MathUtils.degToRad(
            flapAngleRef.current
          );
          flapRefs.current.rightFlapRef.rotation.x = THREE.MathUtils.degToRad(
            flapAngleRef.current
          );
        }
      })
      .start();

    currentFlapTween.current = tween;
  };
  
  // ================================================
  // Prop Speed Control
  // ================================================

  const handleSpeedChange = (newSpeed: number) => {
    setActiveSpeedButton(newSpeed);

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
  
  // ================================================
  // Turbulence Control
  // ================================================

  const handleBobIntensityChange = (newIntensity: number) => {
    setActiveBobButton(newIntensity);

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
  
  // ================================================
  // Elevator Control
  // ================================================

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
        if (elevatorLeftRef.current && elevatorRightRef.current) {
          elevatorLeftRef.current.rotation.x = THREE.MathUtils.degToRad(
            elevatorAngleRef.current
          );
          elevatorRightRef.current.rotation.x = THREE.MathUtils.degToRad(
            elevatorAngleRef.current
          );
        }
      })
      .start();

    currentElevatorTween.current = tween;
  };
  
  // ================================================
  // Aileron Control
  // ================================================

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
    const angleLeftObj = { value: aileronLeftAngleRef.current };

    const localAxis = new THREE.Vector3(1, 0, 0); // Local x-axis

    const tweenLeft = new TWEEN.Tween(angleLeftObj)
      .to({ value: newAngle }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        const oldAngle = aileronLeftAngleRef.current;
        aileronLeftAngleRef.current = angleLeftObj.value;
        if (aileronLeftRef.current) {
          const deltaAngle = angleLeftObj.value - oldAngle;
          aileronLeftRef.current.rotateOnAxis(
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
        const oldAngle = aileronRightAngleRef.current;
        aileronRightAngleRef.current = angleRightObj.value;
        if (aileronRightRef.current) {
          const deltaAngle = angleRightObj.value - oldAngle;
          aileronRightRef.current.rotateOnAxis(
            localAxis,
            THREE.MathUtils.degToRad(deltaAngle)
          );
        }
      })
      .start();

    currentRightAileronTween.current = tweenRight;
    currentLeftAileronTween.current = tweenLeft;
  };

  // ================================================
  // Rudder Control
  // ================================================

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
        if (rudderRef.current) {
          rudderRef.current.rotation.y = THREE.MathUtils.degToRad(rudderAngleRef.current);
        }
        if (strutRef.current) {
          strutRef.current.rotation.z = THREE.MathUtils.degToRad(rudderAngleRef.current);
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
    let aileronRotation = 0;
    let rudderRotation = 0;

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

    setPressedVirtualKeys(new Set(pressedKeys));

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

    setPressedVirtualKeys(new Set(pressedKeys));

  };

  const handleVirtualKeyPress = (key: string) => {
    pressedKeys.add(key);
    handleKeyPress({ code: key } as KeyboardEvent);
  };
  
  const handleVirtualKeyUp = (key: string) => {
    pressedKeys.delete(key);
    handleKeyUp({ code: key } as KeyboardEvent);
  };
  

  // ================================================
  // Materials
  // ================================================

  const pulsingMaterial = (initialColor: THREE.Color) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        lightTime: { value: 0 },
        baseColor: { value: new THREE.Color(initialColor) },
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
      `,
    });
  };

  // ================================================
  // Basic Setup
  // ================================================

  useEffect(() => {
    const scene = new THREE.Scene();

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

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    composer.addPass(outlinePass);

    outlinePass.edgeStrength = 5.0;
    outlinePass.edgeGlow = 2;
    outlinePass.edgeThickness = 4.0;
    outlinePass.pulsePeriod = 4;
    outlinePass.visibleEdgeColor.set("#ffffff");
    outlinePass.hiddenEdgeColor.set("#190a05");

    // ================================================
    // Loading the Backing Image
    // ================================================

    const textureLoader = new THREE.TextureLoader();
    const skyTexture    = textureLoader.load(
      `${process.env.PUBLIC_URL}/media/images/backing1@2x.jpg`,
      undefined,  
      (error: unknown) => {
        console.error("Failed to load the backing image:", error);
      }
    );

    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
    });

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
      },
      undefined,  
      (error: unknown) => {
        console.error("Failed to load the cube texture:", error);
      }
    );

    // ================================================
    // Loading the Cessna
    // ================================================

    const planeLoader = new GLTFLoader();
    planeLoader.load(
      `${process.env.PUBLIC_URL}/media/models/Cessna172.glb`,
      (gltf) => {
        airplaneRef.current = gltf.scene;

        propRef.current          = airplaneRef.current.getObjectByName("Prop");
        leftFlapRef.current      = airplaneRef.current.getObjectByName("FlapsLeft");
        rightFlapRef.current     = airplaneRef.current.getObjectByName("FlapsRight");
        elevatorLeftRef.current  = airplaneRef.current.getObjectByName("ElevatorLeft");
        elevatorRightRef.current = airplaneRef.current.getObjectByName("ElevatorRight");
        aileronLeftRef.current   = airplaneRef.current.getObjectByName("AileronLeft");
        aileronRightRef.current  = airplaneRef.current.getObjectByName("AileronRight");
        rudderRef.current        = airplaneRef.current.getObjectByName("Rudder");
        strutRef.current         = airplaneRef.current.getObjectByName("StrutFront");

        flapRefs.current.leftFlapRef  = airplaneRef.current.getObjectByName("FlapsLeft");
        flapRefs.current.rightFlapRef = airplaneRef.current.getObjectByName("FlapsRight");

        airplaneRef.current.position.set(0, 0, 0);
        if (airplaneRef.current) {
          airplaneRef.current.traverse((child: THREE.Object3D) => {

            if (child instanceof THREE.Mesh && child.material) {
              child.material.envMap = cubeTexture;
              child.material.needsUpdate = true;

              if (
                child.material.name === "Beacon" ||
                child.material.name === "NavRed" ||
                child.material.name === "NavGreen"
              ) {
                const shaderMat = pulsingMaterial(child.material.color);
                shaderMat.name = child.material.name; 
                child.material = shaderMat;
                materialMap[shaderMat.name] = shaderMat;
              }
            }
          });
        }

        scene.add(airplaneRef.current);
      },
      undefined,
      (error: any) => {
        console.error("Failed to load the GLTF model:", error.message);
      }
    );

    // ================================================
    // Scene Interactions
    // ================================================

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const displayInfoPopup = (name: string) => {
      const [baseName] = name.split('_');
      const normalizedBaseName = baseName.replace(/Left|Right/, '');
      const capitalizedBaseName = normalizedBaseName.charAt(0).toUpperCase() + normalizedBaseName.slice(1).toLowerCase();
      
      const info = objectInfoMap[capitalizedBaseName];
      console.log("Looking for:", capitalizedBaseName);
      console.log("Found:", info);
    
      if (info) {
        const { h1, paragraph, image } = info;
        setPopupInfo({ headline: h1, paragraph, image }); 
      }
    };

    const handleObjectSelection = (
      selectedObject: THREE.Object3D<THREE.Object3DEventMap>
    ) => {    
      let selectedObjects = [selectedObject];
      if (airplaneRef.current) {
        if (/Left/i.test(selectedObject.name)) {
          const counterpartName = selectedObject.name.replace(/Left/i, "Right");
          const counterpart = airplaneRef.current.getObjectByName(counterpartName);
          if (counterpart) selectedObjects.push(counterpart);
        } else if (/Right/i.test(selectedObject.name)) {
          const counterpartName = selectedObject.name.replace(/Right/i, "Left");
          const counterpart = airplaneRef.current.getObjectByName(counterpartName);
          if (counterpart) selectedObjects.push(counterpart);
        }
      }

      displayInfoPopup(selectedObject.name); 

      const tweenParams = { edgeStrength: 0.0 };

      const tween = new TWEEN.Tween(tweenParams)
        .to({ edgeStrength: 3.0 }, 1000) 
        .easing(TWEEN.Easing.Quadratic.Out) 
        .onUpdate(() => {
          outlinePass.edgeStrength = tweenParams.edgeStrength;
        })

      tween.start();

      outlinePass.selectedObjects = selectedObjects;
    };

    outlinePassRef.current = outlinePass;
    
    const onMouseClick = (event: { preventDefault: () => void; clientX: number; clientY: number; }) => {

      event.preventDefault();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(
        [
          propRef.current,
          leftFlapRef.current,
          rightFlapRef.current,
          elevatorLeftRef.current,
          elevatorRightRef.current,
          aileronLeftRef.current,
          aileronRightRef.current,
          rudderRef.current,
        ].filter(Boolean) as THREE.Object3D[]
      );

      if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        handleObjectSelection(selectedObject);
      } else {
        clearSelection();
      }
    };

    window.addEventListener("click", onMouseClick);

    // ================================================
    // Animation Loop
    // ================================================
    const controls = initControls(camera, renderer);

    const animate = () => {
      requestAnimationFrame(animate);
      TWEEN.update();

      controls.update();

      bobTimeRef.current += 0.01;

      Object.keys(materialMap).forEach((key) => {
        materialMap[key].uniforms.lightTime.value += 0.1; 
      });

      if (airplaneRef.current) {
        const damping = 0.01;

        const targetRollAngle = aileronRightAngleRef.current;
        const currentRollAngle = (airplaneRef.current.rotation.z * 180) / Math.PI;
        const newRollAngle =
          currentRollAngle + (targetRollAngle - currentRollAngle) * damping;
        airplaneRef.current.rotation.z = THREE.MathUtils.degToRad(newRollAngle);

        const targetPitchAngle = elevatorAngleRef.current * -1.5;
        const currentPitchAngle = (airplaneRef.current.rotation.x * 180) / Math.PI;
        const newPitchAngle =
          currentPitchAngle + (targetPitchAngle - currentPitchAngle) * damping;
        airplaneRef.current.rotation.x = THREE.MathUtils.degToRad(newPitchAngle);

        const targetYawAngle = rudderAngleRef.current * -1;
        const currentYawAngle = (airplaneRef.current.rotation.y * 180) / Math.PI;
        const newYawAngle =
          currentYawAngle + (targetYawAngle - currentYawAngle) * damping;
        airplaneRef.current.rotation.y = THREE.MathUtils.degToRad(newYawAngle);

        airplaneRef.current.position.y =
          Math.sin(bobTimeRef.current) * 0.1 * bobIntensityRef.current -
          newPitchAngle * 0.1;
        airplaneRef.current.position.x =
          Math.cos(bobTimeRef.current) * 0.1 * bobIntensityRef.current -
          newRollAngle * 0.5;

        camera.lookAt(airplaneRef.current.position);
      }

      if (propRef.current) {
        propRef.current.rotation.z += speedRef.current;
      }

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line
  }, []);

  const clearSelection = () => {
    if (outlinePassRef.current) {
      outlinePassRef.current.selectedObjects = [];
  
      const tweenParams = { edgeStrength: outlinePassRef.current.edgeStrength };
  
      const reverseTween = new TWEEN.Tween(tweenParams)
        .to({ edgeStrength: 0.0 }, 1000) 
        .easing(TWEEN.Easing.Quadratic.Out) 
        .onUpdate(() => {
          outlinePassRef.current!.edgeStrength = tweenParams.edgeStrength;
        });
  
      reverseTween.start();
    }
    setPopupInfo(null);
  };
  
  return (
    <>
      <div className="controls">
        <div>
          <h1>Engine Speed</h1>
          <div>
            <button className={activeSpeedButton === 0 ? 'active' : ''}    onClick={() => handleSpeedChange(0)}>Idle</button>
            <button className={activeSpeedButton === 0.25 ? 'active' : ''} onClick={() => handleSpeedChange(0.25)}>Half</button>
            <button className={activeSpeedButton === 0.5 ? 'active' : ''}  onClick={() => handleSpeedChange(0.5)}>Full</button>
          </div>
        </div>
        <div>
          <h1>Turbulence</h1>
          <div>
            <button className={activeBobButton === 0 ? 'active' : ''}   onClick={() => handleBobIntensityChange(0)}>None</button>
            <button className={activeBobButton === 10 ? 'active' : ''}  onClick={() => handleBobIntensityChange(10)}>Some</button>
            <button className={activeBobButton === 100 ? 'active' : ''} onClick={() => handleBobIntensityChange(100)}>Oh no!</button>
          </div>
        </div>
        <div>
          <h1>Flaps</h1>
          <div>
            <button className={activeFlapButton === 0 ? 'active' : ''}   onClick={() => handleFlapRotation(0)}>0°</button>
            <button className={activeFlapButton === -10 ? 'active' : ''} onClick={() => handleFlapRotation(-10)}>10°</button>
            <button className={activeFlapButton === -20 ? 'active' : ''} onClick={() => handleFlapRotation(-20)}>20°</button>
            <button className={activeFlapButton === -30 ? 'active' : ''} onClick={() => handleFlapRotation(-30)}>30°</button>
          </div>
        </div>
      </div>

      <div className={`info-popup ${popupInfo ? 'active' : ''}`}>
        {popupInfo ? (
          <div>
            <h2>{popupInfo.headline}</h2>
            <p>{popupInfo.paragraph}</p>
            {popupInfo.image && <img src={popupInfo.image} alt={popupInfo.headline} />}
            <button className = "icon-button" onClick = {clearSelection}>
              <span>Close</span>
            <div><i className="fa-duotone fa-xmark-large"></i></div>
          </button>
        </div>
        ) : null}
      </div>

      <div className="instructions">
        <h1>Key Controls</h1>
        <div>
          <button 
            className={pressedVirtualKeys.has("ArrowLeft") ? "active" : ""}
            onMouseDown={() => handleVirtualKeyPress("ArrowLeft")}
            onMouseUp={() => handleVirtualKeyUp("ArrowLeft")}
          >
            <i className="fa-solid fa-fw fa-caret-left" />
          </button>
          <button 
            className={pressedVirtualKeys.has("ArrowRight") ? "active" : ""}
            onMouseDown={() => handleVirtualKeyPress("ArrowRight")}
            onMouseUp={() => handleVirtualKeyUp("ArrowRight")}
          >
            <i className="fa-solid fa-fw fa-caret-right" />
          </button>
          : Ailerons
        </div>
        <div>
          <button 
            className={pressedVirtualKeys.has("ArrowDown") ? "active" : ""}
            onMouseDown={() => handleVirtualKeyPress("ArrowDown")}
            onMouseUp={() => handleVirtualKeyUp("ArrowDown")}
          >
            <i className="fa-solid fa-fw fa-caret-down" />
          </button>
          <button 
            className={pressedVirtualKeys.has("ArrowUp") ? "active" : ""}
            onMouseDown={() => handleVirtualKeyPress("ArrowUp")}
            onMouseUp={() => handleVirtualKeyUp("ArrowUp")}
          >
            <i className="fa-solid fa-fw fa-caret-up" />
          </button>
          : Elevator
        </div>
        <div>
          <button 
            className={pressedVirtualKeys.has("BracketLeft") ? "active" : ""}
            onMouseDown={() => handleVirtualKeyPress("BracketLeft")}
            onMouseUp={() => handleVirtualKeyUp("BracketLeft")}
          >
            <i className="fa-solid fa-fw fa-bracket-square" />
          </button>
          <button 
            className={pressedVirtualKeys.has("BracketRight") ? "active" : ""}
            onMouseDown={() => handleVirtualKeyPress("BracketRight")}
            onMouseUp={() => handleVirtualKeyUp("BracketRight")}
          >
            <i className="fa-solid fa-fw fa-bracket-square-right" />
          </button>
          : Rudder
        </div>
      </div>
      <div id="scene-holder"></div>
    </>
  );
};

export default Cessna;
