import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { PointerLockControls } from 'three/addons/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/GLTFLoader.js';

// Game constants
const INITIAL_CPW = 100;
const ARROWS_PER_LEVEL = 10;
const TARGET_LOGOS = [
    { name: 'Bitcoin', isCorrect: true, color: 0xF7931A },
    { name: 'Ethereum', isCorrect: true, color: 0x627EEA },
    { name: 'Solana', isCorrect: true, color: 0x00FFA3 },
    { name: 'Facebook', isCorrect: false, color: 0x1877F2 },
    { name: 'Twitter', isCorrect: false, color: 0x1DA1F2 },
    { name: 'Google', isCorrect: false, color: 0x4285F4 }
];

// Game state
const gameState = {
    cpw: INITIAL_CPW,
    arrows: ARROWS_PER_LEVEL,
    score: 0,
    level: 1,
    isGameOver: false,
    isAddressablePowerActive: false,
    addressablePowerCharge: 0,
    isLoading: true,
    loadingProgress: 0,
    bowModel: null,
    arrowModel: null
};

// Three.js variables
let scene, camera, renderer;
let controls;
let raycaster, mouse;
let targetWall;
let targets = [];
let arrows = [];
let clock;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.querySelector('.progress');
const gameUI = document.getElementById('game-ui');
const gameOverScreen = document.getElementById('game-over');
const cpwValue = document.getElementById('cpw-value');
const arrowsCount = document.getElementById('arrows-count');
const scoreValue = document.getElementById('score-value');
const levelValue = document.getElementById('level-value');
const finalCpw = document.getElementById('final-cpw');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const addressablePowerButton = document.getElementById('addressable-power');

// Initialize the game
init();

// Main initialization function
function init() {
    // Initialize Three.js scene
    initScene();
    
    // Load game assets
    loadAssets();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
}

// Initialize Three.js scene
function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a2a);
    
    // Add fog for depth
    scene.fog = new THREE.FogExp2(0x0a0a2a, 0.02);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1.6; // Approximate eye height
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Add some point lights for neon effect
    const blueLight = new THREE.PointLight(0x0088ff, 1, 50);
    blueLight.position.set(-10, 5, 10);
    scene.add(blueLight);
    
    const greenLight = new THREE.PointLight(0x00ff88, 1, 50);
    greenLight.position.set(10, 5, 10);
    scene.add(greenLight);
    
    // Setup controls
    controls = new PointerLockControls(camera, document.body);
    
    // Setup raycaster for arrow shooting
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Initialize clock for animations
    clock = new THREE.Clock();
    
    // Create ground
    createGround();
    
    // Create target wall
    createTargetWall();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Create ground plane
function createGround() {
    // Create a grid helper for the ground
    const gridHelper = new THREE.GridHelper(100, 100, 0x00ff88, 0x0088ff);
    scene.add(gridHelper);
    
    // Create actual ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x0a0a2a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// Create target wall
function createTargetWall() {
    // Create wall
    const wallGeometry = new THREE.BoxGeometry(10, 5, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a3a,
        roughness: 0.7,
        metalness: 0.3
    });
    targetWall = new THREE.Mesh(wallGeometry, wallMaterial);
    targetWall.position.z = -15;
    targetWall.position.y = 2.5;
    targetWall.receiveShadow = true;
    targetWall.castShadow = true;
    scene.add(targetWall);
    
    // Add voxel-style decoration to the wall
    addVoxelDecoration(targetWall);
    
    // Create targets
    createTargets();
}

// Add voxel-style decoration to the wall
function addVoxelDecoration(wall) {
    const voxelSize = 0.25;
    const wallWidth = 10;
    const wallHeight = 5;
    
    // Create border voxels
    for (let x = -wallWidth/2; x <= wallWidth/2; x += voxelSize) {
        for (let y = -wallHeight/2; y <= wallHeight/2; y += voxelSize) {
            // Only create voxels at the border
            if (
                Math.abs(x) > (wallWidth/2 - voxelSize) || 
                Math.abs(y) > (wallHeight/2 - voxelSize)
            ) {
                const voxelGeometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
                const voxelMaterial = new THREE.MeshStandardMaterial({ 
                    color: Math.random() > 0.5 ? 0x00ff88 : 0x0088ff,
                    emissive: Math.random() > 0.5 ? 0x00ff88 : 0x0088ff,
                    emissiveIntensity: 0.5
                });
                const voxel = new THREE.Mesh(voxelGeometry, voxelMaterial);
                voxel.position.set(x, y, 0.25);
                wall.add(voxel);
            }
        }
    }
}

