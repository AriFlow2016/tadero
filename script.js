document.addEventListener('DOMContentLoaded', () => {

    // --- COOKIE CONSENT LOGIK (Förenklad) ---
    const consentBanner = document.getElementById('cookie-consent-banner');
    const acceptButton = document.getElementById('accept-cookies');

    // Visa bannern om ingen cookie är satt
    if (!document.cookie.split('; ').find(row => row.startsWith('tadero_consent='))) {
        consentBanner.classList.remove('hidden');
    }

    acceptButton.addEventListener('click', () => {
        document.cookie = "tadero_consent=true; max-age=31536000; path=/"; // Giltig i ett år
        consentBanner.style.transform = 'translateY(100%)';
        setTimeout(() => {
            consentBanner.classList.add('hidden');
        }, 500);
    });

    // --- INTERAKTIV SPOTLIGHT-MUSPEKARE ---
    const spotlight = document.querySelector('.spotlight-cursor');
    if (spotlight) {
        window.addEventListener('mousemove', (e) => {
            spotlight.style.left = `${e.clientX}px`;
            spotlight.style.top = `${e.clientY}px`;
        });
    }

    // --- HÄMTA IP-ADRESS ---
    async function getIpAddress() {
        try {
            const response = await fetch('/.netlify/functions/get-ip');
            if (!response.ok) throw new Error('Function not found');
            const data = await response.json();
            document.querySelector('#ip-display span').textContent = data.ip;
        } catch (error) {
            console.error("Kunde inte hämta IP-adress:", error);
            document.querySelector('#ip-display span').textContent = 'Kunde inte hämtas';
        }
    }
    getIpAddress();

    // --- AI-GRÄNSSNITT MED VERKLIG AI ---
    const aiOutput = document.getElementById('ai-text');
    const aiInput = document.getElementById('ai-input');
    const aiSubmit = document.getElementById('ai-submit');
    const initialQuote = '"Tadero, från det latinska Thadeus, betyder ett modigt hjärta. Vi möter framtidens tekniska utmaningar med mod och innovation."';
    let isAiReady = true;
    let typewriterTimeout;

    function displayInstantMessage(text, element) {
        clearTimeout(typewriterTimeout);
        element.innerHTML = text;
        element.parentElement.classList.remove('quote');
        isAiReady = true;
    }

    function typewriter(text, element, onComplete) {
        clearTimeout(typewriterTimeout);
        let i = 0;
        element.innerHTML = '';
        element.parentElement.classList.remove('quote');
        isAiReady = false;

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                typewriterTimeout = setTimeout(type, 20);
            } else {
                if (onComplete) onComplete();
                isAiReady = true;
            }
        }
        type();
    }

    if (aiOutput) {
        typewriter(initialQuote, aiOutput, () => {
            aiOutput.parentElement.classList.add('quote');
        });
    }

    async function handleAiQuery() {
        if (!isAiReady) return;
        const userQuery = aiInput.value.trim();
        if (userQuery === '') return;

        aiInput.value = '';
        isAiReady = false;
        typewriter("Analyserar förfrågan...", aiOutput);

        try {
            const response = await fetch('/.netlify/functions/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery: userQuery })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            typewriter(result.response, aiOutput);

        } catch (error) {
            console.error("Fel vid anrop till serverless function:", error);
            displayInstantMessage("Ett anslutningsfel uppstod. Kontrollera din anslutning och försök igen.", aiOutput);
        } finally {
            isAiReady = true;
        }
    }

    if (aiSubmit) {
        aiSubmit.addEventListener('click', handleAiQuery);
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleAiQuery();
            }
        });
    }
    
    // --- AI-KONSTGENERATOR ---
    const generateArtButton = document.getElementById('generate-art-button');
    const aiArtImage = document.getElementById('ai-art-image');
    const aiArtLoader = document.getElementById('ai-art-loader');

    async function generateAiImage() {
        aiArtLoader.classList.remove('hidden');
        aiArtImage.style.opacity = '0.2';
        generateArtButton.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/generate-image', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            
            const result = await response.json();
            aiArtImage.src = `data:image/png;base64,${result.image}`;

        } catch (error) {
            console.error("Fel vid anrop till bildgenereringsfunktion:", error);
            aiArtImage.src = "https://placehold.co/1024x1024/111111/ff0000?text=Fel+vid+generering";
        } finally {
            aiArtImage.onload = () => {
                aiArtLoader.classList.add('hidden');
                aiArtImage.style.opacity = '1';
                generateArtButton.disabled = false;
            }
        }
    }

    if (generateArtButton) {
        generateArtButton.addEventListener('click', generateAiImage);
    }

    // --- FADE-IN & SCRAMBLE ANIMATION VID SCROLL ---
    const faders = document.querySelectorAll('.fade-in');
    const scramblers = document.querySelectorAll('[data-scramble="true"]');
    
    class TextScramble {
        constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
        setText(newText) { const oldText = this.el.innerText; const length = Math.max(oldText.length, newText.length); const promise = new Promise((resolve) => this.resolve = resolve); this.queue = []; for (let i = 0; i < length; i++) { const from = oldText[i] || ''; const to = newText[i] || ''; const start = Math.floor(Math.random() * 40); const end = start + Math.floor(Math.random() * 40); this.queue.push({ from, to, start, end }); } cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update(); return promise; }
        update() { let output = ''; let complete = 0; for (let i = 0, n = this.queue.length; i < n; i++) { let { from, to, start, end, char } = this.queue[i]; if (this.frame >= end) { complete++; output += to; } else if (this.frame >= start) { if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; } output += `<span class="dud">${char}</span>`; } else { output += from; } } this.el.innerHTML = output; if (complete === this.queue.length) { this.resolve(); } else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; } }
        randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
    }

    const appearOptions = { threshold: 0.5 };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); if (entry.target.hasAttribute('data-scramble')) { const fx = new TextScramble(entry.target); fx.setText(entry.target.innerText); } observer.unobserve(entry.target); });
    }, appearOptions);

    faders.forEach(fader => appearOnScroll.observe(fader));
    scramblers.forEach(scrambler => appearOnScroll.observe(scrambler));

    // --- STATISTIK-RÄKNARE ANIMATION ---
    const statsSection = document.querySelector('.stats-container');
    const counters = document.querySelectorAll('.counter');
    const speed = 200; 

    const startCounters = () => { counters.forEach(counter => { const updateCount = () => { const target = +counter.getAttribute('data-target'); const count = +counter.innerText; const inc = target / speed; if (count < target) { counter.innerText = Math.ceil(count + inc); setTimeout(updateCount, 10); } else { counter.innerText = target; } }; updateCount(); }); };
    const statsObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { startCounters(); observer.unobserve(entry.target); } }); }, { threshold: 0.5 });
    if (statsSection) { statsObserver.observe(statsSection); }

    // --- PARTIKEL-NÄTVERK INITIALISERING ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": "#3bbef8" }, "shape": { "type": "circle" }, "opacity": { "value": 0.5, "random": false }, "size": { "value": 3, "random": true }, "line_linked": { "enable": true, "distance": 150, "color": "#3bbef8", "opacity": 0.2, "width": 1 }, "move": { "enable": true, "speed": 2, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false } },
            "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } }, "push": { "particles_nb": 4 } } },
            "retina_detect": true
        });
    }

    // --- KONAMI CODE EASTER EGG ---
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    const easterEggElement = document.getElementById('easter-egg');
    document.addEventListener('keydown', (e) => { if (e.key === konamiCode[konamiIndex]) { konamiIndex++; if (konamiIndex === konamiCode.length) { easterEggElement.classList.remove('hidden'); konamiIndex = 0; } } else { konamiIndex = 0; } if (e.key === 'Escape') { easterEggElement.classList.add('hidden'); } });

    // --- MOBILSPECIFIKA FÖRBÄTTRINGAR ---
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        if (typeof VanillaTilt !== 'undefined') {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"), { max: 15, speed: 400, glare: true, "max-glare": 0.5 });
        }
        
        const particleContainer = document.getElementById('particles-js');
        if (particleContainer && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                const particleCanvas = particleContainer.querySelector('canvas');
                if (!particleCanvas) return;

                const gamma = event.gamma;
                const beta = event.beta;
                const moveX = Math.max(-40, Math.min(40, gamma * 1.5));
                const moveY = Math.max(-40, Math.min(40, beta * 1.5));
                
                particleCanvas.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            });
        }
    }

    // --- HAPTISK FEEDBACK & KONTAKTFORMULÄR ---
    const ctaButtons = document.querySelectorAll('.cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (navigator.vibrate) { navigator.vibrate(50); }
        });
    });

    const contactForm = document.querySelector('#kontakt form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (navigator.vibrate) { navigator.vibrate(50); }

            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;

            const subject = encodeURIComponent(`Kontaktförfrågan från ${name}`);
            const body = encodeURIComponent(
                `Hej, mitt namn är ${name}.\n\n` +
                `Meddelande:\n${message}`
            );

            window.location.href = `mailto:info@tadero.se?subject=${subject}&body=${body}`;
        });
    }
});
