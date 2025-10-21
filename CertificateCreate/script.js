const canvas = document.getElementById('certificateCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const yPosRange = document.getElementById('yPosRange');
const downloadBtn = document.getElementById('downloadBtn');

const certImg = new Image();
certImg.src = 'certificate.jpg'; // Place your certificate image in the same folder

function setCanvasSize() {
    // Use original image size, no downscaling
    canvas.width = certImg.width;
    canvas.height = certImg.height;
}

certImg.onload = function() {
    setCanvasSize();
    drawCertificate();
};

function getFontSize() {
    // Use the same formula for both preview and download
    return Math.floor(canvas.height / 19); // Adjust divisor for your preferred size
}

function getNames() {
    // Split by comma, trim whitespace, filter out empty
    return nameInput.value.split(',').map(n => n.trim()).filter(n => n.length > 0);
}

function drawCertificate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(certImg, 0, 0, canvas.width, canvas.height);

    // Draw only the first name for preview
    const names = getNames();
    const name = names[0] || '';
    const fontSize = getFontSize();
    ctx.font = `bold ${fontSize}px Kanit, Arial, sans-serif`;
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Y position: map range 30-70 to percent of height
    const yPercent = yPosRange.value / 100;
    const y = canvas.height * yPercent;

    ctx.fillText(name, canvas.width / 2, y);
}

nameInput.addEventListener('input', drawCertificate);
yPosRange.addEventListener('input', drawCertificate);

// --- ZIP Download ---
downloadBtn.addEventListener('click', async function() {
    const names = getNames();
    if (names.length === 0) return;

    // Load JSZip dynamically if not present
    if (typeof JSZip === 'undefined') {
        await loadJSZip();
    }
    const zip = new JSZip();

    names.forEach((name, idx) => {
        // Create an off-screen canvas at original size
        const offCanvas = document.createElement('canvas');
        offCanvas.width = certImg.width;
        offCanvas.height = certImg.height;
        const offCtx = offCanvas.getContext('2d');

        // Draw certificate image
        offCtx.drawImage(certImg, 0, 0, offCanvas.width, offCanvas.height);

        // Draw name in Kanit font, same size as preview
        const fontSize = getFontSize();
        offCtx.font = `bold ${fontSize}px Kanit, Arial, sans-serif`;
        offCtx.fillStyle = '#111';
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';

        // Y position: map range 30-70 to percent of height
        const yPercent = yPosRange.value / 100;
        const y = offCanvas.height * yPercent;

        offCtx.fillText(name, offCanvas.width / 2, y);

        // Add to zip
        const safeName = name.replace(/[^a-zA-Z0-9ก-๙ _-]/g, '').replace(/\s+/g, '_') || `certificate_${idx+1}`;
        const dataUrl = offCanvas.toDataURL('image/jpeg', 1.0);
        zip.file(`${safeName}.jpg`, dataURLToBlob(dataUrl));
    });

    // Generate and download zip
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "certificates.zip";
        link.click();
    });
});

// Helper: Convert dataURL to Blob
function dataURLToBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

// Helper: Dynamically load JSZip from CDN if not present
function loadJSZip() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Redraw on window resize for responsiveness (keep original size)
window.addEventListener('resize', () => {
    if (certImg.complete) {
        setCanvasSize();
        drawCertificate();
    }
});