// Create targets on the wall
function createTargets() {
    const targets = [];
    const targetSize = 1;
    const spacing = 2.5;
    const rows = 2;
    const cols = 3;
    const startX = -((cols - 1) * spacing) / 2;
    const startY = 2;
    
    let index = 0;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const logoInfo = TARGET_LOGOS[index];
            
            // Create a box geometry for the target
            const geometry = new THREE.BoxGeometry(targetSize, targetSize, 0.1);
            const material = new THREE.MeshPhongMaterial({ 
                color: logoInfo.color,
                emissive: logoInfo.color,
                emissiveIntensity: 0.2
            });
            
            const target = new THREE.Mesh(geometry, material);
            
            // Position the target
            const x = startX + col * spacing;
            const y = startY + row * -spacing;
            target.position.set(x, y, -10);
            
            // Add text label
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const context = canvas.getContext('2d');
            context.fillStyle = '#FFFFFF';
            context.font = 'Bold 60px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(logoInfo.name.substring(0, 3), 128, 128);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            });
            
            const labelGeometry = new THREE.PlaneGeometry(targetSize * 0.8, targetSize * 0.8);
            const label = new THREE.Mesh(labelGeometry, labelMaterial);
            label.position.z = 0.06;
            
            target.add(label);
            
            // Store target info
            target.userData = {
                isCorrect: logoInfo.isCorrect,
                name: logoInfo.name,
                hit: false
            };
            
            scene.add(target);
            targets.push(target);
            
            // Update loading progress
            updateLoadingProgress((index + 1) / TARGET_LOGOS.length);
            index++;
        }
    }
    
    // Finish loading immediately
    finishLoading();
    
    return targets;
}

// Load game assets
function loadAssets() {
    // Create simple bow and arrow models
    gameState.bowModel = createSimpleBow();
    gameState.arrowModel = createSimpleArrow();
    
    // Finish loading immediately
    updateLoadingProgress(1);
    finishLoading();
}

// Create a simple bow model
function createSimpleBow() {
    // Create a simple bow using basic geometries
    const bowGroup = new THREE.Group();
    
    // Bow handle
    const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    bowGroup.add(handle);
    
    // Bow arc
    const arcGeometry = new THREE.TorusGeometry(0.3, 0.02, 8, 32, Math.PI);
    const arcMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7
    });
    const arc = new THREE.Mesh(arcGeometry, arcMaterial);
    arc.rotation.x = Math.PI / 2;
    arc.position.y = 0.25;
    bowGroup.add(arc);
    
    // Bow string
    const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.6, 4);
    const stringMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xCCCCCC,
        roughness: 0.3
    });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.y = 0.25;
    string.position.z = 0.3;
    bowGroup.add(string);
    
    // Position the bow in front of the camera
    bowGroup.position.set(0.3, -0.2, -0.5);
    bowGroup.rotation.y = Math.PI / 2;
    
    // Add bow to the camera
    camera.add(bowGroup);
    
    // Make sure the camera is added to the scene
    scene.add(camera);
    
    return bowGroup;
}

// Create a simple arrow model
function createSimpleArrow() {
    // Create arrow template
    const arrowGroup = new THREE.Group();
    
    // Arrow shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8);
    const shaftMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xA0522D,
        roughness: 0.6
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.rotation.x = Math.PI / 2;
    arrowGroup.add(shaft);
    
    // Arrow head
    const headGeometry = new THREE.ConeGeometry(0.02, 0.1, 8);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.z = 0.3;
    head.rotation.x = Math.PI / 2;
    arrowGroup.add(head);
    
    // Arrow fletching
    const fletchingGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.1);
    const fletchingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        roughness: 0.7
    });
    
    const fletching1 = new THREE.Mesh(fletchingGeometry, fletchingMaterial);
    fletching1.position.z = -0.2;
    fletching1.position.y = 0.03;
    fletching1.rotation.x = Math.PI / 2;
    arrowGroup.add(fletching1);
    
    const fletching2 = new THREE.Mesh(fletchingGeometry, fletchingMaterial);
    fletching2.position.z = -0.2;
    fletching2.position.x = 0.03;
    fletching2.rotation.x = Math.PI / 2;
    fletching2.rotation.z = Math.PI / 2;
    arrowGroup.add(fletching2);
    
    // Store the arrow model
    return arrowGroup;
}

// Update loading progress
function updateLoadingProgress(progress) {
    gameState.loadingProgress = Math.min(progress, 1);
    progressBar.style.width = `${gameState.loadingProgress * 100}%`;
}

// Finish loading and start the game
function finishLoading() {
    gameState.isLoading = false;
    loadingScreen.classList.add('hidden');
    
    // Lock pointer for controls
    controls.lock();
}

