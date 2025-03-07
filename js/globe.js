import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const vertex = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float u_time;
  uniform float u_maxExtrusion;

  void main() {

    vec3 newPosition = position;
    if(u_maxExtrusion > 1.0) newPosition.xyz = newPosition.xyz * u_maxExtrusion + sin(u_time);
    else newPosition.xyz = newPosition.xyz * u_maxExtrusion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

  }
`;
const fragment = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float u_time;

  vec3 colorA = vec3(0.086, 0.631, 0.286); // Green color for FlowSync
  vec3 colorB = vec3(0.092, 0.384, 0.198); // Darker green

  void main() {

    vec3  color = vec3(0.0);
    float pct   = abs(sin(u_time));
          color = mix(colorA, colorB, pct);

    gl_FragColor = vec4(color, 1.0);

  }
`;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing globe...');
  initGlobe();
});

// Globe variables
let container, canvas, sizes, scene, camera, renderer, controls;
let baseSphere, clock, uniforms;
let mouse, raycaster, isMouseDown, mouseDownPosition, targetRotation, targetRotationOnMouseDown;

// Initialize the globe
function initGlobe() {
  console.log('Initializing globe...');
  
  // Get DOM elements
  container = document.querySelector('.globe-container');
  canvas = document.querySelector('.globe-canvas');
  
  console.log('Container element:', container);
  console.log('Canvas element:', canvas);
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  
  // Set up sizes
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // Create scene
  scene = new THREE.Scene();
  
  // Create camera
  camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);
  camera.position.set(0, 0, 5);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Create clock for animations
  clock = new THREE.Clock();
  
  // Set up mouse variables
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  isMouseDown = false;
  mouseDownPosition = { x: 0, y: 0 };
  targetRotation = { x: 0, y: 0 };
  targetRotationOnMouseDown = { x: 0, y: 0 };
  
  try {
    // Set up scene elements
    setupLights();
    setupControls();
    createBaseSphere();
    createEarthDots();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    
    // Start animation loop
    animate();
    
    console.log('Globe initialized successfully!');
  } catch (error) {
    console.error('Error initializing globe:', error);
  }
}

// Set up lights
function setupLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(2, 3, 4);
  scene.add(pointLight);
}

// Set up controls
function setupControls() {
  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.minPolarAngle = Math.PI / 2 - 0.5; // Limit to show mostly northern hemisphere
  controls.maxPolarAngle = Math.PI / 2 - 0.1;
}

// Create base sphere
function createBaseSphere() {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.8
  });
  baseSphere = new THREE.Mesh(geometry, material);
  scene.add(baseSphere);
}

// Create earth dots
function createEarthDots() {
  console.log('Creating Earth dots...');
  
  const dotGroup = new THREE.Group();
  scene.add(dotGroup);
  
  // Load world map image
  const image = new Image();
  image.crossOrigin = "Anonymous";
  image.src = './img/world_alpha_mini.jpg';
  console.log('Loading image from:', image.src);
  
  image.onload = () => {
    console.log('Image loaded successfully!', image.width, 'x', image.height);
    processImageData(image, dotGroup);
  };
  
  image.onerror = (error) => {
    console.error('Error loading image:', error);
  };
}

