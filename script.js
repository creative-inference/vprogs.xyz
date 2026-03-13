// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Matrix rain effect (home page only)
function createMatrixEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.08';

    document.body.insertBefore(canvas, document.body.firstChild);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < drops.length; i++) {
            for (let t = 0; t < 12; t++) {
                const y = drops[i] - t;
                if (y < 0) continue;
                const alpha = (1 - t / 12) * 0.6;
                ctx.fillStyle = 'rgba(74, 196, 110, ' + alpha + ')';
                ctx.font = fontSize + 'px monospace';
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, y * fontSize);
            }

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 60);
}

if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    createMatrixEffect();
}

// Console easter egg
console.log('%c vProgs | Breaking the Smart Contract Trilemma ', 'background: #00ff41; color: #0a0e0f; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Native L1 Verifiable Programs for Kaspa BlockDAG ', 'color: #00ff41; font-size: 14px;');
console.log('%c https://kaspa.org ', 'color: #0dff8a; font-size: 12px;');
