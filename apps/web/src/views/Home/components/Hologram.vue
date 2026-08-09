<template>
  <canvas ref="hologramRef"></canvas>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useTemplateRef, onMounted } from "vue";

const hologramRef = useTemplateRef<HTMLCanvasElement>("hologramRef");

const initThree = () => {
  const scene = new THREE.Scene();
  let mixer: THREE.AnimationMixer | null = null;
  const timer = new THREE.Timer();
  const camera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 1000);
  camera.position.set(0, 0, 10);

  const loader = new GLTFLoader();
  loader.load("/models/hologram/scene.gltf", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(4, 4, 4);
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => {
        const action = mixer!.clipAction(clip);
        action.play();
      });
    }
  });
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  const renderer = new THREE.WebGLRenderer({
    canvas: hologramRef.value!,
    antialias: true,
    alpha: true,
    precision: "highp",
    powerPreference: "high-performance",
  });
  renderer.setSize(500, 250);
  const controls = new OrbitControls(camera, renderer.domElement);
  const animate = (timestamp?: number) => {
    requestAnimationFrame(animate);
    timer.update(timestamp);
    const delta = timer.getDelta();
    if (mixer) mixer.update(delta);
    scene.rotation.y += 0.002;
    controls.update();
    renderer.render(scene, camera);
  };
  animate();
};

onMounted(() => {
  initThree();
});
</script>
