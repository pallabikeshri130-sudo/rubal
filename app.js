import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070b1a, 0.035);

const camera = new THREE.PerspectiveCamera(55, 2, 0.1, 100);
camera.position.set(0, 3.5, 8);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 18;
controls.minDistance = 3;

scene.add(new THREE.AmbientLight(0x6f8bcf, 1.1));
const keyLight = new THREE.PointLight(0x76e8ff, 2.2, 40);
keyLight.position.set(5, 6, 4);
scene.add(keyLight);

const core = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x65d9ff, emissive: 0x16374f, metalness: 0.3, roughness: 0.2 })
);
scene.add(core);

const orbit = new THREE.Mesh(
  new THREE.TorusGeometry(2.2, 0.03, 8, 120),
  new THREE.MeshBasicMaterial({ color: 0x6d88ff })
);
orbit.rotation.x = Math.PI / 2;
scene.add(orbit);

const electron = new THREE.Mesh(
  new THREE.SphereGeometry(0.14, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
scene.add(electron);

const labRing = new THREE.Group();
const chemicals = ['HCl', 'H2SO4', 'HNO3', 'CH3COOH', 'NaOH', 'KOH', 'Ca(OH)2', 'NH4OH'];
chemicals.forEach((name, i) => {
  const angle = (i / chemicals.length) * Math.PI * 2;
  const acid = i < 4;
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 1, 20),
    new THREE.MeshStandardMaterial({ color: acid ? 0xff5f7a : 0x59ffa4, emissive: 0x111111 })
  );
  bottle.position.set(Math.cos(angle) * 4.2, 0.55, Math.sin(angle) * 4.2);
  bottle.userData.label = name;
  labRing.add(bottle);
});
scene.add(labRing);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(6.5, 50),
  new THREE.MeshStandardMaterial({ color: 0x0f1b36, metalness: 0.5, roughness: 0.7 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tip = document.createElement('div');
tip.className = 'glass';
tip.style.cssText = 'position:fixed;pointer-events:none;padding:.4rem .6rem;font-size:.8rem;display:none;z-index:5;';
document.body.appendChild(tip);

canvas.addEventListener('pointermove', (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(labRing.children)[0];
  if (hit) {
    tip.style.display = 'block';
    tip.style.left = `${e.clientX + 12}px`;
    tip.style.top = `${e.clientY + 12}px`;
    tip.textContent = hit.object.userData.label;
  } else tip.style.display = 'none';
});

let spin = true;
let speed = 0.7;
document.getElementById('toggleSpin').onclick = () => {
  spin = !spin;
  document.getElementById('toggleSpin').textContent = spin ? 'Pause Spin' : 'Resume Spin';
};
document.getElementById('speed').oninput = (e) => { speed = Number(e.target.value); };

const featurePanel = document.getElementById('featurePanel');
const modelPanel = document.getElementById('modelPanel');
document.getElementById('modeToggle').onclick = (e) => {
  const showModel = !modelPanel.classList.contains('active');
  modelPanel.classList.toggle('active', showModel);
  featurePanel.classList.toggle('active', !showModel);
  e.target.textContent = showModel ? 'Switch to Feature View' : 'Switch to Model View';
};

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

function animate(t) {
  resize();
  const time = t * 0.001;
  if (spin) {
    core.rotation.y += 0.01 * speed;
    labRing.rotation.y += 0.004 * speed;
    orbit.rotation.z += 0.006 * speed;
  }
  electron.position.set(Math.cos(time * 2 * speed) * 2.2, Math.sin(time * 2 * speed) * 0.65, Math.sin(time * 2 * speed) * 2.2);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
