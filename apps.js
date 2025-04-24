const video = document.getElementById('video');
const emojiDisplay = document.getElementById('emoji');

const expressionEmojis = {
    happy: "😄",
    sad: "😢",
    angry: "😠",
    surprised: "😲",
    fearful: "😱",
    disgusted: "🤢",
    neutral: "😐"
};

// Color themes for different emotions (pastel colors)
const expressionColors = {
    happy: "from-yellow-200 to-orange-200",
    sad: "from-blue-200 to-indigo-200",
    angry: "from-red-200 to-pink-200",
    surprised: "from-purple-200 to-fuchsia-200",
    fearful: "from-green-200 to-teal-200",
    disgusted: "from-emerald-200 to-green-200",
    neutral: "from-gray-200 to-slate-200"
};

async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
        
        // Add loading indicator while models load
        const mainContainer = document.querySelector('main > div');
        const loadingEl = document.createElement('div');
        loadingEl.className = 'absolute inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center transition-opacity duration-300';
        loadingEl.innerHTML = `
            <div class="text-center bg-black/30 p-6 rounded-2xl backdrop-blur-md shadow-xl">
                <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-r-2 border-purple-400 mb-3"></div>
                <p class="text-white/90 font-light tracking-wide">Loading AI models...</p>
            </div>
        `;
        mainContainer.style.position = 'relative';
        mainContainer.appendChild(loadingEl);
        
        return stream;
    } catch (err) {
        console.error("Failed to access webcam:", err);
        // Show error message to user
        document.body.innerHTML += `
            <div class="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
                <div class="bg-gradient-to-b from-red-800/90 to-red-900/90 p-8 rounded-xl max-w-md text-center border border-red-700/50 shadow-2xl backdrop-blur-sm">
                    <p class="text-3xl mb-4">⚠️</p>
                    <h3 class="text-xl font-light tracking-wide mb-3 text-white/90">Camera Access Error</h3>
                    <p class="text-white/80 text-sm leading-relaxed">${err.message || 'Unable to access your camera. Please make sure you have a camera connected and have granted permission.'}</p>
                    <button class="mt-6 bg-red-700/80 hover:bg-red-800/90 px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border border-red-600/30" onclick="location.reload()">Try Again</button>
                </div>
            </div>
        `;
    }
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
]).then(startVideo)
  .then(() => {
    // Remove loading indicator after everything is loaded
    const loadingEl = document.querySelector('main > div > div.absolute');
    if (loadingEl) loadingEl.remove();
  });

function getTopExpression(expressions) {
    return Object.entries(expressions)
        .sort((a, b) => b[1] - a[1])[0][0];
}

function updateBackgroundGradient(emotion) {
    const body = document.body;
    
    // Remove any previous gradient classes
    Object.values(expressionColors).forEach(colorClass => {
        const classes = colorClass.split(' ');
        classes.forEach(cls => {
            body.classList.remove(cls);
        });
    });
    
    // Add new gradient classes
    const newColorClass = expressionColors[emotion] || expressionColors.neutral;
    const classes = newColorClass.split(' ');
    classes.forEach(cls => {
        body.classList.add(cls);
    });
}

let previousEmotion = 'neutral';

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    const videoContainer = video.parentElement;
    videoContainer.appendChild(canvas);
    
    // Position canvas absolute on top of video
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    const displaySize = { width: video.clientWidth, height: video.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5
            })
        ).withFaceExpressions();

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Draw face detection boxes with minimal, aesthetic styling
        if (resizedDetections.length > 0) {
            resizedDetections.forEach(detection => {
                const box = detection.detection.box;
                
                // Create a subtle, elegant box
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';  // Translucent white
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.roundRect(box.x, box.y, box.width, box.height, 12);
                ctx.stroke();
                
                // Add a minimal glow effect
                ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
                ctx.shadowBlur = 10;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Add small indicators at corners for a more minimal look
                const cornerSize = 10;
                const offset = 2;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.lineWidth = 2;
                
                // Top-left corner
                ctx.beginPath();
                ctx.moveTo(box.x - offset, box.y + cornerSize - offset);
                ctx.lineTo(box.x - offset, box.y - offset);
                ctx.lineTo(box.x + cornerSize - offset, box.y - offset);
                ctx.stroke();
                
                // Top-right corner
                ctx.beginPath();
                ctx.moveTo(box.x + box.width - cornerSize + offset, box.y - offset);
                ctx.lineTo(box.x + box.width + offset, box.y - offset);
                ctx.lineTo(box.x + box.width + offset, box.y + cornerSize - offset);
                ctx.stroke();
                
                // Bottom-right corner
                ctx.beginPath();
                ctx.moveTo(box.x + box.width + offset, box.y + box.height - cornerSize + offset);
                ctx.lineTo(box.x + box.width + offset, box.y + box.height + offset);
                ctx.lineTo(box.x + box.width - cornerSize + offset, box.y + box.height + offset);
                ctx.stroke();
                
                // Bottom-left corner
                ctx.beginPath();
                ctx.moveTo(box.x + cornerSize - offset, box.y + box.height + offset);
                ctx.lineTo(box.x - offset, box.y + box.height + offset);
                ctx.lineTo(box.x - offset, box.y + box.height - cornerSize + offset);
                ctx.stroke();
            });
        }

        if (detections.length > 0) {
            const topExp = getTopExpression(detections[0].expressions);
            emojiDisplay.textContent = expressionEmojis[topExp] || "😐";
            
            // Only update background if emotion changed
            if (previousEmotion !== topExp) {
                updateBackgroundGradient(topExp);
                previousEmotion = topExp;
                
                // Add a subtle flash effect
                emojiDisplay.classList.remove('emoji-pulse');
                void emojiDisplay.offsetWidth; // Trigger reflow
                emojiDisplay.classList.add('emoji-pulse');
            }
        }
    }, 100);
});