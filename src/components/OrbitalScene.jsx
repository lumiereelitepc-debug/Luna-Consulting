import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function OrbitalScene() {
  const host = useRef(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const node = host.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setAvailable(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    node.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    scene.add(new THREE.AmbientLight(0xccded4, 2));
    const lights = [[0xf5ffe7, 28, -3, 4, 5], [0xb8e382, 22, 4, 1, 3], [0xe5ede7, 14, 0, -3, 3]];
    lights.forEach(([color, intensity, x, y, z]) => {
      const light = new THREE.PointLight(color, intensity, 20, 2);
      light.position.set(x, y, z);
      scene.add(light);
    });
    const sculpture = new THREE.Group();
    sculpture.rotation.set(0.28, -0.5, -0.38);
    scene.add(sculpture);
    const metals = [
      new THREE.MeshStandardMaterial({ color: 0xd1e2be, metalness: 0.65, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x9db598, metalness: 0.75, roughness: 0.24 }),
      new THREE.MeshStandardMaterial({ color: 0xc9e1bc, metalness: 0.5, roughness: 0.25 }),
    ];
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.72 - i * 0.05, 0.12 + i * 0.01, 32, 120), metals[i]);
      ring.rotation.set(i === 0 ? 0.3 : i === 1 ? 1.12 : -0.92, i === 0 ? 0.17 : i === 1 ? 0.65 : -0.73, i * 0.52);
      rings.push(ring);
      sculpture.add(ring);
    }
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.89, 64, 48), new THREE.MeshStandardMaterial({ color: 0xd6e9a7, metalness: 0.28, roughness: 0.33 }));
    sculpture.add(sphere);
    const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 16), metals[0]);
    satellite.position.set(-1.65, 1.3, 0.25);
    sculpture.add(satellite);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.006, 8, 150), new THREE.MeshBasicMaterial({ color: 0xa3b7a1, transparent: true, opacity: 0.26 }));
    orbit.rotation.set(1.0, 0.1, 0.25);
    sculpture.add(orbit);
    let pointer = { x: 0, y: 0 };
    let frame;
    let visible = true;
    const onPointer = (event) => {
      const rect = node.getBoundingClientRect();
      pointer = { x: ((event.clientX - rect.left) / rect.width - 0.5) * 0.26, y: ((event.clientY - rect.top) / rect.height - 0.5) * 0.18 };
    };
    node.addEventListener('pointermove', onPointer);
    const clock = new THREE.Clock();
    const render = () => {
      if (!visible) return;
      const time = clock.getElapsedTime();
      if (!reduced) {
        sculpture.rotation.y += (pointer.x - 0.5 - sculpture.rotation.y) * 0.025;
        sculpture.rotation.x += (pointer.y + 0.28 - sculpture.rotation.x) * 0.025;
        sculpture.rotation.z = -0.38 + Math.sin(time * 0.2) * 0.055;
        sculpture.position.y = Math.sin(time * 0.6) * 0.055;
        rings[1].rotation.z = 0.52 + time * 0.07;
        rings[2].rotation.z = 1.04 - time * 0.045;
      }
      renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(render);
    };
    const resize = () => {
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (reduced) renderer.render(scene, camera);
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(node);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) render();
      if (!visible) cancelAnimationFrame(frame);
    });
    visibilityObserver.observe(node);
    resize();
    render();
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      node.removeEventListener('pointermove', onPointer);
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (object.material) object.material.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="orbital-scene" ref={host} role="img" aria-label="Escultura 3D animada: esfera lunar rodeada de tres órbitas entrelazadas">
    {!available && <div className="orbital-fallback"><div /><span /><i /></div>}
  </div>;
}
