// Simple script to generate placeholder logo images for the game
// This will automatically generate the images in the browser

function generateLogoImages() {
    const logos = [
        { name: 'bitcoin', color: '#F7931A', text: 'BTC' },
        { name: 'ethereum', color: '#627EEA', text: 'ETH' },
        { name: 'solana', color: '#00FFA3', text: 'SOL' },
        { name: 'facebook', color: '#1877F2', text: 'FB' },
        { name: 'twitter', color: '#1DA1F2', text: 'X' },
        { name: 'google', color: '#4285F4', text: 'G' }
    ];
    
    // For each logo, create a canvas and draw the logo
    logos.forEach(logo => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = logo.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 120px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logo.text, canvas.width / 2, canvas.height / 2);
        
        // Add border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create an image element from the data URL
        const img = new Image();
        img.src = dataUrl;
        
        // Add the logo to the page temporarily so the game can find it
        img.style.display = 'none';
        img.id = logo.name;
        document.body.appendChild(img);
        
        // Also create a download link for users who want to save the files
        const link = document.createElement('a');
        link.download = `${logo.name}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        
        // Store the image in localStorage so it persists between page refreshes
        localStorage.setItem(`logo_${logo.name}`, dataUrl);
    });
    
    console.log('Logo images generated and stored in the DOM/localStorage');
    
    // Create a temporary fallback image handling function
    window.handleMissingImage = function(event) {
        const imgElement = event.target;
        const filename = imgElement.src.split('/').pop();
        const logoName = filename.split('.')[0];
        
        // Try to get from localStorage
        const storedLogo = localStorage.getItem(`logo_${logoName}`);
        if (storedLogo) {
            imgElement.src = storedLogo;
        }
    };
    
    // Update the game code to use these images
    // This is a hack that injects logic to intercept texture loading
    const originalTextureLoad = THREE.TextureLoader.prototype.load;
    THREE.TextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
        const logoName = url.split('/').pop().split('.')[0];
        const storedLogo = localStorage.getItem(`logo_${logoName}`);
        
        if (storedLogo) {
            return originalTextureLoad.call(this, storedLogo, onLoad, onProgress, onError);
        } else {
            return originalTextureLoad.call(this, url, onLoad, onProgress, onError);
        }
    };
}

// This will create a message at the top of the page with download links
function showDownloadLinks() {
    const downloadDiv = document.createElement('div');
    downloadDiv.style.position = 'fixed';
    downloadDiv.style.top = '0';
    downloadDiv.style.left = '0';
    downloadDiv.style.width = '100%';
    downloadDiv.style.padding = '10px';
    downloadDiv.style.background = 'rgba(0,0,0,0.8)';
    downloadDiv.style.color = 'white';
    downloadDiv.style.zIndex = '1000';
    downloadDiv.innerHTML = `
        <h3>Logo Images Generated!</h3>
        <p>Click the logos below to download:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;"></div>
        <button style="margin-top: 10px; padding: 5px 10px; background: #00ffaa; border: none; cursor: pointer;" onclick="this.parentNode.style.display='none'">Close</button>
    `;
    
    const container = downloadDiv.querySelector('div');
    
    // Get all logos from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('logo_')) {
            const logoName = key.replace('logo_', '');
            const dataUrl = localStorage.getItem(key);
            
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${logoName}.png`;
            link.innerHTML = `<img src="${dataUrl}" style="width: 50px; height: 50px; border: 2px solid white;">`;
            link.style.textDecoration = 'none';
            container.appendChild(link);
        }
    }
    
    document.body.appendChild(downloadDiv);
}

// Run the logo generation
document.addEventListener('DOMContentLoaded', function() {
    // Generate logos
    generateLogoImages();
    
    // Show download links
    showDownloadLinks();
});

// If the page is already loaded, run now
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    generateLogoImages();
    showDownloadLinks();
} 