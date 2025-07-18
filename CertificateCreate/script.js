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

function drawCertificate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(certImg, 0, 0, canvas.width, canvas.height);

    // Draw name in Kanit font
    const name = nameInput.value || '';
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

downloadBtn.addEventListener('click', function() {
    // Create an off-screen canvas at original size
    const offCanvas = document.createElement('canvas');
    offCanvas.width = certImg.width;
    offCanvas.height = certImg.height;
    const offCtx = offCanvas.getContext('2d');

    // Draw certificate image
    offCtx.drawImage(certImg, 0, 0, offCanvas.width, offCanvas.height);

    // Draw name in Kanit font, same size as preview
    const name = nameInput.value || '';
    const fontSize = getFontSize();
    offCtx.font = `bold ${fontSize}px Kanit, Arial, sans-serif`;
    offCtx.fillStyle = '#111';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';

    // Y position: map range 30-70 to percent of height
    const yPercent = yPosRange.value / 100;
    const y = offCanvas.height * yPercent;

    offCtx.fillText(name, offCanvas.width / 2, y);

    // Download
    const link = document.createElement('a');
    link.download = 'certificate.jpg';
    link.href = offCanvas.toDataURL('image/jpeg', 1.0);
    link.click();
});

// Redraw on window resize for responsiveness (keep original size)
window.addEventListener('resize', () => {
    if (certImg.complete) {
        setCanvasSize();
        drawCertificate();
    }
});