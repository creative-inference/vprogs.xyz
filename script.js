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
                ctx.fillStyle = 'rgba(112, 199, 186, ' + alpha + ')';
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

// Wrap tables in scrollable container for mobile
document.querySelectorAll('.markdown-content table').forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.style.overflowX = 'auto';
    wrapper.style.webkitOverflowScrolling = 'touch';
    wrapper.style.margin = '1.5rem 0';
    table.parentNode.insertBefore(wrapper, table);
    table.style.margin = '0';
    wrapper.appendChild(table);
});

// Copy buttons on code blocks
document.querySelectorAll('div.highlight').forEach(block => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    block.appendChild(btn);

    btn.addEventListener('click', () => {
        const code = block.querySelector('code') || block.querySelector('pre');
        navigator.clipboard.writeText(code.innerText).then(() => {
            btn.textContent = 'copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'copy';
                btn.classList.remove('copied');
            }, 2000);
        });
    });
});

// Console easter egg
console.log('%c vProgs | Scalable. Composable. Secure. ', 'background: #70c7ba; color: #0a0e0f; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Native L1 Verifiable Programs for Kaspa BlockDAG ', 'color: #70c7ba; font-size: 14px;');
console.log('%c https://kaspa.org ', 'color: #5aab9f; font-size: 12px;');
