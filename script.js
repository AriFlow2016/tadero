document.addEventListener('DOMContentLoaded', () => {

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
            if (!response.ok) throw new Error('IP function not found');
            const data = await response.json();
            const ipSpan = document.querySelector('#ip-display span');
            if (ipSpan) ipSpan.textContent = data.ip;
        } catch (error) {
            console.error("Kunde inte hämta IP-adress:", error);
            const ipSpan = document.querySelector('#ip-display span');
            if (ipSpan) ipSpan.textContent = 'Ansluten';
        }
    }
    getIpAddress();

    // --- AI-GRÄNSSNITT ---
    const aiOutput = document.getElementById('ai-text');
    const aiInput = document.getElementById('ai-input');
    const aiSubmit = document.getElementById('ai-submit');
    const initialQuote = '"Tadero betyder ett modigt hjärta. Vi hjälper er att navigera i framtidens tekniska landskap med precision och innovation."';
    let isAiReady = true;
    let typewriterTimeout;

    function typewriter(text, element, onComplete) {
        clearTimeout(typewriterTimeout);
        let i = 0;
        element.innerHTML = '';
        isAiReady = false;

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                typewriterTimeout = setTimeout(type, 25);
            } else {
                if (onComplete) onComplete();
                isAiReady = true;
            }
        }
        type();
    }

    if (aiOutput) {
        typewriter(initialQuote, aiOutput);
    }

    async function handleAiQuery() {
        if (!isAiReady || !aiInput.value.trim()) return;
        const userQuery = aiInput.value.trim();
        aiInput.value = '';
        isAiReady = false;
        
        typewriter("Analyserar...", aiOutput);

        try {
            const response = await fetch('/.netlify/functions/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery: userQuery })
            });
            const result = await response.json();
            typewriter(result.response, aiOutput);
        } catch (error) {
            typewriter("Ett anslutningsfel uppstod. Försök igen snart.", aiOutput);
        } finally {
            isAiReady = true;
        }
    }

    if (aiSubmit) {
        aiSubmit.addEventListener('click', handleAiQuery);
        aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAiQuery(); });
    }

    // --- TEXT SCRAMBLE & FADE IN ---
    const scramblers = document.querySelectorAll('[data-scramble="true"]');
    const faders = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Enkel scramble-effekt vid behov
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    faders.forEach(f => observer.observe(f));

    // --- STATISTIK-RÄKNARE ---
    const counters = document.querySelectorAll('.counter');
    const startCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText;
                const speed = target / 100;
                if (count < target) {
                    counter.innerText = Math.ceil(count + speed);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    const statsSection = document.querySelector('#om');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters();
                statsObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // --- KONTAKTFORMULÄR (Förenklat) ---
    const contactForm = document.getElementById('simplified-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('contact-email').value;
            window.location.href = `mailto:info@tadero.se?subject=Kontaktförfrågan&body=Hej, jag vill bli kontaktad på: ${email}`;
        });
    }
});