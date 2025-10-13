import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const RocketRaceScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let renderer, scene, camera, rocket, stars, asteroids, pointLight, controls;
    const moveSpeed = 0.2;
    const keys = { w: false, a: false, s: false, d: false };
    const asteroidsArray = [];

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000022, 0.015); // Neon cyberpunk fog
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000022); // Dark neon background
    mountRef.current.appendChild(renderer.domElement);

    // Orbit Controls for mouse
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 15;
    controls.minDistance = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x4040ff, 0.5); // Neon blue ambient
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    pointLight = new THREE.PointLight(0xff00ff, 2, 50); // Neon pink point light
    pointLight.position.set(0, 2, -3);
    scene.add(pointLight);

    // Starfield with neon colors
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starColors = [];
    const starSizes = [];
    for (let i = 0; i < 15000; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 3000,
        (Math.random() - 0.5) * 3000,
        (Math.random() - 0.5) * 3000
      );
      const color = new THREE.Color().setHSL(Math.random(), 0.9, 0.7); // Vibrant neon colors
      starColors.push(color.r, color.g, color.b);
      starSizes.push(Math.random() * 0.2 + 0.05);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Asteroids with neon glow
    const asteroidGeometry = new THREE.IcosahedronGeometry(1, 0);
    for (let i = 0; i < 20; i++) {
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff, // Cyan or pink
        roughness: 0.8,
        metalness: 0.2,
        emissive: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissiveIntensity: 0.3,
      });
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      asteroid.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        -Math.random() * 100 - 10
      );
      asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      asteroid.scale.setScalar(Math.random() * 2 + 1);
      scene.add(asteroid);
      asteroidsArray.push(asteroid);
    }

    // Rocket thruster particles
    const thrusterGeometry = new THREE.BufferGeometry();
    const thrusterVertices = [];
    const thrusterColors = [];
    for (let i = 0; i < 100; i++) {
      thrusterVertices.push(0, 0, 0); // Will be updated in animation
      const color = new THREE.Color().setHSL(0.1, 1, 0.5); // Orange-yellow for flames
      thrusterColors.push(color.r, color.g, color.b);
    }
    thrusterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(thrusterVertices, 3));
    thrusterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(thrusterColors, 3));
    const thrusterMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const thrusters = new THREE.Points(thrusterGeometry, thrusterMaterial);
    scene.add(thrusters);

    // Load Rocket model (using a simple placeholder model)
    const loader = new GLTFLoader();
    let rocketLoaded = false;
    loader.load(
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf',
      (gltf) => {
        rocket = gltf.scene;
        rocket.scale.set(1.5, 1.5, 1.5);
        rocket.position.set(0, 0, 0);
        rocket.rotation.set(0, Math.PI, 0); // Orient correctly
        scene.add(rocket);
        rocketLoaded = true;
        controls.target = rocket.position;
        pointLight.position.set(0, 2, 0); // Follow rocket
      },
      undefined,
      (error) => {
        console.error('Error loading rocket model:', error);
        // Fallback to a simple rocket shape
        const fallbackGeometry = new THREE.ConeGeometry(0.5, 2, 32);
        const fallbackMaterial = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.5,
          roughness: 0.5,
          metalness: 0.8,
        });
        rocket = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        rocket.position.set(0, 0, 0);
        scene.add(rocket);
        rocketLoaded = true;
        controls.target = rocket.position;
      }
    );

    // Camera initial position
    camera.position.set(0, 2, 10);

    // Keyboard controls
    const onKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          keys.w = true;
          break;
        case 'a':
          keys.a = true;
          break;
        case 's':
          keys.s = true;
          break;
        case 'd':
          keys.d = true;
          break;
      }
    };
    const onKeyUp = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          keys.w = false;
          break;
        case 'a':
          keys.a = false;
          break;
        case 's':
          keys.s = false;
          break;
        case 'd':
          keys.d = false;
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (rocket && rocketLoaded) {
        // Move rocket with WASD
        if (keys.w) rocket.position.z -= moveSpeed;
        if (keys.s) rocket.position.z += moveSpeed;
        if (keys.a) rocket.position.x -= moveSpeed;
        if (keys.d) rocket.position.x += moveSpeed;

        // Update thruster particles
        const positions = thrusterGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = rocket.position.x + (Math.random() - 0.5) * 0.2;
          positions[i + 1] = rocket.position.y - 1 + Math.random() * -0.5;
          positions[i + 2] = rocket.position.z + Math.random() * 0.5;
        }
        thrusterGeometry.attributes.position.needsUpdate = true;

        // Update point light position
        pointLight.position.set(rocket.position.x, rocket.position.y + 2, rocket.position.z);

        // Rocket tilt based on movement
        rocket.rotation.z = keys.a ? 0.2 : keys.d ? -0.2 : 0;
        rocket.rotation.x = keys.w ? -0.1 : keys.s ? 0.1 : 0;
      }

      // Animate asteroids
      asteroidsArray.forEach((asteroid) => {
        asteroid.position.z += 0.1; // Move towards player
        asteroid.rotation.x += 0.01;
        asteroid.rotation.y += 0.01;
        if (asteroid.position.z > 10) {
          asteroid.position.z = -100;
          asteroid.position.x = (Math.random() - 0.5) * 50;
          asteroid.position.y = (Math.random() - 0.5) * 50;
        }
        // Simple collision detection
        if (rocket && rocketLoaded) {
          const distance = rocket.position.distanceTo(asteroid.position);
          if (distance < 2) {
            alert('Game Over! Rocket hit an asteroid.');
            // Reset rocket position
            rocket.position.set(0, 0, 0);
            asteroidsArray.forEach((ast) => {
              ast.position.z = -Math.random() * 100 - 10;
            });
          }
        }
      });

      // Rotate stars
      if (stars) stars.rotation.y += 0.0005;

      // Pulse point light
      if (pointLight) pointLight.intensity = 2 + Math.sin(Date.now() * 0.001) * 0.5;

      // Update controls
      if (rocket && rocketLoaded) controls.target = rocket.position;
      controls.update();

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen bg-black" />;
};

const App = () => {
  return (
    <div className="w-full h-screen">
      <RocketRaceScene />
    </div>
  );
};

export default App;