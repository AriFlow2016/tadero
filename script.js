document.addEventListener('DOMContentLoaded', () => {

    // --- SPOTLIGHT-PEKARE ---
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
            // Vi anropar vår egen funktion för att hämta IP
            const response = await fetch('/.netlify/functions/get-ip');
            const data = await response.json();
            const ipSpan = document.querySelector('#ip-display span');
            if (ipSpan) ipSpan.textContent = data.ip;
        } catch (error) {
            console.error("IP-fel:", error);
            const ipSpan = document.querySelector('#ip-display span');
            if (ipSpan) ipSpan.textContent = 'Skyddad anslutning';
        }
    }
    getIpAddress();

    // --- AI-CHATT ---
    const aiOutput = document.getElementById('ai-text');
    const aiInput = document.getElementById('ai-input');
    const aiSubmit = document.getElementById('ai-submit');
    const initialText = "Välkommen till Tadero. Jag är din AI-guide för framtidens teknik. Vad kan jag hjälpa dig med idag?";
    let isAiReady = true;

    function typewriter(text, element) {
        let i = 0;
        element.innerHTML = '';
        isAiReady = false;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, 20);
            } else {
                isAiReady = true;
            }
        }
        type();
    }

    if (aiOutput) typewriter(initialText, aiOutput);

    async function handleAiQuery() {
        if (!isAiReady || !aiInput.value.trim()) return;
        const query = aiInput.value.trim();
        aiInput.value = '';
        aiOutput.innerHTML = 'Analyserar...';
        
        try {
            const response = await fetch('/.netlify/functions/ask-ai', {
                method: 'POST',
                body: JSON.stringify({ userQuery: query })
            });
            const data = await response.json();
            typewriter(data.response, aiOutput);
        } catch (error) {
            typewriter("Systemet är tillfälligt under belastning. Försök igen om en kort stund.", aiOutput);
        }
    }

    if (aiSubmit) {
        aiSubmit.addEventListener('click', handleAiQuery);
        aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAiQuery(); });
    }

    // --- ANIMATIONER VID SCROLL ---
    const faders = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    faders.forEach(f => observer.observe(f));

    // --- RÄKNARE ---
    const counters = document.querySelectorAll('.counter');
    const statsSection = document.querySelector('#om');
    const startCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            let count = 0;
            const inc = target / 50;
            const update = () => {
                if (count < target) {
                    count += inc;
                    counter.innerText = Math.ceil(count);
                    setTimeout(update, 30);
                } else {
                    counter.innerText = target;
                }
            };
            update();
        });
    };

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startCounters();
                statsObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }
});