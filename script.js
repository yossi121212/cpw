// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Earth Globe
    initDottedEarthGlobe();
    
    // Add a class to the body after a short delay to trigger fade-in animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Add parallax effect to the background
    const heroBackground = document.querySelector('.hero-background');
    
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        // Subtle movement of the background based on mouse position
        heroBackground.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
    });

    // Add subtle hover effects to dashboard cards
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.style.boxShadow = '0 8px 20px rgba(22, 163, 74, 0.2)';
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });
    });

    // Add hover effects to revenue sections
    const revenueSections = document.querySelectorAll('.revenue-section');
    
    revenueSections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            section.style.transform = 'translateY(-5px)';
            section.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            section.style.boxShadow = '0 8px 20px rgba(22, 163, 74, 0.2)';
            section.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.transform = 'translateY(0)';
            section.style.boxShadow = 'none';
            section.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        });
    });

    // Add subtle animation to the dashboard
    const dashboard = document.querySelector('.dashboard-container');
    setTimeout(() => {
        dashboard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        dashboard.style.transform = 'translateY(0)';
        dashboard.style.opacity = '1';
    }, 300);

    // Add scroll animation
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const header = document.querySelector('.header');
        
        // Make header more compact on scroll
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Add hover effect to buttons
    const buttons = document.querySelectorAll('.btn, .dashboard-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transition = 'all 0.3s ease';
            if (button.classList.contains('btn-primary') || button.classList.contains('green')) {
                button.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.3)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transition = 'all 0.5s ease';
            button.style.boxShadow = 'none';
        });
    });

    // Add subtle parallax effect to background
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        const bg = document.querySelector('.background-gradient');
        if (bg) {
            bg.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });

    // Simulate loading data for the dashboard
    simulateDataLoading();
    
    // Add chart-like elements to the dashboard
    addChartElements();

    // Add animation to hotspots
    animateHotspots();
});

// Function to initialize the Dotted Earth Globe with Three.js
function initDottedEarthGlobe() {
    const container = document.getElementById('earth-canvas');
    
    if (!container) return;
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 1.5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    
    // Create Earth sphere
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create Earth material
    const earthMaterial = new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.9
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create dots for continents
    const dotsGroup = new THREE.Group();
    scene.add(dotsGroup);
    
    // Generate dots for the Earth surface with continent patterns
    generateContinentDots(dotsGroup);
    
    // Create highlight points (green dots)
    createHighlightPoints(dotsGroup);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Variables for rotation
    let rotationSpeed = 0.001;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    // Add mouse interaction
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        targetRotationX = mouseY * 0.3;
        targetRotationY = mouseX * 0.5;
        
        // Increase rotation speed on hover
        rotationSpeed = 0.003;
    });
    
    container.addEventListener('mouseleave', () => {
        // Reset rotation speed when mouse leaves
        rotationSpeed = 0.001;
        targetRotationX = 0;
        targetRotationY = 0;
    });
    
    // Set initial rotation to show the northern hemisphere
    earth.rotation.x = -0.5;
    dotsGroup.rotation.x = -0.5;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Auto rotation
        earth.rotation.y += rotationSpeed;
        dotsGroup.rotation.y += rotationSpeed;
        
        // Interactive rotation based on mouse position
        earth.rotation.x += (targetRotationX - earth.rotation.x) * 0.05;
        dotsGroup.rotation.x += (targetRotationX - dotsGroup.rotation.x) * 0.05;
        
        earth.rotation.y += (targetRotationY - earth.rotation.y) * 0.05;
        dotsGroup.rotation.y += (targetRotationY - dotsGroup.rotation.y) * 0.05;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Start animation
    animate();
}