// Process image data to create dots
function processImageData(image, dotGroup) {
  // Create canvas to read image data
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  console.log('Processing image data...', canvas.width, 'x', canvas.height);
  
  // Parameters
  const dotDensity = 2.5;
  const dotSize = 0.015;
  const highlightDotSize = 0.03;
  
  // Highlight positions (major cities)
  const highlightPositions = [
    { lat: 40.7128, lng: -74.0060 }, // New York
    { lat: 51.5074, lng: -0.1278 },  // London
    { lat: 35.6762, lng: 139.6503 }, // Tokyo
    { lat: -33.8688, lng: 151.2093 },// Sydney
    { lat: 37.7749, lng: -122.4194 },// San Francisco
    { lat: 1.3521, lng: 103.8198 },  // Singapore
    { lat: 55.7558, lng: 37.6173 },  // Moscow
    { lat: -23.5505, lng: -46.6333 },// São Paulo
    { lat: 19.4326, lng: -99.1332 }, // Mexico City
    { lat: 28.6139, lng: 77.2090 }   // New Delhi
  ];
  
  // Create dots
  let dotsCreated = 0;
  
  for (let lat = -90; lat <= 90; lat += dotDensity) {
    for (let lon = -180; lon <= 180; lon += dotDensity) {
      // Convert lat/lon to image coordinates
      const x = Math.floor((lon + 180) / 360 * canvas.width);
      const y = Math.floor((90 - lat) / 180 * canvas.height);
      const i = (y * canvas.width + x) * 4;
      
      // Check if this point is land (not transparent/black in the image)
      const intensity = data[i] / 255;
      
      if (intensity > 0.5) {
        // Convert lat/lon to 3D position
        const latRad = lat * Math.PI / 180;
        const lonRad = lon * Math.PI / 180;
        const position = calcPosFromLatLonRad(lonRad, latRad);
        
        // Check if this is a highlight position
        let isHighlight = false;
        for (const highlight of highlightPositions) {
          const hlLat = highlight.lat;
          const hlLng = highlight.lng;
          const distance = Math.sqrt(
            Math.pow(lat - hlLat, 2) + 
            Math.pow(lon - hlLng, 2)
          );
          if (distance < 3) {
            isHighlight = true;
            break;
          }
        }
        
        // Create dot
        const size = isHighlight ? highlightDotSize : dotSize;
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x16A34A),
          transparent: true,
          opacity: 0.8
        });
        
        const dot = new THREE.Mesh(geometry, material);
        dot.position.copy(position);
        dotGroup.add(dot);
        dotsCreated++;
        
        // Add glow for highlight dots
        if (isHighlight) {
          const glowGeometry = new THREE.SphereGeometry(size * 2, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x16A34A),
            transparent: true,
            opacity: 0.3
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.copy(position);
          dotGroup.add(glow);
        }
      }
    }
  }
  
  console.log(`Created ${dotsCreated} dots on the globe.`);
  
  // Set initial rotation to show the northern hemisphere
  baseSphere.rotation.x = -0.5;
  dotGroup.rotation.x = -0.5;
}

// Calculate position from latitude and longitude
function calcPosFromLatLonRad(lon, lat) {
  const phi = Math.PI / 2 - lat;
  const theta = Math.PI + lon;
  const radius = 1;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// Handle window resize
function onWindowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Handle mouse move
function onMouseMove(event) {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
  
  if (isMouseDown) {
    const deltaX = event.clientX - mouseDownPosition.x;
    const deltaY = event.clientY - mouseDownPosition.y;
    
    targetRotation.y = targetRotationOnMouseDown.y + deltaX * 0.01;
    targetRotation.x = targetRotationOnMouseDown.x + deltaY * 0.01;
    
    baseSphere.rotation.y += (targetRotation.y - baseSphere.rotation.y) * 0.1;
    baseSphere.rotation.x += (targetRotation.x - baseSphere.rotation.x) * 0.1;
  }
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(baseSphere);
  
  if (intersects.length > 0) {
    controls.autoRotate = false;
  } else {
    controls.autoRotate = true;
  }
}

// Handle mouse down
function onMouseDown(event) {
  isMouseDown = true;
  mouseDownPosition = {
    x: event.clientX,
    y: event.clientY
  };
  targetRotationOnMouseDown = {
    x: baseSphere.rotation.x,
    y: baseSphere.rotation.y
  };
  
  controls.autoRotate = false;
}

// Handle mouse up
function onMouseUp() {
  isMouseDown = false;
  controls.autoRotate = true;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  renderer.render(scene, camera);
}