/* =============================================
   ROMANTIC CUTE PHOTOBOOTH - app.js
   Complete rewrite with proper camera, filters,
   and beautiful photobooth strip rendering.
   ============================================= */

// ==================== DOM ELEMENTS ====================
const video = document.getElementById('webcam');
const canvas = document.getElementById('final-canvas');
const ctx = canvas.getContext('2d');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const flashOverlay = document.getElementById('flash-overlay');
const currentShotEl = document.getElementById('current-shot');
const totalShotsEl = document.getElementById('total-shots');
const statusText = document.getElementById('status-text');
const progressDotsContainer = document.getElementById('progress-dots');
const thumbnailStrip = document.getElementById('thumbnail-strip');

const welcomeScreen = document.getElementById('welcome-screen');
const cameraScreen = document.getElementById('camera-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');
const restartBtn = document.getElementById('restart-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const frameBtns = document.querySelectorAll('.frame-btn');

// ==================== STATE ====================
let stream = null;
let totalShots = 4;
let capturedShots = []; // stores ImageData as canvas elements
let selectedFilter = 'none';
let selectedFrame = 'white';

// ==================== FRAME COLOR PALETTES ====================
const framePalettes = {
    white: {
        bg: '#FFFFFF',
        bgGrad1: '#FFFFFF',
        bgGrad2: '#FFF9C4',
        border: '#FBC02D',
        borderLight: '#FFF9C4',
        text: '#795548',
        decoColor: '#FBC02D',
        accent: '#F8BBD0',
    },
    pink: {
        bg: '#FFF0F5',
        bgGrad1: '#FFF0F5',
        bgGrad2: '#FFE4E1',
        border: '#EC407A',
        borderLight: '#F8BBD0',
        text: '#880E4F',
        decoColor: '#EC407A',
        accent: '#F48FB1',
    },
    yellow: {
        bg: '#FFFDE7',
        bgGrad1: '#FFF9C4',
        bgGrad2: '#FFF176',
        border: '#F9A825',
        borderLight: '#FFF9C4',
        text: '#E65100',
        decoColor: '#FF8F00',
        accent: '#FFD54F',
    },
    black: {
        bg: '#1A1A1A',
        bgGrad1: '#1A1A1A',
        bgGrad2: '#2D2D2D',
        border: '#FBC02D',
        borderLight: '#555555',
        text: '#FFFFFF',
        decoColor: '#FBC02D',
        accent: '#FFD54F',
    },
};

// ==================== FILTER FUNCTIONS ====================
function applyFilter(imageData, filter) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        switch (filter) {
            case 'warm':
                data[i] = Math.min(255, r + 20);
                data[i + 1] = Math.min(255, g + 10);
                data[i + 2] = Math.max(0, b - 15);
                break;
            case 'bw': {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                data[i] = data[i + 1] = data[i + 2] = gray;
                break;
            }
            case 'vintage':
                data[i] = Math.min(255, r * 1.1 + 20);
                data[i + 1] = Math.min(255, g * 0.9 + 10);
                data[i + 2] = Math.max(0, b * 0.8);
                break;
            case 'pink':
                data[i] = Math.min(255, r * 1.1 + 25);
                data[i + 1] = Math.max(0, g * 0.85);
                data[i + 2] = Math.min(255, b * 1.05 + 15);
                break;
        }
    }
    return imageData;
}

// ==================== INITIALIZATION ====================

// Create floating decorations (subtle, not overdone)
function createFloatingDecorations() {
    const container = document.getElementById('floating-decors');
    const decos = [
        { emoji: '🧸', cls: 'bear' },
        { emoji: '🐰', cls: 'bunny' },
        { emoji: '🌸', cls: 'flower1' },
        { emoji: '🌼', cls: 'flower2' },
    ];
    decos.forEach(d => {
        const el = document.createElement('div');
        el.className = `cute-deco ${d.cls}`;
        el.textContent = d.emoji;
        container.appendChild(el);
    });

    // Add the premium doll image as a floating decoration (top-right)
    const dollEl = document.createElement('div');
    dollEl.className = 'cute-deco doll-img';
    const dollImg = document.createElement('img');
    dollImg.src = 'doll_premium.png';
    dollImg.alt = 'cute doll';
    dollEl.appendChild(dollImg);
    container.appendChild(dollEl);
}