// Setup event listeners
function setupEventListeners() {
    // Pointer lock events
    controls.addEventListener('lock', () => {
        gameUI.style.display = 'block';
        if (!gameState.isGameOver) {
            gameOverScreen.classList.add('hidden');
        }
    });
    
    controls.addEventListener('unlock', () => {
        if (!gameState.isLoading && !gameState.isGameOver) {
            gameUI.style.display = 'none';
        }
    });
    
    // Click to shoot
    document.addEventListener('click', onMouseClick, false);
    
    // Restart button
    restartButton.addEventListener('click', restartGame);
    
    // Addressable power button
    addressablePowerButton.addEventListener('click', activateAddressablePower);
}

// Handle mouse click (shooting)
function onMouseClick() {
    if (gameState.isLoading || gameState.isGameOver || !controls.isLocked) return;
    
    if (gameState.arrows > 0) {
        shootArrow();
        gameState.arrows--;
        updateHUD();
        
        // Check if level is complete
        if (gameState.arrows <= 0) {
            setTimeout(() => {
                if (!gameState.isGameOver) {
                    nextLevel();
                }
            }, 1500);
        }
    }
}

// Shoot an arrow
function shootArrow() {
    // Create arrow from template
    const arrow = gameState.arrowModel.clone();
    scene.add(arrow);
    
    // Position at camera
    arrow.position.copy(camera.position);
    
    // Get direction from camera
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);
    
    // Add some randomness if addressable power is not active
    if (!gameState.isAddressablePowerActive) {
        direction.x += (Math.random() - 0.5) * 0.05;
        direction.y += (Math.random() - 0.5) * 0.05;
        direction.z += (Math.random() - 0.5) * 0.05;
    }
    
    direction.normalize();
    
    // Store arrow data
    const arrowData = {
        object: arrow,
        direction: direction,
        speed: 0.5,
        isHit: false
    };
    
    // If addressable power is active, find the nearest correct target
    if (gameState.isAddressablePowerActive) {
        const correctTargets = targets.filter(target => target.userData.isCorrect);
        
        if (correctTargets.length > 0) {
            // Find the nearest correct target
            let nearestTarget = correctTargets[0];
            let nearestDistance = Infinity;
            
            correctTargets.forEach(target => {
                const targetWorldPos = new THREE.Vector3();
                target.getWorldPosition(targetWorldPos);
                
                const distance = camera.position.distanceTo(targetWorldPos);
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestTarget = target;
                }
            });
            
            // Get target world position
            const targetWorldPos = new THREE.Vector3();
            nearestTarget.getWorldPosition(targetWorldPos);
            
            // Calculate direction to target
            direction.copy(targetWorldPos.sub(camera.position).normalize());
            arrowData.direction = direction;
            
            // Add tracer effect for addressable power
            addAddressableTracer(arrow);
        }
        
        // Deactivate addressable power after use
        gameState.isAddressablePowerActive = false;
        addressablePowerButton.disabled = true;
        gameState.addressablePowerCharge = 0;
    }
    
    arrows.push(arrowData);
    
    // Play sound
    playSound('shoot');
}

// Add tracer effect for addressable power
function addAddressableTracer(arrow) {
    // Create a trail effect
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffaa,
        linewidth: 3
    });
    
    const points = [];
    for (let i = 0; i < 20; i++) {
        points.push(new THREE.Vector3(0, 0, -i * 0.1));
    }
    
    trailGeometry.setFromPoints(points);
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    arrow.add(trail);
}

// Update arrows positions
function updateArrows(deltaTime) {
    for (let i = arrows.length - 1; i >= 0; i--) {
        const arrow = arrows[i];
        
        if (!arrow.isHit) {
            // Move arrow
            arrow.object.position.add(arrow.direction.clone().multiplyScalar(arrow.speed));
            
            // Rotate arrow to face direction
            arrow.object.lookAt(arrow.object.position.clone().add(arrow.direction));
            
            // Check for collisions
            const raycaster = new THREE.Raycaster(
                arrow.object.position.clone(),
                arrow.direction.clone(),
                0,
                arrow.speed
            );
            
            // Get all intersections with the target wall
            const intersects = raycaster.intersectObject(targetWall, true);
            
            if (intersects.length > 0) {
                // Check if we hit a target
                const hitObject = intersects[0].object;
                
                if (hitObject.userData && hitObject.userData.isTarget) {
                    // We hit a target!
                    arrow.isHit = true;
                    
                    // Position arrow at hit point
                    arrow.object.position.copy(intersects[0].point);
                    
                    // Handle target hit
                    handleTargetHit(hitObject);
                } else {
                    // We hit the wall
                    arrow.isHit = true;
                    
                    // Position arrow at hit point
                    arrow.object.position.copy(intersects[0].point);
                    
                    // Play sound
                    playSound('hitWall');
                }
            }
            
            // Remove arrows that go too far
            if (arrow.object.position.distanceTo(camera.position) > 100) {
                scene.remove(arrow.object);
                arrows.splice(i, 1);
            }
        }
    }
}

