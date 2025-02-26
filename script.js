'use strict';

// 📌 Rimuovere il popup promozionale se presente
const promoPopup = document.getElementsByClassName('promo')[0];
if (promoPopup) promoPopup.style.display = 'none';

// 📌 Selezione del canvas e inizializzazione WebGL
const canvas = document.getElementsByTagName('canvas')[0];
const { gl, ext } = getWebGLContext(canvas);

if (!gl) {
    alert('WebGL non supportato nel browser.');
}

// 📌 Configurazione della simulazione (Personalizzata)
let config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
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
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    SUNRAYS: true,
    SUNRAYS_WEIGHT: 1.0,
}

// 📌 Aggiunta della funzione "updateKeywords" per evitare errori
function updateKeywords() {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    if (config.BLOOM) displayKeywords.push("BLOOM");
    if (config.SUNRAYS) displayKeywords.push("SUNRAYS");
}

// 📌 Inizializzazione della simulazione
updateKeywords();
initFramebuffers();
multipleSplats(parseInt(Math.random() * 20) + 5);

let lastUpdateTime = Date.now();
update();

// 📌 Funzione per aggiornare la simulazione a ogni frame
function update() {
    const dt = calcDeltaTime();
    if (resizeCanvas()) initFramebuffers();
    updateColors(dt);
    applyInputs();
    if (!config.PAUSED) step(dt);
    render(null);
    requestAnimationFrame(update);
}

// 📌 Adattare il canvas alla dimensione della finestra
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

// 📌 Aggiorna il tempo per la simulazione
function calcDeltaTime() {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
}

// 📌 Funzione per inizializzare WebGL
function getWebGLContext(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

    let gl = canvas.getContext('webgl2', params);
    if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat;
    let supportLinearFiltering;
    if (gl) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    return { gl, ext: { supportLinearFiltering } };
}