// Create floating particles (subtle and elegant)
function createParticles() {
    const container = document.getElementById('particles');
    const types = ['♡', '☆', '·', '✦', '♡', '☆'];

    for (let i = 0; i < 18; i++) {
        const particle = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        particle.className = `particle star`;
        particle.textContent = type;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 14) + 's';
        particle.style.animationDelay = (Math.random() * 15) + 's';
        particle.style.fontSize = (10 + Math.random() * 12) + 'px';
        container.appendChild(particle);
    }
}

// Setup progress dots
function setupProgressDots() {
    progressDotsContainer.innerHTML = '';
    for (let i = 0; i < totalShots; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.dataset.index = i;
        progressDotsContainer.appendChild(dot);
    }
}

// ==================== MODE / FILTER / FRAME SELECTION ====================
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        totalShots = parseInt(btn.dataset.shots);
    });
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFilter = btn.dataset.filter;
        // Apply filter preview to the camera live
        updateCameraFilter();
    });
});

frameBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        frameBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFrame = btn.dataset.frame;
    });
});

function updateCameraFilter() {
    if (!video) return;
    switch (selectedFilter) {
        case 'none': video.style.filter = 'none'; break;
        case 'warm': video.style.filter = 'saturate(1.4) sepia(0.15) brightness(1.05)'; break;
        case 'bw': video.style.filter = 'grayscale(1)'; break;
        case 'vintage': video.style.filter = 'sepia(0.45) contrast(0.9) brightness(1.05)'; break;
        case 'pink': video.style.filter = 'hue-rotate(330deg) saturate(1.3) brightness(1.05)'; break;
    }
}

// ==================== CAMERA ====================
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        updateCameraFilter();
        return true;
    } catch (err) {
        console.error('Camera error:', err);
        alert('Gagal mengakses kamera 😢\nPastikan kamu sudah mengizinkan akses kamera ya!');
        return false;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    video.srcObject = null;
}

