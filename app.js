/* =============================================
   CUTE PHOTOBOOTH - app.js
   Complete system with frame theme selection,
   multi-theme canvas rendering, and premium UX.
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

const frameSelectScreen = document.getElementById('frame-select-screen');
const settingsScreen = document.getElementById('settings-screen');
const cameraScreen = document.getElementById('camera-screen');
const resultScreen = document.getElementById('result-screen');

const continueBtn = document.getElementById('continue-btn');
const startBtn = document.getElementById('start-btn');
const downloadBtn = document.getElementById('download-btn');
const restartBtn = document.getElementById('restart-btn');
const changeFrameBtn = document.getElementById('change-frame-btn');
const backToFramesBtn = document.getElementById('back-to-frames');
const modeBtns = document.querySelectorAll('.mode-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const frameThemesGrid = document.getElementById('frame-themes-grid');
const selectedFramePreview = document.getElementById('selected-frame-preview');

// ==================== STATE ====================
let stream = null;
let totalShots = 4;
let capturedShots = [];
let selectedFilter = 'none';
let selectedTheme = null;

// ==================== FRAME THEMES ====================
const frameThemes = [
    {
        id: 'classic-white',
        name: 'Classic White',
        desc: 'Bersih & elegan',
        badge: 'popular',
        bgGrad1: '#FFFFFF',
        bgGrad2: '#F5F5F5',
        border: '#E0E0E0',
        borderLight: '#EEEEEE',
        text: '#424242',
        decoColor: '#9E9E9E',
        accent: '#BDBDBD',
        previewBg: 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
        headerFont: '"Playfair Display", serif',
        headerText: 'Classic',
        subText: 'timeless elegance',
        decoEmoji: '✧',
        cornerStyle: 'lines',
    },
    {
        id: 'romantic-pink',
        name: 'Romantic Pink',
        desc: 'Lembut & manis',
        badge: 'popular',
        bgGrad1: '#FFF0F5',
        bgGrad2: '#FFE4E1',
        border: '#EC407A',
        borderLight: '#F8BBD0',
        text: '#880E4F',
        decoColor: '#EC407A',
        accent: '#F48FB1',
        previewBg: 'linear-gradient(135deg, #FFF0F5, #F8BBD0)',
        headerFont: '"Dancing Script", cursive',
        headerText: 'With Love',
        subText: 'romantic memories',
        decoEmoji: '♡',
        cornerStyle: 'hearts',
    },
    {
        id: 'bank-perunggu',
        name: 'Bank Perunggu',
        desc: 'Merah marun mewah',
        badge: 'new',
        bgGrad1: '#3E1A1A',
        bgGrad2: '#5D2E2E',
        border: '#CD7F32',
        borderLight: '#8B4513',
        text: '#F5E6D3',
        decoColor: '#CD7F32',
        accent: '#DAA520',
        previewBg: 'linear-gradient(135deg, #3E1A1A, #800020)',
        headerFont: '"Playfair Display", serif',
        headerText: 'Perunggu',
        subText: 'premium bronze',
        decoEmoji: '◆',
        cornerStyle: 'ornate',
    },
    {
        id: 'golden-luxury',
        name: 'Golden Luxury',
        desc: 'Mewah & berkilau',
        badge: 'premium',
        bgGrad1: '#FFFDE7',
        bgGrad2: '#FFF176',
        border: '#F9A825',
        borderLight: '#FFF9C4',
        text: '#E65100',
        decoColor: '#FF8F00',
        accent: '#FFD54F',
        previewBg: 'linear-gradient(135deg, #FFF9C4, #FFD54F)',
        headerFont: '"Dancing Script", cursive',
        headerText: 'Golden',
        subText: 'luxury edition',
        decoEmoji: '★',
        cornerStyle: 'stars',
    },
    {
        id: 'midnight-dark',
        name: 'Midnight Dark',
        desc: 'Gelap & elegan',
        badge: null,
        bgGrad1: '#1A1A2E',
        bgGrad2: '#16213E',
        border: '#E94560',
        borderLight: '#533483',
        text: '#EAEAEA',
        decoColor: '#E94560',
        accent: '#0F3460',
        previewBg: 'linear-gradient(135deg, #1A1A2E, #0F3460)',
        headerFont: '"Outfit", sans-serif',
        headerText: 'Midnight',
        subText: 'dark elegance',
        decoEmoji: '☆',
        cornerStyle: 'lines',
    },
    {
        id: 'vintage-sepia',
        name: 'Vintage Retro',
        desc: 'Klasik & nostalgia',
        badge: null,
        bgGrad1: '#F5E6D3',
        bgGrad2: '#E8D5B7',
        border: '#8B7355',
        borderLight: '#C4A882',
        text: '#5D4037',
        decoColor: '#8B7355',
        accent: '#D4A574',
        previewBg: 'linear-gradient(135deg, #F5E6D3, #D4A574)',
        headerFont: '"Playfair Display", serif',
        headerText: 'Vintage',
        subText: 'nostalgic vibes',
        decoEmoji: '❋',
        cornerStyle: 'ornate',
    },
    {
        id: 'sakura-garden',
        name: 'Sakura Garden',
        desc: 'Bunga sakura Jepang',
        badge: 'new',
        bgGrad1: '#FFF5F5',
        bgGrad2: '#FFEEF2',
        border: '#FF6B9D',
        borderLight: '#FFB3CC',
        text: '#D81B60',
        decoColor: '#FF6B9D',
        accent: '#FF9EBA',
        previewBg: 'linear-gradient(135deg, #FFF5F5, #FFB3CC)',
        headerFont: '"Dancing Script", cursive',
        headerText: 'Sakura',
        subText: '桜 cherry blossom',
        decoEmoji: '🌸',
        cornerStyle: 'sakura',
    },
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        desc: 'Sejuk & menenangkan',
        badge: null,
        bgGrad1: '#E3F2FD',
        bgGrad2: '#BBDEFB',
        border: '#1976D2',
        borderLight: '#64B5F6',
        text: '#0D47A1',
        decoColor: '#1976D2',
        accent: '#42A5F5',
        previewBg: 'linear-gradient(135deg, #E3F2FD, #64B5F6)',
        headerFont: '"Outfit", sans-serif',
        headerText: 'Ocean',
        subText: 'calm & serene',
        decoEmoji: '～',
        cornerStyle: 'waves',
    },
    {
        id: 'lavender-dream',
        name: 'Lavender Dream',
        desc: 'Ungu lembut & dreamy',
        badge: null,
        bgGrad1: '#F3E5F5',
        bgGrad2: '#E1BEE7',
        border: '#7B1FA2',
        borderLight: '#CE93D8',
        text: '#4A148C',
        decoColor: '#9C27B0',
        accent: '#BA68C8',
        previewBg: 'linear-gradient(135deg, #F3E5F5, #CE93D8)',
        headerFont: '"Dancing Script", cursive',
        headerText: 'Lavender',
        subText: 'dream away',
        decoEmoji: '✿',
        cornerStyle: 'hearts',
    },
    {
        id: 'emerald-forest',
        name: 'Emerald Forest',
        desc: 'Hijau alam & segar',
        badge: null,
        bgGrad1: '#E8F5E9',
        bgGrad2: '#C8E6C9',
        border: '#2E7D32',
        borderLight: '#81C784',
        text: '#1B5E20',
        decoColor: '#43A047',
        accent: '#66BB6A',
        previewBg: 'linear-gradient(135deg, #E8F5E9, #81C784)',
        headerFont: '"Playfair Display", serif',
        headerText: 'Emerald',
        subText: 'nature vibes',
        decoEmoji: '❧',
        cornerStyle: 'lines',
    },
];

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
            case 'cool':
                data[i] = Math.max(0, r * 0.9);
                data[i + 1] = Math.min(255, g * 1.05 + 5);
                data[i + 2] = Math.min(255, b * 1.15 + 10);
                break;
            case 'dramatic':
                data[i] = Math.min(255, Math.max(0, (r - 128) * 1.4 + 128));
                data[i + 1] = Math.min(255, Math.max(0, (g - 128) * 1.4 + 128));
                data[i + 2] = Math.min(255, Math.max(0, (b - 128) * 1.4 + 128));
                break;
        }
    }
    return imageData;
}

// ==================== INITIALIZATION ====================

function createFloatingDecorations() {
    const container = document.getElementById('floating-decors');
    const decos = [
        { emoji: '🧸', cls: 'bear' },
        { emoji: '🐰', cls: 'bunny' },
        { emoji: '🌸', cls: 'flower1' },
        { emoji: '🌼', cls: 'flower2' },
        { emoji: '🌺', cls: 'flower3' },
        { emoji: '🌷', cls: 'flower4' },
        { emoji: '💐', cls: 'flower5' },
        { emoji: '🌻', cls: 'flower6' },
        { emoji: '🌹', cls: 'flower7' },
        { emoji: '🏵️', cls: 'flower8' },
        { emoji: '🦋', cls: 'butterfly1' },
        { emoji: '🦋', cls: 'butterfly2' },
    ];
    decos.forEach(d => {
        const el = document.createElement('div');
        el.className = `cute-deco ${d.cls}`;
        el.textContent = d.emoji;
        container.appendChild(el);
    });

    // Doll top-right
    const dollEl = document.createElement('div');
    dollEl.className = 'cute-deco doll-img';
    const dollImg = document.createElement('img');
    dollImg.src = 'doll_premium.png';
    dollImg.alt = 'cute doll';
    dollEl.appendChild(dollImg);
    container.appendChild(dollEl);

    // Doll bottom-left
    const dollEl2 = document.createElement('div');
    dollEl2.className = 'cute-deco doll-img2';
    const dollImg2 = document.createElement('img');
    dollImg2.src = 'doll1.png';
    dollImg2.alt = 'cute doll 2';
    dollEl2.appendChild(dollImg2);
    container.appendChild(dollEl2);
}

function createParticles() {
    const container = document.getElementById('particles');
    const types = ['♡', '☆', '·', '✦', '♡', '☆', '✿', '❀', '✧'];

    for (let i = 0; i < 24; i++) {
        const particle = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        particle.className = 'particle star';
        particle.textContent = type;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (10 + Math.random() * 14) + 's';
        particle.style.animationDelay = (Math.random() * 15) + 's';
        particle.style.fontSize = (10 + Math.random() * 14) + 'px';
        container.appendChild(particle);
    }
}

// ==================== FRAME THEME CARDS ====================
function renderFrameThemeCards() {
    frameThemesGrid.innerHTML = '';
    frameThemes.forEach(theme => {
        const card = document.createElement('div');
        card.className = 'frame-theme-card';
        card.dataset.themeId = theme.id;

        let badgeHTML = '';
        if (theme.badge) {
            badgeHTML = `<span class="frame-theme-badge ${theme.badge}">${theme.badge}</span>`;
        }

        card.innerHTML = `
            <div class="frame-theme-preview" style="background: ${theme.previewBg}">
                ${badgeHTML}
                <div class="frame-mini-photo" style="background: rgba(255,255,255,0.5); border: 1px solid ${theme.border}"></div>
                <div class="frame-mini-photo" style="background: rgba(255,255,255,0.5); border: 1px solid ${theme.border}"></div>
                <div class="frame-mini-photo" style="background: rgba(255,255,255,0.5); border: 1px solid ${theme.border}"></div>
                <div style="font-family: ${theme.headerFont}; color: ${theme.text}; font-size: 0.55rem; font-weight: 700; margin-top: 2px; opacity: 0.7;">${theme.headerText}</div>
            </div>
            <div class="frame-theme-info">
                <div class="frame-theme-name">${theme.name}</div>
                <div class="frame-theme-size">${theme.desc}</div>
            </div>
        `;

        card.addEventListener('click', () => selectTheme(theme.id));
        frameThemesGrid.appendChild(card);
    });
}

function selectTheme(themeId) {
    selectedTheme = frameThemes.find(t => t.id === themeId);
    document.querySelectorAll('.frame-theme-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.themeId === themeId);
    });
    continueBtn.disabled = false;
}

function renderSelectedPreview() {
    if (!selectedTheme) return;
    const t = selectedTheme;
    selectedFramePreview.innerHTML = `
        <div class="sfp-thumb" style="background: ${t.previewBg}; border: 2px solid ${t.border}">
            <div class="sfp-mini-photo" style="border: 1px solid ${t.border}"></div>
            <div class="sfp-mini-photo" style="border: 1px solid ${t.border}"></div>
            <div class="sfp-mini-photo" style="border: 1px solid ${t.border}"></div>
        </div>
        <div class="sfp-info">
            <div class="sfp-name">${t.name}</div>
            <div class="sfp-desc">${t.desc} — 6×2 Strip</div>
        </div>
    `;
}

// ==================== PROGRESS DOTS ====================
function setupProgressDots() {
    progressDotsContainer.innerHTML = '';
    for (let i = 0; i < totalShots; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.dataset.index = i;
        progressDotsContainer.appendChild(dot);
    }
}

// ==================== MODE / FILTER SELECTION ====================
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
        updateCameraFilter();
    });
});

function updateCameraFilter() {
    if (!video) return;
    const filters = {
        none: 'none',
        warm: 'saturate(1.4) sepia(0.15) brightness(1.05)',
        bw: 'grayscale(1)',
        vintage: 'sepia(0.45) contrast(0.9) brightness(1.05)',
        pink: 'hue-rotate(330deg) saturate(1.3) brightness(1.05)',
        cool: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)',
        dramatic: 'contrast(1.3) saturate(1.2) brightness(0.95)',
    };
    video.style.filter = filters[selectedFilter] || 'none';
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
    [frameSelectScreen, settingsScreen, cameraScreen, resultScreen].forEach(s => s.classList.remove('active'));
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

    tempCtx.translate(vw, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(video, 0, 0, vw, vh);
    tempCtx.setTransform(1, 0, 0, 1, 0, 0);

    if (selectedFilter !== 'none') {
        const imageData = tempCtx.getImageData(0, 0, vw, vh);
        applyFilter(imageData, selectedFilter);
        tempCtx.putImageData(imageData, 0, 0);
    }

    return tempCanvas;
}

function doFlash() {
    flashOverlay.classList.remove('flash');
    void flashOverlay.offsetWidth;
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

        statusText.textContent = 'Cheese! 📸';
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
    const theme = selectedTheme;
    const numPhotos = capturedShots.length;

    const photoW = 600;
    const photoAspect = 3 / 4;
    const photoH = Math.round(photoW * photoAspect);

    const padding = 40;
    const gap = 20;
    const cornerRadius = 12;
    const headerH = 80;
    const footerH = 95;

    const stripW = photoW + padding * 2;
    const stripH = headerH + (photoH * numPhotos) + (gap * (numPhotos - 1)) + footerH + padding * 2;

    canvas.width = stripW;
    canvas.height = stripH;

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, stripW, stripH);
    bgGrad.addColorStop(0, theme.bgGrad1);
    bgGrad.addColorStop(1, theme.bgGrad2);
    ctx.fillStyle = bgGrad;
    roundRect(ctx, 0, 0, stripW, stripH, 20, true, false);

    // --- Decorative background pattern based on theme ---
    drawBackgroundPattern(ctx, stripW, stripH, theme);

    // --- Outer border ---
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 4;
    roundRect(ctx, 6, 6, stripW - 12, stripH - 12, 16, false, true);

    // --- Inner decorative border ---
    ctx.strokeStyle = theme.borderLight;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, 16, 16, stripW - 32, stripH - 32, 12, false, true);
    ctx.setLineDash([]);

    // --- Corner decorations ---
    drawCornerDecos(ctx, stripW, stripH, theme);

    // --- Header ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `700 32px ${theme.headerFont}`;
    ctx.fillStyle = theme.decoColor;
    ctx.fillText(theme.headerText, stripW / 2, padding + headerH / 2 - 10);

    ctx.strokeStyle = theme.borderLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(stripW * 0.2, padding + headerH / 2 + 10);
    ctx.lineTo(stripW * 0.8, padding + headerH / 2 + 10);
    ctx.stroke();

    ctx.font = '400 12px "Outfit", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.6;
    ctx.fillText(theme.subText, stripW / 2, padding + headerH / 2 + 28);
    ctx.globalAlpha = 1;

    // --- Draw each photo ---
    for (let i = 0; i < numPhotos; i++) {
        const x = padding;
        const y = padding + headerH + i * (photoH + gap);

        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.fillStyle = isLightColor(theme.bgGrad1) ? '#FFFFFF' : 'rgba(255,255,255,0.15)';
        roundRect(ctx, x - 3, y - 3, photoW + 6, photoH + 6, cornerRadius + 2, true, false);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        drawCroppedPhoto(ctx, capturedShots[i], x, y, photoW, photoH, cornerRadius);

        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, photoW, photoH, cornerRadius, false, true);

        drawShotBubble(ctx, x + photoW - 22, y + 18, i + 1, theme);
    }

    // --- Draw themed decorative characters ---
    drawCuteBear(ctx, stripW - 130, -5, 120, theme);
    drawCuteBunny(ctx, 10, stripH - 125, 120, theme);

    // --- Draw extra decorations for special themes ---
    drawThemeDecorations(ctx, stripW, stripH, theme);

    // --- Footer ---
    const footerY = padding + headerH + numPhotos * photoH + (numPhotos - 1) * gap + 15;

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    ctx.font = '500 13px "Outfit", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.fillText(`${dateStr}  ·  ${timeStr}`, stripW / 2, footerY + 20);

    ctx.font = '14px serif';
    ctx.fillStyle = theme.decoColor;
    ctx.globalAlpha = 0.5;
    const decoLine = `${theme.decoEmoji}  ·  ${theme.decoEmoji}  ·  ${theme.decoEmoji}`;
    ctx.fillText(decoLine, stripW / 2, footerY + 42);
    ctx.globalAlpha = 1;

    ctx.font = '400 10px "Outfit", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.35;
    ctx.fillText(`Made with ♡ Cute Photobooth — ${theme.name}`, stripW / 2, footerY + footerH - 12);
    ctx.globalAlpha = 1;
}

// ==================== THEME-SPECIFIC DECORATIONS ====================

function drawBackgroundPattern(ctx, w, h, theme) {
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = theme.decoColor;

    if (theme.id === 'bank-perunggu') {
        // Bronze filigree pattern
        for (let y = 0; y < h; y += 60) {
            for (let x = 0; x < w; x += 60) {
                ctx.font = '16px serif';
                ctx.fillText('◆', x + 30, y + 30);
            }
        }
    } else if (theme.id === 'sakura-garden') {
        for (let y = 0; y < h; y += 80) {
            for (let x = 0; x < w; x += 80) {
                ctx.font = '14px serif';
                ctx.fillText('🌸', x + 40, y + 40);
            }
        }
    } else if (theme.id === 'midnight-dark') {
        for (let y = 0; y < h; y += 70) {
            for (let x = 0; x < w; x += 70) {
                ctx.font = '10px serif';
                ctx.fillText('✦', x + 35, y + 35);
            }
        }
    }

    ctx.restore();
}

function drawThemeDecorations(ctx, w, h, theme) {
    ctx.save();

    if (theme.id === 'bank-perunggu') {
        // Bronze ornamental corners
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = theme.decoColor;
        ctx.font = '24px serif';
        ctx.fillText('❖', 35, 35);
        ctx.fillText('❖', w - 35, 35);
        ctx.fillText('❖', 35, h - 35);
        ctx.fillText('❖', w - 35, h - 35);

        // Gold line accents
        ctx.strokeStyle = theme.accent;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(30, 50);
        ctx.lineTo(30, h - 50);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w - 30, 50);
        ctx.lineTo(w - 30, h - 50);
        ctx.stroke();
    }

    if (theme.id === 'sakura-garden') {
        ctx.globalAlpha = 0.15;
        ctx.font = '28px serif';
        const sakuraPositions = [
            [20, 60], [w - 40, 90], [15, h / 2], [w - 35, h / 2 + 40],
            [30, h - 80], [w - 50, h - 60],
        ];
        sakuraPositions.forEach(([x, y]) => ctx.fillText('🌸', x, y));
    }

    if (theme.id === 'golden-luxury') {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = theme.decoColor;
        ctx.font = '20px serif';
        const starPositions = [
            [25, 45], [w - 30, 55], [20, h - 55], [w - 25, h - 45],
        ];
        starPositions.forEach(([x, y]) => ctx.fillText('★', x, y));
    }

    ctx.restore();
}

function isLightColor(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ==================== CANVAS-DRAWN CUTE DOLLS ====================

function drawCuteBear(ctx, x, y, size, theme) {
    ctx.save();
    const s = size / 100;

    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(x+25*s,y+28*s,18*s,18*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+75*s,y+28*s,18*s,18*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F8BBD0';
    ctx.beginPath(); ctx.ellipse(x+25*s,y+28*s,10*s,10*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+75*s,y+28*s,10*s,10*s,0,0,Math.PI*2); ctx.fill();

    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

    ctx.fillStyle = '#E8C99B';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+50*s,32*s,30*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+50*s,y+82*s,26*s,22*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+80*s,16*s,14*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#E8C99B';
    ctx.beginPath(); ctx.ellipse(x+24*s,y+78*s,10*s,14*s,-0.3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+76*s,y+78*s,10*s,14*s,0.3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#D4A574';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+98*s,10*s,8*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+98*s,10*s,8*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+55*s,14*s,10*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3E2723';
    ctx.beginPath(); ctx.ellipse(x+40*s,y+46*s,3.5*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+60*s,y+46*s,3.5*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+41.5*s,y+44.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+61.5*s,y+44.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5D4037';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+52*s,4*s,3*s,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#5D4037'; ctx.lineWidth = 1.5*s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x+50*s,y+55*s); ctx.quadraticCurveTo(x+44*s,y+60*s,x+42*s,y+57*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+50*s,y+55*s); ctx.quadraticCurveTo(x+56*s,y+60*s,x+58*s,y+57*s); ctx.stroke();
    ctx.fillStyle = 'rgba(248,187,208,0.4)';
    ctx.beginPath(); ctx.ellipse(x+34*s,y+54*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+66*s,y+54*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = theme.accent || '#F8BBD0';
    ctx.beginPath(); ctx.moveTo(x+50*s,y+67*s); ctx.lineTo(x+40*s,y+62*s); ctx.lineTo(x+40*s,y+72*s); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x+50*s,y+67*s); ctx.lineTo(x+60*s,y+62*s); ctx.lineTo(x+60*s,y+72*s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = theme.decoColor || '#FBC02D';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+67*s,3*s,3*s,0,0,Math.PI*2); ctx.fill();

    ctx.restore();
}

function drawCuteBunny(ctx, x, y, size, theme) {
    ctx.save();
    const s = size / 100;

    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+18*s,10*s,28*s,-0.15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+18*s,10*s,28*s,0.15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+18*s,5*s,20*s,-0.15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+18*s,5*s,20*s,0.15,0,Math.PI*2); ctx.fill();

    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;

    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+52*s,30*s,28*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+50*s,y+82*s,24*s,22*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+50*s,y+82*s,14*s,14*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F5F5F5';
    ctx.beginPath(); ctx.ellipse(x+26*s,y+78*s,8*s,14*s,-0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+74*s,y+78*s,8*s,14*s,0.2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+38*s,y+99*s,12*s,7*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+99*s,12*s,7*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFCDD2';
    ctx.beginPath(); ctx.ellipse(x+38*s,y+99*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+62*s,y+99*s,6*s,4*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+26*s,y+90*s,8*s,7*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3E2723';
    ctx.beginPath(); ctx.ellipse(x+40*s,y+48*s,3.5*s,4.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+60*s,y+48*s,3.5*s,4.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(x+41.5*s,y+46.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+61.5*s,y+46.5*s,1.5*s,1.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#F48FB1';
    ctx.beginPath(); ctx.moveTo(x+50*s,y+53*s); ctx.lineTo(x+47*s,y+56*s); ctx.lineTo(x+53*s,y+56*s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#BDBDBD'; ctx.lineWidth = 1*s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x+35*s,y+54*s); ctx.lineTo(x+18*s,y+50*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+35*s,y+56*s); ctx.lineTo(x+18*s,y+57*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+65*s,y+54*s); ctx.lineTo(x+82*s,y+50*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+65*s,y+56*s); ctx.lineTo(x+82*s,y+57*s); ctx.stroke();
    ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 1*s;
    ctx.beginPath(); ctx.moveTo(x+50*s,y+56*s); ctx.quadraticCurveTo(x+45*s,y+61*s,x+43*s,y+59*s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x+50*s,y+56*s); ctx.quadraticCurveTo(x+55*s,y+61*s,x+57*s,y+59*s); ctx.stroke();
    ctx.fillStyle = 'rgba(244,143,177,0.35)';
    ctx.beginPath(); ctx.ellipse(x+33*s,y+55*s,6*s,3.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+67*s,y+55*s,6*s,3.5*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = theme.accent || '#F8BBD0';
    for (let p = 0; p < 5; p++) {
        const angle = (p/5)*Math.PI*2;
        ctx.beginPath();
        ctx.ellipse(x+65*s+Math.cos(angle)*5*s, y+38*s+Math.sin(angle)*5*s, 3.5*s,3.5*s,0,0,Math.PI*2);
        ctx.fill();
    }
    ctx.fillStyle = theme.decoColor || '#FBC02D';
    ctx.beginPath(); ctx.ellipse(x+65*s,y+38*s,2.5*s,2.5*s,0,0,Math.PI*2); ctx.fill();

    ctx.restore();
}

function drawCroppedPhoto(ctx, shotCanvas, x, y, targetW, targetH, radius) {
    const srcW = shotCanvas.width;
    const srcH = shotCanvas.height;
    const targetAspect = targetW / targetH;
    const srcAspect = srcW / srcH;

    let sx, sy, sw, sh;

    if (srcAspect > targetAspect) {
        sh = srcH;
        sw = srcH * targetAspect;
        sx = (srcW - sw) / 2;
        sy = 0;
    } else {
        sw = srcW;
        sh = srcW / targetAspect;
        sx = 0;
        sy = (srcH - sh) / 2;
    }

    ctx.save();
    beginRoundRect(ctx, x, y, targetW, targetH, radius);
    ctx.clip();
    ctx.drawImage(shotCanvas, sx, sy, sw, sh, x, y, targetW, targetH);
    ctx.restore();
}

function drawShotBubble(ctx, cx, cy, num, theme) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = theme.decoColor;
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

function drawCornerDecos(ctx, w, h, theme) {
    const off = 26;
    ctx.save();
    ctx.fillStyle = theme.decoColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.4;

    ctx.font = '16px serif';
    const sym = theme.decoEmoji;
    ctx.fillText(sym, off, off);
    ctx.fillText(sym, w - off, off);
    ctx.fillText(sym, off, h - off);
    ctx.fillText(sym, w - off, h - off);

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

continueBtn.addEventListener('click', () => {
    if (!selectedTheme) return;
    renderSelectedPreview();
    showScreen(settingsScreen);
});

backToFramesBtn.addEventListener('click', () => {
    showScreen(frameSelectScreen);
});

startBtn.addEventListener('click', async () => {
    const ok = await startCamera();
    if (!ok) return;
    showScreen(cameraScreen);
    startCaptureSequence();
});

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `cute-photobooth-${selectedTheme ? selectedTheme.id : 'photo'}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

restartBtn.addEventListener('click', () => {
    showScreen(settingsScreen);
});

changeFrameBtn.addEventListener('click', () => {
    showScreen(frameSelectScreen);
});

// ==================== UTILITY ====================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== BOOT ====================
document.addEventListener('DOMContentLoaded', () => {
    createFloatingDecorations();
    createParticles();
    renderFrameThemeCards();
});