// Function to generate dots for continents in a more realistic pattern
function generateContinentDots(group) {
    // Define continent shapes with more detailed coordinates
    const continents = [
        {
            name: "North America",
            color: 0xFFFFFF,
            density: 1.5,
            coordinates: [
                { lat: 70, lng: -100, radius: 25 },
                { lat: 50, lng: -100, radius: 30 },
                { lat: 40, lng: -100, radius: 35 },
                { lat: 30, lng: -90, radius: 25 },
                { lat: 20, lng: -100, radius: 15 }
            ]
        },
        {
            name: "South America",
            color: 0xFFFFFF,
            density: 1.5,
            coordinates: [
                { lat: 0, lng: -60, radius: 25 },
                { lat: -10, lng: -60, radius: 30 },
                { lat: -20, lng: -60, radius: 25 },
                { lat: -30, lng: -65, radius: 20 },
                { lat: -40, lng: -65, radius: 15 }
            ]
        },
        {
            name: "Europe",
            color: 0xFFFFFF,
            density: 1.5,
            coordinates: [
                { lat: 60, lng: 10, radius: 20 },
                { lat: 50, lng: 15, radius: 25 },
                { lat: 45, lng: 10, radius: 20 },
                { lat: 40, lng: 10, radius: 15 }
            ]
        },
        {
            name: "Africa",
            color: 0xFFFFFF,
            density: 1.5,
            coordinates: [
                { lat: 30, lng: 20, radius: 20 },
                { lat: 15, lng: 20, radius: 30 },
                { lat: 0, lng: 20, radius: 30 },
                { lat: -15, lng: 25, radius: 25 },
                { lat: -30, lng: 25, radius: 20 }
            ]
        },
        {
            name: "Asia",
            color: 0xFFFFFF,
            density: 1.5,
            coordinates: [
                { lat: 60, lng: 80, radius: 30 },
                { lat: 50, lng: 90, radius: 35 },
                { lat: 40, lng: 100, radius: 35 },
                { lat: 30, lng: 110, radius: 30 },
                { lat: 20, lng: 100, radius: 25 },
                { lat: 10, lng: 100, radius: 20 }
            ]
        },
        {
            name: "Australia",
            color: 0xFFFFFF,
            density: 1.5,
            coordinates: [
                { lat: -25, lng: 135, radius: 25 }
            ]
        }
    ];
    
    // Create dot material
    const dotMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
    });
    
    // Create dot geometry (smaller dots for more detail)
    const dotGeometry = new THREE.SphereGeometry(0.004, 8, 8);
    
    // Generate dots for each continent
    continents.forEach(continent => {
        // Calculate total dots based on continent size and density
        const totalDots = continent.coordinates.reduce((sum, coord) => sum + Math.pow(coord.radius, 2) * continent.density, 0);
        
        // Create dots for each coordinate center in the continent
        continent.coordinates.forEach(coord => {
            const dotsForThisArea = Math.floor(Math.pow(coord.radius, 2) * continent.density);
            
            for (let i = 0; i < dotsForThisArea; i++) {
                // Generate random position within the coordinate's radius
                // Use gaussian distribution for more realistic clustering
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * coord.radius;
                
                const latOffset = distance * Math.cos(angle) / 111; // approx km per degree
                const lngOffset = distance * Math.sin(angle) / (111 * Math.cos(coord.lat * Math.PI / 180));
                
                const lat = coord.lat + latOffset;
                const lng = coord.lng + lngOffset;
                
                // Skip if outside valid range
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
                
                // Convert to radians
                const latRad = lat * (Math.PI / 180);
                const lngRad = lng * (Math.PI / 180);
                
                // Convert to Cartesian coordinates
                const x = Math.cos(latRad) * Math.cos(lngRad);
                const y = Math.sin(latRad);
                const z = Math.cos(latRad) * Math.sin(lngRad);
                
                // Create dot mesh
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                
                // Position the dot on the sphere surface
                dot.position.set(x, y, z);
                
                // Add dot to the group
                group.add(dot);
            }
        });
    });
}

// Function to create highlight points (green dots)
function createHighlightPoints(group) {
    // Define highlight points (major cities or activity centers)
    const highlights = [
        { lat: 40.7128, lng: -74.0060, size: 0.015, intensity: 1.0 }, // New York
        { lat: 51.5074, lng: -0.1278, size: 0.015, intensity: 1.0 },  // London
        { lat: 35.6762, lng: 139.6503, size: 0.015, intensity: 1.0 }, // Tokyo
        { lat: -33.8688, lng: 151.2093, size: 0.015, intensity: 1.0 },// Sydney
        { lat: 37.7749, lng: -122.4194, size: 0.015, intensity: 1.0 },// San Francisco
        { lat: 1.3521, lng: 103.8198, size: 0.012, intensity: 0.9 },  // Singapore
        { lat: 55.7558, lng: 37.6173, size: 0.012, intensity: 0.9 },  // Moscow
        { lat: -23.5505, lng: -46.6333, size: 0.012, intensity: 0.9 },// São Paulo
        { lat: 19.4326, lng: -99.1332, size: 0.012, intensity: 0.9 }, // Mexico City
        { lat: 28.6139, lng: 77.2090, size: 0.012, intensity: 0.9 },  // New Delhi
        { lat: -34.6037, lng: -58.3816, size: 0.01, intensity: 0.8 }, // Buenos Aires
        { lat: 30.0444, lng: 31.2357, size: 0.01, intensity: 0.8 },   // Cairo
        { lat: 59.3293, lng: 18.0686, size: 0.01, intensity: 0.8 },   // Stockholm
        { lat: -1.2921, lng: 36.8219, size: 0.01, intensity: 0.8 },   // Nairobi
        { lat: 25.2048, lng: 55.2708, size: 0.01, intensity: 0.8 }    // Dubai
    ];
    
    // Create material for highlight points
    const highlightMaterial = new THREE.MeshBasicMaterial({
        color: 0x16A34A,
        transparent: true,
        opacity: 0.9
    });
    
    // Add each highlight point
    highlights.forEach(point => {
        // Convert to radians
        const latRad = point.lat * (Math.PI / 180);
        const lngRad = point.lng * (Math.PI / 180);
        
        // Convert to Cartesian coordinates (radius 1.01 to place slightly above the surface)
        const x = 1.01 * Math.cos(latRad) * Math.cos(lngRad);
        const y = 1.01 * Math.sin(latRad);
        const z = 1.01 * Math.cos(latRad) * Math.sin(lngRad);
        
        // Create highlight geometry
        const highlightGeometry = new THREE.SphereGeometry(point.size, 16, 16);
        
        // Create highlight mesh
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        
        // Position the highlight
        highlight.position.set(x, y, z);
        
        // Add to group
        group.add(highlight);
        
        // Add glow effect
        addGlowEffect(highlight, group, point.intensity);
    });
}

