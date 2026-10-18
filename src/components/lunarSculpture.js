import * as THREE from 'three';

const LONGITUDINAL_SEGMENTS = 256;
const RADIAL_SEGMENTS = 72;

function profile(t) {
  const angle = THREE.MathUtils.degToRad(60 + 240 * t);
  const sine = Math.max(0, Math.sin(Math.PI * t));
  return {
    angle,
    x: .84 * Math.cos(angle),
    y: .95 * Math.sin(angle),
    width: .235 * Math.pow(sine, .77),
    depth: .115 * Math.pow(sine, .7),
  };
}

// A smooth closed surface with every cross-section tapering into the two tips.
export function createCrescentGeometry() {
  const positions = [], indices = [];
  for (let i = 0; i <= LONGITUDINAL_SEGMENTS; i++) {
    const { angle, x, y, width, depth } = profile(i / LONGITUDINAL_SEGMENTS);
    for (let j = 0; j <= RADIAL_SEGMENTS; j++) {
      const phi = j / RADIAL_SEGMENTS * Math.PI * 2;
      const radialOffset = width * Math.cos(phi);
      positions.push(x + radialOffset * Math.cos(angle), y + radialOffset * Math.sin(angle), depth * Math.sin(phi));
    }
  }
  for (let i = 0; i < LONGITUDINAL_SEGMENTS; i++) {
    for (let j = 0; j < RADIAL_SEGMENTS; j++) {
      const a = i * (RADIAL_SEGMENTS + 1) + j;
      const b = a + RADIAL_SEGMENTS + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  return geometry;
}

// Neutral studio panels give silver a soft highlight without remote assets.
export function createStudioEnvironment(renderer) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#f2f2f2');
  sky.addColorStop(.5, '#7a7a7a');
  sky.addColorStop(1, '#acacac');
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const [x, y, width, height, color] of [
    [80, 55, 160, 290, '#ffffff'],
    [580, 70, 85, 320, '#fafafa'],
    [810, 0, 190, 100, '#e8e8e8'],
  ]) {
    context.shadowColor = color;
    context.shadowBlur = 35;
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }
  const source = new THREE.CanvasTexture(canvas);
  source.mapping = THREE.EquirectangularReflectionMapping;
  source.colorSpace = THREE.SRGBColorSpace;
  let generator;
  try {
    generator = new THREE.PMREMGenerator(renderer);
    return generator.fromEquirectangular(source);
  } finally {
    source.dispose();
    generator?.dispose();
  }
}

// The no-WebGL illustration follows the same parametric silhouette.
const outline = [];
for (let i = 0; i <= LONGITUDINAL_SEGMENTS; i++) {
  const p = profile(i / LONGITUDINAL_SEGMENTS);
  outline.push([p.x + p.width * Math.cos(p.angle), p.y + p.width * Math.sin(p.angle)]);
}
for (let i = LONGITUDINAL_SEGMENTS; i >= 0; i--) {
  const p = profile(i / LONGITUDINAL_SEGMENTS);
  outline.push([p.x - p.width * Math.cos(p.angle), p.y - p.width * Math.sin(p.angle)]);
}
const outlineCenterX = (Math.min(...outline.map(point => point[0])) + Math.max(...outline.map(point => point[0]))) / 2;
export const CRESCENT_OUTLINE = outline.map(([x, y], index) => `${index ? 'L' : 'M'}${(x - outlineCenterX).toFixed(5)},${(-y).toFixed(5)}`).join(' ') + 'Z';
