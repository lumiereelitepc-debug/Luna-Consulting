import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A decorative, entirely procedural crystal sculpture. No data or business
// results are represented by the connected shapes.
export default function StrategyScene() {
  const host = useRef(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const node = host.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = preference.matches;
    let disposed = false;
    let visible = true;
    let frame = null;
    let previousFrame = 0;
    let elapsed = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let renderer;
    let environment;
    const geometries = new Set();
    const materials = new Set();
    const geometry = (value) => { geometries.add(value); return value; };
    const material = (value) => { materials.add(value); return value; };
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
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    node.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 30);
    camera.position.set(0, 0.05, 7.2);
    const sculpture = new THREE.Group();
    sculpture.rotation.set(-0.13, -0.2, -0.06);
    scene.add(sculpture);

    // The softbox environment is generated locally and keeps the glass legible
    // without downloading an HDR image or using a post-processing pipeline.
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromScene(room, 0.06);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    const hemisphere = new THREE.HemisphereLight(0xe5f5ff, 0x264867, 0.65);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xf0faff, 2.6);
    key.position.set(-3, 5, 5);
    const blue = new THREE.DirectionalLight(0x6bbdff, 1.6);
    blue.position.set(4, -1, 2);
    const rim = new THREE.DirectionalLight(0xa8e9ff, 2.5);
    rim.position.set(-3, 0, -4);
    scene.add(key, blue, rim);

    const crystal = material(new THREE.MeshPhysicalMaterial({
      color: 0x478abf, metalness: 0.42, roughness: 0.08,
      transmission: 0.24, thickness: 0.75, ior: 1.45,
      clearcoat: 1, clearcoatRoughness: 0.06,
      attenuationColor: new THREE.Color(0x7cb9e3), attenuationDistance: 2.6,
      envMapIntensity: 0.85, flatShading: true,
    }));
    const ice = material(new THREE.MeshPhysicalMaterial({
      color: 0x85bfeb, metalness: 0.4, roughness: 0.07,
      transmission: 0.3, thickness: 0.4, ior: 1.4,
      clearcoat: 1, envMapIntensity: 0.8,
    }));
    const innerMaterial = material(new THREE.MeshStandardMaterial({
      color: 0x377fac, metalness: 0.6, roughness: 0.2,
      emissive: 0x143c60, emissiveIntensity: 0.45, flatShading: true,
    }));
    const edgeMaterial = material(new THREE.LineBasicMaterial({
      color: 0xdbf5ff, transparent: true, opacity: 0.52,
    }));
    const faintEdgeMaterial = material(new THREE.LineBasicMaterial({
      color: 0x7fbae2, transparent: true, opacity: 0.16,
    }));
    const lineMaterial = material(new THREE.LineBasicMaterial({
      color: 0xa8dbf8, transparent: true, opacity: 0.29,
    }));
    const glowMaterial = material(new THREE.MeshBasicMaterial({
      color: 0xe0f7ff, transparent: true, opacity: 0.95,
    }));
    const trailMaterials = [0.3, 0.13, 0.05].map((opacity) => material(new THREE.MeshBasicMaterial({
      color: 0x8bd4ff, transparent: true, opacity, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })));

    const core = new THREE.Group();
    const coreGeometry = geometry(new THREE.IcosahedronGeometry(1.02, 0));
    core.add(new THREE.Mesh(coreGeometry, crystal));
    core.add(new THREE.LineSegments(geometry(new THREE.EdgesGeometry(coreGeometry)), edgeMaterial));
    core.rotation.set(0.3, 0.25, 0.15);
    sculpture.add(core);
    const inner = new THREE.Mesh(geometry(new THREE.OctahedronGeometry(0.56)), innerMaterial);
    core.add(inner);
    const outerFrame = new THREE.LineSegments(
      geometry(new THREE.EdgesGeometry(geometry(new THREE.IcosahedronGeometry(1.22, 0)))), faintEdgeMaterial,
    );
    outerFrame.rotation.set(-0.16, 0.35, 0.2);
    sculpture.add(outerFrame);

    const cubeGeometry = geometry(new THREE.BoxGeometry(0.48, 0.48, 0.48));
    const cubeEdges = geometry(new THREE.EdgesGeometry(cubeGeometry));
    const pulseGeometry = geometry(new THREE.SphereGeometry(0.026, 8, 6));
    const endpointGeometry = geometry(new THREE.SphereGeometry(0.035, 8, 6));
    const points = [
      new THREE.Vector3(-1.85, 0.98, 0.15),
      new THREE.Vector3(1.78, 1.15, -0.4),
      new THREE.Vector3(1.98, -0.64, 0.6),
      new THREE.Vector3(-1.58, -1.14, 0.45),
      new THREE.Vector3(0.28, 1.8, -0.5),
      new THREE.Vector3(0.4, -1.78, -0.4),
    ];
    const satellites = points.map((origin, index) => {
      const group = new THREE.Group();
      group.position.copy(origin);
      group.rotation.set(0.45 + index * 0.23, 0.35 + index * 0.4, 0.2);
      const scale = index > 3 ? 0.65 : 0.9;
      group.scale.setScalar(scale);
      group.add(new THREE.Mesh(cubeGeometry, ice));
      group.add(new THREE.LineSegments(cubeEdges, edgeMaterial));
      sculpture.add(group);
      const lineGeometry = geometry(new THREE.BufferGeometry());
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, origin.x, origin.y, origin.z], 3));
      const connection = new THREE.Line(lineGeometry, lineMaterial);
      sculpture.add(connection);
      const endpoint = new THREE.Mesh(endpointGeometry, glowMaterial);
      endpoint.position.copy(origin);
      sculpture.add(endpoint);
      const pulses = [glowMaterial, ...trailMaterials].map((pulseMaterial, pulseIndex) => {
        const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
        mesh.scale.setScalar(pulseIndex === 0 ? 1 : 1.2 + pulseIndex * 0.2);
        sculpture.add(mesh);
        return mesh;
      });
      return { group, origin, connection, endpoint, pulses };
    });

    // A restrained background constellation adds another depth plane.
    const dustPositions = [];
    for (let i = 0; i < 28; i += 1) {
      const seed = i * 2.399963;
      const radius = 1.7 + ((i * 17) % 13) / 13;
      dustPositions.push(Math.cos(seed) * radius, Math.sin(seed) * radius * 0.84, -1.15 - (i % 4) * 0.17);
    }
    const dustGeometry = geometry(new THREE.BufferGeometry());
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, material(new THREE.PointsMaterial({
      color: 0xb9e5ff, size: 0.025, transparent: true, opacity: 0.48, sizeAttenuation: true,
    })));
    sculpture.add(dust);

    function update(time, delta = 0) {
      const easing = 1 - Math.exp(-delta * 3.8);
      pointerX += (targetX - pointerX) * easing;
      pointerY += (targetY - pointerY) * easing;
      sculpture.rotation.set(-0.13 + pointerY, -0.2 + pointerX, -0.06);
      core.rotation.set(0.3 + time * 0.12, 0.25 + time * 0.23, 0.15 + Math.sin(time * 0.45) * 0.09);
      inner.rotation.set(time * -0.17, time * -0.29, 0.4);
      outerFrame.rotation.y = 0.35 - time * 0.08;
      satellites.forEach(({ group, origin, connection, endpoint, pulses }, index) => {
        group.position.copy(origin);
        group.position.y += Math.sin(time * 0.85 + index * 1.4) * 0.095;
        group.rotation.x = 0.45 + index * 0.23 + time * (index % 2 ? -0.15 : 0.15);
        group.rotation.y = 0.35 + index * 0.4 + time * 0.22;
        const position = connection.geometry.attributes.position;
        position.setXYZ(1, group.position.x, group.position.y, group.position.z);
        position.needsUpdate = true;
        endpoint.position.copy(group.position);
        pulses.forEach((pulse, pulseIndex) => {
          const phase = ((time * 0.27 + index / 6 - pulseIndex * 0.035) % 1 + 1) % 1;
          pulse.position.copy(group.position).multiplyScalar(phase);
        });
      });
      dust.rotation.z = time * -0.014;
    }

    function canRender() { return !disposed && visible && !document.hidden; }
    function renderStill() {
      if (!canRender()) return;
      renderer.render(scene, camera);
      node.dataset.sceneReady = 'true';
    }
    function stop() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousFrame = 0;
    }
    function animate(time) {
      frame = null;
      if (!canRender() || reduced) return;
      if (time - previousFrame >= 1000 / 30) {
        const delta = previousFrame ? Math.min((time - previousFrame) / 1000, 0.07) : 1 / 30;
        previousFrame = time;
        elapsed += delta;
        update(elapsed, delta);
        renderStill();
      }
      frame = requestAnimationFrame(animate);
    }
    function start() {
      if (!canRender() || reduced || frame !== null) return;
      previousFrame = 0;
      frame = requestAnimationFrame(animate);
    }
    function resize() {
      if (disposed) return;
      const { width, height } = node.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Fit the entire constellation on narrow cards as well as wide screens.
      camera.position.z = Math.max(7.1, 6.8 / camera.aspect);
      camera.updateProjectionMatrix();
      renderStill();
    }
    function onPointer(event) {
      if (reduced || event.pointerType === 'touch') return;
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.32;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.22;
    }
    function onPointerLeave() { targetX = 0; targetY = 0; }
    function onVisibilityChange() {
      if (document.hidden) stop();
      else { renderStill(); start(); }
    }
    function onPreferenceChange(event) {
      reduced = event.matches;
      stop();
      if (reduced) {
        targetX = 0; targetY = 0; pointerX = 0; pointerY = 0;
        update(0);
        renderStill();
      } else start();
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
      if (visible) { renderStill(); start(); }
      else stop();
    });
    visibilityObserver.observe(node);
    node.addEventListener('pointermove', onPointer, { passive: true });
    node.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    preference.addEventListener('change', onPreferenceChange);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    update(0);
    resize();
    start();

    function cleanup() {
      if (disposed) return;
      disposed = true;
      stop();
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      node.removeEventListener('pointermove', onPointer);
      node.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      preference.removeEventListener('change', onPreferenceChange);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      delete node.dataset.sceneReady;
      geometries.forEach((value) => value.dispose());
      materials.forEach((value) => value.dispose());
      environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
    return cleanup;
  }, []);

  return <div className="strategy-scene" ref={host} aria-hidden="true">
    {!available && <div className="strategy-fallback"><div className="strategy-fallback-core"><span /><span /><span /></div><i /><i /><i /></div>}
  </div>;
}