// Function to add glow effect to highlight points
function addGlowEffect(highlight, group, intensity) {
    // Create glow material
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x16A34A,
        transparent: true,
        opacity: 0.3 * intensity
    });
    
    // Create glow geometry (larger than the highlight)
    const glowGeometry = new THREE.SphereGeometry(highlight.geometry.parameters.radius * 2, 16, 16);
    
    // Create glow mesh
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    
    // Position at the same place as the highlight
    glow.position.copy(highlight.position);
    
    // Add to group
    group.add(glow);
}

// Function to animate hotspots
function animateHotspots() {
    const hotspots = document.querySelectorAll('.hotspot');
    
    hotspots.forEach((hotspot, index) => {
        // Add random delay to each hotspot
        setTimeout(() => {
            // Add random movement
            setInterval(() => {
                const randomX = (Math.random() * 2 - 1) * 5;
                const randomY = (Math.random() * 2 - 1) * 5;
                
                hotspot.style.transform = `translate(calc(-50% + ${randomX}px), calc(-50% + ${randomY}px))`;
            }, 3000);
        }, index * 500);
    });
}

// Function to simulate data loading with counting animation
function simulateDataLoading() {
    const statValues = document.querySelectorAll('.stat-value');
    const targetValues = ['32', '23.6K', '756', '12hrs 47mins'];
    
    statValues.forEach((element, index) => {
        const targetValue = targetValues[index];
        animateValue(element, targetValue);
    });
    
    const revenueValues = document.querySelectorAll('.revenue-value');
    const targetRevenueValues = ['$240.8K', '$12.6K'];
    
    revenueValues.forEach((element, index) => {
        const targetValue = targetRevenueValues[index];
        animateValue(element, targetValue);
    });
}

// Helper function to animate counting
function animateValue(element, targetValue) {
    element.textContent = '0';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s ease';
        element.textContent = targetValue;
        element.style.opacity = '1';
    }, 500);
}

// Function to add chart-like elements to the dashboard
function addChartElements() {
    // Create chart container for revenue section
    const revenueSection = document.querySelector('.revenue-section');
    
    if (revenueSection) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.style.height = '60px';
        chartContainer.style.marginTop = '15px';
        chartContainer.style.display = 'flex';
        chartContainer.style.alignItems = 'flex-end';
        chartContainer.style.gap = '4px';
        
        // Generate random chart bars
        for (let i = 0; i < 12; i++) {
            const bar = document.createElement('div');
            const height = 20 + Math.random() * 40;
            
            bar.style.height = `${height}px`;
            bar.style.width = '8px';
            bar.style.backgroundColor = '#16A34A';
            bar.style.opacity = '0.7';
            bar.style.borderRadius = '2px';
            
            // Add hover effect
            bar.addEventListener('mouseenter', () => {
                bar.style.opacity = '1';
                bar.style.transform = 'scaleY(1.1)';
                bar.style.transition = 'all 0.3s ease';
            });
            
            bar.addEventListener('mouseleave', () => {
                bar.style.opacity = '0.7';
                bar.style.transform = 'scaleY(1)';
            });
            
            chartContainer.appendChild(bar);
        }
        
        revenueSection.appendChild(chartContainer);
    }
    
    // Create chart for second revenue section
    const secondRevenueSection = document.querySelectorAll('.revenue-section')[1];
    
    if (secondRevenueSection) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.style.height = '60px';
        chartContainer.style.marginTop = '15px';
        chartContainer.style.position = 'relative';
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.style.height = '10px';
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        progressBar.style.borderRadius = '5px';
        progressBar.style.marginTop = '10px';
        
        const progress = document.createElement('div');
        progress.style.height = '100%';
        progress.style.width = '65%';
        progress.style.backgroundColor = '#16A34A';
        progress.style.borderRadius = '5px';
        progress.style.transition = 'width 1s ease';
        
        progressBar.appendChild(progress);
        chartContainer.appendChild(progressBar);
        
        // Add label
        const label = document.createElement('div');
        label.textContent = '65% of quarterly goal';
        label.style.fontSize = '0.75rem';
        label.style.opacity = '0.7';
        label.style.marginTop = '8px';
        
        chartContainer.appendChild(label);
        secondRevenueSection.appendChild(chartContainer);
        
        // Animate progress bar
        setTimeout(() => {
            progress.style.width = '65%';
        }, 500);
    }
} 