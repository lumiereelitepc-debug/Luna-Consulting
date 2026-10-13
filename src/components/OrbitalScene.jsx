import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import moonAlbedoUrl from '../assets/moon-albedo.jpg?inline';

// Three.js example texture, distributed with the repository's MIT license.
// Pinned source: mrdoob/three.js@22bd108ab13cb0c0d944eae510442484fe4fac14,
// examples/textures/planets/moon_1024.jpg. See THIRD_PARTY_NOTICES.md.

export default function OrbitalScene() {
  const host = useRef(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const node = host.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionPreference.matches;
    let disposed = false;
    let textureReady = false;
    let visible = true;
    let frame = null;
    let previousTime = 0;
    let elapsed = 0;
    let bumpTexture;
    let targetX = 0;
    let targetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let renderer;
    setAvailable(true);
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setAvailable(false);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    node.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 7.1);

    // Backlighting from the left forms a waning crescent. The unlit hemisphere
    // merges with the black backdrop, leaving the illuminated arc in focus.
    const sunlight = new THREE.DirectionalLight(0xffffff, 4.8);
    sunlight.position.set(-5.4, 0.45, -4.6);
    scene.add(sunlight);

    const geometry = new THREE.SphereGeometry(1.72, 128, 96);
    const material = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 1, metalness: 0 });
    const moon = new THREE.Mesh(geometry, material);
    moon.rotation.set(-0.06, -Math.PI / 2, 0.08);
    const tilt = new THREE.Group();
    tilt.add(moon);
    scene.add(tilt);

    const albedoTexture = new THREE.TextureLoader().load(moonAlbedoUrl, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      texture.needsUpdate = true;
      material.map = texture;
      // Albedo supplies subtle visual relief; it is not a lunar elevation map.
      bumpTexture = texture.clone();
      bumpTexture.colorSpace = THREE.NoColorSpace;
      bumpTexture.needsUpdate = true;
      material.bumpMap = bumpTexture;
      material.bumpScale = 0.022;
      material.needsUpdate = true;
      textureReady = true;
      node.dataset.moonReady = 'true';
      renderStill();
      startAnimation();
    }, undefined, () => {
      if (disposed) return;
      setAvailable(false);
      cleanup();
    });

    function canRender() {
      return !disposed && textureReady && visible && !document.hidden;
    }

    function renderStill() {
      if (canRender()) renderer.render(scene, camera);
    }

    function stopAnimation() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = 0;
    }

    function animate(time) {
      frame = null;
      if (!canRender() || reducedMotion) return;
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      elapsed += delta;
      const easing = 1 - Math.exp(-delta * 2.8);
      pointerX += (targetX - pointerX) * easing;
      pointerY += (targetY - pointerY) * easing;
      tilt.rotation.set(pointerY, pointerX, 0);
      // Approximately one turn every 17 minutes: motion stays unobtrusive.
      moon.rotation.y = -Math.PI / 2 + elapsed * 0.006;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!canRender() || reducedMotion || frame !== null) return;
      previousTime = performance.now();
      frame = requestAnimationFrame(animate);
    }

    function resize() {
      if (disposed) return;
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderStill();
    }

    function onPointer(event) {
      if (reducedMotion || event.pointerType === 'touch') return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.07;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.04;
    }

    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
    }

    function onVisibilityChange() {
      if (document.hidden) stopAnimation();
      else {
        renderStill();
        startAnimation();
      }
    }

    function onMotionPreference(event) {
      reducedMotion = event.matches;
      stopAnimation();
      if (!reducedMotion) startAnimation();
      else renderStill();
    }

    function onContextLost(event) {
      event.preventDefault();
      if (disposed) return;
      setAvailable(false);
      cleanup();
    }

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(node);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) stopAnimation();
      else {
        renderStill();
        startAnimation();
      }
    });
    visibilityObserver.observe(node);
    node.addEventListener('pointermove', onPointer, { passive: true });
    node.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionPreference.addEventListener('change', onMotionPreference);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    resize();

    function cleanup() {
      if (disposed) return;
      disposed = true;
      stopAnimation();
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      node.removeEventListener('pointermove', onPointer);
      node.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionPreference.removeEventListener('change', onMotionPreference);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      delete node.dataset.moonReady;
      geometry.dispose();
      material.dispose();
      albedoTexture.dispose();
      bumpTexture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }

    return cleanup;
  }, []);

  return <div className="orbital-scene" ref={host} role="img" aria-label="Luna menguante en 3D, con cráteres y un arco iluminado a la izquierda">
    {!available && <div className="orbital-fallback" />}
  </div>;
}