// ==================== SCREEN TRANSITIONS ====================
function showScreen(screen) {
    [welcomeScreen, cameraScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// ==================== CAPTURE LOGIC ====================
function captureFrame() {
    const tempCanvas = document.createElement('canvas');
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    tempCanvas.width = vw;
    tempCanvas.height = vh;
    const tempCtx = tempCanvas.getContext('2d');

    // Mirror horizontally
    tempCtx.translate(vw, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, vw, vh);
    tempCtx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply pixel-level filter
    if (selectedFilter !== 'none') {
        const imageData = tempCtx.getImageData(0, 0, vw, vh);
        applyFilter(imageData, selectedFilter);
        tempCtx.putImageData(imageData, 0, 0);
    }

    return tempCanvas;
}

function doFlash() {
    flashOverlay.classList.remove('flash');
    void flashOverlay.offsetWidth; // force reflow
    flashOverlay.classList.add('flash');
}

function addThumbnail(shotCanvas) {
    const thumb = document.createElement('div');
    thumb.className = 'thumbnail';
    const img = document.createElement('img');
    img.src = shotCanvas.toDataURL('image/jpeg', 0.6);
    thumb.appendChild(img);
    thumbnailStrip.appendChild(thumb);
}

function updateProgressDot(index, state) {
    const dots = progressDotsContainer.querySelectorAll('.progress-dot');
    if (dots[index]) {
        dots[index].classList.remove('active', 'done');
        dots[index].classList.add(state);
    }
}

async function countdown(seconds) {
    countdownOverlay.classList.remove('hidden');
    for (let i = seconds; i >= 1; i--) {
        countdownNumber.textContent = i;
        countdownNumber.style.animation = 'none';
        void countdownNumber.offsetWidth;
        countdownNumber.style.animation = 'countPulse 1s ease-in-out';
        await sleep(1000);
    }
    countdownOverlay.classList.add('hidden');
}

async function startCaptureSequence() {
    capturedShots = [];
    thumbnailStrip.innerHTML = '';
    setupProgressDots();
    totalShotsEl.textContent = totalShots;
    currentShotEl.textContent = '0';
    statusText.textContent = 'Bersiap-siap...';

    await sleep(1500);

    for (let i = 0; i < totalShots; i++) {
        updateProgressDot(i, 'active');
        statusText.textContent = `Siap-siap untuk foto ${i + 1}...`;

        await countdown(3);

        // Capture!
        statusText.textContent = 'Cheese!';
        doFlash();
        const shotCanvas = captureFrame();
        capturedShots.push(shotCanvas);

        currentShotEl.textContent = i + 1;
        updateProgressDot(i, 'done');
        addThumbnail(shotCanvas);

        if (i < totalShots - 1) {
            statusText.textContent = 'Bagus! Siap untuk foto berikutnya...';
            await sleep(1500);
        }
    }

    statusText.textContent = 'Selesai! Membuat foto strip...';
    await sleep(800);

    stopCamera();
    await renderPhotoStrip();
    showScreen(resultScreen);
}

// ==================== PHOTO STRIP RENDERER ====================
async function renderPhotoStrip() {
    const palette = framePalettes[selectedFrame];
    const numPhotos = capturedShots.length;

    // --- Sizing ---
    const photoW = 600;
    const photoAspect = 3 / 4;
    const photoH = Math.round(photoW * photoAspect);

    const padding = 40;
    const gap = 20;
    const cornerRadius = 12;
    const headerH = 75;
    const footerH = 90;

    const stripW = photoW + padding * 2;
    const stripH = headerH + (photoH * numPhotos) + (gap * (numPhotos - 1)) + footerH + padding * 2;

    canvas.width = stripW;
    canvas.height = stripH;

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, stripW, stripH);
    bgGrad.addColorStop(0, palette.bgGrad1);
    bgGrad.addColorStop(1, palette.bgGrad2);
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, stripW, stripH, 20, true, false);

    // --- Outer border ---
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 4;
    roundRect(ctx, 6, 6, stripW - 12, stripH - 12, 16, false, true);

    // --- Inner decorative border (dashed) ---
    ctx.strokeStyle = palette.borderLight;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, 16, 16, stripW - 32, stripH - 32, 12, false, true);
    ctx.setLineDash([]);

    // --- Draw corner decorations ---
    drawCornerDecos(ctx, stripW, stripH, palette);

    // --- Header title ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '700 30px "Dancing Script", cursive';
    ctx.fillStyle = palette.decoColor;
    ctx.fillText('Cute Photobooth', stripW / 2, padding + headerH / 2 - 8);

    // Subtle divider line under title
    ctx.strokeStyle = palette.borderLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(stripW * 0.25, padding + headerH / 2 + 12);
    ctx.lineTo(stripW * 0.75, padding + headerH / 2 + 12);
    ctx.stroke();

    ctx.font = '400 12px "Outfit", sans-serif';
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.6;
    ctx.fillText('romantic memories', stripW / 2, padding + headerH / 2 + 26);
    ctx.globalAlpha = 1;

    // --- Draw each photo ---
    for (let i = 0; i < numPhotos; i++) {
        const x = padding;
        const y = padding + headerH + i * (photoH + gap);

        // Photo shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // Photo border/background
        ctx.fillStyle = palette.bg;
        roundRect(ctx, x - 3, y - 3, photoW + 6, photoH + 6, cornerRadius + 2, true, false);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw the actual photo with proper aspect-ratio crop
        drawCroppedPhoto(ctx, capturedShots[i], x, y, photoW, photoH, cornerRadius);

        // Photo border stroke
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, photoW, photoH, cornerRadius, false, true);

        // Small shot number bubble
        drawShotBubble(ctx, x + photoW - 22, y + 18, i + 1, palette);
    }

    // --- Draw Cute Teddy Bear (top-right corner) ---
    drawCuteBear(ctx, stripW - 130, -5, 120, palette);

    // --- Draw Cute Bunny (bottom-left corner) ---
    drawCuteBunny(ctx, 10, stripH - 125, 120, palette);

    // --- Footer ---
    const footerY = padding + headerH + numPhotos * photoH + (numPhotos - 1) * gap + 15;

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    ctx.font = '500 13px "Outfit", sans-serif';
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'center';
    ctx.fillText(`${dateStr}  ·  ${timeStr}`, stripW / 2, footerY + 20);

    // Subtle decorative line
    ctx.font = '13px serif';
    ctx.globalAlpha = 0.4;
    ctx.fillText('♡  ·  ☆  ·  ♡', stripW / 2, footerY + 42);
    ctx.globalAlpha = 1;

    // Tiny watermark
    ctx.font = '400 10px "Outfit", sans-serif';
    ctx.fillStyle = palette.text;
    ctx.globalAlpha = 0.35;
    ctx.fillText('Made with ♡ Cute Photobooth', stripW / 2, footerY + footerH - 12);
    ctx.globalAlpha = 1;
}

// ==================== CANVAS-DRAWN CUTE DOLLS ====================

