'use strict';

// Disabilitare la GUI rimuovendo la funzione che la inizializza
function startGUI() {
    console.log("GUI disabilitata"); // Debug per verificare che la funzione sia stata disattivata
}

// Rimuovere la gestione del popup promozionale
const promoPopup = document.getElementsByClassName('promo')[0];
if (promoPopup) promoPopup.style.display = 'none';

// Selezione del canvas e inizializzazione
const canvas = document.getElementsByTagName('canvas')[0];
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

if (!gl) {
    alert('WebGL non supportato nel browser.');
}

// Configurazione della simulazione
let config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 1,
    VELOCITY_DISSIPATION: 0.2,
    PRESSURE: 0.55, 
    PRESSURE_ITERATIONS: 20,
    CURL: 15, 
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: false, 
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: false,
    BLOOM: true,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
}

// Inizializza WebGL e verifica supporto
const { ext } = getWebGLContext(canvas);
if (!ext) {
    alert('Il tuo browser non supporta le estensioni necessarie per WebGL.');
}

if (isMobile()) {
    config.DYE_RESOLUTION = 512;
}
if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 512;
    config.SHADING = false;
    config.BLOOM = false;
    config.SUNRAYS = false;
}

// Inizializzazione della simulazione
updateKeywords();
initFramebuffers();
multipleSplats(parseInt(Math.random() * 20) + 5);

let lastUpdateTime = Date.now();
let colorUpdateTimer = 0.0;
update();

function update() {
    const dt = calcDeltaTime();
    if (resizeCanvas())
        initFramebuffers();
    updateColors(dt);
    applyInputs();
    if (!config.PAUSED)
        step(dt);
    render(null);
    requestAnimationFrame(update);
}

// Funzione per adattare il canvas alla dimensione della finestra
function resizeCanvas() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

// Controlla se l'utente usa un dispositivo mobile
function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Aggiorna il tempo per la simulazione
function calcDeltaTime() {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
}
