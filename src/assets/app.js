(function () {
    // Preload logo image for QR Code personalization
    const logoImage = new Image();
    logoImage.src = '/assets/vaulty.png';

    const form = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const errorMsg = document.getElementById('error-message');
    const resultSection = document.getElementById('result-section');
    const resultUrl = document.getElementById('result-url');
    const copyBtn = document.getElementById('copy-btn');
    const qrcodeContainer = document.getElementById('qrcode');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    let qrcodeInstance = null;

    // Dynamic UI validation styles using BEM classes
    urlInput.addEventListener('input', () => {
        const value = urlInput.value.trim();
        if (value === '') {
            urlInput.classList.remove('form__input--valid', 'form__input--invalid');
            return;
        }
        urlInput.classList.remove('form__input--invalid');
        urlInput.classList.add('form__input--valid');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const urlValue = urlInput.value.trim();
        if (!urlValue) {
            showError('Veuillez entrer un secret.');
            return;
        }

        // Reset status indicators
        hideError();
        resultSection.style.display = 'none';

        // Loading states
        submitBtn.disabled = true;
        btnSpinner.style.display = 'inline-block';
        btnText.textContent = 'Génération en cours...';

        try {
            const response = await fetch('/api/secret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    secret: urlValue
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue lors de la génération du lien sécurisé.');
            }

            // Display secret URL
            resultUrl.textContent = data.secretUrl;

            // Generate QR Code with high error correction level to support logo overlay
            if (!qrcodeInstance) {
                qrcodeInstance = new QRCode(qrcodeContainer, {
                    text: data.secretUrl,
                    width: 256,
                    height: 256,
                    colorDark: "#0f172a",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                qrcodeInstance.clear();
                qrcodeInstance.makeCode(data.secretUrl);
            }

            // Draw the logo and setup download link once the library completes rendering
            setTimeout(() => {
                if (logoImage.complete) {
                    personalizeQrCode();
                } else {
                    logoImage.onload = () => {
                        personalizeQrCode();
                        logoImage.onload = null;
                    };
                }
            }, 150);

            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            showError(err.message);
        } finally {
            submitBtn.disabled = false;
            btnSpinner.style.display = 'none';
            btnText.textContent = 'Généner le lien sécurisé';
        }
    });

    copyBtn.addEventListener('click', async () => {
        const targetText = resultUrl.textContent;
        if (!targetText) return;

        try {
            await navigator.clipboard.writeText(targetText);
            copyBtn.textContent = 'Copié !';
            copyBtn.classList.add('result__copy-btn--copied');

            setTimeout(() => {
                copyBtn.textContent = 'Copier';
                copyBtn.classList.remove('result__copy-btn--copied');
            }, 2000);
        } catch (err) {
            console.error('Could not copy link to clipboard:', err);
        }
    });

    function showError(message) {
        if (!errorMsg) return;
        errorMsg.textContent = message;
        errorMsg.classList.add('alert--error');
        errorMsg.style.display = 'block';
    }

    function hideError() {
        if (!errorMsg) return;
        errorMsg.style.display = 'none';
        errorMsg.classList.remove('alert--error');
        errorMsg.textContent = '';
    }

    // Helper to draw a rounded rectangle on a 2D canvas context
    function drawCustomRoundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, width, height, radius);
        } else {
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }
    }

    // Customizes the generated QR Code canvas by adding a rounded logo at the center
    function personalizeQrCode() {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        
        // Define logo card dimensions (22% of QR code width)
        const logoSize = Math.round(size * 0.22);
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;
        const borderRadius = Math.round(logoSize * 0.25); // 25% corner radius for squircle card

        ctx.save();

        // 1. Draw the rounded white card background
        drawCustomRoundRect(ctx, x, y, logoSize, logoSize, borderRadius);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 2. Draw a subtle border around the white card
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Draw the logo with a small padding and matching border-radius clip
        const padding = Math.round(logoSize * 0.08);
        const innerSize = logoSize - (padding * 2);
        const lx = x + padding;
        const ly = y + padding;
        const innerBorderRadius = Math.max(0, borderRadius - padding);

        drawCustomRoundRect(ctx, lx, ly, innerSize, innerSize, innerBorderRadius);
        ctx.clip();

        ctx.drawImage(logoImage, lx, ly, innerSize, innerSize);
        ctx.restore();

        // 4. Update the img element source and download link
        const img = qrcodeContainer.querySelector('img');
        const qrDataUrl = canvas.toDataURL('image/png');
        if (img) {
            img.src = qrDataUrl;
        }
        if (downloadQrBtn) {
            downloadQrBtn.href = qrDataUrl;
            downloadQrBtn.style.display = 'inline-flex';
        }
    }
})();