// Draw a cute teddy bear using Canvas paths (no image file needed, no background)
function drawCuteBear(ctx, x, y, size, palette) {
    ctx.save();
    const s = size / 100;

    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Ears
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(x+25*s,y+28*s,18*s,18*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+75*s,y+28*s,18*s,18*s,0,0,Math.PI*2); ctx.fill();
    // Inner ears
    ctx.fillStyle = '#F8BBD0';
    ctx.beginPath(); ctx.ellipse(x+25*s,y+28*s,10*s,10*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+75*s,y+28*s,10*s,10*s,0,0,Math.PI*2); ctx.fill();

    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

    // Head
    ctx.fillStyle = '#E8C99B';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+50*s,32*s,30*s,0,0,Math.PI*2); ctx.fill();
    // Body
    ctx.beginPath(); ctx.ellipse(x+50*s,y+82*s,26*s,22*s,0,0,Math.PI*2); ctx.fill();
    // Belly
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+80*s,16*s,14*s,0,0,Math.PI*2); ctx.fill();
    // Arms
    ctx.fillStyle = '#E8C99B';
    ctx.beginPath(); ctx.ellipse(x+24*s,y+78*s,10*s,14*s,-0.3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+76*s,y+78*s,10*s,14*s,0.3,0,Math.PI*2); ctx.fill();
    // Legs
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+98*s,10*s,8*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+98*s,10*s,8*s,0,0,Math.PI*2); ctx.fill();
    // Muzzle
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+55*s,14*s,10*s,0,0,Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#3E2723';
    ctx.beginPath(); ctx.ellipse(x+40*s,y+46*s,3.5*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+60*s,y+46*s,3.5*s,4*s,0,0,Math.PI*2); ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+41.5*s,y+44.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+61.5*s,y+44.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    // Nose
    ctx.fillStyle = '#5D4037';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+52*s,4*s,3*s,0,0,Math.PI*2); ctx.fill();
    // Mouth
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 1.5*s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x+50*s,y+55*s); ctx.quadraticCurveTo(x+44*s,y+60*s,x+42*s,y+57*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+50*s,y+55*s); ctx.quadraticCurveTo(x+56*s,y+60*s,x+58*s,y+57*s); ctx.stroke();
    // Blush
    ctx.fillStyle = 'rgba(248,187,208,0.4)';
    ctx.beginPath(); ctx.ellipse(x+34*s,y+54*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+66*s,y+54*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    // Bow tie
    ctx.fillStyle = palette.accent || '#F8BBD0';
    ctx.beginPath(); ctx.moveTo(x+50*s,y+67*s); ctx.lineTo(x+40*s,y+62*s); ctx.lineTo(x+40*s,y+72*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+50*s,y+67*s); ctx.lineTo(x+60*s,y+62*s); ctx.lineTo(x+60*s,y+72*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = palette.decoColor || '#FBC02D';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+67*s,3*s,3*s,0,0,Math.PI*2); ctx.fill();

    ctx.restore();
}

