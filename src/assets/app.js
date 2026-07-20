(function () {
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

        try {
            const parsed = new URL(value);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                urlInput.classList.remove('form__input--invalid');
                urlInput.classList.add('form__input--valid');
            } else {
                urlInput.classList.remove('form__input--valid');
                urlInput.classList.add('form__input--invalid');
            }
        } catch (_) {
            urlInput.classList.remove('form__input--valid');
            urlInput.classList.add('form__input--invalid');
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const urlValue = urlInput.value.trim();
        if (!urlValue) {
            showError('Veuillez entrer une URL.');
            return;
        }

        // Client-side quick protocol validation
        try {
            const parsed = new URL(urlValue);
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                showError('Seuls les protocoles http et https sont supportés.');
                return;
            }
        } catch (_) {
            showError('Veuillez entrer une URL absolue valide (ex : https://exemple.fr).');
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
            const response = await fetch('/api/shorty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    url: urlValue,
                    ogTitle: document.getElementById('og-title-input').value.trim() || null,
                    ogDescription: document.getElementById('og-desc-input').value.trim() || null,
                    ogImageUrl: document.getElementById('og-image-input').value.trim() || null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Une erreur est survenue lors de la génération du lien raccourci.');
            }

            // Display shortened URL
            resultUrl.textContent = data.shortUrl;

            // Generate QR Code
            if (!qrcodeInstance) {
                qrcodeInstance = new QRCode(qrcodeContainer, {
                    text: data.shortUrl,
                    width: 256,
                    height: 256,
                    colorDark: "#0f172a",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            } else {
                qrcodeInstance.clear();
                qrcodeInstance.makeCode(data.shortUrl);
            }

            // Setup QR Code download link (extract data URI from generated canvas/img)
            setTimeout(() => {
                const canvas = qrcodeContainer.querySelector('canvas');
                const img = qrcodeContainer.querySelector('img');
                let qrDataUrl = '';

                if (canvas) {
                    qrDataUrl = canvas.toDataURL('image/png');
                } else if (img && img.src) {
                    qrDataUrl = img.src;
                }

                if (qrDataUrl) {
                    downloadQrBtn.href = qrDataUrl;
                    downloadQrBtn.style.display = 'inline-flex';
                } else {
                    downloadQrBtn.style.display = 'none';
                }
            }, 100);

            resultSection.style.display = 'block';
            resultSection.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            showError(err.message);
        } finally {
            submitBtn.disabled = false;
            btnSpinner.style.display = 'none';
            btnText.textContent = 'Raccourcir l\'URL';
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
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }

    function hideError() {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
    }
})();
