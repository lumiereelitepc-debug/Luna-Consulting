import { useEffect, useId, useRef, useState } from 'react';
import * as THREE from 'three';
import { CRESCENT_OUTLINE, createCrescentGeometry, createStudioEnvironment } from './lunarSculpture';

export default function OrbitalScene() {
  const host = useRef(null);
  const gradientId = useId().replaceAll(':', '');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const node = host.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionPreference.matches;
    let disposed = false;
    let visible = false;
    let hasSize = false;
    let ready = false;
    let frame = null;
    let previousTime = 0;
    let lastRenderedTime = 0;
    let elapsed = 0;
    let targetX = 0;
    let targetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let renderer;
    let geometry;
    let material;
    let environment;
    let sizeObserver;
    let visibilityObserver;
    let moon;
    let scene;
    let camera;
    setAvailable(true);
    delete node.dataset.moonReady;

    function canRender() {
      return !disposed && ready && hasSize && visible && !document.hidden;
    }

    function pose() {
      const time = reducedMotion ? 0 : elapsed;
      moon.rotation.set(.10 + pointerY * .07, -.25 + Math.sin(time * .22) * .08 + pointerX * .10, -.07 + Math.sin(time * .25) * .012);
      moon.position.y = Math.sin(time * .55) * .035;
    }

    function renderStill() {
      if (!canRender()) return;
      pose();
      try {
        renderer.render(scene, camera);
        node.dataset.moonReady = 'true';
      } catch {
        fail();
      }
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
      if (time - lastRenderedTime < 1000 / 30 - .75) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const delta = Math.min(Math.max((time - previousTime) / 1000, 0), .067);
      previousTime = time;
      lastRenderedTime = time;
      elapsed += delta;
      const easing = 1 - Math.exp(-delta * 3.2);
      pointerX += (targetX - pointerX) * easing;
      pointerY += (targetY - pointerY) * easing;
      renderStill();
      if (canRender()) frame = requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!canRender() || reducedMotion || frame !== null) return;
      previousTime = performance.now();
      lastRenderedTime = previousTime;
      frame = requestAnimationFrame(animate);
    }

    function resize() {
      if (disposed || !ready) return;
      const { width, height } = node.getBoundingClientRect();
      hasSize = width > 0 && height > 0;
      if (!hasSize) {
        stopAnimation();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < 1.1 ? 4.85 : 4.45;
      camera.updateProjectionMatrix();
      renderStill();
      startAnimation();
    }

    function onPointer(event) {
      if (reducedMotion || event.pointerType === 'touch') return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      targetY = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
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
      targetX = 0;
      targetY = 0;
      pointerX = 0;
      pointerY = 0;
      // Both motion-preference transitions begin from the same elegant pose.
      elapsed = 0;
      renderStill();
      startAnimation();
    }

    function onContextLost(event) {
      event.preventDefault();
      fail();
    }

    function cleanup() {
      if (disposed) return;
      disposed = true;
      stopAnimation();
      sizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      node.removeEventListener('pointermove', onPointer);
      node.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionPreference.removeEventListener('change', onMotionPreference);
      renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
      delete node.dataset.moonReady;
      scene?.clear();
      geometry?.dispose();
      material?.dispose();
      environment?.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
    }

    function fail() {
      if (disposed) return;
      setAvailable(false);
      cleanup();
    }

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      node.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, 1, .1, 50);
      camera.position.set(0, 0, 4.45);
      try {
        environment = createStudioEnvironment(renderer);
        if (environment) {
          scene.environment = environment.texture;
          scene.environmentIntensity = 1.3;
        }
      } catch {
        // Direct studio lights preserve the form if PMREM is unavailable.
      }
      geometry = createCrescentGeometry();
      material = new THREE.MeshPhysicalMaterial({ color: 0xd9d9d9, metalness: environment ? .72 : .15, roughness: .28, clearcoat: .2, clearcoatRoughness: .2 });
      moon = new THREE.Mesh(geometry, material);
      scene.add(moon);
      const key = new THREE.DirectionalLight(0xffffff, 3.8);
      key.position.set(-3, 5, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 1.4);
      fill.position.set(4, -1, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xffffff, 3.5);
      rim.position.set(1, 3, -3);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0xffffff, .5));
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      sizeObserver = new ResizeObserver(resize);
      visibilityObserver = new IntersectionObserver(([entry]) => {
        if (disposed) return;
        visible = entry.isIntersecting;
        if (!visible) stopAnimation();
        else {
          renderStill();
          startAnimation();
        }
      });
      node.addEventListener('pointermove', onPointer, { passive: true });
      node.addEventListener('pointerleave', onPointerLeave);
      document.addEventListener('visibilitychange', onVisibilityChange);
      motionPreference.addEventListener('change', onMotionPreference);
      ready = true;
      sizeObserver.observe(node);
      visibilityObserver.observe(node);
      resize();
    } catch {
      fail();
    }

    return cleanup;
  }, []);

  return <div className="orbital-scene" ref={host} role="img" aria-label="Luna menguante escultórica de plata satinada en 3D">
    {!available && <div className="orbital-fallback orbital-fallback--sculpture">
      <svg className="orbital-fallback__moon" viewBox="-1.4 -1.3 2.8 2.6" width="100%" height="100%" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2=".7">
            <stop offset="0" stopColor="#f0f0f0" />
            <stop offset=".35" stopColor="#c0c0c0" />
            <stop offset=".65" stopColor="#e1e1e1" />
            <stop offset="1" stopColor="#a5a5a5" />
          </linearGradient>
        </defs>
        <path d={CRESCENT_OUTLINE} fill={`url(#${gradientId})`} transform="rotate(-4)" />
      </svg>
    </div>}
  </div>;
}