// Draw a cute bunny using Canvas paths (no image file needed, no background)
function drawCuteBunny(ctx, x, y, size, palette) {
    ctx.save();
    const s = size / 100;

    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    // Long ears
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+18*s,10*s,28*s,-0.15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+18*s,10*s,28*s,0.15,0,Math.PI*2); ctx.fill();
    // Inner ears
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+18*s,5*s,20*s,-0.15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+18*s,5*s,20*s,0.15,0,Math.PI*2); ctx.fill();

    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

    // Head
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+52*s,30*s,28*s,0,0,Math.PI*2); ctx.fill();
    // Body
    ctx.beginPath(); ctx.ellipse(x+50*s,y+82*s,24*s,22*s,0,0,Math.PI*2); ctx.fill();
    // Belly
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+82*s,14*s,14*s,0,0,Math.PI*2); ctx.fill();
    // Arms
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.ellipse(x+26*s,y+78*s,8*s,14*s,-0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+74*s,y+78*s,8*s,14*s,0.2,0,Math.PI*2); ctx.fill();
    // Feet
    ctx.beginPath(); ctx.ellipse(x+38*s,y+99*s,12*s,7*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+99*s,12*s,7*s,0,0,Math.PI*2); ctx.fill();
    // Foot pads
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+99*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+99*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    // Tail
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+26*s,y+90*s,8*s,7*s,0,0,Math.PI*2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#3E2723';
    ctx.beginPath(); ctx.ellipse(x+40*s,y+48*s,3.5*s,4.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+60*s,y+48*s,3.5*s,4.5*s,0,0,Math.PI*2); ctx.fill();
    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+41.5*s,y+46.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+61.5*s,y+46.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    // Nose (triangle)
    ctx.fillStyle = '#F48FB1';
    ctx.beginPath(); ctx.moveTo(x+50*s,y+53*s); ctx.lineTo(x+47*s,y+56*s); ctx.lineTo(x+53*s,y+56*s); ctx.closePath(); ctx.fill();
    // Whiskers
    ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 1*s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x+35*s,y+54*s); ctx.lineTo(x+18*s,y+50*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+35*s,y+56*s); ctx.lineTo(x+18*s,y+57*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+65*s,y+54*s); ctx.lineTo(x+82*s,y+50*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+65*s,y+56*s); ctx.lineTo(x+82*s,y+57*s); ctx.stroke();
    // Mouth
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 1*s;
    ctx.beginPath(); ctx.moveTo(x+50*s,y+56*s); ctx.quadraticCurveTo(x+45*s,y+61*s,x+43*s,y+59*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+50*s,y+56*s); ctx.quadraticCurveTo(x+55*s,y+61*s,x+57*s,y+59*s); ctx.stroke();
    // Blush
    ctx.fillStyle = 'rgba(244,143,177,0.35)';
    ctx.beginPath(); ctx.ellipse(x+33*s,y+55*s,6*s,3.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+67*s,y+55*s,6*s,3.5*s,0,0,Math.PI*2); ctx.fill();
    // Flower on head
    ctx.fillStyle = palette.accent || '#F8BBD0';
    for (let p = 0; p < 5; p++) {
        const angle = (p/5)*Math.PI*2;
        ctx.beginPath();
        ctx.ellipse(x+65*s+Math.cos(angle)*5*s, y+38*s+Math.sin(angle)*5*s, 3.5*s,3.5*s,0,0,Math.PI*2);
        ctx.fill();
    }
    ctx.fillStyle = palette.decoColor || '#FBC02D';
    ctx.beginPath(); ctx.ellipse(x+65*s,y+38*s,2.5*s,2.5*s,0,0,Math.PI*2); ctx.fill();

    ctx.restore();
}

// Draw a photo into a slot with proper aspect ratio (cover crop)
function drawCroppedPhoto(ctx, shotCanvas, x, y, targetW, targetH, radius) {
    const srcW = shotCanvas.width;
    const srcH = shotCanvas.height;
    const targetAspect = targetW / targetH;
    const srcAspect = srcW / srcH;

    let sx, sy, sw, sh;

    if (srcAspect > targetAspect) {
        // Source is wider => crop sides
        sh = srcH;
        sw = srcH * targetAspect;
        sx = (srcW - sw) / 2;
        sy = 0;
    } else {
        // Source is taller => crop top/bottom
        sw = srcW;
        sh = srcW / targetAspect;
        sx = 0;
        sy = (srcH - sh) / 2;
    }

    ctx.save();
    // Clip to rounded rect
    beginRoundRect(ctx, x, y, targetW, targetH, radius);
    ctx.clip();

    ctx.drawImage(shotCanvas, sx, sy, sw, sh, x, y, targetW, targetH);
    ctx.restore();
}

// Small shot number indicator
function drawShotBubble(ctx, cx, cy, num, palette) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = palette.decoColor;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = '700 11px "Outfit", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(num, cx, cy);
    ctx.restore();
}

// Draw elegant corner decorations
function drawCornerDecos(ctx, w, h, palette) {
    const off = 24;
    ctx.save();
    ctx.fillStyle = palette.decoColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.35;

    // Simple hearts at corners
    ctx.font = '16px serif';
    ctx.fillText('♡', off, off);
    ctx.fillText('♡', w - off, off);
    ctx.fillText('♡', off, h - off);
    ctx.fillText('♡', w - off, h - off);

    ctx.globalAlpha = 1;
    ctx.restore();
}

// ==================== ROUNDED RECT HELPERS ====================
function beginRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    beginRoundRect(ctx, x, y, w, h, r);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// ==================== EVENT LISTENERS ====================
startBtn.addEventListener('click', async () => {
    const ok = await startCamera();
    if (!ok) return;
    showScreen(cameraScreen);
    startCaptureSequence();
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `cute-photobooth-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

restartBtn.addEventListener('click', () => {
    showScreen(welcomeScreen);
});

// ==================== UTILITY ====================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== BOOT ====================
document.addEventListener('DOMContentLoaded', () => {
    createFloatingDecorations();
    createParticles();
});
