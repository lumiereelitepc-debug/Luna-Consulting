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
    let lastRenderedTime = 0;
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

    // Backlighting from the left forms a waning crescent. Its shadow is made
    // transparent in the lunar material, so the lit texture keeps neutral tones
    // without requiring a CSS blend mode or showing a dark circular disk.
    const sunlight = new THREE.DirectionalLight(0xffffff, 13);
    sunlight.position.set(-5.4, 0.45, -4.6);
    scene.add(sunlight);

    const geometry = new THREE.SphereGeometry(1.72, 128, 96);
    const material = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      roughness: 1,
      metalness: 0,
      transparent: true,
      depthWrite: false,
    });
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <opaque_fragment>',
        `
          // Keep physically lit albedo and crater relief unchanged. Only the
          // unlit hemisphere and its narrow penumbra become transparent.
          float lunarLight = dot(reflectedLight.directDiffuse, vec3(0.2126, 0.7152, 0.0722));
          float lunarAlpha = smoothstep(0.008, 0.065, lunarLight);
          if (lunarAlpha < 0.001) discard;
          diffuseColor.a *= lunarAlpha;
          #include <opaque_fragment>
        `,
      );
    };
    material.customProgramCacheKey = () => 'luna-neutral-crescent-v1';
    const moon = new THREE.Mesh(geometry, material);
    moon.rotation.set(-0.06, -Math.PI / 2, 0.08);
    const tilt = new THREE.Group();
    tilt.add(moon);
    scene.add(tilt);

    // A seeded field keeps the composition stable across visits. These are
    // actual points at different depths, so pointer movement reveals parallax.
    let seed = 4261;
    function random() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    const atmosphere = new THREE.Group();
    const atmosphereResources = [];
    function createStars(count, size, opacity, depth) {
      const positions = new Float32Array(count * 3);
      for (let index = 0; index < count; index += 1) {
        positions[index * 3] = (random() - 0.5) * 9;
        positions[index * 3 + 1] = (random() - 0.5) * 7;
        positions[index * 3 + 2] = -depth - random() * 3;
      }
      const starGeometry = new THREE.BufferGeometry();
      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const starMaterial = new THREE.PointsMaterial({
        color: 0xc8e5ff,
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeometry, starMaterial);
      atmosphere.add(stars);
      atmosphereResources.push(starGeometry, starMaterial);
      return stars;
    }
    const distantStars = createStars(86, 0.027, 0.58, 3.4);
    const nearStars = createStars(28, 0.043, 0.72, 0.8);

    // The small constellation sits beside the lunar silhouette, never around
    // it: its open, angular form avoids suggesting a ring or a full moon.
    const constellationPositions = new Float32Array([
      1.98, 1.74, -2.5, 2.52, 1.23, -2.0,
      2.52, 1.23, -2.0, 2.15, 0.57, -1.8,
      2.15, 0.57, -1.8, 2.77, -0.04, -2.3,
      2.77, -0.04, -2.3, 2.49, -0.85, -2.0,
      -2.90, -0.10, -2.8, -2.43, 0.44, -2.5,
      -2.43, 0.44, -2.5, -2.78, 1.08, -2.8,
    ]);
    const constellationGeometry = new THREE.BufferGeometry();
    constellationGeometry.setAttribute('position', new THREE.BufferAttribute(constellationPositions, 3));
    const constellationMaterial = new THREE.LineBasicMaterial({
      color: 0xb3d7f3,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
    const constellation = new THREE.LineSegments(constellationGeometry, constellationMaterial);
    const constellationNodesMaterial = new THREE.PointsMaterial({
      color: 0xe1f1ff,
      size: 0.045,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    const constellationNodes = new THREE.Points(constellationGeometry, constellationNodesMaterial);
    atmosphere.add(constellation, constellationNodes);
    atmosphereResources.push(constellationGeometry, constellationMaterial, constellationNodesMaterial);
    scene.add(atmosphere);

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
      lastRenderedTime = 0;
    }

    function animate(time) {
      frame = null;
      if (!canRender() || reducedMotion) return;
      // Capping GPU work at 30 fps keeps the decorative scene inexpensive,
      // including on 120 Hz displays, while the easing stays time-based.
      if (time - lastRenderedTime < 1000 / 30 - 0.75) {
        frame = requestAnimationFrame(animate);
        return;
      }
      lastRenderedTime = time;
      const delta = Math.min((time - previousTime) / 1000, 0.067);
      previousTime = time;
      elapsed += delta;
      const easing = 1 - Math.exp(-delta * 3.2);
      pointerX += (targetX - pointerX) * easing;
      pointerY += (targetY - pointerY) * easing;
      tilt.rotation.set(
        pointerY + Math.sin(elapsed * 0.37) * 0.024,
        pointerX + Math.sin(elapsed * 0.29) * 0.035,
        Math.sin(elapsed * 0.32) * 0.018,
      );
      tilt.position.set(
        Math.sin(elapsed * 0.31) * 0.034 + pointerX * 0.28,
        Math.sin(elapsed * 0.57) * 0.10 - pointerY * 0.30,
        0,
      );
      moon.rotation.y = -Math.PI / 2 + elapsed * 0.016;
      atmosphere.rotation.set(-pointerY * 0.18, -pointerX * 0.24, Math.sin(elapsed * 0.14) * 0.012);
      distantStars.position.y = Math.sin(elapsed * 0.14) * 0.07;
      nearStars.position.y = Math.sin(elapsed * 0.24) * 0.11;
      nearStars.position.x = Math.cos(elapsed * 0.20) * 0.06;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!canRender() || reducedMotion || frame !== null) return;
      previousTime = performance.now();
      lastRenderedTime = 0;
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
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.20;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.12;
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
      else {
        targetX = 0;
        targetY = 0;
        pointerX = 0;
        pointerY = 0;
        tilt.rotation.set(0, 0, 0);
        tilt.position.set(0, 0, 0);
        atmosphere.rotation.set(0, 0, 0);
        renderStill();
      }
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
      atmosphereResources.forEach((resource) => resource.dispose());
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
