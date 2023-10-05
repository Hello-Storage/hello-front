import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import SplineLoader from "@splinetool/loader";

const ThreeDScene = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // camera
    const camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      -50000,
      10000
    );
    camera.position.set(0, 0, 1000); // move camera back along z-axis
    camera.quaternion.setFromEuler(new THREE.Euler(0, 0, 0));

    // scene
    const scene = new THREE.Scene();

    // spline scene
    const loader = new SplineLoader();
    loader.load(
      "https://prod.spline.design/kb51V9Mnzlry9yRS/scene.splinecode",
      (splineScene) => {
        if (window.innerWidth < 600) {
          // For mobile screens
          splineScene.scale.set(0.4, 0.4, 0.4);
        } else {
          // For larger screens
          splineScene.scale.set(1, 1, 1);
        }
        scene.add(splineScene);
      }
    );

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.125;

    let time = 0;

    function animate() {
      renderer.setAnimationLoop(() => {
        controls.update();

        // rotation
        if (scene) {
          // Increase time
          time += 0.003;

          // Sine function oscillates between -1 and 1, scale it by desired range
          scene.rotation.y = Math.sin(time) * 0.4;
        }

        renderer.render(scene, camera);
      });
    }


    const container = containerRef.current as HTMLElement;
    container.appendChild(renderer.domElement);

    // scene settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    scene.background = null; // remove background
    renderer.setClearAlpha(0);

    function onWindowResize() {
      camera.left = window.innerWidth / -2;
      camera.right = window.innerWidth / 2;
      camera.top = window.innerHeight / 2;
      camera.bottom = window.innerHeight / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Update the scale of the object
      if (scene && scene.children.length > 0) {
        const splineScene = scene.children[0];
        if (window.innerWidth < 600) {
          // For mobile screens
          splineScene.scale.set(0.3, 0.3, 0.3);
        } else {
          // For larger screens
          splineScene.scale.set(0.5, 0.5, 0.5);
        }
      }
    }

    window.addEventListener("resize", onWindowResize);

    animate();
  }, []);

  return <div ref={containerRef} />;
};

export default ThreeDScene;
