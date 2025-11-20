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

// Matrix rain effect (lightweight version)
function createMatrixEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.15';

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
        ctx.fillStyle = 'rgba(5, 7, 7, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);
}

// Initialize matrix effect
createMatrixEffect();

// Glitch effect for hero title
function glitchEffect() {
    const glitchElement = document.querySelector('.glitch');
    if (!glitchElement) return;

    const text = glitchElement.textContent;

    setInterval(() => {
        if (Math.random() > 0.95) {
            glitchElement.textContent = text
                .split('')
                .map(char => Math.random() > 0.5 ? char : String.fromCharCode(33 + Math.floor(Math.random() * 94)))
                .join('');

            setTimeout(() => {
                glitchElement.textContent = text;
            }, 50);
        }
    }, 200);
}

glitchEffect();

// Add active state to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.style.color = '';
        link.style.textShadow = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = 'var(--primary)';
            link.style.textShadow = '0 0 8px var(--primary)';
        }
    });
});

// Fade in elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to content blocks
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.content-block, .arch-card, .sync-feature, .dk-card, .app-card');

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Cyber typing effect for hero subtitle (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Add hover sound effect simulation (visual feedback)
document.querySelectorAll('.ref-link, .feature-badge, .arch-card').forEach(element => {
    element.addEventListener('mouseenter', () => {
        element.style.transition = 'all 0.1s';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 800);
    }
});

// Performance: Reduce animations on low-end devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

// Add terminal-style cursor effect to code blocks
function addTerminalCursor() {
    const codeElements = document.querySelectorAll('.use-case-detail');
    codeElements.forEach(el => {
        const cursor = document.createElement('span');
        cursor.textContent = '▋';
        cursor.style.color = 'var(--primary)';
        cursor.style.animation = 'blink 1s infinite';
        el.appendChild(cursor);
    });
}

// Add blink animation
const style = document.createElement('style');
style.textContent = `
    @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
    }
`;
document.head.appendChild(style);

addTerminalCursor();

// Console easter egg
console.log('%c vProgs | Breaking the Smart Contract Trilemma ', 'background: #00ff41; color: #0a0e0f; font-size: 20px; font-weight: bold; padding: 10px;');
console.log('%c Native L1 Verifiable Programs for Kaspa BlockDAG ', 'color: #00ff41; font-size: 14px;');
console.log('%c https://kaspa.org ', 'color: #0dff8a; font-size: 12px;');