// Handle target hit
function handleTargetHit(target) {
    // Check if target is correct
    if (target.userData.isCorrect) {
        // Correct target hit!
        gameState.cpw -= 5;
        gameState.score += 100;
        
        // Increase addressable power charge
        gameState.addressablePowerCharge += 0.25;
        if (gameState.addressablePowerCharge >= 1) {
            addressablePowerButton.disabled = false;
        }
        
        // Play sound
        playSound('correctHit');
        
        // Add hit effect
        addHitEffect(target, 0x00ff88);
    } else {
        // Wrong target hit!
        gameState.cpw += 10;
        gameState.score -= 50;
        
        // Play sound
        playSound('wrongHit');
        
        // Add hit effect
        addHitEffect(target, 0xff0088);
    }
    
    // Update HUD
    updateHUD();
    
    // Check for game over
    checkGameOver();
}

// Add hit effect
function addHitEffect(target, color) {
    // Create a pulse effect
    const pulseGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const pulseMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
    });
    
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.copy(target.position);
    pulse.position.z += 0.1;
    targetWall.add(pulse);
    
    // Animate the pulse
    const startTime = Date.now();
    
    function animatePulse() {
        const elapsedTime = Date.now() - startTime;
        const scale = 1 + elapsedTime / 200;
        pulse.scale.set(scale, scale, 1);
        
        pulse.material.opacity = 0.7 * (1 - elapsedTime / 1000);
        
        if (elapsedTime < 1000) {
            requestAnimationFrame(animatePulse);
        } else {
            targetWall.remove(pulse);
        }
    }
    
    animatePulse();
}

// Play sound effect
function playSound(type) {
    // In a real game, you'd implement actual sound effects here
    console.log(`Playing sound: ${type}`);
}

// Update HUD
function updateHUD() {
    cpwValue.textContent = gameState.cpw.toFixed(2);
    arrowsCount.textContent = gameState.arrows;
    scoreValue.textContent = gameState.score;
    levelValue.textContent = gameState.level;
    
    // Update addressable power button
    if (gameState.addressablePowerCharge >= 1 && !gameState.isAddressablePowerActive) {
        addressablePowerButton.disabled = false;
    } else {
        addressablePowerButton.disabled = true;
    }
}

// Check for game over
function checkGameOver() {
    if (gameState.cpw <= 0) {
        // Win condition!
        gameOver(true);
    } else if (gameState.cpw >= 200) {
        // Lose condition!
        gameOver(false);
    }
}

// Game over
function gameOver(isWin) {
    gameState.isGameOver = true;
    
    // Update final scores
    finalCpw.textContent = gameState.cpw.toFixed(2);
    finalScore.textContent = gameState.score;
    
    // Show game over screen
    gameOverScreen.classList.remove('hidden');
    
    // Unlock controls
    controls.unlock();
    
    // Play sound
    playSound(isWin ? 'win' : 'lose');
}

// Next level
function nextLevel() {
    gameState.level++;
    gameState.arrows = ARROWS_PER_LEVEL;
    
    // Increase difficulty
    createTargets();
    
    // Update HUD
    updateHUD();
    
    // Play sound
    playSound('nextLevel');
}

// Restart game
function restartGame() {
    // Reset game state
    gameState.cpw = INITIAL_CPW;
    gameState.arrows = ARROWS_PER_LEVEL;
    gameState.score = 0;
    gameState.level = 1;
    gameState.isGameOver = false;
    gameState.isAddressablePowerActive = false;
    gameState.addressablePowerCharge = 0;
    
    // Clear arrows
    arrows.forEach(arrow => {
        scene.remove(arrow.object);
    });
    arrows = [];
    
    // Reset targets
    createTargets();
    
    // Update HUD
    updateHUD();
    
    // Hide game over screen
    gameOverScreen.classList.add('hidden');
    
    // Lock controls
    controls.lock();
    
    // Play sound
    playSound('restart');
}

// Activate addressable power
function activateAddressablePower() {
    if (gameState.addressablePowerCharge >= 1) {
        gameState.isAddressablePowerActive = true;
        gameState.addressablePowerCharge = 0;
        addressablePowerButton.disabled = true;
        
        // Play sound
        playSound('powerUp');
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Update arrows
    updateArrows(deltaTime);
    
    // Make targets move in higher levels
    if (gameState.level > 1 && !gameState.isGameOver) {
        targets.forEach((target, index) => {
            const speed = 0.5 + (gameState.level * 0.1);
            const time = Date.now() * 0.001;
            const offset = index * 0.5;
            
            target.position.x = Math.sin(time + offset) * (1 + gameState.level * 0.2);
        });
    }
    
    // Render scene
    renderer.render(scene, camera);
} 